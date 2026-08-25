import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateVisualizationSpec } from "../scripts/lib/visualization-spec.mjs";

const TYPES = [
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
];

function makeSpec(overrides = {}) {
  const base = {
    version: "1.0",
    type: "network",
    title: "Contract fixture",
    summary: "Exercises the medium-independent visualization contract",
    content: {},
    theme: { palette: "coastal-morning", tokens: {} },
    interactions: [],
    accessibility: {
      alt: "Contract fixture",
      instructions: "Use the declared controls to explore the visualization.",
    },
  };

  return structuredClone({ ...base, ...overrides });
}

function codes(value) {
  return validateVisualizationSpec(value).violations.map((item) => item.code);
}

test("accepts a network spec with declared interactions", async () => {
  const value = JSON.parse(
    await readFile("test/fixtures/spec/network.valid.json", "utf8"),
  );
  assert.equal(validateVisualizationSpec(value).ok, true);
});

test("rejects duplicate node ids and dangling edges", async () => {
  const value = JSON.parse(
    await readFile("test/fixtures/spec/network.invalid.json", "utf8"),
  );
  const report = validateVisualizationSpec(value);
  assert.equal(report.ok, false);
  assert.deepEqual(
    report.violations.map((item) => item.code),
    ["duplicate-node-id", "dangling-edge"],
  );
});

test("accepts every advertised visualization type without optional collections", () => {
  for (const type of TYPES) {
    assert.deepEqual(validateVisualizationSpec(makeSpec({ type })), {
      ok: true,
      violations: [],
    });
  }
});

test("rejects unknown top-level, collection, and entity properties with useful diagnostics", () => {
  const cases = [
    {
      value: { ...makeSpec(), typo: true },
      additionalProperty: "typo",
    },
    {
      value: makeSpec({ content: { nodez: [] } }),
      additionalProperty: "nodez",
    },
    {
      value: makeSpec({
        content: {
          nodes: [{ id: "node", label: "Node", unexpected: true }],
        },
      }),
      additionalProperty: "unexpected",
    },
    {
      value: makeSpec({
        content: {
          nodes: [{ id: "node", label: "Node" }],
          edges: [
            {
              id: "edge",
              source: "node",
              target: "node",
              unexpected: true,
            },
          ],
        },
      }),
      additionalProperty: "unexpected",
    },
    {
      value: makeSpec({
        content: {
          metrics: [
            { id: "metric", label: "Metric", value: 1, unexpected: true },
          ],
        },
      }),
      additionalProperty: "unexpected",
    },
    {
      value: makeSpec({
        content: {
          series: [
            { id: "series", label: "Series", data: [1], unexpected: true },
          ],
        },
      }),
      additionalProperty: "unexpected",
    },
    {
      value: makeSpec({
        content: {
          steps: [{ id: "step", label: "Step", unexpected: true }],
        },
      }),
      additionalProperty: "unexpected",
    },
    {
      value: makeSpec({
        content: {
          annotations: [
            { id: "annotation", text: "Note", unexpected: true },
          ],
        },
      }),
      additionalProperty: "unexpected",
    },
  ];

  for (const { value, additionalProperty } of cases) {
    const report = validateVisualizationSpec(value);
    assert.equal(report.ok, false);
    assert.equal(report.violations[0].code, "schema-error");
    assert.equal(
      report.violations[0].params.additionalProperty,
      additionalProperty,
    );
  }
});

test("keeps each typed entity metadata object open for extensions", () => {
  const value = makeSpec({
    content: {
      nodes: [
        {
          id: "node",
          label: "Node",
          metadata: { rendererHint: "accent", custom: { rank: 1 } },
        },
      ],
      edges: [
        {
          id: "edge",
          source: "node",
          target: "node",
          metadata: { rendererHint: "dashed" },
        },
      ],
      metrics: [
        {
          id: "metric",
          label: "Metric",
          value: 1,
          metadata: { rendererHint: "compact" },
        },
      ],
      series: [
        {
          id: "series",
          label: "Series",
          data: [1],
          metadata: { rendererHint: "line" },
        },
      ],
      steps: [
        {
          id: "step",
          label: "Step",
          metadata: { rendererHint: "milestone" },
        },
      ],
      annotations: [
        {
          id: "annotation",
          text: "Note",
          metadata: { rendererHint: "callout" },
        },
      ],
    },
  });

  assert.equal(validateVisualizationSpec(value).ok, true);
});

test("reports required and enum schema parameters", () => {
  const missingTitle = makeSpec();
  delete missingTitle.title;
  const missingReport = validateVisualizationSpec(missingTitle);
  assert.equal(missingReport.violations[0].params.missingProperty, "title");

  const typeReport = validateVisualizationSpec(makeSpec({ type: "unknown" }));
  assert.deepEqual(typeReport.violations[0].params.allowedValues, TYPES);
});

test("reports stable duplicate-id codes for every content collection", () => {
  const duplicateCases = [
    [
      "duplicate-node-id",
      {
        nodes: [
          { id: "same", label: "One" },
          { id: "same", label: "Two" },
        ],
      },
    ],
    [
      "duplicate-edge-id",
      {
        nodes: [{ id: "node", label: "Node" }],
        edges: [
          { id: "same", source: "node", target: "node" },
          { id: "same", source: "node", target: "node" },
        ],
      },
    ],
    [
      "duplicate-metric-id",
      {
        metrics: [
          { id: "same", label: "One", value: 1 },
          { id: "same", label: "Two", value: 2 },
        ],
      },
    ],
    [
      "duplicate-series-id",
      {
        series: [
          { id: "same", label: "One", data: [1] },
          { id: "same", label: "Two", data: [2] },
        ],
      },
    ],
    [
      "duplicate-step-id",
      {
        steps: [
          { id: "same", label: "One" },
          { id: "same", label: "Two" },
        ],
      },
    ],
    [
      "duplicate-annotation-id",
      {
        annotations: [
          { id: "same", text: "One" },
          { id: "same", text: "Two" },
        ],
      },
    ],
  ];

  for (const [expectedCode, content] of duplicateCases) {
    assert.deepEqual(codes(makeSpec({ content })), [expectedCode]);
  }
});

test("reports a cross-collection id collision only once", () => {
  const value = makeSpec({
    content: {
      nodes: [{ id: "shared", label: "Node" }],
      metrics: [{ id: "shared", label: "Metric", value: 1 }],
    },
  });

  const report = validateVisualizationSpec(value);
  assert.deepEqual(codes(value), ["duplicate-content-id"]);
  assert.equal(report.violations[0].path, "/content/metrics/0/id");
});

test("accepts valid parent, dependency, and annotation references", () => {
  const value = makeSpec({
    content: {
      nodes: [
        { id: "parent", label: "Parent" },
        { id: "child", label: "Child", parentId: "parent" },
      ],
      edges: [{ id: "edge", source: "parent", target: "child" }],
      metrics: [{ id: "metric", label: "Metric", value: 1 }],
      series: [{ id: "series", label: "Series", data: [1] }],
      steps: [
        { id: "first", label: "First" },
        { id: "second", label: "Second", dependsOn: ["first"] },
      ],
      annotations: [
        { id: "note-node", text: "Node note", targetId: "child" },
        { id: "note-edge", text: "Edge note", targetId: "edge" },
        { id: "note-metric", text: "Metric note", targetId: "metric" },
        { id: "note-series", text: "Series note", targetId: "series" },
        { id: "note-step", text: "Step note", targetId: "second" },
      ],
    },
  });

  assert.equal(validateVisualizationSpec(value).ok, true);
});

test("reports precise dangling parent, dependency, and annotation paths", () => {
  const value = makeSpec({
    content: {
      nodes: [{ id: "child", label: "Child", parentId: "missing-parent" }],
      steps: [
        {
          id: "second",
          label: "Second",
          dependsOn: ["missing-first"],
        },
      ],
      annotations: [
        { id: "note", text: "Missing target", targetId: "missing-target" },
      ],
    },
  });

  const report = validateVisualizationSpec(value);
  assert.deepEqual(
    report.violations.map(({ code, path }) => ({ code, path })),
    [
      {
        code: "dangling-parent-id",
        path: "/content/nodes/0/parentId",
      },
      {
        code: "dangling-step-dependency",
        path: "/content/steps/0/dependsOn/0",
      },
      {
        code: "dangling-annotation-target",
        path: "/content/annotations/0/targetId",
      },
    ],
  );
});

test("reports dangling edge endpoints at the exact endpoint path", () => {
  const value = makeSpec({
    content: {
      nodes: [{ id: "present", label: "Present" }],
      edges: [
        { id: "edge", source: "missing-source", target: "missing-target" },
      ],
    },
  });

  assert.deepEqual(
    validateVisualizationSpec(value).violations.map(({ code, path }) => ({
      code,
      path,
    })),
    [
      { code: "dangling-edge", path: "/content/edges/0/source" },
      { code: "dangling-edge", path: "/content/edges/0/target" },
    ],
  );
});

test("enforces representative interaction boundaries with stable codes", () => {
  const allowed = [
    ["network", "zoom"],
    ["dashboard", "filter"],
    ["presentation", "navigate"],
    ["form", "submit"],
    ["immersive", "drag"],
  ];
  for (const [type, interaction] of allowed) {
    assert.equal(
      validateVisualizationSpec(
        makeSpec({ type, interactions: [interaction] }),
      ).ok,
      true,
    );
  }

  const denied = [
    ["dashboard", "zoom"],
    ["presentation", "filter"],
    ["form", "pan"],
  ];
  for (const [type, interaction] of denied) {
    assert.deepEqual(
      codes(makeSpec({ type, interactions: [interaction] })),
      ["unsupported-interaction"],
    );
  }
});
