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

// ========== Schema extraction ==========

const TYPE_SIMPLIFICATIONS = {
  JSWidgetColorValue: "color",
  JSWidgetFont: "font",
  JSWidgetPadding: "padding",
  JSWidgetGradient: "gradient",
  JSWidgetShadow: "shadow",
};

function simplifyTypeName(typeNode) {
  if (!typeNode) return "unknown";
  const text = typeNode.getText();
  return TYPE_SIMPLIFICATIONS[text] || text;
}

function extractDefaultFromDoc(doc) {
  if (!doc) return null;
  const m = doc.match(/默认\s*[`「]?([^`」）)\n,]+)/);
  if (m) return m[1].trim();
  return null;
}

function extractSchemaAttr(member) {
  const name = member.getName();
  const doc = extractJsDoc(member);
  const typeNode = member.getTypeNode();
  const isRequired = !member.hasQuestionToken();
  const values = typeNode ? extractStringLiterals(typeNode) : [];

  const result = {};
  if (values.length) {
    result.enum = values;
  } else {
    result.type = simplifyTypeName(typeNode);
  }
  if (doc) result.doc = doc;
  if (isRequired) result.required = true;

  const def = extractDefaultFromDoc(doc);
  if (def) result.default = def;

  return [name, result];
}

function extractOmitsFromType(typeNode) {
  if (!typeNode) return [];
  const omits = [];

  function visit(node) {
    const kind = node.getKind();
    if (kind === SyntaxKind.TypeReference) {
      const typeName = node.getTypeName?.()?.getText?.();
      if (typeName === "Omit") {
        const args = node.getTypeArguments();
        if (args.length >= 2) {
          const keysNode = args[1];
          if (keysNode.getKind() === SyntaxKind.LiteralType) {
            omits.push(keysNode.getText().replace(/^["']|["']$/g, ""));
          } else if (keysNode.getKind() === SyntaxKind.UnionType) {
            for (const m of keysNode.getTypeNodes()) {
              if (m.getKind() === SyntaxKind.LiteralType) {
                omits.push(m.getText().replace(/^["']|["']$/g, ""));
              }
            }
          }
        }
      }
    }
    if (kind === SyntaxKind.IntersectionType) {
      for (const child of node.getTypeNodes()) visit(child);
    }
  }

  visit(typeNode);
  return omits;
}

function collectPropsFromTypeLiteral(tl) {
  const props = {};
  for (const m of tl.getMembers()) {
    if (m.getKind() === SyntaxKind.PropertySignature) {
      const [n, a] = extractSchemaAttr(m);
      props[n] = a;
    }
  }
  return props;
}

function collectTagInfo(typeNode) {
  const empty = { extendsCommon: false, omit: [], props: {}, variants: null };
  if (!typeNode) return empty;

  const kind = typeNode.getKind();

  if (kind === SyntaxKind.TypeLiteral) {
    return { ...empty, props: collectPropsFromTypeLiteral(typeNode) };
  }

  if (kind === SyntaxKind.TypeReference) {
    const tn = typeNode.getTypeName?.()?.getText?.();
    if (tn === "JSWidgetCommonAttributes") {
      return { ...empty, extendsCommon: true };
    }
    if (tn === "Omit") {
      return { ...empty, extendsCommon: true, omit: extractOmitsFromType(typeNode) };
    }
    return empty;
  }

  if (kind === SyntaxKind.IntersectionType) {
    let extendsCommon = false;
    let omit = [];
    const props = {};
    let variants = null;

    for (const child of typeNode.getTypeNodes()) {
      const ck = child.getKind();

      if (ck === SyntaxKind.TypeReference) {
        const tn = child.getTypeName?.()?.getText?.();
        if (tn === "JSWidgetCommonAttributes") {
          extendsCommon = true;
        } else if (tn === "Omit") {
          extendsCommon = true;
          omit = extractOmitsFromType(child);
        }
      }

      if (ck === SyntaxKind.TypeLiteral) {
        Object.assign(props, collectPropsFromTypeLiteral(child));
      }

      if (ck === SyntaxKind.ParenthesizedType) {
        const inner = child.getTypeNode();
        if (inner?.getKind() === SyntaxKind.UnionType) {
          variants = [];
          for (const branch of inner.getTypeNodes()) {
            if (branch.getKind() === SyntaxKind.TypeLiteral) {
              variants.push(collectPropsFromTypeLiteral(branch));
            }
          }
        }
      }
    }

    return { extendsCommon, omit, props, variants };
  }

  return empty;
}

function extractParamInfo(param) {
  const result = {
    name: param.getName(),
    type: param.getTypeNode()?.getText() || "unknown",
  };
  if (param.isRestParameter()) {
    result.rest = true;
  } else if (param.hasQuestionToken() || param.isOptional()) {
    result.optional = true;
  }
  return result;
}

function extractMethodSig(member) {
  const args = member.getParameters().map(extractParamInfo);
  const returns = member.getReturnTypeNode()?.getText() || "void";
  const result = { args, returns };
  const doc = extractJsDoc(member);
  if (doc) result.doc = doc;
  return result;
}

function resolveTypeMembers(typeNode, project) {
  if (!typeNode) return null;
  const kind = typeNode.getKind();

  if (kind === SyntaxKind.TypeLiteral) return typeNode.getMembers();

  if (kind === SyntaxKind.TypeReference) {
    const name = typeNode.getTypeName?.()?.getText?.();
    if (!name) return null;
    for (const sf of project.getSourceFiles()) {
      const alias = sf.getTypeAlias(name);
      if (alias) return resolveTypeMembers(alias.getTypeNode(), project);
    }
  }

  return null;
}

function extractFuncSig(stmt) {
  const args = stmt.getParameters().map(extractParamInfo);
  const returns = stmt.getReturnTypeNode()?.getText() || "void";
  const result = { args, returns };
  const doc = extractJsDoc(stmt);
  if (doc) result.doc = doc;
  return result;
}

export function extractSchemaData(project) {
  // 1. Common attributes
  let commonInterface = null;
  for (const sf of project.getSourceFiles()) {
    commonInterface = sf.getInterface("JSWidgetCommonAttributes");
    if (commonInterface) break;
  }
  if (!commonInterface) throw new Error("JSWidgetCommonAttributes not found");

  const commonProps = {};
  for (const member of commonInterface.getMembers()) {
    if (member.getKind() !== SyntaxKind.PropertySignature) continue;
    const [name, attr] = extractSchemaAttr(member);
    commonProps[name] = attr;
  }

  // 2. Tags
  let intrinsic = null;
  for (const sf of project.getSourceFiles()) {
    const ns = sf.getModule("JSWidget");
    if (!ns) continue;
    const jsxNs = ns.getModule("JSX");
    if (!jsxNs) continue;
    intrinsic = jsxNs.getInterface("IntrinsicElements");
    if (intrinsic) break;
  }
  if (!intrinsic) throw new Error("IntrinsicElements not found");

  const tags = {};
  for (const prop of intrinsic.getMembers()) {
    if (prop.getKind() !== SyntaxKind.PropertySignature) continue;
    const tagName = stripQuotes(prop.getName());
    const tagDoc = extractJsDoc(prop);
    const info = collectTagInfo(prop.getTypeNode());
    tags[tagName] = info;
    if (tagDoc) tags[tagName].doc = tagDoc;
  }

  // 3. Globals with full signatures
  const globals = {};
  const seenGlobals = new Set();

  for (const sf of project.getSourceFiles()) {
    for (const stmt of sf.getStatements()) {
      const kind = stmt.getKind();

      if (kind === SyntaxKind.VariableStatement) {
        const stmtDoc = extractJsDoc(stmt);
        for (const decl of stmt.getDeclarationList().getDeclarations()) {
          const name = decl.getName();
          if (seenGlobals.has(name)) continue;
          seenGlobals.add(name);

          const typeNode = decl.getTypeNode();
          const members = resolveTypeMembers(typeNode, project);

          if (members) {
            const methods = {};
            for (const member of members) {
              if (member.getKind() === SyntaxKind.MethodSignature) {
                methods[member.getName()] = extractMethodSig(member);
              }
            }
            const entry = { kind: "object", methods };
            const doc = extractJsDoc(decl) || stmtDoc;
            if (doc) entry.doc = doc;
            globals[name] = entry;
          }
        }
      }

      if (kind === SyntaxKind.FunctionDeclaration) {
        const name = stmt.getName();
        if (!name) continue;

        if (seenGlobals.has(name)) {
          const existing = globals[name];
          if (!existing) continue;
          const sig = extractFuncSig(stmt);
          if (existing.overloads) {
            existing.overloads.push(sig);
          } else {
            const first = { args: existing.args, returns: existing.returns };
            if (existing.doc) first.doc = existing.doc;
            globals[name] = { kind: "function", overloads: [first, sig] };
          }
          continue;
        }

        seenGlobals.add(name);
        const sig = extractFuncSig(stmt);
        globals[name] = { kind: "function", ...sig };
      }
    }
  }

  // 4. Referenced types
  const types = {};
  for (const sf of project.getSourceFiles()) {
    for (const alias of sf.getTypeAliases()) {
      const name = alias.getName();
      const doc = extractJsDoc(alias);
      const typeNode = alias.getTypeNode();
      if (!typeNode) continue;

      const literals = extractStringLiterals(typeNode);
      if (literals.length > 0) {
        types[name] = { enum: literals };
        if (doc) types[name].doc = doc;
        continue;
      }

      if (typeNode.getKind() === SyntaxKind.TypeLiteral) {
        const shape = {};
        for (const member of typeNode.getMembers()) {
          if (member.getKind() === SyntaxKind.PropertySignature) {
            const propType = simplifyTypeName(member.getTypeNode());
            const opt = member.hasQuestionToken();
            shape[member.getName()] = opt ? `${propType}?` : propType;
          }
          if (member.getKind() === SyntaxKind.MethodSignature) {
            const ret = member.getReturnTypeNode()?.getText() || "void";
            const params = member.getParameters().map((p) => {
              const t = p.getTypeNode()?.getText() || "unknown";
              return p.hasQuestionToken() || p.isOptional() ? `${t}?` : t;
            }).join(", ");
            shape[member.getName()] = `(${params}) => ${ret}`;
          }
        }
        if (Object.keys(shape).length > 0) {
          types[name] = { shape };
          if (doc) types[name].doc = doc;
          continue;
        }
      }

      const text = typeNode.getText();
      if (text.length <= 200) {
        types[name] = { type: text };
        if (doc) types[name].doc = doc;
      }
    }
  }

  return { commonProps, tags, globals, types };
}

export function buildSchemaJson(schemaData, invariants) {
  const { commonProps, tags, globals, types } = schemaData;

  const denormalizedTags = {};
  for (const [tagName, info] of Object.entries(tags)) {
    const entry = {};
    if (info.doc) entry.doc = info.doc;
    if (info.extendsCommon) entry.extendsCommon = true;
    if (info.omit.length > 0) entry.omit = info.omit;

    const mergedProps = {};
    if (info.extendsCommon) {
      const omitSet = new Set(info.omit);
      for (const [name, attr] of Object.entries(commonProps)) {
        if (!omitSet.has(name)) mergedProps[name] = attr;
      }
    }
    for (const [name, attr] of Object.entries(info.props)) {
      mergedProps[name] = attr;
    }

    entry.props = mergedProps;
    if (info.variants) entry.variants = info.variants;

    denormalizedTags[tagName] = entry;
  }

  return { tags: denormalizedTags, globals, types, invariants };
}
