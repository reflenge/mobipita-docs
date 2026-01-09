---
title: Current Stack Decision
description: このプロジェクトで「いま採用している」技術の単一の正（Single Source of Truth）
---

## 結論（Single Source of Truth）

> **Status: 採用（暫定）**  
> 更新日: 2025-12-22

### 採用（暫定）

- **Auth / Identity:** Clerk
  - **Organizations = RootTenant（企業境界）**
- **DB / BaaS:** Convex
  - すべての読み書きはサーバー関数経由でガードする
- **Storage:** Convex File Storage（暫定）
  - 大容量やCDN要件が出たら R2/S3 併用を再検討する
- **Deploy:** Vercel（フロント） + Convex（バックエンドBaaS）
- **Payments:** Stripe Connect

### ルール

- **他の設計ページがこの結論と矛盾したら、他のページが古い。**
- 各ページ冒頭に `Status / 更新日 / 採用方針` を記載する。
- 重要な判断変更は ADR に記録する（`/architecture/adr/`）。
