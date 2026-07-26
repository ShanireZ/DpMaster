import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, Minus, MousePointerClick, Plus, Scissors, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/ring-interval/internal.ts
function executeRingInterval(values, objective, emit) {
	if (values.length === 0) throw new RangeError("ring interval requires at least one value");
	for (const value of values) if (!Number.isFinite(value)) throw new RangeError("ring values must be finite");
	const n = values.length;
	const doubled = Array.from({ length: n * 2 }, (_, index) => values[index % n]);
	const prefix = [0];
	for (const value of doubled) prefix.push(prefix[prefix.length - 1] + value);
	const table = Array.from({ length: n * 2 }, () => Array(n * 2).fill(0));
	const better = objective === "min" ? (candidate, current) => candidate < current : (candidate, current) => candidate > current;
	for (let length = 2; length <= n; length++) for (let left = 0; left + length <= doubled.length; left++) {
		const right = left + length - 1;
		const sum = prefix[right + 1] - prefix[left];
		let splitValue = objective === "min" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
		let bestSplit = left;
		for (let split = left; split < right; split++) {
			const candidate = table[left][split] + table[split + 1][right];
			if (better(candidate, splitValue)) {
				splitValue = candidate;
				bestSplit = split;
			}
		}
		table[left][right] = splitValue + sum;
		emit({
			type: "settled",
			left,
			right,
			split: bestSplit,
			splitValue,
			sum,
			value: table[left][right],
			isWindow: length === n && left < n
		});
	}
	const windows = Array.from({ length: n }, (_, start) => table[start][start + n - 1]);
	let start = 0;
	for (let index = 1; index < n; index++) if (better(windows[index], windows[start])) start = index;
	return {
		objective,
		cost: windows[start],
		start,
		windows,
		table,
		doubled
	};
}
function recordRingInterval(values, objective = "min") {
	const events = [];
	return {
		result: executeRingInterval(values, objective, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/components/demos/interval/ringSolver.ts
function settled(table) {
	const states = {};
	for (let row = 0; row < table.length; row++) for (let column = 0; column < table[row].length; column++) if (table[row][column] !== null) states[key(row, column)] = "settled";
	return states;
}
function ringMerge(values, objective = "min") {
	const run = recordRingInterval(values, objective);
	const n = values.length;
	const size = n * 2;
	const table = Array.from({ length: size }, () => Array(size).fill(null));
	for (let index = 0; index < size; index++) table[index][index] = 0;
	const snapshot = () => table.map((row) => row.slice());
	const optimum = objective === "min" ? "最小" : "最大";
	const operator = objective === "min" ? "\\min" : "\\max";
	const frames = [{
		values: snapshot(),
		states: settled(table),
		caption: `<b>断环为链</b>：把 ${n} 堆复制一倍成长度 2n=${size} 的链；对角线 dp[l][l]=0。`,
		formula: "a2[i]=a[i\\bmod n],\\quad dp[l][l]=0"
	}];
	for (const event of run.events) {
		table[event.left][event.right] = event.value;
		const states = settled(table);
		states[key(event.left, event.split)] = "chosen";
		states[key(event.split + 1, event.right)] = "chosen";
		states[key(event.left, event.right)] = "current";
		const arrows = [{
			from: {
				r: event.left,
				c: event.split
			},
			to: {
				r: event.left,
				c: event.right
			},
			kind: "chosen"
		}, {
			from: {
				r: event.split + 1,
				c: event.right
			},
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
			caption: `区间 <b>[${event.left},${event.right}]</b>：分割代价取${optimum} ${event.splitValue}，加区间和 ${event.sum} → <b>${event.value}</b>（k=${event.split}）。${event.isWindow ? "这是一个完整环形窗口。" : ""}`,
			formula: `dp[${event.left}][${event.right}]=${operator}_k(dp[l][k]+dp[k+1][r])+${event.sum}=${event.value}`
		});
	}
	const finalStates = settled(table);
	for (let start = 0; start < n; start++) finalStates[key(start, start + n - 1)] = "source";
	finalStates[key(run.result.start, run.result.start + n - 1)] = "chosen";
	frames.push({
		values: snapshot(),
		states: finalStates,
		caption: `扫描 ${n} 个整圈窗口，取${optimum} → <b>环形答案 = ${run.result.cost}</b>（起点 ${run.result.start}）。`,
		formula: `\\mathrm{ans}=${operator}_{0\\le i<${n}}dp[i][i+${n}-1]=${run.result.cost}`
	});
	return {
		rows: size,
		cols: size,
		cell: 38,
		rowHeaderLabels: Array.from({ length: size }, (_, index) => `l=${index}`),
		colHeaderLabels: Array.from({ length: size }, (_, index) => `r=${index}`),
		frames
	};
}
//#endregion
//#region src/algorithms/ring-interval/index.ts
function solveRingInterval(values, objective = "min") {
	return executeRingInterval(values, objective, ignoreEvents);
}
//#endregion
//#region src/components/demos/interval/RingIntervalDemo.tsx
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
/** 环形石子合并（断环为链）演示：环上 n 堆复制成 2n 链，在链上跑区间三角表，取长度 n 窗口最优。可改环上数值。 */
function RingIntervalDemo() {
	const [stones, setStones] = useState([
		3,
		9,
		3,
		4
	]);
	const model = useMemo(() => ringMerge(stones, "min"), [stones]);
	const ans = useMemo(() => solveRingInterval(stones).cost, [stones]);
	const modelKey = `ring-${stones.join("_")}`;
	const setStone = (i, val) => setStones((arr) => arr.map((s, k) => k === i ? val : s));
	const addStone = () => setStones((arr) => arr.length < 4 ? [...arr, 3] : arr);
	const removeStone = (i) => setStones((arr) => arr.length > 3 ? arr.filter((_, k) => k !== i) : arr);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "kd__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "环上石子（首尾相邻 · 可改每堆数值 · 3～4 堆）"
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
							max: 20,
							onChange: (v) => setStone(i, v)
						})
					]
				}, i)), stones.length < 4 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: addStone,
					children: [/* @__PURE__ */ jsx(Plus, { size: 14 }), " 加一堆"]
				})]
			})] })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"断环为链后在 ",
				/* @__PURE__ */ jsxs("b", { children: ["2n = ", stones.length * 2] }),
				" 长的链上填三角表，扫 ",
				stones.length,
				" 个长度",
				" ",
				stones.length,
				" 的窗口 → 环形",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: ["最小合并代价 = ", ans]
				}),
				"。默认",
				" ",
				/* @__PURE__ */ jsx("b", { children: "a=[3,9,3,4]" }),
				" 时答案 ",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: "36"
				}),
				"，落在起点 ",
				/* @__PURE__ */ jsx("b", { children: "1" }),
				" 的窗口（即环上从第 1 堆断开、绕过尾首那一整圈）， 比朴素当成直链的 dp[0][3]=38 更省——这正是「环」多出来的那条边带来的收益。"
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/components/demos/interval/RingChainDemo.tsx
var RING = [
	3,
	9,
	3,
	4
];
function RingChainDemo() {
	const n = RING.length;
	const [cut, setCut] = useState(1);
	const a2 = [...RING, ...RING];
	const cx = 130;
	const cy = 130;
	const R = 84;
	const pos = (i) => {
		const ang = -Math.PI / 2 + i * 2 * Math.PI / n;
		return {
			x: cx + R * Math.cos(ang),
			y: cy + R * Math.sin(ang)
		};
	};
	const cutAng = -Math.PI / 2 + (cut - .5) * 2 * Math.PI / n;
	const cutPt = {
		x: cx + 88 * Math.cos(cutAng),
		y: cy + 88 * Math.sin(cutAng)
	};
	const bw = 42;
	const gap = 6;
	const lx0 = 300;
	const lY = 96;
	const winStart = cut;
	const winW = n * 48 - gap;
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "kd__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "选一个断点，看环怎样展开成 2n 直链"
			}), /* @__PURE__ */ jsx("div", {
				className: "kd__modes",
				children: Array.from({ length: n }, (_, i) => /* @__PURE__ */ jsxs("button", {
					className: `kd__mode ${cut === i ? "on" : ""}`,
					onClick: () => setCut(i),
					children: [
						/* @__PURE__ */ jsx(Scissors, {
							size: 12,
							style: {
								verticalAlign: "-1px",
								marginRight: 4
							}
						}),
						"第 ",
						i === 0 ? n - 1 : i - 1,
						"｜",
						i,
						" 堆之间"
					]
				}, i))
			})] })
		}),
		/* @__PURE__ */ jsxs("svg", {
			viewBox: "0 0 620 260",
			role: "img",
			"aria-label": "环从选定断点展开成 2n 长的链",
			children: [
				/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
					id: "rc-ar",
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
				/* @__PURE__ */ jsx("circle", {
					cx,
					cy,
					r: R,
					fill: "none",
					stroke: "var(--border-strong)",
					strokeWidth: "1.5",
					strokeDasharray: "4 5"
				}),
				RING.map((p, i) => {
					const { x, y } = pos(i);
					const isStart = i === cut;
					return /* @__PURE__ */ jsxs("g", { children: [
						/* @__PURE__ */ jsx("circle", {
							cx: x,
							cy: y,
							r: "20",
							fill: isStart ? "color-mix(in srgb, var(--viz-chosen) 16%, var(--surface-3))" : "var(--surface-3)",
							stroke: isStart ? "var(--viz-chosen)" : "var(--border-strong)",
							strokeWidth: isStart ? 2.5 : 1.5
						}),
						/* @__PURE__ */ jsx("text", {
							x,
							y: y - 2,
							textAnchor: "middle",
							fontSize: "9.5",
							fill: "var(--text-3)",
							children: i
						}),
						/* @__PURE__ */ jsx("text", {
							x,
							y: y + 12,
							textAnchor: "middle",
							fontSize: "13",
							className: "mono",
							fill: "var(--accent-1)",
							children: p
						})
					] }, i);
				}),
				/* @__PURE__ */ jsx("text", {
					x: cutPt.x,
					y: cutPt.y + 5,
					textAnchor: "middle",
					fontSize: "16",
					fill: "var(--viz-chosen)",
					children: "✂"
				}),
				/* @__PURE__ */ jsxs("text", {
					x: cx,
					y: 133,
					textAnchor: "middle",
					fontSize: "11.5",
					fill: "var(--text-2)",
					children: ["起点 ", cut]
				}),
				/* @__PURE__ */ jsx("path", {
					d: "M 232 130 H 288",
					stroke: "var(--accent-2)",
					strokeWidth: "2",
					markerEnd: "url(#rc-ar)",
					fill: "none"
				}),
				/* @__PURE__ */ jsx("text", {
					x: "260",
					y: "120",
					textAnchor: "middle",
					fontSize: "11",
					fill: "var(--accent-1)",
					children: "展开"
				}),
				a2.map((p, i) => {
					const x = lx0 + i * 48;
					const isCopy = i >= n;
					return /* @__PURE__ */ jsxs("g", {
						transform: `translate(${x},${lY})`,
						children: [
							/* @__PURE__ */ jsx("rect", {
								width: bw,
								height: "40",
								rx: "9",
								fill: isCopy ? "color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))" : "var(--surface-3)",
								stroke: isCopy ? "var(--accent-2)" : "var(--border-strong)",
								strokeWidth: "1.5",
								strokeDasharray: isCopy ? "4 3" : void 0
							}),
							/* @__PURE__ */ jsx("text", {
								x: bw / 2,
								y: "25",
								textAnchor: "middle",
								fontSize: "14",
								className: "mono",
								fill: "var(--text-1)",
								children: p
							}),
							/* @__PURE__ */ jsx("text", {
								x: bw / 2,
								y: "-6",
								textAnchor: "middle",
								fontSize: "9",
								className: "mono",
								fill: "var(--text-3)",
								children: i
							})
						]
					}, i);
				}),
				/* @__PURE__ */ jsx("rect", {
					x: lx0 + winStart * 48 - 4,
					y: lY - 12,
					width: winW + 8,
					height: "64",
					rx: "11",
					fill: "none",
					stroke: "var(--viz-chosen)",
					strokeWidth: "2.5"
				}),
				/* @__PURE__ */ jsxs("text", {
					x: lx0 + winStart * 48 + winW / 2,
					y: 162,
					textAnchor: "middle",
					fontSize: "11.5",
					fill: "var(--viz-chosen)",
					children: [
						"窗口 dp[",
						winStart,
						"][",
						winStart + n - 1,
						"]：从起点 ",
						cut,
						" 起的一整圈（",
						n,
						" 堆）"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"换个断点，窗口就在 2n 链上",
				/* @__PURE__ */ jsx("b", { children: "整体平移" }),
				"一格，覆盖的仍是环上的",
				/* @__PURE__ */ jsxs("b", { children: [
					"同一圈 ",
					n,
					" 堆"
				] }),
				"、只是起止不同。",
				/* @__PURE__ */ jsxs("b", { children: [
					"因此环形答案不能只看一个 dp[0][",
					n - 1,
					"]"
				] }),
				"——要把这 ",
				n,
				" 个平移窗口都试一遍，取最优。链一旦复制成 2n，",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: "任何一种“从哪儿断”都变成链上一个现成的连续区间"
				}),
				"，环形问题就此化归为已会的链形区间 DP。"
			]
		})
	] });
}
//#endregion
//#region src/content/c/RingIntervalArt.tsx
function RingSetupFigure() {
	const piles = [
		3,
		9,
		3,
		4
	];
	const n = piles.length;
	const cx = 155;
	const cy = 118;
	const R = 78;
	const pos = (i) => {
		const ang = -Math.PI / 2 + i * 2 * Math.PI / n;
		return {
			x: cx + R * Math.cos(ang),
			y: cy + R * Math.sin(ang)
		};
	};
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 520 236",
		role: "img",
		"aria-label": "n 堆石子摆成一个环，首尾相邻",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx,
				cy,
				r: R,
				fill: "none",
				stroke: "var(--border-strong)",
				strokeWidth: "1.5",
				strokeDasharray: "4 5"
			}),
			piles.map((p, i) => {
				const { x, y } = pos(i);
				const wrap = i === 0 || i === n - 1;
				return /* @__PURE__ */ jsxs("g", { children: [
					/* @__PURE__ */ jsx("circle", {
						cx: x,
						cy: y,
						r: "24",
						fill: wrap ? "color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))" : "var(--surface-3)",
						stroke: wrap ? "var(--accent-2)" : "var(--border-strong)",
						strokeWidth: wrap ? 2.5 : 1.5
					}),
					/* @__PURE__ */ jsxs("text", {
						x,
						y: y - 3,
						textAnchor: "middle",
						fontSize: "10.5",
						fill: "var(--text-3)",
						children: [
							"第 ",
							i,
							" 堆"
						]
					}),
					/* @__PURE__ */ jsx("text", {
						x,
						y: y + 13,
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--accent-1)",
						children: p
					})
				] }, i);
			}),
			/* @__PURE__ */ jsx("text", {
				x: cx,
				y: 122,
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "环"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(300,40)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "196",
						height: "156",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "98",
						y: "30",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "和链形唯一的差别"
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "20",
						y: "64",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: [
							"· 第 0 堆与第 ",
							n - 1,
							" 堆"
						]
					}),
					/* @__PURE__ */ jsx("text", {
						x: "34",
						y: "84",
						fontSize: "12.5",
						fill: "var(--accent-1)",
						children: "也相邻，可以合并"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "20",
						y: "116",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "· 最后剩的那一堆，"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "34",
						y: "136",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "起点断在哪里不定"
					})
				]
			})
		]
	});
}
function BreakRingFigure() {
	const a = [
		3,
		9,
		3,
		4
	];
	const n = a.length;
	const cx = 92;
	const cy = 96;
	const R = 56;
	const pos = (i) => {
		const ang = -Math.PI / 2 + i * 2 * Math.PI / n;
		return {
			x: cx + R * Math.cos(ang),
			y: cy + R * Math.sin(ang)
		};
	};
	const a2 = [...a, ...a];
	const bx0 = 250;
	const bw = 40;
	const gap = 6;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 214",
		role: "img",
		"aria-label": "把环剪开复制一倍拼成长度 2n 的链",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "br-ar",
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
			/* @__PURE__ */ jsx("circle", {
				cx,
				cy,
				r: R,
				fill: "none",
				stroke: "var(--border-strong)",
				strokeWidth: "1.5",
				strokeDasharray: "4 5"
			}),
			a.map((p, i) => {
				const { x, y } = pos(i);
				return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("circle", {
					cx: x,
					cy: y,
					r: "17",
					fill: "var(--surface-3)",
					stroke: "var(--border-strong)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x,
					y: y + 5,
					textAnchor: "middle",
					fontSize: "13",
					className: "mono",
					fill: "var(--accent-1)",
					children: p
				})] }, i);
			}),
			/* @__PURE__ */ jsx("text", {
				x: 94,
				y: cy - R - 10,
				textAnchor: "middle",
				fontSize: "15",
				fill: "var(--accent-2)",
				children: "✂"
			}),
			/* @__PURE__ */ jsx("text", {
				x: cx,
				y: 178,
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--text-2)",
				children: "任选一处剪开"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M 168 96 H 236`,
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				markerEnd: "url(#br-ar)",
				fill: "none"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "202",
				y: "86",
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--accent-1)",
				children: "复制一倍"
			}),
			a2.map((p, i) => {
				const x = bx0 + i * 46;
				const isCopy = i >= n;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x},76)`,
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: bw,
							height: "40",
							rx: "9",
							fill: isCopy ? "color-mix(in srgb, var(--accent-1) 9%, var(--surface-3))" : "var(--surface-3)",
							stroke: isCopy ? "var(--accent-2)" : "var(--border-strong)",
							strokeWidth: "1.5",
							strokeDasharray: isCopy ? "4 3" : void 0
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "25",
							textAnchor: "middle",
							fontSize: "14",
							className: "mono",
							fill: "var(--text-1)",
							children: p
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "-6",
							textAnchor: "middle",
							fontSize: "9.5",
							className: "mono",
							fill: "var(--text-3)",
							children: i
						})
					]
				}, i);
			}),
			/* @__PURE__ */ jsx("text", {
				x: bx0 + 46 * (n / 2) - gap / 2,
				y: "140",
				textAnchor: "middle",
				fontSize: "10.5",
				fill: "var(--text-3)",
				children: "原始 n 堆"
			}),
			/* @__PURE__ */ jsx("text", {
				x: bx0 + 46 * (n + n / 2) - gap / 2,
				y: "140",
				textAnchor: "middle",
				fontSize: "10.5",
				fill: "var(--accent-1)",
				children: "复制的 n 堆"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M 294 160 H ${480 - gap - 2}`,
				stroke: "var(--viz-chosen)",
				strokeWidth: "2.5",
				markerStart: "url(#br-ar)",
				markerEnd: "url(#br-ar)",
				fill: "none"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 388 - gap / 2,
				y: "180",
				textAnchor: "middle",
				fontSize: "11",
				fill: "var(--viz-chosen)",
				children: "窗口 [1, 4]：从第 1 堆起、绕过尾首的一整圈"
			})
		]
	});
}
function WindowScanFigure() {
	const n = 4;
	const total = 2 * n;
	const bw = 40;
	const gap = 6;
	const x0 = 40;
	const rowY = (r) => 62 + r * 40;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 480 254",
		role: "img",
		"aria-label": "在 2n 链上枚举所有长度为 n 的窗口",
		children: [
			Array.from({ length: total }, (_, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${x0 + i * 46},28)`,
				children: [/* @__PURE__ */ jsx("rect", {
					width: bw,
					height: "26",
					rx: "7",
					fill: "var(--surface-3)",
					stroke: "var(--border-strong)",
					strokeWidth: "1.2"
				}), /* @__PURE__ */ jsx("text", {
					x: bw / 2,
					y: "18",
					textAnchor: "middle",
					fontSize: "12",
					className: "mono",
					fill: "var(--text-3)",
					children: i
				})]
			}, i)),
			Array.from({ length: n }, (_, i) => {
				const x = x0 + i * 46;
				const w = n * 46 - gap;
				return /* @__PURE__ */ jsxs("g", { children: [
					/* @__PURE__ */ jsx("rect", {
						x,
						y: rowY(i),
						width: w,
						height: "26",
						rx: "7",
						fill: "color-mix(in srgb, var(--accent-1) 14%, var(--surface-2))",
						stroke: "var(--accent-2)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsxs("text", {
						x: x + w / 2,
						y: rowY(i) + 17,
						textAnchor: "middle",
						fontSize: "11.5",
						className: "mono",
						fill: "var(--text-1)",
						children: [
							"dp[",
							i,
							"][",
							i + n - 1,
							"]"
						]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: x0 - 14,
						y: rowY(i) + 17,
						textAnchor: "end",
						fontSize: "10.5",
						fill: "var(--text-3)",
						children: ["起点 ", i]
					})
				] }, i);
			}),
			/* @__PURE__ */ jsxs("text", {
				x: x0,
				y: rowY(n) + 20,
				fontSize: "12",
				fill: "var(--text-2)",
				children: [
					"环形答案 = min / max 这 ",
					/* @__PURE__ */ jsx("tspan", {
						className: "mono",
						fill: "var(--accent-1)",
						children: "n"
					}),
					" 个窗口值"
				]
			}),
			/* @__PURE__ */ jsx("text", {
				x: x0,
				y: rowY(n) + 40,
				fontSize: "11",
				fill: "var(--text-3)",
				children: "（长度超过 n 的窗口会让某堆被合并两次，非法，不枚举）"
			})
		]
	});
}
//#endregion
//#region src/content/c/RingInterval.tsx
var CODE_P1880 = `
#include <iostream>
using namespace std;

const int INF = 0x3f3f3f3f;
int a[205];                       // ★断环为链：a[i] 与 a[i+n] 同值，链长 2n
int pre[205];                     // 前缀和，sum(l..r) = pre[r] - pre[l-1]
int f[205][205];                 // 最小合并代价
int g[205][205];                 // 最大合并代价

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        a[i + n] = a[i];          // ★复制一倍，接成长度 2n 的链
    }
    for (int i = 1; i <= 2 * n; i++)
        pre[i] = pre[i - 1] + a[i];

    for (int len = 2; len <= n; len++)          // 区间长度只需到 n（一整圈）
        for (int l = 1; l + len - 1 <= 2 * n; l++)
        {
            int r = l + len - 1;
            int s = pre[r] - pre[l - 1];        // 本区间合并追加的代价
            f[l][r] = INF;
            g[l][r] = -INF;
            for (int k = l; k <= r - 1; k++)    // 枚举分割点 k
            {
                f[l][r] = min(f[l][r], f[l][k] + f[k + 1][r] + s);
                g[l][r] = max(g[l][r], g[l][k] + g[k + 1][r] + s);
            }
        }

    int mn = INF, mx = -INF;
    for (int i = 1; i <= n; i++)                 // ★枚举 n 个长度为 n 的窗口
    {
        mn = min(mn, f[i][i + n - 1]);
        mx = max(mx, g[i][i + n - 1]);
    }
    cout << mn << endl;                          // 一题双问：最小、最大
    cout << mx << endl;
    return 0;
}`;
var CODE_P1063 = `
#include <iostream>
using namespace std;

int e[205];                       // 珠子上的标记值，断环为链后长 2n
long long f[205][205];           // f[i][j]：把标记 i..j 之间的珠子合成一颗的最大释放能量

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> e[i];
        e[i + n] = e[i];          // ★复制一倍
    }

    long long ans = 0;
    for (int len = 2; len <= n; len++)          // len = 相邻标记跨度，含 len 个原珠首尾标记
        for (int i = 1; i + len <= 2 * n; i++)
        {
            int j = i + len;                    // 合成后新珠的两端标记 e[i]、e[j]
            for (int k = i + 1; k < j; k++)     // 枚举最后一次并珠处的中间标记 k
            {
                long long v = f[i][k] + f[k][j] + (long long)e[i] * e[k] * e[j];
                f[i][j] = max(f[i][j], v);       // ★最后一并释放 head*mid*tail
            }
            if (len == n)                        // 一整圈：更新答案
                ans = max(ans, f[i][j]);
        }

    cout << ans << endl;
    return 0;
}`;
function RingInterval() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "当石子摆成一个环"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"上一节的石子排成一条",
						/* @__PURE__ */ jsx("strong", { children: "链" }),
						"：两端是「头」和「尾」，谁也不挨着谁。可",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/c/stone",
							style: { color: "var(--accent-2)" },
							children: "石子合并"
						}),
						"的原题（P1880）里，石子其实摆成一个",
						/* @__PURE__ */ jsx("strong", { children: "环" }),
						"——第 ",
						/* @__PURE__ */ jsx(M, { children: "n-1" }),
						" 堆与第 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						" 堆",
						/* @__PURE__ */ jsx("strong", { children: "也相邻" }),
						"，也能合并。规则不变：每次并",
						/* @__PURE__ */ jsx("strong", { children: "相邻两堆" }),
						"、代价为两堆之和，直到剩一堆，求最小（或最大）总代价。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(RingSetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "环形石子：n 堆首尾相接，第 0 堆与第 n-1 堆之间多出一条「链形没有」的相邻边——这正是环与链唯一的差别。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"差别虽小，却",
						/* @__PURE__ */ jsx("strong", { children: "不能直接照搬链形" }),
						"。链形 ",
						/* @__PURE__ */ jsx(M, { children: "dp[1][n]" }),
						" 默认最后剩下的那堆",
						/* @__PURE__ */ jsxs("strong", { children: [
							"断在第 ",
							/* @__PURE__ */ jsx(M, { children: "1" }),
							" 堆左侧"
						] }),
						"；但在环上，「最后剩的那堆从哪里断开」是",
						/* @__PURE__ */ jsx("strong", { children: "自由的" }),
						"——可以从任意一堆起、绕一圈回来。以 ",
						/* @__PURE__ */ jsx(M, { children: "a=[3,9,3,4]" }),
						" 为例：当成直链算得 ",
						/* @__PURE__ */ jsx(M, { children: "dp[0][3]=38" }),
						"；可若允许「先并第 3 堆与第 0 堆」（环上它们相邻），从第 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						" 堆起绕一圈只需 ",
						/* @__PURE__ */ jsx(M, { children: "36" }),
						"。",
						/* @__PURE__ */ jsx("strong", { children: "那条多出来的边，能让合并更省" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"也别想着「枚举每个断点，各跑一遍链形 DP」——那要跑 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 遍、白白多花一个 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 倍。有没有办法",
						/* @__PURE__ */ jsx("strong", { children: "一次把所有断法都算进去" }),
						"？有，而且极简洁：",
						/* @__PURE__ */ jsx("strong", { children: "断环为链" }),
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
					children: "断环为链：复制一倍，环上任一圈都成了链上一段"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"核心一招：把石子数组",
						/* @__PURE__ */ jsx("strong", { children: "复制一倍" }),
						"，首尾拼成一条长度 ",
						/* @__PURE__ */ jsx(M, { children: "2n" }),
						" 的链",
						/* @__PURE__ */ jsx(M, { children: "a2[0\\ldots 2n-1]" }),
						"，其中 ",
						/* @__PURE__ */ jsx(M, { children: "a2[i]=a[i\\bmod n]" }),
						"。这样一来，",
						/* @__PURE__ */ jsxs("strong", { children: [
							"环上从任意堆起、绕一整圈的那 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 堆"
						] }),
						"，在这条 ",
						/* @__PURE__ */ jsx(M, { children: "2n" }),
						" 链里都恰好是一段",
						/* @__PURE__ */ jsx("strong", { children: "连续区间" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "[i,\\ i+n-1]" }),
						"。原本「绕过尾首」的麻烦相邻边，被复制的那半段",
						/* @__PURE__ */ jsx("strong", { children: "抹平成了普通的链内相邻" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BreakRingFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "从任一处剪开环、把 n 堆复制一倍接成 2n 链。环上「从第 1 堆起绕一圈」= 链上连续区间 [1,4]——绕过尾首的相邻，变成了链内相邻。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"于是环形问题被",
							/* @__PURE__ */ jsx("strong", { children: "化归成链形" }),
							"：在 ",
							/* @__PURE__ */ jsx(M, { children: "a2" }),
							" 上跑",
							/* @__PURE__ */ jsx("strong", { children: "一模一样" }),
							"的区间三角表（状态、转移、按长度递推，全部照搬上一节），只是网格从 ",
							/* @__PURE__ */ jsx(M, { children: "n\\times n" }),
							" 变成 ",
							/* @__PURE__ */ jsx(M, { children: "2n\\times 2n" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[l][r]=\\min_{l\\le k\\le r-1}\\big(dp[l][k]+dp[k+1][r]\\big)+\\mathrm{sum}(a2[l..r])" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"算完之后，环形答案不是某一格，而是",
							/* @__PURE__ */ jsx("strong", { children: "枚举所有起点" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "i=0,1,\\ldots,n-1" }),
							"，在这 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 个「整圈窗口」里取最优："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\mathrm{ans}=\\min_{0\\le i<n} dp[i][i+n-1]" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"为什么长度只需枚举到 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							"、窗口长度恰取 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							"？因为一整圈正好 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 堆：长度小于 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 合不完，长度大于 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 会让某堆",
							/* @__PURE__ */ jsx("strong", { children: "被数两次" }),
							"（既在原段、又在复制段），非法。取 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							" 就把 ",
							/* @__PURE__ */ jsx(M, { children: "\\min" }),
							" 换成 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							"，一字不改。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"环形区间 DP = ",
						/* @__PURE__ */ jsx("strong", { children: "链形区间 DP + 一层「断点」枚举" }),
						"，而这层枚举被",
						/* @__PURE__ */ jsxs("strong", { children: [
							"「复制一倍成 ",
							/* @__PURE__ */ jsx(M, { children: "2n" }),
							" 链」"
						] }),
						"悄悄吸收进了同一张三角表里。诀窍在于：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"环上任一条连续弧，在 ",
							/* @__PURE__ */ jsx(M, { children: "2n" }),
							" 链上都能找到一段等价的连续区间"
						] }),
						"——于是「从哪里断」不必外层重复跑，只需最后在 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个长度为 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 的窗口里取最优。复杂度仍是三层循环，",
						/* @__PURE__ */ jsx(M, { children: "O((2n)^3)=O(n^3)" }),
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
					children: "跟着算一遍：a=[3,9,3,4] 的那个更省的窗口"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"仍用 ",
						/* @__PURE__ */ jsx(M, { children: "a=[3,9,3,4]" }),
						"。复制一倍得 ",
						/* @__PURE__ */ jsx(M, { children: "a2=[3,9,3,4,\\ 3,9,3,4]" }),
						"（下标 ",
						/* @__PURE__ */ jsx(M, { children: "0\\ldots7" }),
						"），前缀和 ",
						/* @__PURE__ */ jsx(M, { children: "pre=[0,3,12,15,19,22,31,34,38]" }),
						"。答案落在",
						/* @__PURE__ */ jsxs("strong", { children: [
							"起点 ",
							/* @__PURE__ */ jsx(M, { children: "1" }),
							" 的窗口"
						] }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "[1,4]" }),
						"（对应 ",
						/* @__PURE__ */ jsx(M, { children: "a2[1..4]=[9,3,4,3]" }),
						"，即环上从第 1 堆绕一圈）。把这个窗口按长度算出来："
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
									/* @__PURE__ */ jsx("b", { children: "长度 1" }),
									"：对角线全 ",
									/* @__PURE__ */ jsx(M, { children: "0" }),
									"。",
									/* @__PURE__ */ jsx("b", { children: "长度 2" }),
									"（区间和即两堆之和）：",
									/* @__PURE__ */ jsx(M, { children: "dp[1][2]=12" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "9{+}3" }),
									"）、",
									/* @__PURE__ */ jsx(M, { children: "dp[2][3]=7" }),
									"、",
									/* @__PURE__ */ jsx(M, { children: "dp[3][4]=7" }),
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
									/* @__PURE__ */ jsx("b", { children: "长度 3" }),
									"，看 ",
									/* @__PURE__ */ jsx(M, { children: "[1,3]" }),
									"（区间和 ",
									/* @__PURE__ */ jsx(M, { children: "16" }),
									"）：",
									/* @__PURE__ */ jsx(M, { children: "k=1" }),
									"→",
									/* @__PURE__ */ jsx(M, { children: "0+7=7" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "k=2" }),
									"→",
									/* @__PURE__ */ jsx(M, { children: "12+0=12" }),
									"。取小 ",
									/* @__PURE__ */ jsx(M, { children: "7" }),
									"，加 ",
									/* @__PURE__ */ jsx(M, { children: "16" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][3]=23" }),
									"。同理 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][4]=17" }),
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
									/* @__PURE__ */ jsx("b", { children: "长度 4" }),
									"（整圈窗口），看 ",
									/* @__PURE__ */ jsx(M, { children: "[1,4]" }),
									"（区间和 ",
									/* @__PURE__ */ jsx(M, { children: "19" }),
									"）：",
									/* @__PURE__ */ jsx(M, { children: "k=1" }),
									"→",
									/* @__PURE__ */ jsx(M, { children: "0+17=17" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "k=2" }),
									"→",
									/* @__PURE__ */ jsx(M, { children: "12+7=19" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "k=3" }),
									"→",
									/* @__PURE__ */ jsx(M, { children: "23+0=23" }),
									"。取小 ",
									/* @__PURE__ */ jsx(M, { children: "17" }),
									"，加 ",
									/* @__PURE__ */ jsx(M, { children: "19" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][4]=36" }),
									"。"
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "step",
							children: [/* @__PURE__ */ jsx("span", {
								className: "step__n",
								children: "✓"
							}), /* @__PURE__ */ jsxs("div", {
								className: "step__b",
								children: [
									/* @__PURE__ */ jsx("b", { children: "扫窗取优" }),
									"：四个窗口 ",
									/* @__PURE__ */ jsx(M, { children: "dp[0][3]=38,\\ dp[1][4]=36,\\ dp[2][5]=36,\\ dp[3][6]=38" }),
									"，最小 ",
									/* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsx(M, { children: "36" }) }),
									"——比朴素直链的 ",
									/* @__PURE__ */ jsx(M, { children: "38" }),
									" 省 ",
									/* @__PURE__ */ jsx(M, { children: "2" }),
									"。这 ",
									/* @__PURE__ */ jsx(M, { children: "2" }),
									"，就是那条「尾首相邻边」买来的。"
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
						/* @__PURE__ */ jsx(M, { children: "2n" }),
						" 链的三角表",
						/* @__PURE__ */ jsx("strong", { children: "按长度一层层填满" }),
						"，末帧再",
						/* @__PURE__ */ jsxs("strong", { children: [
							"并排点亮 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 个整圈窗口"
						] }),
						"、圈出最优的那个。改改环上数值，看答案落到哪个起点。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看 2n 链的三角表长出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(RingIntervalDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "为什么要枚举窗口：一张图看断点如何平移"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"断环为链的",
						/* @__PURE__ */ jsx("strong", { children: "几何直觉" }),
						"是：",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个「整圈窗口」",
						/* @__PURE__ */ jsx(M, { children: "[0,n-1],[1,n],\\ldots,[n-1,2n-2]" }),
						" 在 ",
						/* @__PURE__ */ jsx(M, { children: "2n" }),
						" 链上",
						/* @__PURE__ */ jsx("strong", { children: "逐格右移" }),
						"，每一个对应「从某堆断开」的一种合并方案。它们覆盖的都是环上同一圈的 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 堆，只是",
						/* @__PURE__ */ jsx("strong", { children: "起止不同" }),
						"——所以答案要在它们之间取最优，缺一不可。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(WindowScanFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "2n 链上，n 个长度为 n 的窗口逐行下移（起点 0→n-1）；环形答案 = 这 n 个 dp[i][i+n-1] 的最优。长度超过 n 会重复计堆，非法。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"记死这套",
						/* @__PURE__ */ jsx("strong", { children: "「复制一倍 + 三层循环 + 扫窗」" }),
						"骨架——几乎所有环形合并/区间题都用它："
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
						children: `for i = 0 … n-1:  a2[i+n] = a[i]          // ★复制一倍，链长 2n
for 长度 len = 2 … n:                      // 只需到 n（一整圈）
  for 左端点 l = 0 … 2n-len:
    r = l + len - 1
    for 分割点 k = l … r-1:
      dp[l][r] = min( dp[l][r], dp[l][k] + dp[k+1][r] + sum(a2[l..r]) )
ans = min over i∈[0,n-1] of dp[i][i+n-1]   // ★扫 n 个整圈窗口取优`
					})]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "换个断点，窗口就平移：环↔链展开"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"上面是「填表」视角；再换个",
						/* @__PURE__ */ jsx("strong", { children: "「展开」视角" }),
						"把直觉坐实。下面的互动让你",
						/* @__PURE__ */ jsx("strong", { children: "亲手选断点" }),
						"：环从那里剪开、展成 ",
						/* @__PURE__ */ jsx(M, { children: "2n" }),
						" 直链，对应的长度 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 窗口随之在链上整体平移。切几个断点，感受「同一圈、不同起止」，以及为何单看一个 ",
						/* @__PURE__ */ jsx(M, { children: "dp[0][n-1]" }),
						" 会漏掉更优解。"
					] })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(RingChainDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "两个常见坑",
					children: [
						/* @__PURE__ */ jsxs("strong", { children: [
							"其一，长度别超过 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							"。"
						] }),
						"在 ",
						/* @__PURE__ */ jsx(M, { children: "2n" }),
						" 链上若枚举到长度 ",
						/* @__PURE__ */ jsx(M, { children: ">n" }),
						" 的区间，会把某堆石子",
						/* @__PURE__ */ jsx("strong", { children: "数两遍" }),
						"，答案偏大且无意义——外层 ",
						/* @__PURE__ */ jsx(M, { children: "len" }),
						" 只跑到 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 即可。",
						/* @__PURE__ */ jsx("br", {}),
						/* @__PURE__ */ jsxs("strong", { children: [
							"其二，取 ",
							/* @__PURE__ */ jsx(M, { children: "\\min" }),
							" 时下三角别参与、初值要设对。"
						] }),
						/* @__PURE__ */ jsx(M, { children: "f" }),
						" 初值 ",
						/* @__PURE__ */ jsx(M, { children: "+\\infty" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "g" }),
						" 初值 ",
						/* @__PURE__ */ jsx(M, { children: "-\\infty" }),
						"，且只在合法上三角（",
						/* @__PURE__ */ jsx(M, { children: "l\\le r" }),
						"）转移。若像能量项链那样代价可能",
						/* @__PURE__ */ jsx("strong", { children: "为负" }),
						"（如三元乘积含负数），求最小时还要留意「负负得正」，别漏候选。"
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
								"环形区间 DP 的",
								/* @__PURE__ */ jsx("strong", { children: "标准模板题" }),
								"，且",
								/* @__PURE__ */ jsx("strong", { children: "一题双问" }),
								"：断环为链（复制一倍成 ",
								/* @__PURE__ */ jsx(M, { children: "2n" }),
								"），在链上用两张表 ",
								/* @__PURE__ */ jsx(M, { children: "f" }),
								"（最小）、",
								/* @__PURE__ */ jsx(M, { children: "g" }),
								"（最大）并行跑同一套三层循环，最后各扫 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个整圈窗口取优。本页从头到尾就是它。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"它把",
								/* @__PURE__ */ jsx("strong", { children: "环形处理" }),
								"与",
								/* @__PURE__ */ jsx("strong", { children: "min/max 双问" }),
								"两个要点压在一题里，是检验「断环为链是否真会」的试金石：",
								/* @__PURE__ */ jsx(M, { children: "f/g[l][r]" }),
								" 的转移与链形完全一致，唯一新增的就是",
								/* @__PURE__ */ jsx("strong", { children: "「复制一倍 + 扫窗」" }),
								"这两处——把这两处默写下来，环形区间 DP 就到手了。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f/g[l][r]=\\mathrm{opt}_k(f/g[l][k]+f/g[k+1][r])+\\mathrm{sum}(l,r)" }),
								"，链长 ",
								/* @__PURE__ */ jsx(M, { children: "2n" }),
								"、外层长度到 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								"、扫窗 ",
								/* @__PURE__ */ jsx(M, { children: "i\\in[1,n]" }),
								"；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（断环为链 · 双问并行 · 扫窗）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1880,
								luogu: "P1880"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1063",
					name: "[NOIP2006 提高组] 能量项链",
					src: "NOIP2006 提高组",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 颗珠子串成一",
								/* @__PURE__ */ jsx("strong", { children: "环" }),
								"，每颗珠有头、尾两个标记，相邻珠共享标记。合并相邻两珠 ",
								/* @__PURE__ */ jsx(M, { children: "(i,j)" }),
								" 与 ",
								/* @__PURE__ */ jsx(M, { children: "(j,k)" }),
								" 得新珠 ",
								/* @__PURE__ */ jsx(M, { children: "(i,k)" }),
								"，释放能量 ",
								/* @__PURE__ */ jsx(M, { children: "e_i\\cdot e_j\\cdot e_k" }),
								"。求把整串合成一颗珠能释放的",
								/* @__PURE__ */ jsx("strong", { children: "最大总能量" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"环形区间 DP 的",
								/* @__PURE__ */ jsx("strong", { children: "经典进阶" }),
								"：合并代价从「区间和」升级成",
								/* @__PURE__ */ jsxs("strong", { children: ["相邻三元乘积 ", /* @__PURE__ */ jsx(M, { children: "\\mathrm{head}\\cdot\\mathrm{mid}\\cdot\\mathrm{tail}" })] }),
								"。状态改成按",
								/* @__PURE__ */ jsx("strong", { children: "标记" }),
								"划分——",
								/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
								" 表示标记 ",
								/* @__PURE__ */ jsx(M, { children: "i..j" }),
								" 之间的珠子合成一颗的最大能量，枚举最后一并处的",
								/* @__PURE__ */ jsxs("strong", { children: ["中间标记 ", /* @__PURE__ */ jsx(M, { children: "k" })] }),
								"，追加 ",
								/* @__PURE__ */ jsx(M, { children: "e_i e_k e_j" }),
								"。断环为链的处理与石子合并",
								/* @__PURE__ */ jsx("strong", { children: "一模一样" }),
								"，正好训练「同一套环形骨架、换一种代价函数」的迁移。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角",
							children: [
								"这里 ",
								/* @__PURE__ */ jsx(M, { children: "dp" }),
								" 的下标是",
								/* @__PURE__ */ jsx("strong", { children: "标记（隔板）" }),
								"而非珠子：长度 ",
								/* @__PURE__ */ jsx(M, { children: "\\mathrm{len}" }),
								" 的区间 ",
								/* @__PURE__ */ jsx(M, { children: "[i,j]" }),
								" 含 ",
								/* @__PURE__ */ jsx(M, { children: "j-i" }),
								" 颗珠，端点标记 ",
								/* @__PURE__ */ jsx(M, { children: "e_i,e_j" }),
								" 是合成后新珠的两头。样例 ",
								/* @__PURE__ */ jsx(M, { children: "e=[2,3,5,10]" }),
								" 的答案是 ",
								/* @__PURE__ */ jsx(M, { children: "710" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[i][j]=\\max_{i<k<j}\\big(f[i][k]+f[k][j]+e_i e_k e_j\\big)" }),
								"，标记链长 ",
								/* @__PURE__ */ jsx(M, { children: "2n" }),
								"，扫 ",
								/* @__PURE__ */ jsx(M, { children: "\\mathrm{len}=n" }),
								" 的窗口；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（断环为链 · 三元乘积）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1063,
								luogu: "P1063"
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
					pid: "P1043",
					name: "[NOIP2003 普及组] 数字游戏",
					hint: "环形 + 分段区间 DP：数字排成环，分成 m 段，各段和对 10 取模后相乘，求最大/最小。断环为链（复制一倍）后枚举起点，状态加一维段数：dp[l][r][t] = 区间 [l,r] 分成 t 段的最优，转移枚举最后一段的分割点。取模后可能为负，求最小值别漏「负负得正」，最大最小两张表分开跑。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2426",
					name: "删数",
					hint: "区间合并变形：把相邻或首尾的数按规则合并/删除，代价与两端点相关。设 dp[l][r] 为处理区间 [l,r] 的最优值，枚举分割点或枚举“最后删哪个”转移；按区间长度由短到长递推，注意端点代价的定义与边界。"
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pointer-cue",
			children: [
				/* @__PURE__ */ jsx(Gamepad2, { size: 18 }),
				"想更直观地感受「从哪儿断、绕哪一圈」？回 ",
				/* @__PURE__ */ jsx(Link, {
					to: "/part/c",
					style: {
						color: "var(--accent-1)",
						fontWeight: 600
					},
					children: "C 部分页"
				}),
				"的互动里亲手挑一个断点与合并顺序，再看 DP 给出的最优圈。"
			]
		})
	] });
}
//#endregion
export { RingInterval as default };
