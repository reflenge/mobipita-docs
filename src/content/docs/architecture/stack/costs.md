---
title: サービス費用
description: Clerk/Convex/Vercel/Stripe Connect の料金観点まとめ
---

## 結論

> **Status: 参考（随時更新）**
> 更新日: 2025-12-24
> 2025-12-24 時点の公式Pricing情報をベースに整理。見積り時は必ず最新の公式情報を確認する。

## 全体像（まず押さえるべき結論）

- **Stripe Connect**は月額固定ではなく、**決済発生分に応じた手数料**が中心（＋Connect固有のアカウント/送金手数料など）。([Stripe][1])
- **Vercel**は「プラン月額 + 超過分の使用量課金」。Hobbyは**個人・非商用**のみ。([Vercel][2])
- **Clerk**は「月額（Pro）+ MAU課金（一定数まで無料枠）」が中心。Organizationsや高度な認証は**Add-on**で増額しやすい。([Clerk][3])
- **Convex**は「月額0から開始」できるが、**帯域（特にファイル配信）**と**関数呼び出し**が増えると課金が見えやすい。([Convex][4])
- ファイル配信が増える想定なら、**Convex File Storage継続より R2/S3 + CDN**の方がコスト設計しやすい（R2は外向き転送無料が強い）。([Cloudflare Docs][5])

## 1) Auth / Identity：Clerk

### プランの骨格

- **Free**：$0/月
- **Pro**：**$25/月**（+ 追加使用量）([Clerk][3])

### “無料でどこまで”

- **MAU（Monthly Active Users）10,000 まで無料枠**（Free/Proともに「10,000 included」）
- 追加MAUは **$0.02 / MAU** ([Clerk][3])

### Organizations（RootTenant境界）で詰まりやすい点

- **Org Membership limit**：Freeは **5 members**、Pro（Organizations add-on）は **Unlimited members** 表示。([Clerk][3])
- **MAO（Monthly Active Orgs）**：**100 included / 追加 $1 per MAO**。([Clerk][3])
- **Custom roles / permissions** や **Domain restrictions / auto-invitations** などは **Enhanced Organizations add-on（$100/月）** 側に寄りやすい。([Clerk][3])

### Clerkで費用が増える典型トリガ

- B2Bで企業内ユーザーが増える → **MAU以外にOrg運用機能でAdd-onが必要**になりがち。([Clerk][3])
- SMSや多要素認証など高度な認証を追加。([Clerk][3])

## 2) DB / BaaS：Convex（読み書きはサーバー関数経由でガード）

### プランの骨格（“月額0でも開始”）

Convexは **Free**（$0）から開始でき、上位に **Professional $25/月** がある構造。([Convex][4])

### Free/Starterでの主要な無料枠（課金が出やすい項目）

- **Database storage**：1GB（Starterで超過 $0.20/GB/月）([Convex][4])
- **Function calls**：1M / 月（超過 $0.30 / 100万回）([Convex][4])
- **Bandwidth**：10GB（超過 $0.10/GB）([Convex][4])
- **File storage**：1GB（超過 $0.03/GB/月）([Convex][4])
- **File bandwidth**：10GB（超過 **$0.33/GB**）([Convex][4])

### 「全部サーバー関数経由でガード」のコスト観点

- 監査/権限チェック/整形を“毎回”やる設計ほど **関数呼び出し回数が伸びる**
- 単価は読みやすい（$0.30 / 100万回）([Convex][4])

## 3) Storage：Convex File Storage（暫定）→将来 R2/S3 検討

### Convex File Storageの注意点（コストが跳ねる場所）

- **保存容量**は安い（$0.03/GB/月）
- **配信帯域（File bandwidth）が $0.33/GB と高め**で、画像/添付のDLが増えると効きやすい。([Convex][4])

### Cloudflare R2（候補）— “配信が多い”なら強い

- **$0.015 / GB-month**（ストレージ）
- **Egress（外向き転送）無料**
- リクエスト課金：Class A **$4.50/100万**、Class B **$0.36/100万**
- 無料枠：10GB-month、Class A 100万、Class B 1000万。([Cloudflare Docs][5])

### AWS S3（候補）— “CDN/周辺機能”は強いが転送料に注意

- S3は **データ転送（特にインターネット向け転送）**が別建てになりやすい（例: 最初の100GB/月が無料など）。([Amazon Web Services, Inc.][6])
- 単価はリージョン/ストレージクラスで変動するため、最終見積りはAWSのPricing表/Calculatorで確定する。([Amazon Web Services, Inc.][7])

## 4) Deploy：Vercel（フロント） + Convex（バックエンド）

### Vercelのプラン（月額）

- **Hobby：$0/月**（ただし **個人・非商用のみ**）([Vercel][8])
- **Pro：$20/mo + additional usage** ([Vercel][2])
- **Enterprise：要問い合わせ** ([Vercel][2])

### 無料枠/制限で実務に効くところ

- Hobbyは月あたり **Data transfer 100GB** など上限が明示。([Vercel][8])
- Proは **Data transfer 1TB**、**Edge Requests 1000万** などが明示。([Vercel][2])
- ここを超えると「additional usage」に入るため、画像配信や大きなレスポンスが増えると要注意。([Vercel][2])

## 5) Payments：Stripe Connect（マーケットプレイス前提）

### Connect自体の料金モデル（代表例）

- 例: **$2 / monthly active account**
- 例: **0.25% + $0.50 per payout**

> 「月にアクティブな接続アカウント数」と「送金回数」で増える前提。([Stripe][1])

### 決済処理（日本アカウントの例）

- Stripeの日本向けPricingページに各種決済の料率が列挙。([Stripe][9])
- 例: コンビニ決済は **3.6%（最低¥120）**。([Stripe][10])

### 税（日本の消費税）

- **Connect等一部Stripe手数料に日本の消費税が適用**される旨が明記。([Stripeサポート][11])

## 「無料でどこまで行ける？」をこの構成に当てはめる（実務目線）

- **商用なら**：Vercelは原則 **Pro $20/mo〜**（Hobbyは非商用）。([Vercel][8])
- **Clerk**：MAUだけなら **1万MAUまで実質無料圏**だが、B2BのOrganizations運用で **Add-on費用が主戦場**になりやすい。([Clerk][3])
- **Convex**：MVPは $0開始しやすいが、**ファイル配信が増えるとConvex File bandwidthが効く** → その時点でR2/S3移行検討が合理的。([Convex][4])
- **Stripe Connect**：月額固定は小さめ/無しで始めやすいが、**売り手数と送金回数**でConnectコストが増える。([Stripe][1])

## 「あなたの想定規模」で月額を具体計算するなら（確認したい前提）

1. 初期の **MAU（ログインユーザー数/月）** と **企業数（MAO相当）**
2. 1企業あたり平均メンバー数（Orgメンバー）
3. アップロード総量（GB/月）と、ダウンロード配信量（GB/月）
4. Vercelのチーム人数（Pro課金の単位の扱いを含めて）
5. Stripe Connectの **売り手数（月にアクティブな接続アカウント数）** と **送金回数/月**

この5つが分かれば、上記の単価表からMVP〜成長期の月額レンジを算出できる。

[1]: https://stripe.com/connect/pricing "Pricing information | Stripe Connect"
[2]: https://vercel.com/pricing "Vercel Pricing: Hobby, Pro, and Enterprise plans"
[3]: https://clerk.com/pricing "Pricing"
[4]: https://www.convex.dev/pricing "Plans and Pricing"
[5]: https://developers.cloudflare.com/r2/pricing/ "Pricing · Cloudflare R2 docs"
[6]: https://aws.amazon.com/s3/pricing/ "S3 Pricing"
[7]: https://aws.amazon.com/jp/s3/pricing/ "S3 料金"
[8]: https://vercel.com/docs/plans/pro-plan "Vercel Pro Plan"
[9]: https://stripe.com/en-jp/pricing?utm_source=chatgpt.com "Pricing & Fees"
[10]: https://stripe.com/en-jp/pricing/local-payment-methods?utm_source=chatgpt.com "Local payment methods pricing"
[11]: https://support.stripe.com/questions/taxes-on-stripe-fees-for-businesses-in-japan?utm_source=chatgpt.com "Taxes on Stripe fees for businesses in Japan"
