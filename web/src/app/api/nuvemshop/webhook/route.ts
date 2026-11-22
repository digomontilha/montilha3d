import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { supabaseUrl } from "@/lib/supabase/env";
import { syncProducts, validSignature } from "@/lib/nuvemshop";

// Chamado pela Nuvemshop quando um produto é criado, alterado ou apagado.
export async function POST(req: Request) {
  const secret = process.env.NUVEMSHOP_CLIENT_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !serviceKey || !supabaseUrl) return new Response("não configurado", { status: 500 });

  const body = await req.text();
  if (!validSignature(body, req.headers.get("x-linkedstore-hmac-sha256"), secret)) {
    return new Response("assinatura inválida", { status: 401 });
  }

  // Sem sessão de admin aqui: grava com a chave de serviço, que só existe no servidor.
  const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  await syncProducts(sb);
  revalidatePath("/", "layout");
  return new Response("ok");
}
