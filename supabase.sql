create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0,
  description text,
  category text,
  image_url text,
  sold_out boolean not null default false,
  created_at timestamptz not null default now()
);
alter table products enable row level security;
create policy "Anyone can view" on products for select using (true);
create policy "Anyone can add" on products for insert to public with check (true);
create policy "Anyone can edit" on products for update to public using (true);
create policy "Anyone can delete" on products for delete to public using (true);

insert into storage.buckets (id, name, public) values ('products','products',true) on conflict do nothing;
create policy "Anyone can view photos" on storage.objects for select using (bucket_id='products');
create policy "Anyone can upload photos" on storage.objects for insert to public with check (bucket_id='products');
create policy "Anyone can delete photos" on storage.objects for delete to public using (bucket_id='products');

-- Admin email: ronaldrosuelo27@gmail.com
create or replace function public.is_admin() returns boolean language sql stable as $$
  select (auth.jwt() ->> 'email') = 'ronaldrosuelo27@gmail.com'
$$;

drop table if exists conversations cascade;
create table conversations (
  id uuid primary key default gen_random_uuid(),
  name text,
  last_text text,
  last_at timestamptz not null default now(),
  unread boolean not null default false
);

drop table if exists messages cascade;
create table messages (
  id uuid primary key default gen_random_uuid(),
  convo_id uuid not null references conversations(id) on delete cascade,
  sender text not null check (sender in ('buyer','admin')),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists messages_convo_idx on messages(convo_id, created_at);

alter table conversations enable row level security;
alter table messages enable row level security;

create policy "convo select" on conversations for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "convo insert" on conversations for insert to authenticated with check (id = auth.uid());
create policy "convo update" on conversations for update to authenticated using (id = auth.uid() or public.is_admin());
create policy "convo delete" on conversations for delete to authenticated using (public.is_admin());
create policy "msg select" on messages for select to authenticated using (convo_id = auth.uid() or public.is_admin());
create policy "msg insert" on messages for insert to authenticated
  with check ((sender = 'buyer' and convo_id = auth.uid()) or (sender = 'admin' and public.is_admin()));
create policy "msg delete" on messages for delete to authenticated using (public.is_admin());

alter publication supabase_realtime add table public.conversations, public.messages;
