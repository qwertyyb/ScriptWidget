#!/usr/bin/env node
/**
 * Tests for schema generation from docs/dts/*.d.ts.
 * Run: pnpm --filter completion-gen test
 */
import { Project } from "ts-morph";
import { join, dirname } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { extractSchemaData, buildSchemaJson } from "./extractCompletion.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const dtsDir = join(root, "docs/dts");

const DTS_FILE_ORDER = ["types.d.ts", "api.d.ts", "components.d.ts"];

const project = new Project({ compilerOptions: { strict: true } });
for (const f of DTS_FILE_ORDER) {
  project.addSourceFileAtPath(join(dtsDir, f));
}

const invariants = JSON.parse(
  readFileSync(join(__dirname, "invariants.json"), "utf8")
);

const schemaData = extractSchemaData(project);
const schema = buildSchemaJson(schemaData, invariants);

console.log("=== Schema Generation Tests ===\n");

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    console.log(`  PASS: ${name}`);
    passed++;
  } else {
    console.log(`  FAIL: ${name}`);
    failed++;
  }
}

// --- Tag existence ---

assert("schema has tags object", !!schema.tags && typeof schema.tags === "object");

const expectedTags = [
  "row", "col", "stack", "grid", "grid-row", "text", "date", "image",
  "gif", "spacer", "chart", "link", "divider", "icon", "label",
  "progress", "button", "toggle", "ring", "badge", "chip", "stat",
  "roundedrect", "line", "rect", "capsule", "ellipse", "circle", "gauge",
];
for (const tag of expectedTags) {
  assert(`tag "${tag}" exists`, tag in schema.tags);
}

// --- Omit handling ---

assert(
  "row.omit contains 'align'",
  schema.tags.row?.omit?.includes("align")
);
assert(
  "row.props does NOT have 'align'",
  !("align" in (schema.tags.row?.props || {}))
);
assert(
  "row.props has 'justify'",
  "justify" in (schema.tags.row?.props || {})
);

assert(
  "grid-row.omit contains 'align'",
  schema.tags["grid-row"]?.omit?.includes("align")
);
assert(
  "grid-row.props has own 'align' with extended enums",
  schema.tags["grid-row"]?.props?.align?.enum?.includes("firstBaseline")
);

assert(
  "col has no omit (or empty)",
  !schema.tags.col?.omit || schema.tags.col.omit.length === 0
);
assert(
  "col.props has 'align'",
  "align" in (schema.tags.col?.props || {})
);

// --- Denormalized common props ---

assert(
  "col.props has common 'padding'",
  "padding" in (schema.tags.col?.props || {})
);
assert(
  "text.props has common 'opacity'",
  "opacity" in (schema.tags.text?.props || {})
);
assert(
  "spacer does NOT have common props (no extendsCommon)",
  !schema.tags.spacer?.extendsCommon
);

// --- Enum values ---

assert(
  "text.props.textAlign has enum",
  Array.isArray(schema.tags.text?.props?.textAlign?.enum)
);
assert(
  "text.props.textAlign.enum includes 'center'",
  schema.tags.text?.props?.textAlign?.enum?.includes("center")
);

assert(
  "chart.props.type has enum with 'line'",
  schema.tags.chart?.props?.type?.enum?.includes("line")
);
assert(
  "chart.props.type has enum with 'bar-gantt'",
  schema.tags.chart?.props?.type?.enum?.includes("bar-gantt")
);

assert(
  "justify enum is ['start','center','end']",
  JSON.stringify(schema.tags.col?.props?.justify?.enum) ===
    JSON.stringify(["start", "center", "end"])
);

// --- Tag-specific props ---

assert(
  "chart.props.data is required",
  schema.tags.chart?.props?.data?.required === true
);

assert(
  "icon.props.systemName is required",
  schema.tags.icon?.props?.systemName?.required === true
);

// --- gauge variants ---

assert(
  "gauge has variants array",
  Array.isArray(schema.tags.gauge?.variants)
);
assert(
  "gauge has at least 2 variants",
  (schema.tags.gauge?.variants?.length || 0) >= 2
);

// --- Globals ---

assert("schema has globals object", !!schema.globals && typeof schema.globals === "object");

assert(
  "$http is kind 'object'",
  schema.globals.$http?.kind === "object"
);
assert(
  "$http.methods.get exists with args",
  schema.globals.$http?.methods?.get?.args?.length >= 1
);
assert(
  "$http.methods.get first arg is 'url'",
  schema.globals.$http?.methods?.get?.args?.[0]?.name === "url"
);
assert(
  "$http.methods.get returns Promise<string>",
  schema.globals.$http?.methods?.get?.returns === "Promise<string>"
);
assert(
  "$http has all 5 methods",
  Object.keys(schema.globals.$http?.methods || {}).length === 5
);

assert(
  "$render is kind 'function'",
  schema.globals.$render?.kind === "function"
);

assert(
  "$dynamic_island is kind 'function'",
  schema.globals.$dynamic_island?.kind === "function"
);

assert(
  "$getenv has overloads",
  Array.isArray(schema.globals.$getenv?.overloads)
);
assert(
  "$getenv has at least 2 overloads",
  (schema.globals.$getenv?.overloads?.length || 0) >= 2
);

assert(
  "$storage is kind 'object'",
  schema.globals.$storage?.kind === "object"
);
assert(
  "$storage has getString method",
  !!schema.globals.$storage?.methods?.getString
);

assert(
  "$device is kind 'object'",
  schema.globals.$device?.kind === "object"
);

assert(
  "$location is kind 'object'",
  schema.globals.$location?.kind === "object"
);

assert(
  "$health is kind 'object'",
  schema.globals.$health?.kind === "object"
);

assert(
  "console is kind 'object'",
  schema.globals.console?.kind === "object"
);

// --- Types ---

assert("schema has types object", !!schema.types && typeof schema.types === "object");

assert(
  "JSWidgetSize type is an enum",
  Array.isArray(schema.types.JSWidgetSize?.enum)
);
assert(
  "JSWidgetSize includes 'small'",
  schema.types.JSWidgetSize?.enum?.includes("small")
);
assert(
  "JSWidgetFontName type is an enum",
  Array.isArray(schema.types.JSWidgetFontName?.enum)
);

// --- Invariants ---

assert("schema has invariants array", Array.isArray(schema.invariants));
assert(
  "invariants includes render-or-island",
  schema.invariants.some((i) => i.id === "render-or-island")
);

// --- JSON serialization ---

try {
  const json = JSON.stringify(schema);
  JSON.parse(json);
  assert("schema is valid JSON (round-trip)", true);
} catch {
  assert("schema is valid JSON (round-trip)", false);
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
