import { checkHtml5Block } from "./html-check.mjs";
import { verifyManifest } from "./html5-manifest.mjs";
import { validateVisualizationSpec } from "./visualization-spec.mjs";

export function verifyHtml5Artifact({
  spec,
  manifest,
  html,
  maxBytes = 500_000,
}) {
  const specReport = validateVisualizationSpec(spec);
  if (!specReport.ok) {
    const error = new Error(
      `invalid-visualization-spec: ${specReport.violations
        .map((item) => item.code)
        .join(",")}`,
    );
    error.code = "invalid-visualization-spec";
    throw error;
  }
  verifyManifest({ html, spec, manifest });
  return checkHtml5Block(html, { manifest, maxBytes });
}
