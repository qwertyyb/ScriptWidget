#!/usr/bin/env node
/**
 * Parses docs/dts/*.d.ts (the split source of truth) and writes:
 * - ../../Editor/editorfe/src/completionData.js       (CodeMirror autocompletion data)
 * - ../../docs/public/editor/jswidget.d.ts            (combined .d.ts for Monaco editor)
 * - ../../docs/jswidget-script-gen/references/schema.json  (Skill bundle, pretty)
 * - ../../docs/public/editor/schema.json              (docs site, minified)
 */
import { Project } from "ts-morph";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  extractCompletionData,
  buildCompletionDataJs,
  extractSchemaData,
  buildSchemaJson,
} from "./extractCompletion.mjs";
import { buildCombinedDts } from "./expandTypes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const dtsDir = join(root, "docs/dts");

const editorOut = join(root, "Editor/editorfe/src/completionData.js");
const siteDtsDir = join(root, "docs/public/editor");
const siteDts = join(siteDtsDir, "jswidget.d.ts");
const skillSchemaOut = join(root, "docs/jswidget-script-gen/references/schema.json");
const siteSchemaOut = join(siteDtsDir, "schema.json");

const DTS_FILE_ORDER = ["types.d.ts", "api.d.ts", "components.d.ts"];

// ── Parse & extract ──

const project = new Project({ compilerOptions: { strict: true } });
for (const f of DTS_FILE_ORDER) {
  project.addSourceFileAtPath(join(dtsDir, f));
}

const completionData = extractCompletionData(project);
writeFileSync(editorOut, buildCompletionDataJs(completionData), "utf8");
console.log("Wrote:", editorOut);

const combined = buildCombinedDts(dtsDir, DTS_FILE_ORDER);
mkdirSync(siteDtsDir, { recursive: true });
writeFileSync(siteDts, combined, "utf8");
console.log("Wrote:", siteDts);

// ── Schema for Skill & docs site ──

const invariants = JSON.parse(
  readFileSync(join(__dirname, "invariants.json"), "utf8")
);

const schemaData = extractSchemaData(project);

const globalNames = new Set(Object.keys(schemaData.globals));
for (const inv of invariants) {
  const refs = inv.rule.match(/\$\w+/g) || [];
  for (const ref of refs) {
    if (!globalNames.has(ref)) {
      console.warn(`Warning: invariant "${inv.id}" references ${ref} which is not in globals`);
    }
  }
}

const schema = buildSchemaJson(schemaData, invariants);

mkdirSync(dirname(skillSchemaOut), { recursive: true });
writeFileSync(skillSchemaOut, JSON.stringify(schema, null, 2), "utf8");
console.log("Wrote:", skillSchemaOut);

writeFileSync(siteSchemaOut, JSON.stringify(schema), "utf8");
console.log("Wrote:", siteSchemaOut);
