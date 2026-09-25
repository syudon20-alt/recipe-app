alter table recipes add column if not exists delegate_steps text;
alter table recipes add column if not exists rating integer check (rating between 1 and 5);
