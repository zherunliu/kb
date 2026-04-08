# Vue Pro

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
<keep-alive :include=['A','B']>
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

vue 中的 scoped 通过在 DOM 结构以及 css 样式上加唯一不重复的标记 `data-v-[hash:base64:8]` 属性的方式，达到样式私有模块化的目的（由 PostCSS 转译实现）

scoped 渲染规则：

1. 给 HTML 的 DOM 节点加一个不重复的 data 属性来表示他的唯一性
2. 在每句 css 选择器的末尾（编译后的 css）加一个当前组件的 data 属性选择器来私有化样式
3. 如果组件内部包含有其他组件，只会给其他组件的最外层标签加上当前组件的 data 属性

> 第二条和第三条有冲突，使用 `:deep()` 样式穿透移动属性选择器，父组件的样式会在子组件样式之后解析并覆盖

```vue{17-24}
<!-- ChildDemo -->
<style type="text/css">
/* 编译后 */
.child-bg[data-v-<child-hash:base64:8>] {
  color: red;
}
</style>

<!-- ParentDemo -->
<style type="text/css">
/* 编译后 */
.wrap[data-v-<parent-hash:base64:8>] {
}
.child-bg[data-v-<parent-hash:base64:8>] {
  color: green;
}
/* 使用 :deep() 穿透样式 */
:deep(.child-bg) {
  color: green;
}
/* 编译后 */
[data-v-<parent-hash:base64:8>] .child-bg {
  color: green;
}
</style>
```

### :slotted 和 :global

- `:slotted` 选择器只能在父组件中使用，选择器的参数是父组件中插槽元素的选择器，作用于父组件中插槽元素的样式控制
- `:global` 选择器用于定义全局样式，不会被 CSS Modules 编译
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

Vue 会捕获组件树中所有子组件在框架核心同步执行流程中抛出的未手动捕获错误，并将这些错误统一收敛到全局配置的 handleError 中处理（提供了 `config.errorHandler` 便于自定义错误处理）；但该机制无法捕获异步回调（如 setTimeout/setInterval）、资源加载、语法解析等错误

```js
// Vue2 使用 Vue.config.errorHandler
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
const images: Record<string, { default: string }> = import.meta.glob(
  ["@/assets/*.jpg", "@/assets/*.png"],
  {
    eager: true, // 指定立即加载（静态）
  },
);
// eager = false 时，类似于 './img.jpg': () => import('./img.jpg') 的形式

const arr = Object.values(images).map((item) => item.default);
const flattedArr = arr.flatMap((item) => new Array(10).fill(item));

const vLazy: Directive<HTMLImageElement, string> = async (el, binding) => {
  const placeholder = await import("@/assets/vue.svg");
  el.src = placeholder.default;

  // 监听目标元素与祖先元素或视口 viewport 的相交情况
  // 监听目标元素和视口 viewport 的相交情况，即监听一个元素是否可见
  // entries[0].intersectionRatio 相交的比例、一个元素可见的比例
  const intersectionObserver = new IntersectionObserver((entries) => {
    const visibleRatio = entries[0].intersectionRatio;
    if (visibleRatio > 0) {
      setTimeout(() => (el.src = binding.value), 1500);
      intersectionObserver.unobserve(el);
    }
  });
  intersectionObserver.observe(el);
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
