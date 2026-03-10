# Vue Pro

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

- include 缓存的组件
- exclude 不缓存的组件
  > include 和 exclude 的值都可以是一个以英文逗号分隔的字符串、一个正则表达式（v-bind），或是包含这两种类型的一个数组（v-bind）
- max 指定缓存的数量

```vue
<button @click="flag = !flag"></button>
<keep-alive :include=['A','B']>
    <A v-if="flag"></A>
    <B v-else></B>
</keep-alive>
```

使用 keep-alive 会增加两个生命周期 `onActivated()` 和 `onDeactivated()`
