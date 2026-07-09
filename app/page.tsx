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
    <main className="bg-black min-h-screen">
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
