import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, MousePointerClick, Network, Plus } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/knapsack-dependency/internal.ts
function enumerateDependencyCombos(master, accessories) {
	const combos = [];
	for (let mask = 0; mask < 1 << accessories.length; mask++) {
		let w = master.w;
		let v = master.v;
		const picks = [];
		const selected = [];
		for (let index = 0; index < accessories.length; index++) {
			const take = (mask & 1 << index) !== 0;
			picks.push(take);
			if (!take) continue;
			w += accessories[index].w;
			v += accessories[index].v;
			selected.push(index + 1);
		}
		combos.push({
			w,
			v,
			picks,
			label: selected.length === 0 ? "仅主" : `主+附${selected.join("")}`
		});
	}
	return combos;
}
function executeDependencyKnapsack(master, accessories, capacity, emit) {
	const combos = enumerateDependencyCombos(master, accessories);
	const table = [Array(capacity + 1).fill(0), Array(capacity + 1).fill(0)];
	for (let currentCapacity = 0; currentCapacity <= capacity; currentCapacity++) {
		const skip = table[0][currentCapacity];
		let bestTake = null;
		let takeIndex = -1;
		for (let index = 0; index < combos.length; index++) {
			const combo = combos[index];
			if (currentCapacity < combo.w) continue;
			const candidate = table[0][currentCapacity - combo.w] + combo.v;
			if (bestTake === null || candidate > bestTake) {
				bestTake = candidate;
				takeIndex = index;
			}
		}
		const best = bestTake !== null && bestTake > skip ? bestTake : skip;
		const takeWins = bestTake !== null && bestTake > skip;
		table[1][currentCapacity] = best;
		emit({
			type: "cell",
			capacity: currentCapacity,
			skip,
			bestTake,
			takeIndex,
			best,
			takeWins
		});
	}
	const value = table[1][capacity];
	return {
		value,
		table,
		combos,
		bestCombo: combos.find((combo) => combo.w <= capacity && combo.v === value) ?? null
	};
}
function recordDependencyKnapsack(master, accessories, capacity) {
	const events = [];
	return {
		result: executeDependencyKnapsack(master, accessories, capacity, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/components/demos/knapsack/dependencySolver.ts
function settled(vals) {
	const s = {};
	for (let r = 0; r < vals.length; r++) for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = "settled";
	return s;
}
/**
* 依赖归约的核心：把「主件 + 它的附件的任一子集」枚举成若干**合法组合**。
* 附件必须依主件而选——所以每个组合都**含主件**，再叠加附件的一个子集（2^附件数 个）。
* 于是「有依赖的背包」= 这些组合构成**同一组**、组内至多选一个的**分组背包**。
*/
function enumCombos(master, acc) {
	return enumerateDependencyCombos(master, acc);
}
/**
* 有依赖的背包演示（单主件 + 若干附件）：
*   第 1 阶段——枚举出所有合法组合（每个组合含主件 + 一个附件子集）；
*   第 2 阶段——把这些组合当作**同一组**，做一维 f[j] 的分组背包（组内至多选一个）。
* 网格用二维原型 f[组][j]：第 0 行是空组的地基，第 1 行 = 处理「这一组组合」后的结果，
* 逐格取「不选本组」与「选组内某个组合」的较大者——恰好复用分组背包的转移。
*/
function dependencyKnapsack(master, acc, W) {
	const run = recordDependencyKnapsack(master, acc, W);
	const combos = run.result.combos;
	const f = [Array(W + 1).fill(0), Array(W + 1).fill(null)];
	const snap = () => f.map((row) => row.slice());
	const frames = [];
	const combosStr = combos.map((c) => `${c.label}(${c.w},${c.v})`).join("，");
	frames.push({
		values: snap(),
		states: settled(f),
		caption: `<b>第一步：枚举组合</b>。附件必须依主件而选，所以每个合法组合都含主件，再叠加附件的一个子集，共 <b>${combos.length}</b> 个：${combosStr}。它们构成<b>同一组</b>，组内至多选一个——问题就归约成了<b>分组背包</b>。`,
		formula: `2^{${acc.length}} = ${combos.length}`
	});
	frames.push({
		values: snap(),
		states: settled(f),
		caption: "<b>第二步：分组背包</b>。第 0 行 = 还没处理这一组时，任何容量下最大价值都是 <b>0</b>（地基）。",
		formula: "f[0][j] = 0"
	});
	for (const event of run.events) {
		const { capacity: j, skip, bestTake, takeIndex: takeIdx, best, takeWins } = event;
		f[1][j] = best;
		const states = settled(f);
		const arrows = [];
		states[key(0, j)] = "source";
		arrows.push({
			from: {
				r: 0,
				c: j
			},
			to: {
				r: 1,
				c: j
			},
			kind: takeWins ? "source" : "chosen"
		});
		if (takeIdx >= 0) {
			const w = combos[takeIdx].w;
			states[key(0, j - w)] = "source";
			arrows.push({
				from: {
					r: 0,
					c: j - w
				},
				to: {
					r: 1,
					c: j
				},
				kind: takeWins ? "chosen" : "source"
			});
		}
		if (takeWins) states[key(0, j - combos[takeIdx].w)] = "chosen";
		else states[key(0, j)] = "chosen";
		states[key(1, j)] = "current";
		let caption;
		let formula;
		if (takeIdx >= 0) {
			const c = combos[takeIdx];
			caption = `容量 <b>${j}</b>：不选本组 = f[0][${j}] = <b>${skip}</b>；选组合 <b>${c.label}</b>(费用${c.w},价值${c.v}) = f[0][${j - c.w}]+${c.v} = <b>${bestTake}</b> → 取较大者 <b>${best}</b>。`;
			formula = `f[1][${j}]=\\max(${skip},\\ ${f[0][j - c.w]}+${c.v})=${best}`;
		} else {
			caption = `容量 <b>${j}</b>：连最便宜的组合都装不下（j 太小），只能不选本组 = <b>${skip}</b>。`;
			formula = `f[1][${j}]=f[0][${j}]=${skip}`;
		}
		frames.push({
			values: snap(),
			states,
			arrows,
			active: {
				r: 1,
				c: j
			},
			caption,
			formula
		});
	}
	const fin = settled(f);
	fin[key(1, W)] = "chosen";
	const bestCombo = run.result.bestCombo;
	const tail = bestCombo && bestCombo.v === run.result.value ? `——最优是选组合 <b>${bestCombo.label}</b>（费用 ${bestCombo.w} ≤ ${W}、价值 ${bestCombo.v}）。` : "。";
	frames.push({
		values: snap(),
		states: fin,
		caption: `答案在 <b>f[1][${W}] = ${run.result.value}</b>——这一组组合、容量 ${W}、至多选一个组合时的最大价值${tail}`,
		formula: `f[1][${W}]=${run.result.value}`
	});
	return {
		rows: 2,
		cols: W + 1,
		cell: 40,
		rowHeaderLabels: ["∅", "这组"],
		colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
		frames
	};
}
//#endregion
//#region src/components/demos/knapsack/KnapsackDependencyDemo.tsx
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
/**
* 有依赖的背包演示：1 个主件 + 2 个附件，可改 w / v。
* 先把「主 + 附件子集」枚举成 4 个组合，再把这 4 个组合当作同一组做分组背包。
*/
function KnapsackDependencyDemo() {
	const [master, setMaster] = useState({
		w: 2,
		v: 3
	});
	const [acc, setAcc] = useState([{
		w: 2,
		v: 4
	}, {
		w: 3,
		v: 5
	}]);
	const [cap, setCap] = useState(7);
	const combos = useMemo(() => enumCombos(master, acc), [master, acc]);
	const model = useMemo(() => dependencyKnapsack(master, acc, cap), [
		master,
		acc,
		cap
	]);
	const modelKey = `dep-${cap}-${master.w}.${master.v}-${acc.map((a) => `${a.w}.${a.v}`).join("_")}`;
	const setAccItem = (i, patch) => setAcc((arr) => arr.map((a, k) => k === i ? {
		...a,
		...patch
	} : a));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "kd__toolbar",
			children: [
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "kd__group-label",
					children: "主件（必选前提）· 可改 w / v"
				}), /* @__PURE__ */ jsxs("div", {
					style: {
						display: "inline-flex",
						gap: 14,
						padding: "10px 12px",
						borderRadius: "var(--r-2)",
						border: "1px solid var(--accent-2)",
						background: "color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))"
					},
					children: [/* @__PURE__ */ jsx(Stepper, {
						label: "主件 w",
						value: master.w,
						min: 1,
						max: cap,
						onChange: (w) => setMaster((m) => ({
							...m,
							w
						}))
					}), /* @__PURE__ */ jsx(Stepper, {
						label: "主件 v",
						value: master.v,
						min: 1,
						max: 30,
						onChange: (v) => setMaster((m) => ({
							...m,
							v
						}))
					})]
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "kd__group-label",
					children: "附件（依主件而选）· 可改 w / v"
				}), /* @__PURE__ */ jsx("div", {
					style: {
						display: "flex",
						gap: "var(--sp-3)"
					},
					children: acc.map((a, i) => /* @__PURE__ */ jsxs("div", {
						className: "kd__item",
						children: [
							/* @__PURE__ */ jsxs("span", {
								className: "kd__item-i",
								children: ["附", i + 1]
							}),
							/* @__PURE__ */ jsx(Stepper, {
								label: "w",
								value: a.w,
								min: 1,
								max: cap,
								onChange: (w) => setAccItem(i, { w })
							}),
							/* @__PURE__ */ jsx(Stepper, {
								label: "v",
								value: a.v,
								min: 1,
								max: 30,
								onChange: (v) => setAccItem(i, { v })
							})
						]
					}, i))
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "kd__group-label",
					children: "背包容量"
				}), /* @__PURE__ */ jsx(Stepper, {
					label: "W",
					value: cap,
					min: 2,
					max: 12,
					onChange: setCap
				})] })
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			style: {
				display: "flex",
				flexWrap: "wrap",
				gap: "var(--sp-3)",
				marginBottom: "var(--sp-4)"
			},
			children: [/* @__PURE__ */ jsxs("span", {
				style: {
					fontSize: 12,
					color: "var(--text-3)",
					alignSelf: "center",
					letterSpacing: "0.04em"
				},
				children: [
					"枚举出的 ",
					combos.length,
					" 个组合（同一组，至多选一个）："
				]
			}), combos.map((c, i) => /* @__PURE__ */ jsxs("span", {
				className: "mono",
				style: {
					padding: "4px 10px",
					borderRadius: 999,
					fontSize: 12.5,
					background: c.w <= cap ? "color-mix(in srgb, var(--accent-1) 12%, var(--surface-2))" : "var(--surface-2)",
					border: `1px solid ${c.w <= cap ? "var(--accent-2)" : "var(--border)"}`,
					color: c.w <= cap ? "var(--text-1)" : "var(--text-3)"
				},
				children: [
					c.label,
					": (w=",
					c.w,
					", v=",
					c.v,
					")"
				]
			}, i))]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/content/a/KnapsackDependencyArt.tsx
function DepSetupFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 232",
		role: "img",
		"aria-label": "一个主件与两个附件，附件依赖主件",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "dep-dep",
				markerWidth: "9",
				markerHeight: "9",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--accent-2)"
				})
			}) }),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(258,14)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "124",
						height: "76",
						rx: "14",
						fill: "color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))",
						stroke: "var(--accent-2)",
						strokeWidth: "2.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "62",
						y: "24",
						textAnchor: "middle",
						fontSize: "12.5",
						fontWeight: "600",
						fill: "var(--accent-1)",
						children: "主件"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "62",
						y: "48",
						textAnchor: "middle",
						fontSize: "14.5",
						className: "mono",
						fill: "var(--text-1)",
						children: "w=2"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "62",
						y: "67",
						textAnchor: "middle",
						fontSize: "14.5",
						className: "mono",
						fill: "var(--accent-1)",
						children: "v=3"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M150 150 Q150 108 300 96",
				fill: "none",
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				strokeDasharray: "5 4",
				markerEnd: "url(#dep-dep)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M492 150 Q492 108 342 96",
				fill: "none",
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				strokeDasharray: "5 4",
				markerEnd: "url(#dep-dep)"
			}),
			[{
				x: 92,
				name: "附件 1",
				w: 2,
				v: 4
			}, {
				x: 432,
				name: "附件 2",
				w: 3,
				v: 5
			}].map((it, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${it.x},150)`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "116",
						height: "70",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "58",
						y: "22",
						textAnchor: "middle",
						fontSize: "12",
						fill: "var(--text-2)",
						children: it.name
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "58",
						y: "45",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: ["w=", it.w]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "58",
						y: "62",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--accent-1)",
						children: ["v=", it.v]
					})
				]
			}, i)),
			/* @__PURE__ */ jsx("text", {
				x: "320",
				y: "120",
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--text-3)",
				children: "虚线 = 依赖：选附件，必先选它指向的主件"
			})
		]
	});
}
function DepReduceFigure() {
	const combos = [
		{
			label: "仅主",
			w: 2,
			v: 3
		},
		{
			label: "主+附1",
			w: 4,
			v: 7
		},
		{
			label: "主+附2",
			w: 5,
			v: 8
		},
		{
			label: "主+附1+2",
			w: 7,
			v: 12
		}
	];
	const cw = 138;
	const x0 = 20;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 176",
		role: "img",
		"aria-label": "把主件与附件子集枚举成四个组合，归为同一组",
		children: [
			/* @__PURE__ */ jsx("rect", {
				x: "8",
				y: "30",
				width: "624",
				height: "118",
				rx: "16",
				fill: "color-mix(in srgb, var(--accent-1) 5%, var(--surface-2))",
				stroke: "var(--border-strong)",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(20,19)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "188",
					height: "22",
					rx: "11",
					fill: "var(--grad-accent)"
				}), /* @__PURE__ */ jsx("text", {
					x: "94",
					y: "15",
					textAnchor: "middle",
					fontSize: "12",
					fontWeight: "700",
					fill: "var(--text-on-accent)",
					children: "同一组 · 至多选一个组合"
				})]
			}),
			combos.map((c, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${x0 + i * 150},52)`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: cw,
						height: "84",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: cw / 2,
						y: "26",
						textAnchor: "middle",
						fontSize: "12.5",
						fontWeight: "600",
						fill: "var(--accent-1)",
						children: c.label
					}),
					/* @__PURE__ */ jsxs("text", {
						x: cw / 2,
						y: "50",
						textAnchor: "middle",
						fontSize: "13.5",
						className: "mono",
						fill: "var(--text-1)",
						children: ["费用 ", c.w]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: cw / 2,
						y: "70",
						textAnchor: "middle",
						fontSize: "13.5",
						className: "mono",
						fill: "var(--accent-1)",
						children: ["价值 ", c.v]
					})
				]
			}, i))
		]
	});
}
function DepTransitionFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 300",
		role: "img",
		"aria-label": "有依赖的背包落到分组背包的一格转移",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "dep-ar",
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
				transform: "translate(248,8)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "144",
						height: "48",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "72",
						y: "21",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "这一组 · 容量 j"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "72",
						y: "39",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "f[j] = ?"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M300 56 L150 96",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#dep-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M340 56 L494 96",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#dep-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "184",
				y: "82",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "不选本组"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "400",
				y: "82",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "选组内某个组合"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(28,100)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "228",
						height: "60",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "114",
						y: "26",
						textAnchor: "middle",
						fontSize: "13",
						fill: "var(--text-1)",
						children: "这个主件一带都不要"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "114",
						y: "47",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "= f_old[j]"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(384,100)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "236",
						height: "60",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "118",
						y: "26",
						textAnchor: "middle",
						fontSize: "12",
						fill: "var(--text-1)",
						children: "枚举组合 c，取 max"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "118",
						y: "47",
						textAnchor: "middle",
						fontSize: "13",
						className: "mono",
						fill: "var(--text-1)",
						children: "= f_old[j−w_c] + v_c"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M150 160 L300 216",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#dep-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M500 160 L340 216",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#dep-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(200,218)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "240",
					height: "54",
					rx: "14",
					fill: "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: "120",
					y: "32",
					textAnchor: "middle",
					fontSize: "14",
					className: "mono",
					fill: "var(--text-1)",
					children: "取较大者 = max(两者)"
				})]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "320",
				y: "292",
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--text-3)",
				children: "组内各组合都基于「本组未出手」的旧值 → 至多选一个组合 = 一个合法方案"
			})
		]
	});
}
//#endregion
//#region src/content/a/KnapsackDependency.tsx
var CODE_P1064 = `
#include <iostream>
#include <algorithm>
using namespace std;

int mw[65], mv[65];             // 主件的费用、价值(=价格×重要度)
int aw[65][3], av[65][3];       // 每个主件的附件(至多 2 个)：费用、价值
int cnt[65];                    // 每个主件挂了几个附件
long long f[32005];             // f[j]：花费不超过 j 时的最大 价格×重要度 之和

int main()
{
    int n, m;
    cin >> n >> m;              // n=总钱数，m=物品数
    for (int i = 1; i <= m; i++)
    {
        int v, p, q;
        cin >> v >> p >> q;     // v=价格, p=重要度(1~5), q=0 主件 / 否则=所属主件编号
        if (q == 0)             // 是主件
        {
            mw[i] = v;
            mv[i] = v * p;
        }
        else                    // 是附件，挂到主件 q 上
        {
            aw[q][cnt[q]] = v;
            av[q][cnt[q]] = v * p;
            cnt[q]++;
        }
    }

    for (int i = 1; i <= m; i++)    // 逐个主件，当作「一组」
    {
        if (mw[i] == 0) continue;   // i 不是主件(是附件或不存在)，跳过
        for (int j = n; j >= mw[i]; j--)    // ★倒序：组内至多选一个组合
        {
            // 枚举本主件的合法组合(含主件)，对附件的每个子集取一遍
            for (int s = 0; s < (1 << cnt[i]); s++)
            {
                int w = mw[i], val = mv[i];         // 组合恒含主件
                for (int k = 0; k < cnt[i]; k++)
                    if (s >> k & 1)                 // 该附件入选
                    {
                        w += aw[i][k];
                        val += av[i][k];
                    }
                if (j >= w)
                    f[j] = max(f[j], f[j - w] + val);
            }
        }
    }

    cout << f[n] << endl;
    return 0;
}`;
function KnapsackDependency() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "当「选它」得先「选它的主件」"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"先看一个具体场景：有一件",
						/* @__PURE__ */ jsx("strong", { children: "主件" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "(w,v)=(2,3)" }),
						"，还有它的两件",
						/* @__PURE__ */ jsx("strong", { children: "附件" }),
						"—— 附件 1 ",
						/* @__PURE__ */ jsx(M, { children: "(2,4)" }),
						"、附件 2 ",
						/* @__PURE__ */ jsx(M, { children: "(3,5)" }),
						"，一个容量 ",
						/* @__PURE__ */ jsx(M, { children: "W=7" }),
						" 的背包。规则多了一条硬约束：",
						/* @__PURE__ */ jsx("strong", { children: "附件必须依附主件而选" }),
						"——想装附件 1，就",
						/* @__PURE__ */ jsx("strong", { children: "必须先把主件也装上" }),
						"；主件不装，两个附件都是",
						/* @__PURE__ */ jsx("strong", { children: "非法" }),
						"的。目标仍是不超重下让",
						/* @__PURE__ */ jsx("strong", { children: "总价值最大" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(DepSetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "1 个主件 + 2 个附件：虚线是「依赖」——附件指向主件，选附件的前提是先选主件。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"很自然会想：把主件、附件 1、附件 2 当成",
						/* @__PURE__ */ jsx("strong", { children: "三件独立的 01 物品" }),
						"丢进背包不就行了？",
						/* @__PURE__ */ jsx("strong", { children: "不行。" }),
						"普通 01 背包会毫不客气地",
						/* @__PURE__ */ jsx("strong", { children: "只挑附件 1、不挑主件" }),
						"（附件 1 性价比高），可这在依赖规则里是非法的——它",
						/* @__PURE__ */ jsx("strong", { children: "压根不知道「附件得先有主件」这回事" }),
						"。 反过来，也没法用「先强制装主件再随便挑附件」蒙混：主件到底装不装、装了之后还剩多少钱给附件，本身就是要一起权衡的决策。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"那把「主件带哪些附件」的所有情形枚举出来呢？主件要么不装；一旦装，它的两个附件各可带可不带——",
						/* @__PURE__ */ jsx("strong", { children: "仅主 / 主+附1 / 主+附2 / 主+附1+2" }),
						"，加上「整个不装」，就把这一族物品的",
						/* @__PURE__ */ jsx("strong", { children: "合法方案全数罗列" }),
						"了。这份枚举，正是打开依赖背包的钥匙。"
					] })]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "归约：把「主 + 附件子集」打包成组"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"盯住上面那句枚举。一个主件带上它附件的",
						/* @__PURE__ */ jsx("strong", { children: "某个子集" }),
						"，就构成一个",
						/* @__PURE__ */ jsx("strong", { children: "合法组合" }),
						"；每个组合的",
						/* @__PURE__ */ jsx("strong", { children: "费用" }),
						" = 主件费用 + 所选附件费用之和，",
						/* @__PURE__ */ jsx("strong", { children: "价值" }),
						" = 各自价值之和。 本例主件 ",
						/* @__PURE__ */ jsx(M, { children: "(2,3)" }),
						" 配两个附件，附件子集有 ",
						/* @__PURE__ */ jsx(M, { children: "2^2=4" }),
						" 种，于是得到 4 个组合："
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(DepReduceFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "主件 + 附件子集枚举成 4 个组合：仅主(2,3)、主+附1(4,7)、主+附2(5,8)、主+附1+2(7,12)。它们归为同一组，组内至多选一个。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"关键的一跃在这里：这 4 个组合",
						/* @__PURE__ */ jsx("strong", { children: "互斥" }),
						"——你不可能同时「只带附件 1」又「两个附件都带」，一个主件",
						/* @__PURE__ */ jsx("strong", { children: "最终只能落实成其中一种方案" }),
						"（或整个不选）。这正是",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/group",
							style: { color: "var(--accent-2)" },
							children: "分组背包"
						}),
						"的定义：",
						/* @__PURE__ */ jsx("strong", { children: "把这些组合归为同一组，组内至多选一个" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"于是",
						/* @__PURE__ */ jsx("strong", { children: "有依赖的背包，被归约成了分组背包" }),
						"——一个主件（连同它的附件）= 一组，组内物品 = 该主件的各个合法组合。为什么必须走这条「枚举组合」的路、而不能把附件当独立物品？因为独立物品会漏掉",
						/* @__PURE__ */ jsx("strong", { children: "「选附件必先选主件」" }),
						"这条约束；而",
						/* @__PURE__ */ jsx("strong", { children: "把主件焊进每个组合里" }),
						"，就让「带附件」永远伴随「带主件」，约束天然成立。"
					] })]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：落到分组背包"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"既然归约成了分组背包，转移就直接",
						/* @__PURE__ */ jsx("strong", { children: "套分组背包那一套" }),
						"。设 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" 为花费不超过 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 时的最大价值，逐个主件（每个当一组）更新。 处理某个主件这一组时，一格 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" 有两条来路："
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(DepTransitionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "每格 f[j] 两条路：不选本组(这个主件一带都不要)，或在组内枚举某个组合 c 取 max。两条路都基于本组处理前的旧值。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "不选本组" }),
							"：这个主件连同附件一概不要，价值就是处理本组",
							/* @__PURE__ */ jsx("strong", { children: "之前" }),
							"的 ",
							/* @__PURE__ */ jsx(M, { children: "f[j]" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsxs("strong", { children: ["选组内某个组合 ", /* @__PURE__ */ jsx(M, { children: "c" })] }),
							"（费用 ",
							/* @__PURE__ */ jsx(M, { children: "w_c" }),
							"、价值 ",
							/* @__PURE__ */ jsx(M, { children: "v_c" }),
							"，需 ",
							/* @__PURE__ */ jsx(M, { children: "j\\ge w_c" }),
							"）：腾出 ",
							/* @__PURE__ */ jsx(M, { children: "w_c" }),
							"，剩下的 ",
							/* @__PURE__ */ jsx(M, { children: "j-w_c" }),
							" 交给之前的最优，再加上 ",
							/* @__PURE__ */ jsx(M, { children: "v_c" }),
							"。究竟选哪个组合？",
							/* @__PURE__ */ jsx("strong", { children: "把每个组合都试一遍取最好" }),
							"。合起来就是分组背包的转移："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[j]=\\max\\Big(f[j],\\ \\max_{c\\,\\in\\,G,\\ w_c\\le j}\\big(f[j-w_c]+v_c\\big)\\Big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"一维写法照分组背包：",
							/* @__PURE__ */ jsxs("strong", { children: [
								"外层枚举主件（组）、中层容量 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 倒序、内层枚举本组的各个组合"
							] }),
							"。容量倒序保证组内各组合都基于「本组尚未出手」的旧值——",
							/* @__PURE__ */ jsx("strong", { children: "一组至多落实一个组合" }),
							"，正好对应「一个主件最终只有一种方案」。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"有依赖的背包 = 分组背包的一个",
						/* @__PURE__ */ jsx("strong", { children: "实例" }),
						"。诀窍全在",
						/* @__PURE__ */ jsx("strong", { children: "建组" }),
						"：把「一个主件 + 它附件的任一子集」枚举成组内物品，用",
						/* @__PURE__ */ jsx("strong", { children: "「组合恒含主件」" }),
						"把「选附件必先选主件」这条依赖，化进了物品的定义里。归约完成后，转移与循环顺序",
						/* @__PURE__ */ jsx("strong", { children: "一字不差地照搬" }),
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/group",
							style: { color: "var(--accent-2)" },
							children: "分组背包"
						}),
						"。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "跟着算一遍"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"用本例（主件 ",
						/* @__PURE__ */ jsx(M, { children: "(2,3)" }),
						"、附件 ",
						/* @__PURE__ */ jsx(M, { children: "(2,4)" }),
						" 与 ",
						/* @__PURE__ */ jsx(M, { children: "(3,5)" }),
						"，容量 7）走一遍，重点盯住",
						/* @__PURE__ */ jsx("strong", { children: "枚举组合 → 组内取一个" }),
						"："
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
									/* @__PURE__ */ jsx("b", { children: "枚举组合。" }),
									" 主件配两个附件，得 4 个组合：仅主 ",
									/* @__PURE__ */ jsx(M, { children: "(2,3)" }),
									"、主+附1 ",
									/* @__PURE__ */ jsx(M, { children: "(4,7)" }),
									"、主+附2 ",
									/* @__PURE__ */ jsx(M, { children: "(5,8)" }),
									"、主+附1+2 ",
									/* @__PURE__ */ jsx(M, { children: "(7,12)" }),
									"。四者归为同一组，至多选一个。"
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
									/* @__PURE__ */ jsx("b", { children: "地基。" }),
									" 处理这一组之前，任何容量下 ",
									/* @__PURE__ */ jsx(M, { children: "f[j]=0" }),
									"（什么都还没装）。"
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
									/* @__PURE__ */ jsx("b", { children: "看容量 4。" }),
									" 装得下的组合有「仅主」",
									/* @__PURE__ */ jsx(M, { children: "(2,3)" }),
									" 与「主+附1」",
									/* @__PURE__ */ jsx(M, { children: "(4,7)" }),
									"：分别 = ",
									/* @__PURE__ */ jsx(M, { children: "f[4-2]+3=3" }),
									"、",
									/* @__PURE__ */ jsx(M, { children: "f[4-4]+7=7" }),
									"。取较大 → ",
									/* @__PURE__ */ jsx(M, { children: "f[4]=7" }),
									"（主+附1）。"
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
									/* @__PURE__ */ jsx("b", { children: "看容量 7（读答案）。" }),
									" 四个组合都装得下，其中「主+附1+2」",
									/* @__PURE__ */ jsx(M, { children: "(7,12)" }),
									" 给出 ",
									/* @__PURE__ */ jsx(M, { children: "f[7-7]+12=12" }),
									"，压过其余。",
									/* @__PURE__ */ jsx(M, { children: "f[7]=12" }),
									"——正是主件带上两个附件全装，价值 ",
									/* @__PURE__ */ jsx(M, { children: "3+4+5=12" }),
									"，恰好占满容量 7。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示会先亮出 4 个组合的（费用, 价值），再把这一组的分组转移",
						/* @__PURE__ */ jsx("strong", { children: "逐格跑一遍" }),
						"。改主件或附件的 ",
						/* @__PURE__ */ jsx(M, { children: "w,v" }),
						"、改容量，看组合与表格实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看它把依赖枚成组、再逐格转移"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(KnapsackDependencyDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化：附件多了、依赖连成了树"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"本例每个主件只挂 2 个附件，枚举 ",
						/* @__PURE__ */ jsx(M, { children: "2^2=4" }),
						" 个组合毫无压力。",
						/* @__PURE__ */ jsx("strong", { children: "P1064" }),
						" 正是这种「主件 + 至多 2 附件」的教科书原型——每个主件最多 4 个组合，直接枚举即可。 但依赖可以更深：如果",
						/* @__PURE__ */ jsx("strong", { children: "附件本身又能挂自己的附件" }),
						"，依赖关系就从「主-附两层」长成了一棵",
						/* @__PURE__ */ jsx("strong", { children: "树" }),
						"（甚至一片森林）。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "P2014 选课" }),
						"就是这样：一门课可能有",
						/* @__PURE__ */ jsx("strong", { children: "先修课" }),
						"，要选它必先选先修——先修关系把课程连成",
						/* @__PURE__ */ jsx("strong", { children: "树" }),
						"。这时「枚举一个节点的所有后代子集」会指数爆炸，不能再照搬本页的暴力枚举，而要在树上做 DP：",
						/* @__PURE__ */ jsx(M, { children: "f[u][j]" }),
						" 表示",
						/* @__PURE__ */ jsxs("strong", { children: [
							"以 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 为根的子树、选课数（或容量）为 ",
							/* @__PURE__ */ jsx(M, { children: "j" })
						] }),
						" 时的最优，把子树当分组、在各子树间做背包合并。"
					] })]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "承接：依赖成树 → 树上背包",
					children: [
						"「主件-附件」是依赖背包最浅的两层形态，归约成分组背包即可解。当依赖",
						/* @__PURE__ */ jsx("strong", { children: "连成树/森林" }),
						"（如 P2014 选课的先修关系），它一般化为",
						/* @__PURE__ */ jsx("strong", { children: "树上背包（树形 DP）" }),
						"——那是",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/f",
							style: { color: "var(--accent-2)" },
							children: "F 部分"
						}),
						"的主题。本页只点到「依赖成树」这一形态，树形转移的细节留到那里展开。"
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
					pid: "P1064",
					name: "[NOIP2006 提高组] 金明的预算方案",
					src: "NOIP2006 提高组",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"总钱数 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								" 件物品，每件给出价格 ",
								/* @__PURE__ */ jsx(M, { children: "v" }),
								"、重要度 ",
								/* @__PURE__ */ jsx(M, { children: "p(1\\sim5)" }),
								"、以及归属 ",
								/* @__PURE__ */ jsx(M, { children: "q" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "q=0" }),
								" 为主件，否则表示它是第 ",
								/* @__PURE__ */ jsx(M, { children: "q" }),
								" 号主件的附件）。每个主件",
								/* @__PURE__ */ jsx("strong", { children: "至多 2 个附件" }),
								"，选附件必先选其主件。求 ",
								/* @__PURE__ */ jsx(M, { children: "\\sum v\\times p" }),
								" 的最大值。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"「价格」= 费用 ",
								/* @__PURE__ */ jsx(M, { children: "w" }),
								"，「",
								/* @__PURE__ */ jsx(M, { children: "v\\times p" }),
								"」= 价值，「总钱数 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								"」= 容量。",
								/* @__PURE__ */ jsx("strong", { children: "每个主件 = 一组" }),
								"，枚举 ",
								/* @__PURE__ */ jsx("strong", { children: "仅主 / 主+附1 / 主+附2 / 主+附1+2" }),
								" 四种组合作为组内物品——依赖背包归约成分组背包的教科书原型。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[j]=\\max(f[j],\\ f[j-w_c]+v_c)" }),
								"，外层枚举主件、中层 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 倒序、内层枚举本主件的组合（至多 4 个）；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
								" 级。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（枚举组合的分组背包）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1064,
								luogu: "P1064"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2014",
					name: "[CTSC1997] 选课",
					src: "CTSC1997（洛谷原生 P）",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 门课，每门有学分，部分课有",
								/* @__PURE__ */ jsx("strong", { children: "唯一先修课" }),
								"（选它必先选先修）。先修关系把课程连成",
								/* @__PURE__ */ jsx("strong", { children: "森林" }),
								"。选 ",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								" 门课，求最大学分和。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它（依赖的一般化）",
							children: [
								"它把依赖从「主件-附件两层」推广到",
								/* @__PURE__ */ jsx("strong", { children: "树/森林" }),
								"：附件还能有自己的附件。此时不能再暴力枚举子集，而要在树上做 DP——",
								/* @__PURE__ */ jsx("strong", { children: "每棵子树当一组，在子树间做背包合并" }),
								"。是从「依赖背包」跨到「树上背包」的桥梁题。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "思路（只点到「依赖成树」）",
							children: [
								"建虚根 ",
								/* @__PURE__ */ jsx(M, { children: "0" }),
								" 把森林并成一棵树，选课总数 ",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								" 相应 ",
								/* @__PURE__ */ jsx(M, { children: "+1" }),
								"。树形背包 ",
								/* @__PURE__ */ jsx(M, { children: "f[u][j]" }),
								" = 子树 ",
								/* @__PURE__ */ jsx(M, { children: "u" }),
								" 选 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 门的最大学分，逐棵子树做分组合并。",
								/* @__PURE__ */ jsx("strong", { children: "本页不展开树形转移细节" }),
								"，完整做法见 ",
								/* @__PURE__ */ jsx(Link, {
									to: "/part/f",
									style: { color: "var(--accent-2)" },
									children: "F 部分 · 树上背包"
								}),
								"。"
							]
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
						"说明：有依赖的背包",
						/* @__PURE__ */ jsx("strong", { children: "原生题池很窄" }),
						"，几乎以 ",
						/* @__PURE__ */ jsx("strong", { children: "P1064" }),
						"（主件-附件两层）与 ",
						/* @__PURE__ */ jsx("strong", { children: "P2014" }),
						"（依赖成树）为双核。下面给两层依赖的 P1064 夯实归约；更一般的",
						/* @__PURE__ */ jsx("strong", { children: "树上依赖" }),
						"（如 P2014 选课）在 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/f",
							style: { color: "var(--accent-2)" },
							children: "F 部分树上背包"
						}),
						"展开，不在此重复。"
					]
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1064",
					name: "[NOIP2006 提高组] 金明的预算方案",
					hint: "把每个主件枚举成 仅主 / 主+附1 / 主+附2 / 主+附1+2 四种组合，当作同一组的组内物品，做分组背包（外层主件、中层容量倒序、内层枚举组合）。价值用 价格×重要度。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2014",
					name: "[CTSC1997] 选课",
					hint: "进阶：依赖连成森林。建虚根并成一棵树、m+1，做树上背包 f[u][j]（子树间分组合并）。属 F 部分树上背包，本页仅作承接，可先了解「依赖成树」的形态。"
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pointer-cue",
			children: [
				/* @__PURE__ */ jsx(Network, { size: 18 }),
				"依赖背包是",
				/* @__PURE__ */ jsx(Link, {
					to: "/part/a/group",
					style: {
						color: "var(--accent-1)",
						fontWeight: 600
					},
					children: "分组背包"
				}),
				"的应用；当依赖长成树，它通向",
				/* @__PURE__ */ jsx(Link, {
					to: "/part/f",
					style: {
						color: "var(--accent-1)",
						fontWeight: 600
					},
					children: " F 部分的树上背包"
				}),
				"。两条线都从这页的「枚举组合」出发。"
			]
		})
	] });
}
//#endregion
export { KnapsackDependency as default };
