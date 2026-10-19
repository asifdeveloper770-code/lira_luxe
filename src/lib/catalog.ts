// Small helpers shared by the shop pages and the admin catalog tools.

/** Default US ring sizes offered by the "Ring sizes" shortcut in the admin. */
export const RING_SIZE_PRESET = ["5", "6", "7", "8", "9", "10"];

/** "6, 7,8 / 9" -> ["6","7","8","9"] (keeps the order, drops duplicates and blanks) */
export function parseSizes(text: string | null | undefined): string[] {
  if (!text) return [];
  const out: string[] = [];
  for (const part of String(text).split(/[,/;|]+/)) {
    const v = part.trim();
    if (v && !out.includes(v)) out.push(v);
  }
  return out;
}

/** "A309" -> 309, so A2 sorts before A10. Items without a SKU go last. */
export function skuNumber(sku: string | null | undefined): number {
  const m = String(sku ?? "").match(/(\d+)/);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

export function sortBySku<T extends { sku?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => skuNumber(a.sku) - skuNumber(b.sku));
}

/** "A309.jpg", "A309-2.jpg", "a309 (3).png" -> "A309" */
export function skuFromFileName(fileName: string): string | null {
  const m = fileName.match(/^\s*([A-Za-z]{1,3})\s*-?\s*(\d+)(?!\d)/);
  return m ? `${m[1].toUpperCase()}${Number(m[2])}` : null;
}

export function normalizeSku(sku: string | null | undefined): string {
  const m = String(sku ?? "").match(/^\s*([A-Za-z]{1,3})\s*-?\s*(\d+)/);
  return m ? `${m[1].toUpperCase()}${Number(m[2])}` : String(sku ?? "").trim().toUpperCase();
}

/**
 * Minimal CSV parser (handles quotes, commas and line breaks inside quotes),
 * enough for a sheet exported from Google Sheets / Excel as CSV.
 */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const nonEmpty = rows.filter((r) => r.some((v) => v.trim() !== ""));
  if (nonEmpty.length === 0) return [];
  const headers = nonEmpty[0].map((h) => h.trim().toLowerCase());
  return nonEmpty.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      if (h) obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });
}

/** Pick the first column that exists, so "Item No", "SKU" or "Code" all work. */
export function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== "") return v;
  }
  return "";
}

/** "$1,250.00" -> 1250 */
export function parsePrice(v: string): number | null {
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && String(v).trim() !== "" ? n : null;
}
