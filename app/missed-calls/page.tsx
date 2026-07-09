import { Nav } from "@/components/Nav";
import { Research } from "@/components/Research";
import { MissedCallTool } from "@/components/MissedCallTool";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "The Cost of a Missed Call | Callvia",
  description:
    "Sourced industry research on what unanswered calls cost contractors, plus a free tool that estimates what your line is losing every month.",
};

export default function MissedCallsPage() {
  return (
    <main className="bg-black min-h-screen pt-16">
      <Nav />
      <Research />
      <MissedCallTool />
      <CTASection />
      <Footer />
    </main>
  );
}
