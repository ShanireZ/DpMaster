import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
import { n as PlaybackControls, t as useStepPlayer } from "./useStepPlayer-CZuIDieE.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MousePointerClick, RefreshCw } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/edit-distance/internal.ts
function executeEditDistance(source, target, emit) {
	const table = Array.from({ length: source.length + 1 }, () => Array(target.length + 1).fill(0));
	for (let row = 0; row <= source.length; row++) table[row][0] = row;
	for (let column = 0; column <= target.length; column++) table[0][column] = column;
	for (let row = 1; row <= source.length; row++) for (let column = 1; column <= target.length; column++) {
		const same = source[row - 1] === target[column - 1];
		const deleteCost = table[row - 1][column] + 1;
		const insertCost = table[row][column - 1] + 1;
		const substituteCost = table[row - 1][column - 1] + (same ? 0 : 1);
		const distance = Math.min(deleteCost, insertCost, substituteCost);
		const choice = substituteCost === distance ? "diagonal" : deleteCost === distance ? "delete" : "insert";
		table[row][column] = distance;
		emit({
			type: "settled",
			row,
			column,
			same,
			deleteCost,
			insertCost,
			substituteCost,
			distance,
			choice
		});
	}
	return {
		distance: table[source.length][target.length],
		table
	};
}
function recordEditDistance(source, target) {
	const events = [];
	return {
		result: executeEditDistance(source, target, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/components/demos/grid/editSolver.ts
function settled(values) {
	const states = {};
	for (let row = 0; row < values.length; row++) for (let column = 0; column < values[row].length; column++) if (values[row][column] !== null) states[key(row, column)] = "settled";
	return states;
}
function edit2D(source, target) {
	const run = recordEditDistance(source, target);
	const rows = source.length + 1;
	const columns = target.length + 1;
	const table = Array.from({ length: rows }, () => Array(columns).fill(null));
	for (let row = 0; row < rows; row++) table[row][0] = row;
	for (let column = 0; column < columns; column++) table[0][column] = column;
	const snap = () => table.map((row) => row.slice());
	const initialStates = settled(table);
	for (let row = 0; row < rows; row++) initialStates[key(row, 0)] = "source";
	for (let column = 0; column < columns; column++) initialStates[key(0, column)] = "source";
	const frames = [{
		values: snap(),
		states: initialStates,
		caption: "<b>边界</b>：首列表示逐个删除，首行表示逐个插入。这是整张表的地基。",
		formula: "dp[i][0]=i,\\quad dp[0][j]=j"
	}];
	for (const event of run.events) {
		const { row, column } = event;
		table[row][column] = event.distance;
		const states = settled(table);
		const arrows = [];
		const sources = [
			{
				row: row - 1,
				column,
				choice: "delete"
			},
			{
				row,
				column: column - 1,
				choice: "insert"
			},
			{
				row: row - 1,
				column: column - 1,
				choice: "diagonal"
			}
		];
		for (const sourceCell of sources) {
			const chosen = event.choice === sourceCell.choice;
			states[key(sourceCell.row, sourceCell.column)] = chosen ? "chosen" : "source";
			arrows.push({
				from: {
					r: sourceCell.row,
					c: sourceCell.column
				},
				to: {
					r: row,
					c: column
				},
				kind: chosen ? "chosen" : "source"
			});
		}
		states[key(row, column)] = "current";
		const caption = `A[${row}]=<b>'${source[row - 1]}'</b> · B[${column}]=<b>'${target[column - 1]}'</b>：删=<b>${event.deleteCost}</b>，插=<b>${event.insertCost}</b>，${event.same ? "匹配" : "替换"}=<b>${event.substituteCost}</b> → 取最小 <b>${event.distance}</b>。`;
		const formula = `dp[${row}][${column}]=\\min(${event.deleteCost},\\ ${event.insertCost},\\ ${event.substituteCost})=${event.distance}`;
		frames.push({
			values: snap(),
			states,
			arrows,
			active: {
				r: row,
				c: column
			},
			caption,
			formula
		});
	}
	const finalStates = settled(table);
	finalStates[key(source.length, target.length)] = "chosen";
	frames.push({
		values: snap(),
		states: finalStates,
		caption: `答案在右下角 <b>dp[${source.length}][${target.length}] = ${run.result.distance}</b>。`,
		formula: `dp[${source.length}][${target.length}]=${run.result.distance}`
	});
	return {
		rows,
		cols: columns,
		cell: 40,
		rowHeaderLabels: ["∅", ...source.split("")],
		colHeaderLabels: ["∅", ...target.split("")],
		frames
	};
}
//#endregion
//#region src/components/demos/grid/EditDistanceDemo.tsx
function sanitize$1(s) {
	return s.replace(/[^A-Za-z]/g, "").toLowerCase().slice(0, 6);
}
var PRESETS = [
	["horse", "ros"],
	["kitten", "sitten"],
	["abc", "abc"],
	["flaw", "lawn"]
];
/** 编辑距离主演示：两串可编辑（≤6），二维填表 + 三向转移逐格取 min。 */
function EditDistanceDemo() {
	const [a, setA] = useState("horse");
	const [b, setB] = useState("ros");
	const model = useMemo(() => edit2D(a || "", b || ""), [a, b]);
	const modelKey = `ed-${a}-${b}`;
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
		className: "kd__toolbar",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "源串 A（改成 B · 仅字母 · ≤6）"
			}), /* @__PURE__ */ jsx("input", {
				className: "ed__input",
				value: a,
				maxLength: 6,
				spellCheck: false,
				onChange: (e) => setA(sanitize$1(e.target.value)),
				"aria-label": "源串 A"
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "目标串 B"
			}), /* @__PURE__ */ jsx("input", {
				className: "ed__input",
				value: b,
				maxLength: 6,
				spellCheck: false,
				onChange: (e) => setB(sanitize$1(e.target.value)),
				"aria-label": "目标串 B"
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "试几组"
			}), /* @__PURE__ */ jsxs("div", {
				className: "ed__presets",
				children: [PRESETS.map(([pa, pb]) => /* @__PURE__ */ jsxs("button", {
					className: `kd__mode${a === pa && b === pb ? " on" : ""}`,
					onClick: () => {
						setA(pa);
						setB(pb);
					},
					children: [
						pa || "∅",
						" → ",
						pb || "∅"
					]
				}, `${pa}-${pb}`)), /* @__PURE__ */ jsxs("button", {
					className: "kd__mode",
					onClick: () => {
						setA("horse");
						setB("ros");
					},
					"aria-label": "复位",
					children: [/* @__PURE__ */ jsx(RefreshCw, {
						size: 13,
						style: { verticalAlign: "-2px" }
					}), " 复位"]
				})]
			})] })
		]
	}), /* @__PURE__ */ jsx(DPViz, { model }, modelKey)] });
}
//#endregion
//#region src/components/demos/grid/editTrace.ts
/** 返回编辑距离、回溯出的操作序列、以及完整 dp 表。 */
function editTrace(a, b) {
	const m = a.length;
	const n = b.length;
	const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
	for (let i = 0; i <= m; i++) dp[i][0] = i;
	for (let j = 0; j <= n; j++) dp[0][j] = j;
	for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
		const same = a[i - 1] === b[j - 1];
		const del = dp[i - 1][j] + 1;
		const ins = dp[i][j - 1] + 1;
		const sub = dp[i - 1][j - 1] + (same ? 0 : 1);
		dp[i][j] = Math.min(del, ins, sub);
	}
	const rev = [];
	let i = m;
	let j = n;
	while (i > 0 || j > 0) {
		if (i > 0 && j > 0) {
			const same = a[i - 1] === b[j - 1];
			const sub = dp[i - 1][j - 1] + (same ? 0 : 1);
			if (dp[i][j] === sub) {
				rev.push({
					op: same ? "keep" : "sub",
					a: a[i - 1],
					b: b[j - 1]
				});
				i--;
				j--;
				continue;
			}
		}
		if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
			rev.push({
				op: "del",
				a: a[i - 1]
			});
			i--;
			continue;
		}
		rev.push({
			op: "ins",
			b: b[j - 1]
		});
		j--;
	}
	rev.reverse();
	return {
		dist: dp[m][n],
		steps: rev,
		dp
	};
}
//#endregion
//#region src/components/demos/grid/EditTracebackDemo.tsx
function sanitize(s) {
	return s.replace(/[^A-Za-z]/g, "").toLowerCase().slice(0, 6);
}
var OP_LABEL = {
	keep: "保留",
	del: "删",
	ins: "插",
	sub: "改"
};
/**
* 编辑距离 · 回溯操作序列（自建轻量可视化，非 DPViz）。
* 从 dp[m][n] 回溯出把 A 对齐到 B 的一串操作；A 在上、操作徽标在中、B 在下逐列排开，
* 步进条控制「已揭示到第几步」。★不从 opacity:0 起步：未揭示的步用低不透明度静态弱化，
* 起点即可见（无头 / 后台标签页不会把内容永久卡隐藏）。
*/
function EditTracebackDemo() {
	const [a, setA] = useState("horse");
	const [b, setB] = useState("ros");
	const { dist, steps } = useMemo(() => editTrace(a || "", b || ""), [a, b]);
	const player = useStepPlayer(steps.length + 1);
	const shown = player.index;
	const pause = player.pause;
	const setPlaybackIndex = player.setIndex;
	useEffect(() => {
		pause();
		setPlaybackIndex(steps.length);
	}, [
		a,
		b,
		pause,
		setPlaybackIndex,
		steps.length
	]);
	const resultChars = [];
	steps.slice(0, shown).forEach((s) => {
		if (s.op === "keep" || s.op === "sub") resultChars.push(s.b);
		else if (s.op === "ins") resultChars.push(s.b);
	});
	const counts = useMemo(() => {
		let edits = 0;
		steps.forEach((s) => {
			if (s.op !== "keep") edits++;
		});
		return edits;
	}, [steps]);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "etb__toolbar",
			children: [
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "kd__group-label",
					children: "源串 A（改成 B · 仅字母 · ≤6）"
				}), /* @__PURE__ */ jsx("input", {
					className: "ed__input",
					value: a,
					maxLength: 6,
					spellCheck: false,
					onChange: (e) => setA(sanitize(e.target.value)),
					"aria-label": "源串 A"
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "kd__group-label",
					children: "目标串 B"
				}), /* @__PURE__ */ jsx("input", {
					className: "ed__input",
					value: b,
					maxLength: 6,
					spellCheck: false,
					onChange: (e) => setB(sanitize(e.target.value)),
					"aria-label": "目标串 B"
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "kd__group-label",
					children: "试几组"
				}), /* @__PURE__ */ jsx("div", {
					className: "ed__presets",
					children: [
						["horse", "ros"],
						["flaw", "lawn"],
						["abcde", "ace"]
					].map(([pa, pb]) => /* @__PURE__ */ jsxs("button", {
						className: `kd__mode${a === pa && b === pb ? " on" : ""}`,
						onClick: () => {
							setA(pa);
							setB(pb);
						},
						children: [
							pa,
							" → ",
							pb
						]
					}, `${pa}-${pb}`))
				})] })
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "etb__stage",
			children: /* @__PURE__ */ jsx("div", {
				className: "etb__track",
				children: steps.map((s, idx) => {
					const revealed = idx < shown;
					return /* @__PURE__ */ jsxs("div", {
						className: "etb__col" + (idx === shown - 1 ? " active" : "") + (revealed ? "" : " future"),
						children: [
							/* @__PURE__ */ jsx("div", {
								className: `etb__slot${s.a ? "" : " empty"}`,
								children: s.a ?? "·"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: `etb__badge ${s.op}`,
								children: [OP_LABEL[s.op], s.op === "sub" ? "→" : ""]
							}),
							/* @__PURE__ */ jsx("div", {
								className: `etb__slot${s.b ? "" : " empty"}`,
								children: s.b ?? "·"
							})
						]
					}, idx);
				})
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "etb__legend",
			children: [
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { style: {
					background: "var(--surface-1)",
					border: "1px solid var(--border-strong)"
				} }), " 保留（字符相同，+0）"] }),
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { style: { background: "var(--viz-current)" } }), " 改（替换一字，+1）"] }),
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { style: { background: "var(--viz-invalid)" } }), " 删（去掉 A 的字，+1）"] }),
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { style: { background: "var(--viz-chosen)" } }), " 插（补上 B 的字，+1）"] })
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "etb__result",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "lab",
					children: [
						"A 应用前 ",
						shown,
						" 步后"
					]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "str",
					children: resultChars.join("") || "∅"
				}),
				/* @__PURE__ */ jsxs("span", {
					style: { color: "var(--text-3)" },
					children: ["目标 B = ", /* @__PURE__ */ jsx("b", {
						style: { color: "var(--accent-1)" },
						children: b || "∅"
					})]
				})
			]
		}),
		/* @__PURE__ */ jsx(PlaybackControls, {
			player,
			variant: "compact",
			label: "编辑距离回溯逐帧播放",
			className: "etb__ctl"
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "etb__delta",
			children: [
				"把 \"",
				/* @__PURE__ */ jsx("b", { children: a || "∅" }),
				"\" 变成 \"",
				/* @__PURE__ */ jsx("b", { children: b || "∅" }),
				"\" 的一条最优编辑序列共 ",
				/* @__PURE__ */ jsx("b", { children: steps.length }),
				" 步，其中",
				" ",
				/* @__PURE__ */ jsx("b", { children: counts }),
				" 步是真正花代价的删 / 插 / 改——正好等于编辑距离 ",
				/* @__PURE__ */ jsx("b", { children: dist }),
				"；其余为不花钱的「保留」。 逐步走一遍，看 A 如何被一次次操作对齐到 B。"
			]
		})
	] });
}
//#endregion
//#region src/content/b/EditDistanceArt.tsx
function SetupFigure() {
	const rows = [
		{
			op: "删",
			from: "cart",
			mark: 2,
			to: "cat",
			note: "去掉一个字符 r"
		},
		{
			op: "插",
			from: "cat",
			mark: -1,
			to: "cats",
			note: "补上一个字符 s"
		},
		{
			op: "改",
			from: "cat",
			mark: 2,
			to: "cot",
			note: "替换一个字符 a→o"
		}
	];
	const colr = (op) => op === "删" ? "var(--viz-invalid)" : op === "插" ? "var(--viz-chosen)" : "var(--viz-current)";
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 210",
		role: "img",
		"aria-label": "删、插、改三种基本编辑操作各一例",
		children: [/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
			id: "ed-ar",
			markerWidth: "8",
			markerHeight: "8",
			refX: "6",
			refY: "3",
			orient: "auto",
			children: /* @__PURE__ */ jsx("path", {
				d: "M0,0 L6,3 L0,6 Z",
				fill: "var(--text-3)"
			})
		}) }), rows.map((r, i) => {
			return /* @__PURE__ */ jsxs("g", {
				transform: `translate(0,${18 + i * 62})`,
				children: [
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(16,0)",
						children: [/* @__PURE__ */ jsx("rect", {
							width: "52",
							height: "42",
							rx: "11",
							fill: colr(r.op),
							opacity: "0.16",
							stroke: colr(r.op),
							strokeWidth: "1.5"
						}), /* @__PURE__ */ jsx("text", {
							x: "26",
							y: "27",
							textAnchor: "middle",
							fontSize: "16",
							fontWeight: "700",
							fill: colr(r.op),
							children: r.op
						})]
					}),
					/* @__PURE__ */ jsx("g", {
						transform: "translate(88,0)",
						children: r.from.split("").map((ch, k) => /* @__PURE__ */ jsxs("g", {
							transform: `translate(${k * 34},0)`,
							children: [/* @__PURE__ */ jsx("rect", {
								width: "30",
								height: "42",
								rx: "8",
								fill: k === r.mark ? `color-mix(in srgb, ${colr(r.op)} 22%, var(--surface-3))` : "var(--surface-3)",
								stroke: k === r.mark ? colr(r.op) : "var(--border-strong)",
								strokeWidth: "1.5"
							}), /* @__PURE__ */ jsx("text", {
								x: "15",
								y: "27",
								textAnchor: "middle",
								fontSize: "17",
								className: "mono",
								fill: "var(--text-1)",
								children: ch
							})]
						}, k))
					}),
					/* @__PURE__ */ jsx("path", {
						d: `M ${100 + r.from.length * 34} 21 H ${142 + r.from.length * 34}`,
						stroke: "var(--text-3)",
						strokeWidth: "2",
						markerEnd: "url(#ed-ar)"
					}),
					/* @__PURE__ */ jsx("g", {
						transform: `translate(${158 + r.from.length * 34},0)`,
						children: r.to.split("").map((ch, k) => /* @__PURE__ */ jsxs("g", {
							transform: `translate(${k * 34},0)`,
							children: [/* @__PURE__ */ jsx("rect", {
								width: "30",
								height: "42",
								rx: "8",
								fill: "var(--surface-3)",
								stroke: "var(--border-strong)",
								strokeWidth: "1.5"
							}), /* @__PURE__ */ jsx("text", {
								x: "15",
								y: "27",
								textAnchor: "middle",
								fontSize: "17",
								className: "mono",
								fill: "var(--text-1)",
								children: ch
							})]
						}, k))
					}),
					/* @__PURE__ */ jsx("text", {
						x: 188 + r.from.length * 34 + r.to.length * 34,
						y: "26",
						fontSize: "12",
						fill: "var(--text-3)",
						children: r.note
					})
				]
			}, i);
		})]
	});
}
function TransitionFigure() {
	const CW = 96;
	const CH = 46;
	const gx = (c) => 70 + c * 150;
	const gy = (r) => 40 + r * 92;
	const cxp = (c) => gx(c) + CW / 2;
	const cyp = (r) => gy(r) + CH / 2;
	const cells = [
		{
			c: 0,
			r: 0,
			t: "dp[i−1][j−1]",
			kind: "sub",
			tag: "改/匹配"
		},
		{
			c: 1,
			r: 0,
			t: "dp[i−1][j]",
			kind: "del",
			tag: "删"
		},
		{
			c: 0,
			r: 1,
			t: "dp[i][j−1]",
			kind: "ins",
			tag: "插"
		},
		{
			c: 1,
			r: 1,
			t: "dp[i][j]",
			kind: "cur",
			tag: ""
		}
	];
	const col = (k) => k === "del" ? "var(--viz-invalid)" : k === "ins" ? "var(--viz-chosen)" : k === "sub" ? "var(--viz-current)" : "var(--accent-2)";
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 380 224",
		role: "img",
		"aria-label": "dp[i][j] 从上邻、左邻、左上邻三个来源取最小",
		children: [
			/* @__PURE__ */ jsxs("defs", { children: [
				/* @__PURE__ */ jsx("marker", {
					id: "edt-del",
					markerWidth: "7",
					markerHeight: "7",
					refX: "5.5",
					refY: "3",
					orient: "auto",
					children: /* @__PURE__ */ jsx("path", {
						d: "M0,0 L6,3 L0,6 Z",
						fill: "var(--viz-invalid)"
					})
				}),
				/* @__PURE__ */ jsx("marker", {
					id: "edt-ins",
					markerWidth: "7",
					markerHeight: "7",
					refX: "5.5",
					refY: "3",
					orient: "auto",
					children: /* @__PURE__ */ jsx("path", {
						d: "M0,0 L6,3 L0,6 Z",
						fill: "var(--viz-chosen)"
					})
				}),
				/* @__PURE__ */ jsx("marker", {
					id: "edt-sub",
					markerWidth: "7",
					markerHeight: "7",
					refX: "5.5",
					refY: "3",
					orient: "auto",
					children: /* @__PURE__ */ jsx("path", {
						d: "M0,0 L6,3 L0,6 Z",
						fill: "var(--viz-current)"
					})
				})
			] }),
			/* @__PURE__ */ jsx("line", {
				x1: cxp(0),
				y1: gy(0) + CH,
				x2: cxp(1) - 46,
				y2: gy(1),
				stroke: col("sub"),
				strokeWidth: "2.5",
				markerEnd: "url(#edt-sub)"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: cxp(1),
				y1: gy(0) + CH,
				x2: cxp(1),
				y2: gy(1),
				stroke: col("del"),
				strokeWidth: "2.5",
				markerEnd: "url(#edt-del)"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: gx(0) + CW,
				y1: cyp(1),
				x2: gx(1),
				y2: cyp(1),
				stroke: col("ins"),
				strokeWidth: "2.5",
				markerEnd: "url(#edt-ins)"
			}),
			cells.map((cell, i) => {
				const cur = cell.kind === "cur";
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${gx(cell.c)},${gy(cell.r)})`,
					children: [
						cell.tag && /* @__PURE__ */ jsxs("text", {
							x: CW / 2,
							y: "-8",
							textAnchor: "middle",
							fontSize: "11.5",
							fontWeight: "700",
							fill: col(cell.kind),
							children: [cell.tag, cell.kind === "sub" ? " +0/1" : " +1"]
						}),
						/* @__PURE__ */ jsx("rect", {
							width: CW,
							height: CH,
							rx: "10",
							fill: cur ? "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))" : `color-mix(in srgb, ${col(cell.kind)} 12%, var(--surface-3))`,
							stroke: cur ? "var(--accent-2)" : col(cell.kind),
							strokeWidth: "1.5"
						}),
						/* @__PURE__ */ jsx("text", {
							x: CW / 2,
							y: 28,
							textAnchor: "middle",
							fontSize: "13",
							className: "mono",
							fill: "var(--text-1)",
							children: cell.t
						})
					]
				}, i);
			}),
			/* @__PURE__ */ jsx("text", {
				x: cxp(1),
				y: gy(1) + CH + 20,
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "取三者最小"
			})
		]
	});
}
function WeightedFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 170",
		role: "img",
		"aria-label": "普通编辑距离与带权编辑距离的单步代价对比",
		children: [[{
			label: "普通",
			c1: "删 = 1",
			c2: "插 = 1",
			c3: "改 = 1",
			accent: false
		}, {
			label: "带权",
			c1: "删 = k(空位)",
			c2: "插 = k(空位)",
			c3: "改 = |A[i]−B[j]|",
			accent: true
		}].map((r, i) => {
			const y = 18 + i * 76;
			const stroke = r.accent ? "var(--accent-2)" : "var(--border-strong)";
			const fillHead = r.accent ? "var(--grad-accent)" : "var(--surface-3)";
			const headTxt = r.accent ? "var(--text-on-accent)" : "var(--text-2)";
			const cells = [
				r.c1,
				r.c2,
				r.c3
			];
			return /* @__PURE__ */ jsxs("g", {
				transform: `translate(0,${y})`,
				children: [/* @__PURE__ */ jsxs("g", {
					transform: "translate(16,0)",
					children: [/* @__PURE__ */ jsx("rect", {
						width: "72",
						height: "54",
						rx: "12",
						fill: fillHead,
						stroke,
						strokeWidth: "1.5"
					}), /* @__PURE__ */ jsx("text", {
						x: "36",
						y: "32",
						textAnchor: "middle",
						fontSize: "14",
						fontWeight: "700",
						fill: headTxt,
						children: r.label
					})]
				}), cells.map((c, k) => /* @__PURE__ */ jsxs("g", {
					transform: `translate(${104 + k * 150},0)`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: "138",
						height: "54",
						rx: "12",
						fill: r.accent ? "color-mix(in srgb, var(--accent-1) 10%, var(--surface-3))" : "var(--surface-3)",
						stroke,
						strokeWidth: "1.5"
					}), /* @__PURE__ */ jsx("text", {
						x: "69",
						y: "32",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: r.accent ? "var(--accent-1)" : "var(--text-1)",
						children: c
					})]
				}, k))]
			}, i);
		}), /* @__PURE__ */ jsx("text", {
			x: "280",
			y: "166",
			textAnchor: "middle",
			fontSize: "12",
			fill: "var(--text-3)",
			children: "代价从「恒 1」推广到「按字符差异」——编辑距离即最小代价的带权序列对齐"
		})]
	});
}
//#endregion
//#region src/content/b/EditDistance.tsx
var CODE_P2758 = `
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

char a[2005], b[2005];
int f[2005][2005];               // f[i][j]：a 前 i 个字符改成 b 前 j 个的最少操作

int main()
{
    cin >> (a + 1) >> (b + 1);   // 下标从 1 开始存
    int n = strlen(a + 1), m = strlen(b + 1);

    for (int i = 0; i <= n; i++) f[i][0] = i;   // 边界：全删空
    for (int j = 0; j <= m; j++) f[0][j] = j;   // 边界：从空串插出来

    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
        {
            int sub = f[i - 1][j - 1] + (a[i] != b[j]); // 改/匹配：同字 +0，异字 +1
            int del = f[i - 1][j] + 1;                  // 删掉 a[i]
            int ins = f[i][j - 1] + 1;                  // 插入 b[j]
            f[i][j] = min(sub, min(del, ins));          // ★三向取最小
        }

    cout << f[n][m] << endl;
    return 0;
}
// TAG: 线性DP 编辑距离 Levenshtein 串对齐`;
var CODE_P1279 = `
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

char a[2005], b[2005];
int f[2005][2005];               // f[i][j]：a 前 i 个对齐到 b 前 j 个的最小总代价
int k;                           // 空位（删/插）的固定代价

int main()
{
    cin >> k >> (a + 1) >> (b + 1);
    int n = strlen(a + 1), m = strlen(b + 1);

    for (int i = 0; i <= n; i++) f[i][0] = i * k;   // 前 i 个全对空位，各计 k
    for (int j = 0; j <= m; j++) f[0][j] = j * k;

    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
        {
            int sub = f[i - 1][j - 1] + abs(a[i] - b[j]); // 改：代价 = 两字符 ASCII 差
            int del = f[i - 1][j] + k;                    // 删 a[i]：a[i] 对空位
            int ins = f[i][j - 1] + k;                    // 插 b[j]：空位对 b[j]
            f[i][j] = min(sub, min(del, ins));
        }

    cout << f[n][m] << endl;
    return 0;
}
// TAG: 线性DP 带权编辑距离 字串距离 序列对齐`;
function EditDistance() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "把一个词改成另一个，最少几步"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"给两个串 ",
						/* @__PURE__ */ jsx(M, { children: "A" }),
						" 和 ",
						/* @__PURE__ */ jsx(M, { children: "B" }),
						"，你只能用三种操作改写 ",
						/* @__PURE__ */ jsx(M, { children: "A" }),
						"：",
						/* @__PURE__ */ jsx("strong", { children: "删" }),
						"掉其中一个字符、",
						/* @__PURE__ */ jsx("strong", { children: "插" }),
						"入一个字符、把某个字符",
						/* @__PURE__ */ jsx("strong", { children: "改" }),
						"成另一个。目标是把 ",
						/* @__PURE__ */ jsx(M, { children: "A" }),
						" 变成 ",
						/* @__PURE__ */ jsx(M, { children: "B" }),
						"，",
						/* @__PURE__ */ jsx("strong", { children: "用的操作次数最少" }),
						"——这个最小次数，就叫 ",
						/* @__PURE__ */ jsx(M, { children: "A" }),
						" 到 ",
						/* @__PURE__ */ jsx(M, { children: "B" }),
						" 的",
						/* @__PURE__ */ jsx("strong", { children: "编辑距离" }),
						"（Levenshtein 距离）。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(SetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "三种基本操作各一例：删（去一字）、插（补一字）、改（换一字）。每种都记 1 步。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"先看个具体的：把 ",
						/* @__PURE__ */ jsx("strong", { children: "\"horse\"" }),
						" 改成 ",
						/* @__PURE__ */ jsx("strong", { children: "\"ros\"" }),
						"。一条可行路线是——把 ",
						/* @__PURE__ */ jsx("code", { children: "h" }),
						" 改成 ",
						/* @__PURE__ */ jsx("code", { children: "r" }),
						"（horse→rorse）， 删掉第一个 ",
						/* @__PURE__ */ jsx("code", { children: "r" }),
						" 后面的 ",
						/* @__PURE__ */ jsx("code", { children: "o" }),
						"… 手工凑很容易凑不出最短。其实最优是 ",
						/* @__PURE__ */ jsx("strong", { children: "3" }),
						" 步：",
						/* @__PURE__ */ jsx("code", { children: "h→r" }),
						"（改）、删 ",
						/* @__PURE__ */ jsx("code", { children: "r" }),
						"、删 ",
						/* @__PURE__ */ jsx("code", { children: "e" }),
						"，剩下 ",
						/* @__PURE__ */ jsx("code", { children: "ros" }),
						"。再看 ",
						/* @__PURE__ */ jsx("strong", { children: "\"sitting\"→\"kitten\"" }),
						"，最优也是 ",
						/* @__PURE__ */ jsx("strong", { children: "3" }),
						" 步 （",
						/* @__PURE__ */ jsx("code", { children: "s→k" }),
						"、",
						/* @__PURE__ */ jsx("code", { children: "i→e" }),
						"、删末尾 ",
						/* @__PURE__ */ jsx("code", { children: "g" }),
						"）。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"难点在哪？",
						/* @__PURE__ */ jsx("strong", { children: "此刻该删、该插还是该改，取决于两个串后面还剩什么" }),
						"——是个牵一发动全身的全局问题，贪心按不住。 那把所有操作序列枚举一遍？序列长度不固定、分叉又多，直接爆炸。和 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/b/lcs",
							style: { color: "var(--accent-2)" },
							children: "LCS"
						}),
						" 一样， 这类",
						/* @__PURE__ */ jsx("strong", { children: "两个串逐位对齐" }),
						"的问题，正是二维 DP 的主场。"
					] })]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：三选一取最小"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
						"设 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
						" 表示：把 ",
						/* @__PURE__ */ jsx(M, { children: "A" }),
						" 的",
						/* @__PURE__ */ jsxs("strong", { children: [
							"前 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 个字符"
						] }),
						"改写成 ",
						/* @__PURE__ */ jsx(M, { children: "B" }),
						" 的",
						/* @__PURE__ */ jsxs("strong", { children: [
							"前 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 个字符"
						] }),
						"， 所需的最少操作数。把「逐位对齐」当作阶段，每一步只决断",
						/* @__PURE__ */ jsx("strong", { children: "末尾这一位怎么处理" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(TransitionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "dp[i][j] 只看三个邻格：上邻（删 A[i]）、左邻（插 B[j]）、左上邻（改 A[i]→B[j]，或字符相同则免费匹配），三条路取最小。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"只盯住两个串的",
							/* @__PURE__ */ jsx("strong", { children: "末尾字符" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "A[i]" }),
							" 与 ",
							/* @__PURE__ */ jsx(M, { children: "B[j]" }),
							"，把 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
							" 拆成三条来路："
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsxs("strong", { children: ["删 ", /* @__PURE__ */ jsx(M, { children: "A[i]" })] }),
							"：把 ",
							/* @__PURE__ */ jsx(M, { children: "A[i]" }),
							" 丢掉，问题缩成「",
							/* @__PURE__ */ jsx(M, { children: "A" }),
							" 前 ",
							/* @__PURE__ */ jsx(M, { children: "i-1" }),
							" 个对齐 ",
							/* @__PURE__ */ jsx(M, { children: "B" }),
							" 前 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 个」，再计 1 步 → ",
							/* @__PURE__ */ jsx(M, { children: "dp[i-1][j]+1" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsxs("strong", { children: ["插 ", /* @__PURE__ */ jsx(M, { children: "B[j]" })] }),
							"：在 ",
							/* @__PURE__ */ jsx(M, { children: "A" }),
							" 末尾补一个 ",
							/* @__PURE__ */ jsx(M, { children: "B[j]" }),
							" 把 ",
							/* @__PURE__ */ jsx(M, { children: "B" }),
							" 这位对上，问题缩成「",
							/* @__PURE__ */ jsx(M, { children: "A" }),
							" 前 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 个对齐 ",
							/* @__PURE__ */ jsx(M, { children: "B" }),
							" 前 ",
							/* @__PURE__ */ jsx(M, { children: "j-1" }),
							" 个」，计 1 步 → ",
							/* @__PURE__ */ jsx(M, { children: "dp[i][j-1]+1" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "改 / 匹配" }),
							"：让 ",
							/* @__PURE__ */ jsx(M, { children: "A[i]" }),
							" 与 ",
							/* @__PURE__ */ jsx(M, { children: "B[j]" }),
							" 正面相对，问题缩成「前 ",
							/* @__PURE__ */ jsx(M, { children: "i-1" }),
							" 对齐前 ",
							/* @__PURE__ */ jsx(M, { children: "j-1" }),
							"」。若两字",
							/* @__PURE__ */ jsx("strong", { children: "本就相同" }),
							"，白赚一步不花代价；否则改一次记 1 步 → ",
							/* @__PURE__ */ jsx(M, { children: "dp[i-1][j-1]+[A[i]\\ne B[j]]" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"三条路取最小，就是",
							/* @__PURE__ */ jsx("strong", { children: "转移方程" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i][j]=\\min\\big(\\,dp[i-1][j]+1,\\ dp[i][j-1]+1,\\ dp[i-1][j-1]+[A[i]\\ne B[j]]\\,\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"这里 ",
							/* @__PURE__ */ jsx(M, { children: "[A[i]\\ne B[j]]" }),
							" 是艾弗森括号：两字不同取 1、相同取 0。还差",
							/* @__PURE__ */ jsx("strong", { children: "边界" }),
							"——一个串为空时怎么办？"
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i][0]=i,\\qquad dp[0][j]=j" }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx(M, { children: "dp[i][0]=i" }),
							"：把 ",
							/* @__PURE__ */ jsx(M, { children: "A" }),
							" 前 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 个字符改成空串，只能一个个",
							/* @__PURE__ */ jsx("strong", { children: "删" }),
							"，删 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 次；",
							/* @__PURE__ */ jsx(M, { children: "dp[0][j]=j" }),
							"：从空串造出 ",
							/* @__PURE__ */ jsx(M, { children: "B" }),
							" 前 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 个，只能一个个",
							/* @__PURE__ */ jsx("strong", { children: "插" }),
							"，插 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 次。答案在右下角 ",
							/* @__PURE__ */ jsx(M, { children: "dp[n][m]" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"编辑距离把「无穷多条操作序列」压成一张 ",
						/* @__PURE__ */ jsx(M, { children: "(n{+}1)\\times(m{+}1)" }),
						" 的表：每一格只问「末尾这位",
						/* @__PURE__ */ jsx("strong", { children: "删、插、还是改/匹配" }),
						"」，三个已算好的邻格取最小。指数级的改写路径，被 ",
						/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
						" 个格子装下——这正是",
						/* @__PURE__ */ jsx("strong", { children: "两串对齐" }),
						"类 DP 的通用骨架。"
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
						/* @__PURE__ */ jsx(M, { children: "A=" }),
						"\"horse\"、",
						/* @__PURE__ */ jsx(M, { children: "B=" }),
						"\"ros\" 走几步（下标从 1 记），把方程「跑起来」："
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
									/* @__PURE__ */ jsx("b", { children: "铺边界。" }),
									" 首列 ",
									/* @__PURE__ */ jsx(M, { children: "dp[i][0]=i" }),
									"（\"horse\" 前缀全删空：0,1,2,3,4,5），首行 ",
									/* @__PURE__ */ jsx(M, { children: "dp[0][j]=j" }),
									"（从空串插出 \"ros\"：0,1,2,3）。这是整张表的地基。"
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
									/* @__PURE__ */ jsxs("b", { children: ["左上角 ", /* @__PURE__ */ jsx(M, { children: "dp[1][1]" })] }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "A[1]{=}\\text{h}" }),
									" vs ",
									/* @__PURE__ */ jsx(M, { children: "B[1]{=}\\text{r}" }),
									"，不同）：删 = ",
									/* @__PURE__ */ jsx(M, { children: "dp[0][1]+1=2" }),
									"；插 = ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][0]+1=2" }),
									"；改 = ",
									/* @__PURE__ */ jsx(M, { children: "dp[0][0]+1=1" }),
									"。取最小 → ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][1]=1" }),
									"（把 h 改成 r）。"
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
									/* @__PURE__ */ jsxs("b", { children: ["命中相同字符 ", /* @__PURE__ */ jsx(M, { children: "dp[2][2]" })] }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "A[2]{=}\\text{o}" }),
									" vs ",
									/* @__PURE__ */ jsx(M, { children: "B[2]{=}\\text{o}" }),
									"，",
									/* @__PURE__ */ jsx("strong", { children: "相同" }),
									"）：匹配这条 = ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][1]+0=1" }),
									"，比删（",
									/* @__PURE__ */ jsx(M, { children: "dp[1][2]+1=3" }),
									"）、插（",
									/* @__PURE__ */ jsx(M, { children: "dp[2][1]+1=3" }),
									"）都小 → ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][2]=1" }),
									"。",
									/* @__PURE__ */ jsx("strong", { children: "字符相同就白赚一格，不加代价" }),
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
									/* @__PURE__ */ jsxs("b", { children: ["右下角 ", /* @__PURE__ */ jsx(M, { children: "dp[5][3]" })] }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "A[5]{=}\\text{e}" }),
									" vs ",
									/* @__PURE__ */ jsx(M, { children: "B[3]{=}\\text{s}" }),
									"，不同）：删 = ",
									/* @__PURE__ */ jsx(M, { children: "dp[4][3]+1=3" }),
									" 最小（改 = ",
									/* @__PURE__ */ jsx(M, { children: "dp[4][2]+1=4" }),
									"、插更大）→ ",
									/* @__PURE__ */ jsx(M, { children: "dp[5][3]=3" }),
									"。正是 \"horse\"→\"ros\" 的编辑距离 ",
									/* @__PURE__ */ jsx("strong", { children: "3" }),
									"，与手算吻合。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示会把整张表",
						/* @__PURE__ */ jsx("strong", { children: "逐格填满" }),
						"，每格高亮上 / 左 / 左上三个来源并标出被选中的那条。改改两个串，看表实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看它一格一格填出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(EditDistanceDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化：从「恒 1」到带权对齐"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"上面每种操作都恒记 ",
						/* @__PURE__ */ jsx("strong", { children: "1" }),
						" 步。但「编辑距离」的骨架其实更通用——只要把",
						/* @__PURE__ */ jsx("strong", { children: "每种操作的代价换成任意权重" }),
						"，同一套三向取最小就变成了",
						/* @__PURE__ */ jsx("strong", { children: "最小代价的序列对齐" }),
						"。这在生物信息（DNA 比对）、拼写纠错里天天用。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(WeightedFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "普通版：删 / 插 / 改各记 1。带权版：删 / 插（一个字符对「空位」）记固定代价 k，改（两字符相对）记它们的差异度，如 ASCII 差 |A[i]−B[j]|。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"把方程里的三个「",
							/* @__PURE__ */ jsx(M, { children: "+1" }),
							"」换成各自的权重，转移形状",
							/* @__PURE__ */ jsx("strong", { children: "一字不改" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i][j]=\\min\\big(dp[i-1][j]+c_{del},\\ dp[i][j-1]+c_{ins},\\ dp[i-1][j-1]+c_{sub}(A[i],B[j])\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"典型如洛谷 ",
							/* @__PURE__ */ jsx("strong", { children: "P1279「字串距离」" }),
							"：删 / 插一个字符视作它与「空位」配对，记固定代价 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							"；把 ",
							/* @__PURE__ */ jsx(M, { children: "A[i]" }),
							" 改成 ",
							/* @__PURE__ */ jsx(M, { children: "B[j]" }),
							" 的代价是两者 ASCII 差 ",
							/* @__PURE__ */ jsx(M, { children: "|A[i]-B[j]|" }),
							"（相同则差为 0，自然免费）。边界也随之变成 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i][0]=i\\cdot k" }),
							"、",
							/* @__PURE__ */ jsx(M, { children: "dp[0][j]=j\\cdot k" }),
							"。",
							/* @__PURE__ */ jsx("strong", { children: "普通编辑距离，不过是「删插改代价全取 1」的带权对齐特例" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "换个视角：编辑距离 = 带权序列对齐",
					children: [
						"「删 / 插」= 某字符与",
						/* @__PURE__ */ jsx("strong", { children: "空位" }),
						"配对，「改 / 匹配」= 两字符",
						/* @__PURE__ */ jsx("strong", { children: "正面配对" }),
						"。于是求编辑距离，等价于给两个串找一套",
						/* @__PURE__ */ jsx("strong", { children: "最省代价的逐位配对方案" }),
						"——把恒 1 的权重换成任意 ",
						/* @__PURE__ */ jsx(M, { children: "c_{del},c_{ins},c_{sub}" }),
						"，方程原样通用。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "不止要距离，还要「怎么改」：回溯操作序列"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx(M, { children: "dp[n][m]" }),
							" 只告诉你",
							/* @__PURE__ */ jsx("strong", { children: "最少几步" }),
							"，可很多时候我们想知道",
							/* @__PURE__ */ jsx("strong", { children: "具体是哪几步" }),
							"——先删哪个、再改哪个。办法是",
							/* @__PURE__ */ jsx("strong", { children: "从右下角回溯" }),
							"：站在 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
							"，看它当初的值是从哪个邻格转移来的，就往那格走，同时记下对应的操作，一路退回 ",
							/* @__PURE__ */ jsx(M, { children: "dp[0][0]" }),
							"："
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
							children: `站在 (i, j)，回头看它是从哪来的：
  若 A[i] == B[j] 且 dp[i][j] == dp[i−1][j−1]   → 保留，走向 (i−1, j−1)
  否则若 dp[i][j] == dp[i−1][j−1] + 1           → 改 A[i]→B[j]，走 (i−1, j−1)
  否则若 dp[i][j] == dp[i−1][j] + 1             → 删 A[i]，走 (i−1, j)
  否则                                          → 插 B[j]，走 (i, j−1)
倒着走到 (0,0)，把记录翻转，就是把 A 对齐到 B 的操作序列`
						}),
						/* @__PURE__ */ jsxs("p", { children: [
							"下面这个演示就把回溯",
							/* @__PURE__ */ jsx("strong", { children: "逐步走给你看" }),
							"：上排是 ",
							/* @__PURE__ */ jsx(M, { children: "A" }),
							" 的字符、下排是 ",
							/* @__PURE__ */ jsx(M, { children: "B" }),
							" 的字符，中间的徽标标出每一位是",
							/* @__PURE__ */ jsx("strong", { children: "保留 / 删 / 插 / 改" }),
							"。拖动步进条，看 ",
							/* @__PURE__ */ jsx(M, { children: "A" }),
							" 一步步被对齐成 ",
							/* @__PURE__ */ jsx(M, { children: "B" }),
							"——真正花代价的步数，恰好等于上面主演示算出的编辑距离。"
						] })
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(EditTracebackDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "回溯的两个坑",
					children: [
						"① 并列时要",
						/* @__PURE__ */ jsx("strong", { children: "定一个固定优先级" }),
						"（这里：匹配 / 改 > 删 > 插），否则多条最优路径会让输出飘忽。② 回溯读的是",
						/* @__PURE__ */ jsx("strong", { children: "转移来源" }),
						"而非单纯比大小——务必让判断顺序和当初填表时「谁被选中」的规则一致，否则会还原出一条并不合法的操作链。"
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
					pid: "P2758",
					name: "编辑距离",
					src: "洛谷原生",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给两个字符串 ",
								/* @__PURE__ */ jsx(M, { children: "A" }),
								"、",
								/* @__PURE__ */ jsx(M, { children: "B" }),
								"，每次可对 ",
								/* @__PURE__ */ jsx(M, { children: "A" }),
								" 删一个、插一个或改一个字符，求把 ",
								/* @__PURE__ */ jsx(M, { children: "A" }),
								" 变成 ",
								/* @__PURE__ */ jsx(M, { children: "B" }),
								" 的最少操作次数。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"最纯净的 ",
								/* @__PURE__ */ jsx("strong", { children: "Levenshtein 裸模板" }),
								"：删 / 插 / 改三向转移一次讲透，边界 ",
								/* @__PURE__ */ jsx(M, { children: "dp[i][0]=i,\\ dp[0][j]=j" }),
								" 写熟。是把「两串对齐」这套二维 DP 骨架",
								/* @__PURE__ */ jsx("strong", { children: "肌肉记忆" }),
								"下来的第一题，一行不多一行不少。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "dp[i][j]=\\min(dp[i-1][j]+1,\\ dp[i][j-1]+1,\\ dp[i-1][j-1]+[A_i\\ne B_j])" }),
								"；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（标准三向转移）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2758,
								luogu: "P2758"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1279",
					name: "字串距离",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给两个串与一个空位代价 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								"。把两串对齐（允许在任一串插入「空位」），一段对齐的代价 = 各位配对代价之和：两字符对齐记 ASCII 差 ",
								/* @__PURE__ */ jsx(M, { children: "|A_i-B_j|" }),
								"，字符对空位记 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								"。求最小总代价。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角（带权编辑距离）",
							children: [
								"这就是",
								/* @__PURE__ */ jsx("strong", { children: "把恒 1 换成权重" }),
								"的编辑距离：「删 / 插」= 字符对空位、代价 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								"；「改 / 匹配」= 两字符相对、代价 ",
								/* @__PURE__ */ jsx(M, { children: "|A_i-B_j|" }),
								"（同字差 0，天然免费）。转移形状与 P2758 完全相同，只换掉三个代价项和边界 ",
								/* @__PURE__ */ jsx(M, { children: "dp[i][0]=i\\cdot k" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"把「编辑距离 = 带权序列对齐」这句话",
								/* @__PURE__ */ jsx("strong", { children: "落到代码" }),
								"：看清删 / 插的本质是「对空位」、改的本质是「按差异计费」，就能把裸模板一眼改造成带权版。是从模板迈向建模的关键一题。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（带权对齐）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1279,
								luogu: "P1279"
							})
						})
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson exercises",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "练习"
			}), /* @__PURE__ */ jsx(Exercise, {
				pid: "P1032",
				name: "[NOIP2002 提高组] 字串变换",
				hint: "串变换的搜索版：给定若干「子串→子串」的替换规则，求把 A 变成 B 的最少步数。规则不再是单字符删插改，用 BFS 逐层扩展状态（双向 BFS 更稳），是「编辑思想」从固定三操作推广到任意规则的延伸。"
			})]
		})
	] });
}
//#endregion
export { EditDistance as default };
