# Nodejs Basic

## Buffer 操作

```js
// 创建
const buffer1 = Buffer.alloc(10);
const buffer2 = Buffer.allocUnsafe(10000);
const buffer3 = Buffer.from("hello, world");
// 转换
const string = buffer3.toString();
// 读写
console.log(buffer1[0]);
buffer1[0] = 1; // 超过 255 高位舍弃
```

## fs 模块

### 文件操作

- 文件写入
  - `fs.writeFile(file, data, [options], callback)`
  - `fs.writeFileSync(file, data, [options])` （需要使用 `try...catch` 捕获）
- 追加写入
  - `fs.appendFile(file, data, [options], callback)`
  - `fs.appendFileSync(file, data, [options])`
  - `fs.writeFile(file, data, {flag: 'a'}, callback)`
- 流式写入
  - `fs.createWriteStream(file, [options])`
  ```js
  const fs = require("fs");
  const ws = fs.createWriteStream("./data.txt");
  ws.write("hello, world");
  // 继续调用 ws.write(...) 写入其他数据
  ws.end();
  ```
- 文件读取
  - `fs.readFile(file, [options], callback)`
    > callback 版本本身返回 `undefined`，数据通过回调参数取得
  - `require("fs/promises").readFile(file, [options])` 返回 `Promise<Buffer | string>`，是否返回字符串取决于是否指定字符编码
- 流式读取
  - `fs.createReadStream(file, [options])`
  ```js
  const fs = require("fs");
  const rs = fs.createReadStream("./data.txt");
  rs.on("data", (data) => {
    console.log(data);
    console.log(data.length); // 默认块通常不超过 65536 字节，最后一块可能更小
  });
  rs.on("end", () => {
    console.log("Read over");
  });
  ```
- 文件移动与重命名
  - `fs.rename(oldPath, newPath, callback)`
  - `fs.renameSync(oldPath, newPath)`
- 文件删除
  - `fs.unlink(path, callback)`
  - `fs.unlinkSync(path)`
  - `fs.rm(path, callback)`
  - `fs.rmSync(path)`
- 复制文件

```js
const fs = require("fs");

// 方式一
const data = fs.readFileSync("./readme.md");
fs.writeFileSync("./readme2.md", data);

// 方式二
const rs = fs.createReadStream("./readme.md");
const ws = fs.createWriteStream("./readme2.md");
rs.pipe(ws);
```

### 文件夹操作

- 创建文件夹
  - `fs.mkdir(path, [options], callback)`
  - `fs.mkdirSync(path, [options])` （递归创建 `{recursive: true}`）
- 读取文件夹
  - `fs.readdir(path, [options], callback)`
  - `fs.readdirSync(path, [options])`
- 删除文件夹
  - `fs.rm(path, { recursive: true, force: true }, callback)`
  - `fs.rmSync(path, { recursive: true, force: true })`

### 查看资源状态

- `fs.stat(path, [options], callback)`
- `fs.statSync(path, [options])`

## 路径

### 相对路径

- `.` 当前目录，`./xx` 等同于 `xx`
- `..` 上级目录

### 绝对路径

- Windows: `C:\a\b\c`（根目录是磁盘符，如 `C:\`）
- Linux/Mac: `/a/b/c`（根目录是 `/`）

> - `__dirname`：当前模块文件所在目录的**绝对路径**
> - `__filename`：当前模块文件的**绝对路径和文件名**
> - `process.cwd()`：当前**工作目录**的绝对路径（执行 `node` 命令时所在的目录）

### path 模块

- `path.resolve`
- `path.sep`
- `path.parse`
- `path.basename`
- `path.dirname`
- `path.extname`

## http 模块

```js
const http = require("http");
/* 请求/响应报文的封装对象 */
const server = http.createServer((request, response) => {
  /* 获取请求信息 */
  console.log(request.method);
  console.log(request.url);
  console.log(request.httpVersion);
  console.log(request.headers.host);
  /* 获取请求体 */
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
  });
  /* 获取请求 url */
  const url = new URL(request.url, "http://localhost");
  console.log(url);
  /* 设置响应信息 */
  response.statusCode = 200;
  response.statusMessage = "hello, rico!";
  response.setHeader("content-type", "text/html; charset=utf-8");
  request.on("end", () => {
    console.log("[request body]", body);
    response.write("rico!");
    response.end("你好，HTTP Server！"); // 设置响应体
  });
});

server.listen(8000, () => {
  console.log("服务启动...");
});
```

## 会话控制

HTTP 是一种无状态的协议，两次请求间，服务器不会保存任何数据

| cookie                                           | localStorage     | sessionStorage                 | IndexedDB                      |
| ------------------------------------------------ | ---------------- | ------------------------------ | ------------------------------ |
| 满足 Domain、Path 等条件时随请求发送             | 只在客户端存储   | 只在客户端存储                 | 只在客户端存储                 |
| 单个 Cookie 通常约 4KB                           | 通常约 5MB       | 通常约 5MB                     | 配额由浏览器和可用磁盘空间决定 |
| 可以设置过期时间，默认有效期是会话期             | 默认不会过期     | 有效期是当前标签页会话         | 默认不会过期                   |
| 同源窗口共享，可以设置 domain 属性以跨子域名共享 | 同源窗口共享     | 同一标签页中的同源页面共享     | 同源窗口共享                   |
| 可以设置 HttpOnly，阻止 JavaScript 读取          | 同源脚本可以访问 | 当前标签页中的同源脚本可以访问 | 同源脚本可以访问               |

### Cookie

Cookie 是 HTTP 服务器发送到用户浏览器并保存在本地的一小块数据；cookie 是按照域名划分的，服务器校验通过后下发 cookie，当浏览器向服务器发请求时，会自动将当前域名下可用的 cookie 设置在请求头中传递给服务器

```js
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

app.get("/set-cookie", (req, res) => {
  res.cookie("name", "rico", { maxAge: 60 * 1000 });
  res.cookie("color", "green");
  res.send("Set cookie successfully!");
});

app.get("/get-cookie", (req, res) => {
  console.log(req.cookies);
  res.send("Get cookie successfully!");
});

app.get("/remove-cookie", (req, res) => {
  res.clearCookie("color");
  res.send("Remove cookie successfully!");
});

app.listen(3000, () => {
  console.log("server start");
});
```

### Session

Session 是保存在服务端的一块数据，保存当前访问用户的相关信息，服务器校验通过后下发 cookie（session_id），当浏览器发送请求时，服务器通过 cookie 中的 session_id 确定用户身份

```js
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(
  session({
    name: "sid", // 设置 cookie name
    secret: "rico",
    saveUninitialized: false, // 是否每次请求都设置一个 cookie 来保存 session id
    resave: true, // 是否每次请求时重新保存 session
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/database",
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60,
    },
  }),
);

app.get("/login", (req, res) => {
  if (req.query.username === "admin" && req.query.password === "admin") {
    req.session.username = "admin";
    res.send("login successfully");
    return;
  }
  res.send("login failed");
});

app.get("/cart", (req, res) => {
  if (req.session.username) {
    res.send(`welcome to cart, ${req.session.username}`);
  } else res.send("please login first");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("logout successfully");
  });
});

/* curl -X POST 'http://localhost:3000/hola' \
  -H 'Content-Type: application/json' \
  -d '{ "username": "admin", "password": "pass" }' */
app.post("/hola", (req, res) => {
  res.status(200).send({ rico: req.body });
});

app.listen(3000, () => {
  console.log("server start");
});
```

### token

Token 是客户端用于证明授权状态的凭据，通常由客户端手动放在 `Authorization` 请求头中。常见的签名 JWT 格式为 `header.payload.signature`，其中 header 和 payload 可以解码读取，signature 用于校验内容是否被篡改，并不提供加密

```js
const jwt = require("jsonwebtoken");

/* 生成 token */
const token = jwt.sign(
  {
    username: "rico",
  },
  "salt",
  {
    expiresIn: 60,
  },
);

console.log(token);

jwt.verify(token, "salt", (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
});
```
