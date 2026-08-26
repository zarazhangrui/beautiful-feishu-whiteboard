import { parse } from "acorn";
import * as walk from "acorn-walk";

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

  const add = (code, message, node) => violations.push({ code, message, ...(location(node) ? { location: location(node) } : {}) });
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
      if (["top", "parent"].includes(node.name)) {
        add("js-navigation", `${node.name} window access is not allowed`, node);
        return;
      }
      if (!["window", "globalThis", "self", "navigator", "location", "document"].includes(node.name)) return;
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
      const chain = memberChain(node);
      if (node.computed && property === null && ["window", "globalThis", "self", "navigator"].includes(root)) {
        add("js-network", "dynamic access on network-capable globals is not allowed", node);
      }
      if (node.computed && property === null && root === "document") {
        add("js-dynamic-code", "dynamic document access is not allowed", node);
      }
      if (
        (["window", "globalThis", "self"].includes(root) && property === "fetch") ||
        (root === "navigator" && property === "sendBeacon")
      ) {
        add("js-network", "network API references are not allowed", node);
      }
      if (
        (root === "window" && property === "open") ||
        chain.includes("location")
      ) {
        add("js-navigation", "navigation and window escape are not allowed", node);
      }
      const parentNode = ancestors.at(-2);
      if (
        root === "document" &&
        property === "createElement" &&
        !(parentNode?.type === "CallExpression" && parentNode.callee === node)
      ) {
        add("js-dynamic-code", "createElement aliases are not allowed", node);
      }
    },
    ImportExpression(node) {
      add("js-dynamic-code", "dynamic module loading is not allowed", node);
    },
    NewExpression(node) {
      const name = node.callee.type === "Identifier" ? node.callee.name : null;
      if (name === "Function") add("js-dynamic-code", "Function constructor is not allowed", node);
      if (["XMLHttpRequest", "WebSocket", "EventSource"].includes(name)) add("js-network", `${name} is not allowed`, node);
    },
    CallExpression(node) {
      const direct = node.callee.type === "Identifier" ? node.callee.name : null;
      const property = propertyName(node.callee);
      const root = rootName(node.callee);
      const chain = memberChain(node.callee);
      if (["eval", "Function"].includes(direct)) add("js-dynamic-code", `${direct} is not allowed`, node);
      if (["setTimeout", "setInterval"].includes(direct) && literalString(node.arguments[0]) !== null) add("js-dynamic-code", "string timer callbacks are not allowed", node);
      if (direct === "fetch" || ["XMLHttpRequest", "WebSocket", "EventSource"].includes(direct) || (["window", "globalThis", "self"].includes(root) && property === "fetch") || (root === "navigator" && property === "sendBeacon")) add("js-network", "undeclared network API is not allowed", node);
      if ((root === "window" && property === "open") || (chain.includes("location") && ["assign", "replace", "reload"].includes(property))) add("js-navigation", "navigation and window escape are not allowed", node);
      if (root === "document" && property === "createElement" && (literalString(node.arguments[0]) === null || literalString(node.arguments[0]).toLowerCase() === "script")) add("js-dynamic-code", "dynamic or ambiguous element creation is not allowed", node);
      if (property === "setAttribute" && ["src", "href", "srcdoc"].includes(literalString(node.arguments[0])?.toLowerCase())) add("js-dynamic-code", "dynamic executable/resource attributes are not allowed", node);
      if (["insertAdjacentHTML", "write", "writeln"].includes(property)) add("js-unsafe-html-sink", `${property} is not allowed`, node);
    },
    AssignmentExpression(node) {
      const property = propertyName(node.left);
      const root = rootName(node.left);
      const chain = memberChain(node.left);
      if (["innerHTML", "outerHTML", "srcdoc"].includes(property)) {
        const literal = literalString(node.right);
        if (literal === null) add("js-unsafe-html-sink", `${property} may not receive dynamic data`, node);
        else if (/<\s*(?:script|iframe|object|embed|link|style|base)\b/i.test(literal)) add("js-dynamic-code", `${property} may not inject executable markup`, node);
      }
      if (property === "location" || root === "location" || chain.includes("location")) add("js-navigation", "navigation assignment is not allowed", node);
      else if (["src", "href", "action", "formAction", "srcdoc"].includes(property)) add("js-network", `${property} resource writes are not allowed`, node);
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
