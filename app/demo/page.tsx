import { Nav } from "@/components/Nav";
import { DemoSection } from "@/components/DemoSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Live Demo | Callvia",
  description:
    "Call a live Callvia receptionist right now and hear exactly what your customers would experience. No signup required.",
};

export default function DemoPage() {
  return (
    <main className="bg-black min-h-screen pt-16">
      <Nav />
      <DemoSection />
      <CTASection />
      <Footer />
    </main>
  );
}
