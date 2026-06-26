-- Platform modules: Audio, Kids, Meditations screens (lock/unlock from Module Control).

insert into public.platform_modules (key, label, label_ar, enabled) values
  ('audio', 'Audio', 'الصوتيات', true),
  ('kids', 'Kids', 'الأطفال', true),
  ('meditations', 'Meditations', 'التأملات', true)
on conflict (key) do update set
  label = excluded.label,
  label_ar = excluded.label_ar;
