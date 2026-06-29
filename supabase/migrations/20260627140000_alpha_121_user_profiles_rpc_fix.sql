-- ALPHA-121 / ALPHA-122: Replace legacy profiles join with user_profiles
-- Fixes list_publisher_team_members after profiles table removal

create or replace function public.list_publisher_team_members(p_publisher_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  if not public.publisher_team_has_perm(p_publisher_id, 'manage_team', v_user) then
    raise exception 'forbidden';
  end if;

  return coalesce((
    select json_agg(row_to_json(t) order by t."createdAt")
    from (
      select
        m.id,
        m.user_id as "userId",
        coalesce(p.display_name, 'عضو ألفا') as "displayName",
        p.username as "username",
        m.can_edit_profile as "canEditProfile",
        m.can_manage_content as "canManageContent",
        m.can_submit_publication as "canSubmitPublication",
        m.can_manage_team as "canManageTeam",
        m.created_at as "createdAt"
      from public.publisher_team_members m
      left join public.user_profiles p on p.user_id = m.user_id
      where m.publisher_id = p_publisher_id
    ) t
  ), '[]'::json);
end;
$$;

comment on function public.list_publisher_team_members(uuid) is
  'DOMAIN-07 Publisher: list team members with display_name/username from user_profiles (ALPHA-121)';

-- Domain metadata comments (Domain 01 identity tables)
comment on table public.user_profiles is 'DOMAIN-01 Identity: social profile (@username, display_name, avatar, bio) — ALPHA-122';
comment on table public.user_identity_profiles is 'DOMAIN-01 Identity: verification/KYC/trust layer (separate from user_profiles)';
comment on table public.alpha_identities is 'DOMAIN-01 Identity: permanent Alpha ID per user (ALPHA-076)';
comment on table public.identity_documents is 'DOMAIN-01 Identity: KYC document references';
comment on table public.identity_access_logs is 'DOMAIN-01 Identity: identity access audit trail';
