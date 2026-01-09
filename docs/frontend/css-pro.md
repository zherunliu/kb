# CSS Pro

## transform

## transition

## animation

## 布局

### flex

### grid

### 多列布局

- column-count 列数
- column-width 列宽
- columns 复合属性：`columns: 3 200px`
- column-gap 列间隔
- column-rule-style 列分隔线样式：none，solid，dashed，dotted，double
- column-rule-width 列分隔线宽度
- column-rule-color 列分隔线颜色
- column-rule 复合属性：`column-rule: solid 1rem green`
- column-span 跨列：`column-span: all` 跨越所有列，`column-span: none` 不跨列

## 媒体查询

媒体类型：all（所有设备），print（打印机），screen（屏幕）

媒体特性：width，height，max-width，max-height，orientation（portrait/landscape）

::: code-group

```css [写法 1]
/* 超小屏幕 */
@media screen and (max-width: 768px) {
}
/* 中等屏幕 */
@media screen and (min-width: 768px) and (max-width: 992px) {
}
/* 大屏幕 */
@media screen and (min-width: 992px) and (max-width: 1200px) {
}
/* 超大屏幕 */
@media screen and (min-width: 1200px) {
}
```

```html [写法 2]
<!-- 超小屏幕 -->
<link rel="stylesheet" media="screen and (max-width: 768px)" href="#" />
<!-- 中等屏幕 -->
<link
  rel="stylesheet"
  media="screen and (min-width: 768px) and (max-width: 992px)"
  href="#"
/>
<!-- 大屏幕 -->
<link
  rel="stylesheet"
  media="screen and (min-width: 992px) and (max-width: 1200px)"
  href="#"
/>
<!-- 超大屏幕 -->
<link rel="stylesheet" media="screen and (min-width: 1200px)" href="#" />
```

:::
