# Tools

## Babel

Babel 是一个 JavaScript 编译器，主要用于将现代 JavaScript 代码转换为向后兼容的版本，以便在旧浏览器或环境中运行

1. 语法转换：将新版本的 JavaScript 语法转换为旧版本的语法
2. Polyfill 配合：Babel 可以根据目标环境和配置引入 `core-js` 等 polyfill，使新功能在旧浏览器可用
3. JSX：将 JSX 语法转换成普通的 JavaScript 语法
4. 插件：为 Babel 提供自定义功能

## SWC

SWC 是一个用 Rust 编写的 JavaScript/TypeScript 编译器，旨在提供快速的编译速度和高效的性能

1. JavaScript/TypeScript 转换：移除 TypeScript 类型，并根据目标环境改写箭头函数、可选链等新语法。`Promise`、`Array.prototype.includes()` 等运行时 API 需要另外配置 `core-js` 等 polyfill
2. 模块打包 SWC 提供了基础的打包功能，可以将多个模块捆绑成一个单独的文件
3. SWC 支持代码压缩和优化功能，类似于 Terser。它可以对 JavaScript 代码进行压缩，去除不必要的空白、注释，并对代码进行优化以减小文件大小，提高加载速度
4. SWC 原生支持 TypeScript，可以将 TypeScript 编译为 JavaScript
5. SWC 支持 React 和 JSX 语法，可以将 JSX 转换为标准的 JavaScript 代码。它还支持一些现代的 React 特性

SWC 的主要优势是编译速度快

## PostCSS

PostCSS 是一个通过 JavaScript 插件转换 CSS 的工具。它把输入的 CSS 解析成 AST，由插件进行处理，再输出 CSS

PostCSS 的工作流程：

1. 解析 CSS 代码为抽象语法树（AST）
2. 调用各种插件对 AST 进行处理（如语法转换、前缀补全、优化等）
3. 将处理后的 AST 重新转换为 CSS 代码
   > Sass/Less 源码 --> 预处理器生成中间 CSS --> PostCSS 解析并通过插件处理 --> 生成最终 CSS --> 浏览器
