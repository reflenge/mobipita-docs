---
title: アプリケーション構成
description: Master AppとCustomer Appの分離構成について

---

[LINE ログインサンプル](https://neon-grid-wars.mosunset.com/messages?openExternalBrowser=1)

:::tip[現在の結論]
- Auth: Clerk（Organizations = RootTenant）
- DB / BaaS: Convex
- Storage: Convex File Storage（暫定）
- Deploy: Vercel（フロント） + Convex（バックエンドBaaS）

詳細は[Current Stack](/architecture/stack/current)を参照してください。
:::

## master2B2B2C 構成について

MobiPitaでは、マスター管理機能と顧客向け機能を分離した構成を検討しています。

$master \to B_1$ と $B_1 \to B_2 \to User$ を分ける。

```mermaid
graph TD
    Master["Master（マスター管理）"]
    Master --> RootTenantB["RootTenant（本部B）"]
    Master --> RootTenantC["RootTenant（本部C）"]
    RootTenantB --> LocationB1["Location：本部B 直営・高知駅前店"]
    RootTenantB --> LocationB2["Location：本部B 直営・本社ビル店"]
    RootTenantB --> TenantX["Tenant：運営者X社"]
    TenantX --> LocationX1["Location：X社・朝倉店"]
    TenantX --> LocationX2["Location：X社・南国インター店"]
    RootTenantB --> TenantY["Tenant：運営者Y社"]
    TenantY --> LocationY1["Location：Y社・須崎店"]
    subgraph "Notes"
        NoteRootTenant["RootTenant：0〜N個のTenant / 0〜N個のLocation（直営店）"]
        NoteTenant["Tenant：必ず1つのRootTenantに属する / 0〜N個のLocation（0店舗期間も可）"]
        NoteLocation["Location：RootTenant（直営店）またはTenant（フランチャイズ運営者）に属する"]
    end
```

:::note[テナント/店舗の関係]
- RootTenantは0〜N個のTenantを持てる
- RootTenantは0〜N個のLocation（直営店）を持てる
- Tenant（運営者）は必ず1つのRootTenantに属する
- Tenantは0〜N個のLocationを持てる（0店舗期間（準備中）もあり、1店舗でも複数店舗でもOK）
- Location（店舗）は必ずRootTenant（直営店）またはTenant（フランチャイズ運営者）のどちらかに属する
:::

## Master App

**ブランチ**: `main`

マスター管理画面（RootTenant向け）を提供するアプリケーションです。

- RootTenant（本部）向けの管理機能
- テナント管理、設定の一元管理
- 全体のレポート・分析機能

:::tip[検討中]
Master Appの具体的な機能範囲や実装方法は検討中です。
:::

## Customer App

**ブランチ**: `preview`, `development`, `dev-${feature-name}`

B2B2Cの各レイヤー（RootTenant → Tenant → Location → User）向けのアプリケーションです。

- サブドメインによるマルチテナント構成
- 各テナントごとの独立した環境

## Customer App の技術スタック（検討中）

### App（ホスティング）

**採用（暫定）**: `Vercel`（フロント）

マルチテナントサービスをホストするための環境が必要です。

**サブドメイン環境を使用**:
- `https://<会社>.mobipita.com` の形式
- 各テナントごとに独立したサブドメインを割り当て

:::tip[補足]
初期はVercelで開始し、成長に合わせてフロントの compute をAWSへ移行する戦略です。
詳細は[デプロイ](/architecture/deploy/strategy)を参照してください。
:::

### Auth（認証）

**採用（暫定）**: `Clerk`

**検討事項**:
- Organizations = RootTenant（企業境界）
- アクティブOrgから `rootTenantId` を確定する

:::tip[検討中]
詳細は[認証](/architecture/auth/provider-selection)と
[Request Context](/architecture/tenancy/request-context)を参照してください。
:::

### DB（データベース）

**採用（暫定）**: `Convex`

**検討事項**:
- すべての読み書きは関数経由でガードする
- `rootTenantId` で必ず分離する

:::tip[検討中]
データベース設計の詳細は[データベース設計](/architecture/db/database-design)を参照してください。
:::

### Storage（ストレージ）

**採用（暫定）**: `Convex File Storage`

**検討事項**:
- 大容量やCDN要件が出たら R2/S3 併用を検討する

:::tip[検討中]
詳細は[ストレージ](/architecture/storage/selection)を参照してください。
:::

### Payment（決済）

**選定**: `Stripe`（マーケットの運営となるとこっち一択）

**Stripe Connect** を使用してB2B2Cを実現します。

**検討除外**: `Polar` - 自分たちがセラーになること前提の決済サービスのため、今回は不採用

**Stripe Connect のアカウントタイプ（検討中）**:

1. **Standard Accounts**（手軽・Stripe任せ）
   - 特徴: 事業者（B）が自分でStripeアカウントを持ち、プラットフォームと連携します。
   - メリット: 本人確認やトラブル対応はStripeが直接事業者（B）と行います。開発工数が最も少ないです。
   - 向いている例: Shopifyのようなネットショップ作成サービス、SaaS連携。

2. **Express Accounts**（バランス型）
   - 特徴: Stripeが提供する簡易的なダッシュボードを、事業者（B）に提供できます。
   - メリット: プラットフォームのブランド感を保ちつつ、口座登録などの面倒なUIはStripeに任せられます。
   - 向いている例: Uber、Lyft、クラウドソーシングサイト。

3. **Custom Accounts**（完全制御）
   - 特徴: オンボーディング、管理画面、レポートをすべてプラットフォーム側で実装する代わりにコントロールは最大、責任も最大
   - メリット: ブランド統一性が最も高い
   - デメリット: 開発工数が最も多い

:::tip[検討中]
Stripe Connectの実装パターンは[Stripe Connect](/architecture/stripe/stripe-connect)を参照してください。
最終的なアカウントタイプの選定は実装フェーズで決定予定です。
:::
