"use client";

import { useState } from "react";
import type { AdminPackage } from "./types";

const inputClass =
  "w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent";
const inputStyle = { background: "#0d0d0d", borderColor: "#1f1f1f" } as const;
const labelClass = "block text-xs tracking-widest uppercase mb-3";
const labelStyle = { color: "#555555" } as const;

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function NewAgreementForm({ packages }: { packages: AdminPackage[] }) {
  const [open, setOpen] = useState(false);
  const [packageKey, setPackageKey] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [packageName, setPackageName] = useState("");
  const [packageSummary, setPackageSummary] = useState("");
  const [includedText, setIncludedText] = useState("");
  const [setupFee, setSetupFee] = useState("0.00");
  const [monthly, setMonthly] = useState("0.00");
  const [includedMinutes, setIncludedMinutes] = useState("");
  const [overageRate, setOverageRate] = useState("");
  const [sendNow, setSendNow] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  // Selecting a package only prefills. Every field below stays editable, so a
  // custom deal is a package with edits and a bespoke one is no package at all.
  function applyPackage(key: string) {
    setPackageKey(key);
    const p = packages.find((x) => x.key === key);
    if (!p) return;
    setPackageName(p.name);
    setPackageSummary(p.summary);
    setIncludedText(p.includedItems.join("\n"));
    setSetupFee(dollars(p.setupFeeCents));
    setMonthly(dollars(p.monthlyCents));
    setIncludedMinutes(p.includedMinutes !== null ? String(p.includedMinutes) : "");
    setOverageRate(p.overageCentsPerMinute !== null ? dollars(p.overageCentsPerMinute) : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          contactName,
          email,
          phone,
          packageKey: packageKey || null,
          packageName,
          packageSummary,
          includedItems: includedText.split("\n").map((s) => s.trim()).filter(Boolean),
          setupFee,
          monthly,
          includedMinutes,
          overageRate,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not create the agreement.");
        setSubmitting(false);
        return;
      }

      if (sendNow) {
        const sendRes = await fetch(`/api/admin/agreements/${data.id}/send`, { method: "POST" });
        const sendData = await sendRes.json().catch(() => ({}));
        // Sending rotates the token, so the link from the send response is the
        // live one. The link from create is already dead at this point.
        setResult(
          sendData.emailed
            ? `Sent to ${email}. Link: ${sendData.url}`
            : `Created, but the email did not send. Copy this link: ${sendData.url ?? data.url}`,
        );
      } else {
        setResult(`Created. Copy this link now, it cannot be shown again: ${data.url}`);
      }
      setSubmitting(false);
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <div className="mb-16">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200"
        >
          New agreement
        </button>
        {result && (
          <p className="mt-5 text-sm break-all" style={{ color: "#999999" }}>
            {result}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="mb-16 rounded-xl border p-8" style={{ borderColor: "#1f1f1f", background: "#0d0d0d" }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium">New agreement</h2>
        <button onClick={() => setOpen(false)} className="text-xs tracking-widest uppercase" style={labelStyle}>
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
        <div>
          <label htmlFor="pkg" className={labelClass} style={labelStyle}>
            Package
          </label>
          <select
            id="pkg"
            value={packageKey}
            onChange={(e) => applyPackage(e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Custom (no package)</option>
            {packages.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-7 sm:grid-cols-2">
          <div>
            <label htmlFor="biz" className={labelClass} style={labelStyle}>
              Business name *
            </label>
            <input id="biz" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="contact" className={labelClass} style={labelStyle}>
              Contact name *
            </label>
            <input id="contact" value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass} style={labelStyle}>
              Email *
            </label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass} style={labelStyle}>
              Phone
            </label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
        </div>

        <div>
          <label htmlFor="pkgname" className={labelClass} style={labelStyle}>
            Package name shown to client
          </label>
          <input id="pkgname" value={packageName} onChange={(e) => setPackageName(e.target.value)} className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label htmlFor="pkgsum" className={labelClass} style={labelStyle}>
            One-line summary
          </label>
          <input id="pkgsum" value={packageSummary} onChange={(e) => setPackageSummary(e.target.value)} className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label htmlFor="incl" className={labelClass} style={labelStyle}>
            What is included (one per line)
          </label>
          <textarea id="incl" rows={6} value={includedText} onChange={(e) => setIncludedText(e.target.value)} className={inputClass} style={inputStyle} />
        </div>

        <div className="grid gap-7 sm:grid-cols-2">
          <div>
            <label htmlFor="setup" className={labelClass} style={labelStyle}>
              One-time setup fee ($)
            </label>
            <input id="setup" inputMode="decimal" value={setupFee} onChange={(e) => setSetupFee(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="monthly" className={labelClass} style={labelStyle}>
              Monthly ($)
            </label>
            <input id="monthly" inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="mins" className={labelClass} style={labelStyle}>
              Included minutes (optional)
            </label>
            <input id="mins" inputMode="numeric" value={includedMinutes} onChange={(e) => setIncludedMinutes(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="over" className={labelClass} style={labelStyle}>
              Overage per minute ($, optional)
            </label>
            <input id="over" inputMode="decimal" value={overageRate} onChange={(e) => setOverageRate(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
        </div>

        <label className="flex items-start gap-3.5 cursor-pointer">
          <input type="checkbox" checked={sendNow} onChange={(e) => setSendNow(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#7c5cfc]" />
          <span className="text-sm leading-relaxed" style={{ color: "#999999" }}>
            Email the agreement link to the client now.
          </span>
        </label>

        {error && (
          <p className="text-sm" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}
        {result && (
          <p className="text-sm break-all" style={{ color: "#999999" }}>
            {result}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="self-start inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
        >
          {submitting ? "Creating…" : sendNow ? "Create and send" : "Create"}
        </button>
      </form>
    </section>
  );
}
