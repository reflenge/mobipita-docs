# MobiPita ドキュメント

MobiPitaプロジェクトの技術ドキュメントサイトです。

## プロジェクト概要

**MobiPita**は、フランチャイズ型ビジネス向けのB2B2Cプラットフォームです。

「Mobile（移動）」＋「Pita（ピタッと決まる・合わせる）」というコンセプトのもと、10分刻みの細かい予約枠に「時間をピタッと合わせられる」利便性と、移動店舗が指定の場所に「時間通りに来る」安心感を表現しました。

## このリポジトリについて

このリポジトリは、MobiPitaプロジェクトの技術設計、アーキテクチャ、インフラ選定に関するドキュメントを管理しています。

- **フレームワーク**: Astro + Starlight
- **デプロイ**: Cloudflare Workers
- **サイトURL**: https://mobipita-docs.reflenge.workers.dev

## ドキュメント構成

- **アーキテクチャ**: システムの設計思想とアーキテクチャパターン
- **ミーティング記録**: プロジェクトの会議記録と技術選定の議論
- **調査資料**: 技術選定やインフラに関する調査結果

## 注意事項

:::caution
このドキュメントは現在**作業中**です。記載されている内容は途中段階であり、構成や設計は確定していません。随時更新される可能性があります。
:::

## 開発

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev

# ビルド
pnpm build

# プレビュー
pnpm preview
```

## Docker コマンド集

```bash
# イメージをビルド
docker build -t mobipita-docs .

# 開発サーバーを起動 (Windows PowerShell)
docker run --rm -it -p 4321:4321 `
  -v ${PWD}:/workspace `
  -v mobipita-node-modules:/workspace/node_modules `
  -v mobipita-pnpm-store:/workspace/.pnpm-store `
  -v mobipita-astro:/workspace/.astro `
  -v mobipita-dist:/workspace/dist `
  -e PNPM_STORE_PATH=/workspace/.pnpm-store `
  mobipita-docs

# コンテナ内でシェルを開く
docker run --rm -it `
  -v ${PWD}:/workspace `
  -v mobipita-node-modules:/workspace/node_modules `
  -v mobipita-pnpm-store:/workspace/.pnpm-store `
  -v mobipita-astro:/workspace/.astro `
  -v mobipita-dist:/workspace/dist `
  -e PNPM_STORE_PATH=/workspace/.pnpm-store `
  mobipita-docs bash

# ボリュームを掃除
docker volume rm mobipita-node-modules mobipita-pnpm-store mobipita-astro mobipita-dist
```

詳細は各ドキュメントページを参照してください。

## 本

### 1
第1章 すべてさらっと
題2章 2.2 2.3 2.4
第3章 3.2 3.3
### 2
第6章 6.4
第7章 すべてさらっと
第8章 すべてさらっと
第9章～第13章 すべて詳しめに この章が特に実際にやる工程になる
