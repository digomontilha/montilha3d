"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Início", hide: true }, // abaixo de 640px a logo leva ao início (falta largura em 360px)
  { href: "/loja", label: "Catálogo" },
  { href: "/#contato", label: "Contato" },
];

export const NavLinks = () => <NavList path={usePathname()} />;

// Sem hook: serve de fallback estático enquanto o caminho não chega (prerender).
export function NavList({ path }: { path: string }) {
  const current = (href: string) => (href === "/" ? path === "/" : href !== "/#contato" && path.startsWith(href)) || (href === "/loja" && path.startsWith("/produto"));
  return (
    <ul className="flex items-center gap-4 sm:gap-9">
      {links.map(({ href, label, hide }) => (
        <li key={href} className={hide ? "hidden sm:block" : undefined}>
          <Link
            href={href}
            aria-current={current(href) ? "page" : undefined}
            className="block border-b-2 border-transparent py-2 text-[0.95rem] font-medium hover:text-brand aria-[current=page]:border-brand aria-[current=page]:text-brand sm:text-base"
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
