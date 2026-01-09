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


##  確認事項
- 新規登録
  - LINE上でも利用規約が必要か
  - パスワードの生成条件はどうするか
- 退会
  - 退会のフローでは技術スタックの情報も含めて書いているがどちらの書き方が好ましいか
  - プロフィールのアイコンをタップして、退会とプロフィール編集のボタンを表示させる形でよいか
---

## フロー（たたき台）

## 新規登録フロー 
　
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

## 退会

```mermaid
flowchart TD

withdraw_A[アイコンタップ] --> withdraw_B[退会手続きボタン]
withdraw_B --> withdraw_C{最終確認ダイアログ}

withdraw_C -->|キャンセル| withdraw_A

subgraph 退会処理 
  withdraw_C -->|退会を確定| withdraw_D[Clerk: ユーザー削除実行]
  withdraw_D --> withdraw_E[Clerk Webhook: user.deleted 発火]
  withdraw_E --> withdraw_F[Convex: ユーザー関連データのクリーンアップ]
end

withdraw_F --> withdraw_G[セッション破棄 / LPへリダイレクト]
```

## ログイン

```mermaid
flowchart TD

login_A[ログイン開始] --> login_B{ログイン方法選択}

login_B -->|メール/パスワード| login_C[メールログインへ]
login_B -->|LINEログイン| login_D[LINEログインへ]

%% --- メールログイン ---
subgraph メールログイン
  login_C --> login_E{メールアドレス存在?}
  login_E -->|なし| login_E_err[エラー:「メールアドレスが見つかりません」] --> login_C

  login_E -->|あり| login_F{パスワード一致?}
  login_F -->|不一致| login_F_err[エラー:「パスワードが違います」] --> login_C

end

%% --- LINEログイン ---
subgraph LINEログイン
  login_D --> login_H[LINE認証画面へ遷移]
  login_H --> login_I{認証許可?}

  login_I -->|拒否| login_I_err[「ログインが中断されました」]
  login_I -->|許可| login_J{既存アカウントあり?}

  login_J -->|あり| login_K[アカウント紐づけ]
  login_J -->|なし| login_L[[新規アカウント作成 <br> 新規登録フロー<br>new_Eへ]]
  end

login_I_err --> login_B
login_K --> login_G
login_L --> login_G
login_F -->|一致| login_G[ログイン成功]
login_G --> login_M[ホーム画面へ遷移]
```

## ログアウト
```mermaid
flowchart TD

logout_A[ログアウト操作] --> logout_B{確認ダイアログ表示?}

logout_B -->|キャンセル| logout_C[ホーム画面へ戻る]
logout_B -->|ログアウト| logout_D[セッション削除]

logout_D --> logout_E[[ログイン画面へ遷移<br>ログインフロー<br>login_Aへ]]
```
