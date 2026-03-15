import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SnakeGame } from "@/app/components/snake-game";
import { getActiveDomainProduct } from "@/lib/active-domain";

export const metadata: Metadata = {
  title: "Snakeミニゲーム | 手取り給与計算アプリ",
  description: "クラシックなSnakeをブラウザで遊べるミニゲームページです。",
  alternates: {
    canonical: "/games/snake",
  },
};

export default function SnakePage() {
  const activeDomainProduct = getActiveDomainProduct();
  if (activeDomainProduct) {
    notFound();
  }

  return (
    <main>
      <div className="container">
        <span className="badge">ミニゲーム</span>
        <h1>Snake</h1>
        <p>クラシックルールのSnakeです。壁か自分に当たるまでスコアを伸ばせます。</p>
        <p className="small mt-12">スマホではブラウザの「ホーム画面に追加」でアプリ表示で遊べます。</p>
        <SnakeGame />
        <p className="small mt-12">
          <Link href="/">トップに戻る</Link>
        </p>
      </div>
    </main>
  );
}
