# Pinia

## 使用 pinia

```bash
pnpm install pinia
```

在 `src/main.ts` 中引入并注册 pinia 插件：

```ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount("#app");

// createApp(App).use(pinia).mount('#app')
```

## Setup Stores

::: code-group

```ts [store/counter.ts]
import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", () => {
  const count = ref(0);
  const name = ref("Rico");
  const doubleCount = computed(() => count.value * 2);
  function increment() {
    count.value++;
  }

  /* 需要 return */
  return { count, name, doubleCount, increment };
});
```

```vue [App.vue]
<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useCounterStore } from "./stores/counter";
import { isProxy, isReactive, isRef } from "vue";
const counterStore = useCounterStore();
const { increment } = counterStore;

// 需要使用 vue 的 toRef，toRefs 或 pinia 的 storeToRefs 解构，否则解构后将无法保持响应式
const { count, name, doubleCount } = storeToRefs(counterStore);

function decrement() {
  counterStore.count--;
}
console.log(
  isRef(counterStore), // false
  isReactive(counterStore), // true
  isProxy(counterStore), // true
);
</script>

<template>
  <h1>{{ name }}</h1>
  <h2>Count: {{ count }}</h2>
  <h2>Double Count: {{ doubleCount }}</h2>
  <button @click="increment">Increment</button>
  <button @click="decrement">Decrement</button>
</template>
```

:::

## Option Stores

::: code-group

```ts [store/user.ts]
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    name: "username",
    age: 18,
  }),

  // getters 类似 computed 计算属性，会缓存计算结果
  getters: {
    userInfo: (state) => {
      console.log("[useUserStore] computed userInfo:");
      return `name: ${state.name}, age: ${state.age}`;
    },
  },

  // actions 中可以写同步或异步方法
  actions: {
    setAge: function (newAge: number) {
      this.age = newAge;
    },
    setName: async function (newName: string) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.name = newName;
          resolve(newName);
        }, 3000);
      });
    },
  },
});
```

```vue [App.vue]
<script lang="ts" setup>
import { useUserStore } from "./stores/user";
const userStore = useUserStore();

// 使用 store.$patch 局部更新 state
const patchUser = () => {
  // store.$patch 可以接收部分 state
  userStore.$patch({ age: userStore.age + 1 });

  // store.$patch 也可以接收一个更新函数
  userStore.$patch((state) => {
    state.name += "!";
  });
};

// 使用 store.$state 更新全部 state
const setUser = () => {
  userStore.$state = {
    age: userStore.age + 1,
    name: userStore.name + "!",
  };
};

const genAge = () => Math.floor(Math.random() * 100);

// 8 位随机字符串
const genName = () => {
  // 类型化数组 8 位无符号整数 0 - 255
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);

  return Array.from(arr, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 8);
};
</script>

<template>
  <div>name: {{ userStore.name }}, age: {{ userStore.age }}</div>

  <!-- getters -->
  <div>{{ userStore.userInfo }}</div>

  <div>
    <button @click="patchUser">patchUser</button>
    <button @click="setUser">setUser</button>
    <button @click="userStore.setAge(genAge())">setAge</button>
    <button @click="userStore.setName(genName())">setName</button>
    <button @click="userStore.$reset">resetUser</button>
  </div>
</template>
```

:::

## store 仓库实例 api

- `store.$id` store 的 id
- `store.$patch` 更新部分 state，可以接收部分 state，也可以接收一个更新函数
- `store.$state` 更新全部 state
- `store.$reset` 重置 state 到初始值（仅 Option Stores 支持，Setup Stores 需自行实现）
- `store.$subscribe`（类似 watch）侦听 state 的改变，改变 state 时，调用传入的 callback；返回停止侦听（移除该 callback）的函数
- `store.$onAction` 侦听 actions 的调用，调用 actions 时，调用传入的 callback；返回停止侦听（移除该 callback）的函数
- `store.$dispose` 销毁 store 实例，移除所有侦听器

### store.$subscribe

`store.$subscribe((mutation, newState) => void)`

```ts
userStore.$subscribe(
  (mutation, newState) => {
    console.log(mutation, newState);
  },
  {
    detached: false, // 默认 false，组件卸载时移除 callback
    // deep: true, // 默认 false，深层侦听
    immediate: false,
    // 是否立即执行 callback
    // 默认 false，即默认懒执行 callback
    flush: "pre", // "pre" | "post" | "sync"，默认 pre
    // pre: state 更新前调用
    // post: state 更新后调用 callback
    // sync: 同步调用 callback
    once: false, // 一次性侦听，callback 只调用一次
  },
);
```

### store.$onAction

- `store.$onAction((context) => void)`
- `context.after((actionReturnValue) => void /** callback */)` callback 的参数是 action 方法的返回值
- `context.onError((err) => void /** callback */)` callback 的参数是 action 方法抛出的错误
- `context.args` action 方法的参数数组
- `context.store` store 仓库实例

```ts
userStore.$onAction(
  (context) => {
    context.after((actionReturnValue) =>
      console.log(
        "[$onAction] context.after, actionReturnValue:",
        actionReturnValue,
      ),
    );
    context.onError((err) =>
      console.log("[$onAction] context.onError, err:", err),
    );
    console.log("[$onAction] context.args:", context.args);
    console.log(
      "[$onAction] context.store === userStore:",
      context.store === userStore,
    );
  },
  false, // 默认 detached: false，组件卸载时移除 callback
);
```

## pinia 持久化

页面刷新后，store 中的 state 状态会丢失，可以使用浏览器存储 API 实现持久化：

- localStorage：数据持久化存储到磁盘，无过期时间，需手动清除
- sessionStorage：数据存储在内存中，当前会话（标签页）关闭时自动清除

> 也可以使用 [pinia-plugin-persistedstate](https://prazdevs.github.io/pinia-plugin-persistedstate/) 插件简化持久化配置

::: tip 使用浏览器持久化缓存

- 对于选项式 store 仓库实例，$state 是单层 reactive 包装的对象，需要调用 toRaw 转换为普通对象
- 对于组合式 store 仓库实例，$state 是多层嵌套的响应式对象，必须递归调用 toRaw 将 $state 转换为普通对象

:::

::: code-group

```js [utils/deepToRaw.js]
import { isReactive, isRef, toRaw, unref } from "vue";

export function deepToRaw(obj) {
  const raw = isReactive(obj) ? toRaw(obj) : obj;
  if (Array.isArray(raw)) return raw.map(deepToRaw);
  if (typeof raw === "object" && raw !== null) {
    const res = {};
    for (const k in raw) {
      const v = raw[k];
      res[k] = isRef(v) ? deepToRaw(unref(v)) : deepToRaw(v);
    }
    return res;
  }
  return raw;
}
```

```ts [main.ts]
import { createApp } from "vue";
import { createPinia, type PiniaPlugin, type PiniaPluginContext } from "pinia";
import { deepToRaw } from "./utils/deepToRaw";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);

const setLocalStorage = (key: string, value: unknown) => {
  const rawVal = deepToRaw(value);
  localStorage.setItem(key, JSON.stringify(rawVal));
};

const getLocalStorage = (key: string) =>
  JSON.parse(localStorage.getItem(key) ?? "{}");

const piniaPluginPersist = (): PiniaPlugin => {
  return (ctx: PiniaPluginContext) => {
    const key = ctx.store.$id;
    const val = getLocalStorage(key);
    ctx.store.$subscribe(() =>
      setLocalStorage(key, deepToRaw(ctx.store.$state)),
    );
    ctx.store.$patch(val);
  };
};

const pinia = createPinia();
pinia.use(piniaPluginPersist());
app.use(pinia);

app.mount("#app");
```

:::

> `tsconfig.app.json` 添加 `"allowJs": true` 支持 js 文件
