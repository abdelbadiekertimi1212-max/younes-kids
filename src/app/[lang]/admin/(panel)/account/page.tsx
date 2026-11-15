import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { adminAccountText } from "@/i18n/admin-account";
import { requireStaff } from "@/lib/auth";
import { AccountForms } from "@/components/admin/AccountForms";
import { PageHeader } from "@/components/admin/ui";

/** Every staff member can change their own username and password here. */
export default async function AccountPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = adminAccountText[lang];
  const staff = await requireStaff(lang);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader title={t.title} subtitle={t.intro} />
      {staff.mustChangePassword && (
        <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {t.warning}
        </p>
      )}
      <AccountForms lang={lang} t={t} username={staff.username} />
    </div>
  );
}
