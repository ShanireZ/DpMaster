import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as recordStoneMerge, t as solveStoneMerge } from "./stone-merge-Yx6UFvnL.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Gamepad2, Minus, MousePointerClick, Plus, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/interval/stoneSolver.ts
function settled(values) {
	const states = {};
	for (let row = 0; row < values.length; row++) for (let column = 0; column < values[row].length; column++) if (values[row][column] !== null) states[key(row, column)] = "settled";
	return states;
}
/** 区间合并结果的教学 Adapter：重放领域事件，生成三角表轨迹。 */
function stoneMerge(a, opt = "min") {
	const n = a.length;
	const run = recordStoneMerge(a, opt);
	const dp = Array.from({ length: n }, () => Array(n).fill(null));
	for (let index = 0; index < n; index++) dp[index][index] = 0;
	const snap = () => dp.map((row) => row.slice());
	const frames = [{
		values: snap(),
		states: settled(dp),
		caption: "<b>对角线（区间长度 1）</b>：单独一堆石子无需合并，代价为 <b>0</b>——dp[l][l]=0。下三角（l&gt;r）不是合法区间，留作空白。这是整张三角表的地基。",
		formula: "dp[l][l] = 0"
	}];
	const optWord = opt === "min" ? "最小" : "最大";
	const optFn = opt === "min" ? "\\min" : "\\max";
	for (const event of run.events) {
		const { left: l, right: r, bestSplit, cost, sum, bestBase, length, candidates } = event;
		dp[l][r] = cost;
		const states = settled(dp);
		const arrows = [];
		states[key(l, bestSplit)] = "chosen";
		states[key(bestSplit + 1, r)] = "chosen";
		arrows.push({
			from: {
				r: l,
				c: bestSplit
			},
			to: {
				r: l,
				c: r
			},
			kind: "chosen"
		});
		arrows.push({
			from: {
				r: bestSplit + 1,
				c: r
			},
			to: {
				r: l,
				c: r
			},
			kind: "chosen"
		});
		states[key(l, r)] = "current";
		const caption = `区间 <b>[${l},${r}]</b>（长度 ${length}，区间和=${sum}）：枚举分割点 k，候选 dp[l][k]+dp[k+1][r] = {${candidates.map((candidate, index) => `${l + index === bestSplit ? "★" : ""}${candidate}`).join(", ")}}，取${optWord} <b>${bestBase}</b>，再加区间和 ${sum} → dp[${l}][${r}] = <b>${cost}</b>（在 k=${bestSplit} 处断开）。`;
		const formula = `dp[${l}][${r}]=${optFn}_{k}(dp[${l}][k]+dp[k{+}1][${r}])+${sum}=${bestBase}+${sum}=${cost}`;
		frames.push({
			values: snap(),
			states,
			arrows,
			active: {
				r: l,
				c: r
			},
			caption,
			formula
		});
	}
	const finalStates = settled(dp);
	if (n > 0) finalStates[key(0, n - 1)] = "chosen";
	frames.push({
		values: snap(),
		states: finalStates,
		caption: n === 0 ? "空序列无需合并，总代价为 <b>0</b>。" : `答案在<b>右上角 dp[0][${n - 1}] = ${run.result.cost}</b>——把全部 ${n} 堆石子合并成一堆的${optWord}总代价。三角表沿对角线一层层向右上填满。`,
		formula: n === 0 ? "0" : `dp[0][${n - 1}]=${run.result.cost}`
	});
	return {
		rows: n,
		cols: n,
		cell: 40,
		rowHeaderLabels: Array.from({ length: n }, (_, left) => `l=${left}`),
		colHeaderLabels: Array.from({ length: n }, (_, right) => `r=${right}`),
		frames
	};
}
//#endregion
//#region src/components/demos/interval/StoneMergeDemo.tsx
function Stepper$1({ label, value, min, max, onChange }) {
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
/** 石子合并区间 DP 三角表演示：dp[l][r] 按区间长度递推，高亮当前格与被选分割点的两个子区间来源。 */
function StoneMergeDemo() {
	const [stones, setStones] = useState([
		7,
		6,
		5,
		4
	]);
	const model = useMemo(() => stoneMerge(stones, "min"), [stones]);
	const modelKey = `sm-${stones.join("_")}`;
	const setStone = (i, val) => setStones((arr) => arr.map((s, k) => k === i ? val : s));
	const addStone = () => setStones((arr) => arr.length < 5 ? [...arr, 3] : arr);
	const removeStone = (i) => setStones((arr) => arr.length > 3 ? arr.filter((_, k) => k !== i) : arr);
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
		className: "kd__toolbar",
		children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "kd__group-label",
			children: "一排石子（相邻可合并 · 可改每堆数值 · 3～5 堆）"
		}), /* @__PURE__ */ jsxs("div", {
			className: "kd__items",
			children: [stones.map((s, i) => /* @__PURE__ */ jsxs("div", {
				className: "kd__item",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "kd__item-i",
						children: i
					}),
					stones.length > 3 && /* @__PURE__ */ jsx("button", {
						className: "kd__remove",
						onClick: () => removeStone(i),
						"aria-label": "删除该堆",
						children: /* @__PURE__ */ jsx(X, { size: 12 })
					}),
					/* @__PURE__ */ jsx(Stepper$1, {
						label: "石子数 a",
						value: s,
						min: 1,
						max: 30,
						onChange: (v) => setStone(i, v)
					})
				]
			}, i)), stones.length < 5 && /* @__PURE__ */ jsxs("button", {
				className: "kd__add",
				onClick: addStone,
				children: [/* @__PURE__ */ jsx(Plus, { size: 14 }), " 加一堆"]
			})]
		})] })
	}), /* @__PURE__ */ jsx(DPViz, { model }, modelKey)] });
}
//#endregion
//#region src/components/demos/interval/StoneMinMaxDemo.tsx
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
/** 同一排石子：左求最小合并代价、右求最大，并排两张三角表——点明「一题双问」。 */
function StoneMinMaxDemo() {
	const [stones, setStones] = useState([
		7,
		6,
		5,
		4
	]);
	const minModel = useMemo(() => stoneMerge(stones, "min"), [stones]);
	const maxModel = useMemo(() => stoneMerge(stones, "max"), [stones]);
	const aMin = useMemo(() => solveStoneMerge(stones, "min").cost, [stones]);
	const aMax = useMemo(() => solveStoneMerge(stones, "max").cost, [stones]);
	const k = stones.join("_");
	const setStone = (i, val) => setStones((arr) => arr.map((s, j) => j === i ? val : s));
	const addStone = () => setStones((arr) => arr.length < 5 ? [...arr, 3] : arr);
	const removeStone = (i) => setStones((arr) => arr.length > 3 ? arr.filter((_, j) => j !== i) : arr);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "fbug__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "同一排石子（两侧共用 · 可改数值 / 增删堆）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "kd__items",
				children: [stones.map((s, i) => /* @__PURE__ */ jsxs("div", {
					className: "kd__item",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "kd__item-i",
							children: i
						}),
						stones.length > 3 && /* @__PURE__ */ jsx("button", {
							className: "kd__remove",
							onClick: () => removeStone(i),
							"aria-label": "删除该堆",
							children: /* @__PURE__ */ jsx(X, { size: 12 })
						}),
						/* @__PURE__ */ jsx(Stepper, {
							label: "石子数 a",
							value: s,
							min: 1,
							max: 30,
							onChange: (v) => setStone(i, v)
						})
					]
				}, i)), stones.length < 5 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: addStone,
					children: [/* @__PURE__ */ jsx(Plus, { size: 14 }), " 加一堆"]
				})]
			})] })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"最小合并代价 ",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: [
						"dp[0][",
						stones.length - 1,
						"] = ",
						aMin
					]
				}),
				" · 最大合并代价",
				" ",
				/* @__PURE__ */ jsxs("b", {
					className: "you",
					children: [
						"dp[0][",
						stones.length - 1,
						"] = ",
						aMax
					]
				}),
				" · 同一组石子、同一套转移，只把",
				" ",
				/* @__PURE__ */ jsx("b", { children: "opt" }),
				" 从 ",
				/* @__PURE__ */ jsx("b", { children: "min" }),
				" 换成 ",
				/* @__PURE__ */ jsx("b", { children: "max" }),
				"，两问差 ",
				/* @__PURE__ */ jsx("b", { children: aMax - aMin }),
				"。"
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__pair",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "fbug__side-label ok",
				children: [/* @__PURE__ */ jsx(ArrowDownWideNarrow, { size: 15 }), " 最小合并代价（opt = min）"]
			}), /* @__PURE__ */ jsx(DPViz, { model: minModel }, `min${k}`)] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "fbug__side-label you",
				children: [/* @__PURE__ */ jsx(ArrowUpWideNarrow, { size: 15 }), " 最大合并代价（opt = max）"]
			}), /* @__PURE__ */ jsx(DPViz, { model: maxModel }, `max${k}`)] })]
		})
	] });
}
//#endregion
//#region src/content/c/StoneMergeArt.tsx
function MergeSetupFigure() {
	const piles = [
		7,
		6,
		5,
		4
	];
	const x0 = 40;
	const dx = 92;
	const bw = 66;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 176",
		role: "img",
		"aria-label": "一排石子，相邻两堆合并",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "sm-ar",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--accent-2)"
				})
			}) }),
			piles.map((p, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${x0 + i * dx},30)`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: bw,
						height: "70",
						rx: "12",
						fill: i === 1 || i === 2 ? "color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))" : "var(--surface-3)",
						stroke: i === 1 || i === 2 ? "var(--accent-2)" : "var(--border-strong)",
						strokeWidth: i === 1 || i === 2 ? 2.5 : 1.5
					}),
					/* @__PURE__ */ jsxs("text", {
						x: bw / 2,
						y: "30",
						textAnchor: "middle",
						fontSize: "12",
						fill: "var(--text-2)",
						children: [
							"第 ",
							i,
							" 堆"
						]
					}),
					/* @__PURE__ */ jsx("text", {
						x: bw / 2,
						y: "54",
						textAnchor: "middle",
						fontSize: "18",
						className: "mono",
						fill: "var(--accent-1)",
						children: p
					})
				]
			}, i)),
			/* @__PURE__ */ jsx("path", {
				d: `M 132 108 Q 132 120 144 120 L 278 120 Q 290 120 290 108`,
				fill: "none",
				stroke: "var(--accent-2)",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M 204 138 V 150`,
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				markerEnd: "url(#sm-ar)"
			}),
			/* @__PURE__ */ jsxs("text", {
				x: 171,
				y: "170",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-1)",
				children: ["合并 6+5，代价 ", /* @__PURE__ */ jsx("tspan", {
					className: "mono",
					fill: "var(--accent-1)",
					children: "11"
				})]
			})
		]
	});
}
function IntervalSplitFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 262",
		role: "img",
		"aria-label": "区间在分割点 k 处断成两个子区间",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "is-ar",
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
				transform: "translate(210,8)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "200",
						height: "46",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "20",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "合并区间 [l, r]"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "38",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[l][r] = ?"
					})
				]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "310",
				y: "74",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "枚举分割点 k：先合出左半，再合出右半"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M280 84 L180 118",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#is-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M340 84 L452 118",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#is-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(52,120)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "224",
						height: "58",
						rx: "12",
						fill: "color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))",
						stroke: "var(--viz-chosen)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "112",
						y: "24",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "左半已合成一堆"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "112",
						y: "45",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[l][k]"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(344,120)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "224",
						height: "58",
						rx: "12",
						fill: "color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))",
						stroke: "var(--viz-chosen)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "112",
						y: "24",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "右半已合成一堆"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "112",
						y: "45",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[k+1][r]"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M180 178 L300 214",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#is-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M456 178 L340 214",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#is-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(150,216)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "320",
					height: "44",
					rx: "14",
					fill: "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: "160",
					y: "28",
					textAnchor: "middle",
					fontSize: "13.5",
					className: "mono",
					fill: "var(--text-1)",
					children: "dp[l][k] + dp[k+1][r] + sum(l..r)"
				})]
			})
		]
	});
}
function LengthOrderFigure() {
	const n = 4;
	const CELL = 46;
	const ox = 60;
	const oy = 30;
	const lenColor = (len) => {
		if (len === 1) return {
			fill: "var(--surface-3)",
			stroke: "var(--border-strong)"
		};
		return {
			fill: `color-mix(in srgb, var(--accent-1) ${[
				0,
				10,
				16,
				24
			][len - 1]}%, var(--surface-3))`,
			stroke: "var(--accent-2)"
		};
	};
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 470 250",
		role: "img",
		"aria-label": "三角表按区间长度由对角线向右上填充",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "lo-ar",
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
			Array.from({ length: n }, (_, c) => /* @__PURE__ */ jsxs("text", {
				x: ox + c * CELL + CELL / 2,
				y: oy - 8,
				textAnchor: "middle",
				fontSize: "12",
				className: "mono",
				fill: "var(--accent-2)",
				children: ["r=", c]
			}, `c${c}`)),
			Array.from({ length: n }, (_, r) => /* @__PURE__ */ jsxs("text", {
				x: ox - 12,
				y: oy + r * CELL + CELL / 2 + 4,
				textAnchor: "middle",
				fontSize: "12",
				className: "mono",
				fill: "var(--accent-2)",
				children: ["l=", r]
			}, `r${r}`)),
			Array.from({ length: n }, (_, l) => Array.from({ length: n }, (_, r) => {
				const x = ox + r * CELL;
				const y = oy + l * CELL;
				if (r < l) return /* @__PURE__ */ jsx("rect", {
					x: x + 3,
					y: y + 3,
					width: CELL - 6,
					height: CELL - 6,
					rx: "8",
					fill: "var(--surface-2)",
					opacity: "0.4"
				}, `${l}-${r}`);
				const len = r - l + 1;
				const col = lenColor(len);
				return /* @__PURE__ */ jsxs("g", { children: [
					/* @__PURE__ */ jsx("rect", {
						x: x + 3,
						y: y + 3,
						width: CELL - 6,
						height: CELL - 6,
						rx: "8",
						fill: col.fill,
						stroke: col.stroke,
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsxs("text", {
						x: x + CELL / 2,
						y: y + CELL / 2 - 3,
						textAnchor: "middle",
						fontSize: "10.5",
						className: "mono",
						fill: "var(--text-3)",
						children: ["len", len]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: x + CELL / 2,
						y: y + CELL / 2 + 12,
						textAnchor: "middle",
						fontSize: "10",
						className: "mono",
						fill: "var(--text-2)",
						children: [
							"[",
							l,
							",",
							r,
							"]"
						]
					})
				] }, `${l}-${r}`);
			})),
			/* @__PURE__ */ jsx("path", {
				d: `M 83 191 L 221 53`,
				fill: "none",
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				strokeDasharray: "5 4",
				markerEnd: "url(#lo-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 202,
				y: 164,
				fontSize: "11.5",
				fill: "var(--accent-1)",
				children: "长度递增"
			})
		]
	});
}
//#endregion
//#region src/content/c/StoneMerge.tsx
var CODE_P1880 = `
#include <iostream>
#include <cstring>
using namespace std;

const int INF = 0x3f3f3f3f;
int a[105];                   // 链形基底：n 堆石子（环形拆解留到下一节）
int pre[105];                 // 前缀和，sum(l..r) = pre[r] - pre[l-1]
int f[105][105];             // 最小合并代价
int g[105][105];             // 最大合并代价

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        pre[i] = pre[i - 1] + a[i];
    }

    for (int len = 2; len <= n; len++)          // ★外层枚举区间长度，由短到长
        for (int l = 1; l + len - 1 <= n; l++)
        {
            int r = l + len - 1;
            int s = pre[r] - pre[l - 1];        // 本区间合并的代价（区间和）
            f[l][r] = INF;
            g[l][r] = -INF;
            for (int k = l; k <= r - 1; k++)    // 枚举分割点 k
            {
                f[l][r] = min(f[l][r], f[l][k] + f[k + 1][r] + s);
                g[l][r] = max(g[l][r], g[l][k] + g[k + 1][r] + s);
            }
        }

    cout << f[1][n] << endl;                     // 一题双问：最小、最大
    cout << g[1][n] << endl;
    return 0;
}`;
var CODE_P5019 = `
#include <iostream>
using namespace std;

int main()
{
    int n;
    cin >> n;
    long long ans = 0;
    int prev = 0;                                // 上一格的高度（差分视角）
    for (int i = 1; i <= n; i++)
    {
        int h;
        cin >> h;
        if (h > prev)                            // 只在“抬高”处付出铺设次数
            ans += h - prev;
        prev = h;
    }
    cout << ans << endl;
    return 0;
}`;
function StoneMerge() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "把相邻的石子并成一堆"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"先看一个具体场景：一排摆着 ",
						/* @__PURE__ */ jsx("strong", { children: "4 堆" }),
						"石子，数目依次是 ",
						/* @__PURE__ */ jsx(M, { children: "7,\\ 6,\\ 5,\\ 4" }),
						"。 每次只能挑",
						/* @__PURE__ */ jsx("strong", { children: "相邻的两堆" }),
						"并成一堆，代价是",
						/* @__PURE__ */ jsx("strong", { children: "这两堆石子数之和" }),
						"。不断合并，直到剩下唯一一堆——不同的合并顺序，累计代价不同，问",
						/* @__PURE__ */ jsx("strong", { children: "最小总代价" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(MergeSetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "4 堆石子排成一排，只能合并相邻两堆；合并第 1、2 堆（6 与 5）付出代价 11。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"第一反应也许是",
						/* @__PURE__ */ jsx("strong", { children: "贪心" }),
						"：每次挑当前最小的相邻两堆并。可这在石子合并里",
						/* @__PURE__ */ jsx("strong", { children: "并不总对" }),
						"——因为一堆石子会",
						/* @__PURE__ */ jsx("strong", { children: "反复参与" }),
						"后续每一次合并，早并的堆，其石子数会被后面一次次重复计入代价。此刻看着便宜的一步，可能把某堆抬进后续昂贵的合并里。 这是个",
						/* @__PURE__ */ jsx("strong", { children: "牵一发动全身" }),
						"的全局问题。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"那把「先合哪对、再合哪对」的所有顺序都枚举一遍？",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 堆的合并顺序数量随 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" ",
						/* @__PURE__ */ jsx("strong", { children: "指数爆炸" }),
						"，不可行。 但换个角度：无论怎么合，",
						/* @__PURE__ */ jsx("strong", { children: "最后一步" }),
						"一定是把某个",
						/* @__PURE__ */ jsx("strong", { children: "连续区间" }),
						"的左半与右半两堆并起来。于是问题天然带上了",
						/* @__PURE__ */ jsx("strong", { children: "区间" }),
						"的结构——这正是区间 DP 的入口。"
					] })]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：枚举最后一次合并的分割点"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
						"设 ",
						/* @__PURE__ */ jsx(M, { children: "dp[l][r]" }),
						" 表示：把第 ",
						/* @__PURE__ */ jsx(M, { children: "l" }),
						" 堆到第 ",
						/* @__PURE__ */ jsx(M, { children: "r" }),
						" 堆这段",
						/* @__PURE__ */ jsx("strong", { children: "连续区间" }),
						"合并成",
						/* @__PURE__ */ jsx("strong", { children: "一堆" }),
						"所需的最小代价。 要把 ",
						/* @__PURE__ */ jsx(M, { children: "[l,r]" }),
						" 合成一堆，",
						/* @__PURE__ */ jsx("strong", { children: "最后一次合并" }),
						"必然是把某个",
						/* @__PURE__ */ jsxs("strong", { children: ["分割点 ", /* @__PURE__ */ jsx(M, { children: "k" })] }),
						" 左边的 ",
						/* @__PURE__ */ jsx(M, { children: "[l,k]" }),
						"（已合成一堆）与右边的 ",
						/* @__PURE__ */ jsx(M, { children: "[k+1,r]" }),
						"（也已合成一堆）并起来。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(IntervalSplitFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "dp[l][r] 枚举分割点 k：左半 dp[l][k] 与右半 dp[k+1][r] 各自先合成一堆，再合并这最后两堆，追加代价 = 整段区间和 sum(l..r)。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"这",
							/* @__PURE__ */ jsx("strong", { children: "最后一并" }),
							"的代价是多少？两堆分别是 ",
							/* @__PURE__ */ jsx(M, { children: "[l,k]" }),
							" 和 ",
							/* @__PURE__ */ jsx(M, { children: "[k+1,r]" }),
							" 的全部石子，加起来恰好是",
							/* @__PURE__ */ jsx("strong", { children: "整段区间的石子总和" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "\\mathrm{sum}(l,r)" }),
							"——与 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							" 断在哪里",
							/* @__PURE__ */ jsx("strong", { children: "无关" }),
							"。 所以在分割点 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							" 处断开的总代价是 ",
							/* @__PURE__ */ jsx(M, { children: "dp[l][k]+dp[k+1][r]+\\mathrm{sum}(l,r)" }),
							"。究竟断在哪个 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							" 最好？",
							/* @__PURE__ */ jsxs("strong", { children: [
								"把每个 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 都试一遍，取最小"
							] }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[l][r]=\\min_{l\\le k\\le r-1}\\big(dp[l][k]+dp[k+1][r]\\big)+\\mathrm{sum}(l,r)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"边界：",
							/* @__PURE__ */ jsx(M, { children: "dp[l][l]=0" }),
							"（单独一堆无需合并）。答案：",
							/* @__PURE__ */ jsx(M, { children: "dp[1][n]" }),
							"。 区间和用",
							/* @__PURE__ */ jsx("strong", { children: "前缀和" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "\\mathrm{sum}(l,r)=pre[r]-pre[l-1]" }),
							" 一步取到，不必每次重扫。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"这里藏着区间 DP 与线性 DP 的关键分野：",
							/* @__PURE__ */ jsx(M, { children: "dp[l][r]" }),
							" 依赖的是",
							/* @__PURE__ */ jsx("strong", { children: "比它更短的子区间" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "[l,k]" }),
							" 与 ",
							/* @__PURE__ */ jsx(M, { children: "[k+1,r]" }),
							" 长度都 ",
							/* @__PURE__ */ jsx(M, { children: "<r-l+1" }),
							"）。所以递推",
							/* @__PURE__ */ jsx("strong", { children: "不能" }),
							"按 ",
							/* @__PURE__ */ jsx(M, { children: "l" }),
							" 或 ",
							/* @__PURE__ */ jsx(M, { children: "r" }),
							" 顺序走，必须",
							/* @__PURE__ */ jsx("strong", { children: "按区间长度由短到长" }),
							"——短的先算好，长的才有得引用。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"区间 DP 把「合并顺序的指数爆炸」压成一张 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 的",
						/* @__PURE__ */ jsx("strong", { children: "三角表" }),
						"：每个连续区间只算一次最优，靠",
						/* @__PURE__ */ jsx("strong", { children: "枚举最后一次合并的分割点" }),
						"把大区间拆成两个更短的、已解的子区间。",
						/* @__PURE__ */ jsx("strong", { children: "「最后一并的代价与分割点无关，恒为区间和」" }),
						"——正是这一条让转移得以成立。"
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
						"用开头的例子（石子 ",
						/* @__PURE__ */ jsx(M, { children: "a=[7,6,5,4]" }),
						"，下标 ",
						/* @__PURE__ */ jsx(M, { children: "1..4" }),
						"）走几步。前缀和 ",
						/* @__PURE__ */ jsx(M, { children: "pre=[0,7,13,18,22]" }),
						"，重点盯住",
						/* @__PURE__ */ jsx("strong", { children: "长度由短到长" }),
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
									/* @__PURE__ */ jsx("b", { children: "对角线（长度 1）。" }),
									" 每堆单独一堆，无需合并：",
									/* @__PURE__ */ jsx(M, { children: "dp[l][l]=0" }),
									"。这是整张三角表的地基。"
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
									/* @__PURE__ */ jsx("b", { children: "长度 2" }),
									"：只有一种分法。",
									/* @__PURE__ */ jsx(M, { children: "dp[1][2]=0+0+\\mathrm{sum}(1,2)=13" }),
									"；同理 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][3]=11" }),
									"、",
									/* @__PURE__ */ jsx(M, { children: "dp[3][4]=9" }),
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
									/* @__PURE__ */ jsx("b", { children: "长度 3" }),
									"，看 ",
									/* @__PURE__ */ jsx(M, { children: "[1,3]" }),
									"（区间和 ",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{sum}=18" }),
									"）：",
									/* @__PURE__ */ jsx(M, { children: "k=1" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][1]+dp[2][3]=0+11=11" }),
									"；",
									/* @__PURE__ */ jsx(M, { children: "k=2" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][2]+dp[3][3]=13+0=13" }),
									"。取小 ",
									/* @__PURE__ */ jsx(M, { children: "11" }),
									"，加 ",
									/* @__PURE__ */ jsx(M, { children: "18" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][3]=29" }),
									"。同理 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][4]=9+15=24" }),
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
									/* @__PURE__ */ jsx("b", { children: "长度 4" }),
									"，看整段 ",
									/* @__PURE__ */ jsx(M, { children: "[1,4]" }),
									"（区间和 ",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{sum}=22" }),
									"）：",
									/* @__PURE__ */ jsx(M, { children: "k=1" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "0+24=24" }),
									"；",
									/* @__PURE__ */ jsx(M, { children: "k=2" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "13+9=22" }),
									"；",
									/* @__PURE__ */ jsx(M, { children: "k=3" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "29+0=29" }),
									"。取小 ",
									/* @__PURE__ */ jsx(M, { children: "22" }),
									"，加 ",
									/* @__PURE__ */ jsx(M, { children: "22" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][4]=44" }),
									"——正是最小合并代价。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示会把三角表",
						/* @__PURE__ */ jsx("strong", { children: "按长度一层层填满" }),
						"，高亮每个 ",
						/* @__PURE__ */ jsx(M, { children: "dp[l][r]" }),
						" 选中的分割点与它的两个子区间来源。改改石子数，看表实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看三角表一层一层长出来 · 枚举分割点、区间和相加"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(StoneMergeDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "为什么按长度递推：填表顺序与复杂度"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"区间 DP 的表是个",
						/* @__PURE__ */ jsx("strong", { children: "上三角" }),
						"（只有 ",
						/* @__PURE__ */ jsx(M, { children: "l\\le r" }),
						" 才是合法区间，下三角空着）。转移 ",
						/* @__PURE__ */ jsx(M, { children: "dp[l][r]" }),
						" 要用 ",
						/* @__PURE__ */ jsx(M, { children: "dp[l][k]" }),
						" 与 ",
						/* @__PURE__ */ jsx(M, { children: "dp[k+1][r]" }),
						"，这两者的",
						/* @__PURE__ */ jsxs("strong", { children: [
							"区间长度都比 ",
							/* @__PURE__ */ jsx(M, { children: "[l,r]" }),
							" 短"
						] }),
						"。 所以只要",
						/* @__PURE__ */ jsx("strong", { children: "先把所有短区间算完" }),
						"，长区间需要的子区间就一定",
						/* @__PURE__ */ jsx("strong", { children: "都已就绪" }),
						"——这就是「外层枚举长度 ",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{len}=2\\ldots n" }),
						"，内层枚举左端点 ",
						/* @__PURE__ */ jsx(M, { children: "l" }),
						"」的由来。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(LengthOrderFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "三角表沿对角线成层：主对角线是长度 1（已知 0），每向右上错一格长度加 1。填表从对角线出发，一层层推向右上角 dp[1][n]。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"数一数计算量：区间长度、左端点合起来约 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 个区间，每个区间还要枚举分割点 ",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						" 个），于是总复杂度 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
						"。 对石子合并的常见数据范围（",
						/* @__PURE__ */ jsx(M, { children: "n\\le" }),
						" 几百）绰绰有余。",
						/* @__PURE__ */ jsx("strong", { children: "三层循环、外层是长度" }),
						"——这是几乎所有区间 DP 的通用骨架，记死它："
					] }), /* @__PURE__ */ jsx("pre", {
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
						children: `for 长度 len = 2 … n:          // ★外层枚举区间长度，由短到长
  for 左端点 l = 1 … n-len+1:
    r = l + len - 1
    for 分割点 k = l … r-1:
      dp[l][r] = min( dp[l][r], dp[l][k] + dp[k+1][r] + sum(l,r) )`
					})]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "一题双问：把 min 换成 max"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"石子合并的经典题（P1880）常常",
							/* @__PURE__ */ jsx("strong", { children: "同时问最小与最大" }),
							"合并代价。好消息是：状态、转移骨架",
							/* @__PURE__ */ jsx("strong", { children: "一字不改" }),
							"——只把那个 ",
							/* @__PURE__ */ jsx(M, { children: "\\min" }),
							" 换成 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							"，就从「最省」翻成「最费」："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp_{\\max}[l][r]=\\max_{l\\le k\\le r-1}\\big(dp_{\\max}[l][k]+dp_{\\max}[k+1][r]\\big)+\\mathrm{sum}(l,r)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"两问共用同一套三层循环，用两张表 ",
							/* @__PURE__ */ jsx(M, { children: "f" }),
							"（最小）、",
							/* @__PURE__ */ jsx(M, { children: "g" }),
							"（最大）并行填即可。下面把二者",
							/* @__PURE__ */ jsx("strong", { children: "并排跑给你看" }),
							"：左边求最小、右边求最大。默认还是 ",
							/* @__PURE__ */ jsx(M, { children: "a=[7,6,5,4]" }),
							"——最小 ",
							/* @__PURE__ */ jsx(M, { children: "44" }),
							"、最大 ",
							/* @__PURE__ */ jsx(M, { children: "53" }),
							"。改改石子数，看两个答案与各自选中的分割点如何分道扬镳。"
						] })
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(StoneMinMaxDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "别忘了：这排石子其实是环",
					children: [
						"P1880 原题里，石子摆成一个",
						/* @__PURE__ */ jsx("strong", { children: "环" }),
						"——第 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 堆与第 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						" 堆也相邻。本页先把它当作",
						/* @__PURE__ */ jsx("strong", { children: "链" }),
						"讲透区间 DP 的内核；处理「环」的通法（",
						/* @__PURE__ */ jsx("strong", { children: "断环为链" }),
						"：复制一倍接成 ",
						/* @__PURE__ */ jsx(M, { children: "2n" }),
						" 长，枚举所有长度为 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 的窗口）留到 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/c/ring",
							style: { color: "var(--accent-2)" },
							children: "环形区间 DP"
						}),
						" 一节专门拆解。链形基底是环形的地基。"
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
					pid: "P1880",
					name: "[NOI1995] 石子合并",
					src: "NOI1995",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 堆石子摆成一",
								/* @__PURE__ */ jsx("strong", { children: "环" }),
								"，每次合并相邻两堆、代价为两堆之和，直到并成一堆。分别求",
								/* @__PURE__ */ jsx("strong", { children: "最小" }),
								"与",
								/* @__PURE__ */ jsx("strong", { children: "最大" }),
								"总代价。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"标准区间 DP：",
								/* @__PURE__ */ jsx(M, { children: "dp[l][r]" }),
								" = 合并 ",
								/* @__PURE__ */ jsx(M, { children: "[l,r]" }),
								" 的最优代价，枚举分割点 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								"，追加代价 = 区间和。",
								/* @__PURE__ */ jsx("strong", { children: "本页的链形 + 一题双问" }),
								"就是它的内核。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "环的处理（下一节展开）",
							children: [
								"断环为链：把石子数组",
								/* @__PURE__ */ jsx("strong", { children: "复制一倍" }),
								"拼成长度 ",
								/* @__PURE__ */ jsx(M, { children: "2n" }),
								"，在其上做链形区间 DP，再取所有长度为 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 的区间 ",
								/* @__PURE__ */ jsx(M, { children: "[i,i+n-1]" }),
								" 里的最优。参考代码先给",
								/* @__PURE__ */ jsx("strong", { children: "链形双问" }),
								"骨架（把 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 换成 ",
								/* @__PURE__ */ jsx(M, { children: "2n" }),
								" 并加一层窗口枚举即得环形）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f/g[l][r]=\\mathrm{opt}(f/g[l][k]+f/g[k+1][r])+\\mathrm{sum}(l,r)" }),
								"，外层长度、内层左端点、最内分割点；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（链形基底 · 双问并行）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1880,
								luogu: "P1880"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P5019",
					name: "[NOIP2018 提高组] 铺设道路",
					src: "NOIP2018 提高组",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"一排 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 段道路，第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 段深度 ",
								/* @__PURE__ */ jsx(M, { children: "d_i" }),
								"。每天可把一段",
								/* @__PURE__ */ jsx("strong", { children: "连续区间" }),
								"的深度整体填平 1。求填平所有段的最少天数。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"较新的 CSP/NOIP 真题，是理解",
								/* @__PURE__ */ jsx("strong", { children: "「区间合并代价」直觉" }),
								"的极佳前菜：把「填平连续区间」这一操作，和石子合并里「合并连续区间」并置——都在",
								/* @__PURE__ */ jsx("strong", { children: "连续段" }),
								"上思考代价。它的最优解可由",
								/* @__PURE__ */ jsx("strong", { children: "差分" }),
								"一眼看穿：只有当前段比前一段",
								/* @__PURE__ */ jsx("strong", { children: "更深" }),
								"时才需新增 ",
								/* @__PURE__ */ jsx(M, { children: "d_i-d_{i-1}" }),
								" 天，累加即答案 ",
								/* @__PURE__ */ jsx(M, { children: "\\sum\\max(0,\\ d_i-d_{i-1})" }),
								"——一个 ",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								" 的贪心/差分，正好反衬石子合并",
								/* @__PURE__ */ jsx("strong", { children: "为何非 DP 不可" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（差分累加）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P5019,
								luogu: "P5019"
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
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1775",
					name: "石子合并（弱化版）",
					hint: "纯链形石子合并模板：石子排成一条链（非环）。前缀和求区间代价，外层枚举长度、内层左端点、最内分割点，dp[1][n] 即答案。把三层循环骨架默写下来。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1043",
					name: "[NOIP2003 普及组] 数字游戏",
					hint: "环形 + 区间 DP：环上分 m 段，各段和对 10 取模后相乘，求最大/最小。断环为链（复制一倍）后，dp[l][r][k] 记「区间 [l,r] 分成 k 段」的最优，转移枚举最后一段的分割点；取模后可能为负，最小值转移别漏负负得正。"
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pointer-cue",
			children: [
				/* @__PURE__ */ jsx(Gamepad2, { size: 18 }),
				"想更直观地感受「合并顺序如何改变总代价」？到 ",
				/* @__PURE__ */ jsx(Link, {
					to: "/part/c",
					style: {
						color: "var(--accent-1)",
						fontWeight: 600
					},
					children: "C 部分页"
				}),
				"的互动里亲手挑一次合并顺序，再看 DP 给出的最优。"
			]
		})
	] });
}
//#endregion
export { StoneMerge as default };
