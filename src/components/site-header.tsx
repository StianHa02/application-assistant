import Link from "next/link";

import { logout } from "@/app/actions/auth";
import { NavLinks } from "@/components/nav-links";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

// Teal band. Not sticky: the page has exactly one scroll and nothing pinned to it.
export async function SiteHeader() {
  const user = await getCurrentUser();

  const links = user
    ? [
        { href: "/dashboard", label: "My analyses" },
        { href: "/analyses/new", label: "New analysis" },
        { href: "/settings", label: "Settings" },
      ]
    : [];

  return (
    <div className="bg-primary text-primary-foreground">
      <header className="mx-auto flex min-h-20 max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link href={user ? "/dashboard" : "/"} className="font-display text-xl font-extrabold tracking-tight">
            Application Assistant
          </Link>
          {links.length > 0 && <NavLinks links={links} />}
        </div>

        {user ? (
          <form action={logout}>
            <Button type="submit" variant="secondary">
              Log out
            </Button>
          </form>
        ) : (
          <Link href="/login" className={buttonVariants({ variant: "secondary" })}>
            Log in
          </Link>
        )}
      </header>
    </div>
  );
}
