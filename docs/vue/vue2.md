# Vue2

## 创建 Vue2 项目

### 脚手架

```bash
# vue-cli
pnpm install -g @vue/cli
vue create vue2-demo # choose 2.x
```

`main.js` 入口文件

```js
import Vue from "vue";
import App from "./App";

// 关闭生产提示
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");

// 或
// new Vue({
//   el: "#app",
//   render: (h) => h(App),
// });
```

> 运行版 Vue 只包含核心功能，不包含模板解析器，所以不能使用 `template` 配置项，需要使用 `render` 函数收到的 `createElement` 函数去解析具体内容

### 配置文件

`vue inspect > output.js` 查看 webpack 配置，编写 `vue.config.js` 覆盖配置

## 响应式原理

### Vue2：Object.defineProperty + 观察者模式

Object.defineProperty 是 JS 中用于精确控制对象属性行为的 API，允许直接在对象上定义新属性，或修改现有属性的配置（如是否可枚举、可修改、可删除等）

`Object.defineProperty(obj /* 对象 */, prop /* 属性 */, descriptor /* 描述符 */);`

- 数据描述符：`value`，`writable`，`enumerable`，`configurable`
- 访问器描述符：`get`，`set`，`enumerable`，`configurable`

```js
const obj = { _age: 18 }; // 下划线**约定**为私有属性

Object.defineProperty(obj, "age", {
  get() {
    console.log("读取 age 属性");
    return this._age; // 读取时返回 _age 的值
  },
  set(newValue) {
    console.log("修改 age 属性");
    if (newValue < 0 || newValue > 120) {
      throw new Error("年龄必须在 0-120 之间");
    }
    this._age = newValue; // 校验通过后修改 _age
  },
  enumerable: true,
  configurable: true,
});
```

Vue2 的响应式核心是 `Observer`、`Dep` 和 `Watcher`

1. **Observer**：递归遍历 `data` 对象的所有属性，使用 `Object.defineProperty` 为它们指定 getter/setter
2. **Dep**：每一个属性都对应一个 `Dep` 实例。它在内部维护一个数组 `deps`，专门用来存放依赖该属性的 `Watcher`；同时通过全局变量（如 `Dep.target`）暴露当前正在执行计算的 `Watcher`
3. **Watcher**：当组件渲染函数执行、或者计算属性求值时，会实例化一个 `Watcher`，并将自身挂载到 `Dep.target` 上
4. **工作流程**：
   - **get**：当读取属性值时，触发 `getter`。`getter` 会调用 `dep.depend()`，将当前的 `Watcher`（即 `Dep.target`）添加到该属性的 `deps` 数组中
   - **set**：当修改属性值时，触发 `setter`。`setter` 会完成新值的赋给，并调用对应 `Dep` 的 `notify()` 方法，遍历通知所有的 `Watcher` 执行 `update()`，进而将组件对应的重新渲染任务推入异步队列

**Vue2 响应式的局限性与特殊处理**：

- **对象的新增/删除**：`Object.defineProperty` 在初始化时执行，无法拦截后来动态新增和删除的属性。因此 Vue2 提了补丁 API：`Vue.set()` 和 `Vue.delete()`
- **数组监听**：出于性能考虑，Vue2 没有对数组的每个索引使用 `defineProperty`。它是通过重写数组实例的原型链，拦截了 7 个能改变原生数组的方法（`push`，`pop`，`shift`，`unshift`，`splice`，`sort`，`reverse`）。在调用这些变异方法时，除了执行原生逻辑，还会对数组关联的 `deps` 手动触发 `notify`

### Vue3：Proxy + Reflect + 副作用函数 (Effect)

Proxy 是 ES6 引入的对象代理 API，用于创建一个对象的代理副本，从而拦截并自定义对象的底层操作（如属性访问、赋值、删除、函数调用等）

`const proxy = new Proxy(target /* 对象 */, handler /* 处理器对象 */);`

```ts
export const myReactive = <T extends object>(target: T) => {
  return new Proxy(target, {
    get(target, key, receiver) {
      let res = Reflect.get(target, key, receiver);
      return res;
    },
    set(target, key, value, receiver) {
      let res = Reflect.set(target, key, value, receiver);
      return res;
    },
  });
};
```

Vue3 重写了响应式系统，使用 ES6 的 Proxy 替代了 `Object.defineProperty`，核心思想转变为 Proxy、`track` 和 `trigger`

1. **Proxy 拦截**：针对整个对象进行代理，而不是遍历对象的各个属性。依靠 Proxy 强大的拦截能力，天然支持拦截对象属性的新增、删除、甚至 Map/Set 的操作以及数组的索引/length 变更
2. **Reflect 保证上下文**：在 Proxy 的 handler 中配合 `Reflect.get/set`。特别是在处理继承或 getter 内部有 `this` 引用时，通过传递 `receiver`，能强制保证 `this` 永远指向这个代理对象自身，不会错误地去原对象或原型上收集依赖
3. **全局依赖数据结构（WeakMap -> Map -> Set）**：
   - Vue3 使用一个全局的 `targetMap`（一个 `WeakMap`）保存所有响应式原对象
   - `WeakMap` 的键是 target（原对象），值是 `depsMap`（一个 `Map`）
   - `depsMap` 的键是 target 的属性名 key，值是 `dep`（一个 `Set`），里面存着依赖该属性的 `effect`
4. **工作流程**：
   - **track**：在 Proxy 的 `get` 拦截器中，调用 `track(target, key)`。它会找到对应的 `Set`，并将当前正在活跃的 `effect` 函数添加进去
   - **trigger**：在 Proxy 的 `set`、`deleteProperty` 等拦截器中，调用 `trigger(target, key)`。它会从 `targetMap` 里找出对应的 `Set`，取出并遍历执行所有收集到的 `effect`
5. **懒代理**：Vue2 初始化时会递归遍历代理对象所有属性；而 Vue3 只有在 Proxy 拦截到访问了子对象时（触发了 get），才会在 `get` 中针对该子对象实时生成新的 Proxy。这种懒代理极大地加快了 Vue3 的初始化速度
