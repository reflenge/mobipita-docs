// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import starlightImageZoom from "starlight-image-zoom";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    site: "https://reflenge.github.io",
    base: "/mobi-pita/docs",
    integrations: [
        starlight({
            plugins: [starlightLinksValidator(), starlightImageZoom()],
            favicon: "/favicon.ico",
            title: "Mobi-Pita",
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
                    href: "https://github.com/reflenge/mobi-pita",
                },
                {
                    label: "moc1",
                    icon: "puzzle",
                    href: "https://reflenge.github.io/mobi-pita/moc1",
                },
            ],
            sidebar: [
                {
                    label: "Guides",
                    items: [
                        // Each item here is one entry in the navigation menu.
                        { label: "Example Guide", slug: "guides/example" },
                    ],
                },
                {
                    label: "Reference",
                    autogenerate: { directory: "reference" },
                },
            ],
        }),
        sitemap(),
    ],
});
