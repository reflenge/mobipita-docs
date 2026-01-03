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
                        { label: "機能設計", link: "/functional-design/" },
                        { label: "システム全体構成", link: "/functional-design/system-architecture" },
                        { label: "エンドユーザー（顧客）向け機能", link: "/functional-design/customer-features" },
                        { label: "店舗オーナー/店舗スタッフ向け機能", link: "/functional-design/store-features" },
                        { label: "フランチャイズ本部向け機能", link: "/functional-design/headquarters-features" },
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
