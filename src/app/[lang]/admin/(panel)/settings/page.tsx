import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { adminText } from "@/i18n/admin";
import { adminOpsText } from "@/i18n/admin-ops";
import { requireStaff } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getAllDeliveryFees, getStoreSettings } from "@/lib/data/admin";
import { getDeliverySettings } from "@/lib/data/catalog";
import { getMarketingAdmin } from "@/lib/data/marketing";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { DeliveryFeesEditor } from "@/components/admin/DeliveryFeesEditor";
import { MarketingForm } from "@/components/admin/MarketingForm";
import { NoAccess, PageHeader } from "@/components/admin/ui";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { adminAccountText } from "@/i18n/admin-account";

export default async function AdminSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = adminText[lang];
  const ops = adminOpsText[lang];
  const acct = adminAccountText[lang];
  const staff = await requireStaff(lang);
  const canSettings = can(staff.permissions, "settings.manage");
  const canMarketing = can(staff.permissions, "marketing.manage");
  if (!canSettings && !canMarketing) return <NoAccess t={ops.common} />;

  const [settings, fees, marketing, delivery] = await Promise.all([
    getStoreSettings(),
    canSettings ? getAllDeliveryFees() : Promise.resolve([]),
    getMarketingAdmin(),
    getDeliverySettings(),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader title={t.settings.title} />
      <Link
        href={`/${lang}/admin/account`}
        className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 transition-colors hover:bg-brand-light"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-light text-brand-dark">
          <KeyRound className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block text-sm font-semibold text-ink">{acct.settingsCard}</span>
          <span className="block text-sm text-muted">{acct.settingsCardHelp}</span>
        </span>
      </Link>
      {canSettings && (
        <SettingsForm lang={lang} t={t.settings} common={t.common} initialStore={settings.store} initialSocial={settings.social} />
      )}
      {canMarketing && <MarketingForm lang={lang} t={t.settings} ops={ops} initial={marketing} />}
      {canSettings && <DeliveryFeesEditor lang={lang} t={t.settings} ops={ops} fees={fees} settings={delivery} />}
    </div>
  );
}
