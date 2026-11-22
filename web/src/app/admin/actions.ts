"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { fetchNuvemshopProducts } from "@/lib/nuvemshop";

const BUCKET = "product-images";
const MAX_FILE = 5 * 1024 * 1024;

export type FormState = { error?: string; values?: Record<string, string> };

export async function login(formData: FormData) {
  const sb = await createClient();
  if (!sb) redirect("/admin/login?error=env");
  const { error } = await sb.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  redirect(error ? "/admin/login?error=1" : "/admin");
}

export async function logout() {
  const sb = await createClient();
  await sb?.auth.signOut();
  redirect("/admin/login");
}

type Sb = Awaited<ReturnType<typeof requireAdmin>>;

// Envia os arquivos de imagem do campo e devolve as URLs públicas.
async function upload(sb: Sb, files: FormDataEntryValue[], folder: string): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) {
    if (!(f instanceof File) || f.size === 0) continue;
    if (!f.type.startsWith("image/")) throw new Error("Envie apenas imagens.");
    if (f.size > MAX_FILE) throw new Error("Cada imagem deve ter no máximo 5 MB.");
    const ext = (f.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${folder}/${Date.now()}-${urls.length}-${crypto.randomUUID().slice(0, 8)}.${ext || "jpg"}`;
    const { error } = await sb.storage.from(BUCKET).upload(path, f, { contentType: f.type });
    if (error) throw new Error("Falha ao enviar imagem: " + error.message);
    urls.push(sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }
  return urls;
}

async function removeFiles(sb: Sb, urls: string[]) {
  const paths = urls.map((u) => u.split(`/${BUCKET}/`)[1]).filter(Boolean);
  if (paths.length) await sb.storage.from(BUCKET).remove(paths);
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function saveProduct(_prev: FormState, fd: FormData): Promise<FormState> {
  const sb = await requireAdmin();
  const text = (k: string) => String(fd.get(k) ?? "").trim();
  const id = text("id");
  const values = { name: text("name"), slug: text("slug"), description: text("description"), price: text("price"), buy_url: text("buy_url"), position: text("position"), category: text("category").slice(0, 40) };
  const fail = (error: string) => ({ error, values });

  if (!values.name) return fail("Informe o nome.");
  if (!SLUG.test(values.slug)) return fail("Slug inválido: use letras minúsculas, números e hífens.");

  let price_cents: number | null = null;
  if (values.price) {
    const n = Number(values.price.replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(n) || n < 0) return fail("Preço inválido.");
    price_cents = Math.round(n * 100);
  }

  let buy_url: string | null = null;
  if (values.buy_url) {
    try {
      if (new URL(values.buy_url).protocol !== "https:") throw 0;
    } catch {
      return fail("O link de compra deve começar com https://");
    }
    buy_url = values.buy_url;
  }

  const position = values.position ? Number(values.position) : 0;
  if (!Number.isInteger(position)) return fail("Posição deve ser um número inteiro.");

  let images: string[] = [];
  if (id) {
    const { data } = await sb.from("products").select("images").eq("id", id).single();
    images = data?.images ?? [];
  }
  const removed = fd.getAll("remove").map(String).filter((u) => images.includes(u));
  images = images.filter((u) => !removed.includes(u));

  try {
    images.push(...(await upload(sb, fd.getAll("new"), values.slug)));
  } catch (e) {
    return fail((e as Error).message);
  }

  const row = {
    name: values.name,
    slug: values.slug,
    description: values.description,
    category: values.category,
    price_cents,
    buy_url,
    position,
    images,
    featured: fd.get("featured") === "on",
    active: fd.get("active") === "on",
    updated_at: new Date().toISOString(),
  };
  const { error } = id ? await sb.from("products").update(row).eq("id", id) : await sb.from("products").insert(row);
  if (error) return fail(error.code === "23505" ? "Já existe um produto com esse slug." : error.message);

  await removeFiles(sb, removed);
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deleteProduct(fd: FormData) {
  const sb = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const { data } = await sb.from("products").select("images").eq("id", id).single();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (!error && data) await removeFiles(sb, data.images);
  revalidatePath("/", "layout");
  redirect("/admin");
}

// Slug = handle da Nuvemshop: produto já cadastrado aqui com o mesmo slug é atualizado, não duplicado.
export async function syncNuvemshop() {
  const sb = await requireAdmin();
  let msg: string;
  try {
    const rows = await fetchNuvemshopProducts();
    const { error } = await sb.from("products").upsert(rows, { onConflict: "slug" });
    msg = error ? "Erro ao gravar: " + error.message : `${rows.length} produtos sincronizados.`;
  } catch (e) {
    msg = (e as Error).message;
  }
  revalidatePath("/", "layout");
  redirect("/admin?sync=" + encodeURIComponent(msg));
}

export async function saveSettings(fd: FormData) {
  const sb = await requireAdmin();
  const title = String(fd.get("hero_title") ?? "").trim();
  if (!title) redirect("/admin/home?error=Informe+o+título.");

  const { data } = await sb.from("site_settings").select("hero_image").single();
  let hero_image: string | null = data?.hero_image ?? null;
  const old = hero_image;
  try {
    const [url] = await upload(sb, fd.getAll("hero_image"), "home");
    if (url) hero_image = url;
    else if (fd.get("remove_hero") === "on") hero_image = null;
  } catch (e) {
    redirect("/admin/home?error=" + encodeURIComponent((e as Error).message));
  }

  const { error } = await sb
    .from("site_settings")
    .update({ hero_title: title, hero_subtitle: String(fd.get("hero_subtitle") ?? "").trim(), hero_image })
    .eq("id", true);
  if (error) redirect("/admin/home?error=" + encodeURIComponent(error.message));
  if (old && old !== hero_image) await removeFiles(sb, [old]);
  revalidatePath("/", "layout");
  redirect("/admin/home?ok=1");
}
