import { readFileSync } from "node:fs";
import Ajv from "ajv";

const schema = JSON.parse(
  readFileSync(
    new URL("../../schemas/visualization-spec.schema.json", import.meta.url),
    "utf8",
  ),
);

const ajv = new Ajv({ allErrors: true, strict: true, $data: false });
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

const USEFUL_AJV_PARAMS = [
  "additionalProperty",
  "missingProperty",
  "allowedValues",
];

function normalizedAjvParams(params) {
  return Object.fromEntries(
    USEFUL_AJV_PARAMS.filter((key) =>
      Object.prototype.hasOwnProperty.call(params, key),
    ).map((key) => [key, params[key]]),
  );
}

function schemaViolations(errors = []) {
  return errors.map((error) => ({
    code: "schema-error",
    path: error.instancePath || "/",
    message: error.message ?? "does not match the VisualizationSpec schema",
    keyword: error.keyword,
    params: normalizedAjvParams(error.params),
  }));
}

const ID_COLLECTIONS = [
  ["nodes", "duplicate-node-id"],
  ["edges", "duplicate-edge-id"],
  ["metrics", "duplicate-metric-id"],
  ["series", "duplicate-series-id"],
  ["steps", "duplicate-step-id"],
  ["annotations", "duplicate-annotation-id"],
];

function idViolations(content) {
  const globalIds = new Map();
  const violations = [];

  for (const [collection, duplicateCode] of ID_COLLECTIONS) {
    const localIds = new Set();
    for (const [index, item] of (content[collection] ?? []).entries()) {
      const path = `/content/${collection}/${index}/id`;
      if (localIds.has(item.id)) {
        violations.push({
          code: duplicateCode,
          path,
          message: `Duplicate ${collection} id: ${item.id}`,
        });
        continue;
      }

      localIds.add(item.id);
      const previousCollection = globalIds.get(item.id);
      if (previousCollection) {
        violations.push({
          code: "duplicate-content-id",
          path,
          message: `Id ${item.id} is already used by ${previousCollection}`,
        });
      } else {
        globalIds.set(item.id, collection);
      }
    }
  }

  return violations;
}

function danglingReferenceViolations(content) {
  const nodes = content.nodes ?? [];
  const edges = content.edges ?? [];
  const steps = content.steps ?? [];
  const annotations = content.annotations ?? [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const stepIds = new Set(steps.map((step) => step.id));
  const annotationTargetIds = new Set(
    ["nodes", "edges", "metrics", "series", "steps"].flatMap((collection) =>
      (content[collection] ?? []).map((item) => item.id),
    ),
  );
  const violations = [];

  for (const [index, node] of nodes.entries()) {
    if (node.parentId !== undefined && !nodeIds.has(node.parentId)) {
      violations.push({
        code: "dangling-parent-id",
        path: `/content/nodes/${index}/parentId`,
        message: `Node parentId references missing node id: ${node.parentId}`,
      });
    }
  }

  for (const [index, edge] of edges.entries()) {
    for (const endpoint of ["source", "target"]) {
      if (!nodeIds.has(edge[endpoint])) {
        violations.push({
          code: "dangling-edge",
          path: `/content/edges/${index}/${endpoint}`,
          message: `Edge ${endpoint} references missing node id: ${edge[endpoint]}`,
        });
      }
    }
  }

  for (const [stepIndex, step] of steps.entries()) {
    for (const [dependencyIndex, dependencyId] of (
      step.dependsOn ?? []
    ).entries()) {
      if (!stepIds.has(dependencyId)) {
        violations.push({
          code: "dangling-step-dependency",
          path: `/content/steps/${stepIndex}/dependsOn/${dependencyIndex}`,
          message: `Step dependency references missing step id: ${dependencyId}`,
        });
      }
    }
  }

  for (const [index, annotation] of annotations.entries()) {
    if (
      annotation.targetId !== undefined &&
      !annotationTargetIds.has(annotation.targetId)
    ) {
      violations.push({
        code: "dangling-annotation-target",
        path: `/content/annotations/${index}/targetId`,
        message: `Annotation targetId references missing content id: ${annotation.targetId}`,
      });
    }
  }

  return violations;
}

function semanticViolations(value) {
  const violations = [
    ...idViolations(value.content),
    ...danglingReferenceViolations(value.content),
  ];

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
