"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/Button";
import { Modal } from "./ui/overlays";
import { Checkbox, Input } from "./ui/form";
import { useToast } from "./ui/Toast";

// Local calendar date as YYYY-MM-DD. toISOString() would convert to UTC first,
// which for anyone west of Greenwich hands back yesterday's date after 6pm.
function localISODate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const DEFAULT_TRIAL_DAYS = 14;

export function NewTrialForm() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startsOn, setStartsOn] = useState(localISODate());
  const [endsOn, setEndsOn] = useState(localISODate(DEFAULT_TRIAL_DAYS));
  const [sendNow, setSendNow] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Moving the start date carries the end date with it, keeping the length the
  // admin already chose instead of silently changing it.
  function changeStart(next: string) {
    if (!next) return;
    const prevLength =
      (Date.parse(`${endsOn}T00:00:00`) - Date.parse(`${startsOn}T00:00:00`)) / 86_400_000;
    const days = Number.isFinite(prevLength) && prevLength > 0 ? prevLength : DEFAULT_TRIAL_DAYS;
    setStartsOn(next);
    const [y, m, d] = next.split("-").map(Number);
    const end = new Date(y, m - 1, d + days);
    setEndsOn(
      `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`,
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/trials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          contactName,
          email,
          phone,
          trialStartsOn: startsOn,
          trialEndsOn: endsOn,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not create the trial.");
        setSubmitting(false);
        return;
      }

      if (sendNow) {
        const sendRes = await fetch(`/api/admin/agreements/${data.id}/send`, { method: "POST" });
        const sendData = await sendRes.json().catch(() => ({}));
        if (sendData.emailed) toast.success(`Trial sent to ${email}.`, sendData.url);
        else
          toast.error(
            "Created, but the email did not send. Copy this link now.",
            sendData.url ?? data.url,
          );
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
        New trial
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New free trial agreement"
        description="No payment, no card, nothing to charge. The dates below are written into the agreement."
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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

          {/* type="date" so phones get the native OS date picker rather than a
              text field the client has to format correctly. */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Trial starts"
              type="date"
              value={startsOn}
              onChange={(e) => changeStart(e.target.value)}
            />
            <Input
              label="Trial ends"
              type="date"
              value={endsOn}
              min={startsOn}
              onChange={(e) => setEndsOn(e.target.value)}
              hint={`Defaults to ${DEFAULT_TRIAL_DAYS} days.`}
            />
          </div>

          <Checkbox
            checked={sendNow}
            onChange={(e) => setSendNow(e.target.checked)}
            label="Email the trial agreement to the client now."
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
