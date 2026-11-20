import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "./supabase/server";

// Garante usuário logado e presente em `admins`. Usar em páginas e em toda Server Action.
export async function requireAdmin() {
  await connection(); // painel é sempre por request; evita o erro de Date.now() no prerender
  const sb = await createClient();
  if (!sb) redirect("/admin/login");
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: ok } = await sb.rpc("is_admin");
  if (!ok) redirect("/admin/login?error=forbidden");
  return sb;
}
