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
    text: "vue-router",
    link: "/vue/vue-router",
  },
  {
    text: "pinia",
    link: "/vue/pinia",
  },
  {
    text: "Vue Pro",
    link: "/vue/vue-pro",
  },
];

const sidebar = {
  "/examples/": [
    { text: "Markdown Examples", link: "/examples/markdown-examples" },
  ],
  "/vue/": VUE,
};

const nav: DefaultTheme.NavItem[] = [
  { text: "Home", link: "/" },
  { text: "Examples", link: "/examples/markdown-examples" },
  {
    text: "Vue",
    items: VUE,
    activeMatch: "^/vue/",
  },
];

export { sidebar, nav };
