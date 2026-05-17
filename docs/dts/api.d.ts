/**
 * JSWidget global API declarations.
 * Run `pnpm generate` in Tools/completion-gen/ after editing.
 */

declare const $http: {
  get(url: string, params?: HttpParams): Promise<string>;
  post(url: string, params?: HttpParams): Promise<string>;
  put(url: string, params?: HttpParams): Promise<string>;
  patch(url: string, params?: HttpParams): Promise<string>;
  delete(url: string, params?: HttpParams): Promise<string>;
};

declare function $fetch(url: string, params?: HttpParams): Promise<string>;
declare function fetch(url: string, params?: HttpParams): Promise<string>;

declare const $console: JSWidgetConsole;
/** Widget script console (not DOM console). Requires editor lib without DOM. */
declare const console: JSWidgetConsole;

declare const $device: {
  name(): string;
  model(): string;
  systemVersion(): string;
  batteryLevel(): number;
  isCharging(): boolean;
};

declare const $file: {
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<boolean>;
  list(path: string): Promise<string[]>;
};

declare const $system: Record<string, unknown>;
declare const $health: Record<string, unknown>;
declare const $location: Record<string, unknown>;

declare const $storage: {
  getString(key: string): string;
  setString(key: string, value: string): boolean;
  getJSON(key: string): Record<string, unknown>;
  setJSON(key: string, value: Record<string, unknown>): boolean;
  remove(key: string): boolean;
  keys(): string[];
  clear(): boolean;
};

declare function $getenv(key: "widget-size"): JSWidgetSize | "";
declare function $getenv(key: "widget-param" | "script-dir"): string;
declare function $getenv(key: string): string;
declare function $import(path: string): Promise<unknown>;
declare function $render(element: unknown): void;

declare const $dynamic_island: Record<string, unknown>;
declare const $element: {
  createElement(tag: unknown, props?: unknown, ...children: unknown[]): unknown;
};
declare const $component: Record<string, unknown>;
declare const $error: Record<string, unknown>;
