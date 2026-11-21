// Prévia local com dados isolados: sobe o Supabase falso e o `next dev` apontando para ele (porta 3100).
// Uso: node e2e/dev-isolado.mjs   (produção e .env.local não são tocados)
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { FAKE_ANON_KEY, FAKE_URL, startFake } from "./fake-supabase.mjs";

await startFake();
console.log(`Supabase falso em ${FAKE_URL}`);
const web = fileURLToPath(new URL("..", import.meta.url));
const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", ...(process.argv.includes("--start") ? ["start"] : ["dev"]), "-p", "3100"], {
  cwd: web,
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: FAKE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: FAKE_ANON_KEY },
});
next.on("exit", (code) => process.exit(code ?? 0));
