-- Categoria livre (ex.: Decoração, Organização, Personalizados); alimenta a vitrine da home.
alter table public.products add column category text not null default '';
