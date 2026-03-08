create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table users
  add column if not exists password_hash text;

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  situation text not null,
  emotion text not null,
  description text not null,
  generated_message text not null,
  tone text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_user_created_at
  on messages(user_id, created_at desc);
