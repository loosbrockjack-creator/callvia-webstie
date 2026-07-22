import type { AgreementTemplate, Block, Section, TemplateVars } from "./types";

const PLACEHOLDER = /\{\{(\w+)\}\}/g;

// Throws on an unknown placeholder rather than leaving it in the text. A typo
// must fail loudly at render time, because the alternative is emailing a
// client a contract that literally reads "{{monthlyAmount}}".
export function interpolateText(text: string, vars: TemplateVars): string {
  return text.replace(PLACEHOLDER, (_match, key: string) => {
    const value = vars[key];
    if (value === undefined) {
      throw new Error(`Agreement template references unknown placeholder {{${key}}}`);
    }
    return value;
  });
}

function interpolateBlock(block: Block, vars: TemplateVars): Block {
  switch (block.kind) {
    case "p":
    case "callout":
      return { ...block, text: interpolateText(block.text, vars) };
    case "ul":
      return { kind: "ul", items: block.items.map((i) => interpolateText(i, vars)) };
  }
}

function interpolateSection(section: Section, vars: TemplateVars): Section {
  return {
    heading: section.heading ? interpolateText(section.heading, vars) : undefined,
    blocks: section.blocks.map((b) => interpolateBlock(b, vars)),
  };
}

export function interpolateSections(template: AgreementTemplate, vars: TemplateVars): Section[] {
  return template.sections.map((s) => interpolateSection(s, vars));
}

// Stable stringify for hashing: key order must not depend on object literal
// order, or the same document could hash two different ways.
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}
