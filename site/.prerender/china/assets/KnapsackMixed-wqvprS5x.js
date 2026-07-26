import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, Minus, MousePointerClick, Plus, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/knapsack-mixed/internal.ts
function splitMultiple(itemIndex, item) {
	const units = [];
	let rest = Math.max(1, item.m ?? 1);
	let size = 1;
	while (size < rest) {
		units.push({
			itemIndex,
			kind: "multiple",
			w: size * item.w,
			v: size * item.v,
			direction: "reverse",
			tag: `×${size} 包`,
			count: size
		});
		rest -= size;
		size <<= 1;
	}
	if (rest > 0) units.push({
		itemIndex,
		kind: "multiple",
		w: rest * item.w,
		v: rest * item.v,
		direction: "reverse",
		tag: `×余${rest} 包`,
		count: rest
	});
	return units;
}
function buildMixedUnits(items) {
	const units = [];
	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		const item = items[itemIndex];
		if (item.kind === "01") units.push({
			itemIndex,
			kind: "01",
			w: item.w,
			v: item.v,
			direction: "reverse",
			tag: "01"
		});
		else if (item.kind === "complete") units.push({
			itemIndex,
			kind: "complete",
			w: item.w,
			v: item.v,
			direction: "forward",
			tag: "完全"
		});
		else units.push(...splitMultiple(itemIndex, item));
	}
	return units;
}
function countMixedUnits(items) {
	return buildMixedUnits(items).length;
}
function executeMixedKnapsack(items, capacity, emit) {
	const values = Array(capacity + 1).fill(0);
	for (const unit of buildMixedUnits(items)) {
		const start = unit.direction === "forward" ? unit.w : capacity;
		const end = unit.direction === "forward" ? capacity : unit.w;
		const step = unit.direction === "forward" ? 1 : -1;
		for (let currentCapacity = start; step > 0 ? currentCapacity <= end : currentCapacity >= end; currentCapacity += step) {
			const before = values[currentCapacity];
			const from = values[currentCapacity - unit.w];
			const candidate = from + unit.v;
			const better = candidate > before;
			if (better) values[currentCapacity] = candidate;
			emit({
				type: "cell",
				unit,
				capacity: currentCapacity,
				before,
				from,
				candidate,
				after: values[currentCapacity],
				better
			});
		}
	}
	return {
		value: values[capacity],
		values
	};
}
function recordMixedKnapsack(items, capacity) {
	const events = [];
	return {
		result: executeMixedKnapsack(items, capacity, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/components/demos/knapsack/mixedSolver.ts
function settled(vals) {
	const s = {};
	for (let r = 0; r < vals.length; r++) for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = "settled";
	return s;
}
var KIND_CN = {
	"01": "01（恰一件）",
	complete: "完全（无限件）",
	multiple: "多重（有限件）"
};
var DIR_CN = {
	reverse: "倒序",
	forward: "正序"
};
/**
* 混合背包 · 同一维 f[j] 上按件数属性分派。
* 01 → 倒序一遍；complete → 正序一遍；multiple → 二进制拆包后每包倒序。
* 三者共用同一套 f[j]=max(f[j], f[j-w]+v)，只有循环方向 / 是否拆包不同。
* 网格为一维（1 行 W+1 列）。
*/
function mixedKnapsack(items, W) {
	const run = recordMixedKnapsack(items, W);
	const units = countMixedUnits(items);
	const f = Array(W + 1).fill(0);
	const snap = () => [f.slice()];
	const frames = [];
	const summary = items.map((it, i) => `物品 ${i + 1} 按 <b>${KIND_CN[it.kind]}</b>`).join("、");
	frames.push({
		values: snap(),
		states: settled(snap()),
		caption: `初始：容量 0…${W} 下最大价值都是 <b>0</b>（空背包）。本例 ${summary}——三类物品即将落到<b>同一维 f[j]</b> 上，各按自己的方式转移。`,
		formula: "f[j]=0"
	});
	for (const event of run.events) {
		const { unit: un, capacity: j, before: old, candidate: cand, after, better } = event;
		f[j] = after;
		const states = settled(snap());
		states[key(0, j - un.w)] = "source";
		const arrows = [{
			from: {
				r: 0,
				c: j - un.w
			},
			to: {
				r: 0,
				c: j
			},
			kind: better ? "chosen" : "source"
		}];
		if (better) states[key(0, j - un.w)] = "chosen";
		states[key(0, j)] = "current";
		const src = items[un.itemIndex];
		const unitDesc = un.kind === "multiple" ? `的 <b>${un.tag}</b>（含 ${un.count} 件原物 · 等效 w'=${un.w}, v'=${un.v}）` : `（w=${src.w}, v=${src.v}）`;
		const caption = `物品 <b>${un.itemIndex + 1}</b>${unitDesc} · 本件按【<b>${KIND_CN[un.kind]}</b>】处理 → <b>${DIR_CN[un.direction]}</b> j=${j}：f[${j - un.w}]+${un.v} = <b>${cand}</b> ${better ? "&gt;" : "≤"} f[${j}]=<b>${old}</b> → ${better ? `更新为 <b>${cand}</b>` : "不变"}。`;
		const formula = `f[${j}]=\\max(f[${j}],\\ f[${j - un.w}]+${un.v})=${better ? cand : old}`;
		frames.push({
			values: snap(),
			states,
			active: {
				r: 0,
				c: j
			},
			arrows,
			caption,
			formula
		});
	}
	const fin = settled(snap());
	fin[key(0, W)] = "chosen";
	frames.push({
		values: snap(),
		states: fin,
		caption: `答案 <b>f[${W}] = ${run.result.value}</b>：${units} 个转移单元依次做完，容量 ${W} 下的最大价值。同一维 f[j] 里，01 件至多一次、完全件可反复、多重件不超上限，各自的约束都由“循环方向/拆包”天然保证。`,
		formula: `f[${W}]=${run.result.value}`
	});
	return {
		rows: 1,
		cols: W + 1,
		rowHeaderLabels: ["f"],
		colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
		frames
	};
}
/** 供工具条展示：本组混合物品展开成多少个转移单元。 */
function unitCount(items) {
	return countMixedUnits(items);
}
//#endregion
//#region src/components/demos/knapsack/KnapsackMixedDemo.tsx
function Stepper({ label, value, min, max, onChange }) {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
		className: "stepper__lab",
		children: label
	}), /* @__PURE__ */ jsxs("div", {
		className: "stepper__row",
		children: [
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value - 1),
				disabled: value <= min,
				"aria-label": `${label} 减`,
				children: /* @__PURE__ */ jsx(Minus, { size: 13 })
			}),
			/* @__PURE__ */ jsx("span", {
				className: "stepper__val",
				children: value
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value + 1),
				disabled: value >= max,
				"aria-label": `${label} 加`,
				children: /* @__PURE__ */ jsx(Plus, { size: 13 })
			})
		]
	})] });
}
var KINDS = [
	{
		k: "01",
		label: "01"
	},
	{
		k: "complete",
		label: "完全"
	},
	{
		k: "multiple",
		label: "多重"
	}
];
/** 混合背包演示：每件可切「件数属性」，三类物品落在同一维 f[j] 上，各按 01 倒序 / 完全正序 / 多重拆包处理。 */
function KnapsackMixedDemo() {
	const [items, setItems] = useState([{
		kind: "01",
		w: 2,
		v: 3
	}, {
		kind: "complete",
		w: 3,
		v: 4
	}]);
	const [cap, setCap] = useState(9);
	const model = useMemo(() => mixedKnapsack(items, cap), [items, cap]);
	const units = useMemo(() => unitCount(items), [items]);
	const modelKey = `mix-${cap}-${items.map((it) => `${it.kind}.${it.w}.${it.v}.${it.m ?? 0}`).join("_")}`;
	const setItem = (i, patch) => setItems((arr) => arr.map((it, k) => k === i ? {
		...it,
		...patch
	} : it));
	const setKind = (i, kind) => setItem(i, kind === "multiple" ? {
		kind,
		m: items[i].m ?? 3
	} : { kind });
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "kd__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "物品（切类型 · 改重量 / 价值 / 件数）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "kd__items",
				children: [items.map((it, i) => /* @__PURE__ */ jsxs("div", {
					className: "kd__item",
					style: {
						flexDirection: "column",
						gap: 10
					},
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "kd__item-i",
							children: i + 1
						}),
						items.length > 1 && /* @__PURE__ */ jsx("button", {
							className: "kd__remove",
							onClick: () => setItems((a) => a.filter((_, k) => k !== i)),
							"aria-label": "删除物品",
							children: /* @__PURE__ */ jsx(X, { size: 12 })
						}),
						/* @__PURE__ */ jsx("div", {
							className: "kd__modes",
							style: { margin: 0 },
							children: KINDS.map(({ k, label }) => /* @__PURE__ */ jsx("button", {
								className: `kd__mode${it.kind === k ? " on" : ""}`,
								onClick: () => setKind(i, k),
								children: label
							}, k))
						}),
						/* @__PURE__ */ jsxs("div", {
							style: {
								display: "flex",
								gap: 14
							},
							children: [
								/* @__PURE__ */ jsx(Stepper, {
									label: "重量 w",
									value: it.w,
									min: 1,
									max: cap,
									onChange: (w) => setItem(i, { w })
								}),
								/* @__PURE__ */ jsx(Stepper, {
									label: "价值 v",
									value: it.v,
									min: 1,
									max: 30,
									onChange: (v) => setItem(i, { v })
								}),
								it.kind === "multiple" && /* @__PURE__ */ jsx(Stepper, {
									label: "件数 m",
									value: it.m ?? 3,
									min: 1,
									max: 6,
									onChange: (m) => setItem(i, { m })
								})
							]
						})
					]
				}, i)), items.length < 4 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: () => setItems((a) => [...a, {
						kind: "01",
						w: 2,
						v: 3
					}]),
					children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加物品"]
				})]
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "背包容量"
			}), /* @__PURE__ */ jsx(Stepper, {
				label: "m",
				value: cap,
				min: 2,
				max: 12,
				onChange: setCap
			})] })]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"三类物品共用",
				/* @__PURE__ */ jsx("b", {
					className: "you",
					children: " 同一维 f[j] "
				}),
				"：01 件",
				/* @__PURE__ */ jsx("b", {
					className: "you",
					children: "倒序"
				}),
				"、完全件",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: "正序"
				}),
				"、多重件",
				/* @__PURE__ */ jsx("b", {
					className: "you",
					children: "拆包后倒序"
				}),
				"。当前共展开",
				" ",
				/* @__PURE__ */ jsx("b", {
					className: "you",
					children: units
				}),
				" 个转移单元（多重件按二进制拆分计）。"
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/content/a/KnapsackMixedArt.tsx
/** 三件物品各带件数徽标（×1 / ×∞ / ×m），一起进同一个背包——件数属性各不相同。 */
function MixedSetupFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 660 178",
		role: "img",
		"aria-label": "三件物品分别可取一件、无限件、有限件，进入同一个背包",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "kx-ar",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--text-3)"
				})
			}) }),
			[
				{
					w: 2,
					v: 3,
					badge: "×1",
					tip: "恰一件"
				},
				{
					w: 3,
					v: 4,
					badge: "×∞",
					tip: "无限件"
				},
				{
					w: 4,
					v: 5,
					badge: "×m",
					tip: "有限件"
				}
			].map((it, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${16 + i * 96},36)`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "84",
						height: "104",
						rx: "14",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(50,-11)",
						children: [/* @__PURE__ */ jsx("rect", {
							width: "48",
							height: "22",
							rx: "11",
							fill: "color-mix(in srgb, var(--accent-1) 20%, var(--surface-2))",
							stroke: "var(--accent-2)",
							strokeWidth: "1.2"
						}), /* @__PURE__ */ jsx("text", {
							x: "24",
							y: "15",
							textAnchor: "middle",
							fontSize: "12",
							className: "mono",
							fill: "var(--accent-1)",
							children: it.badge
						})]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "42",
						y: "28",
						textAnchor: "middle",
						fontSize: "12",
						fill: "var(--text-2)",
						children: ["物品 ", i + 1]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "42",
						y: "55",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--text-1)",
						children: ["w=", it.w]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "42",
						y: "78",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--accent-1)",
						children: ["v=", it.v]
					}),
					/* @__PURE__ */ jsx("text", {
						x: "42",
						y: "97",
						textAnchor: "middle",
						fontSize: "10.5",
						fill: "var(--text-3)",
						children: it.tip
					})
				]
			}, i)),
			/* @__PURE__ */ jsx("path", {
				d: "M306 86 H372",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#kx-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(404,32)",
				children: [
					/* @__PURE__ */ jsx("path", {
						d: "M28 30 Q28 10 50 10 H150 Q172 10 172 30 L188 114 Q188 124 176 124 H24 Q12 124 12 114 Z",
						fill: "color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))",
						stroke: "var(--accent-2)",
						strokeWidth: "2.5"
					}),
					/* @__PURE__ */ jsx("path", {
						d: "M72 10 Q72 -8 100 -8 Q128 -8 128 10",
						fill: "none",
						stroke: "var(--accent-2)",
						strokeWidth: "2.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "60",
						textAnchor: "middle",
						fontSize: "14",
						fill: "var(--text-1)",
						children: "同一个背包"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "86",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--accent-1)",
						children: "容量 m=9"
					})
				]
			})
		]
	});
}
/** 分派表：三种件数属性各自映射到「循环方向 / 是否拆包」，但落点都是同一套 f[j]=max(f[j],f[j-w]+v)。 */
function DispatchFigure() {
	const rows = [
		{
			kind: "01（恰一件）",
			how: "倒序一遍",
			note: "j: W → w",
			color: "var(--viz-chosen)"
		},
		{
			kind: "完全（无限件）",
			how: "正序一遍",
			note: "j: w → W",
			color: "var(--viz-current)"
		},
		{
			kind: "多重（有限件）",
			how: "二进制拆包后各包倒序",
			note: "拆成 log 个包",
			color: "var(--viz-source)"
		}
	];
	const y0 = 54;
	const rh = 40;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 250",
		role: "img",
		"aria-label": "件数属性到循环方向的分派表，三者落在同一套转移上",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "dp-ar",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--text-3)"
				})
			}) }),
			/* @__PURE__ */ jsx("text", {
				x: "24",
				y: "24",
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--text-2)",
				children: "看这件的「件数属性」"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "356",
				y: "24",
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--text-2)",
				children: "就用这种转移方式"
			}),
			rows.map((r, i) => {
				const y = y0 + i * 52;
				return /* @__PURE__ */ jsxs("g", { children: [
					/* @__PURE__ */ jsx("rect", {
						x: "24",
						y,
						width: "196",
						height: rh,
						rx: "10",
						fill: "var(--surface-3)",
						stroke: r.color,
						strokeWidth: "1.6"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "122",
						y: y + rh / 2 + 5,
						textAnchor: "middle",
						fontSize: "13",
						fill: "var(--text-1)",
						children: r.kind
					}),
					/* @__PURE__ */ jsx("path", {
						d: `M228 ${y + rh / 2} H304`,
						stroke: "var(--text-3)",
						strokeWidth: "2",
						markerEnd: "url(#dp-ar)"
					}),
					/* @__PURE__ */ jsx("rect", {
						x: "312",
						y,
						width: "240",
						height: rh,
						rx: "10",
						fill: "color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "330",
						y: y + rh / 2 - 3,
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: r.how
					}),
					/* @__PURE__ */ jsx("text", {
						x: "330",
						y: y + rh / 2 + 14,
						fontSize: "11",
						className: "mono",
						fill: "var(--text-3)",
						children: r.note
					})
				] }, i);
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(24,224)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						x: "0",
						y: "-4",
						width: "528",
						height: "30",
						rx: "9",
						fill: "color-mix(in srgb, var(--accent-1) 14%, var(--surface-2))",
						stroke: "var(--accent-2)",
						strokeWidth: "1.4"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "14",
						y: "15",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "三条路最终都写同一格："
					}),
					/* @__PURE__ */ jsx("text", {
						x: "196",
						y: "15",
						fontSize: "13",
						className: "mono",
						fill: "var(--accent-1)",
						children: "f[j] = max(f[j], f[j−w] + v)"
					})
				]
			})
		]
	});
}
/** 同一维 f[j] 被三段处理：先 01 件倒序、再完全件正序、再多重件拆包倒序，值就地累积。 */
function MixedTraceFigure() {
	const cols = [
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8
	];
	const rowA = [
		0,
		0,
		3,
		3,
		3,
		3,
		3,
		3,
		3
	];
	const rowB = [
		0,
		0,
		3,
		4,
		4,
		7,
		8,
		8,
		11
	];
	const x0 = 96;
	const cw = 52;
	const cx = (j) => x0 + j * 56;
	const rowY = (r) => 44 + r * 68;
	const ch = 38;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 616 172",
		role: "img",
		"aria-label": "同一维 f 数组先被 01 件倒序处理，再被完全件正序处理",
		children: [
			cols.map((j) => /* @__PURE__ */ jsxs("text", {
				x: cx(j) + cw / 2,
				y: "26",
				textAnchor: "middle",
				fontSize: "11.5",
				className: "mono",
				fill: "var(--text-3)",
				children: ["j=", j]
			}, `h${j}`)),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: rowY(0) + ch / 2 + 5,
				fontSize: "11.5",
				fill: "var(--viz-chosen)",
				children: "01 后"
			}),
			cols.map((j) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${cx(j)},${rowY(0)})`,
				children: [/* @__PURE__ */ jsx("rect", {
					width: cw,
					height: ch,
					rx: "9",
					fill: "var(--surface-3)",
					stroke: "var(--border-strong)",
					strokeWidth: "1.4"
				}), /* @__PURE__ */ jsx("text", {
					x: cw / 2,
					y: 25,
					textAnchor: "middle",
					fontSize: "15",
					className: "mono",
					fill: "var(--text-1)",
					children: rowA[j]
				})]
			}, `a${j}`)),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: rowY(1) + ch / 2 + 5,
				fontSize: "11.5",
				fill: "var(--viz-current)",
				children: "完全后"
			}),
			cols.map((j) => {
				const changed = rowB[j] !== rowA[j];
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${cx(j)},${rowY(1)})`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: cw,
						height: ch,
						rx: "9",
						fill: changed ? "color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))" : "var(--surface-3)",
						stroke: changed ? "var(--viz-current)" : "var(--border-strong)",
						strokeWidth: "1.4"
					}), /* @__PURE__ */ jsx("text", {
						x: cw / 2,
						y: 25,
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: changed ? "var(--viz-current)" : "var(--text-1)",
						children: rowB[j]
					})]
				}, `b${j}`);
			})
		]
	});
}
//#endregion
//#region src/content/a/KnapsackMixed.tsx
var preMono = {
	margin: "var(--sp-4) 0",
	padding: "var(--sp-4)",
	borderRadius: "var(--r-2)",
	background: "var(--surface-2)",
	border: "1px solid var(--border)",
	fontSize: "13.5px",
	lineHeight: 1.7,
	color: "var(--text-1)",
	overflowX: "auto",
	whiteSpace: "pre"
};
var CODE_P1833 = `
#include <iostream>
#include <algorithm>
using namespace std;

int f[1005];                 // f[j]：用时不超过 j 的最大美观度
int w2[100005], v2[100005];  // 拆分后的「打包件」（有限件走这里）
int cnt;                     // 打包件总数

int main()
{
    int sh, sm, eh, em, n;              // 起止时刻 h:m 与樱花种数
    scanf("%d:%d %d:%d %d", &sh, &sm, &eh, &em, &n);
    int T = (eh - sh) * 60 + (em - sm); // 总时长（分钟）= 背包容量

    for (int i = 1; i <= n; i++)
    {
        int w, v, p;                    // 花时间、美观度、件数上限 P
        cin >> w >> v >> p;

        if (p == 0)                     // ★P=0：无限件 → 完全背包，正序
        {
            for (int j = w; j <= T; j++)
                f[j] = max(f[j], f[j - w] + v);
        }
        else                            // ★P>0：有限 P 件 → 多重，二进制拆分成打包件
        {
            int k = 1;                  // 1,2,4,… 各捆一包，余数单独成包
            while (k < p)
            {
                cnt++;
                w2[cnt] = k * w;
                v2[cnt] = k * v;
                p -= k;
                k <<= 1;
            }
            if (p > 0)
            {
                cnt++;
                w2[cnt] = p * w;
                v2[cnt] = p * v;
            }
        }
    }

    for (int i = 1; i <= cnt; i++)      // 有限件的打包件统一当 01 物品，逆序
        for (int j = T; j >= w2[i]; j--)
            f[j] = max(f[j], f[j - w2[i]] + v2[i]);

    cout << f[T] << endl;
    return 0;
}`;
var CODE_P2851 = `
#include <iostream>
#include <algorithm>
using namespace std;

const int INF = 1e9;
int val[105], c[105];        // 第 i 种硬币面值、付款端持有数量
int fpay[100005];            // 付款端：凑「≥ 目标」的最少枚数（多重）
int fchg[100005];            // 找零端：凑「恰好」的最少枚数（完全）

int main()
{
    int n, T;                           // 硬币种数、商品价格
    cin >> n >> T;
    int mx = 0;                         // 最大单面值（决定超付上界）
    for (int i = 1; i <= n; i++) { cin >> val[i]; mx = max(mx, val[i]); }
    for (int i = 1; i <= n; i++)   cin >> c[i];

    int LIM = T + mx * mx;              // 付款可枚举到的上界（经典界）
    for (int j = 1; j <= LIM; j++) fpay[j] = fchg[j] = INF;

    // 付款端：硬币有限 → 多重背包，二进制拆分后逆序，求最少枚数
    for (int i = 1; i <= n; i++)
    {
        int rest = c[i], k = 1;
        while (rest > 0)
        {
            int t = min(k, rest);       // 一包 t 枚
            for (int j = LIM; j >= t * val[i]; j--)
                if (fpay[j - t * val[i]] != INF)
                    fpay[j] = min(fpay[j], fpay[j - t * val[i]] + t);
            rest -= t;
            k <<= 1;
        }
    }

    // 找零端：店家硬币无限 → 完全背包，正序，求最少枚数
    for (int i = 1; i <= n; i++)
        for (int j = val[i]; j <= LIM; j++)
            if (fchg[j - val[i]] != INF)
                fchg[j] = min(fchg[j], fchg[j - val[i]] + 1);

    int ans = INF;                      // 枚举「实付 j 元、找零 j−T 元」
    for (int j = T; j <= LIM; j++)
        if (fpay[j] != INF && fchg[j - T] != INF)
            ans = min(ans, fpay[j] + fchg[j - T]);

    cout << (ans == INF ? -1 : ans) << endl;
    return 0;
}`;
function KnapsackMixed() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "同一道题里，三种「件数」并存"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"前三类背包各自只管一种「件数」：",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/01",
							style: { color: "var(--accent-2)" },
							children: "01 背包"
						}),
						"每种",
						/* @__PURE__ */ jsx("strong", { children: "恰一件" }),
						"、",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/complete",
							style: { color: "var(--accent-2)" },
							children: "完全背包"
						}),
						"每种",
						/* @__PURE__ */ jsx("strong", { children: "无限件" }),
						"、",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/multiple",
							style: { color: "var(--accent-2)" },
							children: "多重背包"
						}),
						"每种",
						/* @__PURE__ */ jsxs("strong", { children: [
							"有限 ",
							/* @__PURE__ */ jsx(M, { children: "m" }),
							" 件"
						] }),
						"。 可现实里的一道题，常常",
						/* @__PURE__ */ jsx("strong", { children: "三种物品混在一起" }),
						"：有的只有一件、有的管够、有的限量。这就是",
						/* @__PURE__ */ jsx("strong", { children: "混合背包" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(MixedSetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "同一个背包，三件物品件数属性不同：物品 1 只有一件（×1）、物品 2 无限（×∞）、物品 3 限 m 件（×m）——要在一次 DP 里全部装下。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"先看个小例子体会一下「为什么要分派」。容量 ",
						/* @__PURE__ */ jsx(M, { children: "m=9" }),
						"，物品 1 是 ",
						/* @__PURE__ */ jsx("strong", { children: "01 件" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "(w,v)=(2,3)" }),
						"，物品 2 是",
						/* @__PURE__ */ jsx("strong", { children: "完全件" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "(3,4)" }),
						"。 物品 1 至多拿一次，物品 2 却能反复拿。如果对它俩用",
						/* @__PURE__ */ jsx("strong", { children: "同一套循环方向" }),
						"，必然有一个出错—— 要么把只有一件的物品 1 反复塞（当成了完全），要么把管够的物品 2 也锁死成一件（当成了 01）。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"难点不在「想出新方程」——混合背包",
						/* @__PURE__ */ jsx("strong", { children: "没有新方程" }),
						"。难点在于：不同物品的",
						/* @__PURE__ */ jsx("strong", { children: "件数属性不同" }),
						"， 必须",
						/* @__PURE__ */ jsx("strong", { children: "逐件判断它属于哪一类，再套用那一类的转移方式" }),
						"。这份「看属性、选方式」的对照，就是这一节的主角——",
						/* @__PURE__ */ jsx("strong", { children: "分派表" }),
						"。"
					] })]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态不变，靠「循环方向」分派"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "状态照旧。" }),
							"还是那条一维滚动数组：",
							/* @__PURE__ */ jsx(M, { children: "f[j]" }),
							" 表示容量不超过 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 时能取得的最大价值。 转移也照旧，就是那句熟得不能再熟的："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[j]=\\max\\big(f[j],\\ f[j-w]+v\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"三类物品",
							/* @__PURE__ */ jsxs("strong", { children: [
								"共用这一格 ",
								/* @__PURE__ */ jsx(M, { children: "f[j]" }),
								"、共用这一句转移"
							] }),
							"。它们唯一的差别，是",
							/* @__PURE__ */ jsxs("strong", { children: ["怎么遍历容量 ", /* @__PURE__ */ jsx(M, { children: "j" })] }),
							"——回想前几节反复强调的那件事："
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(DispatchFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "分派表：看这件的件数属性，就用对应的转移方式——01 倒序、完全正序、多重先二进制拆包再逐包倒序。三条路最终都写同一格 f[j]。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "为什么方向就能决定物种？" }),
							"算 ",
							/* @__PURE__ */ jsx(M, { children: "f[j]" }),
							" 要用到 ",
							/* @__PURE__ */ jsx(M, { children: "f[j-w]" }),
							"："
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "01（恰一件）→ 倒序" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "j:m\\to w" }),
							"）：此刻 ",
							/* @__PURE__ */ jsx(M, { children: "f[j-w]" }),
							" 还没被",
							/* @__PURE__ */ jsx("strong", { children: "本件" }),
							"动过，是「这件还没进来」的干净旧值，于是本件至多被计入一次。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "完全（无限件）→ 正序" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "j:w\\to m" }),
							"）：此刻 ",
							/* @__PURE__ */ jsx(M, { children: "f[j-w]" }),
							" ",
							/* @__PURE__ */ jsx("strong", { children: "可能已经含了本件" }),
							"，于是同一件能被",
							/* @__PURE__ */ jsx("strong", { children: "反复叠加" }),
							"，正好表达「无限次」。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "多重（有限件）→ 先拆再倒序" }),
							"：把 ",
							/* @__PURE__ */ jsx(M, { children: "m" }),
							" 件",
							/* @__PURE__ */ jsx("strong", { children: "二进制拆" }),
							"成 ",
							/* @__PURE__ */ jsx(M, { children: "1,2,4,\\dots" }),
							" 与余数几个「打包件」，每个打包件当一件普通 01 物品",
							/* @__PURE__ */ jsx("strong", { children: "倒序" }),
							"处理。 拆分保证「取 0…",
							/* @__PURE__ */ jsx(M, { children: "m" }),
							" 件」的每种可能都能凑出，倒序保证每个包至多用一次——合起来就是「不超过 ",
							/* @__PURE__ */ jsx(M, { children: "m" }),
							" 件」。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质 · 三类物品能同题混装，因为它们落在同一维 f[j] 上",
					children: [
						"混合背包不是一个新算法，而是前三节的",
						/* @__PURE__ */ jsx("strong", { children: "拼装" }),
						"。既然 01、完全、多重",
						/* @__PURE__ */ jsxs("strong", { children: ["最终都归结为同一句 ", /* @__PURE__ */ jsx(M, { children: "f[j]=\\max(f[j],f[j-w]+v)" })] }),
						"， 就完全可以在",
						/* @__PURE__ */ jsxs("strong", { children: ["同一个 ", /* @__PURE__ */ jsx(M, { children: "f[j]" })] }),
						" 上，对每件物品",
						/* @__PURE__ */ jsx("strong", { children: "按其件数属性选择遍历方向 / 是否拆包" }),
						"，一件件叠加处理。谁先谁后都不影响结果——因为每件都只依赖「它进来之前」的 ",
						/* @__PURE__ */ jsx(M, { children: "f" }),
						"。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "分派的骨架长这样"
			}), /* @__PURE__ */ jsxs("div", {
				className: "prose",
				children: [
					/* @__PURE__ */ jsx("p", { children: "把分派表落成代码，主循环就是「逐件物品，看属性走对应分支」：" }),
					/* @__PURE__ */ jsx("pre", {
						className: "mono",
						style: preMono,
						children: `for 每件物品 (kind, w, v, m):
    if kind == 01:                 // 恰一件
        for j = W downto w:        //   倒序
            f[j] = max(f[j], f[j−w] + v)
    elif kind == 完全:              // 无限件
        for j = w to W:            //   正序
            f[j] = max(f[j], f[j−w] + v)
    else kind == 多重:              // 有限 m 件
        把 m 二进制拆成若干「打包件」(cnt·w, cnt·v)
        for 每个打包件 (w', v'):
            for j = W downto w':   //   逐包倒序（当 01 物品）
                f[j] = max(f[j], f[j−w'] + v')`
					}),
					/* @__PURE__ */ jsxs("p", { children: [
						"三条分支的循环体",
						/* @__PURE__ */ jsx("strong", { children: "一字不差" }),
						"，区别只在 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 的方向与多重那一步的",
						/* @__PURE__ */ jsx("strong", { children: "拆包" }),
						"。 把它们串在一个大循环里，一维 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" 就地累积——处理完全部物品，",
						/* @__PURE__ */ jsx(M, { children: "f[W]" }),
						" 就是答案。这正是混合背包的定义式。"
					] })
				]
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "跟着算一遍：一件 01 + 一件完全"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"用开头的例子——物品 1 是 ",
						/* @__PURE__ */ jsx("strong", { children: "01 件" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "(2,3)" }),
						"、物品 2 是",
						/* @__PURE__ */ jsx("strong", { children: "完全件" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "(3,4)" }),
						"，容量 8。把两件",
						/* @__PURE__ */ jsx("strong", { children: "先后" }),
						"落到同一维 ",
						/* @__PURE__ */ jsx(M, { children: "f" }),
						" 上："
					] })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "steps",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "step",
							children: [/* @__PURE__ */ jsx("span", {
								className: "step__n",
								children: "0"
							}), /* @__PURE__ */ jsxs("div", {
								className: "step__b",
								children: [
									/* @__PURE__ */ jsx("b", { children: "初始化。" }),
									" 空背包，",
									/* @__PURE__ */ jsx(M, { children: "f[0..8]=0" }),
									"。三类物品共用这同一条一维数组。"
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "step",
							children: [/* @__PURE__ */ jsx("span", {
								className: "step__n",
								children: "1"
							}), /* @__PURE__ */ jsxs("div", {
								className: "step__b",
								children: [
									/* @__PURE__ */ jsx("b", { children: "处理物品 1（01 件）" }),
									"，",
									/* @__PURE__ */ jsx("strong", { children: "倒序" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "j:8\\to 2" }),
									"：每格 ",
									/* @__PURE__ */ jsx(M, { children: "f[j]=\\max(f[j],f[j-2]+3)" }),
									"，来源都是旧值 0。这一行变成 ",
									/* @__PURE__ */ jsx(M, { children: "0,0,3,3,3,3,3,3,3" }),
									"——因为倒序，这件",
									/* @__PURE__ */ jsx("strong", { children: "只被计入一次" }),
									"。"
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "step",
							children: [/* @__PURE__ */ jsx("span", {
								className: "step__n",
								children: "2"
							}), /* @__PURE__ */ jsxs("div", {
								className: "step__b",
								children: [
									/* @__PURE__ */ jsx("b", { children: "处理物品 2（完全件）" }),
									"，",
									/* @__PURE__ */ jsx("strong", { children: "正序" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "j:3\\to 8" }),
									"。到 ",
									/* @__PURE__ */ jsx(M, { children: "f[6]=\\max(3,\\ f[3]+4)" }),
									"，而 ",
									/* @__PURE__ */ jsx(M, { children: "f[3]" }),
									" 此刻",
									/* @__PURE__ */ jsx("strong", { children: "已被本件更新为 4" }),
									"，故 ",
									/* @__PURE__ */ jsx(M, { children: "f[6]=4+4=8" }),
									"——同一件完全物品",
									/* @__PURE__ */ jsx("strong", { children: "被叠了两次" }),
									"（装了 2 个），正是「无限件」想要的。"
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "step",
							children: [/* @__PURE__ */ jsx("span", {
								className: "step__n",
								children: "3"
							}), /* @__PURE__ */ jsxs("div", {
								className: "step__b",
								children: [
									/* @__PURE__ */ jsx("b", { children: "读答案。" }),
									" 继续到 ",
									/* @__PURE__ */ jsx(M, { children: "f[8]=\\max(3,\\ f[5]+4)" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "f[5]=7" }),
									"（= 01 件 3 + 一个完全件 4），故 ",
									/* @__PURE__ */ jsx(M, { children: "f[8]=7+4=11" }),
									"。对应「01 件一个 + 完全件两个」：重 ",
									/* @__PURE__ */ jsx(M, { children: "2+3+3=8" }),
									"、价值 ",
									/* @__PURE__ */ jsx(M, { children: "3+4+4=11" }),
									"。",
									/* @__PURE__ */ jsx("strong", { children: "01 只出一次、完全反复出" }),
									"，两种约束在同一维里各得其所。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(MixedTraceFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "同一条 f 数组的两次快照：上行是 01 件倒序处理后（每格至多含一件），下行再被完全件正序处理，高亮格为被完全件抬升的位置——f[8] 一路涨到 11。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示可以给每件物品",
						/* @__PURE__ */ jsx("strong", { children: "切换件数属性" }),
						"（01 / 完全 / 多重），看它们在同一维 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" 上逐格填、每步标注「本件按哪种处理」。改改类型、",
						/* @__PURE__ */ jsx(M, { children: "w,v,m" }),
						" 或容量试试。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看三类物品落进同一维 f"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(KnapsackMixedDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "一个统一写法：把 01 并进多重"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"实战里，「01」其实是「多重」的",
							/* @__PURE__ */ jsx("strong", { children: "特例" }),
							"——恰一件，就是件数上限 ",
							/* @__PURE__ */ jsx(M, { children: "m=1" }),
							" 的多重物品（二进制拆分后只有",
							/* @__PURE__ */ jsxs("strong", { children: [
								"一个 ",
								/* @__PURE__ */ jsx(M, { children: "\\times1" }),
								" 包"
							] }),
							"，逆序一遍，与 01 分毫不差）。 于是分派只需",
							/* @__PURE__ */ jsx("strong", { children: "两条分支" }),
							"就够："
						] }),
						/* @__PURE__ */ jsx("pre", {
							className: "mono",
							style: preMono,
							children: `for 每件物品 (w, v, p):        // p = 件数：0 表示无限
    if p == 0:                 // 无限 → 完全，正序
        for j = w to W: f[j] = max(f[j], f[j−w] + v)
    else:                      // p ≥ 1（含 p==1 的“恰一件”）
        把 p 二进制拆包，各包当 01 物品逆序处理`
						}),
						/* @__PURE__ */ jsxs("p", { children: [
							"这正是例题 ",
							/* @__PURE__ */ jsx("strong", { children: "P1833 樱花" }),
							" 的标准写法：题面用 ",
							/* @__PURE__ */ jsx(M, { children: "P_i" }),
							" 编码件数——",
							/* @__PURE__ */ jsx(M, { children: "P_i=1" }),
							" 是 01、",
							/* @__PURE__ */ jsx(M, { children: "0<P_i<\\infty" }),
							" 是多重、",
							/* @__PURE__ */ jsx(M, { children: "P_i=0" }),
							" 是完全。 按 ",
							/* @__PURE__ */ jsx(M, { children: "P_i" }),
							" 一分派，三类樱花就在同一维 ",
							/* @__PURE__ */ jsx(M, { children: "f" }),
							" 上算完了。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱 · 别把方向记反 / 别忘拆多重",
					children: [
						"混合背包最容易翻车的两处：其一，",
						/* @__PURE__ */ jsx("strong", { children: "把完全件写成倒序" }),
						"（它就退化成 01，无限件变一件），或",
						/* @__PURE__ */ jsx("strong", { children: "把 01 件写成正序" }),
						"（它就被反复取，答案虚高）——方向必须随件数属性走。 其二，",
						/* @__PURE__ */ jsx("strong", { children: "多重件忘了二进制拆分" }),
						"，直接当完全（正序）会超取、直接当 01（一个包倒序）会漏取。拿不准时回看 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/01",
							style: { color: "var(--accent-2)" },
							children: "01"
						}),
						" / ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/complete",
							style: { color: "var(--accent-2)" },
							children: "完全"
						}),
						" / ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/multiple",
							style: { color: "var(--accent-2)" },
							children: "多重"
						}),
						" 三页的方向依据。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "例题"
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1833",
					name: "樱花",
					src: "洛谷原生",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给定赏花起止时刻（得总时长 ",
								/* @__PURE__ */ jsx(M, { children: "T" }),
								" 作容量），",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 种樱花各有观赏耗时 ",
								/* @__PURE__ */ jsx(M, { children: "w_i" }),
								"、美观度 ",
								/* @__PURE__ */ jsx(M, { children: "v_i" }),
								" 和株数 ",
								/* @__PURE__ */ jsx(M, { children: "P_i" }),
								"。求 ",
								/* @__PURE__ */ jsx(M, { children: "T" }),
								" 时间内最大美观度。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系（一题三类俱全）",
							children: [
								"件数由 ",
								/* @__PURE__ */ jsx(M, { children: "P_i" }),
								" 编码：",
								/* @__PURE__ */ jsx(M, { children: "P_i=1" }),
								" → ",
								/* @__PURE__ */ jsx("strong", { children: "01" }),
								"（恰一株）、",
								/* @__PURE__ */ jsx(M, { children: "0<P_i<\\infty" }),
								" → ",
								/* @__PURE__ */ jsx("strong", { children: "多重" }),
								"（有限株）、",
								/* @__PURE__ */ jsx(M, { children: "P_i=0" }),
								" → ",
								/* @__PURE__ */ jsx("strong", { children: "完全" }),
								"（无限株）。三类落在同一维 ",
								/* @__PURE__ */ jsx(M, { children: "f" }),
								" 上，是混合背包",
								/* @__PURE__ */ jsx("strong", { children: "定义式" }),
								"最标准的一题。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"它把「按件数属性分派」摆到明面上——读入时看一眼 ",
								/* @__PURE__ */ jsx(M, { children: "P_i" }),
								" 就知道走哪条分支。用",
								/* @__PURE__ */ jsx("strong", { children: "「01 并进多重」的两分支统一写法" }),
								"最省心：",
								/* @__PURE__ */ jsx(M, { children: "P_i=0" }),
								" 走完全正序，其余一律二进制拆包逆序。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"完全支 ",
								/* @__PURE__ */ jsx(M, { children: "f[j]=\\max(f[j],f[j-w_i]+v_i)" }),
								" 正序；有限支拆包后逐包逆序。时间 ",
								/* @__PURE__ */ jsx(M, { children: "O\\!\\big(T\\cdot(n_\\infty+\\sum\\log P_i)\\big)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（按 P 分派 · 两分支统一写法）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1833,
								luogu: "P1833"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2851",
					name: "[USACO2006 Dec] The Fewest Coins S",
					src: "USACO 2006",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"商品价格 ",
								/* @__PURE__ */ jsx(M, { children: "T" }),
								"。你手上第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 种硬币有",
								/* @__PURE__ */ jsx("strong", { children: "有限枚" }),
								"；店家找零的硬币",
								/* @__PURE__ */ jsx("strong", { children: "无限枚" }),
								"。你付出若干、店家找回若干，求这笔交易",
								/* @__PURE__ */ jsx("strong", { children: "经手硬币总数最少" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系（两个背包合成）",
							children: [
								/* @__PURE__ */ jsx("strong", { children: "付款端" }),
								"：自己的硬币有限 → ",
								/* @__PURE__ */ jsx("strong", { children: "多重背包" }),
								"，求「凑出金额 ",
								/* @__PURE__ */ jsx(M, { children: "j\\ge T" }),
								" 的最少枚数」",
								/* @__PURE__ */ jsx(M, { children: "fpay[j]" }),
								"（二进制拆分，逆序，",
								/* @__PURE__ */ jsx(M, { children: "\\min" }),
								" 计数）。",
								/* @__PURE__ */ jsx("strong", { children: "找零端" }),
								"：店家硬币无限 → ",
								/* @__PURE__ */ jsx("strong", { children: "完全背包" }),
								"，求「凑出金额 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 的最少枚数」",
								/* @__PURE__ */ jsx(M, { children: "fchg[j]" }),
								"（正序，",
								/* @__PURE__ */ jsx(M, { children: "\\min" }),
								"）。答案 ",
								/* @__PURE__ */ jsx(M, { children: "\\min_{j\\ge T}\\big(fpay[j]+fchg[j-T]\\big)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"混合背包的另一副面孔：不是一个背包里混三类物品，而是",
								/* @__PURE__ */ jsx("strong", { children: "多重与完全两个背包各算一半再拼" }),
								"。练的是「识别哪端有限、哪端无限，各上对应背包」的分派眼力。超付上界取 ",
								/* @__PURE__ */ jsx(M, { children: "T+\\max(val)^2" }),
								" 是经典结论。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"付款 ",
								/* @__PURE__ */ jsx(M, { children: "fpay[j]=\\min(fpay[j],fpay[j-c\\,val]+c)" }),
								"；找零 ",
								/* @__PURE__ */ jsx(M, { children: "fchg[j]=\\min(fchg[j],fchg[j-val]+1)" }),
								"。时间约 ",
								/* @__PURE__ */ jsx(M, { children: "O\\!\\big((T+\\max val^2)\\cdot(n+\\sum\\log c_i)\\big)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（付款多重 + 找零完全）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2851,
								luogu: "P2851"
							})
						})
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson exercises",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "练习"
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "prose",
					style: {
						maxWidth: "none",
						fontSize: "13.5px",
						color: "var(--text-3)",
						marginBottom: "var(--sp-4)"
					},
					children: [
						"说明：纯「三类物品同题混装」的洛谷原生题目池很窄——真正综合的题多半把混合骨架藏进更大的模型里。因此这里用",
						/* @__PURE__ */ jsx("strong", { children: "各分支的代表题" }),
						"组合覆盖：先用一道纯完全、一道纯有限件，把混合骨架的两条支路分别练熟，再回头做上面的 P1833 就水到渠成。"
					]
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1616",
					name: "疯狂的采药",
					hint: "混合骨架的『完全』分支：草药可无限次采，先把它当纯完全背包正推练手——f[j]=max(f[j],f[j−w]+v)，j 从 w 到 T 正序。注意 f 与答案可能超 int，开 long long。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1077",
					name: "[NOIP2012 普及组] 摆花",
					hint: "混合骨架的『有限件（多重）』分支，且是计数版：f[j] 表示前几种花恰好摆 j 盆的方案数，每种不超过 a_i 盆；把 max 换成累加，那一维件数可用前缀和优化掉。"
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pointer-cue",
			children: [
				/* @__PURE__ */ jsx(Gamepad2, { size: 18 }),
				"回 ",
				/* @__PURE__ */ jsx(Link, {
					to: "/part/a",
					style: {
						color: "var(--accent-1)",
						fontWeight: 600
					},
					children: "A 部分页的「装包大师」"
				}),
				"时，试着给每件宝物先贴个标签：这件只有一件、那件成箱、另一件管够——混合背包做的就是这道「逐件分派」的分诊，再把三条支路各自转移。"
			]
		})
	] });
}
//#endregion
export { KnapsackMixed as default };
