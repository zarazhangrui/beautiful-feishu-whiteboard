import { DOMParser } from "@xmldom/xmldom";

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeText(value).replaceAll('"', "&quot;");
}

export function canonicalizeSvgElement(element) {
  const attributes = [];
  for (let index = 0; index < element.attributes.length; index += 1) {
    const attribute = element.attributes.item(index);
    attributes.push([attribute.name, attribute.value]);
  }
  attributes.sort(([left], [right]) => left.localeCompare(right));
  const serializedAttributes = attributes
    .map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`)
    .join("");
  let children = "";
  for (let child = element.firstChild; child; child = child.nextSibling) {
    if (child.nodeType === 1) {
      children += canonicalizeSvgElement(child);
    } else if (child.nodeType === 3 || child.nodeType === 4) {
      const keepWhitespace = element.localName === "text" || element.localName === "tspan";
      if (keepWhitespace || child.data.trim() !== "") children += escapeText(child.data);
    }
  }
  return `<${element.localName}${serializedAttributes}>${children}</${element.localName}>`;
}

export function canonicalizeSvg(svg) {
  const document = new DOMParser().parseFromString(String(svg), "image/svg+xml");
  return canonicalizeSvgElement(document.documentElement);
}
