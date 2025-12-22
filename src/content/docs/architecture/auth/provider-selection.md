---
title: 認証
description: 認証システムの設計と選定（Clerk）

---

## 結論

> **Status: 採用（暫定）**  
> 更新日: 2025-12-22  
> **Auth は Clerk。Organizations = RootTenant（企業境界）**

## 採用理由（要点）

- B2B マルチテナントで最重要なのは **企業境界**の確定
- Clerk Organizations は複数所属とアクティブ組織の概念がある
- 初期実装の工数を抑えられる

## RootTenant / Tenant の扱い

- **RootTenant（企業）= Clerk Organization**
- **Tenant（店舗/拠点）= アプリ内エンティティ**
  - 企業の下に複数の店舗がぶら下がる
  - **Org = 会社 / Tenant = 店舗** を混ぜない

## スタッフ（B側）と顧客（C側）

- **スタッフ（B側）:** Organization メンバーとして管理（role で権限制御）
- **顧客（C側）:** Organization には入れず、
  Convex 側で `rootTenantId` / `locationId` と紐付ける

## セキュリティ設計の最低ライン

- **リクエストごとに `rootTenantId = active org_id` を必ず確定**
- すべての読み書きで `rootTenantId` を検証する
- 例外（クロス企業集計など）は **専用ロール + 明示的な管理UI** だけに限定

詳細なルールは [Request Context](/architecture/tenancy/request-context) を参照。
