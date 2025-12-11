import DefaultTheme from "vitepress/theme-without-fonts";
import "./custom.css";
import MyLayout from "./Layout.vue";
import { h } from "vue";

export default {
  extends: DefaultTheme,
  // 使用注入插槽的包装组件覆盖 Layout
  Layout() {
    return h(() => h(MyLayout));
  },
};
