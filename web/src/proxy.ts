import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabase, supabaseKey, supabaseUrl } from "@/lib/supabase/env";

// Renova a sessão do Supabase, só para /admin.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!hasSupabase) return response;
  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = { matcher: "/admin/:path*" };
