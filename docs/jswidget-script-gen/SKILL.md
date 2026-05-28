---
name: jswidget-script-gen
description: >-
  Generate JSWidget (iOS/macOS widget) JSX scripts. Use when the user asks to
  create, write, or generate a widget script, main.jsx, or mentions JSWidget,
  $render, $dynamic_island, or widget JSX code.
---

# JSWidget Script Generator

Generate `main.jsx` scripts for JSWidget — an iOS/macOS widget runtime
powered by JavaScript and JSX.

## Core Rules

1. Entry script uses **top-level code** with top-level `await`.
2. Desktop widgets call **`$render(<jsx>)`**; Dynamic Island uses **`$dynamic_island(config)`** — never mix them.
3. JSX tags are **lowercase** (`row`, `col`, `text`, `image`, etc.) — never use HTML/React DOM tags.
4. Function components must be **synchronous**. Fetch async data outside, pass via props.
5. Color format: named (`"red"`), hex (`"#ff0000"`), `rgb()`/`rgba()`.
6. Use `$getenv("widget-size")` for responsive layout (`"small"` | `"medium"` | `"large"` …).

## Output Template

When generating a script, output:

1. **Brief implementation notes** (2-3 sentences).
2. **Complete `main.jsx`** ready to paste into JSWidget.
3. **Self-check log**: list any tag/prop you considered and rejected because
   it failed a schema check (kept brief, helps debugging).

## Quick Reference

### Layout

| Tag       | Purpose        | Key Props                |
|-----------|----------------|--------------------------|
| `col`     | Vertical stack | `spacing`, `align`, `justify` |
| `row`     | Horizontal stack | `spacing`, `justify` (no `align`) |
| `stack`   | Z-axis overlay | —                        |
| `spacer`  | Flexible space | `length`                 |
| `grid`    | Grid layout    | `columns`, `rows`, `spacing` |

### Content

| Tag       | Purpose         | Key Props                       |
|-----------|-----------------|---------------------------------|
| `text`    | Text            | `font`, `color`, `lineLimit`, `textAlign` |
| `date`    | Live date/time  | `style` (`date`/`time`/`relative`/`timer`) |
| `image`   | Image           | `url`, `name`, `filePath`, `mode`, `ratio` |
| `icon`    | SF Symbol       | `systemName`, `size`, `color`   |

### Interaction

| Tag       | Purpose   | Key Props                     |
|-----------|-----------|-------------------------------|
| `button`  | Button    | `action="reload"` or `onClick` |
| `toggle`  | Switch    | `on`, `onClick`               |
| `link`    | Tap link  | `url` (required)              |

### Data Display

| Tag        | Purpose        | Key Props                              |
|------------|----------------|----------------------------------------|
| `chart`    | Swift Charts   | `data`, `type`, `category`, `color`    |
| `progress` | Progress bar   | `value`, `total`, `style`, `color`     |
| `ring`     | Ring progress  | `value`, `thickness`, `color`          |
| `gauge`    | Gauge          | `type` (`original`/`system`), `value`  |
| `stat`     | Stat card      | `title`, `value`, `subtitle`           |

### Shape / Decoration

`rect`, `roundedrect`, `capsule`, `ellipse`, `circle`, `line`, `divider`,
`badge`, `chip`

### Common Attributes (most tags)

`size`, `padding`, `backgroundColor`, `foregroundColor`, `cornerRadius`,
`opacity`, `rotationEffect`, `scaleEffect`, `offset`, `shadow`, `blur`

### Global APIs

| API            | Purpose                 |
|----------------|-------------------------|
| `$http`        | HTTP requests (get/post/put/patch/delete) |
| `fetch`        | Shorthand GET           |
| `$storage`     | Local persistence       |
| `$getenv(key)` | Runtime env vars        |
| `$device`      | Device info             |
| `$system`      | System info             |
| `$file`        | Read/write package files|
| `$health`      | HealthKit (iOS)         |
| `$location`    | Location (iOS)          |
| `$import`      | Import .js/.jsx files   |
| `console`      | Logging                 |

## Schema (machine-readable, authoritative)

Before writing any JSX, load `references/schema.json`. It is the single
source of truth for:

- `tags[*]`: every allowed JSX tag and its allowed props (already
  denormalized — `Omit` is applied, common attrs are merged in).
- `tags[*].omit`: props you MUST NOT use on that tag (e.g. `row.omit = ["align"]`).
- `props[*].enum`: closed set of legal string values (e.g.
  `text.props.textAlign.enum = ["start","center","end","left","right"]`).
- `globals[*]`: every $-prefixed API with argument names, types and
  return types. Do not call any global not listed here.
- `invariants[*]`: cross-cutting rules dts cannot express.

Read `references/components/index.md` / `references/api/index.md` only
for prose explanations and code examples — schema.json takes precedence
on any disagreement.

## Example: Data-Fetching Widget

```jsx
const res = await $http.get("https://api.example.com/weather");
const weather = JSON.parse(res);
const size = $getenv("widget-size");

$render(
  <col size="max" padding={16} spacing={8}>
    <row>
      <icon systemName="cloud.sun.fill" size={24} color="#f59e0b" />
      <text font="headline" color="#0f172a">{weather.city}</text>
      <spacer />
      <text font="caption" color="#64748b">{weather.time}</text>
    </row>
    <text font={{ name: "title", weight: "bold" }} color="#0f172a">
      {weather.temp}°C
    </text>
    {size !== "small" && (
      <chart
        type="line"
        data={weather.hourly.map((h) => ({ label: h.hour, value: h.temp }))}
        hideXAxis
        hideYAxis
        color="#3b82f6"
      />
    )}
  </col>
);
```

## Example: Simple Static Widget

```jsx
$render(
  <col size="max" padding={16}>
    <text font="title" color="#0f172a">Hello World</text>
    <spacer />
    <text font="caption" color="#64748b">Built with JSWidget</text>
  </col>
);
```

## Checklist Before Output

For every JSX tag in your output:
- [ ] Tag name appears in `schema.tags`.
- [ ] Every prop used appears in that tag's `props`.
- [ ] No prop appears in that tag's `omit` list.
- [ ] Every prop typed with `enum` uses one of the allowed enum strings.

For every $-API call in your output:
- [ ] Identifier appears in `schema.globals`.
- [ ] If `kind: "object"`, the method appears under `methods`.
- [ ] Argument count and types match one of the listed signatures/overloads.

Global:
- [ ] All entries in `schema.invariants` hold.
- [ ] Responsive layout via `$getenv("widget-size")` if relevant.
- [ ] Error handling with try/catch + `$storage` cache fallback for network calls.
