---
title: マルチテナントのDB設計について
description: RLS と Schema分離の違い
sidebar:
  order: 3
---

:::caution[作業中]
このドキュメントは現在**作業中**です。データベース設計は検討段階であり、ORMの選定や実装方法は確定していません。
:::

結論から言うと、**現代の一般的なSaaSやプラットフォーム開発では「物理的には分けず、論理的に分ける（共有する）」のが主流**です。これを「マルチテナントアーキテクチャ」と呼びます。

ただし、「絶対に分けてはいけない」わけではなく、セキュリティ要件やコストによって3つのパターンから選択します。

以下に、それぞれの設計パターンと、**DB・Storage・Auth**それぞれの具体的な扱い方を解説します。

---

### 1. 主な3つの設計パターン

#### A. プールモデル（完全共有・論理分離） ★推奨・主流
* **仕組み:** 全テナントが**同じDB、同じストレージ**を使います。
* **区別方法:** 全てのデータに `tenant_id` （テナントID）というタグをつけて、「A社のデータはA社しか見れない」ようにプログラムやDBの機能で制御します。
* **メリット:** コストが最も安い。運用が楽（DBのバージョンアップが1回で済む）。
* **デメリット:** プログラムのバグで「他社のデータが見えてしまう」リスクがある（実装でカバー可能）。

#### B. サイロモデル（完全分離・物理分離）
* **仕組み:** テナントごとに**個別のDBインスタンス、個別のストレージ**を用意します。
* **メリット:** セキュリティが最強。A社の負荷がB社に影響しない。
* **デメリット:** コストが激増する。1000社いたら1000個のDBを管理・更新する必要があり、運用が地獄になる。
* **用途:** 銀行、医療、官公庁向けなど、極めて厳しいセキュリティ要件がある場合のみ。

#### C. ブリッジモデル（ハイブリッド）
* **仕組み:** DBのサーバーは一緒だが、「スキーマ（Databaseの中の部屋）」だけ分ける。
* **立ち位置:** AとBの中間。PostgreSQLなどでよく使われますが、最近はAの技術進化により減りつつあります。

---

### 2. 各コンポーネントごとの具体的な分け方（プールモデルの場合）

モダンな開発（Next.js, Supabase/Postgres, Clerkなど）を前提に、最も一般的な構成を説明します。

#### ① DB (Database)
* **物理構成:** 1つのデータベースを使用。
* **設計:** 全テーブルに `tenant_id` カラムを持たせます。
* **セキュリティ:**
    * **昔:** アプリのコードで `WHERE tenant_id = 'xxx'` を毎回書く（忘れがちで危険）。
    * **今:** **RLS (Row Level Security)** というDBの機能を使います。「ログイン中のユーザーの所属テナントIDと一致する行しか、DBレベルで返さない」という設定ができるため、アプリ側のミスでデータ漏洩することがなくなりました。

#### ② Storage (画像・ファイル)
* **物理構成:** AWS S3 などの1つのバケットを使用。
* **設計:** フォルダ（プレフィックス）で分けます。
    * 例: `/bucket-name/{tenant_id}/user-icon.png`
* **セキュリティ:** DB同様、ストレージのアクセスポリシーで「自分の `tenant_id` フォルダ以外はアクセス不可」に設定します。

#### ③ Auth (認証)
* **物理構成:** 1つの認証基盤（Auth0, Clerk, Cognitoなど）を使用。**テナントごとに認証サーバーを立てることはまずありません。**
* **設計:** 「ユーザー」と「組織（Organization/Team）」の概念を使います。
    * 1人のユーザーが複数のテナント（組織）に所属することも考慮します（Slackのワークスペース切り替えのようなイメージ）。
* **実装:** ログイン時に「どのテナントとしてログインするか」を選択させ、そのセッション中に `tenant_id` を保持し続けます。

---

### 3. どちらを選ぶべきか？

**基本的には「プールモデル（共有）」でスタートすることを強くお勧めします。**

理由は以下の通りです：

1.  **初期コスト:** テナントごとにインフラを立ち上げると、売上がないうちからインフラ費が嵩みます。
2.  **開発速度:** テナント作成のたびにAWS/GCPのAPIを叩いてリソースを作る処理を書くのは、非常に難易度が高いです。
3.  **スケーラビリティ:** `tenant_id` で分ける方式なら、数万テナントまでは同じ構成で耐えられます。

### 4. 実際のデータ構造イメージ（DB）

**users テーブル（全ユーザー共有）**
| id | email | name |
| :--- | :--- | :--- |
| u_1 | user@a.com | Alice |
| u_2 | user@b.com | Bob |

**tenants テーブル（店舗・企業）**
| id | name | plan |
| :--- | :--- | :--- |
| t_A | 株式会社A | Pro |
| t_B | 株式会社B | Free |

**orders テーブル（ここに `tenant_id` が入る）**
| id | **tenant_id** | amount | product |
| :--- | :--- | :--- | :--- |
| o_1 | **t_A** | 1000 | 椅子 |
| o_2 | **t_B** | 5000 | 机 |
| o_3 | **t_A** | 2000 | 棚 |

こうすることで、`SELECT * FROM orders WHERE tenant_id = 't_A'` とすれば、株式会社Aの注文だけが取得できます。

### データベース選定

PostgreSQL/Supabase, MySQL, DynamoDBなど、選択するデータベースによって、**「どうやって他社のデータが見えないようにガードするか（RLSの実装方法など）」**の具体的な実装方法が変わります。

PostgreSQLを採用する場合、現代のマルチテナント開発のデファクトスタンダード（事実上の標準）は、\*\*「Row Level Security (RLS) を使ったプールモデル」\*\*です。

これは、PostgreSQLがデータベースエンジンレベルで持っている強力なセキュリティ機能を利用する方法で、アプリケーションのコード（WHERE句）でのバグによるデータ漏洩を「強制的に」防ぐことができます。

以下に、PostgreSQLにおける概念、RLSの仕組み、そしてもう一つの選択肢であるスキーマ分離について解説します。

### 1\. 推奨：Row Level Security (RLS) パターン

**「全てのデータを1つの箱に入れ、RLSというセキュリティ機能により、各ユーザーには自分のデータしか見えなくする」** というアプローチです。SupabaseなどのモダンなBackend-as-a-Serviceもこの仕組みを採用しています。

#### 概念と設計思想

  * **物理構成:** 1つのデータベース、1つのスキーマ（`public`など）。
  * **論理構成:** 全テーブルに `tenant_id` カラムを追加。
  * **セキュリティ:** アプリケーションがSQLを投げる前に、「今のユーザーはテナントAの人です」とDBに伝えます。すると、DBは自動的にテナントAのデータだけをフィルタリングして返します。`SELECT * FROM orders` と書いても、他社のデータは物理的に存在しないかのように振る舞います。

#### 実装手順（SQLイメージ）

1.  **テーブル作成:** `tenant_id` を持たせます。

    ```sql
    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      tenant_id UUID NOT NULL, -- これが重要
      product_name TEXT
    );
    ```

2.  **RLSの有効化:** このテーブルでセキュリティ機能をONにします。

    ```sql
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    ```

3.  **ポリシーの作成（ここが心臓部）:**
    「`tenant_id` カラムが、現在のセッション設定 `app.current_tenant` と一致する行のみを表示する」というルールを作成します。

    ```sql
    CREATE POLICY tenant_isolation_policy ON orders
    USING (tenant_id = current_setting('app.current_tenant')::UUID);
    ```

4.  **実際の利用フロー:**
    アプリ側（APIサーバー）でクエリを投げる際、必ず最初に「テナントIDのセット」を行います。

    ```sql
    -- 1. トランザクション開始
    BEGIN;
    -- 2. 今のアクセスはテナントID '123' のものだと宣言
    SET LOCAL app.current_tenant = '123';
    -- 3. 普通に全件取得しようとする
    SELECT * FROM orders;
    -- 4. 結果: テナントID '123' のデータしか返ってこない！
    COMMIT;
    ```

### 2\. もう一つの選択肢：Schema（スキーマ）分離パターン

PostgreSQL特有の機能である「Schema（名前空間）」を利用して、**「テナントごとに部屋を分ける」** アプローチです。

#### 概念と設計思想

  * **物理構成:** 1つのデータベース。
  * **論理構成:** テナントごとにスキーマを作成します（例: `tenant_a.orders`, `tenant_b.orders`）。
  * **仕組み:** PostgreSQLの `search_path` という機能を使い、「今は `tenant_a` の部屋を見る」と設定すると、`SELECT * FROM orders` と書くだけで自動的に `tenant_a.orders` を見に行きます。

#### メリットとデメリット（RLSとの比較）

| 特徴 | RLS（行レベルセキュリティ） | Schema分離 |
| :--- | :--- | :--- |
| **データ分離強度** | 高（設定ミスさえなければ安全） | **最高**（部屋自体が違うので混ざりようがない） |
| **マイグレーション** | **楽**（1回コマンドを打てば全テナントに反映） | **地獄**（テナント数分ループして実行が必要） |
| **スケーラビリティ** | 数万〜数百万テナントでもOK | 数千テナントを超えるとDBの動作が重くなる可能性あり |
| **開発ツール対応** | Drizzle, Prisma等で扱いやすい | ツールによっては対応が複雑 |

### 3\. 結論：どちらを選ぶべきか

**95%のケースで、1番の「RLSパターン」をおすすめします。**

  * **理由1:** マイグレーション（DB構造の変更）が圧倒的に楽だからです。スキーマ分離を選ぶと、「カラムを1つ追加したいだけなのに、スクリプトを書いて1000個のスキーマに対してループ処理を実行し、途中でエラーが出たら...」という運用リスクを抱えることになります。
  * **理由2:** エコシステムがRLS前提になりつつあるからです（Supabaseなど）。

**スキーマ分離を選ぶべき例外:**

  * 「A社専用のデータを丸ごとバックアップして渡してほしい」という要望が頻繁にある場合。
  * テナントごとにテーブル構造そのものを変える必要がある場合（極めて稀）。

### ORMの選定

PostgreSQLを操作するために、**ORM（Object-Relational Mapping）**の選定が必要です。
（例: **Prisma, Drizzle ORM, TypeORM**, または素のSQLなど）

選択するORMによって、RLSやテナント分離をコード上でどう実装するかが変わります。

Drizzle ORM でマルチテナント（PostgreSQL）を実装する場合、大きく分けて**2つのアプローチ**があります。

RLS（DBレベルのセキュリティ）が推奨される一方で、**DrizzleのようなモダンなORMと標準的なPostgreSQL（Supabase以外）を組み合わせる場合、「アプリ側で制御する（WHERE句）」方が実装が簡単で一般的**です。

それぞれの実装パターンと、具体的なコード例を以下に示します。

-----

### 1\. アプローチA：アプリ側で制御（最も一般的・簡単）

DBにRLSを設定せず、Drizzleのクエリを書くたびに**必ず `where` でテナントIDを指定する**方法です。

  * **メリット:** 構成が単純。コネクションプールの管理（後述）を気にしなくて良い。
  * **デメリット:** `where` を書き忘れると他社のデータが見えてしまう（開発者の責任）。

#### Step 1: スキーマ定義 (`schema.ts`)

まず、再利用可能な `tenantId` の定義を作っておくのがベストプラクティスです。

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

#### Step 2: クエリの実装

Drizzleの `where` 句で、常に `tenantId` を絞り込みます。

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

-----

### 2\. アプローチB：RLSを利用（堅牢だが実装難易度・高）

PostgreSQLの強力なセキュリティ機能（RLS）を使い、**Drizzle側で `where` を書き忘れてもデータが出ないようにする**構成です。

**⚠️ 注意点:** Node.jsなどのサーバー環境では「コネクションプール（DB接続の使い回し）」を使用するため、単純に `SET app.current_tenant` を実行すると、**次の無関係なリクエストにテナントID設定が残ってしまう事故**が起きやすいです。これを防ぐために、必ず「トランザクション」内で処理を行う必要があります。

#### Step 1: SQLでのRLS設定（マイグレーション）

Drizzleの `sql` フォルダに手動でSQLを作成するか、マイグレーションファイルに直接記述します。

```sql
-- RLS有効化
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ポリシー作成: 'app.current_tenant' という設定値と一致するものだけ許可
CREATE POLICY tenant_isolation ON products
USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

#### Step 2: Drizzleでのクエリ実装（トランザクション必須）

Drizzleでクエリを投げる際は、**必ずトランザクションを開き、その中で「変数のセット」と「クエリ」をセットで実行**します。

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

### 3\. どちらを選ぶべきか？

開発フェーズやチームの習熟度に合わせて選択します。

  * **アプローチA（アプリ制御）が推奨される場合:**

      * ほとんどのWebアプリ開発で十分
      * コードが読みやすく、デバッグもしやすい
      * 「Drizzleで `where` を書き忘れる」リスクは、コードレビューや、必ず `tenantId` を要求する\*\*ラッパー関数（Repositoryパターン）\*\*を作ることで防止可能

  * **アプローチB（RLS）が推奨される場合:**

      * Supabaseを使う場合（Supabase SDKが自動で処理）
      * 金融系など、セキュリティ要件が極めて高く「万が一の実装ミスも許されない」場合

### APIフレームワークの選定

**APIのフレームワーク**の選定（例: Next.js の Server Actions / API Routes, Hono, Express など）により、「どうやってリクエストから安全に `tenantId` を取り出してDrizzleに渡すか（Middlewareの設計）」の具体的な実装方法が変わります。

:::tip[実装前の検討事項]
以下の点は実装前に確定する必要があります：
- ORMの最終選定（Drizzle ORM / Prisma / TypeORM）
- RLSの採用可否（Supabase使用時は推奨）
- テナントIDの取得方法（認証情報から / サブドメインから / ヘッダーから）
- マイグレーション戦略
- バックアップ・リストアの方法

これらは実装フェーズで詳細化される予定です。
:::
