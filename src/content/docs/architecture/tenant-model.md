---
title: RootTenant / Tenant / Location
description: どういう組み合わせになり得るのかをパターン別で解説
sidebar:
  order: 1
---

:::caution[作業中]
このドキュメントは現在**作業中**です。記載されているパターンや設計は検討段階であり、実装前に変更される可能性があります。
:::

## 基本概念

本プロジェクトでは、以下の3つのエンティティを定義しています：

* **RootTenant**：ブランド本部・フランチャイズ本部・大元の会社
* **Tenant**：本部と契約して店舗を運営する「運営者（法人・個人事業主）」
* **Location**：物理的な店舗・拠点（◯◯店・△△営業所・移動店舗など）

---

## 1. RootTenant 周りのパターン（本部と Tenant / Location の関係）

1つの RootTenant について、以下の3つのパターンが考えられます：

### パターン R-1：直営のみ（Tenant なし）

> 本部が自分で全部の店舗を運営しているタイプ

```text
RootTenant（本部A）
 ├─ Location：本部A 1号店
 ├─ Location：本部A 2号店
 └─ Location：本部A 3号店
```

* Tenant（運営者）は存在しない
* ロイヤリティの概念も基本的にない（すべて自社運営）
* 小規模チェーンや初期フェーズで見られる構成

---

### パターン R-2：直営 + フランチャイズ混在（本部も Location を持つ）

> 本部が一部店舗を直営で持ちつつ、フランチャイズも展開しているタイプ

```text
RootTenant（本部B）
 ├─ Location：本部B 直営・高知駅前店
 ├─ Location：本部B 直営・本社ビル店
 ├─ Tenant：運営者X社
 │    ├─ Location：X社・朝倉店
 │    └─ Location：X社・南国インター店
 └─ Tenant：運営者Y社
      └─ Location：Y社・須崎店
```

* 本部自身も「直営店」として Location を持つ
* 同時に、別会社（Tenant）にも店舗運営を委ねてロイヤリティを取得する
* コンビニ・フィットネス・飲食チェーンで一般的な構成

このパターンでは、**RootTenantが直営店として Location を持つこともあれば、Tenant配下にも Location がある**という混在構成が可能です。

---

### パターン R-3：フランチャイズのみ（本部の直営店舗なし）

> 本部はブランドと仕組みだけを持ち、すべて加盟店運営のタイプ

```text
RootTenant（本部C）
 ├─ Tenant：運営者M社
 │    └─ Location：M社・高知店
 ├─ Tenant：運営者N社
 │    ├─ Location：N社・徳島店
 │    └─ Location：N社・鳴門店
 └─ Tenant：運営者O社
      └─ Location：O社・松山店
```

* 本部は Location を持たない
* 売上はすべて Tenant 側で発生し、ロイヤリティが本部に支払われる構造

---

## 2. Tenant 周りのパターン（運営者と Location の関係）

1つの Tenant（運営者）が Location をどのように持つか、以下のパターンに分類できます：

### パターン T-1：1運営者 = 1店舗

```text
RootTenant（本部B）
 └─ Tenant：田中商店
      └─ Location：Bチェーン ○○市△△店
```

* 個人オーナーや小規模事業者に多い構成
* 初期要件ではこのパターンだけを想定しがちだが、複数店舗パターンも考慮が必要

---

### パターン T-2：1運営者 = 複数店舗

```text
RootTenant（本部B）
 └─ Tenant：株式会社XYZ（運営者）
      ├─ Location：XYZ・高知駅前店
      ├─ Location：XYZ・朝倉店
      └─ Location：XYZ・南国インター店
```

* 「複数店舗オーナー」パターン
* 現実のコンビニ・フィットネス・学習塾・介護施設で一般的に存在する
* ロイヤリティは「XYZ社としてまとめて計算」する方式が一般的

---

### パターン T-3：運営者はいるが、まだ店舗がない（準備中）

```text
RootTenant（本部B）
 └─ Tenant：株式会社NewOp（契約済・開業準備中）
      └─ Location：なし（あとで追加される）
```

* 契約だけ先に済ませて、店舗オープン前の期間
* 実務でも頻繁に発生するため、
  **Location 0件も許容する設計**が必要

---

## 3. パターンの組み合わせ

1つの RootTenant について、現実的には以下のような混在構成が一般的です：

### 例：フィットネスチェーンDの世界

```text
RootTenant：フィットネスD本部
 ├─ Location：D本部 直営・本社ビル店                  （R-2の直営部分）
 ├─ Tenant：運営者X社（フランチャイズ）
 │    ├─ Location：X社・高知店                        （T-2の1店舗）
 │    └─ Location：X社・南国店                        （T-2の2店舗目）
 ├─ Tenant：運営者Y社（フランチャイズ）
 │    └─ Location：Y社・徳島店                        （T-1）
 └─ Tenant：運営者Z社（契約済・オープン準備中）
      └─ Location：なし                               （T-3）
```

この設計により、以下のパターンをすべて表現できます：

* 直営店のみの本部（R-1）
* 一部直営＋一部フランチャイズ（R-2 + T-1/T-2）
* すべてフランチャイズ運営の本部（R-3 + T-1/T-2）

**ほとんどの現実的なビジネスパターンを吸収できる設計**となっています。

---

## 4. アプリケーション側の設計ルール

仕様としては、以下のように定義することで柔軟で堅牢な設計となります：

* **RootTenant**

  * 0〜N 個の `Tenant` を持てる
  * 0〜N 個の `Location`（直営店）を持てる

* **Tenant（運営者）**

  * 必ず1つの `RootTenant` に属する
  * 0〜N 個の `Location` を持てる

    * 0店舗期間（準備中）もあり
    * 1店舗でも複数店舗でもOK

* **Location（店舗）**

  * 必ずどちらかに属する：

    * `RootTenant`（直営店）
    * または `Tenant`（フランチャイズ運営者）

データモデルの関係性は以下の通りです：

```text
RootTenant
  ├─ has many Tenants
  ├─ has many Locations (直営)
Tenant
  ├─ belongs to RootTenant
  └─ has many Locations
Location
  ├─ belongs to RootTenant or Tenant
```

実運用では、以下のような柔軟な構成が可能です：

* 小規模導入企業：RootTenant 1個 + Tenant なし + Location複数
* 大規模フランチャイズ：RootTenant + Tenant複数 + Tenant配下Location複数

---

このパターン定義を基に、次は「予約・会員・ロイヤリティ計算をどのIDに紐付けるか」を検討する必要があります。

:::tip[次のステップ]
このモデルを基に、以下の検討事項が残っています：
- 予約データの紐付け先（RootTenant / Tenant / Location）
- 会員管理のスコープ
- ロイヤリティ計算の実装方法
- 各パターンでの権限管理

これらは実装フェーズで詳細化される予定です。
:::
