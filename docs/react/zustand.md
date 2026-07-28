# Zustand

## 使用 Zustand

`pnpm install zustand`

::: code-group

```tsx [src/stores/count.ts]
import { create } from "zustand";

interface ICountStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  getCount: () => number;
}

const useCountStore = create<ICountStore>((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  getCount: () => get().count,
}));

export default useCountStore;
```

```tsx [src/App.tsx]
import useCountStore from "./stores/count";

function App() {
  /* 状态切片 */
  const increment = useCountStore((state) => state.increment);
  const decrement = useCountStore((state) => state.decrement);
  const reset = useCountStore((state) => state.reset);
  const count = useCountStore((state) => state.count);
  /* 解构 */
  // const { increment, decrement, reset, count } = useCountStore();
  const getCount = useCountStore((state) => state.getCount);
  return (
    <>
      cnt: {count} {getCount()}
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>reset</button>
    </>
  );
}

export default App;
```

:::

## 深层次状态

### immer

```tsx [src/stores/group.ts]
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface IGroup {
  user: {
    name: string;
    age: number;
  };
  changeAge: () => void;
}

const useGroupStore = create<IGroup>()(
  immer((set) => ({
    user: {
      name: "Rico",
      age: 25,
    },
    changeAge: () => {
      set((state) => {
        state.user.age = 30;
      });
    },
  })),
);

/* 不使用 immer */
// const useGroupStore = create<IGroup>((set) => ({
//   user: {
//     name: "Rico",
//     age: 25,
//   },
//   changeAge: () => {
//     set((state) => ({
//       user: {
//         ...state.user,
//         age: 30,
//       },
//     }));
//   },
// }));

export default useGroupStore;
```

### Immer 原理

Immer 使用 Proxy 记录对 draft 的修改，通过 copy-on-write 生成新对象，并让未变化的分支继续共享原引用

```js
const obj = {
  user: {
    name: "Rico",
    age: 25,
  },
};

// import { produce } from "immer";

const produce = (obj, fn) => {
  const modifyObj = {};
  const handler = {
    get(target, prop) {
      if (prop in modifyObj) {
        return modifyObj[prop];
      }
      if (typeof target[prop] === "object" && target[prop] !== null) {
        return new Proxy(target[prop], handler);
      }
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      return Reflect.set(modifyObj, prop, value);
    },
  };
  const proxyObj = new Proxy(obj, handler);
  fn(proxyObj);
  if (Object.keys(modifyObj).length === 0) {
    return obj;
  }

  return JSON.parse(JSON.stringify(proxyObj));
};

const newObj = produce(obj, (draft) => {
  draft.user.age = 30;
});

console.log(newObj); // { user: { name: "Rico", age: 30 } }
console.log(newObj.user === obj.user); // false，变化分支生成新引用
```

## useShallow

使用解构时，组件会订阅整个状态对象的变化，而不仅仅是解构的部分，导致组件在状态对象的任何部分发生变化时重新渲染；状态切片不会重复渲染但是代码冗余。使用 `useShallow` 可以避免不必要的渲染同时保持解构的便利性

```tsx
import { useShallow } from "zustand/shallow";
import useCountStore from "./stores/count";

function App() {
  const { count, increment, decrement, reset, getCount } = useCountStore(
    useShallow((state) => ({
      count: state.count,
      increment: state.increment,
      decrement: state.decrement,
      reset: state.reset,
      getCount: state.getCount,
    })),
  );
  return (
    <>
      cnt: {count} {getCount()}
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>reset</button>
    </>
  );
}

export default App;
```

## 中间件

::: code-group

```tsx [src/stores/profile.ts(devtools)]
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";

interface IProfile {
  name: string;
  age: number;
  hobbies: string[];
  addHobby: (newHobby: string) => void;
}

const useProfileStore = create<IProfile>()(
  immer(
    devtools(
      (set) => ({
        name: "Rico",
        age: 18,
        hobbies: ["swimming", "reading"],

        addHobby: (newHobby: string) => {
          set((state) => {
            state.hobbies.push(newHobby);
          });
        },
      }),
      {
        name: "profile",
        enabled: true,
      }, // optional
    ),
  ),
);

export default useProfileStore;
```

```tsx [src/stores/profile.ts(persist)]
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, persist } from "zustand/middleware";

interface IProfile {
  name: string;
  age: number;
  hobbies: string[];
  addHobby: (newHobby: string) => void;
}

const useProfileStore = create<IProfile>()(
  immer(
    persist(
      (set) => ({
        name: "Rico",
        age: 18,
        hobbies: ["swimming", "reading"],

        addHobby: (newHobby: string) => {
          set((state) => {
            state.hobbies.push(newHobby);
          });
        },
      }),
      {
        // localStorage 的 key
        name: "profile",
        storage: createJSONStorage(() => localStorage),
        // 持久化部分状态
        partialize: (state) => ({
          hobbies: state.hobbies,
        }),
      },
    ),
  ),
);

export default useProfileStore;
```

```tsx [src/App.tsx]
import useProfileStore from "./stores/profile";

function App() {
  const { name, age, hobbies, addHobby } = useProfileStore();
  const clearProfileLocalStorage = useProfileStore.persist.clearStorage;
  return (
    <>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      <p>Hobbies: {hobbies.join(", ")}</p>
      <button onClick={() => addHobby("coding")}>Add Hobby</button>
      <button onClick={clearProfileLocalStorage}>Clear Local Storage</button>
    </>
  );
}

export default App;
```

:::

### 自定义中间件

```tsx
export const logger = (fn) => (set, get, storeApi) => {
  const decoratedSet = (...args) => {
    console.log("[set] before", get());
    set(...args);
    console.log("[set] after", get());
  };
  return fn(decoratedSet, get, storeApi);
};
```

## subscribe

subscribe 订阅：state 的任意属性改变时，都会触发 listener 的调用

- 组件外部订阅
- 组件内部订阅：需要写在 `useEffect` 中，并且依赖项数组 `deps` 是 `[]` 空数组，只会在组件挂载后订阅一次，防止重复订阅

::: code-group

```tsx [src/stores/profile.ts]
import { create } from "zustand";

interface IProfile {
  name: string;
  age: number;
  incrementAge: () => void;
  decrementAge: () => void;
  changeName: () => void;
}

const useProfileStore = create<IProfile>((set) => ({
  name: "Rico",
  age: 12,
  incrementAge: () => set((state) => ({ age: state.age + 1 })),
  decrementAge: () => set((state) => ({ age: state.age - 1 })),
  changeName: () => set((state) => ({ name: state.name + "!" })),
}));

export default useProfileStore;
```

```tsx [src/App.tsx(未订阅)]
import useProfileStore from "./stores/profile";

function IsTeenager() {
  const age = useProfileStore((state) => state.age);
  // 组件在 age 变化时会重新渲染
  console.log("render...");
  return <>{age >= 13 && age <= 19 ? "Teenager" : "Not a teenager"}</>;
}

function Profile() {
  const { name, age, incrementAge, decrementAge } = useProfileStore();
  return (
    <>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      <button onClick={incrementAge}>Increment Age</button>
      <button onClick={decrementAge}>Decrement Age</button>
    </>
  );
}

function App() {
  return (
    <>
      <Profile />
      <IsTeenager />
    </>
  );
}

export default App;
```

```tsx [src/App.tsx(订阅)]
import { useEffect, useState } from "react";
import useProfileStore from "./stores/profile";

function IsTeenager() {
  // 组件仅在 isTeenager 变化时重新渲染
  console.log("render...");
  const [isTeenager, setIsTeenager] = useState(() => {
    const age = useProfileStore.getState().age;
    return age >= 13 && age <= 19;
  });

  useEffect(() => {
    const cleanup = useProfileStore.subscribe((state) => {
      // 订阅回调在 state 变化时被调用
      console.log("listening...");
      setIsTeenager(state.age >= 13 && state.age <= 19);
    });
    return cleanup;
  }, []);
  return <>{isTeenager ? "Teenager" : "Not a teenager"}</>;
}

function Profile() {
  const { name, age, incrementAge, decrementAge, changeName } =
    useProfileStore();
  return (
    <>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      <button onClick={incrementAge}>Increment Age</button>
      <button onClick={decrementAge}>Decrement Age</button>
      <button onClick={changeName}>Change Name</button>
    </>
  );
}
function App() {
  return (
    <>
      <Profile />
      <IsTeenager />
    </>
  );
}

export default App;
```

:::

### subscribeWithSelector

state 的指定属性改变时，才会触发 listener 的调用

::: code-group

```tsx [src/stores/profile.ts]
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface IProfile {
  name: string;
  age: number;
  incrementAge: () => void;
  decrementAge: () => void;
  changeName: () => void;
}

const useProfileStore = create<IProfile>()(
  subscribeWithSelector((set) => ({
    name: "Rico",
    age: 12,
    incrementAge: () => set((state) => ({ age: state.age + 1 })),
    decrementAge: () => set((state) => ({ age: state.age - 1 })),
    changeName: () => set((state) => ({ name: state.name + "!" })),
  })),
);

export default useProfileStore;
```

```tsx [src/App.tsx]
import { useEffect, useState } from "react";
import useProfileStore from "./stores/profile";

function IsTeenager() {
  console.log("render...");
  const [isTeenager, setIsTeenager] = useState(true);

  useEffect(() => {
    const cleanup = useProfileStore.subscribe(
      (state) => state.age,
      (age, prevAge) => {
        // 仅 state 的 age 属性改变时，才会触发 listener 的调用
        console.log("listening...", age, prevAge);
        setIsTeenager(age >= 13 && age <= 19);
      },
      {
        equalityFn: (a, b) => a === b,
        fireImmediately: true, // 是否立即调用 listener
      },
    );
    return cleanup;
  }, []);

  return <>{isTeenager ? "Teenager" : "Not a teenager"}</>;
}

function Profile() {
  const { name, age, incrementAge, decrementAge, changeName } =
    useProfileStore();
  return (
    <>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      <button onClick={incrementAge}>Increment Age</button>
      <button onClick={decrementAge}>Decrement Age</button>
      <button onClick={changeName}>Change Name</button>
    </>
  );
}
function App() {
  return (
    <>
      <Profile />
      <IsTeenager />
    </>
  );
}

export default App;
```

:::
