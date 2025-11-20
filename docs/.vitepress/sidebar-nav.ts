import { DefaultTheme } from "vitepress";

const VUE: DefaultTheme.NavItemWithLink[] = [
  {
    text: "Vue Basic",
    link: "/vue/vue-basic",
  },
  {
    text: "组件通信",
    link: "/vue/component-comm",
  },
  {
    text: "Vue Router",
    link: "/vue/vue-router",
  },
  {
    text: "Pinia",
    link: "/vue/pinia",
  },
  {
    text: "Vue Pro",
    link: "/vue/vue-pro",
  },
];

const NODEJS: DefaultTheme.NavItemWithLink[] = [
  { text: "Nodejs Basic", link: "/nodejs/nodejs-basic" },
];

const OTHER: DefaultTheme.NavItemWithLink[] = [
  { text: "Git", link: "/other/git" },
];

const sidebar = {
  "/other/": OTHER,
  "/vue/": VUE,
  "/nodejs/": NODEJS,
};

const nav: DefaultTheme.NavItem[] = [
  { text: "Home", link: "/" },
  {
    text: "Vue",
    items: VUE,
    activeMatch: "^/vue/",
  },
  {
    text: "Nodejs",
    items: NODEJS,
    activeMatch: "^/nodejs/",
  },
  {
    text: "Other",
    items: OTHER,
    activeMatch: "^/other/",
  },
];

export { sidebar, nav };
