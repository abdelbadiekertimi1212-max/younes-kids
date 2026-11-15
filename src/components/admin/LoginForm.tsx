"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { AdminText } from "@/i18n/admin";
import type { AdminAccountText } from "@/i18n/admin-account";
import { signIn } from "@/lib/actions/auth";

export function LoginForm({
  lang,
  t,
  acct,
}: {
  lang: Locale;
  t: AdminText["login"];
  acct: AdminAccountText["login"];
}) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn(identifier.trim(), password).catch(() => null);
    if (!res?.ok) {
      setError(res?.error === "notAdmin" ? t.notAdmin : res?.error === "rate" ? acct.rate : t.error);
      setLoading(false);
      return;
    }
    router.push(`/${lang}/admin`);
    router.refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-dark focus:ring-2 focus:ring-brand-light";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">{acct.identifier}</span>
        <input
          type="text"
          name="username"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          dir="ltr"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">{t.password}</span>
        <input
          type="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir="ltr"
          autoComplete="current-password"
          className={inputCls}
        />
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {loading ? t.signingIn : t.signIn}
      </button>
    </form>
  );
}
