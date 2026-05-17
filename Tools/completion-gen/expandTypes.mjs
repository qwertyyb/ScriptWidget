/**
 * Inline-expands type alias references in a combined .d.ts source file.
 * Used to produce a Monaco-friendly jswidget.d.ts where hover/completions
 * show fully expanded types instead of opaque alias names.
 */
import { Project, SyntaxKind, Node } from "ts-morph";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const NEVER_INLINE = new Set([
  "Record",
  "Promise",
  "Omit",
  "Partial",
  "Pick",
  "Readonly",
  "Required",
  "Exclude",
  "Extract",
  "NonNullable",
  "Parameters",
  "ReturnType",
  "InstanceType",
  "Awaited",
  "Array",
  "ReadonlyArray",
]);

function needsParens(text) {
  const t = text.trim();
  return (t.includes("|") || t.includes("&")) && !t.startsWith("(");
}

function collectTypeAliases(sourceFile) {
  const map = new Map();
  for (const alias of sourceFile.getTypeAliases()) {
    const node = alias.getTypeNode();
    if (node) map.set(alias.getName(), node);
  }
  return map;
}

function expandTypeNode(typeNode, aliasMap, stack = []) {
  if (Node.isTypeReference(typeNode)) {
    const name = typeNode.getTypeName().getText();
    const typeArgs = typeNode.getTypeArguments();

    if (typeArgs.length > 0) {
      const expandedArgs = typeArgs.map((a) => expandTypeNode(a, aliasMap, stack));
      const argsText = expandedArgs.join(", ");
      if (expandedArgs.some((t, i) => t !== typeArgs[i].getText())) {
        return `${name}<${argsText}>`;
      }
      return typeNode.getText();
    }

    if (NEVER_INLINE.has(name) || !aliasMap.has(name)) {
      return typeNode.getText();
    }
    if (stack.includes(name)) return name;
    return expandTypeNode(aliasMap.get(name), aliasMap, [...stack, name]);
  }

  if (Node.isUnionTypeNode(typeNode)) {
    return typeNode
      .getTypeNodes()
      .map((n) => expandTypeNode(n, aliasMap, stack))
      .join(" | ");
  }

  if (Node.isIntersectionTypeNode(typeNode)) {
    return typeNode
      .getTypeNodes()
      .map((n) => {
        const part = expandTypeNode(n, aliasMap, stack);
        return needsParens(part) ? `(${part})` : part;
      })
      .join(" & ");
  }

  if (Node.isArrayTypeNode(typeNode)) {
    const el = expandTypeNode(typeNode.getElementTypeNode(), aliasMap, stack);
    return needsParens(el) ? `(${el})[]` : `${el}[]`;
  }

  if (Node.isParenthesizedTypeNode(typeNode)) {
    return `(${expandTypeNode(typeNode.getTypeNode(), aliasMap, stack)})`;
  }

  if (Node.isTypeLiteral(typeNode)) {
    for (const member of typeNode.getMembers()) {
      let tn = null;
      if (
        member.getKind() === SyntaxKind.PropertySignature ||
        member.getKind() === SyntaxKind.IndexSignature
      ) {
        tn = member.getTypeNode();
      } else if (Node.isMethodSignature(member)) {
        tn = member.getReturnTypeNode();
        for (const param of member.getParameters()) {
          const pt = param.getTypeNode();
          if (pt) replaceTypeNode(pt, aliasMap);
        }
      }
      if (tn) replaceTypeNode(tn, aliasMap);
    }
    return typeNode.getText();
  }

  if (Node.isTupleTypeNode(typeNode)) {
    const expanded = typeNode
      .getElements()
      .map((el) => {
        if (Node.isNamedTupleMember(el)) {
          const tn = el.getTypeNode();
          return tn ? expandTypeNode(tn, aliasMap, stack) : el.getText();
        }
        return expandTypeNode(el, aliasMap, stack);
      })
      .join(", ");
    return `[${expanded}]`;
  }

  return typeNode.getText();
}

function replaceTypeNode(typeNode, aliasMap) {
  const expanded = expandTypeNode(typeNode, aliasMap);
  if (expanded !== typeNode.getText()) {
    typeNode.replaceWithText(expanded);
  }
}

function expandNestedTypeAliases(sourceFile) {
  for (let pass = 0; pass < 16; pass++) {
    let changed = false;
    const aliasMap = collectTypeAliases(sourceFile);
    for (const alias of sourceFile.getTypeAliases()) {
      const typeNode = alias.getTypeNode();
      if (!typeNode) continue;
      const before = typeNode.getText();
      replaceTypeNode(typeNode, aliasMap);
      if (typeNode.getText() !== before) changed = true;
    }
    if (!changed) break;
  }

  const aliasMap = collectTypeAliases(sourceFile);
  const refs = sourceFile
    .getDescendantsOfKind(SyntaxKind.TypeReference)
    .sort((a, b) => b.getStart() - a.getStart());

  for (const ref of refs) {
    replaceTypeNode(ref, aliasMap);
  }
}

/**
 * Combines dts source files and expands nested type aliases.
 * @param {string} dtsDir - path to the docs/dts/ directory
 * @param {string[]} fileOrder - ordered list of .d.ts filenames to merge
 * @returns {string} expanded d.ts content
 */
export function buildCombinedDts(dtsDir, fileOrder) {
  const header =
    "/** Auto-generated from docs/dts/ by Tools/completion-gen/generate.mjs — do not edit by hand */\n\n";
  const body = fileOrder.map((f) => {
    const content = readFileSync(join(dtsDir, f), "utf8");
    return content.replace(/^\/\*\*[\s\S]*?\*\/\s*\n/, "");
  }).join("\n");

  const expandProject = new Project({ compilerOptions: { strict: true } });
  const sourceFile = expandProject.createSourceFile(
    "jswidget.d.ts",
    header + body,
    { overwrite: true }
  );
  expandNestedTypeAliases(sourceFile);
  return sourceFile.getFullText();
}
