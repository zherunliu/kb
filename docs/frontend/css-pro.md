# CSS Pro

## transform

### 2D 变换

**位移**

- `transform: translateX(3rem)` 水平方向位移，指定长度值或参考本元素宽度的百分比值
- `transform: translateY(4rem)` 垂直方向位移，指定长度值或参考本元素高度的百分比值
- 复合属性
  > `transform: translate(3rem, 4rem)` 1 个值为水平方向位移
  >
  > `transform: translateX(3rem) translateY(4rem)`

**缩放**

- `transform: scaleX(1)` 水平方向的缩放比例
- `transform: scaleY(1)` 垂直方向的缩放比例
- 复合属性
  > `transform: scale(1, 1)` 1 个值为水平和垂直方向缩放
  >
  > `transform: scaleX(1) scaleY(1)`

**旋转**

`transform: rotateZ(30deg)` 旋转角度，正值顺时针，负值逆时针

**扭曲**

`transform: skew(30deg, 30deg)` 1 个值为水平方向

**多重变换**

`transform: translate(-50%, -50%) rotate(45deg)`

**变换原点**

- `transform-origin: 50% 50%` 百分比值参考本元素
- `transform-origin: left top` 变换原点是元素的左上角
- `transform-origin: 3rem 3rem` 变换原点距离元素的左上角 3rem，3rem

### 3D 变换

父元素需要开启 3D 空间

- `transform-style: preserve-3d` 默认为 flat
- `perspective: 500px` 观察者距离 z=0 平面的距离，默认为 none
- `perspective-origin: 400px 300px` 透视点位置，默认为开启 3D 空间的元素正中心

**位移**

- `transform: translateX(3rem)` z 轴方向位移
- `transform: translate3d(3rem, 3rem, 3rem)`

**缩放**

- `transform: scaleZ(1)` z 轴方向的缩放比例
- `transform: scale3d(1, 1, 1)`

**旋转**

- `transform: rotateX(30deg)`
- `transform: rotateY(30deg)`
- `transform: rotate3d(1, 1, 1, 30deg)`

**背部可见性**

`backface-visibility: hidden` 指定背部不可见，默认 visible

## transition

- transition-property 过渡的属性：none，width，height，all
- transition-delay 开始过渡的延迟时间
- transition-duration 过渡的持续时间
- transition-timing-function 过渡方式
  > - ease 平滑过渡（默认）
  > - linear 线性过渡, 匀速
  > - ease-in 先慢后快
  > - ease-out 先快后慢
  > - ease-in-out 慢 => 快 => 慢
  > - step-start 开始时瞬间过渡，相当于 `steps(1, start)`
  > - step-end 结束时瞬间过渡，相当于 `steps(1, end)`
  > - steps 步进函数
  > - cubic-bezie 贝塞尔曲线
- transition 复合属性
  > `transition: 1s linear all`

## animation

**`@keyframes` 关键帧**

::: code-group

```css [写法 1]
@keyframes rotate {
  from {
    transform: rotateZ(0deg);
  }
  to {
    transform: rotateZ(180deg);
  }
}
```

```css [写法 2]
@keyframes rotate {
  0% {
    transform: rotateZ(0deg);
  }
  50% {
    transform: rotateZ(30deg);
  }
  100% {
    transform: rotateZ(180deg);
  }
}
```

:::

- animation-name 动画名
- animation-duration 动画的持续时间
- animation-delay 动画的延迟时间
- animation-timing-function 与 transition-timing-function 相同
- animation-iteration-count 动画的播放次数
- animation-direction 动画的播放方向
  - `normal` 正放
  - `reverse` 倒放
  - `alternate` 正放，倒放，正放 ...
  - `alternate-reverse` 倒放，正放，倒放 ...
- animation-fill-mode
  - `backwards` 动画播放前，画面停在第一个关键帧
  - `forwards` 动画播放后，画面停在最后一个关键帧
- animation-play-state 动画的播放状态
  - `paused` 暂停
  - `running` 播放
- animation 复合属性
  > `animation: rotate 2s linear infinite alternate`

## flex

### 开启布局

- `display: flex` 开启弹性布局，flex 容器是块级元素
- `display: inline-flex` 开启弹性布局，flex 容器是行内块元素

### 主轴和交叉轴

- 主轴：主轴默认水平，默认方向从左到右
- 交叉轴：交叉轴默认垂直，默认方向从上到下
- 主轴与交叉轴垂直，flex 项目沿主轴排列
- 主轴默认压缩，交叉轴默认拉伸

| flex-direction                   | 主轴方向 | 交叉轴方向 |
| -------------------------------- | -------- | ---------- |
| `flex-direction: row` （默认）   | 从左到右 | 从上到下   |
| `flex-direction: row-reverse`    | 从右到左 | 从上到下   |
| `flex-direction: column`         | 从上到下 | 从左到右   |
| `flex-direction: column-reverse` | 从下到上 | 从左到右   |

- `flex-wrap: nowrap` 不换行（默认）
- `flex-wrap: wrap` 遇到 flex 容器边界时，交叉轴方向换行
- `flex-wrap: wrap-reverse` 遇到 flex 容器边界时，交叉轴反方向换行
- flex-wrap 复合属性
  > `flex-flow: <flex-direction> <flex-wrap>`

### 位置对齐

**justify-content 主轴对齐**

- `justify-content: flex-start` 主轴起点对齐（默认）
- `justify-content: flex-end` 主轴终点对齐
- `justify-content: center` 主轴中点对齐
- `justify-content: space-between` 主轴均匀分布，两边距离等于 0
- `justify-content: space-around` 主轴均匀分布，两边距离等于中间距离的一半
- `justify-content: space-evenly` 主轴均匀分布，两边距离等于中间距离

**align-items 单行交叉轴对齐**

- `align-items: flex-start` 交叉轴起点对齐
- `align-items: flex-end` 交叉轴终点对齐
- `align-items: center` 交叉轴中点对齐
- `align-items: baseline` 交叉轴文本基线对齐
- `align-items: stretch` 如果 flex 项目未指定高度，则单行拉伸以填充整个交叉轴（默认）

**align-content 多行交叉轴对齐**

- `align-content: flex-start` 交叉轴起点对齐
- `align-content: flex-end` 交叉轴终点对齐
- `align-content: center` 交叉轴中点对齐
- `align-content: space-between` 交叉轴均匀分布，两边距离等于 0
- `align-content: space-around` 交叉轴均匀分布，两边距离等于中间距离的一半
- `align-content: space-evenly` 交叉轴均匀分布，两边距离等于中间距离
- `align-content: stretch` 如果 flex 项目未指定高度，则多行拉伸以填充整个交叉轴（默认）

**align-self flex 项目的交叉轴对齐**

- `align-self: auto | flex-start | flex-end | center | baseline | stretch`
- 默认 `align-self: auto`，表示继承 flex 容器的 align-items 值

**order 排列顺序**

flex 项目在主轴上的排列顺序，值越小越靠前，默认 `order: 0`

### 伸缩性

**flex-grow**

主轴上有剩余时，flex 项目的拉伸比例，默认 `flex-grow: 0`，即默认 flex 项目不拉伸

**flex-shrink**

主轴上有溢出时，flex 项目的压缩比例，按照 flex 项目自身宽度和压缩比例压缩

**flex-basis**

flex 项目在主轴方向的初始大小

- 默认 `flex-basis: auto`，即默认 flex 项目在主轴方向的初始大小等于 flex 项目的宽或高
- 主轴水平时，flex 项目的宽度失效
- 主轴垂直时，flex 项目的高度失效

**flex 复合属性**

`flex: <flex-grow> <flex-shrink> <flex-basis>`

| 简写                    | 复合属性         | 描述                                                                 |
| ----------------------- | ---------------- | -------------------------------------------------------------------- |
|                         | `flex: 0 1 auto` | 不能拉伸，可以压缩，主轴方向的初始大小等于 flex 项目的宽或高（默认） |
| `flex: 1` 或 `flex: 0%` | `flex: 1 1 0`    | 可以拉伸，可以压缩，主轴方向的初始大小为 0                           |
| `flex: 3rem`            | `flex: 1 1 3rem` | 可以拉伸，可以压缩，主轴方向的初始大小为 3rem                        |
| `flex: auto`            | `flex: 1 1 auto` | 可以拉伸，可以压缩，主轴方向的初始大小等于 flex 项目的宽或高         |
| `flex: none`            | `flex: 0 0 auto` | 不能拉伸，不能压缩，主轴方向的初始大小等于 flex 项目的宽或高         |

## grid

### 开启布局

- `display: grid` 开启网格布局，grid 容器是块级元素
- `display: inline-grid` 开启网格布局，grid 容器是行内块元素

### 定义网格

- 专用单位 fr 表示容器可用空间的一份
- `repeat()` 函数简化重复定义网格，`repeat(3, 1fr)`
- `minmax()` 函数定义最小值和最大值

```css
/* 响应式布局 */
.container {
  display: grid;
  /* auto-fit 项目被拉伸，容器内没有留白 */
  /* auto-fill 项目不被拉伸，容器可能有留白 */
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  grid-auto-rows: 150px;
}
```

- grid-template-rows 行高
- grid-template-columns 列宽
- grid-auto-rows 自动创建的隐式网格的行高
- grid-auto-columns 自动创建的隐式网格的列宽
- row-gap 行间隔
- column-gap 列间隔
- gap 复合属性
  > `gap: <row-gap> <column-gap>`

### 放置网格

- grid-template-areas 定义区域（命名，用 `.` 留空），一个区域由一个或多个单元格组成
- grid-row-start 上边框的水平网格线（可以使用负数表示倒数的网格线）
- grid-row-end 下边框的水平网格线
- grid-column-start 左边框的垂直网格线
- grid-column-end 右边框的垂直网格线
- grid-row 复合属性
  > `grid-row: <grid-row-start> / <grid-row-end>` 也可以使用 `span 2` 表示从当前位置占据 2 行
- grid-column 复合属性
  > `grid-column: <grid-column-start> / <grid-column-end>` 也可以使用 `span 2` 表示从当前位置占据 2 行
- grid-area: grid 项目放置的区域，或复合属性 `grid-area: <grid-row-start> <grid-column-start> <grid-row-end> <grid-column-end>`
- grid-template 复合属性

  > `grid-template: <grid-template-rows> <grid-template-columns> <grid-template-areas>`

- grid-auto-flow 布局算法
  > - row 先行后列
  > - column 先列后行
  > - dense 尽可能填满
- grid 复合属性
  > `grid: <grid-template-rows> <grid-template-columns> <grid-template-areas> <grid-auto-rows> <grid-auto-columns> <grid-auto-flow>`

### 位置对齐

- justify-content 整体内容的水平位置
  > - start grid 容器左对齐
  > - end grid 容器右对齐
  > - center grid 容器水平居中
  > - stretch 如果 grid 项目未指定宽度, 则拉伸以填充 grid 容器
  > - space-between 列均匀分布, 两边距离等于 0
  > - space-around 列均匀分布, 两边距离等于中间距离的一半
  > - space-evenly 列均匀分布, 两边距离等于中间距离
- align-content 整体内容的垂直位置
  > - start grid 容器上对齐
  > - end grid 容器下对齐
  > - center grid 容器垂直居中
  > - stretch 如果 grid 项目未指定高度, 则拉伸以填充 grid 容器
  > - space-between 行均匀分布, 两边距离等于 0
  > - space-around 行均匀分布, 两边距离等于中间距离的一半
  > - space-evenly 行均匀分布, 两边距离等于中间距离
- place-content 复合属性
  > - `place-content: <align-content> <justify-content>`
- justify-items 单元格内容的水平位置
  > - start 单元格左对齐
  > - end 单元格右对齐
  > - center 单元格水平居中
  > - stretch 拉伸以填充单元格宽度（默认）
- align-items 单元格内容的垂直位置
  > - start 单元格上对齐
  > - end 单元格下对齐
  > - center 单元格垂直居中
  > - stretch 拉伸以填充单元格高度（默认）
- place-items 复合属性
  > `place-items:  <align-items> <justify-items>`
- justify-self 单独指定某个单元格内容的水平位置
- align-self 单独指定某个单元格内容的垂直位置
- place-self 复合属性
  > `place-self: <align-self> <justify-self>`

### 多列布局

- column-count 列数
- column-width 列宽
- columns 复合属性
  > `columns: 3 200px`
- column-gap 列间隔
- column-rule-style 列分隔线样式：none，solid，dashed，dotted，double
- column-rule-width 列分隔线宽度
- column-rule-color 列分隔线颜色
- column-rule 复合属性
  > `column-rule: solid 1rem green`
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
