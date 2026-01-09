---
title: アーキテクチャ
description: システムの設計思想とアーキテクチャパターン

---

## クイックスタート

MobiPitaのアーキテクチャを理解するための推奨読書順序：

1. **[Current Stack](/architecture/stack/current)** - 採用中の技術結論（SoT）
2. **[サービス費用](/architecture/stack/costs)** - スタックの料金観点まとめ
3. **[Request Context](/architecture/tenancy/request-context)** - テナント境界の最重要ルール
4. **[テナントモデル](/architecture/tenant-model)** - RootTenant / Tenant / Location の関係
5. **[Stripe Connect](/architecture/stripe/stripe-connect)** - 決済システムの実装方針
6. **[データベース設計](/architecture/db/database-design)** - Convex 前提の設計指針

---

## 現在の結論（要約）

- **Auth:** Clerk（Organizations = RootTenant）
- **DB / BaaS:** Convex
- **Storage:** Convex File Storage（暫定）
- **Deploy:** Vercel（フロント） + Convex（バックエンドBaaS）
- **Payments:** Stripe Connect

詳細は [Current Stack](/architecture/stack/current) を参照。

---

### サービス費用

**ファイル**: [サービス費用](/architecture/stack/costs)

Clerk/Convex/Vercel/Stripe Connect の料金観点と見積りの前提を整理します。

---

## 主要な設計パターン

### テナントモデル

**ファイル**: [テナントモデル](/architecture/tenant-model)

RootTenant、Tenant、Locationの関係性と、様々なビジネスパターンに対応する設計について解説します。

---

### Request Context（テナント境界の一本線）

**ファイル**: [Request Context](/architecture/tenancy/request-context)

毎リクエストで「どの企業として操作しているか」を確定し、漏洩を防ぐ手順を固定します。

---

### データベース設計（Convex）

**ファイル**: [データベース設計](/architecture/db/database-design)

Convex前提のデータ分離と関数ガードを中心に解説します。

---

### 実装設計メモ（TODO含む）

**ファイル**: [実装設計メモ](/architecture/implementation-notes)

実装に近い粒度の設計項目と、未確定のTODOを整理します。

---

### 認証

**ファイル**: [認証](/architecture/auth/provider-selection)

Clerk Organizations を RootTenant として使う前提を明文化します。

---

### ストレージ

**ファイル**: [ストレージ](/architecture/storage/selection)

Convex File Storage を暫定採用し、将来の併用案も整理します。

---

### デプロイ

**ファイル**: [デプロイ](/architecture/deploy/strategy)

Vercel + Convex で開始し、必要ならフロントの compute を移行します。

---

### バックエンド

**ファイル**: [バックエンド](/architecture/backend/selection)

Convex を中心にしたバックエンド方針をまとめます。

---

## 設計原則

1. **テナント境界の優先:** Org境界 + 関数ガードで漏洩を防ぐ
2. **変更容易性:** 移行の出口を意識した設計
3. **理解しやすさ:** 重要判断は SoT と ADR に集約する

:::tip[次のステップ]
アーキテクチャ全体を把握するには、まず [Current Stack](/architecture/stack/current) を起点に読むことを推奨します。
:::
