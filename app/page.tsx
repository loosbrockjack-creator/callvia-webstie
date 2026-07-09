import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { MissedCallsTeaser } from "@/components/MissedCallsTeaser";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-black min-h-screen">
      <Nav />
      <Hero />
      <Features />
      <MissedCallsTeaser />
      <CTASection />
      <Footer />
    </main>
  );
}
