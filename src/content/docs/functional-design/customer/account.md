---

title: 顧客アカウント
description: 新規登録/退会、ログイン、プロフィール編集
---

## 機能

- 新規登録/退会
  - 氏名、メールアドレス、パスワードもしくは、LINEアカウントで登録
  - 利用規約への同意
  - パスワード生成条件（詳細は要定義）
- ログイン/ログアウト
- プロフィール編集（ログイン必須）


##  疑問点
- LINE上でも利用規約が必要か
- パスワードの生成条件はどうするか
---

## フロー（たたき台）

```mermaid
flowchart TD

new_A[新規登録開始] --> new_B[利用規約の確認・同意]
new_B --> new_C{ユーザー情報入力方法}

%% メール登録とLINE登録の分岐
new_C -->|氏名/メール/パスワード| new_D[メール登録へ]
new_C -->|LINE登録| new_E[LINE登録へ]


subgraph メール登録
  new_D --> new_A1{記入内容を登録}
  new_A1 -->|登録| new_B1{メールアドレス重複チェック}
  new_A1 -->|戻る| new_Z1[登録方法へ戻る]
  

  new_B1 -->|既に登録済み| new_C1[エラー追加:「このメールは使用されています」] --> new_D1[パスワード条件チェック開始]
  new_B1 -->|未登録| new_D1

  new_D1 --> new_F1{8文字以上?}
  new_F1 -->|OK| new_H1{数字を含む?}
  new_F1 -->|NG| new_F1_err[エラー追加:「8文字以上必要」] --> new_H1

  new_H1 -->|OK| new_I1
  new_H1 -->|NG| new_H1_err[エラー追加:「数字が必要」] --> new_I1[パスワード条件チェック終了]

  new_I1 --> new_J1{エラーがある?}
  new_J1 -->|YES| new_K1[エラー内容表示] --> new_A1
  new_J1 -->|NO| new_F[アカウント登録]
end


subgraph LINE登録
  new_E --> new_A2[LINE認証画面へ遷移]

  new_A2 --> new_B2{認証許可?}
  new_B2 -->|許可| new_C2[利用規約の確認・同意]
  new_B2 -->|拒否| new_D2[「登録が中断されました」]

  new_C2 --> new_E2{既存アカウントあり?}
  new_E2 -->|あり| new_F2[アカウント紐づけ]
  new_E2 -->|なし| new_G2[新規アカウント自動作成]

  new_F2 --> new_H2[プロフィール補完（必要時）]
  new_G2 --> new_H2
  new_H2 --> new_F
end

new_Z1 --> new_C
new_D2 --> new_C
new_F --> new_G[登録完了画面表示]
```





