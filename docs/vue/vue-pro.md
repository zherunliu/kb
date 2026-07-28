# Vue Pro

## 函数式编程

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

### Vue2：Object.defineProperty

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

Vue2 的响应式核心是 Observer、Dep 和 Watcher

1. Observer：递归遍历 `data` 对象的所有属性，使用 Object.defineProperty 为它们指定 getter/setter
2. Dep：每一个属性都对应一个 Dep 实例。它在内部维护一个数组 `deps`，专门用来存放依赖该属性的 Watcher；同时通过全局变量（如 `Dep.target`）暴露当前正在执行计算的 Watcher
3. Watcher：当组件渲染函数执行、或者计算属性求值时，会实例化一个 Watcher，并将自身挂载到 `Dep.target` 上
4. 工作流程：
   - get：当读取属性值时，触发 `getter`。`getter` 会调用 `dep.depend()`，将当前的 Watcher（即 `Dep.target`）添加到该属性的 `deps` 数组中
   - set：当修改属性值时，触发 `setter`。`setter` 会完成新值的赋给，并调用对应 Dep 的 `notify()` 方法，遍历通知所有的 Watcher 执行 `update()`，进而将组件对应的重新渲染任务推入异步队列

Vue2 响应式的局限性与特殊处理：

- 对象的新增/删除：Object.defineProperty 在初始化时执行，无法拦截后来动态新增和删除的属性。因此 Vue2 提了补丁 API：`Vue.set()` 和 `Vue.delete()`
- 数组监听：出于性能考虑，Vue2 没有对数组的每个索引使用 defineProperty。它是通过重写数组实例的原型链，拦截了 7 个能改变原生数组的方法（`push`，`pop`，`shift`，`unshift`，`splice`，`sort`，`reverse`）。在调用这些变异方法时，除了执行原生逻辑，还会对数组关联的 `deps` 手动触发 `notify`

### Vue3：Proxy

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

Vue3 重写了响应式系统，使用 ES6 的 Proxy 替代了 Object.defineProperty，核心思想转变为 Proxy、track 和 trigger

1. Proxy 拦截：针对整个对象进行代理，而不是遍历对象的各个属性。依靠 Proxy 强大的拦截能力，天然支持拦截对象属性的新增、删除、甚至 Map/Set 的操作以及数组的索引/length 变更
2. Reflect 保证上下文：在 Proxy 的 handler 中配合 `Reflect.get/set`。特别是在处理继承或 getter 内部有 `this` 引用时，通过传递 receiver，能强制保证 `this` 永远指向这个代理对象自身，不会错误地去原对象或原型上收集依赖
3. 全局依赖数据结构（WeakMap -> Map -> Set）：
   - Vue3 使用一个全局的 `targetMap`（一个 `WeakMap`）保存所有响应式原对象
   - `WeakMap` 的键是 target（原对象），值是 `depsMap`（一个 `Map`）
   - `depsMap` 的键是 target 的属性名 key，值是 `dep`（一个 `Set`），里面存着依赖该属性的 effect
4. 工作流程：
   - track：在 Proxy 的 `get` 拦截器中，调用 `track(target, key)`。它会找到对应的 `Set`，并将当前正在活跃的 effect 函数添加进去
   - trigger：在 Proxy 的 `set`、`deleteProperty` 等拦截器中，调用 `trigger(target, key)`。它会从 `targetMap` 里找出对应的 `Set`，取出并遍历执行所有收集到的 effect
5. 懒代理：Vue2 初始化时会递归遍历代理对象所有属性；而 Vue3 只有在 Proxy 拦截到访问了子对象时（触发了 get），才会在 `get` 中针对该子对象实时生成新的 Proxy。这种懒代理极大地加快了 Vue3 的初始化速度

## Diff 算法

1. 前序对比：从头到尾依次对比 vNode 的 key 和 type，相同则复用，不同则转到 2
2. 后序对比：从尾到头依次对比 vNode 的 key 和 type，相同则复用，不同则转到 3
3. 如果旧节点全部 patch，有多余的新节点则新增
4. 如果新节点全部 patch，有多余的旧节点则删除
5. 乱序：
   - 以新节点为基准，构建 key-to-newIndex map
   - 遍历旧节点，获取新节点中相同 key 的 index，如果没有则删除旧节点；如果有则 patch，并记录 index
   - 根据 newIndex-to-oldIndex array 获取需要移动的最长递增子序列（LIS），倒序遍历 array，新增值为初始值的节点，复用 LIS 中的节点，移动不在 LIS 中的节点

## 内置组件

### Teleport

将一个组件内部的一部分模板传送到该组件的 DOM 结构外层的位置去（属于当前组件，但脱离了原有 DOM 层级）

:::tip 使用场景
父元素有 transform/filter/perspective 时，子元素定位 fixed 会降级为 absolute，使用 Teleport 不受影响
:::

```vue
<button @click="open = true">Open Modal</button>

<Teleport to="body">
  <div v-if="open" class="modal">
    <p>Hello from the modal!</p>
    <button @click="open = false">Close</button>
  </div>
</Teleport>
```

### Suspense

Suspense 提供两个插槽：`#default` 与 `#fallback`，两个插槽都只允许一个直接子节点。在可能的时候都将显示默认插槽中的节点。否则将显示后备插槽中的节点

```vue
<template>
  <Suspense>
    <template #default>
      <Child />
    </template>
    <template #fallback>
      <h3>loading...</h3>
    </template>
  </Suspense>
</template>
```

### KeepAlive

在多个组件间动态切换时缓存被移除的组件实例

- include 指定需要缓存的组件
- exclude 指定不需要缓存的组件
  > include 和 exclude 的值都可以是一个以英文逗号分隔的字符串、一个正则表达式（需使用 v-bind），或是包含这两种类型的一个数组（需使用 v-bind）
- max 指定最大缓存组件数量

```vue
<button @click="flag = !flag"></button>
<keep-alive :include="['A', 'B']">
    <A v-if="flag"></A>
    <B v-else></B>
</keep-alive>
```

::: tip 缓存组件的更新

keep-alive 会缓存组件的 DOM 结构和实例状态。当组件被缓存后再次激活时，不会重新执行 created、mounted 等生命周期钩子。如果需要在组件重新激活时执行更新逻辑，可以通过以下方式：

- 通过 key 属性的更改重新触发渲染
- keep-alive 会增加两个生命周期 `onActivated()` 和 `onDeactivated()`，通过显式在 `onActivated()` 钩子函数中检查数据变化并执行相应的更新逻辑

:::

## css 新属性

### scoped 样式隔离

Vue SFC 的 scoped CSS 会为当前组件生成作用域标识，并把该标识附加到 DOM 与编译后的选择器上

scoped 渲染规则：

1. 给 HTML 的 DOM 节点加一个不重复的 data 属性来表示他的唯一性
2. 在每句 css 选择器的末尾（编译后的 css）加一个当前组件的 data 属性选择器来私有化样式
3. 如果组件内部包含有其他组件，只会给其他组件的最外层标签加上当前组件的 data 属性

> 第二条和第三条有冲突，使用 `:deep()` 样式穿透移动属性选择器，父组件的样式会在子组件样式之后解析并覆盖

```vue{17-24}
<!-- ChildDemo -->
<style type="text/css">
/* 编译后 */
.child-bg[data-v-child] {
  color: red;
}
</style>

<!-- ParentDemo -->
<style type="text/css">
/* 编译后 */
.wrap[data-v-parent] {
}
.child-bg[data-v-parent] {
  color: green;
}
/* 使用 :deep() 穿透样式 */
:deep(.child-bg) {
  color: green;
}
/* 编译后 */
[data-v-parent] .child-bg {
  color: green;
}
</style>
```

### :slotted 和 :global

- `:slotted` 选择器只能在父组件中使用，选择器的参数是父组件中插槽元素的选择器，作用于父组件中插槽元素的样式控制
- `:global` 选择器用于让指定规则绕过 scoped 选择器改写；它与 CSS Modules 是不同机制
  - `<style lang="css">` 中的选择器，是全局选择器
  - `<style lang="css" scoped>` 中，使用 `:global` 的选择器，也是全局选择器

```vue
<template>
  <Child>
    <div class="parent-bg">default slot</div>
  </Child>
</template>

<style lang="css" scoped>
/* 父组件用 :slotted() 控制插槽样式 更精确更清晰 */
:slotted(.parent-bg) {
  background: lightpink;
}
</style>
```

## nextTick

Vue 同步更新数据，异步更新 DOM

- Vue 将 DOM 更新加入任务队列，等到下一个 tick 时，才统一更新 DOM，避免多次重复渲染，提高性能
- nextTick 延迟执行 callback，即等到下一个 tick，DOM 更新后，再执行 callback

::: code-group

```ts [场景]
const addItem = () => {
  itemList.push({ name: inputVal.value, id: itemList.length });
  box.value!.scrollTop = 999_999_999; // 更新滚动位置 (此时 DOM 未更新)
};

const addItem2 = () => {
  itemList.push({ name: inputVal.value, id: itemList.length });
  // nextTick 延迟执行 callback，即等到下一个 tick，DOM 更新后，再执行 callback
  nextTick(
    () => (box.value!.scrollTop = 999_999_999), // callback (此时 DOM 已更新)
  );
};

const addItem3 = async () => {
  itemList.push({ name: inputVal.value, id: itemList.length });
  await nextTick(); // 等到下一个 tick, DOM 更新后
  box.value!.scrollTop = 999_999_999; // 更新滚动位置 (此时 DOM 已更新)
};
```

```ts [源码]
const resolvedPromise: Promise<any> = Promise.resolve(); // 空 Promise
let currentFlushPromise: Promise<void> | null = null; // 当前正在刷新队列的 Promise

export function nextTick<T = void>(
  this: T,
  fn?: (this: T) => void,
): Promise<void> {
  const p = currentFlushPromise || resolvedPromise;
  return fn ? p.then(this ? fn.bind(this) : fn) : p;
}
```

:::

## 错误处理

Vue 会把渲染、事件处理器、生命周期钩子、侦听器以及框架调用的异步钩子中未处理的错误交给 `errorCaptured` 或 `app.config.errorHandler`。脱离 Vue 调用链的错误需要单独处理

```js
// Vue 3；Vue 2 对应 Vue.config.errorHandler
app.config.errorHandler = function (err, vm, info) {
  // handleError 方法用来处理错误并上报
  handleError(err);
};
```

## 自定义指令

一个自定义指令由一个包含类似组件生命周期钩子的对象来定义。钩子函数会接收到指令所绑定元素作为其参数。在 `<script setup>` 中，任何以 v 开头的驼峰式命名的变量都可以当作自定义指令使用

```vue
<script lang="ts" setup>
import { type Directive } from "vue";

// 加载图片 glob 默认懒加载
const images = import.meta.glob<string>(["@/assets/*.jpg", "@/assets/*.png"], {
  eager: true, // 指定立即加载（静态）
  query: "?url",
  import: "default",
});
// eager = false 时，类似于 './img.jpg': () => import('./img.jpg') 的形式

const arr = Object.values(images);
const flattedArr = arr.flatMap((item) => new Array(10).fill(item));

const vLazy: Directive<HTMLImageElement, string> = async (el, binding) => {
  const placeholder = await import("@/assets/vue.svg");
  el.src = placeholder.default;

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setTimeout(() => (el.src = binding.value), 1500);
      observer.unobserve(el);
    }
  });
  observer.observe(el);
};
</script>

<template>
  <div>
    <img
      v-lazy="item"
      width="1000"
      v-for="(item, idx) of flattedArr"
      :key="idx"
    />
  </div>
</template>
```
