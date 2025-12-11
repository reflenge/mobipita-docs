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
                en: {
                    label: "English",
                    lang: "en",
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
                    label: "アーキテクチャ",
                    items: [
                        {
                            label: "テナントモデル",
                            slug: "architecture/tenant-model",
                        },
                        {
                            label: "Stripe Connect",
                            slug: "architecture/stripe-connect",
                        },
                        {
                            label: "データベース設計",
                            slug: "architecture/database-design",
                        },
                    ],
                },
                {
                    label: "ミーティング",
                    items: [
                        {
                            label: "アプリケーション構成",
                            slug: "meetings/app-architecture",
                        },
                    ],
                },
                {
                    label: "調査",
                    items: [
                        {
                            label: "インフラ選定",
                            slug: "research/infrastructure-selection",
                        },
                    ],
                },
            ],
        }),
        sitemap(),
    ],

    adapter: cloudflare(),
});
