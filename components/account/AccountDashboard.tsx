"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Plan {
  id: string;
  packageName: string;
  packageSummary: string | null;
  status: string;
  statusLabel: string;
  monthly: string | null;
  setupFee: string | null;
  hasPdf: boolean;
  includedItems: string[];
}

interface AgreementRow {
  id: string;
  packageName: string;
  statusLabel: string;
  createdAt: string;
  hasPdf: boolean;
}

interface InvoiceRow {
  id: string;
  number: string | null;
  status: string | null;
  amount: string;
  created: string;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

interface Props {
  profile: { businessName: string; contactName: string; email: string; phone: string | null };
  hasStripeCustomer: boolean;
  plan: Plan | null;
  agreements: AgreementRow[];
  invoices: InvoiceRow[];
}

const CARD = { background: "#0d0d0d", borderColor: "#1f1f1f" } as const;
const INPUT_STYLE = { background: "#000000", borderColor: "#1f1f1f" } as const;
const INPUT_CLASS =
  "w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function AccountDashboard({ profile, hasStripeCustomer, plan, agreements, invoices }: Props) {
  return (
    <main className="relative pt-32 pb-28 px-6 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 50% 30% at 50% 0%, rgba(124,92,252,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start justify-between gap-4 mb-12"
        >
          <div>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#7c5cfc" }}>
              Your account
            </p>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight" style={{ letterSpacing: "-0.03em" }}>
              {profile.businessName}
            </h1>
          </div>
          <LogoutButton />
        </motion.div>

        <div className="flex flex-col gap-6">
          <PlanCard plan={plan} hasStripeCustomer={hasStripeCustomer} />
          <ProfileCard profile={profile} />
          <InvoicesCard invoices={invoices} hasStripeCustomer={hasStripeCustomer} />
          <HistoryCard agreements={agreements} />
        </div>
      </div>
    </main>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-6 md:p-8" style={CARD}>
      <h2 className="text-xs tracking-widest uppercase mb-6" style={{ color: "#555555" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function PlanCard({ plan, hasStripeCustomer }: { plan: Plan | null; hasStripeCustomer: boolean }) {
  return (
    <SectionCard title="Current plan">
      {plan ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xl font-light text-white">{plan.packageName}</p>
              {plan.packageSummary && (
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "#888888" }}>
                  {plan.packageSummary}
                </p>
              )}
            </div>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs"
              style={{
                background: plan.status === "active" ? "rgba(124,92,252,0.12)" : "rgba(255,255,255,0.05)",
                border: plan.status === "active" ? "1px solid rgba(124,92,252,0.4)" : "1px solid #1f1f1f",
                color: plan.status === "active" ? "#a48bff" : "#888888",
              }}
            >
              {plan.statusLabel}
            </span>
          </div>

          <div className="flex gap-8 text-sm">
            {plan.monthly && (
              <div>
                <p style={{ color: "#555555" }}>Monthly</p>
                <p className="mt-1 text-white text-base">{plan.monthly}</p>
              </div>
            )}
            {plan.setupFee && (
              <div>
                <p style={{ color: "#555555" }}>Setup fee</p>
                <p className="mt-1 text-white text-base">{plan.setupFee}</p>
              </div>
            )}
          </div>

          {plan.includedItems.length > 0 && (
            <ul className="flex flex-col gap-2">
              {plan.includedItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#aaaaaa" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent mt-0.5 shrink-0">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {hasStripeCustomer && <ManageBillingButton />}
            {plan.hasPdf && (
              <a
                href={`/api/account/agreements/${plan.id}/pdf`}
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full border transition-colors duration-200 hover:bg-white/5"
                style={{ borderColor: "#1f1f1f", color: "#cccccc" }}
              >
                Download signed agreement
              </a>
            )}
          </div>

          {!hasStripeCustomer && (
            <p className="text-xs leading-relaxed" style={{ color: "#555555" }}>
              Billing management unlocks once your first payment is on file.
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>
          You do not have an agreement yet. Once we send one and you sign it, your plan details will show up here.
        </p>
      )}
    </SectionCard>
  );
}

function ProfileCard({
  profile,
}: {
  profile: { businessName: string; contactName: string; email: string; phone: string | null };
}) {
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [contactName, setContactName] = useState(profile.contactName);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, contactName, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save. Try again.");
        setStatus("error");
        return;
      }
      setStatus("saved");
    } catch {
      setError("Network error. Try again.");
      setStatus("error");
    }
  }

  return (
    <SectionCard title="Contact info">
      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="business" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
            Business name
          </label>
          <input
            id="business"
            value={businessName}
            onChange={(e) => { setBusinessName(e.target.value); setStatus("idle"); }}
            className={INPUT_CLASS}
            style={INPUT_STYLE}
          />
        </div>
        <div>
          <label htmlFor="contact" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
            Contact name
          </label>
          <input
            id="contact"
            value={contactName}
            onChange={(e) => { setContactName(e.target.value); setStatus("idle"); }}
            className={INPUT_CLASS}
            style={INPUT_STYLE}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setStatus("idle"); }}
            className={INPUT_CLASS}
            style={INPUT_STYLE}
          />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
            Login email
          </label>
          <p className="text-base" style={{ color: "#888888" }}>{profile.email}</p>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: "#555555" }}>
            This is your login identity. To change it, email team@callvia.io.
          </p>
        </div>

        {error && (
          <p className="text-sm" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={save}
            disabled={status === "saving"}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 disabled:opacity-50"
          >
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
          {status === "saved" && (
            <span className="text-sm" style={{ color: "#a48bff" }}>Saved.</span>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function InvoicesCard({ invoices, hasStripeCustomer }: { invoices: InvoiceRow[]; hasStripeCustomer: boolean }) {
  return (
    <SectionCard title="Invoices">
      {invoices.length > 0 ? (
        <div className="flex flex-col divide-y" style={{ borderColor: "#1f1f1f" }}>
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm text-white">{fmtDate(inv.created)}</p>
                <p className="text-xs" style={{ color: "#555555" }}>
                  {inv.number ? `#${inv.number}` : inv.id}
                  {inv.status ? ` · ${inv.status}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-sm text-white">{inv.amount}</span>
                {(inv.hostedInvoiceUrl || inv.invoicePdf) && (
                  <a
                    href={(inv.hostedInvoiceUrl ?? inv.invoicePdf) as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:text-accent-hover transition-colors duration-200"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>
          {hasStripeCustomer
            ? "No invoices yet. They will appear here after your first billing cycle."
            : "Invoices appear here once billing is set up."}
        </p>
      )}
    </SectionCard>
  );
}

function HistoryCard({ agreements }: { agreements: AgreementRow[] }) {
  if (agreements.length <= 1) return null;
  return (
    <SectionCard title="Agreement history">
      <div className="flex flex-col divide-y" style={{ borderColor: "#1f1f1f" }}>
        {agreements.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm text-white">{a.packageName}</p>
              <p className="text-xs" style={{ color: "#555555" }}>
                {fmtDate(a.createdAt)} · {a.statusLabel}
              </p>
            </div>
            {a.hasPdf && (
              <a
                href={`/api/account/agreements/${a.id}/pdf`}
                className="text-sm text-accent hover:text-accent-hover transition-colors duration-200 shrink-0"
              >
                PDF
              </a>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/billing-portal", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not open billing. Try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 disabled:opacity-50"
      >
        {loading ? "Opening…" : "Manage billing"}
      </button>
      {error && <span className="text-xs" style={{ color: "#f87171" }}>{error}</span>}
    </div>
  );
}

function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/account/logout", { method: "POST" });
    } catch {
      // Fall through: navigate away regardless.
    }
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="text-sm transition-colors duration-200 shrink-0"
      style={{ color: "#888888" }}
    >
      {loading ? "…" : "Log out"}
    </button>
  );
}
