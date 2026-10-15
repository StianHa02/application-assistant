import Link from "next/link";

import { logout } from "@/app/actions/auth";
import { LanguageSwitch } from "@/components/language-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";

// Sticky header in the style of echo.uib.no: card background, bottom border, max-w-7xl container,
// logo + navigation on the left, theme toggle and a yellow login button on the right.
export async function SiteHeader() {
  const [{ t }, user] = await Promise.all([getI18n(), getCurrentUser()]);

  const links = user
    ? [
        { href: "/dashboard", label: t.nav.dashboard },
        { href: "/analyses/new", label: t.nav.newAnalysis },
        { href: "/settings", label: t.nav.settings },
      ]
    : [{ href: "/", label: t.nav.home }];

  return (
    <div className="sticky top-0 z-20 border-b bg-card">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2">
        <div className="flex items-center gap-6">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-lg font-bold">
            <span aria-hidden className="grid size-9 place-items-center rounded-lg border border-primary-dark bg-primary text-sm text-primary-foreground">
              SA
            </span>
            <span className="hidden sm:inline">{t.appName}</span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-semibold transition-colors duration-300 hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitch />
          <ThemeToggle />
          {user ? (
            <form action={logout} className="flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground md:inline">{user.name}</span>
              <Button type="submit" variant="outline" size="sm">
                {t.nav.logout}
              </Button>
            </form>
          ) : (
            <Link href="/login" className={buttonVariants({ variant: "secondary" })}>
              {t.nav.login}
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}
