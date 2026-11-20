import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin";
import { logout } from "../actions";

export const metadata: Metadata = { robots: { index: false } };

async function Gate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <nav className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line pb-4 text-sm">
        <Link href="/admin" className="font-bold">Produtos</Link>
        <Link href="/admin/home">Home</Link>
        <Link href="/" target="_blank" className="text-muted">Ver site</Link>
        <form action={logout} className="ml-auto"><button className="text-muted underline">Sair</button></form>
      </nav>
      <Suspense fallback={<p className="text-muted">Carregando...</p>}>
        <Gate>{children}</Gate>
      </Suspense>
    </div>
  );
}
