---
title: Stripe Connect
description: 「RootTenant / Tenant / Location」モデルに、Stripe Connect をどう適用するか

---

## 基本概念

本プロジェクトにおけるStripe Connectの構成要素は以下の通りです：

* **プラットフォーム**：MobiPitaのSaaS（Stripe の「プラットフォームアカウント」）
* **RootTenant**：本部（ブランド、本社）
* **Tenant**：本部と契約している運営者（フランチャイジーの会社など）
* **Location**：店舗（物理拠点、高知店・移動店舗1号車など）
* **エンドユーザー**：顧客（予約してお金を払う人）

Stripe Connect では、以下の仕組みで決済を管理します：

* **お金を最終的に受け取る主体 = 「Connectの connected account」**
* プラットフォームが

  * お金を集めて
  * そこから「誰にいくら払うか」を API で制御する ([Stripe][1])

---

## Connected Account の設計パターン

以下の3つのパターンが考えられます：

### パターンA：Tenantだけを Connected Account にする

* **Connected Account = Tenant（運営者）**
* RootTenant（本部）は Stripe 上では「メタデータだけ」で、ロイヤリティは Stripe 外（請求書ベース）でやる

お金の流れ（1予約分）：

1. 高齢者が予約料金を支払う
2. プラットフォームアカウントで決済を受ける（PaymentIntent on platform）
3. そこから

   * **Tenant（運営者）Connected Account に Transfer**
   * プラットフォーム取り分（利用料）は「転送しないぶん」として自分に残す

RootTenantへのロイヤリティは：

* Stripe 外で「毎月の売上レポート」を見て請求書を出す
* or プラットフォームから RootTenant 宛てに、別の支払い手段で送金

**メリット**：実装がシンプル

**デメリット**：本部へのロイヤリティが Stripe で自動分配されない

---

### パターンB：RootTenant と Tenant 両方を Connected Account にする（多者分配）

ロイヤリティまで Stripe Connect で完結させたい場合に推奨されるパターンです。

* **Connected Account = RootTenant（本部）**
* **Connected Account = Tenant（運営者）**
* Location はあくまでアプリ側の「店舗メタデータ」

お金の流れ（1予約分）：

1. 高齢者が予約料金 10,000円を支払う
2. プラットフォームアカウントで決済（チャージ）を立てる

   * Connect の「separate charges and transfers」パターンを使うと、
     1つの支払いから複数の connected account へ分配できる ([Stripe ドキュメント][2])
3. 10,000円を分解して Transfer：

   * Tenant（運営者）へ：8,000円
   * RootTenant（本部）へ：1,000円（ロイヤリティ）
   * プラットフォーム取り分：1,000円（Transferしない分）

このときの Stripe 設計：

* 決済自体は **プラットフォームアカウント上のチャージ**（支払い元と領収書の主語はプラットフォーム）
* Connect の「Transfer」API で

  * `destination = tenant_account`
  * `destination = root_tenant_account`
    を2本投げるイメージ

**メリット**

* RootTenant も Tenant も自動で Stripe から振り込みされる
* プラットフォームは「残り」を自分の売上にできる
* multi-tenant to multi-tenant なロイヤリティ構造を素直に表現できる

**注意点**

* Stripe Connect は「階層プラットフォーム」をサポートしておらず、
  **あくまで "プラットフォーム → 各 Connected Account" の一段構造**のみです。
  RootTenant がさらにプラットフォームになって Tenant を管理するような構成は、Stripe 上では実現できません。([Stripe ドキュメント][3])
* 「本部／運営者／店舗」のような階層は、**アプリ側のデータモデルで表現し、Stripe上はすべて「プラットフォームに紐付く事業者」**として扱います。

---

### パターンC：RootTenantだけ Connected、Tenant はアプリ内の概念

逆方向のパターンも考えられます：

* **Connected Account = RootTenant（本部）のみ**
* Tenant は RootTenant 配下の「内部の運営者」として、アプリ側で管理する

お金の流れ（1予約分）：

1. プラットフォームアカウントで決済
2. RootTenant connected account に Transfer（本部取り分全部）
3. 本部は自社の会計システムなどで、
   「Tenant（運営者）の取り分」を別途支払う（Stripe外 ／ 別の送金手段）

**典型的な用途**：

* 本部自身が「すべての売上を一度受ける」運営形態
* フランチャイズというより「販売代理」や「直営＋歩合スタッフ」寄りの構成

---

## RootTenant / Tenant / Location 各パターンへの適用

[テナントモデル](/architecture/tenant-model)で整理した運営パターンに、パターンB（RootTenant＋Tenant両方Connected）を適用すると：

### R-1：直営のみ

```text
RootTenant（本部A） … Connected Account
 ├─ Location：A本社ビル店
 └─ Location：A高知店
Tenant：なし
```

* Connect 的には「RootTenant = 1つの事業者」として扱う
* Location ごとの配分はアプリのレポート上で管理する

### R-2：直営 + フランチャイズ混在

```text
RootTenant（本部B） … Connected Account
 ├─ 直営 Location：B本社ビル店（売上 → RootTenantへTransfer）
 ├─ Tenant：X社 … Connected Account
 │    ├─ Location：X社 高知店
 │    └─ Location：X社 南国店
 └─ Tenant：Y社 … Connected Account
      └─ Location：Y社 徳島店
```

1回の支払いに対して

* 直営店なら：RootTenant だけへ Transfer
* 加盟店店舗なら：Tenant（運営者）＋ RootTenant（ロイヤリティ）に Transfer

### R-3：フランチャイズのみ

```text
RootTenant（本部C） … Connected Account
 ├─ Tenant：M社 … Connected Account
 │    └─ Location：M社 高知店
 ├─ Tenant：N社 … Connected Account
 │    ├─ Location：N社 徳島店
 │    └─ Location：N社 鳴門店
 └─ Tenant：O社 … Connected Account
      └─ Location：O社 松山店
```

* どの Location の予約でも、

  * Tenant（運営者）への取り分、
  * RootTenant（本部）へのロイヤリティ、
    を2本の Transfer で分けて払うイメージ。

---

詳細は[Express Account と Custom Account の選択](/architecture/stripe/account-types)を参照してください。

---

## 推奨設計

RootTenant / Tenant / Location モデルと Stripe Connect を組み合わせる場合、以下の設計が推奨されます：

* **Stripe 上の「Connected Account」 = お金を最終的に受け取る本部・運営者**

  * 最小構成：TenantのみConnected
  * ロイヤリティまで自動化：RootTenant も Tenant もConnected
* **Location はアプリ内メタデータとして扱う**

  * Stripe には Location ID を metadata に含めるのみ
  * 店舗別売上管理はアプリ側のロジックで実装
* **支払いフロー**

  * プラットフォームでチャージ
  * Connect の「separate charges and transfers」で RootTenant / Tenant へ分配
  * プラットフォームは残りを自分の売上として保持

この設計により、柔軟で拡張性の高い決済システムを構築できます。

実装前に、以下の点を確定する必要があります：
- 予約1件ごとにどの ID を Stripe の `metadata` に含めるか
- ロイヤリティ率をどこに持たせるか（RootTenant / Tenant / Location）

:::tip[実装前の検討事項]
以下の点は実装前に確定する必要があります：
- Connected Accountの作成タイミング（オンボーディング時 vs 初回決済時）
- Express AccountとCustom Accountの選択基準
- ロイヤリティ率の設定方法と変更フロー
- エラーハンドリング（Transfer失敗時の処理）
- テスト環境でのStripe Connect設定

これらは実装フェーズで詳細化される予定です。
:::

[1]: https://stripe.com/en-jp/connect?utm_source=chatgpt.com "Stripe Connect | Platform and Marketplace Payment ..."
[2]: https://docs.stripe.com/connect/separate-charges-and-transfers?utm_source=chatgpt.com "Create separate charges and transfers"
[3]: https://docs.stripe.com/connect?utm_source=chatgpt.com "Platforms and marketplaces with Stripe Connect"
