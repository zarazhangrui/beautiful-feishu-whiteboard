import { parse } from "acorn";
import * as walk from "acorn-walk";
import { CssPolicyError, validateCss } from "./css-policy.mjs";

const GLOBAL_ROOTS = new Set(["window", "globalThis", "self"]);
const WINDOW_HANDLES = new Set([
  "defaultView",
  "opener",
  "frames",
  "contentWindow",
  "contentDocument",
]);
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
const RESOURCE_PROPERTY_NAMES = new Set([
  "src",
  "srcset",
  "href",
  "action",
  "formaction",
  "srcdoc",
  "poster",
  "data",
  "codebase",
  "cite",
  "background",
  "profile",
  "manifest",
  "ping",
  "archive",
  "longdesc",
  "usemap",
]);
const DOM_MUTATION_METHODS = new Set(["setAttribute", "setAttributeNS"]);
const EXECUTABLE_HTML_SINKS = new Set([
  "innerHTML",
  "outerHTML",
  "insertAdjacentHTML",
  "write",
  "writeln",
  "createContextualFragment",
  "setHTMLUnsafe",
]);
const CSSOM_SINKS = new Set([
  "insertRule",
  "addRule",
  "replace",
  "replaceSync",
]);
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const SAFE_HTML_ELEMENTS = new Set([
  "article", "aside", "button", "canvas", "caption", "col", "colgroup",
  "dd", "details", "dialog", "div", "dl", "dt", "em", "fieldset",
  "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5",
  "h6", "header", "hr", "input", "label", "legend", "li", "main",
  "nav", "ol", "option", "output", "p", "section", "select", "small",
  "span", "strong", "summary", "table", "tbody", "td", "textarea",
  "tfoot", "th", "thead", "tr", "ul",
]);
const SAFE_SVG_ELEMENTS = new Set([
  "svg", "g", "defs", "marker", "rect", "circle", "ellipse", "line",
  "polyline", "text", "tspan", "path",
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
  if (node.computed) return staticString(node.property);
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

function hasPathSuffix(path, expected) {
  return (
    path.length >= expected.length &&
    expected.every(
      (item, index) => path[path.length - expected.length + index] === item,
    )
  );
}

function networkPath(path) {
  return (
    (path.length === 1 && NETWORK_GLOBALS.has(path[0])) ||
    hasPathSuffix(path, ["navigator", "sendBeacon"]) ||
    (path.some((item) => WINDOW_HANDLES.has(item)) &&
      NETWORK_GLOBALS.has(path.at(-1)))
  );
}

function navigationPath(path) {
  return (
    hasPath(path, ["open"]) ||
    ["top", "parent", "location"].includes(path[0]) ||
    hasPath(path.slice(0, 2), ["document", "location"]) ||
    path.some((item) => WINDOW_HANDLES.has(item)) ||
    (path[0] === "history" && HISTORY_METHODS.has(path.at(-1)))
  );
}

function genericMutationPath(path) {
  return hasPath(path, ["Object", "assign"]) || hasPath(path, ["Reflect", "set"]);
}

function staticString(node) {
  if (
    node?.type === "Literal" &&
    ["string", "number", "boolean", "bigint"].includes(typeof node.value)
  ) {
    return String(node.value);
  }
  if (node?.type === "TemplateLiteral") {
    let value = node.quasis[0].value.cooked ?? node.quasis[0].value.raw;
    for (let index = 0; index < node.expressions.length; index += 1) {
      const expression = staticString(node.expressions[index]);
      if (expression === null) return null;
      const quasi = node.quasis[index + 1];
      value += expression + (quasi.value.cooked ?? quasi.value.raw);
    }
    return value;
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
  const validateObjectPattern = (pattern) => {
    for (const property of pattern.properties) {
      if (property.type !== "Property") continue;
      const name = property.computed
        ? staticString(property.key)
        : property.key.type === "Identifier"
          ? property.key.name
          : staticString(property.key);
      if (WINDOW_HANDLES.has(name)) {
        add("js-navigation", `${name} window handle aliases are not allowed`, property);
      } else if (EXECUTABLE_HTML_SINKS.has(name)) {
        add("js-unsafe-html-sink", `${name} HTML sink aliases are not allowed`, property);
      } else if (CSSOM_SINKS.has(name) || name === "adoptedStyleSheets") {
        add("js-style-resource", `${name} CSSOM aliases are not allowed`, property);
      } else if (DOM_MUTATION_METHODS.has(name)) {
        add("js-dynamic-code", `${name} aliases are not allowed`, property);
      }
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
      if (
        ["top", "parent", "history", "open"].includes(node.name) ||
        WINDOW_HANDLES.has(node.name)
      ) {
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
      if (genericMutationPath(path)) {
        add("js-dynamic-code", "generic property mutation APIs are not allowed", node);
      }
      if (EXECUTABLE_HTML_SINKS.has(property)) {
        add(
          "js-unsafe-html-sink",
          `${property} executable HTML sink is not allowed`,
          node,
        );
      }
      if (CSSOM_SINKS.has(property) || property === "adoptedStyleSheets") {
        add(
          "js-style-resource",
          `${property} CSSOM mutation is not allowed`,
          node,
        );
      }
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
      if (
        DOM_MUTATION_METHODS.has(property) &&
        !(parentNode?.type === "CallExpression" && parentNode.callee === node)
      ) {
        add("js-dynamic-code", `${property} aliases are not allowed`, node);
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
      if (genericMutationPath(path)) {
        add("js-dynamic-code", "generic property mutation APIs are not allowed", node);
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
        const namespaced = property === "createElementNS";
        const namespace = namespaced ? staticString(node.arguments[0]) : HTML_NAMESPACE;
        const elementName = staticString(node.arguments[namespaced ? 1 : 0]);
        const normalizedName = elementName?.toLowerCase() ?? null;
        const safe =
          (namespace === HTML_NAMESPACE && SAFE_HTML_ELEMENTS.has(normalizedName)) ||
          (namespace === SVG_NAMESPACE && SAFE_SVG_ELEMENTS.has(normalizedName));
        if (!safe) {
          add("js-dynamic-code", "dynamic or unsafe element creation is not allowed", node);
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
          validateStyleSink(cssProperty, node.arguments[1], node);
        }
      }
      if (DOM_MUTATION_METHODS.has(property)) {
        const namespaced = property === "setAttributeNS";
        const namespaceNode = namespaced ? node.arguments[0] : null;
        const nameNode = node.arguments[namespaced ? 1 : 0];
        const valueNode = node.arguments[namespaced ? 2 : 1];
        const namespaceIsStatic =
          !namespaced ||
          (namespaceNode?.type === "Literal" && namespaceNode.value === null) ||
          staticString(namespaceNode) !== null;
        const qualifiedName = staticString(nameNode);
        if (!namespaceIsStatic || qualifiedName === null) {
          add(
            "js-dynamic-code",
            "dynamic attribute namespaces or names are not allowed",
            node,
          );
        } else {
          const attributeName = qualifiedName.toLowerCase();
          const localName = attributeName.split(":").at(-1);
          if (
            RESOURCE_PROPERTY_NAMES.has(localName) ||
            /^on/.test(localName) ||
            ["http-equiv", "xmlns"].includes(localName)
          ) {
            add(
              "js-dynamic-code",
              `${qualifiedName} is an executable or resource attribute`,
              node,
            );
          } else if (localName === "style") {
            validateStyleSink("style", valueNode, node, {
              declarationList: true,
            });
          }
        }
      }
      if (EXECUTABLE_HTML_SINKS.has(property)) {
        add("js-unsafe-html-sink", `${property} is not allowed`, node);
      }
    },
    AssignmentExpression(node) {
      const property = propertyName(node.left);
      const root = rootName(node.left);
      const chain = memberChain(node.left);
      if (["innerHTML", "outerHTML", "srcdoc"].includes(property)) {
        add(
          "js-unsafe-html-sink",
          `${property} executable HTML assignment is not allowed`,
          node,
        );
      }
      if (chain.includes("style")) {
        if (property === null) {
          add("js-style-resource", "dynamic style properties are not allowed", node);
        }
        const cssProperty = cssPropertyName(property ?? "");
        if (property === "cssText" || property === "style") {
          validateStyleSink(cssProperty, node.right, node, { declarationList: true });
        } else if (
          RESOURCE_STYLE_PROPERTIES.has(cssProperty) ||
          cssProperty.startsWith("--")
        ) {
          if (node.operator !== "=") {
            add("js-style-resource", `${cssProperty} compound writes are not allowed`, node);
          } else {
            validateStyleSink(cssProperty, node.right, node);
          }
        } else if (staticString(node.right) !== null) {
          // Static values on every style property, including custom properties,
          // still pass through the CSS resource policy. Dynamic values remain
          // available for non-resource presentation/state properties.
          validateStyleSink(cssProperty, node.right, node);
        }
      }
      if (
        property === "location" ||
        root === "location" ||
        chain.includes("location")
      ) {
        add("js-navigation", "navigation assignment is not allowed", node);
      } else if (RESOURCE_PROPERTY_NAMES.has(property?.toLowerCase())) {
        add("js-network", `${property} resource writes are not allowed`, node);
      }
    },
    UpdateExpression(node) {
      const property = propertyName(node.argument);
      if (RESOURCE_PROPERTY_NAMES.has(property?.toLowerCase())) {
        add("js-network", `${property} resource writes are not allowed`, node);
      }
    },
  });

  walk.full(ast, (node) => {
    if (node.type === "ObjectPattern") validateObjectPattern(node);
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
