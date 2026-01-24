"use client";

import { useTranslation } from "@rota/i18n";
import Link from "next/link";

export function PageHeader() {
  const { t } = useTranslation("web");

  return (
    <>
      {/* Gradient background effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-zinc-900 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          ROTAFIT
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/#beta"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {t("nav.joinBeta")}
          </Link>
        </div>
      </nav>
    </>
  );
}
