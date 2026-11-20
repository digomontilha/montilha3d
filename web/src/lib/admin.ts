import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

// Garante usuário logado e presente em `admins`. Usar em páginas e em toda Server Action.
export async function requireAdmin() {
  const sb = await createClient();
  if (!sb) redirect("/admin/login");
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: ok } = await sb.rpc("is_admin");
  if (!ok) redirect("/admin/login?error=forbidden");
  return sb;
}
