import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";

const BASE = "https://montilha3d.com.br";

// Lista as páginas públicas para o Google e o Bing (produtos ativos entram e saem sozinhos).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/loja`, changeFrequency: "weekly", priority: 0.9 },
    ...products.map((p) => ({ url: `${BASE}/produto/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8, images: p.images.slice(0, 1) })),
  ];
}
