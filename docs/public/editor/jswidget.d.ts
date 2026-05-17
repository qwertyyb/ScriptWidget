/** Auto-generated from docs/dts/ by Tools/completion-gen/generate.mjs — do not edit by hand */

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
  "largeTitle" | "title" | "title2" | "title3" | "headline" | "subheadline" | "body" | "callout" | "footnote" | "caption" | "caption2";

/** 字体粗细 */
type JSWidgetFontWeight =
  "ultraLight" | "thin" | "light" | "regular" | "medium" | "semibold" | "bold" | "heavy" | "black";

/** 字体设计 */
type JSWidgetFontDesign =
  "monospaced" | "rounded" | "serif" | "default";

/** 字体 */
type JSWidgetFont =
  "largeTitle" | "title" | "title2" | "title3" | "headline" | "subheadline" | "body" | "callout" | "footnote" | "caption" | "caption2" | number | {
        name?: "largeTitle" | "title" | "title2" | "title3" | "headline" | "subheadline" | "body" | "callout" | "footnote" | "caption" | "caption2";
        weight?: "ultraLight" | "thin" | "light" | "regular" | "medium" | "semibold" | "bold" | "heavy" | "black";
        design?: "monospaced" | "rounded" | "serif" | "default";
        size?: number;
        custom?: string;
      };


type HttpParams = {
  headers?: Record<string, string>;
  body?: string | Record<string, any>;
  timeoutInterval?: number;
};

declare const $http: {
  get(url: string, params?: {
    headers?: Record<string, string>;
    body?: string | Record<string, any>;
    timeoutInterval?: number;
  }): Promise<string>;
  post(url: string, params?: {
    headers?: Record<string, string>;
    body?: string | Record<string, any>;
    timeoutInterval?: number;
  }): Promise<string>;
  put(url: string, params?: {
    headers?: Record<string, string>;
    body?: string | Record<string, any>;
    timeoutInterval?: number;
  }): Promise<string>;
  patch(url: string, params?: {
    headers?: Record<string, string>;
    body?: string | Record<string, any>;
    timeoutInterval?: number;
  }): Promise<string>;
  delete(url: string, params?: {
    headers?: Record<string, string>;
    body?: string | Record<string, any>;
    timeoutInterval?: number;
  }): Promise<string>;
};

declare function $fetch(url: string, params?: {
  headers?: Record<string, string>;
  body?: string | Record<string, any>;
  timeoutInterval?: number;
}): Promise<string>;
declare function fetch(url: string, params?: {
  headers?: Record<string, string>;
  body?: string | Record<string, any>;
  timeoutInterval?: number;
}): Promise<string>;

type JSWidgetConsole = {
  /** 普通日志 */
  log(...args: any[]): void;
  /** 信息日志 */
  info(...args: any[]): void;
  /** 警告日志 */
  warn(...args: any[]): void;
  /** 错误日志 */
  error(...args: any[]): void;
};
declare const $console: {
  /** 普通日志 */
  log(...args: any[]): void;
  /** 信息日志 */
  info(...args: any[]): void;
  /** 警告日志 */
  warn(...args: any[]): void;
  /** 错误日志 */
  error(...args: any[]): void;
};
declare const console: {
  /** 普通日志 */
  log(...args: any[]): void;
  /** 信息日志 */
  info(...args: any[]): void;
  /** 警告日志 */
  warn(...args: any[]): void;
  /** 错误日志 */
  error(...args: any[]): void;
};

declare const $device: {
  name(): string;
  model(): string;
  language(): string;
  systemVersion(): string;
  screen(): { scale: number; width: number; height: number };
  battery(): { level: number; state: string };
  isdarkmode(): boolean;
  totalDiskSpace(): number;
  freeDiskSpace(): number;
};

/** 操作脚本包内的文件 API */
declare const $file: {
  readString(path: string): string;
  writeString(path: string, content: string): boolean;
  remove(path: string): boolean;
  /** 列出目录下一层条目；path 为 "" 表示包根目录 */
  list(path: string): string[];
};

declare const $system: {
  appInfo(): { name: string; bundleId: string; version: string; build: string };
  locale(): string;
  preferredLanguages(): string[];
  timeZone(): { identifier: string; abbreviation: string; offsetSeconds: number };
  is24HourClock(): boolean;
  calendarInfo(): {
    identifier: string;
    firstWeekday: number;
    minimumDaysInFirstWeek: number;
  };
  systemUptime(): number;
  memory(): { physical: number };
  thermalState(): "nominal" | "fair" | "serious" | "critical" | "unknown";
  lowPowerMode(): boolean;
  /** iOS: 0–1; macOS: -1 */
  brightness(): number;
  reduceMotionEnabled(): boolean;
  platform(): "ios" | "macos";
  hostName(): string;
  processName(): string;
  osVersionString(): string;
  processorCount(): number;
  activeProcessorCount(): number;
};

type HealthSample = {
  value: number;
  unit: string;
  start: string;
  end: string;
};
declare const $health: {
  isAvailable(): boolean;
  requestAuthorization(): Promise<boolean>;
  stepCountToday(): Promise<{
        value: number;
        unit: string;
        start: string;
        end: string;
      }>;
  activeEnergyToday(): Promise<{
        value: number;
        unit: string;
        start: string;
        end: string;
      }>;
  heartRateLatest(): Promise<{
        value: number;
        unit: string;
        start: string;
        end: string;
      }>;
};

type LocationAuthorizationStatus =
  "notDetermined" | "restricted" | "denied" | "authorizedAlways" | "authorizedWhenInUse" | "disabled" | "unknown" | "unavailable";  // 非 iOS stub

type LocationRequestOptions = {
  timeout?: number;
  timeoutMs?: number;
};

type LocationCurrentOptions = {
  timeout?: number;
  timeoutMs?: number;
} & ({
  maxAge?: number;
  maxAgeMs?: number;
  accuracy?: "full" | "reduced";
  purposeKey?: string;
});

type LocationPayload = {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  verticalAccuracy: number;
  speed: number;
  course: number;
  timestamp: string;
  accuracyAuthorization: "full" | "reduced" | "unknown";
  age: number;
  isStale: boolean;
};

declare const $location: {
  isAvailable(): boolean;
  authorizationStatus(): "notDetermined" | "restricted" | "denied" | "authorizedAlways" | "authorizedWhenInUse" | "disabled" | "unknown" | "unavailable";
  requestAuthorization(options?: {
    timeout?: number;
    timeoutMs?: number;
  }): Promise<boolean>;
  current(options?: {
    timeout?: number;
    timeoutMs?: number;
  } & ({
    maxAge?: number;
    maxAgeMs?: number;
    accuracy?: "full" | "reduced";
    purposeKey?: string;
  })): Promise<{
        latitude: number;
        longitude: number;
        altitude: number;
        accuracy: number;
        verticalAccuracy: number;
        speed: number;
        course: number;
        timestamp: string;
        accuracyAuthorization: "full" | "reduced" | "unknown";
        age: number;
        isStale: boolean;
      }>;
};

declare const $storage: {
  getString(key: string): string;
  setString(key: string, value: string): boolean;
  getJSON(key: string): Record<string, unknown>;
  setJSON(key: string, value: Record<string, unknown>): boolean;
  remove(key: string): boolean;
  keys(): string[];
  clear(): boolean;
};

type JSWidgetSize =
  "small" | "medium" | "large" | "extraLarge" | "accessoryInline" | "accessoryCircular" | "accessoryRectangular" | "live-activity" | "dynamic-island" | "function";

declare function $getenv(key: "widget-size"): "small" | "medium" | "large" | "extraLarge" | "accessoryInline" | "accessoryCircular" | "accessoryRectangular" | "live-activity" | "dynamic-island" | "function" | "";
declare function $getenv(key: "widget-param" | "script-dir"): string;
declare function $getenv(key: string): string;

/**
 * 导入并执行同包内的 .js / .jsx 文件（相对路径）。
 * 被导入文件的顶层变量/函数会进入当前 JS 上下文的全局作用域。
 * @returns 文件是否存在；执行是否成功需自行保证（调用为同步，编译/执行为异步调度）。
 */
declare function $import(relativePath: string): boolean;

declare function $render(element: unknown): void;

type DynamicIslandExpandedConfig = {
  leading?: unknown;
  trailing?: unknown;
  center?: unknown;
  bottom?: unknown;
};

type DynamicIslandConfig = {
  expanded: {
      leading?: unknown;
      trailing?: unknown;
      center?: unknown;
      bottom?: unknown;
    };
  compactLeading: unknown;
  compactTrailing: unknown;
  minimal: unknown;
};

declare function $dynamic_island(config: {
  expanded: {
      leading?: unknown;
      trailing?: unknown;
      center?: unknown;
      bottom?: unknown;
    };
  compactLeading: unknown;
  compactTrailing: unknown;
  minimal: unknown;
}): void;

declare const $element: {
  createElement(
    tag: string | ((...args: unknown[]) => unknown),
    props?: Record<string, unknown> | null,
    ...children: unknown[]
  ): unknown;
};

declare function $component(
  name: string,
  builder: (...args: unknown[]) => unknown
): void;

declare function $error(message: string): void;

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
  padding?: number | {
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
        font?: "largeTitle" | "title" | "title2" | "title3" | "headline" | "subheadline" | "body" | "callout" | "footnote" | "caption" | "caption2" | number | {
                  name?: "largeTitle" | "title" | "title2" | "title3" | "headline" | "subheadline" | "body" | "callout" | "footnote" | "caption" | "caption2";
                  weight?: "ultraLight" | "thin" | "light" | "regular" | "medium" | "semibold" | "bold" | "heavy" | "black";
                  design?: "monospaced" | "rounded" | "serif" | "default";
                  size?: number;
                  custom?: string;
                };
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
