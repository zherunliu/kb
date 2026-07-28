# HTML

HTML（HyperText Markup Language）用于构建网页结构，使用语义化标签提升可读性，利于 SEO，便于设备解析

## HTML 标准结构

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body></body>
</html>
```

`<head>` 标签里表示的是页面的配置：

- `<title>`：指定整个网页的标题，在浏览器最上方显示
- `<base>`：为页面上的所有链接规定默认地址或默认目标
  > `<base href="/">` 所有 `a` 标签以此为基本路径
- `<meta>`：提供有关页面的基本信息
  > `<meta http-equiv="refresh" content="3; url=https://example.com">` 3 秒后跳转
- `<link>`：定义文档与外部资源的关系
  > `<link rel="stylesheet" href="./css/style.css" />`
  >
  > `<link rel="icon" href="./favicon.svg" type="image/svg+xml" />`

## 元素与内容模型

HTML 使用内容分类描述元素可以出现的位置，使用内容模型（content model）规定元素可以包含什么。一个元素可以同时属于多个分类，这些分类与 CSS 的 `display` 类型无关

- Flow content：`body` 中的大多数元素，例如 `div`、`p`、标题、列表以及文本级元素
- Phrasing content：构成段落的文本和文本级元素，例如文本、`span`、`em`、`strong`、`a`
- Interactive content：用于用户交互的元素，例如带 `href` 的 `a`、`button`、`input`、`select`、`textarea`

常见内容模型：

- 可以包含 flow content：例如 `div`、`section`、`article`，内部可以放文本、`span`、`p`、`div`、列表等流式内容
- 只能包含 phrasing content：例如 `p`、`span`、`em`，内部可以放文本、`span`、`em`、`strong`、`a` 等短语内容，不能放 `div`、`p`、列表等流式结构
- Interactive content 不是统一的容器类型：`button` 可以包含 phrasing content，但不能包含其他 interactive content；`input` 是空元素，不能包含子元素

### a

`a` 使用透明内容模型：它能包含的内容取决于所在的父元素。例如，在 `div` 中可以包含 flow content，在 `p` 中只能包含 phrasing content；后代中不能再包含 `a` 或其他 interactive content

- 跳转到指定页面
  > 在本窗口打开 `target="_self"`（默认），在新窗口打开 `target="_blank"`
- 跳转到指定文件

  > `<a href="./resource/mv.mp4" download="mv.mp4">下载电影</a>`
  >
  > 浏览器不能打开的文件，会自动触发下载

- 跳转到锚点位置
  > 使用 `name` 或 `id` 属性设置锚点
- 唤起指定应用
  > ```html
  > <!-- 唤起设备拨号 -->
  > <a href="tel:10010">电话联系</a>
  > <!-- 唤起设备发送邮件 -->
  > <a href="mailto:10010@qq.com">邮件联系</a>
  > <!-- 唤起设备发送短信 -->
  > <a href="sms:10086">短信联系</a>
  > <!-- 执行一段js，可以留空，javascript:; -->
  > <a href="javascript:alert(1);">点击弹窗</a>
  > ```

### link

- `rel="preload"` 预加载当前页面即将使用的资源，通常需要用 `as` 指定资源类型；支持时可用 `fetchpriority="high|low|auto"` 提供优先级提示
  > - `<link rel="preload" href="/fonts/roboto.woff2" as="font" type="font/woff2" crossorigin>` CORS对字体更严格
  > - `<link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">`
- `rel="prefetch"` 预获取未来可能会用到的资源，浏览器空闲时加载，优先级低
- `rel="preconnect"` 预连接到服务器，提前建立 TCP 连接和 TLS 握手，减少后续请求的连接时间
- `rel="dns-prefetch"` 预解析 DNS，提前获取服务器 IP 地址，减少后续请求的 DNS 解析时间
- `rel="modulepreload"` 预加载 esm 模块和依赖的子模块
- `type`：指定资源 MIME 类型，浏览器不支持则跳过加载，避免无效请求
- `media`：媒体查询，仅在匹配条件时加载资源，和 CSS 中的媒体查询 `@media` 类似

  `<link rel="preload" as="image" imagesrcset="/images/hero-480.jpg 480w, /images/hero-800.jpg 800w, /images/hero-1200.jpg 1200w" imagesizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"/>`

> 预加载不会自动执行/应用，需要后续正常引用

### picture

picture 标签用于响应式图片，根据设备特性（如屏幕分辨率，支持的图片格式）选择合适的图片资源

```html
<picture>
  <source srcset="/images/banner.avif" type="image/avif" />
  <source srcset="/images/banner.webp" type="image/webp" />
  <img
    srcset="
      /images/product-480.jpg   480w,
      /images/product-768.jpg   768w,
      /images/product-1200.jpg 1200w
    "
    sizes="(min-width: 1200px) 1200px, (min-width: 768px) 768px, 100vw"
    src="/images/product-480.jpg"
    alt="product"
    width="1200"
    height="800"
    style="width: 100%; height: auto"
  />
</picture>
```
