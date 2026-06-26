-- Run in Supabase SQL Editor to register Khoulagy module toggle.
insert into public.platform_modules (key, label, label_ar, enabled) values
  ('kholagy', 'Khoulagy', 'الخولاجي المقدس', true)
on conflict (key) do update set
  label = excluded.label,
  label_ar = excluded.label_ar;

select key, label_ar, enabled from public.platform_modules where key = 'kholagy';
