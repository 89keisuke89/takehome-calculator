import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "運営者情報",
  description: "手取り給与計算アプリの運営者情報",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main>
      <div className="container">
        <section className="card">
          <h1>運営者情報</h1>
          <div className="list mt-20">
            <div className="list-item">サイト名: 手取り給与計算アプリ</div>
            <div className="list-item">運営者: kimura</div>
            <div className="list-item">所在地: 日本</div>
            <div className="list-item">公開URL: https://takehome-calculator.pages.dev</div>
            <div className="list-item">連絡先: contact.takehome.calculator@gmail.com</div>
          </div>

          <h2 className="mt-20">問い合わせ</h2>
          <p className="mt-8">
            内容確認のうえ、通常3営業日以内を目安に返信します。営業・勧誘目的の連絡には返信しない場合があります。
          </p>

          <h2 className="mt-20">サービスについて</h2>
          <p className="mt-8">
            本サイトは、年収に対する手取り額の概算を提供する情報サービスです。税務・法務・投資等の専門的助言を提供するものではありません。
          </p>
        </section>
      </div>
    </main>
  );
}
