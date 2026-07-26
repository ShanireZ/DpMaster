import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, MousePointerClick, Plus } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/linear-count/internal.ts
function requireNonNegativeInteger(value, label) {
	if (!Number.isInteger(value) || value < 0) throw new RangeError(`${label} must be a non-negative integer`);
}
function executeStairCount(step, emit) {
	requireNonNegativeInteger(step, "step");
	const counts = Array(step + 1).fill(0);
	counts[0] = 1;
	emit({
		type: "initialized",
		step: 0,
		count: 1
	});
	if (step >= 1) {
		counts[1] = 1;
		emit({
			type: "initialized",
			step: 1,
			count: 1
		});
	}
	for (let current = 2; current <= step; current++) {
		const fromOne = counts[current - 1];
		const fromTwo = counts[current - 2];
		counts[current] = fromOne + fromTwo;
		emit({
			type: "settled",
			step: current,
			fromOne,
			fromTwo,
			count: counts[current]
		});
	}
	return {
		count: counts[step],
		counts
	};
}
function recordStairCount(step) {
	const events = [];
	return {
		result: executeStairCount(step, (event) => events.push(event)),
		events
	};
}
function executeIntegerPartition(total, emit) {
	requireNonNegativeInteger(total, "total");
	const table = Array.from({ length: total + 1 }, () => Array(total + 1).fill(0));
	for (let maximum = 0; maximum <= total; maximum++) table[0][maximum] = 1;
	for (let value = 1; value <= total; value++) for (let maximum = 1; maximum <= total; maximum++) {
		const withoutMaximum = table[value][maximum - 1];
		const canUseMaximum = value >= maximum;
		const withMaximum = canUseMaximum ? table[value - maximum][maximum] : 0;
		table[value][maximum] = withoutMaximum + withMaximum;
		emit({
			type: "settled",
			total: value,
			maximum,
			withoutMaximum,
			withMaximum,
			canUseMaximum,
			count: table[value][maximum]
		});
	}
	return {
		count: table[total][total],
		table
	};
}
function recordIntegerPartition(total) {
	const events = [];
	return {
		result: executeIntegerPartition(total, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/algorithms/linear-count/index.ts
function solveStairCount(step) {
	return executeStairCount(step, ignoreEvents);
}
function solveIntegerPartition(total) {
	return executeIntegerPartition(total, ignoreEvents);
}
//#endregion
//#region src/components/demos/linear/countSolver.ts
function settled(values) {
	const states = {};
	for (let row = 0; row < values.length; row++) for (let column = 0; column < values[row].length; column++) if (values[row][column] !== null) states[key(row, column)] = "settled";
	return states;
}
function stairCount(step) {
	const run = recordStairCount(step);
	const counts = Array(step + 1).fill(null);
	counts[0] = 1;
	if (step >= 1) counts[1] = 1;
	const snap = () => [counts.slice()];
	const frames = [{
		values: snap(),
		states: settled(snap()),
		caption: "<b>地基</b>：<b>f[0]=1</b>（原地站着算一种走法），当 n≥1 时 <b>f[1]=1</b>。",
		formula: step >= 1 ? "f[0]=1,\\ f[1]=1" : "f[0]=1"
	}];
	for (const event of run.events) {
		if (event.type === "initialized") continue;
		counts[event.step] = event.count;
		const states = settled(snap());
		states[key(0, event.step - 1)] = "source";
		states[key(0, event.step - 2)] = "source";
		states[key(0, event.step)] = "current";
		const arrows = [{
			from: {
				r: 0,
				c: event.step - 1
			},
			to: {
				r: 0,
				c: event.step
			},
			kind: "chosen"
		}, {
			from: {
				r: 0,
				c: event.step - 2
			},
			to: {
				r: 0,
				c: event.step
			},
			kind: "chosen"
		}];
		frames.push({
			values: snap(),
			states,
			active: {
				r: 0,
				c: event.step
			},
			arrows,
			caption: `第 <b>${event.step}</b> 级：从前一级的 <b>${event.fromOne}</b> 种加上前两级的 <b>${event.fromTwo}</b> 种，得到 <b>${event.count}</b>。`,
			formula: `f[${event.step}]=${event.fromOne}+${event.fromTwo}=${event.count}`
		});
	}
	const finalStates = settled(snap());
	finalStates[key(0, step)] = "chosen";
	frames.push({
		values: snap(),
		states: finalStates,
		caption: `答案 <b>f[${step}] = ${run.result.count}</b>。`,
		formula: `f[${step}]=${run.result.count}`
	});
	return {
		rows: 1,
		cols: step + 1,
		rowHeaderLabels: ["f"],
		colHeaderLabels: Array.from({ length: step + 1 }, (_, index) => `${index}`),
		frames
	};
}
function integerPartition(total) {
	const run = recordIntegerPartition(total);
	const size = total + 1;
	const table = Array.from({ length: size }, () => Array(size).fill(null));
	for (let maximum = 0; maximum < size; maximum++) table[0][maximum] = 1;
	for (let value = 1; value < size; value++) table[value][0] = 0;
	const snap = () => table.map((row) => row.slice());
	const frames = [{
		values: snap(),
		states: settled(table),
		caption: "<b>地基</b>：第 0 行都是 1；第 0 列除原点外都是 0。其余位置逐格填写。",
		formula: "dp[0][j]=1,\\ dp[i][0]=0\\ (i>0)"
	}];
	for (const event of run.events) {
		const { total: value, maximum } = event;
		table[value][maximum] = event.count;
		const states = settled(table);
		const arrows = [{
			from: {
				r: value,
				c: maximum - 1
			},
			to: {
				r: value,
				c: maximum
			},
			kind: "chosen"
		}];
		states[key(value, maximum - 1)] = "source";
		if (event.canUseMaximum) {
			states[key(value - maximum, maximum)] = event.withMaximum > 0 ? "chosen" : "source";
			arrows.push({
				from: {
					r: value - maximum,
					c: maximum
				},
				to: {
					r: value,
					c: maximum
				},
				kind: "chosen"
			});
		}
		states[key(value, maximum)] = "current";
		const caption = event.canUseMaximum ? `拆 <b>${value}</b> · 最大零件 ≤ <b>${maximum}</b>：不用它有 <b>${event.withoutMaximum}</b> 种，至少用一个有 <b>${event.withMaximum}</b> 种，共 <b>${event.count}</b> 种。` : `拆 <b>${value}</b> 时零件 ${maximum} 太大，只能沿用左边的 <b>${event.count}</b> 种。`;
		const formula = event.canUseMaximum ? `dp[${value}][${maximum}]=${event.withoutMaximum}+${event.withMaximum}=${event.count}` : `dp[${value}][${maximum}]=dp[${value}][${maximum - 1}]=${event.count}`;
		frames.push({
			values: snap(),
			states,
			active: {
				r: value,
				c: maximum
			},
			arrows,
			caption,
			formula
		});
	}
	const finalStates = settled(table);
	finalStates[key(total, total)] = "chosen";
	frames.push({
		values: snap(),
		states: finalStates,
		caption: `答案在右下角 <b>dp[${total}][${total}] = ${run.result.count}</b>。`,
		formula: `dp[${total}][${total}]=${run.result.count}`
	});
	return {
		rows: size,
		cols: size,
		cell: 40,
		rowHeaderLabels: Array.from({ length: size }, (_, index) => `拆${index}`),
		colHeaderLabels: Array.from({ length: size }, (_, index) => `${index}`),
		rowHeaderTitle: "拆 i",
		colHeaderTitle: "≤ j",
		frames
	};
}
//#endregion
//#region src/components/demos/linear/StairCountDemo.tsx
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
/**
* 数楼梯计数演示：一维 f[i]「跳到第 i 级的走法数」，逐格由前两格累加（斐波那契）。
* 每步可跨 1 级或 2 级，f[0]=f[1]=1。台阶数 n ≤ 12（避免大数，看清累加过程）。
*/
function StairCountDemo() {
	const [n, setN] = useState(5);
	const model = useMemo(() => stairCount(n), [n]);
	const answer = useMemo(() => solveStairCount(n).count, [n]);
	const modelKey = `stair-${n}`;
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "kd__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "台阶总数（每步跨 1 或 2 级）"
			}), /* @__PURE__ */ jsx(Stepper$1, {
				label: "n",
				value: n,
				min: 2,
				max: 12,
				onChange: setN
			})] })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"跳到第 ",
				/* @__PURE__ */ jsxs("b", {
					className: "you",
					children: ["n = ", n]
				}),
				" 级的走法数：",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: [
						"f[",
						n,
						"] = ",
						answer
					]
				}),
				/* @__PURE__ */ jsx("span", {
					style: { color: "var(--text-3)" },
					children: "（f[i] = f[i−1] + f[i−2]，即斐波那契）"
				})
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/components/demos/linear/PartitionDemo.tsx
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
* 整数划分二维计数演示：dp[i][j] =「把 i 拆成每个数不超过 j 的方案数」，
* 逐格由 dp[i][j-1]（不用 j）+ dp[i-j][j]（至少用一个 j）累加而来。
* 被拆的数 N ≤ 8（网格 (N+1)×(N+1)，避免过大）。答案在右下角 dp[N][N]。
*/
function PartitionDemo() {
	const [n, setN] = useState(5);
	const model = useMemo(() => integerPartition(n), [n]);
	const answer = useMemo(() => solveIntegerPartition(n).count, [n]);
	const modelKey = `part-${n}`;
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "kd__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "要拆分的自然数"
			}), /* @__PURE__ */ jsx(Stepper, {
				label: "N",
				value: n,
				min: 2,
				max: 8,
				onChange: setN
			})] })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"把 ",
				/* @__PURE__ */ jsxs("b", {
					className: "you",
					children: ["N = ", n]
				}),
				" 拆成若干正整数（无序）的方案数：",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: [
						"dp[",
						n,
						"][",
						n,
						"] = ",
						answer
					]
				}),
				/* @__PURE__ */ jsx("span", {
					style: { color: "var(--text-3)" },
					children: "（行 = 拆的数 i，列 = 允许的最大零件 j）"
				})
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/content/b/LinearCountArt.tsx
function MaxToPlusFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 196",
		role: "img",
		"aria-label": "把转移里的 max 换成加法、f[0] 从 0 换成 1，就从求最优变成数方案",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "mp-ar",
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
				x: "20",
				y: "24",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "同一条链式转移，只换「算子」与「地基」两处："
			}),
			[{
				tag: "最优 DP",
				op: "max",
				base: "f[0]=0",
				out: "最大价值",
				tint: "var(--text-2)"
			}, {
				tag: "计数 DP",
				op: "+",
				base: "f[0]=1",
				out: "方案数",
				tint: "var(--accent-2)"
			}].map((r, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(20,${44 + i * 74})`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "86",
						height: "56",
						rx: "12",
						fill: `color-mix(in srgb, ${r.tint} 12%, var(--surface-3))`,
						stroke: r.tint,
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "43",
						y: "33",
						textAnchor: "middle",
						fontSize: "13",
						fontWeight: "700",
						fill: r.tint,
						children: r.tag
					}),
					/* @__PURE__ */ jsx("path", {
						d: "M106 28 H150",
						stroke: "var(--text-3)",
						strokeWidth: "2",
						markerEnd: "url(#mp-ar)"
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(158,10)",
						children: [
							/* @__PURE__ */ jsx("rect", {
								width: "286",
								height: "36",
								rx: "10",
								fill: "var(--surface-3)",
								stroke: "var(--border-strong)",
								strokeWidth: "1.5"
							}),
							/* @__PURE__ */ jsx("text", {
								x: "16",
								y: "23",
								fontSize: "13.5",
								className: "mono",
								fill: "var(--text-1)",
								children: "f[i] = "
							}),
							/* @__PURE__ */ jsx("rect", {
								x: "66",
								y: "7",
								width: "58",
								height: "22",
								rx: "7",
								fill: "color-mix(in srgb, var(--surface-1) 55%, var(--surface-3))",
								stroke: r.tint,
								strokeWidth: "1.3"
							}),
							/* @__PURE__ */ jsx("text", {
								x: "95",
								y: "23",
								textAnchor: "middle",
								fontSize: "14",
								className: "mono",
								fill: r.tint,
								children: r.op
							}),
							/* @__PURE__ */ jsx("text", {
								x: "134",
								y: "23",
								fontSize: "13",
								className: "mono",
								fill: "var(--text-2)",
								children: "( 前驱, 前驱 )"
							})
						]
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(158,50)",
						children: [
							/* @__PURE__ */ jsx("text", {
								x: "0",
								y: "10",
								fontSize: "11.5",
								fill: "var(--text-3)",
								children: "地基 "
							}),
							/* @__PURE__ */ jsx("text", {
								x: "34",
								y: "10",
								fontSize: "12.5",
								className: "mono",
								fill: r.tint,
								children: r.base
							}),
							/* @__PURE__ */ jsx("text", {
								x: "150",
								y: "10",
								fontSize: "11.5",
								fill: "var(--text-3)",
								children: "→ 读出 "
							}),
							/* @__PURE__ */ jsx("text", {
								x: "196",
								y: "10",
								fontSize: "12.5",
								fill: "var(--text-1)",
								children: r.out
							})
						]
					})
				]
			}, i))
		]
	});
}
function StairCountFigure() {
	const seq = [
		1,
		1,
		2,
		3,
		5,
		8,
		13
	];
	const x0 = 34;
	const dx = 84;
	const cw = 60;
	const ch = 40;
	const cx = (i) => x0 + i * dx;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 236",
		role: "img",
		"aria-label": "数楼梯：f[i]=f[i-1]+f[i-2]，两条来路相加，得到斐波那契数列",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "st-ar",
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
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(58,14)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "150",
						height: "44",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "75",
						y: "19",
						textAnchor: "middle",
						fontSize: "12",
						fill: "var(--text-2)",
						children: "第 i−1 级"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "75",
						y: "36",
						textAnchor: "middle",
						fontSize: "12.5",
						className: "mono",
						fill: "var(--text-1)",
						children: "跨 1 级 →"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(58,74)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "150",
						height: "44",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "75",
						y: "19",
						textAnchor: "middle",
						fontSize: "12",
						fill: "var(--text-2)",
						children: "第 i−2 级"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "75",
						y: "36",
						textAnchor: "middle",
						fontSize: "12.5",
						className: "mono",
						fill: "var(--text-1)",
						children: "跨 2 级 ⇒"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M208 36 L330 58",
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				markerEnd: "url(#st-ar)",
				fill: "none"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M208 96 L330 74",
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				markerEnd: "url(#st-ar)",
				fill: "none"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(334,42)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "216",
						height: "48",
						rx: "14",
						fill: "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))",
						stroke: "var(--accent-2)",
						strokeWidth: "1.6"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "108",
						y: "20",
						textAnchor: "middle",
						fontSize: "12",
						fill: "var(--text-2)",
						children: "第 i 级 · 两路相加"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "108",
						y: "39",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "f[i] = f[i−1] + f[i−2]"
					})
				]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "34",
				y: "150",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "于是 f[0..6] 就长成斐波那契："
			}),
			seq.map((_, i) => /* @__PURE__ */ jsxs("text", {
				x: cx(i) + cw / 2,
				y: "172",
				textAnchor: "middle",
				fontSize: "11",
				className: "mono",
				fill: "var(--text-3)",
				children: [
					"f[",
					i,
					"]"
				]
			}, `h${i}`)),
			seq.map((v, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${cx(i)},182)`,
				children: [/* @__PURE__ */ jsx("rect", {
					width: cw,
					height: ch,
					rx: "10",
					fill: "var(--surface-3)",
					stroke: i >= 5 ? "var(--accent-2)" : "var(--border-strong)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: cw / 2,
					y: 26,
					textAnchor: "middle",
					fontSize: "16",
					className: "mono",
					fill: i >= 5 ? "var(--accent-1)" : "var(--text-1)",
					children: v
				})]
			}, `c${i}`))
		]
	});
}
function PartitionFigure() {
	const CW = 58;
	const CH = 40;
	const cols = 5;
	const rowsShown = 5;
	const gx = (c) => 116 + c * 66;
	const gy = (r) => 30 + r * 48;
	const cur = {
		r: 4,
		c: 2
	};
	const left = {
		r: 4,
		c: 1
	};
	const up = {
		r: 1,
		c: 2
	};
	const cells = [];
	for (let r = 0; r < rowsShown; r++) for (let c = 0; c < cols; c++) cells.push({
		r,
		c
	});
	const kind = (r, c) => {
		if (r === cur.r && c === cur.c) return "cur";
		if (r === left.r && c === left.c) return "left";
		if (r === up.r && c === up.c) return "up";
		return "idle";
	};
	const fill = (k) => k === "cur" ? "color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))" : k === "left" || k === "up" ? "color-mix(in srgb, var(--viz-chosen) 15%, var(--surface-3))" : "var(--surface-3)";
	const stroke = (k) => k === "cur" ? "var(--viz-current)" : k === "left" || k === "up" ? "var(--viz-chosen)" : "var(--border-strong)";
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 320",
		role: "img",
		"aria-label": "整数划分二维转移：当前格由左邻与上方 i-j 行两个来源相加",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "pt-ar",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--viz-chosen)"
				})
			}) }),
			/* @__PURE__ */ jsx("text", {
				x: "60",
				y: "24",
				fontSize: "11",
				fill: "var(--text-3)",
				children: "拆 i ＼ ≤ j"
			}),
			Array.from({ length: cols }, (_, c) => /* @__PURE__ */ jsx("text", {
				x: gx(c) + CW / 2,
				y: "24",
				textAnchor: "middle",
				fontSize: "11",
				className: "mono",
				fill: "var(--text-3)",
				children: c + 1
			}, `ch${c}`)),
			Array.from({ length: rowsShown }, (_, r) => /* @__PURE__ */ jsx("text", {
				x: "96",
				y: gy(r) + CH / 2 + 4,
				textAnchor: "end",
				fontSize: "11",
				className: "mono",
				fill: "var(--text-3)",
				children: r + 1
			}, `rh${r}`)),
			cells.map(({ r, c }, i) => {
				const k = kind(r, c);
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${gx(c)},${gy(r)})`,
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: CW,
							height: CH,
							rx: "9",
							fill: fill(k),
							stroke: stroke(k),
							strokeWidth: "1.5"
						}),
						k === "cur" && /* @__PURE__ */ jsx("text", {
							x: CW / 2,
							y: 25,
							textAnchor: "middle",
							fontSize: "12.5",
							className: "mono",
							fill: "var(--viz-current)",
							children: "dp[5][3]"
						}),
						k === "left" && /* @__PURE__ */ jsx("text", {
							x: CW / 2,
							y: 25,
							textAnchor: "middle",
							fontSize: "11",
							className: "mono",
							fill: "var(--viz-chosen)",
							children: "不用 3"
						}),
						k === "up" && /* @__PURE__ */ jsx("text", {
							x: CW / 2,
							y: 25,
							textAnchor: "middle",
							fontSize: "11",
							className: "mono",
							fill: "var(--viz-chosen)",
							children: "用一个 3"
						})
					]
				}, i);
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M ${gx(left.c) + CW} ${gy(left.r) + CH / 2} H ${gx(cur.c) - 2}`,
				stroke: "var(--viz-chosen)",
				strokeWidth: "2",
				markerEnd: "url(#pt-ar)",
				fill: "none"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M ${gx(up.c) + CW / 2} ${gy(up.r) + CH} V ${gy(cur.r) - 2}`,
				stroke: "var(--viz-chosen)",
				strokeWidth: "2",
				markerEnd: "url(#pt-ar)",
				fill: "none"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(80,286)",
				children: [/* @__PURE__ */ jsx("text", {
					x: "0",
					y: "0",
					fontSize: "13",
					className: "mono",
					fill: "var(--text-1)",
					children: "dp[i][j] = dp[i][j−1] + dp[i−j][j]"
				}), /* @__PURE__ */ jsx("text", {
					x: "0",
					y: "20",
					fontSize: "11.5",
					fill: "var(--text-3)",
					children: "左邻 = 完全不用 j 的方案；上方 i−j 行 = 至少用一个 j 的方案。两类不重不漏。"
				})]
			})
		]
	});
}
//#endregion
//#region src/content/b/LinearCount.tsx
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
var CODE_P1255 = `
#include <iostream>
#include <cstring>
using namespace std;

// 数楼梯：f[i] = f[i-1] + f[i-2]，n≤5000 时结果远超 long long，必须高精度。
// 用 int 数组逆序存每一位（下标 0 = 个位），f[i] 由 f[i-1] + f[i-2] 逐位进位得到。
int n;
int a[5005][2005];               // a[i]：第 i 级走法数的高精度表示，a[i][0]=位数

void add(int *c, int *x, int *y)  // c = x + y（高精度加）
{
    int len = max(x[0], y[0]);
    for (int i = 1; i <= len; i++)
    {
        c[i] += x[i] + y[i];
        c[i + 1] += c[i] / 10;    // 进位
        c[i] %= 10;
    }
    if (c[len + 1] > 0)
    {
        len++;
    }
    c[0] = len;                   // 记录位数
}

int main()
{
    cin >> n;
    a[0][0] = 1; a[0][1] = 1;     // f[0] = 1
    a[1][0] = 1; a[1][1] = 1;     // f[1] = 1
    for (int i = 2; i <= n; i++)
    {
        add(a[i], a[i - 1], a[i - 2]);
    }

    for (int i = a[n][0]; i >= 1; i--) // 逆序输出每一位
    {
        cout << a[n][i];
    }
    cout << endl;
    return 0;
}
// TAG: 线性DP 计数 斐波那契 高精度`;
var CODE_P1077 = `
#include <iostream>
using namespace std;

const int MOD = 1000007;
int n, m, a[105];
int f[105][105];                 // f[i][j]：前 i 种花恰好摆 j 盆的方案数

int main()
{
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
    }

    for (int j = 0; j <= m; j++)     // 0 种花只有「摆 0 盆」1 种；j>0 无解
    {
        f[0][j] = (j == 0) ? 1 : 0;
    }

    for (int i = 1; i <= n; i++)
    {
        for (int j = 0; j <= m; j++)
        {
            for (int k = 0; k <= a[i] && k <= j; k++) // 第 i 种取 k 盆
            {
                f[i][j] = (f[i][j] + f[i - 1][j - k]) % MOD;
            }
        }
    }

    cout << f[n][m] << endl;
    return 0;
}
// TAG: 线性DP 有界计数 摆花 取模`;
var CODE_P2401 = `
#include <iostream>
using namespace std;

const int MOD = 2015;
int n, k;
int f[1005][1005];               // f[i][j]：1..i 的排列中恰有 j 处 a[t]<a[t+1] 的方案数

int main()
{
    cin >> n >> k;
    f[1][0] = 1;                     // 单个数：0 处上升

    for (int i = 2; i <= n; i++)     // 把新数 i 逐个插进已有排列
    {
        for (int j = 0; j < i; j++)
        {
            // 插进原有 j 个「上升位」之一或末尾（共 j+1 处）→ 上升数不变
            long long same = (long long)f[i - 1][j] * (j + 1);
            // 插进其余位置 → 新增一个上升位 → 由 j-1 处上升转来（j=0 时无此项）
            long long grow = (j > 0) ? (long long)f[i - 1][j - 1] * (i - j) : 0;
            f[i][j] = (same + grow) % MOD;
        }
    }

    cout << f[n][k] << endl;
    return 0;
}
// TAG: 线性DP 逐个插入 排列计数 不等数列`;
function LinearCount() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "换个问题：不求「最好」，改数「多少种」"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"前面几类线性 DP 都在问同一句话——",
						/* @__PURE__ */ jsx("strong", { children: "最优是多少" }),
						"：最长的子序列、最大的子段和、代价最小的对齐。 所以它们的转移里都坐着一个 ",
						/* @__PURE__ */ jsx(M, { children: "\\max" }),
						"（或 ",
						/* @__PURE__ */ jsx(M, { children: "\\min" }),
						"）。可现实里的问题未必都求极值： 「上 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 级楼梯，每步跨 1 或 2 级，",
						/* @__PURE__ */ jsx("strong", { children: "有多少种" }),
						"走法？」「把 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 拆成若干正整数，",
						/* @__PURE__ */ jsx("strong", { children: "有几种" }),
						"拆法？」 答案不再是一个「最好的值」，而是一个",
						/* @__PURE__ */ jsx("strong", { children: "计数" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(MaxToPlusFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "同一条链式转移，从「最优 DP」翻面成「计数 DP」只动两处：中间的算子 max → +，地基 f[0] 从 0 → 1。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"关键洞察小到出乎意料：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"把转移里的 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							" 换成加法 ",
							/* @__PURE__ */ jsx(M, { children: "+" })
						] }),
						"，DP 就从「记录最优」变成「累计方案」。 道理在于 DP 的两大要件恰好都适配计数——",
						/* @__PURE__ */ jsx("strong", { children: "最优子结构" }),
						"变成「大问题的方案由子问题的方案拼成」，",
						/* @__PURE__ */ jsx("strong", { children: "无后效性" }),
						"保证「不同来路拼出的方案互不重复」。于是原来在若干候选里挑最大的那一步，现在变成把若干候选的方案数",
						/* @__PURE__ */ jsx("strong", { children: "全部加起来" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"先用一个极小的例子热身。上 ",
						/* @__PURE__ */ jsx(M, { children: "3" }),
						" 级台阶：走法有 ",
						/* @__PURE__ */ jsx(M, { children: "1{+}1{+}1" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "1{+}2" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "2{+}1" }),
						" 三种。 若这是最优题，我们会问「最少几步」（答案 2 步）；而这里问「几种走法」，答案是 ",
						/* @__PURE__ */ jsx("strong", { children: "3" }),
						"——同一个状态骨架，读出的东西完全不同。 这一节就把计数型线性 DP 讲透：先是",
						/* @__PURE__ */ jsx("strong", { children: "数楼梯" }),
						"（一维斐波那契计数），再深入",
						/* @__PURE__ */ jsx("strong", { children: "整数划分" }),
						"（二维计数），最后点一句",
						/* @__PURE__ */ jsx("strong", { children: "高精度" }),
						"这个计数题的老搭档。"
					] })]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "数楼梯：f[i] = f[i−1] + f[i−2]"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"设 ",
							/* @__PURE__ */ jsx(M, { children: "f[i]" }),
							" 表示",
							/* @__PURE__ */ jsxs("strong", { children: [
								"跳到第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 级台阶的不同走法数"
							] }),
							"。怎么递推？盯住",
							/* @__PURE__ */ jsx("strong", { children: "最后一步" }),
							"： 站在第 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 级，上一步只可能来自两处——从第 ",
							/* @__PURE__ */ jsx(M, { children: "i-1" }),
							" 级",
							/* @__PURE__ */ jsx("strong", { children: "跨 1 级" }),
							"上来，或从第 ",
							/* @__PURE__ */ jsx(M, { children: "i-2" }),
							" 级",
							/* @__PURE__ */ jsx("strong", { children: "跨 2 级" }),
							"上来。 这两类走法",
							/* @__PURE__ */ jsx("strong", { children: "不重不漏" }),
							"（最后一步的跨度不同，绝不会数成同一种），于是把两边的方案数",
							/* @__PURE__ */ jsx("strong", { children: "相加" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[i]=f[i-1]+f[i-2]" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"地基要撒对：",
							/* @__PURE__ */ jsx(M, { children: "f[0]=1" }),
							"——「还没上台阶、原地站着」本身算",
							/* @__PURE__ */ jsx("strong", { children: "一种" }),
							"走法（这颗 1 是所有计数的种子）；",
							/* @__PURE__ */ jsx(M, { children: "f[1]=1" }),
							"——到第 1 级只有「跨 1 级」一种。 往后每格都是前两格之和，于是 ",
							/* @__PURE__ */ jsx(M, { children: "f" }),
							" 长成 ",
							/* @__PURE__ */ jsx(M, { children: "1,1,2,3,5,8,13,\\dots" }),
							"——正是",
							/* @__PURE__ */ jsx("strong", { children: "斐波那契数列" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(StairCountFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "到第 i 级的两条来路（跨 1 级 / 跨 2 级）方案数相加；底部条带即 f[0..6]=1,1,2,3,5,8,13，斐波那契。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"这套「最后一步从哪来、把各来源方案数相加」的思路是计数 DP 的通法。换个场景就成了",
						/* @__PURE__ */ jsx("strong", { children: "有界计数" }),
						"：如果每步能跨 ",
						/* @__PURE__ */ jsx(M, { children: "1\\sim K" }),
						" 级， 转移就扩成一段区间求和 ",
						/* @__PURE__ */ jsx(M, { children: "f[i]=\\sum_{t=1}^{K} f[i-t]" }),
						"；如果每种「零件」还带件数上限，就是下面例题 ",
						/* @__PURE__ */ jsx("strong", { children: "P1077 摆花" }),
						" 那样的",
						/* @__PURE__ */ jsx("strong", { children: "有限件计数" }),
						"。 把这类「枚举本步取什么、累加各分支」的骨架写成中文伪代码："
					] }), /* @__PURE__ */ jsx("pre", {
						className: "mono",
						style: preMono,
						children: `# 一维计数（数楼梯 / 有界跳跃）
f[0] = 1                       # 地基：空走法算 1 种
for i = 1 to n:
    f[i] = 0
    for t = 1 to K:            # 最后一步跨 t 级（数楼梯 K=2）
        if i - t >= 0:
            f[i] += f[i - t]   # ★把 max 换成累加

# 有限件计数（第 i 种零件最多取 c 个，摆花即此形）
for i = 1 to n:
    for j = 0 to m:
        for k = 0 to min(c_i, j):
            g[i][j] += g[i-1][j-k]`
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质 · 算子决定问题，骨架不动",
					children: [
						"计数 DP 和最优 DP 共用同一副",
						/* @__PURE__ */ jsx("strong", { children: "状态与转移骨架" }),
						"——「最后一步从哪来」这套拆分毫不改变；变的只是",
						/* @__PURE__ */ jsx("strong", { children: "如何聚合各来源" }),
						"： 最优用 ",
						/* @__PURE__ */ jsx(M, { children: "\\max" }),
						" 挑一个，计数用 ",
						/* @__PURE__ */ jsx(M, { children: "+" }),
						" 全加起来。两处硬改动记死：",
						/* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsx(M, { children: "\\max\\to +" }) }),
						"、",
						/* @__PURE__ */ jsxs("strong", { children: ["地基 ", /* @__PURE__ */ jsx(M, { children: "f[0]=1" })] }),
						"（空方案是唯一的起点火种）。 这与 A 部分的 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/variant",
							style: { color: "var(--accent-2)" },
							children: "背包综合变形"
						}),
						"是同一个道理——那里也是把背包转移的 ",
						/* @__PURE__ */ jsx(M, { children: "\\max" }),
						" 换成 ",
						/* @__PURE__ */ jsx(M, { children: "+" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "f[0]=1" }),
						"，就从「最大价值」变「凑数的方案数」。"
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
						"用 ",
						/* @__PURE__ */ jsx(M, { children: "n=5" }),
						" 走一遍（每步跨 1 或 2 级），把方程跑起来，手上先猜答案该是 ",
						/* @__PURE__ */ jsx("strong", { children: "8" }),
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
									/* @__PURE__ */ jsx("b", { children: "撒地基。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "f[0]=1" }),
									"（原地不动算 1 种）、",
									/* @__PURE__ */ jsx(M, { children: "f[1]=1" }),
									"（到第 1 级只能跨 1 级）。这两粒种子是整条数列的起点。"
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
									/* @__PURE__ */ jsx("b", { children: "第 2、3 级。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "f[2]=f[1]+f[0]=1+1=2" }),
									"（走法 ",
									/* @__PURE__ */ jsx(M, { children: "1{+}1" }),
									" 与 ",
									/* @__PURE__ */ jsx(M, { children: "2" }),
									"）；",
									/* @__PURE__ */ jsx(M, { children: "f[3]=f[2]+f[1]=2+1=3" }),
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
									/* @__PURE__ */ jsx("b", { children: "第 4 级。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "f[4]=f[3]+f[2]=3+2=5" }),
									"——从第 3 级跨 1 级来的 3 种，加上从第 2 级跨 2 级来的 2 种。"
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
									/* @__PURE__ */ jsx("b", { children: "第 5 级。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "f[5]=f[4]+f[3]=5+3=8" }),
									"——正是 ",
									/* @__PURE__ */ jsx("strong", { children: "8" }),
									" 种，和开头猜的吻合。数列到此是 ",
									/* @__PURE__ */ jsx(M, { children: "1,1,2,3,5,8" }),
									"。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把 ",
						/* @__PURE__ */ jsx(M, { children: "f[i]" }),
						" ",
						/* @__PURE__ */ jsx("strong", { children: "逐格累加" }),
						"给你看，高亮每一格由前两格（",
						/* @__PURE__ */ jsx(M, { children: "f[i-1]" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "f[i-2]" }),
						"）相加而来。改台阶数 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						"，看走法数实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看走法数一格一格叠出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(StairCountDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化 · 整数划分：二维计数 dp[i][j]"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"数楼梯是一维计数。再上一层——",
							/* @__PURE__ */ jsx("strong", { children: "整数划分" }),
							"：把正整数 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 写成",
							/* @__PURE__ */ jsx("strong", { children: "若干正整数之和" }),
							"（无序，",
							/* @__PURE__ */ jsx(M, { children: "3{+}2" }),
							" 与 ",
							/* @__PURE__ */ jsx(M, { children: "2{+}3" }),
							" 算同一种），问共有多少种拆法。 比如 ",
							/* @__PURE__ */ jsx(M, { children: "5" }),
							" 有 ",
							/* @__PURE__ */ jsx("strong", { children: "7" }),
							" 种：",
							/* @__PURE__ */ jsx(M, { children: "5;\\ 4{+}1;\\ 3{+}2;\\ 3{+}1{+}1;\\ 2{+}2{+}1;\\ 2{+}1{+}1{+}1;\\ 1{+}1{+}1{+}1{+}1" }),
							"。 难点在「无序」：直接枚举会把 ",
							/* @__PURE__ */ jsx(M, { children: "3{+}2" }),
							" 和 ",
							/* @__PURE__ */ jsx(M, { children: "2{+}3" }),
							" 数两遍。破法是",
							/* @__PURE__ */ jsx("strong", { children: "再加一维限制零件的大小" }),
							"，逼拆分只按「从大到小」这一种写法出现。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"设 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
							" 表示",
							/* @__PURE__ */ jsxs("strong", { children: [
								"把 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 拆成若干正整数、且每个数都不超过 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 的方案数"
							] }),
							"。对「最大能用的零件 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							"」分两类："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i][j]=dp[i][j-1]+dp[i-j][j]" }),
						/* @__PURE__ */ jsx("p", {
							className: "mono",
							style: {
								fontSize: "13px",
								color: "var(--text-3)",
								margin: "calc(-1 * var(--sp-2)) 0 var(--sp-3)"
							},
							children: "左项 dp[i][j−1] = 完全不用 j · 右项 dp[i−j][j] = 至少用一个 j"
						}),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsxs("strong", { children: ["不用 ", /* @__PURE__ */ jsx(M, { children: "j" })] }),
							"：那能用的数就收窄到 ",
							/* @__PURE__ */ jsx(M, { children: "\\le j-1" }),
							"，方案数正是 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i][j-1]" }),
							"。",
							/* @__PURE__ */ jsxs("strong", { children: ["至少用一个 ", /* @__PURE__ */ jsx(M, { children: "j" })] }),
							"：先拿掉一个 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							"， 剩下的 ",
							/* @__PURE__ */ jsx(M, { children: "i-j" }),
							" 仍可继续用 ",
							/* @__PURE__ */ jsx(M, { children: "\\le j" }),
							" 的数去拆（可以再用 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							"），方案数是 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i-j][j]" }),
							"。两类",
							/* @__PURE__ */ jsx("strong", { children: "不重不漏" }),
							"，相加即得。 边界 ",
							/* @__PURE__ */ jsx(M, { children: "dp[0][j]=1" }),
							"（把 0 拆开只有「空拆分」一种）。答案 ",
							/* @__PURE__ */ jsx(M, { children: "dp[n][n]" }),
							"（零件不限大小）。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(PartitionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "dp[5][3] 由两个来源相加：左邻 dp[5][2]（完全不用 3）＋ 上方 dp[2][3]（先扣一个 3，余 2 再拆）。二维网格逐格填。"
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱 · 计数题常爆 long long，数楼梯更要高精度",
					children: [
						"方案数增长极快，随手用 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{int}" }),
						" 会溢出——",
						/* @__PURE__ */ jsxs("strong", { children: ["计数一律先想 ", /* @__PURE__ */ jsx(M, { children: "\\texttt{long long}" })] }),
						"；题目要求取模的（如摆花 ",
						/* @__PURE__ */ jsx(M, { children: "\\bmod\\ 1000007" }),
						"）则每步累加后立刻取模。 更极端的是",
						/* @__PURE__ */ jsx("strong", { children: "数楼梯" }),
						"（例题 P1255）：",
						/* @__PURE__ */ jsx(M, { children: "n\\le 5000" }),
						" 时 ",
						/* @__PURE__ */ jsx(M, { children: "f[n]" }),
						" 有上千位，连 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{long long}" }),
						" 也远远装不下，必须写",
						/* @__PURE__ */ jsx("strong", { children: "高精度" }),
						"（用数组逐位存、逐位进位相加）。 「计数 DP + 高精度」是一对常见搭档，见到「求方案数且 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 很大又不取模」就该警觉。"
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把整数划分的",
						/* @__PURE__ */ jsxs("strong", { children: ["二维表 ", /* @__PURE__ */ jsx(M, { children: "dp[i][j]" })] }),
						"逐格填出来（行 = 拆的数 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						"，列 = 允许的最大零件 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						"），高亮每格的左邻与上方两个来源。改 ",
						/* @__PURE__ */ jsx(M, { children: "N" }),
						" 看方案数实时重算——",
						/* @__PURE__ */ jsx(M, { children: "N=5" }),
						" 时右下角正是 ",
						/* @__PURE__ */ jsx("strong", { children: "7" }),
						"。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看整数划分的二维表填满"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(PartitionDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "例题"
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1255",
					name: "数楼梯",
					src: "洛谷原生",
					diff: "普及-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"一共 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 级楼梯，每步可跨 ",
								/* @__PURE__ */ jsx("strong", { children: "1 级或 2 级" }),
								"，求走到第 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 级的不同走法总数（",
								/* @__PURE__ */ jsx(M, { children: "n\\le 5000" }),
								"）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "状态 · 转移",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[i]" }),
								" = 到第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 级的走法数，",
								/* @__PURE__ */ jsx(M, { children: "f[i]=f[i-1]+f[i-2]" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "f[0]=f[1]=1" }),
								"。就是斐波那契。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"「计数 DP」与「",
								/* @__PURE__ */ jsx("strong", { children: "高精度" }),
								"」的双料入门。递推本身一行写完，真正的门槛在 ",
								/* @__PURE__ */ jsx(M, { children: "n=5000" }),
								" 时 ",
								/* @__PURE__ */ jsx(M, { children: "f[n]" }),
								" 上千位、",
								/* @__PURE__ */ jsx(M, { children: "\\texttt{long long}" }),
								" 彻底爆掉——逼你把方案数用",
								/* @__PURE__ */ jsx("strong", { children: "数组逐位相加" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "陷阱 · 复杂度",
							children: [
								"必须高精度加法（逐位进位）；下标从 0 起对齐 ",
								/* @__PURE__ */ jsx(M, { children: "f[0]=1" }),
								"。时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n\\cdot L)" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "L" }),
								" 为位数）。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（高精度斐波那契）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1255,
								luogu: "P1255"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1077",
					name: "[NOIP2012 普及组] 摆花",
					src: "NOIP2012 普及",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 种花，第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 种最多摆 ",
								/* @__PURE__ */ jsx(M, { children: "a_i" }),
								" 盆，一共要摆",
								/* @__PURE__ */ jsxs("strong", { children: [
									"恰好 ",
									/* @__PURE__ */ jsx(M, { children: "m" }),
									" 盆"
								] }),
								"（同种花无区别、顺序固定），求方案数 ",
								/* @__PURE__ */ jsx(M, { children: "\\bmod\\ 1000007" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								/* @__PURE__ */ jsx("strong", { children: "有限件计数背包" }),
								"：把「第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 种花取 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 盆（",
								/* @__PURE__ */ jsx(M, { children: "0\\le k\\le a_i" }),
								"）」当决策，",
								/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
								" = 前 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 种恰摆 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 盆的方案数，",
								/* @__PURE__ */ jsx(M, { children: "f[0][0]=1" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[i][j]=\\sum_{k=0}^{\\min(a_i,j)} f[i-1][j-k]" }),
								"，答案 ",
								/* @__PURE__ */ jsx(M, { children: "f[n][m]" }),
								"；朴素 ",
								/* @__PURE__ */ jsx(M, { children: "O(nm\\bar a)" }),
								"，对「枚举本种取几盆」那层可用",
								/* @__PURE__ */ jsx("strong", { children: "前缀和" }),
								"优化掉一维到 ",
								/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（有界计数 + 取模）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1077,
								luogu: "P1077"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2401",
					name: "不等数列",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"把 ",
								/* @__PURE__ */ jsx(M, { children: "1\\sim n" }),
								" 填成一个排列，在相邻两数间填 ",
								/* @__PURE__ */ jsx(M, { children: "<" }),
								" 或 ",
								/* @__PURE__ */ jsx(M, { children: ">" }),
								"，求恰好有 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 个 ",
								/* @__PURE__ */ jsx(M, { children: "<" }),
								" 的排列数 ",
								/* @__PURE__ */ jsx(M, { children: "\\bmod\\ 2015" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								/* @__PURE__ */ jsx("strong", { children: "逐个插入的排列计数" }),
								"范式：把最大的数 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 逐个插进已有排列，按「插入位置是否新增一个上升」建 ",
								/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
								"。它与练习 ",
								/* @__PURE__ */ jsx("strong", { children: "P2513 逆序对数列" }),
								"同源，是「增量插入 + 贡献计数」的样板。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "dp[i][j]=dp[i-1][j]\\cdot(j+1)+dp[i-1][j-1]\\cdot(i-1-(j-1))" }),
								"：插进已有上升位（含末尾，共 ",
								/* @__PURE__ */ jsx(M, { children: "j+1" }),
								" 处）上升数不变；插进其余位置新增一个上升。答案 ",
								/* @__PURE__ */ jsx(M, { children: "dp[n][k]" }),
								"，时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（逐个插入 · 排列计数）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2401,
								luogu: "P2401"
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
					pid: "P2513",
					name: "[HAOI2009] 逆序对数列",
					hint: "逐位插入 + 前缀和优化：dp[i][j] = 用 1..i 构成、恰有 j 个逆序对的排列数。把第 i 个数插进已有排列的某位会新增 0..i-1 个逆序对，故 dp[i][j] = Σ dp[i-1][j-t]（t=0..i-1），这段区间和用前缀和 O(1) 取，总复杂度 O(n·k)。与例题 P2401 同源。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1057",
					name: "[NOIP2008 普及组] 传球游戏",
					hint: "环上方案计数递推：f[i][j] = 传了 i 次后球在第 j 人手里的方案数，j 只能由左右两个邻居传来 → f[i][j] = f[i-1][j-1] + f[i-1][j+1]（下标按 n 个人的环取模）。起点 f[0][1]=1，答案 f[m][1]。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2404",
					name: "自然数的拆分问题",
					hint: "整数划分枚举 / 计数：把 n 拆成若干正整数之和（无序），本页二维 dp[i][j] 思路直接套用；本题还要求按字典序输出每种拆分，用 DFS 枚举「当前零件不小于上一个」即可，计数则读 dp[n][n]。"
				})
			]
		})
	] });
}
//#endregion
export { LinearCount as default };
