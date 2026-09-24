create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  servings text,
  cooking_time_minutes integer,
  ingredients jsonb not null default '[]', -- [{"name": "卵", "amount": "2個"}]
  steps jsonb not null default '[]',        -- ["卵を溶く", "フライパンで焼く"]
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists recipes_updated_at on recipes;
create trigger recipes_updated_at
  before update on recipes
  for each row execute function set_updated_at();

alter table recipes enable row level security;

drop policy if exists "anyone can read recipes" on recipes;
create policy "anyone can read recipes"
  on recipes for select
  using (true);

drop policy if exists "anyone can insert recipes" on recipes;
create policy "anyone can insert recipes"
  on recipes for insert
  with check (true);

drop policy if exists "anyone can update recipes" on recipes;
create policy "anyone can update recipes"
  on recipes for update
  using (true);

drop policy if exists "anyone can delete recipes" on recipes;
create policy "anyone can delete recipes"
  on recipes for delete
  using (true);
