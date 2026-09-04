-- Run after 001_portfolio.sql. Uses the existing public.is_portfolio_admin() authorization function.
alter table public.portfolio_projects add column if not exists cover_image_id uuid references public.portfolio_project_images(id) on delete set null;

create table if not exists public.portfolio_certifications (
 id uuid primary key default gen_random_uuid(), title text not null check(length(trim(title))>0), issuer text not null check(length(trim(issuer))>0),
 issue_date date not null, expiration_date date, credential_id text, credential_url text, certificate_file_url text, description text,
 skills text[] not null default '{}', display_order integer not null default 0, is_visible boolean not null default true,
 is_featured boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(expiration_date is null or expiration_date >= issue_date)
);
create index if not exists portfolio_certifications_order_idx on public.portfolio_certifications(is_featured desc,display_order);
drop trigger if exists certifications_updated on public.portfolio_certifications;
create trigger certifications_updated before update on public.portfolio_certifications for each row execute function public.set_updated_at();
alter table public.portfolio_certifications enable row level security;
create policy "public reads visible certifications" on public.portfolio_certifications for select using(is_visible or public.is_portfolio_admin());
create policy "admin manages certifications" on public.portfolio_certifications for all using(public.is_portfolio_admin()) with check(public.is_portfolio_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('portfolio-certificates','portfolio-certificates',true,10485760,array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "public reads certificates" on storage.objects for select using(bucket_id='portfolio-certificates');
create policy "admin uploads certificates" on storage.objects for insert to authenticated with check(bucket_id='portfolio-certificates' and public.is_portfolio_admin());
create policy "admin updates certificates" on storage.objects for update to authenticated using(bucket_id='portfolio-certificates' and public.is_portfolio_admin()) with check(bucket_id='portfolio-certificates' and public.is_portfolio_admin());
create policy "admin deletes certificates" on storage.objects for delete to authenticated using(bucket_id='portfolio-certificates' and public.is_portfolio_admin());
