import { i as MB } from "../entry-server.js";
import { t as SafeCaption } from "./SafeCaption-Be4RF0ZI.js";
import { n as PlaybackControls, t as useStepPlayer } from "./useStepPlayer-CZuIDieE.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/dp-engine/types.ts
var key = (r, c) => `${r},${c}`;
//#endregion
//#region src/components/dp-engine/DPViz.tsx
var stateClass = {
	idle: "",
	settled: "is-settled",
	current: "is-current",
	source: "is-source",
	chosen: "is-chosen",
	invalid: "is-invalid"
};
function fmt(v) {
	if (v === null) return "·";
	if (v <= -1e8) return "−∞";
	return String(v);
}
function DPViz({ model }) {
	const p = useStepPlayer(model.frames.length);
	const frame = model.frames[Math.min(p.index, model.frames.length - 1)];
	const cell = model.cell ?? 48;
	const hasRowH = !!model.rowHeaderLabels;
	const hasColH = !!model.colHeaderLabels;
	const rh = hasRowH ? 46 : 0;
	const ch = hasColH ? 30 : 0;
	const colOffset = hasRowH ? 2 : 1;
	const rowOffset = hasColH ? 2 : 1;
	const gridStyle = {
		gridTemplateColumns: `${hasRowH ? `${rh}px ` : ""}repeat(${model.cols}, ${cell}px)`,
		gridTemplateRows: `${hasColH ? `${ch}px ` : ""}repeat(${model.rows}, ${cell}px)`
	};
	const center = (r, c) => ({
		x: c * cell + cell / 2,
		y: r * cell + cell / 2
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "dpviz",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "dpviz__scroll",
				children: /* @__PURE__ */ jsxs("div", {
					className: "dpviz__grid",
					style: gridStyle,
					children: [
						hasRowH && hasColH && /* @__PURE__ */ jsx("div", {
							className: "dp-corner",
							style: {
								gridRow: 1,
								gridColumn: 1
							}
						}),
						hasColH && model.colHeaderLabels.map((lab, c) => /* @__PURE__ */ jsx("div", {
							className: "dp-colh axis",
							style: {
								gridRow: 1,
								gridColumn: colOffset + c
							},
							children: lab
						}, `ch${c}`)),
						hasRowH && model.rowHeaderLabels.map((lab, r) => /* @__PURE__ */ jsx("div", {
							className: "dp-rowh axis",
							style: {
								gridRow: rowOffset + r,
								gridColumn: 1
							},
							children: lab
						}, `rh${r}`)),
						frame.values.map((row, r) => row.map((v, c) => {
							const st = frame.states[key(r, c)] ?? "idle";
							return /* @__PURE__ */ jsx("div", {
								className: `dp-cell ${v === null ? "blank" : ""} ${stateClass[st]}`,
								style: {
									gridRow: rowOffset + r,
									gridColumn: colOffset + c
								},
								children: fmt(v)
							}, key(r, c));
						})),
						/* @__PURE__ */ jsxs("svg", {
							className: "dpviz__arrows",
							style: {
								left: rh,
								top: ch
							},
							width: model.cols * cell,
							height: model.rows * cell,
							viewBox: `0 0 ${model.cols * cell} ${model.rows * cell}`,
							children: [/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsx("marker", {
								id: "ah-src",
								markerWidth: "7",
								markerHeight: "7",
								refX: "5.5",
								refY: "3",
								orient: "auto",
								children: /* @__PURE__ */ jsx("path", {
									d: "M0,0 L6,3 L0,6 Z",
									fill: "var(--viz-source)"
								})
							}), /* @__PURE__ */ jsx("marker", {
								id: "ah-cho",
								markerWidth: "7",
								markerHeight: "7",
								refX: "5.5",
								refY: "3",
								orient: "auto",
								children: /* @__PURE__ */ jsx("path", {
									d: "M0,0 L6,3 L0,6 Z",
									fill: "var(--viz-chosen)"
								})
							})] }), (frame.arrows ?? []).map((a, i) => {
								const s = center(a.from.r, a.from.c);
								const e = center(a.to.r, a.to.c);
								const dx = e.x - s.x;
								const dy = e.y - s.y;
								const len = Math.hypot(dx, dy) || 1;
								const back = cell * .36;
								const ex = e.x - dx / len * back;
								const ey = e.y - dy / len * back;
								const sx = s.x + dx / len * (cell * .28);
								const sy = s.y + dy / len * (cell * .28);
								const chosen = a.kind === "chosen";
								return /* @__PURE__ */ jsx("line", {
									x1: sx,
									y1: sy,
									x2: ex,
									y2: ey,
									stroke: chosen ? "var(--viz-chosen)" : "var(--viz-source)",
									strokeWidth: chosen ? 3 : 2,
									strokeLinecap: "round",
									markerEnd: `url(#${chosen ? "ah-cho" : "ah-src"})`,
									opacity: .9
								}, i);
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "dpviz__legend",
				children: [
					/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { style: { borderColor: "var(--viz-current)" } }), " 当前计算"] }),
					/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { style: { borderColor: "var(--viz-source)" } }), " 依赖来源"] }),
					/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { style: { borderColor: "var(--viz-chosen)" } }), " 被选转移"] }),
					/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { style: {
						borderColor: "var(--border-strong)",
						background: "var(--viz-cell-2)"
					} }), " 已确定"] })
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "dpviz__panel",
				children: [frame.formula && /* @__PURE__ */ jsx("div", {
					className: "dpviz__formula",
					children: /* @__PURE__ */ jsx(MB, { children: frame.formula })
				}), frame.caption && /* @__PURE__ */ jsx(SafeCaption, {
					html: frame.caption,
					className: "dpviz__caption"
				})]
			}),
			/* @__PURE__ */ jsx(PlaybackControls, {
				player: p,
				variant: "full",
				label: "DP 表格逐帧播放"
			})
		]
	});
}
//#endregion
export { key as n, DPViz as t };
