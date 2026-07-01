export const metadata = {
  title: "Service Agreement | Callvia",
  description: "The Callvia Service Agreement governing AI receptionist services, billing, cancellation, and client responsibilities.",
};

export default function ServiceAgreementPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <a href="/" className="text-xs tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors duration-200 mb-12 inline-block">
          ← Back to Callvia
        </a>

        <h1 className="text-4xl font-light tracking-tight mb-2" style={{ letterSpacing: "-0.025em" }}>
          Service Agreement
        </h1>
        <p className="text-sm text-white/30 mb-12">Last updated: July 1, 2026</p>

        <div className="space-y-10 text-base leading-relaxed" style={{ color: "#999999" }}>

          <section>
            <p>
              This Service Agreement (the &quot;Agreement&quot;) governs the provision of AI receptionist services by Callvia (&quot;Callvia,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) to the business that subscribes to those services (the &quot;Client,&quot; &quot;you,&quot; or &quot;your&quot;). By subscribing to Callvia and submitting payment, you agree to the terms set out below. The specific monthly rate, any per-minute usage rate, and your service start date are confirmed in writing at the time of sign-up and form part of this Agreement.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">1. Services Provided</h2>
            <p className="mb-4">
              Callvia provides AI-powered receptionist services on behalf of your business. Depending on your configuration, these services include:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Answering inbound calls</li>
              <li>Collecting and confirming caller information</li>
              <li>Identifying the nature and urgency of each request</li>
              <li>Sending call summaries and follow-ups via SMS and/or email</li>
              <li>Optional call routing, transfers, or appointment booking, where enabled</li>
            </ul>
            <p className="mt-4">
              Callvia may add, improve, or modify features over time. We will not materially reduce the core services described above without reasonable notice to you.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">2. Billing &amp; Payment Terms</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>You agree to pay the monthly subscription fee confirmed at sign-up for the services.</li>
              <li>Any additional usage beyond your plan&apos;s included allowance, where applicable, is billed at the per-minute rate confirmed at sign-up.</li>
              <li>Payment is collected upfront and billed automatically at the start of each monthly cycle.</li>
              <li>Payments are processed securely through Stripe. By subscribing, you authorize Callvia to charge your payment method on a recurring basis.</li>
              <li>You are responsible for keeping a valid payment method on file and for any applicable taxes.</li>
            </ul>
            <p className="mt-4 text-white font-medium">
              Failure to complete payment may result in suspension of services until the balance is resolved.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">3. Term &amp; Cancellation</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>This Agreement is month-to-month with no long-term commitment.</li>
              <li>You may cancel at any time by giving at least 7 days&apos; notice before your next billing cycle. To cancel, email <a href="mailto:team@callvia.io" className="text-white hover:text-white/70 transition-colors duration-200 underline underline-offset-4">team@callvia.io</a>.</li>
              <li>Cancellation takes effect at the end of the current paid cycle, and no refunds are provided for partial months after billing.</li>
              <li>Callvia may suspend or terminate services for non-payment or for violation of this Agreement or our <a href="/terms" className="text-white hover:text-white/70 transition-colors duration-200 underline underline-offset-4">Terms &amp; Conditions</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">4. Service Expectations</h2>
            <p className="mb-4">
              Callvia aims to provide reliable, professional AI call handling. To deliver this, the Client is responsible for:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Providing accurate and complete business information</li>
              <li>Keeping call-handling instructions, hours, and routing preferences up to date</li>
              <li>Ensuring any forwarding or phone configuration on your end is correctly set up</li>
              <li>Obtaining any consents required for recording or messaging your callers</li>
            </ul>
            <p className="mt-4">
              Callvia is not liable for missed opportunities or errors resulting from inaccurate, outdated, or incomplete information provided by the Client.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">5. Limitation of Liability</h2>
            <p className="mb-3">
              Callvia services are provided on a commercially reasonable basis and are not a guaranteed substitute for a live human operator in every circumstance. To the maximum extent permitted by law, Callvia is not responsible for:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Lost revenue or business arising from missed, delayed, or misinterpreted calls</li>
              <li>Technical outages, carrier failures, or interruptions beyond our reasonable control</li>
              <li>Indirect, incidental, special, or consequential damages of any kind</li>
            </ul>
            <p className="mt-4">
              In all cases, Callvia&apos;s total liability under this Agreement is limited to the amount you paid for services in the month in which the claim arose.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">6. Confidentiality</h2>
            <p>
              Each party agrees to keep confidential any non-public business information it receives from the other in connection with this Agreement, and to use that information only to provide or receive the services. This obligation does not apply to information that is or becomes public through no fault of the receiving party, or that must be disclosed by law.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">7. Data &amp; Privacy</h2>
            <p>
              Callvia handles caller and business data in accordance with our{" "}
              <a href="/privacy" className="text-white hover:text-white/70 transition-colors duration-200 underline underline-offset-4">
                Privacy Policy
              </a>. You are responsible for ensuring your callers have provided any consent required for the collection, recording, and SMS follow-up described in that policy and in our{" "}
              <a href="/terms" className="text-white hover:text-white/70 transition-colors duration-200 underline underline-offset-4">
                Terms &amp; Conditions
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">8. Agreement Acceptance</h2>
            <p>
              By submitting payment and using the services, you acknowledge that you have read, understood, and agreed to the terms outlined in this Agreement, together with our Terms &amp; Conditions and Privacy Policy. Callvia may update this Agreement from time to time; continued use of the services after an update constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-medium mb-3">9. Contact</h2>
            <p>
              Questions about this Agreement? Reach us at{" "}
              <a href="mailto:team@callvia.io" className="text-white hover:text-white/70 transition-colors duration-200 underline underline-offset-4">
                team@callvia.io
              </a>
              {" "}or visit{" "}
              <a href="https://callvia.io" className="text-white hover:text-white/70 transition-colors duration-200 underline underline-offset-4">
                callvia.io
              </a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
