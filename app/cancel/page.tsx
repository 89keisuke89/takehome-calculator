import Link from "next/link";

export default function CancelPage() {
  return (
    <main>
      <div className="container card">
        <h1>決済を中止しました</h1>
        <p>プラン内容を確認して、準備ができたら再度お試しください。</p>
        <div className="form">
          <Link className="button secondary" href="/">
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
