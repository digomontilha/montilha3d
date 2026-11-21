// Supabase falso, em memória, só para testes e prévia local (dados isolados da produção).
// Cobre apenas o que o site usa: REST de products/site_settings, rpc is_admin, login por senha e storage público.
// shortcut: não implementa RLS nem PostgREST completo; se o site passar a usar outros filtros, ampliar aqui.
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

export const FAKE_PORT = 54399;
export const FAKE_URL = `http://127.0.0.1:${FAKE_PORT}`;
export const FAKE_ANON_KEY = "fake-anon-key";
// Usuário de teste do painel (só existe neste servidor falso).
export const ADMIN = { email: "admin@teste.local", password: "senha-de-teste-123" };

const BUCKET = "product-images";
const kitPath = "kit-6-flocos-de-neve-para-arvore-de-natal/foto-1.jpg";
const kitPhoto = readFileSync(new URL("./fixtures/kit.jpg", import.meta.url));

// Espelho do cadastro real em 21/11/2026 (lido da produção, só leitura).
const seedProducts = () => [
  {
    id: "d8f18ffd-db23-4a76-99d7-7871d62b82f1",
    slug: "kit-6-flocos-de-neve-para-arvore-de-natal",
    name: "Kit 6 Flocos de Neve para Árvore de Natal",
    description:
      "❄️ Kit Natalino com 6 Flocos de Neve\r\n\r\nDê um toque de inverno à sua árvore de Natal! O kit vem com 3 flocos azuis e 3 dourados, todos impressos em 3D. O azul dá um toque de cor, e o dourado fica lindo entre as luzinhas do pisca-pisca. ✨\r\n\r\nCada floco acompanha um ganchinho para pendurar na árvore, na guirlanda ou onde você quiser decorar. 🎄\r\n\r\n📦 Você recebe 6 flocos de neve e 6 ganchinhos.",
    price_cents: 1600,
    images: [`${FAKE_URL}/storage/v1/object/public/${BUCKET}/${kitPath}`],
    buy_url: null,
    nuvemshop_id: null,
    featured: false,
    position: 0,
    active: true,
    updated_at: "2026-11-20T01:25:06.484+00:00",
    category: "",
  },
];
// Estado depois da migration 0003 (textos da home sem menção à impressão).
const seedSettings = () => ({ id: true, hero_title: "Produtos 3D para decorar e presentear", hero_subtitle: "", hero_image: null });

let db, files;
const sessions = new Map(); // token -> user
const user = { id: "00000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated", email: ADMIN.email, app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
export function reset() {
  db = { products: seedProducts(), site_settings: [seedSettings()] };
  files = new Map([[kitPath, { type: "image/jpeg", body: kitPhoto }]]);
}
reset();

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
function session() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const access_token = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: user.id, exp, role: "authenticated", aud: "authenticated", email: user.email })}.fake`;
  sessions.set(access_token, user);
  return { access_token, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: randomUUID(), user };
}

// Converte filtros PostgREST simples (col=eq.valor) e order=col.asc,...
function query(rows, params) {
  let out = rows.filter((r) =>
    [...params].every(([k, v]) => {
      if (["select", "order", "limit", "columns"].includes(k)) return true;
      if (!v.startsWith("eq.")) throw new Error(`filtro não suportado: ${k}=${v}`);
      return String(r[k]) === v.slice(3);
    }),
  );
  const order = params.get("order");
  if (order)
    out = out.sort((a, b) => {
      for (const part of order.split(",")) {
        const [col, dir] = part.split(".");
        const c = a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0;
        if (c) return dir === "desc" ? -c : c;
      }
      return 0;
    });
  return out;
}

const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "*" });
  res.end(body === undefined ? "" : JSON.stringify(body));
};

async function handle(req, res) {
  const url = new URL(req.url, FAKE_URL);
  const p = url.pathname;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks);
  const body = () => JSON.parse(raw.toString() || "null");
  const token = (req.headers.authorization ?? "").replace(/^Bearer /, "");
  const admin = sessions.has(token);

  if (req.method === "OPTIONS") {
    res.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" });
    return res.end();
  }

  // Controle dos testes
  if (p === "/__reset") return reset(), json(res, 200, { ok: true });
  if (p === "/__state") return json(res, 200, db);
  if (p === "/__products" && req.method === "POST") return (db.products = body()), json(res, 200, { ok: true });

  // Auth
  if (p === "/auth/v1/token") {
    const b = body();
    if (url.searchParams.get("grant_type") === "password") {
      if (b.email !== ADMIN.email || b.password !== ADMIN.password) return json(res, 400, { code: "invalid_credentials", error_code: "invalid_credentials", msg: "Invalid login credentials" });
      return json(res, 200, session());
    }
    return json(res, 200, session()); // refresh_token
  }
  if (p === "/auth/v1/user") return admin ? json(res, 200, sessions.get(token)) : json(res, 401, { code: 401, msg: "invalid JWT" });
  if (p === "/auth/v1/logout") return sessions.delete(token), json(res, 204);

  // Storage
  const pub = `/storage/v1/object/public/${BUCKET}/`;
  if (p.startsWith(pub)) {
    const f = files.get(decodeURIComponent(p.slice(pub.length)));
    if (!f) return json(res, 404, { error: "not_found" });
    res.writeHead(200, { "content-type": f.type, "cache-control": "public, max-age=3600" });
    return res.end(f.body);
  }
  const obj = `/storage/v1/object/${BUCKET}`;
  if (p.startsWith(obj)) {
    if (!admin) return json(res, 403, { error: "Unauthorized" });
    if (req.method === "DELETE") {
      const { prefixes } = body();
      prefixes.forEach((k) => files.delete(k));
      return json(res, 200, prefixes.map((name) => ({ name })));
    }
    const key = decodeURIComponent(p.slice(obj.length + 1));
    let file = raw, type = req.headers["content-type"] ?? "application/octet-stream";
    if (type.startsWith("multipart/form-data")) {
      const fd = await new Request("http://x", { method: "POST", headers: { "content-type": type }, body: raw }).formData();
      const blob = [...fd.values()].find((v) => typeof v !== "string");
      file = Buffer.from(await blob.arrayBuffer());
      type = blob.type || "image/jpeg";
    }
    files.set(key, { type, body: file });
    return json(res, 200, { Id: randomUUID(), Key: `${BUCKET}/${key}` });
  }

  // REST
  if (p === "/rest/v1/rpc/is_admin") return json(res, 200, admin);
  const table = p.match(/^\/rest\/v1\/(products|site_settings)$/)?.[1];
  if (!table) return json(res, 404, { message: `rota não simulada: ${req.method} ${p}` });
  const rows = db[table];
  const visible = table === "products" && !admin ? rows.filter((r) => r.active) : rows; // imita a RLS "public reads active products"
  const single = (req.headers.accept ?? "").includes("vnd.pgrst.object");

  if (req.method === "GET" || req.method === "HEAD") {
    const out = query(visible, url.searchParams);
    if (single) return out.length === 1 ? json(res, 200, out[0]) : json(res, 406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" });
    return json(res, 200, out);
  }
  if (!admin) return json(res, 401, { code: "42501", message: "permission denied" });
  if (req.method === "POST") {
    const b = body();
    for (const r of [b].flat()) {
      if (rows.some((x) => x.slug === r.slug)) return json(res, 409, { code: "23505", message: "duplicate key value violates unique constraint \"products_slug_key\"" });
      rows.push({ id: randomUUID(), description: "", price_cents: null, images: [], buy_url: null, nuvemshop_id: null, featured: false, position: 0, active: true, category: "", ...r });
    }
    return json(res, 201);
  }
  if (req.method === "PATCH") {
    const b = body();
    const targets = query(rows, url.searchParams);
    if (b.slug && rows.some((x) => x.slug === b.slug && !targets.includes(x))) return json(res, 409, { code: "23505", message: "duplicate key" });
    targets.forEach((r) => Object.assign(r, b));
    return json(res, 204);
  }
  if (req.method === "DELETE") {
    const gone = new Set(query(rows, url.searchParams));
    db[table] = rows.filter((r) => !gone.has(r));
    return json(res, 204);
  }
  return json(res, 405, { message: "método não simulado" });
}

export function startFake(port = FAKE_PORT) {
  return new Promise((ok) => {
    const server = createServer((req, res) => handle(req, res).catch((e) => json(res, 500, { message: String(e) })));
    server.listen(port, "127.0.0.1", () => ok(server));
  });
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) startFake().then(() => console.log(`Supabase falso em ${FAKE_URL}`));
