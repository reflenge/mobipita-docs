---
title: Request Context
description: 1リクエストで「どの企業(rootTenant)の操作か」を確定するルール
---

## 結論

> **Status: 採用（暫定）**  
> 更新日: 2025-12-22  
> **rootTenantId = Clerk のアクティブ Organization ID**

## 目的

- ユーザーが複数の企業に所属できる前提で設計する
- 毎リクエストで「今どの企業として操作しているか」を確定し、漏洩を防ぐ

## 確定手順（必須）

1. 認証済みである（user）
2. アクティブ組織がある（org）
3. `rootTenantId = org_id` をリクエストコンテキストに採用
4. 以降の読み書きは必ず `rootTenantId` を条件に含める

## テナント識別の優先順位

- **最優先:** Clerk のアクティブ Organization
- **補助情報:** サブドメイン / パス / クエリ
  - URLは「ユーザーに選ばせるための入口」として扱い、
    **アクティブOrgと一致しない場合は必ず選択を促す**

## R-2 混在（直営 + 加盟）での選択ルール

- rootTenant（本部）が直営Locationと加盟Tenantの両方を持つ
- 初回アクセス時に「企業 → 店舗（Location）」の選択を行い、
  以降の操作は `rootTenantId` + `locationId` で確定させる
- 直営店と加盟店は **同一RootTenant内の別カテゴリ**として扱う

## スタッフ（B側）と顧客（C側）の扱い

- **スタッフ（B側）:** Clerk Organization のメンバーとして管理（roleで権限制御）
- **顧客（C側）:** Organization には入れず、
  Convex 側で `rootTenantId` / `locationId` と紐付ける

> Org境界だけでは防げないため、**Convex 関数側で必ず検証する**ことが最終防衛線。
