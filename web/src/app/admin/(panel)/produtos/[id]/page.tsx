import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import type { Product } from "@/lib/products";
import { deleteProduct } from "../../../actions";
import { ProductForm } from "../ProductForm";

export default async function EditProduct({ params }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  const sb = await requireAdmin();
  const { data } = await sb.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const product = data as Product;
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">{product.name}</h1>
      <ProductForm product={product} />
      <form action={deleteProduct} className="mt-12 border-t border-line pt-6">
        <input type="hidden" name="id" value={product.id} />
        <button className="text-sm text-red-700 underline">Excluir produto</button>
      </form>
    </>
  );
}
