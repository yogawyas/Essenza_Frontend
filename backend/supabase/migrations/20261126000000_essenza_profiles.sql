-- Authentication credentials remain managed by Supabase Auth.
create table public.essenza_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text
);

alter table public.essenza_profiles enable row level security;
revoke all on table public.essenza_profiles from public, anon, authenticated;
grant select on table public.essenza_profiles to authenticated;

create policy "Account owners can read their profile"
  on public.essenza_profiles for select to authenticated
  using (user_id = (select auth.uid()));

create function public.sync_essenza_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.essenza_profiles (user_id, username)
  values (
    new.id,
    left(coalesce(
      nullif(btrim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'name'), ''),
      nullif(split_part(new.email, '@', 1), '')
    ), 40)
  )
  on conflict (user_id) do update set username = excluded.username;
  return new;
end;
$$;

revoke all on function public.sync_essenza_profile() from public, anon, authenticated;

create trigger sync_essenza_profile
  after insert or update of raw_user_meta_data, email on auth.users
  for each row execute function public.sync_essenza_profile();

insert into public.essenza_profiles (user_id, username)
select id, left(coalesce(
  nullif(btrim(raw_user_meta_data->>'display_name'), ''),
  nullif(btrim(raw_user_meta_data->>'full_name'), ''),
  nullif(btrim(raw_user_meta_data->>'name'), ''),
  nullif(split_part(email, '@', 1), '')
), 40)
from auth.users
on conflict (user_id) do nothing;
