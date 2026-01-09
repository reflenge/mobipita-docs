---
title: 予約
description: メニュー選択から予約登録まで
---

## 機能

- メニュー/セットの選択（例：Aセット60分、Bセット90分）
- 希望日時（開始時刻）の選択
  - メニュー所要時間に必要なスロット群の空きを自動チェック
- 顧客情報入力（ログイン時は省略可）
  - 氏名、メールアドレス、電話番号
  - 利用人数または組数
  - 備考（任意）
- 現地決済の可否は店舗・本部設定に準拠
---

## フロー（たたき台）

```mermaid
flowchart TD


res_A[予約トップ：プラン一覧] --> res_B{プランを選択}

%% プラン特定セクション
subgraph plan_logic [プラン・スロット数の特定]
    res_B1[Aセット: 60分 / 6スロット]
    res_B2[Bセット: 90分 / 9スロット]
end

res_B -->|Aセット| res_B1
res_B -->|Bセット| res_B2

res_B1 & res_B2 --> res_C[カレンダー表示]

%% スロット判定セクション
subgraph check_logic [スロット空き判定]
    res_D[10分単位の開始時刻を選択]
    res_E{Convex: 指定スロット数分<br>連続した空きあり?}
    res_F[指定時間は予約不可]
end

res_C --> res_D
res_D --> res_E
res_E -->|NG| res_F
res_F --> res_C

%% 顧客情報入力セクション
subgraph input_logic [顧客情報入力]
    res_G{ログイン済み?}
    res_H[Convex: ユーザー情報を自動取得]
    res_I[ゲスト情報入力フォーム]
    res_I1[氏名/メール/電話/人数/備考]
end

res_E -->|OK| res_G
res_G -->|YES| res_H
res_G -->|NO| res_I
res_I --> res_I1

%% 最終処理
res_J[予約内容の最終確認]

res_K1[[クレジットカード決済]]
res_L[予約完了通知送信]
res_M[完了画面表示]

res_H & res_I1 --> res_J
res_J -->|確定| res_K{支払方法}
res_K --> res_K2[現地払い]
res_K2 --> res_L
res_K --> res_K1
res_K1 --> res_L
res_L --> res_M
```
