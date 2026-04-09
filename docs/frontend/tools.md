# Tools

## Babel

Babel 是一个 JavaScript 编译器，主要用于将现代 JavaScript 代码转换为向后兼容的版本，以便在旧浏览器或环境中运行

1. 语法转换：将新版本的 JavaScript 语法转换为旧版本的语法
2. Polyfill：通过引入额外的代码，使新功能在旧浏览器可用
3. JSX：将 JSX 语法转换成普通的 JavaScript 语法
4. 插件：为 Babel 提供自定义功能

## SWC

SWC 是一个用 Rust 编写的 JavaScript/TypeScript 编译器，旨在提供快速的编译速度和高效的性能

1. JavaScript/TypeScript 转换，可以将现代 JavaScript（ES6+）和 TypeScript 代码转换为兼容旧版 JavaScript 环境的代码。这包括语法转换（如箭头函数、解构赋值等）以及一些 polyfill 的处理
2. 模块打包 SWC 提供了基础的打包功能，可以将多个模块捆绑成一个单独的文件
3. SWC 支持代码压缩和优化功能，类似于 Terser。它可以对 JavaScript 代码进行压缩，去除不必要的空白、注释，并对代码进行优化以减小文件大小，提高加载速度
4. SWC 原生支持 TypeScript，可以将 TypeScript 编译为 JavaScript
5. SWC 支持 React 和 JSX 语法，可以将 JSX 转换为标准的 JavaScript 代码。它还支持一些现代的 React 特性

SWC在单线程上比 Babel 快 20 倍，在四核上快 70 倍

## PostCSS

PostCSS 是一个用 JavaScript 编写的工具，它可以通过插件对 CSS 进行转换和处理。它本身并不直接处理 CSS，而是提供了一个解析 CSS 的引擎和插件系统，让开发者可以通过各种插件实现不同的功能

PostCSS 的工作流程：

1. 解析 CSS 代码为抽象语法树（AST）
2. 调用各种插件对 AST 进行处理（如转换、优化等）
3. 将处理后的 AST 重新转换为 CSS 代码
   > css 代码 --> postcss --> 预处理器 less，sass 等将语法编译为原生 css --> 对高级 css 语法降级 --> 前缀补全 --> 浏览器客户端
