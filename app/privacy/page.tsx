import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "手取り給与計算アプリのプライバシーポリシー",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main>
      <div className="container">
        <section className="card">
          <h1>プライバシーポリシー</h1>
          <p className="mt-12">
            本サイト（手取り給与計算アプリ）は、以下の方針に基づいて利用者情報を取り扱います。
          </p>

          <h2 className="mt-20">1. 取得する情報</h2>
          <p className="mt-8">
            本サイトは、アクセス解析および広告配信の目的で、Cookie等の識別子を利用する場合があります。
          </p>

          <h2 className="mt-20">2. 利用目的</h2>
          <p className="mt-8">
            取得した情報は、サービス改善、利用状況分析、広告配信および不正利用防止のために利用します。
          </p>

          <h2 className="mt-20">3. 広告について</h2>
          <p className="mt-8">
            本サイトは第三者配信の広告サービス（Google AdSense）を利用しています。広告配信事業者は利用者の興味に応じた広告を表示するためにCookieを使用することがあります。
          </p>

          <h2 className="mt-20">4. 外部送信・第三者提供</h2>
          <p className="mt-8">
            法令に基づく場合を除き、本人同意なく個人情報を第三者へ提供しません。
          </p>

          <h2 className="mt-20">5. 免責事項</h2>
          <p className="mt-8">
            本サイトの試算結果は概算であり、正確性・完全性を保証するものではありません。最終判断はご自身の責任で行ってください。
          </p>

          <h2 className="mt-20">6. 改定</h2>
          <p className="mt-8">本ポリシーは必要に応じて改定されることがあります。</p>

          <p className="small mt-20">制定日: 2026年2月23日</p>
        </section>
      </div>
    </main>
  );
}
