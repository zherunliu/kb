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
- `userStore.$reset` 重置 state 到初始值
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

- localStorage：数据存储到磁盘，没有过期时间
- sessionStorage：数据缓存到内存，会话结束时自动清除
