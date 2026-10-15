"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {links.map((link) => {
        // "/analyses/new" is its own link, so analysis result pages count as "My analyses".
        const active =
          pathname === link.href ||
          (link.href === "/dashboard" && pathname.startsWith("/analyses/") && pathname !== "/analyses/new");
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-[15px] font-semibold transition-colors duration-150",
              active ? "bg-card text-primary" : "text-primary-foreground/85 hover:bg-white/10 hover:text-primary-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
