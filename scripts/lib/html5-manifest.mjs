import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { parse } from "parse5";
import { validateVisualizationSpec } from "./visualization-spec.mjs";

const VISUALIZATION_TYPES = new Set([
  "dashboard",
  "chart",
  "network",
  "flow",
  "timeline",
  "presentation",
  "prototype",
  "form",
  "knowledge-tool",
  "immersive",
]);
const HEIGHT_MODES = new Set(["auto", "viewport"]);
const BROWSER_TARGETS = Object.freeze([390, 820, 1440]);
const REQUIRED_CHECK_IDS = Object.freeze(["static", "browser"]);
const DEPENDENCY_KEYS = Object.freeze([
  "allowedTypes",
  "crossorigin",
  "fallback",
  "id",
  "integrity",
  "url",
]);

function policyError(code, detail = "") {
  const error = new Error(`${code}${detail ? `: ${detail}` : ""}`);
  error.code = code;
  return error;
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function exactKeys(value, expected) {
  return (
    isPlainObject(value) &&
    isDeepStrictEqual(Object.keys(value).sort(), [...expected].sort())
  );
}

export function validateDependencyPolicy(policy) {
  const fail = (detail) => {
    throw policyError("invalid-dependency-policy", detail);
  };
  if (!exactKeys(policy, ["protocolVersion", "dependencies"])) {
    fail("top-level keys");
  }
  if (policy.protocolVersion !== "1.0" || !Array.isArray(policy.dependencies)) {
    fail("protocolVersion or dependencies");
  }

  const ids = new Set();
  const urls = new Set();
  for (const [index, dependency] of policy.dependencies.entries()) {
    const label = `dependencies[${index}]`;
    if (!exactKeys(dependency, DEPENDENCY_KEYS)) fail(`${label} keys`);
    if (!/^[a-z0-9-]+@\d+\.\d+\.\d+$/.test(dependency.id)) {
      fail(`${label}.id`);
    }
    let parsedUrl;
    try {
      parsedUrl = new URL(dependency.url);
    } catch {
      fail(`${label}.url`);
    }
    if (parsedUrl.protocol !== "https:" || parsedUrl.href !== dependency.url) {
      fail(`${label}.url`);
    }
    if (!/^sha384-[A-Za-z0-9+/]{64}$/.test(dependency.integrity)) {
      fail(`${label}.integrity`);
    }
    if (dependency.crossorigin !== "anonymous") fail(`${label}.crossorigin`);
    if (
      !Array.isArray(dependency.allowedTypes) ||
      dependency.allowedTypes.length === 0 ||
      new Set(dependency.allowedTypes).size !== dependency.allowedTypes.length ||
      dependency.allowedTypes.some((type) => !VISUALIZATION_TYPES.has(type))
    ) {
      fail(`${label}.allowedTypes`);
    }
    if (typeof dependency.fallback !== "string" || !dependency.fallback.trim()) {
      fail(`${label}.fallback`);
    }
    if (ids.has(dependency.id)) fail(`duplicate id ${dependency.id}`);
    if (urls.has(dependency.url)) fail(`duplicate url ${dependency.url}`);
    ids.add(dependency.id);
    urls.add(dependency.url);
  }
  return true;
}

const dependencyPolicy = JSON.parse(
  readFileSync(new URL("../../html5/dependencies.json", import.meta.url), "utf8"),
);
validateDependencyPolicy(dependencyPolicy);
const dependenciesByUrl = new Map(
  dependencyPolicy.dependencies.map((dependency) => [dependency.url, dependency]),
);

function sha256(html) {
  return createHash("sha256").update(html, "utf8").digest("hex");
}

function normalizeValidation(validation, htmlSha256) {
  if (!isPlainObject(validation)) {
    throw policyError("invalid-validation-evidence", "expected plain object");
  }
  if (Object.keys(validation).some((key) => !["status", "checks"].includes(key))) {
    throw policyError("invalid-validation-evidence", "unknown field");
  }
  if (validation.status === "pending") {
    if (
      validation.checks !== undefined &&
      (!Array.isArray(validation.checks) || validation.checks.length !== 0)
    ) {
      throw policyError("invalid-validation-evidence", "pending checks");
    }
    return { status: "pending", checks: [] };
  }
  if (validation.status !== "passed" || !Array.isArray(validation.checks)) {
    throw policyError("invalid-validation-evidence", "status or checks");
  }

  const byId = new Map();
  for (const check of validation.checks) {
    if (!exactKeys(check, ["id", "status", "htmlSha256"])) {
      throw policyError("invalid-validation-evidence", "check shape");
    }
    if (!REQUIRED_CHECK_IDS.includes(check.id) || byId.has(check.id)) {
      throw policyError("invalid-validation-evidence", "check id");
    }
    if (check.status !== "passed" || check.htmlSha256 !== htmlSha256) {
      throw policyError("invalid-validation-evidence", `unbound ${check.id}`);
    }
    byId.set(check.id, check);
  }
  if (byId.size !== REQUIRED_CHECK_IDS.length) {
    throw policyError("invalid-validation-evidence", "missing required check");
  }
  return {
    status: "passed",
    checks: REQUIRED_CHECK_IDS.map((id) => structuredClone(byId.get(id))),
  };
}

function walkNodes(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walkNodes(child, visit);
  if (node.content) walkNodes(node.content, visit);
}

function externalScripts(html) {
  const scripts = [];
  walkNodes(parse(html), (node) => {
    if (node.tagName !== "script") return;
    const attributes = new Map(
      (node.attrs ?? []).map((item) => [item.name, item.value]),
    );
    if (attributes.has("src")) scripts.push(attributes);
  });
  return scripts;
}

export function resolveAllowedDependency(url) {
  const dependency = dependenciesByUrl.get(url);
  return dependency ? structuredClone(dependency) : null;
}

function discoverDependencies(html, type) {
  const dependencies = [];
  const seen = new Set();
  for (const attributes of externalScripts(html)) {
    const url = attributes.get("src");
    const dependency = resolveAllowedDependency(url);
    if (!dependency) throw policyError("dependency-not-allowlisted", url);
    if (!attributes.has("integrity")) {
      throw policyError("dependency-integrity-required", url);
    }
    if (attributes.get("integrity") !== dependency.integrity) {
      throw policyError("dependency-integrity-mismatch", url);
    }
    if (!attributes.has("crossorigin")) {
      throw policyError("dependency-crossorigin-required", url);
    }
    if (attributes.get("crossorigin") !== dependency.crossorigin) {
      throw policyError("dependency-crossorigin-mismatch", url);
    }
    if (!dependency.allowedTypes.includes(type)) {
      throw policyError("dependency-not-allowed-for-type", `${url} (${type})`);
    }
    if (!seen.has(dependency.id)) {
      dependencies.push(dependency);
      seen.add(dependency.id);
    }
  }
  return dependencies;
}

function assertInputs({ html, spec, heightMode }) {
  if (typeof html !== "string") {
    throw policyError("invalid-html", "expected string");
  }
  const specReport = validateVisualizationSpec(spec);
  if (!specReport.ok) {
    throw policyError(
      "invalid-visualization-spec",
      specReport.violations.map((item) => item.code).join(","),
    );
  }
  if (!HEIGHT_MODES.has(heightMode)) {
    throw policyError("invalid-height-mode", String(heightMode));
  }
}

export async function buildHtml5Manifest({
  html,
  spec,
  heightMode,
  validation = { status: "pending" },
}) {
  assertInputs({ html, spec, heightMode });
  const htmlSha256 = sha256(html);
  return {
    protocolVersion: dependencyPolicy.protocolVersion,
    type: spec.type,
    heightMode,
    dependencies: discoverDependencies(html, spec.type),
    interactions: [...spec.interactions],
    browserTargets: [...BROWSER_TARGETS],
    html: { bytes: Buffer.byteLength(html, "utf8"), sha256: htmlSha256 },
    validation: normalizeValidation(validation, htmlSha256),
  };
}

export function verifyManifest({ html, spec, manifest }) {
  if (!isPlainObject(manifest)) {
    throw policyError("invalid-manifest", "expected plain object");
  }
  assertInputs({ html, spec, heightMode: manifest.heightMode });
  const htmlSha256 = sha256(html);
  const expected = {
    protocolVersion: dependencyPolicy.protocolVersion,
    type: spec.type,
    heightMode: manifest.heightMode,
    dependencies: discoverDependencies(html, spec.type),
    interactions: [...spec.interactions],
    browserTargets: [...BROWSER_TARGETS],
    html: { bytes: Buffer.byteLength(html, "utf8"), sha256: htmlSha256 },
    validation: normalizeValidation(manifest.validation, htmlSha256),
  };
  if (!isDeepStrictEqual(manifest, expected)) throw policyError("manifest-drift");
  return true;
}
