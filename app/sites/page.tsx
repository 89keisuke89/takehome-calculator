import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveDomainProduct } from "@/lib/active-domain";
import { DOMAIN_PRODUCTS } from "@/lib/domain-products";

export default function SitesHubPage() {
  const activeDomainProduct = getActiveDomainProduct();
  if (activeDomainProduct) {
    notFound();
  }

  return (
    <main>
      <div className="container">
        <span className="badge">別ドメイン展開</span>
        <h1>収益化候補サイトを10本実装</h1>
        <p>すべて個別ドメイン前提の企画ページとして実装済みです。</p>

        <section className="card mt-20">
          <div className="seo-links">
            {DOMAIN_PRODUCTS.map((site) => (
              <Link key={site.slug} href={`/domains/${site.slug}`}>
                <strong>{site.title}</strong>
                <p className="small mt-8">{site.oneLiner}</p>
                <p className="small mt-8">公開ドメイン: {site.domain}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
