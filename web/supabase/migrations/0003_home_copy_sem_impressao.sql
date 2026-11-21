-- Comunicação pública focada nas peças: troca os textos padrão da home que falavam do processo de impressão.
-- Só altera a linha se ela ainda tiver o texto padrão antigo (não sobrescreve o que foi editado no painel).
alter table public.site_settings alter column hero_title set default 'Produtos 3D para decorar e presentear';
alter table public.site_settings alter column hero_subtitle set default '';

update public.site_settings set hero_title = 'Produtos 3D para decorar e presentear'
  where hero_title = 'Peças impressas camada por camada.';
update public.site_settings set hero_subtitle = ''
  where hero_subtitle = 'Design próprio, impressão própria, acabamento à mão.';
