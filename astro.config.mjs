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
                    label: "アーキテクチャ",
                    items: [
                        { label: "アーキテクチャ", link: "/architecture/" },
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
                                { label: "ORM選定", link: "/architecture/db/orm-selection" },
                            ],
                        },
                        { label: "認証", link: "/architecture/auth/provider-selection" },
                        { label: "ストレージ", link: "/architecture/storage/selection" },
                        { label: "デプロイ", link: "/architecture/deploy/strategy" },
                        { label: "バックエンド", link: "/architecture/backend/selection" },
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
