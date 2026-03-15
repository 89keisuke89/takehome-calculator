# 10ドメイン公開手順

同一コードベースから、10本の静的サイトを別ドメインで公開するための手順です。

## 1. 一括ビルド

```bash
npm run build:domains
```

出力先:

- `domain-out/receivable-flow.com/`
- `domain-out/solo-taxdesk.com/`
- `domain-out/privacy-ops-us.com/`
- `domain-out/ai-governance-lab.com/`
- `domain-out/secure-lite-ops.com/`
- `domain-out/power-plan-lab.com/`
- `domain-out/niche-booking-crm.com/`
- `domain-out/petcare-suite.com/`
- `domain-out/renew-watch.com/`
- `domain-out/cashflow-radar.com/`

## 2. ドメイン単体ビルド（確認用）

```bash
bash ./scripts/build-domain-sites.sh --only receivable-flow
```

## 3. ホスティングに配置

各ドメインごとに、対応する `domain-out/<domain>/` を静的ホスティングへアップロードします。

例:

- Project A (`receivable-flow.com`) -> `domain-out/receivable-flow.com/`
- Project B (`solo-taxdesk.com`) -> `domain-out/solo-taxdesk.com/`

## 4. Cloudflare Pagesへ一括デプロイ（自動）

前提:

- `CLOUDFLARE_API_TOKEN`（必須）
- `CLOUDFLARE_ACCOUNT_ID`（`ADD_CUSTOM_DOMAINS=1` のとき必須）

```bash
npm run deploy:cloudflare:all
```

補足:

- プロジェクト名は `slug` を使って作成されます（例: `receivable-flow`）
- `PAGES_PROJECT_PREFIX=prod-` を指定すると `prod-receivable-flow` のように作成
- `ADD_CUSTOM_DOMAINS=1` を付けると、Pages Custom Domain API も実行

## 5. DNS設定（共通）

1. 各ドメインの DNS でホスティング指定の CNAME/A レコードを追加
2. `www` を使う場合は `www` の CNAME も追加
3. SSL 有効化後に `https://<domain>/` へアクセスして確認

## 6. 公開後チェック

1. ルート `/` が対象ジャンルLPになること
2. `/about`, `/privacy`, `/sitemap.xml` が開けること
3. `view-source` で canonical / OG URL が対象ドメインになっていること
