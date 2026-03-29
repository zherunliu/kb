# JS/TS

## 编译

| 阶段                                      |                                                                                                          |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 词法分析（Lexical Analysis）              | tsx/vue 源代码字符流 => Lexer/Tokenizer 词法分析器 => token 流                                           |
| 语法分析（Syntax Analysis）               | token 流 => Parser 语法分析器 => AST 抽象语法树                                                          |
| 语义分析（Semantic Analysis）             | AST 抽象语法树 => TypeChecker 等 => 类型检查等                                                           |
| 转换、优化（Transformation/Optimization） | AST 抽象语法树 => Transformer/Optimizer => 新 AST，例如 tsc 擦除类型注解、jsx 转换为 React.createElement |
| 代码生成（Code Generation）               | 新 AST => CodeGenerator => js 代码                                                                       |

## 错误捕获

|                            | `try/catch` | `window.onerror` | `window.addEventListener('error')` | `window.addEventListener('unhandledrejection')` |
| -------------------------- | ----------- | ---------------- | ---------------------------------- | ----------------------------------------------- |
| 同步错误                   | Y           | Y                | Y                                  |                                                 |
| 异步回调错误               |             | Y                | Y                                  |                                                 |
| 未处理的 Promise rejection |             |                  |                                    | Y                                               |
| async/await 异步错误       | Y           |                  |                                    | Y                                               |
| 资源加载错误               |             |                  | Y                                  |                                                 |
| 语法错误                   |             | Y                | Y                                  |                                                 |

- `try/catch` 可以捕获同步错误，async/await 异步错误
- `window.onerror` 可以捕获同步错误，异步回调错误，语法错误；不能捕获资源加载错误
- `window.addEventListener('error')` 可以捕获资源加载错误
- `window.addEventListener('unhandledrejection')` 可以捕获未处理的 Promise rejection，和未 try/catch 的 async/await 异步错误

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

> JSON 数据类型：`string`、`number`、`boolean`、`null`、数组、对象（不包含函数、日期、正则表达式等）

#### typeof

使用 `typeof` 操作符检查变量的基本类型（除 `null`，`typeof null === 'object'` 为 true）和函数类型

`typeof` 通过判断二进制标签实现

#### instanceof

使用 `instanceof` 操作符检查对象是否是某个类的实例，适用于引用数据类型（包括数组、函数、日期、正则表达式等），右侧必须是构造函数

:::tip 跨 iframe 问题
每个 iframe 都有自己的全局环境和构造函数，因此在一个 iframe 中创建的对象在另一个 iframe 中使用 `instanceof` 检查时会返回 false，因为它们的构造函数不同
:::

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

#### Promise 超时 + 取消

`Promise.race()` + AbortController

```js
function withTimeout(promise, ms, signal) {
  const timeoutPromise = new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error("Promise timed out")), ms);

    signal?.addEventListener("abort", () => {
      clearTimeout(timer); // 取消定时器
      reject(new Error("Promise aborted"));
    });
  });
  return Promise.race([promise, timeoutPromise]);
}

// example usage
let controller = null;
document.getElementById("fetchBtn").addEventListener("click", () => {
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();
  const signal = controller.signal;
  const fetchTask = fetch("https://jsonplaceholder.typicode.com/todos/1", {
    signal,
  });
  withTimeout(fetchTask, 3000, signal)
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  if (controller) {
    controller.abort();
    controller = null;
  } else {
    console.warn("No ongoing fetch to cancel");
  }
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
4. 包裹为一个函数并执行（IIFE）
   > 该函数接受 `exports`，`require`，`module`，`__filename`，`__dirname` 作为参数
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

## V8 垃圾回收（Garbage Collection）

v8 垃圾回收采用分代回收策略，将堆内存分为新生代和老年代，新生代中的对象存活时间较短，老生代中的对象存活时间较长，甚至常驻内存

### 新生代垃圾回收

scavenge 算法

1. Scavenge 算法将新生代的堆内存一分为二，每个内存空间称为 semi-space
2. 两个 semi-space 中，一个处于使用状态，称为 from-space；另一个处于闲置状态，称为 to-space
3. 分配对象时，先在 from-space 中分配
4. 垃圾回收时，遍历 from-space，标记并复制中的存活对象到 to-space 中，释放死亡对象占用的内存
5. 复制后，交换 from-space 和 to-space 角色

**优化策略：**

对象晋升：如果对象在新生代中经历了多次垃圾回收仍然存活，则认为该对象具有较长的生命周期，将其晋升到老年代中

写屏障：用于追踪新生代对象被老年代对象引用的情况，避免在垃圾回收时遗漏被老年代对象引用的新生代对象

### 老年代垃圾回收

- Mark-Sweep 内存碎片化程度低时执行
- Mark-Compact 内存碎片化程度高时执行

Mark：构建一个根列表，从根节点出发，遍历所有可达对象，标记为存活的；不可达对象视为死亡的（垃圾）
根节点包括全局对象；函数的参数、局部变量；闭包引用的对象；DOM 元素等...

Sweep：扫描整个堆内存，回收未标记的对象占用的内存；不需要移动对象，执行效率高，但会产生内存碎片

Compact：将存活的对象移动到连续内存区域，再清除边界外所有垃圾对象，以释放连续的内存空间；不会产生内存碎片，但性能开销较大
