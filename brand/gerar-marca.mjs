// Recria em vetor o cubo da logo Montilha 3D (referência: brand/logo-referencia.jpg).
// Gera web/public/logo-mark.svg e web/src/app/icon.svg. Rodar: node brand/gerar-marca.mjs
import { writeFileSync } from "node:fs";

const INK = "#2f3337", BLUE = "#1e7fe0";
// Cubo isométrico
const T = [100, 14], R = [176, 58], B = [100, 102], L = [24, 58];
const down = 88;
const Bd = [B[0], B[1] + down], Ld = [L[0], L[1] + down], Rd = [R[0], R[1] + down];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const f = (p) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

// Face esquerda = letra M (coordenadas locais u: L→B, v: topo→base)
const face = (u, v) => [L[0] + (B[0] - L[0]) * u, L[1] + (B[1] - L[1]) * u + down * v];
const M = [[0,0],[0.27,0],[0.5,0.38],[0.73,0],[1,0],[1,1],[0.75,1],[0.75,0.46],[0.5,0.84],[0.25,0.46],[0.25,1],[0,1]].map(([u, v]) => face(u, v));

// Face direita: azul com linhas de camada (paralelas à aresta B→R)
let right = `<polygon points="${f([B, R, Rd, Bd])}" fill="${BLUE}"/>`;
for (let k = 1; k < 9; k++) {
  const t = k / 9;
  right += `<line x1="${lerp(B, Bd, t)[0]}" y1="${lerp(B, Bd, t)[1].toFixed(1)}" x2="${lerp(R, Rd, t)[0]}" y2="${lerp(R, Rd, t)[1].toFixed(1)}" stroke="#fff" stroke-opacity=".55" stroke-width="2.4"/>`;
}

// Topo: perímetros concêntricos (as "paredes" vistas de cima numa impressão)
const C = [100, 58];
let top = "";
for (const s of [1, 0.78, 0.56, 0.34]) {
  const q = [T, R, B, L].map((p) => lerp(C, p, s));
  top += `<polygon points="${f(q)}" fill="none" stroke="${INK}" stroke-width="${s === 1 ? 7 : 5}" stroke-linejoin="round"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="14 6 172 194">${top}${right}<polygon points="${f(M)}" fill="${INK}"/><polygon points="${f([B, R, Rd, Bd])}" fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/></svg>\n`;

const root = new URL("../web/", import.meta.url);
writeFileSync(new URL("public/logo-mark.svg", root), svg);
writeFileSync(new URL("src/app/icon.svg", root), svg);
console.log("ok");
