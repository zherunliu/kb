import { defineConfig } from "vitepress";
import { nav, sidebar } from "./sidebar-nav";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/kb/",
  title: "peacepeace",
  titleTemplate: false,
  description: "Rico's knowledge base",
  lang: "zh-CN",
  srcDir: "docs",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "/kb/cherry.svg",
        type: "image/svg+xml",
      },
    ],
  ],
  markdown: {
    lineNumbers: true,
    theme: {
      light: "vitesse-light",
      dark: "vitesse-dark",
    },
  },
  themeConfig: {
    logo: "/cherry.svg",
    search: {
      provider: "local",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav,
    outline: [2, 3],
    sidebar,
    editLink: {
      pattern: "https://github.com/zherunliu/kb/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/zherunliu" }],
  },
});
