import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { ProductCardData } from "@/lib/data/catalog";
import type { HeroLocale } from "@/lib/appearance-types";
import { Logo } from "@/components/brand/Logo";
import { formatPrice, pickLocale } from "@/lib/utils";

/** Small decorative 5-point star. */
function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor" stroke="#1e2650" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/** Soft decorative cloud. */
function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 32" className={className} aria-hidden>
      <path d="M14 30h38a10 10 0 0 0 0-20 14 14 0 0 0-26-4A11 11 0 0 0 14 30z" fill="currentColor" />
    </svg>
  );
}

export function Hero({
  lang,
  dict,
  product,
  content,
  heroImage,
  ctaHref,
  plain = false,
}: {
  lang: Locale;
  dict: Dictionary;
  product?: ProductCardData;
  content?: HeroLocale;
  heroImage?: string;
  /** Main button target (defaults to the shop). */
  ctaHref?: string;
  /** No built-in gradient (a section background colour is used instead). */
  plain?: boolean;
}) {
  const base = `/${lang}`;
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const badge = content?.badge || dict.home.heroBadge;
  const title = content?.title || dict.home.heroTitle;
  const subtitle = content?.subtitle || dict.home.heroSubtitle;
  const cta = content?.cta || dict.home.heroCta;

  // Custom hero image (links to shop) wins; otherwise feature a product; otherwise the big logo.
  const useProduct = !heroImage && !!product?.images?.length;
  const img = heroImage || product?.images?.[0]?.url;
  const imgHref = useProduct ? `${base}/product/${product!.slug}` : `${base}/shop`;

  return (
    <section
      className={
        plain
          ? "relative overflow-hidden"
          : "relative overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,#fff4cc_0%,#fff8e8_45%,#fffdf7_100%)]"
      }
    >
      {/* Playful background: bubbles, clouds and stars */}
      <div className="pointer-events-none absolute -end-16 -top-16 size-64 rounded-full bg-sky-light" aria-hidden />
      <div className="pointer-events-none absolute -start-20 top-1/3 size-56 rounded-full bg-candy-light" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 end-1/4 size-72 rounded-full bg-mint-light" aria-hidden />
      <Cloud className="animate-float pointer-events-none absolute start-[8%] top-8 w-24 text-white/90" />
      <Cloud className="animate-float-slow pointer-events-none absolute end-[12%] bottom-10 w-32 text-white/80" />
      <Star className="animate-twinkle pointer-events-none absolute start-[18%] bottom-16 size-6 text-brand" />
      <Star className="animate-twinkle-slow pointer-events-none absolute end-[30%] top-10 size-5 text-candy" />
      <Star className="animate-twinkle pointer-events-none absolute end-[6%] top-1/2 size-4 text-sky" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-16">
        <div className="text-center md:text-start">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-dark shadow-sm">
            <Sparkles className="size-4 text-gold" aria-hidden />
            {badge}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-muted md:mx-0">{subtitle}</p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row md:items-start">
            <Link
              href={ctaHref || `${base}/shop`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-ink/25 transition-transform hover:scale-[1.03] sm:w-auto"
            >
              <ShoppingBag className="size-5" aria-hidden />
              {cta}
            </Link>
            <Link
              href={`${base}/shop`}
              className="flex w-full items-center justify-center gap-1 rounded-full border-2 border-brand bg-white px-7 py-3 text-base font-bold text-ink transition-colors hover:bg-brand-light sm:w-auto"
            >
              {dict.home.heroSecondary}
              <Arrow className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-ink md:justify-start">
            <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">🚚 {dict.home.trustDelivery}</span>
            <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">💵 {dict.home.trustCod}</span>
            <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">🔄 {dict.home.trustExchange}</span>
          </div>
        </div>

        <div className="relative order-first mx-auto w-full max-w-sm md:order-none">
          {img ? (
            <Link href={imgHref} className="group relative block">
              <div className="absolute -inset-3 rotate-3 rounded-[2.5rem] bg-brand" aria-hidden />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.25rem] border-4 border-white shadow-2xl">
                <Image
                  src={img}
                  alt={useProduct ? pickLocale(product!, "name", lang) : title}
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 400px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <span className="absolute -top-8 end-[-1.5rem] rounded-full bg-white p-2 shadow-xl" aria-hidden>
                <Logo className="h-20" sizes="92px" />
              </span>
              {useProduct && (
                <div className="absolute bottom-4 end-4 start-4 flex items-center justify-between gap-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{pickLocale(product!, "name", lang)}</p>
                    <p className="text-sm font-extrabold text-brand-dark">
                      {formatPrice(product!.price)} {dict.common.currency}
                    </p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white">
                    <Arrow className="size-4" aria-hidden />
                  </span>
                </div>
              )}
            </Link>
          ) : (
            <Link href={`${base}/shop`} className="group relative mx-auto block aspect-square w-full max-w-[15rem] sm:max-w-[18rem] md:max-w-[22rem]">
              <span className="absolute inset-0 rounded-full bg-white shadow-[0_30px_60px_-20px_rgb(30_38_80/0.35)]" aria-hidden />
              <span className="absolute inset-4 rounded-full border-4 border-dashed border-brand/50" aria-hidden />
              <span className="absolute inset-0 grid place-items-center p-10">
                <Logo priority className="h-auto w-full transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2" sizes="(max-width: 768px) 70vw, 300px" />
              </span>
              <Star className="animate-twinkle absolute -top-2 start-6 size-9 text-brand" />
              <Star className="animate-twinkle-slow absolute bottom-6 -end-2 size-7 text-candy" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
