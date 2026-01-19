# JS/TS

## DOM 操作

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
- `element.cloneNode(deep)`：克隆元素，`deep` 为布尔值，表示是否深度克隆（包括子节点）

#### 事件处理

- `element.addEventListener(eventType, listener, options)`：添加事件监听器
- `element.removeEventListener(eventType, listener, options)`：移除事件监听器
- 事件对象 `event`
  - `event.target`：触发事件的元素
  - `event.currentTarget`：当前正在处理事件的元素
  - `event.preventDefault()`：阻止默认行为
  - `event.stopPropagation()`：阻止事件冒泡
  - `event.stopImmediatePropagation()`：阻止事件冒泡并阻止当前元素的其他事件监听器执行

## 事件循环

#### 同步任务，异步任务

- 同步任务：同步任务即 `<script>` 整体代码
  - Promise 的构造函数是同步的 `new Promise((resolve, reject) => {/** 同步代码 */})`
- 同步任务栈：同步任务压入同步任务栈（函数调用栈）
- 异步任务：包括宏任务和微任务
  - 宏任务
    > - `setTimeout`，`setInterval` 定时器
    > - `XMLHttpRequest`，`fetch`，`postMessage` I/O 操作
    > - `requestAnimationFrame` 下一帧重绘回流前，执行传递的回调函数
    > - `setImmediate` IE 环境，当前事件循环的所有的宏任务执行后，执行传递的回调函数
  - 微任务
    > - `Promise[.then, .catch, .finally]`
    > - `async/await`
    > - `MutationObserver` 监听整个 DOM 树的改变
    > - `process.nextTick` node 环境，当前事件循环的所有的微任务执行前，执行传递的回调函数
  - 异步任务队列
  - 宏任务队列：宏任务加入宏任务队列
  - 微任务队列：微任务加入微任务队列

#### 执行顺序

同步任务即 `<script>` 整体代码 -> 同步任务的微任务队列 -> 宏任务 1 -> 宏任务 1 的微任务队列 -> 宏任务 2 -> 宏任务 2 的微任务队列 -> ...

1. 执行同步任务即 `<script>` 整体代码，将同步任务的所有微任务加入微任务队列
2. 清空微任务队列：按序执行所有微任务，如果微任务执行过程中产生新的微任务，则一并执行
3. 从宏任务队列中取出并执行 1 个宏任务，将该宏任务的所有微任务加入微任务队列
4. 重复 2，3

如果将同步任务即 `<script>` 整体代码也视为一个宏任务，则执行顺序简化为：每一个事件循环，先执行 1 个宏任务，再执行该宏任务的所有微任务，再进入下一个事件循环

## 类型守卫

**JS 数据类型**

- 基本数据类型：`string`、`number`、`boolean`、`symbol`、`undefined`、`null`、`bigint`
- 引用数据类型：`object`（包括数组、函数、日期、正则表达式等）

#### typeof

使用 `typeof` 操作符检查变量的基本类型（除 `null`，`typeof null === 'object'` 为 true）和函数类型

`typeof` 通过判断二进制标签实现

#### instanceof

使用 `instanceof` 操作符检查对象是否是某个类的实例，适用于引用数据类型（包括数组、函数、日期、正则表达式等），右侧必须是构造函数

`instanceof` 通过检查对象的原型链实现

```js
function mockInstanceof(obj, Constructor) {
  // 检查右侧是否为函数
  if (typeof Constructor !== "function") {
    throw new TypeError("Constructor is not a function");
  }

  const CProto = Constructor.prototype;
  // prototype 可写性，需检查其类型
  if (typeof CProto !== "object" && CProto !== null) {
    throw new TypeError("Constructor.prototype is not an object");
  }

  if (obj === null || obj === undefined) return false;

  // 遍历原型链（使用 Object.getPrototypeOf 代替 __proto__，更标准安全）
  let OProto = Object.getPrototypeOf(obj);
  while (true) {
    if (OProto === null) return false; // 原型链遍历完毕，未找到
    if (OProto === CProto) return true;
    OProto = Object.getPrototypeOf(OProto);
  }
}
```
