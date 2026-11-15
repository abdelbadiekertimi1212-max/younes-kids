import Link from "next/link";
import { Heart, Search } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { StoreText } from "@/i18n/store";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CartLink } from "./CartLink";
import { Logo } from "@/components/brand/Logo";
import { BRAND } from "@/lib/brand";

export function Header({ lang, dict, st }: { lang: Locale; dict: Dictionary; st: StoreText }) {
  const base = `/${lang}`;
  const navCls = "rounded-full px-3 py-1.5 text-[15px] font-bold text-ink transition-colors hover:bg-brand-light hover:text-brand-dark";
  const iconCls =
    "grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-brand-light";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 shadow-[0_1px_0_rgb(30_38_80/0.04)] backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-1 focus:text-sm focus:text-white"
      >
        {dict.header.skipToContent}
      </a>

      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Link href={base} aria-label={BRAND.name} className="-my-1 shrink-0 rounded-2xl transition-transform hover:scale-[1.03]">
          <Logo priority className="h-[60px] sm:h-[70px]" sizes="(min-width: 640px) 81px, 70px" />
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label={dict.nav.home}>
          <Link href={base} className={navCls}>
            {dict.nav.home}
          </Link>
          <Link href={`${base}/shop`} className={navCls}>
            {dict.nav.shop}
          </Link>
          <Link href={`${base}/track`} className={navCls}>
            {st.nav.track}
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href={`${base}/search`} aria-label={dict.nav.search} className={iconCls}>
            <Search className="size-5" aria-hidden />
          </Link>
          <Link href={`${base}/wishlist`} aria-label={dict.nav.wishlist} className={`${iconCls} hidden sm:grid`}>
            <Heart className="size-5" aria-hidden />
          </Link>
          <CartLink href={`${base}/cart`} label={st.nav.cart} />
          <LanguageSwitcher locale={lang} label={dict.language.change} />
        </div>
      </div>
    </header>
  );
}
