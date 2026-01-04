import { DefaultTheme } from "vitepress";

const VUE: DefaultTheme.NavItemWithLink[] = [
  {
    text: "Vue Basic",
    link: "/vue/vue-basic",
  },
  {
    text: "Component Comm",
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
    text: "Vue2",
    link: "/vue/vue2",
  },
  {
    text: "Vue Pro",
    link: "/vue/vue-pro",
  },
];

const NODEJS: DefaultTheme.NavItemWithLink[] = [
  { text: "Nodejs Basic", link: "/nodejs/nodejs-basic" },
  { text: "Express", link: "/nodejs/express" },
  { text: "Nestjs", link: "/nodejs/nestjs" },
];

const FEBASIC: DefaultTheme.NavItemWithLink[] = [
  { text: "HTML", link: "/fe-basic/html" },
  { text: "CSS", link: "/fe-basic/css" },
];

const DATABASE: DefaultTheme.NavItemWithLink[] = [
  { text: "MongoDB", link: "/database/mongodb" },
  { text: "Redis", link: "/database/redis" },
];

const GENERAL: DefaultTheme.NavItemWithLink[] = [
  { text: "Git", link: "/general/git" },
  { text: "Docker", link: "/general/docker" },
];

const sidebar = {
  "/vue/": VUE,
  "/nodejs/": NODEJS,
  "/fe-basic/": FEBASIC,
  "/database/": DATABASE,
  "/general/": GENERAL,
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
    text: "FE-Basic",
    items: FEBASIC,
    activeMatch: "^/fe-basic/",
  },
  {
    text: "Database",
    items: DATABASE,
    activeMatch: "^/database/",
  },
  {
    text: "General",
    items: GENERAL,
    activeMatch: "^/general/",
  },
];

export { sidebar, nav };
