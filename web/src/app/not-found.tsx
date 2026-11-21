import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center px-5 py-24">
      <p className="text-sm font-medium uppercase tracking-wider text-muted">Página não encontrada</p>
      <h1 className="mt-3 font-display text-4xl leading-tight">Esta peça não está disponível no catálogo.</h1>
      <Link href="/loja" className="cta mt-8 bg-brand text-white hover:bg-foreground">Ver catálogo</Link>
    </main>
  );
}
