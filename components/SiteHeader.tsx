import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="SeeFood home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <NavLink href="/">Classify</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <span className="hidden rounded-md px-3 py-2 text-muted/70 sm:block">
            Docs
          </span>
          <span className="ml-2 hidden items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-positive" />
            All systems operational
          </span>
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
