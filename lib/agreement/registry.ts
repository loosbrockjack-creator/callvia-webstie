import { sha256Hex } from "../crypto";
import { canonicalJson } from "./interpolate";
import type { AgreementTemplate } from "./types";
import { v1 } from "./templates/v1";

const TEMPLATES: Record<number, AgreementTemplate> = { 1: v1 };

export const TEMPLATE_ID = "callvia-service-agreement";
export const CURRENT_TEMPLATE_VERSION = 1;

export function getTemplate(version: number): AgreementTemplate {
  const t = TEMPLATES[version];
  if (!t) throw new Error(`No agreement template registered for version ${version}`);
  return t;
}

export function currentTemplate(): AgreementTemplate {
  return getTemplate(CURRENT_TEMPLATE_VERSION);
}

export function templateSourceHash(version: number): string {
  return sha256Hex(canonicalJson(getTemplate(version)));
}

// Freeze guard. Once a version has been signed by a client its text must never
// change, so its hash is pinned here. If this assertion fails you edited a
// frozen template: revert it and add a new version instead.
//
// To register a new version: add it to TEMPLATES, bump CURRENT_TEMPLATE_VERSION,
// run `npx tsx scripts/template-hash.ts` (or log templateSourceHash) to get the
// hash, add it below, and insert the matching row into agreement_templates.
export const FROZEN_HASHES: Record<number, string> = {
  // v1 is not pinned yet. Pin it the moment the first client signs against it.
  // 1: "<paste templateSourceHash(1) here>",
};

export function assertTemplatesUnchanged(): void {
  for (const [version, expected] of Object.entries(FROZEN_HASHES)) {
    const actual = templateSourceHash(Number(version));
    if (actual !== expected) {
      throw new Error(
        `Agreement template v${version} has been modified after being frozen. ` +
          `Expected ${expected}, got ${actual}. Revert the edit and create a new version instead.`,
      );
    }
  }
}
