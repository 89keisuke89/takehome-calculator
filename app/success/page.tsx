import Link from "next/link";

export default function SuccessPage() {
  return (
    <main>
      <div className="container card">
        <h1>決済が完了しました</h1>
        <p>登録メール宛に初期案内を送信します。24時間以内に届かない場合は再登録してください。</p>
        <div className="form">
          <Link className="button" href="/member">
            会員ページへ進む
          </Link>
          <Link className="button" href="/">
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
