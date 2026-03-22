# Vite

## 构建工具

构建工具是前端开发中用于自动化处理代码转换、优化、打包等流程的工具，它能将开发者编写的源代码（如 TypeScript、Sass、Vue 组件等）转换为浏览器可直接运行的代码，并解决开发效率、性能优化等问题

#### 解决的问题

1. Typescript：需要使用 tsc 将 Typescript 代码转换为 JavaScript 代码
2. React/Vue：需要安装 react-compiler/vue-compiler，将 jsx 文件或 vue 文件转换为 render 函数
3. less/sass/postcss/component-style：需要安装 less-loader，sass-loader 等一系列编译工具
4. 语法降级：Babel --> 将es的新语法转换旧版浏览器可以接受的语法
5. 体积优化：UglifyJs --> 将代码进行压缩变成体积更小性能更高的文件

#### 承担的任务

1. 模块化开发支持：支持直接从 node_modules 里引入模块 + 多种模块化支持
2. 处理代码兼容性：集成了 babel 语法降级，less，ts语法转换工具
3. 提高项目性能：压缩文件，代码分割
4. 优化开发体验：
   - 构建工具自动监听文件的变化，自动调用对应的集成工具重新打包，浏览器再重新运行（热更新 hot replacement）
   - 开发服务器：用 react-cli，create-react-element，vue-cli 解决跨域问题

## Webpack

- entry：入口 JS 模块，作为构建依赖图的开始，从这个文件出发，递归找出所有依赖的文件。默认是 `./src/index.js`，entry 可以有多个
- loader：webpack 原生支持加载 JS 和 JSON 文件，loader 使得 webpack 可以加载其他类型的文件
- plugin：扩展 webpack 功能；webpack 插件是一个具有 apply 方法的 JS 对象，apply 方法会被 webpack compiler 调用，并且在整个编译生命周期都可以访问 compiler 对象
- mode：模式，可以是 development（保留源码映射，优化构建速度），production（压缩代码，Tree-Shaking）或 none，设置 mode 参数以开启 webpack 对应模式下的内置优化
- output：指定创建的 bundle 的输出目录，输出文件路径；默认输出目录是 `./dist`，默认主要输出文件路径是 `./dist/main.js`，output 只能有一个

## Why Vite?

1. 开发环境的 No-Bundle 模式
   传统构建工具（如 Webpack）在开发时会将所有代码打包成一个或多个 bundle，随着项目体积增大，打包与热更新速度会明显下降；vite 在开发阶段不打包代码，而是通过浏览器直接加载源码：
   - 启动时仅需处理入口文件，瞬间启动
   - 模块按需加载，浏览器请求源码时，vite 按需提供转换后的源码
   - 代码修改时，只重新加载修改的模块（HMR），响应速度快

   同时 Vite 会借助 esbuild 对第三方依赖进行预构建与依赖合并，将大量细碎的 CommonJS 模块转为 ESM 并合并，避免浏览器发起过多请求，进一步提升开发体验

2. 生产环境的优化打包

   开发阶段追求速度，生产环境则更关注性能与加载效率，不打包会导致额外的网络请求，Vite 会使用 Rollup 对代码进行打包（Rollup 在 Tree-Shaking 和代码压缩上更高效），Rollup 同时会完成依赖合并和业务代码分包，最终生成体积小、加载快的构建产物

## 依赖预构建

- 路径补全：vite 在处理过程中将非绝对路径或相对路径的引用开启了路径补全（解决了原生 esm 不支持 node_module 的问题）
- 依赖预构建：vite 找到相应的依赖，调用 esbuild 将其他规范的代码换成 esm 规范，同时对 esm 规范的各个模块进行统一集成（将有多个内部模块的 esm 依赖合成单个模块，减少网络请求数量）
- 预构建缓存：依赖预构建的产物缓存到 `node_modules/.vite/deps` 目录, 方便 vite 转换导入路径

::: code-group

```ts [vite.config.ts]
export default {
  optimizeDeps: {
    exclude: ["lodash-es"], // 取消依赖预构建
    include: [], // 进行依赖预构建
  },
};
```

```vue [App.vue]
<script setup lang="ts">
import * as lodash from "lodash-es";
// import * as lodash from "/node_modules/.vite/deps/lodash-es.js?"; // 路径补全
console.log(Object.keys(lodash));
</script>

<template>Lodash</template>
```

:::
预构建缓存会在以下情况下重新构建：

- 更新包管理器的锁文件：`package-lock.json`，`pnpm-lock.yaml` ...
- 更新 `vite.config.js` 中的某些配置项
- 更新 `process.env.NODE_ENV` 的值
- 启动开发服务器时指定 `--force` 命令行选项，或手动删除 `node_modules/.vite` 缓存目录

## vite 配置

### 环境变量

**env 文件：**

- `.env` 所有情况下都会被加载
- `.env.local` 所有情况下都会被加载，但会被 git 忽略
- `.env.[mode]` 指定模式下会被加载，优先级更高，例如 `.env.development`，`.env.production`
- `.env.[mode].local` 指定模式下会被加载，优先级更高，但会被 git 忽略

> .env.[mode].local > .env.[mode] > .env.local > .env

#### 环境变量处理

1. 配置目录

- root：用来配置项目根目录，默认是 `process.cwd()`，所有路径相关的配置都会基于 root 计算
- envDir：用来配置当前环境变量的文件地址

2. 调用 loadEnv（使用到了第三方库 dotenv）

- 找到 `.env` 文件，解析其中的环境变量，放进一个对象里
- 将传进来的 mode 变量的值进行拼接，生成对应的环境变量文件名，如 `.env.development`，根据提供的目录取对应的配置文件进行解析，并放进一个对象（相同的key会覆盖）
- 如果是客户端，vite 会将对应的环境变量注入到 `import.meta.env` 里，防止隐私性变量直接送入 `import.meta.env`，vite 做了一层拦截，环境变量需要以 `VITE_` 开头，可以使用 envPrefix 更改前缀
- Node 环境下，vite 推荐手动确认 env 文件：`const env = loadEnv(mode, process.cwd(), '.env')`

**`import.meta.env` 的内置变量：**

```json
/* 通过 JSON.stringify 硬编码注入浏览器 */
{
  "BASE_URL": "/", // 部署时的 URL 前缀
  "MODE": "development", // 运行模式
  "DEV": true, // 是否在 dev 环境
  "PROD": false, // 是否是 build 环境
  "SSR": false // 是否是 SSR 服务端渲染模式
}
```

### 策略模式

```js
/* vite.config.js */
import { defineConfig } from "vite"; // 会有语法提示（ts实现）
import viteBaseConfig from "./vite.base.config";
import viteDevConfig from "./vite.dev.config";
import viteProdConfig from "./vite.prod.config";

const envResolve = {
  build: () => Object.assign({}, viteBaseConfig, viteProcConfig),
  serve: () => Object.assign({}, viteBaseConfig, viteDevConfig),
};

export default defineConfig(({ command }) => {
  return envResolve[command]();
});
```

### resolve.alias

::: code-group

```ts [vite.config.ts]
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// for vite
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

```json [tsconfig.app.json]
// for ts
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

:::

## HMR（Hot Module Replacement）

HMR 是一种在开发过程中允许模块热替换的机制，在应用程序运行时，无需完全刷新页面就可以替换、添加或删除模块

原理：

1. 构建模块依赖图

- ModuleGraph：管理所有的 ModuleNode，提供模块之间的关系查询和更新功能
- ModuleNode：模块节点，包含模块的路径、内容，依赖关系等信息

2. 建立 WebSocket 连接
   - vite 向 `index.html` 中注入 `<script type="module" src="/@vite/client"></script>`，使得浏览器通过 `client.js` 和 vite 开发服务器建立 WebSocket 连接

3. 监听文件变化
   - vite 使用 chokidar 监听文件系统的变化，当文件发生变化时，vite 会根据文件类型进行不同的处理：
     - 配置文件（`vite.config.js`、`.env`）：重新加载配置并重启开发服务器
     - vite 内置客户端文件（`@vite/client`）：vite 通过 WebSocket 连接向浏览器发送 full-reload 信号，通知浏览器刷新页面
     - 其他文件：vite 根据模块依赖图找到直接或间接依赖该文件的模块，对这些模块查找 hmr 边界，vite 通过 WebSocket 连接，推送热更新信息给浏览器，浏览器向 vite 开发服务器请求新模块，执行热更新

## CSS 处理

1. 浏览器请求 `index.css` 或 `App.vue`
2. esbuild 解析 `index.tsx` 或 `App.vue`，发现 `index.tsx` 导入 `index.css`，或 `App.vue` 有 `<style>` vue 标签
3. vite 读取 `index.css` 文件内容或 `<style>` vue 标签内容
4. vite 处理 CSS 模块类型，如果是 `.module.css` 或 `<style scoped>`，则改写选择器名，以实现样式隔离
5. vite 开发服务器将 `index.css` 文件内容或 `<style>` vue 标签内容转换为 JS 代码并返回，设置 http 响应头 `Content-Type: text/javascript`，让浏览器使用 JS 的方式解析，目的是实现 `.module.css` 或 `<style scoped>` 的样式隔离和模块热替换（HMR）
6. 浏览器执行 JS 代码，创建 `<style>` html 标签插入到 `index.html` 的 `<head>` 标签中

> 生产环境还是生成静态 CSS 文件通过 `<link>` 标签引入，使浏览器可并行加载、缓存复用

## 静态资源处理

- 支持 esm 的 import，CSS 的 `url()`
- 导入 json 时，实际导入一个 JS 对象，可以解构
- 导入静态资源时，实际导入静态资源的 url（例如 `/assets/bg.png`）或 base64 字符串
- 静态资源体积小于 `vite.config.ts` 中 assetsInlineLimit 配置项的值，会被内联为 base64 字符串
- 导入脚本作为 web worker

```ts
// 导入脚本作为 web worker，使用 URL 拼成绝对路径
const webWorker = new Worker(new URL("./web-worker.ts", import.meta.url), {
  type: "module",
});
```

## 分析打包产物

```ts
// pnpm add rollup-plugin-visualizer -D
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), visualizer({ open: true })],
  build: {
    // 代码块 (chunk) 大小 > 2000KB 时警告
    chunkSizeWarningLimit: 2000,
    cssCodeSplit: true, // 开启 CSS 拆分
    sourcemap: false, // 不生成源代码映射文件 source-map
    minify: "esbuild", // JS 最小化混淆
    cssMinify: "esbuild", // CSS 最小化混淆
    assetsInlineLimit: 5000, // 静态资源大小 < 5000B 时, 内联为 base64
  },
});
```
