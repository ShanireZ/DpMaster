import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, MousePointerClick, Plus, RefreshCw, RotateCcw, Sparkles, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/max-subarray/internal.ts
function executeSubarray(values, objective, emit) {
	for (const value of values) if (!Number.isFinite(value)) throw new RangeError("subarray values must be finite");
	if (values.length === 0) return {
		sum: 0,
		start: null,
		end: null,
		sums: [],
		starts: []
	};
	const sums = Array(values.length);
	const starts = Array(values.length);
	let best = objective === "max" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
	let bestStart = 0;
	let bestEnd = 0;
	for (let index = 0; index < values.length; index++) {
		const fresh = values[index];
		const continuation = index === 0 ? fresh : sums[index - 1] + fresh;
		const continued = index > 0 && (objective === "max" ? continuation >= fresh : continuation <= fresh);
		sums[index] = continued ? continuation : fresh;
		starts[index] = continued ? starts[index - 1] : index;
		if (objective === "max" ? sums[index] > best : sums[index] < best) {
			best = sums[index];
			bestStart = starts[index];
			bestEnd = index;
		}
		emit({
			type: "settled",
			objective,
			index,
			value: fresh,
			continuation,
			fresh,
			sum: sums[index],
			continued,
			segmentStart: starts[index],
			best,
			bestStart,
			bestEnd
		});
	}
	return {
		sum: best,
		start: bestStart,
		end: bestEnd,
		sums,
		starts
	};
}
function recordSubarray(values, objective) {
	const events = [];
	return {
		result: executeSubarray(values, objective, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/algorithms/max-subarray/index.ts
function solveMaxSubarray(values) {
	return executeSubarray(values, "max", ignoreEvents);
}
function solveMinSubarray(values) {
	return executeSubarray(values, "min", ignoreEvents);
}
//#endregion
//#region src/components/demos/linear/maxsegSolver.ts
function subarrayModel(values, objective) {
	const run = recordSubarray(values, objective);
	const row = Array(values.length).fill(null);
	const snap = () => [values.slice(), row.slice()];
	const settled = () => {
		const states = {};
		for (let column = 0; column < values.length; column++) states[key(0, column)] = "settled";
		for (let column = 0; column < values.length; column++) if (row[column] !== null) states[key(1, column)] = "settled";
		return states;
	};
	const maximum = objective === "max";
	const name = maximum ? "dp" : "mn";
	const frames = [{
		values: snap(),
		states: settled(),
		caption: maximum ? "上排是原数组 <b>a[]</b>（只读参照），下排 <b>dp[i]</b> 表示「<b>以 a[i] 结尾</b>的最大子段和」。每一步在接续与另起之间取较大者。" : "同一套 Kadane，只把 <b>max 换成 min</b>：mn[i] 是「以 a[i] 结尾的<b>最小</b>子段和」。",
		formula: maximum ? "dp[i]=\\max(dp[i-1]+a_i,\\ a_i)" : "mn[i]=\\min(mn[i-1]+a_i,\\ a_i)"
	}];
	for (const event of run.events) {
		const index = event.index;
		row[index] = event.sum;
		const states = settled();
		states[key(0, index)] = "current";
		states[key(1, index)] = "current";
		const arrows = [];
		if (index > 0) {
			states[key(1, index - 1)] = event.continued ? "chosen" : "source";
			arrows.push({
				from: {
					r: 1,
					c: index - 1
				},
				to: {
					r: 1,
					c: index
				},
				kind: event.continued ? "chosen" : "source"
			});
		}
		const caption = index === 0 ? `起点 <b>i=0</b>：${name}[0] = a[0] = <b>${event.fresh}</b>。` : `i=${index}：接续 ${name}[${index - 1}]+a[${index}] = <b>${event.continuation}</b>，另起 a[${index}] = <b>${event.fresh}</b>，取<b>${maximum ? "较大" : "较小"}</b> → ${name}[${index}]=<b>${event.sum}</b>。`;
		const formula = index === 0 ? `${name}[0]=${event.fresh}` : `${name}[${index}]=${maximum ? "\\max" : "\\min"}(${event.continuation},\\ ${event.fresh})=${event.sum}`;
		frames.push({
			values: snap(),
			states,
			active: {
				r: 1,
				c: index
			},
			arrows,
			caption,
			formula
		});
	}
	const finalStates = settled();
	if (run.result.end !== null) finalStates[key(1, run.result.end)] = maximum ? "chosen" : "invalid";
	const total = values.reduce((sum, value) => sum + value, 0);
	frames.push({
		values: snap(),
		states: finalStates,
		caption: maximum ? `扫完。答案是 dp[] 里的<b>最大值</b>：<b>${run.result.sum}</b>${run.result.end === null ? "" : `（在 i=${run.result.end} 处结尾）`}。` : `最小子段和 = <b>${run.result.sum}</b>${run.result.end === null ? "" : `（i=${run.result.end} 处结尾）`}。总和 = ${total}，绕首尾的候选值 = <b>${total - run.result.sum}</b>。`,
		formula: maximum ? `\\text{ans}=\\max_i dp[i]=${run.result.sum}` : `\\text{total}-\\min_i mn[i]=${total}-(${run.result.sum})=${total - run.result.sum}`
	});
	return {
		rows: 2,
		cols: values.length,
		cell: 46,
		rowHeaderLabels: ["a", name],
		colHeaderLabels: Array.from({ length: values.length }, (_, index) => `${index}`),
		frames
	};
}
function kadane(values) {
	return subarrayModel(values, "max");
}
function kadaneAnswer(values) {
	return solveMaxSubarray(values).sum;
}
function minSegAnswer(values) {
	return solveMinSubarray(values).sum;
}
function minSegViz(values) {
	return subarrayModel(values, "min");
}
//#endregion
//#region src/components/demos/linear/MaxSubarrayDemo.tsx
/** 单个数值的增减控件（允许负数）。 */
function NumStepper$1({ value, min, max, onChange }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "stepper__row",
		children: [
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value - 1),
				disabled: value <= min,
				"aria-label": "减",
				children: /* @__PURE__ */ jsx(Minus, { size: 13 })
			}),
			/* @__PURE__ */ jsx("span", {
				className: "stepper__val",
				children: value
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value + 1),
				disabled: value >= max,
				"aria-label": "加",
				children: /* @__PURE__ */ jsx(Plus, { size: 13 })
			})
		]
	});
}
var PRESETS$1 = [
	{
		label: "含负数（默认）",
		a: [
			-2,
			11,
			-4,
			13,
			-5,
			-2
		]
	},
	{
		label: "经典混合",
		a: [
			4,
			-1,
			2,
			1,
			-5,
			4
		]
	},
	{
		label: "全负（答案取最大的单个）",
		a: [
			-3,
			-1,
			-4,
			-1,
			-5
		]
	}
];
/**
* Kadane 主演示：一维 dp[i]=max(dp[i-1]+a[i], a[i])，逐帧高亮「接续 vs 另起」并追踪全局最大。
* 上行 a[]（可编辑，含负数），下行 dp[]。数组长度 3–8，元素范围 −9..14。
*/
function MaxSubarrayDemo() {
	const [a, setA] = useState([
		-2,
		11,
		-4,
		13,
		-5,
		-2
	]);
	const model = useMemo(() => kadane(a), [a]);
	const answer = useMemo(() => kadaneAnswer(a), [a]);
	const modelKey = `kad-${a.join("_")}`;
	const setAt = (i, v) => setA((arr) => arr.map((x, k) => k === i ? v : x));
	const removeAt = (i) => setA((arr) => arr.filter((_, k) => k !== i));
	const addOne = () => setA((arr) => [...arr, 1]);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "kd__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "数组 a[]（可增删 · 可为负数）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "kd__items",
				children: [a.map((v, i) => /* @__PURE__ */ jsxs("div", {
					className: "kd__item",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "kd__item-i",
							children: i
						}),
						a.length > 2 && /* @__PURE__ */ jsx("button", {
							className: "kd__remove",
							onClick: () => removeAt(i),
							"aria-label": "删除元素",
							children: /* @__PURE__ */ jsx(X, { size: 12 })
						}),
						/* @__PURE__ */ jsx(NumStepper$1, {
							value: v,
							min: -9,
							max: 14,
							onChange: (nv) => setAt(i, nv)
						})
					]
				}, i)), a.length < 8 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: addOne,
					children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加一位"]
				})]
			})] })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "kd__modes",
			children: [PRESETS$1.map((p) => /* @__PURE__ */ jsx("button", {
				className: `kd__mode ${a.join(",") === p.a.join(",") ? "on" : ""}`,
				onClick: () => setA(p.a),
				children: p.label
			}, p.label)), /* @__PURE__ */ jsxs("button", {
				className: "kd__mode",
				onClick: () => setA(PRESETS$1[0].a),
				title: "回到默认",
				children: [/* @__PURE__ */ jsx(RotateCcw, {
					size: 13,
					style: {
						verticalAlign: "-2px",
						marginRight: 4
					}
				}), "复位"]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"最大子段和 = dp[] 的全局最大值：",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: answer
				}),
				a.every((x) => x < 0) && /* @__PURE__ */ jsx(Fragment, { children: "（全为负数时，答案就是其中最大的那个单个元素）" })
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/components/demos/linear/MaxSegRingDemo.tsx
function NumStepper({ value, min, max, onChange }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "stepper__row",
		children: [
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value - 1),
				disabled: value <= min,
				"aria-label": "减",
				children: /* @__PURE__ */ jsx(Minus, { size: 13 })
			}),
			/* @__PURE__ */ jsx("span", {
				className: "stepper__val",
				children: value
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value + 1),
				disabled: value >= max,
				"aria-label": "加",
				children: /* @__PURE__ */ jsx(Plus, { size: 13 })
			})
		]
	});
}
var PRESETS = [
	{
		label: "跨首尾更优（默认）",
		a: [
			2,
			-1,
			2,
			-1,
			2
		]
	},
	{
		label: "首尾各一大块",
		a: [
			8,
			-4,
			-3,
			-4,
			8
		]
	},
	{
		label: "不跨首尾（普通即最优）",
		a: [
			-1,
			5,
			6,
			-2,
			-3
		]
	}
];
/**
* 环形最大子段：普通 Kadane vs 环形（总和 − 最小子段）并排对照。
* 左：不跨首尾的最大子段和；右：把 max 换成 min 求最小子段，total − minSeg = 绕首尾的最大段。
* 最终答案 = max(两者)。当最优段跨越首尾时，右边的补集技巧胜出。
*/
function MaxSegRingDemo() {
	const [a, setA] = useState([
		2,
		-1,
		2,
		-1,
		2
	]);
	const normalModel = useMemo(() => kadane(a), [a]);
	const minModel = useMemo(() => minSegViz(a), [a]);
	const normal = useMemo(() => kadaneAnswer(a), [a]);
	const total = useMemo(() => a.reduce((s, x) => s + x, 0), [a]);
	const minSeg = useMemo(() => minSegAnswer(a), [a]);
	const allPos = a.every((x) => x > 0);
	const wrap = allPos ? -Infinity : total - minSeg;
	const ans = Math.max(normal, wrap);
	const wrapWins = wrap > normal;
	const k = a.join("_");
	const setAt = (i, v) => setA((arr) => arr.map((x, j) => j === i ? v : x));
	const removeAt = (i) => setA((arr) => arr.filter((_, j) => j !== i));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "kd__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "环形数组 a[]（首尾相接 · 可为负数）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "kd__items",
				children: [a.map((v, i) => /* @__PURE__ */ jsxs("div", {
					className: "kd__item",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "kd__item-i",
							children: i
						}),
						a.length > 3 && /* @__PURE__ */ jsx("button", {
							className: "kd__remove",
							onClick: () => removeAt(i),
							"aria-label": "删除元素",
							children: /* @__PURE__ */ jsx(X, { size: 12 })
						}),
						/* @__PURE__ */ jsx(NumStepper, {
							value: v,
							min: -9,
							max: 14,
							onChange: (nv) => setAt(i, nv)
						})
					]
				}, i)), a.length < 7 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: () => setA((arr) => [...arr, 1]),
					children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加一位"]
				})]
			})] })
		}),
		/* @__PURE__ */ jsx("div", {
			className: "kd__modes",
			children: PRESETS.map((p) => /* @__PURE__ */ jsx("button", {
				className: `kd__mode ${a.join(",") === p.a.join(",") ? "on" : ""}`,
				onClick: () => setA(p.a),
				children: p.label
			}, p.label))
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"普通 Kadane ",
				/* @__PURE__ */ jsx("b", {
					className: "you",
					children: normal
				}),
				" · 环形（total − minSeg = ",
				total,
				" − (",
				minSeg,
				")）",
				allPos ? /* @__PURE__ */ jsx("b", {
					className: "you",
					children: " 不适用"
				}) : /* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: [" ", wrap]
				}),
				" · 取较大 → 答案",
				" ",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: ans
				}),
				allPos ? /* @__PURE__ */ jsx(Fragment, { children: "（全为正数：整段就是最优，环形补集会绕整圈重复，退化为普通）" }) : wrapWins ? /* @__PURE__ */ jsxs(Fragment, { children: [
					"（",
					/* @__PURE__ */ jsx("b", {
						className: "ok",
						children: "最优段跨过首尾"
					}),
					"，补集技巧胜出）"
				] }) : /* @__PURE__ */ jsx(Fragment, { children: "（最优段不跨首尾，普通 Kadane 已够）" })
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__pair",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "fbug__side-label you",
				children: [/* @__PURE__ */ jsx(Sparkles, { size: 15 }), " 普通 Kadane · 不跨首尾的最大子段"]
			}), /* @__PURE__ */ jsx(DPViz, { model: normalModel }, `n${k}`)] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "fbug__side-label ok",
				children: [/* @__PURE__ */ jsx(RefreshCw, { size: 15 }), " 环形补集 · 求最小子段，再 total − minSeg"]
			}), /* @__PURE__ */ jsx(DPViz, { model: minModel }, `m${k}`)] })]
		})
	] });
}
//#endregion
//#region src/content/b/MaxSubarrayArt.tsx
function SetupFigure() {
	const a = [
		-2,
		11,
		-4,
		13,
		-5,
		-2
	];
	const pick = /* @__PURE__ */ new Set([
		1,
		2,
		3
	]);
	const x0 = 40;
	const dx = 92;
	const bw = 60;
	const mid = 96;
	const scale = 3.6;
	const cx = (i) => x0 + i * dx + bw / 2;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 210",
		role: "img",
		"aria-label": "一排正负数与其中一段连续子段",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "ms-br",
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
			/* @__PURE__ */ jsx("line", {
				x1: "20",
				y1: mid,
				x2: "600",
				y2: mid,
				stroke: "var(--border-strong)",
				strokeWidth: "1.2",
				strokeDasharray: "4 4"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "24",
				y: mid - 6,
				fontSize: "10.5",
				className: "mono",
				fill: "var(--text-3)",
				children: "0"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: x0 - 8,
				y: "20",
				width: 292,
				height: "150",
				rx: "12",
				fill: "color-mix(in srgb, var(--accent-1) 8%, transparent)",
				stroke: "var(--accent-2)",
				strokeWidth: "1.4",
				strokeDasharray: "6 4"
			}),
			a.map((v, i) => {
				const on = pick.has(i);
				const h = Math.abs(v) * scale;
				const y = v >= 0 ? mid - h : mid;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x0 + i * dx},0)`,
					children: [
						/* @__PURE__ */ jsx("rect", {
							x: "0",
							y,
							width: bw,
							height: h,
							rx: "7",
							fill: on ? "color-mix(in srgb, var(--accent-1) 32%, var(--surface-3))" : "var(--surface-3)",
							stroke: on ? "var(--accent-2)" : "var(--border-strong)",
							strokeWidth: on ? "2" : "1.5"
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: v >= 0 ? y - 8 : y + h + 16,
							textAnchor: "middle",
							fontSize: "15",
							className: "mono",
							fill: on ? "var(--accent-1)" : "var(--text-2)",
							children: v
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "200",
							textAnchor: "middle",
							fontSize: "10.5",
							className: "mono",
							fill: "var(--text-3)",
							children: i
						})
					]
				}, i);
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M ${cx(0)} 30 H ${cx(3)}`,
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				markerEnd: "url(#ms-br)",
				fill: "none"
			}),
			/* @__PURE__ */ jsx("text", {
				x: (cx(0) + cx(3)) / 2,
				y: "16",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--accent-1)",
				children: "连续一段：11 + (−4) + 13 = 20（最大）"
			})
		]
	});
}
function DecisionFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 292",
		role: "img",
		"aria-label": "dp[i] 接续前一段或另起一段的决策分叉",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "ms-ar",
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
				transform: "translate(240,8)",
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
						children: "以 a[i] 结尾"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "70",
						y: "39",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[i] = ?"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M290 56 L150 100",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#ms-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M330 56 L474 100",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#ms-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "188",
				y: "86",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "接续"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "404",
				y: "86",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "另起"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(28,104)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "238",
						height: "68",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "119",
						y: "27",
						textAnchor: "middle",
						fontSize: "13",
						fill: "var(--text-1)",
						children: "接在前一段后面"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "119",
						y: "50",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "= dp[i−1] + a[i]"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(360,104)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "234",
						height: "68",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "117",
						y: "27",
						textAnchor: "middle",
						fontSize: "13",
						fill: "var(--text-1)",
						children: "扔掉前面，重开一段"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "117",
						y: "50",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "= a[i]"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M147 172 L300 226",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#ms-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M477 172 L340 226",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#ms-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(196,228)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "248",
					height: "54",
					rx: "14",
					fill: "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: "124",
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
function RingFigure() {
	const a = [
		2,
		-1,
		2,
		-1,
		2
	];
	const n = a.length;
	const cx0 = 168;
	const cy0 = 130;
	const R = 96;
	const holeIdx = 3;
	const angle = (i) => (-90 + 360 / n * i) * (Math.PI / 180);
	const px = (i) => cx0 + R * Math.cos(angle(i));
	const py = (i) => cy0 + R * Math.sin(angle(i));
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 264",
		role: "img",
		"aria-label": "环形数列：绕首尾的最优段等于总和减去最小子段",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: cx0,
				cy: cy0,
				r: R,
				fill: "none",
				stroke: "var(--border-strong)",
				strokeWidth: "1.4",
				strokeDasharray: "3 4"
			}),
			a.map((v, i) => {
				const hole = i === holeIdx;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${px(i) - 22},${py(i) - 18})`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: "44",
						height: "36",
						rx: "10",
						fill: hole ? "color-mix(in srgb, var(--viz-invalid) 16%, var(--surface-3))" : "color-mix(in srgb, var(--accent-1) 22%, var(--surface-3))",
						stroke: hole ? "var(--viz-invalid)" : "var(--accent-2)",
						strokeWidth: hole ? "2" : "1.6"
					}), /* @__PURE__ */ jsx("text", {
						x: "22",
						y: "24",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: hole ? "var(--viz-invalid)" : "var(--text-1)",
						children: v
					})]
				}, i);
			}),
			/* @__PURE__ */ jsx("text", {
				x: cx0,
				y: cy0 - 4,
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "绕首尾取"
			}),
			/* @__PURE__ */ jsx("text", {
				x: cx0,
				y: 145,
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--text-3)",
				children: "挖掉最小段"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(320,52)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "222",
						height: "160",
						rx: "14",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "20",
						y: "34",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "总和 total = 4"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "20",
						y: "62",
						fontSize: "12.5",
						fill: "var(--viz-invalid)",
						children: "最小子段 = −1（挖掉）"
					}),
					/* @__PURE__ */ jsx("line", {
						x1: "20",
						y1: "78",
						x2: "202",
						y2: "78",
						stroke: "var(--border-strong)",
						strokeWidth: "1"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "20",
						y: "104",
						fontSize: "12.5",
						className: "mono",
						fill: "var(--text-1)",
						children: "绕首尾 = total − minSeg"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "20",
						y: "128",
						fontSize: "12.5",
						className: "mono",
						fill: "var(--text-1)",
						children: "= 4 − (−1)"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "20",
						y: "150",
						fontSize: "13.5",
						className: "mono",
						fill: "var(--accent-1)",
						children: "= 5（> 普通 Kadane 的 4）"
					})
				]
			})
		]
	});
}
//#endregion
//#region src/content/b/MaxSubarray.tsx
var CODE_P1115 = `
#include <algorithm>
#include <iostream>
using namespace std;

int n, a;
int dp, ans;                     // dp：以当前数结尾的最大子段和；ans：全局最大

int main()
{
    cin >> n;
    cin >> a;
    dp = a;                          // 第一个数：只能自成一段
    ans = a;                         // ★ans 初值设成 a[1]，别设 0（全负时会错）
    for (int i = 2; i <= n; i++)
    {
        cin >> a;
        dp = max(dp + a, a);         // 接续 dp+a 还是另起 a，取较大
        ans = max(ans, dp);          // 子段可在任意位置结尾，随时刷新全局最大
    }

    cout << ans << endl;
    return 0;
}
// TAG: 线性DP 最大子段和 Kadane`;
var CODE_P2642 = `
#include <algorithm>
#include <iostream>
using namespace std;

const int MX = 1000005;
long long a[MX];
long long pre[MX], suf[MX];      // pre[i]：以 i 结尾的最大子段；suf[i]：以 i 开头的最大子段
long long bp[MX], bs[MX];        // bp[i]：前缀 [1..i] 里的最大子段；bs[i]：后缀 [i..n] 里的最大子段

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
    }

    pre[1] = a[1];
    for (int i = 2; i <= n; i++)                 // 正向 Kadane，落成「以 i 结尾」
    {
        pre[i] = max(pre[i - 1] + a[i], a[i]);
    }
    bp[1] = pre[1];
    for (int i = 2; i <= n; i++)                 // 前缀最大子段（可结尾于 ≤ i 处）
    {
        bp[i] = max(bp[i - 1], pre[i]);
    }

    suf[n] = a[n];
    for (int i = n - 1; i >= 1; i--)             // 反向 Kadane，落成「以 i 开头」
    {
        suf[i] = max(suf[i + 1] + a[i], a[i]);
    }
    bs[n] = suf[n];
    for (int i = n - 1; i >= 1; i--)             // 后缀最大子段（可开头于 ≥ i 处）
    {
        bs[i] = max(bs[i + 1], suf[i]);
    }

    long long ans = -0x3f3f3f3f3f3f3f3f;
    for (int i = 2; i < n; i++)                  // 枚举被跳过的中间数 i：左段收尾于 ≤ i-1，右段起于 ≥ i+1
    {
        ans = max(ans, bp[i - 1] + bs[i + 1]);   // 两段不相交且至少隔开中间的 i，各取自己那侧的最大
    }

    cout << ans << endl;
    return 0;
}
// TAG: 线性DP 最大子段和 两段不相交 前后缀`;
var CODE_P1121 = `
#include <algorithm>
#include <iostream>
using namespace std;

const int MX = 200005;
const long long INF = 0x3f3f3f3f3f3f3f3f;
int n;
long long a[MX], tot;

// 序列 b[l..r] 里选「恰好 K 段不相交、非空」子段的最大总和。
// f[j]=已选 j 段的最大和；g[j]=已选 j 段且第 j 段延伸到当前位的最大和。
long long kmax(long long b[], int l, int r, int K)
{
    long long f[3], g[3];
    for (int j = 0; j <= K; j++)
    {
        f[j] = -INF, g[j] = -INF;
    }
    f[0] = 0;
    for (int i = l; i <= r; i++)
    {
        for (int j = K; j >= 1; j--)             // ★逆序 j，防第 j 段在本轮被重复计入
        {
            g[j] = max(f[j - 1], g[j]) + b[i];   // 新开一段 或 延续第 j 段
            f[j] = max(f[j], g[j]);
        }
    }
    return f[K];
}

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        tot += a[i];
    }

    // 情况一：两段都不跨首尾 —— 序列 a[1..n] 上直接选最大两段。
    long long ans = kmax(a, 1, n, 2);

    // 情况二：有段跨首尾 —— 剩下的绕首尾两段 = 总和 − (中间挖掉的最小两段)。
    // 挖掉的两段必须落在「掐头去尾」的 a[2..n−1] 内，才能把环切成两段弧（首尾各留 ≥1）。
    // 最小两段 = −(在 −a 上的最大两段)，故 ans 候选 = tot + kmax(−a, 2..n−1, 2)。
    if (n >= 4)                                  // 内层至少 2 个元素才能挖两段
    {
        for (int i = 1; i <= n; i++)
        {
            a[i] = -a[i];
        }
        ans = max(ans, tot + kmax(a, 2, n - 1, 2));
    }

    cout << ans << endl;
    return 0;
}
// TAG: 线性DP 环状最大两段子段和 K段DP 补集`;
function MaxSubarray() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "什么是「最大子段和」"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"给一串数 ",
						/* @__PURE__ */ jsx(M, { children: "a_1,a_2,\\dots,a_n" }),
						"（",
						/* @__PURE__ */ jsx("strong", { children: "可正可负" }),
						"），",
						/* @__PURE__ */ jsx("strong", { children: "子段" }),
						"是原序列里",
						/* @__PURE__ */ jsx("strong", { children: "连续的一段" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "a_l,a_{l+1},\\dots,a_r" }),
						"—— 注意和「子序列」不同，子段必须",
						/* @__PURE__ */ jsx("strong", { children: "挨着取、不能跳" }),
						"。我们要找的，是所有子段里",
						/* @__PURE__ */ jsx("strong", { children: "和最大" }),
						"的那一段（一般要求非空，至少含一个数）。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(SetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "序列 −2, 11, −4, 13, −5, −2：柱高即数值（正上负下）。高亮的连续一段 11,−4,13 之和为 20，是最大子段——中间那个 −4 虽是负数，但为了连起两侧的大正数，值得含进来。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"盯住上图那段 ",
						/* @__PURE__ */ jsx(M, { children: "11,-4,13" }),
						"：它跨过了一个负数 ",
						/* @__PURE__ */ jsx(M, { children: "-4" }),
						"，可总和 ",
						/* @__PURE__ */ jsx(M, { children: "11-4+13=20" }),
						" 仍是最优。 这就是难点所在——",
						/* @__PURE__ */ jsx("strong", { children: "要不要把当前这个数接进来，取决于前面攒下的和是正是负" }),
						"：前面若攒了正的一坨（如 ",
						/* @__PURE__ */ jsx(M, { children: "11-4=7" }),
						"），哪怕眼下遇到 ",
						/* @__PURE__ */ jsx(M, { children: "13" }),
						" 也该接上去滚成 ",
						/* @__PURE__ */ jsx(M, { children: "20" }),
						"； 可前面若攒成了负数，那这负担就该",
						/* @__PURE__ */ jsx("strong", { children: "果断丢掉、从当前数重新起一段" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"最笨的办法是枚举左右端点 ",
						/* @__PURE__ */ jsx(M, { children: "l,r" }),
						" 再累加，那是 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
						"；加前缀和也要 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						"。 当 ",
						/* @__PURE__ */ jsx(M, { children: "n=2\\times10^5" }),
						"，这些都会超时。下面用一个只扫一遍的 DP——",
						/* @__PURE__ */ jsx("strong", { children: "Kadane 算法" }),
						"——把它压到 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
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
					children: "状态与转移：接续，还是另起"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"沿用 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/b/lis",
							style: { color: "var(--accent-2)" },
							children: "LIS"
						}),
						" 那把母题抓手：最大子段落在哪儿事先不知道，与其对「全局最优段」直接设状态，不如",
						/* @__PURE__ */ jsx("strong", { children: "钉住它的结尾" }),
						"。 设 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i]" }),
						" 表示：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"以 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							" 为最后一个元素"
						] }),
						"的最大子段和。于是 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个不同结尾把所有候选段分门别类地兜住，一个也不漏、一个也不重。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(DecisionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "每个 dp[i] 只有两条路：把 a[i] 接在前一段后面（dp[i−1]+a[i]），或让它自己另起一段（a[i]）。谁大取谁。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"怎么算 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i]" }),
							"？既然它",
							/* @__PURE__ */ jsxs("strong", { children: [
								"以 ",
								/* @__PURE__ */ jsx(M, { children: "a_i" }),
								" 结尾"
							] }),
							"，那 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							" 左边紧挨着的那段，只有两种可能："
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "接续" }),
							"：把 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							" 接在「以 ",
							/* @__PURE__ */ jsx(M, { children: "a_{i-1}" }),
							" 结尾的最优段」后面，得 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i-1]+a_i" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "另起" }),
							"：前面那段是负担（",
							/* @__PURE__ */ jsx(M, { children: "dp[i-1]<0" }),
							"），干脆扔掉，让 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							" ",
							/* @__PURE__ */ jsx("strong", { children: "自己单独成一段" }),
							"，得 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"两条路取较大，就是",
							/* @__PURE__ */ jsx("strong", { children: "转移方程" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i]=\\max\\big(dp[i-1]+a_i,\\ a_i\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"边界：",
							/* @__PURE__ */ jsx(M, { children: "dp[1]=a_1" }),
							"（第一个数只能自成一段）。答案",
							/* @__PURE__ */ jsx("strong", { children: "不是" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "dp[n]" }),
							"——因为最大子段可在任何位置收尾——而是",
							/* @__PURE__ */ jsxs("strong", { children: [
								"整个 ",
								/* @__PURE__ */ jsx(M, { children: "dp" }),
								" 数组的最大值"
							] }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\text{ans}=\\max_{1\\le i\\le n}dp[i]" })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"「以 ",
						/* @__PURE__ */ jsx(M, { children: "a_i" }),
						" 结尾」这个限定，把「求全局最大子段」拆成了 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个可顺序递推的小问题。转移只回看",
						/* @__PURE__ */ jsx("strong", { children: "一格" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "dp[i-1]" }),
						"，于是一趟 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						" 扫描就够，连数组都能省成一个滚动变量。★答案取",
						/* @__PURE__ */ jsx("strong", { children: "全行最大" }),
						"，且全为负数时 ",
						/* @__PURE__ */ jsx(M, { children: "\\text{ans}" }),
						" 初值必须设成 ",
						/* @__PURE__ */ jsx(M, { children: "a_1" }),
						" 而非 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						"，否则会误答 0。"
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
						"用序列 ",
						/* @__PURE__ */ jsx(M, { children: "a=[-2,11,-4,13,-5,-2]" }),
						" 走几步（下标从 1 记），把方程跑起来："
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
									/* @__PURE__ */ jsx("b", { children: "起点。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "dp[1]=a_1=-2" }),
									"（第一个数只能自成一段）。当前全局最大 ",
									/* @__PURE__ */ jsx(M, { children: "\\text{ans}=-2" }),
									"。"
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
									/* @__PURE__ */ jsx("b", { children: "到 11。" }),
									" 接续 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1]+11=-2+11=9" }),
									"，另起 ",
									/* @__PURE__ */ jsx(M, { children: "11" }),
									"。",
									/* @__PURE__ */ jsx("strong", { children: "另起更大" }),
									"（前面 ",
									/* @__PURE__ */ jsx(M, { children: "-2" }),
									" 是负担）→ ",
									/* @__PURE__ */ jsx(M, { children: "dp[2]=11" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "\\text{ans}=11" }),
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
									/* @__PURE__ */ jsx("b", { children: "到 −4。" }),
									" 接续 ",
									/* @__PURE__ */ jsx(M, { children: "11+(-4)=7" }),
									"，另起 ",
									/* @__PURE__ */ jsx(M, { children: "-4" }),
									"。接续更大 → ",
									/* @__PURE__ */ jsx(M, { children: "dp[3]=7" }),
									"（含住这个负数，赌后面有更大的正数）。",
									/* @__PURE__ */ jsx(M, { children: "\\text{ans}" }),
									" 仍 ",
									/* @__PURE__ */ jsx(M, { children: "11" }),
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
									/* @__PURE__ */ jsx("b", { children: "到 13。" }),
									" 接续 ",
									/* @__PURE__ */ jsx(M, { children: "7+13=20" }),
									"，另起 ",
									/* @__PURE__ */ jsx(M, { children: "13" }),
									"。接续更大 → ",
									/* @__PURE__ */ jsx(M, { children: "dp[4]=20" }),
									"。赌赢了——刷新 ",
									/* @__PURE__ */ jsx(M, { children: "\\text{ans}=20" }),
									"，正是那段 ",
									/* @__PURE__ */ jsx(M, { children: "11,-4,13" }),
									"。"
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "step",
							children: [/* @__PURE__ */ jsx("span", {
								className: "step__n",
								children: "4"
							}), /* @__PURE__ */ jsxs("div", {
								className: "step__b",
								children: [
									/* @__PURE__ */ jsx("b", { children: "剩下 −5、−2。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "dp[5]=\\max(20-5,-5)=15" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "dp[6]=\\max(15-2,-2)=13" }),
									"，都没超过 ",
									/* @__PURE__ */ jsx(M, { children: "20" }),
									"。扫完，",
									/* @__PURE__ */ jsx("strong", { children: "答案 20" }),
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
						/* @__PURE__ */ jsx(M, { children: "dp[]" }),
						" 逐格填出来，并高亮每一步「接续（连回 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i-1]" }),
						"）还是另起」的抉择。改数组、加删元素，或换个预设看它实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看它一格一格长出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(MaxSubarrayDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化 · 环形：断环与补集"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"换个设定：这串数",
							/* @__PURE__ */ jsx("strong", { children: "首尾相接成一个环" }),
							"，子段可以",
							/* @__PURE__ */ jsx("strong", { children: "跨过末尾绕回开头" }),
							"（例如 ",
							/* @__PURE__ */ jsx(M, { children: "a_{n-1},a_n,a_1,a_2" }),
							" 是合法的一段）。最大子段和又该怎么求？"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"分两种情况。",
							/* @__PURE__ */ jsx("strong", { children: "其一，最优段不跨首尾" }),
							"——那它就是普通的一段，直接跑一遍上面的 Kadane 即可。",
							/* @__PURE__ */ jsx("strong", { children: "其二，最优段跨过了首尾" }),
							"——这时它由「结尾的一截」和「开头的一截」拼成，绕过了中间某一段。 关键一步是",
							/* @__PURE__ */ jsx("strong", { children: "反着看" }),
							"：一个「绕首尾的段」和它「中间被绕过的那段」正好互补，两者拼起来是",
							/* @__PURE__ */ jsx("strong", { children: "整个环" }),
							"。记 ",
							/* @__PURE__ */ jsx(M, { children: "\\text{total}=\\sum a_i" }),
							"，则「绕首尾的最大段」等于总和减去中间被绕过的那段："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\text{wrap}=\\text{total}-\\text{minSeg}" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"要让绕首尾的段最大，就要让",
							/* @__PURE__ */ jsx("strong", { children: "中间挖掉的那段最小" }),
							"——而这个 ",
							/* @__PURE__ */ jsx(M, { children: "\\text{minSeg}" }),
							"（最小子段和）把 Kadane 里的 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							" 换成 ",
							/* @__PURE__ */ jsx(M, { children: "\\min" }),
							" 就能一趟求出。最终答案取两种情况的较大者："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\text{ans}=\\max\\big(\\text{maxSeg},\\ \\text{total}-\\text{minSeg}\\big)" })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(RingFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "环形 2,−1,2,−1,2：普通 Kadane 全取得 4；但绕过中间的最小子段 −1（total − minSeg = 4 − (−1) = 5）更优——最优段跨过了首尾。"
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱 · 全正数会绕整圈",
					children: [
						"用 ",
						/* @__PURE__ */ jsx(M, { children: "\\text{total}-\\text{minSeg}" }),
						" 时，若数组",
						/* @__PURE__ */ jsx("strong", { children: "全为正数" }),
						"，最小子段会退化成「最小的单个元素」，",
						/* @__PURE__ */ jsx(M, { children: "\\text{total}-\\text{minSeg}" }),
						" 相当于「几乎绕整整一圈」，把同一个环重复计入——非法。 稳妥写法：仅当最小子段",
						/* @__PURE__ */ jsx("strong", { children: "没有吃掉整个数组" }),
						"（还留下至少一个元素）时才采用补集；实践中若普通 Kadane 的结果已 ",
						/* @__PURE__ */ jsx(M, { children: "\\ge0" }),
						"，直接取两者较大即可自然避开这个坑。"
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面把两种算法",
						/* @__PURE__ */ jsx("strong", { children: "并排跑给你看" }),
						"：左边普通 Kadane 求「不跨首尾」的最大段，右边把 ",
						/* @__PURE__ */ jsx(M, { children: "\\max" }),
						" 换成 ",
						/* @__PURE__ */ jsx(M, { children: "\\min" }),
						" 求最小子段、再用 ",
						/* @__PURE__ */ jsx(M, { children: "\\text{total}-\\text{minSeg}" }),
						" 求「绕首尾」的段。改数值看谁胜出。"
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(MaxSegRingDemo, {})
					})
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
					pid: "P1115",
					name: "最大子段和",
					src: "洛谷原生",
					diff: "普及-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给定长度 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 的整数序列（含负数），求",
								/* @__PURE__ */ jsx("strong", { children: "最大子段和" }),
								"（连续、非空的一段）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"最裸的 Kadane 模板，",
								/* @__PURE__ */ jsx(M, { children: "n\\le 2\\times10^5" }),
								" 逼你放弃 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								" 前缀和暴力、写出一趟 ",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								" 的「接续 vs 另起」——把这套状态设计写熟，一个滚动变量就够。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "dp=\\max(dp+a_i,\\ a_i)" }),
								"，答案 ",
								/* @__PURE__ */ jsx(M, { children: "\\max_i dp_i" }),
								"；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"，空间 ",
								/* @__PURE__ */ jsx(M, { children: "O(1)" }),
								"。★",
								/* @__PURE__ */ jsx(M, { children: "\\text{ans}" }),
								" 初值取 ",
								/* @__PURE__ */ jsx(M, { children: "a_1" }),
								"，防全负误答 0。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（滚动变量 Kadane）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1115,
								luogu: "P1115"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2642",
					name: "双子序列最大和",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"在序列中选",
								/* @__PURE__ */ jsx("strong", { children: "两段不相交、非空" }),
								"的子段，使两段和最大。求这个最大值。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"把「两段不相交」单独练透，是环形题 P1121 的台阶。核心套路是",
								/* @__PURE__ */ jsx("strong", { children: "前后缀最优拼接" }),
								"：正向求「前缀内最大子段」",
								/* @__PURE__ */ jsx(M, { children: "bp[i]" }),
								"、反向求「后缀内最大子段」",
								/* @__PURE__ */ jsx(M, { children: "bs[i]" }),
								"，再枚举",
								/* @__PURE__ */ jsx("strong", { children: "被跳过的中间数" }),
								" ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								"，让左段取 ",
								/* @__PURE__ */ jsx(M, { children: "bp[i-1]" }),
								"、右段取 ",
								/* @__PURE__ */ jsx(M, { children: "bs[i+1]" }),
								" 各据一侧——这是一大类「拆成互不相交若干段」问题的通法。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "pre/suf" }),
								" 各跑一遍 Kadane，",
								/* @__PURE__ */ jsx(M, { children: "bp/bs" }),
								" 做前后缀最大；答案 ",
								/* @__PURE__ */ jsx(M, { children: "\\max_{2\\le i<n}(bp[i{-}1]+bs[i{+}1])" }),
								"（枚举被跳过的中间数 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								"，保证两段隔开）；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（前后缀最优拼接）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2642,
								luogu: "P2642"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1121",
					name: "环状最大两段子段和",
					src: "洛谷原生",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"序列",
								/* @__PURE__ */ jsx("strong", { children: "首尾相接成环" }),
								"，选",
								/* @__PURE__ */ jsx("strong", { children: "两段不相交、非空" }),
								"的子段（可跨首尾），求两段和最大。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"一题同时叠",
								/* @__PURE__ */ jsx("strong", { children: "环形" }),
								"与",
								/* @__PURE__ */ jsx("strong", { children: "两段不相交" }),
								"两个变形，是本类集大成。核心是",
								/* @__PURE__ */ jsx("strong", { children: "「恰好 K 段不相交」DP" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "f[j]" }),
								"=已选 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 段的最大和、",
								/* @__PURE__ */ jsx(M, { children: "g[j]" }),
								"=第 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 段延伸到当前位）加上一层补集：",
								/* @__PURE__ */ jsx("strong", { children: "情况一" }),
								"两段都不跨首尾，直接在 ",
								/* @__PURE__ */ jsx(M, { children: "a" }),
								" 上求最大两段；",
								/* @__PURE__ */ jsx("strong", { children: "情况二" }),
								"有段跨首尾，剩下的绕首尾两段等于「总和减去中间挖掉的最小两段」，而",
								/* @__PURE__ */ jsx("strong", { children: "中间的最小两段" }),
								"又等于「在 ",
								/* @__PURE__ */ jsx(M, { children: "-a" }),
								" 上求最大两段」再取负。讲透「用补集绕开环」。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "kmax(b,K)" }),
								" 对 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" ",
								/* @__PURE__ */ jsx("strong", { children: "逆序" }),
								"更新 ",
								/* @__PURE__ */ jsx(M, { children: "g[j]=\\max(f[j-1],g[j])+b_i,\\ f[j]=\\max(f[j],g[j])" }),
								"；两种情况各调一次（第二种在掐头去尾的 ",
								/* @__PURE__ */ jsx(M, { children: "-a[2..n-1]" }),
								" 上），取较大，时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(nK)" }),
								"。★情况二必须给首尾各留至少一个元素，别让挖掉的两段吃光整环。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（恰好 K 段 DP + 补集）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1121,
								luogu: "P1121"
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
					pid: "P1719",
					name: "最大加权矩形",
					hint: "二维压一维：枚举上下边界两行，把这两行之间每列求和压成一维数组，问题就退化成对这一维做一次最大子段和（Kadane）。外层枚举 O(n²) 对行界，内层 O(m) 跑 Kadane。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2642",
					name: "双子序列最大和（回炉自测）",
					hint: "上面精讲过的「两段不相交」——先合上参考代码，自己独立把前后缀 bp[]/bs[] 推一遍再枚举分界；吃透它，环形的 P1121 就只是再叠一层补集。"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					style: { marginTop: "var(--sp-4)" },
					children: /* @__PURE__ */ jsxs("p", {
						style: {
							fontSize: "13.5px",
							color: "var(--text-3)"
						},
						children: [
							"小字说明：最大子段和的洛谷",
							/* @__PURE__ */ jsx("strong", { children: "原生练习池偏窄" }),
							"（多数同类题是本页例题本身）。除上面两题外，建议把例题 ",
							/* @__PURE__ */ jsx("strong", { children: "P1121 / P2642" }),
							" 当自测——先合上参考代码独立写、再对照，是巩固「环形 / 两段不相交」最有效的方式。"
						]
					})
				})
			]
		})
	] });
}
//#endregion
export { MaxSubarray as default };
