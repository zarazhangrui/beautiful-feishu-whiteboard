import { readFileSync } from "node:fs";
import Ajv from "ajv";

const schema = JSON.parse(
  readFileSync(
    new URL("../../schemas/visualization-spec.schema.json", import.meta.url),
    "utf8",
  ),
);

const ajv = new Ajv({ allErrors: true, strict: true });
const validateSchema = ajv.compile(schema);

const INTERACTIONS_BY_TYPE = Object.freeze({
  dashboard: new Set(["select", "filter", "hover", "toggle"]),
  chart: new Set(["select", "filter", "pan", "zoom", "hover"]),
  network: new Set(["select", "filter", "pan", "zoom", "drag", "hover"]),
  flow: new Set(["select", "filter", "pan", "zoom", "hover"]),
  timeline: new Set(["select", "filter", "pan", "zoom", "hover", "play"]),
  presentation: new Set(["select", "navigate", "play"]),
  prototype: new Set(["select", "toggle", "navigate", "input", "submit"]),
  form: new Set(["navigate", "input", "submit"]),
  "knowledge-tool": new Set([
    "select",
    "filter",
    "toggle",
    "navigate",
    "input",
    "submit",
  ]),
  immersive: new Set(["select", "pan", "zoom", "drag", "play", "navigate"]),
});

function schemaViolations(errors = []) {
  return errors.map((error) => ({
    code: "schema-error",
    path: error.instancePath || "/",
    message: error.message ?? "does not match the VisualizationSpec schema",
    keyword: error.keyword,
  }));
}

function duplicateIdViolations(items, code, path) {
  const seen = new Set();
  const violations = [];

  for (const [index, item] of items.entries()) {
    if (seen.has(item.id)) {
      violations.push({
        code,
        path: `${path}/${index}/id`,
        message: `Duplicate id: ${item.id}`,
      });
    } else {
      seen.add(item.id);
    }
  }

  return violations;
}

function semanticViolations(value) {
  const nodes = value.content.nodes ?? [];
  const edges = value.content.edges ?? [];
  const steps = value.content.steps ?? [];
  const violations = [
    ...duplicateIdViolations(nodes, "duplicate-node-id", "/content/nodes"),
  ];
  const nodeIds = new Set(nodes.map((node) => node.id));

  for (const [index, edge] of edges.entries()) {
    const missing = [edge.source, edge.target].filter((id) => !nodeIds.has(id));
    if (missing.length > 0) {
      violations.push({
        code: "dangling-edge",
        path: `/content/edges/${index}`,
        message: `Edge references missing node id${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`,
      });
    }
  }

  violations.push(
    ...duplicateIdViolations(steps, "duplicate-step-id", "/content/steps"),
  );

  const supported = INTERACTIONS_BY_TYPE[value.type];
  for (const [index, interaction] of value.interactions.entries()) {
    if (!supported.has(interaction)) {
      violations.push({
        code: "unsupported-interaction",
        path: `/interactions/${index}`,
        message: `Interaction ${interaction} is not supported for type ${value.type}`,
      });
    }
  }

  return violations;
}

export function validateVisualizationSpec(value) {
  if (!validateSchema(value)) {
    const violations = schemaViolations(validateSchema.errors);
    return { ok: false, violations };
  }

  const violations = semanticViolations(value);
  return { ok: violations.length === 0, violations };
}
