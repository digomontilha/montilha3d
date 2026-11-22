import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Gallery } from "@/components/Gallery";
import { cartLink, formatPrice, getProduct } from "@/lib/products";
import { INSTAGRAM, WHATSAPP } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  const description = p.description.replace(/\s+/g, " ").trim().slice(0, 160) || `${p.name} no catálogo da Montilha 3D.`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/produto/${p.slug}` },
    openGraph: { title: p.name, description, images: p.images.slice(0, 1), url: `/produto/${p.slug}` },
  };
}

async function Detail({ params }: { params: PageProps<"/produto/[slug]">["params"] }) {
  const p = await getProduct((await params).slug); // só produtos ativos; inativo dá 404 como antes
  if (!p) notFound();
  const price = formatPrice(p.price_cents);
  const host = p.buy_url && new URL(p.buy_url).hostname.replace(/^www\./, "");
  // Sem variações sincronizadas (produto cadastrado à mão): um botão para o link de compra, como antes.
  const buys = p.variants?.length ? p.variants : [{ id: 0, label: "" }];
  // Dados estruturados: o Google pode mostrar foto, preço e "em estoque" no resultado da busca.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.images,
    description: p.description.slice(0, 5000),
    brand: { "@type": "Brand", name: "Montilha 3D" },
    ...(p.price_cents != null && p.buy_url
      ? {
          offers: {
            "@type": "Offer",
            url: `https://montilha3d.com.br/produto/${p.slug}`,
            priceCurrency: "BRL",
            price: (p.price_cents / 100).toFixed(2),
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "Montilha 3D" },
          },
        }
      : {}),
  };
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="md:col-span-7">
        <Gallery images={p.images} name={p.name} />
      </div>
      <div className="md:col-span-5 md:sticky md:top-8 md:self-start">
        {p.category && <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted">{p.category}</p>}
        <h1 className="font-display text-[clamp(2.25rem,4.2vw,3.5rem)] leading-[1.05] [text-wrap:balance]">{p.name}</h1>
        <p id="situacao" className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          {price && <span className="text-4xl font-bold text-brand">{price}</span>}
          {!p.buy_url && (
            <span className="rounded-full bg-amber-100 px-4 py-1.5 text-lg font-semibold text-amber-900 ring-1 ring-amber-800/30">Em breve</span>
          )}
        </p>

        {p.buy_url ? (
          <div className="mt-8">
            {buys.length > 1 && <p className="mb-3 font-medium">Escolha a opção:</p>}
            <div className="flex flex-wrap gap-3">
              {buys.map((v) => (
                <a
                  key={v.id}
                  href={v.id ? cartLink(p.buy_url!, v.id) : p.buy_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta w-full bg-brand text-white hover:bg-foreground sm:w-auto"
                >
                  {v.label ? `Comprar ${v.label}` : "Comprar"}
                  <span className="sr-only"> (abre o carrinho em nova aba)</span>
                  <span aria-hidden>↗</span>
                </a>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted">O produto vai direto para o carrinho em {host} para concluir a compra.</p>
          </div>
        ) : (
          <p className="mt-3 text-muted">
            A compra desta peça ainda não está aberta. Quer saber quando abrir?{" "}
            <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline underline-offset-4 hover:no-underline">
              Fale com a gente no Instagram {INSTAGRAM.handle}<span className="sr-only"> (abre em nova aba)</span>
            </a>
          </p>
        )}

        <div className="mt-8 rounded-md border border-line p-5">
          <p className="font-semibold">Quer em outra cor, tamanho, quantidade ou um preço especial?</p>
          <p className="mt-1 text-sm text-muted">Fale com a gente no WhatsApp. A mensagem já vai com o nome desta peça.</p>
          <a
            href={WHATSAPP.link(`Olá! Vi no site o produto "${p.name}" (https://montilha3d.com.br/produto/${p.slug}) e queria fazer um pedido personalizado / orçamento.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border-2 border-brand px-6 font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
          >
            Pedido personalizado no WhatsApp<span className="sr-only"> (abre em nova aba)</span>
            <span aria-hidden>↗</span>
          </a>
        </div>

        {p.description && (
          <section aria-labelledby="sobre" className="mt-10 border-t border-line pt-8">
            <h2 id="sobre" className="text-xl font-semibold">Sobre a peça e o que vem nela</h2>
            <p className="mt-3 whitespace-pre-line text-[1.05rem] leading-relaxed">{p.description.replace(/\r\n/g, "\n")}</p>
          </section>
        )}
      </div>
    </div>
  );
}

export default function Produto({ params }: PageProps<"/produto/[slug]">) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-6 md:px-10 md:pt-8">
      <Link href="/loja" className="mb-6 inline-flex min-h-11 items-center gap-2 font-medium text-brand hover:underline">
        <span aria-hidden>←</span> Voltar ao catálogo
      </Link>
      <Suspense fallback={<div className="h-screen" />}>
        <Detail params={params} />
      </Suspense>
    </section>
  );
}
