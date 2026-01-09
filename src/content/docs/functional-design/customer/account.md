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
  - 氏名
  - メールアドレス
  - パスワード
  - アイコン



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
new_A1 -->|戻る| new_C
new_D2 --> new_C
new_F --> new_G[登録完了画面表示]
```

## 退会

```mermaid
flowchart TD

withdraw_A[アイコン/マイページをタップ] --> withdraw_B{ログイン済み?}

%% ログイン判定の分岐
withdraw_B -->|NO| withdraw_L_redirect[[ログイン画面へリダイレクト<br>ログインフロー<br>login_Aへ]]
withdraw_B -->|YES| withdraw_C[プロフィール/設定画面表示]

%% 退会手続きの開始
withdraw_C --> withdraw_D[退会手続きボタンをタップ]
withdraw_D --> withdraw_E{最終確認ダイアログ}

withdraw_E -->|キャンセル| withdraw_C

%% ここで一度改行を入れ、定義を明確にします
subgraph 退会処理
    withdraw_F[Clerk: ユーザー削除実行]
    withdraw_G[Clerk Webhook: user.deleted 発火]
    withdraw_H[Convex: ユーザー関連データのクリーンアップ]
    
    withdraw_F --> withdraw_G
    withdraw_G --> withdraw_H
end

%% subgraph外からの接続
withdraw_E -->|退会を確定| withdraw_F
withdraw_H --> withdraw_I[セッション破棄 / LPへリダイレクト]
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
logout_A[アイコンタップ] --> logout_B{ログイン済み?}

%% ログイン判定の分岐
logout_B -->|NO| logout_L_redirect[[ログイン画面へリダイレクト<br>ログインフロー<br>login_Aへ]]
logout_B -->|YES| logout_B1[ログアウト]
logout_B1 -->logout_C{確認ダイアログ表示?}

%% --- ログアウト実行フロー ---
logout_C -->|キャンセル| logout_D[ホーム画面へ戻る]
logout_C -->|ログアウト| logout_E[Clerk: セッション削除/サインアウト]

logout_E --> logout_F[[ログイン画面へ遷移<br>ログインフロー<br>login_Aへ]]
```
## プロフィール編集

```mermaid
flowchart TD

edit_A[アイコン/マイページをタップ] --> edit_B{ログイン済み?}

%% ログイン判定の分岐
edit_B -->|NO| edit_L_redirect[[ログイン画面へリダイレクト<br>ログインフロー<br>login_Aへ]]
edit_B -->|YES| edit_C[プロフィール画面表示]

edit_C --> edit_D{編集項目を選択}

edit_D -->|アイコン変更| edit_H[アイコン変更フローへ]
edit_D -->|氏名編集| edit_E[氏名変更フローへ]
edit_D -->|メール変更| edit_F[メール変更フローへ]
edit_D -->|パスワード変更| edit_G[パスワード変更フローへ]

%% --- アイコン変更 (Clerk) ---
subgraph アイコン変更
  edit_H --> edit_H1[画像ファイルを選択]
  edit_H1 --> edit_H2[プレビュー・切り抜き]
  edit_H2 --> edit_H3{保存ボタン押下}
  edit_H3 --> edit_H4[Clerk: 画像アップロード実行]
  edit_H4 --> edit_H5[Clerk Webhook: user.updated 受信]
  edit_H5 --> edit_H6[Convex: imageURL同期完了]
end

%% --- 氏名編集 ---
subgraph 氏名編集
  edit_E --> edit_E1[新しい氏名を入力]
  edit_E1 --> edit_E2{保存ボタン押下}
  edit_E2 --> edit_E3[Convex: userテーブル更新]
  edit_E3 --> edit_E4[完了通知を表示]
end

%% --- メールアドレス編集 (Clerk) ---
subgraph メールアドレス編集
  edit_F --> edit_F1[新しいメールを入力]
  edit_F1 --> edit_F2[Clerk: 認証コード送信]
  edit_F2 --> edit_F3{コード入力一致?}
  edit_F3 -->|不一致| edit_F4[エラー: 認証コードが違います] --> edit_F2
  edit_F3 -->|一致| edit_F5[Clerk: メールアドレス更新]
  edit_F5 --> edit_F6[Clerk Webhook: user.updated 受信]
  edit_F6 --> edit_F7[Convex: DB同期完了]
end

%% --- パスワード変更 (Clerk) ---
subgraph パスワード変更
  edit_G --> edit_G1[現在のパスワード入力]
  edit_G1 --> edit_G2{パスワード一致?}
  edit_G2 -->|NG| edit_G3[エラー: 現在のパスワードが違います] --> edit_G1
  edit_G2 -->|OK| edit_G4[新しいパスワードを入力/再入力]
  edit_G4 --> edit_G5[パスワード条件チェック]
%% --- パスワードチェック ---  
  edit_G5 --> edit_G6{8文字以上?}
  edit_G6 -->|OK| edit_G7{数字を含む?}
  edit_G6 -->|NG| edit_G_err1[エラー: 8文字以上必要] --> edit_G7

  edit_G7 -->|OK| edit_G_check_end
  edit_G7 -->|NG| edit_G_err2[エラー: 数字が必要] --> edit_G_check_end[チェック終了]

  edit_G_check_end --> edit_G_judge{エラーがある?}
  edit_G_judge -->|YES| edit_G_show_err[エラー内容表示] --> edit_G4
  edit_G_judge -->|NO| edit_G_update[Clerk: パスワード更新]
end

edit_H6 --> edit_C
edit_E4 --> edit_C
edit_F7 --> edit_C
edit_G_update --> edit_C
```