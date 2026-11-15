"use client";

import { useState } from "react";
import { KeyRound, UserRound } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { AdminAccountText } from "@/i18n/admin-account";
import { changePassword, changeUsername, type AccountResult } from "@/lib/actions/account";
import { Card } from "@/components/admin/ui";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-dark focus:ring-2 focus:ring-brand-light";
const btnCls =
  "rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

function Message({ result, t, okText }: { result: AccountResult | null; t: AdminAccountText; okText: string }) {
  if (!result) return null;
  return result.ok ? (
    <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{okText}</p>
  ) : (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{t.errors[result.error]}</p>
  );
}

export function AccountForms({ lang, t, username }: { lang: Locale; t: AdminAccountText; username: string | null }) {
  const [name, setName] = useState(username ?? "");
  const [namePassword, setNamePassword] = useState("");
  const [nameResult, setNameResult] = useState<AccountResult | null>(null);
  const [nameBusy, setNameBusy] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passResult, setPassResult] = useState<AccountResult | null>(null);
  const [passBusy, setPassBusy] = useState(false);

  async function onUsername(e: React.FormEvent) {
    e.preventDefault();
    setNameBusy(true);
    const res = await changeUsername({ username: name, currentPassword: namePassword }, lang).catch(
      (): AccountResult => ({ ok: false, error: "failed" }),
    );
    setNameResult(res);
    if (res.ok) setNamePassword("");
    setNameBusy(false);
  }

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setPassBusy(true);
    const res = await changePassword({ currentPassword: current, newPassword: next, confirm }, lang).catch(
      (): AccountResult => ({ ok: false, error: "failed" }),
    );
    setPassResult(res);
    if (res.ok) {
      setCurrent("");
      setNext("");
      setConfirm("");
    }
    setPassBusy(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title={<span className="flex items-center gap-2"><UserRound className="size-4 text-brand-dark" aria-hidden />{t.usernameTitle}</span>}>
        <form onSubmit={onUsername} className="space-y-4">
          <p className="text-sm text-muted">{t.usernameHelp}</p>
          <Field label={t.username}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={32}
              pattern="[A-Za-z0-9._\-]{3,32}"
              dir="ltr"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className={inputCls}
            />
          </Field>
          <Field label={t.currentPassword}>
            <input type="password" value={namePassword} onChange={(e) => setNamePassword(e.target.value)} required dir="ltr" autoComplete="current-password" className={inputCls} />
          </Field>
          <Message result={nameResult} t={t} okText={t.savedUsername} />
          <button type="submit" disabled={nameBusy} className={btnCls}>{nameBusy ? t.saving : t.saveUsername}</button>
        </form>
      </Card>

      <Card title={<span className="flex items-center gap-2"><KeyRound className="size-4 text-brand-dark" aria-hidden />{t.passwordTitle}</span>}>
        <form onSubmit={onPassword} className="space-y-4">
          <p className="text-sm text-muted">{t.passwordHelp}</p>
          <Field label={t.currentPassword}>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required dir="ltr" autoComplete="current-password" className={inputCls} />
          </Field>
          <Field label={t.newPassword}>
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} maxLength={72} dir="ltr" autoComplete="new-password" className={inputCls} />
          </Field>
          <Field label={t.confirmPassword}>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} maxLength={72} dir="ltr" autoComplete="new-password" className={inputCls} />
          </Field>
          <Message result={passResult} t={t} okText={t.savedPassword} />
          <button type="submit" disabled={passBusy} className={btnCls}>{passBusy ? t.saving : t.savePassword}</button>
        </form>
      </Card>
    </div>
  );
}
