"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { saveProduct, type FormState } from "../../actions";
import type { Product } from "@/lib/products";

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});
  const v = state.values;
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const price = product?.price_cents != null ? (product.price_cents / 100).toFixed(2).replace(".", ",") : "";

  return (
    <form action={action} className="max-w-xl space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      {state.error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}

      <label className="block text-sm">Nome
        <input name="name" required className="field mt-1" value={name} onChange={(e) => { setName(e.target.value); if (!slugEdited) setSlug(slugify(e.target.value)); }} />
      </label>
      <label className="block text-sm">Slug (endereço)
        <input name="slug" required className="field mt-1 font-mono" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }} />
      </label>
      <label className="block text-sm">Descrição
        <textarea name="description" rows={5} className="field mt-1" defaultValue={v?.description ?? product?.description} />
      </label>
      <label className="block text-sm">Preço (R$)
        <input name="price" inputMode="decimal" placeholder="89,90" className="field mt-1 font-mono" defaultValue={v?.price ?? price} />
      </label>
      <label className="block text-sm">Link de compra (https)
        <input name="buy_url" type="url" placeholder="https://" className="field mt-1" defaultValue={v?.buy_url ?? product?.buy_url ?? ""} />
      </label>
      <label className="block text-sm">Posição (menor aparece primeiro)
        <input name="position" type="number" step={1} className="field mt-1 w-32" defaultValue={v?.position ?? product?.position ?? 0} />
      </label>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Ativo</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Destaque na home</label>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm">Imagens</legend>
        {product && product.images.length > 0 && (
          <ul className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {product.images.map((src) => (
              <li key={src} className="text-xs">
                <Image src={src} alt="" width={160} height={160} className="aspect-square w-full object-cover" />
                <label className="mt-1 flex items-center gap-1"><input type="checkbox" name="remove" value={src} /> remover</label>
              </li>
            ))}
          </ul>
        )}
        <input type="file" name="new" accept="image/*" multiple className="text-sm" />
      </fieldset>

      <button disabled={pending} className="btn disabled:opacity-50">{pending ? "Salvando..." : "Salvar"}</button>
    </form>
  );
}
