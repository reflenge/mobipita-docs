---
title: データベース
description: マルチテナントDBの設計と選定
sidebar:
  order: 3
---

:::caution[作業中]
このドキュメントは現在**作業中**です。データベース設計は検討段階であり、ORMの選定や実装方法は確定していません。
:::

## クイックスタート

データベース設計の理解を深めるための推奨読書順序：

1. **[データベース設計](/architecture/db/database-design)** - 設計パターンの理解
2. **[データベース選定](/architecture/db/database-selection)** - データベースの選定
3. **[ORM選定](/architecture/db/orm-selection)** - ORMの選定と実装方法

---

## 目次

- [概要](#概要)
- [主要なドキュメント](#主要なドキュメント)
  - [データベース設計](#データベース設計)
  - [データベース選定](#データベース選定)
  - [ORM選定](#orm選定)
- [設計原則](#設計原則)
- [推奨構成](#推奨構成)

---

## 概要

MobiPitaでは、マルチテナントアーキテクチャとして**プールモデル（完全共有・論理分離）**を採用しています。

現代の一般的なSaaSやプラットフォーム開発では「物理的には分けず、論理的に分ける（共有する）」のが主流です。全テナントが同じDB、同じストレージを使用し、`tenant_id`による論理的な分離を行います。

### データベース設計の特徴

- **プールモデル**: 全テナントが同じDBを使用
- **論理的分離**: `tenant_id`によるデータ分離
- **RLS対応**: PostgreSQLのRow Level Securityによるセキュリティ
- **コスト効率**: テナントごとのインフラ不要

---

## 主要なドキュメント

### データベース設計

**ファイル**: [データベース設計](/architecture/db/database-design)

マルチテナントDBの設計パターンについて解説します。

#### 主要な内容

- **プールモデル（完全共有・論理分離）** ★推奨・主流
  - 全テナントが同じDB、同じストレージを使用
  - `tenant_id`による論理的な分離
  - コストが最も安く、運用が楽
- **サイロモデル（完全分離・物理分離）**
  - テナントごとに個別のDBインスタンス
  - 高セキュリティ要件向け
- **ブリッジモデル（ハイブリッド）**
  - スキーマ（Databaseの中の部屋）だけ分ける
  - 中間的なアプローチ
- **RLS（Row Level Security）パターン**
  - PostgreSQLでの推奨実装
  - DBレベルのセキュリティ確保
- **Schema分離パターン**
  - もう一つの選択肢
  - テナントごとにスキーマを作成

[詳細を見る →](/architecture/db/database-design)

---

### データベース選定

**ファイル**: [データベース選定](/architecture/db/database-selection)

PostgreSQL/Supabase、MySQL、DynamoDBなどのデータベース選定について解説します。

#### 主要な内容

- **PostgreSQL / Supabase**
  - RLSによる強力なセキュリティ機能
  - 豊富なエコシステム
  - 推奨選定
- **MySQL**
  - 広く使われており、ドキュメントが豊富
  - RLSのようなDBレベルのセキュリティ機能がない
- **DynamoDB**
  - NoSQLデータベース
  - サーバーレスで自動スケーリング
  - リレーショナルデータモデルとの相性が悪い

[詳細を見る →](/architecture/db/database-selection)

---

### ORM選定

**ファイル**: [ORM選定](/architecture/db/orm-selection)

Prisma、Drizzle ORM、TypeORMなどのORM選定について解説します。

#### 主要な内容

- **Drizzle ORM** ★推奨
  - TypeScriptファーストの軽量ORM
  - パフォーマンスが良い
  - マルチテナント実装が比較的簡単
- **Prisma**
  - 最も人気のあるTypeScript ORM
  - 型安全性が非常に高い
  - 豊富なドキュメントとコミュニティ
- **TypeORM**
  - デコレータベースのORM
  - 広く使われている
- **マルチテナント実装のアプローチ**
  - アプローチA: アプリ側で制御（最も一般的・簡単）
  - アプローチB: RLSを利用（堅牢だが実装難易度・高）

[詳細を見る →](/architecture/db/orm-selection)

## 設計原則

本プロジェクトのデータベース設計では、以下の原則に従っています：

1. **コスト効率**: テナントごとにインフラを立ち上げず、共有リソースを使用
2. **セキュリティ**: RLSによるDBレベルのデータ分離
3. **スケーラビリティ**: `tenant_id`で分ける方式により、数万テナントまで対応可能
4. **運用性**: DBのバージョンアップが1回で済む

## 推奨構成

**推奨: PostgreSQL / Supabase + Drizzle ORM**

- **データベース**: PostgreSQL（Supabase経由）
- **設計パターン**: プールモデル + RLS
- **ORM**: Drizzle ORM（アプリ側制御）

詳細は各ドキュメントを参照してください。

:::tip[次のステップ]
データベース設計の理解を深めるには、以下の順序でドキュメントを読むことを推奨します：

1. [データベース設計](/architecture/db/database-design) - 設計パターンの理解
2. [データベース選定](/architecture/db/database-selection) - データベースの選定
3. [ORM選定](/architecture/db/orm-selection) - ORMの選定と実装方法
:::
