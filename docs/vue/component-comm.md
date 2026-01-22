# Component Communication

## props

`props` 是使用频率最高的一种通信方式，子组件中使用宏函数 `defineProps` 定义自定义属性，常用与：**父 <=> 子**

- 父传子：属性值是非函数
- 子传父：属性值是函数（作为父传子函数的参数）

::: tip 宏函数

- 宏函数只能在 setup 代码块中使用
- 宏函数不需要显式导入
- 宏函数 defineProps 编译 (Vue -> JS) 时执行，编译为组件的 props

:::

::: code-group

```vue [Parent.vue]
<script lang="ts" setup>
import { ref, reactive } from "vue";
import Child from "./components/Child.vue";

const str_ = "str_parent";
const refStr_ = ref("refStr_parent");
const reactiveArr_ = reactive([6, 6, 6]);
</script>

<template>
  <div>Parent: {{ str_ }} {{ refStr_ }} {{ reactiveArr_ }}</div>
  <Child :str="str_" :refStr="refStr_" :reactiveArr="reactiveArr_" />
  <!-- str_ 不是响应式的, refStr_, reactiveArr_ 是响应式的 -->
  <button @click="str_ += '!'">setStr</button>
  <button @click="refStr_ += '!'">setRefStr</button>
  <button @click="reactiveArr_.push(6)">setReactiveArr</button>
</template>
```

```vue [Child.vue(1)]
<script lang="ts" setup>
const props = defineProps(["str", "refStr", "reactiveArr"]);
// {str: 'str_parent', refStr: 'refStr_parent', reactiveArr: Proxy(Array)}
console.log("[Child] props:", props);
</script>

<template>
  <!-- template 中, 使用 props.propName 或直接使用 propName 都可以 -->
  <div>Child: {{ str }} {{ props.refStr }} {{ reactiveArr }}</div>
</template>
```

```ts [(1+default)]
const props = defineProps({
  str: {
    type: String,
    default: "str_default",
  },
  refStr: {
    type: String,
    default: "refStr_default",
  },
  reactiveArr: {
    type: Array<number>,
    default: () => [5, 2, 8], // 引用类型必须转换为箭头函数
  },
});
```

```vue [Child.vue(2)*]
<script lang="ts" setup>
const props = defineProps<{
  str?: string;
  refStr?: string;
  reactiveArr?: number[];
}>();
console.log("[Child] props:", props);
</script>

<template>
  <div>Child: {{ str }} {{ props.refStr }} {{ reactiveArr }}</div>
</template>
```

```ts [(2+default)]
const props = withDefaults(
  defineProps<{
    str?: string;
    refStr?: string;
    reactiveArr?: number[];
  }>(),
  {
    str: "str_default",
    refStr: "refStr_default",
    reactiveArr: () => [5, 2, 8], // 引用类型必须转换为箭头函数
  },
);
```

:::

## defineEmits ($emit)

自定义事件常用于：**子 => 父**

::: code-group

```vue [Child.vue]
<script lang="ts" setup>
// 子组件使用 defineEmits 定义自定义事件

// 写法一
// const emit = defineEmits(["evName", "evName2"]);

// 写法二，规定参数类型
// const emit = defineEmits<{
//   (e: "evName", arg: Event): void;
//   (e: "evName2", arg: string, arg2: string): void;
// }>();

// 写法三，具名元组
const emit = defineEmits<{
  evName: [arg: Event];
  evName2: [arg: string, arg2: string];
}>();

const emitToParent = (ev: Event) => {
  // 子组件派发自定义事件, emit 发射参数给父组件
  emit("evName", ev);
};
const emitToParent2 = () => {
  emit("evName2", "foo", "bar");
};
</script>

<template>
  <button @click="(ev) => emitToParent(ev)">emitToParent</button>
  <button @click="emitToParent2">emitToParent2</button>
</template>
```

```vue [Parent.vue]
<script setup lang="ts">
import Child from "./components/Child.vue";

// 自定义事件派发时, 父组件接收子组件发射的数据, 作为回调函数的参数
const receiveFromChild = (...args: unknown[]) => console.log(args);
</script>

<template>
  <!-- 父组件为子组件的自定义事件绑定回调函数, 监听子组件派发的自定义事件 -->
  <Child
    @evName="(...args: unknown[]) => receiveFromChild(args)"
    @evName2="receiveFromChild"
  />
</template>
```

:::

## mitt

与消息订阅与发布功能类似，可以实现任意组件间通信

```bash
pnpm i mitt
```

新建文件：`src/utils/emitter.ts` 作为事件总线

```ts
import mitt from "mitt";

const emitter = mitt();

/* 在通信组件内部绑定/触发事件

// 绑定事件
emitter.on("event1", (value) => {
  console.log("[event1]: ", value);
});
emitter.on("event1", (value) => {
  console.log("[event2]: ", value);
});

// 解绑事件
emitter.off("event1", () => {
  console.log("This will not be called");
});

setInterval(() => {
  // 触发事件
  emitter.emit("event1", "triggered");
  emitter.emit("event2", "triggered");
}, 1000);

setTimeout(() => {
  // 清理事件
  emitter.all.clear();
}, 3000);

*/

export default emitter;
```

## v-model

`v-model` 可以实现组件的双向绑定，**父 <=> 子**

::: code-group

```vue [Parent.vue]
<template>
  <Child v-model="countModel" />
</template>
```

```vue [Child.vue]
<script setup>
// defineModel() 返回的值是一个 ref
const model = defineModel();

function update() {
  model.value++;
}
</script>

<template>
  <div>Parent bound v-model is: {{ model }}</div>
  <button @click="update">Increment</button>
</template>
```

:::

### 底层机制

`defineModel` 是一个便利宏。编译器将其展开为以下内容：

- 一个名为 `modelValue` 的 prop，本地 ref 的值与其同步
- 一个名为 `update:modelValue` 的事件，当本地 ref 的值发生变更时触发

::: code-group

```vue [Parent.vue]
<template>
  <Child :modelValue="foo" @update:modelValue="($event) => (foo = $event)" />
</template>
```

```vue [Child.vue]
<script setup>
const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <input
    :value="props.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
```

:::

### v-model 修饰符

`.trim`，`.number`， `.lazy`，支持自定义修饰符 `v-model.customModifier`

::: code-group

```vue [Parent.vue]
<script setup lang="ts">
import Child from "./components/Child.vue";
import { ref } from "vue";

const myText = ref("");
</script>

<template>
  This input capitalizes the first letter you enter:
  <Child v-model:custom-input.capitalize="myText" />
</template>
```

```vue [Child.vue]
<script lang="ts" setup>
const [model, modifiers] = defineModel("customInput", {
  default: "",
  type: String, // 类型校验
  // 自定义校验函数（控制台警告）
  validator(value: string) {
    return value.length >= 10;
  },
  set(value) {
    if (modifiers.capitalize) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  },
});
</script>

<template>
  <input type="text" v-model="model" />
</template>
```

:::

## UseAttrs ($attrs)

`UseAttrs` 用于实现当前组件的父组件，向当前组件的子组件通信（**祖 => 孙**）

::: code-group

```vue [GrandParent.vue]
<script lang="ts" setup>
import { reactive, ref } from "vue";
import Parent from "./components/Parent.vue";

const a = ref(1);
const b = reactive({ value: 2 });
const addA = (delta: number) => (a.value += delta);
</script>

<template>
  <div>
    <div>[GrandParent] a={{ a }} b={{ b }}</div>
    <!-- v-bind="{ p1: "v1", p2: "v2" }" 等价于 :p1="v1" :p2="v2" -->
    <Parent :a="a" :b="b" :addA="addA" :="{ p1: 'v1', p2: 'v2' }" />
  </div>
</template>
```

```vue [Parent.vue]
<script lang="ts" setup>
import { useAttrs } from "vue";
import Child from "./Child.vue";

const props = defineProps(["a", "b", "addA"]);
// {a: 1, b: Proxy(Object), addA: ƒ}
console.log("[Parent] props:", props);

const attrs = useAttrs();
// {p1: 'v1', p2: 'v2'} 排除了 props 中的属性
console.log("[Parent] attrs:", attrs);
</script>

<template>
  <div>
    <div>[Parent] a={{ a }} b={{ b }} attrs={{ attrs }}</div>
    <Child :a="a" :b="b" :addA="addA" :="attrs" />
  </div>
</template>
```

```vue [Child.vue]
<script lang="ts" setup>
import { useAttrs } from "vue";

const props = defineProps(["p1", "p2"]);
// {p1: 'v1', p2: 'v2'}
console.log("[Child] props:", props);

const attrs = useAttrs();
// {a: 1, b: Proxy(Object)}
console.log("[Child] attrs:", attrs);
</script>

<template>
  <div>
    <p>[Child] p1={{ p1 }} p2={{ p2 }} attrs={{ attrs }}</p>
    <button @click="(attrs.addA as Function)(1)">Add grandparent's a</button>
  </div>
</template>
```

:::

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

// 使用 defineExpose 将组件中的数据交给外部
defineExpose({ name, age });
</script>
```

:::

### $refs/$parent

- `$refs`：值为对象，包含所有被 `ref` 属性标识的 `DOM` 元素或组件实例，**父 => 子**
- `$parent`：值为对象，当前组件的父组件实例对象，**子 => 父**

## provide/inject

实现祖孙组件直接通信，**祖先 => 后代**

- 在祖先组件中通过 `provide` 配置向所有后代组件提供数据
- 在后代组件中通过 `inject` 配置来声明接收数据

```ts
const colorVal = ref("lightpink");
// 祖先 provide 提供
provide("colorKey" /** key */, colorVal /** value */);

// 后代 inject 注入
const injectedColor = inject<Ref<string>>(
  "colorKey",
  ref("unknown-color") /** defaultVal */,
);
```

## slot

**子组件**提供给**父组件**的占位符，可以插入父组件的 template

::: code-group

```vue [Parent.vue]
<script lang="ts" setup>
import Child from "./components/Child.vue";
</script>

<template>
  <div>
    <Child>
      <template v-slot:default>
        <div>content for default slot</div>
      </template>

      <template v-slot:scoped="{ item, idx }">
        <ul>
          <li>{{ `Item ${idx}: Name: ${item.name}, Age: ${item.age}` }}</li>
        </ul>
      </template>

      <template #named>
        <div>content for named slot</div>
      </template>
    </Child>
  </div>
</template>
```

```vue [Child.vue]
<script lang="ts" setup>
import { reactive } from "vue";

const users = reactive([
  { name: "Alice", age: 1 },
  { name: "Bob", age: 2 },
  { name: "Charlie", age: 3 },
]);
</script>

<template>
  <div>
    <header>
      <!-- 匿名插槽 name="default" -->
      <slot>default: default slot content</slot>
    </header>

    <main>
      <div v-for="(item, idx) of users" :key="idx">
        <!-- 作用域插槽 -->
        <!-- 数据在组件的自身，但根据数据生成的结构需要组件的使用者来决定 -->
        <slot name="scoped" :item="item" :idx="idx"
          >default: scoped slot content</slot
        >
      </div>
    </main>

    <footer>
      <!-- 具名插槽 -->
      <slot name="named">default: named slot content</slot>
    </footer>
  </div>
</template>
```

:::
