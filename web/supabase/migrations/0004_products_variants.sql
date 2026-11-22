-- Variações da Nuvemshop ({id, label}) para o botão Comprar montar o link do carrinho:
-- https://<loja>/cart-link/<id da variação>-<quantidade>
alter table public.products add column variants jsonb not null default '[]';
