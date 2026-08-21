import { CaretLeft } from "@phosphor-icons/react/dist/ssr";

import { LoginForm } from "@/components/LoginForm";
import { AuthPaths } from "@/components/ui/auth-paths";

export const metadata = {
  title: "Login | Callvia",
  description: "Log in to your Callvia account to manage your plan, billing, and payment method.",
};

/**
 * Split auth layout, adapted from a 21st.dev AuthPage component.
 *
 * Two deliberate departures from the reference.
 *
 * It has no Continue with Google / Apple / GitHub buttons. Callvia accounts are
 * magic link only, so those would be three buttons that cannot do anything.
 * Everything below the heading is the one sign-in route that actually exists.
 *
 * And the brand panel carries the founder's own line rather than the
 * reference's customer testimonial. There are no customers to quote yet, and
 * inventing one on the login page is not a thing worth doing for a decoration.
 *
 * The site nav and footer are gone from this page: it is a full-height auth
 * screen, and the back link top-left is the way out, which is what the
 * reference does too.
 */
export default function LoginPage() {
  return (
    <main className="relative lg:grid lg:min-h-[100dvh] lg:grid-cols-2">
      {/* Brand panel. Desktop only: on a phone it would be a screen of
          decoration standing between someone and the thing they came to do. */}
      <aside className="relative hidden h-full flex-col justify-between overflow-hidden border-r border-line bg-surface p-10 lg:flex">
        <AuthPaths />

        {/* Keeps the quote legible where the line field runs behind it. */}
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
            &ldquo;I built this because my uncle kept losing jobs to a ringing
            phone.&rdquo;
          </p>
          <footer className="font-mono text-xs uppercase tracking-widest text-dim">
            Jack Loosbrock, Founder
          </footer>
        </blockquote>
      </aside>

      {/* Form panel */}
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
          {/* The wordmark only appears here where the brand panel is hidden. */}
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
            Log in to your account.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted text-pretty">
            View your plan, manage billing, and update your payment method.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="mt-8 text-sm text-dim">
            New to Callvia?{" "}
            <a
              href="/build"
              className="text-accent underline underline-offset-4 transition-colors duration-200 hover:text-accent-hover"
            >
              Build your receptionist
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
