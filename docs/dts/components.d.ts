/**
 * JSWidget JSX component definitions.
 * Run `pnpm generate` in Tools/completion-gen/ after editing.
 */

/** 所有组件共享的公共属性 */
interface JSWidgetCommonAttributes {
  /** 尺寸（"max" 或 {width, height}） */
  size?: string | {
    width?: number | "fill";
    height?: number | "fill";
    minWidth?: number;
    maxWidth?: number | "fill";
    minHeight?: number;
    maxHeight?: number | "fill";
  };
  /** 水平对齐 */
  justify?: "start" | "center" | "end";
  /** 垂直对齐 */
  align?: "start" | "center" | "end";
  /** 内边距（数字或 {horizontal, vertical, top, bottom, leading, trailing, left, right}） */
  padding?: JSWidgetPadding;
  /** 背景色 */
  backgroundColor?: string;
  /** 前景色 */
  foregroundColor?: string;
  /** 圆角 */
  cornerRadius?: number;
  /** 透明度 0-1 */
  opacity?: number;
  /** 旋转角度 */
  rotationEffect?: number;
  /** 缩放 */
  scaleEffect?: number;
  /** 偏移 */
  offset?: string;
  /** 阴影 */
  shadow?: string;
  /** 模糊 */
  blur?: number;
  /** 动画名 */
  animation?: string;
}

declare namespace JSWidget {
  function createElement(tag: unknown, props?: unknown, ...children: unknown[]): unknown;
  const Fragment: string;
  namespace JSX {
    interface IntrinsicElements {
      row: Omit<JSWidgetCommonAttributes, "align"> & {
        /** 交叉轴对齐（垂直） */
        align?: "start" | "end" | "center" | "firstBaseline" | "lastBaseline";
        /** 水平间距 */
        spacing?: string | number | boolean;
      };
      col: JSWidgetCommonAttributes & {
        /** 垂直间距 */
        spacing?: string | number | boolean;
      };
      stack: JSWidgetCommonAttributes;
      grid: JSWidgetCommonAttributes & {
        /** 行配置 JSON 字符串 */
        rows?: string | number | boolean;
        /** 列数 */
        columns?: string | number | boolean;
        /** 间距 */
        spacing?: string | number | boolean;
      };
      "grid-row": Omit<JSWidgetCommonAttributes, "align"> & {
        /** 垂直对齐 */
        align?: "start" | "end" | "center" | "firstBaseline" | "lastBaseline";
        /** 行数 */
        rows?: string | number | boolean;
        /** 列配置 JSON 字符串 */
        columns?: string | number | boolean;
        /** 间距 */
        spacing?: string | number | boolean;
      };
      text: JSWidgetCommonAttributes & {
        /** 字体：语义名 / 数字字号 / {name,weight,design,size} / {custom,size} */
        font?: JSWidgetFont;
        /** 粗体 */
        bold?: string | number | boolean;
        /** 斜体 */
        italic?: string | number | boolean;
        /** 文字颜色 */
        color?: string;
        /** 文本对齐 */
        textAlign?: "start" | "center" | "end";
        /** 行数限制 */
        lineLimit?: number;
        /** 最小缩放 */
        minimumScaleFactor?: number;
      };
      date: JSWidgetCommonAttributes & {
        /** 日期格式 */
        format?: string | number | boolean;
        /** 显示样式 */
        style?: "date" | "time" | "relative";
      };
      image: JSWidgetCommonAttributes & {
        /** bundle 内图片名 */
        name?: string | number | boolean;
        /** 网络 URL */
        url?: string | number | boolean;
        /** 可拉伸 */
        resizable?: string | number | boolean;
        /** 适应 */
        scaledToFit?: string | number | boolean;
        /** 填充 */
        scaledToFill?: string | number | boolean;
      };
      gif: JSWidgetCommonAttributes & {
        /** GIF 资源名 */
        name?: string | number | boolean;
      };
      spacer: JSWidgetCommonAttributes & {
        /** 最小占用长度 */
        length?: number;
      };
      rect: JSWidgetCommonAttributes;
      capsule: JSWidgetCommonAttributes;
      ellipse: JSWidgetCommonAttributes;
      circle: JSWidgetCommonAttributes;
      gauge: JSWidgetCommonAttributes & {
        /** 当前值 */
        value?: number;
        /** 最小值 */
        min?: number;
        /** 最大值 */
        max?: number;
      };
      chart: JSWidgetCommonAttributes & {
        /** 图表数据 JSON */
        data?: string | number | boolean;
        /** 图表类型 */
        type?: "line" | "bar" | "pie";
      };
      link: JSWidgetCommonAttributes & {
        /** 链接地址 */
        url?: string | number | boolean;
        /** 目标 */
        destination?: string | number | boolean;
      };
      divider: JSWidgetCommonAttributes & {
        /** 线宽（默认 1） */
        thickness?: number;
        /** 方向 */
        axis?: "horizontal" | "vertical";
        /** 颜色 */
        color?: string;
      };
      line: JSWidgetCommonAttributes & {
        /** 线宽（默认 2） */
        thickness?: number;
        /** 长度（默认 48） */
        length?: number;
        /** 方向 */
        axis?: "horizontal" | "vertical";
        /** 颜色 */
        color?: string;
      };
      roundedrect: JSWidgetCommonAttributes;
      icon: JSWidgetCommonAttributes & {
        /** SF Symbol 名 */
        name?: string | number | boolean;
      };
      label: JSWidgetCommonAttributes;
      progress: JSWidgetCommonAttributes & {
        /** 0-1 进度 */
        value?: number;
      };
      ring: JSWidgetCommonAttributes;
      badge: JSWidgetCommonAttributes;
      chip: JSWidgetCommonAttributes;
      stat: JSWidgetCommonAttributes;
      button: JSWidgetCommonAttributes & {
        /** 点击动作名 */
        action?: string | number | boolean;
        /** 按钮样式 */
        style?: string | number | boolean;
      };
      toggle: JSWidgetCommonAttributes & {
        /** 是否开启 */
        isOn?: string | number | boolean;
        /** 切换回调名 */
        action?: string | number | boolean;
      };
    }
  }
}
