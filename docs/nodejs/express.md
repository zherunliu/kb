# Express

## 路由

express 路由确定了应用程序如何响应客户端对特定端点（URI）和 HTTP 方法的请求，路由的组成：`app.<method>(path, callback)`

```js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.end("hello, express!"); // 兼容 http
});

app.post("/login", (req, res) => {
  res.send("login successfully!");
});

app.all("/search", (req, res) => {
  res.send("loading...");
});

app.all("*splat", (req, res) => {
  res.send("<h1>404 Not Found</h1>");
});

app.listen(8000, () => {
  console.log("服务启动...");
});
```

## 获取/设置请求/响应

express 框架兼容原生 HTTP 模块

```js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  /* 请求方法 */
  console.log(req.query);
  console.log(req.get("host"));

  /* 响应方法 */
  res.status(500);
  res.set("name", "rico"); // 设置响应头
  res.send("中文响应不乱码");
  /* 连贯操作 */
  res.status(404).set("name", "rico").send("hello");

  /* 其他响应 */
  res.redirect("http://baidu.com");
  res.download("./package.json");
  res.json("{name:rico, age:24}");
  res.sendFile(__dirname + "/index.html");
});

/* 获取请求体 */
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // true: 使用 qs 库解析

app.post("/login", (req, res) => {
  console.log("[body]", req.body);
  res.send("login successfully!");
});

/* 获取路由参数 */
app.get("/:id.html", (req, res) => {
  res.send("Id of the product: " + req.params.id);
});

app.listen(8000, () => {
  console.log("服务启动...");
});
```

## Middleware

中间件是指那些可以访问请求对象（`req`）、响应对象（`res`）以及应用程序请求-响应周期中处于请求-响应循环中的下一个中间件函数（`next()`）的函数，本质是一个回调函数

```js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

function recordMiddleware(req, res, next) {
  const { url, ip } = req;
  fs.appendFileSync(path.resolve(__dirname, "access.log"), `${url} ${ip}\n`);
  next();
}
/* 全局中间件 */
app.use(recordMiddleware);

/* 路由中间件 */
// app.get("/", middleware1, middleware2, (req, res) => {});

/* 静态资源中间件设置 */
app.use("/static", express.static(path.resolve(__dirname, "public")));

app.listen(8000, () => {
  console.log("服务启动...");
});
```

## Router

express 中的 router 是一个完整的中间件和路由系统，可以看做是一个小型的 app 对象

::: code-group

```js [homeRouter.js]
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to Home Page");
});

router.get("/personal", (req, res) => {
  res.send("Welcome to Personal Page");
});

module.exports = router;
```

```js [index.js]
const express = require("express");
const app = express();
const homeRouter = require("./homeRouter");

app.use(homeRouter);
/* 可添加路由前缀 */
// app.use('/user', userRouter)

app.listen(8000, () => {
  console.log("服务启动...");
});
```

:::

## EJS

EJS 是 JavaScript 的模板引擎（分离用户界面和业务数据）

**常用语法：**

- `<% %>` 执行代码
- `<%= %>` 输出转义后的内容
- `<%- %>` 输出原始内容
- `ejs.render(template, data)` 渲染模板字符串

**在 express 中使用 ejs：**

```js
const app = express();
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "./views"));

app.get("/home", (req, res) => {
  const title = "Home page";
  /* 模板文件 ./views/home.ejs */
  res.render("home", { title });
});
```

## express-generator

快速创建 express 应用骨架

```bash
pnpm add -g express-generator
express -e <filename>
```

### 文件上传案例

::: code-group

```js [routers/index.js]
var express = require("express");
var { formidable } = require("formidable");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/portrait", function (req, res, next) {
  res.render("portrait", { title: "文件上传" });
});

router.post("/portrait", function (req, res, next) {
  const form = formidable({
    multiples: true,
    uploadDir: __dirname + "/../public/images",
    keepExtensions: true,
  });
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    const url = "/images/" + files.portrait.newFilename;
    res.json({ fields, files, url });
  });
});

module.exports = router;
```

```html [views/portrait.ejs]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= title %></title>
  </head>
  <body>
    <form action="/portrait" method="post" enctype="multipart/form-data">
      用户名：<input type="text" name="username" /><br />
      头像：<input type="file" name="portrait" />
      <button>提交</button>
    </form>
  </body>
</html>
```

:::
