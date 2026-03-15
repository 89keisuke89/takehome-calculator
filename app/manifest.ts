import type { MetadataRoute } from "next";
import { getActiveDomainProduct } from "@/lib/active-domain";

export default function manifest(): MetadataRoute.Manifest {
  const activeDomainProduct = getActiveDomainProduct();
  const appName = activeDomainProduct ? activeDomainProduct.title : "手取り給与計算アプリ";
  const startUrl = activeDomainProduct ? "/" : "/games/snake";

  return {
    id: "/games/snake",
    name: `${appName} | Snake`,
    short_name: "Snake",
    description: "クラシックなSnakeをスマホ/ブラウザで遊べるPWAミニゲーム。",
    start_url: startUrl,
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    orientation: "portrait",
    background_color: "#f8f5ef",
    theme_color: "#8b3f2f",
    categories: ["games", "entertainment"],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: "Snakeを起動",
        short_name: "Play",
        url: "/games/snake",
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
