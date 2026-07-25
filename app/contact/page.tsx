import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { BOOKING_URL } from "@/lib/site";

export const metadata = {
  title: "Contact | Callvia",
  description: "Get in touch with Callvia. Send us a message or book a quick call. We reply fast.",
};

export default function ContactPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Nav />

      <main className="relative pt-40 pb-28 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 50% 0%, rgba(124,92,252,0.07) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase mb-6" style={{ color: "#7c5cfc" }}>
              Contact
            </p>
            <h1
              className="text-4xl md:text-5xl font-light tracking-tight leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Let's talk.
            </h1>
            <p className="mt-5 text-base leading-relaxed max-w-md mx-auto" style={{ color: "#888888" }}>
              Questions about pricing, setup, or whether Callvia fits your business? Send a note and we will get right back to you.
            </p>
          </div>

          <ContactForm />

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a
              href="mailto:team@callvia.io"
              className="text-white/60 hover:text-white transition-colors duration-200"
            >
              team@callvia.io
            </a>
            <span className="hidden sm:inline text-[#333333]">·</span>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover transition-colors duration-200"
            >
              Book a 15-minute call
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
