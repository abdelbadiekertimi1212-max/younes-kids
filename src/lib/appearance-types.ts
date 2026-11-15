// Client-safe theme/content types and defaults (no server-only imports).

export type Theme = {
  brand: string;
  brandDark: string;
  gold: string;
  ink: string;
  background: string;
};

export const DEFAULT_THEME: Theme = {
  brand: "#ffb800",
  brandDark: "#8c6500",
  gold: "#ffa000",
  ink: "#1e2650",
  background: "#fffdf7",
};

export type HeroLocale = {
  badge?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  announcement?: string;
};

export type HomeContent = {
  heroImage?: string;
  ar: HeroLocale;
  fr: HeroLocale;
  en: HeroLocale;
};
