// Kids catalog rules (pure and unit-tested): age-based sizes, age groups,
// gender and the size guide. Client-safe: no server imports.
import type { Locale } from "@/i18n/config";

export const GENDERS = ["girls", "boys", "unisex"] as const;
export type Gender = (typeof GENDERS)[number];
export const isGender = (v: unknown): v is Gender => GENDERS.includes(v as Gender);

/** Standard clothing sizes, in age order (what the admin size picker suggests). */
export const CLOTHING_SIZES = [
  "0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M",
  "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y", "11Y", "12Y", "13Y", "14Y",
] as const;
/** Children's shoe sizes (EU). */
export const SHOE_SIZES = Array.from({ length: 23 }, (_, i) => String(16 + i)); // 16 … 38

export type AgeRange = { min: number; max: number }; // in months, inclusive

/**
 * Age range (months) for a size label. Understands "3-6M", "18M", "2Y",
 * "2-3Y" and "NB" (newborn); case and spaces don't matter. Shoe sizes and
 * letter sizes have no age, so they return null.
 */
export function sizeAge(size: string): AgeRange | null {
  const s = size.trim().toUpperCase().replace(/\s+/g, "");
  if (s === "NB" || s === "0M") return { min: 0, max: 1 };
  let m = /^(\d{1,2})-(\d{1,2})M$/.exec(s);
  if (m) return { min: +m[1], max: +m[2] - 1 };
  m = /^(\d{1,2})M$/.exec(s);
  if (m) return { min: +m[1], max: +m[1] };
  m = /^(\d{1,2})-(\d{1,2})[YA]$/.exec(s);
  if (m) return { min: +m[1] * 12, max: +m[2] * 12 + 11 };
  m = /^(\d{1,2})[YA]$/.exec(s);
  if (m) return { min: +m[1] * 12, max: +m[1] * 12 + 11 };
  return null;
}

const LETTER_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

/** Sort sizes the way parents expect: by age, then shoe size, then letters, then text. */
export function compareSizes(a: string, b: string): number {
  const rank = (s: string): [number, number] => {
    const age = sizeAge(s);
    if (age) return [0, age.min * 100 + age.max];
    if (/^\d{2}(\.5)?$/.test(s.trim())) return [1, Number(s)];
    const li = LETTER_ORDER.indexOf(s.trim().toUpperCase());
    if (li >= 0) return [2, li];
    return [3, 0];
  };
  const [ga, va] = rank(a);
  const [gb, vb] = rank(b);
  return ga - gb || va - vb || a.localeCompare(b);
}

export const sortSizes = (sizes: Iterable<string>) => [...new Set(sizes)].sort(compareSizes);

/** Shop age groups (months, inclusive). */
export const AGE_GROUPS = {
  baby: { min: 0, max: 23 },
  toddler: { min: 24, max: 59 },
  kids: { min: 60, max: 107 },
  juniors: { min: 108, max: 179 },
} as const satisfies Record<string, AgeRange>;
export type AgeGroup = keyof typeof AGE_GROUPS;
export const isAgeGroup = (v: unknown): v is AgeGroup => typeof v === "string" && v in AGE_GROUPS;

/** Whether a size fits (overlaps) an age group. */
export function sizeInAgeGroup(size: string, group: AgeGroup): boolean {
  const age = sizeAge(size);
  const g = AGE_GROUPS[group];
  return !!age && age.min <= g.max && age.max >= g.min;
}

/** A size label in the shopper's language: "3-6M" → "3-6 أشهر", "4Y" → "4 ans". */
export function sizeLabel(size: string, lang: Locale): string {
  const s = size.trim().toUpperCase().replace(/\s+/g, "");
  let m = /^(\d{1,2})-(\d{1,2})M$/.exec(s) ?? /^(\d{1,2})M$/.exec(s);
  if (m) {
    const range = m[2] ? `${m[1]}-${m[2]}` : m[1];
    const top = Number(m[2] ?? m[1]);
    if (lang === "ar") return `${range} ${top <= 10 ? "أشهر" : "شهرًا"}`;
    return `${range} ${lang === "fr" ? "mois" : "m"}`;
  }
  m = /^(\d{1,2})-(\d{1,2})[YA]$/.exec(s) ?? /^(\d{1,2})[YA]$/.exec(s);
  if (m) {
    const range = m[2] ? `${m[1]}-${m[2]}` : m[1];
    const top = Number(m[2] ?? m[1]);
    if (lang === "ar") return top === 1 ? "سنة" : top === 2 && !m[2] ? "سنتان" : `${range} ${top <= 10 ? "سنوات" : "سنة"}`;
    if (lang === "fr") return `${range} ${top === 1 ? "an" : "ans"}`;
    return `${range} ${top === 1 ? "yr" : "yrs"}`;
  }
  if (s === "NB") return lang === "ar" ? "حديث الولادة" : lang === "fr" ? "Naissance" : "Newborn";
  return size;
}

/** "4Y / وردي" → "4 سنوات / وردي": localizes the size part of a variant label. */
export function variantLabelFor(label: string, lang: Locale): string {
  return label.split(" / ").map((part) => sizeLabel(part, lang)).join(" / ");
}

/** Typical child height per size (cm), shown in the size guide. */
export const SIZE_GUIDE: { size: string; height: string }[] = [
  { size: "0-3M", height: "56–62" },
  { size: "3-6M", height: "62–68" },
  { size: "6-9M", height: "68–74" },
  { size: "9-12M", height: "74–80" },
  { size: "12-18M", height: "80–86" },
  { size: "18-24M", height: "86–92" },
  { size: "2Y", height: "86–92" },
  { size: "3Y", height: "92–98" },
  { size: "4Y", height: "98–104" },
  { size: "5Y", height: "104–110" },
  { size: "6Y", height: "110–116" },
  { size: "7Y", height: "116–122" },
  { size: "8Y", height: "122–128" },
  { size: "9Y", height: "128–134" },
  { size: "10Y", height: "134–140" },
  { size: "11Y", height: "140–146" },
  { size: "12Y", height: "146–152" },
  { size: "13Y", height: "152–158" },
  { size: "14Y", height: "158–164" },
];

/** Products added in the last 21 days get a "new" badge. */
export const NEW_DAYS = 21;
export function isNewProduct(createdAt: string, now: number): boolean {
  const t = Date.parse(createdAt);
  return Number.isFinite(t) && now - t <= NEW_DAYS * 86_400_000;
}
