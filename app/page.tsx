import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Research } from "@/components/Research";
import { MissedCallTool } from "@/components/MissedCallTool";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { WhoItsFor } from "@/components/WhoItsFor";
import { DemoSection } from "@/components/DemoSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    // Transparent, not bg-black: SiteBackdrop is pinned at z-0 behind this and
    // an opaque main would hide it completely.
    <main className="relative z-10 min-h-[100dvh]">
      <Nav />
      <Hero />
      <Research />
      <MissedCallTool />
      <Features />
      <HowItWorks />
      <WhoItsFor />
      <DemoSection />
      <CTASection />
      <Footer />
    </main>
  );
}
