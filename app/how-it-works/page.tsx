import { Nav } from "@/components/Nav";
import { HowItWorks } from "@/components/HowItWorks";
import { WhoItsFor } from "@/components/WhoItsFor";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "How It Works | Callvia",
  description:
    "How Callvia gets set up, answers every call you want it to, and hands you the lead. Built for HVAC, plumbing, electrical, and general contractors.",
};

export default function HowItWorksPage() {
  return (
    <main className="bg-black min-h-screen pt-16">
      <Nav />
      <HowItWorks />
      <WhoItsFor />
      <CTASection />
      <Footer />
    </main>
  );
}
