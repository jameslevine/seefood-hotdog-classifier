import Link from "next/link";
import { Logo } from "./Logo";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export async function SiteHeader() {
  const user = await getSession();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="SeeFood home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <NavLink href="/app">Classify</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/api-access">API</NavLink>
          {user && <NavLink href="/keys">Keys</NavLink>}
          {user ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="ml-2 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-muted transition-colors hover:bg-background hover:text-foreground"
    >
      {children}
    </Link>
  );
}
