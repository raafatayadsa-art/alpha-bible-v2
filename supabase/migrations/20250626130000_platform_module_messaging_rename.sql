-- Rename messaging module display label to Alpha Connect.

update public.platform_modules
set
  label = 'Alpha Connect',
  label_ar = 'الفا كونكت',
  updated_at = now()
where key = 'messaging';
