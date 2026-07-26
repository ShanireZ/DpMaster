import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, Minus, MousePointerClick, Plus } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/grid-path/internal.ts
function validateTriangle(triangle) {
	if (triangle.length === 0) throw new RangeError("triangle must be non-empty");
	for (let row = 0; row < triangle.length; row++) {
		if (triangle[row].length !== row + 1) throw new RangeError("triangle rows must have row + 1 values");
		for (const value of triangle[row]) if (!Number.isFinite(value)) throw new RangeError("triangle values must be finite");
	}
}
function executeTrianglePath(triangle, emit) {
	validateTriangle(triangle);
	const size = triangle.length;
	const table = triangle.map((row) => Array(row.length).fill(0));
	for (let column = 0; column < size; column++) {
		table[size - 1][column] = triangle[size - 1][column];
		emit({
			type: "initialized",
			row: size - 1,
			column,
			value: table[size - 1][column]
		});
	}
	for (let row = size - 2; row >= 0; row--) for (let column = 0; column <= row; column++) {
		const down = table[row + 1][column];
		const downRight = table[row + 1][column + 1];
		const rightWins = downRight > down;
		table[row][column] = triangle[row][column] + Math.max(down, downRight);
		emit({
			type: "settled",
			row,
			column,
			cell: triangle[row][column],
			down,
			downRight,
			value: table[row][column],
			rightWins
		});
	}
	return {
		value: table[0][0],
		table
	};
}
function recordTrianglePath(triangle) {
	const events = [];
	return {
		result: executeTrianglePath(triangle, (event) => events.push(event)),
		events
	};
}
function executeGridPathCount(rows, columns, blocked, emit) {
	if (!Number.isInteger(rows) || rows <= 0 || !Number.isInteger(columns) || columns <= 0) throw new RangeError("grid dimensions must be positive integers");
	const table = Array.from({ length: rows }, () => Array(columns).fill(0));
	const valueAt = (row, column) => row < 1 || column < 1 ? 0 : table[row - 1][column - 1];
	for (let row = 1; row <= rows; row++) for (let column = 1; column <= columns; column++) {
		const isBlocked = blocked.has(`${row},${column}`);
		const start = row === 1 && column === 1;
		const up = valueAt(row - 1, column);
		const left = valueAt(row, column - 1);
		const count = isBlocked ? 0 : start ? 1 : up + left;
		table[row - 1][column - 1] = count;
		emit({
			type: "settled",
			row,
			column,
			blocked: isBlocked,
			start,
			up,
			left,
			count
		});
	}
	return {
		count: table[rows - 1][columns - 1],
		table
	};
}
function recordGridPathCount(rows, columns, blocked) {
	const events = [];
	return {
		result: executeGridPathCount(rows, columns, blocked, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/components/demos/grid/pathSolver.ts
function settled(values) {
	const states = {};
	for (let row = 0; row < values.length; row++) for (let column = 0; column < values[row].length; column++) if (values[row][column] !== null) states[key(row, column)] = "settled";
	return states;
}
function triangle2D(triangle) {
	const run = recordTrianglePath(triangle);
	const size = triangle.length;
	const table = Array.from({ length: size }, () => Array(size).fill(null));
	const snap = () => table.map((row) => row.slice());
	const frames = [{
		values: snap(),
		states: {},
		caption: "<b>准备</b>：把三角形左对齐，从最底行开始，自底向上填写每格到底部的最大路径和。",
		formula: "f[i][j] = a[i][j] + \\max(f[i+1][j],\\ f[i+1][j+1])"
	}];
	for (const event of run.events) {
		table[event.row][event.column] = event.value;
		const states = settled(table);
		states[key(event.row, event.column)] = "current";
		if (event.type === "initialized") {
			frames.push({
				values: snap(),
				states,
				active: {
					r: event.row,
					c: event.column
				},
				caption: `<b>最底行</b>：f[${event.row}][${event.column}] = <b>${event.value}</b>。`,
				formula: `f[${event.row}][${event.column}]=${event.value}`
			});
			continue;
		}
		states[key(event.row + 1, event.column)] = event.rightWins ? "source" : "chosen";
		states[key(event.row + 1, event.column + 1)] = event.rightWins ? "chosen" : "source";
		const arrows = [{
			from: {
				r: event.row + 1,
				c: event.column
			},
			to: {
				r: event.row,
				c: event.column
			},
			kind: event.rightWins ? "source" : "chosen"
		}, {
			from: {
				r: event.row + 1,
				c: event.column + 1
			},
			to: {
				r: event.row,
				c: event.column
			},
			kind: event.rightWins ? "chosen" : "source"
		}];
		frames.push({
			values: snap(),
			states,
			active: {
				r: event.row,
				c: event.column
			},
			arrows,
			caption: `格 f[${event.row}][${event.column}]：本身 ${event.cell}，下方 ${event.down} 与右下 ${event.downRight} 取较大者，得到 <b>${event.value}</b>。`,
			formula: `f[${event.row}][${event.column}]=${event.cell}+\\max(${event.down},\\ ${event.downRight})=${event.value}`
		});
	}
	const finalStates = settled(table);
	finalStates[key(0, 0)] = "chosen";
	frames.push({
		values: snap(),
		states: finalStates,
		caption: `答案落在顶点 <b>f[0][0] = ${run.result.value}</b>。`,
		formula: `f[0][0]=${run.result.value}`
	});
	return {
		rows: size,
		cols: size,
		cell: 46,
		rowHeaderLabels: Array.from({ length: size }, (_, row) => `第${row}行`),
		colHeaderLabels: Array.from({ length: size }, (_, column) => `${column}`),
		frames
	};
}
function gridCount2D(rows, columns, blocked) {
	const run = recordGridPathCount(rows, columns, blocked);
	const table = Array.from({ length: rows }, () => Array(columns).fill(null));
	const snap = () => table.map((row) => row.slice());
	const frames = [{
		values: snap(),
		states: {},
		caption: "<b>准备</b>：从左上角出发，每步只向右或向下；红格是不能经过的障碍。",
		formula: "f[i][j] = f[i-1][j] + f[i][j-1]"
	}];
	for (const event of run.events) {
		const renderRow = event.row - 1;
		const renderColumn = event.column - 1;
		table[renderRow][renderColumn] = event.count;
		const states = settled(table);
		const arrows = [];
		if (event.blocked) {
			states[key(renderRow, renderColumn)] = "invalid";
			frames.push({
				values: snap(),
				states,
				active: {
					r: renderRow,
					c: renderColumn
				},
				caption: `格 <b>(${event.row},${event.column})</b> 是障碍，方案数强制为 <b>0</b>。`,
				formula: `f[${event.row}][${event.column}]=0\\ (\\text{blocked})`
			});
			continue;
		}
		if (!event.start && event.row > 1) {
			states[key(renderRow - 1, renderColumn)] = "source";
			arrows.push({
				from: {
					r: renderRow - 1,
					c: renderColumn
				},
				to: {
					r: renderRow,
					c: renderColumn
				},
				kind: "chosen"
			});
		}
		if (!event.start && event.column > 1) {
			states[key(renderRow, renderColumn - 1)] = "source";
			arrows.push({
				from: {
					r: renderRow,
					c: renderColumn - 1
				},
				to: {
					r: renderRow,
					c: renderColumn
				},
				kind: "chosen"
			});
		}
		states[key(renderRow, renderColumn)] = "current";
		const caption = event.start ? "<b>起点 (1,1)</b>：原地站着本身算 1 条路。" : `格 <b>(${event.row},${event.column})</b>：上方 ${event.up} 条 + 左方 ${event.left} 条 = <b>${event.count}</b> 条。`;
		const formula = event.start ? "f[1][1]=1" : `f[${event.row}][${event.column}]=${event.up}+${event.left}=${event.count}`;
		frames.push({
			values: snap(),
			states,
			active: {
				r: renderRow,
				c: renderColumn
			},
			arrows,
			caption,
			formula
		});
	}
	const finalStates = settled(table);
	for (const cell of blocked) {
		const [row, column] = cell.split(",").map(Number);
		if (row >= 1 && row <= rows && column >= 1 && column <= columns) finalStates[key(row - 1, column - 1)] = "invalid";
	}
	finalStates[key(rows - 1, columns - 1)] = "chosen";
	frames.push({
		values: snap(),
		states: finalStates,
		caption: `<b>终点 f[${rows}][${columns}] = ${run.result.count}</b>。`,
		formula: `f[${rows}][${columns}]=${run.result.count}`
	});
	return {
		rows,
		cols: columns,
		cell: 44,
		rowHeaderLabels: Array.from({ length: rows }, (_, row) => `${row + 1}`),
		colHeaderLabels: Array.from({ length: columns }, (_, column) => `${column + 1}`),
		rowHeaderTitle: "行",
		colHeaderTitle: "列",
		frames
	};
}
//#endregion
//#region src/components/demos/grid/PathTriangleDemo.tsx
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
var DEFAULT_TRI = [
	[3],
	[6, 5],
	[
		3,
		8,
		2
	],
	[
		2,
		7,
		4,
		5
	]
];
function resizeTri(tri, rows) {
	const out = [];
	for (let i = 0; i < rows; i++) {
		const src = tri[i] ?? [];
		const row = [];
		for (let j = 0; j <= i; j++) row.push(src[j] ?? (i + j) % 9 + 1);
		out.push(row);
	}
	return out;
}
/** 数字三角形二维演示：自底向上填表，每格从「正下方 / 右下方」取 max。可改每格数字与行数。 */
function PathTriangleDemo() {
	const [rows, setRows] = useState(4);
	const [tri, setTri] = useState(DEFAULT_TRI);
	const shown = useMemo(() => resizeTri(tri, rows), [tri, rows]);
	const model = useMemo(() => triangle2D(shown), [shown]);
	const modelKey = `tri-${shown.map((r) => r.join(".")).join("_")}`;
	const setCell = (i, j, val) => setTri((prev) => {
		const base = resizeTri(prev, Math.max(rows, prev.length));
		base[i] = base[i].slice();
		base[i][j] = val;
		return base;
	});
	const setRowsClamped = (r) => {
		setRows(r);
		setTri((prev) => resizeTri(prev, r));
	};
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
		className: "kd__toolbar",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "kd__group-label",
			children: "数字三角形（点数字上的 ± 改值 · 每步只能去正下方或右下方）"
		}), /* @__PURE__ */ jsx("div", {
			style: {
				display: "flex",
				flexDirection: "column",
				gap: "var(--sp-3)",
				alignItems: "center"
			},
			children: shown.map((row, i) => /* @__PURE__ */ jsx("div", {
				style: {
					display: "flex",
					gap: "var(--sp-3)"
				},
				children: row.map((val, j) => /* @__PURE__ */ jsxs("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 4,
						padding: "6px 8px",
						borderRadius: "var(--r-2)",
						background: "color-mix(in srgb, var(--accent-1) 6%, var(--surface-3))",
						border: "1px solid var(--border-strong)"
					},
					children: [
						/* @__PURE__ */ jsx("button", {
							onClick: () => setCell(i, j, val + 1),
							disabled: val >= 20,
							"aria-label": "加",
							style: {
								width: 22,
								height: 20,
								borderRadius: 5,
								border: "1px solid var(--border)",
								background: "var(--surface-2)",
								color: "var(--text-1)",
								display: "grid",
								placeItems: "center"
							},
							children: /* @__PURE__ */ jsx(Plus, { size: 12 })
						}),
						/* @__PURE__ */ jsx("span", {
							className: "mono",
							style: {
								fontSize: 17,
								fontWeight: 700,
								color: "var(--accent-1)",
								minWidth: 20,
								textAlign: "center"
							},
							children: val
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: () => setCell(i, j, val - 1),
							disabled: val <= 0,
							"aria-label": "减",
							style: {
								width: 22,
								height: 20,
								borderRadius: 5,
								border: "1px solid var(--border)",
								background: "var(--surface-2)",
								color: "var(--text-1)",
								display: "grid",
								placeItems: "center"
							},
							children: /* @__PURE__ */ jsx(Minus, { size: 12 })
						})
					]
				}, j))
			}, i))
		})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "kd__group-label",
			children: "层数"
		}), /* @__PURE__ */ jsx(Stepper$1, {
			label: "行",
			value: rows,
			min: 2,
			max: 5,
			onChange: setRowsClamped
		})] })]
	}), /* @__PURE__ */ jsx(DPViz, { model }, modelKey)] });
}
//#endregion
//#region src/algorithms/grid-path/index.ts
function solveGridPathCount(rows, columns, blocked) {
	return executeGridPathCount(rows, columns, blocked, ignoreEvents);
}
//#endregion
//#region src/components/demos/grid/PathGridCountDemo.tsx
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
* 过河卒网格路径计数演示：点小网格里的格子切换障碍（红），实时重算方案数。
* 默认 4×4，起点(1,1)、终点(4,4)不可设障碍。无障碍 20 条；点中间一格看它如何被截断。
*/
function PathGridCountDemo() {
	const [rows, setRows] = useState(4);
	const [cols, setCols] = useState(4);
	const [blocked, setBlocked] = useState(() => /* @__PURE__ */ new Set(["2,2"]));
	const model = useMemo(() => gridCount2D(rows, cols, blocked), [
		rows,
		cols,
		blocked
	]);
	const modelKey = `grid-${rows}x${cols}-${[...blocked].sort().join("|")}`;
	const openTotal = useMemo(() => solveGridPathCount(rows, cols, /* @__PURE__ */ new Set()).count, [rows, cols]);
	const curTotal = useMemo(() => solveGridPathCount(rows, cols, blocked).count, [
		rows,
		cols,
		blocked
	]);
	const isStartOrEnd = (i, j) => i === 1 && j === 1 || i === rows && j === cols;
	const toggle = (i, j) => {
		if (isStartOrEnd(i, j)) return;
		setBlocked((prev) => {
			const next = new Set(prev);
			const k = `${i},${j}`;
			if (next.has(k)) next.delete(k);
			else next.add(k);
			return next;
		});
	};
	const clampBlocked = (r, c, prev) => {
		const next = /* @__PURE__ */ new Set();
		for (const b of prev) {
			const [bi, bj] = b.split(",").map(Number);
			if (bi >= 1 && bi <= r && bj >= 1 && bj <= c && !(bi === 1 && bj === 1 || bi === r && bj === c)) next.add(b);
		}
		return next;
	};
	const setRowsClamped = (r) => {
		setRows(r);
		setBlocked((prev) => clampBlocked(r, cols, prev));
	};
	const setColsClamped = (c) => {
		setCols(c);
		setBlocked((prev) => clampBlocked(rows, c, prev));
	};
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "点格子设 / 撤障碍（起点终点锁定）"
			}), /* @__PURE__ */ jsx("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 5
				},
				children: Array.from({ length: rows }, (_, ri) => /* @__PURE__ */ jsx("div", {
					style: {
						display: "flex",
						gap: 5
					},
					children: Array.from({ length: cols }, (_, ci) => {
						const i = ri + 1;
						const j = ci + 1;
						const k = `${i},${j}`;
						const blk = blocked.has(k);
						const se = isStartOrEnd(i, j);
						return /* @__PURE__ */ jsx("button", {
							onClick: () => toggle(i, j),
							disabled: se,
							"aria-label": `格 ${i},${j}`,
							style: {
								width: 34,
								height: 34,
								borderRadius: 8,
								fontSize: 11,
								fontWeight: 700,
								fontFamily: "var(--font-mono)",
								cursor: se ? "default" : "pointer",
								border: blk ? "1.5px solid var(--viz-invalid)" : se ? "1.5px solid var(--accent-2)" : "1px solid var(--border-strong)",
								background: blk ? "color-mix(in srgb, var(--viz-invalid) 22%, var(--surface-3))" : se ? "color-mix(in srgb, var(--accent-1) 18%, var(--surface-3))" : "var(--surface-3)",
								color: blk ? "var(--viz-invalid)" : se ? "var(--accent-1)" : "var(--text-3)",
								display: "grid",
								placeItems: "center"
							},
							children: i === 1 && j === 1 ? "起" : i === rows && j === cols ? "终" : blk ? "×" : ""
						}, ci);
					})
				}, ri))
			})] }), /* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					gap: "var(--sp-5)"
				},
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "kd__group-label",
					children: "行数"
				}), /* @__PURE__ */ jsx(Stepper, {
					label: "行",
					value: rows,
					min: 2,
					max: 5,
					onChange: setRowsClamped
				})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "kd__group-label",
					children: "列数"
				}), /* @__PURE__ */ jsx(Stepper, {
					label: "列",
					value: cols,
					min: 2,
					max: 6,
					onChange: setColsClamped
				})] })]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"无障碍共 ",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: openTotal
				}),
				" 条路 · 当前避开 ",
				blocked.size,
				" 个障碍后剩",
				" ",
				/* @__PURE__ */ jsx("b", {
					className: blocked.size > 0 ? "bad" : "ok",
					children: curTotal
				}),
				" 条",
				blocked.size > 0 && curTotal < openTotal ? /* @__PURE__ */ jsxs(Fragment, { children: [
					"（障碍截断了 ",
					/* @__PURE__ */ jsx("b", {
						className: "bad",
						children: openTotal - curTotal
					}),
					" 条）"
				] }) : null
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/content/b/LinearPathArt.tsx
function TrianglePathFigure() {
	const tri = [
		[3],
		[6, 5],
		[
			3,
			8,
			2
		]
	];
	const r = 26;
	const gapX = 74;
	const gapY = 70;
	const cx0 = 300;
	const y0 = 40;
	const pos = (i, j) => ({
		x: cx0 - i * gapX / 2 + j * gapX,
		y: y0 + i * gapY
	});
	const onPath = (i, j) => i === 0 && j === 0 || i === 1 && j === 0 || i === 2 && j === 1;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 600 240",
		role: "img",
		"aria-label": "数字三角形与一条最优下行路径",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "tp-ar",
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
			[[pos(0, 0), pos(1, 0)], [pos(1, 0), pos(2, 1)]].map(([a, b], i) => /* @__PURE__ */ jsx("line", {
				x1: a.x,
				y1: a.y,
				x2: b.x,
				y2: b.y,
				stroke: "var(--accent-2)",
				strokeWidth: "3.5",
				markerEnd: "url(#tp-ar)",
				opacity: "0.85"
			}, `p${i}`)),
			/* @__PURE__ */ jsx("line", {
				x1: pos(0, 0).x,
				y1: pos(0, 0).y,
				x2: pos(1, 1).x,
				y2: pos(1, 1).y,
				stroke: "var(--text-3)",
				strokeWidth: "2",
				strokeDasharray: "4 4",
				opacity: "0.5"
			}),
			tri.map((row, i) => row.map((v, j) => {
				const p = pos(i, j);
				const hot = onPath(i, j);
				return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("circle", {
					cx: p.x,
					cy: p.y,
					r,
					fill: hot ? "color-mix(in srgb, var(--accent-1) 20%, var(--surface-3))" : "var(--surface-3)",
					stroke: hot ? "var(--accent-2)" : "var(--border-strong)",
					strokeWidth: hot ? 2.5 : 1.5
				}), /* @__PURE__ */ jsx("text", {
					x: p.x,
					y: p.y + 6,
					textAnchor: "middle",
					fontSize: "18",
					className: "mono",
					fill: hot ? "var(--accent-1)" : "var(--text-1)",
					children: v
				})] }, `${i}-${j}`);
			})),
			/* @__PURE__ */ jsx("text", {
				x: "500",
				y: "150",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "每步只能走向"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "500",
				y: "170",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "正下方或右下方"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "60",
				y: "210",
				fontSize: "13",
				fill: "var(--accent-1)",
				fontWeight: "600",
				children: "高亮路 3→6→8 = 17（最大）"
			})
		]
	});
}
function TriangleDecisionFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 600 250",
		role: "img",
		"aria-label": "数字三角形单格的自底向上转移",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "td-ar",
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
				transform: "translate(228,8)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "150",
						height: "52",
						rx: "12",
						fill: "color-mix(in srgb, var(--viz-current) 14%, var(--surface-2))",
						stroke: "var(--viz-current)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "75",
						y: "22",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "当前 · 第 i 行第 j 列"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "75",
						y: "42",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "f[i][j] = ?"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M264 130 L288 62",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#td-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M430 130 L318 62",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#td-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "150",
				y: "108",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "正下方"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "430",
				y: "108",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "右下方"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(70,132)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "200",
						height: "60",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "26",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "同列往下走一步"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "47",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "f[i+1][j]"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(330,132)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "212",
						height: "60",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "106",
						y: "26",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "斜着往右下走一步"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "106",
						y: "47",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "f[i+1][j+1]"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(170,204)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "260",
					height: "42",
					rx: "14",
					fill: "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: "130",
					y: "27",
					textAnchor: "middle",
					fontSize: "13.5",
					className: "mono",
					fill: "var(--text-1)",
					children: "a[i][j] + max(两个下方)"
				})]
			})
		]
	});
}
function GridCountFigure() {
	const grid = [
		[
			1,
			1,
			1
		],
		[
			1,
			0,
			1
		],
		[
			1,
			1,
			2
		]
	];
	const CW = 58;
	const x0 = 150;
	const y0 = 30;
	const gx = (c) => x0 + c * 70;
	const gy = (r) => y0 + r * 70;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 258",
		role: "img",
		"aria-label": "带障碍的网格路径计数表",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "gc-ar",
				markerWidth: "7",
				markerHeight: "7",
				refX: "5.5",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--viz-source)"
				})
			}) }),
			[
				0,
				1,
				2
			].map((c) => /* @__PURE__ */ jsxs("text", {
				x: gx(c) + CW / 2,
				y: y0 - 10,
				textAnchor: "middle",
				fontSize: "11",
				className: "mono",
				fill: "var(--text-3)",
				children: ["列", c + 1]
			}, `ch${c}`)),
			[
				0,
				1,
				2
			].map((r) => /* @__PURE__ */ jsxs("text", {
				x: x0 - 16,
				y: gy(r) + CW / 2 + 4,
				textAnchor: "middle",
				fontSize: "11",
				className: "mono",
				fill: "var(--text-3)",
				children: ["行", r + 1]
			}, `rh${r}`)),
			/* @__PURE__ */ jsx("line", {
				x1: gx(2) + CW / 2,
				y1: gy(1) + CW,
				x2: gx(2) + CW / 2,
				y2: gy(2),
				stroke: "var(--viz-source)",
				strokeWidth: "2",
				markerEnd: "url(#gc-ar)"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: gx(1) + CW,
				y1: gy(2) + CW / 2,
				x2: gx(2),
				y2: gy(2) + CW / 2,
				stroke: "var(--viz-source)",
				strokeWidth: "2",
				markerEnd: "url(#gc-ar)"
			}),
			grid.map((row, r) => row.map((v, c) => {
				const blocked = r === 1 && c === 1;
				const start = r === 0 && c === 0;
				const end = r === 2 && c === 2;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${gx(c)},${gy(r)})`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: CW,
						height: CW,
						rx: "10",
						fill: blocked ? "color-mix(in srgb, var(--viz-invalid) 22%, var(--surface-3))" : end ? "color-mix(in srgb, var(--accent-1) 18%, var(--surface-3))" : start ? "color-mix(in srgb, var(--accent-1) 10%, var(--surface-3))" : "var(--surface-3)",
						stroke: blocked ? "var(--viz-invalid)" : end ? "var(--accent-2)" : "var(--border-strong)",
						strokeWidth: blocked || end ? 2.2 : 1.5
					}), /* @__PURE__ */ jsx("text", {
						x: CW / 2,
						y: 36,
						textAnchor: "middle",
						fontSize: "19",
						className: "mono",
						fill: blocked ? "var(--viz-invalid)" : end ? "var(--accent-1)" : "var(--text-1)",
						children: blocked ? "×" : v
					})]
				}, `${r}-${c}`);
			})),
			/* @__PURE__ */ jsx("text", {
				x: "420",
				y: "150",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "每格 ="
			}),
			/* @__PURE__ */ jsx("text", {
				x: "420",
				y: "170",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "上方 + 左方"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "420",
				y: "200",
				fontSize: "12.5",
				fill: "var(--viz-invalid)",
				children: "障碍格清零"
			})
		]
	});
}
//#endregion
//#region src/content/b/LinearPath.tsx
var CODE_P1216 = `
#include <algorithm>
#include <iostream>
using namespace std;
#define MX 1005
int n, a[MX][MX], f[MX][MX];

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= i; j++)
            cin >> a[i][j];

    for (int i = 1; i <= n; i++)         // 最底行先落地：f[n][j] = a[n][j]
        f[n][i] = a[n][i];

    for (int i = n - 1; i >= 1; i--)     // ★自底向上，从倒数第二行往塔顶推
        for (int j = 1; j <= i; j++)
            f[i][j] = a[i][j] + max(f[i + 1][j], f[i + 1][j + 1]); // 正下方 / 右下方取大

    cout << f[1][1] << endl;             // 答案在塔顶
    return 0;
}
// TAG: 线性DP 数字三角形 递推`;
var CODE_P1002 = `
#include <iostream>
using namespace std;
#define MX 25
long long f[MX][MX];                 // ★路径数会爆 int，必须 long long
bool block[MX][MX];                  // 马的控制点（障碍）
int dx[9] = {0, 1, 1, 2, 2, -1, -1, -2, -2};
int dy[9] = {0, 2, -2, 1, -1, 2, -2, 1, -1};

int main()
{
    int bx, by, hx, hy;
    cin >> bx >> by >> hx >> hy;
    bx += 1, by += 1, hx += 1, hy += 1;         // 坐标从 0 起，整体平移成 1-based

    for (int k = 0; k < 9; k++)                  // 马本身 + 8 个control点设为障碍
    {
        int x = hx + dx[k], y = hy + dy[k];
        if (x >= 1 && y >= 1)
            block[x][y] = true;
    }

    f[1][1] = 1;                                 // 起点：1 条路（未走）
    for (int i = 1; i <= bx; i++)
        for (int j = 1; j <= by; j++)
        {
            if (block[i][j])                     // 障碍格：卒到不了，方案数清零
            {
                f[i][j] = 0;
                continue;
            }
            if (i == 1 && j == 1)
                continue;
            f[i][j] = f[i - 1][j] + f[i][j - 1]; // 上方来 + 左方来
        }

    cout << f[bx][by] << endl;
    return 0;
}
// TAG: 线性DP 网格路径 计数 障碍`;
var CODE_P1004 = `
#include <algorithm>
#include <iostream>
using namespace std;
#define MX 12
int n, a[MX][MX];
int f[MX][MX][MX][MX];               // 两条路径同时走：各自的 (x1,y1) 与 (x2,y2)

int main()
{
    cin >> n;
    int x, y, w;
    while (cin >> x >> y >> w && (x || y || w))
        a[x][y] = w;

    for (int i = 1; i <= n; i++)         // 两条路一起从 (1,1) 走到 (n,n)
        for (int j = 1; j <= n; j++)
            for (int k = 1; k <= n; k++)
                for (int l = 1; l <= n; l++)
                {
                    int best = max(max(f[i - 1][j][k - 1][l], f[i - 1][j][k][l - 1]),
                                   max(f[i][j - 1][k - 1][l], f[i][j - 1][k][l - 1]));
                    f[i][j][k][l] = best + a[i][j] + a[k][l];
                    if (i == k && j == l)        // 同一格只能被拿一次，扣掉重复
                        f[i][j][k][l] -= a[i][j];
                }

    cout << f[n][n][n][n] << endl;
    return 0;
}
// TAG: 线性DP 网格路径 双线程 方格取数`;
function LinearPath() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "从「一步一步往下走」说起"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"先看一个具体场景——",
						/* @__PURE__ */ jsx("strong", { children: "数字三角形" }),
						"：一座数字塔，从",
						/* @__PURE__ */ jsx("strong", { children: "塔顶" }),
						"出发往下走，每一步只能踩到",
						/* @__PURE__ */ jsx("strong", { children: "正下方" }),
						"或",
						/* @__PURE__ */ jsx("strong", { children: "右下方" }),
						"那一格， 一直走到",
						/* @__PURE__ */ jsx("strong", { children: "塔底" }),
						"。把沿途踩过的数字加起来，问：怎么走，能让这个",
						/* @__PURE__ */ jsx("strong", { children: "总和最大" }),
						"？"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(TrianglePathFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "数字塔：从顶走到底，每步只能去正下方或右下方。图中高亮的一条路 3→6→8，总和 17——它是最大的吗？"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"第一反应也许是",
							/* @__PURE__ */ jsx("strong", { children: "贪心" }),
							"：每一步都挑「眼前更大的那个邻居」。从顶上 ",
							/* @__PURE__ */ jsx(M, { children: "3" }),
							" 往下，左边是 ",
							/* @__PURE__ */ jsx(M, { children: "6" }),
							"、右边是 ",
							/* @__PURE__ */ jsx(M, { children: "5" }),
							"，贪心选 ",
							/* @__PURE__ */ jsx(M, { children: "6" }),
							"； 再往下，",
							/* @__PURE__ */ jsx(M, { children: "6" }),
							" 的两个孩子是 ",
							/* @__PURE__ */ jsx(M, { children: "3" }),
							" 和 ",
							/* @__PURE__ */ jsx(M, { children: "8" }),
							"，选 ",
							/* @__PURE__ */ jsx(M, { children: "8" }),
							"——凑成 ",
							/* @__PURE__ */ jsx(M, { children: "3+6+8=17" }),
							"。这一回它恰好对了，但贪心",
							/* @__PURE__ */ jsx("strong", { children: "并不可靠" }),
							"： 眼前小一点的邻居，底下可能接着一串大数。",
							/* @__PURE__ */ jsx("strong", { children: "此刻的最优选择，要看后面还能捡到多少" }),
							"——这是个牵一发动全身的全局问题。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"那把每条路径都枚举一遍呢？塔有 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 层，每步二选一，就是 ",
							/* @__PURE__ */ jsx(M, { children: "2^{n-1}" }),
							" 条路，",
							/* @__PURE__ */ jsx(M, { children: "n=100" }),
							" 时是天文数字。",
							/* @__PURE__ */ jsx("strong", { children: "DP 的思路，是不去数「路」，而是给每一格算一个值" }),
							"：从这一格出发、走到塔底能拿到的",
							/* @__PURE__ */ jsx("strong", { children: "最大总和" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"这里藏着线性 DP 最朴素的一问：",
							/* @__PURE__ */ jsx("strong", { children: "站在一格上，往下的「最后一步」从哪来？" }),
							"——只可能是它",
							/* @__PURE__ */ jsx("strong", { children: "正下方" }),
							"或",
							/* @__PURE__ */ jsx("strong", { children: "右下方" }),
							"的那一格接上来。 把这个「最后一步」想清楚，转移方程就浮出来了。"
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
					children: "状态与转移：每格只回看下面两格"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
						"设 ",
						/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
						" 表示：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"从第 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 行第 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 列这一格出发、一路走到塔底，能得到的最大数字和"
						] }),
						"。 这样一来，我们真正想要的答案就是塔顶那一格 ",
						/* @__PURE__ */ jsx(M, { children: "f[1][1]" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(TriangleDecisionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "每格 f[i][j] 只有两个下方来源：正下方 f[i+1][j] 与右下方 f[i+1][j+1]，取较大的那个，再加上自己这格的数字。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"站在 ",
							/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
							"，下一步只有两条路：走到",
							/* @__PURE__ */ jsx("strong", { children: "正下方" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "f[i+1][j]" }),
							"，或走到",
							/* @__PURE__ */ jsx("strong", { children: "右下方" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "f[i+1][j+1]" }),
							"。 从这一格出发的最大和，就是「自己这格的数字 ",
							/* @__PURE__ */ jsx(M, { children: "a[i][j]" }),
							"」加上「两个下方谁能带来更大的后续」。于是得到",
							/* @__PURE__ */ jsx("strong", { children: "转移方程" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[i][j]=a[i][j]+\\max\\big(\\,f[i+1][j],\\ f[i+1][j+1]\\,\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "边界" }),
							"在最底行：站在塔底，脚下就是终点，无路可走，从这里出发的最大和就是它自己，",
							/* @__PURE__ */ jsx(M, { children: "f[n][j]=a[n][j]" }),
							"。 有了地基，从倒数第二行开始",
							/* @__PURE__ */ jsx("strong", { children: "自底向上" }),
							"逐行往塔顶推，最后读 ",
							/* @__PURE__ */ jsx(M, { children: "f[1][1]" }),
							" 即答案。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"这一步把「数 ",
						/* @__PURE__ */ jsx(M, { children: "2^{n-1}" }),
						" 条路」换成了「给 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 个格子各算一个最优值」。能这么换，靠的是",
						/* @__PURE__ */ jsx("strong", { children: "无后效性" }),
						"：",
						/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
						" 只关心「从这格往下」的最优， 与「怎么走到这格」毫无关系。每个子问题（一格的最优）算一次、存下来，被上方两格反复复用——这正是",
						/* @__PURE__ */ jsx("strong", { children: "最优子结构 + 重叠子问题" }),
						"，DP 的两块基石。"
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
						"用图中那座三行小塔（第 1 行 ",
						/* @__PURE__ */ jsx(M, { children: "3" }),
						"；第 2 行 ",
						/* @__PURE__ */ jsx(M, { children: "6,5" }),
						"；第 3 行 ",
						/* @__PURE__ */ jsx(M, { children: "3,8,2" }),
						"）走一遍，",
						/* @__PURE__ */ jsx("strong", { children: "从最底行往上" }),
						"填："
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
									/* @__PURE__ */ jsx("b", { children: "最底行落地。" }),
									" 第 3 行每格脚下就是终点，从它出发的最大和就是自己：",
									/* @__PURE__ */ jsx(M, { children: "f[3][1]=3,\\ f[3][2]=8,\\ f[3][3]=2" }),
									"。这是整张表的地基。"
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
									/* @__PURE__ */ jsx("b", { children: "算第 2 行左格" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "f[2][1]" }),
									"（本身 ",
									/* @__PURE__ */ jsx(M, { children: "a=6" }),
									"）。它的两个下方是 ",
									/* @__PURE__ */ jsx(M, { children: "f[3][1]=3" }),
									" 与 ",
									/* @__PURE__ */ jsx(M, { children: "f[3][2]=8" }),
									"，取大者 ",
									/* @__PURE__ */ jsx(M, { children: "8" }),
									"， 于是 ",
									/* @__PURE__ */ jsx(M, { children: "f[2][1]=6+8=14" }),
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
									/* @__PURE__ */ jsx("b", { children: "算第 2 行右格" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "f[2][2]" }),
									"（本身 ",
									/* @__PURE__ */ jsx(M, { children: "a=5" }),
									"）。两个下方是 ",
									/* @__PURE__ */ jsx(M, { children: "f[3][2]=8" }),
									" 与 ",
									/* @__PURE__ */ jsx(M, { children: "f[3][3]=2" }),
									"，取大者 ",
									/* @__PURE__ */ jsx(M, { children: "8" }),
									"， 于是 ",
									/* @__PURE__ */ jsx(M, { children: "f[2][2]=5+8=13" }),
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
									/* @__PURE__ */ jsx("b", { children: "算塔顶" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "f[1][1]" }),
									"（本身 ",
									/* @__PURE__ */ jsx(M, { children: "a=3" }),
									"）。两个下方是 ",
									/* @__PURE__ */ jsx(M, { children: "f[2][1]=14" }),
									" 与 ",
									/* @__PURE__ */ jsx(M, { children: "f[2][2]=13" }),
									"，取大者 ",
									/* @__PURE__ */ jsx(M, { children: "14" }),
									"， 于是 ",
									/* @__PURE__ */ jsx(M, { children: "f[1][1]=3+14=17" }),
									"——正是最大和，对应那条 ",
									/* @__PURE__ */ jsx(M, { children: "3\\to 6\\to 8" }),
									" 的路。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示会把整座塔",
						/* @__PURE__ */ jsx("strong", { children: "从底往上逐格填满" }),
						"，并高亮每格的两个下方来源。试着改数字或层数，看它实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看它从底往上长出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(PathTriangleDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "换个方向：把「最优」换成「计数」"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"同一套「格子上的递推」，稍微换个问法就能解一类全新的题。看",
							/* @__PURE__ */ jsx("strong", { children: "过河卒" }),
							"：一枚卒在网格上，从",
							/* @__PURE__ */ jsx("strong", { children: "左上角" }),
							"出发，每步只能",
							/* @__PURE__ */ jsx("strong", { children: "向右" }),
							"或",
							/* @__PURE__ */ jsx("strong", { children: "向下" }),
							"， 要走到",
							/* @__PURE__ */ jsx("strong", { children: "右下角" }),
							"。这回不问「最大和」，而问",
							/* @__PURE__ */ jsx("strong", { children: "一共有多少条不同的路" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"还是先问那句话：走到某一格 ",
							/* @__PURE__ */ jsx(M, { children: "(i,j)" }),
							"，",
							/* @__PURE__ */ jsx("strong", { children: "最后一步从哪来？" }),
							"只可能从",
							/* @__PURE__ */ jsx("strong", { children: "上方" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "(i-1,j)" }),
							" 向下一步，或从",
							/* @__PURE__ */ jsx("strong", { children: "左方" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "(i,j-1)" }),
							" 向右一步。 于是「走到 ",
							/* @__PURE__ */ jsx(M, { children: "(i,j)" }),
							" 的路数」= 「走到上方的路数」+「走到左方的路数」："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[i][j]=f[i-1][j]+f[i][j-1]" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"边界是起点 ",
							/* @__PURE__ */ jsx(M, { children: "f[1][1]=1" }),
							"（站着没动，也算 1 条路），第一行、第一列都只有 1 条路（只能一直往右 / 往下）。",
							/* @__PURE__ */ jsx("strong", { children: "和数字三角形是同一个模具" }),
							"：只是把转移里的 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							" 换成了",
							/* @__PURE__ */ jsx("strong", { children: "相加" }),
							"——求最优变成了求方案数。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"过河卒还多一条硬约束：棋盘上有一匹",
							/* @__PURE__ */ jsx("strong", { children: "马" }),
							"，马本身和它能一步跳到的 8 个点都是",
							/* @__PURE__ */ jsx("strong", { children: "障碍" }),
							"，卒一步都不能踩。障碍怎么进方程？很简单——",
							/* @__PURE__ */ jsx("strong", { children: "障碍格的方案数直接钉成 0" }),
							"：既然卒到不了它，它也就不会再把任何路径数往右、往下传出去。这就是「",
							/* @__PURE__ */ jsx("strong", { children: "非法状态清零" }),
							"」，线性 DP 里最常用的一记落子。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(GridCountFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "网格计数：每格 = 上方 + 左方。把中间 (2,2) 设成障碍（×，钉成 0）后，它不再向外传数——右下角的总路数从无障碍的 6 被截断成 2。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"用一个 ",
						/* @__PURE__ */ jsx(M, { children: "3\\times 3" }),
						" 的小网格验一下：不设障碍时，第一行、第一列全是 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						"，往里每格上+左累加，右下角得 ",
						/* @__PURE__ */ jsx(M, { children: "6" }),
						"（正是组合数 ",
						/* @__PURE__ */ jsx(M, { children: "\\binom{4}{2}" }),
						"）。 一旦把正中间 ",
						/* @__PURE__ */ jsx(M, { children: "(2,2)" }),
						" 设为障碍钉成 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						"，穿过中心的那些路全被掐断，右下角只剩 ",
						/* @__PURE__ */ jsx(M, { children: "2" }),
						"。",
						/* @__PURE__ */ jsx("strong", { children: "一个格子清零，整张计数表随之改写" }),
						"。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "并排看：障碍如何截断路径"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"道理讲完，不如亲手试。下面的网格默认 ",
						/* @__PURE__ */ jsx(M, { children: "4\\times 4" }),
						"、正中 ",
						/* @__PURE__ */ jsx(M, { children: "(2,2)" }),
						" 是障碍——",
						/* @__PURE__ */ jsx("strong", { children: "点任意格子可设 / 撤障碍" }),
						"（起点「起」、终点「终」锁定不可点）。 读数条会实时告诉你：",
						/* @__PURE__ */ jsx("strong", { children: "无障碍时共几条路，避开当前障碍后剩几条，被截断了多少" }),
						"。演示区把每格从",
						/* @__PURE__ */ jsx("strong", { children: "上方 + 左方" }),
						"累加的过程逐格走给你看， 障碍格会标红并钉成 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						"。试着把障碍挪到角落，或一次设两三个，看这个计数怎么随之崩塌或复原。"
					] })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(PathGridCountDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "记牢：非法状态钉成「零元」",
					children: [
						"「障碍清零」不是特例，而是一条通法：在",
						/* @__PURE__ */ jsx("strong", { children: "求最优" }),
						"的题里，非法状态钉成 ",
						/* @__PURE__ */ jsx(M, { children: "-\\infty" }),
						"（永远选不中）；在",
						/* @__PURE__ */ jsx("strong", { children: "求方案数" }),
						"的题里，钉成 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						"（贡献 0 条路）。 把不合法的格子设成该问题的「",
						/* @__PURE__ */ jsx("strong", { children: "零元" }),
						"」，它就会自动被排除在所有转移之外——比在每条转移里写一堆 ",
						/* @__PURE__ */ jsx(M, { children: "if" }),
						" 判断干净得多。"
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
					pid: "P1216",
					name: "[USACO1.5][IOI1994] 数字三角形 Number Triangles",
					src: "IOI1994",
					diff: "普及-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给一座 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 行的数字三角形，从顶到底、每步走向正下方或右下方，求路径上数字之和的最大值。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"本类型的",
								/* @__PURE__ */ jsx("strong", { children: "裸模板" }),
								"。状态 ",
								/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
								" = 从 ",
								/* @__PURE__ */ jsx(M, { children: "(i,j)" }),
								" 到底的最大和，自底向上一路推到塔顶 ",
								/* @__PURE__ */ jsx(M, { children: "f[1][1]" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[i][j]=a[i][j]+\\max(f[i+1][j],\\ f[i+1][j+1])" }),
								"，边界 ",
								/* @__PURE__ */ jsx(M, { children: "f[n][j]=a[n][j]" }),
								"；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（自底向上）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1216,
								luogu: "P1216"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1002",
					name: "[NOIP2002 普及组] 过河卒",
					src: "NOIP2002 普及组",
					diff: "普及-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"卒从 ",
								/* @__PURE__ */ jsx(M, { children: "(0,0)" }),
								" 只走右 / 下到达 ",
								/* @__PURE__ */ jsx(M, { children: "(n,m)" }),
								"，棋盘上一匹马的",
								/* @__PURE__ */ jsx("strong", { children: "所在点与 8 个可跳到的点" }),
								"都不能经过，求不同路径条数。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角（最优 → 计数）",
							children: [
								"把数字三角形的 ",
								/* @__PURE__ */ jsx(M, { children: "\\max" }),
								" 换成",
								/* @__PURE__ */ jsx("strong", { children: "相加" }),
								"：",
								/* @__PURE__ */ jsx(M, { children: "f[i][j]=f[i-1][j]+f[i][j-1]" }),
								"，就从「求最优」跨到了「求方案数」。障碍格",
								/* @__PURE__ */ jsx("strong", { children: "钉成 0" }),
								" 即可自动绕行。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"两个新东西一次讲透：",
								/* @__PURE__ */ jsx("strong", { children: "计数型转移" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "\\max\\to +" }),
								"）与",
								/* @__PURE__ */ jsx("strong", { children: "障碍即非法状态清零" }),
								"。还有个必踩的坑——最坏路径数超过 ",
								/* @__PURE__ */ jsx(M, { children: "2^{31}" }),
								"，",
								/* @__PURE__ */ jsxs("strong", { children: ["必须开 ", /* @__PURE__ */ jsx(M, { children: "\\texttt{long long}" })] }),
								"，否则 int 溢出。坐标从 ",
								/* @__PURE__ */ jsx(M, { children: "0" }),
								" 起，平移成 ",
								/* @__PURE__ */ jsx(M, { children: "1" }),
								"-based 更好写。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（long long + 障碍清零）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1002,
								luogu: "P1002"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1004",
					name: "[NOIP2000 提高组] 方格取数",
					src: "NOIP2000 提高组",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n\\times n" }),
								" 方格中部分格有数字，从左上角走到右下角（只走右 / 下）",
								/* @__PURE__ */ jsx("strong", { children: "两次" }),
								"，取走沿途数字（同一格数字只算一次），求两条路径数字和的最大值。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "状态设计（一条路 → 两条路同走）",
							children: [
								"难点在从「一条路径」升到「",
								/* @__PURE__ */ jsx("strong", { children: "两条路径同时走" }),
								"」。让两条路",
								/* @__PURE__ */ jsx("strong", { children: "同步推进" }),
								"（走过的步数相同），状态 ",
								/* @__PURE__ */ jsx(M, { children: "f[i][j][k][l]" }),
								" 记两条路分别到 ",
								/* @__PURE__ */ jsx(M, { children: "(i,j)" }),
								" 与 ",
								/* @__PURE__ */ jsx(M, { children: "(k,l)" }),
								" 时的最大和； 转移从两条路各自的「上 / 左」共 ",
								/* @__PURE__ */ jsx(M, { children: "4" }),
								" 种组合取 max。若两条路",
								/* @__PURE__ */ jsx("strong", { children: "撞在同一格" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "i=k,\\ j=l" }),
								"），该格数字",
								/* @__PURE__ */ jsx("strong", { children: "只能算一次" }),
								"，减掉重复。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"经典的",
								/* @__PURE__ */ jsx("strong", { children: "多维线性 DP / 双线程" }),
								"代表：把「路径型」从二维状态推到四维，是理解「多条路径联合决策」的入门题。转移骨架仍是「回看上一步的几种来源取最优」，只是来源从 2 种变成 4 种。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（四维双线程）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1004,
								luogu: "P1004"
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
					pid: "P1508",
					name: "Likecloud-吃、吃、吃",
					hint: "矩阵三向最优路径：从底行中央下方出发向上走，每步可去正前 / 左前 / 右前，格中能量可正可负，求到顶行的最大能量和。数字三角形的三向版，f[i][j] 从下方三格取 max 再加自己。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1216",
					name: "[USACO1.5][IOI1994] 数字三角形",
					hint: "学完回来独立默写：自底向上，f[i][j]=a[i][j]+max(下方两格)。再试着改成自顶向下（f[i][j] 由上方两格转移），体会两种方向都对。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1057",
					name: "[NOIP2008 普及组] 传球游戏",
					hint: "最朴素的递推计数入门：f[i][j] = 第 i 次传球后球在第 j 人手里的方案数，每次只能传给左右邻居（环形）。转移 f[i][j]=f[i-1][左]+f[i-1][右]，答案 f[m][1]。"
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pointer-cue",
			children: [
				/* @__PURE__ */ jsx(Gamepad2, { size: 18 }),
				"想更直观地体会「一步一步累积」？到 ",
				/* @__PURE__ */ jsx(Link, {
					to: "/part/b",
					style: {
						color: "var(--accent-1)",
						fontWeight: 600
					},
					children: "本部分（线性 DP）页的互动小游戏"
				}),
				"里， 亲手在格子间走一条路，看每一步如何叠出最终的答案。"
			]
		})
	] });
}
//#endregion
export { LinearPath as default };
