# Nodejs Basic

## Buffer 操作

```js
// 创建
const buffer = Buffer.alloc(10);
const buffer = Buffer.allocUnsafe(10000);
const buffer = Buffer.from("hello, world");
// 转换
const string = buffer.toString();
// 读写
console.log(buffer[0]);
buffer[0] = 1; // 超过 255 高位舍弃
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
    const fs = fs.require("fs");
    const ws = fs.createWriteStream('./data.txt');
    ws.write('hello, world')
    ...
    ws.end()
  ```
- 文件读取
  - `fs.readFile(file, [options], callback)`
  - `fs.readFile(file, [options])` 返回值：`string | Buffer`
- 流式读取
  - `fs.createReadStream(file, [options])`
  ```js
  const fs = fs.require("fs");
  const rs = fs.createReadStream("./data.txt");
  re.on("data", (data) => {
    console.log(data);
    console.log(data.length); // 65536 64KB
  });
  re.on("end", () => {
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

//方式二
const rs = fs.createReadStream("./readme.md");
const ws = fs.createWriteStream("./readme2.md");
rs.on("data", (chunk) => ws.write(chunk));
rs.on("end", () => {
  ws.close();
});

// 方式三
rs.pipe(ws);
```

### 文件夹操作

- 创建文件夹
  - `fs.mkdir(path, [options], callback)`
  - `fs.mkdirSync(path, [options])` （递归创建 `{recursive: true}`）
- 读取文件夹
  - `fs.readdir(path, [options], callback)`
  - `fs.readdirSync(path, [options])`
- 删除文件夹（推荐使用 `fs.rm`）
  - `fs.rmdir(path, [options], callback)`
  - `fs.rmdirSync(path, [options])` （递归删除 `{recursive: true}`）

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
    response.end("你好, HTTP Server!"); // 设置响应体
  });
});

server.listen(8000, () => {
  console.log("服务启动...");
});
```

## 模块化

### CommonJs

:::code-group

```js [school.js]
// 使用 exports 导出
exports.name = name;
exports.slogan = slogan;
// 使用 module.exports 导出
module.exports = { name, slogan };
```

```js [index.js]
// 使用 require() 导入
const school = require("./school.js");
```

:::

> - 每个模块的内部，`this`，`exports`，`module.exports` 在初始时，都指向同一个空对象，该空对象就是当前模块导出的数据
> - 无论如何修改导出对象，最终导出的都是 `module.exports` 的值
> - `exports` 是对 `module.exports` 的初始引用，便于给导出对象添加属性
> - 在 CommonJs 里，所写代码是被包裹到一个内置函数中执行的，可以使用 `arguments.callee` 得到函数本身

**`require` 导入自定义模块的基本流程：**

1. 将相对路径转为绝对路径，定位目标文件
2. 缓存检测
3. 读取目标文件代码
4. 包裹为一个函数并执行
5. 缓存模块的值
6. 返回 `module.exports` 的值

### ES6 Module

::: code-group

```js [student.js]
/* 多种方式可以同时使用 */
// 分别导出 export
export const name = 'rico'
export function getTel() {
return '13421399884'
}
// 统一导出 {} 不是对象
export {name, getTel}
// 默认导出 导出是一个对象，键为 default
export default
```

```js [index.js]
// 全部导入
import * as school from "./school.js";
import * as student from "./student.js";
// 命名导入 对应导出方式分别导出，统一导出
import { name as schoolName, getTel } from "./school.js";
// 默认导入 对应默认导出
import school from "./school.js";
// 命名导入和默认导入可以混用
import name, { getTel } from "./school.js";
// 动态导入
btn.click = async () => {
  const result = await import("./student.js");
  console.log(result);
};
// import 可以不接受任何数据
import "./student.js";
```

:::

> 在页面中引入 module 不影响全局：
>
> `<script type="module" src="./index.js"></script>`
>
> 导出数据和导入数据共享同一块内存，需要谨慎使用

**node 中运行 ES6 模块**

- 在 `package.json` 中配置 `"type": "module"`
- 将 `js` 后缀改为 `mjs`

## 会话控制

HTTP 是一种无状态的协议，两次请求间，服务器不会保存任何数据

| cookie                                                   | localStorage                      | sessionStorage                     | IndexedDB                         |
| -------------------------------------------------------- | --------------------------------- | ---------------------------------- | --------------------------------- |
| 每次请求时，请求头上都会携带 cookie                      | 只在客户端存储                    | 只在客户端存储                     | 只在客户端存储                    |
| 4KB                                                      | 5MB                               | 5MB                                | 无限制                            |
| 可以设置过期时间，默认有效期是会话期，页面关闭后自动删除 | 不会过期                          | 有效期是会话期，页面关闭后自动删除 | 不会过期                          |
| 同源窗口共享，可以设置 domain 属性以跨子域名共享         | 同源窗口共享                      | 不共享                             | 同源窗口共享                      |
| 可以设置 httponly 属性，以防止 XSS 攻击                  | 只在客户端存储，容易受到 XSS 攻击 | 只在客户端存储，容易受到 XSS 攻击  | 只在客户端存储，容易受到 XSS 攻击 |

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
  })
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

token 是服务端生成并返回给 HTTP 客户端的一串加密字符串， token 中保存着用户信息，服务器校验通过后响应 token，token 一般是在响应体中返回给客户端，后续发送请求时，需要手动将 token 添加在请求报文中，一般是放在请求头中。token 可以避免 CSRF（跨站请求伪造）

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
  }
);

console.log(token);

jwt.verify(token, "salt", (data, err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
});
```
