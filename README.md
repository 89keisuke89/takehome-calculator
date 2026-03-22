# 金融計算ツール総合サイト / 10ドメインMVP

手取り計算、バイト給料計算、残業代計算、ローン返済計算をまとめた Next.js アプリです。  
低維持費運用を前提に、広告（Google AdSense）を配置できる構成にしています。

標準運用手順: `DEPLOY_PLAYBOOK.md`
別ドメイン公開手順: `MULTI_DOMAIN_DEPLOY.md`
モバイル公開方針: `ops/mobile-release-playbook.md`

## 1. セットアップ

```bash
npm install
cp .env.example .env.local
```

`.env.local` の最低設定:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_ADBREAK_TEST_MODE=on
NEXT_PUBLIC_ADMOB_INTERSTITIAL_SLOT=
NEXT_PUBLIC_ADMOB_REWARDED_SLOT=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN=
NEXT_PUBLIC_ACTIVE_DOMAIN_SLUG=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
PAGES_PROJECT_PREFIX=
PAGES_PRODUCTION_BRANCH=main
```

補足:

- `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT` 未設定時は広告枠プレースホルダーを表示します。
- `NEXT_PUBLIC_ADBREAK_TEST_MODE=on` で Ad Placement API のテスト広告モードになります（本番は `off` 推奨）。
- `NEXT_PUBLIC_ADMOB_INTERSTITIAL_SLOT` / `NEXT_PUBLIC_ADMOB_REWARDED_SLOT` はWebViewラッパー連携時のみ設定します。
- `NEXT_PUBLIC_ACTIVE_DOMAIN_SLUG` を設定すると、指定ドメイン用のトップページ表示に切り替わります（例: `receivable-flow`）。
- `CLOUDFLARE_API_TOKEN` は Cloudflare 一括デプロイ時に必須です。
- 既存の Supabase / Stripe API を使う場合は、同じ `.env.local` に各キーを設定してください。

## 2. 起動（通常モード）

```bash
npm run dev
```

- 計算ページ: `/`
- バイト給料計算: `/parttime-pay`
- 残業代計算: `/overtime-pay`
- ローン返済計算: `/loan`
- Snakeミニゲーム: `/games/snake`
- 年収別SEOページ: `/takehome/[年収(万円)]` 例: `/takehome/500`
- 運用ページ: `/ops`
- サイトマップ: `/sitemap.xml`

スマホでのPWAインストール:

1. `/games/snake` を開く
2. ブラウザメニューから「ホーム画面に追加」を実行
3. 追加後はアプリ表示（standalone）で起動

## 3. 別ドメインとして10本出力

```bash
npm run build:domains
```

生成先:

- `domain-out/<domain>/` に各ドメイン用の静的サイトが出力されます
- 例: `domain-out/receivable-flow.com/`, `domain-out/solo-taxdesk.com/`

単体ビルド:

```bash
bash ./scripts/build-domain-sites.sh --only receivable-flow
```

このモードでは `NEXT_PUBLIC_APP_URL` が各ドメイン値に上書きされ、`/` が該当ジャンルの専用LPになります。

## 4. AdSense 反映手順

1. Google AdSense でサイト審査を通す
2. パブリッシャーID（`ca-pub-...`）を `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT` に設定
3. `/app/components/ad-placement-experiment.tsx` と `/app/takehome/[salary]/page.tsx` の `slot` を実IDに差し替え

対象ファイル:

- `app/layout.tsx`
- `app/components/ad-placement-experiment.tsx`

## 5. SEO設定

SEOメタ情報は `/app/layout.tsx` の `metadata` で管理しています。

- title
- description
- canonical
- Open Graph

本番ドメイン切替時は `NEXT_PUBLIC_APP_URL` を必ず更新してください。

## 6. テスト

```bash
npm run test
npm run lint
npm run build
```

`tests/takehome.test.ts` で主要ケース（職業区分、年齢、都道府県補正、扶養）を検証します。

Snakeロジックは `tests/snake.test.ts` で検証します。

手動確認チェックリスト（Snake）:

- `/games/snake` にアクセスできる
- 矢印/WASD・盤面スワイプ・画面ボタンで移動できる
- スコア20/50到達でフェーズ表示が変わる（実力 -> 実力+運 -> 運重視）
- 紫の特殊フードで運イベント（大当たり/ハザード）が発生する
- `Pause/Resume` と `Restart` が動作する
- 壁・自己衝突でゲームオーバーになる
- ゲームオーバー時に広告復活（1回）できる
- 体力消費で開始制御され、時間経過と広告で回復できる
- ハイスコアが「ノー復活」「復活あり」で分かれて保持される（localStorage）
- AdSense有効時は `adBreak` API で実視聴判定後のみ報酬を付与する
- ホーム画面追加後にPWAとして起動できる

## 6.5 Cloudflare Pagesへ10本一括デプロイ

```bash
npm run deploy:cloudflare:all
```

`deploy:cloudflare:all` は `.env.local` を自動で読み込みます。

利用できる環境変数:

- `PAGES_PROJECT_PREFIX=prod-`（プロジェクト名の接頭辞）
- `SKIP_BUILD=1`（既存の `domain-out` を使ってデプロイ）
- `ADD_CUSTOM_DOMAINS=1`（Cloudflare APIでカスタムドメイン追加）

## 6.6 Search Console / AdSense運用ファイル

- Search Console URL Prefix: `ops/search-console-url-prefixes.txt`
- Search Console Sitemap: `ops/search-console-sitemaps.txt`
- AdSense申請チェック: `ops/adsense-submission-checklist.md`
- 集中上位3本: `ops/focus-top3.md`

## 7. 自動化済み項目

1. 年収別ページの自動生成（PV優先の10件固定）
   250万 / 300万 / 350万 / 400万 / 450万 / 500万 / 550万 / 600万 / 700万 / 800万
2. 年収ページのSEOタイトル/説明文テンプレ自動生成
3. 近い年収への内部リンク自動挿入
4. `sitemap.xml` の自動生成
5. FAQ構造化データ（JSON-LD）の自動挿入
6. 年次更新リマインド（ICS）とToDoテンプレ出力
7. 広告配置ABテストの継続学習（ローカル統計）
8. 週次SEOレポートの自動生成（`/ops`）

## 8. 年次更新チェック（税制改定対応）

税制データは JSON 化しているため、毎年の更新は `tax-config/*.json` の追加で対応できます。  
推奨タイミングは `毎年12月〜翌年1月`（例: `2026年12月〜2027年1月`）です。

確認項目:

1. 給与所得控除の区分・閾値
2. 基礎控除額（所得税 / 住民税）
3. 所得税の税率・控除額テーブル
4. 住民税の均等割額
5. 社会保険料率（会社員/個人事業主）

対象ファイル:

- `tax-config/2026.json`
- `tax-config/2027.json`
- `lib/prefectures.ts`

運用ルール:

1. 新年度が来たら `tax-config/20XX.json` を追加
2. 画面では税制年度を選択できるため、旧年度設定は残す
3. 運用ページ `/ops` のチェックリストで更新漏れを防ぐ
4. `/ops` から `.ics` をダウンロードして毎年リマインドを登録する
