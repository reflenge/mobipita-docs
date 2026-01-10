---
title: 決済
description: クレジットカード決済と予約確定
---

## 機能

- クレジットカード情報入力
- 予約内容の確認画面表示
- 決済完了後、予約確定
- 現地決済の可否は店舗・本部設定に準拠

---

## フロー（たたき台）

```mermaid
flowchart TD

%% 1. 決済の入り口
pay_start[支払処理] --> pay_method{支払方法の選択}

%% 2. 支払方法の分岐
pay_method -->|クレジットカード| stripe_gate[[Stripe 決済フォーム]]
pay_method -->|現地払い| local_pay[現地決済としてマーク]

%% 3. クレジットカード決済詳細
subgraph stripe_process [クレジットカード決済ロジック]
    stripe_gate --> card_check{カード有効性チェック}
    card_check -->|NG: 期限切れ等| card_error[エラー表示: <br/>別のカードをお試しください]
    card_error --> stripe_gate
    
    card_check -->|OK| stripe_exec[決済実行]
end

%% 4. 予約確定処理（アトミック更新）
stripe_exec & local_pay --> convex_update[[Convex: 予約ステータスを確定へ]]

subgraph db_logic [データベース整合性確保]
    convex_update --> check_race{枠の再最終チェック}
    check_race -->|重複| stripe_refund[Stripe: 即時返金処理]
    check_race -->|OK| commit_res[予約完了を確定]
end

%% 5. 完了通知
commit_res --> notify_all[完了通知]

subgraph notifications [通知一覧]
    notify_all --> mail_user[ユーザー: 完了メール]
    notify_all --> push_shop[店舗: 新規予約通知]
end

notify_all --> finish[完了画面表示]
```

