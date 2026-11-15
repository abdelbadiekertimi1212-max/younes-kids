-- ============================================================
-- Younes Kids — 0007: kids catalog fields and staff usernames
--   • products.gender (girls / boys / unisex) for shop filters
--   • admins.username: staff sign in with a username (or email)
--   • admins.must_change_password: warns until the initial password is changed
-- Re-runnable.
-- ============================================================

-- ---------------- Products: gender ----------------
alter table public.products add column if not exists gender text;
alter table public.products drop constraint if exists products_gender_check;
alter table public.products add constraint products_gender_check
  check (gender is null or gender in ('girls', 'boys', 'unisex'));
create index if not exists idx_products_gender on public.products(gender);

-- ---------------- Staff: username + initial-password flag ----------------
alter table public.admins add column if not exists username text;
alter table public.admins add column if not exists must_change_password boolean not null default false;
alter table public.admins drop constraint if exists admins_username_format;
alter table public.admins add constraint admins_username_format
  check (username is null or username ~ '^[a-z0-9._-]{3,32}$');
create unique index if not exists admins_username_key on public.admins(username);
