// Gera brand/logo-opcoes.html com 3 propostas de logo. Rodar: node brand/gerar-logos.mjs
import { writeFileSync } from "node:fs";

const M = [[20,170],[20,30],[58,30],[100,92],[142,30],[180,30],[180,170],[144,170],[144,88],[100,152],[56,88],[56,170]];
const pts = (p, sy = 1, oy = 0) => p.map(([x, y]) => `${x},${(y * sy + oy).toFixed(1)}`).join(" ");

// Cruzamentos horizontais do polígono na altura y -> segmentos [x1,x2]
function segments(y) {
  const xs = [];
  for (let i = 0; i < M.length; i++) {
    const [x1, y1] = M[i], [x2, y2] = M[(i + 1) % M.length];
    if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) xs.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
  }
  xs.sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < xs.length; i += 2) out.push([xs[i], xs[i + 1]]);
  return out;
}
console.assert(segments(100).length === 3, "M deve ter 3 trechos na altura 100");

// A — camadas arredondadas (cordões de filamento) + bico imprimindo a última camada
function conceitoA() {
  const h = 7.4, pitch = 10, nozzleX = 164;
  let s = "";
  for (let k = 0; k < 14; k++) {
    const y = 30 + k * pitch;
    for (const [a, b] of segments(y + h / 2)) {
      if (k === 0 && a > 100) {
        s += `<rect x="${a}" y="${y}" width="${nozzleX - a}" height="${h}" rx="${h / 2}" fill="var(--brand)"/>`;
        continue;
      }
      s += `<rect x="${a.toFixed(1)}" y="${y}" width="${(b - a).toFixed(1)}" height="${h}" rx="${h / 2}" fill="${k === 0 ? "var(--brand)" : "var(--ink)"}"/>`;
    }
  }
  s += `<rect x="${nozzleX - 13}" y="2" width="26" height="12" rx="2.5" fill="var(--ink)"/>`;
  s += `<polygon points="${nozzleX - 7},14 ${nozzleX + 7},14 ${nozzleX + 2},25 ${nozzleX - 2},25" fill="var(--ink)"/>`;
  return `<svg viewBox="0 0 200 200">${s}</svg>`;
}

// B — o "M" impresso deitado na mesa, visto de cima: lateral mostra as camadas em azul,
// topo preto com as linhas diagonais do acabamento de superfície.
function conceitoB() {
  const sy = 0.55, top = 40, layers = 9, step = 4;
  let s = `<ellipse cx="100" cy="${(170 * sy + top + layers * step + 8).toFixed(0)}" rx="92" ry="7" fill="var(--ink)" opacity=".08"/>`;
  for (let k = layers; k >= 1; k--) {
    s += `<polygon points="${pts(M, sy, top + k * step)}" fill="${k % 2 ? "var(--brand)" : "var(--brand-dark)"}"/>`;
  }
  s += `<clipPath id="topoB"><polygon points="${pts(M, sy, top)}"/></clipPath>`;
  s += `<polygon points="${pts(M, sy, top)}" fill="var(--ink)"/>`;
  s += `<g clip-path="url(#topoB)" stroke="var(--hatch)" stroke-width="1.2" opacity=".45">`;
  for (let x = -120; x < 220; x += 6) s += `<line x1="${x}" y1="140" x2="${x + 100}" y2="20"/>`;
  s += `</g>`;
  return `<svg viewBox="0 0 200 200">${s}</svg>`;
}

// C — um único fio de filamento desenhando o M, terminando no bico (trecho azul = filamento fresco)
function conceitoC() {
  const path = "M22 168 L22 44 Q22 28 34 40 L86 108 L138 40 Q150 28 150 44 L150 168";
  return `<svg viewBox="0 0 200 200">
    <path d="${path}" fill="none" stroke="var(--ink)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M150 168 L178 168" fill="none" stroke="var(--brand)" stroke-width="24" stroke-linecap="round"/>
    <rect x="165" y="124" width="26" height="12" rx="2.5" fill="var(--ink)"/>
    <polygon points="171,136 185,136 180,148 176,148" fill="var(--ink)"/>
  </svg>`;
}

const conceitos = [
  ["A", "Cordões de filamento", "Evolução do seu M: cada camada é um cordão arredondado, como sai do bico de verdade. A última camada, em azul, ainda está sendo impressa.", conceitoA()],
  ["B", "Peça na mesa", "O M impresso, deitado na mesa e visto de cima. A lateral mostra as camadas (azul) e o topo tem as linhas diagonais do acabamento real de uma impressão.", conceitoB()],
  ["C", "Fio contínuo", "O M desenhado por um único fio de filamento, como o caminho do bico. Mais simples e moderno, funciona bem em tamanho pequeno.", conceitoC()],
];

const card = ([id, nome, texto, svg]) => `
<section class="card">
  <div class="hero light">${svg}</div>
  <div class="row">
    <div class="tile light small">${svg}</div>
    <div class="tile dark small">${svg}</div>
    </div>
  <div class="wordmark light wide"><span class="mk">${svg}</span><b>MONTILHA</b><i>3D</i></div>
  <div class="wordmark dark wide"><span class="mk">${svg}</span><b>MONTILHA</b><i>3D</i></div>
  <h2><span>${id}</span> ${nome}</h2>
  <p>${texto}</p>
</section>`;

writeFileSync(new URL("./logo-opcoes.html", import.meta.url), `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Logo Montilha 3D</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--ink:#0b0d10;--brand:#1747e6;--brand-dark:#0e2f9e;--hatch:#20252d;--bg:#f3f4f1}
*{box-sizing:border-box;margin:0}
body{background:var(--bg);color:var(--ink);font-family:Archivo,sans-serif;padding:32px 16px}
header{max-width:1200px;margin:0 auto 32px}
header p{font-family:"IBM Plex Mono",monospace;font-size:13px;color:#5b6068;margin-top:8px}
h1{font-size:clamp(28px,5vw,48px);font-weight:800;font-stretch:110%;letter-spacing:-.02em}
main{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
.card{background:#fff;border:1px solid #d9dbd6;padding:20px}
.light{background:var(--bg)}
.dark{background:#0b0d10;--ink:#f3f4f1;--hatch:#d7dbe2;--brand-dark:#0e2f9e;color:#f3f4f1}
.hero{aspect-ratio:1;display:grid;place-items:center;padding:32px}
.hero svg{width:100%;height:100%}
.row{display:flex;gap:8px;margin-top:8px;align-items:stretch}
.tile{width:56px;height:56px;display:grid;place-items:center;flex:none}
.tile svg{width:32px;height:32px}
.wordmark{display:flex;align-items:center;gap:8px;padding:0 12px;flex:1;font-stretch:118%;font-size:17px;letter-spacing:-.01em}
.wordmark.wide{margin-top:8px;height:72px;font-size:clamp(18px,2vw,24px);justify-content:center}
.wordmark b{font-weight:850}.wordmark i{font-style:normal;font-weight:850;color:#1747e6}
.mk svg{width:30px;height:30px;display:block}.wide .mk svg{width:40px;height:40px}
h2{font-size:22px;font-weight:800;margin-top:20px}
h2 span{font-family:"IBM Plex Mono",monospace;font-size:13px;font-weight:500;color:#fff;background:#1747e6;padding:2px 7px;vertical-align:3px;margin-right:6px}
.card>p{color:#5b6068;font-size:15px;line-height:1.5;margin-top:6px}
</style></head><body>
<header><h1>Logo Montilha 3D — 3 caminhos</h1><p>Cada proposta: grande · favicon claro/escuro · com o nome · versão em fundo preto</p></header>
<main>${conceitos.map(card).join("")}</main>
</body></html>`);
console.log("ok");
