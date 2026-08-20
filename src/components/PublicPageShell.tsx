import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

function Logo({ size = 34 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-[9px] bg-[var(--ink)] text-white font-black"
      style={{ width: size, height: size, fontSize: size * 0.42, fontFamily: "var(--font-display)" }}
    >
      IF
    </div>
  );
}

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-[var(--paper)]/85 border-b border-black/5">
      <div className="max-w-[1120px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={34} />
          <span className="font-black tracking-tight text-lg">IntellectFlow</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/auth" className="inline-flex items-center rounded-full bg-white border border-black/10 shadow-sm px-4 py-2 text-sm font-bold hover:shadow-md transition">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-black/10 mt-8">
      <div className="max-w-[1120px] mx-auto px-4 md:px-6 py-10 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="font-black tracking-tight">IntellectFlow</span>
        </div>
        <div className="eyebrow text-zinc-400">© {new Date().getFullYear()} IntellectFlow.in — All rights reserved</div>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold text-zinc-500">
          <Link to="/about-us" className="hover:text-[var(--ink)]">About Us</Link>
          <Link to="/contact-us" className="hover:text-[var(--ink)]">Contact Us</Link>
          <Link to="/privacy-policy" className="hover:text-[var(--ink)]">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-[var(--ink)]">Terms of Service</Link>
          <Link to="/refund-policy" className="hover:text-[var(--ink)]">Refund &amp; Cancellation</Link>
        </div>
      </div>
    </footer>
  );
}

/** Shared shell for legal/info pages — ticket-card container on paper background. */
export function LegalPageShell({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
      <PublicHeader />
      <main className="max-w-[760px] mx-auto px-4 md:px-6 py-14 md:py-20">
        <div className="eyebrow text-[var(--brass-deep)]">{eyebrow}</div>
        <h1 className="mt-2 font-black tracking-[-0.03em] text-3xl md:text-5xl leading-[1.05]">{title}</h1>
        {updated && <p className="mt-3 text-sm text-zinc-500 font-mono-brand">Last updated: {updated}</p>}
        <div className="ticket-card mt-8 p-6 md:p-9 space-y-6 text-[15px] leading-relaxed text-zinc-700 [&_h2]:font-black [&_h2]:text-lg [&_h2]:text-[var(--ink)] [&_h2]:mt-8 [&_h2]:mb-2 [&_h2:first-child]:mt-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:font-semibold [&_a]:text-[var(--ink)] [&_a]:underline">
          {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
