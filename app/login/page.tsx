import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LoginForm } from "@/components/LoginForm";

export const metadata = {
  title: "Login | Callvia",
  description: "Log in to your Callvia account to manage your plan, billing, and payment method.",
};

export default function LoginPage() {
  return (
    <div className="relative z-10 min-h-[100dvh] text-white">
      <Nav />

      <main className="relative pt-28 md:pt-40 pb-16 md:pb-28 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(124,92,252,0.04) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-md mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs tracking-widest uppercase mb-6" style={{ color: "#7c5cfc" }}>
              Client Login
            </p>
            <h1
              className="text-4xl md:text-5xl font-light tracking-tight leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Log in to your account.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted">
              View your plan, manage billing, and update your payment method. Enter your account email and we will send you a secure login link.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-sm" style={{ color: "#666666" }}>
            New to Callvia?{" "}
            <a href="/build" className="text-accent hover:text-accent-hover transition-colors duration-200">
              Build your receptionist
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
