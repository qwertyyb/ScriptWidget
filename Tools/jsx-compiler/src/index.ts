import * as acorn from "acorn";
import acornJsx from "acorn-jsx";
import { walk } from "estree-walker";
import { generate } from "astring";

const parser = (acorn.Parser as any).extend(acornJsx());

function makeLiteral(value: any) {
  return { type: "Literal", value };
}

function makeIdentifier(name: string) {
  return { type: "Identifier", name };
}

function makeProperty(key: any, value: any) {
  return {
    type: "Property",
    method: false,
    shorthand: false,
    computed: false,
    key,
    value,
    kind: "init",
  };
}

function makeSpread(arg: any) {
  return { type: "SpreadElement", argument: arg };
}

function parseFactory(name: string) {
  const parts = name.split(".");
  if (parts.length === 1) {
    return makeIdentifier(parts[0]);
  }
  let node: any = makeIdentifier(parts[0]);
  for (let i = 1; i < parts.length; i++) {
    node = {
      type: "MemberExpression",
      object: node,
      property: makeIdentifier(parts[i]),
      computed: false,
      optional: false,
    };
  }
  return node;
}

function callFactory(factoryNode: any, args: any[]) {
  return {
    type: "CallExpression",
    callee: factoryNode,
    arguments: args,
    optional: false,
  };
}

function initialIsCapital(word: string) {
  return word[0] !== word[0].toLowerCase();
}

function transformName(name: any) {
  if (name.type === "JSXIdentifier") {
    return initialIsCapital(name.name)
      ? makeIdentifier(name.name)
      : makeLiteral(name.name);
  }
  if (name.type === "JSXMemberExpression") {
    return {
      type: "MemberExpression",
      object: transformName(name.object),
      property: makeIdentifier(name.property.name),
      computed: false,
      optional: false,
    };
  }
  throw new Error(`Unknown name type (${name.type})`);
}

function transformAttributes(attributes: any[]) {
  return attributes.map((attr) => {
    if (attr.type === "JSXAttribute") {
      const key = makeLiteral(attr.name.name);
      if (!attr.value) {
        return makeProperty(key, makeLiteral(true));
      }
      if (attr.value.type === "JSXExpressionContainer") {
        return makeProperty(key, attr.value.expression);
      }
      return makeProperty(key, attr.value);
    }
    if (attr.type === "JSXSpreadAttribute") {
      return makeSpread(attr.argument);
    }
    throw new Error(`Unknown attribute type (${attr.type})`);
  });
}

function transformJSX(tree: any, factoryName: string, fragmentName: string) {
  const factoryNode = parseFactory(factoryName);
  const fragmentNode = parseFactory(fragmentName);

  walk(tree, {
    enter(node: any, parent: any, prop: any, index: any) {
      if (node.type === "JSXText") {
        if (/^[ \t]*[\r\n][ \t\r\n]*$/.test(node.value)) {
          this.remove();
        } else {
          const value = node.value.replace(/^\s+/, "").replace(/\s+$/, "");
          this.replace(makeLiteral(value));
        }
        return;
      }

      if (node.type === "JSXExpressionContainer") {
        if (node.expression.type === "JSXEmptyExpression") {
          this.remove();
        } else {
          this.replace(node.expression);
        }
        return;
      }

      if (node.type === "JSXFragment") {
        const children = node.children;
        const args: any[] = [
          { ...fragmentNode },
          makeLiteral(null),
        ];
        args.push(...children);
        this.replace(callFactory({ ...factoryNode }, args));
        return;
      }

      if (node.type === "JSXElement") {
        const { name, attributes } = node.openingElement;
        const children = node.children;

        const args: any[] = [transformName(name)];

        if (attributes.length > 0) {
          args.push({
            type: "ObjectExpression",
            properties: transformAttributes(attributes),
          });
        } else {
          args.push(makeLiteral(null));
        }

        args.push(...children);

        this.replace(callFactory({ ...factoryNode }, args));
        return;
      }

      if (node.type === "JSXMemberExpression") {
        this.replace({
          type: "MemberExpression",
          object: transformName(node.object),
          property: makeIdentifier(node.property.name),
          computed: false,
          optional: false,
        });
      }

      if (node.type === "JSXIdentifier") {
        this.replace({ ...node, type: "Identifier" });
      }
    },
  });

  return tree;
}

(globalThis as any).ScriptWidgetTransform = function (input: string): string {
  const ast = parser.parse(input, {
    ecmaVersion: 2022,
    sourceType: "module",
  });
  const transformed = transformJSX(
    ast,
    "ScriptWidget.createElement",
    "ScriptWidget.Fragment"
  );
  return generate(transformed);
};
