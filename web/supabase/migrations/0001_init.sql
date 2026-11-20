-- Montilha 3D: catálogo + vitrine da home.
-- Produtos são editados no /admin agora; quando a Nuvemshop estiver ativa,
-- a sincronização preenche nuvemshop_id e buy_url nesta mesma tabela.

create table public.admins (
  user_id uuid primary key references auth.users on delete cascade
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price_cents integer check (price_cents >= 0),
  images text[] not null default '{}',
  buy_url text,                       -- link da página do produto na Nuvemshop
  nuvemshop_id bigint unique,         -- preenchido pela sincronização futura
  featured boolean not null default false,
  position integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id boolean primary key default true check (id), -- linha única
  hero_title text not null default 'Peças impressas camada por camada.',
  hero_subtitle text not null default 'Design próprio, impressão própria, acabamento à mão.',
  hero_image text
);
insert into public.site_settings default values;

alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.site_settings enable row level security;

-- Acesso pela API; o que cada um pode fazer é decidido pelas políticas RLS abaixo.
grant select on public.products, public.site_settings to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant update on public.site_settings to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

create policy "admins read self" on public.admins for select using (user_id = auth.uid());

create policy "public reads active products" on public.products for select using (active or public.is_admin());
create policy "admin writes products" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "public reads settings" on public.site_settings for select using (true);
create policy "admin writes settings" on public.site_settings for update using (public.is_admin()) with check (public.is_admin());

-- Fotos dos produtos
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
create policy "admin uploads images" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "admin deletes images" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());

-- Para virar admin depois de criar o usuário em Authentication:
-- insert into public.admins (user_id) select id from auth.users where email = 'SEU_EMAIL';
