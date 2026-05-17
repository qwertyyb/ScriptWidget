/**
 * JSWidget common type definitions.
 * Run `pnpm generate` in Tools/completion-gen/ after editing.
 */

type HttpParams = {
  headers?: Record<string, string>;
  body?: string | Record<string, any>;
  timeoutInterval?: number;
};

// TODO: 1. console 需要实现更多方法，log、info、warn、error。2. 目前只支持第一个参数，其它参数会被过滤，不会自动 json 化
type JSWidgetConsole = {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
};

type JSWidgetPadding = number | {
  /** 左右内边距 */
  horizontal?: number;
  /** 上下内边距 */
  vertical?: number;
  /** 顶部内边距 */
  top?: number;
  /** 底部内边距 */
  bottom?: number;
  /** 左内边距 */
  leading?: number;
  /** 右内边距 */
  trailing?: number;
  /** 左内边距 */
  left?: number;
  /** 右内边距 */
  right?: number;
};

/** 字体名称 */
type JSWidgetFontName =
  | "largeTitle"
  | "title"
  | "title2"
  | "title3"
  | "headline"
  | "subheadline"
  | "body"
  | "callout"
  | "footnote"
  | "caption"
  | "caption2";

/** 字体粗细 */
type JSWidgetFontWeight =
  | "ultraLight"
  | "thin"
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "heavy"
  | "black";

/** 字体设计 */
type JSWidgetFontDesign =
  | "monospaced"
  | "rounded"
  | "serif"
  | "default";

/** 字体 */
type JSWidgetFont =
  | JSWidgetFontName
  | number
  | {
    name?: JSWidgetFontName;
    weight?: JSWidgetFontWeight;
    design?: JSWidgetFontDesign;
    size?: number;
    custom?: string;
  };

type JSWidgetSize =
  | "small"
  | "medium"
  | "large"
  | "extraLarge"
  | "accessoryInline"
  | "accessoryCircular"
  | "accessoryRectangular"
  | "live-activity"
  | "dynamic-island"
  | "function";
