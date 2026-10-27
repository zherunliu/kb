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
  { text: "Linux", link: "/general/linux" },
  { text: "Network", link: "/general/network" },
  { text: "Network Basic", link: "/general/network-basic" },
  { text: "DNS", link: "/general/dns" },
  { text: "Python", link: "/general/python" },
  { text: "Algorithm", link: "/general/algorithm" },
  { text: "Git", link: "/general/git" },
  { text: "Test", link: "/general/test" },
  { text: "Docker", link: "/general/docker" },
];

const TECH_RADAR: DefaultTheme.SidebarItem[] = [
  { text: "Overview", link: "/tech-radar/" },
  {
    text: "October 2026",
    collapsed: false,
    items: [
      {
        text: "10-27 · Brotli Updates, User-Scoped MCP & Autumn from Space",
        link: "/tech-radar/2026-10-27",
      },
      {
        text: "10-26 · Async Agents, OBS & Open Chiplets",
        link: "/tech-radar/2026-10-26",
      },
      {
        text: "10-25 · Kimi K3.1, Agent Skills & Dragonfly",
        link: "/tech-radar/2026-10-25",
      },
      {
        text: "10-24 · Enterprise Apps, KeePassXC & 3D Lidar",
        link: "/tech-radar/2026-10-24",
      },
      {
        text: "10-23 · Formal Verification, Feature Flags & Photonics",
        link: "/tech-radar/2026-10-23",
      },
      {
        text: "10-22 · Sandbox Trust, Model APIs & AI Ultrasound",
        link: "/tech-radar/2026-10-22",
      },
      {
        text: "10-21 · WordPress Beta, Security Patches & Space Relay",
        link: "/tech-radar/2026-10-21",
      },
      {
        text: "10-20 · TorchNeuron, Forecasting & Night Lights",
        link: "/tech-radar/2026-10-20",
      },
      {
        text: "10-19 · RTX Spark, SPACE & Interpretability",
        link: "/tech-radar/2026-10-19",
      },
      {
        text: "10-18 · Agent Memory, CJK Search & Quantum Circuits",
        link: "/tech-radar/2026-10-18",
      },
      {
        text: "10-17 · Beam, License Checks & Martian Moons",
        link: "/tech-radar/2026-10-17",
      },
      {
        text: "10-16 · Actions Locks, AI Optimization & Phone Migration",
        link: "/tech-radar/2026-10-16",
      },
      {
        text: "10-15 · curl, SVN & Deep Review",
        link: "/tech-radar/2026-10-15",
      },
      {
        text: "10-14 · MCP, Secret Detection & Mars Navigation",
        link: "/tech-radar/2026-10-14",
      },
      {
        text: "10-13 · Muse Wonder, Maia & Zig Templates",
        link: "/tech-radar/2026-10-13",
      },
      {
        text: "10-12 · DNS Rollover & Shared AI",
        link: "/tech-radar/2026-10-12",
      },
      {
        text: "10-11 · Deno & Multimodal Decisions",
        link: "/tech-radar/2026-10-11",
      },
      {
        text: "10-10 · Open Models & Shared Patches",
        link: "/tech-radar/2026-10-10",
      },
      {
        text: "10-09 · Agent Sandboxes & Space Metrology",
        link: "/tech-radar/2026-10-09",
      },
      {
        text: "10-08 · Mistral Preview & OpenGrid",
        link: "/tech-radar/2026-10-08",
      },
      {
        text: "10-07 · Stacked PRs & DNS Trust",
        link: "/tech-radar/2026-10-07",
      },
      {
        text: "10-06 · Staged Publishing & Privacy",
        link: "/tech-radar/2026-10-06",
      },
      {
        text: "10-05 · AI Workspaces & Toolchains",
        link: "/tech-radar/2026-10-05",
      },
    ],
  },
];

const sidebar = {
  "/vue/": VUE,
  "/react/": REACT,
  "/frontend/": FRONTEND,
  "/nodejs/": NODEJS,
  "/database/": DATABASE,
  "/general/": GENERAL,
  "/tech-radar/": TECH_RADAR,
};

const nav: DefaultTheme.NavItem[] = [
  { text: "Home", link: "/" },
  { text: "Tech Radar", link: "/tech-radar/", activeMatch: "^/tech-radar/" },
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
