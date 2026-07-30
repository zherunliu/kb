# @kb/content-guard

框架无关的浏览器内容保护核心。它提供 `strict`、`copyright` 和 `off` 三种模式，并把所有副作用限制在指定的正文根节点内。

```ts
import { createContentGuard } from "@kb/content-guard";
import "@kb/content-guard/style.css";

const guard = createContentGuard({
  target: ".article",
  mode: "copyright",
  copyright: { owner: "zherunliu" },
  source: {
    title: document.title,
    url: location.href,
  },
});

guard.start();
```

## 模式

- `strict`：限制正文选择、复制、右键和打印。
- `copyright`：复制时追加版权与来源，同时限制打印。
- `off`：不改变浏览器行为。

`pre`、`code`、表单控件、可编辑元素和 `[data-content-guard-allow]` 默认允许复制。可以使用 `allowSelector` 扩展或替换这组规则。

## 生命周期

- `start()` 安装监听，同一实例重复调用不会重复绑定。
- `update()` 更新模式和页面来源。
- `refresh()` 在 SPA 替换正文节点后重新应用作用域属性。
- `destroy()` 恢复 SDK 改动的属性并移除监听。

## 安全边界

版权 HTML 使用 DOM API 和 `textContent` 构建，配置值不会被解析成标签。SDK 不删除正文 DOM，因此不会破坏 SSR、SEO 或屏幕阅读器，但也无法防止查看源代码、禁用 JavaScript、截图、OCR、网络抓包或主动调用 Clipboard API。
