# Vue2

## 创建 Vue2 项目

### 脚手架

```bash
# vue-cli
pnpm install -g @vue/cli
vue create vue2-demo # choose 2.x
```

`main.js` 入口文件

```js
import Vue from "vue";
import App from "./App";

// 关闭生产提示
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");

// 或
// new Vue({
//   el: "#app",
//   render: (h) => h(App),
// });
```

> 运行版 Vue 只包含核心功能，不包含模板解析器，所以不能使用 `template` 配置项，需要使用 `render` 函数收到的 `createElement` 函数去解析具体内容

### 配置文件

`vue inspect > output.js` 查看 webpack 配置，编写 `vue.config.js` 覆盖配置

## 响应式原理

### Object.defineProperty (Vue2)

Object.defineProperty 是 JS 中用于精确控制对象属性行为的 API，允许直接在对象上定义新属性，或修改现有属性的配置（如是否可枚举、可修改、可删除等）

`Object.defineProperty(obj /* 对象 */, prop /* 属性 */, descriptor /* 描述符 */);`

- 数据描述符：`value`，`writable`，`enumerable`，`configurable`
- 访问器描述符：`get`，`set`，`enumerable`，`configurable`

```js
const obj = { _age: 18 }; // 下划线**约定**为私有属性

Object.defineProperty(obj, "age", {
  get() {
    console.log("读取 age 属性");
    return this._age; // 读取时返回 _age 的值
  },
  set(newValue) {
    console.log("修改 age 属性");
    if (newValue < 0 || newValue > 120) {
      throw new Error("年龄必须在 0-120 之间");
    }
    this._age = newValue; // 校验通过后修改 _age
  },
  enumerable: true,
  configurable: true,
});
```

> - Vue2 通过 `Object.defineProperty` 将 data 对象中所有属性添加到 vm 上，为每一个添加到 vm 上的属性都指定一个 `getter/setter`，在 `getter/setter` 内部去操作（读/写）data 中对应的属性
> - 新增属性，删除属性，直接通过下标修改数组, 界面不会自动更新（可以使用 `Vue.set()`，`$set()`，`Vue.delete()`，`$delete()`）

### Proxy (Vue3)

Proxy 是 ES6 引入的对象代理 API，用于创建一个对象的代理副本，从而拦截并自定义对象的底层操作（如属性访问、赋值、删除、函数调用等）

`const proxy = new Proxy(target /* 对象 */, handler /* 处理器对象 */);`

```ts
export const myReactive = <T extends object>(target: T) => {
  return new Proxy(target, {
    get(target, key, receiver) {
      let res = Reflect.get(target, key, receiver);
      return res;
    },
    set(target, key, value, receiver) {
      let res = Reflect.set(target, key, value, receiver);
      return res;
    },
  });
};
```

> - `Object.defineProperty` 只能劫持对象的单个属性，且无法监听数组的原生方法（如 `push`、`splice`）；而 `Proxy` 可以劫持整个对象，支持数组监听、新增属性监听等，是更强大的响应式方案
> - Vue3 通过 `Proxy` 拦截对象中任意属性的变化，通过 `Reflect` 对源对象的属性进行操作，`Reflect` 所有方法与 Proxy 的陷阱函数一一对应，支持传递 `receiver`，保证 `this` 指向代理对象
