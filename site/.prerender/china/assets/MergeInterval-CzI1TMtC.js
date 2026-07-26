import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, Minus, MousePointerClick, Plus, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/interval-merge/internal.ts
function validate(values) {
	if (values.length === 0) throw new RangeError("interval merge requires at least one value");
	for (const value of values) if (!Number.isFinite(value)) throw new RangeError("interval values must be finite");
}
function executeTakeEnds(values, emit) {
	validate(values);
	const n = values.length;
	const table = Array.from({ length: n }, () => Array(n).fill(0));
	for (let index = 0; index < n; index++) table[index][index] = values[index];
	for (let length = 2; length <= n; length++) for (let left = 0; left + length <= n; left++) {
		const right = left + length - 1;
		const takeLeft = values[left] - table[left + 1][right];
		const takeRight = values[right] - table[left][right - 1];
		const pickedLeft = takeLeft >= takeRight;
		table[left][right] = pickedLeft ? takeLeft : takeRight;
		emit({
			type: "settled",
			left,
			right,
			takeLeft,
			takeRight,
			pickedLeft,
			value: table[left][right]
		});
	}
	const total = values.reduce((sum, value) => sum + value, 0);
	const difference = table[0][n - 1];
	const first = (total + difference) / 2;
	return {
		difference,
		total,
		first,
		second: total - first,
		table
	};
}
function recordTakeEnds(values) {
	const events = [];
	return {
		result: executeTakeEnds(values, (event) => events.push(event)),
		events
	};
}
function executeMerge248(values, emit) {
	validate(values);
	const n = values.length;
	const table = Array.from({ length: n }, () => Array(n).fill(0));
	let bestValue = Number.NEGATIVE_INFINITY;
	let bestStart = 0;
	let bestEnd = 0;
	for (let index = 0; index < n; index++) {
		table[index][index] = values[index];
		if (values[index] >= bestValue) {
			bestValue = values[index];
			bestStart = index;
			bestEnd = index;
		}
	}
	for (let length = 2; length <= n; length++) for (let left = 0; left + length <= n; left++) {
		const right = left + length - 1;
		const attempts = [];
		let value = 0;
		let bestSplit = -1;
		for (let split = left; split < right; split++) {
			const leftValue = table[left][split];
			const rightValue = table[split + 1][right];
			const matched = leftValue > 0 && leftValue === rightValue;
			attempts.push({
				split,
				leftValue,
				rightValue,
				matched
			});
			if (matched && leftValue + 1 > value) {
				value = leftValue + 1;
				bestSplit = split;
			}
		}
		table[left][right] = value;
		if (value > bestValue) {
			bestValue = value;
			bestStart = left;
			bestEnd = right;
		}
		emit({
			type: "settled",
			left,
			right,
			split: bestSplit,
			value,
			attempts,
			bestValue,
			bestStart,
			bestEnd
		});
	}
	return {
		value: bestValue,
		bestStart,
		bestEnd,
		table
	};
}
function recordMerge248(values) {
	const events = [];
	return {
		result: executeMerge248(values, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/components/demos/interval/mergeSolver.ts
function settled(table) {
	const states = {};
	for (let row = 0; row < table.length; row++) for (let column = row; column < table.length; column++) if (table[row][column] !== null) states[key(row, column)] = "settled";
	return states;
}
function takeEnds(values) {
	const run = recordTakeEnds(values);
	const n = values.length;
	const table = Array.from({ length: n }, () => Array(n).fill(null));
	for (let index = 0; index < n; index++) table[index][index] = values[index];
	const snapshot = () => table.map((row) => row.slice());
	const frames = [{
		values: snapshot(),
		states: settled(table),
		caption: "<b>对角线</b>：只剩一个数时只能拿走它，净胜差 dp[l][l]=a[l]。",
		formula: "dp[l][l]=a[l]"
	}];
	for (const event of run.events) {
		table[event.left][event.right] = event.value;
		const source = event.pickedLeft ? {
			r: event.left + 1,
			c: event.right
		} : {
			r: event.left,
			c: event.right - 1
		};
		const states = settled(table);
		states[key(source.r, source.c)] = "chosen";
		states[key(event.left, event.right)] = "current";
		const arrows = [{
			from: source,
			to: {
				r: event.left,
				c: event.right
			},
			kind: "chosen"
		}];
		frames.push({
			values: snapshot(),
			states,
			arrows,
			active: {
				r: event.left,
				c: event.right
			},
			caption: `区间 <b>[${event.left},${event.right}]</b>：取左净胜 ${event.takeLeft}，取右净胜 ${event.takeRight}，选择${event.pickedLeft ? "左" : "右"}端 → <b>${event.value}</b>。`,
			formula: `dp[${event.left}][${event.right}]=\\max(${event.takeLeft},${event.takeRight})=${event.value}`
		});
	}
	const finalStates = settled(table);
	finalStates[key(0, n - 1)] = "chosen";
	frames.push({
		values: snapshot(),
		states: finalStates,
		caption: `整排最大净胜差为 <b>${run.result.difference}</b>；总和 ${run.result.total}，先手最多得 <b>${run.result.first}</b>。`,
		formula: `dp[0][${n - 1}]=${run.result.difference}`
	});
	return {
		rows: n,
		cols: n,
		cell: 40,
		rowHeaderLabels: Array.from({ length: n }, (_, index) => `l=${index}`),
		colHeaderLabels: Array.from({ length: n }, (_, index) => `r=${index}`),
		frames
	};
}
function merge248(values) {
	const run = recordMerge248(values);
	const n = values.length;
	const table = Array.from({ length: n }, () => Array(n).fill(null));
	for (let index = 0; index < n; index++) table[index][index] = values[index];
	const snapshot = () => table.map((row) => row.slice());
	const frames = [{
		values: snapshot(),
		states: settled(table),
		caption: "<b>对角线</b>：单个数字已是一块，dp[l][l]=a[l]；0 表示区间无法缩成单值。",
		formula: "dp[l][l]=a[l]"
	}];
	for (const event of run.events) {
		table[event.left][event.right] = event.value;
		const states = settled(table);
		const arrows = [];
		if (event.split >= 0) {
			states[key(event.left, event.split)] = "chosen";
			states[key(event.split + 1, event.right)] = "chosen";
			arrows.push({
				from: {
					r: event.left,
					c: event.split
				},
				to: {
					r: event.left,
					c: event.right
				},
				kind: "chosen"
			});
			arrows.push({
				from: {
					r: event.split + 1,
					c: event.right
				},
				to: {
					r: event.left,
					c: event.right
				},
				kind: "chosen"
			});
		}
		states[key(event.left, event.right)] = "current";
		const tried = event.attempts.map((attempt) => `k=${attempt.split}:${attempt.leftValue}|${attempt.rightValue}${attempt.matched ? "✓" : "✗"}`);
		frames.push({
			values: snapshot(),
			states,
			arrows,
			active: {
				r: event.left,
				c: event.right
			},
			caption: event.value > 0 ? `区间 <b>[${event.left},${event.right}]</b> 在 k=${event.split} 两侧都合成 ${event.value - 1}，再并一级 → <b>${event.value}</b>。` : `区间 <b>[${event.left},${event.right}]</b> 没有相等的左右块（${tried.join(" ")}），记 <b>0</b>。`,
			formula: event.value > 0 ? `dp[${event.left}][${event.right}]=${event.value - 1}+1=${event.value}` : `dp[${event.left}][${event.right}]=0`
		});
	}
	const finalStates = settled(table);
	finalStates[key(run.result.bestStart, run.result.bestEnd)] = "chosen";
	frames.push({
		values: snapshot(),
		states: finalStates,
		caption: `三角表所有区间中能得到的<b>最大数字 = ${run.result.value}</b>。`,
		formula: `\\text{ans}=\\max_{l\\le r}dp[l][r]=${run.result.value}`
	});
	return {
		rows: n,
		cols: n,
		cell: 40,
		rowHeaderLabels: Array.from({ length: n }, (_, index) => `l=${index}`),
		colHeaderLabels: Array.from({ length: n }, (_, index) => `r=${index}`),
		frames
	};
}
//#endregion
//#region src/components/demos/interval/MergeIntervalDemo.tsx
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
/** 两端取数博弈区间 DP 三角表演示：dp[l][r] 按长度递推，高亮取左 / 取右选中的那个收缩后子区间。 */
function MergeIntervalDemo() {
	const [nums, setNums] = useState([
		3,
		9,
		1,
		2
	]);
	const model = useMemo(() => takeEnds(nums), [nums]);
	const modelKey = `te-${nums.join("_")}`;
	const setNum = (i, val) => setNums((arr) => arr.map((s, k) => k === i ? val : s));
	const addNum = () => setNums((arr) => arr.length < 6 ? [...arr, 4] : arr);
	const removeNum = (i) => setNums((arr) => arr.length > 3 ? arr.filter((_, k) => k !== i) : arr);
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
		className: "kd__toolbar",
		children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "kd__group-label",
			children: "一排数字（两人轮流从两端取 · 可改每个数值 · 3～6 个）"
		}), /* @__PURE__ */ jsxs("div", {
			className: "kd__items",
			children: [nums.map((s, i) => /* @__PURE__ */ jsxs("div", {
				className: "kd__item",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "kd__item-i",
						children: i
					}),
					nums.length > 3 && /* @__PURE__ */ jsx("button", {
						className: "kd__remove",
						onClick: () => removeNum(i),
						"aria-label": "删除该数",
						children: /* @__PURE__ */ jsx(X, { size: 12 })
					}),
					/* @__PURE__ */ jsx(Stepper$1, {
						label: "数值 a",
						value: s,
						min: 1,
						max: 30,
						onChange: (v) => setNum(i, v)
					})
				]
			}, i)), nums.length < 6 && /* @__PURE__ */ jsxs("button", {
				className: "kd__add",
				onClick: addNum,
				children: [/* @__PURE__ */ jsx(Plus, { size: 14 }), " 加一个"]
			})]
		})] })
	}), /* @__PURE__ */ jsx(DPViz, { model }, modelKey)] });
}
//#endregion
//#region src/algorithms/interval-merge/index.ts
function solveMerge248(values) {
	return executeMerge248(values, ignoreEvents);
}
//#endregion
//#region src/components/demos/interval/TwoFourEightDemo.tsx
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
/** 248（P3146）合并可视化：相邻相等的数并成 +1，dp[l][r] 记该区间可合成的单一值（0=不可）。 */
function TwoFourEightDemo() {
	const [nums, setNums] = useState([
		1,
		1,
		2,
		2
	]);
	const model = useMemo(() => merge248(nums), [nums]);
	const modelKey = `m248-${nums.join("_")}`;
	const best = useMemo(() => solveMerge248(nums).value, [nums]);
	const setNum = (i, val) => setNums((arr) => arr.map((s, k) => k === i ? val : s));
	const addNum = () => setNums((arr) => arr.length < 6 ? [...arr, 1] : arr);
	const removeNum = (i) => setNums((arr) => arr.length > 3 ? arr.filter((_, k) => k !== i) : arr);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "kd__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "一排数字（相邻两个相等可并成 +1 · 可改数值 · 3～6 个）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "kd__items",
				children: [nums.map((s, i) => /* @__PURE__ */ jsxs("div", {
					className: "kd__item",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "kd__item-i",
							children: i
						}),
						nums.length > 3 && /* @__PURE__ */ jsx("button", {
							className: "kd__remove",
							onClick: () => removeNum(i),
							"aria-label": "删除该数",
							children: /* @__PURE__ */ jsx(X, { size: 12 })
						}),
						/* @__PURE__ */ jsx(Stepper, {
							label: "数值 a",
							value: s,
							min: 1,
							max: 9,
							onChange: (v) => setNum(i, v)
						})
					]
				}, i)), nums.length < 6 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: addNum,
					children: [/* @__PURE__ */ jsx(Plus, { size: 14 }), " 加一个"]
				})]
			})] })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"整排能合成的",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: ["最大数字 = ", best]
				}),
				" · 每格 dp[l][r] = 该区间能缩成的单一值（",
				/* @__PURE__ */ jsx("b", { children: "0" }),
				" 表示这段无法合成一个数）· 答案取三角表里",
				/* @__PURE__ */ jsx("b", { children: "所有格的最大值" }),
				"，未必在右上角。"
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/content/c/MergeIntervalArt.tsx
function TakeEndsSetupFigure() {
	const a = [
		3,
		9,
		1,
		2
	];
	const bw = 70;
	const x0 = 128;
	const bx = (i) => x0 + i * 82;
	const lx = 163;
	const rx = bx(a.length - 1) + bw / 2;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 176",
		role: "img",
		"aria-label": "一排数字，只能从两端取走",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "mi-ar",
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
			a.map((v, i) => {
				const end = i === 0 || i === a.length - 1;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${bx(i)},58)`,
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: bw,
							height: 62,
							rx: "12",
							fill: end ? "color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))" : "var(--surface-3)",
							stroke: end ? "var(--accent-2)" : "var(--border-strong)",
							strokeWidth: end ? 2 : 1.5
						}),
						/* @__PURE__ */ jsxs("text", {
							x: bw / 2,
							y: "26",
							textAnchor: "middle",
							fontSize: "11",
							className: "mono",
							fill: "var(--text-3)",
							children: [
								"a[",
								i,
								"]"
							]
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "49",
							textAnchor: "middle",
							fontSize: "20",
							className: "mono",
							fill: end ? "var(--accent-1)" : "var(--text-1)",
							children: v
						})
					]
				}, i);
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M ${lx} 44 C ${x0 - 30} 8, ${x0 - 60} 40, ${x0 - 60} 90`,
				fill: "none",
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				markerEnd: "url(#mi-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: x0 - 66,
				y: "112",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "取左端"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M ${rx} 44 C ${rx + 30} 8, ${rx + 60} 40, ${rx + 60} 90`,
				fill: "none",
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				markerEnd: "url(#mi-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: rx + 60,
				y: "112",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "取右端"
			}),
			/* @__PURE__ */ jsxs("text", {
				x: "320",
				y: "150",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: [
					"两人轮流拿，每回合只能从",
					/* @__PURE__ */ jsx("tspan", {
						fill: "var(--accent-1)",
						children: " 一端 "
					}),
					"取走一个数——区间从两端「收缩」。"
				]
			})
		]
	});
}
function ShrinkTransitionFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 274",
		role: "img",
		"aria-label": "两端取数的转移：取左或取右，子区间收缩一格",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "mi-ar2",
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
				transform: "translate(232,8)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "176",
						height: "50",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "88",
						y: "22",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "面对区间 [l, r]"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "88",
						y: "41",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[l][r] = ?"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M300 58 L168 100",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#mi-ar2)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M340 58 L474 100",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#mi-ar2)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "206",
				y: "86",
				fontSize: "12.5",
				fill: "var(--accent-1)",
				children: "拿走左端 a[l]"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "404",
				y: "86",
				fontSize: "12.5",
				fill: "var(--accent-1)",
				children: "拿走右端 a[r]"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(24,104)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "288",
						height: "70",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "144",
						y: "28",
						textAnchor: "middle",
						fontSize: "13",
						fill: "var(--text-1)",
						children: "对手接手子区间 [l+1, r]"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "144",
						y: "52",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "a[l] − dp[l+1][r]"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(328,104)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "288",
						height: "70",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "144",
						y: "28",
						textAnchor: "middle",
						fontSize: "13",
						fill: "var(--text-1)",
						children: "对手接手子区间 [l, r−1]"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "144",
						y: "52",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "a[r] − dp[l][r−1]"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M168 174 L300 214",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#mi-ar2)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M472 174 L340 214",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#mi-ar2)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(196,216)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "248",
					height: "52",
					rx: "14",
					fill: "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: "124",
					y: "31",
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
function Merge248Figure() {
	const bw = 58;
	const bh = 54;
	const cell = (x, y, v, hot) => /* @__PURE__ */ jsxs("g", {
		transform: `translate(${x},${y})`,
		children: [/* @__PURE__ */ jsx("rect", {
			width: bw,
			height: bh,
			rx: "11",
			fill: hot ? "color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))" : "var(--surface-3)",
			stroke: hot ? "var(--accent-2)" : "var(--border-strong)",
			strokeWidth: hot ? 2 : 1.5
		}), /* @__PURE__ */ jsx("text", {
			x: bw / 2,
			y: 34,
			textAnchor: "middle",
			fontSize: "21",
			className: "mono",
			fill: hot ? "var(--accent-1)" : "var(--text-1)",
			children: v
		})]
	});
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 600 210",
		role: "img",
		"aria-label": "248 玩法：相邻相等的两数并成加一",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "mi-ar3",
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
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "52",
				fontSize: "12.5",
				fill: "var(--text-3)",
				children: "第 1 步"
			}),
			cell(96, 26, 1, false),
			cell(166, 26, 2, true),
			cell(236, 26, 2, true),
			/* @__PURE__ */ jsx("path", {
				d: "M300 53 H352",
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				markerEnd: "url(#mi-ar3)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "326",
				y: "42",
				textAnchor: "middle",
				fontSize: "11",
				fill: "var(--accent-1)",
				children: "并"
			}),
			cell(372, 26, 1, false),
			cell(442, 26, 3, true),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "150",
				fontSize: "12.5",
				fill: "var(--text-3)",
				children: "第 2 步"
			}),
			cell(96, 124, 1, false),
			cell(166, 124, 3, false),
			/* @__PURE__ */ jsx("text", {
				x: "300",
				y: "156",
				fontSize: "13",
				fill: "var(--viz-invalid)",
				children: "1 ≠ 3，无法再并"
			}),
			/* @__PURE__ */ jsxs("text", {
				x: "300",
				y: "196",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: [
					"只有",
					/* @__PURE__ */ jsx("tspan", {
						fill: "var(--accent-1)",
						children: " 相邻且相等 "
					}),
					"才能并成 +1；两段要先各自缩成",
					/* @__PURE__ */ jsx("tspan", {
						fill: "var(--accent-1)",
						children: " 同一个数 "
					}),
					"，才谈得上再并一级。"
				]
			})
		]
	});
}
//#endregion
//#region src/content/c/MergeInterval.tsx
var CODE_P3146 = `
#include <iostream>
#include <algorithm>
using namespace std;

int n, a[300];
int dp[300][300];               // dp[l][r]：区间 [l,r] 能合成的单一数字（0 = 不可合成）

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        dp[i][i] = a[i];        // 单个数自成一块
    }

    int ans = 0;
    for (int i = 1; i <= n; i++)
    {
        ans = max(ans, a[i]);
    }

    for (int len = 2; len <= n; len++)          // ★外层枚举区间长度，由短到长
    {
        for (int l = 1; l + len - 1 <= n; l++)
        {
            int r = l + len - 1;
            for (int k = l; k <= r - 1; k++)    // 枚举分割点：两段要合成同一个数
            {
                if (dp[l][k] && dp[l][k] == dp[k + 1][r])
                {
                    dp[l][r] = max(dp[l][r], dp[l][k] + 1);
                }
            }
            ans = max(ans, dp[l][r]);           // 答案是全盘所有区间里的最大数字
        }
    }

    cout << ans << endl;
    return 0;
}
// TAG: 区间DP 合并 248`;
var CODE_P1436 = `
#include <iostream>
#include <cstring>
using namespace std;

const int INF = 0x3f3f3f3f;
int n;
int s[9][9];                    // 二维前缀和：s[i][j] = 左上角 (1,1) 到 (i,j) 的总和
int f[16][9][9][9][9];          // f[k][x1][y1][x2][y2]：把该矩形切成 k 块的最小平方和

// 矩形 (x1,y1)-(x2,y2) 的总分
int sum(int x1, int y1, int x2, int y2)
{
    return s[x2][y2] - s[x1 - 1][y2] - s[x2][y1 - 1] + s[x1 - 1][y1 - 1];
}

int sq(int v)
{
    return v * v;
}

// 记忆化：把矩形切成 k 块，返回最小的「各块得分平方和」
int dfs(int k, int x1, int y1, int x2, int y2)
{
    int &cur = f[k][x1][y1][x2][y2];
    if (cur != -1)
    {
        return cur;
    }
    if (k == 1)                                 // 不再切，整块贡献一份平方
    {
        return cur = sq(sum(x1, y1, x2, y2));
    }
    cur = INF;
    for (int x = x1; x <= x2 - 1; x++)          // 横切：上 k1 块 + 下 k-k1 块
    {
        for (int k1 = 1; k1 <= k - 1; k1++)
        {
            cur = min(cur, dfs(k1, x1, y1, x, y2) + dfs(k - k1, x + 1, y1, x2, y2));
        }
    }
    for (int y = y1; y <= y2 - 1; y++)          // 竖切：左 k1 块 + 右 k-k1 块
    {
        for (int k1 = 1; k1 <= k - 1; k1++)
        {
            cur = min(cur, dfs(k1, x1, y1, x2, y) + dfs(k - k1, x1, y + 1, x2, y2));
        }
    }
    return cur;
}

int main()
{
    cin >> n;
    for (int i = 1; i <= 8; i++)
    {
        for (int j = 1; j <= 8; j++)
        {
            cin >> s[i][j];
            s[i][j] += s[i - 1][j] + s[i][j - 1] - s[i - 1][j - 1];
        }
    }

    memset(f, -1, sizeof(f));
    int tot = sum(1, 1, 8, 8);
    // 最小方差 ⇔ 最小平方和：σ² = (Σxᵢ²)/n − x̄²，均值固定，只需最小化 Σxᵢ²
    double variance = (double)dfs(n, 1, 1, 8, 8) / n - (double)tot / n * tot / n;
    printf("%.3lf\\n", variance);
    return 0;
}
// TAG: 区间DP 二维 记忆化 棋盘分割`;
function MergeInterval() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "从两端取数：另一种拆区间的方式"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"石子合并里，我们靠",
						/* @__PURE__ */ jsx("strong", { children: "枚举中间的分割点" }),
						"把区间拆成两半。但区间 DP 还有一类同样常见的场景：操作只发生在",
						/* @__PURE__ */ jsx("strong", { children: "区间的两端" }),
						"——从两头拿、把两头删、比较两头。它们拆区间的方式不是「从中间断」，而是",
						/* @__PURE__ */ jsx("strong", { children: "从两端收缩" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"看一个具体博弈：桌上一排 ",
						/* @__PURE__ */ jsx("strong", { children: "4" }),
						" 个数 ",
						/* @__PURE__ */ jsx(M, { children: "a=[3,\\ 9,\\ 1,\\ 2]" }),
						"，两名玩家",
						/* @__PURE__ */ jsx("strong", { children: "轮流" }),
						"行动，每回合只能从",
						/* @__PURE__ */ jsx("strong", { children: "最左" }),
						"或",
						/* @__PURE__ */ jsx("strong", { children: "最右" }),
						"端拿走一个数，拿到的数计入自己得分。两人都想让",
						/* @__PURE__ */ jsx("strong", { children: "自己得分尽量高" }),
						"。先手最多能领先对手多少分？"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(TakeEndsSetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "一排数字，每回合只能从最左或最右端拿走一个；剩下的区间从两端逐步收缩。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"第一反应也许是",
						/* @__PURE__ */ jsx("strong", { children: "贪心" }),
						"：每步拿两端里更大的那个。可这并不总对——此刻贪一个大的，可能把对手放进下一步更肥的位置。因为",
						/* @__PURE__ */ jsx("strong", { children: "拿走一端后，剩下的又是一个连续区间，对手同样会最优应对" }),
						"，牵一发而动全身。这与石子合并的困境同源：",
						/* @__PURE__ */ jsx("strong", { children: "局部最优不等于全局最优" }),
						"，得把「剩下那段对手能拿多少」也算进来。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"关键观察：无论怎么拿，",
						/* @__PURE__ */ jsxs("strong", { children: ["当前面对的永远是一段连续区间 ", /* @__PURE__ */ jsx(M, { children: "[l,r]" })] }),
						"；一次行动只会把它变成",
						/* @__PURE__ */ jsxs("strong", { children: ["去掉左端的 ", /* @__PURE__ */ jsx(M, { children: "[l{+}1,r]" })] }),
						" 或",
						/* @__PURE__ */ jsxs("strong", { children: ["去掉右端的 ", /* @__PURE__ */ jsx(M, { children: "[l,r{-}1]" })] }),
						"——长度恰好少 1。区间结构再次浮现，这正是区间 DP 的入口，只不过转移从「枚举分割点」换成了「选哪一端」。"
					] })]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：站在对手的肩膀上"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
						"设 ",
						/* @__PURE__ */ jsx(M, { children: "dp[l][r]" }),
						" 表示：当轮到某位玩家、面对区间 ",
						/* @__PURE__ */ jsx(M, { children: "[l,r]" }),
						" 时，他能取得的",
						/* @__PURE__ */ jsx("strong", { children: "「自己所得 − 对手所得」的最大净胜差" }),
						"。用「净胜差」而非「绝对得分」，是这一类博弈 DP 的点睛之笔——它让",
						/* @__PURE__ */ jsx("strong", { children: "双方都最优" }),
						"这件事变得可递推。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"他有两种选择。若",
						/* @__PURE__ */ jsxs("strong", { children: ["拿走左端 ", /* @__PURE__ */ jsx(M, { children: "a[l]" })] }),
						"：这一分先进自己账户，随后",
						/* @__PURE__ */ jsx("strong", { children: "对手" }),
						"面对子区间 ",
						/* @__PURE__ */ jsx(M, { children: "[l{+}1,r]" }),
						"，对手在那段的最大净胜差正是 ",
						/* @__PURE__ */ jsx(M, { children: "dp[l{+}1][r]" }),
						"——但那是",
						/* @__PURE__ */ jsx("strong", { children: "站在对手视角" }),
						"的领先，换回",
						/* @__PURE__ */ jsx("strong", { children: "我方视角要取负号" }),
						"。于是这一步我方净胜差 ",
						/* @__PURE__ */ jsx(M, { children: "=a[l]-dp[l{+}1][r]" }),
						"。拿右端同理。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(ShrinkTransitionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "dp[l][r] 只有两条分支：取左端接子问题 dp[l+1][r]、取右端接 dp[l][r-1]；子区间的净胜差是对手视角，故减去。取两者较大。"
					})]
				}),
				/* @__PURE__ */ jsx(MB, { children: "dp[l][r]=\\max\\big(a[l]-dp[l+1][r],\\ a[r]-dp[l][r-1]\\big)" }),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"边界：",
						/* @__PURE__ */ jsx(M, { children: "dp[l][l]=a[l]" }),
						"（只剩一个数，先手别无选择直接拿走，净胜差就是它）。答案：",
						/* @__PURE__ */ jsx(M, { children: "dp[1][n]" }),
						" 即先手在整排上的最大净胜差；若还想还原",
						/* @__PURE__ */ jsx("strong", { children: "先手实际得分" }),
						"，用总和 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 反推 ",
						/* @__PURE__ */ jsx(M, { children: "\\tfrac{S+dp[1][n]}{2}" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"同样地，",
						/* @__PURE__ */ jsx(M, { children: "dp[l][r]" }),
						" 依赖的两个子区间 ",
						/* @__PURE__ */ jsx(M, { children: "[l{+}1,r]" }),
						" 与 ",
						/* @__PURE__ */ jsx(M, { children: "[l,r{-}1]" }),
						" 长度都",
						/* @__PURE__ */ jsx("strong", { children: "比它短 1" }),
						"。所以递推仍",
						/* @__PURE__ */ jsx("strong", { children: "不能" }),
						"按 ",
						/* @__PURE__ */ jsx(M, { children: "l" }),
						" 或 ",
						/* @__PURE__ */ jsx(M, { children: "r" }),
						" 顺序走，必须",
						/* @__PURE__ */ jsx("strong", { children: "按区间长度由短到长" }),
						"——这是区间 DP 雷打不动的填表顺序。"
					] })]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"区间 DP 的两副面孔：石子合并",
						/* @__PURE__ */ jsx("strong", { children: "从中间枚举分割点" }),
						"（一分为二，追加区间和），两端取数 / 删除类",
						/* @__PURE__ */ jsx("strong", { children: "从两端收缩" }),
						"（每次砍掉一端，规模减一）。共同点是",
						/* @__PURE__ */ jsxs("strong", { children: [
							"状态都是连续区间 ",
							/* @__PURE__ */ jsx(M, { children: "[l,r]" }),
							"、都按长度递推"
						] }),
						"。博弈型再叠一层技巧：",
						/* @__PURE__ */ jsx("strong", { children: "用「净胜差」定义状态，子问题的领先在换手时取负" }),
						"，一个 ",
						/* @__PURE__ */ jsx(M, { children: "\\max" }),
						" 就把「双方都最优」编码进了转移。"
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
						"用开头的例子（",
						/* @__PURE__ */ jsx(M, { children: "a=[3,9,1,2]" }),
						"，下标 ",
						/* @__PURE__ */ jsx(M, { children: "1..4" }),
						"）走完整张三角表，重点盯住",
						/* @__PURE__ */ jsx("strong", { children: "长度由短到长" }),
						"、以及「减去子区间」这一步："
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
									" ",
									/* @__PURE__ */ jsx(M, { children: "dp[l][l]=a[l]" }),
									"：",
									/* @__PURE__ */ jsx(M, { children: "dp[1][1]=3,\\ dp[2][2]=9,\\ dp[3][3]=1,\\ dp[4][4]=2" }),
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
									/* @__PURE__ */ jsx("b", { children: "长度 2" }),
									"：",
									/* @__PURE__ */ jsx(M, { children: "dp[1][2]=\\max(3-9,\\ 9-3)=6" }),
									"；",
									/* @__PURE__ */ jsx(M, { children: "dp[2][3]=\\max(9-1,\\ 1-9)=8" }),
									"；",
									/* @__PURE__ */ jsx(M, { children: "dp[3][4]=\\max(1-2,\\ 2-1)=1" }),
									"。都取「先拿大的一端」，符合直觉。"
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
									"：",
									/* @__PURE__ */ jsx(M, { children: "dp[1][3]=\\max(a_1-dp[2][3],\\ a_3-dp[1][2])=\\max(3-8,\\ 1-6)=-5" }),
									"（这段先手",
									/* @__PURE__ */ jsx("strong", { children: "反而落后" }),
									"）；",
									/* @__PURE__ */ jsx(M, { children: "dp[2][4]=\\max(9-1,\\ 2-8)=8" }),
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
									"，整段 ",
									/* @__PURE__ */ jsx(M, { children: "[1,4]" }),
									"：",
									/* @__PURE__ */ jsx(M, { children: "\\max(a_1-dp[2][4],\\ a_4-dp[1][3])=\\max(3-8,\\ 2-(-5))=\\max(-5,7)=7" }),
									"。先手取",
									/* @__PURE__ */ jsx("strong", { children: "右端 2" }),
									"、把烫手的 ",
									/* @__PURE__ */ jsx(M, { children: "[1,3]" }),
									" 丢给对手，净胜 ",
									/* @__PURE__ */ jsx(M, { children: "7" }),
									"——总和 15，先手得 11、后手得 4。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把三角表",
						/* @__PURE__ */ jsx("strong", { children: "按长度一层层填满" }),
						"，每格高亮它选中的是「取左」还是「取右」、以及收缩后的那个子区间。改改数值，看先手的最优选择如何反转。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看三角表一层一层长出来 · 枚举分界、两段合并"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(MergeIntervalDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化：相邻相等合并（248）与升维到二维"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"两端收缩是这一类的「入门形态」。把操作换成",
						/* @__PURE__ */ jsx("strong", { children: "合并相邻元素并产生新值" }),
						"，就得到更有趣的一支——趣味十足的 ",
						/* @__PURE__ */ jsx("strong", { children: "248" }),
						"（脱胎自 2048）：一排数字，",
						/* @__PURE__ */ jsx("strong", { children: "相邻两个相等" }),
						"的可以并成一个「值 + 1」的数，不断合并，问最终能得到的",
						/* @__PURE__ */ jsx("strong", { children: "最大数字" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(Merge248Figure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "248 的合并规则：相邻且相等的两数并成 +1（两个 2 → 一个 3）；不相等则并不了。要合成更大的数，左右两段必须先各自缩成同一个数。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"它的状态回到",
							/* @__PURE__ */ jsx("strong", { children: "枚举分割点" }),
							"，但含义变了：设 ",
							/* @__PURE__ */ jsx(M, { children: "dp[l][r]" }),
							" = 区间 ",
							/* @__PURE__ */ jsx(M, { children: "[l,r]" }),
							" 若能反复合并",
							/* @__PURE__ */ jsx("strong", { children: "缩成单个数字" }),
							"，则那个数字的值，否则记 ",
							/* @__PURE__ */ jsx(M, { children: "0" }),
							"（不可合成）。一段能缩成 ",
							/* @__PURE__ */ jsx(M, { children: "v{+}1" }),
							"，",
							/* @__PURE__ */ jsx("strong", { children: "当且仅当" }),
							"存在分割点 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							"，使左段 ",
							/* @__PURE__ */ jsx(M, { children: "[l,k]" }),
							" 与右段 ",
							/* @__PURE__ */ jsx(M, { children: "[k{+}1,r]" }),
							" ",
							/* @__PURE__ */ jsxs("strong", { children: ["都能缩成同一个数 ", /* @__PURE__ */ jsx(M, { children: "v" })] }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[l][r]=\\max_{l\\le k<r,\\ dp[l][k]=dp[k+1][r]>0}\\big(dp[l][k]+1\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"全盘答案是",
							/* @__PURE__ */ jsxs("strong", { children: ["所有区间里最大的那个 ", /* @__PURE__ */ jsx(M, { children: "dp[l][r]" })] }),
							"——注意",
							/* @__PURE__ */ jsxs("strong", { children: ["不一定是整段 ", /* @__PURE__ */ jsx(M, { children: "dp[1][n]" })] }),
							"，因为整排未必能缩成单值，但某个子段可以。这正是 248 计分「看棋盘上最大的数」的由来。下一节的演示会把这张「能否合成」的三角表画出来。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "再往上一维。" }),
							" 一维的「合并连续区间」升到二维，就是",
							/* @__PURE__ */ jsx("strong", { children: "棋盘分割" }),
							"（例题 P1436）：把 ",
							/* @__PURE__ */ jsx(M, { children: "8\\times8" }),
							" 棋盘沿横 / 竖线递归切成若干矩形。状态从一维的 ",
							/* @__PURE__ */ jsx(M, { children: "dp[l][r]" }),
							" 膨胀成",
							/* @__PURE__ */ jsxs("strong", { children: ["一个矩形的四个坐标 ", /* @__PURE__ */ jsx(M, { children: "dp[k][x_1][y_1][x_2][y_2]" })] }),
							"，转移枚举「切在哪条横 / 竖线」——本质仍是",
							/* @__PURE__ */ jsx("strong", { children: "枚举最后一次分割、把大区域拆成两块子区域" }),
							"。这条「一维合并 → 二维分割」的线，正好把区间 DP 平滑地接到 ",
							/* @__PURE__ */ jsx(Link, {
								to: "/part/d/grid",
								style: { color: "var(--accent-2)" },
								children: "D 部分 · 网格 / 矩阵上的 DP"
							}),
							"。"
						] })
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "看 248 怎样把相邻相等的合并起来"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"默认 ",
						/* @__PURE__ */ jsx(M, { children: "a=[1,1,2,2]" }),
						"：两个 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						" 并成 ",
						/* @__PURE__ */ jsx(M, { children: "2" }),
						"，与原有的 ",
						/* @__PURE__ */ jsx(M, { children: "2,2" }),
						" 里的一个凑成 ",
						/* @__PURE__ */ jsx(M, { children: "2,2" }),
						" 再并成 ",
						/* @__PURE__ */ jsx(M, { children: "3" }),
						"——全盘最大数字是 ",
						/* @__PURE__ */ jsx("strong", { children: "3" }),
						"（落在子区间 ",
						/* @__PURE__ */ jsx(M, { children: "[1,3]" }),
						" 或 ",
						/* @__PURE__ */ jsx(M, { children: "[3,4]" }),
						" 上，而整段 ",
						/* @__PURE__ */ jsx(M, { children: "[1,4]" }),
						" 反而缩不成单值）。改改数值，观察哪些格能合成（非 0）、哪些卡住。"
					] })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(TwoFourEightDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "易错点：答案未必在右上角",
					children: [
						"两端取数型答案就在右上角 ",
						/* @__PURE__ */ jsx(M, { children: "dp[1][n]" }),
						"；但 248 这类",
						/* @__PURE__ */ jsx("strong", { children: "合成型" }),
						"，整段常常合成不了单值，右上角是 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						"。",
						/* @__PURE__ */ jsxs("strong", { children: [
							"务必在填表过程中用一个全局变量记下所有 ",
							/* @__PURE__ */ jsx(M, { children: "dp[l][r]" }),
							" 的最大值"
						] }),
						"，而不是直接输出 ",
						/* @__PURE__ */ jsx(M, { children: "dp[1][n]" }),
						"。这是初学者在 248 上最常见的翻车点。"
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
					pid: "P3146",
					name: "[USACO16OPEN] 248 G",
					src: "USACO2016(原生P)",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"一排 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个数（",
								/* @__PURE__ */ jsx(M, { children: "2\\le a_i\\le 40" }),
								"）。每次可把",
								/* @__PURE__ */ jsx("strong", { children: "相邻且相等" }),
								"的两个数并成一个「值 + 1」的数。求经过若干次合并后，能得到的",
								/* @__PURE__ */ jsx("strong", { children: "最大的那个数" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"合并类区间 DP 的旗舰：",
								/* @__PURE__ */ jsx(M, { children: "dp[l][r]" }),
								" = 区间能缩成的单一值（",
								/* @__PURE__ */ jsx(M, { children: "0" }),
								" 不可），枚举分割点要求",
								/* @__PURE__ */ jsx("strong", { children: "左右两段合成同一个数" }),
								"，方能再并一级。本页深化节 + 第二演示就是它的内核。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"2048 玩法的区间 DP 化身，趣味性极强、重交互演示天然契合。更重要的是它训练一个反直觉点：",
								/* @__PURE__ */ jsxs("strong", { children: [
									"答案不是 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][n]" }),
									"，而是全表最大值"
								] }),
								"——把「区间 DP 的答案一定在整段」的思维定式打破。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "dp[l][r]=\\max_{k}(dp[l][k]+1)" }),
								"（当 ",
								/* @__PURE__ */ jsx(M, { children: "dp[l][k]=dp[k+1][r]>0" }),
								"）；外层长度、内层左端点、最内分割点，",
								/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "n\\le 248" }),
								" 绰绰有余。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（合成三角表 · 全表取最大）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P3146,
								luogu: "P3146"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1436",
					name: "棋盘分割",
					src: "NOI1999",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "8\\times8" }),
								" 棋盘，每格有分值。沿",
								/* @__PURE__ */ jsx("strong", { children: "横线或竖线" }),
								"把棋盘切开、留一块、对另一块继续切，共切 ",
								/* @__PURE__ */ jsx(M, { children: "n-1" }),
								" 刀得 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 块矩形。设各块总分为 ",
								/* @__PURE__ */ jsx(M, { children: "x_i" }),
								"、均值 ",
								/* @__PURE__ */ jsx(M, { children: "\\bar x" }),
								"，求最小的",
								/* @__PURE__ */ jsx("strong", { children: "方差" }),
								" ",
								/* @__PURE__ */ jsx(M, { children: "\\sigma^2=\\tfrac1n\\sum(x_i-\\bar x)^2" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系（升维）",
							children: [
								"把一维「合并 / 分割连续区间」",
								/* @__PURE__ */ jsx("strong", { children: "升到二维" }),
								"：状态由 ",
								/* @__PURE__ */ jsx(M, { children: "dp[l][r]" }),
								" 膨胀成矩形四坐标 ",
								/* @__PURE__ */ jsx(M, { children: "f[k][x_1][y_1][x_2][y_2]" }),
								" = 该矩形切成 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 块的最小平方和；转移枚举切在哪条横 / 竖线，仍是",
								/* @__PURE__ */ jsx("strong", { children: "枚举最后一次分割" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它 · 衔接 D 部分",
							children: [
								"均值固定时",
								/* @__PURE__ */ jsxs("strong", { children: ["最小方差 ⇔ 最小 ", /* @__PURE__ */ jsx(M, { children: "\\sum x_i^2" })] }),
								"，先把目标化简，是本题第一关。二维前缀和 ",
								/* @__PURE__ */ jsx(M, { children: "O(1)" }),
								" 取矩形和、",
								/* @__PURE__ */ jsx("strong", { children: "记忆化搜索" }),
								"而非循环填表，都是从一维区间 DP 向",
								/* @__PURE__ */ jsx("strong", { children: "网格 / 矩阵 DP" }),
								" 过渡的钥匙——正好承上启下接到 D 部分。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[k][R]=\\min\\big(f[k_1][R_1]+f[k-k_1][R_2]\\big)" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "R_1,R_2" }),
								" 是 ",
								/* @__PURE__ */ jsx(M, { children: "R" }),
								" 被某条横 / 竖线切出的两个子矩形），枚举切线与 ",
								/* @__PURE__ */ jsx(M, { children: "k_1" }),
								"；状态 ",
								/* @__PURE__ */ jsx(M, { children: "O(n\\cdot 8^4)" }),
								"、每态枚举 ",
								/* @__PURE__ */ jsx(M, { children: "O(8\\cdot n)" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "n\\le 15" }),
								" 轻松通过。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（二维前缀和 · 记忆化分割）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1436,
								luogu: "P1436"
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
					pid: "P2858",
					name: "[USACO06FEB] Treats for the Cows G/S 奶牛零食",
					hint: "两端取数区间 DP 的直接应用：每天只能从零食序列最左或最右端取一个，第 t 天取出的价值要乘以天数 t。设 dp[l][r] 为取完区间 [l,r] 能得的最大加权总和，剩余天数 = 已取个数决定权重；从两端收缩、按长度递推。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2426",
					name: "删数",
					hint: "删除区间合并代价：dp[l][r] 表示删空区间 [l,r] 的最大收益。既可单个删（价值 a[i]），也可把两端 a[l]、a[r] 一起删得 (a[l]+a[r]+距离)，中间那段先删空。枚举分割点 / 端点配对，按长度递推。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2196",
					name: "[NOIP1996 提高组] 挖地雷",
					hint: "选取 / 路径变形（DAG 上区间不必连续）：地窖间单向连通，dp[i] = 以第 i 个地窖结尾的最大地雷数，转移取所有能到 i 的前驱最优值再加 a[i]；记录前驱以回溯输出路径。是区间 / 选取型 DP 的温和入门。"
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pointer-cue",
			children: [
				/* @__PURE__ */ jsx(Gamepad2, { size: 18 }),
				"想亲手体验「合并顺序如何改变结局」？到 ",
				/* @__PURE__ */ jsx(Link, {
					to: "/part/c",
					style: {
						color: "var(--accent-1)",
						fontWeight: 600
					},
					children: "C 部分页"
				}),
				"的互动里试着自己决定每一步的取 / 并，再对照 DP 给出的最优。"
			]
		})
	] });
}
//#endregion
export { MergeInterval as default };
