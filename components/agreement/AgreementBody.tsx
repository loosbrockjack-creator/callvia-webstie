import type { Section } from "@/lib/agreement/types";

// Renders interpolated contract sections. Because the text is data rather than
// JSX, quotes and apostrophes pass through as-is with no entity escaping.
export function AgreementBody({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-10 text-base leading-relaxed" style={{ color: "#999999" }}>
      {sections.map((section, si) => (
        <section key={si}>
          {section.heading && (
            <h2 className="text-white text-lg font-medium mb-3">{section.heading}</h2>
          )}
          {section.blocks.map((block, bi) => {
            if (block.kind === "p") {
              return (
                <p key={bi} className={bi > 0 ? "mt-4" : undefined}>
                  {block.text}
                </p>
              );
            }
            if (block.kind === "callout") {
              return (
                <p key={bi} className="mt-4 text-white font-medium">
                  {block.text}
                </p>
              );
            }
            return (
              <ul key={bi} className={`space-y-2 list-disc list-inside ${bi > 0 ? "mt-4" : ""}`}>
                {block.items.map((item, ii) => (
                  <li key={ii}>{item}</li>
                ))}
              </ul>
            );
          })}
        </section>
      ))}
    </div>
  );
}
