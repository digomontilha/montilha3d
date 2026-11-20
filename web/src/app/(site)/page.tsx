import Link from "next/link";
import { Suspense } from "react";
import { Reveal } from "@/components/Reveal";
import { Showcase, type Slide } from "@/components/Showcase";
import { formatPrice, getFeatured, getProducts, getSettings } from "@/lib/products";

async function Vitrine() {
  const featured = await getFeatured();
  const items = featured.length ? featured : (await getProducts()).slice(0, 8);
  const slides: Slide[] = items.length
    ? items.map((p) => ({ slug: p.slug, name: p.name, category: p.category, price: formatPrice(p.price_cents), image: p.images[0] ?? null }))
    : [{ slug: null, name: "Montilha 3D", category: "", price: "Catálogo em breve", image: null }];
  return <Showcase slides={slides} />;
}

async function Intro() {
  const s = await getSettings();
  return (
    <Reveal as="section" className="mx-auto mt-24 grid w-full max-w-7xl gap-8 border-t border-line px-5 pt-14 md:grid-cols-12 md:px-10">
      <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[0.95] tracking-tighter md:col-span-8" style={{ fontStretch: "85%" }}>
        {s.hero_title}
      </h1>
      <div className="self-end md:col-span-4">
        <p className="text-lg text-muted">{s.hero_subtitle}</p>
        <Link href="/loja" className="mt-5 inline-block font-mono text-xs uppercase tracking-widest underline underline-offset-4 hover:text-brand">
          Ver toda a loja →
        </Link>
      </div>
    </Reveal>
  );
}

const specs = [
  ["Altura de camada", "0,2 mm"],
  ["Material", "PLA e PETG"],
  ["Bico", "0,4 mm"],
  ["Acabamento", "à mão"],
];

export default function Home() {
  return (
    <>
      <Suspense fallback={<div className="h-[70vh]" />}>
        <Vitrine />
      </Suspense>

      <Suspense fallback={<div className="h-64" />}>
        <Intro />
      </Suspense>

      <Reveal as="section" id="como-e-feito" className="mx-auto mt-40 grid w-full max-w-7xl gap-12 px-5 md:grid-cols-12 md:px-10">
        <h2 className="font-display text-5xl font-extrabold leading-none tracking-tighter md:col-span-5 md:text-6xl">
          Como é feito
        </h2>
        <div className="md:col-span-6 md:col-start-7">
          <p className="max-w-prose text-lg leading-relaxed">
            Cada peça nasce de um arquivo 3D desenhado por nós. A impressora deposita plástico fundido em camadas finas,
            uma sobre a outra, até a forma ficar completa. Depois vêm a remoção dos suportes, a lixa e o acabamento.
          </p>
          <dl className="mt-10 border-t border-line font-mono text-sm">
            {specs.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-line py-3">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </>
  );
}
