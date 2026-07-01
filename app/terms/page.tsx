export const metadata = {
  title: "Terms & Conditions | Callvia",
  description: "Terms and Conditions for Callvia services including SMS communications.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <a href="/" className="text-xs tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors duration-200 mb-12 inline-block">
          ← Back to Callvia
        </a>

        <h1 className="text-4xl font-light tracking-tight mb-2" style={{ letterSpacing: "-0.025em" }}>
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-white/30 mb-12">Last updated: June 10, 2026</p>

        <div className="space-y-10 text-base leading-relaxed" style={{ color: "#999999" }}>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using any service provided by Callvia (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), including our AI receptionist platform and SMS communication services, you agree to be bound by these Terms &amp; Conditions. If you do not agree, do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">2. Description of Services</h2>
            <p>
              Callvia provides an AI-powered receptionist service that answers inbound phone calls on behalf of businesses, captures lead and customer information, and delivers follow-up communications via SMS text message. Our services are intended for small businesses, trade contractors, and service providers.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">3. SMS Communications &amp; Consent</h2>
            <p className="mb-4">
              By providing your phone number to a business using Callvia, or by otherwise consenting to receive SMS messages, you agree to receive text messages from that business via the Callvia platform. These messages may include appointment confirmations, service follow-ups, lead capture confirmations, and other business-related communications.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Message frequency varies based on your interactions with the business.</li>
              <li>Message and data rates may apply depending on your mobile carrier and plan.</li>
              <li>To opt out of SMS messages at any time, reply <strong className="text-white">STOP</strong> to any message you receive.</li>
              <li>To request help or more information, reply <strong className="text-white">HELP</strong> to any message.</li>
              <li>Carriers are not liable for delayed or undelivered messages.</li>
              <li>Consent to receive SMS is not a condition of purchasing any goods or services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">4. Business Use</h2>
            <p>
              Businesses that subscribe to Callvia agree to use the platform solely for lawful communications with their own customers and leads who have provided consent. Businesses may not use Callvia to send unsolicited messages, spam, or messages unrelated to their offered services. Businesses are responsible for ensuring all contacts have provided appropriate consent prior to receiving SMS communications through the Callvia platform.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">5. Prohibited Uses</h2>
            <p className="mb-3">You agree not to use Callvia services to:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Send unsolicited commercial messages or spam</li>
              <li>Violate any applicable law or regulation, including the Telephone Consumer Protection Act (TCPA)</li>
              <li>Harass, threaten, or harm any individual</li>
              <li>Transmit false, misleading, or fraudulent information</li>
              <li>Infringe on any third-party intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">6. Intellectual Property</h2>
            <p>
              All content, branding, software, and technology provided by Callvia is the exclusive property of Callvia and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">7. Disclaimers &amp; Limitation of Liability</h2>
            <p className="mb-3">
              Callvia services are provided &quot;as is&quot; without warranty of any kind. We do not guarantee uninterrupted service, error-free operation, or that all calls will be answered or captured under all circumstances.
            </p>
            <p>
              To the maximum extent permitted by law, Callvia shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services, even if advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">8. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Minnesota, United States, without regard to its conflict of law principles. Any disputes arising from these Terms shall be resolved in the courts located in Minnesota.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">9. Changes to These Terms</h2>
            <p>
              We reserve the right to update these Terms at any time. Continued use of our services after changes are posted constitutes your acceptance of the revised Terms. We will make reasonable efforts to notify users of material changes.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">10. Contact</h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a href="mailto:team@callvia.io" className="text-white hover:text-white/70 transition-colors duration-200 underline underline-offset-4">
                team@callvia.io
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
