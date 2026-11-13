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
