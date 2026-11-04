-- Run once in the Supabase SQL editor as the project owner.
begin;
create table public.admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security;
create function public.is_admin() returns boolean language sql stable security invoker set search_path = public as $$ select exists(select 1 from public.admins where user_id=auth.uid()); $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
create policy admin_self_read on public.admins for select to authenticated using(user_id=auth.uid());
create table public.site_content(id text primary key check(id in ('draft','published')),config jsonb not null,updated_at timestamptz not null default now());
alter table public.site_content enable row level security;
create policy published_read on public.site_content for select to anon,authenticated using(id='published');
create policy admin_content on public.site_content for all to authenticated using(public.is_admin()) with check(public.is_admin());
create table public.journeys(user_id uuid primary key references auth.users(id) on delete cascade,progress jsonb not null default '{"completed":[],"results":{},"updatedAt":""}'::jsonb,updated_at timestamptz not null default now(),check(jsonb_typeof(progress->'completed')='array'),check(jsonb_typeof(progress->'results')='object'),check(octet_length(progress::text)<262144));
alter table public.journeys enable row level security;
create policy guest_read on public.journeys for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy guest_insert on public.journeys for insert to authenticated with check(user_id=auth.uid());
create policy guest_update on public.journeys for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy admin_delete on public.journeys for delete to authenticated using(public.is_admin());
create policy admin_update on public.journeys for update to authenticated using(public.is_admin()) with check(public.is_admin());
create function public.publish_content(payload jsonb) returns void language plpgsql security invoker set search_path=public as $$
declare q jsonb; expr text; token text; result bigint:=0; expected bigint; total int:=0;
begin
 if not public.is_admin() then raise exception 'Administrator required'; end if;
 if jsonb_typeof(payload->'math') <> 'array' or jsonb_array_length(payload->'math')=0 then raise exception 'Math questions required'; end if;
 for q in select * from jsonb_array_elements(payload->'math') loop
  expr:=regexp_replace(replace(q->>'expression','{prev}',result::text),'\s','','g');
  if expr is null or expr !~ '^[+-]?[0-9]+([+-][0-9]+)*$' then raise exception 'Invalid math expression'; end if;
  result:=0;
  for token in select (regexp_matches(expr,'[+-]?[0-9]+','g'))[1] loop result:=result+token::bigint; end loop;
  expected:=(q->>'answer')::bigint;
  if expected is null or result<>expected then raise exception 'Wrong answer for %: expected %',expr,result; end if;
  total:=total+1;
 end loop;
 if result<>19 then raise exception 'Final result must equal 19'; end if;
 if jsonb_array_length(payload->'colors')<3 then raise exception 'At least 3 colors required'; end if;
 if exists(select 1 from jsonb_array_elements(payload#>'{birthday,segments}') seg where coalesce(seg->>'url','')='') then raise exception 'Every birthday segment needs an uploaded MP3'; end if;
 if exists(select 1 from jsonb_array_elements(payload->'memories') m where coalesce(m->>'url','')='') or exists(select 1 from jsonb_array_elements(payload->'chats') m where coalesce(m->>'url','')='') then raise exception 'Remove empty photos or upload images'; end if;
 insert into public.site_content(id,config,updated_at) values('draft',payload,now()) on conflict(id) do update set config=excluded.config,updated_at=now();
 insert into public.site_content(id,config,updated_at) values('published',payload,now()) on conflict(id) do update set config=excluded.config,updated_at=now();
end; $$;
revoke all on function public.publish_content(jsonb) from public;
grant execute on function public.publish_content(jsonb) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('media','media',true,31457280,array['image/jpeg','image/png','image/webp','audio/mpeg','audio/mp3']),
 ('guest-media','guest-media',true,31457280,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy media_admin_insert on storage.objects for insert to authenticated with check(bucket_id='media' and public.is_admin() and (storage.foldername(name))[1]=auth.uid()::text);
create policy media_admin_delete on storage.objects for delete to authenticated using(bucket_id='media' and public.is_admin());
create policy guest_media_insert on storage.objects for insert to authenticated with check(bucket_id='guest-media' and (storage.foldername(name))[1]=auth.uid()::text);
create policy media_read on storage.objects for select to authenticated using(bucket_id='media' and public.is_admin() or bucket_id='guest-media' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
create policy guest_media_delete on storage.objects for delete to authenticated using(bucket_id='guest-media' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
grant select on public.site_content to anon;
grant select,insert,update,delete on public.site_content,public.journeys to authenticated;
grant select on public.admins to authenticated;
commit;
