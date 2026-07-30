# @kb/vitepress-content-guard

将 `@kb/content-guard` 接入 VitePress 主题和客户端路由。

```ts
import { withContentGuard } from "@kb/vitepress-content-guard";
import DefaultTheme from "vitepress/theme";

export default withContentGuard(DefaultTheme, {
  defaultMode: "copyright",
  copyright: { owner: "zherunliu" },
});
```

默认保护 `.vp-doc`。适配器会自动引入核心样式，并在客户端路由切换后更新正文节点、标题和来源 URL。

## 页面级配置

Markdown frontmatter 可以覆盖全站默认值：

```yaml
---
contentGuard: strict
---
```

支持 `strict`、`copyright` 和 `off`。非法值会在开发环境产生警告，并回退到 `defaultMode`。

## 使用建议

- 普通知识库默认使用 `copyright`，允许引用但保留来源。
- 敏感文章使用 `strict`。
- 必须保持浏览器原生行为的页面使用 `off`。
- 使用 `[data-content-guard-allow]` 显式放行自定义交互区域。

浏览器已经收到的 HTML 无法获得绝对保护。该 SDK 用于约束常规操作和表达版权要求，不是 DRM。
