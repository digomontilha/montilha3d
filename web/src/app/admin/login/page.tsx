import type { Metadata } from "next";
import { Suspense } from "react";
import { login } from "../actions";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

async function Form({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const { error } = await searchParams;
  return (
    <form action={login} className="space-y-4">
      {error && (
        <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error === "env" ? "Supabase não configurado." : "E-mail ou senha incorretos."}
        </p>
      )}
      <label className="block text-sm">E-mail<input name="email" type="email" required autoComplete="email" className="field mt-1" /></label>
      <label className="block text-sm">Senha<input name="password" type="password" required autoComplete="current-password" className="field mt-1" /></label>
      <button className="btn w-full">Entrar</button>
    </form>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="mx-auto w-full max-w-sm px-5 py-20">
      <h1 className="mb-8 font-display text-3xl font-extrabold tracking-tight">Admin</h1>
      <Suspense>
        <Form searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
