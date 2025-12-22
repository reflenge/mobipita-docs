---
title: データベース設計
description: Convex 前提のデータ設計指針（マルチテナント安全設計）

---

## 結論

> **Status: 採用（暫定）**  
> 更新日: 2025-12-22  
> **全コレクションは rootTenantId（= Clerk Org）で境界付けする。**

## 必須の設計ルール（マルチテナント）

- すべてのドメインデータに **`rootTenantId` を必須**で持たせる
- 読み書き（Query/Mutation/Action）は必ず：
  - `activeOrgId` を取得
  - `rootTenantId === activeOrgId` を検証
- `tenantId`（店舗/拠点）は **rootTenant 配下の二次キー**

## データの分割原則（Convex 制約対応）

- 1レコード肥大化を避ける（ドキュメントサイズ等の制約に備える）
- 集計と明細を分割し、参照でつなぐ
- ファイルは File Storage へ逃がし、DB には参照だけ持つ

## インデックス方針

- すべての主要クエリは `rootTenantId` で絞り込める形にする
- 例: `rootTenantId + locationId + createdAt`

## 代表的なコレクション（例）

- rootTenants（企業メタ。Clerk Org の mirror）
- tenants（店舗/拠点）
- staffProfiles（従業員プロファイル）
- timeEntries（勤怠集計）
- punches（打刻明細）
- auditLogs（監査）

> rootTenants を DB に持つかは運用次第。  
> ただし **orgId を主キーとして扱い、別IDへ変換しない**。
