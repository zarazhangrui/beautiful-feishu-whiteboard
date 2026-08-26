import assert from "node:assert/strict";
import test from "node:test";
import { CssPolicyError, validateCss } from "../scripts/lib/css-policy.mjs";
function reject(source,code,options){assert.throws(()=>validateCss(source,options),(error)=>{assert.ok(error instanceof CssPolicyError);assert.ok(error.violations.some((item)=>item.code===code),JSON.stringify(error.violations));return true;});}
test("allows responsive CSS, local fragments and approved raster data images",()=>assert.equal(validateCss(`.x{fill:url(#paint);background-image:url("data:image/png;base64,iVBORw0KGgo=")}@media(max-width:600px){.x{display:none}}`).ok,true));
test("rejects executable SVG data images",()=>reject(`.x{background-image:url("data:image/svg+xml,%3Csvg%20onload%3Dalert(1)%3E%3C/svg%3E")}`,"css-external-url"));
test("rejects imports, remote url and image-set URLs",()=>{reject("@import 'https://evil.example/x.css';","css-import");reject(".x{background:url(https://evil.example/x)}","css-external-url");reject('.x{background:image-set("https://evil.example/x" 1x)}',"css-external-url");});
test("normalizes CSS escapes before URL decisions",()=>{reject(String.raw`.x{background:u\72l(\68 ttps\3a //evil.example/x)}`,"css-external-url");reject(String.raw`.x{background-image:image-set('\68 ttps\3a //evil.example/x' 1x)}`,"css-external-url");});
test("validates style attributes with declaration grammar",()=>{assert.equal(validateCss("color:#123;fill:url(#local)",{context:"declarationList"}).ok,true);reject("background:url(https://evil.example/x)","css-external-url",{context:"declarationList"});});
