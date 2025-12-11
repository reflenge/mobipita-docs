---
title: Stripe
description: Stripe Connectによる決済システムの設計
sidebar:
  order: 2
---

:::caution[作業中]
このドキュメントは現在**作業中**です。Stripe Connectの実装パターンは検討段階であり、最終的な設計は確定していません。
:::

## クイックスタート

Stripe Connectの理解を深めるための推奨読書順序：

1. **[Stripe Connect](/architecture/stripe/stripe-connect)** - 基本概念と設計パターン
2. **[アカウントタイプの選択](/architecture/stripe/account-types)** - Express AccountとCustom Accountの選定

---

## 目次

- [概要](#概要)
- [主要なドキュメント](#主要なドキュメント)
  - [Stripe Connect](#stripe-connect)
  - [アカウントタイプの選択](#アカウントタイプの選択)
- [Stripe Connectの基本概念](#stripe-connectの基本概念)
- [推奨設計](#推奨設計)
- [実装前の検討事項](#実装前の検討事項)

---

## 概要

MobiPitaでは、B2B2Cプラットフォームとして**Stripe Connect**を使用して決済を実現します。

RootTenant / Tenant / Location モデルと Stripe Connect を組み合わせることで、柔軟で拡張性の高い決済システムを構築します。

### Stripe Connectの特徴

- **マルチテナント対応**: RootTenantとTenantの両方をConnected Accountとして扱う
- **自動分配**: ロイヤリティの自動分配が可能
- **柔軟な設計**: 様々なビジネスパターンに対応
- **セキュア**: Stripeのセキュリティ機能を活用

---

## 主要なドキュメント

### Stripe Connect

**ファイル**: [Stripe Connect](/architecture/stripe/stripe-connect)

RootTenant / Tenant / LocationモデルへのStripe Connectの適用方法について解説します。

#### 主要な内容

- **基本概念**: プラットフォーム、RootTenant、Tenant、Locationの関係
- **Connected Accountの設計パターン**:
  - **パターンA**: TenantだけをConnected Accountにする
    - 実装がシンプル
    - 本部へのロイヤリティがStripeで自動分配されない
  - **パターンB**: RootTenantとTenant両方をConnected Accountにする ★推奨
    - ロイヤリティまでStripe Connectで完結
    - RootTenantもTenantも自動で振り込み
  - **パターンC**: RootTenantだけConnected、Tenantはアプリ内の概念
    - 本部がすべての売上を一度受ける運営形態
- **テナントモデルへの適用**: R-1、R-2、R-3パターンへの適用方法
- **推奨設計**: ロイヤリティ分配の実装方法

[詳細を見る →](/architecture/stripe/stripe-connect)

---

### アカウントタイプの選択

**ファイル**: [アカウントタイプの選択](/architecture/stripe/account-types)

Express AccountとCustom Accountの選定について解説します。

#### 主要な内容

- **Express Account** ★初期段階で推奨
  - StripeがKYC・ダッシュボードを提供
  - 開発工数が少ない
  - KYCをStripeが担当
- **Custom Account**
  - プラットフォーム側で完全に実装
  - ブランド統一性が最も高い
  - 開発工数が最も多い
- **選定基準**: 開発工数、ブランド統一性、カスタマイズ性の比較

[詳細を見る →](/architecture/stripe/account-types)

## Stripe Connectの基本概念

本プロジェクトにおけるStripe Connectの構成要素は以下の通りです：

* **プラットフォーム**：MobiPitaのSaaS（Stripe の「プラットフォームアカウント」）
* **RootTenant**：本部（ブランド、本社）
* **Tenant**：本部と契約している運営者（フランチャイジーの会社など）
* **Location**：店舗（物理拠点、高知店・移動店舗1号車など）
* **エンドユーザー**：顧客（予約してお金を払う人）

Stripe Connect では、以下の仕組みで決済を管理します：

* **お金を最終的に受け取る主体 = 「Connectの connected account」**
* プラットフォームがお金を集めて、そこから「誰にいくら払うか」を API で制御する

詳細は[Stripe Connect](/architecture/stripe/stripe-connect)を参照してください。

## 推奨設計

RootTenant / Tenant / Location モデルと Stripe Connect を組み合わせる場合、以下の設計が推奨されます：

* **Stripe 上の「Connected Account」 = お金を最終的に受け取る本部・運営者**
  * 最小構成：TenantのみConnected
  * ロイヤリティまで自動化：RootTenant も Tenant もConnected

* **Location はアプリ内メタデータとして扱う**
  * Stripe には Location ID を metadata に含めるのみ
  * 店舗別売上管理はアプリ側のロジックで実装

* **支払いフロー**
  * プラットフォームでチャージ
  * Connect の「separate charges and transfers」で RootTenant / Tenant へ分配
  * プラットフォームは残りを自分の売上として保持

この設計により、柔軟で拡張性の高い決済システムを構築できます。

## 実装前の検討事項

実装前に、以下の点を確定する必要があります：

- 予約1件ごとにどの ID を Stripe の `metadata` に含めるか
- ロイヤリティ率をどこに持たせるか（RootTenant / Tenant / Location）
- Connected Accountの作成タイミング（オンボーディング時 vs 初回決済時）
- Express AccountとCustom Accountの選択基準
- ロイヤリティ率の設定方法と変更フロー
- エラーハンドリング（Transfer失敗時の処理）
- テスト環境でのStripe Connect設定

これらは実装フェーズで詳細化される予定です。

:::tip[次のステップ]
Stripe Connectの理解を深めるには、以下の順序でドキュメントを読むことを推奨します：

1. [Stripe Connect](/architecture/stripe/stripe-connect) - 基本概念と設計パターン
2. [アカウントタイプの選択](/architecture/stripe/account-types) - Express AccountとCustom Accountの選定
:::
