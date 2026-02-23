"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startCheckout = async () => {
    if (!email) {
      setError("決済に使うメールアドレスを入力してください。");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const payload = (await response.json()) as { url?: string; message?: string };

    if (!response.ok || !payload.url) {
      setError(payload.message ?? "決済画面の作成に失敗しました。");
      setLoading(false);
      return;
    }

    window.location.href = payload.url;
  };

  return (
    <div className="form">
      <input
        required
        type="email"
        name="checkoutEmail"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="決済に使うメールアドレス"
      />
      <button className="button" type="button" onClick={startCheckout} disabled={loading}>
        {loading ? "遷移中..." : "有料プランを開始する"}
      </button>
      {error && <p className="status-error">{error}</p>}
    </div>
  );
}
