import Link from "next/link";
import { DomainProduct } from "@/lib/domain-products";
import { DomainEconomicsSimulator } from "@/app/components/domain-economics-simulator";

type Props = {
  product: DomainProduct;
  showBackLink?: boolean;
};

export function DomainProductContent({ product, showBackLink = false }: Props) {
  return (
    <>
      <span className="badge">別ドメインMVP</span>
      <h1>{product.title}</h1>
      <p>{product.oneLiner}</p>
      <p className="small mt-12">公開ドメイン: {product.domain}</p>

      <section className="card mt-20">
        <h2>市場設定</h2>
        <div className="list mt-12">
          <div className="list-item">カテゴリ: {product.category}</div>
          <div className="list-item">対象顧客: {product.target}</div>
          <div className="list-item">価格モデル: {product.pricingModel}</div>
        </div>
      </section>

      <section className="card mt-20">
        <h2>解決する課題</h2>
        <div className="list mt-12">
          {product.keyProblems.map((problem) => (
            <div className="list-item" key={problem}>
              {problem}
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-20">
        <h2>MVP実装内容</h2>
        <div className="list mt-12">
          {product.mvpFeatures.map((feature) => (
            <div className="list-item" key={feature}>
              {feature}
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-20">
        <h2>ローンチ優先タスク</h2>
        <div className="list mt-12">
          {product.launchChecklist.map((task) => (
            <div className="list-item" key={task}>
              {task}
            </div>
          ))}
        </div>
      </section>

      <DomainEconomicsSimulator defaults={product.economicsDefault} />

      {showBackLink ? (
        <p className="small mt-20">
          <Link href="/domains">10ドメイン一覧に戻る</Link>
        </p>
      ) : null}
    </>
  );
}
