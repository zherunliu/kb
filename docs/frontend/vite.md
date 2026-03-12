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

1. 开发环境的 No-Bundler 模式

   传统构建工具（如 Webpack）在开发时会将所有代码打包成一个或多个 bundle，随着项目变大，打包时间会越来越长；vite 在开发阶段不打包代码，而是通过浏览器直接加载源码（vite 是基于 esm 的，webpack 支持多种模块化；vite 更关注浏览器端开发体验，webpack 更注重兼容性）：
   - 启动时仅需处理入口文件，瞬间启动
   - 模块按需加载，浏览器请求源码时，vite 按需提供转换后的源码
   - 代码修改时，只重新加载修改的模块（HMR），响应速度快

2. 生产环境的优化打包

   开发阶段追求速度，生产环境则需要优化性能，不打包会导致额外的网络请求，Vite 会使用 Rollup 对代码进行打包（Rollup 在 Tree-Shaking 和代码压缩上更高效），生成体积小、加载快的最终产物

## 依赖预构建

- 路径补全：vite 在处理过程中将非绝对路径或相对路径的引用开启了路径补全（解决了原生 esm 不支持 node_module 的问题）
- 依赖预构建：vite 找到相应的依赖，调用 esbuild 将其他规范的代码换成 esm 规范，同时对 esm 规范的各个模块进行统一集成（将有多个内部模块的 esm 依赖合成单个模块，减少网络请求数量）
- 预构建缓存：依赖预构建的产物缓存到 `node_modules/.vite/deps` 目录, 方便 vite 转换导入路径

```js
/* vite.config.js */
export default {
  optimizeDeps: {
    exclude: ["lodash-es"], // 取消依赖预构建
  },
};
```

预构建缓存会在以下情况下重新构建：

- 更新包管理器的锁文件：`package-lock.json`，`pnpm-lock.yaml` ...
- 更新 `vite.config.js` 中的某些配置项
- 更新 `process.env.NODE_ENV` 的值
- 启动开发服务器时指定 `--force` 命令行选项，或手动删除 `node_modules/.vite` 缓存目录

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
