# Vue Router

## 使用 vue-router

::: code-group

```ts [@/router/index.ts]
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import LoginView from "@/views/LoginView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    // 函数形式打包时候会进行代码分割，需要使用相对路径
    component: () => import("@/views/RegisterView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(/*import.meta.env.BASE_URL*/),
  routes,
});

export default router;
```

```vue [App.vue]
<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div>
    <!-- <RouterLink /> 链接到 to 属性指定的路由 -->
    <RouterLink to="/">login</RouterLink>

    <!-- to 的对象写法（具名路由） -->
    <RouterLink :to="{ name: 'register' }">register</RouterLink>
    <RouterLink to="/register">register</RouterLink>

    <!-- <RouterView /> 路由组件的容器 -->
    <RouterView />
  </div>
</template>
```

```ts [main.ts]
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // 省略了 index.ts

const app = createApp(App);
// vue-router 是官方插件，需要注册使用
app.use(router);
app.mount("#app");
```

:::

> `<RouterLink to="/where" />` 和 `<a href="/where"></a>` 的区别：
>
> - `<RouterLink />` 在 hash 模式和 history 模式下的行为相同
> - `<RouterLink />` 会阻止 `<a>` 标签点击事件的默认行为, 不会重新加载页面

## 路由模式

### history mode (html5)

**概述：**
`createWebHistory()` 基于 HTML5 的 History API（`pushState`、`replaceState`、`popstate` 事件）实现。通过操作浏览器历史记录，实现 URL 无 `#` 且无刷新的页面跳转

**注意点：**

当用户直接访问非首页的 URL 时，浏览器会向服务器发送请求，此时服务器需要配置 fallback 路由，否则会返回 404 错误

```nginx
location / {
  try_files $uri $uri/ /index.html; # 所有请求都指向 index.html
}
```

> popstate 事件：
>
> - 改变 url 中的 hash 值时，页面一定不会重新加载
> - 点击浏览器的前进/后退按钮改变 url 时，会触发 popstate 事件
> - 调用 history.forward()，history.back()，history.go(delta: number) 改变 url 时，也会触发 popstate 事件
> - 调用 history.pushState()，history.replaceState() 改变 url 时，不会触发 popstate 事件，页面一定不会重新加载

### hash mode (default)

**概述：**
`createWebHashHistory()` 基于浏览器的 URL 哈希（`#` 后面的部分） 实现。哈希值的变化不会触发浏览器向服务器发送请求，但会被浏览器记录在历史记录中，从而实现无刷新的页面跳转

**注意点：**
`#` 部分场景下可能与锚点冲突（早期引擎爬虫会将 `#` 视为锚点标识符，仅抓取 `#` 前面的域名部分，完全忽略后面的路由路径，从而导致 SEO 不友好）

> hashchange 事件
>
> - Vue 路由的 hash 模式通过改变 `location.hash` 的值, 会触发 hashchange 事件
> - vue-router 监听 hashchange 事件, 实现无刷新的路由导航
> - `addEventListener("hashchange", (ev) => console.log(ev));`

### memory mode (abstract)

`createMemoryHistory()`，一种无浏览器环境下的路由模式，不依赖浏览器的 URL 或 History API，而是在内存中模拟路由历史记录。适用于 node 环境和 SSR, url 不会改变

## 编程式导航

```ts
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const routeJumpByUrl = (url: string) => {
  // window.history.pushState();
  router.push(url);
  // router.push({ path: url, replace: false });
};

const routeJumpByName = (name: string) => {
  // window.history.replaceState();
  router.replace({ name, replace: true });
};

const routeJump2prev = (delta?: number) => {
  // window.history.go(delta ?? -1);
  router.go(delta ?? -1);
  // window.history.back();
  router.back();
};

const routeJump2next = (delta?: number) => {
  // window.history.go(delta ?? 1);
  router.go(delta ?? 1);
  // window.history.forward();
  router.forward();
};
```

## 路由传参

### query

::: code-group

```vue [App.vue]
<!-- 跳转并携带query参数（to的字符串写法） -->
<RouterLink to="/login/detail?a=1&b=rico">
  {{ user.name }}
</RouterLink>

<!-- 跳转并携带query参数（to的对象写法） -->
<RouterLink
  :to="{
    // name:'detail',
    path: '/login/detail',
    query: {
      id: user.id,
      name: user.name,
    },
  }"
>
  {{ user.name }}
</RouterLink>
```

```ts [@/views/LoginView.vue]
import { useRoute } from "vue-router";
const route = useRoute();
// 打印query参数
console.log(route.query);
```

:::

### params

::: code-group

```vue [App.vue]
<!-- 跳转并携带params参数（to的字符串写法） -->
<RouterLink :to="`/login/detail/1/rico`">{{ user.name }}</RouterLink>

<!-- 跳转并携带params参数（to的对象写法） -->
<RouterLink
  :to="{
    name: 'detail', //用name跳转
    params: {
      id: user.id,
      name: user.name,
    },
  }"
>
  {{ user.name }}
</RouterLink>
```

```ts [@/views/LoginView.vue]
import { useRoute } from "vue-router";
const route = useRoute();
// 打印params参数
console.log(route.params);
```

:::

> 传递 `params` 参数时，若使用 `to` 的对象写法，必须使用 `name` 配置项，不能用 `path`
>
> 传递 `params` 参数时，需要提前在规则中占位，如：
>
> `path: "/register/:id/:name?/:age?"`
>
> 使用 `query` 传参时，会显示在地址栏；而 `params` 不会
>
> 使用 `params` 传参刷新会丢失；而 `query` 不会

### props

将路由参数作为`props`传给组件，使用`defineProps`接收

```ts
const routes: Array<RouteRecordRaw> = [
  {
    name: "detail",
    path: "/detail/:id/:name",
    component: Detail,

    // props 的对象写法，作用：把对象中的每一组 key-value 作为 props 传给 Detail 组件
    // props:{a:1,b:2},

    // props 的布尔值写法，作用：把收到的每一组 params 参数作为 props 传给 Detail 组件
    // props:true

    // props 的函数写法，作用：把返回的对象中每一组 key-value 作为 props 传给 Detail 组件
    props(route) {
      return route.query;
    },
  },
];
```

## 重定向和视图命名

::: code-group

```ts [@router/index.ts]
const routes: Array<RouteRecordRaw> = [
  {
    path: "/views",

    // 路由别名
    // alias: '/',
    alias: ["/", "/home"],

    // 字符串形式
    redirect: "/views/ab",
    // 对象形式
    redirect: {
      path: "/views/ab",
      // name: 'ab',
    },
    // 函数形式
    redirect: (to) => {
      console.log("[redirect] to:", to);
      return {
        // path: '/views/ab',
        name: "ab",
        query: to.query, // 默认
      };
    },

    children: [
      {
        path: "/views/ab", // path: 'ab'
        name: "ab",
        components: {
          // name="default"
          default: () => import("@/views/AView.vue"),
          // name="pageB"
          pageB: () => import("@/views/BView.vue"),
        },
      },
      {
        path: "bc", // path: '/views/bc'
        name: "bc",
        components: {
          // name="pageB"
          pageB: () => import("@/views/BView.vue"),
          // name="pageC"
          pageC: () => import("@/views/CView.vue"),
        },
      },
    ],
  },
];
```

```vue [App.vue]
<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div>
    <!-- 默认 push -->
    <RouterLink replace to="/views/ab">/views/ab</RouterLink>
    <RouterLink :to="{ name: 'bc' }">/views/bc</RouterLink>

    <div>@/views/AView.vue 的容器</div>
    <!-- name="default" -->
    <RouterView />

    <div>@/views/BView.vue 的容器</div>
    <!-- name="pageB" -->
    <RouterView name="pageB" />

    <div>@/views/CView.vue 的容器</div>
    <!-- name="pageC" -->
    <RouterView name="pageC" />
  </div>
</template>
```

:::

## 路由守卫

- 前置守卫函数在 redirect 重定向后, 路由跳转前执行
- 后置守卫函数在路由跳转后执行

**前置守卫**

`router.beforeEach((to, from, next) => void)`

::: code-group

```ts [写法一]
const whitelist: string[] = ["/register", "/login"];

router.beforeEach(
  (
    to, // (重定向后的) 目的路由
    from, // 源路由
    next // 放行函数
  ) => {
    console.log("[beforeGuard] from:", from);
    console.log("[beforeGuard] to:", to);
    if (whitelist.includes(to.path) || sessionStorage.getItem("token")) {
      next(); // 放行
    } else {
      next("/login"); // 重定向到登录
    }
  }
);
```

```ts [写法二]
const whitelist: string[] = ["/register", "/login"];

router.beforeEach((to) => {
  if (!whitelist.includes(to.path) && !sessionStorage.getItem("token")) {
    // 没有返回值: 放行
    // 有返回值: 重定向
    return { name: "login" };
  }
});
```

:::
**后置守卫**

`router.afterEach((to, from) => void)`

## 路由元信息

::: code-group

```ts [@router/index.ts]
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
    // 路由元信息
    meta: {
      title: "Homepage",
      // 路由过渡动画
      transition: "animate__bounceIn",
    },
  },
];
```

```vue [App.vue]
<template>
  <RouterView v-slot="{ route, Component }">
    <!-- <Transition /> 只允许一个直接子元素
     <Transition /> 包裹组件时, 组件必须有唯一的根元素, 否则无法应用过渡动画 -->
    <Transition
      :enter-active-class="`animate__animated ${route.meta.transition ?? ''}`"
    >
      <!-- Component 必须有唯一的根元素 -->
      <component :is="Component"></component>
    </Transition>
  </RouterView>
</template>
```

:::

## 滚动行为

仅点击浏览器的前进/后退按钮 (触发 popstate 事件) 时可用

```ts
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 滚动行为
  scrollBehavior: (to, from, savedPosition) => {
    // 滚动到原位置
    if (savedPosition) {
      return savedPosition;
    }
    // 滚动到锚点
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    }
    // 滚动到顶部
    return { top: 0 };
  },
});
```

## 动态路由

- `router.addRoute()` 动态添加路由, 返回删除该路由的函数
- `router.removeRoute()` 动态删除路由
- `router.hasRoute()` 判断路由是否存在
- `router.getRoutes()` 获取所有路由信息
