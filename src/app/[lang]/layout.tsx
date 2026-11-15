import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { baloo, nunito } from "@/lib/fonts";
import { locales, isLocale, getDirection } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getTheme } from "@/lib/data/appearance";
import { siteUrl } from "@/lib/site";
import "../globals.css";
import { BRAND } from "@/lib/brand";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const ogLocale = lang === "ar" ? "ar_DZ" : lang === "fr" ? "fr_DZ" : "en_US";
  return {
    metadataBase: siteUrl(),
    title: { default: dict.meta.title, template: `%s | ${BRAND.name}` },
    description: dict.meta.description,
    openGraph: {
      type: "website",
      siteName: BRAND.name,
      locale: ogLocale,
      title: dict.meta.title,
      description: dict.meta.description,
      images: [{ url: BRAND.ogImage, width: 1200, height: 630, alt: BRAND.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [BRAND.ogImage],
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dir = getDirection(lang);
  const theme = await getTheme();
  const themeCss = `:root{--color-brand:${theme.brand};--color-brand-dark:${theme.brandDark};--color-gold:${theme.gold};--color-ink:${theme.ink};--color-foreground:${theme.ink};--color-background:${theme.background};}`;

  return (
    <html
      lang={lang}
      dir={dir}
      data-scroll-behavior="smooth"
      className={`${baloo.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
