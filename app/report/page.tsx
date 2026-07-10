import { Suspense } from "react";
import { ReportView } from "@/components/ReportView";

export const metadata = {
  title: "Your Missed-Call Report | Callvia",
  description: "A personalized estimate of what missed calls cost your business every month.",
  robots: { index: false, follow: false },
};

export default function ReportPage() {
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
          <ReportView />
        </Suspense>
      </div>
    </main>
  );
}
