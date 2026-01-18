# Vue Basic

## 创建 Vue 项目

### 脚手架

```bash
# vite
pnpm create vue@latest

pnpm create vite@latest
```

### 项目结构

- Vite 项目中，`index.html` 是项目的入口文件，在项目最外层
- 加载 `index.html` 后，Vite 解析 `<script type="module" src="xxx">` 指向的 JS/TS 文件
- `src/main.ts` Vue 应用的入口 JS/TS 文件，导入 `./App.vue` 根组件并创建 App 对象挂载到 index.html，也可以导入全局样式, 全局 api，注册插件
- Vue 通过 `createApp` 函数创建一个应用实例，`<div id="app"></div>` 是 App 对象的挂载点
- public 公有目录会被直接 `cp -r` 到 dist 目录下, 不会被 vite 打包
- src/assets 静态资源目录会被 vite 打包

## setup

### setup 概述

`setup` 是 Vue3 中一个新的配置项，值是一个函数，用于支持 Composition API ，组件中所用到的：数据、方法、计算属性、监视等，均配置在 `setup` 函数中

**特点：**

- `setup` 函数返回的对象中的内容，可直接在模板中使用
- `setup` 中访问 `this` 是 `undefined`
- `setup` 函数会在 `beforeCreate` 之前调用，领先于所有钩子执行

```vue
<script lang="ts">
export default {
  setup() {
    // 定义数据和方法

    // 需要 return
    return { data, method };
  },
};
</script>
```

### setup 的返回值

- 若返回一个**对象**：则对象中的：属性、方法等，在模板中均可以直接使用
- 若返回一个**函数**：则可以自定义渲染内容

```vue
<script lang="ts">
export default {
  setup() {
    return () => "Hello, world!";
  },
};
</script>
```

### setup 语法糖

```vue
<script setup lang="ts">
// 定义数据和方法
</script>
```

## ref

**作用：**定义响应式变量

**语法：**`const xxx = ref(/* initial value */)`

**返回值：**一个 `RefImpl` 的实例对象，简称 `ref` 对象

**注意点：**

- JS/TS 中操作数据需要：`xxx.value`，但模板中不需要 `.value`，直接使用即可
- 对于 `const name = ref('Rico')` 来说，`name` 不是响应式的，`name.value` 是响应式的
- 若 `ref` 接收的是对象类型，内部也是调用了 `reactive` 函数
- 使用 `shallowRef`，只对顶层属性进行响应式处理

## reactive

**作用：**定义一个响应式**对象**

**语法：**`const xxx = reactive(/* initial value */)`

**返回值：**一个 `Proxy` 的实例对象，简称：响应式对象

**注意点：**

- `reactive` 定义的响应式数据是深层次的
- `reactive` 重新分配一个新对象，会失去响应式（可以使用 `Object.assign` 去整体替换）
- 使用 `shallowReactive`，只对顶层属性进行响应式处理

```ts
const person = reactive({
  name: "Rico",
  age: 24,
});
function changePerson() {
  person = { name: "Alice", age: 18 }; // 会失去响应式 [!code --]
  Object.assign(person, { name: "Alice", age: 18 }); // [!code ++]
}
```

## toRefs 和 toRef

将一个响应式对象中的每一个属性，转换为 `ref` 对象，`toRefs` 和 `toRef` 功能一致，但 `toRefs` 可以批量转换

```ts
let person = reactive({ name: "rico", age: 24, gender: "female" });

let { name, age } = toRefs(person);

let gender = toRef(person, "gender");
```

## computed

计算属性会缓存计算结果，只有当依赖项改变时，才会重新计算

```ts
let firstName = ref("Rico");
let lastName = ref("White");

// 只读取，不修改
// let fullName = computed(() => {
//   return firstName.value + "-" + lastName.value;
// });

let fullName = computed({
  // 读取
  get() {
    return firstName.value + "-" + lastName.value;
  },
  // 修改 fullName 时触发
  set(val) {
    firstName.value = val.split("-")[0];
    lastName.value = val.split("-")[1];
  },
});

function changeFullName() {
  fullName.value = "Alice-Green";
}
```

## watch 和 watchEffect

### watch

**作用：**监视数据的变化

**特点：**`watch` 只能监视以下**四种数据**：

> 1. `ref` 定义的数据。
> 2. `reactive` 定义的数据。
> 3. 函数返回一个值（ `getter` 函数）
> 4. 一个包含上述内容的数组

```ts
const stopWatch = watch(
  /*
    watch的第一个参数是：被监视的数据
    watch的第二个参数是：监视的回调
    watch的第三个参数是：配置对象
    (deep, immediate, flush, once)
  */
  person,
  (newValue, oldValue) => {
    console.log(newValue, oldValue);
    if (person.value.age === 24) {
      // stopWatch();
      stopWatch.stop();
    }
  },
  { deep: true } // number | boolean
);
```

> 1. 若修改的是 `ref` 定义的对象中的属性，`newValue` 和 `oldValue` 都是新值，因为它们是同一个对象, 若修改整个`ref`定义的对象，`newValue` 是新值， `oldValue` 是旧值，因为不是同一个对象了
> 2. 对于 `reactive` 定义的对象，`newValue` 和 `oldValue` 都是新值，`reactive` 定义的对象数据默认开启深度监视
> 3. 可以传递一个 `getter`, 侦听响应式对象中指定的属性
> 4. 监视多个数据可写成数组形式，如 `[() => person.name, person.age]`

### watchEffect

立即运行一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行该函数（不用明确指出监视的数据）

```ts
watchEffect(
  (onCleanup) => {
    console.log("[watchEffect]", person.age, person.name);
    // 清理函数
    onCleanup(() => {
      console.log("[onCleanup]", person.age, person.name);
    });
  },
  {
    flush: "post", // "pre" | "post" | "sync"
    // pre: 组件挂载、更新前调用 watchCallback
    // post: 组件挂载、更新后调用 watchCallback
    // sync: 同步调用 watchCallback
  }
);
```

> `onCleanup` 是一个用于注册清理函数的回调函数，主要作用是在当前副作用函数执行前或组件卸载时，执行一些清理操作，避免内存泄漏或无效操作，使用 `watch` 的时候直接 `return` 清理函数

## 标签的 ref 属性

用于普通 `DOM` 标签，获取的是 `DOM` 节点：

```vue
<template>
  <input type="text" ref="refInput" id="idInput" />
  <button @click="showLog">SHOW</button>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from "vue";

// 通过 ref 获取元素
let refInput = ref<HTMLInputElement>();
let input = useTemplateRef("refInput"); // 可以取别名
function showLog() {
  // 通过 id 获取元素
  const idInput = document.getElementById("idInput");

  console.log(refInput.value.value);
  console.log(input.value.value);
  console.log((idInput as HTMLInputElement).value);
}
</script>
```

用于组件标签上，获取的是组件实例对象：

::: code-group

```vue [App.vue]
<template>
  <Child ref="person" />
  <button @click="test">test</button>
</template>

<script lang="ts" setup>
import Child from "./components/Child.vue";
import { useTemplateRef } from "vue";

let user = useTemplateRef("person");

function test() {
  console.log(user.value.name);
  console.log(user.value.age);
}
</script>
```

```vue [Child.vue]
<script lang="ts" setup>
import { ref, defineExpose } from "vue";
let name = ref("Rico");
let age = ref(18);

// 使用defineExpose将组件中的数据交给外部
defineExpose({ name, age });
</script>
```

:::

## 生命周期

**概述：**组件实例在创建时要经历一系列的初始化步骤，在此过程中 `Vue` 会在合适的时机，调用特定的函数，从而让开发者有机会在特定阶段运行自己的代码，这些特定的函数统称为：生命周期钩子

**组件的生命周期：**

- 创建阶段：`setup`
- 挂载阶段：`onBeforeMount`，`onMounted`
- 更新阶段：`onBeforeUpdate`，`onUpdated`
- 卸载阶段：`onBeforeUnmount`，`onUnmounted`

**常用的钩子：**`onMounted`（挂载完毕），`onUpdated`（更新完毕），`onBeforeUnmount`（卸载之前）

## readonly

**作用：**用于创建一个对象的深只读副本

**注意点：**

- 对象的所有嵌套属性都将变为只读
- 任何尝试修改这个对象的操作都会被阻止
- 使用 `shallowReadonly` 只作用于对象的顶层属性

```ts
import { reactive, readonly } from "vue";

const items = reactive<string[]>([]);
const readonlyItems = readonly(items);
readonlyItems.push("item");
console.log(items, readonlyItems); // [] []

items.push("item");
console.log(items, readonlyItems); // ["item"] ["item"]
```

## toRaw 和 markRaw

- `toRaw` 用于获取一个响应式对象的原始对象， `toRaw` 返回的对象不再是响应式的，不会触发视图更新

- `markRaw`：标记一个对象，使其永远不会变成响应式的

## vue 指令

- v-text 渲染文本字符串，会忽略子节点
- v-html 渲染 HTML 字符串，会忽略子节点，不支持渲染 Vue 组件
- v-if，v-else-if，v-else 节点的条件渲染，不渲染则将节点卸载，表现为注释节点，操作 DOM
- v-show 节点的显示/隐藏: 改变内联 CSS 样式 `display: none`，操作 CSS
- v-for 遍历元素
- v-on 简写为 `@`，为元素绑定事件
- v-bind 简写为 `:`，为元素绑定属性（模型到视图的单向绑定），也可以绑定 style
- v-model 模型，视图的双向绑定，本质是 v-bind 和 v-on 的语法糖
- v-once 性能优化，只渲染一次
- v-memo 性能优化，缓存

```vue
<input type="text" v-model="userName" />
<!--
模 -> 视  v-bind
型 <- 图  v-on
-->
<input
  type="text"
  :value="userName"
  @input="userName = ($event.target as HTMLInputElement).value"
/>
```
