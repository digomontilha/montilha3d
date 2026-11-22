// Busca os produtos da loja Nuvemshop e converte para colunas da tabela products.
// Só toca nos campos que vêm da loja; destaque, posição e categoria continuam no /admin.

type NsProduct = {
  id: number;
  name: Record<string, string>;
  description: Record<string, string>;
  handle: Record<string, string>;
  published: boolean;
  canonical_url: string;
  images: { src: string; position: number }[];
  variants: { price: string | null; promotional_price: string | null }[];
};

const pt = (v: Record<string, string> | undefined) => v?.pt ?? Object.values(v ?? {})[0] ?? "";

export function toRow(p: NsProduct) {
  const v = p.variants[0];
  const price = v?.promotional_price || v?.price;
  return {
    nuvemshop_id: p.id,
    slug: pt(p.handle),
    name: pt(p.name),
    description: pt(p.description).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(),
    price_cents: price ? Math.round(Number(price) * 100) : null,
    images: [...p.images].sort((a, b) => a.position - b.position).map((i) => i.src),
    buy_url: p.canonical_url,
    active: p.published,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchNuvemshopProducts() {
  const store = process.env.NUVEMSHOP_STORE_ID;
  const token = process.env.NUVEMSHOP_TOKEN;
  if (!store || !token) throw new Error("Configure NUVEMSHOP_STORE_ID e NUVEMSHOP_TOKEN na Vercel.");
  // shortcut: só a 1ª página (até 200 produtos); paginar quando a loja passar disso.
  const res = await fetch(`https://api.tiendanube.com/v1/${store}/products?per_page=200`, {
    headers: { Authentication: `bearer ${token}`, "User-Agent": "Montilha3D (montilha3d.com.br)" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Nuvemshop respondeu ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return ((await res.json()) as NsProduct[]).map(toRow);
}
