import { CaretLeft } from "@phosphor-icons/react/dist/ssr";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { AuthPaths } from "@/components/ui/auth-paths";

export const metadata = {
  title: "Admin | Callvia",
  robots: { index: false, follow: false },
};

/**
 * Same split auth layout as app/login/page.tsx, reused rather than
 * reinvented: one visual system for "log in to Callvia," whichever door you
 * came through. A few deliberate departures from a literal copy:
 *
 * - A lock icon in the field instead of an email icon: this is a password,
 *   not a magic-link address.
 * - A personal greeting instead of "Log in to your account.": there's one
 *   person who ever sees this page.
 * - Colossians 3:23 in the quote slot instead of the founder line: the
 *   founder quote belongs to the door prospective clients walk through.
 * - Subtext about the dashboard instead of billing.
 */
export default function AdminLoginPage() {
  return (
    <main className="relative lg:grid lg:min-h-[100dvh] lg:grid-cols-2">
      <aside className="relative hidden h-full flex-col justify-between overflow-hidden border-r border-line bg-surface p-10 lg:flex">
        <AuthPaths />

        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent"
          aria-hidden
        />

        <a
          href="/"
          className="relative z-10 w-max text-white font-[200] uppercase"
          style={{ fontSize: "13px", letterSpacing: "0.22em" }}
        >
          Callvia
        </a>

        <blockquote className="relative z-10 max-w-md space-y-4">
          <p className="text-xl font-light leading-relaxed text-white/85 text-pretty">
            &ldquo;Whatever you do, work at it with all your heart, as working
            for the Lord, not for men.&rdquo;
          </p>
          <footer className="font-mono text-xs uppercase tracking-widest text-dim">
            Colossians 3:23
          </footer>
        </blockquote>
      </aside>

      <div className="relative flex min-h-[100dvh] flex-col justify-center px-6 py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(124,92,252,0.07) 0%, transparent 65%)",
          }}
        />

        <a
          href="/"
          className="absolute left-5 top-6 z-10 inline-flex min-h-[44px] items-center gap-1.5 px-2 text-xs uppercase tracking-widest text-white/30 transition-colors duration-200 hover:text-white/60"
        >
          <CaretLeft size={12} weight="bold" />
          Home
        </a>

        <div className="relative z-10 mx-auto w-full max-w-sm">
          <a
            href="/"
            className="mb-8 inline-block text-white font-[200] uppercase lg:hidden"
            style={{ fontSize: "13px", letterSpacing: "0.22em" }}
          >
            Callvia
          </a>

          <h1
            className="text-3xl font-light leading-tight tracking-tight text-white md:text-4xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Welcome back, Mr. Loosbrock.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted text-pretty">
            Sign in to manage clients, agreements, and the Callvia dashboard.
          </p>

          <div className="mt-8">
            <AdminLogin />
          </div>
        </div>
      </div>
    </main>
  );
}
