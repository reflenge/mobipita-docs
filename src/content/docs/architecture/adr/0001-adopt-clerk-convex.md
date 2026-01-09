---
title: "ADR-0001: Adopt Clerk + Convex"
description: Auth を Clerk、DB/BaaS を Convex に寄せ、Postgres を採用しない
---

## Status

採用（暫定） / 2025-12-22

## Context

- docs 内で「Backend = Convex」と「DB = Postgres」が混在し、設計が矛盾していた
- “企業間流出を最上流で防ぐ境界” をまず固定したい
- 開発速度を優先しつつ、マルチテナントを破綻させない運用にしたい

## Decision

- Auth は **Clerk** を採用し、**Organizations を RootTenant（企業）境界**として使う
- DB/BaaS は **Convex** を採用し、**Postgres を採用しない**
- アップロード系は **Convex File Storage** を暫定採用
- テナント境界は **Convex 関数側で必ず検証する**

## Consequences

- DB設計ページは Convex 前提に書き換える必要がある
- RLS（Postgres）前提の議論は Archive に退避する
- Org境界だけでは漏れるため、アプリ側で `rootTenantId` 検証を徹底する
