import { OnboardingForm } from "@/components/OnboardingForm";

export const metadata = {
  title: "Get Set Up | Callvia",
  description: "Complete your Callvia setup.",
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-xl mx-auto px-6 py-24">
        <a
          href="/"
          className="text-xs tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors duration-200 mb-12 inline-block"
        >
          Callvia
        </a>

        <h1 className="text-4xl font-light tracking-tight mb-3" style={{ letterSpacing: "-0.025em" }}>
          Let&#39;s get you set up.
        </h1>
        <p className="text-base leading-relaxed mb-12" style={{ color: "#888888" }}>
          A few details and you&#39;re done. After this you&#39;ll be taken straight to secure payment, and we&#39;ll reach out to build your receptionist.
        </p>

        <OnboardingForm />
      </div>
    </main>
  );
}
