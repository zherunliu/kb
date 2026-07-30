import type { DefaultTheme } from "vitepress";

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
    text: "Vue Pro",
    link: "/vue/vue-pro",
  },
];

const REACT: DefaultTheme.NavItemWithLink[] = [
  { text: "React", link: "/react/react" },
  { text: "React Router", link: "/react/react-router" },
  { text: "Zustand", link: "/react/zustand" },
  { text: "Nextjs", link: "/react/nextjs" },
];

const FRONTEND: DefaultTheme.NavItemWithLink[] = [
  { text: "HTML", link: "/frontend/html" },
  { text: "JS/TS", link: "/frontend/js-ts" },
  { text: "CSS Basic", link: "/frontend/css-basic" },
  { text: "CSS Pro", link: "/frontend/css-pro" },
  { text: "React", link: "/react/react" },
  { text: "Web API", link: "/frontend/web-api" },
  { text: "Vite", link: "/frontend/vite" },
  { text: "Tools", link: "/frontend/tools" },
];

const NODEJS: DefaultTheme.NavItemWithLink[] = [
  { text: "NodeJS Basic", link: "/nodejs/nodejs-basic" },
  { text: "Express", link: "/nodejs/express" },
  { text: "NestJS", link: "/nodejs/nestjs" },
];

const DATABASE: DefaultTheme.NavItemWithLink[] = [
  { text: "MySQL", link: "/database/mysql" },
  { text: "MongoDB", link: "/database/mongodb" },
  { text: "Redis", link: "/database/redis" },
];

const GENERAL: DefaultTheme.NavItemWithLink[] = [
  { text: "Network", link: "/general/network" },
  { text: "Python", link: "/general/python" },
  { text: "Algorithm", link: "/general/algorithm" },
  { text: "Git", link: "/general/git" },
  { text: "Test", link: "/general/test" },
  { text: "Docker", link: "/general/docker" },
];

const sidebar = {
  "/vue/": VUE,
  "/react/": REACT,
  "/frontend/": FRONTEND,
  "/nodejs/": NODEJS,
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
    text: "React",
    items: REACT,
    activeMatch: "^/react/",
  },
  {
    text: "FrontEnd",
    items: FRONTEND,
    activeMatch: "^/frontend/",
  },
  {
    text: "NodeJS",
    items: NODEJS,
    activeMatch: "^/nodejs/",
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

export { nav, sidebar };
