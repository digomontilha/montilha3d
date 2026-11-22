// Integração com a Nuvemshop: lê os produtos da loja e espelha na tabela products.
// Só toca nos campos que vêm da loja; destaque, posição e categoria continuam no /admin.
import { createHmac, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

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

const EVENTS = ["product/created", "product/updated", "product/deleted"];
export const WEBHOOK_PATH = "/api/nuvemshop/webhook";

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

async function api(path: string, init?: RequestInit) {
  const store = process.env.NUVEMSHOP_STORE_ID;
  const token = process.env.NUVEMSHOP_TOKEN;
  if (!store || !token) throw new Error("Configure NUVEMSHOP_STORE_ID e NUVEMSHOP_TOKEN na Vercel.");
  const res = await fetch(`https://api.tiendanube.com/v1/${store}${path}`, {
    ...init,
    headers: {
      Authentication: `bearer ${token}`,
      "User-Agent": "Montilha3D (montilha3d.com.br)",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Nuvemshop respondeu ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// Sincroniza tudo: grava/atualiza pelo slug (handle) e desativa o que saiu da loja.
export async function syncProducts(sb: SupabaseClient) {
  // shortcut: só a 1ª página (até 200 produtos); paginar quando a loja passar disso.
  const rows = ((await api("/products?per_page=200")) as NsProduct[]).map(toRow);
  const { error } = await sb.from("products").upsert(rows, { onConflict: "slug" });
  if (error) throw new Error("Erro ao gravar: " + error.message);

  let gone = sb.from("products").update({ active: false }).not("nuvemshop_id", "is", null);
  if (rows.length) gone = gone.not("nuvemshop_id", "in", `(${rows.map((r) => r.nuvemshop_id).join(",")})`);
  const { error: goneError } = await gone;
  if (goneError) throw new Error("Erro ao desativar removidos: " + goneError.message);
  return rows.length;
}

// Cadastra na loja os webhooks que ainda faltam, apontando para este site.
export async function registerWebhooks(origin: string) {
  const url = origin + WEBHOOK_PATH;
  const existing = (await api("/webhooks")) as { event: string; url: string }[];
  for (const event of EVENTS) {
    if (!existing.some((w) => w.event === event && w.url === url)) {
      await api("/webhooks", { method: "POST", body: JSON.stringify({ event, url }) });
    }
  }
}

// A Nuvemshop assina o corpo com o client_secret do app (HMAC-SHA256 em hex).
export function validSignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(body).digest("hex"));
  const got = Buffer.from(signature);
  return got.length === expected.length && timingSafeEqual(got, expected);
}
