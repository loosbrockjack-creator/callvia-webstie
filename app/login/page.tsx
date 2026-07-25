import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BillingLoginForm } from "@/components/BillingLoginForm";

export const metadata = {
  title: "Login | Callvia",
  description: "Existing Callvia clients: get a secure link to manage your billing, payment method, and plan.",
};

export default function LoginPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Nav />

      <main className="relative pt-40 pb-28 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(124,92,252,0.07) 0%, transparent 60%)",
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
              Manage your billing.
            </h1>
            <p className="mt-5 text-base leading-relaxed" style={{ color: "#888888" }}>
              Update your payment method, view invoices, or change your plan. Enter your account email and we will send you a secure link.
            </p>
          </div>

          <BillingLoginForm />

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
