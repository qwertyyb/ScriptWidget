import * as acorn from "acorn";
import acornJsx from "acorn-jsx";
import { walk } from "estree-walker";
import { generate } from "astring";
import fs from "fs";
import path from "path";

const parser = acorn.Parser.extend(acornJsx());

function makeLiteral(value) {
  return { type: "Literal", value };
}
function makeIdentifier(name) {
  return { type: "Identifier", name };
}
function makeProperty(key, value) {
  return { type: "Property", method: false, shorthand: false, computed: false, key, value, kind: "init" };
}
function makeSpread(arg) {
  return { type: "SpreadElement", argument: arg };
}
function parseFactory(name) {
  const parts = name.split(".");
  if (parts.length === 1) return makeIdentifier(parts[0]);
  let node = makeIdentifier(parts[0]);
  for (let i = 1; i < parts.length; i++) {
    node = { type: "MemberExpression", object: node, property: makeIdentifier(parts[i]), computed: false, optional: false };
  }
  return node;
}
function callFactory(factoryNode, args) {
  return { type: "CallExpression", callee: factoryNode, arguments: args, optional: false };
}
function initialIsCapital(word) {
  return word[0] !== word[0].toLowerCase();
}
function transformName(name) {
  if (name.type === "JSXIdentifier") {
    return initialIsCapital(name.name) ? makeIdentifier(name.name) : makeLiteral(name.name);
  }
  if (name.type === "JSXMemberExpression") {
    return { type: "MemberExpression", object: transformName(name.object), property: makeIdentifier(name.property.name), computed: false, optional: false };
  }
  throw new Error(`Unknown name type (${name.type})`);
}
function transformAttributes(attributes) {
  return attributes.map((attr) => {
    if (attr.type === "JSXAttribute") {
      const key = makeLiteral(attr.name.name);
      if (!attr.value) return makeProperty(key, makeLiteral(true));
      if (attr.value.type === "JSXExpressionContainer") return makeProperty(key, attr.value.expression);
      return makeProperty(key, attr.value);
    }
    if (attr.type === "JSXSpreadAttribute") return makeSpread(attr.argument);
    throw new Error(`Unknown attribute type (${attr.type})`);
  });
}
function transformJSX(tree, factoryName, fragmentName) {
  const factoryNode = parseFactory(factoryName);
  const fragmentNode = parseFactory(fragmentName);
  walk(tree, {
    enter(node, parent, prop, index) {
      if (node.type === "JSXText") {
        if (/^[ \t]*[\r\n][ \t\r\n]*$/.test(node.value)) { this.remove(); }
        else {
          const value = node.value.replace(/^\s+/, "").replace(/\s+$/, "");
          this.replace(makeLiteral(value));
        }
        return;
      }
      if (node.type === "JSXExpressionContainer") {
        if (node.expression.type === "JSXEmptyExpression") { this.remove(); }
        else { this.replace(node.expression); }
        return;
      }
      if (node.type === "JSXFragment") {
        const children = node.children;
        const args = [{ ...fragmentNode }, makeLiteral(null)];
        args.push(...children);
        this.replace(callFactory({ ...factoryNode }, args));
        return;
      }
      if (node.type === "JSXElement") {
        const { name, attributes } = node.openingElement;
        const children = node.children;
        const args = [transformName(name)];
        if (attributes.length > 0) {
          args.push({ type: "ObjectExpression", properties: transformAttributes(attributes) });
        } else {
          args.push(makeLiteral(null));
        }
        args.push(...children);
        this.replace(callFactory({ ...factoryNode }, args));
        return;
      }
      if (node.type === "JSXMemberExpression") {
        this.replace({ type: "MemberExpression", object: transformName(node.object), property: makeIdentifier(node.property.name), computed: false, optional: false });
      }
      if (node.type === "JSXIdentifier") {
        this.replace({ ...node, type: "Identifier" });
      }
    },
  });
  return tree;
}

function transform(input) {
  const ast = parser.parse(input, { ecmaVersion: 2022, sourceType: "module" });
  const transformed = transformJSX(ast, "JSWidget.createElement", "JSWidget.Fragment");
  return generate(transformed);
}

const testCases = [
  {
    name: "Basic tag + string prop",
    input: `<text font="title">Hello</text>`,
    check: (out) => out.includes('JSWidget.createElement("text"') && out.includes('"font"'),
  },
  {
    name: "Self-closing tag",
    input: `<spacer />`,
    check: (out) => out.includes('JSWidget.createElement("spacer"'),
  },
  {
    name: "Expression prop",
    input: `<text color={myColor}>Hi</text>`,
    check: (out) => out.includes("myColor"),
  },
  {
    name: "Object expression prop (double braces)",
    input: `<vstack frame={{maxWidth: "infinity", maxHeight: "infinity"}}>test</vstack>`,
    check: (out) => out.includes("maxWidth") && out.includes("maxHeight"),
  },
  {
    name: "Nested JSX",
    input: `<vstack><text>a</text><text>b</text></vstack>`,
    check: (out) => (out.match(/JSWidget\.createElement/g) || []).length === 3,
  },
  {
    name: "Fragment <>...</>",
    input: `<><text>a</text><text>b</text></>`,
    check: (out) => out.includes("JSWidget.Fragment") && (out.match(/JSWidget\.createElement/g) || []).length === 3,
  },
  {
    name: "Custom component (uppercase tag)",
    input: `<MyComponent message="hello" />`,
    check: (out) => out.includes("JSWidget.createElement(MyComponent"),
  },
  {
    name: "Expression children",
    input: `<text>{value}</text>`,
    check: (out) => out.includes("value"),
  },
  {
    name: "Optional chaining",
    input: `var x = data?.name;`,
    check: (out) => out.includes("?."),
  },
  {
    name: "Nullish coalescing",
    input: `var x = data ?? "default";`,
    check: (out) => out.includes("??"),
  },
  {
    name: "Logical expression in JSX",
    input: `<text>{a && b}</text>`,
    check: (out) => out.includes("&&"),
  },
  {
    name: "Conditional expression in JSX",
    input: `<text>{a ? "yes" : "no"}</text>`,
    check: (out) => out.includes("?") && out.includes(":"),
  },
  {
    name: "Arrow function with JSX in map",
    input: `var items = arr.map(x => <text>{x}</text>);`,
    check: (out) => out.includes("JSWidget.createElement"),
  },
  {
    name: "Async function wrapping (simulates runtime)",
    input: `async function $main() { try { $render(<text font="title">Hello</text>); } catch(e) { console.error(e); } }`,
    check: (out) => out.includes("$render") && out.includes("JSWidget.createElement"),
  },
  {
    name: "Template literal in JSX child",
    input: "<text>{`hello ${name}`}</text>",
    check: (out) => out.includes("name"),
  },
  {
    name: "Number prop",
    input: `<text padding={12}>Hi</text>`,
    check: (out) => out.includes("12"),
  },
];

console.log("=== JSX Compiler Unit Tests ===\n");

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  try {
    const output = transform(tc.input);
    if (tc.check(output)) {
      console.log(`  PASS: ${tc.name}`);
      passed++;
    } else {
      console.log(`  FAIL: ${tc.name}`);
      console.log(`    Input:  ${tc.input}`);
      console.log(`    Output: ${output}`);
      failed++;
    }
  } catch (e) {
    console.log(`  ERROR: ${tc.name}`);
    console.log(`    Input: ${tc.input}`);
    console.log(`    Error: ${e.message}`);
    failed++;
  }
}

console.log(`\n=== File Tests (Script.bundle) ===\n`);

const scriptBundlePath = path.resolve("../../Shared/ScriptWidgetRuntime/Resource/Script.bundle");

const fileTests = [
  "template/Datetime Current/main.jsx",
  "component/fragment/main.jsx",
  "api/usage-map/main.jsx",
  "component/custom-component/main.jsx",
  "template/Air Quality Now/main.jsx",
  "template/Check Is Working Day Today/main.jsx",
  "template/Crypto Price Ticker/main.jsx",
  "template/New Episode Tracker/main.jsx",
  "template/System Status Panel/main.jsx",
  "api/animation/clock.jsx",
  "api/animation/swing.jsx",
  "template/Animation Aquarium/main.jsx",
  "template/Battery & Brightness/main.jsx",
  "template/Countdown/main.jsx",
  "template/Currency Pulse/main.jsx",
  "template/Habit Streak Tracker/main.jsx",
  "template/Health Steps Ring/main.jsx",
  "template/Storage Ring/main.jsx",
  "template/Stock Snapshot/main.jsx",
];

for (const relPath of fileTests) {
  const fullPath = path.join(scriptBundlePath, relPath);
  try {
    const content = fs.readFileSync(fullPath, "utf-8");
    const wrappedContent = `async function $main() { try { ${content} } catch(e){ console.error(e); } }`;
    const output = transform(wrappedContent);
    if (output.includes("JSWidget.createElement")) {
      console.log(`  PASS: ${relPath}`);
      passed++;
    } else {
      console.log(`  FAIL: ${relPath} (no createElement in output)`);
      failed++;
    }
  } catch (e) {
    console.log(`  ERROR: ${relPath}`);
    console.log(`    ${e.message}`);
    failed++;
  }
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
