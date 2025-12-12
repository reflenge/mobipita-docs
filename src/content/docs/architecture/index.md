---
title: アーキテクチャ
description: システムの設計思想とアーキテクチャパターン
# sidebar:
#   order: 0
---

:::caution[作業中]
このドキュメントは現在**作業中**です。記載されているアーキテクチャ設計は検討段階であり、実装前に変更される可能性があります。
:::

## クイックスタート

MobiPitaのアーキテクチャを理解するための推奨読書順序：

1. **[テナントモデル](/architecture/tenant-model)** - 基本的なデータモデルの理解
2. **[Stripe Connect](/architecture/stripe/stripe-connect)** - 決済システムの実装方法
3. **[データベース設計](/architecture/db/database-design)** - データの保存方法とセキュリティ

---

## 目次

- [概要](#概要)
- [主要な設計パターン](#主要な設計パターン)
  - [テナントモデル](#テナントモデル)
  - [Stripe Connect](#stripe-connect)
  - [データベース設計](#データベース設計)
  - [認証](#認証)
  - [ストレージ](#ストレージ)
  - [デプロイ](#デプロイ)
  - [バックエンド](#バックエンド)
- [アーキテクチャの全体像](#アーキテクチャの全体像)
- [設計原則](#設計原則)

---

## 概要

MobiPitaは、フランチャイズ型ビジネス向けのB2B2Cプラットフォームです。本セクションでは、システムの設計思想とアーキテクチャパターンについて解説します。

### アーキテクチャの特徴

- **マルチテナント設計**: RootTenant / Tenant / Locationの3層構造
- **柔軟なビジネスモデル対応**: 直営・フランチャイズ・混在パターンに対応
- **セキュアなデータ分離**: RLSによるDBレベルのセキュリティ
- **自動化された決済**: Stripe Connectによるロイヤリティ分配

---

## 主要な設計パターン

### テナントモデル

**ファイル**: [テナントモデル](/architecture/tenant-model)

RootTenant、Tenant、Locationの関係性と、様々なビジネスパターンに対応する設計について解説します。

#### 主要な内容

- **基本概念**: RootTenant、Tenant、Locationの定義
- **RootTenant周りのパターン**:
  - R-1: 直営のみ（Tenantなし）
  - R-2: 直営 + フランチャイズ混在
  - R-3: フランチャイズのみ
- **Tenant周りのパターン**:
  - T-1: 1運営者 = 1店舗
  - T-2: 1運営者 = 複数店舗
  - T-3: 運営者はいるが店舗がない（準備中）
- **アプリケーション側の設計ルール**: データモデルの関係性

[詳細を見る →](/architecture/tenant-model)

---

### Stripe Connect

**ファイル**: [Stripe Connect](/architecture/stripe/stripe-connect)

Stripe Connectによる決済システムの設計について解説します。

#### 主要な内容

- Connected Accountの設計パターン
  - パターンA: TenantだけをConnected Accountにする
  - パターンB: RootTenantとTenant両方をConnected Accountにする（推奨）
  - パターンC: RootTenantだけConnected、Tenantはアプリ内の概念
- Express AccountとCustom Accountの選択
- ロイヤリティ分配の実装

関連ドキュメント: [アカウントタイプ](/architecture/stripe/account-types)

[詳細を見る →](/architecture/stripe/stripe-connect)

---

### データベース設計

**ファイル**: [データベース設計](/architecture/db/database-design)

マルチテナントDBの設計パターンと選定について解説します。

#### 主要な内容

- マルチテナントDBの設計パターン
  - プールモデル（完全共有・論理分離）★推奨
  - サイロモデル（完全分離・物理分離）
  - ブリッジモデル（ハイブリッド）
  - RLS（Row Level Security）パターン

関連ドキュメント: [データベース選定](/architecture/db/database-selection)、[ORM選定](/architecture/db/orm-selection)

[詳細を見る →](/architecture/db/database-design)

---

### 認証

**ファイル**: [認証](/architecture/auth/provider-selection)

認証システムの設計と選定について解説します。

#### 主要な内容

- Clerk（検討中）: マルチテナント対応のOrganizations機能
- Better Auth（検討中）: オープンソースの認証ライブラリ
- マルチテナント対応の実装方法

[詳細を見る →](/architecture/auth/provider-selection)

---

### ストレージ

**ファイル**: [ストレージ](/architecture/storage/selection)

オブジェクトストレージの設計と選定について解説します。

#### 主要な内容

- AWS S3（検討中）: 業界標準のオブジェクトストレージ
- Cloudflare R2（検討中）: S3互換API、データ転送量が無料
- マルチテナント対応の実装方法

[詳細を見る →](/architecture/storage/selection)

---

### デプロイ

**ファイル**: [デプロイ](/architecture/deploy/strategy)

デプロイ戦略とインフラ選定について解説します。

#### 主要な内容

- Vercel（検討中）: 初期段階での開発速度最大化
- AWS（検討中）: 移行先としてのコスト最適化
- 移行ロードマップ

[詳細を見る →](/architecture/deploy/strategy)

---

### バックエンド

**ファイル**: [バックエンド](/architecture/backend/selection)

バックエンドサービスの設計と選定について解説します。

#### 主要な内容

- Convex（検討中）: リアルタイムデータベースとサーバーレス関数
- リアルタイム機能の実装
- マルチテナント対応の実装方法

[詳細を見る →](/architecture/backend/selection)

---

## アーキテクチャの全体像

MobiPitaのアーキテクチャは、以下の主要な設計パターンで構成されています：

### 1. テナントモデル

フランチャイズ型ビジネスの複雑な階層構造を表現するため、**RootTenant（本部）**、**Tenant（運営者）**、**Location（店舗）**の3層構造を採用しています。

このモデルにより、以下のような柔軟な構成が可能です：
- 直営店のみの本部
- 直営店とフランチャイズ店が混在する本部
- フランチャイズ店のみの本部

詳細は[テナントモデル](/architecture/tenant-model)を参照してください。

### 2. 決済システム

B2B2Cプラットフォームとして、**Stripe Connect**を使用して決済を実現します。

主な設計ポイント：
- RootTenantとTenantの両方をConnected Accountとして扱う
- Locationはアプリ内メタデータとして管理
- ロイヤリティの自動分配

詳細は[Stripe Connect](/architecture/stripe/stripe-connect)を参照してください。

### 3. データベース設計

マルチテナントアーキテクチャとして、**プールモデル（完全共有・論理分離）**を採用しています。

主な設計ポイント：
- 全テナントが同じDB、同じストレージを使用
- `tenant_id`による論理的な分離
- RLS（Row Level Security）によるセキュリティ確保

詳細は[データベース設計](/architecture/db/database-design)を参照してください。

### 4. 認証システム

マルチテナント対応の認証システムを検討しています。

主な設計ポイント：
- Clerk / Better Auth（検討中）による認証
- マルチテナント対応の実装方法
- 階層的な権限管理

詳細は[認証](/architecture/auth/provider-selection)を参照してください。

### 5. ストレージ

画像やファイルを保存するためのオブジェクトストレージを検討しています。

主な設計ポイント：
- AWS S3 / Cloudflare R2（検討中）
- マルチテナント対応のデータ分離
- コスト効率の良い設計

詳細は[ストレージ](/architecture/storage/selection)を参照してください。

### 6. デプロイ戦略

段階的なデプロイ戦略を検討しています。

主な設計ポイント：
- 初期段階: Vercel（検討中）で開発速度を最大化
- 移行先: AWS（検討中）でコスト最適化
- ベンダーロックイン回避

詳細は[デプロイ](/architecture/deploy/strategy)を参照してください。

### 7. バックエンド

リアルタイム機能やサーバーレス関数を提供するバックエンドサービスを検討しています。

主な設計ポイント：
- Convex（検討中）によるリアルタイム機能
- サーバーレス関数の設計
- マルチテナント対応の実装方法

詳細は[バックエンド](/architecture/backend/selection)を参照してください。

## 設計原則

本プロジェクトのアーキテクチャ設計では、以下の原則に従っています：

1. **柔軟性**: 様々なビジネスパターンに対応できる設計
2. **拡張性**: 成長に合わせてスケールできる構成
3. **セキュリティ**: テナント間のデータ分離を確実に実現
4. **保守性**: 理解しやすく、変更しやすい設計

:::tip[次のステップ]
アーキテクチャの理解を深めるには、以下の順序でドキュメントを読むことを推奨します：

1. [テナントモデル](/architecture/tenant-model) - 基本的なデータモデルの理解
2. [Stripe Connect](/architecture/stripe/stripe-connect) - 決済システムの実装方法
3. [データベース設計](/architecture/db/database-design) - データの保存方法とセキュリティ
4. [認証](/architecture/auth/provider-selection) - 認証システムの設計
5. [ストレージ](/architecture/storage/selection) - オブジェクトストレージの設計
6. [デプロイ](/architecture/deploy/strategy) - デプロイ戦略
7. [バックエンド](/architecture/backend/selection) - バックエンドサービスの設計
:::
