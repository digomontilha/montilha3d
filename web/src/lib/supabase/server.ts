import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabase, supabaseKey, supabaseUrl } from "./env";

// Cliente com a sessão do usuário (admin). Retorna null sem env.
export async function createClient() {
  if (!hasSupabase) return null;
  const store = await cookies();
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // chamado de Server Component: o proxy já renova a sessão
        }
      },
    },
  });
}
