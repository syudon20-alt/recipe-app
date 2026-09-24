create table if not exists shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount text,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table shopping_list_items enable row level security;

drop policy if exists "anyone can read shopping_list_items" on shopping_list_items;
create policy "anyone can read shopping_list_items"
  on shopping_list_items for select
  using (true);

drop policy if exists "anyone can insert shopping_list_items" on shopping_list_items;
create policy "anyone can insert shopping_list_items"
  on shopping_list_items for insert
  with check (true);

drop policy if exists "anyone can update shopping_list_items" on shopping_list_items;
create policy "anyone can update shopping_list_items"
  on shopping_list_items for update
  using (true);

drop policy if exists "anyone can delete shopping_list_items" on shopping_list_items;
create policy "anyone can delete shopping_list_items"
  on shopping_list_items for delete
  using (true);
