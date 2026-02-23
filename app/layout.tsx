import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "手取り給与計算アプリ | 年収から月の手取りを30秒で概算",
  description:
    "年収・職業区分・都道府県・年齢・扶養人数から、手取り年収と月の受取額を無料で試算できる給与計算アプリです。",
  openGraph: {
    title: "手取り給与計算アプリ",
    description:
      "年収から手取り（年/ 月）をすばやく概算。社会保険料・所得税・住民税も内訳表示。",
    type: "website",
    locale: "ja_JP",
    siteName: "手取り給与計算アプリ",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;

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
        {children}
        <footer className="site-footer">
          <div className="container footer-inner">
            <Link href="/privacy">プライバシーポリシー</Link>
            <Link href="/about">運営者情報</Link>
            <Link href="/ops">運用ページ</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
