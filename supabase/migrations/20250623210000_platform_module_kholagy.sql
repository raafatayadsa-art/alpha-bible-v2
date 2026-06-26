-- Add Khoulagy as an independent platform module (lock/unlock from Module Control).

insert into public.platform_modules (key, label, label_ar, enabled) values
  ('kholagy', 'Khoulagy', 'الخولاجي المقدس', true)
on conflict (key) do update set
  label = excluded.label,
  label_ar = excluded.label_ar;
