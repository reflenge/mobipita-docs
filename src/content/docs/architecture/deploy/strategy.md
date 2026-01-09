---
title: デプロイ
description: デプロイ戦略とインフラ選定（Vercel + Convex）

---

## 結論

> **Status: 採用（暫定）**  
> 更新日: 2025-12-22  
> **フロントは Vercel、バックエンドは Convex（BaaS）**

## 方針

- 環境は **dev / staging / prod** のみを分ける
- テナントごとに環境を分けない（論理分離で担保する）

## テナント識別（重要）

- サブドメインは **テナント識別の入口**として使う
- 最終的な境界は **Clerk のアクティブ Org** と一致させる
- 不一致の場合はブロックして選択を促す

## 移行戦略（Exit Strategy）

- Vercel から AWS への移行は **フロントの compute** が中心
- Convex は別管理（BaaS）として扱う
- もし Convex を退出する場合は、export/import を前提に計画する
