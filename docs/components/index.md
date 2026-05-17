# JSWidget JSX 元素完整文档

本文档与 [`docs/dts/components.d.ts`](../dts/components.d.ts)、[`docs/dts/types.d.ts`](../dts/types.d.ts) 保持一致，描述 JSWidget 支持的所有 JSX 元素、属性及其用法。

---

## 布局容器

### Col (垂直堆叠)

垂直排列子元素。

**作用**：垂直排列子元素

| 属性 | 类型 | 说明 |
|------|------|------|
| `align` | `"start" \| "center" \| "end"` | 子元素水平对齐（交叉轴） |
| `justify` | `"start" \| "center" \| "end"` | 主轴分布（需父级有剩余高度） |
| `spacing` | `string \| number \| boolean` | 子元素垂直间距 |

```jsx
<col align="center" spacing={10}>
  <text>Hello</text>
  <text>World</text>
</col>

<col justify="center" size={{height: "fill"}}>
  <text>Vertically centered group</text>
</col>
```

---

### Row (水平堆叠)

水平排列子元素。

| 属性 | 类型 | 说明 |
|------|------|------|
| `align` | `"start" \| "end" \| "center" \| "firstBaseline" \| "lastBaseline"` | 子元素垂直对齐（交叉轴） |
| `justify` | `"start" \| "center" \| "end"` | 主轴分布（需父级有剩余宽度） |
| `spacing` | `string \| number \| boolean` | 子元素水平间距 |

**`justify` 可选值**：`start`（默认）| `center` | `end`

```jsx
<row align="center" spacing={8}>
  <text>Left</text>
  <text>Right</text>
</row>

{/* 横向居中：子元素作为一组在可用宽度内居中 */}
<row justify="center" size={{width: "fill"}}>
  <text>Centered group</text>
</row>
```

也可用通用 `size` 配合 `justify` 达到同样效果：`<row size={{width: "fill"}} justify="center">`。

---

### Stack (层叠容器)

按 z 轴顺序层叠子元素，后面的元素覆盖在前面元素之上。

| 属性 | 类型 | 说明 |
|------|------|------|
| 无特殊属性 | - | 支持通用属性 |

```jsx
<stack>
    <Rectangle backgroundColor="#f00" />
    <Text>覆盖在上面</Text>
</stack>
```

---

### Grid / Grid-Row (网格容器)

网格形式排列子元素。

| 属性 | 类型 | 说明 |
|------|------|------|
| `columns` | JSON 字符串 | 列/行配置数组 |
| `align` | String | 对齐方式 |
| `spacing` | number | 间距 |

**`columns` 配置格式**：
```json
[
    { "type": "adaptive", "min": "30", "max": "100" },
    { "type": "fixed", "value": "60" },
    { "type": "flexible" }
]
```
- `adaptive`：自适应，最小/最大宽度
- `fixed`：固定宽度
- `flexible`：弹性填充

```jsx
<grid
    columns='[{"type":"adaptive","min":"60"},{"type":"fixed","value":"80"}]'
    spacing={10}
>
    <Text>Item 1</Text>
    <Text>Item 2</Text>
</grid>
```

---

## 文本元素

### Text (`<text>`)

显示文本内容。继承 `JSWidgetCommonAttributes`。

| 属性 | 类型 | 说明 |
|------|------|------|
| `font` | `JSWidgetFont` | 字体：语义名 / 数字字号 / 对象 |
| `bold` | `string \| number \| boolean` | 粗体 |
| `italic` | `string \| number \| boolean` | 斜体 |
| `color` | `string` | 文字颜色 |
| `textAlign` | `"start" \| "center" \| "end"` | 文本对齐 |
| `lineLimit` | `number` | 行数限制 |
| `minimumScaleFactor` | `number` | 最小缩放因子 |

**`JSWidgetFont`**（见 `types.d.ts`）：
- 语义名：`"largeTitle"` \| `"title"` \| `"title2"` \| `"title3"` \| `"headline"` \| `"subheadline"` \| `"body"` \| `"callout"` \| `"footnote"` \| `"caption"` \| `"caption2"`
- 数字：字号
- 对象：`{ name?, weight?, design?, size?, custom? }`（`weight`: `JSWidgetFontWeight`；`design`: `JSWidgetFontDesign`）

```jsx
<text font="title" color="#333">Hello World</text>
<text font={{ name: "body", weight: "bold" }} lineLimit={1}>Single line</text>
<text font="caption" lineLimit={2} minimumScaleFactor={0.8}>Long text</text>
```

---

### Date (`<date>`)

动态显示日期和时间。继承 `JSWidgetCommonAttributes`。

| 属性 | 类型 | 说明 |
|------|------|------|
| `format` | `string \| number \| boolean` | 日期格式 |
| `style` | `"date" \| "time" \| "relative"` | 显示样式 |

```jsx
<date style="time" />
<date style="relative" format="yyyy-MM-dd" />
```

---

## 图片与媒体

### Image (`<image>`)

显示图片。继承 `JSWidgetCommonAttributes`。

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `string \| number \| boolean` | 包内 `image/` 目录下的图片名 |
| `url` | `string \| number \| boolean` | 网络 URL |
| `resizable` | `string \| number \| boolean` | 可拉伸 |
| `scaledToFit` | `string \| number \| boolean` | 适应缩放 |
| `scaledToFill` | `string \| number \| boolean` | 填充缩放 |

```jsx
<image name="logo" />
<image url="https://example.com/image.png" scaledToFit />
```

---

### Gif (`<gif>`)

显示 GIF 动画。继承 `JSWidgetCommonAttributes`。

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `string \| number \| boolean` | GIF 资源名 |

```jsx
<gif name="animation" />
```

---

## 交互元素

### Button (按钮)

可点击的按钮，触发相应动作。

| 属性 | 类型 | 说明 |
|------|------|------|
| `action` | String | 预定义动作（如 `"reload"`） |
| `onClick` | String | 点击时调用的 JS 函数名 |

```jsx
<Button action="reload">
    <Text>重新加载</Text>
</Button>

<Button onClick="handleClick">
    <Text>点击我</Text>
</Button>
```

---

### Toggle (开关)

可切换的开关控件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `on` | boolean | 开关状态 |
| `onClick` | String | 点击时调用的函数名 |

```jsx
<Toggle on={true} onClick="toggleHandler">
    <Text>设置选项</Text>
</Toggle>
```

---

### Link (链接)

可点击的链接，跳转到指定 URL。

| 属性 | 类型 | 说明 |
|------|------|------|
| `url` | String | 跳转目标 URL |

```jsx
<Link url="widget-deeplink://action">
    <Text>点击跳转</Text>
</Link>
```

---

## 图表

### Chart (图表)

显示各种类型的图表。

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | String | 图表类型 |
| `data` | JSON 字符串 | 数据数组 |
| `category` | boolean | 是否启用分类 |
| `hideLegend` | boolean | 是否隐藏图例 |
| `hideXAxis` | boolean | 是否隐藏 X 轴 |
| `hideYAxis` | boolean | 是否隐藏 Y 轴 |
| `color` | String | 前景色 |

**`type` 图表类型**：

| 类型 | 说明 |
|------|------|
| `bar` | 柱状图（X 轴为标签） |
| `bar-x` | 水平柱状图 |
| `bar-y` | 垂直柱状图 |
| `bar-gantt` | 甘特图 |
| `line` | 折线图 |
| `point` | 点图 |
| `line-point` | 带点的折线图 |
| `area` | 面积图 |
| `rect` | 矩形图 |
| `rule-x` | X 轴规则线 |

**`data` 格式**：
```json
[
    { "label": "Jan", "value": 10, "category": "A" },
    { "label": "Feb", "value": 20, "category": "B" }
]
```

```jsx
<Chart
    type="bar"
    data='[{"label":"A","value":10},{"label":"B","value":20}]'
    hideXAxis={true}
/>
```

---

## 形状

### Rectangle / RoundedRectangle (矩形)

显示矩形或圆角矩形。

| 属性 | 类型 | 说明 |
|------|------|------|
| `corner` | number | 圆角半径（RoundedRectangle 专用） |
| `trim` | number/string | 裁剪比例（0-1 或 `"from,to"`） |
| `stroke` | number | 边框宽度 |
| `color` | String | 填充颜色 |

```jsx
<Rectangle stroke={2} color="#3b82f6" />
<RoundedRectangle corner={12} color="#f1f5f9" />
```

---

### Capsule (胶囊形)

显示胶囊形状。

| 属性 | 类型 | 说明 |
|------|------|------|
| `trim` | number/string | 裁剪比例 |
| `stroke` | number | 边框宽度 |
| `color` | String | 填充颜色 |

---

### Ellipse (椭圆)

显示椭圆形状。

| 属性 | 类型 | 说明 |
|------|------|------|
| `trim` | number/string | 裁剪比例 |
| `stroke` | number | 边框宽度 |
| `color` | String | 填充颜色 |

---

### Circle (圆形)

显示圆形。

| 属性 | 类型 | 说明 |
|------|------|------|
| `trim` | number/string | 裁剪比例 |
| `stroke` | number | 边框宽度 |
| `color` | String | 填充颜色 |

---

## 仪表

### Gauge (仪表盘)

显示进度仪表。

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | String | 类型：`original` 或 `system` |
| `value` | number/string | 当前值（0-1） |
| `style` | String | 样式：`circular`（默认）| `linear` | `automatic` |
| `text` | String | 标题文本 |
| `current` | String | 当前值标签 |
| `min` / `max` | String | 最小/最大值标签 |

**Original 类型额外属性**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `angle` | number | 弧度（默认 260） |
| `thickness` | number | 厚度（默认 10） |
| `needleColor` | String | 指针颜色 |
| `label` | String | 标签文本 |
| `title` | String | 标题 |
| `sections` | JSON 字符串 | 分段配置 |

**`sections` 格式**：
```json
[
    { "color": "#22c55e", "value": 0.3 },
    { "color": "#eab308", "value": 0.2 }
]
```

```jsx
<Gauge type="system" value="0.7" style="circular" text="Battery" current="70%" min="0%" max="100%" />
```

---

## 扩展组件 (Extras)

### Divider (分隔线)

| 属性 | 类型 | 说明 |
|------|------|------|
| `thickness` | number | 线条粗细（默认 1） |
| `axis` | String | 方向：`horizontal`（默认）| `vertical` |
| `color` | String | 颜色 |

---

### Line (线条)

| 属性 | 类型 | 说明 |
|------|------|------|
| `thickness` | number | 线条粗细（默认 2） |
| `length` | number | 线条长度（默认 48） |
| `axis` | String | 方向：`horizontal`（默认）| `vertical` |
| `color` | String | 颜色 |

---

### Icon (图标)

| 属性 | 类型 | 说明 |
|------|------|------|
| `systemName` | String | SF Symbols 名称（默认 `questionmark.circle`） |
| `size` | number | 图标大小 |
| `color` | String | 颜色 |
| `font` | String | 字体样式 |

---

### Label (标签)

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | String | 标题文本 |
| `systemName` | String | 图标名（默认 `circle.fill`） |
| `color` | String | 颜色 |
| `font` | String | 字体样式 |

---

### Progress (进度条)

| 属性 | 类型 | 说明 |
|------|------|------|
| `value` | number | 当前值 |
| `total` | number | 总值（默认 1） |
| `label` | String | 标签文本 |
| `style` | String | 样式：`linear`（默认）| `circular` |
| `color` | String | 进度条颜色 |

---

### Ring (圆环)

| 属性 | 类型 | 说明 |
|------|------|------|
| `value` | number | 值 0-1 |
| `thickness` | number | 圆环粗细（默认 8） |
| `color` | String | 进度颜色（默认 `#3b82f6`） |
| `trackColor` | String | 轨道颜色（默认 `#e2e8f0`） |

---

### Badge (徽章)

| 属性 | 类型 | 说明 |
|------|------|------|
| `text` | String | 徽章文本 |
| `radius` | number | 圆角半径（默认 6） |
| `backgroundColor` | String | 背景色（默认 `#0f172a`） |
| `color` | String | 文字颜色（默认 `#e2e8f0`） |

---

### Chip (标签卡)

| 属性 | 类型 | 说明 |
|------|------|------|
| `text` | String | 标签文本 |
| `radius` | number | 圆角半径（默认 14） |
| `backgroundColor` | String | 背景色（无则使用默认） |
| `borderColor` | String | 边框颜色（默认 `#cbd5f5`） |
| `color` | String | 文字颜色（默认 `#0f172a`） |

---

### Stat (统计卡片)

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | String | 标题（默认 `Title`） |
| `value` | String | 数值（默认 `0`） |
| `subtitle` | String | 副标题 |
| `color` | String | 数值颜色（默认 `#0f172a`） |
| `mutedColor` | String | 辅助文字颜色（默认 `#64748b`） |

---

### Spacer (间距)

占用空间，用于布局分隔。在 `col` 中沿垂直方向扩展，在 `row` 中沿水平方向扩展。

| 属性 | 类型 | 说明 |
|------|------|------|
| `length` | number | 最小占用长度（对应 SwiftUI `Spacer(minLength:)`） |
| `size` | String | 占用空间尺寸 |

```jsx
<col>
  <text font="title">Title</text>
  <spacer length={8} />
  <text font="caption">Footer</text>
</col>
```

---

## 通用属性（`JSWidgetCommonAttributes`）

以下属性在 `components.d.ts` 的 `JSWidgetCommonAttributes` 中定义，各标签通过交叉类型继承（部分标签会 `Omit` 或覆盖个别字段）。

| 属性 | 类型 | 说明 |
|------|------|------|
| `size` | `string \| { width?, height?, minWidth?, maxWidth?, minHeight?, maxHeight? }` | `"max"` 或尺寸对象；`width`/`height` 等为 `number \| "fill"` |
| `justify` | `"start" \| "center" \| "end"` | 水平对齐 |
| `align` | `"start" \| "center" \| "end"` | 垂直对齐（`row` / `grid-row` 的 `align` 另见各标签） |
| `padding` | `JSWidgetPadding` | 内边距 |
| `backgroundColor` | `string` | 背景色 |
| `foregroundColor` | `string` | 前景色 |
| `cornerRadius` | `number` | 圆角 |
| `opacity` | `number` | 透明度 0–1 |
| `rotationEffect` | `number` | 旋转角度 |
| `scaleEffect` | `number` | 缩放 |
| `offset` | `string` | 偏移 |
| `shadow` | `string` | 阴影 |
| `blur` | `number` | 模糊 |
| `animation` | `string` | 动画名 |

#### JSWidgetPadding

`number` 或对象：`{ horizontal?, vertical?, top?, bottom?, leading?, trailing?, left?, right? }`

```jsx
<text size="max" padding={10} backgroundColor="#1e293b" />
<text size={{ width: "fill", height: 48 }} justify="center" align="center" />
<rect cornerRadius={12} opacity={0.9} rotationEffect={15} />
```

---

## 颜色格式

支持的颜色格式：

- **颜色名称**：`"red"`, `"blue"`, `"green"`, `"secondary"`, `"white"`, `"black"` 等
- **十六进制**：`"#ff0000"`, `"#f00"`, `"#ff000080"`（RGBA 顺序）
- **RGB 函数**：`"rgb(255, 0, 0)"`
- **RGBA 函数**：`"rgba(255, 0, 0, 0.5)"`
- **对象格式**：`{{value: "red", opacity: 0.5}}`

---

## 元素汇总表

| 元素 | 分类 | 说明 |
|------|------|------|
| `Col` | 布局容器 | 垂直堆叠 |
| `Row` | 布局容器 | 水平堆叠 |
| `Stack` | 布局容器 | 层叠容器 |
| `Grid` / `Grid-Row` | 布局容器 | 网格容器 |
| `Text` | 文本 | 显示文本 |
| `Date` | 文本 | 显示日期/时间 |
| `Image` | 图片媒体 | 显示图片 |
| `Gif` | 图片媒体 | 显示 GIF（仅 iOS） |
| `Button` | 交互 | 可点击按钮 |
| `Toggle` | 交互 | 开关控件 |
| `Link` | 交互 | 可点击链接 |
| `Chart` | 图表 | 显示各种图表 |
| `Rectangle` | 形状 | 矩形 |
| `RoundedRectangle` | 形状 | 圆角矩形 |
| `Capsule` | 形状 | 胶囊形 |
| `Ellipse` | 形状 | 椭圆 |
| `Circle` | 形状 | 圆形 |
| `Gauge` | 仪表 | 进度仪表盘 |
| `Divider` | 扩展组件 | 分隔线 |
| `Line` | 扩展组件 | 线条 |
| `Icon` | 扩展组件 | 图标 |
| `Label` | 扩展组件 | 标签 |
| `Progress` | 扩展组件 | 进度条 |
| `Ring` | 扩展组件 | 圆环 |
| `Badge` | 扩展组件 | 徽章 |
| `Chip` | 扩展组件 | 标签卡 |
| `Stat` | 扩展组件 | 统计卡片 |
| `Spacer` | 扩展组件 | 间距 |