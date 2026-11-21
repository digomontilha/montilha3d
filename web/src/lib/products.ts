import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import { hasSupabase, supabaseKey, supabaseUrl } from "./supabase/env";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price_cents: number | null;
  images: string[];
  buy_url: string | null;
  featured: boolean;
  position: number;
  active: boolean;
};

export type Settings = { hero_title: string; hero_subtitle: string; hero_image: string | null };

export const defaultSettings: Settings = {
  hero_title: "Produtos 3D para decorar e presentear",
  hero_subtitle: "",
  hero_image: null,
};

// Leitura pública (anon, sem cookies). connection() força renderização no request, nunca no build.
async function db() {
  await connection();
  if (!hasSupabase) return null;
  return createClient(supabaseUrl!, supabaseKey!, { auth: { persistSession: false } });
}

async function list(featuredOnly: boolean): Promise<Product[]> {
  const sb = await db();
  if (!sb) return [];
  let q = sb.from("products").select("*").eq("active", true);
  if (featuredOnly) q = q.eq("featured", true);
  const { data } = await q.order("position").order("name");
  return (data as Product[] | null) ?? [];
}

export const getProducts = () => list(false);
export const getFeatured = () => list(true);

export async function getProduct(slug: string): Promise<Product | null> {
  const sb = await db();
  if (!sb) return null;
  const { data } = await sb.from("products").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  return (data as Product | null) ?? null;
}

export async function getSettings(): Promise<Settings> {
  const sb = await db();
  if (!sb) return defaultSettings;
  const { data } = await sb.from("site_settings").select("hero_title,hero_subtitle,hero_image").maybeSingle();
  return (data as Settings | null) ?? defaultSettings;
}

export const formatPrice = (cents: number | null) =>
  cents == null ? null : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
