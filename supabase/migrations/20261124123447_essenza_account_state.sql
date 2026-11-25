create table public.essenza_account_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  revision integer not null check (revision > 0),
  updated_at timestamptz not null default statement_timestamp()
);

alter table public.essenza_account_state enable row level security;

revoke all on table public.essenza_account_state from public, anon, authenticated;
grant select on table public.essenza_account_state to authenticated;

create policy "Account owners can read their snapshot"
  on public.essenza_account_state
  for select to authenticated
  using (user_id = (select auth.uid()));

create function public.save_essenza_account_state(
  p_state jsonb,
  p_expected_revision integer,
  p_expected_user_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := auth.uid();
  new_revision integer;
begin
  -- Keep an in-flight save from being applied after the client switches accounts.
  if account_id is null or p_expected_user_id is distinct from account_id then
    raise exception 'Account session does not match the save request' using errcode = '42501';
  end if;

  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'Invalid snapshot revision' using errcode = '22023';
  end if;

  if octet_length(p_state::text) > 1048576 then
    raise exception 'Account snapshot exceeds 1 MiB' using errcode = '22023';
  end if;

  if jsonb_typeof(p_state) is distinct from 'object'
    or p_state->'schemaVersion' is distinct from '2'::jsonb
    or jsonb_typeof(p_state->'onboarded') is distinct from 'boolean'
    or jsonb_typeof(p_state->'profile') is distinct from 'object'
    or p_state->'profile'->'id' is distinct from '"local-profile"'::jsonb
    or jsonb_typeof(p_state->'profile'->'name') is distinct from 'string'
    or jsonb_typeof(p_state->'profile'->'bio') is distinct from 'string'
    or jsonb_typeof(p_state->'profile'->'likes') is distinct from 'array'
    or jsonb_typeof(p_state->'profile'->'avoids') is distinct from 'array'
    or jsonb_typeof(p_state->'privacy') is distinct from 'object'
    or jsonb_typeof(p_state->'privacy'->'shelf') is distinct from 'boolean'
    or jsonb_typeof(p_state->'privacy'->'saved') is distinct from 'boolean'
    or not p_state ? 'studioDraft'
    or jsonb_typeof(p_state->'studioDraft') not in ('object', 'null')
    or exists (
      select 1
      from unnest(array[
        'shelf', 'favorites', 'lists', 'savedListIds', 'likedListIds',
        'feedback', 'following', 'blocked', 'reports', 'logs', 'recipes'
      ]) as list_field(key)
      where jsonb_typeof(p_state->list_field.key) is distinct from 'array'
    ) then
    raise exception 'Invalid account snapshot' using errcode = '22023';
  end if;

  if p_expected_revision = 0 then
    insert into public.essenza_account_state (user_id, state, revision)
    values (account_id, p_state, 1)
    on conflict (user_id) do nothing
    returning revision into new_revision;
  else
    -- The revision predicate and the write run in a single statement.
    update public.essenza_account_state
    set state = p_state, revision = revision + 1, updated_at = statement_timestamp()
    where user_id = account_id and revision = p_expected_revision
    returning revision into new_revision;
  end if;

  if new_revision is null then
    raise exception 'Account snapshot has changed' using errcode = '40001';
  end if;
  return new_revision;
end;
$$;

revoke all on function public.save_essenza_account_state(jsonb, integer, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.save_essenza_account_state(jsonb, integer, uuid)
  to authenticated;
