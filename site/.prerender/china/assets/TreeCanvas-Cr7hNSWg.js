import { t as SafeCaption } from "./SafeCaption-Be4RF0ZI.js";
import { n as PlaybackControls } from "./useStepPlayer-CZuIDieE.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/treedp/TreeCanvas.tsx
/** 纯展示：把一棵有根树画成 SVG。x 用布局归一坐标铺开、y 按深度分层。 */
function TreeCanvas({ layout, paintNode, edgeActive, width = 600, rowH = 96, radius = 22, ariaLabel = "有根树" }) {
	const padX = 44;
	const topY = 38;
	const H = topY + layout.maxDepth * rowH + 56;
	const px = (x) => padX + x * (width - 2 * padX);
	const py = (d) => topY + d * rowH;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: `0 0 ${width} ${H}`,
		role: "img",
		"aria-label": ariaLabel,
		children: [layout.edges.map((e, i) => {
			const a = layout.byId.get(e.a);
			const b = layout.byId.get(e.b);
			const on = edgeActive ? edgeActive(e.a, e.b) : false;
			return /* @__PURE__ */ jsx("line", {
				x1: px(a.x),
				y1: py(a.depth) + radius,
				x2: px(b.x),
				y2: py(b.depth) - radius,
				stroke: on ? "var(--viz-chosen)" : "var(--border-strong)",
				strokeWidth: on ? 3.4 : 1.6
			}, i);
		}), layout.nodes.map((nd) => {
			const p = paintNode(nd.id);
			return /* @__PURE__ */ jsxs("g", {
				className: "node",
				transform: `translate(${px(nd.x)},${py(nd.depth)})`,
				opacity: p.dim ? .32 : 1,
				children: [
					/* @__PURE__ */ jsx("circle", {
						r: radius,
						fill: p.fill,
						stroke: p.stroke,
						strokeWidth: p.strokeWidth ?? 1.6
					}),
					/* @__PURE__ */ jsx("text", {
						y: p.sub && p.sub.length ? -3 : 5,
						textAnchor: "middle",
						fontSize: "14",
						fontWeight: "700",
						fill: p.textColor ?? "var(--text-1)",
						children: p.label ?? nd.id + 1
					}),
					p.sub?.map((s, k) => /* @__PURE__ */ jsx("text", {
						y: 9 + k * 11,
						textAnchor: "middle",
						fontSize: "9",
						className: "mono",
						fill: p.textColor ?? "var(--text-3)",
						children: s
					}, k))
				]
			}, nd.id);
		})]
	});
}
function StepBar({ player }) {
	return /* @__PURE__ */ jsx(PlaybackControls, {
		player,
		variant: "compact",
		label: "树形 DP 逐帧播放",
		className: "td__playback"
	});
}
function Legend({ items }) {
	return /* @__PURE__ */ jsx("div", {
		className: "td__legend",
		children: items.map((it, i) => /* @__PURE__ */ jsxs("span", { children: [
			/* @__PURE__ */ jsx("i", { style: {
				borderColor: it.color,
				background: it.bg ? it.color : "transparent"
			} }),
			" ",
			it.label
		] }, i))
	});
}
function Panel({ html }) {
	return /* @__PURE__ */ jsx(SafeCaption, {
		html,
		className: "td__panel"
	});
}
//#endregion
export { TreeCanvas as i, Panel as n, StepBar as r, Legend as t };
