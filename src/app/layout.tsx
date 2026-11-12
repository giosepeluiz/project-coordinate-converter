import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { themeInitScript } from "@/lib/theme-script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const title = "Conversor de Coordenadas";
const description =
  "Converta coordenadas entre decimal e DMS e abra no Waze, Google Maps ou Apple Maps. Aceita links do Google Maps, Waze e Apple Maps.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://coordenadas.arqueirover.de"),
  title,
  description,
  applicationName: title,
  openGraph: { type: "website", locale: "pt_BR", title, description, siteName: title },
  twitter: { card: "summary", title, description },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: o script abaixo define data-theme antes do React.
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
