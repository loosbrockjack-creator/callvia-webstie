// The public, generic copy of the service agreement. It renders from the SAME
// template a client signs, with placeholder values in place of a real client's
// name and prices, so this page can never drift from the contract actually
// being executed.
//
// A client's own executed copy lives at /agreement/<token> and, once signed,
// renders from its immutable snapshot rather than from this template.

import { AgreementBody } from "@/components/agreement/AgreementBody";
import { interpolateSections } from "@/lib/agreement/interpolate";
import { currentTemplate } from "@/lib/agreement/registry";

export const metadata = {
  title: "Service Agreement | Callvia",
  description:
    "The Callvia Service Agreement governing AI receptionist services, billing, cancellation, and client responsibilities.",
};

export default function ServiceAgreementPage() {
  const template = currentTemplate();
  const sections = interpolateSections(template, {
    businessName: "your business",
    contactName: "the signer",
    packageName: "your selected plan",
    monthlyAmount: "the monthly amount stated in Schedule A",
    setupFeeAmount: "the setup fee stated in Schedule A",
    dueTodayAmount: "the amount stated in Schedule A",
    includedMinutes: "the allowance stated in Schedule A",
    overageRate: "the rate stated in Schedule A",
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <a
          href="/"
          className="text-xs tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors duration-200 mb-12 inline-block"
        >
          ← Back to Callvia
        </a>

        <h1 className="text-4xl font-light tracking-tight mb-2" style={{ letterSpacing: "-0.025em" }}>
          Service Agreement
        </h1>
        <p className="text-sm text-white/30 mb-12">Last updated: {template.lastUpdated}</p>

        <p className="text-sm mb-12" style={{ color: "#555555" }}>
          This is the standard form of agreement. The services, fees, and usage terms that apply to a
          specific client are set out in Schedule A of that client&apos;s own agreement.
        </p>

        <AgreementBody sections={sections} />
      </div>
    </main>
  );
}
