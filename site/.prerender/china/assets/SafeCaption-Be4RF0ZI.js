import { createElement } from "react";
import { jsx } from "react/jsx-runtime";
var APPROVED_SPAN_CLASSES = /* @__PURE__ */ new Set([
	"mono",
	"ok",
	"bad",
	"cur",
	"you"
]);
var TOKEN = /<[^>]*>|[^<]+|</g;
var NAMED_ENTITIES = {
	amp: "&",
	apos: "'",
	gt: ">",
	lt: "<",
	quot: "\""
};
function decodeEntities(text) {
	return text.replace(/&(?:#(\d+)|#x([\dA-Fa-f]+)|([A-Za-z]+));/g, (entity, decimal, hex, named) => {
		if (named) return NAMED_ENTITIES[named] ?? entity;
		const codePoint = Number.parseInt(decimal ?? hex, decimal ? 10 : 16);
		try {
			return codePoint <= 1114111 ? String.fromCodePoint(codePoint) : entity;
		} catch {
			return entity;
		}
	});
}
function appendText(nodes, text) {
	const decoded = decodeEntities(text);
	const previous = nodes.at(-1);
	if (typeof previous === "string") nodes[nodes.length - 1] = previous + decoded;
	else nodes.push(decoded);
}
function openingElement(token) {
	const paired = token.match(/^<(b|strong|code)\s*>$/);
	if (paired) return {
		tag: paired[1],
		children: []
	};
	const span = token.match(/^<span\s+class\s*=\s*(["'])([^"']+)\1\s*>$/);
	if (!span || !APPROVED_SPAN_CLASSES.has(span[2])) return null;
	return {
		tag: "span",
		className: span[2],
		children: []
	};
}
/** Parse the deliberately tiny teaching-caption vocabulary into inert render nodes. */
function parseSafeCaption(html) {
	if (!html) return [];
	const root = [];
	const stack = [];
	let current = root;
	let malformed = false;
	for (const token of html.match(TOKEN) ?? []) {
		if (/^<br\s*\/?>$/.test(token)) {
			current.push({
				tag: "br",
				children: []
			});
			continue;
		}
		const opening = openingElement(token);
		if (opening) {
			current.push(opening);
			stack.push({
				node: opening,
				parent: current
			});
			current = opening.children;
			continue;
		}
		const closing = token.match(/^<\/(b|strong|code|span)\s*>$/);
		if (closing) {
			const open = stack.at(-1);
			if (!open || open.node.tag !== closing[1]) {
				malformed = true;
				break;
			}
			stack.pop();
			current = open.parent;
			continue;
		}
		appendText(current, token);
	}
	if (malformed || stack.length > 0) return [decodeEntities(html)];
	return root;
}
//#endregion
//#region src/components/dp-engine/SafeCaption.tsx
function renderCaptionNode(node, key) {
	if (typeof node === "string") return node;
	if (node.tag === "br") return createElement("br", { key });
	const props = node.className ? {
		key,
		className: node.className
	} : { key };
	return createElement(node.tag, props, ...node.children.map((child, childIndex) => renderCaptionNode(child, childIndex)));
}
function SafeCaption({ html, className }) {
	return /* @__PURE__ */ jsx("div", {
		className,
		children: parseSafeCaption(html).map(renderCaptionNode)
	});
}
//#endregion
export { SafeCaption as t };
