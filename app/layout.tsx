import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { getActiveDomainProduct } from "@/lib/active-domain";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const activeDomainProduct = getActiveDomainProduct();
const defaultTitle = activeDomainProduct
  ? `${activeDomainProduct.title} | ${activeDomainProduct.domain}`
  : "手取り給与計算アプリ | 年収から月の手取りを30秒で概算";
const defaultDescription = activeDomainProduct
  ? activeDomainProduct.oneLiner
  : "年収・職業区分・都道府県・年齢・扶養人数から、手取り年収と月の受取額を無料で試算できる給与計算アプリです。";
const siteName = activeDomainProduct ? activeDomainProduct.title : "手取り給与計算アプリ";
const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "EVzVuUX4kHV1DxBMQymdDthyb7VbvaUVh-ecCV3h_Os";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: defaultTitle,
  description: defaultDescription,
  openGraph: {
    title: siteName,
    description: defaultDescription,
    type: "website",
    locale: "ja_JP",
    siteName,
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
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const cloudflareAnalyticsToken = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN;

  return (
    <html lang="ja">
      <body>
        {adsenseClient ? (
          <Script
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
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
