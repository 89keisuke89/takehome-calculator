import Link from "next/link";
import { UpdateOpsPanel } from "@/app/components/update-ops-panel";
import { generateWeeklySeoReport } from "@/lib/seo-report";

export default function OpsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const report = generateWeeklySeoReport(baseUrl);

  return (
    <main>
      <div className="container">
        <span className="badge">運用メンテナンス</span>
        <h1>税制データ更新オペレーション</h1>
        <p>年度ごとの税制・料率更新をここで管理できます。</p>
        <UpdateOpsPanel />
        <section className="card mt-20">
          <h2>週次SEOレポート（自動生成）</h2>
          <p className="small mt-8">生成日時: {report.generatedAt}</p>
          <p className="small mt-8">年収別ページ数: {report.totalPages}</p>
          <div className="list mt-20">
            {report.recommendedActions.map((action) => (
              <div className="list-item" key={action}>
                {action}
              </div>
            ))}
          </div>
          <details className="mt-20">
            <summary>レポート本文を表示</summary>
            <pre className="report-box mt-12">{report.markdown}</pre>
          </details>
        </section>
        <p className="small mt-12">
          変更対象: <code>/tax-config/*.json</code>, <code>/lib/prefectures.ts</code>
        </p>
        <p className="small mt-12">
          <Link href="/">トップページに戻る</Link>
        </p>
      </div>
    </main>
  );
}
