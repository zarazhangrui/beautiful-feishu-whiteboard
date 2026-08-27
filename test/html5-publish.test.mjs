import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { buildHtml5Page } from "../scripts/html5-build.mjs";
import {
  markHtml5ValidationPassed,
} from "../scripts/lib/html5-manifest.mjs";
import {
  buildDocxXml,
  extractBlockId,
  extractDocumentToken,
  publishHtml5Block,
} from "../scripts/html5-publish.mjs";
import { verifyFetchedHtml5Block } from "../scripts/lib/html5-fetch-verify.mjs";

const spec = {
  version: "1.0",
  type: "network",
  title: "发布回查测试",
  summary: "验证 HTML5 Block 发布与 fetch 回查",
  content: {
    nodes: [
      { id: "a", label: "节点A" },
      { id: "b", label: "节点B" },
    ],
    edges: [{ id: "e1", source: "a", target: "b" }],
  },
  theme: { palette: "grove-block", tokens: {} },
  interactions: ["select"],
  accessibility: {
    alt: "发布回查测试图",
    instructions: "点击节点查看详情。",
  },
};

async function buildValidArtifact() {
  const sourceHtml = await readFile(
    new URL("./fixtures/html/interactive-safe.html", import.meta.url),
    "utf8",
  );
  const built = await buildHtml5Page({ sourceHtml, spec, heightMode: "auto" });
  const manifest = markHtml5ValidationPassed({
    html: built.html,
    spec,
    manifest: built.manifest,
    checks: ["static-check", "browser-820", "interactions", "reduced-motion"],
  });
  return { html: built.html, manifest };
}

function fakeFetchPayload(remoteHtml) {
  return {
    ok: true,
    revision: 3,
    document: { token: "doc-token-123", url: "https://example.feishu.cn/docx/doc-token-123" },
    content: [
      { block_id: "wb-1", block_type: "whiteboard", whiteboard: { token: "board-1" } },
      { block_id: "html-1", block_type: "html5-block", html5_block: { data_ref: "html5_1" } },
    ],
    reference_map: {
      "html5-block": { html5_1: { data: remoteHtml } },
    },
  };
}

function fakeLarkCli({ fetchPayload }) {
  return async (args) => {
    if (args.includes("+create")) {
      return JSON.stringify({
        ok: true,
        document: {
          token: "doc-token-123",
          url: "https://example.feishu.cn/docx/doc-token-123",
        },
      });
    }
    if (args.includes("+fetch")) {
      return JSON.stringify(fetchPayload);
    }
    throw new Error(`unexpected command: ${args.join(" ")}`);
  };
}

test("publisher refuses unvalidated manifests", async () => {
  const built = await buildHtml5Page({ sourceHtml: await readFile(new URL("./fixtures/html/interactive-safe.html", import.meta.url), "utf8"), spec, heightMode: "auto" });
  await assert.rejects(
    publishHtml5Block({
      spec,
      manifest: built.manifest,
      html: built.html,
      outputDir: "/tmp/unused",
      runLarkCli: async () => JSON.stringify({}),
    }),
    /unvalidated-manifest/,
  );
});

test("buildDocxXml emits the html5-block path and deterministic dual order", () => {
  const single = buildDocxXml({
    title: "单块文档",
    htmlPath: "@./index.html",
  });
  assert.match(single, /<title>单块文档<\/title>/);
  assert.match(single, /<html5-block path="@\.\/index\.html"\/>/);
  assert.doesNotMatch(single, /<whiteboard/);

  const dual = buildDocxXml({
    title: "双发文档",
    whiteboardSvgPath: "@./board.svg",
    htmlPath: "@./index.html",
  });
  assert.ok(dual.indexOf("<whiteboard") < dual.indexOf("<html5-block"));
  assert.match(
    dual,
    /<whiteboard type="svg" path="@\.\/board\.svg"><\/whiteboard>/,
  );
  assert.match(dual, /<html5-block path="@\.\/index\.html"\/>/);
});

test("fetch verifier requires an html5-block data-ref and a reference_map entry", async () => {
  const { html, manifest } = await buildValidArtifact();
  const noBlock = verifyFetchedHtml5Block({
    fetchedDocument: { content: [{ block_id: "x", block_type: "paragraph" }] },
    localHtml: html,
  });
  assert.equal(noBlock.ok, false);
  assert.ok(noBlock.violations.some((item) => item.code === "missing-html5-block"));

  const noReference = verifyFetchedHtml5Block({
    fetchedDocument: {
      content: [{ block_id: "html-1", block_type: "html5-block", html5_block: { data_ref: "html5_1" } }],
      reference_map: { "html5-block": {} },
    },
    localHtml: html,
  });
  assert.equal(noReference.ok, false);
  assert.ok(noReference.violations.some((item) => item.code === "missing-reference-entry"));

  const ok = verifyFetchedHtml5Block({
    fetchedDocument: fakeFetchPayload(html),
    localHtml: html,
    expectedDataRef: "html5_1",
  });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.equal(ok.blockId, "html-1");
  assert.equal(ok.dataRef, "html5_1");
  assert.equal(ok.localSha256, ok.remoteSha256);
});

test("remote HTML is normalized before hash comparison", async () => {
  const { html } = await buildValidArtifact();
  const normalizedRemote = html.replaceAll("\n", "\r\n") + "   \n";
  const result = verifyFetchedHtml5Block({
    fetchedDocument: fakeFetchPayload(normalizedRemote),
    localHtml: html,
  });
  assert.equal(result.ok, true, JSON.stringify(result));
});

test("fetch verifier accepts an explicit remoteHtml for path-based exports", async () => {
  const { html } = await buildValidArtifact();
  const payload = fakeFetchPayload(html);
  delete payload.reference_map["html5-block"].html5_1.data;
  payload.reference_map["html5-block"].html5_1.path = "resources/html5_1.html";
  const missing = verifyFetchedHtml5Block({
    fetchedDocument: payload,
    localHtml: html,
  });
  assert.equal(missing.ok, false);
  assert.ok(
    missing.violations.some((item) => item.code === "remote-html-path"),
  );
  const resolved = verifyFetchedHtml5Block({
    fetchedDocument: payload,
    localHtml: html,
    remoteHtml: html,
  });
  assert.equal(resolved.ok, true, JSON.stringify(resolved));
});

test("text, script, style, and geometry mutations fail verification", async () => {
  const { html } = await buildValidArtifact();
  const mutations = [
    html.replace("选择节点查看详情", "选择节点查看详情改"),
    html.replace("state.scale = Math.min(2", "state.scale = Math.min(3"),
    html.replace("background: #ffffff;", "background: #f0f0f0;"),
    html.replace('x="40" y="60"', 'x="50" y="60"'),
  ];
  for (const mutated of mutations) {
    const result = verifyFetchedHtml5Block({
      fetchedDocument: fakeFetchPayload(html),
      localHtml: mutated,
    });
    assert.equal(result.ok, false, "expected mutation to fail");
    assert.ok(
      result.violations.some((item) => item.code === "content-hash-mismatch"),
      JSON.stringify(result.violations),
    );
  }
});

test("dependency mutation fails verification", async () => {
  const sourceHtml = await readFile(
    new URL("./fixtures/html/offline-fallback.html", import.meta.url),
    "utf8",
  );
  const built = await buildHtml5Page({ sourceHtml, spec, heightMode: "auto" });
  const mutated = built.html.replace(
    "https://unpkg.com/lucide@1.8.0/dist/umd/lucide.min.js",
    "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js",
  );
  assert.notEqual(mutated, built.html);
  const result = verifyFetchedHtml5Block({
    fetchedDocument: fakeFetchPayload(built.html),
    localHtml: mutated,
  });
  assert.equal(result.ok, false);
  assert.ok(
    result.violations.some((item) => item.code === "content-hash-mismatch"),
  );
});

test("warnings and tips are surfaced and fail when they affect HTML rendering", async () => {
  const { html } = await buildValidArtifact();
  const affecting = verifyFetchedHtml5Block({
    fetchedDocument: fakeFetchPayload(html),
    localHtml: html,
    warnings: ["html5 block height may be incorrect in the desktop client"],
    tips: ["tip"],
  });
  assert.equal(affecting.ok, false);
  assert.ok(affecting.warnings.length === 1);
  assert.ok(affecting.violations.some((item) => item.code === "rendering-warning"));

  const benign = verifyFetchedHtml5Block({
    fetchedDocument: fakeFetchPayload(html),
    localHtml: html,
    warnings: ["document saved"],
    tips: ["tip"],
  });
  assert.equal(benign.ok, true, JSON.stringify(benign));
  assert.deepEqual(benign.warnings, ["document saved"]);
});

test("publisher returns a full report through a fake lark-cli", async () => {
  const { html, manifest } = await buildValidArtifact();
  const dir = await mkdtemp(join(tmpdir(), "publish-report-"));
  const runLarkCli = fakeLarkCli({ fetchPayload: fakeFetchPayload(html) });
  const report = await publishHtml5Block({
    spec,
    manifest,
    html,
    outputDir: dir,
    runLarkCli,
  });
  assert.equal(report.ok, true, JSON.stringify(report));
  assert.equal(report.documentToken, "doc-token-123");
  assert.equal(report.blockId, "html-1");
  assert.equal(report.revision, 3);
  assert.equal(report.localSha256, report.remoteSha256);
  assert.match(report.documentUrl, /^https:\/\//);
  assert.equal(report.verification.ok, true);
  assert.equal(await readFile(join(dir, "index.html"), "utf8"), html);
});

test("publisher resolves a path-based reference_map export", async () => {
  const { html, manifest } = await buildValidArtifact();
  const dir = await mkdtemp(join(tmpdir(), "publish-path-"));
  const payload = fakeFetchPayload(html);
  delete payload.reference_map["html5-block"].html5_1.data;
  payload.reference_map["html5-block"].html5_1.path = "@exported.html";
  await writeFile(join(dir, "exported.html"), html, "utf8");
  const report = await publishHtml5Block({
    spec,
    manifest,
    html,
    outputDir: dir,
    runLarkCli: fakeLarkCli({ fetchPayload: payload }),
  });
  assert.equal(report.ok, true, JSON.stringify(report));
  assert.equal(report.remoteSha256, report.localSha256);
});

test("verifies the real docs +fetch shape with a content string and @path export", async () => {
  const { html } = await buildValidArtifact();
  const fetched = {
    ok: true,
    identity: "user",
    data: {
      document: {
        document_id: "doc-1",
        revision_id: 3,
        content:
          '<title id="doc-1">发布回查测试</title><whiteboard id="wb-1" token="board-1"></whiteboard><html5-block id="doxcnx1" alt="发布回查测试图" data-ref="html5_1"></html5-block>',
        reference_map: {
          "html5-block": {
            html5_1: { path: "@doc-fetch-resources/doc-1/html5_1.html" },
          },
        },
      },
    },
  };
  const missing = verifyFetchedHtml5Block({
    fetchedDocument: fetched,
    localHtml: html,
  });
  assert.equal(missing.ok, false);
  assert.ok(
    missing.violations.some((item) => item.code === "remote-html-path"),
  );
  const resolved = verifyFetchedHtml5Block({
    fetchedDocument: fetched,
    localHtml: html,
    remoteHtml: html,
  });
  assert.equal(resolved.ok, true, JSON.stringify(resolved));
  assert.equal(resolved.blockId, "doxcnx1");
  assert.equal(resolved.dataRef, "html5_1");
});

test("publisher verifies the real nested fetch shape end to end", async () => {
  const { html, manifest } = await buildValidArtifact();
  const dir = await mkdtemp(join(tmpdir(), "publish-real-"));
  await writeFile(join(dir, "exported.html"), html, "utf8");
  const fetchPayload = {
    ok: true,
    identity: "user",
    data: {
      document: {
        document_id: "doc-1",
        revision_id: 3,
        content:
          '<title id="doc-1">发布回查测试</title><html5-block id="doxcnx1" alt="a" data-ref="html5_1"></html5-block>',
        reference_map: {
          "html5-block": { html5_1: { path: "@exported.html" } },
        },
      },
    },
  };
  const report = await publishHtml5Block({
    spec,
    manifest,
    html,
    outputDir: dir,
    runLarkCli: fakeLarkCli({ fetchPayload }),
  });
  assert.equal(report.ok, true, JSON.stringify(report));
  assert.equal(report.blockId, "doxcnx1");
  assert.equal(report.revision, 3);
  assert.equal(report.remoteSha256, report.localSha256);
});

test("publisher fails when the create response has no document token", async () => {
  const { html, manifest } = await buildValidArtifact();
  await assert.rejects(
    publishHtml5Block({
      spec,
      manifest,
      html,
      outputDir: "/tmp/publish-no-token",
      runLarkCli: async () => JSON.stringify({ ok: true }),
    }),
    /no-document-token/,
  );
});

test("document token and block id extractors search nested payloads", () => {
  const payload = {
    code: 0,
    data: {
      document: { document_id: "doc-9", url: "https://x.feishu.cn/docx/doc-9" },
    },
  };
  assert.equal(extractDocumentToken(payload), "doc-9");
  assert.equal(extractBlockId({ data: { blocks: [{ block_id: "b-7" }] } }), "b-7");
  assert.equal(extractDocumentToken({}), null);
  assert.equal(extractBlockId({}), null);
});
