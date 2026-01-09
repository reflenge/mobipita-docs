import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import starlightImageZoom from "starlight-image-zoom";
import sitemap from "@astrojs/sitemap";
import mermaid from "astro-mermaid";
import starlightFullViewMode from "starlight-fullview-mode";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    site: "https://mobipita-docs.reflenge.workers.dev",

    server: {
        host: true,
        port: 4321,
    },

    markdown: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [[rehypeKatex, { strict: true }]],
    },

    integrations: [
        mermaid({
            theme: "forest",
            autoTheme: true,
            mermaidConfig: {
                flowchart: {
                    curve: "basis",
                },
            },
        }),
        starlight({
            plugins: [
                starlightImageZoom(),
                starlightFullViewMode(),
                starlightLinksValidator(),
            ],
            head: [
                // Fathomのアナリティクススクリプトタグを追加する例。
                {
                    tag: "link",
                    attrs: {
                        href: "https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css",
                        rel: "stylesheet",
                    },
                },
            ],
            favicon: "/favicon.ico",
            title: "MobiPita",
            locales: {
                root: {
                    label: "日本語",
                    lang: "ja",
                },
            },
            social: [
                {
                    label: "GitHub",
                    icon: "github",
                    href: "https://github.com/reflenge/mobipita",
                },
            ],
            sidebar: [
                {
                    label: "MobiPita",
                    link: "/",
                },
                {
                    label: "機能定義書",
                    link: "/functional-specification",
                },
                {
                    label: "アーキテクチャ",
                    items: [
                        { label: "アーキテクチャ", link: "/architecture/" },
                        { label: "Current Stack", link: "/architecture/stack/current" },
                        { label: "サービス費用", link: "/architecture/stack/costs" },
                        { label: "実装設計メモ", link: "/architecture/implementation-notes" },
                        { label: "Request Context", link: "/architecture/tenancy/request-context" },
                        { label: "RootTenant / Tenant / Location", link: "/architecture/tenant-model" },
                        {
                            label: "Stripe",
                            items: [
                                { label: "Stripe Connect", link: "/architecture/stripe/stripe-connect" },
                                { label: "アカウントタイプ", link: "/architecture/stripe/account-types" },
                            ],
                        },
                        {
                            label: "データベース",
                            items: [
                                { label: "データベース設計", link: "/architecture/db/database-design" },
                                { label: "データベース選定", link: "/architecture/db/database-selection" },
                            ],
                        },
                        { label: "認証", link: "/architecture/auth/provider-selection" },
                        { label: "ストレージ", link: "/architecture/storage/selection" },
                        { label: "デプロイ", link: "/architecture/deploy/strategy" },
                        { label: "バックエンド", link: "/architecture/backend/selection" },
                        {
                            label: "アーカイブ (Postgres)",
                            items: [
                                { label: "DB選定（Archive）", link: "/architecture/archive/postgres/database-selection" },
                                { label: "DB設計（Archive）", link: "/architecture/archive/postgres/database-design" },
                                { label: "ORM選定（Archive）", link: "/architecture/archive/postgres/orm-selection" },
                            ],
                        },
                        {
                            label: "ADR",
                            items: [
                                { label: "ADR 一覧", link: "/architecture/adr/" },
                                { label: "ADR-0001: Adopt Clerk + Convex", link: "/architecture/adr/0001-adopt-clerk-convex" },
                            ],
                        },
                    ],
                },
                {
                    label: "機能設計",
                    items: [
                        { label: "機能設計（概要）", link: "/functional-design/" },
                        {
                            label: "システム",
                            items: [
                                { label: "システム全体構成（概要）", link: "/functional-design/system-architecture" },
                                { label: "構成要素", link: "/functional-design/system/components" },
                                { label: "外部サービス連携", link: "/functional-design/system/external-integrations" },
                            ],
                        },
                        {
                            label: "顧客",
                            items: [
                                { label: "顧客向け（概要）", link: "/functional-design/customer-features" },
                                { label: "アカウント", link: "/functional-design/customer/account" },
                                { label: "検索", link: "/functional-design/customer/search" },
                                { label: "出店詳細", link: "/functional-design/customer/detail" },
                                { label: "予約", link: "/functional-design/customer/booking" },
                                { label: "決済", link: "/functional-design/customer/payment" },
                                { label: "予約確認・変更・キャンセル", link: "/functional-design/customer/manage-booking" },
                            ],
                        },
                        {
                            label: "店舗",
                            items: [
                                { label: "店舗向け（概要）", link: "/functional-design/store-features" },
                                { label: "店舗アカウント", link: "/functional-design/store/account" },
                                { label: "出店スケジュール（カレンダー）", link: "/functional-design/store/schedule" },
                                { label: "テンプレートから作成", link: "/functional-design/store/templates" },
                                { label: "予約枠・メニュー設定", link: "/functional-design/store/menu-slots" },
                                { label: "予約一覧・当日運営", link: "/functional-design/store/ops" },
                                { label: "店舗レポート", link: "/functional-design/store/reports" },
                            ],
                        },
                        {
                            label: "本部",
                            items: [
                                { label: "本部向け（概要）", link: "/functional-design/headquarters-features" },
                                { label: "加盟店管理", link: "/functional-design/headquarters/franchise-stores" },
                                { label: "キャンセル/決済ルール", link: "/functional-design/headquarters/policies-payments" },
                                { label: "公式テンプレート管理", link: "/functional-design/headquarters/templates" },
                                { label: "本部レポート", link: "/functional-design/headquarters/reports" },
                            ],
                        },
                        {
                            label: "フロー（横断）",
                            items: [
                                { label: "フロー一覧", link: "/functional-design/flows/" },
                                { label: "予約フロー", link: "/functional-design/flows/reservation-flow" },
                                { label: "キャンセル・返金", link: "/functional-design/flows/cancel-refund-flow" },
                                { label: "スケジュール作成", link: "/functional-design/flows/store-schedule-flow" },
                                { label: "テンプレ配布", link: "/functional-design/flows/template-distribution-flow" },
                            ],
                        },
                    ],
                },
                {
                    label: "ミーティング",
                    items: [
                        { label: "アプリケーション構成", link: "/meetings/app-architecture" },
                    ],
                },
                {
                    label: "調査",
                    items: [
                        { label: "インフラ選定", link: "/research/infrastructure-selection" },
                    ],
                },
            ],
        }),
        sitemap(),
    ],

    adapter: cloudflare(),
});
