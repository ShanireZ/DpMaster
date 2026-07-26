import { ExternalLink } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/ui/ProblemBits.tsx
var luoguUrl = (pid) => `https://www.luogu.com.cn/problem/${pid}`;
function ExampleCard({ pid, name, src, diff, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "example",
		children: [/* @__PURE__ */ jsxs("header", {
			className: "example__head",
			children: [
				/* @__PURE__ */ jsx("a", {
					className: "example__pid",
					href: luoguUrl(pid),
					target: "_blank",
					rel: "noreferrer",
					children: pid
				}),
				/* @__PURE__ */ jsx("span", {
					className: "example__name",
					children: name
				}),
				src && /* @__PURE__ */ jsx("span", {
					className: "example__src",
					children: src
				}),
				diff && /* @__PURE__ */ jsx("span", {
					className: "example__diff",
					children: diff
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "example__body",
			children
		})]
	});
}
function Field({ k, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "field",
		children: [/* @__PURE__ */ jsx("div", {
			className: "field__k",
			children: k
		}), /* @__PURE__ */ jsx("div", { children })]
	});
}
function Exercise({ pid, name, hint }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "exercise",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "exercise__pid",
				children: pid
			}),
			/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
				className: "exercise__name",
				children: name
			}), /* @__PURE__ */ jsx("span", {
				className: "exercise__hint",
				style: { display: "block" },
				children: hint
			})] }),
			/* @__PURE__ */ jsxs("a", {
				className: "exercise__link",
				href: luoguUrl(pid),
				target: "_blank",
				rel: "noreferrer",
				children: ["在洛谷打开 ", /* @__PURE__ */ jsx(ExternalLink, { size: 13 })]
			})
		]
	});
}
//#endregion
export { Exercise as n, Field as r, ExampleCard as t };
