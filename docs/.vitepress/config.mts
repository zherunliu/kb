import { defineConfig } from "vitepress";
import { sidebar, nav } from "./sidebar-nav";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/kb/",
  title: "peacepeace",
  titleTemplate: false,
  description: "Rico's knowledge base",
  lang: "zh-CN",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    [
      "link",
      {
        rel: "icon",
        // href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='20 0 65 80'%3E%3Ctext x='50' y='50' font-size='80' text-anchor='middle' dominant-baseline='middle'%3E🎐%3C/text%3E%3C/svg%3E",
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
    // logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='20 0 65 80'%3E%3Ctext x='50' y='50' font-size='80' text-anchor='middle' dominant-baseline='middle'%3E🎐%3C/text%3E%3C/svg%3E",
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
