"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientFingerprint, rateLimit } from "@/lib/rate-limit";
import { loginSchema, normalizeUsername } from "@/lib/validation";

export type SignInResult = { ok: true } | { ok: false; error: "invalid" | "notAdmin" | "rate" };

/**
 * Staff sign-in with a username or an email. Usernames are resolved to the
 * account's email on the server; every failure returns the same "invalid"
 * error so the form never reveals which usernames exist.
 */
export async function signIn(identifier: string, password: string): Promise<SignInResult> {
  const parsed = loginSchema.safeParse({ identifier, password });
  if (!parsed.success) return { ok: false, error: "invalid" };
  const id = parsed.data.identifier;
  const key = id.includes("@") ? id.toLowerCase() : normalizeUsername(id);

  // Limited per device and per account, so a weak password can't be brute-forced.
  if (!(await rateLimit(`login:${await clientFingerprint()}`, 10, 900))) return { ok: false, error: "rate" };
  if (!(await rateLimit(`login-account:${key}`, 20, 900))) return { ok: false, error: "rate" };

  let email = key;
  if (!key.includes("@")) {
    const admin = createAdminClient();
    const { data: row } = await admin.from("admins").select("id").eq("username", key).eq("is_active", true).maybeSingle();
    const userId = (row as { id: string } | null)?.id;
    if (!userId) return { ok: false, error: "invalid" };
    const { data: user } = await admin.auth.admin.getUserById(userId);
    if (!user.user?.email) return { ok: false, error: "invalid" };
    email = user.user.email;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error || !data.user) return { ok: false, error: "invalid" };

  const { data: adminRow } = await supabase
    .from("admins")
    .select("id")
    .eq("id", data.user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (!adminRow) {
    await supabase.auth.signOut();
    return { ok: false, error: "notAdmin" };
  }
  return { ok: true };
}

export async function signOut(lang: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${lang}/admin/login`);
}
