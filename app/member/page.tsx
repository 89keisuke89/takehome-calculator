"use client";

import { FormEvent, useState } from "react";

type ContentItem = {
  title: string;
  body: string;
};

export default function MemberPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<ContentItem[]>([]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setItems([]);

    const response = await fetch("/api/member-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const payload = (await response.json()) as {
      message?: string;
      items?: ContentItem[];
    };

    if (!response.ok || !payload.items) {
      setError(payload.message ?? "コンテンツ取得に失敗しました。");
      setLoading(false);
      return;
    }

    setItems(payload.items);
    setLoading(false);
  };

  return (
    <main>
      <div className="container">
        <div className="card">
          <h1>会員限定ダイジェスト</h1>
          <p>課金に使ったメールアドレスで確認すると、会員向けの最新インサイトを表示します。</p>
          <form className="form" onSubmit={onSubmit}>
            <input
              required
              type="email"
              name="memberEmail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="会員メールアドレス"
            />
            <button className="button" type="submit" disabled={loading}>
              {loading ? "確認中..." : "会員コンテンツを表示"}
            </button>
          </form>
          {error && <p className="status-error mt-12">{error}</p>}
        </div>

        {items.length > 0 && (
          <section className="card mt-20">
            <h2>本日の配信内容</h2>
            <div className="list">
              {items.map((item) => (
                <article key={item.title} className="list-item">
                  <strong>{item.title}</strong>
                  <p className="mt-8">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
