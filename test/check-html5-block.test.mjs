import assert from "node:assert/strict";
import test from "node:test";
import { HtmlCheckError, checkHtml5Block, normalizedContentSha256 } from "../scripts/lib/html-check.mjs";
import { resolveAllowedDependency } from "../scripts/lib/html5-manifest.mjs";

const dependency = resolveAllowedDependency("https://unpkg.com/lucide@1.8.0/dist/umd/lucide.min.js");
const csp = `default-src 'none'; script-src 'unsafe-inline' ${dependency.url}; style-src 'unsafe-inline'; img-src data:; font-src 'none'; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'`;
const manifest = { heightMode:"auto", dependencies:[dependency] };

function validHtml() { return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="use-iframe" content="true"><meta name="html-box-height-mode" content="auto"><meta name="description" content="Interactive dependency map"><meta http-equiv="Content-Security-Policy" content="${csp}">
<title>Architecture</title><style>:root{color-scheme:light}body{margin:0;font:16px system-ui}.layout{display:grid;grid-template-columns:1fr 16rem;gap:1rem}@media(max-width:600px){.layout{grid-template-columns:1fr}}button:focus-visible{outline:2px solid #2563eb}</style><script src="${dependency.url}" integrity="${dependency.integrity}" crossorigin="anonymous"></script></head>
<body><main><h1>Architecture</h1><div class="layout"><section aria-label="Graph"><button id="toggle" type="button">Toggle</button><svg viewBox="0 0 400 200" role="img" aria-label="Services"><rect id="service" x="20" y="20" width="120" height="60" fill="#2563eb"/><text x="30" y="55" font-size="18">API</text></svg></section><aside id="details">Select a service</aside></div></main><script>
const state={selected:false};const button=document.querySelector('#toggle');const details=document.querySelector('#details');button.addEventListener('click',()=>{state.selected=!state.selected;details.textContent=state.selected?'API selected':'Select a service';});window.addEventListener('resize',()=>requestAnimationFrame(()=>details.dataset.width=String(document.documentElement.clientWidth)));
</script></body></html>`; }

function expectViolation(html, code, context={manifest}) { assert.throws(()=>checkHtml5Block(html,context),(error)=>{ assert.ok(error instanceof HtmlCheckError); assert.ok(error.violations.some((item)=>item.code===code),JSON.stringify(error.violations)); return true; }); }

test("accepts a semantic interactive HTML page",()=>{ const report=checkHtml5Block(validHtml(),{manifest}); assert.equal(report.ok,true); assert.equal(report.svgCount,1); assert.equal(report.scriptCount,2); });
test("requires head-direct exact metadata and manifest height mode",()=>{
  expectViolation(validHtml().replace('<meta name="description"','<svg><meta name="description"').replace('<title>','</svg><title>'),"required-meta");
  expectViolation(validHtml().replace('<meta name="description"','<meta http-equiv="refresh" name="description"'),"forbidden-meta");
  expectViolation(validHtml(),"height-mode-mismatch",{manifest:{...manifest,heightMode:"viewport"}});
});
test("rejects parser-synthesized document structure",()=>{
  expectViolation(validHtml().replace("<head>","").replace("</head>",""),"html-structure");
  expectViolation(validHtml().replace("<!doctype html>",""),"html-structure");
  expectViolation(validHtml().replace("<!doctype html>","<!doctype svg>"),"invalid-html");
});
test("rejects refresh, unknown http-equiv and duplicate variant attributes",()=>{
  expectViolation(validHtml().replace("</head>",'<meta http-equiv="refresh" content="0;url=https://evil.example"></head>'),"forbidden-meta");
  expectViolation(validHtml().replace("</head>",'<meta http-equiv="x-test" content="x"></head>'),"forbidden-meta");
  expectViolation(validHtml().replace('<meta charset="utf-8">','<meta charset="utf-8" content="x">'),"forbidden-meta");
});
test("validates exact declared external script attributes",()=>{
  expectViolation(validHtml().replace(dependency.integrity,"sha384-bad"),"dependency-integrity-mismatch");
  expectViolation(validHtml().replace(' crossorigin="anonymous"',""),"dependency-crossorigin-required");
  expectViolation(validHtml().replace(`src="${dependency.url}"`,'src="https://evil.example/library.js"'),"dependency-not-allowlisted");
});
test("rejects malformed and duplicate Manifest dependencies without crashing",()=>{
  expectViolation(validHtml(),"invalid-manifest-dependency",{manifest:{...manifest,dependencies:[{url:dependency.url}]}});
  expectViolation(validHtml(),"invalid-manifest-dependency",{manifest:{...manifest,dependencies:[dependency,dependency]}});
  expectViolation(validHtml(),"invalid-manifest-dependency",{manifest:{...manifest,dependencies:[{...dependency,id:"forged@1.0.0"}]}});
});
test("requires a one-to-one match between declared dependencies and script tags",()=>{
  const tag=`<script src="${dependency.url}" integrity="${dependency.integrity}" crossorigin="anonymous"></script>`;
  expectViolation(validHtml().replace("</head>",`${tag}</head>`),"dependency-script-count");
});
test("rejects CSS URLs including image-set and escaped schemes",()=>{
  expectViolation(validHtml().replace("</head>",'<style>.x{background:image-set("https://evil.example/x" 1x)}</style></head>'),"css-external-url");
  expectViolation(validHtml().replace("</head>",String.raw`<style>.x{background:url(\68 ttps\3a //evil.example/x)}</style></head>`),"css-external-url");
});
test("rejects inline events, form actions and navigation",()=>{
  expectViolation(validHtml().replace('<button id="toggle"','<button onclick="alert(1)" id="toggle"'),"event-attribute");
  expectViolation(validHtml().replace("</main>",'<form action="https://evil.example"><button>Send</button></form></main>'),"form-action");
  expectViolation(validHtml().replace("</main>",'<button formaction="https://evil.example">Send</button></main>'),"form-action");
  expectViolation(validHtml().replace("</script></body>","location.href='https://evil.example';</script></body>"),"js-navigation");
});
test("rejects additional HTML resource-bearing attributes",()=>{
  expectViolation(validHtml().replace("</main>",'<img srcset="https://evil.example/a.png 1x"></main>'),"external-resource");
  expectViolation(validHtml().replace("</main>",'<video poster="https://evil.example/a.png"></video></main>'),"external-resource");
  expectViolation(validHtml().replace("</main>",'<img alt="x" src="data:image/svg+xml,%3Csvg%20onload%3Dalert(1)%3E"></main>'),"external-resource");
});
test("rejects SVG escaped remote paint references",()=>expectViolation(validHtml().replace('fill="#2563eb"',String.raw`fill="u\72l(\68 ttps\3a //evil.example/x)"`),"svg-policy"));
test("rejects CDATA and entity attempts",()=>{
  expectViolation(validHtml().replace("const state","<![CDATA[eval('1')]]>\nconst state"),"javascript-parse");
  expectViolation(validHtml().replace(">API</text>",">&#x3c;script&#x3e;</text>"),"unsafe-html-text");
});
test("enforces maximum bytes and normalizes hashes",()=>{ expectViolation(validHtml(),"html-too-large",{manifest,maxBytes:100}); assert.equal(normalizedContentSha256("<p>a</p>\r\n"),normalizedContentSha256("<p>a</p>\n")); });

test("reports a structured limit for excessively deep DOM trees", () => {
  const depth = 10_000;
  const nested = `${"<div>".repeat(depth)}leaf${"</div>".repeat(depth)}`;
  expectViolation(
    validHtml().replace("<h1>Architecture</h1>", nested),
    "html-dom-limit",
  );
});

test("accepts a normal deep DOM tree", () => {
  const depth = 100;
  const nested = `${"<div>".repeat(depth)}leaf${"</div>".repeat(depth)}`;
  assert.equal(
    checkHtml5Block(validHtml().replace("<h1>Architecture</h1>", nested), {manifest}).ok,
    true,
  );
});

test("validates a nested SVG through one top-level root", () => {
  const nested = '<svg viewBox="0 0 20 20"><rect x="1" y="1" width="5" height="5" fill="#fff"/></svg>';
  const report = checkHtml5Block(
    validHtml().replace("</svg></section>", `${nested}</svg></section>`),
    {manifest},
  );
  assert.equal(report.svgCount, 1);
});
