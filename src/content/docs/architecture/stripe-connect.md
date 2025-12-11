---
title: StripeConnectについて
description: 「RootTenant / Tenant / Location」モデルに、Stripe Connect をどうかぶせるか
sidebar:
  order: 2
---


## ざっくり前提

登場人物をこう決める：

* **プラットフォーム**：あなたのSaaS（Stripe の「プラットフォームアカウント」）
* **RootTenant**：本部（ブランド、本社）
* **Tenant**：本部と契約してる運営者（フランチャイジーの会社など）
* **Location**：店舗（物理拠点、高知店・移動店舗1号車など）
* **エンドユーザー**：高齢者（予約してお金を払う人）

Stripe Connect の世界では、

* **お金を最終的に受け取る主体 = 「Connectの connected account」になる人**
* プラットフォームが

  * お金を集めて
  * そこから「誰にいくら払うか」を API で制御する感じ。([Stripe][1])

---

## どこを「Connected Account」にするか

大きく 3 パターン考えられる：

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

→ **メリット**：実装がシンプル
→ **デメリット**：本部へのロイヤリティが Stripe で自動分配されない

---

### パターンB：RootTenant と Tenant 両方を Connected Account にする（多者分配）

ロイヤリティまで Stripe Connect で完結させたいなら、こっちが本命。

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

→ **メリット**

* RootTenant も Tenant も自動で Stripe から振り込みされる
* プラットフォームは「残り」を自分の売上にできる
* multi-tenant to multi-tenant なロイヤリティ構造を素直に表現できる

→ **注意点**

* Stripe Connect は「階層プラットフォーム」はサポートしてなくて、
  **あくまで "あなたのプラットフォーム → 各 Connected Account" の一段構造**だけ。
  RootTenant がさらにプラットフォームになって Tenant をぶらす、みたいなことは Stripe 上ではできない。([Stripe ドキュメント][3])
* 「本部／運営者／店舗」みたいな階層は、**アプリ側のデータモデルで表現して、Stripe上は全部「プラットフォームにぶら下がる商売人たち」**とみなすイメージ。

---

### パターンC：RootTenantだけ Connected、Tenant はアプリ内の概念

逆方向も一応あり得る：

* **Connected Account = RootTenant（本部）だけ**
* Tenant は RootTenant 配下の「内部の運営者」として、アプリ側で管理する

お金の流れ（1予約）：

1. プラットフォームアカウントで決済
2. RootTenant connected account に Transfer（本部取り分全部）
3. 本部は自社の会計システムなどで、
   「Tenant（運営者）の取り分」を別途支払う（Stripe外 ／ 別の送金手段）

→ **典型的には**：

* 本部自身が「すべての売上を一度受ける」運営形態
* フランチャイズというより「販売代理」や「直営＋歩合スタッフ」寄りの世界観

---

## RootTenant / Tenant / Location 各パターンへの当てはめ

さっき整理した運営パターンに、B案（Root＋Tenant両方Connected）を軽くマッピングすると：

### R-1：直営のみ

```text
RootTenant（本部A） … Connected Account
 ├─ Location：A本社ビル店
 └─ Location：A高知店
Tenant：なし
```

* Connect 的には「RootTenant = 1つの事業者」でしかない
* Location ごとの配分はアプリのレポート上でやればOK

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

## Express / Custom どっち系がイメージ近いか

運営者や本部にどこまで Stripe の画面を触らせるかで決める感じ：

* **Express アカウント**

  * Stripe が KYC・ダッシュボードを持っていて、
    あなた側は「お金の流れとブランド」を制御するイメージ ([Stripe ドキュメント][4])
  * オーナー側は「Stripeの簡易ダッシュボード」で売上や入金を見られる
* **Custom アカウント**

  * オンボーディング、管理画面、レポートを全部あなた側で作る代わりに
    コントロールは最大、責任も最大 ([Stripe ドキュメント][5])

「高齢者向け予約」だけど、Connect の相手は **本部・運営者（法人）** なので、
UI 的には：

* 本部・運営者：Express or Custom（事業者向け）
* 高齢者：普通の Checkout / PaymentElement だけ（Connect のアカウントにはならない）

---

## ざっくり結論

あなたの今の RootTenant / Tenant / Location モデルと Stripe Connect を合わせるなら、イメージとしては：

* **Stripe 上の「Connected Account」 = お金を最終的に受け取る本部・運営者たち**

  * 最小構成なら「TenantだけConnected」
  * ロイヤリティまで自動化したければ「RootTenant も Tenant もConnected」
* **Location はあくまでアプリ内メタデータ**

  * Stripe には Location ID を metadata で載せるだけにして、
    店舗別売上管理は自前ロジックでやる
* 支払いフローは

  * プラットフォームでチャージ
  * Connect の「separate charges and transfers」で RootTenant / Tenant へ分配
  * プラットフォームは残りを自分の売上としてキープ

って設計が、一番キレイにハマると思う。

この前提で、
「予約1件ごとにどの ID を Stripe の `metadata` に載せるか」
「ロイヤリティ率をどこに持たせるか（RootTenantかTenantかLocationか）」
あたりを一緒に詰めていくと、かなり実装まで落とし込めるはず。

[1]: https://stripe.com/en-jp/connect?utm_source=chatgpt.com "Stripe Connect | Platform and Marketplace Payment ..."
[2]: https://docs.stripe.com/connect/separate-charges-and-transfers?utm_source=chatgpt.com "Create separate charges and transfers"
[3]: https://docs.stripe.com/connect?utm_source=chatgpt.com "Platforms and marketplaces with Stripe Connect"
[4]: https://docs.stripe.com/connect/express-accounts?utm_source=chatgpt.com "Using Connect with Express connected accounts"
[5]: https://docs.stripe.com/connect/custom-accounts?utm_source=chatgpt.com "Using Connect with Custom connected accounts"
