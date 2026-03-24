# Web API

## DOM API

#### 创建元素

- `document.createElement(tagName)`：创建指定标签名的元素
- `document.createTextNode(text)`：创建文本节点

#### 获取元素

- `document.getElementById(id)`：通过 id 获取元素，返回单个元素
- `document.getElementsByClassName(className)`：通过类名获取元素，返回 HTMLCollection（类数组）
- `document.getElementsByTagName(tagName)`：通过标签名获取元素，返回 HTMLCollection（类数组）
- `document.querySelector(selector)`：通过 CSS 选择器获取元素，返回单个元素
- `document.querySelectorAll(selector)`：通过 CSS 选择器获取元素，返回 NodeList（类数组）

#### 插入元素

- `parentNode.appendChild(childNode)`：将子节点添加到父节点的最后面
- `parentNode.removeChild(childNode)`：从父节点移除子节点
- `parentNode.insertBefore(newNode, referenceNode)`：将新节点插入到参考节点前面
- `parentNode.replaceChild(newNode, oldNode)`：用新节点替换旧节点
- `element.insertAdjacentHTML(position, htmlString)`：在指定位置插入 HTML 字符串
  - `position` 可选值：
    > - `beforebegin`：元素前面
    > - `afterbegin`：元素内部的第一个子节点前面
    > - `beforeend`：元素内部的最后一个子节点后面
    > - `afterend`：元素后面

#### 操作元素

- `element.setAttribute(name, value)`：设置元素属性
- `element.getAttribute(name)`：获取元素属性值
- `element.removeAttribute(name)`：移除元素属性
- `element.classList`：操作元素的类名列表
  - `element.classList.add(className)`：添加类名
  - `element.classList.remove(className)`：移除类名
  - `element.classList.toggle(className)`：切换类名
  - `element.classList.contains(className)`：检查是否包含类名
- `element.style`：操作元素的内联样式
  - `element.style.propertyName = value`：设置样式属性
  - `getComputedStyle(element).propertyName`：获取计算后的样式属性值
- `element.innerHTML`：获取或设置元素的 HTML 内容
- `element.textContent`：获取或设置元素的文本内容
- `element.innerText`：获取或设置元素的可见文本内容
- `element.cloneNode(deep)`：克隆元素，`deep` 为 boolean 值，表示是否深度克隆（包括子节点）

#### 事件处理

- `element.addEventListener(eventType, listener, options)`：添加事件监听器
  > `options?: boolean | AddEventListenerOptions`：
  >
  > - `capture`：boolean 值，表示是否在捕获阶段触发（默认 false，在冒泡阶段执行，可直接传入 boolean 值）
  > - `once`：boolean 值，表示监听器是否只触发一次
  > - `passive`：boolean 值，表示监听器是否永远不会调用 `preventDefault()`，如果监听器调用了 `preventDefault()`，浏览器会忽略它并输出警告信息
- `element.removeEventListener(eventType, listener, options)`：移除事件监听器
- 事件对象 `event`
  - `event.target`：触发事件的元素
  - `event.currentTarget`：当前正在处理事件的元素
  - `event.preventDefault()`：阻止默认行为
  - `event.stopPropagation()`：阻止事件冒泡
  - `event.stopImmediatePropagation()`：阻止事件冒泡并阻止当前元素的其他事件监听器执行

### DOM 事件模型

#### 事件传播流程

- 捕获阶段：事件从 document 对象向事件目标元素传播，触发捕获事件监听器
  > document -> html -> body -> ... -> target
- 目标阶段：事件到达事件目标元素，触发目标事件监听器
- 冒泡阶段：事件从事件目标元素向 document 对象传播，触发冒泡事件监听器
  > target -> ... -> body -> html -> document

#### 事件委托

- 将事件监听器添加到父元素上，通过事件冒泡机制来处理子元素的事件
- 优点：减少事件监听器的数量，提高性能；动态添加子元素时无需重新绑定事件监听器

```html
<ul id="list">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
<script>
  const list = document.getElementById("list");
  list.addEventListener("click", (event) => {
    if (event.target.tagName === "LI") {
      console.log("绑定事件的元素：", event.currentTarget.tagName); // UL
      console.log("触发事件的元素：", event.target.tagName); // LI
      console.log(event.target.textContent); // Item 1/2/3
    }
  });
</script>
```

## BOM API

- `window`：表示浏览器窗口的全局对象
- `window.location`：表示当前页面的 URL 信息
- `window.history`：表示浏览器的历史记录
- `window.navigator`：表示浏览器的用户代理信息
- `window.screen`：表示用户屏幕的信息
- `window.localStorage`：表示浏览器的本地存储
- `window.sessionStorage`：表示浏览器的会话存储
- `window.alert(message)`：显示一个警告框
- `window.confirm(message)`：显示一个确认框，返回用户的选择
- `window.prompt(message, default)`：显示一个提示框，返回用户输入的值

### navigator

#### navigator.sendBeacon

`navigator.sendBeacon` 方法用于在页面卸载时，向服务器异步发送少量数据（ping 请求），常用于发送分析数据或日志信息

- 不会阻塞页面卸载过程
- 可以发送跨域请求
- 只能发送 POST 请求
- 发送的数据量有限制（<= 64KB）
- 不能自定义请求头
- 只能传输 `ArrayBuffer`，`ArrayBufferView`，`Blob`，`DOMString`，`FormData` 或 `URLSearchParams` 类型的数据

```js
window.addEventListener("unload", () => {
  const url = "http://localhost:3000/log";
  const data = JSON.stringify({
    event: "page_unload",
    timestamp: Date.now(),
  });
  const blob = new Blob([data], { type: "application/json" });
  navigator.sendBeacon(url, blob);
});
```

## SSE/WebSocket

### SSE

SSE 是基于 HTTP 的服务器推送技术，允许服务器主动向客户端推送实时数据

1. 客户端连接：客户端创建 EventSource 对象，指定服务器的 URL，与服务器建立持久化的 HTTP 长连接（使用 HTTP/HTTPS，不需要升级协议，请求头中包含 `Accept: text/event-stream` 指定事件流格式）
2. 服务器推送：服务器设置 HTTP 响应头 `Content-Type: text/event-stream`，向客户端推送事件，每条事件包含 `event`：事件名 `data`：事件数据和 `id`：事件 ID 等，以 `\n\n` 分隔多条事件如 `id: 1\nevent: message\ndata: hello\n\n`
3. 客户端接收：客户端使用 onmessage 或 addEventListener 监听事件，收到事件后，触发对应的事件处理器，处理事件数据
4. 连接关闭：客户端关闭 EventSource 对象，关闭与服务器的 HTTP 长连接

**readyState：**

- CONNECTING 正在建立连接
- OPEN 已建立连接，正在接收服务器推送的数据
- CLOSED 已关闭连接

::: code-group

```html [index.html]
<!DOCTYPE html>
<html>
  <head>
    <title>SSE</title>
  </head>
  <body>
    <div id="sse"></div>
    <script>
      document.addEventListener("keydown", (e) => {
        if (e.keyCode === 13) {
          const eventSource = new EventSource("/sse");

          /* 也可以使用 eventSource.addEventListener('message')
            可自定义 默认 message */
          eventSource.onmessage = (event) => {
            const data = event.data;
            document.getElementById("sse").innerHTML += `<p>${data}</p>`;
          };
          eventSource.onerror = (err) => {
            console.error(err);
            eventSource.close();
          };
        }
      });
    </script>
  </body>
</html>
```

```js [server.js]
import express from "express";
const app = express();

app.get("/sse", (req, res) => {
  console.log("Client connected");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "Keep-Alive");
  let counter = 0;
  const sendData = () => {
    counter++;
    const payload = {
      time: new Date().toISOString(),
      count: counter,
    };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    if (counter >= 100) {
      clearInterval(timer);
      res.end();
    }
  };
  const timer = setInterval(sendData, 1000);

  req.on("close", () => {
    console.log("Client disconnected");
    clearInterval(timer);
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
```

```js [vite.config.js]
import { defineConfig } from "vite";

/** 启动 vite 服务
 * "scripts": {
    "dev": "vite sse"
   },
 */
export default defineConfig({
  server: {
    proxy: {
      "/sse": {
        target: "http://localhost:3000/",
        changeOrigin: true,
      },
    },
  },
});
```

:::

### WebSocket

WebSocket 前，如果需要在服务器和客户端间双向通信，则需要通过 HTTP 轮询实现，HTTP 轮询分为短轮询和长轮询

- 短轮询：浏览器使用 JavaScript 启动一个定时器，以固定的间隔向服务器发送请求，询问服务器有没有新消息

  > 缺点：实时性差，频繁的请求会增大服务器的压力

- 长轮询：浏览器发送请求后，服务器保持连接，等到有新消息时才返回，减少了请求次数，提高了实时性
  > 缺点：
  >
  > - 多线程服务器的 listener 线程长时间挂起，等待新消息，浪费 CPU 资源
  > - 一个长时间无数据传输的 HTTP 连接，链路上的任何一个网关都可能关闭该 HTTP 连接，这是不可控的
  >   HTML5 新增 WebSocket 协议，可以在浏览器和服务器间建立不受限制的双向通信的通道

HTTP 通过 header 中是否包含 `Connection: Upgrade` 和 `Upgrade: websocket`，以判断是否升级到 WebSocket 协议，其他 header 字段

`Sec-WebSocket-Key`：浏览器随机生成的安全密钥
`Sec-WebSocket-Version`：WebSocket 协议版本
`Sec-WebSocket-Extensions`：协商 WebSocket 连接使用的扩展
`Sec-WebSocket-Protocol`：协商 WebSocket 连接使用的子协议

**WebSocket 特点**

- 支持双向通信，实时性高
- 未加密的 WebSocket 协议标识符是 `ws://`，端口号是 80，对应 `http://`；加密的 WebSocket 协议标识符是 `wss://`，端口号是 443，对 `https://`
- 协议开销小，HTTP 每次通信都需要携带完整的 HTTP 头部，WebSocket 协议的头部较小，减小了数据传输的开销
- 支持扩展：用户可以扩展 WebSocket 协议，也可以自定义子协议（例如可以自定义压缩算法等）
- 没有跨域问题

**SSE 和 WebSocket 的区别**

- SSE 基于 HTTP，利用 HTTP 的长连接特性，在客户端和服务器间建立持久连接；WebSocket 基于 TCP
- SSE 支持传输 text 文本字符串；WebSocket 支持传输 text 文本字符串和 blob 二进制数据
- SSE 只支持单向数据流，即只支持服务器向客户端推送数据；WebSocket 支持双向数据流，没有消息大小限制
- SSE 不能手动关闭或重新连接；WebSocket 可以手动关闭和重新连接等

::: code-group

```ts [server.js]
import ws from "ws";
const wss = new ws.Server({ port: 8080 }, () => {
  console.log("WebSocket started at port 8080");
});
enum State {
  HEART = 1,
  MESSAGE = 2,
}
wss.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("message", (e) => {
    // socket.send("From Server: " + e.toString());
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({ type: State.MESSAGE, data: e.toString() }));
    });
  });

  // Heartbeat mechanism
  let heartInterval: NodeJS.Timeout;
  const heartChecker = () => {
    if (socket.readyState === ws.OPEN) {
      socket.send(JSON.stringify({ type: State.HEART, data: "ping" }));
    } else {
      clearInterval(heartInterval);
    }
  };
  heartInterval = setInterval(heartChecker, 3000);
});
```

```html [index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebSocket</title>
  </head>
  <body>
    <div>
      <ul id="list"></ul>
      <input type="text" id="input" />
      <button id="btn">Send</button>
    </div>
  </body>
</html>

<script>
  const ws = new WebSocket("ws://localhost:8080");

  const input = document.querySelector("#input");
  const btn = document.querySelector("#btn");
  const list = document.querySelector("#list");
  btn.addEventListener("click", () => {
    if (input.value) {
      ws.send(input.value);
      input.value = "";
    }
  });

  ws.onopen = () => {
    console.log("WebSocket connection established");
  };

  ws.onmessage = (event) => {
    console.log("Message from server:", event.data);
    let data = JSON.parse(event.data);
    if (data.type === 2) {
      let li = document.createElement("li");
      li.innerText = event.data;
      list.appendChild(li);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  /* 调用 ws.close() 可以主动断开 */
  ws.onclose = () => {
    console.log("WebSocket connection closed");
  };
</script>
```

:::

## AJAX

AJAX：Asynchronous JavaScript And XML

### XMLHttpRequest

- readyState 0：已创建 xhr 实例，未调用 open 方法
- readyState 1：已调用 open 方法，未调用 send 方法
- readyState 2：已调用 send 方法，已收到服务器返回的响应头
- readyState 3：正在接收服务返回的数据
- readyState 4：已收到服务器返回的全部数据

```js
const xhr = new XMLHttpRequest();
/* 请求方式 请求地址 是否异步 默认为 true */
xhr.open("POST", "http://localhost:3000");
xhr.setRequestHeader("Content-Type", "application/json");
// xhr.open("GET", "http://localhost:3000");

/* readyState 改变时，调用的回调函数 */
xhr.onreadystatechange = () => {
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(xhr.responseText);
  }
};

/* 监听事件 */
xhr.addEventListener("progress", (event) => {
  console.log(event.loaded, event.total);
});

xhr.timeout = 3000;
xhr.addEventListener("timeout", (event) => {
  console.log("timeout");
});

/* xhr.abort() 中断请求 可以通过 "abort" 监听 */

xhr.onload = function () {
  if (xhr.status === 200) {
    console.log(xhr.responseText);
  } else {
    console.log(xhr.status);
  }
};
xhr.send(null /* params */);
```

### Fetch

- `text()` 将响应体解析为文本字符串
- `json()` 将响应体解析为 JSON 并返回一个 JS 对象
- `blob()` 将响应体解析为二进制数据，并返回一个 Blob 对象
- `arrayBuffer()` 将响应体解析为二进制数据，并返回一个 ArrayBuffer 对象
- `formData()` 将响应体解析为表单数据，并返回一个 FormData 对象

```js
/* 默认 get 请求 */
fetch("http://localhost:3000", {
  method: "post",
  header: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "rico",
    age: 20,
  }),
})
  .then((res) => res.json())
  .then((res) => {
    console.log(res);
  });

/* 调用 abort.abort() 中断请求 */
const abort = new AbortController();

fetch("http://localhost:3000", {
  signal: abort.signal,
})
  .then(async (res) => {
    const response = res.clone;
    const reader = res.body.getReader();
    const total = res.headers.get("Content-Length");
    let loaded = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      loaded += value.length;
    }
    return response.text();
  })
  .then((res) => {
    console.log(res);
  });
```

## Web Worker

Web Worker 允许在后台线程中运行 JavaScript 代码，避免阻塞主线程，适用于计算密集型任务

特点：

- worker 线程执行的脚本与主线程执行的脚本必须同源
- 为了防止中间人攻击，worker 线程不允许读取本地文件，只允许加载网络文件
- worker 线程不允许操作 DOM，不能使用 window，document，parent（parent === window）对象，可以使用 navigator 和 location 对象

## Service Worker

Service worker 充当 Web 应用程序、浏览器与网络之间的代理服务器，适用于 PWA（Progressive Web App）场景

特点：

- Service Worker 完全异步，同步的 XHR 和 Web Storage 不能在 Service Worker 中使用
- 作用域为整个域名（多个页面共享），页面关闭仍可运行
- Service Worker 只能使用 HTTPS（更加严格的 worker）
- Service Worker 是客户端脚本，有下载，安装，激活的生命周期

场景：

- 后台数据同步：启动一个 Service Worker，即使用户没有访问页面，也可以更新缓存
- 响应推送：启动一个 Service Worker，向用户发送消息，通知新的内容可用
- 离线访问：Service Worker 可以缓存资源，使应用在没有网络连接时仍然可用
- 性能增强：预取用户可能需要的资源
