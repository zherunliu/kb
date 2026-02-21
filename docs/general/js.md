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
    > - DOM 事件
    > - UI 渲染（绘制）
  - 微任务
    > - `Promise[.then(), .catch(), .finally()]`
    > - `async/await`
    > - `MutationObserver` 监听整个 DOM 树的改变
    > - `queueMicrotask` 将回调函数加入微任务队列，在当前事件循环的所有同步任务执行完毕后，执行传递的回调函数
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

## 类型工具

- `keyof T` 获取 T 的所有键，生成一个联合类型
- `Record<K, V>` 创建一个对象类型，键为 K 类型，值为 V 类型
- `Partial<T>` 将 T 中所有属性变为可选
- `Required<T>` 将 T 中所有属性变为必选
- `Readonly<T>` 将 T 中所有属性变为只读
- `Pick<T, "field" | "filed2">` 从 T 中选择一组属性 field，field2 构造新类型
- `Omit<T, "field" | "filed2">` 从 T 中忽略一组属性 field，field2 构造新类型
- `Exclude<T, U>` 从 T 中排除可以赋值给 U 的类型
- `Extract<T, U>` 从 T 中提取可以赋值给 U 的类型（类型的交集）
- `NonNullable<T>` 从 T 中排除 null 和 undefined
- `Parameters<F>` 获取函数类型 F 的参数类型
- `ReturnType<F>` 获取函数类型 F 的返回值类型
- `ConstructorParameters<F>` 获取构造函数 F 的参数类型
- `InstanceType<C>` 获取类的实例类型
- `Awaited<Y>` 获取 Promise `resolve(value)` 的值类型（也即 `onfulfilled` 的返回值类型）
- `Uppercase<S>`，`Lowercase<S>`，`Capitalize<S>`，`Uncapitalize<S>`

```ts
interface User {
  name: string;
  age: number;
}

type OnChangeEvents = {
  [K in keyof User as `on${Capitalize<K>}Change`]: (value: User[K]) => void;
};

// type OnChangeEvents = {
//   onNameChange: (value: string) => void;
//   onAgeChange: (value: number) => void;
// }
```

### 类型守卫

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

> 使用 `Object.prototype.toString.call()` 对类型进行精准判断

## 输入输出

```ts
import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

type TCart = [string, string, string][];

const cartList: TCart = [];
rl.on("line", (line) => {
  const item = line.trim().split(" ") as [string, string, string];
  cartList.push(item);
});

rl.on("close", () => {
  const result: Record<string, { totalPrice: number; totalCount: number }> = {};
  for (const item of cartList) {
    const name = item[0];
    const price = Number(item[1]);
    const count = Number(item[2]);
    if (!result[name]) {
      result[name] = {
        totalPrice: 0,
        totalCount: 0,
      };
    }
    result[name].totalPrice += price * count;
    result[name].totalCount += count;
  }

  for (const key in result) {
    console.log(
      `${key} ${result[key].totalPrice.toFixed(2)} ${result[key].totalCount}`,
    );
  }
  rl.close();
});
```

## Promise

Promise 对象是一个构造函数，用于表示一个异步操作的最终完成（或失败）及其结果值。Promise 接受一个函数作为参数，该函数包含两个参数：

- `resolve` 异步操作成功时调用的函数，将 Promise 的状态从 pending 变为 fulfilled，并传递成功的结果值，如果传递的值也是一个 Promise，则会等待该 Promise 的状态改变后再改变当前 Promise 的状态
- `reject` 异步操作失败时调用的函数，将 Promise 的状态从 pending 变为 rejected，并传递失败的原因

> - promise 的状态一旦状态确定就不能再改变
> - `resolve` 和 `reject` 同时也是 Promise 的静态方法，可以直接调用 `Promise.resolve(value)` 和 `Promise.reject(reason)` 创建一个已解决或已拒绝的 Promise 对象
> - 调用 `resolve` 或 `reject` 不会终结 Promise 内部的代码执行，后续代码仍会继续执行

### 实例方法

- `then(onFulfilled, onRejected)`：添加成功和失败的回调函数，返回一个新的 Promise 对象
- `catch(onRejected)`：添加失败的回调函数，返回一个新的 Promise 对象，等价于 `then(undefined/null, onRejected)`，推荐使用 `catch` 而不是 `then` 的第二个参数来处理错误，因为 `catch` 可以捕获前面 `then` 中抛出的错误并且更具可读性
- `finally(onFinally)`：添加无论成功还是失败都会执行的回调函数，返回一个新的 Promise 对象

```ts
// finally 的回调函数不接受任何参数，无法获取 Promise 的结果值或错误原因
promise.finally(() => {
  // code
});

// equal to
promise.then(
  (result) => {
    // code
    return result;
  },
  (error) => {
    // code
    throw error;
  },
);
// finally 总会返回原来的结果值或错误原因
// 除非 finally 的回调函数抛出新的错误或返回一个新的 Promise 对象
```

> 没有使用 `catch` 或 `then` 处理失败回调的 rejected 状态会导致未处理的 Promise 拒绝错误，浏览器会在控制台输出警告信息，Node.js 会触发 `unhandledRejection` 事件

### 静态方法

| static method          | fulfilled                                                          | rejected                                                                                      |
| ---------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `Promise.all()`        | 全部 fulfilled，返回 aggregateValues 数组                          | 任一 rejected，返回第一个 rejected 的 reason                                                  |
| `Promise.any()`        | 任一 fulfilled，返回第一个 fulfilled 的 value                      | 全部 rejected，返回 aggregateReasons 数组                                                     |
| `Promise.race()`       | 第一个 settled 为 fulfilled 的 value                               | 第一个 settled 为 rejected 的 reason                                                          |
| `Promise.allSettled()` | 返回 aggregateResults 数组，包含每个 Promise 的状态和 value/reason | 始终 fulfilled，`[{status: 'fulfilled', value: value}, {status: 'rejected', reason: reason}]` |

> 如果作为参数的 Promise 实例，自己定义了 `catch` 方法，那么它的 rejected 将被自身捕获，`Promise.all()/any()/race()/allSettled()` 接受到的是 `catch` 方法返回 Promise 的状态
