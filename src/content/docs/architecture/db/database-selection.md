---
title: データベース選定
description: DB/BaaSの選定（現在の採用結論＝Convex）

---

## 結論

> **Status: 採用（暫定）**  
> 更新日: 2025-12-22  
> **DB は Convex。Postgres は採用しない。**

## ここでの「DB」の定義

- 業務データの永続化
- 読み書き API（サーバー関数）
- マルチテナント境界（rootTenantId）
- 監査ログ（必要なら別コレクション）

## 採用理由（要点）

- DB とサーバー関数が一体で、テナント境界を強制しやすい
- Realtime 前提のUI/UXを作りやすい
- 運用負荷を下げ、実装速度を優先できる

## Postgres 前提の資料について

- RLS/ORM/SQL を前提とした資料は Archive に退避する
- 参照は `/architecture/archive/postgres/` を利用する
