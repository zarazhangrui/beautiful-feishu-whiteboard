import { parse } from "acorn";
import * as walk from "acorn-walk";
import { CssPolicyError, validateCss } from "./css-policy.mjs";

const GLOBAL_ROOTS = new Set(["window", "globalThis", "self"]);
const NETWORK_GLOBALS = new Set([
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
]);
const HISTORY_METHODS = new Set([
  "pushState",
  "replaceState",
  "go",
  "back",
  "forward",
]);
const RESOURCE_STYLE_PROPERTIES = new Set([
  "background",
  "background-image",
  "border-image",
  "border-image-source",
  "content",
  "cursor",
  "filter",
  "backdrop-filter",
  "list-style",
  "list-style-image",
  "mask",
  "mask-image",
  "clip-path",
  "shape-outside",
  "offset-path",
]);

export class JavaScriptPolicyError extends Error {
  constructor(violations) {
    super(`JavaScript policy validation failed: ${violations.map(({ code, message }) => `${code}: ${message}`).join("; ")}`);
    this.name = "JavaScriptPolicyError";
    this.violations = violations;
  }
}

function location(node) {
  return node?.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined;
}

function propertyName(node) {
  if (!node || node.type !== "MemberExpression") return null;
  if (!node.computed && node.property.type === "Identifier") return node.property.name;
  if (node.computed && node.property.type === "Literal" && typeof node.property.value === "string") return node.property.value;
  return null;
}

function rootName(node) {
  let current = node;
  while (current?.type === "MemberExpression") current = current.object;
  return current?.type === "Identifier" ? current.name : null;
}

function memberChain(node) {
  const names = [];
  let current = node;
  while (current?.type === "MemberExpression") {
    names.unshift(propertyName(current));
    current = current.object;
  }
  if (current?.type === "Identifier") names.unshift(current.name);
  return names;
}

function normalizedGlobalPath(node) {
  const chain =
    node?.type === "Identifier" ? [node.name] : memberChain(node);
  while (GLOBAL_ROOTS.has(chain[0])) chain.shift();
  return chain.every((item) => typeof item === "string") ? chain : [];
}

function hasPath(path, expected) {
  return (
    path.length === expected.length &&
    expected.every((item, index) => path[index] === item)
  );
}

function networkPath(path) {
  return (
    (path.length === 1 && NETWORK_GLOBALS.has(path[0])) ||
    hasPath(path, ["navigator", "sendBeacon"])
  );
}

function navigationPath(path) {
  return (
    hasPath(path, ["open"]) ||
    ["top", "parent", "location"].includes(path[0]) ||
    hasPath(path.slice(0, 2), ["document", "location"]) ||
    (path[0] === "history" && HISTORY_METHODS.has(path.at(-1)))
  );
}

function staticString(node) {
  if (node?.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }
  if (node?.type === "TemplateLiteral" && node.expressions.length === 0) {
    return node.quasis
      .map((item) => item.value.cooked ?? item.value.raw)
      .join("");
  }
  if (node?.type === "BinaryExpression" && node.operator === "+") {
    const left = staticString(node.left);
    const right = staticString(node.right);
    return left === null || right === null ? null : left + right;
  }
  return null;
}

function cssPropertyName(value) {
  return value
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    .toLowerCase();
}

function literalString(node) {
  return node?.type === "Literal" && typeof node.value === "string" ? node.value : null;
}

export function validateJavaScript(source, { declaredGlobals = [] } = {}) {
  const violations = [];
  let ast;
  try {
    ast = parse(String(source), { ecmaVersion: "latest", sourceType: "script", locations: true, allowHashBang: false });
  } catch (error) {
    throw new JavaScriptPolicyError([{ code: "javascript-parse", message: error.message, location: error.loc }]);
  }

  const add = (code, message, node) =>
    violations.push({
      code,
      message,
      ...(location(node) ? { location: location(node) } : {}),
    });
  const validateStyleSink = (
    property,
    valueNode,
    node,
    { declarationList = false } = {},
  ) => {
    const value = staticString(valueNode);
    if (value === null) {
      add("js-style-resource", `${property} may not receive dynamic CSS`, node);
      return;
    }
    try {
      validateCss(declarationList ? value : `${property}:${value}`, {
        context: "declarationList",
      });
    } catch (error) {
      if (!(error instanceof CssPolicyError)) throw error;
      add("js-style-resource", `${property} contains an unsafe CSS resource`, node);
    }
  };
  walk.ancestor(ast, {
    Literal(node) {
      if (typeof node.value === "string" && /(?:\bsk-[A-Za-z0-9_-]{20,}|\b(?:api[_-]?key|secret|token)\s*[:=]\s*[A-Za-z0-9_./+\-=]{16,}|\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.)/i.test(node.value)) {
        add("js-secret-literal", "secret-like literal is not allowed", node);
      }
    },
    Identifier(node, ancestors) {
      if (["eval", "Function"].includes(node.name)) {
        add("js-dynamic-code", `${node.name} references are not allowed`, node);
        return;
      }
      const parentNode = ancestors.at(-2);
      if (
        parentNode?.type === "Property" &&
        parentNode.key === node &&
        !parentNode.computed
      ) {
        return;
      }
      if (["top", "parent", "history", "open"].includes(node.name)) {
        add("js-navigation", `${node.name} window access is not allowed`, node);
        return;
      }
      if (
        !["window", "globalThis", "self", "navigator", "location", "document"].includes(
          node.name,
        )
      ) {
        return;
      }
      if (parentNode?.type === "MemberExpression" && parentNode.object === node) return;
      if (node.name === "document") {
        add("js-dynamic-code", "document aliases are not allowed", node);
      } else if (node.name === "navigator") {
        add("js-network", "navigator aliases are not allowed", node);
      } else if (
        parentNode?.type === "VariableDeclarator" &&
        parentNode.id?.type === "ObjectPattern" &&
        parentNode.id.properties.some((property) => property.key?.name === "fetch")
      ) {
        add("js-network", "network API aliases are not allowed", node);
      } else {
        add("js-navigation", `${node.name} aliases are not allowed`, node);
      }
    },
    MemberExpression(node, ancestors) {
      const property = propertyName(node);
      const root = rootName(node);
      const path = normalizedGlobalPath(node);
      if (
        node.computed &&
        property === null &&
        ["window", "globalThis", "self", "navigator"].includes(root)
      ) {
        add(
          "js-network",
          "dynamic access on network-capable globals is not allowed",
          node,
        );
      }
      if (node.computed && property === null && root === "document") {
        add("js-dynamic-code", "dynamic document access is not allowed", node);
      }
      if (networkPath(path)) {
        add("js-network", "network API references are not allowed", node);
      }
      if (navigationPath(path)) {
        add("js-navigation", "navigation and window escape are not allowed", node);
      }
      const parentNode = ancestors.at(-2);
      if (["submit", "requestSubmit"].includes(property)) {
        add("js-navigation", "form submission references are not allowed", node);
      }
      if (property === "parseFromString") {
        add("js-dynamic-code", "runtime markup parser aliases are not allowed", node);
      }
      if (
        path[0] === "document" &&
        ["createElement", "createElementNS"].includes(property) &&
        !(parentNode?.type === "CallExpression" && parentNode.callee === node)
      ) {
        add("js-dynamic-code", "element-creation aliases are not allowed", node);
      }
      if (
        property === "style" &&
        !(parentNode?.type === "MemberExpression" && parentNode.object === node)
      ) {
        add("js-style-resource", "style object aliases are not allowed", node);
      }
      if (
        property === "setProperty" &&
        memberChain(node.object).at(-1) === "style" &&
        !(parentNode?.type === "CallExpression" && parentNode.callee === node)
      ) {
        add("js-style-resource", "setProperty aliases are not allowed", node);
      }
    },
    ImportExpression(node) {
      add("js-dynamic-code", "dynamic module loading is not allowed", node);
    },
    NewExpression(node) {
      const path = normalizedGlobalPath(node.callee);
      if (hasPath(path, ["Function"])) {
        add("js-dynamic-code", "Function constructor is not allowed", node);
      }
      if (networkPath(path) && path[0] !== "fetch") {
        add("js-network", `${path.join(".")} is not allowed`, node);
      }
    },
    CallExpression(node) {
      const direct = node.callee.type === "Identifier" ? node.callee.name : null;
      const property = propertyName(node.callee);
      const path = normalizedGlobalPath(node.callee);
      if (["eval", "Function"].includes(direct)) {
        add("js-dynamic-code", `${direct} is not allowed`, node);
      }
      if (
        ["setTimeout", "setInterval"].includes(direct) &&
        literalString(node.arguments[0]) !== null
      ) {
        add("js-dynamic-code", "string timer callbacks are not allowed", node);
      }
      if (networkPath(path)) {
        add("js-network", "undeclared network API is not allowed", node);
      }
      if (
        navigationPath(path) ||
        ["submit", "requestSubmit"].includes(property)
      ) {
        add(
          "js-navigation",
          "navigation, form submission, and window escape are not allowed",
          node,
        );
      }
      if (
        path[0] === "document" &&
        ["createElement", "createElementNS"].includes(property)
      ) {
        const nameArgument = node.arguments[property === "createElement" ? 0 : 1];
        const elementName = staticString(nameArgument);
        if (elementName === null || elementName.toLowerCase() === "script") {
          add("js-dynamic-code", "dynamic or script element creation is not allowed", node);
        }
      }
      if (property === "parseFromString") {
        add("js-dynamic-code", "runtime markup parsing is not allowed", node);
      }
      if (
        property === "setProperty" &&
        memberChain(node.callee.object).at(-1) === "style"
      ) {
        const rawProperty = staticString(node.arguments[0]);
        if (rawProperty === null) {
          add("js-style-resource", "dynamic CSS property names are not allowed", node);
        } else {
          const cssProperty = cssPropertyName(rawProperty);
          if (RESOURCE_STYLE_PROPERTIES.has(cssProperty)) {
            validateStyleSink(cssProperty, node.arguments[1], node);
          }
        }
      }
      const attributeName = literalString(node.arguments[0])?.toLowerCase();
      if (
        property === "setAttribute" &&
        ["src", "href", "srcdoc"].includes(attributeName)
      ) {
        add(
          "js-dynamic-code",
          "dynamic executable/resource attributes are not allowed",
          node,
        );
      }
      if (property === "setAttribute" && attributeName === "style") {
        validateStyleSink("style", node.arguments[1], node, {
          declarationList: true,
        });
      }
      if (["insertAdjacentHTML", "write", "writeln"].includes(property)) {
        add("js-unsafe-html-sink", `${property} is not allowed`, node);
      }
    },
    AssignmentExpression(node) {
      const property = propertyName(node.left);
      const root = rootName(node.left);
      const chain = memberChain(node.left);
      if (["innerHTML", "outerHTML", "srcdoc"].includes(property)) {
        const literal = literalString(node.right);
        if (literal === null) {
          add(
            "js-unsafe-html-sink",
            `${property} may not receive dynamic data`,
            node,
          );
        } else if (
          /<\s*(?:script|iframe|object|embed|link|style|base)\b/i.test(literal)
        ) {
          add(
            "js-dynamic-code",
            `${property} may not inject executable markup`,
            node,
          );
        }
      }
      if (chain.includes("style")) {
        const cssProperty = cssPropertyName(property ?? "");
        if (property === "cssText" || property === "style") {
          validateStyleSink(cssProperty, node.right, node, { declarationList: true });
        } else if (RESOURCE_STYLE_PROPERTIES.has(cssProperty)) {
          if (node.operator !== "=") {
            add("js-style-resource", `${cssProperty} compound writes are not allowed`, node);
          } else {
            validateStyleSink(cssProperty, node.right, node);
          }
        }
      }
      if (
        property === "location" ||
        root === "location" ||
        chain.includes("location")
      ) {
        add("js-navigation", "navigation assignment is not allowed", node);
      } else if (
        ["src", "href", "action", "formAction", "srcdoc"].includes(property)
      ) {
        add("js-network", `${property} resource writes are not allowed`, node);
      }
    },
  });

  walk.ancestor(ast, {
    Identifier(node, ancestors) {
      if (!new Set(["fetch", "XMLHttpRequest", "WebSocket", "EventSource"]).has(node.name)) return;
      const parentNode = ancestors.at(-2);
      if (
        (parentNode?.type === "MemberExpression" && parentNode.property === node && !parentNode.computed) ||
        (parentNode?.type === "Property" && parentNode.key === node && !parentNode.computed)
      ) {
        return;
      }
      add("js-network", `${node.name} references are not allowed`, node);
    },
  });

  // Declared globals are accepted explicitly; the validator deliberately does not
  // attempt whole-program name resolution for generated, self-contained pages.
  if (!Array.isArray(declaredGlobals) || declaredGlobals.some((name) => typeof name !== "string" || !/^[$A-Z_a-z][$\w]*$/.test(name))) {
    add("js-declared-global", "declaredGlobals must contain JavaScript identifiers", ast);
  }
  if (violations.length) throw new JavaScriptPolicyError(violations);
  return { ok: true };
}
