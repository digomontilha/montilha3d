import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyCatalog, ProductCard } from "@/components/ProductCard";
import { getFeatured, getSettings } from "@/lib/products";

async function Hero() {
  const s = await getSettings();
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 pt-10 md:grid-cols-12 md:px-10 md:pt-20">
      <h1 className="font-display text-[clamp(3rem,9vw,8rem)] font-extrabold leading-[0.92] tracking-tighter md:col-span-9" style={{ fontStretch: "85%" }}>
        {s.hero_title}
      </h1>
      <p className="max-w-xs self-end text-lg text-muted md:col-span-3">{s.hero_subtitle}</p>
      {s.hero_image && (
        <div className="relative mt-4 aspect-[16/9] md:col-span-12">
          <Image src={s.hero_image} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>
      )}
    </section>
  );
}

const slots = [
  "md:col-span-7",
  "md:col-span-4 md:col-start-9 md:mt-32",
  "md:col-span-5 md:col-start-2",
  "md:col-span-5 md:col-start-8",
];

async function Featured() {
  const items = await getFeatured();
  if (!items.length) return <EmptyCatalog />;
  return (
    <div className="grid gap-x-8 gap-y-16 md:grid-cols-12">
      {items.slice(0, 4).map((p, i) => (
        <div key={p.id} className={slots[i]}>
          <ProductCard p={p} sizes="(min-width:768px) 55vw, 100vw" />
        </div>
      ))}
    </div>
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
      <Suspense fallback={<div className="h-[40vh]" />}>
        <Hero />
      </Suspense>

      <section className="mx-auto mt-28 w-full max-w-7xl px-5 md:px-10">
        <div className="mb-10 flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="font-mono text-sm uppercase tracking-widest">Em destaque</h2>
          <Link href="/loja" className="text-sm font-medium hover:text-brand">Ver toda a loja</Link>
        </div>
        <Suspense fallback={<div className="h-96" />}>
          <Featured />
        </Suspense>
      </section>

      <section id="como-e-feito" className="mx-auto mt-40 grid w-full max-w-7xl gap-12 px-5 md:grid-cols-12 md:px-10">
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
      </section>
    </>
  );
}
