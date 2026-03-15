import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveDomainProduct } from "@/lib/active-domain";
import { DOMAIN_PRODUCTS } from "@/lib/domain-products";

export const metadata: Metadata = {
  title: "10ドメイン一括実装 | 収益化候補マイクロSaaS",
  description:
    "請求回収、税務、セキュリティ、予約CRMなど収益化しやすい10ジャンルをドメイン単位で実装した一覧。",
  alternates: {
    canonical: "/domains",
  },
};

export default function DomainsPage() {
  const activeDomainProduct = getActiveDomainProduct();
  if (activeDomainProduct) {
    notFound();
  }

  return (
    <main>
      <div className="container">
        <span className="badge">10ドメイン実装</span>
        <h1>収益化候補を別ドメインで10本展開</h1>
        <p>各リンク先で、想定顧客・MVP機能・価格モデル・収益シミュレーションまで確認できます。</p>

        <section className="card mt-20">
          <div className="seo-links">
            {DOMAIN_PRODUCTS.map((product) => (
              <Link key={product.slug} href={`/domains/${product.slug}`}>
                <strong>{product.title}</strong>
                <p className="small mt-8">{product.oneLiner}</p>
                <p className="small mt-8">公開ドメイン: {product.domain}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
