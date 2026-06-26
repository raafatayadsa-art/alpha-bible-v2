-- Publisher hero carousel configuration (ordered content IDs, unlimited cards)

alter table public.publishers
  add column if not exists hero_content_ids uuid[] not null default '{}'::uuid[];

comment on column public.publishers.hero_content_ids is
  'Ordered publisher_content_items IDs shown in the public page hero carousel.';

create or replace function public.update_publisher_hero_cards(
  p_publisher_id uuid,
  p_content_ids uuid[] default '{}'::uuid[]
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_pub record;
  v_ids uuid[] := coalesce(p_content_ids, '{}'::uuid[]);
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if not public.publisher_team_has_perm(p_publisher_id, 'manage_content', v_user) then
    raise exception 'forbidden';
  end if;

  select * into v_pub from public.publishers where id = p_publisher_id;
  if not found then raise exception 'not_found'; end if;
  if v_pub.status = 'suspended' then raise exception 'suspended'; end if;

  if exists (
    select 1
    from unnest(v_ids) as cid(id)
    where not exists (
      select 1
      from public.publisher_content_items pci
      where pci.id = cid.id
        and pci.publisher_id = p_publisher_id
    )
  ) then
    raise exception 'invalid_content';
  end if;

  update public.publishers
  set hero_content_ids = v_ids, updated_at = now()
  where id = p_publisher_id;

  return json_build_object('ok', true);
end;
$$;

grant execute on function public.update_publisher_hero_cards(uuid, uuid[]) to authenticated;
