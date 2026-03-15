# Snake モバイル公開方針（2026-03-06）

## 方針（確定）

- Android: **TWA（Trusted Web Activity）** で Google Play 公開
- iOS: **WKWebView ラッパー（Capacitor系）** で App Store 公開
- 共通: ゲーム本体は `/games/snake` の Web 実装を単一ソースとして維持

## Android（TWA）リリース手順

1. 本番URLを確定（HTTPS必須）
2. PWA要件を満たす（manifest / service worker / icons）
3. `assetlinks.json` を本番ドメインに配置
4. TWAパッケージを作成し、Play Console にアップロード
5. 内部テスト -> クローズドテスト -> 本番公開

必要情報:

- `applicationId`（例: `com.example.snake`）
- 署名鍵（upload key）
- Play Console のアプリ名/説明/スクリーンショット

## iOS（ラッパー）リリース手順

1. WebViewラッパーを作成（WKWebView）
2. `/games/snake` を初期表示URLとして設定
3. iOS向け権限/ポリシー文言を設定
4. TestFlight で実機検証
5. App Store Connect で審査提出

必要情報:

- Bundle ID（例: `com.example.snake`）
- Apple Developer Program アカウント
- App Privacy の申告内容

## リリース前チェックリスト

- 画面回転: 縦持ちで問題なく操作できる
- タッチ操作: スワイプと画面ボタンの両方で遊べる
- PWA起動: ホーム画面追加後に standalone 表示される
- エラー耐性: オフライン時でもキャッシュ済み画面が開く
- 審査素材: アイコン、スクリーンショット、説明文が揃っている

## メモ

- Web側の機能追加はこのリポジトリで先行し、ストア側はラッパー更新のみで追従する。
