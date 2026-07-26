import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
import { n as PlaybackControls, t as useStepPlayer } from "./useStepPlayer-CZuIDieE.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MousePointerClick, Plus, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/lcs/internal.ts
function executeLcs(first, second, emit) {
	const table = Array.from({ length: first.length + 1 }, () => Array(second.length + 1).fill(0));
	for (let row = 1; row <= first.length; row++) for (let column = 1; column <= second.length; column++) {
		const equal = first[row - 1] === second[column - 1];
		const diagonal = table[row - 1][column - 1];
		const up = table[row - 1][column];
		const left = table[row][column - 1];
		const length = equal ? diagonal + 1 : Math.max(up, left);
		const choice = equal ? "diagonal" : up >= left ? "up" : "left";
		table[row][column] = length;
		emit({
			type: "settled",
			row,
			column,
			equal,
			diagonal,
			up,
			left,
			length,
			choice
		});
	}
	const path = [];
	const picked = [];
	let row = first.length;
	let column = second.length;
	while (row > 0 && column > 0) {
		const matched = first[row - 1] === second[column - 1];
		path.push({
			row,
			column,
			matched
		});
		if (matched) {
			picked.push(first[row - 1]);
			row--;
			column--;
		} else if (table[row - 1][column] >= table[row][column - 1]) row--;
		else column--;
	}
	return {
		length: table[first.length][second.length],
		subsequence: picked.reverse().join(""),
		table,
		path
	};
}
function recordLcs(first, second) {
	const events = [];
	return {
		result: executeLcs(first, second, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/components/demos/grid/lcsSolver.ts
function settled(values) {
	const states = {};
	for (let row = 0; row < values.length; row++) for (let column = 0; column < values[row].length; column++) if (values[row][column] !== null) states[key(row, column)] = "settled";
	return states;
}
function lcs2D(first, second) {
	const run = recordLcs(first, second);
	const rows = first.length + 1;
	const columns = second.length + 1;
	const table = Array.from({ length: rows }, () => Array(columns).fill(null));
	for (let row = 0; row < rows; row++) table[row][0] = 0;
	for (let column = 0; column < columns; column++) table[0][column] = 0;
	const snap = () => table.map((row) => row.slice());
	const frames = [{
		values: snap(),
		states: settled(table),
		caption: "<b>第 0 行、第 0 列</b>是空串地基：任何字符串与空串的公共子序列长度都是 <b>0</b>。",
		formula: "dp[i][0]=dp[0][j]=0"
	}];
	for (const event of run.events) {
		const { row, column } = event;
		table[row][column] = event.length;
		const states = settled(table);
		const arrows = [];
		if (event.equal) {
			states[key(row - 1, column - 1)] = "chosen";
			arrows.push({
				from: {
					r: row - 1,
					c: column - 1
				},
				to: {
					r: row,
					c: column
				},
				kind: "chosen"
			});
		} else {
			const upWins = event.choice === "up";
			states[key(row - 1, column)] = upWins ? "chosen" : "source";
			states[key(row, column - 1)] = upWins ? "source" : "chosen";
			arrows.push({
				from: {
					r: row - 1,
					c: column
				},
				to: {
					r: row,
					c: column
				},
				kind: upWins ? "chosen" : "source"
			});
			arrows.push({
				from: {
					r: row,
					c: column - 1
				},
				to: {
					r: row,
					c: column
				},
				kind: upWins ? "source" : "chosen"
			});
		}
		states[key(row, column)] = "current";
		const caption = event.equal ? `A 的第 ${row} 位 <b>${first[row - 1]}</b> 与 B 的第 ${column} 位 <b>${second[column - 1]}</b> 相等，接在左上答案后，长度变为 <b>${event.length}</b>。` : `A 末位 <b>${first[row - 1]}</b> ≠ B 末位 <b>${second[column - 1]}</b>：上方 ${event.up} 与左方 ${event.left} 取较大者 <b>${event.length}</b>。`;
		const formula = event.equal ? `dp[${row}][${column}]=${event.diagonal}+1=${event.length}` : `dp[${row}][${column}]=\\max(${event.up},\\ ${event.left})=${event.length}`;
		frames.push({
			values: snap(),
			states,
			active: {
				r: row,
				c: column
			},
			arrows,
			caption,
			formula
		});
	}
	const finalStates = settled(table);
	for (const cell of run.result.path) finalStates[key(cell.row, cell.column)] = cell.matched ? "chosen" : "source";
	finalStates[key(first.length, second.length)] = "chosen";
	const backArrows = [];
	for (let index = 0; index + 1 < run.result.path.length; index++) {
		const current = run.result.path[index];
		const next = run.result.path[index + 1];
		backArrows.push({
			from: {
				r: next.row,
				c: next.column
			},
			to: {
				r: current.row,
				c: current.column
			},
			kind: "chosen"
		});
	}
	frames.push({
		values: snap(),
		states: finalStates,
		arrows: backArrows,
		caption: `右下角给出 LCS 长度 <b>${run.result.length}</b>；沿来路回溯得到一条 LCS：<b>${run.result.subsequence || "（空）"}</b>。`,
		formula: `\\text{LCS}=dp[${first.length}][${second.length}]=${run.result.length}`
	});
	return {
		model: {
			rows,
			cols: columns,
			cell: 42,
			rowHeaderLabels: ["∅", ...first.split("")],
			colHeaderLabels: ["∅", ...second.split("")],
			frames
		},
		len: run.result.length,
		lcs: run.result.subsequence
	};
}
//#endregion
//#region src/components/demos/grid/LCSDemo.tsx
var POOL = [
	"A",
	"B",
	"C",
	"D"
];
var MAXLEN = 7;
var PRESETS$1 = [
	{
		label: "经典 ABCBDAB / BDCAB",
		a: "ABCBDAB",
		b: "BDCAB"
	},
	{
		label: "无公共",
		a: "AAA",
		b: "BBB"
	},
	{
		label: "完全一致",
		a: "ABCD",
		b: "ABCD"
	}
];
/** 一个字符位：上下箭头在字符池里循环，可删除。 */
function CharCell({ ch, onCycle, onRemove, removable, idx }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "kd__item",
		style: { paddingTop: 14 },
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "kd__item-i",
				children: idx + 1
			}),
			removable && /* @__PURE__ */ jsx("button", {
				className: "kd__remove",
				onClick: onRemove,
				"aria-label": "删除字符",
				children: /* @__PURE__ */ jsx(X, { size: 12 })
			}),
			/* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 6
				},
				children: [
					/* @__PURE__ */ jsx("button", {
						onClick: () => onCycle(-1),
						"aria-label": "上一个字符",
						style: {
							width: 24,
							height: 28,
							borderRadius: 6,
							color: "var(--text-1)",
							border: "1px solid var(--border)",
							background: "var(--surface-2)",
							display: "grid",
							placeItems: "center"
						},
						children: /* @__PURE__ */ jsx(ChevronLeft, { size: 14 })
					}),
					/* @__PURE__ */ jsx("span", {
						className: "mono",
						style: {
							fontSize: 20,
							fontWeight: 700,
							minWidth: 22,
							textAlign: "center",
							color: "var(--accent-1)"
						},
						children: ch
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => onCycle(1),
						"aria-label": "下一个字符",
						style: {
							width: 24,
							height: 28,
							borderRadius: 6,
							color: "var(--text-1)",
							border: "1px solid var(--border)",
							background: "var(--surface-2)",
							display: "grid",
							placeItems: "center"
						},
						children: /* @__PURE__ */ jsx(ChevronRight, { size: 14 })
					})
				]
			})
		]
	});
}
function StringRow({ title, s, setS }) {
	const cycle = (i, dir) => setS((prev) => {
		const arr = prev.split("");
		arr[i] = POOL[(POOL.indexOf(arr[i]) + dir + POOL.length) % POOL.length];
		return arr.join("");
	});
	const removeAt = (i) => setS((prev) => prev.slice(0, i) + prev.slice(i + 1));
	const addOne = () => setS((prev) => prev.length < MAXLEN ? prev + POOL[0] : prev);
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
		className: "kd__group-label",
		children: [
			title,
			"（点箭头换字符 · 可增删 · 长度 ≤ ",
			MAXLEN,
			"）"
		]
	}), /* @__PURE__ */ jsxs("div", {
		className: "kd__items",
		children: [s.split("").map((ch, i) => /* @__PURE__ */ jsx(CharCell, {
			ch,
			idx: i,
			onCycle: (dir) => cycle(i, dir),
			onRemove: () => removeAt(i),
			removable: s.length > 1
		}, i)), s.length < MAXLEN && /* @__PURE__ */ jsxs("button", {
			className: "kd__add",
			onClick: addOne,
			children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加字符"]
		})]
	})] });
}
/**
* LCS 主演示：两串可编辑（短，长度 ≤ 7），二维 dp 填表 + 回溯路径。
* 匹配则来自左上 +1、否则来自上 / 左取 max，逐格高亮来源；填完从 dp[m][n] 回溯重构一条 LCS。
*/
function LCSDemo() {
	const [a, setA] = useState("ABCBDAB");
	const [b, setB] = useState("BDCAB");
	const { model, len, lcs } = useMemo(() => lcs2D(a, b), [a, b]);
	const modelKey = `lcs-${a}-${b}`;
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "kd__modes",
			children: PRESETS$1.map((p) => /* @__PURE__ */ jsx("button", {
				className: `kd__mode${a === p.a && b === p.b ? " on" : ""}`,
				onClick: () => {
					setA(p.a);
					setB(p.b);
				},
				children: p.label
			}, p.label))
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "kd__toolbar",
			style: { gap: "var(--sp-5)" },
			children: [/* @__PURE__ */ jsx(StringRow, {
				title: "串 A（作行）",
				s: a,
				setS: setA
			}), /* @__PURE__ */ jsx(StringRow, {
				title: "串 B（作列）",
				s: b,
				setS: setB
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"当前两串的最长公共子序列：",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: ["长度 ", len]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "you",
					children: lcs ? `（一条 LCS = ${lcs}）` : "（没有公共字符）"
				}),
				/* @__PURE__ */ jsx("span", {
					style: { color: "var(--text-3)" },
					children: "——绿色斜格是回溯时摘下字符的地方。"
				})
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/components/demos/grid/LCSToLISDemo.tsx
var PRESETS = [{
	label: "A 已排序 1 2 3 4 5",
	a: [
		1,
		2,
		3,
		4,
		5
	],
	b: [
		2,
		4,
		1,
		5,
		3
	]
}, {
	label: "A 乱序 2 5 3 1 4",
	a: [
		2,
		5,
		3,
		1,
		4
	],
	b: [
		3,
		5,
		1,
		4,
		2
	]
}];
function posMap(a) {
	const m = /* @__PURE__ */ new Map();
	a.forEach((v, i) => m.set(v, i + 1));
	return m;
}
function lisIndices(seq) {
	const n = seq.length;
	if (n === 0) return /* @__PURE__ */ new Set();
	const tails = [];
	const prev = new Array(n).fill(-1);
	for (let i = 0; i < n; i++) {
		let lo = 0;
		let hi = tails.length;
		while (lo < hi) {
			const mid = lo + hi >> 1;
			if (seq[tails[mid]] >= seq[i]) hi = mid;
			else lo = mid + 1;
		}
		prev[i] = lo > 0 ? tails[lo - 1] : -1;
		if (lo === tails.length) tails.push(i);
		else tails[lo] = i;
	}
	const pick = /* @__PURE__ */ new Set();
	let cur = tails[tails.length - 1];
	while (cur !== -1) {
		pick.add(cur);
		cur = prev[cur];
	}
	return pick;
}
/**
* 排列 LCS → LIS 转化（自建可视化，非 DPViz）。
* 当 A、B 是同一集合的两个排列时：把 B 的每个值换成「它在 A 里的位置」，得一串位置序列；
* 这串序列的 LIS 长度 = LCS(A,B) 长度——于是用 O(n log n) 的 LIS 二分即可解决 LCS。
* 步进：先逐个把 B[i] 映射成位置，映完再点亮位置序列里的一条 LIS。
*/
function LCSToLISDemo() {
	const [a, setA] = useState(PRESETS[0].a);
	const [b, setB] = useState(PRESETS[0].b);
	const map = useMemo(() => posMap(a), [a]);
	const mapped = useMemo(() => b.map((v) => map.get(v)), [b, map]);
	const lisPick = useMemo(() => lisIndices(mapped), [mapped]);
	const lisLen = lisPick.size;
	const player = useStepPlayer(b.length + 1 + 1);
	const idx = player.index - 1;
	const mappedCount = Math.min(idx + 1, b.length);
	const done = idx >= b.length;
	const curCol = idx >= 0 && idx < b.length ? idx : -1;
	const setPreset = (p) => {
		player.reset();
		setA(p.a);
		setB(p.b);
	};
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "ll__toolbar",
			children: /* @__PURE__ */ jsx("div", {
				className: "ll__modes",
				children: PRESETS.map((p) => /* @__PURE__ */ jsx("button", {
					className: `ll__mode${a.join(",") === p.a.join(",") && b.join(",") === p.b.join(",") ? " on" : ""}`,
					onClick: () => setPreset(p),
					children: p.label
				}, p.label))
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "ll__block",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "ll__block-head",
					children: [/* @__PURE__ */ jsxs("span", { children: [
						"映射规则：把 ",
						/* @__PURE__ */ jsx("b", {
							style: {
								fontFamily: "var(--font-mono)",
								color: "var(--text-1)"
							},
							children: "A"
						}),
						" 里每个值记下它的",
						/* @__PURE__ */ jsx("b", { children: "位置" }),
						"（第几个）"
					] }), /* @__PURE__ */ jsxs("span", {
						className: "mono",
						children: [
							"A = [",
							a.join(", "),
							"]"
						]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "ll__maptable",
					children: a.map((v, i) => {
						return /* @__PURE__ */ jsxs("div", {
							className: `ll__mapcol${curCol >= 0 && b[curCol] === v ? " cur" : ""}`,
							children: [/* @__PURE__ */ jsx("div", {
								className: "ll__map-k",
								children: v
							}), /* @__PURE__ */ jsx("div", {
								className: "ll__map-v",
								children: i + 1
							})]
						}, i);
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "ll__map-cap",
					children: "上排＝值，下排＝它在 A 中的位置（1-based）。第一组 A 已排序，值恰好等于位置。"
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "ll__block",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "ll__block-head",
				children: [/* @__PURE__ */ jsxs("span", { children: [
					"串 ",
					/* @__PURE__ */ jsx("b", {
						style: {
							fontFamily: "var(--font-mono)",
							color: "var(--text-1)"
						},
						children: "B"
					}),
					" 的原始值"
				] }), /* @__PURE__ */ jsxs("span", {
					className: "mono",
					children: [
						"已映射 ",
						mappedCount,
						"/",
						b.length
					]
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "ll__row",
				children: b.map((v, i) => /* @__PURE__ */ jsxs("div", {
					className: `ll__cell${curCol === i ? " cur" : ""}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "ll__cell-idx",
						children: i + 1
					}), /* @__PURE__ */ jsx("div", {
						className: "ll__box",
						children: v
					})]
				}, i))
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "ll__block",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "ll__block-head",
				children: [/* @__PURE__ */ jsxs("span", { children: [
					"换成位置后的",
					/* @__PURE__ */ jsx("b", { children: "位置序列" }),
					"——对它求最长上升子序列"
				] }), /* @__PURE__ */ jsx("span", {
					className: "mono",
					children: done ? `LIS = LCS = ${lisLen}` : `…`
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "ll__row",
				children: mapped.map((p, i) => {
					const shown = i < mappedCount;
					const picked = done && lisPick.has(i);
					return /* @__PURE__ */ jsxs("div", {
						className: `ll__cell${curCol === i ? " cur" : ""}${picked ? " pick" : ""}`,
						children: [/* @__PURE__ */ jsx("span", {
							className: "ll__cell-idx",
							children: i + 1
						}), /* @__PURE__ */ jsx("div", {
							className: "ll__box",
							children: shown ? p : "·"
						})]
					}, i);
				})
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "ll__readout",
			children: idx < 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
				"点",
				/* @__PURE__ */ jsx("b", {
					className: "cur",
					children: " 播放 "
				}),
				"或",
				/* @__PURE__ */ jsx("b", { children: " 下一步 " }),
				"开始：逐个把 B 的值换成它在 A 里的",
				/* @__PURE__ */ jsx("b", { children: "位置" }),
				"， 得到一串",
				/* @__PURE__ */ jsx("b", { children: "位置序列" }),
				"；这串序列的 ",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: "LIS 长度"
				}),
				"就等于 ",
				/* @__PURE__ */ jsx("b", { children: "LCS(A, B)" }),
				" 长度。"
			] }) : !done ? /* @__PURE__ */ jsxs(Fragment, { children: [
				"第 ",
				/* @__PURE__ */ jsx("b", {
					className: "cur",
					children: curCol + 1
				}),
				" 个：B 的值 ",
				/* @__PURE__ */ jsx("b", { children: b[curCol] }),
				" 在 A 里排第",
				/* @__PURE__ */ jsxs("b", { children: [
					" ",
					map.get(b[curCol]),
					" "
				] }),
				"位 → 位置序列第 ",
				curCol + 1,
				" 格填 ",
				/* @__PURE__ */ jsx("b", { children: mapped[curCol] }),
				"。"
			] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
				"位置序列 [",
				/* @__PURE__ */ jsx("b", { children: mapped.join(", ") }),
				"] 的一条最长上升子序列已点绿，长度 ",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: lisLen
				}),
				"。 这恰好等于两排列的 ",
				/* @__PURE__ */ jsx("b", { children: "LCS 长度" }),
				"——所以排列 LCS 可以丢给 ",
				/* @__PURE__ */ jsx("b", {
					className: "ll__link",
					children: "O(n log n) 的 LIS 二分"
				}),
				"去做。"
			] })
		}),
		/* @__PURE__ */ jsx(PlaybackControls, {
			player,
			variant: "compact",
			label: "排列 LCS 转 LIS 逐帧播放",
			className: "ll__ctl"
		})
	] });
}
//#endregion
//#region src/content/b/LCSArt.tsx
function SetupFigure() {
	const top = [
		"A",
		"B",
		"C",
		"B",
		"D",
		"A",
		"B"
	];
	const bot = [
		"B",
		"D",
		"C",
		"A",
		"B"
	];
	const pairs = [
		[1, 0],
		[2, 2],
		[5, 3],
		[6, 4]
	];
	const x0t = 40;
	const x0b = 96;
	const dx = 74;
	const bw = 46;
	const topY = 34;
	const botY = 150;
	const cxT = (i) => x0t + i * dx + bw / 2;
	const cxB = (i) => x0b + i * dx + bw / 2;
	const pickT = new Set(pairs.map((p) => p[0]));
	const pickB = new Set(pairs.map((p) => p[1]));
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 210",
		role: "img",
		"aria-label": "两串字符与它们的一条最长公共子序列",
		children: [
			pairs.map(([i, j]) => /* @__PURE__ */ jsx("line", {
				x1: cxT(i),
				y1: 78,
				x2: cxB(j),
				y2: botY,
				stroke: "var(--accent-2)",
				strokeWidth: "2.4",
				opacity: "0.85"
			}, `ln${i}-${j}`)),
			top.map((ch, i) => {
				const on = pickT.has(i);
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x0t + i * dx},${topY})`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: bw,
						height: "44",
						rx: "10",
						fill: on ? "color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))" : "var(--surface-3)",
						stroke: on ? "var(--accent-2)" : "var(--border-strong)",
						strokeWidth: on ? "2" : "1.4"
					}), /* @__PURE__ */ jsx("text", {
						x: bw / 2,
						y: "29",
						textAnchor: "middle",
						fontSize: "19",
						className: "mono",
						fill: on ? "var(--accent-1)" : "var(--text-2)",
						children: ch
					})]
				}, `t${i}`);
			}),
			bot.map((ch, j) => {
				const on = pickB.has(j);
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x0b + j * dx},${botY})`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: bw,
						height: "44",
						rx: "10",
						fill: on ? "color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))" : "var(--surface-3)",
						stroke: on ? "var(--accent-2)" : "var(--border-strong)",
						strokeWidth: on ? "2" : "1.4"
					}), /* @__PURE__ */ jsx("text", {
						x: bw / 2,
						y: "29",
						textAnchor: "middle",
						fontSize: "19",
						className: "mono",
						fill: on ? "var(--accent-1)" : "var(--text-2)",
						children: ch
					})]
				}, `b${j}`);
			}),
			/* @__PURE__ */ jsx("text", {
				x: "16",
				y: "60",
				fontSize: "13",
				fontWeight: "600",
				fill: "var(--text-3)",
				children: "A"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "16",
				y: "176",
				fontSize: "13",
				fontWeight: "600",
				fill: "var(--text-3)",
				children: "B"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "360",
				y: "204",
				fontSize: "11.5",
				fill: "var(--accent-1)",
				children: "连线勾出的 B C A B 是一条长度 4 的公共子序列"
			})
		]
	});
}
function DecisionFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 250",
		role: "img",
		"aria-label": "LCS 转移：末位相等取左上加一，否则取上、左的较大者",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "lcs-ar",
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
						width: "156",
						height: "48",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "78",
						y: "20",
						textAnchor: "middle",
						fontSize: "12",
						fill: "var(--text-2)",
						children: "看 A 的前 i 位、B 的前 j 位"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "78",
						y: "39",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[i][j] = ?"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M280 56 L150 96",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#lcs-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M340 56 L490 96",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#lcs-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "150",
				y: "82",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--viz-chosen)",
				children: "末位相等 A[i]=B[j]"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "492",
				y: "82",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "末位不等"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(30,100)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "240",
						height: "74",
						rx: "12",
						fill: "color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))",
						stroke: "var(--viz-chosen)",
						strokeWidth: "1.6"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "26",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "这两个字符配成一对"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "50",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "= dp[i−1][j−1] + 1"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "67",
						textAnchor: "middle",
						fontSize: "11",
						fill: "var(--text-3)",
						children: "各退一格，公共长度 +1"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(360,100)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "240",
						height: "74",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "24",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "末位至少有一个用不上"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "48",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "= max(dp[i−1][j], dp[i][j−1])"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "66",
						textAnchor: "middle",
						fontSize: "11",
						fill: "var(--text-3)",
						children: "要么丢 A 末位，要么丢 B 末位"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M150 174 L296 222",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#lcs-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M480 174 L344 222",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#lcs-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(212,224)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "216",
					height: "26",
					rx: "10",
					fill: "color-mix(in srgb, var(--accent-1) 14%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.4"
				}), /* @__PURE__ */ jsx("text", {
					x: "108",
					y: "18",
					textAnchor: "middle",
					fontSize: "12.5",
					className: "mono",
					fill: "var(--text-1)",
					children: "按是否相等，二选一填入"
				})]
			})
		]
	});
}
function BacktrackFigure() {
	const A = [
		"A",
		"B",
		"C",
		"B"
	];
	const B = [
		"B",
		"D",
		"C",
		"B"
	];
	const dp = [
		[
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
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
			0,
			1,
			1,
			2,
			2
		],
		[
			0,
			1,
			1,
			2,
			3
		]
	];
	const path = /* @__PURE__ */ new Set([
		"4,4",
		"3,3",
		"2,2",
		"2,1",
		"1,1",
		"0,0"
	]);
	const diag = /* @__PURE__ */ new Set([
		"4,4",
		"3,3",
		"2,1"
	]);
	const CW = 40;
	const gx = (c) => 96 + c * CW;
	const gy = (r) => 34 + r * CW;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 400 270",
		role: "img",
		"aria-label": "沿转移来路从右下角回溯，斜向一步摘一个公共字符",
		children: [
			["∅", ...B].map((ch, c) => /* @__PURE__ */ jsx("text", {
				x: gx(c) + CW / 2,
				y: "26",
				textAnchor: "middle",
				fontSize: "13",
				className: "mono",
				fill: "var(--text-3)",
				children: ch
			}, `ch${c}`)),
			["∅", ...A].map((ch, r) => /* @__PURE__ */ jsx("text", {
				x: "80",
				y: gy(r) + CW / 2 + 5,
				textAnchor: "end",
				fontSize: "13",
				className: "mono",
				fill: "var(--text-3)",
				children: ch
			}, `rh${r}`)),
			dp.map((row, r) => row.map((v, c) => {
				const onPath = path.has(`${r},${c}`);
				const isDiag = diag.has(`${r},${c}`);
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${gx(c)},${gy(r)})`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: CW - 4,
						height: CW - 4,
						rx: "7",
						fill: isDiag ? "color-mix(in srgb, var(--viz-chosen) 22%, var(--surface-3))" : onPath ? "color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))" : "var(--surface-3)",
						stroke: isDiag ? "var(--viz-chosen)" : onPath ? "var(--accent-2)" : "var(--border-strong)",
						strokeWidth: onPath ? "1.8" : "1.2"
					}), /* @__PURE__ */ jsx("text", {
						x: (CW - 4) / 2,
						y: 23,
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: v
					})]
				}, `${r}-${c}`);
			})),
			/* @__PURE__ */ jsx("path", {
				d: `M ${gx(4) + CW / 2 - 2} ${gy(4) + CW / 2 - 2}
            L ${gx(3) + CW / 2 - 2} ${gy(3) + CW / 2 - 2}
            L ${gx(2) + CW / 2 - 2} ${gy(2) + CW / 2 - 2}
            L ${gx(1) + CW / 2 - 2} ${gy(2) + CW / 2 - 2}
            L ${gx(1) + CW / 2 - 2} ${gy(1) + CW / 2 - 2}
            L ${gx(0) + CW / 2 - 2} ${gy(0) + CW / 2 - 2}`,
				fill: "none",
				stroke: "var(--accent-1)",
				strokeWidth: "2.2",
				strokeDasharray: "5 4",
				opacity: "0.8"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "96",
				y: "262",
				fontSize: "11.5",
				fill: "var(--viz-chosen)",
				children: "绿格＝相等时斜向一步，摘下 B / C / B → 得 LCS「BCB」"
			})
		]
	});
}
function PermToLisFigure() {
	const A = [
		1,
		2,
		3,
		4,
		5
	];
	const B = [
		2,
		4,
		1,
		5,
		3
	];
	const posInA = new Map(A.map((v, i) => [v, i + 1]));
	const mapped = B.map((v) => posInA.get(v));
	const lisPick = /* @__PURE__ */ new Set([
		0,
		1,
		3
	]);
	const x0 = 96;
	const dx = 84;
	const bw = 52;
	const cx = (i) => x0 + i * dx + bw / 2;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 220",
		role: "img",
		"aria-label": "把 B 的每个值映射成它在 A 中的位置，位置序列的最长上升子序列即为 LCS",
		children: [
			/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsx("marker", {
				id: "p2l-dn",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--text-3)"
				})
			}), /* @__PURE__ */ jsx("marker", {
				id: "p2l-up",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--viz-chosen)"
				})
			})] }),
			B.map((v, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${x0 + i * dx},18)`,
				children: [/* @__PURE__ */ jsx("rect", {
					width: bw,
					height: "40",
					rx: "10",
					fill: "var(--surface-3)",
					stroke: "var(--border-strong)",
					strokeWidth: "1.4"
				}), /* @__PURE__ */ jsx("text", {
					x: bw / 2,
					y: "26",
					textAnchor: "middle",
					fontSize: "17",
					className: "mono",
					fill: "var(--text-2)",
					children: v
				})]
			}, `b${i}`)),
			/* @__PURE__ */ jsx("text", {
				x: "16",
				y: "44",
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--text-3)",
				children: "B 的值"
			}),
			B.map((_, i) => /* @__PURE__ */ jsx("path", {
				d: `M ${cx(i)} 60 L ${cx(i)} 96`,
				stroke: "var(--text-3)",
				strokeWidth: "1.6",
				markerEnd: "url(#p2l-dn)"
			}, `ar${i}`)),
			/* @__PURE__ */ jsx("text", {
				x: "16",
				y: "122",
				fontSize: "12",
				fill: "var(--text-3)",
				children: "换成"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "16",
				y: "138",
				fontSize: "12",
				fill: "var(--text-3)",
				children: "它在 A"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "16",
				y: "154",
				fontSize: "12",
				fill: "var(--text-3)",
				children: "的位置"
			}),
			mapped.map((p, i) => {
				const on = lisPick.has(i);
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x0 + i * dx},100)`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: bw,
						height: "46",
						rx: "10",
						fill: on ? "color-mix(in srgb, var(--viz-chosen) 20%, var(--surface-3))" : "var(--surface-3)",
						stroke: on ? "var(--viz-chosen)" : "var(--border-strong)",
						strokeWidth: on ? "2" : "1.4"
					}), /* @__PURE__ */ jsx("text", {
						x: bw / 2,
						y: "29",
						textAnchor: "middle",
						fontSize: "18",
						className: "mono",
						fill: on ? "var(--text-1)" : "var(--text-2)",
						children: p
					})]
				}, `m${i}`);
			}),
			[0, 1].map((k) => {
				const arr = [
					0,
					1,
					3
				];
				const i = arr[k];
				const j = arr[k + 1];
				return /* @__PURE__ */ jsx("path", {
					d: `M ${cx(i)} 108 Q ${(cx(i) + cx(j)) / 2} 92 ${cx(j)} 108`,
					stroke: "var(--viz-chosen)",
					strokeWidth: "2.4",
					fill: "none",
					markerEnd: "url(#p2l-up)"
				}, `lis${k}`);
			}),
			/* @__PURE__ */ jsx("text", {
				x: "16",
				y: "184",
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--viz-chosen)",
				children: "位置序列"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(150,192)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "330",
					height: "24",
					rx: "10",
					fill: "color-mix(in srgb, var(--accent-1) 12%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.3"
				}), /* @__PURE__ */ jsx("text", {
					x: "165",
					y: "16",
					textAnchor: "middle",
					fontSize: "12",
					className: "mono",
					fill: "var(--text-1)",
					children: "LIS(2,4,1,5,3) = 2,4,5 → 长度 3 = LCS 长度"
				})]
			})
		]
	});
}
//#endregion
//#region src/content/b/LCS.tsx
var CODE_P1439 = `
#include <algorithm>
#include <iostream>
using namespace std;
#define MX 100005

int n, len;
int a[MX], p[MX];   // p[值] = 该值在 a 中的位置
int b[MX], g[MX];   // g[k] = 长度 k 的上升子序列的最小结尾（单调递增）

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        p[a[i]] = i;                // 记下 a 中每个值的位置
    }
    for (int i = 1; i <= n; i++)
    {
        int x;
        cin >> x;
        b[i] = p[x];                // ★把 b 的值换成它在 a 中的位置
    }

    // 排列 LCS = 位置序列 b[] 的 LIS，二分 O(n log n)
    for (int i = 1; i <= n; i++)
    {
        if (len == 0 || b[i] > g[len])
        {
            g[++len] = b[i];        // 比末尾大，接到最长后面
        }
        else
        {
            int l = 1, r = len;
            while (l <= r)          // lower_bound：第一个 >= b[i] 的位置
            {
                int mid = (l + r) >> 1;
                g[mid] >= b[i] ? r = mid - 1 : l = mid + 1;
            }
            g[l] = b[i];
        }
    }

    cout << len << endl;
    return 0;
}
// TAG: 线性DP LCS 排列 LIS 二分 O(nlogn)`;
var CODE_P4303 = `
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
#define MX 100005

int n, len;
vector<int> pos[MX];   // pos[值] = 该值在 a 中出现的所有位置（升序）
int b[5 * MX], g[5 * MX];

int main()
{
    cin >> n;
    int tot = 5 * n;                    // 每种基因恰好出现 5 次
    for (int i = 1; i <= tot; i++)
    {
        int x;
        cin >> x;
        pos[x].push_back(i);            // a 中位置，天然升序
    }

    int cnt = 0;
    for (int i = 1; i <= tot; i++)
    {
        int x;
        cin >> x;
        // ★把 b 里的 x 展开成它在 a 中的位置，且按【降序】铺开，
        // 这样同一个值的 5 个位置在 LIS 里最多被选中一个，等价 LCS 的匹配约束。
        for (int k = (int)pos[x].size() - 1; k >= 0; k--)
        {
            b[++cnt] = pos[x][k];
        }
    }

    // 对展开后的位置序列求 LIS（严格上升），二分 O(N log N)，N = 5n
    for (int i = 1; i <= cnt; i++)
    {
        if (len == 0 || b[i] > g[len])
        {
            g[++len] = b[i];
        }
        else
        {
            int l = 1, r = len;
            while (l <= r)              // 第一个 >= b[i] 的位置
            {
                int mid = (l + r) >> 1;
                g[mid] >= b[i] ? r = mid - 1 : l = mid + 1;
            }
            g[l] = b[i];
        }
    }

    cout << len << endl;
    return 0;
}
// TAG: 线性DP LCS 有界重复 展开 LIS 二分`;
var CODE_P2516 = `
#include <algorithm>
#include <iostream>
#include <cstring>
using namespace std;
#define MX 5005
const int MOD = 100000000;   // 答案对 10^8 取模

char sa[MX], sb[MX];
int la, lb;
int f[MX][MX];               // f[i][j]：LCS 长度
int c[MX][MX];               // c[i][j]：取得该长度的方案数

int main()
{
    cin >> (sa + 1) >> (sb + 1);
    la = strlen(sa + 1) - 1;         // 题目串尾带一个多余字符，去掉
    lb = strlen(sb + 1) - 1;

    for (int i = 0; i <= la; i++)    // 与空串比：长度 0，「什么都不选」算 1 种
    {
        c[i][0] = 1;
    }
    for (int j = 0; j <= lb; j++)
    {
        c[0][j] = 1;
    }

    for (int i = 1; i <= la; i++)
    {
        for (int j = 1; j <= lb; j++)
        {
            if (sa[i] == sb[j])
            {
                f[i][j] = f[i - 1][j - 1] + 1;
                c[i][j] = c[i - 1][j - 1];       // 末位配对，方案继承左上
            }
            else
            {
                f[i][j] = max(f[i - 1][j], f[i][j - 1]);
                if (f[i - 1][j] == f[i][j])      // 谁的长度达标就并进来
                {
                    c[i][j] = (c[i][j] + c[i - 1][j]) % MOD;
                }
                if (f[i][j - 1] == f[i][j])
                {
                    c[i][j] = (c[i][j] + c[i][j - 1]) % MOD;
                }
                if (f[i - 1][j - 1] == f[i][j])  // ★容斥：左上被重复计入，减掉
                {
                    c[i][j] = ((c[i][j] - c[i - 1][j - 1]) % MOD + MOD) % MOD;
                }
            }
        }
    }

    cout << f[la][lb] << endl;
    cout << c[la][lb] % MOD << endl;
    return 0;
}
// TAG: 线性DP LCS 计数 容斥`;
function LCS() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "什么是「公共子序列」"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"上一节的",
						/* @__PURE__ */ jsx("strong", { children: "子序列" }),
						"是从",
						/* @__PURE__ */ jsx("em", { children: "一" }),
						"串里挑数、保持原次序。这一节有",
						/* @__PURE__ */ jsx("strong", { children: "两" }),
						"串， 要找一条",
						/* @__PURE__ */ jsx("strong", { children: "同时是它们各自子序列" }),
						"的序列——它就是一条",
						/* @__PURE__ */ jsx("strong", { children: "公共子序列" }),
						"；其中",
						/* @__PURE__ */ jsx("strong", { children: "最长" }),
						"的那条，长度就是 LCS （Longest Common Subsequence）。注意是「子序列」不是「子串」：字符",
						/* @__PURE__ */ jsx("strong", { children: "不必相邻" }),
						"，只要在两串里都能按原次序依次找到。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"拿一个小例子：",
						/* @__PURE__ */ jsx(M, { children: "A=\\texttt{ABCBDAB}" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "B=\\texttt{BDCAB}" }),
						"。",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{BD}" }),
						" 在两串里都出现且次序一致，是公共子序列（长 2）；",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{BCAB}" }),
						" 也是——它在 A 里是第 2、3、6、7 位，在 B 里是第 1、3、4、5 位，两边都递增。能不能更长？试遍所有挑法，最长就是 4。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(SetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "A=ABCBDAB、B=BDCAB。连线把公共子序列 B C A B 的四对字符勾出——线不交叉，正说明它在两串里的下标各自递增（保持了原次序）。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"为什么不能",
						/* @__PURE__ */ jsx("strong", { children: "贪心" }),
						"地「从头扫，遇到相同字符就配一对」？看 ",
						/* @__PURE__ */ jsx(M, { children: "A=\\texttt{AB}" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "B=\\texttt{BA}" }),
						"：贪心先把两个 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{A}" }),
						" 配上，之后 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{B}" }),
						" 在 A 里已经没了往后的位置——只得长度 1； 可正解是先放 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{B}" }),
						" 再放 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{A}" }),
						"，同样长度 1，这里恰好不亏，但把串拉长就会出岔：",
						/* @__PURE__ */ jsx("strong", { children: "此刻配哪一对最好，取决于后面还能配出多少" }),
						"——又是需要 DP 的信号。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"穷举呢？A 的子序列有 ",
						/* @__PURE__ */ jsx(M, { children: "2^{|A|}" }),
						" 条，逐条去 B 里验证，指数级，串一长就无从枚举。下面用一张",
						/* @__PURE__ */ jsx("strong", { children: "二维表" }),
						"把它压成 ",
						/* @__PURE__ */ jsx(M, { children: "O(|A|\\cdot|B|)" }),
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
					children: "状态与转移：只看两串的「末位」"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"两串一起处理，抓手是",
						/* @__PURE__ */ jsx("strong", { children: "各自的前缀" }),
						"。设 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
						" 表示：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"A 的前 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 个字符"
						] }),
						"与 ",
						/* @__PURE__ */ jsxs("strong", { children: [
							"B 的前 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 个字符"
						] }),
						"的最长公共子序列长度。 要算它，只需盯住两串",
						/* @__PURE__ */ jsx("strong", { children: "当前的最后一个字符" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "A_i" }),
						" 与 ",
						/* @__PURE__ */ jsx(M, { children: "B_j" }),
						"——它俩相不相等，决定了两条截然不同的路。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(DecisionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "算 dp[i][j] 只看末位：相等就把这对配上、各退一格，长度 = 左上 + 1；不等则末位至少有一个用不上，丢 A 末位或丢 B 末位，取较大者。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "末位相等" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "A_i=B_j" }),
							"）：这对字符",
							/* @__PURE__ */ jsx("strong", { children: "可以且值得" }),
							"配成公共子序列的最后一对。把它配上后，剩下的问题变成「A 前 ",
							/* @__PURE__ */ jsx(M, { children: "i-1" }),
							" 与 B 前 ",
							/* @__PURE__ */ jsx(M, { children: "j-1" }),
							" 的 LCS」，长度在它基础上 ",
							/* @__PURE__ */ jsx(M, { children: "+1" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i][j]=dp[i-1][j-1]+1" }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "末位不等" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "A_i\\ne B_j" }),
							"）：这两个末位",
							/* @__PURE__ */ jsx("strong", { children: "配不成同一对" }),
							"，那么最优解里 ",
							/* @__PURE__ */ jsx(M, { children: "A_i" }),
							" 与 ",
							/* @__PURE__ */ jsx(M, { children: "B_j" }),
							" 至少有一个不会被用到。于是要么丢掉 ",
							/* @__PURE__ */ jsx(M, { children: "A_i" }),
							"（转成 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i-1][j]" }),
							"），要么丢掉 ",
							/* @__PURE__ */ jsx(M, { children: "B_j" }),
							"（转成 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i][j-1]" }),
							"），谁大取谁："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i][j]=\\max\\big(dp[i-1][j],\\ dp[i][j-1]\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"边界：",
							/* @__PURE__ */ jsx(M, { children: "dp[0][j]=dp[i][0]=0" }),
							"（任一串为空，公共子序列长度为 0）。答案：",
							/* @__PURE__ */ jsx(M, { children: "dp[|A|][|B|]" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"两串的 LCS 被「各自前缀 + 只看末位」拆成了一张 ",
						/* @__PURE__ */ jsx(M, { children: "(|A|{+}1)\\times(|B|{+}1)" }),
						" 的表：每格",
						/* @__PURE__ */ jsx("strong", { children: "只依赖左上、上、左三个已算好的邻居" }),
						"，一步 ",
						/* @__PURE__ */ jsx(M, { children: "O(1)" }),
						"。于是 ",
						/* @__PURE__ */ jsx(M, { children: "2^{|A|}" }),
						" 的枚举被 ",
						/* @__PURE__ */ jsx(M, { children: "O(|A|\\cdot|B|)" }),
						" 个格子装下。相等走对角、不等走上/左——这条「对角 vs 直行」的分野是全表的灵魂。"
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
						"用一对更短的串 ",
						/* @__PURE__ */ jsx(M, { children: "A=\\texttt{ABCB}" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "B=\\texttt{BDCB}" }),
						" 走几格（下标从 1 记），把两条规则跑起来："
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
									/* @__PURE__ */ jsx("b", { children: "第 0 行 / 第 0 列。" }),
									" 任一串取空前缀，公共子序列只能是空的：",
									/* @__PURE__ */ jsx(M, { children: "dp[0][\\cdot]=dp[\\cdot][0]=0" }),
									"。整张表的地基。"
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
									/* @__PURE__ */ jsx("b", { children: "末位相等的格。" }),
									" 看 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][1]" }),
									"：",
									/* @__PURE__ */ jsx(M, { children: "A_1=\\texttt{A}" }),
									"、",
									/* @__PURE__ */ jsx(M, { children: "B_1=\\texttt{B}" }),
									" 不等 → 取 ",
									/* @__PURE__ */ jsx(M, { children: "\\max(dp[0][1],dp[1][0])=0" }),
									"。 再看 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][1]" }),
									"：",
									/* @__PURE__ */ jsx(M, { children: "A_2=\\texttt{B}=B_1" }),
									" 相等 → ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][0]+1=1" }),
									"。第一对 ",
									/* @__PURE__ */ jsx(M, { children: "\\texttt{B}" }),
									" 配上了。"
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
									/* @__PURE__ */ jsx("b", { children: "末位不等的格。" }),
									" 看 ",
									/* @__PURE__ */ jsx(M, { children: "dp[3][3]" }),
									"：",
									/* @__PURE__ */ jsx(M, { children: "A_3=\\texttt{C}=B_3" }),
									" 相等 → 左上 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][2]+1" }),
									"。而如 ",
									/* @__PURE__ */ jsx(M, { children: "dp[3][2]" }),
									"：",
									/* @__PURE__ */ jsx(M, { children: "A_3=\\texttt{C}\\ne B_2=\\texttt{D}" }),
									" → 取上、左较大者，长度不涨。"
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
									" 填到右下角 ",
									/* @__PURE__ */ jsx(M, { children: "dp[4][4]=3" }),
									"——",
									/* @__PURE__ */ jsx(M, { children: "A=\\texttt{ABCB}" }),
									" 与 ",
									/* @__PURE__ */ jsx(M, { children: "B=\\texttt{BDCB}" }),
									" 的 LCS 长度是 3，正是 ",
									/* @__PURE__ */ jsx(M, { children: "\\texttt{BCB}" }),
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
						"下面的演示把整张 ",
						/* @__PURE__ */ jsx(M, { children: "dp" }),
						" 表",
						/* @__PURE__ */ jsx("strong", { children: "逐格填满" }),
						"，高亮每格来自左上（相等）还是上/左（不等）；填完再",
						/* @__PURE__ */ jsx("strong", { children: "回溯" }),
						"出一条 LCS。改两串的字符、加删长度，看它实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看它一格一格长出来，再回溯出答案"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(LCSDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "不止长度：回溯重构一条 LCS"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx(M, { children: "dp[|A|][|B|]" }),
						" 只给出",
						/* @__PURE__ */ jsx("strong", { children: "长度" }),
						"。想要那条子序列",
						/* @__PURE__ */ jsx("strong", { children: "本身" }),
						"，就从右下角",
						/* @__PURE__ */ jsx("strong", { children: "沿转移的来路往回走" }),
						"： 在格 ",
						/* @__PURE__ */ jsx(M, { children: "(i,j)" }),
						"，若当初是「相等」填的（",
						/* @__PURE__ */ jsx(M, { children: "A_i=B_j" }),
						"），就",
						/* @__PURE__ */ jsx("strong", { children: "斜着" }),
						"走到 ",
						/* @__PURE__ */ jsx(M, { children: "(i-1,j-1)" }),
						"，并",
						/* @__PURE__ */ jsx("strong", { children: "摘下这个字符" }),
						"； 否则朝当初更大的那个来源（上或左）走一格、不摘字符。走到边界为止，把摘到的字符",
						/* @__PURE__ */ jsx("strong", { children: "逆序" }),
						"拼起来，就是一条 LCS。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BacktrackFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "从右下角回溯：绿格是「相等」时斜向的一步，各摘下一个字符；灰路是「不等」时的直行（不摘）。逆序拼出 B C B——正是这对串的一条 LCS。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"要留意 LCS ",
						/* @__PURE__ */ jsx("strong", { children: "可能不唯一" }),
						"：当上、左来源一样大时，往哪边走都合法，会回溯出",
						/* @__PURE__ */ jsx("strong", { children: "不同但等长" }),
						"的 LCS。想统计「到底有多少条」，就得给方案数也开一张表——这正是本页例题 ",
						/* @__PURE__ */ jsx("strong", { children: "P2516" }),
						" 要处理的（相等时方案继承左上，不等时把达标来源并起来、再用容斥减去重复计入的左上）。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化：当两串是「排列」——降到 O(n log n)"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"标准 LCS 是 ",
						/* @__PURE__ */ jsx(M, { children: "O(|A|\\cdot|B|)" }),
						"。当 ",
						/* @__PURE__ */ jsx(M, { children: "|A|=|B|=n" }),
						" 都到 ",
						/* @__PURE__ */ jsx(M, { children: "10^5" }),
						"，",
						/* @__PURE__ */ jsx(M, { children: "n^2=10^{10}" }),
						" 必然超时。但有一类特殊情形能",
						/* @__PURE__ */ jsx("strong", { children: "大幅提速" }),
						"： 两串是",
						/* @__PURE__ */ jsx("strong", { children: "同一集合的两个排列" }),
						"（各值恰好出现一次，如都是 ",
						/* @__PURE__ */ jsx(M, { children: "1\\dots n" }),
						" 的重排）。此时有一个漂亮的转化——",
						/* @__PURE__ */ jsx("strong", { children: "LCS 可以变成 LIS" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"关键观察：既然 A 是排列，每个值在 A 里有",
						/* @__PURE__ */ jsx("strong", { children: "唯一的位置" }),
						"。把 B 里的每个值，都",
						/* @__PURE__ */ jsx("strong", { children: "替换成「它在 A 中的位置」" }),
						"，得到一串位置序列。那么——"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(PermToLisFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "A 取 1 2 3 4 5（位置即数值），B=2 4 1 5 3 逐个换成它在 A 里的位置，得位置序列 2 4 1 5 3；它的一条最长上升子序列 2 4 5（长 3）就等于 LCS 长度。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "为什么位置序列的 LIS 就是 LCS？" }),
						" 一条公共子序列，等价于在 A 里选一批位置、在 B 里选同样一批值，且",
						/* @__PURE__ */ jsx("strong", { children: "两边次序一致" }),
						"。 映射后，B 中被选值的相对次序",
						/* @__PURE__ */ jsx("strong", { children: "就是它们出现的先后" }),
						"（沿 B 从左到右，即位置序列的下标递增）；而「它们在 A 里也保持同样次序」翻译过来，正是这些位置",
						/* @__PURE__ */ jsx("strong", { children: "数值递增" }),
						"——两个「递增」合起来，恰是位置序列的一条",
						/* @__PURE__ */ jsx("strong", { children: "上升子序列" }),
						"。于是",
						/* @__PURE__ */ jsx("strong", { children: "最长公共子序列 = 位置序列的最长上升子序列" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"而 LIS 有 ",
						/* @__PURE__ */ jsx(M, { children: "O(n\\log n)" }),
						" 的",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/b/lis",
							style: { color: "var(--accent-2)" },
							children: "贪心 + 二分"
						}),
						"解法（维护 ",
						/* @__PURE__ */ jsx(M, { children: "tails" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{lower\\_bound}" }),
						" 替换）。绕这一圈，排列 LCS 就从 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 降到了 ",
						/* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsx(M, { children: "O(n\\log n)" }) }),
						"。"
					] })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的转化器把这套映射",
						/* @__PURE__ */ jsx("strong", { children: "逐步演示" }),
						"：逐个把 B 的值换成它在 A 里的位置，映完再点亮位置序列里的一条 LIS——它的长度就是 LCS。换第二个预设（A 乱序）看一般映射。"
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(LCSToLISDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "边界 · 只对「排列 / 无重复」直接成立",
					children: [
						"「LCS→LIS」的降维",
						/* @__PURE__ */ jsx("strong", { children: "前提" }),
						"是「一串里每个值唯一」（映射才是单值函数）。若值",
						/* @__PURE__ */ jsx("strong", { children: "有界重复" }),
						"（如每种恰好出现 ",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						" 次），需把一个值",
						/* @__PURE__ */ jsx("strong", { children: "展开成它的多个位置、且按位置降序铺开" }),
						"再求 LIS——见例题 ",
						/* @__PURE__ */ jsx("strong", { children: "P4303" }),
						"。若是",
						/* @__PURE__ */ jsx("strong", { children: "普通带重复的两串" }),
						"，则老老实实用 ",
						/* @__PURE__ */ jsx(M, { children: "O(|A|\\cdot|B|)" }),
						" 的二维 DP，别硬套。另有一类叫 ",
						/* @__PURE__ */ jsx("strong", { children: "LCIS（最长公共上升子序列）" }),
						"，要求公共子序列同时",
						/* @__PURE__ */ jsx("strong", { children: "严格上升" }),
						"——它是「LCS 的匹配 + LIS 的上升」两个约束的复合，需设",
						/* @__PURE__ */ jsx("strong", { children: "二维状态" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
						"「用到 ",
						/* @__PURE__ */ jsx(M, { children: "a_i" }),
						"、且以 ",
						/* @__PURE__ */ jsx(M, { children: "b_j" }),
						" 结尾」并配合前缀最优优化到 ",
						/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
						"；洛谷原生 P/B 题库暂无纯 LCIS 模板，此处只作为概念点点到，不强凑题号。"
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
					pid: "P1439",
					name: "【模板】最长公共子序列",
					src: "洛谷原生",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给定 ",
								/* @__PURE__ */ jsx(M, { children: "1\\dots n" }),
								" 的",
								/* @__PURE__ */ jsx("strong", { children: "两个排列" }),
								"，求它们的最长公共子序列长度，",
								/* @__PURE__ */ jsx(M, { children: "n\\le 10^5" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"排列 LCS→LIS 的",
								/* @__PURE__ */ jsx("strong", { children: "招牌模板题" }),
								"：",
								/* @__PURE__ */ jsx(M, { children: "n=10^5" }),
								" 卡死 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								"，逼你把「两串是排列」这个条件用足——映射位置、转成 LIS、二分求解。把本节深化那套转化",
								/* @__PURE__ */ jsx("strong", { children: "一次写通" }),
								"的最佳载体。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"记 ",
								/* @__PURE__ */ jsx(M, { children: "p[a_i]=i" }),
								"，令 ",
								/* @__PURE__ */ jsx(M, { children: "b_i\\gets p[b_i]" }),
								"；对 ",
								/* @__PURE__ */ jsx(M, { children: "b[]" }),
								" 求 LIS（",
								/* @__PURE__ */ jsx(M, { children: "\\texttt{lower\\_bound}" }),
								" 二分）。时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n\\log n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（映射位置 + LIS 二分）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1439,
								luogu: "P1439"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P4303",
					name: "[AHOI2006] 基因匹配",
					src: "AHOI2006",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"两串基因序列，每串长 ",
								/* @__PURE__ */ jsx(M, { children: "5n" }),
								"，且 ",
								/* @__PURE__ */ jsx(M, { children: "1\\dots n" }),
								" 每种基因在",
								/* @__PURE__ */ jsx("strong", { children: "每串里恰好出现 5 次" }),
								"。求两串的最长公共子序列长度。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"排列 LCS→LIS 的",
								/* @__PURE__ */ jsx("strong", { children: "「有界重复」变体" }),
								"：值不再唯一（各出现 5 次），直接映射会一对多。技巧是把每个值",
								/* @__PURE__ */ jsx("strong", { children: "展开成它在 A 中的 5 个位置、按降序铺开" }),
								"——降序保证同一值的多个位置在 LIS 里",
								/* @__PURE__ */ jsx("strong", { children: "至多选中一个" }),
								"，恰好等价于 LCS 的匹配约束。展开后序列长 ",
								/* @__PURE__ */ jsx(M, { children: "5n" }),
								"，再跑 LIS。它教会你「重复值」如何归约回 LIS。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"对 A 建",
								/* @__PURE__ */ jsx("strong", { children: "位置表" }),
								" ",
								/* @__PURE__ */ jsx(M, { children: "pos[v]" }),
								"（值 ",
								/* @__PURE__ */ jsx(M, { children: "v" }),
								" 的升序位置）；扫 B，把每个值的位置",
								/* @__PURE__ */ jsx("strong", { children: "降序" }),
								"压入序列，再求其 LIS。时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(5n\\log(5n))" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（位置展开 + LIS 二分）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P4303,
								luogu: "P4303"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2516",
					name: "[HAOI2010] 最长公共子序列",
					src: "洛谷原生",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给定两串（末尾各带一个多余字符），求它们的 LCS ",
								/* @__PURE__ */ jsx("strong", { children: "长度" }),
								"，以及",
								/* @__PURE__ */ jsx("strong", { children: "不同 LCS 的方案数" }),
								"（对 ",
								/* @__PURE__ */ jsx(M, { children: "10^8" }),
								" 取模）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"回到",
								/* @__PURE__ */ jsx("strong", { children: "标准二维 LCS" }),
								"，但在长度之外再叠一层",
								/* @__PURE__ */ jsx("strong", { children: "计数 DP" }),
								"：既要 ",
								/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
								" 记长度，又要 ",
								/* @__PURE__ */ jsx(M, { children: "c[i][j]" }),
								" 记「取得该长度的方案数」。难点是不等时把上、左两个达标来源并起来会",
								/* @__PURE__ */ jsx("strong", { children: "重复计入左上" }),
								"，须",
								/* @__PURE__ */ jsx("strong", { children: "容斥减一次" }),
								"。是把 LCS 从「求长度」推向「数方案」的经典一题。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"相等：",
								/* @__PURE__ */ jsx(M, { children: "f{+}1" }),
								"、",
								/* @__PURE__ */ jsx(M, { children: "c\\gets c_{\\nwarrow}" }),
								"；不等：",
								/* @__PURE__ */ jsx(M, { children: "f=\\max" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "c" }),
								" 并入长度达标的上/左，再",
								/* @__PURE__ */ jsx("strong", { children: "减去" }),
								"左上（若也达标）。时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(|A|\\cdot|B|)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（长度 + 方案数容斥）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2516,
								luogu: "P2516"
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
						"说明：纯 ",
						/* @__PURE__ */ jsx("strong", { children: "LCIS（最长公共上升子序列）" }),
						"在洛谷原生 P/B 题库暂无对应模板题（仅有 U 前缀的用户自建题）。它的正解是「LCS 匹配 + LIS 上升」的复合二维状态，已在上方深化的「常见陷阱」框里作为",
						/* @__PURE__ */ jsx("strong", { children: "概念点" }),
						"讲解，这里不强凑题号。下面两题分别从「子序列思想」与「加权 LCS / 对齐」两侧巩固。"
					]
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2837",
					name: "晚餐队列优化 Dining Cows",
					hint: "子序列思想：要删掉最少的牛，等价于保留最长的一段「先按体型分组、组内编号递增」的子序列——把它转成一维 LIS/前缀最优来做，答案 = 总数 − 最长保留。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1279",
					name: "字串距离",
					hint: "加权 LCS / 序列对齐：允许在两串里插入空格对齐，未匹配位置罚 k、错配位置罚字符差，求最小总距离——把 LCS 的「相等/不等」转移换成「对齐/跳过」的带权版二维 DP。（亦属 A5 编辑距离一族。）"
				})
			]
		})
	] });
}
//#endregion
export { LCS as default };
