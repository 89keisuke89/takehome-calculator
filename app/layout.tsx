import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { getActiveDomainProduct } from "@/lib/active-domain";
import { PwaRegister } from "./components/pwa-register";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const activeDomainProduct = getActiveDomainProduct();
const defaultTitle = activeDomainProduct
  ? `${activeDomainProduct.title} | ${activeDomainProduct.domain}`
  : "金融計算ツール総合サイト | 手取り・バイト給料・残業代・ローン計算";
const defaultDescription = activeDomainProduct
  ? activeDomainProduct.oneLiner
  : "手取り計算、バイト給料計算、残業代計算、ローン返済計算を無料で使える金融計算ツール集です。";
const siteName = activeDomainProduct ? activeDomainProduct.title : "金融計算ツール総合サイト";
const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "EVzVuUX4kHV1DxBMQymdDthyb7VbvaUVh-ecCV3h_Os";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: defaultTitle,
  description: defaultDescription,
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: siteName,
    description: defaultDescription,
    type: "website",
    locale: "ja_JP",
    siteName,
  },
  icons: {
    icon: [
      { url: "/icons/snake-192.svg", type: "image/svg+xml" },
      { url: "/icons/snake-512.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/snake-180.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  alternates: {
    canonical: "/",
  },
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
  const adBreakTestMode =
    process.env.NEXT_PUBLIC_ADBREAK_TEST_MODE ??
    (process.env.NODE_ENV === "production" ? undefined : "on");
  const admobInterstitialSlot = process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_SLOT;
  const admobRewardedSlot = process.env.NEXT_PUBLIC_ADMOB_REWARDED_SLOT;
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const cloudflareAnalyticsToken = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN;

  return (
    <html lang="ja">
      <head>
        <meta name="google-site-verification" content={googleSiteVerification} />
        <meta name="theme-color" content="#8b3f2f" />
      </head>
      <body>
        <PwaRegister />
        {adsenseClient ? (
          <>
            <Script
              async
              strategy="afterInteractive"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
              crossOrigin="anonymous"
              data-adbreak-test={adBreakTestMode}
              data-admob-interstitial-slot={admobInterstitialSlot}
              data-admob-rewarded-slot={admobRewardedSlot}
            />
            <Script id="ad-placement-api-init" strategy="afterInteractive">
              {`window.adsbygoogle = window.adsbygoogle || [];
window.adBreak = window.adBreak || function(o) { window.adsbygoogle.push(o); };
window.adConfig = window.adConfig || function(o) { window.adsbygoogle.push(o); };
window.adConfig({ preloadAdBreaks: 'on', sound: 'on' });`}
            </Script>
          </>
        ) : null}
        {gaMeasurementId ? (
          <>
            <Script
              async
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`}
            </Script>
          </>
        ) : null}
        {cloudflareAnalyticsToken ? (
          <Script
            defer
            strategy="afterInteractive"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: cloudflareAnalyticsToken })}
          />
        ) : null}
        {children}
        <footer className="site-footer">
          <div className="container footer-inner">
            <Link href="/privacy">プライバシーポリシー</Link>
            <Link href="/about">運営者情報</Link>
            {activeDomainProduct ? null : <Link href="/domains">10ドメイン一覧</Link>}
            {activeDomainProduct ? null : <Link href="/ops">運用ページ</Link>}
          </div>
        </footer>
      </body>
    </html>
  );
}
