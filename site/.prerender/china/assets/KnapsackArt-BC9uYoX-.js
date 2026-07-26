import { n as recordZeroOneKnapsack } from "./internal-VjiERoSM.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { useMemo, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/knapsack/solvers.ts
function settled(vals) {
	const s = {};
	for (let r = 0; r < vals.length; r++) for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = "settled";
	return s;
}
/** 二维原型 01 背包：f[i][j] = max(f[i-1][j], f[i-1][j-w]+v) */
function knapsack2D(items, W) {
	const n = items.length;
	const run = recordZeroOneKnapsack(items, W);
	const f = Array.from({ length: n + 1 }, () => Array(W + 1).fill(null));
	for (let j = 0; j <= W; j++) f[0][j] = 0;
	const snap = () => f.map((row) => row.slice());
	const frames = [];
	frames.push({
		values: snap(),
		states: settled(f),
		caption: "<b>第 0 行</b>：一件物品都不考虑时，任何容量下最大价值都是 <b>0</b>（初始化）。",
		formula: "f[0][j] = 0"
	});
	for (const event of run.events) {
		const { itemIndex: i, capacity: j, item, notTake, take, best, takeBetter } = event;
		const { w, v } = item;
		const canTake = take !== null;
		f[i][j] = best;
		const states = settled(f);
		const arrows = [];
		states[key(i - 1, j)] = "source";
		arrows.push({
			from: {
				r: i - 1,
				c: j
			},
			to: {
				r: i,
				c: j
			},
			kind: takeBetter ? "source" : "chosen"
		});
		if (canTake) {
			states[key(i - 1, j - w)] = "source";
			arrows.push({
				from: {
					r: i - 1,
					c: j - w
				},
				to: {
					r: i,
					c: j
				},
				kind: takeBetter ? "chosen" : "source"
			});
		}
		if (takeBetter) states[key(i - 1, j - w)] = "chosen";
		else states[key(i - 1, j)] = "chosen";
		states[key(i, j)] = "current";
		const caption = canTake ? `物品 <b>${i}</b>（w=${w}, v=${v}）· 容量 <b>${j}</b>：不取 = f[${i - 1}][${j}] = <b>${notTake}</b>；取 = f[${i - 1}][${j - w}]+${v} = <b>${take}</b> → 取较大者 <b>${best}</b>。` : `物品 <b>${i}</b>（w=${w}）· 容量 <b>${j}</b>：装不下（${j} &lt; ${w}），只能不取 = <b>${notTake}</b>。`;
		const formula = canTake ? `f[${i}][${j}]=\\max(${notTake},\\ ${take - v}+${v})=${best}` : `f[${i}][${j}]=f[${i - 1}][${j}]=${notTake}`;
		frames.push({
			values: snap(),
			states,
			arrows,
			active: {
				r: i,
				c: j
			},
			caption,
			formula
		});
	}
	const fin = settled(f);
	fin[key(n, W)] = "chosen";
	frames.push({
		values: snap(),
		states: fin,
		caption: `答案在右下角 <b>f[${n}][${W}] = ${run.result.value}</b>——考虑全部 ${n} 件、容量 ${W} 时的最大价值。`,
		formula: `f[${n}][${W}]=${run.result.value}`
	});
	return {
		rows: n + 1,
		cols: W + 1,
		rowHeaderLabels: Array.from({ length: n + 1 }, (_, i) => i === 0 ? "∅" : `${i}`),
		colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
		frames
	};
}
/** 一维滚动数组。reverse=01逆推(正确) · forward=01顺推(制造重复取的 bug) · complete=完全背包正推(正确) */
function knapsack1D(items, W, mode) {
	const f = Array(W + 1).fill(0);
	const snap = () => [f.slice()];
	const frames = [];
	const forward = mode !== "reverse";
	frames.push({
		values: snap(),
		states: settled(snap()),
		caption: "初始：容量 0…W 的最大价值都是 <b>0</b>（空背包）。",
		formula: "f[j]=0"
	});
	for (let i = 1; i <= items.length; i++) {
		const { w, v } = items[i - 1];
		const updated = /* @__PURE__ */ new Set();
		const range = [];
		if (forward) for (let j = w; j <= W; j++) range.push(j);
		else for (let j = W; j >= w; j--) range.push(j);
		for (const j of range) {
			const old = f[j];
			const cand = f[j - w] + v;
			const better = cand > old;
			const reused = forward && mode !== "complete" && updated.has(j - w);
			if (better) f[j] = cand;
			const states = settled(snap());
			states[key(0, j - w)] = "source";
			const arrows = [{
				from: {
					r: 0,
					c: j - w
				},
				to: {
					r: 0,
					c: j
				},
				kind: better ? "chosen" : "source"
			}];
			if (better) states[key(0, j - w)] = reused ? "invalid" : "chosen";
			states[key(0, j)] = "current";
			let caption = `物品 <b>${i}</b>（w=${w}, v=${v}）· <b>${forward ? "正" : "逆"}推</b> j=${j}：f[${j - w}]+${v} = <b>${cand}</b> ${better ? "&gt;" : "≤"} f[${j}]=<b>${old}</b> → ${better ? `更新为 <b>${cand}</b>` : "不变"}。`;
			if (reused && better) caption += ` <span class="bad">⚠ f[${j - w}] 本轮已被物品 ${i} 更新过——物品 ${i} 被<b>重复计入</b>！这正是 01 背包顺推的 bug。</span>`;
			if (better) updated.add(j);
			frames.push({
				values: snap(),
				states,
				active: {
					r: 0,
					c: j
				},
				arrows,
				caption
			});
		}
	}
	const fin = settled(snap());
	fin[key(0, W)] = "chosen";
	const note = mode === "forward" ? `顺推得到 <b>f[${W}] = ${f[W]}</b>——若这里比逆推大，说明有物品被重复取了（错误）。` : mode === "complete" ? `完全背包答案 <b>f[${W}] = ${f[W]}</b>：正推让同一物品可被多次计入，正是我们想要的。` : `逆推答案 <b>f[${W}] = ${f[W]}</b>：每件至多取一次，正确。`;
	frames.push({
		values: snap(),
		states: fin,
		caption: note,
		formula: `f[${W}]=${f[W]}`
	});
	return {
		rows: 1,
		cols: W + 1,
		rowHeaderLabels: ["f"],
		colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
		frames
	};
}
//#endregion
//#region src/components/demos/knapsack/KnapsackDemo.tsx
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
var MODES_01 = [
	{
		id: "2D",
		label: "二维原型"
	},
	{
		id: "reverse",
		label: "一维 · 逆推 ✓"
	},
	{
		id: "forward",
		label: "一维 · 顺推 ✗",
		danger: true
	}
];
function KnapsackDemo({ variant = "01" }) {
	const [items, setItems] = useState(variant === "complete" ? [{
		w: 2,
		v: 3
	}, {
		w: 3,
		v: 5
	}] : [
		{
			w: 2,
			v: 3
		},
		{
			w: 3,
			v: 4
		},
		{
			w: 4,
			v: 5
		}
	]);
	const [cap, setCap] = useState(variant === "complete" ? 9 : 8);
	const [mode, setMode] = useState(variant === "complete" ? "complete" : "2D");
	const model = useMemo(() => {
		if (mode === "2D") return knapsack2D(items, cap);
		return knapsack1D(items, cap, mode);
	}, [
		items,
		cap,
		mode
	]);
	const modelKey = `${variant}-${mode}-${cap}-${items.map((it) => `${it.w}.${it.v}`).join("_")}`;
	const setItem = (i, patch) => setItems((arr) => arr.map((it, k) => k === i ? {
		...it,
		...patch
	} : it));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "kd__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "物品（可改重量 / 价值）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "kd__items",
				children: [items.map((it, i) => /* @__PURE__ */ jsxs("div", {
					className: "kd__item",
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
						})
					]
				}, i)), items.length < 5 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: () => setItems((a) => [...a, {
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
		variant === "01" && /* @__PURE__ */ jsx("div", {
			className: "kd__modes",
			children: MODES_01.map((m) => /* @__PURE__ */ jsx("button", {
				className: `kd__mode${m.danger ? " danger" : ""}${mode === m.id ? " on" : ""}`,
				onClick: () => setMode(m.id),
				children: m.label
			}, m.id))
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/content/a/KnapsackArt.tsx
function SetupFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 170",
		role: "img",
		"aria-label": "三件物品与一个背包",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "ka-ar",
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
					v: 3
				},
				{
					w: 3,
					v: 4
				},
				{
					w: 4,
					v: 5
				}
			].map((it, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${16 + i * 92},34)`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "80",
						height: "100",
						rx: "14",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "40",
						y: "28",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: ["物品 ", i + 1]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "40",
						y: "57",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--text-1)",
						children: ["w=", it.w]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "40",
						y: "81",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--accent-1)",
						children: ["v=", it.v]
					})
				]
			}, i)),
			/* @__PURE__ */ jsx("path", {
				d: "M300 84 H366",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#ka-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(398,30)",
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
						y: "62",
						textAnchor: "middle",
						fontSize: "14",
						fill: "var(--text-1)",
						children: "背包"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "88",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--accent-1)",
						children: "容量 m=8"
					})
				]
			})
		]
	});
}
function DecisionFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 288",
		role: "img",
		"aria-label": "第 i 件取或不取的决策分叉",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "ka-ar2",
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
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(250,8)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "140",
						height: "48",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "70",
						y: "21",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "第 i 件 · 容量 j"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "70",
						y: "39",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "f[i][j] = ?"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M300 56 L150 98",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#ka-ar2)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M340 56 L492 98",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#ka-ar2)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "196",
				y: "84",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "不取"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "404",
				y: "84",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "取（需 j ≥ w）"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(36,102)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "224",
						height: "66",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "112",
						y: "27",
						textAnchor: "middle",
						fontSize: "13",
						fill: "var(--text-1)",
						children: "第 i 件没参与"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "112",
						y: "49",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "= f[i−1][j]"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(380,102)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "244",
						height: "66",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "122",
						y: "27",
						textAnchor: "middle",
						fontSize: "13",
						fill: "var(--text-1)",
						children: "腾出 w，补上价值 v"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "122",
						y: "49",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "= f[i−1][j−w] + v"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M150 168 L300 222",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#ka-ar2)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M502 168 L340 222",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#ka-ar2)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(206,224)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "228",
					height: "54",
					rx: "14",
					fill: "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: "114",
					y: "32",
					textAnchor: "middle",
					fontSize: "14",
					className: "mono",
					fill: "var(--text-1)",
					children: "取较大者 = max(两者)"
				})]
			})
		]
	});
}
function ForwardBugFigure() {
	const cols = [
		{
			j: 0,
			rev: 0,
			fwd: 0
		},
		{
			j: 2,
			rev: 3,
			fwd: 3
		},
		{
			j: 4,
			rev: 3,
			fwd: 6
		},
		{
			j: 6,
			rev: 3,
			fwd: 9
		}
	];
	const x0 = 150;
	const dx = 112;
	const cw = 64;
	const ch = 42;
	const cx = (i) => x0 + i * dx;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 605 185",
		role: "img",
		"aria-label": "同一件物品在逆推与正推下的结果对比",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "fb-ar",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--viz-invalid)"
				})
			}) }),
			cols.map((c, i) => /* @__PURE__ */ jsxs("text", {
				x: cx(i) + cw / 2,
				y: "16",
				textAnchor: "middle",
				fontSize: "12",
				className: "mono",
				fill: "var(--text-3)",
				children: ["j=", c.j]
			}, `h${i}`)),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "60",
				fontSize: "13",
				fontWeight: "600",
				fill: "var(--viz-chosen)",
				children: "逆推 ✓"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "147",
				fontSize: "13",
				fontWeight: "600",
				fill: "var(--viz-invalid)",
				children: "正推 ✗"
			}),
			cols.map((c, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${cx(i)},34)`,
				children: [/* @__PURE__ */ jsx("rect", {
					width: cw,
					height: ch,
					rx: "10",
					fill: "var(--surface-3)",
					stroke: "var(--border-strong)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: cw / 2,
					y: 27,
					textAnchor: "middle",
					fontSize: "17",
					className: "mono",
					fill: "var(--text-1)",
					children: c.rev
				})]
			}, `r${i}`)),
			cols.map((c, i) => {
				const bad = i > 1;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${cx(i)},121)`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: cw,
						height: ch,
						rx: "10",
						fill: bad ? "color-mix(in srgb, var(--viz-invalid) 15%, var(--surface-3))" : "var(--surface-3)",
						stroke: bad ? "var(--viz-invalid)" : "var(--border-strong)",
						strokeWidth: "1.5"
					}), /* @__PURE__ */ jsx("text", {
						x: cw / 2,
						y: 27,
						textAnchor: "middle",
						fontSize: "17",
						className: "mono",
						fill: bad ? "var(--viz-invalid)" : "var(--text-1)",
						children: c.fwd
					})]
				}, `f${i}`);
			}),
			[
				0,
				1,
				2
			].map((i) => /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("path", {
				d: `M ${cx(i) + cw} 142 H ${cx(i + 1) - 2}`,
				stroke: "var(--viz-invalid)",
				strokeWidth: "2",
				markerEnd: "url(#fb-ar)",
				fill: "none"
			}), /* @__PURE__ */ jsx("text", {
				x: (cx(i) + cw + cx(i + 1)) / 2,
				y: "134",
				textAnchor: "middle",
				fontSize: "11",
				fill: "var(--viz-invalid)",
				children: "+3"
			})] }, `a${i}`))
		]
	});
}
function CompleteSetupFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 600 168",
		role: "img",
		"aria-label": "每种物品可无限次取用的完全背包场景",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "kc-ar",
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
			[{
				w: 2,
				v: 3
			}, {
				w: 3,
				v: 5
			}].map((it, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${24 + i * 118},30)`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "98",
						height: "104",
						rx: "14",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(60,-10)",
						children: [/* @__PURE__ */ jsx("rect", {
							width: "46",
							height: "22",
							rx: "11",
							fill: "color-mix(in srgb, var(--accent-1) 20%, var(--surface-2))",
							stroke: "var(--accent-2)",
							strokeWidth: "1.2"
						}), /* @__PURE__ */ jsx("text", {
							x: "23",
							y: "15",
							textAnchor: "middle",
							fontSize: "12",
							className: "mono",
							fill: "var(--accent-1)",
							children: "×∞"
						})]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "49",
						y: "30",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: ["物品 ", i + 1]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "49",
						y: "60",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--text-1)",
						children: ["w=", it.w]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "49",
						y: "84",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--accent-1)",
						children: ["v=", it.v]
					})
				]
			}, i)),
			/* @__PURE__ */ jsx("path", {
				d: "M280 82 H344",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#kc-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(372,28)",
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
						children: "背包"
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
function CompleteOptFigure() {
	const CW = 76;
	const CH = 40;
	const gx = (c) => 48 + c * 88;
	const gy = (r) => 28 + r * 58;
	const cxp = (c) => gx(c) + CW / 2;
	const cyp = (r) => gy(r) + CH / 2;
	const panel = (dx, title, variant) => {
		const takeSrc = variant === "01" ? {
			c: 0,
			r: 0
		} : {
			c: 0,
			r: 1
		};
		const cells = [
			{
				c: 0,
				r: 0,
				t: "f[i−1][j−w]"
			},
			{
				c: 1,
				r: 0,
				t: "f[i−1][j]"
			},
			{
				c: 0,
				r: 1,
				t: variant === "01" ? "·" : "f[i][j−w]"
			},
			{
				c: 1,
				r: 1,
				t: "f[i][j]"
			}
		];
		return /* @__PURE__ */ jsxs("g", {
			transform: `translate(${dx},0)`,
			children: [
				/* @__PURE__ */ jsx("text", {
					x: cxp(0),
					y: "16",
					textAnchor: "start",
					fontSize: "12.5",
					fontWeight: "600",
					fill: "var(--accent-1)",
					children: title
				}),
				/* @__PURE__ */ jsx("text", {
					x: gx(0) - 14,
					y: cyp(0) + 4,
					textAnchor: "middle",
					fontSize: "10.5",
					className: "mono",
					fill: "var(--text-3)",
					children: "i−1"
				}),
				/* @__PURE__ */ jsx("text", {
					x: gx(0) - 14,
					y: cyp(1) + 4,
					textAnchor: "middle",
					fontSize: "10.5",
					className: "mono",
					fill: "var(--text-3)",
					children: "i"
				}),
				/* @__PURE__ */ jsx("text", {
					x: cxp(0),
					y: gy(1) + CH + 16,
					textAnchor: "middle",
					fontSize: "10.5",
					className: "mono",
					fill: "var(--text-3)",
					children: "j−w"
				}),
				/* @__PURE__ */ jsx("text", {
					x: cxp(1),
					y: gy(1) + CH + 16,
					textAnchor: "middle",
					fontSize: "10.5",
					className: "mono",
					fill: "var(--text-3)",
					children: "j"
				}),
				cells.map((cell, i) => {
					const src = cell.c === takeSrc.c && cell.r === takeSrc.r;
					const cur = cell.c === 1 && cell.r === 1;
					const blank = cell.t === "·";
					return /* @__PURE__ */ jsxs("g", {
						transform: `translate(${gx(cell.c)},${gy(cell.r)})`,
						children: [/* @__PURE__ */ jsx("rect", {
							width: CW,
							height: CH,
							rx: "8",
							fill: cur ? "color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))" : src ? "color-mix(in srgb, var(--viz-chosen) 15%, var(--surface-3))" : "var(--surface-3)",
							stroke: cur ? "var(--viz-current)" : src ? "var(--viz-chosen)" : "var(--border-strong)",
							strokeWidth: "1.5",
							opacity: blank ? .5 : 1
						}), /* @__PURE__ */ jsx("text", {
							x: CW / 2,
							y: "24",
							textAnchor: "middle",
							fontSize: "11",
							className: "mono",
							fill: blank ? "var(--text-3)" : "var(--text-1)",
							children: cell.t
						})]
					}, i);
				}),
				/* @__PURE__ */ jsx("line", {
					x1: cxp(1),
					y1: gy(0) + CH,
					x2: cxp(1),
					y2: gy(1),
					stroke: "var(--viz-source)",
					strokeWidth: "2",
					markerEnd: "url(#co-src)"
				}),
				variant === "01" ? /* @__PURE__ */ jsx("line", {
					x1: gx(0) + CW,
					y1: gy(0) + CH,
					x2: gx(1),
					y2: gy(1),
					stroke: "var(--viz-chosen)",
					strokeWidth: "2.5",
					markerEnd: "url(#co-cho)"
				}) : /* @__PURE__ */ jsx("line", {
					x1: gx(0) + CW,
					y1: cyp(1),
					x2: gx(1),
					y2: cyp(1),
					stroke: "var(--viz-chosen)",
					strokeWidth: "2.5",
					markerEnd: "url(#co-cho)"
				})
			]
		}, variant);
	};
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 530 200",
		role: "img",
		"aria-label": "01 背包与完全背包转移来源的对比",
		children: [
			/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsx("marker", {
				id: "co-src",
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
				id: "co-cho",
				markerWidth: "7",
				markerHeight: "7",
				refX: "5.5",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--viz-chosen)"
				})
			})] }),
			panel(6, "01 · 取来自上一行", "01"),
			panel(280, "完全 · 取来自本行", "complete")
		]
	});
}
//#endregion
export { SetupFigure as a, ForwardBugFigure as i, CompleteSetupFigure as n, KnapsackDemo as o, DecisionFigure as r, knapsack1D as s, CompleteOptFigure as t };
