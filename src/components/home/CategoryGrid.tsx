import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Category } from "@/lib/types";
import { cn, pickLocale } from "@/lib/utils";

// Playful tile colours, cycled across categories.
const TONES = [
  "bg-sky-light hover:bg-sky/25",
  "bg-candy-light hover:bg-candy/25",
  "bg-mint-light hover:bg-mint/25",
  "bg-brand-light hover:bg-brand/30",
];

// A friendly icon for the standard kids categories (any other slug gets a star).
const ICONS: Record<string, string> = {
  baby: "🍼",
  girls: "👗",
  boys: "👕",
  pyjamas: "🌙",
  shoes: "👟",
  accessories: "🎀",
};

export function CategoryGrid({ categories, lang }: { categories: Category[]; lang: Locale }) {
  if (!categories.length) return null;
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-6">
      {categories.map((c, i) => {
        const name = pickLocale(c, "name", lang);
        return (
          <Link
            key={c.id}
            href={`/${lang}/shop?category=${c.slug}`}
            className={cn(
              "group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-[1.5rem] text-center transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]",
              TONES[i % TONES.length],
            )}
          >
            {c.image_url ? (
              <>
                <Image src={c.image_url} alt={name} fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-ink shadow-sm">{name}</span>
              </>
            ) : (
              <>
                <span className="grid size-12 place-items-center rounded-full bg-white text-2xl shadow-sm transition-transform group-hover:scale-110 sm:size-16 sm:text-3xl" aria-hidden>
                  {ICONS[c.slug] ?? "⭐"}
                </span>
                <span className="px-1.5 text-xs font-bold leading-tight text-ink sm:text-base">{name}</span>
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}
