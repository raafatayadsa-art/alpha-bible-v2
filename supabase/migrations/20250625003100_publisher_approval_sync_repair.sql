-- Repair publisher rows where platform_approvals were marked approved but sync never ran.

do $$
declare
  r record;
  v_result json;
begin
  for r in
    select a.id, a.kind, a.status
    from public.platform_approvals a
    where a.kind in ('publisher_setup', 'publisher_publication')
      and a.status = 'approved'
  loop
    v_result := public.apply_publisher_approval_sync(r.id, 'approved');
    raise notice 'repair % % => %', r.kind, r.id, v_result;
  end loop;
end;
$$;
