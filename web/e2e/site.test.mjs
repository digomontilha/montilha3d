// Testes de ponta a ponta contra a prévia isolada (Supabase falso, nunca a produção).
// Uso: em um terminal `node e2e/dev-isolado.mjs`; em outro `npm run test:e2e`.
// Requer o pacote `playwright` (ou PW=<caminho do pacote>) e o Google Chrome instalado.
import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { fileURLToPath } from "node:url";
import { ADMIN, FAKE_URL } from "./fake-supabase.mjs";

const { chromium } = await import(process.env.PW ? `file:///${process.env.PW.replace(/\\/g, "/")}/index.mjs` : "playwright");
const BASE = "http://localhost:3100";
const KIT = "/produto/kit-6-flocos-de-neve-para-arvore-de-natal";
const fake = (path, body) => fetch(FAKE_URL + path, { method: "POST", body: body && JSON.stringify(body) }).then((r) => r.json());
const state = () => fetch(FAKE_URL + "/__state").then((r) => r.json());

let browser, page;
before(async () => (browser = await chromium.launch({ channel: "chrome" })));
after(() => browser.close());
beforeEach(async () => {
  await fake("/__reset");
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
});

const testProduct = (over) => ({
  id: "11111111-1111-4111-8111-111111111111", slug: "produto-teste-com-link", name: "Produto de teste com link", description: "Item de teste.",
  price_cents: 2990, images: [], buy_url: "https://example.com/produto-teste", nuvemshop_id: null, featured: false, position: 5, active: true, category: "Teste", updated_at: "2026-11-21T00:00:00Z", ...over,
});

test("jornada: início → catálogo → ficha → catálogo, com os dados reais do kit", async () => {
  await page.goto(BASE + "/");
  assert.equal(await page.locator("h1").innerText(), "Produtos 3D para decorar e presentear");
  await page.getByRole("link", { name: "Ver catálogo", exact: true }).click();
  await page.waitForURL("**/loja");
  const card = page.locator("article");
  await card.first().waitFor();
  assert.equal(await card.count(), 1);
  assert.match(await card.innerText(), /Kit 6 Flocos de Neve para Árvore de Natal[\s\S]*R\$\s16,00[\s\S]*Em breve/);
  assert.equal(await card.locator("img").getAttribute("alt"), "Foto de Kit 6 Flocos de Neve para Árvore de Natal");

  await card.getByRole("link").click();
  await page.waitForURL("**" + KIT);
  await page.getByRole("heading", { level: 1, name: "Kit 6 Flocos de Neve para Árvore de Natal" }).waitFor();
  const body = await page.locator("main").innerText();
  assert.match(body, /R\$\s16,00/);
  assert.match(body, /3 flocos azuis e 3 dourados/);
  assert.match(body, /6 flocos de neve e 6 ganchinhos/);
  await page.locator("#situacao", { hasText: "Em breve" }).waitFor(); // selo ao lado do preço // espera o trecho em streaming
  assert.equal(await page.getByRole("link", { name: /Comprar/ }).count(), 0);
  assert.equal(await page.locator("main").getByRole("link", { name: /Instagram @montilha3d/ }).getAttribute("href"), "https://www.instagram.com/montilha3d/");
  assert.ok((await page.locator("main img").first().getAttribute("alt")).includes("Kit 6 Flocos"));

  await page.getByRole("link", { name: "Voltar ao catálogo" }).click();
  await page.waitForURL("**/loja");
});

test("endereço existente abre direto (produto cadastrado antes do redesign)", async () => {
  const r = await page.goto(BASE + KIT);
  assert.equal(r.status(), 200);
  assert.equal(await page.title(), "Kit 6 Flocos de Neve para Árvore de Natal · Montilha 3D");
});

test("produto com link https mostra Comprar para o destino; sem link mostra Em breve", async () => {
  await fake("/__products", [...(await state()).products, testProduct()]);
  await page.goto(BASE + "/loja");
  assert.deepEqual(await page.locator("article h2").allInnerTexts(), ["Kit 6 Flocos de Neve para Árvore de Natal", "Produto de teste com link"]); // ordem por Posição
  await page.goto(BASE + "/produto/produto-teste-com-link");
  const buy = page.getByRole("link", { name: /Comprar/ });
  assert.equal(await buy.getAttribute("href"), "https://example.com/produto-teste");
  assert.equal(await buy.getAttribute("target"), "_blank");
  assert.match(await buy.getAttribute("rel"), /noopener/);
  assert.equal(await page.locator("#situacao", { hasText: "Em breve" }).count(), 0);
  // destino conferido sem abrir/concluir compra
});

test("catálogo vazio tem saída útil; home mantém caminho para o catálogo", async () => {
  await fake("/__products", []);
  await page.goto(BASE + "/loja");
  await page.getByText("Nenhuma peça no catálogo agora.").waitFor(); // espera o trecho em streaming
  await page.getByRole("link", { name: "Voltar ao início" }).waitFor(); // espera o trecho em streaming
  await page.goto(BASE + "/");
  await page.getByRole("link", { name: "Ver catálogo", exact: true }).waitFor(); // espera o trecho em streaming
});

test("categorias filtram quando há mais de uma", async () => {
  const kit = (await state()).products[0];
  await fake("/__products", [{ ...kit, category: "Natal" }, testProduct()]);
  await page.goto(BASE + "/loja");
  await page.getByRole("link", { name: "Natal", exact: true }).click();
  await page.waitForURL(/categoria=Natal/);
  assert.deepEqual(await page.locator("article h2").allInnerTexts(), ["Kit 6 Flocos de Neve para Árvore de Natal"]);
});

test("painel: login obrigatório e senha errada", async () => {
  await page.goto(BASE + "/admin");
  await page.waitForURL("**/admin/login**");
  await page.fill('input[name="email"]', ADMIN.email);
  await page.fill('input[name="password"]', "errada");
  await page.click('button[type="submit"], form button');
  await page.waitForURL(/error=1/);
});

async function login() {
  await page.goto(BASE + "/admin/login");
  await page.fill('input[name="email"]', ADMIN.email);
  await page.fill('input[name="password"]', ADMIN.password);
  await page.click("form button");
  await page.waitForURL(BASE + "/admin");
}
const editTest = async () => {
  await page.goto(BASE + "/admin");
  await page.getByRole("link", { name: /Peça de teste/ }).click();
  await page.waitForURL(/\/admin\/produtos\/.+/);
};
const save = async () => { await page.click("text=Salvar"); await page.waitForURL(BASE + "/admin"); };
const catalogNames = async () => { await page.goto(BASE + "/loja"); await page.locator("article").first().waitFor(); return page.locator("article h2").allInnerTexts(); };

test("painel: cadastro com foto, Posição, Ativo, Destaque e link de compra", async () => {
  await login();
  await page.goto(BASE + "/admin/produtos/novo");
  await page.fill('input[name="name"]', "Peça de teste");
  await page.fill('textarea[name="description"]', "Vem 1 peça de teste.");
  await page.fill('input[name="price"]', "12,50");
  await page.fill('input[name="position"]', "-1");
  await page.setInputFiles('input[name="new"]', fileURLToPath(new URL("./fixtures/kit.jpg", import.meta.url)));
  await save();
  const created = (await state()).products.find((p) => p.slug === "peca-de-teste");
  assert.equal(created.active, true);   // padrão do formulário: ativo
  assert.equal(created.featured, false); // padrão: sem destaque
  assert.equal(created.images.length, 1);
  assert.equal((await fetch(created.images[0])).status, 200); // upload servido

  // Posição -1 vem antes do kit (0)
  assert.deepEqual(await catalogNames(), ["Peça de teste", "Kit 6 Flocos de Neve para Árvore de Natal"]);
  await page.goto(BASE + "/produto/peca-de-teste");
  await page.locator("h1", { hasText: "Peça de teste" }).waitFor();
  assert.match(await page.locator("main").innerText(), /R\$\s12,50[\s\S]*Em breve/);

  // Só o link de compra: muda a ação, não a visibilidade
  await editTest();
  await page.fill('input[name="buy_url"]', "https://example.com/peca-de-teste");
  await save();
  assert.deepEqual(await catalogNames(), ["Peça de teste", "Kit 6 Flocos de Neve para Árvore de Natal"]);
  await page.goto(BASE + "/produto/peca-de-teste");
  await page.locator("h1", { hasText: "Peça de teste" }).waitFor();
  assert.equal(await page.getByRole("link", { name: /Comprar/ }).getAttribute("href"), "https://example.com/peca-de-teste");

  // Link http é recusado pelo painel
  await editTest();
  await page.fill('input[name="buy_url"]', "http://example.com/x");
  await page.click("text=Salvar");
  const alert = page.locator("form p[role=alert]");
  await alert.waitFor();
  assert.match(await alert.innerText(), /https/);

  // Destaque na home: o kit não é destaque, a peça de teste passa a ser a protagonista
  await page.goto(BASE + "/");
  await page.locator("figcaption").waitFor(); assert.match(await page.locator("figcaption").innerText(), /Peça de teste/); // sem destaque: primeiro ativo por Posição
  await fake("/__products", (await state()).products.map((p) => ({ ...p, position: p.slug === "peca-de-teste" ? 9 : p.position })));
  await page.goto(BASE + "/");
  await page.locator("figcaption").waitFor(); assert.match(await page.locator("figcaption").innerText(), /Kit 6 Flocos/);
  await editTest();
  await page.check('input[name="featured"]');
  await save();
  await page.goto(BASE + "/");
  await page.locator("figcaption").waitFor(); assert.match(await page.locator("figcaption").innerText(), /Peça de teste/);
  assert.equal(await page.getByRole("heading", { name: "Mais peças" }).count(), 0); // só o destaque aparece na vitrine

  // Ativo desligado: some da vitrine e do catálogo; endereço direto dá 404
  await editTest();
  await page.uncheck('input[name="active"]');
  await save();
  assert.deepEqual(await catalogNames(), ["Kit 6 Flocos de Neve para Árvore de Natal"]);
  // notFound() dentro do Suspense: status 200 com a tela de não encontrado + noindex (igual a antes do redesign)
  await page.goto(BASE + "/produto/peca-de-teste");
  await page.getByText("Esta peça não está disponível no catálogo.").waitFor();
  assert.equal(await page.locator("h1", { hasText: "Peça de teste" }).count(), 0);
  await page.goto(BASE + "/");
  await page.locator("figcaption").waitFor(); assert.match(await page.locator("figcaption").innerText(), /Kit 6 Flocos/); // destaque inativo não aparece; volta ao fallback
});

test("galeria: miniaturas navegáveis por teclado quando há mais de uma foto", async () => {
  const [kit] = (await state()).products;
  await fake("/__products", [{ ...kit, images: [kit.images[0], kit.images[0] + "?foto=2"] }]);
  await page.goto(BASE + KIT);
  const second = page.getByRole("button", { name: "Mostrar foto 2 de 2" });
  await second.focus();
  await page.keyboard.press("Enter");
  assert.equal(await second.getAttribute("aria-pressed"), "true");
  await page.locator('main img[alt^="Foto 2 de 2"]').waitFor();
});

test("contato: Instagram e TikTok da marca no rodapé, em nova aba", async () => {
  await page.goto(BASE + "/");
  const ig = page.locator("footer").getByRole("link", { name: /Instagram/ });
  assert.equal(await ig.getAttribute("href"), "https://www.instagram.com/montilha3d/");
  assert.equal(await ig.getAttribute("target"), "_blank");
  assert.match(await ig.getAttribute("rel"), /noopener/);
  const tt = page.locator("footer").getByRole("link", { name: /TikTok/ });
  assert.equal(await tt.getAttribute("href"), "https://www.tiktok.com/@montilha3d");
  assert.equal(await tt.getAttribute("target"), "_blank");
});

test("celular 360px: sem rolagem horizontal e imagens com alt", async () => {
  const m = await browser.newPage({ viewport: { width: 360, height: 740 } });
  for (const path of ["/", "/loja", KIT]) {
    await m.goto(BASE + path, { waitUntil: "networkidle" });
    assert.equal(await m.evaluate(() => document.documentElement.scrollWidth), 360, path);
    assert.equal(await m.locator("img:not([alt])").count(), 0, path);
  }
});

test("teclado: pular para o conteúdo, ordem do foco e foco visível", async () => {
  await page.goto(BASE + "/loja");
  const focused = async () => page.evaluate(() => {
    const el = document.activeElement;
    return { text: (el.getAttribute("aria-label") || el.textContent).trim(), outline: getComputedStyle(el).outlineStyle };
  });
  const order = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    const f = await focused();
    assert.notEqual(f.outline, "none", `foco visível em ${f.text}`);
    order.push(f.text);
  }
  assert.deepEqual(order, ["Pular para o conteúdo", "Montilha 3D, início", "Início", "Catálogo", "Contato", "Kit 6 Flocos de Neve para Árvore de Natal"]);
});

test("contraste AA das cores de texto da marca", () => {
  const lum = (hex) => {
    const [r, g, b] = hex.match(/\w\w/g).map((h) => parseInt(h, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  for (const [fg, bg] of [["13233f", "f6f2eb"], ["4e5a6c", "f6f2eb"], ["1f4fa3", "f6f2eb"], ["ffffff", "1f4fa3"], ["065f46", "f6f2eb"], ["78350f", "fef3c7"]])
    assert.ok(ratio(fg, bg) >= 4.5, `${fg} sobre ${bg}: ${ratio(fg, bg).toFixed(2)}`);
});
