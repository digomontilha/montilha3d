import type { Metadata } from "next";
import { Exo_2, Figtree, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const serif = Source_Serif_4({ variable: "--font-serif", subsets: ["latin"], weight: ["600"] });
const sans = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const exo = Exo_2({ variable: "--font-exo", subsets: ["latin"], weight: ["700"] });

const description = "Produtos 3D para decorar e presentear: enfeites e peças decorativas com fotos reais, preço e o que vem em cada item.";

export const metadata: Metadata = {
  metadataBase: new URL("https://montilha3d.com.br"),
  title: { default: "Montilha 3D · Produtos 3D para decorar e presentear", template: "%s · Montilha 3D" },
  description,
  openGraph: { siteName: "Montilha 3D", locale: "pt_BR", type: "website", description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable} ${exo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
