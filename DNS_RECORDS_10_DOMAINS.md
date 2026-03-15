# 10ドメイン DNS設定

Cloudflare Pages カスタムドメインは追加済みです。  
現在は全件 `pending (CNAME record not set)` のため、DNSプロバイダ側で CNAME を設定してください。

## apex (ルート) レコード

| Domain | Type | Name | Target |
|---|---|---|---|
| receivable-flow.com | CNAME | @ | receivable-flow.pages.dev |
| solo-taxdesk.com | CNAME | @ | solo-taxdesk.pages.dev |
| privacy-ops-us.com | CNAME | @ | privacy-ops-us.pages.dev |
| ai-governance-lab.com | CNAME | @ | ai-governance-lab.pages.dev |
| secure-lite-ops.com | CNAME | @ | secure-lite-ops.pages.dev |
| power-plan-lab.com | CNAME | @ | power-plan-lab.pages.dev |
| niche-booking-crm.com | CNAME | @ | niche-booking-crm.pages.dev |
| petcare-suite.com | CNAME | @ | petcare-suite.pages.dev |
| renew-watch.com | CNAME | @ | renew-watch.pages.dev |
| cashflow-radar.com | CNAME | @ | cashflow-radar.pages.dev |

補足:

- DNSプロバイダが apex CNAME 非対応なら `ALIAS` / `ANAME` で同じターゲットを設定
- 既存の A/AAAA/CNAME（@）がある場合は競合するため整理が必要

## www レコード（推奨）

| Domain | Type | Name | Target |
|---|---|---|---|
| receivable-flow.com | CNAME | www | receivable-flow.pages.dev |
| solo-taxdesk.com | CNAME | www | solo-taxdesk.pages.dev |
| privacy-ops-us.com | CNAME | www | privacy-ops-us.pages.dev |
| ai-governance-lab.com | CNAME | www | ai-governance-lab.pages.dev |
| secure-lite-ops.com | CNAME | www | secure-lite-ops.pages.dev |
| power-plan-lab.com | CNAME | www | power-plan-lab.pages.dev |
| niche-booking-crm.com | CNAME | www | niche-booking-crm.pages.dev |
| petcare-suite.com | CNAME | www | petcare-suite.pages.dev |
| renew-watch.com | CNAME | www | renew-watch.pages.dev |
| cashflow-radar.com | CNAME | www | cashflow-radar.pages.dev |
