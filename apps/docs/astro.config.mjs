// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import starlightImageZoom from "starlight-image-zoom";
import sitemap from "@astrojs/sitemap";
import mermaid from "astro-mermaid";
import starlightFullViewMode from 'starlight-fullview-mode'
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
    site: "https://reflenge.github.io",
    base: "/mobipita/docs",
    markdown: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [[rehypeKatex, { strict: true }]],
    },
    integrations: [
        mermaid({
            theme: 'forest',
            autoTheme: true,
            mermaidConfig: {
                flowchart: {
                    curve: 'basis'
                }
            },
        }),
        starlight({
            plugins: [starlightLinksValidator(), starlightImageZoom(), starlightFullViewMode({
                // Configuration options go here.
            })],
            head: [
                // Fathomのアナリティクススクリプトタグを追加する例。
                {
                    tag: 'link',
                    attrs: {
                        href: 'https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css',
                        rel: 'stylesheet',
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
                {
                    label: "moc1",
                    icon: "puzzle",
                    href: "https://reflenge.github.io/mobipita/moc1",
                },
            ],
            // sidebar: [
            //     {
            //         label: "Guides",
            //         items: [
            //             // Each item here is one entry in the navigation menu.
            //             { label: "Example Guide", slug: "guides/example" },
            //         ],
            //     },
            //     {
            //         label: "Reference",
            //         autogenerate: { directory: "reference" },
            //     },
            // ],
        }),
        sitemap(),
    ],
});
