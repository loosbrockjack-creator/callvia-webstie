import { Suspense } from "react";
import { BuildFunnel } from "@/components/BuildFunnel";

export const metadata = {
  title: "Build My Receptionist | Callvia",
  description:
    "Tell us about your business and we build your AI receptionist: see your pain points diagnosed, your missed-call cost, and get a personalized demo.",
};

export default function BuildPage() {
  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-14 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <a
            href="/"
            className="text-xs tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors duration-200"
          >
            Callvia
          </a>
          <span className="text-xs text-white/30">
            Everyone gets a free trial. If it doesn&#39;t pay for itself, you walk away.
          </span>
        </div>

        <Suspense fallback={null}>
          <BuildFunnel />
        </Suspense>
      </div>
    </main>
  );
}
