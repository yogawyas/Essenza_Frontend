-- Run as postgres in a development project after applying the migration.
begin;

do $$
declare
  account_a uuid := gen_random_uuid();
  account_b uuid := gen_random_uuid();
begin
  insert into auth.users (id, email, aud, role) values
    (account_a, account_a || '@example.invalid', 'authenticated', 'authenticated'),
    (account_b, account_b || '@example.invalid', 'authenticated', 'authenticated');
  perform set_config('essenza.test_user_a', account_a::text, true);
  perform set_config('essenza.test_user_b', account_b::text, true);
  perform set_config('essenza.test_state', '{
    "schemaVersion": 2,
    "onboarded": true,
    "profile": {"id": "local-profile", "name": "Account A", "bio": "", "likes": [], "avoids": []},
    "privacy": {"shelf": false, "saved": false},
    "shelf": [], "favorites": [], "lists": [], "savedListIds": [],
    "likedListIds": [], "feedback": [], "following": [], "blocked": [],
    "reports": [], "logs": [], "recipes": [], "studioDraft": null
  }', true);
end;
$$;

set local role authenticated;

do $$
declare
  account_a uuid := current_setting('essenza.test_user_a')::uuid;
  account_b uuid := current_setting('essenza.test_user_b')::uuid;
  snapshot jsonb := current_setting('essenza.test_state')::jsonb;
  changed_snapshot jsonb := jsonb_set(snapshot, '{profile,name}', '"Updated A"'::jsonb);
begin
  perform set_config('request.jwt.claim.sub', account_a::text, true);

  if public.save_essenza_account_state(snapshot, 0, account_a) is distinct from 1 then
    raise exception 'The first save must create revision 1';
  end if;
  begin
    perform public.save_essenza_account_state(changed_snapshot, 0, account_a);
    raise exception 'A second create must report a conflict';
  exception when serialization_failure then null;
  end;
  if public.save_essenza_account_state(changed_snapshot, 1, account_a) is distinct from 2 then
    raise exception 'An update must increment the revision';
  end if;
  begin
    perform public.save_essenza_account_state(snapshot, 1, account_a);
    raise exception 'A stale revision must report a conflict';
  exception when serialization_failure then null;
  end;
  if not exists (
    select 1 from public.essenza_account_state
    where user_id = account_a and revision = 2 and state = changed_snapshot
  ) then
    raise exception 'Conflicts must preserve the accepted revision';
  end if;

  begin
    perform public.save_essenza_account_state(snapshot - 'profile', 2, account_a);
    raise exception 'Missing required fields must be rejected';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.save_essenza_account_state(snapshot, -1, account_a);
    raise exception 'Negative revisions must be rejected';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.save_essenza_account_state(
      jsonb_set(snapshot, '{profile,bio}', to_jsonb(repeat('x', 1048576))),
      2,
      account_a
    );
    raise exception 'Oversized snapshots must be rejected';
  exception when invalid_parameter_value then null;
  end;

  begin
    insert into public.essenza_account_state (user_id, state, revision)
    values (account_b, snapshot, 1);
    raise exception 'Authenticated users must use the save RPC for inserts';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.essenza_account_state set state = snapshot where user_id = account_a;
    raise exception 'Direct updates must be denied, even for an owned row';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.essenza_account_state where user_id = account_a;
    raise exception 'Direct deletions must be denied, even for an owned row';
  exception when insufficient_privilege then null;
  end;

  perform set_config('request.jwt.claim.sub', account_b::text, true);
  if exists (select 1 from public.essenza_account_state) then
    raise exception 'Account B could read an existing snapshot belonging to account A';
  end if;
  begin
    perform public.save_essenza_account_state(changed_snapshot, 0, account_a);
    raise exception 'A save targeting the previous account must be rejected after switching users';
  exception when insufficient_privilege then null;
  end;
  if public.save_essenza_account_state(snapshot, 0, account_b) is distinct from 1 then
    raise exception 'Account B must be able to create its own snapshot';
  end if;
  if not exists (
    select 1 from public.essenza_account_state where user_id = account_b and revision = 1
  ) then
    raise exception 'Account B could not read its own row';
  end if;
  perform set_config('request.jwt.claim.sub', account_a::text, true);
  if (select count(*) from public.essenza_account_state) <> 1 or not exists (
    select 1 from public.essenza_account_state
    where user_id = account_a and revision = 2 and state = changed_snapshot
  ) then
    raise exception 'Account A must see only its own accepted snapshot';
  end if;
end;
$$;

set local role anon;

do $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '{}', true);
  begin
    perform 1 from public.essenza_account_state;
    raise exception 'Unauthenticated reads must be denied';
  exception when insufficient_privilege then null;
  end;
  if has_function_privilege(
    current_user,
    'public.save_essenza_account_state(jsonb,integer,uuid)',
    'EXECUTE'
  ) then
    raise exception 'Unauthenticated callers must not have permission to execute the RPC';
  end if;
end;
$$;

reset role;

do $$
declare
  account_a uuid := current_setting('essenza.test_user_a')::uuid;
  account_b uuid := current_setting('essenza.test_user_b')::uuid;
begin
  delete from auth.users where id = account_a;
  if exists (select 1 from public.essenza_account_state where user_id = account_a) then
    raise exception 'Deleting an Auth account must delete its snapshot';
  end if;
  if not exists (select 1 from public.essenza_account_state where user_id = account_b) then
    raise exception 'Deleting account A must preserve account B snapshot';
  end if;
end;
$$;

rollback;
