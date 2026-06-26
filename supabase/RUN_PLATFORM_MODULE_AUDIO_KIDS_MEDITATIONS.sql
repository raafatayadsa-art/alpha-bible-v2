-- Run in Supabase SQL Editor to register Audio / Kids / Meditations module toggles.

insert into public.platform_modules (key, label, label_ar, enabled) values
  ('audio', 'Audio', 'الصوتيات', true),
  ('kids', 'Kids', 'الأطفال', true),
  ('meditations', 'Meditations', 'التأملات', true)
on conflict (key) do update set
  label = excluded.label,
  label_ar = excluded.label_ar;

select key, label_ar, enabled from public.platform_modules
where key in ('audio', 'kids', 'meditations')
order by key;
