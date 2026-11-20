import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatPrice, type Product } from "@/lib/products";

export default async function AdminProducts() {
  const sb = await requireAdmin();
  const { data } = await sb.from("products").select("*").order("position").order("name");
  const items = (data as Product[] | null) ?? [];
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link href="/admin/produtos/novo" className="btn">Novo produto</Link>
      </div>
      {items.length === 0 && <p className="text-muted">Nenhum produto ainda.</p>}
      <ul className="divide-y divide-line border-y border-line">
        {items.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/produtos/${p.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-white">
              <span className="min-w-0 flex-1 font-medium">{p.name}</span>
              <span className="font-mono text-sm">{formatPrice(p.price_cents) ?? "sem preço"}</span>
              <span className="text-xs">{p.active ? "ativo" : "inativo"}</span>
              {p.featured && <span className="text-xs text-brand">destaque</span>}
              <span className="text-sm underline">Editar</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
