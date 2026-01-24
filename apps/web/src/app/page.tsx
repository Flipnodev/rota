"use client";

import { useTranslation } from "@rota/i18n";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";

export default function Home() {
  const { t } = useTranslation("web");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to email service
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <PageHeader />

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t("hero.badge")}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            {t("hero.title1")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
              {t("hero.title2")}
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#beta"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("hero.cta")}
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 border border-zinc-800 text-white font-semibold rounded-lg hover:bg-white/5 transition-all"
            >
              {t("hero.learnMore")}
            </a>
          </div>
        </div>

        {/* App Preview Mock */}
        <div className="absolute right-0 top-32 hidden xl:block w-[400px]">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-500 text-lg">▶</span>
                </div>
                <div>
                  <div className="font-semibold">Push Day A</div>
                  <div className="text-sm text-zinc-500">Week 2 · Day 1</div>
                </div>
              </div>
              <div className="space-y-3">
                {["Bench Press", "Incline DB Press", "Cable Flyes"].map(
                  (exercise, i) => (
                    <div
                      key={exercise}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                    >
                      <span className="text-sm">{exercise}</span>
                      <span className="text-xs text-zinc-500">
                        {4 - i}×{8 + i * 2}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-16 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "50+", label: t("stats.programs") },
            { value: "500+", label: t("stats.exercises") },
            { value: "0", label: t("stats.distractions") },
            { value: "∞", label: t("stats.gains") },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 px-6 py-24 max-w-7xl mx-auto"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("features.title1")}
            <br />
            {t("features.title2")}
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "◎",
              title: t("features.smartPrograms.title"),
              description: t("features.smartPrograms.description"),
            },
            {
              icon: "▣",
              title: t("features.cleanSession.title"),
              description: t("features.cleanSession.description"),
            },
            {
              icon: "↗",
              title: t("features.progressive.title"),
              description: t("features.progressive.description"),
            },
            {
              icon: "◷",
              title: t("features.restTimers.title"),
              description: t("features.restTimers.description"),
            },
            {
              icon: "≡",
              title: t("features.history.title"),
              description: t("features.history.description"),
            },
            {
              icon: "⚡",
              title: t("features.offline.title"),
              description: t("features.offline.description"),
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl mb-4 group-hover:bg-white/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative z-10 px-6 py-24 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
              {t("philosophy.label")}
            </div>
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-relaxed mb-8">
              &ldquo;{t("philosophy.quote")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                {t("philosophy.highlight")}
              </span>
              .&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-px h-8 bg-zinc-700" />
              <span className="text-zinc-500">{t("philosophy.tagline")}</span>
              <div className="w-px h-8 bg-zinc-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Beta Signup Section */}
      <section id="beta" className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("beta.title")}
          </h2>
          <p className="text-zinc-400 mb-8">{t("beta.subtitle")}</p>

          {submitted ? (
            <div className="inline-flex items-center gap-2 px-6 py-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("beta.success")}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("beta.placeholder")}
                required
                className="flex-1 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
              >
                {t("beta.button")}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-zinc-500">
            &copy; 2026 ROTA. {t("footer.rights")}
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              {t("footer.contact")}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
