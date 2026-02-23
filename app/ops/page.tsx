import Link from "next/link";
import { UpdateOpsPanel } from "@/app/components/update-ops-panel";

export default function OpsPage() {
  return (
    <main>
      <div className="container">
        <span className="badge">運用メンテナンス</span>
        <h1>税制データ更新オペレーション</h1>
        <p>年度ごとの税制・料率更新をここで管理できます。</p>
        <UpdateOpsPanel />
        <p className="small mt-12">
          変更対象: <code>/lib/tax-config.ts</code>, <code>/lib/prefectures.ts</code>
        </p>
        <p className="small mt-12">
          <Link href="/">トップページに戻る</Link>
        </p>
      </div>
    </main>
  );
}
