-- Community Phase 6: friend-scoped RLS + unfriend RPC

-- Scoped read: self, friends (alpha_connect_contacts), or same active church
drop policy if exists "community_moments_select_authenticated" on public.community_moments;
drop policy if exists "community_moments_select_scoped" on public.community_moments;

create policy "community_moments_select_scoped"
  on public.community_moments
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.alpha_connect_contacts c
      where c.user_id = auth.uid()
        and c.contact_user_id = community_moments.user_id
    )
    or (
      church_id is not null
      and exists (
        select 1
        from public.church_memberships cm
        where cm.user_id = auth.uid()
          and cm.status = 'active'
          and cm.church_id = community_moments.church_id
      )
    )
  );

drop policy if exists "community_moment_comments_select" on public.community_moment_comments;
drop policy if exists "community_moment_comments_select_scoped" on public.community_moment_comments;

create policy "community_moment_comments_select_scoped"
  on public.community_moment_comments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.community_moments m
      where m.id = community_moment_comments.moment_id
        and (
          m.user_id = auth.uid()
          or exists (
            select 1
            from public.alpha_connect_contacts c
            where c.user_id = auth.uid()
              and c.contact_user_id = m.user_id
          )
          or (
            m.church_id is not null
            and exists (
              select 1
              from public.church_memberships cm
              where cm.user_id = auth.uid()
                and cm.status = 'active'
                and cm.church_id = m.church_id
            )
          )
        )
    )
  );

drop policy if exists "community_moment_reactions_select" on public.community_moment_reactions;
drop policy if exists "community_moment_reactions_select_scoped" on public.community_moment_reactions;

create policy "community_moment_reactions_select_scoped"
  on public.community_moment_reactions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.community_moments m
      where m.id = community_moment_reactions.moment_id
        and (
          m.user_id = auth.uid()
          or exists (
            select 1
            from public.alpha_connect_contacts c
            where c.user_id = auth.uid()
              and c.contact_user_id = m.user_id
          )
          or (
            m.church_id is not null
            and exists (
              select 1
              from public.church_memberships cm
              where cm.user_id = auth.uid()
                and cm.status = 'active'
                and cm.church_id = m.church_id
            )
          )
        )
    )
  );

-- Remove bilateral contact (community unfriend)
create or replace function public.alpha_remove_community_contact(p_contact_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_contact_user_id is null or p_contact_user_id = v_uid then
    return false;
  end if;

  delete from public.alpha_connect_contacts
  where (user_id = v_uid and contact_user_id = p_contact_user_id)
     or (user_id = p_contact_user_id and contact_user_id = v_uid);

  return true;
end;
$$;

grant execute on function public.alpha_remove_community_contact(uuid) to authenticated;

comment on function public.alpha_remove_community_contact(uuid) is
  'Community: remove bilateral alpha_connect_contacts for current user';
