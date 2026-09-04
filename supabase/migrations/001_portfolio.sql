-- Replace YOUR_ADMIN_EMAIL@example.com once, then run this file in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table public.portfolio_profile (
 id uuid primary key default gen_random_uuid(), full_name text not null default '', professional_title text not null default '', short_intro text not null default '',
 about_heading text not null default '', about_description text not null default '', location text not null default '', email text not null default '', phone text,
 github_url text, linkedin_url text, resume_url text, resume_filename text, resume_uploaded_at timestamptz, profile_photo_url text, profile_photo_alt text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.portfolio_experience (
 id uuid primary key default gen_random_uuid(), job_title text not null, company text not null, location text, start_date date not null, end_date date,
 is_current boolean not null default false, description text not null default '', display_order integer not null default 0, is_visible boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check (is_current or end_date is not null)
);
create table public.portfolio_services (
 id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', icon text, display_order integer not null default 0,
 is_visible boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.portfolio_projects (
 id uuid primary key default gen_random_uuid(), title text not null, category text not null default '', short_description text not null default '', full_description text not null default '',
 technologies text[] not null default '{}', project_url text, github_url text, featured boolean not null default false, is_visible boolean not null default true,
 display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.portfolio_project_images (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.portfolio_projects(id) on delete cascade,
 image_url text not null, alt_text text not null check (length(trim(alt_text)) > 0), display_order integer not null default 0, created_at timestamptz not null default now()
);
create index portfolio_experience_order_idx on public.portfolio_experience(display_order);
create index portfolio_services_order_idx on public.portfolio_services(display_order);
create index portfolio_projects_order_idx on public.portfolio_projects(featured desc, display_order);
create index portfolio_project_images_project_idx on public.portfolio_project_images(project_id, display_order);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at=now(); return new; end $$;
create trigger profile_updated before update on public.portfolio_profile for each row execute function public.set_updated_at();
create trigger experience_updated before update on public.portfolio_experience for each row execute function public.set_updated_at();
create trigger services_updated before update on public.portfolio_services for each row execute function public.set_updated_at();
create trigger projects_updated before update on public.portfolio_projects for each row execute function public.set_updated_at();

create or replace function public.is_portfolio_admin() returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select auth.jwt()->>'email' = 'YOUR_ADMIN_EMAIL@example.com'), false)
$$;
revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

alter table public.portfolio_profile enable row level security;
alter table public.portfolio_experience enable row level security;
alter table public.portfolio_services enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_project_images enable row level security;

create policy "public reads profile" on public.portfolio_profile for select using (true);
create policy "public reads visible experience" on public.portfolio_experience for select using (is_visible or public.is_portfolio_admin());
create policy "public reads visible services" on public.portfolio_services for select using (is_visible or public.is_portfolio_admin());
create policy "public reads visible projects" on public.portfolio_projects for select using (is_visible or public.is_portfolio_admin());
create policy "public reads images of visible projects" on public.portfolio_project_images for select using (exists(select 1 from public.portfolio_projects p where p.id=project_id and (p.is_visible or public.is_portfolio_admin())));
create policy "admin manages profile" on public.portfolio_profile for all using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "admin manages experience" on public.portfolio_experience for all using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "admin manages services" on public.portfolio_services for all using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "admin manages projects" on public.portfolio_projects for all using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "admin manages project images" on public.portfolio_project_images for all using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('portfolio-profile','portfolio-profile',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('portfolio-projects','portfolio-projects',true,8388608,array['image/jpeg','image/png','image/webp']),
 ('portfolio-resume','portfolio-resume',true,10485760,array['application/pdf'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "public reads portfolio media" on storage.objects for select using (bucket_id in ('portfolio-profile','portfolio-projects','portfolio-resume'));
create policy "admin uploads portfolio media" on storage.objects for insert to authenticated with check (bucket_id in ('portfolio-profile','portfolio-projects','portfolio-resume') and public.is_portfolio_admin());
create policy "admin updates portfolio media" on storage.objects for update to authenticated using (bucket_id in ('portfolio-profile','portfolio-projects','portfolio-resume') and public.is_portfolio_admin()) with check (bucket_id in ('portfolio-profile','portfolio-projects','portfolio-resume') and public.is_portfolio_admin());
create policy "admin deletes portfolio media" on storage.objects for delete to authenticated using (bucket_id in ('portfolio-profile','portfolio-projects','portfolio-resume') and public.is_portfolio_admin());

-- Seed preserves the portfolio's existing public content. Edit it later through /admin/settings.
insert into public.portfolio_profile(full_name,professional_title,short_intro,about_heading,about_description,location,email,profile_photo_alt)
values('Mikhael Rodas','Telecom operations × software','I’m Mikhael, a telecom operations professional and automation builder in the Philippines. I create practical tools that make teams faster, work clearer, and services more reliable.','Operator’s mindset. Builder’s curiosity.',E'My background is in live telecom operations, where reliability, clear communication, and calm troubleshooting matter every day.\n\nI bring that same discipline to software. I focus on tools people can actually use—not technology for its own sake. My work connects operations knowledge with automation, web development, mobile apps, APIs, and AI.','Philippines','', 'Portrait of Mikhael Rodas');
insert into public.portfolio_services(title,description,icon,display_order) values
('Telecom Operations','SIP troubleshooting, SBC/MSS monitoring, incident coordination, call tracing','signal',1),('Workflow Automation','Python, Google Apps Script, n8n, APIs, webhooks, scheduled jobs','automation',2),('Application Development','Next.js, Flutter, Supabase, PostgreSQL, GitHub, Vercel','code',3),('AI Integration','Knowledge-grounded assistants, prompt design, business process automation','spark',4);
insert into public.portfolio_projects(title,category,short_description,full_description,technologies,featured,display_order) values
('CHGLog Mobile App','Mobile · Operations','A Flutter-based workflow for validating change numbers, checking in onsite implementers, tracking activities, and notifying teams.','A Flutter-based workflow for validating change numbers, checking in onsite implementers, tracking activities, and notifying teams.',array['Flutter','Supabase','Google APIs'],true,1),
('Network Alarm Automation','Automation · Telecom','Automated network-device polling, alarm detection, reporting, and ServiceNow ticket creation to reduce repetitive NOC work.','Automated network-device polling, alarm detection, reporting, and ServiceNow ticket creation to reduce repetitive NOC work.',array['Python','ServiceNow API','Networking'],false,2),
('AI Customer Assistant','AI · Business','A knowledge-grounded customer assistant for Facebook Messenger that answers common questions and routes conversations through n8n.','A knowledge-grounded customer assistant for Facebook Messenger that answers common questions and routes conversations through n8n.',array['n8n','Meta API','AI / RAG'],false,3),
('Retail POS & Inventory','Web App · Retail','A multi-branch point-of-sale and inventory platform with role-based access, stock controls, and spreadsheet imports.','A multi-branch point-of-sale and inventory platform with role-based access, stock controls, and spreadsheet imports.',array['Next.js','Supabase','Vercel'],false,4),
('SIPp Route Test Platform','Telecom · Testing','A configurable SIP traffic testing concept for validating international voice routes, signaling behavior, and call outcomes.','A configurable SIP traffic testing concept for validating international voice routes, signaling behavior, and call outcomes.',array['SIPp','SIP','Wireshark'],false,5);
