// Minimal text layout for pdf-lib. pdf-lib draws text at coordinates and has
// no concept of flow, so wrapping, pagination, and headers are done here.
//
// Chosen over @react-pdf/renderer deliberately: no WASM layout engine, no
// React reconciler in the serverless bundle, and a much smaller cold start.
// The cost is this file.

import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

export const PAGE_W = 612; // US Letter, points
export const PAGE_H = 792;
export const MARGIN = 64;
export const CONTENT_W = PAGE_W - MARGIN * 2;

export const BODY_SIZE = 10;
export const LINE_GAP = 4;
export const BLACK = rgb(0.08, 0.08, 0.08);
export const GREY = rgb(0.42, 0.42, 0.42);

export interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
}

// WinAnsi (the encoding of the standard 14 fonts) cannot represent curly
// quotes, en/em dashes, or most non-Latin-1 characters, and pdf-lib throws
// rather than substituting. Signers type all of these, so normalize first.
export function sanitize(text: string): string {
  return text
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[–—―]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/[•]/g, "-")
    // Anything still outside Latin-1 would throw on draw; drop it rather than
    // fail to produce a signed document.
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "");
}

export function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const clean = sanitize(text);
  const lines: string[] = [];
  for (const paragraph of clean.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      // A single word longer than the line (a long URL, say) is hard-split.
      if (font.widthOfTextAtSize(word, size) > maxWidth) {
        let chunk = "";
        for (const ch of word) {
          if (font.widthOfTextAtSize(chunk + ch, size) > maxWidth) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk += ch;
          }
        }
        line = chunk;
      } else {
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

// A cursor that owns pagination so callers never track page breaks by hand.
export class Cursor {
  doc: PDFDocument;
  fonts: Fonts;
  page: PDFPage;
  y: number;
  pages: PDFPage[] = [];

  constructor(doc: PDFDocument, fonts: Fonts) {
    this.doc = doc;
    this.fonts = fonts;
    this.page = doc.addPage([PAGE_W, PAGE_H]);
    this.pages.push(this.page);
    this.y = PAGE_H - MARGIN;
  }

  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.pages.push(this.page);
    this.y = PAGE_H - MARGIN;
  }

  space(amount: number) {
    if (this.y - amount < MARGIN + 40) this.newPage();
    else this.y -= amount;
  }

  // Reserve vertical space so a block (a signature panel, a heading plus its
  // first lines) is never orphaned across a page break.
  reserve(height: number) {
    if (this.y - height < MARGIN + 40) this.newPage();
  }

  text(
    content: string,
    opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; indent?: number } = {},
  ) {
    const size = opts.size ?? BODY_SIZE;
    const font = opts.bold ? this.fonts.bold : this.fonts.regular;
    const indent = opts.indent ?? 0;
    const lines = wrap(content, font, size, CONTENT_W - indent);
    for (const line of lines) {
      if (this.y - size < MARGIN + 40) this.newPage();
      this.page.drawText(line, {
        x: MARGIN + indent,
        y: this.y - size,
        size,
        font,
        color: opts.color ?? BLACK,
      });
      this.y -= size + LINE_GAP;
    }
  }

  rule() {
    if (this.y - 12 < MARGIN + 40) this.newPage();
    this.y -= 8;
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_W - MARGIN, y: this.y },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    this.y -= 12;
  }

  // Two-column key/value row, used throughout the audit page.
  keyValue(key: string, value: string) {
    const keyW = 150;
    const lines = wrap(value, this.fonts.regular, 9, CONTENT_W - keyW);
    this.reserve(lines.length * 13 + 6);
    this.page.drawText(sanitize(key), {
      x: MARGIN,
      y: this.y - 9,
      size: 9,
      font: this.fonts.bold,
      color: GREY,
    });
    let first = true;
    for (const line of lines) {
      if (!first && this.y - 9 < MARGIN + 40) this.newPage();
      this.page.drawText(line, {
        x: MARGIN + keyW,
        y: this.y - 9,
        size: 9,
        font: this.fonts.regular,
        color: BLACK,
      });
      this.y -= 13;
      first = false;
    }
    this.y -= 2;
  }
}

export async function loadFonts(doc: PDFDocument): Promise<Fonts> {
  // Standard 14 fonts: no font file to embed, so nothing to bundle or fetch.
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  return { regular, bold };
}

export function drawFooters(cursor: Cursor, leftLabel: string) {
  const total = cursor.pages.length;
  cursor.pages.forEach((page, i) => {
    page.drawText(sanitize(leftLabel), {
      x: MARGIN,
      y: MARGIN - 24,
      size: 7.5,
      font: cursor.fonts.regular,
      color: GREY,
    });
    const label = `Page ${i + 1} of ${total}`;
    const w = cursor.fonts.regular.widthOfTextAtSize(label, 7.5);
    page.drawText(label, {
      x: PAGE_W - MARGIN - w,
      y: MARGIN - 24,
      size: 7.5,
      font: cursor.fonts.regular,
      color: GREY,
    });
  });
}
