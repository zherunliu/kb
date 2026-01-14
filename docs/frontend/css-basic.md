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
- font 复合属性
  > `font: italic bold 16px/2 Arial, sans-serif`

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
- text-decoration 文本装饰：line style color
- text-indent 文本首字母缩进：属性值是长度单位
- text-align 文本水平对齐：left 左对齐（默认），center 居中对齐，right 右对齐
- line-height 行高：像素，font-size 倍数/百分比
- vertical-align 文本垂直对齐：baseline 基线对齐（默认），top 顶部对齐，middle 中间对齐，bottom 底部对齐
- text-shadow 文本阴影：offset-h offset-v blur color
- -webkit-text-stroke 文本描边
- text-overflow 文本溢出：clip，ellipsis
  > text-overflow 有效的前提是：块级元素显式设置 overflow 为 hidden，scroll，auto（非 visible），white-space 为 nowrap
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

### 列表

- list-style-type 列表符号：none，square，disc，decimal，lower-roman，upper-roman，lower-alpha，upper-alpha
- list-style-position 列表符号的位置：inside 在 li 内部，outside 在 li 外部
- list-style-image 列表符号的图片：url（图片路径）
- list-style 复合属性
  > `list-style: square inside url("./assets/list-icon.png")`

### 表格

- table-layout 列宽度：auto，fixed
- border-spacing 单元格间距
- border-collapse 单元格边框合并：collapse 合并，separate 不合并
- empty-cells 隐藏没有内容的单元格：show 显示（默认），hide 隐藏
- caption-side 表格标题的位置：top 表格顶部，bottom 表格底部

### 边框

border

- border-width 边框宽度
- border-color 边框颜色
- border-style 边框样式：none，solid，dashed，dotted，double
- border-radius 边框圆角
- border 复合属性
  > `border: solid 2px red`

outline

- outline-width 外轮廓宽度
- outline-color 外轮廓颜色
- outline-style 外轮廓样式：none，solid，dashed，dotted，double
- outline-offset 外轮廓与边框的距离
- outline 复合属性
  > `outline: solid 2px red`

::: tip 边框 vs 外轮廓

border 是 CSS 盒模型的核心组成部分，会占用元素的实际布局空间

outline 是绘制在元素盒模型之外的线条，不占用任何布局空间，也不会影响元素的尺寸或周围元素的位置
:::

### 背景

- background-color 背景颜色：默认 transparent
- background-image 背景图片：url（图片路径）
- background-repeat 背景图片的重复方式：repeat（默认），repeat-x，repeat-y，no-repeat
- background-position 背景图片的位置：位置关键字或以元素左上角为坐标原点，背景图片左上角的 x，y 坐标
- background-origin 背景图片的坐标原点
  > - padding-box 从 padding 左上角开始显示背景图片（默认）
  > - border-box 从 border 左上角开始显示背景图片
  > - content-box 从 content 左上角开始显示背景图片
- background-clip 背景图片的裁剪方式
  > - border-box 从 padding 左上角开始裁剪背景图片（默认）
  > - padding-box 从 border 左上角开始裁剪背景图片
  > - content-box 从 content 左上角开始裁剪背景图片
  > - text 背景只呈现在文字上（webkit 私有）
- background-size 背景图片的大小
  > - 长度或百分比
  > - auto 背景图片的实际大小（默认）
  > - contain 背景图片等比例缩放，元素的部分区域可能没有背景
  > - cover 背景图片等比例缩放，背景图片可能显示不完整

```css
.selector {
  /* 复合属性：背景颜色 url 是否重复 位置 / 大小 坐标原点 裁剪方式 */
  background: green url("./assets/bg.png") no-repeat 1rem 1rem / 40rem 30rem
    border-box content-box;
}
```

**渐变**

- `background-image: linear-gradient()` 线性渐变
- `background-image: repeat-linear-gradient()` 重复线性渐变
- `background-image: radial-gradient()` 径向渐变
- `background-image: repeat-radial-gradient()` 重复径向渐变

```css
.selector {
  width: 30rem;
  height: 20rem;
  /* 渐变线的方向: 默认 to bottom (180deg) */
  background-image: linear-gradient(red, green, blue);

  /* to top (0deg), 增加角度值, 顺时针 */
  background-image: linear-gradient(to top, red, green, blue);
  background-image: linear-gradient(180deg, red, green, blue);

  /* 设置渐变的位置 */
  /**
   * 0 ~ 5rem        pure red
   * 5rem ~ 10rem    red -> green
   * 10rem ~ 15rem   green -> blue
   * 15rem ~ 20rem   pure blue
   */
  background-image: linear-gradient(red 5rem, green 10rem, blue 15rem);

  /* 渐变中心的位置: 默认 at center (at 50% 50%) */
  background-image: radial-gradient(red, green, blue);

  /* 渐变形状: circle 圆, ellipse 椭圆 */
  background-image: radial-gradient(circle, red, green, blue);

  /* at left top (at 0 0) */
  background-image: radial-gradient(at left top, red, green, blue);
  background-image: radial-gradient(at 50% 50%, red, green, blue);

  /* 设置渐变圆的半径 */
  background-image: radial-gradient(10rem, red, green, blue);
  /* 设置渐变椭圆的 x 半径, y 半径 */
  background-image: radial-gradient(20rem 10rem, red, green, blue);

  /* 设置渐变的位置 */
  background-image: radial-gradient(red 5rem, green 10rem, blue 15rem);
}
```

### 鼠标

cursor：鼠标指针样式：pointer，move，text，crosshair，wait，help，url（图片路径）

## 盒模型

盒子宽度 = content 宽度 + 2\*padding + 2\*border

默认盒子宽度 = 父元素 content 宽度 - 2\*margin

`box-sizing: content-box`：width 和 height 设置盒子内容区的大小

`box-sizing: border-box`：width 和 height 设置盒子总大小（怪异盒模型）

### 长度单位

- px 像素
- em 相对自身 font-size 的倍数（属性为 font-size 则相对包含块的 font-size）
- rem 相对根元素（html）font-size 的倍数
- % 相对父元素 font-size 的倍数
- vw：viewport width，1vw = 视口宽度的 1%
- vh：viewport height，1vh = 视口高度的 1%
- vmax：vmax = Math.max(vw，vh)
- vmin：vmin = Math.min(vw，vh)

### 元素的显示模式（display）

行内，行内块元素，可以视为文本，即可以设置文本属性

**块级元素（block）**

- 块级盒子独占一行
- 宽度撑满父元素
- 高度由内容撑开
- 可以使用 CSS 设置宽高
  > 默认块级元素有：`html, body, div, h1-h6, p, hr, ul, ol, li, dl, dt, dd, table, tbody, thead, tfoot, tr, caption, form, option`

**行内元素（inline）**

- 行内盒子不独占一行，溢出时换行
- 宽度由内容撑开
- 高度由内容撑开
- 不能使用 CSS 设置宽高
  > 默认行内元素有：`span, a, b, i, u, strong, em, br, label`

**行内块元素（inline-block）**

- 行内块盒子不独占一行，溢出时换行
- 宽度由内容撑开
- 高度由内容撑开
- 可以使用 CSS 设置宽高
  > 默认行内块元素有：`img, td, th, input, textarea, button, select, iframe`

### 隐藏元素

| 隐藏方式             | 是否占据空间 | 是否响应事件 | 回流/重绘 |
| -------------------- | ------------ | ------------ | --------- |
| `display: none`      | 否           | 否           | 回流      |
| `visibility: hidden` | 是           | 否           | 重绘      |
| `opacity: 0`         | 是           | 是           | 重绘      |

### 样式继承

只继承与盒子模型无关的属性

- 继承的属性：字体属性，文本属性（除了 vertical-align）
- 不继承的属性：宽高，内外边距，边框，背景，溢出处理

### margin 塌陷

- 顶部子元素的上外边距 margin-top 会转移给父元素
- 底部子元素的下外边距 margin-bottom 会转移给父元素
- 上方元素的下外边距 marginBottom 和下方元素的上外边距 marginTop 合并为 `Math.max(marginBottom, marginTop)`，而不是预期的 marginBottom + marginTop

**解决方法：**

- 父元素设置宽度不为 0 的 padding
- 父元素设置宽度不为 0 的 border
- 父元素成为 BFC，例如设置 `overflow: hidden` 或 `display: flow-root`

### BFC

BFC（Block Formatting Context，块级格式化上下文）是一个独立的渲染区域，元素在 BFC 中布局不会影响到外部元素

**开启 BFC 的元素：**

- 根元素 html
- 浮动元素，float 属性值不等于 none 的元素 `float: left | right`
- absolute 绝对或 fixed 固定定位的元素 `position: absolute | fixed`
- 非 block 的块级容器 `display: inline | flex | inline-flex | grid | inline-grid | flow-root` 的元素
- overflow 属性值不等于 visible 的元素 `overflow: hidden | auto | scroll`
- 表格单元格：table，thead，tbody，tfoot，tr，th，td，caption, `display: table-cell | table-caption`
- 多列容器

**开启 BFC 后：**

- 该元素的子元素不会有 margin 塌陷问题
- 该元素不会被其他浮动元素覆盖
- 即使该元素的子元素浮动，该元素的高度也不会塌陷

## 浮动

**元素浮动后：**

- 成为 BFC，没有 margin 塌陷问题
- 脱离文档流
- 不独占一行
- 宽高由内容撑开，也可以设置宽高

**产生的影响：**

- 对兄弟元素的影响：后面的兄弟元素，会占据浮动元素未浮动时的位置
- 对父元素的影响
  - 浮动元素不能撑开父元素的高度，父元素高度塌陷
  - 父元素的宽度仍然限制浮动元素的宽度

**清除浮动：**

- 父元素设置浮动，会产生其他影响
- 父元素成为 BFC，设置 `overflow: hidden` 或 `display: flex-root`
- 所有浮动元素后面，添加一个空的块级元素，并设置 `clear: both`
- 父元素使用 `::after` 创建空的伪元素

```css
.parent::after {
  content: "";
  display: block;
  clear: both;
}
```

## 定位

- static 静态定位（默认）
- relative 相对定位：参考元素本身，脱离文档流，成为定位元素，BFC
- absolute 绝对定位：参考最近的已定位祖先元素（非 static）
- fixed 固定定位：参考视口，脱离文档流，成为定位元素，BFC
- sticky 粘性定位：参考最近的已定位祖先元素（非 static）

**定位元素在包含块的中间**

::: code-group

```css [方法 1]
.container {
  width: 30rem;
  height: 30rem;
  position: relative;

  .element {
    width: 10rem;
    height: 10rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
```

```css [方法 2]
.container {
  width: 30rem;
  height: 30rem;
  position: relative;

  .element {
    width: 10rem;
    height: 10rem;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -5rem; /* 10rem / 2 */
    margin-top: -5rem; /* 10rem / 2 */
  }
}
```

```css [方法 3]
.container {
  width: 30rem;
  height: 30rem;
  position: relative;

  .element {
    width: 10rem;
    height: 10rem;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
  }
}
```

:::

### 显示层级

- 定位元素的显示层级比普通元素高
- 只有定位的元素设置 z-index 才有效
- z-index 属性值越大，显示层级越高
- 如果位置发生重叠，默认情况是：后面的元素，会显示在前面元素之上
