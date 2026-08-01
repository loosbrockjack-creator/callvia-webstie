import { notFound } from "next/navigation";
import { findOnboardingByToken } from "@/lib/onboarding/queries";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export const metadata = {
  title: "Set up your Callvia receptionist",
  robots: { index: false, follow: false },
};

// Never cached: the content depends on a private token and on live status.
export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="mb-12 text-xs uppercase tracking-widest" style={{ color: "#555555" }}>
          Callvia
        </p>
        {children}
      </div>
    </main>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <Shell>
      <h1
        className="mb-4 text-3xl font-light tracking-tight"
        style={{ letterSpacing: "-0.025em" }}
      >
        {title}
      </h1>
      <p className="text-base leading-relaxed" style={{ color: "#999999" }}>
        {body}
      </p>
    </Shell>
  );
}

export default async function OnboardingPage(props: PageProps<"/onboarding/[token]">) {
  const { token } = await props.params;

  const row = await findOnboardingByToken(token);
  // A bad token gets a plain 404, with no hint about whether it ever existed.
  if (!row) notFound();

  if (row.status === "void") {
    return (
      <Notice
        title="This form is no longer active."
        body="If you think this is a mistake, email team@callvia.io and we will send you a new one."
      />
    );
  }

  if (row.status === "submitted") {
    return (
      <Notice
        title="You already sent this in."
        body="We have your answers and we are building your receptionist. If something needs changing, just reply to the email we sent you."
      />
    );
  }

  // Expiry is checked here rather than trusted from a sweep, matching how
  // agreement links are handled.
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return (
      <Notice
        title="This link has expired."
        body="Email team@callvia.io and we will send you a fresh one."
      />
    );
  }

  return (
    <Shell>
      <h1
        className="mb-3 text-3xl font-light tracking-tight md:text-4xl"
        style={{ letterSpacing: "-0.025em" }}
      >
        Let&#39;s build your receptionist.
      </h1>
      <p className="mb-14 text-base leading-relaxed" style={{ color: "#999999" }}>
        A few questions about how you want your calls handled. Takes about three minutes, and
        there are no wrong answers.
      </p>

      <OnboardingFlow
        token={token}
        businessName={row.business_name}
        contactName={row.contact_name}
      />
    </Shell>
  );
}
