"use client";

import { FormEvent, useState } from "react";

export function EmailForm() {
  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error" | "loading">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, shopName })
    });

    const json = (await response.json()) as { message?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(json.message ?? "登録に失敗しました。時間をおいて再度お試しください。");
      return;
    }

    setStatus("ok");
    setMessage("無料登録が完了しました。初回レポートをメールで送信します。");
    setEmail("");
    setShopName("");
  };

  return (
    <form className="form" onSubmit={onSubmit}>
      <input
        name="shopName"
        value={shopName}
        onChange={(event) => setShopName(event.target.value)}
        placeholder="店舗名（任意）"
      />
      <input
        required
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="メールアドレス"
      />
      <button className="button" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "登録中..." : "無料で受け取る"}
      </button>
      {status === "ok" && <p className="status-ok">{message}</p>}
      {status === "error" && <p className="status-error">{message}</p>}
    </form>
  );
}
