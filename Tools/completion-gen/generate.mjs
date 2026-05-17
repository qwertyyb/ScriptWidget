#!/usr/bin/env node
/**
 * Parses docs/dts/*.d.ts (the split source of truth) and writes:
 * - ../../Editor/editorfe/src/completionData.js   (CodeMirror autocompletion data)
 * - ../../docs/public/editor/jswidget.d.ts          (combined .d.ts for Monaco editor)
 */
import { Project } from "ts-morph";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { extractCompletionData, buildCompletionDataJs } from "./extractCompletion.mjs";
import { buildCombinedDts } from "./expandTypes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const dtsDir = join(root, "docs/dts");

const editorOut = join(root, "Editor/editorfe/src/completionData.js");
const siteDtsDir = join(root, "docs/public/editor");
const siteDts = join(siteDtsDir, "jswidget.d.ts");

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
