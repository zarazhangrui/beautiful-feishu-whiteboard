import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { readFileSync } from "node:fs";
import { validateVisualizationSpec } from "./visualization-spec.mjs";

const dependencyPolicy = JSON.parse(
  readFileSync(new URL("../../html5/dependencies.json", import.meta.url), "utf8"),
);

const dependenciesByUrl = new Map(
  dependencyPolicy.dependencies.map((dependency) => [dependency.url, dependency]),
);

const HEIGHT_MODES = new Set(["auto", "viewport"]);
const BROWSER_TARGETS = Object.freeze([390, 820, 1440]);
const VALIDATION_STATUSES = new Set(["not-run", "passed", "failed"]);

function policyError(code, detail = "") {
  const suffix = detail ? `: ${detail}` : "";
  const error = new Error(`${code}${suffix}`);
  error.code = code;
  return error;
}

function sha256(html) {
  return createHash("sha256").update(html, "utf8").digest("hex");
}

function normalizeValidation(validation) {
  const normalized = Object.keys(validation).length
    ? structuredClone(validation)
    : { status: "not-run" };
  if (!VALIDATION_STATUSES.has(normalized.status)) {
    throw policyError("invalid-validation-status", String(normalized.status));
  }
  return normalized;
}

function findTagEnd(html, start) {
  let quote = null;
  for (let index = start; index < html.length; index += 1) {
    const character = html[index];
    if (quote !== null) {
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === ">") {
      return index;
    }
  }
  throw policyError("malformed-script-tag", "unterminated start tag");
}

function parseAttributes(source) {
  const attributes = new Map();
  let index = 0;
  while (index < source.length) {
    while (/\s/.test(source[index] ?? "")) index += 1;
    if (index >= source.length || source[index] === "/") break;

    const nameStart = index;
    while (/[^\s=/>]/.test(source[index] ?? "")) index += 1;
    if (nameStart === index) {
      throw policyError("malformed-script-tag", source.slice(index));
    }
    const name = source.slice(nameStart, index).toLowerCase();
    while (/\s/.test(source[index] ?? "")) index += 1;

    let value = "";
    if (source[index] === "=") {
      index += 1;
      while (/\s/.test(source[index] ?? "")) index += 1;
      const quote = source[index];
      if (quote === '"' || quote === "'") {
        index += 1;
        const valueStart = index;
        while (index < source.length && source[index] !== quote) index += 1;
        if (index >= source.length) {
          throw policyError("malformed-script-tag", `unterminated ${name}`);
        }
        value = source.slice(valueStart, index);
        index += 1;
      } else {
        const valueStart = index;
        while (/[^\s>]/.test(source[index] ?? "")) index += 1;
        value = source.slice(valueStart, index);
      }
    }
    if (attributes.has(name)) {
      throw policyError("malformed-script-tag", `duplicate ${name}`);
    }
    attributes.set(name, value);
  }
  return attributes;
}

// This deliberately narrow tokenizer recognizes real script start tags, quoted
// attributes, comments, and raw script bodies. Task 3 replaces it with parse5,
// which becomes the single HTML parser for the full security policy.
function scriptSources(html) {
  const sources = [];
  let cursor = 0;
  while (cursor < html.length) {
    const open = html.indexOf("<", cursor);
    if (open === -1) break;
    if (html.startsWith("<!--", open)) {
      const close = html.indexOf("-->", open + 4);
      cursor = close === -1 ? html.length : close + 3;
      continue;
    }

    const tagMatch = /^<script(?=[\s/>])/i.exec(html.slice(open));
    if (!tagMatch) {
      cursor = open + 1;
      continue;
    }

    const tagEnd = findTagEnd(html, open + tagMatch[0].length);
    const attributeSource = html.slice(open + tagMatch[0].length, tagEnd);
    const attributes = parseAttributes(attributeSource);
    if (attributes.has("src")) sources.push(attributes.get("src"));

    const closing = /<\/script\s*>/gi;
    closing.lastIndex = tagEnd + 1;
    const closeMatch = closing.exec(html);
    cursor = closeMatch ? closing.lastIndex : tagEnd + 1;
  }
  return sources;
}

export function resolveAllowedDependency(url) {
  const dependency = dependenciesByUrl.get(url);
  return dependency ? structuredClone(dependency) : null;
}

function discoverDependencies(html, type) {
  const dependencies = [];
  const seen = new Set();
  for (const url of scriptSources(html)) {
    const dependency = resolveAllowedDependency(url);
    if (!dependency) throw policyError("dependency-not-allowlisted", url);
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

function assertInputs({ html, spec, heightMode, validation }) {
  if (typeof html !== "string") throw policyError("invalid-html", "expected string");
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
  normalizeValidation(validation);
}

export async function buildHtml5Manifest({
  html,
  spec,
  heightMode,
  validation = {},
}) {
  assertInputs({ html, spec, heightMode, validation });
  return {
    protocolVersion: dependencyPolicy.protocolVersion,
    type: spec.type,
    heightMode,
    dependencies: discoverDependencies(html, spec.type),
    interactions: [...spec.interactions],
    browserTargets: [...BROWSER_TARGETS],
    html: {
      bytes: Buffer.byteLength(html, "utf8"),
      sha256: sha256(html),
    },
    validation: normalizeValidation(validation),
  };
}

export function verifyManifest({ html, spec, manifest }) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw policyError("invalid-manifest", "expected object");
  }
  assertInputs({
    html,
    spec,
    heightMode: manifest.heightMode,
    validation: manifest.validation ?? {},
  });
  const expected = {
    protocolVersion: dependencyPolicy.protocolVersion,
    type: spec.type,
    heightMode: manifest.heightMode,
    dependencies: discoverDependencies(html, spec.type),
    interactions: [...spec.interactions],
    browserTargets: [...BROWSER_TARGETS],
    html: {
      bytes: Buffer.byteLength(html, "utf8"),
      sha256: sha256(html),
    },
    validation: normalizeValidation(manifest.validation ?? {}),
  };
  if (!isDeepStrictEqual(manifest, expected)) {
    throw policyError("manifest-drift");
  }
  return true;
}
