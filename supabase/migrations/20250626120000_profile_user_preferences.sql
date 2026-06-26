-- ALPHA-PROFILE-004: social profile display & privacy fields on public.profiles

alter table public.profiles
  add column if not exists bio text not null default '',
  add column if not exists birth_date text,
  add column if not exists show_avatar boolean not null default true,
  add column if not exists show_bio boolean not null default true,
  add column if not exists show_achievements boolean not null default true,
  add column if not exists show_spiritual_stats boolean not null default true,
  add column if not exists show_church boolean not null default true,
  add column if not exists show_birth_date boolean not null default false,
  add column if not exists profile_visibility text not null default 'church'
    check (profile_visibility in ('everyone', 'church', 'friends'));

comment on column public.profiles.bio is 'ALPHA-PROFILE-004 user bio for social profile';
comment on column public.profiles.profile_visibility is 'ALPHA-PROFILE-004 who can view the social profile';
