import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, MousePointerClick, Plus, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/knapsack-cost2d/internal.ts
function executeCost2DKnapsack(items, capacityA, capacityB, mode, emit) {
	const table = Array.from({ length: capacityB + 1 }, () => Array(capacityA + 1).fill(0));
	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		const item = items[itemIndex];
		const add = mode === "count" ? 1 : item.v;
		const changed = [];
		for (let x = capacityA; x >= item.a; x--) for (let y = capacityB; y >= item.b; y--) {
			const candidate = table[y - item.b][x - item.a] + add;
			if (candidate <= table[y][x]) continue;
			changed.push({
				x,
				y,
				from: table[y][x],
				to: candidate
			});
			table[y][x] = candidate;
		}
		emit({
			type: "item",
			itemIndex,
			item,
			add,
			changed
		});
	}
	return {
		value: table[capacityB][capacityA],
		table
	};
}
function recordCost2DKnapsack(items, capacityA, capacityB, mode = "value") {
	const events = [];
	return {
		result: executeCost2DKnapsack(items, capacityA, capacityB, mode, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/components/demos/knapsack/cost2dSolver.ts
function settled(vals) {
	const s = {};
	for (let r = 0; r < vals.length; r++) for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = "settled";
	return s;
}
/**
* 二维费用背包（01 型）：dp[x][y] = 费用1 不超过 x、费用2 不超过 y 时的最大价值。
* 转移：dp[x][y] = max( dp[x][y]（不取本件）, dp[x-a][y-b] + v（取本件） )。
*
* 一维滚动写法只需给 dp 增开一维，两种费用维都要倒序：
*   for x = A downto a:  for y = B downto b:  dp[x][y] = max(dp[x][y], dp[x-a][y-b]+v)
* 倒序保证 dp[x-a][y-b] 用的是「本件尚未装入」的旧值，故每件至多取一次。
*
* mode='value'：转移补 +v，dp 是「最大价值」。
* mode='count'：价值恒 1，转移补 +1，dp 变成「两费用受限下最多能装几件」——这正是
*   「价值恒 1 = 数个数」这一变形（如 P1855 求最多愿望数）。
*
* 可视化：DPViz 网格的「行 r = 费用2 y（0..B）」「列 c = 费用1 x（0..A）」。
* 逐件更新整张表，每处理完一件推一帧（整表快照 + 本件改写的格高亮）。
*/
function cost2D(items, A, B, mode = "value") {
	const count = mode === "count";
	const run = recordCost2DKnapsack(items, A, B, mode);
	const dp = Array.from({ length: B + 1 }, () => Array(A + 1).fill(0));
	const snap = () => dp.map((row) => row.slice());
	const frames = [];
	frames.push({
		values: snap(),
		states: settled(dp),
		caption: count ? "<b>初始表</b>：一件都不装时，任何 (费用1 x, 费用2 y) 下件数都是 <b>0</b>。行是费用2 y、列是费用1 x。" : "<b>初始表</b>：一件都不装时，任何 (费用1 x, 费用2 y) 下最大价值都是 <b>0</b>。行是费用2 y、列是费用1 x。",
		formula: "dp[x][y] = 0"
	});
	for (const event of run.events) {
		const { itemIndex: i, item, changed, add } = event;
		const { a, b, v } = item;
		for (const change of changed) dp[change.y][change.x] = change.to;
		const states = settled(dp);
		const arrows = [];
		let caption;
		let formula;
		if (changed.length > 0) {
			let rep = changed[0];
			for (const c of changed) if (c.to > rep.to || c.to === rep.to && c.x + c.y > rep.x + rep.y) rep = c;
			for (const c of changed) states[key(c.y, c.x)] = "current";
			states[key(rep.y - b, rep.x - a)] = "source";
			arrows.push({
				from: {
					r: rep.y - b,
					c: rep.x - a
				},
				to: {
					r: rep.y,
					c: rep.x
				},
				kind: "chosen"
			});
			const addLabel = count ? "1" : String(v);
			const itemDesc = count ? `a=${a}, b=${b}` : `a=${a}, b=${b}, v=${v}`;
			caption = `装入 <b>物品 ${i + 1}</b>（${itemDesc}）：凡是费用1 ≥ ${a} 且费用2 ≥ ${b} 的格，都拿 dp[x−${a}][y−${b}]+${addLabel} 与原值比较、取较大者。共 <b>${changed.length}</b> 个格被抬升。以格 <b>(x=${rep.x}, y=${rep.y})</b> 为例：由 dp[${rep.x - a}][${rep.y - b}]+${addLabel} = <b>${rep.to}</b> 胜过原值 <b>${rep.from}</b>。`;
			formula = `dp[${rep.x}][${rep.y}]=\\max(${rep.from},\\ ${rep.to - add}+${addLabel})=${rep.to}`;
		} else {
			const itemDesc = count ? `a=${a}, b=${b}` : `a=${a}, b=${b}, v=${v}`;
			caption = `装入 <b>物品 ${i + 1}</b>（${itemDesc}）：没有格能因它变大（要么装不下、要么不划算），整表不变。`;
			formula = `dp[x][y]\\ \\text{unchanged}`;
		}
		frames.push({
			values: snap(),
			states,
			arrows,
			active: null,
			caption,
			formula
		});
	}
	const fin = settled(dp);
	fin[key(B, A)] = "chosen";
	frames.push({
		values: snap(),
		states: fin,
		caption: count ? `答案在右下角 <b>dp[${A}][${B}] = ${run.result.value}</b>——两种费用分别不超过 A=${A}、B=${B} 时最多能装 <b>${run.result.value}</b> 件（价值恒 1，故最大价值就是最多件数）。` : `答案在右下角 <b>dp[${A}][${B}] = ${run.result.value}</b>——两种费用分别不超过 A=${A}、B=${B} 时能取得的最大价值。`,
		formula: `dp[${A}][${B}]=${run.result.value}`
	});
	return {
		rows: B + 1,
		cols: A + 1,
		cell: 36,
		rowHeaderLabels: Array.from({ length: B + 1 }, (_, y) => `y=${y}`),
		colHeaderLabels: Array.from({ length: A + 1 }, (_, x) => `x=${x}`),
		rowHeaderTitle: "费用2",
		colHeaderTitle: "费用1",
		frames
	};
}
//#endregion
//#region src/components/demos/knapsack/KnapsackCost2DDemo.tsx
var MODES = [{
	id: "value",
	label: "求价值 v"
}, {
	id: "count",
	label: "价值恒 1 · 数个数"
}];
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
/** 二维费用背包演示：dp[费用2][费用1]，逐件更新，高亮 dp[x][y] ← dp[x−a][y−b]+v 的来源。 */
function KnapsackCost2DDemo() {
	const [items, setItems] = useState([{
		a: 1,
		b: 2,
		v: 3
	}, {
		a: 2,
		b: 1,
		v: 4
	}]);
	const [capA, setCapA] = useState(4);
	const [capB, setCapB] = useState(4);
	const [mode, setMode] = useState("value");
	const count = mode === "count";
	const model = useMemo(() => cost2D(items, capA, capB, mode), [
		items,
		capA,
		capB,
		mode
	]);
	const modelKey = `c2-${mode}-${capA}-${capB}-${items.map((it) => `${it.a}.${it.b}.${it.v}`).join("|")}`;
	const setItem = (idx, patch) => setItems((arr) => arr.map((it, i) => i === idx ? {
		...it,
		...patch
	} : it));
	const addItem = () => setItems((arr) => arr.length < 3 ? [...arr, {
		a: 1,
		b: 1,
		v: 2
	}] : arr);
	const removeItem = (idx) => setItems((arr) => arr.length > 1 ? arr.filter((_, i) => i !== idx) : arr);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "kd__toolbar",
			children: [
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "kd__group-label",
					children: count ? "物品（每件两种费用 a / b · 价值恒 1 只数个数 · 可改可增删）" : "物品（每件两种费用 a / b 与价值 v · 可改可增删）"
				}), /* @__PURE__ */ jsxs("div", {
					className: "kd__items",
					children: [items.map((it, idx) => /* @__PURE__ */ jsxs("div", {
						className: "kd__item",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "kd__item-i",
								children: idx + 1
							}),
							items.length > 1 && /* @__PURE__ */ jsx("button", {
								className: "kd__remove",
								onClick: () => removeItem(idx),
								"aria-label": "删除物品",
								children: /* @__PURE__ */ jsx(X, { size: 12 })
							}),
							/* @__PURE__ */ jsx(Stepper, {
								label: "费用1 a",
								value: it.a,
								min: 1,
								max: capA,
								onChange: (a) => setItem(idx, { a })
							}),
							/* @__PURE__ */ jsx(Stepper, {
								label: "费用2 b",
								value: it.b,
								min: 1,
								max: capB,
								onChange: (b) => setItem(idx, { b })
							}),
							count ? /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
								className: "stepper__lab",
								children: "价值"
							}), /* @__PURE__ */ jsx("div", {
								className: "stepper__row",
								style: { justifyContent: "center" },
								children: /* @__PURE__ */ jsx("span", {
									className: "stepper__val",
									title: "数个数模式下每件价值恒为 1",
									children: "恒 1"
								})
							})] }) : /* @__PURE__ */ jsx(Stepper, {
								label: "价值 v",
								value: it.v,
								min: 1,
								max: 30,
								onChange: (v) => setItem(idx, { v })
							})
						]
					}, idx)), items.length < 3 && /* @__PURE__ */ jsxs("button", {
						className: "kd__add",
						onClick: addItem,
						children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加件"]
					})]
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "kd__group-label",
					children: "费用1 上限 A"
				}), /* @__PURE__ */ jsx(Stepper, {
					label: "A",
					value: capA,
					min: 2,
					max: 6,
					onChange: setCapA
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "kd__group-label",
					children: "费用2 上限 B"
				}), /* @__PURE__ */ jsx(Stepper, {
					label: "B",
					value: capB,
					min: 2,
					max: 6,
					onChange: setCapB
				})] })
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "kd__modes",
			children: MODES.map((m) => /* @__PURE__ */ jsx("button", {
				className: `kd__mode${mode === m.id ? " on" : ""}`,
				onClick: () => setMode(m.id),
				children: m.label
			}, m.id))
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/content/a/KnapsackCost2DArt.tsx
function Cost2DSetupFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 178",
		role: "img",
		"aria-label": "两件带双重费用的物品与一个双约束背包",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "c2-ar",
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
				a: 1,
				b: 2,
				v: 3
			}, {
				a: 2,
				b: 1,
				v: 4
			}].map((it, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${20 + i * 116},26)`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "98",
						height: "118",
						rx: "14",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "49",
						y: "24",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: ["物品 ", i + 1]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "49",
						y: "50",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: ["a=", it.a]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "49",
						y: "72",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-2)",
						children: ["b=", it.b]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "49",
						y: "98",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--accent-1)",
						children: ["v=", it.v]
					})
				]
			}, i)),
			/* @__PURE__ */ jsx("path", {
				d: "M276 84 H344",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#c2-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(374,24)",
				children: [
					/* @__PURE__ */ jsx("path", {
						d: "M28 34 Q28 14 50 14 H150 Q172 14 172 34 L188 118 Q188 128 176 128 H24 Q12 128 12 118 Z",
						fill: "color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))",
						stroke: "var(--accent-2)",
						strokeWidth: "2.5"
					}),
					/* @__PURE__ */ jsx("path", {
						d: "M72 14 Q72 -4 100 -4 Q128 -4 128 14",
						fill: "none",
						stroke: "var(--accent-2)",
						strokeWidth: "2.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "58",
						textAnchor: "middle",
						fontSize: "13.5",
						fill: "var(--text-1)",
						children: "双约束背包"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "82",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--accent-1)",
						children: "费用1 ≤ A=4"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "104",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--accent-1)",
						children: "费用2 ≤ B=4"
					})
				]
			})
		]
	});
}
function Cost2DDimensionFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 226",
		role: "img",
		"aria-label": "从一维费用到二维费用，DP 维度加一",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "c2d-ar",
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
				x: "118",
				y: "22",
				textAnchor: "middle",
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--text-2)",
				children: "一维费用 · dp[j]"
			}),
			Array.from({ length: 5 }, (_, j) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${34 + j * 42},44)`,
				children: [/* @__PURE__ */ jsx("rect", {
					width: "36",
					height: "36",
					rx: "8",
					fill: "var(--surface-3)",
					stroke: "var(--border-strong)",
					strokeWidth: "1.4"
				}), /* @__PURE__ */ jsx("text", {
					x: "18",
					y: "23",
					textAnchor: "middle",
					fontSize: "12",
					className: "mono",
					fill: "var(--text-3)",
					children: j
				})]
			}, `o${j}`)),
			/* @__PURE__ */ jsx("text", {
				x: "118",
				y: "108",
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--text-3)",
				children: "一条约束：一个下标 j"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M258 66 H322",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#c2d-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "290",
				y: "56",
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--accent-1)",
				children: "+1 维"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "470",
				y: "22",
				textAnchor: "middle",
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--accent-1)",
				children: "二维费用 · dp[x][y]"
			}),
			Array.from({ length: 4 }, (_, y) => Array.from({ length: 4 }, (_, x) => /* @__PURE__ */ jsx("g", {
				transform: `translate(${356 + x * 42},${40 + y * 42})`,
				children: /* @__PURE__ */ jsx("rect", {
					width: "36",
					height: "36",
					rx: "8",
					fill: x === 2 && y === 2 ? "color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))" : "var(--surface-3)",
					stroke: x === 2 && y === 2 ? "var(--viz-current)" : "var(--border-strong)",
					strokeWidth: "1.4"
				})
			}, `t${x}-${y}`))),
			/* @__PURE__ */ jsx("text", {
				x: "470",
				y: "228",
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--text-3)",
				children: "两条约束：一对下标 (x, y)"
			})
		]
	});
}
function Cost2DDecisionFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 292",
		role: "img",
		"aria-label": "二维费用下第 i 件取或不取的决策分叉",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "c2t-ar",
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
				transform: "translate(238,8)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "164",
						height: "50",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "82",
						y: "21",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "第 i 件 · 费用1 x · 费用2 y"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "82",
						y: "40",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[x][y] = ?"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M300 58 L146 100",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#c2t-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M340 58 L500 100",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#c2t-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "188",
				y: "86",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "不取"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "404",
				y: "86",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "取（需 x ≥ a 且 y ≥ b）"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(28,104)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "230",
						height: "66",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "115",
						y: "27",
						textAnchor: "middle",
						fontSize: "13",
						fill: "var(--text-1)",
						children: "第 i 件没参与"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "115",
						y: "49",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "= dp[x][y]（旧值）"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(376,104)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "248",
						height: "66",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "124",
						y: "27",
						textAnchor: "middle",
						fontSize: "13",
						fill: "var(--text-1)",
						children: "两种费用一起扣，补价值 v"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "124",
						y: "49",
						textAnchor: "middle",
						fontSize: "13.5",
						className: "mono",
						fill: "var(--text-1)",
						children: "= dp[x−a][y−b] + v"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M143 170 L300 226",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#c2t-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M500 170 L340 226",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#c2t-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(206,228)",
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
//#endregion
//#region src/content/a/KnapsackCost2D.tsx
var CODE_P1855 = `
#include <iostream>
#include <algorithm>
using namespace std;

int m[205], t[205];          // 第 i 个愿望花的金钱 m、时间 t
int f[205][205];             // f[j][k]：花钱不超 j、花时间不超 k 时，最多实现的愿望数

int main()
{
    int n, M, T;
    cin >> n >> M >> T;
    for (int i = 1; i <= n; i++)
        cin >> m[i] >> t[i];

    for (int i = 1; i <= n; i++)            // 逐个愿望
        for (int j = M; j >= m[i]; j--)     // ★费用1（钱）倒序
            for (int k = T; k >= t[i]; k--) // ★费用2（时间）倒序
                f[j][k] = max(f[j][k], f[j - m[i]][k - t[i]] + 1); // 价值恒 1：数个数

    cout << f[M][T] << endl;
    return 0;
}`;
var CODE_P1507 = `
#include <iostream>
#include <algorithm>
using namespace std;

int h[55], t[55], c[55];     // 第 i 份食物的体积 h、质量 t、卡路里 c
int f[405][405];             // f[j][k]：体积不超 j、质量不超 k 时的最大卡路里

int main()
{
    int H, T;
    cin >> H >> T;
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> h[i] >> t[i] >> c[i];

    for (int i = 1; i <= n; i++)            // 逐份食物（普通的三属性 01 物品）
        for (int j = H; j >= h[i]; j--)     // ★体积维倒序
            for (int k = T; k >= t[i]; k--) // ★质量维倒序
                f[j][k] = max(f[j][k], f[j - h[i]][k - t[i]] + c[i]);

    cout << f[H][T] << endl;
    return 0;
}`;
function KnapsackCost2D() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "当一件东西，同时占两种资源"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"先看一个具体场景：你有 ",
						/* @__PURE__ */ jsx("strong", { children: "2 件" }),
						"物品，但背包这次卡的",
						/* @__PURE__ */ jsx("strong", { children: "不是一条约束，而是两条" }),
						"—— 物品 1 占「费用1 ",
						/* @__PURE__ */ jsx(M, { children: "a=1" }),
						"、费用2 ",
						/* @__PURE__ */ jsx(M, { children: "b=2" }),
						"」，价值 ",
						/* @__PURE__ */ jsx(M, { children: "v=3" }),
						"；物品 2 占「",
						/* @__PURE__ */ jsx(M, { children: "a=2,b=1" }),
						"」，价值 ",
						/* @__PURE__ */ jsx(M, { children: "v=4" }),
						"。 背包要求：费用1 之和 ",
						/* @__PURE__ */ jsx(M, { children: "\\le A=4" }),
						"，",
						/* @__PURE__ */ jsx("strong", { children: "同时" }),
						"费用2 之和 ",
						/* @__PURE__ */ jsx(M, { children: "\\le B=4" }),
						"。两条线都不能越界。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(Cost2DSetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "每件物品挂两个费用标签 (a, b)；背包有两条互相独立的容量线（A 与 B），装入的物品要让两种费用之和都不超限。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"这类约束在现实里遍地都是：买东西受",
						/* @__PURE__ */ jsx("strong", { children: "钱" }),
						"和",
						/* @__PURE__ */ jsx("strong", { children: "时间" }),
						"双重限制；装货受",
						/* @__PURE__ */ jsx("strong", { children: "体积" }),
						"和",
						/* @__PURE__ */ jsx("strong", { children: "质量" }),
						"双重限制；组队受",
						/* @__PURE__ */ jsx("strong", { children: "预算" }),
						"和",
						/* @__PURE__ */ jsx("strong", { children: "人数" }),
						"双重限制。 共同点是——",
						/* @__PURE__ */ jsx("strong", { children: "每选一件，就要同时从两个「口袋」里各扣一笔" }),
						"，而且两个口袋",
						/* @__PURE__ */ jsx("strong", { children: "互不相通" }),
						"：省下的时间换不来更多钱。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"能不能只盯着一种费用做普通 01 背包，事后再检查另一种够不够？",
						/* @__PURE__ */ jsx("strong", { children: "不行" }),
						"。因为「费用1 最省」的方案，费用2 未必也最省——两种费用的取舍是",
						/* @__PURE__ */ jsx("strong", { children: "耦合" }),
						"的，必须一起进 DP 的状态，才知道某个费用1 的档位下、费用2 还剩多少空间。"
					] })]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：给背包多开一维"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"回忆 01 背包的一维状态 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						"：花费不超过 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 时的最大价值。现在费用有两种，那就让状态",
						/* @__PURE__ */ jsx("strong", { children: "同时记住两笔账" }),
						"： 设 ",
						/* @__PURE__ */ jsx(M, { children: "dp[x][y]" }),
						" 表示",
						/* @__PURE__ */ jsxs("strong", { children: [
							"费用1 不超过 ",
							/* @__PURE__ */ jsx(M, { children: "x" }),
							"、费用2 不超过 ",
							/* @__PURE__ */ jsx(M, { children: "y" })
						] }),
						" 时能取得的最大价值。约束从一条数轴变成一整片平面，下标也从一个变成一对。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(Cost2DDimensionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "一条费用 → 一个下标 j（数轴）；两条费用 → 一对下标 (x, y)（平面）。二维费用不过是给 dp 增开一维。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"转移和 01 背包",
							/* @__PURE__ */ jsx("strong", { children: "一模一样的两条路" }),
							"，只是「扣费用」这一步要",
							/* @__PURE__ */ jsx("strong", { children: "同时扣两种" }),
							"："
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsxs("strong", { children: [
								"不取第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 件"
							] }),
							"：它没参与，",
							/* @__PURE__ */ jsx(M, { children: "dp[x][y]" }),
							" 保持原值（还没装它时的最优）。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsxs("strong", { children: [
								"取第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 件"
							] }),
							"（前提两种费用都够：",
							/* @__PURE__ */ jsx(M, { children: "x\\ge a_i" }),
							" 且 ",
							/* @__PURE__ */ jsx(M, { children: "y\\ge b_i" }),
							"）：费用1 腾出 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							"、费用2 腾出 ",
							/* @__PURE__ */ jsx(M, { children: "b_i" }),
							"，剩下的 ",
							/* @__PURE__ */ jsx(M, { children: "(x-a_i,\\ y-b_i)" }),
							" 空间留给前面的物品去最优，再补上它的价值 ",
							/* @__PURE__ */ jsx(M, { children: "v_i" }),
							"，即 ",
							/* @__PURE__ */ jsx(M, { children: "dp[x-a_i][y-b_i]+v_i" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(Cost2DDecisionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "每格 dp[x][y] 仍是两条路取 max：不取则留原值；取则一次性扣掉两种费用 (x−a, y−b) 再补 v。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"两条路取较大者，就得到",
							/* @__PURE__ */ jsx("strong", { children: "转移方程" }),
							"（写成一维滚动数组的形式）："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[x][y]=\\max\\big(\\,dp[x][y],\\ dp[x-a_i][y-b_i]+v_i\\,\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"边界：",
							/* @__PURE__ */ jsx(M, { children: "dp[x][y]=0" }),
							"（一件不装，价值为 0）。答案：",
							/* @__PURE__ */ jsx(M, { children: "dp[A][B]" }),
							"。对照 01 背包",
							/* @__PURE__ */ jsx(Link, {
								to: "/part/a/01",
								style: { color: "var(--accent-2)" },
								children: "一维式"
							}),
							" ",
							/* @__PURE__ */ jsx(M, { children: "f[j]=\\max(f[j],\\ f[j-w_i]+v_i)" }),
							"—— 二维费用只是把「一个下标 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							"、扣一种费用 ",
							/* @__PURE__ */ jsx(M, { children: "w" }),
							"」换成「两个下标 ",
							/* @__PURE__ */ jsx(M, { children: "x,y" }),
							"、同时扣两种费用 ",
							/* @__PURE__ */ jsx(M, { children: "a,b" }),
							"」，方程骨架分毫未动。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"二维费用不是新算法，而是给每件物品",
						/* @__PURE__ */ jsx("strong", { children: "挂了两个属性标签" }),
						"：约束从一条变两条，DP 的状态维度就随之 ",
						/* @__PURE__ */ jsx("strong", { children: "+1" }),
						"。凡是「若干种",
						/* @__PURE__ */ jsx("strong", { children: "相互独立" }),
						"的资源同时受限」，都照此把状态加一维即可——三种资源就加两维（时空代价会陡增，故通常止于二维）。"
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
						"用开头的例子（物品 ",
						/* @__PURE__ */ jsx(M, { children: "(a,b,v)=(1,2,3),\\ (2,1,4)" }),
						"，上限 ",
						/* @__PURE__ */ jsx(M, { children: "A=B=4" }),
						"）走几步，重点盯住",
						/* @__PURE__ */ jsx("strong", { children: "每装一件，两种费用一起扣" }),
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
									/* @__PURE__ */ jsx("b", { children: "初始化整表。" }),
									" 一件都不装时，任何 ",
									/* @__PURE__ */ jsx(M, { children: "(x,y)" }),
									" 下价值都是 0：",
									/* @__PURE__ */ jsx(M, { children: "dp[\\cdot][\\cdot]=0" }),
									"。这是二维表格的地基。"
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
									/* @__PURE__ */ jsx("b", { children: "装入物品 1" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "a=1,b=2,v=3" }),
									"）。凡是 ",
									/* @__PURE__ */ jsx(M, { children: "x\\ge1" }),
									" 且 ",
									/* @__PURE__ */ jsx(M, { children: "y\\ge2" }),
									" 的格，都能装下它：",
									/* @__PURE__ */ jsx(M, { children: "dp[x][y]=\\max(0,\\ dp[x-1][y-2]+3)=3" }),
									"。于是表格「右下那一大片」（",
									/* @__PURE__ */ jsx(M, { children: "x\\ge1,y\\ge2" }),
									"）全变成 3，其余仍是 0。"
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
									/* @__PURE__ */ jsx("b", { children: "装入物品 2" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "a=2,b=1,v=4" }),
									"）。看格 ",
									/* @__PURE__ */ jsx(M, { children: "(x{=}2,y{=}2)" }),
									"：取 = ",
									/* @__PURE__ */ jsx(M, { children: "dp[0][1]+4=0+4=4" }),
									"，胜过原值 3 → ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][2]=4" }),
									"（只装物品 2）。再看角落 ",
									/* @__PURE__ */ jsx(M, { children: "(x{=}4,y{=}4)" }),
									"：取 = ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][3]+4=3+4=7" }),
									"，胜过原值 3 → ",
									/* @__PURE__ */ jsx(M, { children: "dp[4][4]=7" }),
									"。"
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
									" ",
									/* @__PURE__ */ jsx(M, { children: "dp[4][4]=7" }),
									"——它对应「",
									/* @__PURE__ */ jsx("strong", { children: "两件都装" }),
									"」：费用1 ",
									/* @__PURE__ */ jsx(M, { children: "1+2=3\\le4" }),
									"、费用2 ",
									/* @__PURE__ */ jsx(M, { children: "2+1=3\\le4" }),
									"，价值 ",
									/* @__PURE__ */ jsx(M, { children: "3+4=7" }),
									"。两条约束同时满足，正是二维费用下的最优。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把整张二维表",
						/* @__PURE__ */ jsx("strong", { children: "逐件填出" }),
						"，高亮每件抬升了哪些格、来源在哪。改物品的 ",
						/* @__PURE__ */ jsx(M, { children: "a,b,v" }),
						" 或两个上限，看表实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "看它一件一件铺满平面"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(KnapsackCost2DDemo, {})
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"注意演示里",
						/* @__PURE__ */ jsx("strong", { children: "每处理一件，就把整张表刷一遍" }),
						"：能装下该件（",
						/* @__PURE__ */ jsx(M, { children: "x\\ge a,\\ y\\ge b" }),
						"）且更划算的格被抬高，其余不动。 这正是一维滚动写法的样子——只保留「当前这张二维表」，逐件在它上面就地更新。"
					] })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"用演示下方的按钮切到 ",
						/* @__PURE__ */ jsx("strong", { children: "「价值恒 1 · 数个数」" }),
						"模式：每件价值统一当 1，转移的 ",
						/* @__PURE__ */ jsx(M, { children: "+v_i" }),
						" 变成 ",
						/* @__PURE__ */ jsx(M, { children: "+1" }),
						"，",
						/* @__PURE__ */ jsx(M, { children: "dp[x][y]" }),
						" 就从「最大价值」变成「",
						/* @__PURE__ */ jsx("strong", { children: "最多件数" }),
						"」——同一台机器，答案 ",
						/* @__PURE__ */ jsx(M, { children: "dp[4][4]" }),
						" 从 7（价值）变成 2（装得下两件）。这正是下面「变形一」讲的 P1855 那一路。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "两个常见变形：数个数，与两维都倒序"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "变形一：价值恒 1，求「最多能选几件」。" }),
							" 很多题不问最大价值，而问「预算和时间都有限，最多能实现几个愿望 / 塞下几样东西」。 这只需把每件的",
							/* @__PURE__ */ jsx("strong", { children: "价值统一设成 1" }),
							"，转移里的 ",
							/* @__PURE__ */ jsx(M, { children: "+v_i" }),
							" 变成 ",
							/* @__PURE__ */ jsx(M, { children: "+1" }),
							"，",
							/* @__PURE__ */ jsx(M, { children: "dp[x][y]" }),
							" 的含义就从「最大价值」变成「",
							/* @__PURE__ */ jsx("strong", { children: "最多件数" }),
							"」："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[x][y]=\\max\\big(\\,dp[x][y],\\ dp[x-a_i][y-b_i]+1\\,\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"「求个数」和「求价值」在背包里本是",
							/* @__PURE__ */ jsx("strong", { children: "同一台机器" }),
							"——把价值当成 1 计，最大价值就是最多件数。下面例题 P1855 正是这一路。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "变形二：把「二维」看成「朴素三属性物品」。" }),
							" 二维费用听着抽象，落到代码里不过是每件物品多带一个属性、循环多套一层。 像 P1507 那样「每份食物有体积、质量、卡路里」——体积和质量是两种费用，卡路里是价值，直接当普通 01 物品处理，只是背包状态是二维的 ",
							/* @__PURE__ */ jsx(M, { children: "dp[j][k]" }),
							" 而已。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"至于循环方向：一维滚动写法里，",
							/* @__PURE__ */ jsx("strong", { children: "两种费用维都要倒序" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "x" }),
							" 从 ",
							/* @__PURE__ */ jsx(M, { children: "A" }),
							" 到 ",
							/* @__PURE__ */ jsx(M, { children: "a" }),
							"、",
							/* @__PURE__ */ jsx(M, { children: "y" }),
							" 从 ",
							/* @__PURE__ */ jsx(M, { children: "B" }),
							" 到 ",
							/* @__PURE__ */ jsx(M, { children: "b" }),
							"）。道理和 01 背包",
							/* @__PURE__ */ jsx(Link, {
								to: "/part/a/01",
								style: { color: "var(--accent-2)" },
								children: "「必须倒序」"
							}),
							"完全一致：倒序时 ",
							/* @__PURE__ */ jsx(M, { children: "dp[x-a][y-b]" }),
							" 用的是",
							/* @__PURE__ */ jsx("strong", { children: "本件尚未装入" }),
							"的旧值，才能保证每件至多取一次。三层循环的骨架是「逐件 → 费用1 倒序 → 费用2 倒序」："
						] }),
						/* @__PURE__ */ jsx("pre", {
							className: "mono",
							style: {
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
							},
							children: `for 每件物品 (a, v, b):
  for x = A downto a:        // ★费用1 维倒序
    for y = B downto b:      // ★费用2 维倒序
      dp[x][y] = max( dp[x][y], dp[x − a][y − b] + v )`
						})
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "记死：两维都倒序，缺一维就退化成完全背包",
					children: [
						"二维费用的 01 型，",
						/* @__PURE__ */ jsx("strong", { children: "费用1 和费用2 两个循环都必须倒序" }),
						"。哪怕只把其中一维写成正序，该维度上就会像",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/complete",
							style: { color: "var(--accent-2)" },
							children: "完全背包"
						}),
						"那样「同一件被反复装入」，答案偏大。若题目本就允许每件取无限次（二维费用的",
						/* @__PURE__ */ jsx("strong", { children: "完全型" }),
						"），才把两维都改成正序。"
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
					pid: "P1855",
					name: "榨取 kkksc03",
					src: "洛谷原生",
					diff: "普及-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"有 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个愿望，你有 ",
								/* @__PURE__ */ jsx(M, { children: "M" }),
								" 元钱与 ",
								/* @__PURE__ */ jsx(M, { children: "T" }),
								" 单位时间。实现第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 个愿望要花 ",
								/* @__PURE__ */ jsx(M, { children: "m_i" }),
								" 元、",
								/* @__PURE__ */ jsx(M, { children: "t_i" }),
								" 时间。求在钱和时间都不超限的前提下，",
								/* @__PURE__ */ jsx("strong", { children: "最多能实现几个愿望" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"「钱」= 费用1 ",
								/* @__PURE__ */ jsx(M, { children: "a" }),
								"（上限 ",
								/* @__PURE__ */ jsx(M, { children: "A=M" }),
								"），「时间」= 费用2 ",
								/* @__PURE__ */ jsx(M, { children: "b" }),
								"（上限 ",
								/* @__PURE__ */ jsx(M, { children: "B=T" }),
								"），每个愿望",
								/* @__PURE__ */ jsx("strong", { children: "价值恒 1" }),
								"。二维费用最干净的入门题。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角（价值恒 1 = 数个数）",
							children: [
								"不问价值、只问个数——把每件价值设为 1，",
								/* @__PURE__ */ jsx(M, { children: "dp[j][k]" }),
								" 就是「花钱 ",
								/* @__PURE__ */ jsx(M, { children: "\\le j" }),
								"、花时间 ",
								/* @__PURE__ */ jsx(M, { children: "\\le k" }),
								" 时最多实现的愿望数」，转移的 ",
								/* @__PURE__ */ jsx(M, { children: "+v" }),
								" 写成 ",
								/* @__PURE__ */ jsx(M, { children: "+1" }),
								"。答案即 ",
								/* @__PURE__ */ jsx(M, { children: "dp[M][T]" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "dp[j][k]=\\max(dp[j][k],\\ dp[j-m_i][k-t_i]+1)" }),
								"，两维都倒序；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(nMT)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（二维 01，两维倒序）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1855,
								luogu: "P1855"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1507",
					name: "NASA 的食物计划",
					src: "洛谷原生",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"飞船有",
								/* @__PURE__ */ jsx("strong", { children: "体积" }),
								"上限 ",
								/* @__PURE__ */ jsx(M, { children: "H" }),
								" 和",
								/* @__PURE__ */ jsx("strong", { children: "质量" }),
								"上限 ",
								/* @__PURE__ */ jsx(M, { children: "T" }),
								"。有 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 种食物，第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 种占体积 ",
								/* @__PURE__ */ jsx(M, { children: "h_i" }),
								"、质量 ",
								/* @__PURE__ */ jsx(M, { children: "t_i" }),
								"，提供卡路里 ",
								/* @__PURE__ */ jsx(M, { children: "c_i" }),
								"，每种最多带一份。求携带食物的",
								/* @__PURE__ */ jsx("strong", { children: "最大卡路里" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"「体积」= 费用1、「质量」= 费用2、「卡路里」= 价值。每份食物就是一个带",
								/* @__PURE__ */ jsx("strong", { children: "两种费用、一个价值" }),
								"的普通 01 物品。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角（二维 = 三属性物品）",
							children: [
								"把「二维背包」想成「物品有三个数：两笔费用 + 一份价值」，代码结构和一维 01 背包",
								/* @__PURE__ */ jsx("strong", { children: "只差一层循环" }),
								"——外层逐份食物，内层是费用1、费用2 两个倒序循环。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "dp[j][k]=\\max(dp[j][k],\\ dp[j-h_i][k-t_i]+c_i)" }),
								"，两维都倒序；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(nHT)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1507,
								luogu: "P1507"
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
						"说明：纯二维费用的洛谷原生题目池并不宽。下面以 P1509 为主练一道「双费用 + 时间最少」的综合题；若想再练裸模板，上面的 ",
						/* @__PURE__ */ jsx("strong", { children: "P1855 / P1507" }),
						" 都可回炉自测（不看参考代码默写两维倒序的三层循环）。"
					]
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1509",
					name: "找啊找啊找 GF",
					hint: "钱 + 人品双约束的二维费用背包：dp[j][k] 记「花钱 ≤ j、花人品 ≤ k」时能追到的最多女友数。难点在双关键字——先比女友数量最大，数量相同再比所花时间最少，转移时对这两个关键字依次取优。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1855",
					name: "榨取 kkksc03",
					hint: "学完回来独立复现：钱、时间两种费用同时受限，价值恒 1 求最多愿望数。默写「逐件 → 钱倒序 → 时间倒序」的三层循环，答案取 dp[M][T]。"
				})
			]
		})
	] });
}
//#endregion
export { KnapsackCost2D as default };
