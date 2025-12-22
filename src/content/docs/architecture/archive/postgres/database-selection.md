---
title: データベース選定
description: PostgreSQL/Supabase、MySQL、DynamoDBなどのデータベース選定について

---

## Archived

このページは **Postgres / RLS / ORM 前提**の過去案です。
現在の採用方針は Convex のため、参考資料として保存しています。

- 現在の結論: /architecture/stack/current
- 現行の設計指針: /architecture/db/database-design

---


## 概要

PostgreSQL/Supabase, MySQL, DynamoDBなど、選択するデータベースによって、**「どうやって他社のデータが見えないようにガードするか（RLSの実装方法など）」**の具体的な実装方法が変わります。

## PostgreSQLを採用する場合

PostgreSQLを採用する場合、現代のマルチテナント開発のデファクトスタンダード（事実上の標準）は、**「Row Level Security (RLS) を使ったプールモデル」**です。

これは、PostgreSQLがデータベースエンジンレベルで持っている強力なセキュリティ機能を利用する方法で、アプリケーションのコード（WHERE句）でのバグによるデータ漏洩を「強制的に」防ぐことができます。

詳細は[データベース設計](/architecture/db/database-design)の「Row Level Security (RLS) パターン」を参照してください。

## データベース候補の比較

### BaaS として (Convex)
詳細は[backend](/architecture/backend/selection)

### PostgreSQL (Supabase)

**特徴:**
- リレーショナルデータベース
- RLS（Row Level Security）による強力なセキュリティ機能
- 豊富なエコシステム（Prisma, Drizzle ORMなど）

**メリット:**
- マルチテナントアプリケーションに最適化された機能
- Supabaseを使用する場合、RLSの設定が容易
- 標準SQLに準拠

**デメリット:**
- スケーリングには注意が必要
- 複雑なクエリはパフォーマンスに影響する可能性

### MySQL

**特徴:**
- リレーショナルデータベース
- PostgreSQLと同様の機能を持つが、RLSはない

**メリット:**
- 広く使われており、ドキュメントが豊富
- パフォーマンスが良好

**デメリット:**
- RLSのようなDBレベルのセキュリティ機能がない
- アプリケーション側でのテナント分離が必須

### DynamoDB

**特徴:**
- NoSQLデータベース
- サーバーレスで自動スケーリング

**メリット:**
- 高いスケーラビリティ
- サーバーレスで運用が簡単

**デメリット:**
- リレーショナルデータモデルとの相性が悪い
- マルチテナント設計が複雑
- コストが高くなる可能性

## 推奨選定

**推奨: PostgreSQL / Supabase**

理由:
1. RLSによるDBレベルのセキュリティ確保が可能
2. マルチテナントアプリケーションに適した機能
3. 豊富なORMエコシステムとの互換性

詳細は[データベース設計](/architecture/db/database-design)を参照してください。

:::tip[実装前の検討事項]
以下の点は実装前に確定する必要があります：
- データベースの最終選定（PostgreSQL / Supabase / MySQL / DynamoDB）
- ホスティング先の選定（Neon / Supabase / AWS RDS / Cloudflare D1）
- RLSの採用可否（PostgreSQL/Supabase使用時は推奨）
- バックアップ・リストアの方法
- スケーリング戦略

これらは実装フェーズで詳細化される予定です。
:::
