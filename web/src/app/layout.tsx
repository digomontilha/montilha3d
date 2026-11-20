import type { Metadata } from "next";
import { Archivo, Exo_2, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });
const exo = Exo_2({ variable: "--font-exo", subsets: ["latin"], weight: ["700"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://montilha3d.com.br"),
  title: { default: "Montilha 3D", template: "%s · Montilha 3D" },
  description: "Peças impressas em 3D, feitas camada por camada.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${plexMono.variable} ${exo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
