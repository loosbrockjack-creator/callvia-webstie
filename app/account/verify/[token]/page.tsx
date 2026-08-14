import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ConfirmLogin } from "@/components/account/ConfirmLogin";

export const metadata = {
  title: "Log in | Callvia",
  robots: { index: false, follow: false },
};

// The token is consumed by a POST from ConfirmLogin, not here. This page just
// renders the confirm button (see the component for why the click matters).
export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <div className="bg-black min-h-[100dvh] text-white">
      <Nav />

      <main className="relative pt-28 md:pt-40 pb-16 md:pb-28 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(124,92,252,0.07) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-md mx-auto text-center">
          <p className="text-xs tracking-widest uppercase mb-6" style={{ color: "#7c5cfc" }}>
            Client Login
          </p>
          <h1
            className="text-4xl md:text-5xl font-light tracking-tight leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            One more tap.
          </h1>
          <p className="mt-5 mb-10 text-base leading-relaxed text-muted">
            Confirm it is you to finish logging in to your Callvia account.
          </p>

          <ConfirmLogin token={token} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
