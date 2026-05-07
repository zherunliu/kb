# React Router

## 使用 React Router

`pnpm add react-router`

### 数据模式

::: code-group

```tsx [src/router/index.tsx]
import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import About from "../pages/About";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/about",
    element: <About />,
  },
]);

export default router;
```

```tsx [src/App.tsx]
import { RouterProvider } from "react-router";
import router from "./router";
export default function App() {
  return <RouterProvider router={router} />;
}
```

:::

### 声明模式

```tsx
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router";
import About from "./pages/About/index.tsx";
import Home from "./pages/Home/index.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" Component={About} />
    </Routes>
  </BrowserRouter>,
);
```

## 路由模式

1. `createBrowserRouter`：基于 HTML5 History API（pushState，replaceState，popState）的路由模式，需要服务器配置 fallback 路由，以解决用户直接访问或刷新非 / 根路径的页面时，返回 404 Not Found 问题
2. `createHashRouter`：基于 URL hash（#）的路由模式，不需要服务器配置 fallback 路由，因为 hash 部分不会被发送到服务器，不利于 SEO
3. `createMemoryRouter`：基于内存的路由模式，适用于非浏览器环境（如 React Native）或需要在内存中管理路由状态的场景，不会修改浏览器地址栏
4. `createStaticRouter`：基于静态路由的模式，适用于服务器端渲染（SSR）或静态站点生成（SSG）的场景，不会修改浏览器地址栏

## 导航方式

### `<Link />`

组件会被渲染为 `<a>` 标签，但不会重新加载页面

- to 导航的目的路径
- replace 替换当前路径，不保留历史记录
- state 传递参数
- relative
  > - relative="route" 使用绝对路径，默认
  > - relative="path" 可以使用相对路径，数据模式默认开启
- reloadDocument 页面跳转时，是否重新加载页面
- preventScrollReset 是否阻止滚动位置重置
- viewTransition 页面跳转时，是否开启 opacity 过渡动画

### `<NavLink />`

属性与 `<Link />` 相同，路由导航时，`<NavLink />` 会经过 3 个状态的转换，`<Link />` 不会：

- active 激活状态，当前路径和目的路径匹配
- pending 等待状态，等待 loader 加载数据
- transitioning 过渡状态，需要使用 viewTransition 属性开启 opacity 过渡

```css
/* 激活状态时，react-router 自动添加类名 active */
a.active {
}
/* 等待状态时，react-router 自动添加类名 pending */
a.pending {
}
/* 过渡状态时，react-router 自动添加类名 transitioning */
a.transitioning {
}
```

也可以通过 style 属性设置：

```tsx
<NavLink
  to="/about"
  style={({ isActive, isPending, isTransitioning }) =>
    isActive
      ? { backgroundColor: "blue", color: "white" }
      : isPending
        ? { backgroundColor: "yellow", color: "black" }
        : isTransitioning
          ? { backgroundColor: "green", color: "white" }
          : ""
  }
>
  About
</NavLink>
```

### useNavigate

```tsx
import { useNavigate } from "react-router";

const navigate = useNavigate();

navigate("/home", {
  replace: false,
  state: { name: "rico" },
  relative: "route",
  preventScrollReset: false,
  viewTransition: true,
});
```

### redirect

需要配合 loader 或 action 使用，重定向到指定路径
::: code-group

```tsx [src/router/index.tsx]
import { createBrowserRouter, redirect } from "react-router";
import { lazy } from "react";

const getToken = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // resolve(null);
      resolve("mock-token");
    }, 2000);
  });
};

const router = createBrowserRouter([
  {
    Component: lazy(() => import("../layout")),
    children: [
      {
        path: "home",
        Component: lazy(() => import("../pages/Home")),
      },
      {
        path: "about",
        Component: lazy(() => import("../pages/About")),
        loader: async () => {
          const token = await getToken();
          if (!token) {
            // throw new Error("Unauthorized");
            return redirect("/home");
          }
          return { token };
        },
        // loader 或 action 抛出错误时，fallback 到 ErrorBoundary
        ErrorBoundary: lazy(() => import("../pages/Fallback")),
      },
    ],
  },
]);

export default router;
```

```tsx [src/pages/Fallback/index.tsx]
import { useRouteError } from "react-router";

export default function Fallback() {
  const routeErr = useRouteError();
  console.log(routeErr);

  let errorMessage = String(routeErr);
  if (routeErr instanceof Error) {
    errorMessage = routeErr.message;
  }

  return <div>Error: {errorMessage}</div>;
}
```

:::

## 嵌套路由、布局路由、索引路由、前缀路由

1. 嵌套路由：在父路由的 children 中定义子路由，子路由的 path 会自动拼接父路由的 path，需要在父组件中使用 `<Outlet />` 来渲染子路由组件
2. 布局路由：没有 path 的父路由，作为布局组件使用
3. 索引路由：使用 `index: true` 在父路由的 children 中定义一个没有 path 的子路由，作为默认子路由使用
4. 前缀路由：没有 component 的父路由，作为路径前缀使用
5. 动态路由：在路由 path 中使用 `:param` 定义动态参数，可以通过 `useParams` 钩子获取动态参数的值

::: code-group

```tsx [嵌套路由]
import { createBrowserRouter } from "react-router";
import Layout from "../layout";
import { lazy } from "react";

const router = createBrowserRouter([
  {
    path: "/layout",
    Component: Layout,
    children: [
      {
        path: "home",
        Component: lazy(() => import("../pages/Home")),
      },
      {
        path: "about",
        Component: lazy(() => import("../pages/About")),
      },
    ],
  },
]);

export default router;
```

```tsx [布局路由]
import { createBrowserRouter } from "react-router";
import Layout from "../layout";
import { lazy } from "react";

const router = createBrowserRouter([
  {
    // path: "/layout",
    Component: Layout,
    children: [
      {
        path: "home",
        Component: lazy(() => import("../pages/Home")),
      },
      {
        path: "about",
        Component: lazy(() => import("../pages/About")),
      },
    ],
  },
]);

export default router;
```

```tsx [索引路由]
import { createBrowserRouter } from "react-router";
import Layout from "../layout";
import { lazy } from "react";

const router = createBrowserRouter([
  {
    path: "/layout",
    Component: Layout,
    children: [
      {
        index: true, // 或 path: "",
        Component: lazy(() => import("../pages/Home")),
      },
      {
        path: "about",
        Component: lazy(() => import("../pages/About")),
      },
    ],
  },
]);

export default router;
```

```tsx [前缀路由]
import { createBrowserRouter } from "react-router";
import Layout from "../layout";
import { lazy } from "react";

const router = createBrowserRouter([
  {
    path: "/layout",
    // Component: Layout,
    children: [
      {
        index: true,
        Component: lazy(() => import("../pages/Home")),
      },
      {
        path: "about",
        Component: lazy(() => import("../pages/About")),
      },
    ],
  },
]);

export default router;
```

:::

## 路由传参

### useSearchParams

::: code-group

```tsx [src/pages/Order/index.tsx]
import { NavLink, useNavigate } from "react-router";

export default function Order() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Order</h1>
      <button
        onClick={() =>
          navigate("/drink?drink-size=large&sugar-level=light&ice-level=light")
        }
      >
        Drink
      </button>
      <NavLink to="/drink?drink-size=large&sugar-level=free&ice-level=warm">
        Get a drink
      </NavLink>
    </div>
  );
}
```

```tsx [src/pages/Drink/index.tsx]
import { useLocation, useSearchParams } from "react-router";

export default function Drink() {
  const [searchParams, setSearchParams] = useSearchParams();
  const handleClick = () => {
    setSearchParams({
      "drink-size": "medium",
      "sugar-level": "medium",
      "ice-level": "medium",
    });
  };

  const location = useLocation();
  console.log(location.search);
  console.log(decodeURIComponent(location.search));

  return (
    <div>
      <h1>Drink</h1>
      <p>Drink Size: {searchParams.get("drink-size")}</p>
      <p>Sugar Level: {searchParams.get("sugar-level")}</p>
      <p>Ice Level: {searchParams.get("ice-level")}</p>
      <button onClick={handleClick}>Reset</button>
    </div>
  );
}
```

:::

### useParams

:::code-group

```tsx [src/router/index.tsx]
import { createBrowserRouter } from "react-router";
import { lazy } from "react";

const router = createBrowserRouter([
  {
    Component: lazy(() => import("../layout")),
    children: [
      {
        path: "home",
        Component: lazy(() => import("../pages/Home")),
      },
      {
        path: "about/:id/:age?/:address?",
        Component: lazy(() => import("../pages/About")),
      },
    ],
  },
]);

export default router;
```

```tsx [src/pages/About/index.tsx]
import { useParams } from "react-router";

export default function About() {
  const params = useParams();
  return (
    <div>
      <h1>About</h1>
      <p>ID: {params.id}</p>
      <p>Age: {params.age}</p>
      <p>Address: {params.address}</p>
    </div>
  );
}
```

:::

### state

::: code-group

```tsx [src/pages/Home/index.tsx]
import { NavLink } from "react-router";

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <NavLink to="/about" state={{ id: "1", age: "25", address: "Beijing" }}>
        About
      </NavLink>
    </div>
  );
}
```

```tsx [src/pages/About/index.tsx]
import { useLocation } from "react-router";

export default function About() {
  const state = useLocation().state as {
    id: number;
    age: number;
    address: string;
  };
  return (
    <div>
      <h1>About</h1>
      <p>ID: {state.id}</p>
      <p>Age: {state.age}</p>
      <p>Address: {state.address}</p>
    </div>
  );
}
```

:::

## 路由操作 loader、action

- loader 用于查询，GET 请求会触发 loader
- loader 路由导航时，导航状态 idle -> loading -> idle
- action 用于增删改，POST，DELETE，PATCH 请求会触发 action
- action 路由导航时，导航状态 idle -> submitting -> loading -> idle

::: code-group

```tsx [src/router/index.tsx]
import { createBrowserRouter } from "react-router";
import { lazy } from "react";

const router = createBrowserRouter([
  {
    Component: lazy(() => import("../layout")),
    children: [
      {
        path: "home",
        Component: lazy(() => import("../pages/Home")),
      },
      {
        path: "about",
        Component: lazy(() => import("../pages/About")),

        loader: async () => {
          const { data } = await fetch("/queryUsers").then((res) => res.json());
          return { code: 200, data };
        },

        action: async ({ request }) => {
          const item = await request.json();
          await new Promise((resolve) => {
            setTimeout(resolve, 2000);
          });

          return await fetch("/addUser", {
            method: "POST",
            body: JSON.stringify(item),
          }).then((res) => res.json());
        },
      },
    ],
  },
]);

export default router;
```

```tsx [src/pages/About/index.tsx]
import { useState } from "react";
import { useActionData, useLoaderData, useSubmit } from "react-router";

export default function About() {
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);

  // loader
  const { code, data } = useLoaderData<{
    code: number;
    data: { name: string; age: number }[];
  }>();

  // actionData
  const actionData = useActionData();
  console.log(actionData);

  // action
  const submit = useSubmit();
  const handleClick = (data: { name: string; age: number }) => {
    // 提交数据，触发 action
    submit(data, { method: "POST", encType: "application/json" });
  };

  return (
    <>
      <h1>About</h1>
      <input
        placeholder="name"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
      />
      <input
        placeholder="age"
        value={age}
        onChange={(ev) => setAge(Number.parseInt(ev.target.value))}
        type="number"
      />
      {/* action */}
      <button onClick={() => handleClick({ name, age })}>submit</button>
      {/* loader */}
      <div>code: {code}</div>
      <ul>
        {data.map((item, idx) => (
          <li key={idx}>
            name: {item.name}, age: {item.age}
          </li>
        ))}
      </ul>
    </>
  );
}
```

```ts [vite.config.ts]
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const vitePluginServer = (): Plugin => {
  return {
    name: "vite-plugin-server",
    configureServer(server) {
      const data = [
        { name: "foo", age: 22 },
        { name: "bar", age: 23 },
      ];

      server.middlewares.use("/queryUsers", async (_, res) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
        res.setHeader("Content-Type", "application/json");
        const resData = { data };
        res.end(JSON.stringify(resData));
      });

      server.middlewares.use("/addUser", async (req, res) => {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          data.push(JSON.parse(body));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ code: 0, echo: body }));
        });
      });
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginServer()],
});
```

:::

## useNavigation

navigation.state：

- idle
- loading
- submitting

::: code-group

```tsx [src/router/index.tsx]
import { createBrowserRouter } from "react-router";
import Layout from "../layout";
import { lazy } from "react";

const router = createBrowserRouter([
  {
    path: "/layout",
    Component: Layout,
    children: [
      {
        path: "home",
        Component: lazy(() => import("../pages/Home")),
      },
      {
        path: "about",
        lazy: async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 5000);
          });
          const About = await import("../pages/About");
          return {
            Component: About.default,
          };
        },
      },
    ],
  },
]);

export default router;
```

```tsx [src/layout/Content/index.tsx]
import { Outlet } from "react-router";
import { useNavigation } from "react-router";
export default function Content() {
  const navigation = useNavigation();
  // 导航状态变化：idle -> loading -> idle
  console.log(navigation.state);
  return (
    <div>
      {navigation.state === "loading" ? <div>Loading...</div> : <Outlet />}
    </div>
  );
}
```

> `useNavigation` 监听路由导航状态；`<Suspense>` 监听组件加载状态
