"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/Button";
import { Modal } from "./ui/overlays";
import { Checkbox, Input, Select, Textarea } from "./ui/form";
import { useToast } from "./ui/Toast";
import type { AdminPackage } from "./types";

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function NewAgreementForm({ packages }: { packages: AdminPackage[] }) {
  const toast = useToast();
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
        if (sendData.emailed) {
          toast.success(`Sent to ${email}.`, sendData.url);
        } else {
          toast.error(
            "Created, but the email did not send. Copy this link now.",
            sendData.url ?? data.url,
          );
        }
      } else {
        toast.info("Created. Copy this link now, it cannot be shown again.", data.url);
      }

      setOpen(false);
      setSubmitting(false);
      window.location.reload();
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button variant="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)}>
        New agreement
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New agreement"
        description="Selecting a package prefills the fields. All of them stay editable."
      >
        <form id="new-agreement" onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <Select
            label="Package"
            value={packageKey}
            onChange={(e) => applyPackage(e.target.value)}
          >
            <option value="">Custom (no package)</option>
            {packages.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </Select>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              autoComplete="organization"
            />
            <Input
              label="Contact name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Phone"
              type="tel"
              inputMode="tel"
              optional
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>

          <Input
            label="Package name shown to client"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
          />
          <Input
            label="One-line summary"
            value={packageSummary}
            onChange={(e) => setPackageSummary(e.target.value)}
          />
          <Textarea
            label="What is included"
            hint="One per line."
            rows={6}
            value={includedText}
            onChange={(e) => setIncludedText(e.target.value)}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Setup fee ($)"
              inputMode="decimal"
              value={setupFee}
              onChange={(e) => setSetupFee(e.target.value)}
            />
            <Input
              label="Monthly ($)"
              inputMode="decimal"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
            />
            <Input
              label="Included minutes"
              optional
              inputMode="numeric"
              value={includedMinutes}
              onChange={(e) => setIncludedMinutes(e.target.value)}
            />
            <Input
              label="Overage per minute ($)"
              optional
              inputMode="decimal"
              value={overageRate}
              onChange={(e) => setOverageRate(e.target.value)}
            />
          </div>

          <Checkbox
            checked={sendNow}
            onChange={(e) => setSendNow(e.target.checked)}
            label="Email the agreement link to the client now."
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" variant="primary" loading={submitting} className="sm:self-start">
            {sendNow ? "Create and send" : "Create"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
