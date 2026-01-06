# HTML

HTML(HyperText Markup Language) 用于构建网页结构，使用语义化标签提升可读性，利于 SEO，便于设备解析

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
  > `<meta http-equiv="refresh" content="3;http://www.baidu.com">` 3 秒后跳转
- `<body>`：用于定义 HTML 文档所要显示的内容，也称为主体标签
- `<link>`：定义文档与外部资源的关系
  > `<link rel="stylesheet" href="./css/style.css" />`
  >
  > `<link rel="icon" href="./favicon.svg" type="image/svg+xml" />`

## 标签

- 文本级标签：`p`，`span`，`a`，`i`，`em`... 只能放文字，图片，表单元素
- 内容级标签：`div`，`h`，`li`，`dt`，`dd`...

### a

`a` 元素可以包裹除它自身外的任何元素

- 跳转到指定页面
  > 在本窗口打开 `target="_self"`（默认），在新窗口打开 `target="_blank"`
- 跳转到指定文件

  > `<a href="./resource/mv.mp4" download="mv.mp4">下载电影</a>`
  >
  > 浏览器不能打开的文件，会自动触发下载

- 跳转到跳转到锚点位置
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
  > <a href="javascript:alert(1);">点我弹窗</a>
  > ```
