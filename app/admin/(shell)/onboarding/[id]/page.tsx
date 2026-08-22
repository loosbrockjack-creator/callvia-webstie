import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/require-admin";
import { findOnboardingById } from "@/lib/onboarding/queries";
import { ONBOARDING_QUESTIONS, QUESTION_LABELS } from "@/lib/onboarding/questions";
import { BentoCell, BentoGrid, EmptyState, PanelHeader } from "@/components/admin/ui/bento";
import { Badge } from "@/components/admin/ui/Badge";

export const metadata = {
  title: "Onboarding submission | Callvia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: Parameters<typeof Badge>[0]["tone"] }> = {
  sent: { label: "Sent", tone: "info" },
  viewed: { label: "Opened", tone: "accent" },
  submitted: { label: "Submitted", tone: "success" },
  void: { label: "Void", tone: "neutral" },
};

function when(v: Date | null): string {
  if (!v) return "—";
  return new Date(v).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="shrink-0 text-xs uppercase tracking-widest text-dim sm:w-44">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-white">{value}</dd>
    </div>
  );
}

export default async function OnboardingDetailPage(
  props: PageProps<"/admin/onboarding/[id]">,
) {
  await requireAdminPage();
  const { id } = await props.params;

  const row = await findOnboardingById(id);
  if (!row) notFound();

  const answers = row.answers ?? {};

  // Rendered in the order the client saw the questions, not in object key
  // order, so this page reads like the form they filled in.
  const ordered = ONBOARDING_QUESTIONS.flatMap((q) =>
    q.fields ? q.fields.map((f) => f.id) : [q.id],
  ).filter((qid) => answers[qid] !== undefined);

  const status = STATUS[row.status] ?? STATUS.sent;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <Link
        href="/admin/onboarding"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
      >
        <ArrowLeft size={14} /> All onboarding forms
      </Link>

      <BentoGrid className="lg:grid-cols-3">
        <BentoCell className="lg:col-span-2">
          <PanelHeader
            title={row.business_name ?? row.contact_name ?? row.email}
            subtitle="What they told us about how to handle their calls."
            trend={
              <span className="flex flex-wrap items-center gap-2">
                <Badge tone={status.tone}>{status.label}</Badge>
                {row.archived_at && <Badge tone="neutral">Archived</Badge>}
              </span>
            }
          />

          {ordered.length === 0 ? (
            <EmptyState
              title="No answers yet."
              hint="They have not submitted the form. Resend it from the list if they need a nudge."
            />
          ) : (
            <dl>
              {ordered.map((qid) => {
                const v = answers[qid];
                return (
                  <Field
                    key={qid}
                    label={QUESTION_LABELS[qid] ?? qid}
                    value={
                      Array.isArray(v) ? (
                        <ul className="flex flex-col gap-1">
                          {v.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="whitespace-pre-wrap">{v}</span>
                      )
                    }
                  />
                );
              })}
            </dl>
          )}
        </BentoCell>

        <BentoCell>
          <PanelHeader title="Record" subtitle="Delivery and audit." />
          <dl>
            <Field label="Email" value={row.email} />
            <Field label="Contact" value={row.contact_name ?? "—"} />
            <Field
              label="Client record"
              value={
                row.client_id ? (
                  <Link
                    href={`/admin/clients/${row.client_id}`}
                    className="text-accent-hover hover:underline"
                  >
                    Linked
                  </Link>
                ) : (
                  <span className="text-dim">Not linked</span>
                )
              }
            />
            <Field label="Sent" value={when(row.sent_at)} />
            <Field label="First opened" value={when(row.first_viewed_at)} />
            <Field label="Views" value={String(row.view_count)} />
            <Field label="Submitted" value={when(row.submitted_at)} />
            <Field label="IP" value={row.submitted_ip ?? "—"} />
            <Field label="Link ending" value={row.token_last4} />
          </dl>
        </BentoCell>
      </BentoGrid>
    </div>
  );
}
