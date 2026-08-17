import { sha256Hex } from "../crypto";
import { canonicalJson } from "./interpolate";
import type { AgreementKind, AgreementTemplate } from "./types";
import { v1 } from "./templates/v1";
import { trialV1 } from "./templates/trial-v1";

// Two documents now live here: the paid service agreement and the free trial
// agreement. They are separate template families, each with its own version
// line, which is why the registry is keyed by template id first.
//
// agreements.template_id / template_version is a composite FK to
// agreement_templates, so this shape matches the database rather than fighting
// it.

export const TEMPLATE_ID = "callvia-service-agreement";
export const TRIAL_TEMPLATE_ID = "callvia-free-trial";

export const CURRENT_TEMPLATE_VERSION = 1;
export const CURRENT_TRIAL_VERSION = 1;

const TEMPLATES: Record<string, Record<number, AgreementTemplate>> = {
  [TEMPLATE_ID]: { 1: v1 },
  [TRIAL_TEMPLATE_ID]: { 1: trialV1 },
};

export function templateIdFor(kind: AgreementKind): string {
  return kind === "trial" ? TRIAL_TEMPLATE_ID : TEMPLATE_ID;
}

export function currentVersionFor(kind: AgreementKind): number {
  return kind === "trial" ? CURRENT_TRIAL_VERSION : CURRENT_TEMPLATE_VERSION;
}

export function getTemplate(templateId: string, version: number): AgreementTemplate {
  const t = TEMPLATES[templateId]?.[version];
  if (!t) {
    throw new Error(`No agreement template registered for ${templateId} v${version}`);
  }
  return t;
}

export function currentTemplate(kind: AgreementKind = "service"): AgreementTemplate {
  return getTemplate(templateIdFor(kind), currentVersionFor(kind));
}

export function templateSourceHash(templateId: string, version: number): string {
  return sha256Hex(canonicalJson(getTemplate(templateId, version)));
}

// Freeze guard. Once a version has been signed by a client its text must never
// change, so its hash is pinned here. If this assertion fails you edited a
// frozen template: revert it and add a new version instead.
//
// To register a new version: add it to TEMPLATES, bump the matching CURRENT_*
// constant, run `npx tsx scripts/template-hash.ts` to get the hash, add it
// below, and insert the matching row into agreement_templates.
export const FROZEN_HASHES: Record<string, Record<number, string>> = {
  [TEMPLATE_ID]: { 1: "5447f389002e41a62aedc78db6f6fcecbf79a6444a6035b07cbc7b31fce72652" },
  [TRIAL_TEMPLATE_ID]: { 1: "502be1bd53130e018ead6f749a47a9ea91434cde5b9c0464c86b9c7aa078ac94" },
};

export function assertTemplatesUnchanged(): void {
  for (const [templateId, versions] of Object.entries(FROZEN_HASHES)) {
    for (const [version, expected] of Object.entries(versions)) {
      const actual = templateSourceHash(templateId, Number(version));
      if (actual !== expected) {
        throw new Error(
          `Agreement template ${templateId} v${version} has been modified after being frozen. ` +
            `Expected ${expected}, got ${actual}. Revert the edit and create a new version instead.`,
        );
      }
    }
  }
}
