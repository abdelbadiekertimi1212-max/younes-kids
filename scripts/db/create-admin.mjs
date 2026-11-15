// Create (or update) a staff account: auth user + public.admins row.
//
// Usage:
//   node --env-file=.env.local scripts/db/create-admin.mjs --username <name> --password <pw>
//        [--email <email>] [--role owner] [--name "Display name"] [--must-change]
//
// Staff sign in with the username (or the email). Without --email, an internal
// address <username>@admin.younes-kids.invalid is used; it never receives mail.
// --must-change shows a "change your initial password" warning in the admin
// until the password is changed from Admin → My account.
import { createClient } from "@supabase/supabase-js";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const username = arg("username")?.trim().toLowerCase();
const password = arg("password");
const email = (arg("email") ?? (username ? `${username}@admin.younes-kids.invalid` : "")).toLowerCase();
const roleKey = arg("role") ?? "owner";
const fullName = arg("name") ?? "Younes Kids";
const mustChange = process.argv.includes("--must-change");

if (!url || !key) {
  console.error("✗ Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  process.exit(1);
}
if (!username || !password) {
  console.error("Usage: node --env-file=.env.local scripts/db/create-admin.mjs --username <name> --password <pw> [--email <email>] [--role owner] [--must-change]");
  process.exit(1);
}
if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
  console.error("✗ Username must be 3–32 characters: a-z, 0-9, dot, dash or underscore.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

// Reuse the account that already has this username, else the one with this email.
let userId;
const { data: byUsername } = await supabase.from("admins").select("id").eq("username", username).maybeSingle();
if (byUsername) userId = byUsername.id;

if (!userId) {
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (created?.user) {
    userId = created.user.id;
  } else {
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    userId = list?.users?.find((u) => u.email?.toLowerCase() === email)?.id;
    if (!userId) {
      console.error("✗ Could not create or find the user:", createErr?.message);
      process.exit(1);
    }
  }
}

const { error: pwErr } = await supabase.auth.admin.updateUserById(userId, { password });
if (pwErr) {
  console.error("✗ Could not set the password:", pwErr.message);
  process.exit(1);
}

const { error: adminErr } = await supabase.from("admins").upsert({
  id: userId,
  role: "admin",
  role_key: roleKey,
  email,
  username,
  full_name: fullName,
  is_active: true,
  must_change_password: mustChange,
});
if (adminErr) {
  console.error("✗ admins upsert failed:", adminErr.message);
  process.exit(1);
}

console.log(`✓ Staff account ready: username "${username}" (role ${roleKey})`);
