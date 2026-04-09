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

## Hooks

所有的 hook 只能在组件或自定义 hook 的顶层调用，不能在循环、条件语句或嵌套函数中调用

### useState

```tsx
const [state /** 状态 */, setState /** 更新状态的函数 */] =
  useState(initialVal | () => initialVal /** 状态的初始值 */);
```

- React 的 state 是一帧一帧的（snapshot），每一次渲染都有独立的 state，异步回调函数会捕获该函数创建时的那一次渲染的 state 值（闭包陷阱，Stale Closure 过期的闭包）
- 调用 setState 会触发组件重新渲染，更新后的 state 值会在下一次渲染中生效
- setState 可以被批处理，一次渲染中合并多次更新
- setState 多次传入同一个 state 值，React 会进行优化，避免不必要的渲染

### useReducer

集中式状态管理，适合复杂的状态逻辑

```tsx
import { useReducer } from "react";

function App() {
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

### useImmer & useImmerReducer

`useImmer` 和 `useImmerReducer` 是 `immer` 库提供的 hook，用于简化不可变状态的更新，允许直接修改 state 的草稿（draft），底层会自动生成新的 state

::: code-group

```tsx [useImmer] {8-9}
import { useImmer } from "use-immer";
function App() {
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

function App() {
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

### useEffect

```tsx
useEffect(
  effect, // effect 副作用函数，返回一个 destructor 清理函数
  deps, // deps 依赖项数组
);
```

执行时机：

- 如果传入的 deps 是非空数组
  > - 组件挂载后，执行 effect 副作用函数（类比 Vue 的 onMounted），此时可以获取到 DOM 元素
  > - 依赖项改变时，先执行 destructor 清理函数，再执行 effect 副作用函数
  > - 组件卸载后，执行 destructor 清理函数（类比 Vue 的 onUnmounted），此时获取不到 DOM 元素
- 如果不传入 deps，即 deps 为 undefined，则组件挂载，每次更新后，都会执行 effect 副作用函数（类比 Vue 的 onUpdated）
- 如果传入的 deps 是 [] 空数组，则 effect 副作用函数只会在组件挂载后执行一次（类比 Vue 的 onMounted）
- effect 副作用函数和 destructor 清理函数都是异步执行的，destructor 清理函数在下一次 effect 副作用函数执行前或组件卸载时执行
