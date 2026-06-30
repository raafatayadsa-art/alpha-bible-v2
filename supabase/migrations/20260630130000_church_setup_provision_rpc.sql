-- Church setup provision RPC — creates church + roles + membership (production schema)

alter table public.churches add column if not exists setup_request_id uuid;

create unique index if not exists churches_setup_request_id_idx
  on public.churches (setup_request_id)
  where setup_request_id is not null;

create or replace function public.provision_church_from_setup_request(p_setup_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_setup public.church_setup_requests%rowtype;
  v_payload jsonb;
  v_church_id bigint;
  v_priest_role_id bigint;
  v_member_user uuid;
  v_servants jsonb;
  v_i int;
  v_s jsonb;
  v_phone text;
  v_whatsapp text;
  v_servant_name text;
  v_existing_membership bigint;
begin
  select * into v_setup
  from public.church_setup_requests
  where id = p_setup_id;

  if not found then
    raise exception 'not_found:setup_request';
  end if;

  v_payload := coalesce(v_setup.payload, '{}'::jsonb);
  v_member_user := coalesce(v_setup.submitted_by, auth.uid());
  v_servants := coalesce(v_payload->'servants', '[]'::jsonb);

  select id into v_church_id
  from public.churches
  where setup_request_id = p_setup_id
  limit 1;

  if v_church_id is null then
    select id into v_church_id
    from public.churches
    where description ilike ('%' || p_setup_id::text || '%')
      and is_active is not false
    limit 1;
  end if;

  if v_church_id is null then
    v_phone := coalesce(
      nullif(btrim(v_setup.priest_phone), ''),
      nullif(btrim(v_payload->>'churchPhone'), '')
    );
    v_whatsapp := coalesce(nullif(btrim(v_payload->>'whatsapp'), ''), v_phone);

    insert into public.churches (
      church_name, parish, governorate, city, formatted_address,
      latitude, longitude, phone, whatsapp, email, priests,
      facebook_url, youtube_url, website_url,
      members_count, servants_count,
      is_active, status, setup_request_id,
      claimed_by, country, location_verified, description
    )
    values (
      v_setup.church_name,
      v_setup.diocese,
      v_setup.governorate,
      v_setup.city,
      v_setup.address,
      v_setup.location_lat,
      v_setup.location_lng,
      v_phone,
      v_whatsapp,
      v_setup.priest_email,
      v_setup.priest_name,
      nullif(btrim(v_payload->>'facebook'), ''),
      nullif(btrim(v_payload->>'youtube'), ''),
      nullif(btrim(v_payload->>'website'), ''),
      case when v_member_user is not null then 1 else 0 end,
      coalesce(jsonb_array_length(v_servants), 0),
      true,
      'approved',
      p_setup_id,
      v_member_user,
      'مصر',
      (v_setup.location_lat is not null and v_setup.location_lng is not null),
      jsonb_build_object(
        'alphaSetupRequestId', p_setup_id::text,
        'alphaSource', 'church_setup'
      )::text
    )
    returning id into v_church_id;
  end if;

  if v_setup.priest_name is not null and btrim(v_setup.priest_name) <> '' then
    select id into v_priest_role_id
    from public.church_roles
    where church_id = v_church_id
      and role_key = 'priest'
      and is_primary_priest = true
    limit 1;

    if v_priest_role_id is null then
      insert into public.church_roles (
        church_id, user_id, role_key, role_name, title, phone, whatsapp,
        initials, messaging_allowed, is_primary_priest, visible_to_members,
        sort_order, is_system, permissions
      )
      values (
        v_church_id,
        v_member_user,
        'priest',
        v_setup.priest_name,
        'الكاهن المسؤول',
        coalesce(v_setup.priest_phone, ''),
        coalesce(regexp_replace(coalesce(v_setup.priest_phone, ''), '\D', '', 'g'), ''),
        left(v_setup.priest_name, 1),
        true,
        true,
        true,
        0,
        false,
        '{}'::jsonb
      )
      returning id into v_priest_role_id;
    end if;
  end if;

  if v_member_user is not null then
    select id into v_existing_membership
    from public.church_memberships
    where church_id = v_church_id
      and user_id = v_member_user
    limit 1;

    if v_existing_membership is null then
      insert into public.church_memberships (
        church_id, user_id, status, membership_status, role_label,
        platform_role, is_priest, role, role_id
      )
      values (
        v_church_id,
        v_member_user,
        'active',
        'approved',
        'كاهن',
        'priest',
        true,
        'priest',
        v_priest_role_id
      );
    end if;
  end if;

  for v_i in 0 .. greatest(coalesce(jsonb_array_length(v_servants), 0) - 1, -1) loop
    v_s := v_servants->v_i;
    v_servant_name := nullif(btrim(v_s->>'name'), '');
    if v_servant_name is null then
      continue;
    end if;

    if not exists (
      select 1
      from public.church_roles cr
      where cr.church_id = v_church_id
        and cr.role_key = 'servant'
        and cr.role_name = v_servant_name
    ) then
      insert into public.church_roles (
        church_id, role_key, role_name, title, phone, whatsapp,
        initials, messaging_allowed, visible_to_members, sort_order, is_system, permissions
      )
      values (
        v_church_id,
        'servant',
        v_servant_name,
        coalesce(nullif(btrim(v_s->>'role'), ''), 'خادم'),
        coalesce(nullif(btrim(v_s->>'phone'), ''), ''),
        coalesce(regexp_replace(coalesce(v_s->>'phone', ''), '\D', '', 'g'), ''),
        left(v_servant_name, 1),
        false,
        true,
        10 + v_i,
        false,
        '{}'::jsonb
      );
    end if;
  end loop;

  return jsonb_build_object(
    'ok', true,
    'churchId', v_church_id,
    'setupRequestId', p_setup_id
  );
end;
$$;

grant execute on function public.provision_church_from_setup_request(uuid) to authenticated;
