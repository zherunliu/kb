# CSS Basic

## 选择器

### 基本选择器

- 通配符选择器 `*`
- 元素选择器 `h1`
- 类选择器 `.className`
- ID 选择器 `#id`

### 复合选择器

- 交集选择器 `selector1selector2...`
- 并集选择器 `selector1, selector2, ...`
- 后代选择器 `selector1 selector2 ...`
- 子代选择器 `selector1 > selector2 > ...`
- 兄弟选择器
  - 相邻兄弟选择器 `selector1 + selector2`
  - 通用兄弟选择器 `selector1 ~ selector2`
- 属性选择器
  - `selector[attr]` 选择有 `attr` 属性的元素
  - `selector[attr="val"]` 选择 `attr="val"` 的元素
  - `selector[attr^="val"]` 选择 `attr` 以 `val` 开头的元素
  - `selector[attr$="val"]` 选择 `attr` 以 `val` 结尾的元素
  - `selector[attr*~*="val"]` 选择 `attr` 包含 `val` 的元素
- 伪类选择器（选择元素的特殊状态/位置）

  - `:hover` 鼠标悬浮时选择元素
  - `:active` 鼠标按下时选择元素
  - `:focus` 获得焦点时选择元素（表单类元素）
  - `:first-child` 所有兄弟元素中的第一个
    > `div > p:first-child` 选择 `div` 的第一个为 `p` 的子元素
  - `:last-child` 所有兄弟元素中的最后一个
  - `:nth-child(n)` 所有兄弟元素中的第 n 个
  - `:nth-last-child(n)` 所有兄弟元素中的倒数第 n 个
  - `:only-child` 没有兄弟的元素
  - `:first-of-type` 所有**同类型**的兄弟元素中的第一个
  - `:last-of-type` 所有**同类型**的兄弟元素中的最后一个
  - `:nth-of-type(n)` 所有**同类型**的兄弟元素中的第 n 个
  - `:only-of-type` 没有**同类型**兄弟的元素
  - `:empty` 没有内容的元素
  - `:not(condition)` 选择不满足 condition 的元素
    > `div > p:not(.exclude)` 选择 `div` 子代中不包含有 `.exclude` 类名的 `p` 元素
    >
    > `div > p:not(:first-child)` 选择 `div` 子代中除第一个 `p` 元素的后续子代
  - `:checked` 选择被选中的单选框或复选框
  - `:enabled` 选择可用的表单元素（没有 disabled）
  - `:disabled` 选择禁用的表单元素 （有 disabled）
    > **关于 n**
    >
    > - 0 或空：不选择任何子元素
    > - n：选择所有子元素
    > - 2n, even：选择序号为偶数的子元素
    > - 2n+1, odd：选择序号为奇数的子元素
    > - -n+3：选择前 3 个子元素
    > - a*n+b：选择序号为 `a*0+b, a*1+b, a*2+b, ...` 的子元素

- 伪元素选择器（创建虚拟元素/选择元素的部分内容）
  - `::first-letter` 选择元素中的第一个字母
  - `::first-line` 选择元素中的第一行
  - `::selection` 选择被选中的内容
  - `::placeholder` 选择输入框的提示文字
  - `::before` 在元素前创建一个子元素，必须使用 content 属性指定内容
  - `::after` 在元素后创建一个子元素，必须使用 content 属性指定内容

### 选择器优先级

`!important` > 内联样式 > ID 选择器 > 类选择器 > 元素选择器 > `*` 通配符选择器 > 继承的样式

**权重计算 (a, b, c)**

- a：ID 选择器的个数
- b：类，伪类，属性选择器的个数
- c：元素，伪元素选择器的个数

## 属性

### 字体

- font-size 字体大小
- font-family 字体族
- font-style 字体样式：normal，italic，oblique（强制倾斜）
- font-weight 字体粗细：lighter，normal，bold，bolder,（100-1000）
- `@font-face` web 字体, 浏览器自动下载

```css
@font-face {
  font-family: "Maple Mono";
  src: url("./src/assets/MapleMono.woff2") format("woff2");
}
```

### 文本

- color 文本颜色
- letter-spacing 字母间距：默认 0，正值增大间距，负值减小间距
- word-spacing 单词间距：默认 0，正值增大间距，负值减小间距
- text-decoration-line 文本装饰：line style color
- text-indent 文本首字母缩进：属性值是长度单位
- text-align 文本水平对齐：left 左对齐（默认），center 居中对齐，right 右对齐
- line-height 行高（像素，font-size 倍数/百分比）
- vertical-align 文本垂直对齐：baseline 基线对齐（默认），top 顶部对齐，middle 中间对齐，bottom 底部对齐
- text-shadow：offset-h offset-v blur color
- -webkit-text-stroke 文本描边
- text-overflow 文本溢出：clip 裁剪溢出部分；ellipsis 省略溢出部分，将溢出部分替换为 ...；text-overflow 有效的前提是：块级元素显式设置 overflow 为 hidden，scroll，auto（非 visible），white-space 为 nowrap
- white-space 文本换行
  | white-space 文本换行 | 代码中的换行符 | 连续的空白符 | 遇到元素边界时 |
  | ---------------------- | -------------- | ------------ | -------------- |
  | normal | 视为空白符 | 合并 | 换行 |
  | nowrap | 视为空白符 | 合并 | 不换行 |
  | pre | 保留 | 不合并 | 不换行 |
  | pre-wrap, break-spaces | 保留 | 不合并 | 换行 |
  | pre-line | 保留 | 合并 | 换行 |

```css
/* 单行文本截断 */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 多行文本截断 */
.multiline-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box; /* 将元素转为弹性盒模型（webkit 私有） */
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}
```
