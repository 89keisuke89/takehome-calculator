import type { MetadataRoute } from "next";
import { getActiveDomainProduct } from "@/lib/active-domain";

export default function manifest(): MetadataRoute.Manifest {
  const activeDomainProduct = getActiveDomainProduct();
  const appName = activeDomainProduct ? activeDomainProduct.title : "金融計算ツール総合サイト";
  const startUrl = "/";

  return {
    id: "/",
    name: appName,
    short_name: "金融計算",
    description: "手取り、バイト給料、残業代、ローン返済を無料で計算できる金融ツール集。",
    start_url: startUrl,
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    orientation: "portrait",
    background_color: "#f8f5ef",
    theme_color: "#8b3f2f",
    categories: ["finance", "utilities"],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: "手取り計算",
        short_name: "手取り",
        url: "/",
      },
      {
        name: "バイト給料計算",
        short_name: "バイト",
        url: "/parttime-pay",
      },
      {
        name: "残業代計算",
        short_name: "残業代",
        url: "/overtime-pay",
      },
      {
        name: "ローン返済計算",
        short_name: "ローン",
        url: "/loan",
      },
    ],
    icons: [
      {
        src: "/icons/snake-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/snake-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
      {
        src: "/icons/snake-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/snake-180.svg",
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],
  };
}
