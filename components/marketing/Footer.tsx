import Link from "next/link";

const links = [
  { label: "Product", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Sign in", href: "/signin" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 px-4 py-12 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              C
            </span>
            Cortexly
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Premium content management & sharing.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Cortexly. Crafted for clarity.
      </p>
    </footer>
  );
}
