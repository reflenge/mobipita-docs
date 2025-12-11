---
title: Express Account と Custom Account の選択
description: Stripe Connectのアカウントタイプ選定について
sidebar:
  order: 4
---

:::caution[作業中]
このドキュメントは現在**作業中**です。アカウントタイプの選定は検討段階であり、最終的な選定は確定していません。
:::

## 概要

運営者や本部にどこまで Stripe の画面を提供するかで、アカウントタイプの選択が決まります。

## アカウントタイプの比較

### Express アカウント

**特徴:**
- Stripe が KYC・ダッシュボードを提供
- プラットフォーム側は「お金の流れとブランド」を制御する ([Stripe ドキュメント][1])
- オーナー側は「Stripeの簡易ダッシュボード」で売上や入金を確認できる

**メリット:**
- 開発工数が少ない
- KYC（本人確認）をStripeが担当
- トラブル対応をStripeが直接事業者と行う

**デメリット:**
- Stripeのダッシュボードを使用するため、ブランド統一性がやや低い
- カスタマイズの自由度が低い

**向いている例:**
- Uber、Lyft、クラウドソーシングサイト
- ブランド統一性よりも開発速度を重視する場合

### Custom アカウント

**特徴:**
- オンボーディング、管理画面、レポートをすべてプラットフォーム側で実装
- コントロールは最大、責任も最大 ([Stripe ドキュメント][2])

**メリット:**
- ブランド統一性が最も高い
- 完全にカスタマイズ可能
- プラットフォーム側で完全に制御できる

**デメリット:**
- 開発工数が最も多い
- KYCの実装も自前で行う必要がある
- トラブル対応もプラットフォーム側で対応が必要

**向いている例:**
- ブランド統一性を最重視する場合
- 独自のUI/UXを提供したい場合

## 推奨選定

Connect の対象は **本部・運営者（法人）** であり、
UI 的には以下のように分けられます：

* 本部・運営者：Express or Custom（事業者向け）
* 顧客：通常の Checkout / PaymentElement のみ（Connect のアカウントにはならない）

**初期段階では Express Account を推奨**

理由:
1. 開発工数が少なく、早期リリースが可能
2. KYCなどの複雑な実装をStripeに任せられる
3. 後からCustom Accountに移行することも可能

**Custom Account を選ぶべき場合:**
- ブランド統一性が最重要の場合
- 独自のオンボーディングフローが必要な場合
- 十分な開発リソースがある場合

詳細は[Stripe Connect](/architecture/Stripe/stripe-connect)を参照してください。

:::tip[実装前の検討事項]
以下の点は実装前に確定する必要があります：
- Express AccountとCustom Accountの選択基準
- オンボーディングフローの設計
- KYCの実装方法（Custom Accountの場合）
- ダッシュボードの設計（Custom Accountの場合）

これらは実装フェーズで詳細化される予定です。
:::

[1]: https://docs.stripe.com/connect/express-accounts?utm_source=chatgpt.com "Using Connect with Express connected accounts"
[2]: https://docs.stripe.com/connect/custom-accounts?utm_source=chatgpt.com "Using Connect with Custom connected accounts"
