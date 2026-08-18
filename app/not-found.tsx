import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Page not found | Callvia",
  robots: { index: false, follow: true },
};

// Routes worth offering instead of a bare "go home". Anyone who lands here from
// a stale link is usually after one of these.
const ELSEWHERE = [
  { href: "/", label: "Home" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/build", label: "Build my receptionist" },
  { href: "/login", label: "Client login" },
];

export default function NotFound() {
  return (
    <main className="relative z-10 min-h-[100dvh] flex flex-col">
      <Nav />

      <section className="flex flex-1 items-center px-6 pt-32 pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs tracking-widest uppercase mb-5 text-dim tabular-nums">404</p>

          <h1
            className="text-4xl md:text-5xl font-light text-white tracking-tight leading-tight max-w-xl text-balance"
            style={{ letterSpacing: "-0.02em" }}
          >
            That page isn&#39;t here.
          </h1>

          <p className="mt-5 text-base max-w-md leading-relaxed text-muted text-pretty">
            The link may be out of date, or the address may have a typo in it. Your
            phones are still being answered.
          </p>

          <nav aria-label="Suggested pages" className="mt-12 border-t border-white/8">
            {ELSEWHERE.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-[44px] items-center gap-6 border-b border-white/5 py-6 transition-colors duration-200"
              >
                <span className="text-xs font-mono w-5 shrink-0 text-faint tabular-nums">
                  0{i + 1}
                </span>
                <span
                  className="text-2xl md:text-3xl font-light tracking-tight text-white/70 transition-colors duration-200 group-hover:text-white"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {item.label}
                </span>
                <span
                  className="ml-auto text-dim transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                >
                  &#8594;
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <Footer />
    </main>
  );
}
