import { Suspense } from "react";
import { BuildFunnel } from "@/components/BuildFunnel";

export const metadata = {
  title: "Build My Receptionist | Callvia",
  description:
    "Tell us about your business and we build your AI receptionist: see your pain points diagnosed, your missed-call cost, and get a personalized demo.",
};

export default function BuildPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <a
          href="/"
          className="text-xs tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors duration-200 mb-14 inline-block"
        >
          Callvia
        </a>

        <Suspense fallback={null}>
          <BuildFunnel />
        </Suspense>
      </div>
    </main>
  );
}
