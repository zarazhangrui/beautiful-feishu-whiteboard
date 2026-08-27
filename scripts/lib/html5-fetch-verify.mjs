import { normalizedContentSha256 } from "./html-check.mjs";

const RENDERING_WARNING =
  /html|block|render|iframe|height|script|dependency|asset/i;

function deepWalk(value, visit) {
  if (!value || typeof value !== "object") return;
  visit(value);
  if (Array.isArray(value)) {
    for (const item of value) deepWalk(item, visit);
    return;
  }
  for (const child of Object.values(value)) deepWalk(child, visit);
}

export function findHtml5Blocks(documentNode) {
  const blocks = [];
  deepWalk(documentNode, (value) => {
    const blockType = value.block_type ?? value.blockType;
    const nested =
      value["html5-block"] ??
      value["html5_block"] ??
      value["html5Block"];
    const looksLikeBlock =
      blockType === "html5-block" ||
      (nested !== undefined && (value.block_id ?? value.blockId));
    if (looksLikeBlock) blocks.push(value);
  });
  return blocks;
}

export function extractBlockDataRef(block) {
  if (!block || typeof block !== "object") return null;
  const nested =
    block["html5-block"] ??
    block["html5_block"] ??
    block["html5Block"] ??
    block;
  return (
    nested?.data_ref ??
    nested?.dataRef ??
    nested?.["data-ref"] ??
    block?.data_ref ??
    block?.dataRef ??
    null
  );
}

export function extractReferenceEntry(fetchedDocument, dataRef) {
  const map =
    fetchedDocument?.reference_map?.["html5-block"] ??
    fetchedDocument?.referenceMap?.["html5-block"] ??
    fetchedDocument?.reference_map?.html5_block ??
    null;
  return map?.[dataRef] ?? null;
}

export function verifyFetchedHtml5Block({
  fetchedDocument,
  localHtml,
  expectedDataRef,
  warnings = [],
  tips = [],
}) {
  const violations = [];
  const blocks = findHtml5Blocks(fetchedDocument).filter((block) => {
    const dataRef = extractBlockDataRef(block);
    return !expectedDataRef || dataRef === expectedDataRef;
  });
  if (blocks.length === 0) {
    violations.push({
      code: "missing-html5-block",
      message: "no html5-block block with a data-ref was found in the fetched document",
    });
  }

  const block = blocks[0];
  const blockId = block?.block_id ?? block?.blockId ?? null;
  const dataRef = block ? extractBlockDataRef(block) : null;
  let remoteHtml = null;
  if (block && dataRef) {
    const entry = extractReferenceEntry(fetchedDocument, dataRef);
    if (!entry) {
      violations.push({
        code: "missing-reference-entry",
        message: `reference_map entry ${dataRef} is missing`,
      });
    } else if (typeof entry.data === "string") {
      remoteHtml = entry.data;
    } else if (entry.path) {
      violations.push({
        code: "remote-html-path",
        message:
          "the service exported HTML as a path; download the resource and pass it as remoteHtml",
      });
    } else {
      violations.push({
        code: "remote-html-unavailable",
        message: `reference_map entry ${dataRef} has no HTML data`,
      });
    }
  }

  const localSha256 = normalizedContentSha256(String(localHtml));
  const remoteSha256 = remoteHtml
    ? normalizedContentSha256(String(remoteHtml))
    : null;
  if (remoteSha256 && remoteSha256 !== localSha256) {
    violations.push({
      code: "content-hash-mismatch",
      message: "normalized remote HTML does not match the local artifact",
    });
  }

  const surfacedWarnings = Array.isArray(warnings) ? [...warnings] : [];
  for (const warning of surfacedWarnings) {
    if (RENDERING_WARNING.test(String(warning))) {
      violations.push({
        code: "rendering-warning",
        message: `service warning affects HTML rendering: ${warning}`,
      });
    }
  }
  const surfacedTips = Array.isArray(tips) ? [...tips] : [];
  return {
    ok: violations.length === 0,
    violations,
    blockId,
    dataRef,
    localSha256,
    remoteSha256,
    warnings: surfacedWarnings,
    tips: surfacedTips,
  };
}
