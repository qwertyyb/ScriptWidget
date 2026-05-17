/**
 * Extracts CodeMirror autocompletion data from a ts-morph Project.
 * Returns { jsxTags, commonAttributes, tagAttributes, apis }.
 */
import { SyntaxKind } from "ts-morph";

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

export function extractCompletionData(project) {
  // 1. Common attributes from JSWidgetCommonAttributes
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

  // 2. JSX tags + tag-specific attributes
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

  // 3. Global APIs (in source order, across all files)
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

  return { jsxTags, commonAttributes, tagAttributes, apis };
}

export function buildCompletionDataJs({ jsxTags, commonAttributes, tagAttributes, apis }) {
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
