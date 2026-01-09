---
title: フランチャイズ本部向け機能
description: 本部向けの機能仕様
---

## 概要

このページは本部向け機能の概要です。詳細は機能単位ページに分割しました。

### 機能単位ページ

- [加盟店管理](/functional-design/headquarters/franchise-stores)
- [キャンセルポリシー・決済ルール管理](/functional-design/headquarters/policies-payments)
- [テンプレート管理（公式テンプレ）](/functional-design/headquarters/templates)
- [本部向けレポート](/functional-design/headquarters/reports)

---

## 全体フロー（たたき台）

```mermaid
flowchart TD
  A[加盟店管理] --> B[公式テンプレ管理]
  B --> C[店舗へ配布]
  A --> D[決済/キャンセルルール]
  D --> E[予約処理に適用]
  E --> F[レポート集計]
```
