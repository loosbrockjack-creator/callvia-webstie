import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AboutContent } from "@/components/AboutContent";

export const metadata = {
  title: "About | Callvia",
  description:
    "Callvia is an AI receptionist for businesses that live by the phone. We answer every call, capture every lead, and hand you the work that needs a human.",
};

export default function AboutPage() {
  return (
    <div className="relative z-10 min-h-[100dvh]">
      <Nav />
      <AboutContent />
      <Footer />
    </div>
  );
}
