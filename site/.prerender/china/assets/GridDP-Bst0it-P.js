import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, MousePointerClick, Plus } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/max-square/internal.ts
function validateGrid$1(grid) {
	if (grid.length === 0 || grid[0].length === 0) throw new RangeError("maximum-square grid must be non-empty");
	const columns = grid[0].length;
	for (const row of grid) {
		if (row.length !== columns) throw new RangeError("maximum-square grid must be rectangular");
		for (const value of row) if (value !== 0 && value !== 1) throw new RangeError("maximum-square values must be 0 or 1");
	}
}
function executeMaxSquare(grid, emit) {
	validateGrid$1(grid);
	const table = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(0));
	let bestSide = 0;
	let bestRow = -1;
	let bestColumn = -1;
	for (let row = 0; row < grid.length; row++) for (let column = 0; column < grid[0].length; column++) {
		const bit = grid[row][column];
		const up = row > 0 ? table[row - 1][column] : 0;
		const left = column > 0 ? table[row][column - 1] : 0;
		const diagonal = row > 0 && column > 0 ? table[row - 1][column - 1] : 0;
		let bottleneck = null;
		if (bit === 1 && row > 0 && column > 0) {
			const shortest = Math.min(up, left, diagonal);
			table[row][column] = shortest + 1;
			bottleneck = up === shortest ? "up" : left === shortest ? "left" : "diagonal";
		} else table[row][column] = bit;
		if (table[row][column] > bestSide) {
			bestSide = table[row][column];
			bestRow = row;
			bestColumn = column;
		}
		emit({
			type: "settled",
			row,
			column,
			bit,
			up,
			left,
			diagonal,
			side: table[row][column],
			bottleneck,
			bestSide,
			bestRow,
			bestColumn
		});
	}
	return {
		side: bestSide,
		area: bestSide * bestSide,
		table,
		bottomRight: bestRow < 0 ? null : {
			row: bestRow,
			column: bestColumn
		}
	};
}
function recordMaxSquare(grid) {
	const events = [];
	return {
		result: executeMaxSquare(grid, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/components/demos/grid/maxSquareSolver.ts
function settled(values) {
	const states = {};
	for (let row = 0; row < values.length; row++) for (let column = 0; column < values[row].length; column++) if (values[row][column] !== null) states[key(row, column)] = "settled";
	return states;
}
function maxSquare2D(grid) {
	const run = recordMaxSquare(grid);
	const rows = grid.length;
	const columns = grid[0].length;
	const table = Array.from({ length: rows }, () => Array(columns).fill(null));
	const snap = () => table.map((row) => row.slice());
	const frames = [{
		values: snap(),
		states: {},
		caption: "为每一格计算以它为右下角的全 1 最大正方形边长；上、左、左上三处的短板决定能扩多大。",
		formula: "dp[i][j]=\\min(dp[i-1][j],\\ dp[i][j-1],\\ dp[i-1][j-1])+1"
	}];
	for (const event of run.events) {
		table[event.row][event.column] = event.side;
		const states = settled(table);
		const arrows = [];
		if (event.bit === 0) states[key(event.row, event.column)] = "invalid";
		else if (event.row > 0 && event.column > 0) {
			const sources = [
				{
					row: event.row - 1,
					column: event.column,
					name: "up"
				},
				{
					row: event.row,
					column: event.column - 1,
					name: "left"
				},
				{
					row: event.row - 1,
					column: event.column - 1,
					name: "diagonal"
				}
			];
			for (const source of sources) {
				const chosen = source.name === event.bottleneck;
				states[key(source.row, source.column)] = chosen ? "chosen" : "source";
				arrows.push({
					from: {
						r: source.row,
						c: source.column
					},
					to: {
						r: event.row,
						c: event.column
					},
					kind: chosen ? "chosen" : "source"
				});
			}
			states[key(event.row, event.column)] = "current";
		} else states[key(event.row, event.column)] = "current";
		const caption = event.bit === 0 ? `格 <b>(${event.row},${event.column})</b> 是 0，不能作为全 1 正方形右下角。` : event.row === 0 || event.column === 0 ? `格 <b>(${event.row},${event.column})</b> 在首行或首列，边长为 <b>1</b>。` : `格 <b>(${event.row},${event.column})</b>：上 ${event.up}、左 ${event.left}、左上 ${event.diagonal} 的最小值加 1，得到 <b>${event.side}</b>。`;
		const formula = event.bit === 0 ? `dp[${event.row}][${event.column}]=0` : event.row === 0 || event.column === 0 ? `dp[${event.row}][${event.column}]=1` : `dp[${event.row}][${event.column}]=\\min(${event.up},${event.left},${event.diagonal})+1=${event.side}`;
		frames.push({
			values: snap(),
			states,
			active: {
				r: event.row,
				c: event.column
			},
			arrows,
			caption,
			formula
		});
	}
	const finalStates = settled(table);
	if (run.result.bottomRight !== null) {
		const { row: bottom, column: right } = run.result.bottomRight;
		for (let row = bottom - run.result.side + 1; row <= bottom; row++) for (let column = right - run.result.side + 1; column <= right; column++) finalStates[key(row, column)] = "chosen";
		finalStates[key(bottom, right)] = "current";
	}
	frames.push({
		values: snap(),
		states: finalStates,
		caption: `全表最大边长是 <b>${run.result.side}</b>，面积为 <b>${run.result.area}</b>。`,
		formula: `\\text{area}=${run.result.side}^2=${run.result.area}`
	});
	return {
		rows,
		cols: columns,
		cell: 42,
		rowHeaderLabels: Array.from({ length: rows }, (_, row) => `${row}`),
		colHeaderLabels: Array.from({ length: columns }, (_, column) => `${column}`),
		rowHeaderTitle: "行",
		colHeaderTitle: "列",
		frames
	};
}
//#endregion
//#region src/components/demos/grid/MaxSquareDemo.tsx
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
var DEFAULT_GRID$1 = [
	[
		1,
		0,
		1,
		1,
		0
	],
	[
		1,
		1,
		1,
		1,
		0
	],
	[
		0,
		1,
		1,
		1,
		1
	],
	[
		1,
		1,
		1,
		1,
		1
	]
];
function resizeGrid$1(g, rows, cols) {
	const out = [];
	for (let i = 0; i < rows; i++) {
		const src = g[i] ?? [];
		const row = [];
		for (let j = 0; j < cols; j++) row.push(src[j] ?? 1);
		out.push(row);
	}
	return out;
}
/** 最大正方形演示：可编辑 0/1 矩阵（点格子翻 0↔1），逐格填 dp[i][j]=以(i,j)为右下角的最大全 1 正方形边长。 */
function MaxSquareDemo() {
	const [rows, setRows] = useState(4);
	const [cols, setCols] = useState(5);
	const [grid, setGrid] = useState(DEFAULT_GRID$1);
	const shown = useMemo(() => resizeGrid$1(grid, rows, cols), [
		grid,
		rows,
		cols
	]);
	const model = useMemo(() => maxSquare2D(shown), [shown]);
	const modelKey = `sq-${rows}x${cols}-${shown.map((r) => r.join("")).join("_")}`;
	const toggle = (i, j) => setGrid(() => {
		const base = resizeGrid$1(shown, rows, cols);
		base[i] = base[i].slice();
		base[i][j] = base[i][j] === 1 ? 0 : 1;
		return base;
	});
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
		className: "kd__toolbar",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "kd__group-label",
			children: "0 / 1 矩阵（点格子翻转 · 1 = 可用，0 = 空洞 · 找最大全 1 正方形）"
		}), /* @__PURE__ */ jsx("div", {
			style: {
				display: "flex",
				flexDirection: "column",
				gap: 6,
				alignItems: "flex-start"
			},
			children: shown.map((row, i) => /* @__PURE__ */ jsx("div", {
				style: {
					display: "flex",
					gap: 6
				},
				children: row.map((val, j) => /* @__PURE__ */ jsx("button", {
					onClick: () => toggle(i, j),
					"aria-label": `格 (${i},${j}) = ${val}，点击翻转`,
					className: "mono",
					style: {
						width: 38,
						height: 38,
						borderRadius: 8,
						fontSize: 16,
						fontWeight: 700,
						display: "grid",
						placeItems: "center",
						cursor: "pointer",
						border: val === 1 ? "1.5px solid var(--accent-2)" : "1.5px solid var(--border-strong)",
						background: val === 1 ? "color-mix(in srgb, var(--accent-1) 22%, var(--surface-3))" : "var(--surface-2)",
						color: val === 1 ? "var(--accent-1)" : "var(--text-3)"
					},
					children: val
				}, j))
			}, i))
		})] }), /* @__PURE__ */ jsxs("div", {
			style: {
				display: "flex",
				gap: "var(--sp-4)"
			},
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "行数"
			}), /* @__PURE__ */ jsx(Stepper$1, {
				label: "行",
				value: rows,
				min: 2,
				max: 6,
				onChange: setRows
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "列数"
			}), /* @__PURE__ */ jsx(Stepper$1, {
				label: "列",
				value: cols,
				min: 2,
				max: 6,
				onChange: setCols
			})] })]
		})]
	}), /* @__PURE__ */ jsx(DPViz, { model }, modelKey)] });
}
//#endregion
//#region src/algorithms/two-path/internal.ts
function validateGrid(grid) {
	if (grid.length === 0 || grid[0].length === 0) throw new RangeError("two-path grid must be non-empty");
	const columns = grid[0].length;
	for (const row of grid) {
		if (row.length !== columns) throw new RangeError("two-path grid must be rectangular");
		for (const value of row) if (!Number.isFinite(value)) throw new RangeError("two-path values must be finite");
	}
}
function executeTwoPath(grid, emit) {
	validateGrid(grid);
	const rows = grid.length;
	const columns = grid[0].length;
	const lastStep = rows + columns - 2;
	let previous = Array.from({ length: rows }, () => Array(rows).fill(Number.NEGATIVE_INFINITY));
	previous[0][0] = grid[0][0];
	emit({
		type: "settled",
		step: 0,
		rowOne: 0,
		columnOne: 0,
		rowTwo: 0,
		columnTwo: 0,
		previousRowOne: 0,
		previousRowTwo: 0,
		previousValue: 0,
		addition: grid[0][0],
		value: grid[0][0],
		sameCell: true
	});
	for (let step = 1; step <= lastStep; step++) {
		const current = Array.from({ length: rows }, () => Array(rows).fill(Number.NEGATIVE_INFINITY));
		for (let rowOne = 0; rowOne <= Math.min(step, rows - 1); rowOne++) {
			const columnOne = step - rowOne;
			if (columnOne < 0 || columnOne >= columns) continue;
			for (let rowTwo = 0; rowTwo <= Math.min(step, rows - 1); rowTwo++) {
				const columnTwo = step - rowTwo;
				if (columnTwo < 0 || columnTwo >= columns) continue;
				let previousValue = Number.NEGATIVE_INFINITY;
				let previousRowOne = -1;
				let previousRowTwo = -1;
				for (const candidateRowOne of [rowOne - 1, rowOne]) for (const candidateRowTwo of [rowTwo - 1, rowTwo]) {
					if (candidateRowOne < 0 || candidateRowTwo < 0) continue;
					const candidate = previous[candidateRowOne][candidateRowTwo];
					if (candidate > previousValue) {
						previousValue = candidate;
						previousRowOne = candidateRowOne;
						previousRowTwo = candidateRowTwo;
					}
				}
				if (!Number.isFinite(previousValue)) continue;
				const sameCell = rowOne === rowTwo;
				const addition = grid[rowOne][columnOne] + (sameCell ? 0 : grid[rowTwo][columnTwo]);
				const value = previousValue + addition;
				current[rowOne][rowTwo] = value;
				emit({
					type: "settled",
					step,
					rowOne,
					columnOne,
					rowTwo,
					columnTwo,
					previousRowOne,
					previousRowTwo,
					previousValue,
					addition,
					value,
					sameCell
				});
			}
		}
		previous = current;
	}
	return {
		value: previous[rows - 1][rows - 1],
		table: previous
	};
}
function recordTwoPath(grid) {
	const events = [];
	return {
		result: executeTwoPath(grid, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/components/demos/grid/twoPathSolver.ts
function twoPath2D(grid) {
	const run = recordTwoPath(grid);
	const rows = grid.length;
	const columns = grid[0].length;
	const render = Array.from({ length: rows }, () => Array(rows).fill(null));
	const snap = () => render.map((row) => row.slice());
	const frames = [{
		values: snap(),
		states: {},
		caption: "<b>准备</b>：两条路同步从左上出发，同一步数时都在反对角线 x+y=k 上；表格记录两条路当前行号组成的状态。",
		formula: "dp[k][x_1][x_2]=\\max_{4\\text{ prev}}dp[k-1]+a[x_1][y_1]+a[x_2][y_2]"
	}];
	let shownStep = -1;
	for (const event of run.events) {
		if (event.step !== shownStep) {
			for (const row of render) row.fill(null);
			shownStep = event.step;
		}
		render[event.rowOne][event.rowTwo] = event.value;
		const states = {};
		for (let row = 0; row < rows; row++) for (let column = 0; column < rows; column++) if (render[row][column] !== null) states[key(row, column)] = "settled";
		states[key(event.rowOne, event.rowTwo)] = "current";
		const cellDescription = `路1→(${event.rowOne},${event.columnOne})，路2→(${event.rowTwo},${event.columnTwo})`;
		const additionDescription = event.sameCell ? `两路同格，权值 ${event.addition} 只算一次` : `两格权值合计 ${event.addition}`;
		frames.push({
			values: snap(),
			states,
			active: {
				r: event.rowOne,
				c: event.rowTwo
			},
			caption: `<b>k = ${event.step}</b>：${cellDescription}。上一步最优值 <b>${event.previousValue}</b>，${additionDescription} → <b>${event.value}</b>。`,
			formula: `dp[${event.step}][${event.rowOne}][${event.rowTwo}]=${event.previousValue}+${event.addition}=${event.value}`
		});
	}
	const finalStates = {};
	for (let row = 0; row < rows; row++) for (let column = 0; column < rows; column++) if (render[row][column] !== null) finalStates[key(row, column)] = "settled";
	finalStates[key(rows - 1, rows - 1)] = "chosen";
	const lastStep = rows + columns - 2;
	frames.push({
		values: snap(),
		states: finalStates,
		caption: `<b>终点</b>：两条路都到达 (${rows - 1},${columns - 1})，最大权值和为 <b>${run.result.value}</b>。`,
		formula: `dp[${lastStep}][${rows - 1}][${rows - 1}]=${run.result.value}`
	});
	return {
		rows,
		cols: rows,
		cell: 46,
		rowHeaderLabels: Array.from({ length: rows }, (_, row) => `x1=${row}`),
		colHeaderLabels: Array.from({ length: rows }, (_, row) => `x2=${row}`),
		rowHeaderTitle: "路1行",
		colHeaderTitle: "路2行",
		frames
	};
}
//#endregion
//#region src/components/demos/grid/TwoPathDemo.tsx
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
var DEFAULT_GRID = [
	[
		1,
		2,
		3
	],
	[
		2,
		5,
		1
	],
	[
		3,
		1,
		4
	]
];
function resizeGrid(g, rows, cols) {
	const out = [];
	for (let i = 0; i < rows; i++) {
		const src = g[i] ?? [];
		const row = [];
		for (let j = 0; j < cols; j++) row.push(src[j] ?? (i + j) % 5 + 1);
		out.push(row);
	}
	return out;
}
/** 双线程（传纸条）演示：两条路径同步从左上到右下，按步数压成 dp[k][x1][x2]，同格权值只算一次。可改每格权值与网格大小。 */
function TwoPathDemo() {
	const [rows, setRows] = useState(3);
	const [cols, setCols] = useState(3);
	const [grid, setGrid] = useState(DEFAULT_GRID);
	const shown = useMemo(() => resizeGrid(grid, rows, cols), [
		grid,
		rows,
		cols
	]);
	const model = useMemo(() => twoPath2D(shown), [shown]);
	const modelKey = `tp-${rows}x${cols}-${shown.map((r) => r.join(".")).join("_")}`;
	const setCell = (i, j, val) => setGrid(() => {
		const base = resizeGrid(shown, rows, cols);
		base[i] = base[i].slice();
		base[i][j] = val;
		return base;
	});
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
		className: "kd__toolbar",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "kd__group-label",
			children: "权值网格（点数字上的 ± 改值 · 两条路都从左上走到右下，只能右 / 下 · 同格只算一次）"
		}), /* @__PURE__ */ jsx("div", {
			style: {
				display: "flex",
				flexDirection: "column",
				gap: 6,
				alignItems: "flex-start"
			},
			children: shown.map((row, i) => /* @__PURE__ */ jsx("div", {
				style: {
					display: "flex",
					gap: 6
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
								fontSize: 16,
								fontWeight: 700,
								color: "var(--accent-1)",
								minWidth: 18,
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
		})] }), /* @__PURE__ */ jsxs("div", {
			style: {
				display: "flex",
				gap: "var(--sp-4)"
			},
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "行数"
			}), /* @__PURE__ */ jsx(Stepper, {
				label: "行",
				value: rows,
				min: 2,
				max: 4,
				onChange: setRows
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "列数"
			}), /* @__PURE__ */ jsx(Stepper, {
				label: "列",
				value: cols,
				min: 2,
				max: 4,
				onChange: setCols
			})] })]
		})]
	}), /* @__PURE__ */ jsx(DPViz, { model }, modelKey)] });
}
//#endregion
//#region src/content/d/GridDPArt.tsx
function GridSetupFigure() {
	const g = [
		[
			1,
			0,
			1,
			1,
			0
		],
		[
			1,
			1,
			1,
			1,
			0
		],
		[
			0,
			1,
			1,
			1,
			1
		],
		[
			1,
			1,
			1,
			1,
			1
		]
	];
	const S = 34;
	const x0 = 150;
	const y0 = 14;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 190",
		role: "img",
		"aria-label": "0/1 矩阵中最大的全 1 正方形",
		children: [
			g.map((row, i) => row.map((v, j) => {
				const x = x0 + j * 40;
				const y = y0 + i * 40;
				const one = v === 1;
				return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("rect", {
					x,
					y,
					width: S,
					height: S,
					rx: "7",
					fill: one ? "color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))" : "var(--surface-2)",
					stroke: one ? "var(--border-strong)" : "var(--border)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: x + S / 2,
					y: y + S / 2 + 5,
					textAnchor: "middle",
					fontSize: "15",
					className: "mono",
					fill: one ? "var(--accent-1)" : "var(--text-3)",
					children: v
				})] }, `${i}-${j}`);
			})),
			/* @__PURE__ */ jsx("rect", {
				x: 187,
				y: 51,
				width: 120,
				height: 120,
				rx: "9",
				fill: "none",
				stroke: "var(--accent-2)",
				strokeWidth: "3"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "96",
				fontSize: "13",
				fill: "var(--text-2)",
				children: "全 1 的"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "116",
				fontSize: "13",
				fill: "var(--text-2)",
				children: "最大正方形"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "140",
				fontSize: "15",
				className: "mono",
				fill: "var(--accent-2)",
				children: "边长 3"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "160",
				fontSize: "13",
				className: "mono",
				fill: "var(--text-3)",
				children: "面积 9"
			})
		]
	});
}
function SquareTransitionFigure() {
	const CW = 92;
	const CH = 52;
	const gx = (c) => 210 + c * 110;
	const gy = (r) => 24 + r * 78;
	const cxp = (c) => gx(c) + CW / 2;
	const cyp = (r) => gy(r) + CH / 2;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 210",
		role: "img",
		"aria-label": "以 (i,j) 为右下角的正方形由上左左上三格取 min 加一",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "sq-ar",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--viz-source)"
				})
			}) }),
			[
				{
					r: 0,
					c: 0,
					t: "dp[i−1][j−1]",
					tag: "左上"
				},
				{
					r: 0,
					c: 1,
					t: "dp[i−1][j]",
					tag: "上"
				},
				{
					r: 1,
					c: 0,
					t: "dp[i][j−1]",
					tag: "左"
				},
				{
					r: 1,
					c: 1,
					t: "dp[i][j]",
					tag: "当前"
				}
			].map((cell, i) => {
				const cur = cell.r === 1 && cell.c === 1;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${gx(cell.c)},${gy(cell.r)})`,
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: CW,
							height: CH,
							rx: "10",
							fill: cur ? "color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))" : "color-mix(in srgb, var(--accent-1) 10%, var(--surface-3))",
							stroke: cur ? "var(--viz-current)" : "var(--accent-2)",
							strokeWidth: "1.6"
						}),
						/* @__PURE__ */ jsx("text", {
							x: CW / 2,
							y: "22",
							textAnchor: "middle",
							fontSize: "11",
							fill: "var(--text-3)",
							children: cell.tag
						}),
						/* @__PURE__ */ jsx("text", {
							x: CW / 2,
							y: "40",
							textAnchor: "middle",
							fontSize: "12.5",
							className: "mono",
							fill: "var(--text-1)",
							children: cell.t
						})
					]
				}, i);
			}),
			/* @__PURE__ */ jsx("line", {
				x1: cxp(0),
				y1: gy(0) + CH,
				x2: cxp(1) - 24,
				y2: gy(1) + 6,
				stroke: "var(--viz-source)",
				strokeWidth: "2",
				markerEnd: "url(#sq-ar)"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: cxp(1),
				y1: gy(0) + CH,
				x2: cxp(1),
				y2: gy(1),
				stroke: "var(--viz-source)",
				strokeWidth: "2",
				markerEnd: "url(#sq-ar)"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: gx(0) + CW,
				y1: cyp(1),
				x2: gx(1),
				y2: cyp(1),
				stroke: "var(--viz-source)",
				strokeWidth: "2",
				markerEnd: "url(#sq-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(470,78)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "150",
						height: "54",
						rx: "12",
						fill: "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))",
						stroke: "var(--accent-2)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "75",
						y: "23",
						textAnchor: "middle",
						fontSize: "12",
						fill: "var(--text-2)",
						children: "取三者最短板"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "75",
						y: "42",
						textAnchor: "middle",
						fontSize: "13.5",
						className: "mono",
						fill: "var(--text-1)",
						children: "min(·) + 1"
					})
				]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "100",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "任一方向"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "118",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "缺一格，"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "136",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "正方形就"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "154",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "撑不起来"
			})
		]
	});
}
function TwoPathFigure() {
	const N = 4;
	const S = 30;
	const x0 = 40;
	const y0 = 22;
	const cx = (c) => x0 + c * 35 + S / 2;
	const cy = (r) => y0 + r * 35 + S / 2;
	const path1 = [
		[0, 0],
		[1, 0],
		[2, 0],
		[2, 1],
		[3, 1],
		[3, 2],
		[3, 3]
	];
	const path2 = [
		[0, 0],
		[0, 1],
		[0, 2],
		[1, 2],
		[1, 3],
		[2, 3],
		[3, 3]
	];
	const line = (pts) => pts.map(([r, c]) => `${cx(c)},${cy(r)}`).join(" ");
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 200",
		role: "img",
		"aria-label": "两条路径同步推进，走 k 步都落在反对角线上",
		children: [
			Array.from({ length: N }).map((_, i) => Array.from({ length: N }).map((_, j) => /* @__PURE__ */ jsx("rect", {
				x: x0 + j * 35,
				y: y0 + i * 35,
				width: S,
				height: S,
				rx: "6",
				fill: "var(--surface-3)",
				stroke: "var(--border)",
				strokeWidth: "1.2"
			}, `${i}-${j}`))),
			/* @__PURE__ */ jsx("line", {
				x1: cx(3),
				y1: cy(0),
				x2: cx(0),
				y2: cy(3),
				stroke: "var(--text-3)",
				strokeWidth: "1.4",
				strokeDasharray: "4 4"
			}),
			/* @__PURE__ */ jsx("text", {
				x: cx(0) - 4,
				y: cy(3) + 22,
				textAnchor: "middle",
				fontSize: "11",
				className: "mono",
				fill: "var(--text-3)",
				children: "x+y=3"
			}),
			/* @__PURE__ */ jsx("polyline", {
				points: line(path1),
				fill: "none",
				stroke: "var(--accent-1)",
				strokeWidth: "3",
				strokeLinejoin: "round",
				strokeLinecap: "round",
				opacity: "0.9"
			}),
			/* @__PURE__ */ jsx("polyline", {
				points: line(path2),
				fill: "none",
				stroke: "var(--accent-2)",
				strokeWidth: "3",
				strokeLinejoin: "round",
				strokeLinecap: "round",
				opacity: "0.9"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: cx(0),
				cy: cy(0),
				r: "7",
				fill: "var(--viz-current)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: cx(3),
				cy: cy(3),
				r: "7",
				fill: "var(--viz-chosen)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(360,30)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "14",
						height: "14",
						rx: "4",
						fill: "var(--accent-1)"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "22",
						y: "12",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "路径 1"
					}),
					/* @__PURE__ */ jsx("rect", {
						y: "28",
						width: "14",
						height: "14",
						rx: "4",
						fill: "var(--accent-2)"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "22",
						y: "40",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "路径 2"
					}),
					/* @__PURE__ */ jsx("text", {
						y: "74",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "两条路同步走，"
					}),
					/* @__PURE__ */ jsx("text", {
						y: "94",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "走了 k 步都停在"
					}),
					/* @__PURE__ */ jsx("text", {
						y: "114",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "反对角线 x+y=k 上"
					}),
					/* @__PURE__ */ jsx("text", {
						y: "140",
						fontSize: "12",
						fill: "var(--text-3)",
						children: "状态压成 dp[k][x1][x2]"
					})
				]
			})
		]
	});
}
//#endregion
//#region src/content/d/GridDP.tsx
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
var CODE_P1387 = `
#include <iostream>
#include <algorithm>
using namespace std;

int n, m;
int g[105][105];                 // 原始 0/1 矩阵
int f[105][105];                 // f[i][j]：以 (i,j) 为右下角的最大全 1 正方形边长

int main()
{
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            cin >> g[i][j];

    int ans = 0;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
        {
            if (g[i][j] == 1)                       // 0 格当不了右下角，f 保持 0
                f[i][j] = min(min(f[i - 1][j], f[i][j - 1]), f[i - 1][j - 1]) + 1; // ★上/左/左上取 min
            ans = max(ans, f[i][j]);                // 全表最大边长
        }

    cout << ans << endl;                            // 题目要边长；面积则输出 ans*ans
    return 0;
}
// TAG: 矩阵DP 最大正方形 二维状态`;
var CODE_P1006 = `
#include <iostream>
#include <algorithm>
using namespace std;

int m, n;                        // m 行 n 列
int a[55][55];
// 按步数压维：dp[k][x1][x2]，列号 y = k - x 自动定出。两条路同步从 (1,1) 走到 (m,n)。
int f[105][55][55];

int main()
{
    cin >> m >> n;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            cin >> a[i][j];

    int steps = m + n;           // 从 (1,1) 到 (m,n) 共走 (m-1)+(n-1) 步，k 从 2 到 m+n
    // 初始：k=2 时两条路都在 (1,1)，同格只算一次
    f[2][1][1] = a[1][1];

    for (int k = 3; k <= steps; k++)                 // 逐条反对角线推进
        for (int x1 = 1; x1 <= m; x1++)
        {
            int y1 = k - x1;
            if (y1 < 1 || y1 > n) continue;
            for (int x2 = 1; x2 <= m; x2++)
            {
                int y2 = k - x2;
                if (y2 < 1 || y2 > n) continue;
                // 上一步：每条路来自「上方 x-1」或「左方 x 不变」，四种组合取 max
                int best = max(max(f[k - 1][x1 - 1][x2 - 1], f[k - 1][x1 - 1][x2]),
                               max(f[k - 1][x1][x2 - 1], f[k - 1][x1][x2]));
                int add = a[x1][y1] + a[x2][y2];
                if (x1 == x2) add -= a[x1][y1];      // ★两路同格，权值只算一次
                f[k][x1][x2] = best + add;
            }
        }

    cout << f[steps][m][m] << endl;                  // 两路都到 (m,n)：x1=x2=m
    return 0;
}
// TAG: 矩阵DP 双线程 传纸条 按步压维`;
var CODE_P1719 = `
#include <iostream>
#include <algorithm>
#include <cstring>
using namespace std;

int n;
int s[130][130];                 // s[i][j]：前 i 行、第 j 列的列前缀和（按行累积）

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
        {
            int x;
            cin >> x;
            s[i][j] = s[i - 1][j] + x;              // ★只压「列方向」的前缀和
        }

    int ans = -0x3f3f3f3f;
    for (int top = 1; top <= n; top++)              // 枚举子矩形的上边界行
        for (int bot = top; bot <= n; bot++)        // 枚举下边界行
        {
            // 把 top..bot 这几行压成一维：第 j 列的和 = s[bot][j] - s[top-1][j]
            // 对这个一维数组跑一次最大子段和（Kadane），即得跨这段行的最优子矩形
            int cur = 0;
            for (int j = 1; j <= n; j++)
            {
                int col = s[bot][j] - s[top - 1][j];
                cur = max(col, cur + col);          // Kadane：要么另起，要么接上一段
                ans = max(ans, cur);
            }
        }

    cout << ans << endl;
    return 0;
}
// TAG: 矩阵DP 二维子矩阵 前缀和 最大子段和升维`;
function GridDP() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "当状态住进「行 × 列」的格子里"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx(Link, {
								to: "/part/b/path",
								style: { color: "var(--accent-2)" },
								children: "B 部分的路径型入门"
							}),
							" 已经让我们在网格上走过一次——数字三角形、过河卒，都是「从一格走到相邻一格」。 这一节把镜头正式对准",
							/* @__PURE__ */ jsx("strong", { children: "二维坐标上的 DP" }),
							"：状态不再是一条链上的 ",
							/* @__PURE__ */ jsx(M, { children: "f[i]" }),
							"，而是一整张表 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
							"，下标 ",
							/* @__PURE__ */ jsx(M, { children: "(i,j)" }),
							" 就是",
							/* @__PURE__ */ jsxs("strong", { children: [
								"第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 行第 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 列"
							] }),
							"那个格子。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "先划清和 B 路径型的边界：" }),
							"「在网格上数路径条数」这一路（过河卒 ",
							/* @__PURE__ */ jsx(M, { children: "f[i][j]=f[i-1][j]+f[i][j-1]" }),
							"、障碍清零）本质仍是",
							/* @__PURE__ */ jsx("strong", { children: "路径计数" }),
							"，入门与例题都放在 ",
							/* @__PURE__ */ jsx(Link, {
								to: "/part/b/path",
								style: { color: "var(--accent-2)" },
								children: "B 路径型的过河卒 P1002"
							}),
							"； 本页不再重复计数那一面，而是专注二维状态本身的",
							/* @__PURE__ */ jsx("strong", { children: "「形态」" }),
							"——一格的答案由它",
							/* @__PURE__ */ jsx("strong", { children: "左 / 上 / 左上邻格" }),
							"的答案「长」出来（最大正方形），以及一张网格上",
							/* @__PURE__ */ jsx("strong", { children: "两条路径联合决策" }),
							"（传纸条）。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"网格 DP 的通用套路只有一句话：",
							/* @__PURE__ */ jsx("strong", { children: "算一格，只回看它的几个「邻居来源」" }),
							"。因为每步只能往固定方向走，任何一格 ",
							/* @__PURE__ */ jsx(M, { children: "(i,j)" }),
							" 的最后一步， 都只可能从",
							/* @__PURE__ */ jsx("strong", { children: "上方" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "(i-1,j)" }),
							"、",
							/* @__PURE__ */ jsx("strong", { children: "左方" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "(i,j-1)" }),
							"，或",
							/* @__PURE__ */ jsx("strong", { children: "左上方" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "(i-1,j-1)" }),
							" 这几格接上来。把「谁能接过来」想清楚，转移就成形了。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(GridSetupFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"本节主问题——「最大正方形」：一张 0/1 矩阵，1 是可用格、0 是空洞，要找出",
							/* @__PURE__ */ jsx("strong", { children: "全由 1 组成的最大正方形" }),
							"。图中最大的是一个 3×3 块，边长 3、面积 9。"
						]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"为什么不直接暴力？枚举正方形的",
						/* @__PURE__ */ jsx("strong", { children: "左上角 + 边长" }),
						"再逐格检查是否全 1，最坏是 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2m^2)" }),
						" 甚至更糟——网格一大就崩。 网格 DP 的思路，是给",
						/* @__PURE__ */ jsx("strong", { children: "每一格" }),
						"算一个「以它为角能撑起多大的正方形」，让相邻格子的答案",
						/* @__PURE__ */ jsx("strong", { children: "互相接力" }),
						"，把重复检查压成一次填表。下面就把这个 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
						" 定出来。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "最大正方形：三格取 min，短板说了算"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
						"设 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
						" 表示：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"以 ",
							/* @__PURE__ */ jsx(M, { children: "(i,j)" }),
							" 为",
							/* @__PURE__ */ jsx("u", { children: "右下角" }),
							"、全部由 1 组成的最大正方形的边长"
						] }),
						"。 为什么钉死「右下角」？因为一个正方形有四个角，但只有",
						/* @__PURE__ */ jsx("strong", { children: "右下角" }),
						"能同时「看见」它左边、上边、左上的邻居——正好对应网格 DP 的三个来源，转移最顺。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"若 ",
						/* @__PURE__ */ jsx(M, { children: "(i,j)" }),
						" 本身是 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						"，它当不了任何全 1 正方形的右下角，直接 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i][j]=0" }),
						"。 若它是 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						"，能撑多大？关键洞察：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"以 ",
							/* @__PURE__ */ jsx(M, { children: "(i,j)" }),
							" 为右下角的正方形，等价于它的上、左、左上三个方向都能撑起「至少一样大」的正方形"
						] }),
						"——任一方向短一截，整体就被拖小。于是取三者的",
						/* @__PURE__ */ jsx("strong", { children: "最短板" }),
						"再加自己这一层："
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(SquareTransitionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "以 (i,j) 为右下角的正方形，被上 dp[i−1][j]、左 dp[i][j−1]、左上 dp[i−1][j−1] 三个方向共同「顶住」——取三者最短板 +1。任一方向缺一格，正方形就撑不起来。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"合起来就是",
							/* @__PURE__ */ jsx("strong", { children: "转移方程" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i][j]=\\begin{cases}\\min\\big(dp[i-1][j],\\ dp[i][j-1],\\ dp[i-1][j-1]\\big)+1, & g[i][j]=1\\\\[4pt] 0, & g[i][j]=0\\end{cases}" }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "边界" }),
							"在首行、首列：上方或左方越界，正方形最多 ",
							/* @__PURE__ */ jsx(M, { children: "1\\times1" }),
							"，故 ",
							/* @__PURE__ */ jsx(M, { children: "g[i][j]=1" }),
							" 时 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i][j]=1" }),
							"。",
							/* @__PURE__ */ jsx("strong", { children: "答案" }),
							"不在某个固定角落，而是",
							/* @__PURE__ */ jsxs("strong", { children: ["全表最大的 ", /* @__PURE__ */ jsx(M, { children: "dp[i][j]" })] }),
							"（它的平方即最大面积）——因为正方形的右下角可能落在任何位置。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质 · 短板决定边长",
					children: [
						"「以我为右下角的正方形」能有多大，取决于",
						/* @__PURE__ */ jsx("strong", { children: "上、左、左上三个邻居里最弱的那个" }),
						"：只要有一个方向撑不到 ",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						"，我就凑不出 ",
						/* @__PURE__ */ jsx(M, { children: "k+1" }),
						" 的正方形。 这个 ",
						/* @__PURE__ */ jsx(M, { children: "\\min(\\cdot)+1" }),
						" 把「逐格检查一个二维区域是否全 1」压成了 ",
						/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
						" 一次扫描——",
						/* @__PURE__ */ jsx("strong", { children: "二维状态最经典的一记" }),
						"：一格的答案，由它左上三邻的答案接力而来。"
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
						"用引入图那张矩阵的",
						/* @__PURE__ */ jsx("strong", { children: "左上一角" }),
						"走几步（行列都从 0 编号）。第 0 行原样落地 ",
						/* @__PURE__ */ jsx(M, { children: "1,0,1,1,0" }),
						"，我们从第 1 行往里填："
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
									/* @__PURE__ */ jsx("b", { children: "首行落地。" }),
									" 第 0 行没有上方，能撑的正方形最多 ",
									/* @__PURE__ */ jsx(M, { children: "1\\times1" }),
									"：格是 1 就记 1、是 0 就记 0 → ",
									/* @__PURE__ */ jsx(M, { children: "dp[0]=1,0,1,1,0" }),
									"。首列同理。这是整张表的地基。"
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
									/* @__PURE__ */ jsxs("b", { children: ["算 ", /* @__PURE__ */ jsx(M, { children: "dp[1][1]" })] }),
									"（本身 ",
									/* @__PURE__ */ jsx(M, { children: "g=1" }),
									"）。三来源：上 ",
									/* @__PURE__ */ jsx(M, { children: "dp[0][1]=0" }),
									"、左 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][0]=1" }),
									"、左上 ",
									/* @__PURE__ */ jsx(M, { children: "dp[0][0]=1" }),
									"，最短板是 ",
									/* @__PURE__ */ jsx(M, { children: "0" }),
									"， 于是 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][1]=0+1=1" }),
									"——上方那个 0 把它死死压成了 ",
									/* @__PURE__ */ jsx(M, { children: "1" }),
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
									/* @__PURE__ */ jsxs("b", { children: ["算 ", /* @__PURE__ */ jsx(M, { children: "dp[1][3]" })] }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "g=1" }),
									"）。三来源：上 ",
									/* @__PURE__ */ jsx(M, { children: "dp[0][3]=1" }),
									"、左 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][2]=1" }),
									"、左上 ",
									/* @__PURE__ */ jsx(M, { children: "dp[0][2]=1" }),
									"，最短板 ",
									/* @__PURE__ */ jsx(M, { children: "1" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "dp[1][3]=1+1=2" }),
									"——三邻都够到 1，于是这里长出一个 ",
									/* @__PURE__ */ jsx(M, { children: "2\\times2" }),
									" 正方形。"
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
									/* @__PURE__ */ jsxs("b", { children: ["一路推到 ", /* @__PURE__ */ jsx(M, { children: "dp[3][3]" })] }),
									"。此时它的上、左、左上分别是 ",
									/* @__PURE__ */ jsx(M, { children: "2,2,2" }),
									"，最短板 ",
									/* @__PURE__ */ jsx(M, { children: "2" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "dp[3][3]=2+1=3" }),
									"—— 全表最大值就是这个 ",
									/* @__PURE__ */ jsx("strong", { children: "3" }),
									"，对应那个 ",
									/* @__PURE__ */ jsx(M, { children: "3\\times3" }),
									" 全 1 块，面积 ",
									/* @__PURE__ */ jsx(M, { children: "9" }),
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
						"下面的演示会把整张 ",
						/* @__PURE__ */ jsx(M, { children: "dp" }),
						" 表",
						/* @__PURE__ */ jsx("strong", { children: "逐格填满" }),
						"，高亮每格的上 / 左 / 左上三来源并标出最短板。",
						/* @__PURE__ */ jsx("strong", { children: "点矩阵里的格子可翻转 0↔1" }),
						"，看最大正方形实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看正方形一格一格长出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(MaxSquareDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化 · 双线程：两条路一起走"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "先说和 B 路径型的分工：" }),
							"双线程的",
							/* @__PURE__ */ jsx("strong", { children: "四维朴素写法" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "dp[x_1][y_1][x_2][y_2]" }),
							"）已在 ",
							/* @__PURE__ */ jsx(Link, {
								to: "/part/b/path",
								style: { color: "var(--accent-2)" },
								children: "B 路径型"
							}),
							" 里随方格取数带出——那边侧重",
							/* @__PURE__ */ jsx("strong", { children: "路径 DP 入门" }),
							"、顺手把四维摆出来； 本页不再重复四维怎么来，而是专注",
							/* @__PURE__ */ jsxs("strong", { children: ["把它压成三维 ", /* @__PURE__ */ jsx(M, { children: "dp[k][x_1][x_2]" })] }),
							"，这正是「网格二维状态 + 压维」这一专章的重心。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"网格 DP 的第二条主线，是",
							/* @__PURE__ */ jsx("strong", { children: "同一张网格上有两条路径要一起规划" }),
							"——经典模型「",
							/* @__PURE__ */ jsx("strong", { children: "传纸条" }),
							"」：两位同学分别从",
							/* @__PURE__ */ jsx("strong", { children: "左上角" }),
							"出发、只能",
							/* @__PURE__ */ jsx("strong", { children: "向右或向下" }),
							"，各自走到",
							/* @__PURE__ */ jsx("strong", { children: "右下角" }),
							"， 每格有一个好感度权值，问两条路径",
							/* @__PURE__ */ jsx("strong", { children: "合计能收集的最大权值和" }),
							"（同一格被两条路都经过时，权值",
							/* @__PURE__ */ jsx("strong", { children: "只算一次" }),
							"）。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"为什么不能「先跑一条最优路，再跑第二条」？因为两条路会",
							/* @__PURE__ */ jsx("strong", { children: "互相影响" }),
							"：第一条把高权值的格子占了，第二条就只能退而求其次——分开贪心必然错。正确做法是让",
							/* @__PURE__ */ jsx("strong", { children: "两条路同时决策" }),
							"， 状态一口气记住",
							/* @__PURE__ */ jsx("strong", { children: "两条路各自的位置" }),
							"：",
							/* @__PURE__ */ jsx(M, { children: "dp[x_1][y_1][x_2][y_2]" }),
							"，四维，转移从两条路各自的「上 / 左」共 ",
							/* @__PURE__ */ jsx(M, { children: "4" }),
							" 种组合取 max（这正是 ",
							/* @__PURE__ */ jsx(Link, {
								to: "/part/b/path",
								style: { color: "var(--accent-2)" },
								children: "B 路径型"
							}),
							" 里方格取数的四维写法）。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"四维能",
							/* @__PURE__ */ jsx("strong", { children: "压成三维" }),
							"。注意一个约束：两条路",
							/* @__PURE__ */ jsx("strong", { children: "同步推进" }),
							"——走了同样多步的两条右/下路径，",
							/* @__PURE__ */ jsx("strong", { children: "行号 + 列号必然相等" }),
							"，即 ",
							/* @__PURE__ */ jsx(M, { children: "x_1+y_1=x_2+y_2=k" }),
							"（都落在",
							/* @__PURE__ */ jsx("strong", { children: "反对角线" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "x+y=k" }),
							" 上）。 既然列号能由 ",
							/* @__PURE__ */ jsx(M, { children: "y=k-x" }),
							" 反推，就不必单独存它，状态压成 ",
							/* @__PURE__ */ jsx(M, { children: "dp[k][x_1][x_2]" }),
							"："
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(TwoPathFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "两条路径同步从左上走到右下：走了 k 步时，两条路都落在反对角线 x+y=k 上。只需记两条路当前的行号 x1、x2，列号 y=k−x 自动定出——四维 dp 压成三维 dp[k][x1][x2]。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"转移：从 ",
							/* @__PURE__ */ jsx(M, { children: "k-1" }),
							" 层推到 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							" 层，每条路上一步要么来自",
							/* @__PURE__ */ jsx("strong", { children: "上方" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "x" }),
							" 减 1）、要么来自",
							/* @__PURE__ */ jsx("strong", { children: "左方" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "x" }),
							" 不变、",
							/* @__PURE__ */ jsx(M, { children: "y" }),
							" 减 1），两条路组合出 ",
							/* @__PURE__ */ jsx(M, { children: "4" }),
							" 种来源取 max，再加上两条路当前所站两格的权值。",
							/* @__PURE__ */ jsxs("strong", { children: ["关键一处：若两条路走到", /* @__PURE__ */ jsx("u", { children: "同一格" })] }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "x_1=x_2" }),
							"，此时 ",
							/* @__PURE__ */ jsx(M, { children: "y" }),
							" 也相等），那格权值",
							/* @__PURE__ */ jsx("strong", { children: "只能加一次" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[k][x_1][x_2]=\\max_{4\\text{ prev}}dp[k-1]+a[x_1][y_1]+a[x_2][y_2]-[\\,x_1=x_2\\,]\\cdot a[x_1][y_1]" }),
						/* @__PURE__ */ jsx("p", { children: "把这套三维推进写成中文伪代码：" }),
						/* @__PURE__ */ jsx("pre", {
							className: "mono",
							style: preMono,
							children: `# 双线程 / 传纸条：两条路同步从 (0,0) 走到 (R-1,C-1)
dp[0][0] = a[0][0]                 # k=0，两条路都在起点，同格只算一次
for k = 1 … (R-1)+(C-1):          # 逐条反对角线
  for x1 in 合法行, x2 in 合法行:    # y1=k-x1, y2=k-x2（越界跳过）
    best = max over (路1 来自上/左) × (路2 来自上/左)   # 共 4 种
    add  = a[x1][y1] + a[x2][y2]
    if x1 == x2: add -= a[x1][y1]  # ★两路撞同格，权值只算一次
    dp[k][x1][x2] = best + add
answer = dp[最后一层][R-1][R-1]     # 两条路都到右下角`
						})
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "双线程要诀 · 同步推进 + 同格去重",
					children: [
						"「两条路径联合决策」的通法：让两条路",
						/* @__PURE__ */ jsx("strong", { children: "同步走" }),
						"（步数相同），把",
						/* @__PURE__ */ jsxs("strong", { children: ["两条路的位置", /* @__PURE__ */ jsx("u", { children: "拼进同一个状态" })] }),
						"一起转移，绝不各自贪心。 由「同步」得到 ",
						/* @__PURE__ */ jsx(M, { children: "x_1+y_1=x_2+y_2=k" }),
						"，可省掉一维压成 ",
						/* @__PURE__ */ jsx(M, { children: "dp[k][x_1][x_2]" }),
						"；而两路可能",
						/* @__PURE__ */ jsx("strong", { children: "重合" }),
						"，凡 ",
						/* @__PURE__ */ jsx(M, { children: "x_1=x_2" }),
						" 的格子记得",
						/* @__PURE__ */ jsx("strong", { children: "扣掉一次重复权值" }),
						"。这两条一立，从「两条路」到「多条路」都是同一副骨架。"
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把 ",
						/* @__PURE__ */ jsx(M, { children: "dp[k][x_1][x_2]" }),
						" 摆成一张",
						/* @__PURE__ */ jsx("strong", { children: "行 = 路1 行号、列 = 路2 行号" }),
						"的表，",
						/* @__PURE__ */ jsxs("strong", { children: ["逐层 ", /* @__PURE__ */ jsx(M, { children: "k" })] }),
						" 填格；对角线上（",
						/* @__PURE__ */ jsx(M, { children: "x_1=x_2" }),
						"）的格子正是「两路撞在一起、权值去重」的地方。改网格权值或大小，看最大权值和实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看两条路同步推进"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(TwoPathDemo, {})
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
					pid: "P1387",
					name: "最大正方形",
					src: "洛谷原生",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给定 ",
								/* @__PURE__ */ jsx(M, { children: "n\\times m" }),
								" 的 0/1 矩阵，求",
								/* @__PURE__ */ jsx("strong", { children: "只含 1 的最大正方形" }),
								"的边长（边长平方即面积）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"本节主问题的",
								/* @__PURE__ */ jsx("strong", { children: "裸模板" }),
								"。状态 ",
								/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
								" = 以 ",
								/* @__PURE__ */ jsx(M, { children: "(i,j)" }),
								" 为右下角的最大全 1 正方形边长，答案取全表最大 ",
								/* @__PURE__ */ jsx(M, { children: "f" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[i][j]=\\min(f[i-1][j],\\ f[i][j-1],\\ f[i-1][j-1])+1" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "g[i][j]=1" }),
								" 时），否则 ",
								/* @__PURE__ */ jsx(M, { children: "0" }),
								"；一次扫描 ",
								/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（三格取 min）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1387,
								luogu: "P1387"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1006",
					name: "[NOIP2008 提高组] 传纸条",
					src: "NOIP2008 提高组",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "m\\times n" }),
								" 网格每格有一个好感度，两张纸条各从左上角走到右下角（只走右 / 下），两条路径",
								/* @__PURE__ */ jsx("strong", { children: "不重叠" }),
								"，求两条路径好感度之和的最大值。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "状态设计（双线程 / 按步压维）",
							children: [
								"让两条路",
								/* @__PURE__ */ jsx("strong", { children: "同步推进" }),
								"：走了 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 步都落在反对角线 ",
								/* @__PURE__ */ jsx(M, { children: "x+y=k" }),
								" 上，状态压成 ",
								/* @__PURE__ */ jsx(M, { children: "f[k][x_1][x_2]" }),
								"（列号 ",
								/* @__PURE__ */ jsx(M, { children: "y=k-x" }),
								" 反推）。 转移从两条路各自的「上 / 左」共 ",
								/* @__PURE__ */ jsx(M, { children: "4" }),
								" 种组合取 max；两路",
								/* @__PURE__ */ jsx("strong", { children: "撞在同格" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "x_1=x_2" }),
								"）时权值只算一次——这道自然逼你把「重叠去重」写进转移。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								/* @__PURE__ */ jsx("strong", { children: "双线程 DP 的标杆题" }),
								"：真正的门槛不是转移，而是想到「",
								/* @__PURE__ */ jsx("strong", { children: "两条路必须同时决策、位置一起进状态" }),
								"」，以及用「同步推进」把四维压成三维。学会它，方格取数、后续多路径问题都是同一副骨架。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（按步压维 dp[k][x1][x2]）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1006,
								luogu: "P1006"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1719",
					name: "最大加权矩形",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给定 ",
								/* @__PURE__ */ jsx(M, { children: "n\\times n" }),
								" 的整数权值矩阵（权值可正可负），求一个子矩形，使其中所有元素之",
								/* @__PURE__ */ jsx("strong", { children: "和最大" }),
								"，输出这个最大和。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系（二维子矩阵，非路径计数）",
							children: [
								"这是网格 DP 的",
								/* @__PURE__ */ jsx("strong", { children: "另一副招牌形态" }),
								"：不再是「走路径」，而是「圈一块二维区域求最优」。做法是把",
								/* @__PURE__ */ jsx("strong", { children: "一维最大子段和（Kadane）升到二维" }),
								"——枚举子矩形的",
								/* @__PURE__ */ jsx("strong", { children: "上、下两行边界" }),
								"，把这两行之间",
								/* @__PURE__ */ jsx("strong", { children: "每一列的和" }),
								"压成一个一维数组，对它跑一次最大子段和，即得跨这段行的最优子矩形。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"列前缀和 ",
								/* @__PURE__ */ jsx(M, { children: "s[i][j]" }),
								" 把「取 ",
								/* @__PURE__ */ jsx(M, { children: "top..bot" }),
								" 行、第 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 列的和」压成 ",
								/* @__PURE__ */ jsx(M, { children: "s[bot][j]-s[top-1][j]" }),
								"；对该一维数组 Kadane：",
								/* @__PURE__ */ jsx(M, { children: "cur=\\max(col,\\ cur+col)" }),
								"。枚举 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								" 对行边界，每次 ",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								" 扫列，合计 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"补齐 D 的",
								/* @__PURE__ */ jsxs("strong", { children: [
									"二维",
									/* @__PURE__ */ jsx("u", { children: "区域" }),
									"视角"
								] }),
								"（与「最大正方形」的二维",
								/* @__PURE__ */ jsx("u", { children: "状态" }),
								"递推互补），并把「一维经典算法升到二维」这个网格 DP 的常用手法讲透——",
								/* @__PURE__ */ jsx("strong", { children: "与 B 路径型完全无重叠" }),
								"：那边是网格上「走路径」，这边是网格上「圈矩形」。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（列前缀和 + Kadane 升维）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1719,
								luogu: "P1719"
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
					pid: "P1736",
					name: "创意吃鱼法",
					hint: "最大正方形的变体（对角线版）：在 01 矩阵里找一个正方形，其某条对角线全是 1、其余格全是 0，求最长对角线。设 f[i][j] 为以 (i,j) 为右下角的合法正方形边长，转移 f[i][j]=min(f[i-1][j-1], 左侧连续 0 长, 上方连续 0 长)+1；两条对角线方向各扫一遍。仍是「左/上/左上邻格接力」的二维状态，与最大正方形同族。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2701",
					name: "[USACO5.3] 巨大的牛棚 Big Barn",
					hint: "最大正方形的裸应用：N×N 农场里有若干棵树，求不含任何树的最大正方形边长。把「有树」当 0、「空地」当 1，转移就是 f[i][j]=min(f[i-1][j], f[i][j-1], f[i-1][j-1])+1，答案取全表最大——与本页 P1387 同一副模具，换了层皮。"
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "prose",
					style: {
						maxWidth: "none",
						fontSize: "13.5px",
						color: "var(--text-3)",
						marginTop: "var(--sp-4)"
					},
					children: [
						"说明：",
						/* @__PURE__ */ jsx("strong", { children: "纯二维网格状态" }),
						"（非路径计数）的洛谷原生题池并不宽——「网格上数路径」那一类已归到 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/b/path",
							style: { color: "var(--accent-2)" },
							children: "B 路径型"
						}),
						"，此处只收本页招牌的「二维状态形态」题。上面两道都是最大正方形的直系变体；若想再练二维",
						/* @__PURE__ */ jsx("u", { children: "区域" }),
						"那一路，例题 ",
						/* @__PURE__ */ jsx("strong", { children: "P1719 最大加权矩形" }),
						" 可不看参考代码回炉默写（枚举行边界 + 每列压一维跑 Kadane）。"
					]
				})
			]
		})
	] });
}
//#endregion
export { GridDP as default };
