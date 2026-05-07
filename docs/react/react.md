# React

## JSX/TSX

JSX（JavaScript XML）/ TSX（TypeScript XML）是 JS/TS 的语法扩展，允许在 JS/TS 代码中直接编写类似 HTML 的标签

- 用插值语法 `{}` 来绑定变量和表达式
- 用驼峰式命名来绑定事件，如 `onClick`、`onChange` 等
- 用 `className` 来绑定 CSS 类名

```jsx
function App() {
  const htmlSnippet = '<h1 style="color: skyblue">hello, world!</h1>';
  // 类似 v-html
  return <div dangerouslySetInnerHTML={{ __html: htmlSnippet }}></div>;
}
```

## Fiber 架构

- 时间分片、任务切片：React 通过时间分片，将大渲染任务切片为多个工作单元（unitOfWork），低优先级的工作单元可以在浏览器空闲时执行，避免一次性完成大渲染任务（即构建 workInProgressFiberTree），导致主渲染线程阻塞
- 可中断的渲染：Fiber 架构下，React 可以将大渲染任务切片为多个工作单元（unitOfWork），Fiber 树的一个节点代表一个工作单元，使得 React 可以在浏览器空闲时执行低优先级的工作单元; 浏览器需要执行高优先级的任务时，例如用户输入时，可以先暂停渲染，执行高优先级任务，再恢复渲染
- 优先级调度：Fiber 架构下，React 可以根据任务优先级决定调度顺序，React 优先执行动画，用户交互等高优先级任务，例如用户输入; 延迟执行低优先级任务，例如数据加载后的页面渲染，同时任务有 timeout 过期时间，过期时间越短，优先级越高
  - Immediate：立即执行，例如动画
  - UserBlocking：用户交互
  - Normal：默认
  - Low：低优先级
  - Idle：空闲时执行
- 双缓存树（Fiber Tree）、原子提交：确保更新的原子性，避免页面卡顿

### 双缓存树

- currentFiberTree 当前渲染的 Fiber 树，保存更新前的状态
- workInProgressFiberTree 当前处理的 Fiber 树，保存更新后的状态
- 直接修改 currentFiberTree，会导致页面卡顿，页面同步更新，不可中断
- 协调阶段 reconcile 和提交阶段 commit
  - 协调阶段：计算副作用，构建 workInProgressFiberTree；即预计算更新后的页面，使用 diff 算法复用 fiber 节点，找到最小更新，协调阶段异步更新，可以中断
  - 提交阶段：预计算完成后，更新 currentFiberTree = workInProgressFiberTree，将最小更新提交到真实 DOM 上，确保更新的原子性，避免页面卡顿

### requestIdleCallback

`requestIdleCallback` 是浏览器提供的一个 API，用于在浏览器空闲时执行回调函数，适合执行一些不紧急的任务，例如预加载资源、数据分析等

```js
requestIdleCallback(
  (deadline) => {
    while (deadline.timeRemaining() > 0) {}
  },
  {
    timeout: 1000 /* 超时时间，超时后强制执行 */,
    // deadline.didTimeout() 判断是否为超时后执行
  },
);
```

React 不使用原生 `requestIdleCallback`，而是使用一个自定义的调度器来模拟 `requestIdleCallback` 的行为：

- `requestIdleCallback` 兼容性较差
- 优先级调度：React 有自定义的任务优先级 Immediate，UserBlocking，Normal，Low，Idle
- 时间分片：requestIdleCallback 中 callback 执行间隔是 50ms；React 有自定义的时间分片

### MessageChannel

`MessageChannel` 是浏览器提供的一个 API，用于创建一个新的消息通道，包含两个端口（port1 和 port2），可以在不同的上下文（如不同的窗口、iframe、Web Worker）之间进行通信

```js
const channel = new MessageChannel();
channel.port1.onmessage = (event) => {
  console.log("Received message:", event.data);
};
channel.port2.postMessage("Hello from port2!");
```

React 使用 `MessageChannel` 来实现一个自定义的调度器，模拟 `requestIdleCallback` 的行为：

- `MessageChannel` 是一个宏任务，在下一次事件循环中执行，不会阻塞当前页面更新
- setTimeout 嵌套超时，可能会有 4ms 最小延迟
- 如果浏览器不支持 `MessageChannel`，会回退到 `setTimeout`

## 状态不可变性

- 直接修改原对象/原数组，不会触发组件更新
- 不是直接修改原对象/原数组，而是返回一个新对象/新数组，无需深层侦听，可以提高性能

| 操作 | 原地修改                  | 返回新值                       |
| ---- | ------------------------- | ------------------------------ |
| 插入 | push()，unshift()         | concat()，...展开运算符        |
| 删除 | pop()，shift()，splice()  | filter()，slice()，toSpliced() |
| 替换 | arr[i] = newVal，splice() | map()，toSpliced()，with()     |
| 排序 | reverse()，sort()         | toReversed()，toSorted()       |

## 受控组件和非受控组件

- 受控组件：组件的状态由 React 组件控制，表单元素的值通过 state 来管理，表单元素的变化通过事件处理函数来更新 state
- 非受控组件：组件的状态由 DOM 元素控制，表单元素的值通过 ref 来获取，表单元素的变化不通过事件处理函数来更新 state

```tsx
import { useRef, useState, type ChangeEvent } from "react";

export default function App() {
  const [val, setVal] = useState("controlled value");
  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setVal(ev.target.value);
    console.log("controlled value:", ev.target.value);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const handleInput2 = () => {
    console.log("non-controlled value:", inputRef.current?.value);
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const handleUpload = () => {
    console.log("files:", fileRef.current?.files);
  };

  return (
    <>
      {/* 受控组件 */}
      <input type="text" value={val} onChange={handleChange} />
      {/* 非受控组件 */}
      <input
        type="text"
        ref={inputRef}
        defaultValue="non-controlled value"
        onChange={handleInput2}
      />
      {/* 特殊的非受控组件 */}
      <input type="file" ref={fileRef} onChange={handleUpload} />
    </>
  );
}
```

## 高阶组件

高阶组件（Higher-Order Component，HOC）是一个函数，接收一个组件作为参数，返回一个新的组件，常用于复用组件逻辑，例如权限控制、数据获取等

::: code-group

```tsx [App.tsx]
import { useEffect } from "react";

const trackService = {
  sendEvent: <T,>(trackType: string, data?: T) => {
    const eventData = {
      timestamp: new Date().toISOString(),
      trackType,
      data,
      url: window.location.href,
      ua: navigator.userAgent,
    };
    navigator.sendBeacon("/track", JSON.stringify(eventData));
  },
};

export interface TrackProps {
  trackEvent: (eventType: string, data: unknown) => void;
}

const withTrack = <T,>(
  Component: React.ComponentType<T & TrackProps>,
  trackType: string,
) => {
  return (props: T) => {
    useEffect(() => {
      trackService.sendEvent(`${trackType}-MOUNT`);
      return () => {
        trackService.sendEvent(`${trackType}-UNMOUNT`);
      };
    }, []);

    const trackEvent = (eventType: string, data: unknown) => {
      trackService.sendEvent(`${trackType}-${eventType}`, data);
    };

    return <Component {...props} trackEvent={trackEvent} />;
  };
};

const Button = ({
  trackEvent,
}: {
  trackEvent: (eventType: string, data: unknown) => void;
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent(e.type, {
      name: "BUTTON",
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };
  return <button onClick={handleClick}>Click me</button>;
};

// 关联 HOC
const TrackedButton = withTrack(Button, "BUTTON");

export default function App() {
  return <TrackedButton />;
}
```

```tsx [vite.config.ts]
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const trackServerPlugin: Plugin = {
  name: "mock-track-server",
  configureServer(server) {
    // 拦截 /track 路由
    server.middlewares.use("/track", (req, res) => {
      // navigator.sendBeacon 只能发送 POST 请求
      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          console.log("[received data]:", JSON.parse(body));
          res.statusCode = 200;
          res.end("ok");
        });
      }
    });
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), trackServerPlugin],
});
```

:::

## useState

```tsx
const [state /** 状态 */, setState /** 更新状态的函数 */] =
  useState(initialVal | () => initialVal /** 状态的初始值 */);
```

- React 的 state 是一帧一帧的（snapshot），每一次渲染都有独立的 state，异步回调函数会捕获该函数创建时的那一次渲染的 state 值（闭包陷阱，Stale Closure 过期的闭包）
- 调用 setState 会触发组件重新渲染，更新后的 state 值会在下一次渲染中生效
- setState 可以被批处理，一次渲染中合并多次更新
- setState 多次传入同一个 state 值，React 会进行优化，避免不必要的渲染

> 所有的 hook 只能在组件或自定义 hook 的顶层调用，不能在循环、条件语句或嵌套函数中调用

## useReducer

集中式状态管理，适合复杂的状态逻辑

```tsx
import { useReducer } from "react";

export default function App() {
  interface IState {
    cnt: number;
  }

  interface IAction {
    type: "add" | "sub";
    delta: number;
  }

  const initialVal: IState = { cnt: -4 };

  const reducer = (state: IState, action: IAction) => {
    switch (action.type) {
      case "add":
        return { cnt: state.cnt + action.delta };
      case "sub":
        return { cnt: state.cnt - action.delta };
      default:
        return state;
    }
  };

  const init = (state: IState) => {
    return { cnt: Math.abs(state.cnt) }; // { cnt: 4 }
  };

  const [
    state,
    // dispatch(action) => reducer(state, action)
    // dispatch 接收一个 action，派发 reducer 的调用
    dispatch,
  ] = useReducer(
    // reducer: (state, action) => newState
    // reducer 根据不同的 action 更新状态的纯函数
    reducer,
    // dispatch(action) => reducer(state, action)
    initialVal,
    // 初始化状态的函数，可选
    init,
  );
  return (
    <>
      <div>state.cnt: {state.cnt}</div>
      <button onClick={() => dispatch({ type: "add", delta: 1 })}>+1</button>
      <button onClick={() => dispatch({ type: "sub", delta: 1 })}>-1</button>
    </>
  );
}
```

## useImmer & useImmerReducer

`useImmer` 和 `useImmerReducer` 是 `immer` 库提供的 hook，用于简化不可变状态的更新，允许直接修改 state 的草稿（draft），底层会自动生成新的 state

::: code-group

```tsx [useImmer] {8-9}
import { useImmer } from "use-immer";
export default function App() {
  const [state, setState] = useImmer({ cnt: 0 });

  return (
    <>
      <div>state.cnt: {state.cnt}</div>
      <button onClick={() => setState((draft) => (draft.cnt += 1))}>+1</button>
      <button onClick={() => setState((draft) => (draft.cnt -= 1))}>-1</button>
    </>
  );
}
```

```tsx [useImmerReducer] {18-19,21-22}
import { useImmerReducer } from "use-immer";

interface IState {
  cnt: number;
}

interface IAction {
  type: "add" | "sub";
  delta: number;
}
export default function App() {
  const initialVal: IState = { cnt: -4 };
  const reducer = (state: IState, action: IAction) => {
    switch (action.type) {
      case "add":
        state.cnt += action.delta;
        break;
      case "sub":
        state.cnt -= action.delta;
        break;
      default:
        return state;
    }
  };

  const init = (state: IState) => {
    return { cnt: Math.abs(state.cnt) }; // { cnt: 4 }
  };

  const [state, dispatch] = useImmerReducer(reducer, initialVal, init);
  return (
    <>
      <div>state.cnt: {state.cnt}</div>
      <button onClick={() => dispatch({ type: "add", delta: 1 })}>+1</button>
      <button onClick={() => dispatch({ type: "sub", delta: 1 })}>-1</button>
    </>
  );
}
```

:::

## useSyncExternalStore

订阅外部数据源的变化，确保组件在外部数据源更新时同步更新，支持服务端渲染（SSR）

```tsx
const state = useSyncExternalStore(
  subscribe, // 订阅函数，接收一个回调函数，当外部数据源更新时调用该回调函数
  getSnapshot, // 获取当前快照的函数，返回当前外部数据源的状态
  getServerSnapshot, // 可选，获取服务器端快照的函数，返回服务器端外部数据源的状态
);
```

- onStoreChange 通知 React 调用 getSnapshot 获取数据源的快照，以更新 state，触发组件更新
- getSnapshot 获取数据源的快照，如果 getSnapshot 返回值的内存地址与上一个返回值的内存地址不同，则会触发组件更新；如果 getSnapshot 返回值的内存地址总是不同的，则会报错 `Maximum update depth exceeded`

### 订阅 Web API：window.localStorage 的自定义 hook useLocalStorage

::: code-group

```tsx [hooks/useStorage.ts (onStoreChange)]
import { useSyncExternalStore } from "react";
import { useRef } from "react";

type TCallback = () => void;
export function useStorage<T>(key: string, initialValue: T) {
  const cbRef = useRef<TCallback | null>(null);
  const subscribe = (onStoreChange: TCallback) => {
    cbRef.current = onStoreChange;
    return () => {
      cbRef.current = null;
    };
  };

  const getSnapshot = () => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  };

  const state = useSyncExternalStore(subscribe, getSnapshot);
  const setState = (newValue: T) => {
    localStorage.setItem(key, JSON.stringify(newValue));
    cbRef.current?.();
  };

  return [state, setState] as const;
}
```

```tsx [App.tsx]
import { useStorage } from "./hooks/useStorage";

export default function App() {
  const [count, setCount] = useStorage("count", 0);
  return (
    <>
      <div>count: {count}</div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
    </>
  );
}
```

:::

### 订阅 Web API：window.history 的自定义 hook useHistory

::: code-group

```ts [hooks/useHistory.ts (dispatch)]
import { useSyncExternalStore } from "react";

export const useHistory = () => {
  const subscribe = (onStoreChange: () => void) => {
    window.addEventListener("popstate", onStoreChange);
    return () => {
      window.removeEventListener("popstate", onStoreChange);
    };
  };
  const getSnapshot = () => window.location.pathname;

  const url = useSyncExternalStore(subscribe, getSnapshot);

  const push = (url: string) => {
    window.history.pushState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const replace = (url: string) => {
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return [url, push, replace] as const;
};
```

```tsx [App.tsx]
import { useHistory } from "./hooks/useHistory";
export default function App() {
  const [url, push, replace] = useHistory();
  return (
    <>
      <div>URL: {url}</div>
      <button onClick={() => push("/A")}>Go to Page A</button>
      <button onClick={() => replace("/B")}>Go to Page B</button>
    </>
  );
}
```

:::

## useTransition(perf)

管理过渡状态，降低更新优先级，适合处理一些需要等待的更新，例如数据加载、路由切换等

`const [isPending, startTransition] = useTransition();`

> 传递给 startTransition 的回调函数必须同步执行状态更新

::: code-group

```tsx [App.tsx]
import { useState, useTransition } from "react";
import { Input, List } from "antd";

interface IData {
  id: number;
  name: string;
  age: number;
  address: string;
}
export default function App() {
  const [val, setVal] = useState("");
  const [list, setList] = useState<IData[]>([]);
  const [isPending, startTransition] = useTransition();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
    fetch("/api/data?name=" + e.target.value)
      .then((res) => res.json())
      .then((data) => {
        startTransition(() => {
          setList(data.list);
        });
      });
  };
  return (
    <>
      <Input value={val} onChange={handleChange} />
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <List
          dataSource={list}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.name}
                description={`Id: ${item.id}, Age: ${item.age}, Address: ${item.address}`}
              />
            </List.Item>
          )}
        />
      )}
    </>
  );
}
```

```ts [vite.config.ts]
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import mockjs from "mockjs";
import url from "node:url";

const viteMockServer = (): Plugin => {
  return {
    name: "vite-mock-server",
    configureServer(server) {
      server.middlewares.use("/api/data", (req, res) => {
        const parseUrl = url.parse(req.originalUrl, true).query;
        const data = mockjs.mock({
          "list|1000": [
            {
              "id|+1": 1,
              name: parseUrl.name || "@cname",
              "age|18-60": 1,
              address: "@county(true)",
            },
          ],
        });
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), viteMockServer()],
});
```

:::

## useDeferredValue(perf)

根据设备性能情况延迟某些值的更新，直到主渲染任务完成。适用于高频更新的内容（如输入框、滚动等）

当 useDeferredValue 接收到与之前不同的值（使用 `Object.is` 进行比较）时，除了当前渲染（此时它仍然使用旧值），它还会安排一个后台重新渲染。这个后台重新渲染是可以被中断的，如果 value 有新的更新，React 会从头开始重新启动后台渲染

```tsx
import { useDeferredValue, useState } from "react";
import { Input, List } from "antd";
import mockjs from "mockjs";

interface IData {
  id: number;
  name: number;
  age: number;
  address: string;
}
export default function App() {
  const [val, setVal] = useState("");
  const deferredVal = useDeferredValue(val);
  const [list] = useState<IData[]>(() => {
    return mockjs.mock({
      "list|1000": [
        {
          "id|+1": 1,
          name: "@natural",
          "age|18-60": 1,
          address: "@county(true)",
        },
      ],
    }).list;
  });
  const filteredList = () => {
    console.log("val:", val, "deferredVal:", deferredVal);
    return list.filter((item) => item.name.toString().includes(deferredVal));
  };
  return (
    <>
      <Input value={val} onChange={(e) => setVal(e.target.value)} />
      <List
        style={{
          opacity: val !== deferredVal ? 0.5 : 1,
          transition: "opacity 0.3s",
        }}
        dataSource={filteredList()}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.name}
              description={`Id: ${item.id}, Age: ${item.age}, Address: ${item.address}`}
            />
          </List.Item>
        )}
      />
    </>
  );
}
```

## useEffect

```tsx
useEffect(
  effect, // effect 副作用函数，返回一个 destructor 清理函数
  deps, // deps 依赖项数组
);
```

执行时机：

- 如果传入的 deps 是非空数组
  > - 组件挂载后，执行 effect 副作用函数（类比 Vue 的 onMounted），此时可以获取到 DOM 元素
  > - 依赖项改变时，先执行 destructor 清理函数，再执行 effect 副作用函数（类比 Vue 的 onUpdated）
  > - 组件卸载后，执行 destructor 清理函数（类比 Vue 的 onUnmounted），此时获取不到 DOM 元素
- 如果不传入 deps，即 deps 为 undefined，则组件挂载，每次更新后，都会执行 effect 副作用函数
- 如果传入的 deps 是空数组，则 effect 副作用函数只会在组件挂载后执行一次
- effect 副作用函数和 destructor 清理函数都是异步执行的，destructor 清理函数在下一次 effect 副作用函数执行前或组件卸载时执行

## useLayoutEffect

同步执行副作用函数，可以避免浏览器回流和重绘时的闪烁问题，适合需要读取布局并同步触发重绘的场景

| 区别                       | useLayoutEffect        | useEffect              |
| -------------------------- | ---------------------- | ---------------------- |
| destructor/effect 执行时机 | 浏览器回流，重绘前执行 | 浏览器回流，重绘后执行 |
| destructor/effect 执行方式 | 同步执行               | 异步执行               |
| DOM 渲染                   | 会阻塞 DOM 渲染        | 不会阻塞 DOM 渲染      |

```tsx
import { useLayoutEffect, useRef } from "react";

export default function App() {
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    if (listRef.current) {
      const top = new URLSearchParams(window.location.search).get("scrollTop");
      listRef.current.scrollTop = top ? parseInt(top) : 0;
    }
  }, []);

  const scrollHandler = (e: React.UIEvent<HTMLUListElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    // 记录到 URL 中
    window.history.replaceState(null, "", `?scrollTop=${scrollTop}`);
  };

  return (
    <ul
      ref={listRef}
      onScroll={scrollHandler}
      style={{ height: "500px", overflowY: "scroll" }}
    >
      {Array.from({ length: 500 }, (_, i) => (
        <li key={i}>Item {i + 1}</li>
      ))}
    </ul>
  );
}
```

## useRef

`const refVal = useRef(initialVal);`

- 每次组件更新时，都会重新执行组件函数，重新创建所有的局部变量
- useRef 只在组件挂载时调用 1 次，组件更新时，不会重新调用 useRef，即不会重新创建 refVal
- React 的 useRef 返回的 refVal 是普通 JS 对象，改变 refVal.current 的值时，不会触发组件更新
- useRef 返回的 refVal 不能作为 useEffect 等其他 hooks 的 deps 中的依赖项

## useImperativeHandle

父组件获取子组件的 DOM 节点，访问子组件暴露的属性，调用子组件暴露的方法

```tsx
import React, { useImperativeHandle, useRef } from "react";
interface ChildHandle {
  name: string;
  count: number;
  increment: () => void;
}
const Child = ({ ref }: { ref: React.RefObject<ChildHandle | null> }) => {
  const [count, setCount] = React.useState(0);

  useImperativeHandle(
    ref, // 父组件通过子组件的 props 传递的 ref 对象
    () => {
      // 返回子组件暴露的属性，方法
      return {
        name: "Child",
        count,
        increment: () => setCount((prev) => prev + 1),
      };
    },
    [count], // 依赖项数组，可选
  );
  return (
    <div>
      <h3>Child</h3>
      <p>Count: {count}</p>
    </div>
  );
};

export default function App() {
  const childRef = useRef<ChildHandle | null>(null);
  return (
    <div>
      <h3>Parent</h3>
      <button onClick={() => console.log(childRef.current)}>
        Get Child Data
      </button>
      <button className="counter" onClick={() => childRef.current?.increment()}>
        Increment Child Count
      </button>
      <Child ref={childRef} />
    </div>
  );
}
```

## useContext

跨组件传递数据，避免层层传递 props，对于同一个 context，内层 context 的值会覆盖外层 context 的值

```tsx {8,47-49}
import React from "react";

interface IThemeContext {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
}

const ThemeContext = React.createContext({} as IThemeContext);

const Child = () => {
  const { theme, setTheme } = React.useContext(ThemeContext);
  return (
    <div>
      <h3>Child</h3>
      <p>Child theme: {theme}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Switch
      </button>
    </div>
  );
};

const Parent = () => {
  const { theme, setTheme } = React.useContext(ThemeContext);
  return (
    <div>
      <h3>Parent</h3>
      <p>Parent theme: {theme}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Switch
      </button>
      <hr />
      <Child />
    </div>
  );
};
export default function App() {
  const [theme, setTheme] = React.useState("light");
  return (
    <div>
      <h3>App</h3>
      <p>App theme: {theme}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Switch
      </button>
      <hr />
      <ThemeContext value={{ theme, setTheme }}>
        <Parent />
      </ThemeContext>
    </div>
  );
}
```

## React.memo(perf)

React.memo 可以缓存组件的渲染结果，当组件的 props 没有发生变化时，直接复用之前的渲染结果，避免不必要的渲染，常用于包裹子组件

触发组件渲染的条件：

- `useState`：组件的 state 改变
- `useContext`：依赖的 context 改变
- 组件的 props 改变
- 父组件重新渲染时，子组件会重新渲染

## useMemo(perf)

缓存计算结果，当依赖项没有发生变化时，直接复用之前的计算结果，避免不必要的计算，常用于包裹计算函数，传递给子组件的计算结果

```tsx
import { useMemo, useState } from "react";

export default function App() {
  const [value, setValue] = useState("");
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const getSum = () => {
    console.log("Calculating sum...");
    return num1 + num2;
  };

  const getProduct = useMemo(() => {
    console.log("Calculating product...");
    return num1 * num2;
  }, [num1, num2]);

  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <p>Number1: {num1}</p>
      <p>Number2: {num2}</p>
      <button onClick={() => setNum1(num1 + 1)}>Increment Number1</button>
      <button onClick={() => setNum2(num2 + 1)}>Increment Number2</button>
      <p>Sum: {getSum()}</p>
      <p>Product: {getProduct}</p>
    </div>
  );
}
```

## useCallback(perf)

缓存计算函数，当依赖项没有发生变化时，直接复用之前的函数实例，避免不必要的函数重新创建，常用于包裹事件处理函数，传递给子组件的回调函数

```tsx
import React, { type ChangeEvent, useCallback, useState, useRef } from "react";

interface IProps {
  cb: () => void;
}

const Child = React.memo(({ cb }: IProps) => {
  console.log("Child update...");
  return <button onClick={cb}>hello</button>;
});

const App: React.FC = () => {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (ev: ChangeEvent<HTMLInputElement>) =>
    setInputVal(ev.target.value);

  const cachedCb = useCallback(() => console.log("Hello Rico!"), []);
  return (
    <>
      <input ref={inputRef} value={inputVal} onChange={handleChange} />
      <Child cb={cachedCb} />
    </>
  );
};

export default App;
```

## useDebugValue

```tsx
import { useDebugValue, useState } from "react";

const useCookie = (name: string, initVal: string = "") => {
  const getCookie = () => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    return match ? decodeURIComponent(match[2]) : initVal;
  };

  const [cookie, setCookie] = useState(getCookie());

  const updateCookie = (value: string) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
    setCookie(value);
  };

  const deleteCookie = () => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    setCookie("");
  };

  useDebugValue(cookie, () => `Cookie: ${cookie}` /* formatter */);
  return [cookie, updateCookie, deleteCookie] as const;
};
export default function App() {
  const [cookie, setCookie, deleteCookie] = useCookie(
    "myCookie",
    "initialValue",
  );
  return (
    <>
      <p>Cookie: {cookie}</p>
      <button onClick={() => setCookie("newValue")}>Update Cookie</button>
      <button onClick={deleteCookie}>Delete Cookie</button>
    </>
  );
}
```

## useId

生成一个唯一的 ID，适合在服务端渲染（SSR）和客户端渲染（CSR）之间保持一致的 ID
`const id: string = useId();`

## Suspense

Suspense 组件用于处理组件的加载状态，配合 React.lazy 实现组件的懒加载（代码分包），适合处理一些需要等待的组件，例如路由组件、图片等

::: code-group

```tsx [App.tsx]
import { Suspense, lazy } from "react";
// 使用 React.lazy 动态导入子组件，打包时会将子组件单独打包成一个 chunk
const ChildAsync = lazy(() => import("./ChildAsync"));

export default function App() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <ChildAsync />
      </Suspense>
    </>
  );
}
```

```tsx [ChildAsync.tsx]
import { use } from "react";

interface IData {
  name: string;
  age: number;
  address: string;
}

const fetchData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return await fetch("/data.json").then((res) => res.json());
};
const dataPromise = fetchData();

export default function ChildAsync() {
  // 使用 use() 来读取数据，use() 会在数据未准备好时抛出一个 Promise，React 会捕获这个 Promise 并在 Promise 解决后重新渲染组件
  const { data } = use(dataPromise) as { data: IData };
  console.log(data);
  return (
    <>
      <div>ChildAsync</div>
      <div>data: {JSON.stringify(data)}</div>
    </>
  );
}
```

```json [public/data.json]
{
  "data": {
    "name": "rico",
    "age": 4,
    "address": "Nanjing, China"
  }
}
```

:::

## createPortal

Portal 允许将子组件渲染到父组件 DOM 层次结构之外的 DOM 节点中，适合处理一些需要脱离父组件样式限制的组件，例如模态框、工具提示等

```tsx
import { createPortal } from "react-dom";

export default function App() {
  return <>{createPortal(<h1>Hello, world!</h1>, document.body)}</>;
}
```
