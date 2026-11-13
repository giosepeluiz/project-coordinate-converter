import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SettingsProvider } from "@/components/settings-provider";
import { translator } from "@/i18n/messages";
import { getServerLang } from "@/i18n/server";
import { themeInitScript } from "@/lib/theme-script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const t = translator(lang);
  const title = t("appTitle");
  const description = t("metaDescription");
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://coordenadas.arqueirover.de"),
    title,
    description,
    applicationName: title,
    openGraph: { type: "website", locale: lang.replace("-", "_"), title, description, siteName: title },
    twitter: { card: "summary", title, description },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getServerLang();
  return (
    // suppressHydrationWarning: o script abaixo define data-theme antes do React,
    // e o idioma salvo nas configurações pode trocar o "lang" no navegador.
    <html lang={lang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <SettingsProvider serverLang={lang}>{children}</SettingsProvider>
      </body>
    </html>
  );
}
