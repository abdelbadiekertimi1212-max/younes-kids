"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { getStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { changePasswordSchema, changeUsernameSchema } from "@/lib/validation";
import { isLocale } from "@/i18n/config";

export type AccountError = "invalid" | "wrongPassword" | "taken" | "rate" | "mismatch" | "same" | "failed";
export type AccountResult = { ok: true } | { ok: false; error: AccountError };

/** Checks a staff member's current password without touching their own session. */
async function verifyPassword(userId: string, password: string): Promise<boolean> {
  const { data } = await createAdminClient().auth.admin.getUserById(userId);
  const email = data.user?.email;
  if (!email) return false;
  const probe = createSupabaseClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: signed, error } = await probe.auth.signInWithPassword({ email, password });
  if (error || !signed.session) return false;
  await probe.auth.signOut({ scope: "local" }); // revoke only the probe session
  return true;
}

function refresh(lang: string) {
  revalidatePath(`/${isLocale(lang) ? lang : "ar"}/admin`, "layout");
}

/** Change your own username. Requires the current password. */
export async function changeUsername(input: unknown, lang: string): Promise<AccountResult> {
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "failed" };
  const parsed = changeUsernameSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  if (!(await rateLimit(`account:${staff.id}`, 10, 900))) return { ok: false, error: "rate" };
  if (!(await verifyPassword(staff.id, parsed.data.currentPassword))) {
    await audit(staff, "account.username", "admin", staff.id, {}, "failure");
    return { ok: false, error: "wrongPassword" };
  }

  const { error } = await createAdminClient()
    .from("admins")
    .update({ username: parsed.data.username })
    .eq("id", staff.id);
  if (error) return { ok: false, error: error.code === "23505" ? "taken" : "failed" };

  await audit(staff, "account.username", "admin", staff.id, { username: parsed.data.username });
  refresh(lang);
  return { ok: true };
}

/** Change your own password. Requires the current password; at least 8 characters. */
export async function changePassword(input: unknown, lang: string): Promise<AccountResult> {
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "failed" };
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message;
    return { ok: false, error: msg === "mismatch" ? "mismatch" : msg === "same" ? "same" : "invalid" };
  }
  if (!(await rateLimit(`account:${staff.id}`, 10, 900))) return { ok: false, error: "rate" };
  if (!(await verifyPassword(staff.id, parsed.data.currentPassword))) {
    await audit(staff, "account.password", "admin", staff.id, {}, "failure");
    return { ok: false, error: "wrongPassword" };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(staff.id, { password: parsed.data.newPassword });
  if (error) return { ok: false, error: "failed" };
  await admin.from("admins").update({ must_change_password: false }).eq("id", staff.id);

  await audit(staff, "account.password", "admin", staff.id);
  refresh(lang);
  return { ok: true };
}
