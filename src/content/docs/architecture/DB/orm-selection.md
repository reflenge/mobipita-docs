---
title: ORM選定
description: Prisma、Drizzle ORM、TypeORMなどのORM選定について
sidebar:
  order: 8
---

:::caution[作業中]
このドキュメントは現在**作業中**です。ORM選定は検討段階であり、最終的な選定は確定していません。
:::

## 概要

PostgreSQLを操作するために、**ORM（Object-Relational Mapping）**の選定が必要です。

選択するORMによって、RLSやテナント分離をコード上でどう実装するかが変わります。

## ORM候補の比較

### Drizzle ORM

**特徴:**
- TypeScriptファーストの軽量ORM
- SQLライクなAPI
- 型安全性が高い

**メリット:**
- パフォーマンスが良い
- 学習曲線が緩やか
- マイグレーション管理が柔軟

**デメリット:**
- 比較的新しいため、コミュニティが小さい
- ドキュメントが少ない場合がある

**マルチテナント実装:**

Drizzle ORM でマルチテナント（PostgreSQL）を実装する場合、大きく分けて**2つのアプローチ**があります。

RLS（DBレベルのセキュリティ）が推奨される一方で、**DrizzleのようなモダンなORMと標準的なPostgreSQL（Supabase以外）を組み合わせる場合、「アプリ側で制御する（WHERE句）」方が実装が簡単で一般的**です。

詳細は以下の実装パターンを参照してください。

#### アプローチA：アプリ側で制御（最も一般的・簡単）

DBにRLSを設定せず、Drizzleのクエリを書くたびに**必ず `where` でテナントIDを指定する**方法です。

**メリット:** 構成が単純。コネクションプールの管理を気にしなくて良い。

**デメリット:** `where` を書き忘れると他社のデータが見えてしまう（開発者の責任）。

**実装例:**

```typescript
import { pgTable, serial, text, uuid, timestamp } from 'drizzle-orm/pg-core';

// 全テーブル共通の「テナントIDカラム」の定義
const tenantIdColumn = uuid('tenant_id').notNull();

// テナントテーブル
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
});

// 商品テーブル（テナントIDを持つ）
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  // ここでテナントIDを使用
  tenantId: tenantIdColumn.references(() => tenants.id),
  createdAt: timestamp('created_at').defaultNow(),
});
```

```typescript
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { products } from './schema';

// 例: APIルート内での処理
async function getProducts(currentTenantId: string) {
  return await db
    .select()
    .from(products)
    // ★重要: ここで必ずテナントIDを絞り込む
    .where(eq(products.tenantId, currentTenantId));
}

async function updateProduct(currentTenantId: string, productId: number, newData: any) {
  return await db
    .update(products)
    .set(newData)
    // ★重要: 更新時も必ず「自分のテナント かつ その商品」であることを確認
    .where(
      and(
        eq(products.id, productId),
        eq(products.tenantId, currentTenantId)
      )
    );
}
```

#### アプローチB：RLSを利用（堅牢だが実装難易度・高）

PostgreSQLの強力なセキュリティ機能（RLS）を使い、**Drizzle側で `where` を書き忘れてもデータが出ないようにする**構成です。

**⚠️ 注意点:** Node.jsなどのサーバー環境では「コネクションプール（DB接続の使い回し）」を使用するため、単純に `SET app.current_tenant` を実行すると、**次の無関係なリクエストにテナントID設定が残ってしまう事故**が起きやすいです。これを防ぐために、必ず「トランザクション」内で処理を行う必要があります。

**実装例:**

```sql
-- RLS有効化
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ポリシー作成: 'app.current_tenant' という設定値と一致するものだけ許可
CREATE POLICY tenant_isolation ON products
USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

```typescript
import { sql } from 'drizzle-orm';
import { db } from './db';
import { products } from './schema';

async function getProductsSecurely(currentTenantId: string) {
  // トランザクションを使うことで、このブロック内だけの「設定」にする
  return await db.transaction(async (tx) => {

    // 1. セッション変数にテナントIDをセット（重要: LOCALをつける）
    await tx.execute(sql`SELECT set_config('app.current_tenant', ${currentTenantId}, true)`);

    // 2. 普通にクエリを実行（WHERE句を書かなくても絞り込まれる！）
    return await tx.select().from(products);

  });
}
```

### Prisma

**特徴:**
- 最も人気のあるTypeScript ORM
- 豊富なドキュメントとコミュニティ
- 強力なマイグレーション機能

**メリット:**
- 型安全性が非常に高い
- 開発者体験が良い
- 豊富なエコシステム

**デメリット:**
- パフォーマンスがDrizzleに比べて劣る場合がある
- スキーマ定義が複雑になる場合がある

**マルチテナント実装:**

Prismaでも同様に、アプリ側で制御する方法とRLSを利用する方法があります。

### TypeORM

**特徴:**
- デコレータベースのORM
- 広く使われている

**メリット:**
- デコレータによる直感的な定義
- 豊富な機能

**デメリット:**
- パフォーマンスが劣る場合がある
- 型安全性が他のORMに比べて低い

## 推奨選定

**推奨: Drizzle ORM**

理由:
1. パフォーマンスが良い
2. TypeScriptとの親和性が高い
3. マルチテナント実装が比較的簡単

**アプローチの選択:**

- **アプローチA（アプリ制御）が推奨される場合:**
  - ほとんどのWebアプリ開発で十分
  - コードが読みやすく、デバッグもしやすい
  - 「Drizzleで `where` を書き忘れる」リスクは、コードレビューや、必ず `tenantId` を要求する**ラッパー関数（Repositoryパターン）**を作ることで防止可能

- **アプローチB（RLS）が推奨される場合:**
  - Supabaseを使う場合（Supabase SDKが自動で処理）
  - 金融系など、セキュリティ要件が極めて高く「万が一の実装ミスも許されない」場合

## APIフレームワークとの連携

**APIのフレームワーク**の選定（例: Next.js の Server Actions / API Routes, Hono, Express など）により、「どうやってリクエストから安全に `tenantId` を取り出してORMに渡すか（Middlewareの設計）」の具体的な実装方法が変わります。

:::tip[実装前の検討事項]
以下の点は実装前に確定する必要があります：
- ORMの最終選定（Drizzle ORM / Prisma / TypeORM）
- RLSの採用可否（Supabase使用時は推奨）
- テナントIDの取得方法（認証情報から / サブドメインから / ヘッダーから）
- マイグレーション戦略
- Repositoryパターンの実装方法

これらは実装フェーズで詳細化される予定です。
:::
