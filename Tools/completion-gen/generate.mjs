#!/usr/bin/env node
/**
 * Parses docs/dts/*.d.ts (the split source of truth) and writes:
 * - ../../Editor/editorfe/src/completionData.js   (CodeMirror autocompletion data)
 * - ../../docs/public/editor/jswidget.d.ts          (combined .d.ts for Monaco editor)
 */
import { Project, SyntaxKind } from "ts-morph";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const dtsDir = join(root, "docs/dts");

const editorOut = join(root, "Editor/editorfe/src/completionData.js");
const siteDtsDir = join(root, "docs/public/editor");
const siteDts = join(siteDtsDir, "jswidget.d.ts");

const DTS_FILE_ORDER = ["types.d.ts", "api.d.ts", "components.d.ts"];

// ── Parse .d.ts files ──

const project = new Project({ compilerOptions: { strict: true } });
for (const f of DTS_FILE_ORDER) {
  project.addSourceFileAtPath(join(dtsDir, f));
}

// ── Helpers ──

function extractJsDoc(node) {
  for (const r of node.getLeadingCommentRanges()) {
    const text = r.getText();
    const match = text.match(/\/\*\*\s*([\s\S]*?)\s*\*\//);
    if (match) return match[1].replace(/^\s*\*\s?/gm, "").trim();
  }
  return "";
}

function extractStringLiterals(typeNode) {
  if (typeNode.getKind() === SyntaxKind.UnionType) {
    const members = typeNode.getTypeNodes();
    if (members.every((m) => m.getKind() === SyntaxKind.LiteralType)) {
      return members
        .map((m) => m.getText().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
  }
  return [];
}

function extractAttr(member) {
  const name = member.getName();
  const info = extractJsDoc(member);
  const typeNode = member.getTypeNode();
  const values = typeNode ? extractStringLiterals(typeNode) : [];
  const result = { name };
  if (info) result.info = info;
  if (values.length) result.values = values;
  return result;
}

function stripQuotes(s) {
  return s.replace(/^["']|["']$/g, "");
}

function findTypeLiterals(typeNode) {
  if (!typeNode) return [];
  const kind = typeNode.getKind();
  if (kind === SyntaxKind.TypeLiteral) return [typeNode];
  if (kind === SyntaxKind.IntersectionType) {
    return typeNode
      .getTypeNodes()
      .filter((t) => t.getKind() === SyntaxKind.TypeLiteral);
  }
  return [];
}

// ── 1. Extract common attributes from JSWidgetCommonAttributes ──

let commonInterface = null;
for (const sf of project.getSourceFiles()) {
  commonInterface = sf.getInterface("JSWidgetCommonAttributes");
  if (commonInterface) break;
}
if (!commonInterface) {
  throw new Error("JSWidgetCommonAttributes interface not found in docs/dts/");
}

const commonAttributes = [];
for (const member of commonInterface.getMembers()) {
  if (member.getKind() !== SyntaxKind.PropertySignature) continue;
  commonAttributes.push(extractAttr(member));
}

// ── 2. Extract JSX tags + tag-specific attributes ──

let intrinsic = null;
for (const sf of project.getSourceFiles()) {
  const ns = sf.getModule("JSWidget");
  if (!ns) continue;
  const jsxNs = ns.getModule("JSX");
  if (!jsxNs) continue;
  intrinsic = jsxNs.getInterface("IntrinsicElements");
  if (intrinsic) break;
}
if (!intrinsic) {
  throw new Error("JSWidget.JSX.IntrinsicElements not found in docs/dts/");
}

const jsxTags = [];
const tagAttributes = {};

for (const prop of intrinsic.getMembers()) {
  if (prop.getKind() !== SyntaxKind.PropertySignature) continue;
  const tagName = stripQuotes(prop.getName());
  jsxTags.push(tagName);

  const typeNode = prop.getTypeNode();
  const typeLiterals = findTypeLiterals(typeNode);

  const attrs = [];
  for (const tl of typeLiterals) {
    for (const member of tl.getMembers()) {
      if (member.getKind() !== SyntaxKind.PropertySignature) continue;
      attrs.push(extractAttr(member));
    }
  }
  tagAttributes[tagName] = attrs;
}

// ── 3. Extract global APIs (in source order, across all files) ──

const apis = [];
const seenApis = new Set();

function addApi(name, methods) {
  if (seenApis.has(name)) return;
  seenApis.add(name);
  apis.push({ name, methods });
}

for (const sf of project.getSourceFiles()) {
  for (const stmt of sf.getStatements()) {
    const kind = stmt.getKind();

    if (kind === SyntaxKind.VariableStatement) {
      for (const decl of stmt.getDeclarationList().getDeclarations()) {
        const name = decl.getName();
        const type = decl.getType();
        const methods = type
          .getProperties()
          .filter((p) =>
            p.getDeclarations().some(
              (d) =>
                d.getKind() === SyntaxKind.MethodSignature ||
                d.getKind() === SyntaxKind.PropertySignature
            )
          )
          .map((p) => p.getName());
        addApi(name, methods);
      }
    }

    if (kind === SyntaxKind.FunctionDeclaration) {
      const name = stmt.getName();
      if (name) addApi(name, []);
    }
  }
}

// ── Write outputs ──

function buildCompletionDataJs() {
  const lines = [];
  lines.push(
    "/** Auto-generated from docs/dts/ by Tools/completion-gen/generate.mjs — do not edit by hand */"
  );
  lines.push("");
  lines.push("export const jsxTags = " + JSON.stringify(jsxTags, null, 2) + ";");
  lines.push("");
  lines.push(
    "export const commonAttributes = " +
      JSON.stringify(commonAttributes, null, 2) +
      ";"
  );
  lines.push("");
  lines.push(
    "export const tagAttributes = " +
      JSON.stringify(tagAttributes, null, 2) +
      ";"
  );
  lines.push("");
  lines.push("export const apis = " + JSON.stringify(apis, null, 2) + ";");
  lines.push("");
  return lines.join("\n");
}

function buildCombinedDts() {
  const header =
    "/** Auto-generated from docs/dts/ by Tools/completion-gen/generate.mjs — do not edit by hand */\n\n";
  const body = DTS_FILE_ORDER.map((f) => {
    const content = readFileSync(join(dtsDir, f), "utf8");
    return content.replace(/^\/\*\*[\s\S]*?\*\/\s*\n/, "");
  }).join("\n");
  return header + body;
}

writeFileSync(editorOut, buildCompletionDataJs(), "utf8");

const combined = buildCombinedDts();
mkdirSync(siteDtsDir, { recursive: true });
writeFileSync(siteDts, combined, "utf8");

console.log("Wrote:", editorOut);
console.log("Wrote:", siteDts);
