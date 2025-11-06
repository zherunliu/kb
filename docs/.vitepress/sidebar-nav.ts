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

const sidebar = {
  "/other/": [{ text: "Git", link: "/other/git" }],
  "/vue/": VUE,
};

const nav: DefaultTheme.NavItem[] = [
  { text: "Home", link: "/" },
  { text: "Other", link: "/other/git" },
  {
    text: "Vue",
    items: VUE,
    activeMatch: "^/vue/",
  },
];

export { sidebar, nav };
