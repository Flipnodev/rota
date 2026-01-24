import type { Metadata } from "next";
import "./globals.css";
import { WebI18nProvider } from "@/providers/i18n-provider";

export const metadata: Metadata = {
  title: "ROTA - Precision Training",
  description:
    "Your structured training partner. Plan-first workout app that helps you follow training programs, complete sessions smoothly, and track progress over time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <WebI18nProvider>{children}</WebI18nProvider>
      </body>
    </html>
  );
}
