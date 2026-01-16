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
  { text: "NodeJS Basic", link: "/nodejs/nodejs-basic" },
  { text: "Express", link: "/nodejs/express" },
  { text: "NestJS", link: "/nodejs/nestjs" },
];

const FRONTEND: DefaultTheme.NavItemWithLink[] = [
  { text: "HTML", link: "/frontend/html" },
  { text: "CSS Basic", link: "/frontend/css-basic" },
  { text: "CSS Pro", link: "/frontend/css-pro" },
];

const DATABASE: DefaultTheme.NavItemWithLink[] = [
  { text: "MongoDB", link: "/database/mongodb" },
  { text: "Redis", link: "/database/redis" },
];

const GENERAL: DefaultTheme.NavItemWithLink[] = [
  { text: "Git", link: "/general/git" },
  { text: "Docker", link: "/general/docker" },
  { text: "Network", link: "/general/network" },
];

const sidebar = {
  "/vue/": VUE,
  "/nodejs/": NODEJS,
  "/frontend/": FRONTEND,
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
    text: "NodeJS",
    items: NODEJS,
    activeMatch: "^/nodejs/",
  },
  {
    text: "FrontEnd",
    items: FRONTEND,
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
