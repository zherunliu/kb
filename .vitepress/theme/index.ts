import { withContentGuard } from "@kb/vitepress-content-guard";
import DefaultTheme from "vitepress/theme-without-fonts";
import "./custom.css";
import MyLayout from "./Layout.vue";
import { h } from "vue";

const theme = {
  extends: DefaultTheme,
  // 使用注入插槽的包装组件覆盖 Layout
  Layout() {
    return h(() => h(MyLayout));
  },
};

export default withContentGuard(theme, {
  defaultMode: "copyright",
  copyright: { owner: "zherunliu" },
});
