import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, Minus, MousePointerClick, Plus, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/score-tree/internal.ts
function executeScoreTree(scores, emit) {
	for (const score of scores) if (!Number.isFinite(score)) throw new RangeError("score-tree values must be finite");
	const n = scores.length;
	const dp = Array.from({ length: n }, () => Array(n).fill(0));
	const root = Array.from({ length: n }, () => Array(n).fill(-1));
	const get = (left, right) => left > right ? 1 : dp[left][right];
	for (let index = 0; index < n; index++) {
		dp[index][index] = scores[index];
		root[index][index] = index;
	}
	for (let length = 2; length <= n; length++) for (let left = 0; left + length <= n; left++) {
		const right = left + length - 1;
		const candidates = [];
		let value = Number.NEGATIVE_INFINITY;
		let bestRoot = left;
		for (let candidateRoot = left; candidateRoot <= right; candidateRoot++) {
			const leftValue = get(left, candidateRoot - 1);
			const rightValue = get(candidateRoot + 1, right);
			const candidate = leftValue * rightValue + scores[candidateRoot];
			candidates.push({
				root: candidateRoot,
				left: leftValue,
				right: rightValue,
				value: candidate
			});
			if (candidate > value) {
				value = candidate;
				bestRoot = candidateRoot;
			}
		}
		dp[left][right] = value;
		root[left][right] = bestRoot;
		emit({
			type: "settled",
			left,
			right,
			root: bestRoot,
			value,
			leftValue: get(left, bestRoot - 1),
			rightValue: get(bestRoot + 1, right),
			candidates
		});
	}
	const preorder = [];
	const stack = n === 0 ? [] : [[0, n - 1]];
	while (stack.length > 0) {
		const [left, right] = stack.pop();
		if (left > right) continue;
		const node = root[left][right];
		preorder.push(node + 1);
		if (node + 1 <= right) stack.push([node + 1, right]);
		if (left <= node - 1) stack.push([left, node - 1]);
	}
	return {
		n,
		dp,
		root,
		ans: n === 0 ? 0 : dp[0][n - 1],
		preorder
	};
}
function recordScoreTree(scores) {
	const events = [];
	return {
		result: executeScoreTree(scores, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/algorithms/score-tree/index.ts
function solveScoreTree(scores) {
	return executeScoreTree(scores, ignoreEvents);
}
//#endregion
//#region src/components/demos/interval/scoreTreeSolver.ts
function settled(table) {
	const states = {};
	for (let row = 0; row < table.length; row++) for (let column = row; column < table.length; column++) if (table[row][column] !== null) states[key(row, column)] = "settled";
	return states;
}
function scoreTree(scores) {
	const run = recordScoreTree(scores);
	const n = scores.length;
	const table = Array.from({ length: n }, () => Array(n).fill(null));
	for (let index = 0; index < n; index++) table[index][index] = scores[index];
	const snapshot = () => table.map((row) => row.slice());
	const frames = [{
		values: snapshot(),
		states: settled(table),
		caption: "<b>对角线（区间长度 1）</b>：单个节点自成一棵子树，dp[i][i]=score[i]；空子树加分约定为 1。",
		formula: "dp[i][i]=\\mathrm{score}[i]"
	}];
	for (const event of run.events) {
		table[event.left][event.right] = event.value;
		const states = settled(table);
		const arrows = [];
		if (event.root > event.left) {
			states[key(event.left, event.root - 1)] = "chosen";
			arrows.push({
				from: {
					r: event.left,
					c: event.root - 1
				},
				to: {
					r: event.left,
					c: event.right
				},
				kind: "chosen"
			});
		}
		if (event.root < event.right) {
			states[key(event.root + 1, event.right)] = "chosen";
			arrows.push({
				from: {
					r: event.root + 1,
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
		const candidates = event.candidates.map((candidate) => `${candidate.root === event.root ? "★" : ""}根${candidate.root + 1}:${candidate.left}×${candidate.right}+${scores[candidate.root]}=${candidate.value}`);
		frames.push({
			values: snapshot(),
			states,
			arrows,
			active: {
				r: event.left,
				c: event.right
			},
			caption: `区间 <b>[${event.left + 1},${event.right + 1}]</b> 枚举根：{${candidates.join("，")}}，取最大 <b>${event.value}</b>（根为节点 ${event.root + 1}）。`,
			formula: `dp[${event.left + 1}][${event.right + 1}]=${event.leftValue}\\times${event.rightValue}+${scores[event.root]}=${event.value}`
		});
	}
	const finalStates = settled(table);
	if (n > 0) finalStates[key(0, n - 1)] = "chosen";
	frames.push({
		values: snapshot(),
		states: finalStates,
		caption: `答案在<b>右上角 dp[1][${n}] = ${run.result.ans}</b>；顺着 root 表即可前序还原最优二叉树。`,
		formula: `dp[1][${n}]=${run.result.ans}`
	});
	return {
		rows: n,
		cols: n,
		cell: 44,
		rowHeaderLabels: Array.from({ length: n }, (_, index) => `i=${index + 1}`),
		colHeaderLabels: Array.from({ length: n }, (_, index) => `j=${index + 1}`),
		frames
	};
}
function layoutScoreTree(result) {
	const nodes = [];
	let maxDepth = 0;
	const build = (left, right, depth) => {
		if (left > right) return null;
		const root = result.root[left][right];
		maxDepth = Math.max(maxDepth, depth);
		const node = {
			id: root + 1,
			score: result.dp[root][root],
			lo: left + 1,
			hi: right + 1,
			subScore: result.dp[left][right],
			depth,
			left: null,
			right: null,
			x: (root + .5) / result.n,
			y: depth
		};
		node.left = build(left, root - 1, depth + 1);
		node.right = build(root + 1, right, depth + 1);
		nodes.push(node);
		return node;
	};
	if (result.n > 0) build(0, result.n - 1, 0);
	return {
		nodes,
		maxDepth
	};
}
//#endregion
//#region src/components/demos/interval/ScoreTreeDemo.tsx
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
* 加分二叉树区间 DP 三角表演示：dp[i][j] 按区间长度递推，
* 逐格高亮被选中的根 k 与它的左、右子树来源 dp[i][k-1]、dp[k+1][j]。
* 与石子合并同结构，区别只在转移是「左×右 + score[根]」。
*/
function ScoreTreeDemo() {
	const [scores, setScores] = useState([
		5,
		7,
		1,
		2,
		10
	]);
	const model = useMemo(() => scoreTree(scores), [scores]);
	const modelKey = `st-${scores.join("_")}`;
	const setScore = (i, val) => setScores((arr) => arr.map((s, k) => k === i ? val : s));
	const addNode = () => setScores((arr) => arr.length < 5 ? [...arr, 3] : arr);
	const removeNode = (i) => setScores((arr) => arr.length > 3 ? arr.filter((_, k) => k !== i) : arr);
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
		className: "kd__toolbar",
		children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "kd__group-label",
			children: "节点按中序排开（可改每个分数 · 3～5 个节点）"
		}), /* @__PURE__ */ jsxs("div", {
			className: "kd__items",
			children: [scores.map((s, i) => /* @__PURE__ */ jsxs("div", {
				className: "kd__item",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "kd__item-i",
						children: i + 1
					}),
					scores.length > 3 && /* @__PURE__ */ jsx("button", {
						className: "kd__remove",
						onClick: () => removeNode(i),
						"aria-label": "删除该节点",
						children: /* @__PURE__ */ jsx(X, { size: 12 })
					}),
					/* @__PURE__ */ jsx(Stepper$1, {
						label: "分数 score",
						value: s,
						min: 1,
						max: 30,
						onChange: (v) => setScore(i, v)
					})
				]
			}, i)), scores.length < 5 && /* @__PURE__ */ jsxs("button", {
				className: "kd__add",
				onClick: addNode,
				children: [/* @__PURE__ */ jsx(Plus, { size: 14 }), " 加一个节点"]
			})]
		})] })
	}), /* @__PURE__ */ jsx(DPViz, { model }, modelKey)] });
}
//#endregion
//#region src/components/demos/interval/ScoreTreeBuildDemo.tsx
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
function subtreeIds(node, acc) {
	if (!node) return;
	acc.add(node.id);
	subtreeIds(node.left, acc);
	subtreeIds(node.right, acc);
}
/**
* 第二演示：用主演示记下的 root[i][j] 前序回溯，把最优二叉树画出来。
* 点任一节点 → 高亮「它这棵子树」，同时在下方中序刻度条上点亮它覆盖的连续区间 [lo,hi]，
* 把「一段连续区间 ⇔ 一棵子树」这层对应关系摊在眼前。
*/
function ScoreTreeBuildDemo() {
	const [scores, setScores] = useState([
		5,
		7,
		1,
		2,
		10
	]);
	const [sel, setSel] = useState(null);
	const res = useMemo(() => solveScoreTree(scores), [scores]);
	const { nodes, maxDepth } = useMemo(() => layoutScoreTree(res), [res]);
	const byId = useMemo(() => {
		const m = /* @__PURE__ */ new Map();
		nodes.forEach((nd) => m.set(nd.id, nd));
		return m;
	}, [nodes]);
	const selNode = sel != null ? byId.get(sel) ?? null : null;
	const selSet = useMemo(() => {
		const s = /* @__PURE__ */ new Set();
		subtreeIds(selNode, s);
		return s;
	}, [selNode]);
	const n = scores.length;
	const setScore = (i, val) => setScores((arr) => arr.map((s, k) => k === i ? val : s));
	const addNode = () => setScores((arr) => arr.length < 5 ? [...arr, 3] : arr);
	const removeNode = (i) => {
		setSel(null);
		setScores((arr) => arr.length > 3 ? arr.filter((_, k) => k !== i) : arr);
	};
	const W = 560;
	const padX = 40;
	const topY = 40;
	const rowH = 92;
	const H = topY + maxDepth * rowH + 56;
	const px = (x) => padX + x * (W - 2 * padX);
	const py = (d) => topY + d * rowH;
	const edges = [];
	nodes.forEach((nd) => {
		if (nd.left) edges.push({
			a: nd,
			b: nd.left,
			side: "L"
		});
		if (nd.right) edges.push({
			a: nd,
			b: nd.right,
			side: "R"
		});
	});
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "kd__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "节点按中序排开（与上一个演示同一组分数 · 3～5 个）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "kd__items",
				children: [scores.map((s, i) => /* @__PURE__ */ jsxs("div", {
					className: "kd__item",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "kd__item-i",
							children: i + 1
						}),
						scores.length > 3 && /* @__PURE__ */ jsx("button", {
							className: "kd__remove",
							onClick: () => removeNode(i),
							"aria-label": "删除该节点",
							children: /* @__PURE__ */ jsx(X, { size: 12 })
						}),
						/* @__PURE__ */ jsx(Stepper, {
							label: "分数 score",
							value: s,
							min: 1,
							max: 30,
							onChange: (v) => setScore(i, v)
						})
					]
				}, i)), scores.length < 5 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: addNode,
					children: [/* @__PURE__ */ jsx(Plus, { size: 14 }), " 加一个节点"]
				})]
			})] })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "stb__hint",
			children: [
				"点任意节点 → 高亮",
				/* @__PURE__ */ jsx("strong", { children: "它这棵子树" }),
				"，并在下方中序刻度条上点亮它对应的",
				/* @__PURE__ */ jsx("strong", { children: "连续区间" }),
				"。 整棵树最大加分 ",
				/* @__PURE__ */ jsx("b", {
					className: "stb__ans",
					children: res.ans
				}),
				"，前序遍历 ",
				/* @__PURE__ */ jsx("b", {
					className: "stb__pre",
					children: res.preorder.join(" ")
				}),
				"。"
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "stb__stage",
			children: /* @__PURE__ */ jsxs("svg", {
				viewBox: `0 0 ${W} ${H}`,
				role: "img",
				"aria-label": "最优加分二叉树，可点节点看它对应的中序区间",
				children: [
					/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
						id: "stb-tick",
						markerWidth: "7",
						markerHeight: "7",
						refX: "3.5",
						refY: "3.5",
						orient: "auto",
						children: /* @__PURE__ */ jsx("circle", {
							cx: "3.5",
							cy: "3.5",
							r: "2.4",
							fill: "var(--accent-2)"
						})
					}) }),
					edges.map((e, i) => {
						const on = selSet.has(e.a.id) && selSet.has(e.b.id);
						return /* @__PURE__ */ jsx("line", {
							x1: px(e.a.x),
							y1: py(e.a.depth) + 20,
							x2: px(e.b.x),
							y2: py(e.b.depth) - 20,
							stroke: on ? "var(--accent-2)" : "var(--border-strong)",
							strokeWidth: on ? 3 : 1.6
						}, i);
					}),
					edges.map((e, i) => /* @__PURE__ */ jsx("text", {
						x: (px(e.a.x) + px(e.b.x)) / 2 + (e.side === "L" ? -10 : 10),
						y: (py(e.a.depth) + py(e.b.depth)) / 2,
						textAnchor: "middle",
						fontSize: "11",
						className: "mono",
						fill: "var(--text-3)",
						children: e.side === "L" ? "左" : "右"
					}, `lab${i}`)),
					nodes.map((nd) => {
						const on = selSet.has(nd.id);
						const isRoot = sel === nd.id;
						return /* @__PURE__ */ jsxs("g", {
							transform: `translate(${px(nd.x)},${py(nd.depth)})`,
							onClick: () => setSel(sel === nd.id ? null : nd.id),
							style: { cursor: "pointer" },
							children: [
								/* @__PURE__ */ jsx("circle", {
									r: "20",
									fill: isRoot ? "var(--grad-accent)" : on ? "color-mix(in srgb, var(--accent-1) 20%, var(--surface-3))" : "var(--surface-3)",
									stroke: on ? "var(--accent-2)" : "var(--border-strong)",
									strokeWidth: on ? 2.5 : 1.5
								}),
								/* @__PURE__ */ jsx("text", {
									y: "-1",
									textAnchor: "middle",
									fontSize: "14",
									fontWeight: "700",
									fill: isRoot ? "var(--text-on-accent)" : "var(--text-1)",
									children: nd.id
								}),
								/* @__PURE__ */ jsx("text", {
									y: "13",
									textAnchor: "middle",
									fontSize: "9.5",
									className: "mono",
									fill: isRoot ? "var(--text-on-accent)" : "var(--text-3)",
									children: nd.score
								})
							]
						}, nd.id);
					}),
					Array.from({ length: n }, (_, k) => {
						const cw = (W - 2 * padX) / n;
						const x = padX + k * cw;
						const y = H - 40;
						const inSel = selNode ? k + 1 >= selNode.lo && k + 1 <= selNode.hi : false;
						return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("rect", {
							x: x + 3,
							y,
							width: cw - 6,
							height: "30",
							rx: "7",
							fill: inSel ? "color-mix(in srgb, var(--accent-1) 22%, var(--surface-3))" : "var(--surface-2)",
							stroke: inSel ? "var(--accent-2)" : "var(--border)",
							strokeWidth: inSel ? 2 : 1
						}), /* @__PURE__ */ jsx("text", {
							x: x + cw / 2,
							y: y + 20,
							textAnchor: "middle",
							fontSize: "13",
							className: "mono",
							fill: inSel ? "var(--accent-1)" : "var(--text-3)",
							children: k + 1
						})] }, `t${k}`);
					}),
					/* @__PURE__ */ jsxs("text", {
						x: padX,
						y: H - 46,
						fontSize: "11",
						fill: "var(--text-3)",
						children: [
							"中序序列（固定 1…",
							n,
							"）"
						]
					})
				]
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "stb__readout",
			children: selNode ? /* @__PURE__ */ jsxs(Fragment, { children: [
				"选中",
				/* @__PURE__ */ jsxs("b", { children: ["节点 ", selNode.id] }),
				"：它这棵子树覆盖中序区间",
				" ",
				/* @__PURE__ */ jsxs("b", {
					className: "stb__pre",
					children: [
						"[",
						selNode.lo,
						", ",
						selNode.hi,
						"]"
					]
				}),
				"，子树加分 dp[",
				selNode.lo,
				"][",
				selNode.hi,
				"] = ",
				/* @__PURE__ */ jsx("b", {
					className: "stb__ans",
					children: selNode.subScore
				}),
				"。",
				selNode.lo === selNode.hi ? "（叶子：区间只含它自己）" : `左子树 = 区间左半、右子树 = 区间右半——${selNode.id} 号把区间劈成两段。`
			] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
				"点一个节点看它对应的连续区间。整棵树 = 区间 [1, ",
				n,
				"]，其根 = 节点 ",
				res.preorder[0],
				"（前序第一个）。"
			] })
		})
	] });
}
//#endregion
//#region src/content/c/ScoreTreeArt.tsx
function InorderRootFigure() {
	const vals = [
		5,
		7,
		1,
		2,
		10
	];
	const x0 = 46;
	const dx = 92;
	const bw = 66;
	const kRoot = 2;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 208",
		role: "img",
		"aria-label": "中序序列固定，选一个节点作根，序列劈成左右两半",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "ir-ar",
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
			vals.map((v, i) => {
				const isRoot = i === kRoot;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x0 + i * dx},34)`,
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: bw,
							height: "64",
							rx: "12",
							fill: isRoot ? "var(--grad-accent)" : "var(--surface-3)",
							stroke: isRoot ? "var(--accent-2)" : "var(--border-strong)",
							strokeWidth: isRoot ? 2.5 : 1.5
						}),
						/* @__PURE__ */ jsxs("text", {
							x: bw / 2,
							y: "26",
							textAnchor: "middle",
							fontSize: "12",
							fill: isRoot ? "var(--text-on-accent)" : "var(--text-2)",
							children: ["节点 ", i + 1]
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "50",
							textAnchor: "middle",
							fontSize: "17",
							className: "mono",
							fill: isRoot ? "var(--text-on-accent)" : "var(--accent-1)",
							children: v
						})
					]
				}, i);
			}),
			/* @__PURE__ */ jsx("text", {
				x: 276 - dx / 2,
				y: "20",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-3)",
				children: "中序遍历固定为 1 … 5（左根右）"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M 263 104 V 122`,
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				markerEnd: "url(#ir-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 263,
				y: "140",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--accent-1)",
				children: "选它作根"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M ${x0} 158 Q ${x0} 168 56 168 L 216 168 Q 226 168 226 158`,
				fill: "none",
				stroke: "var(--viz-chosen)",
				strokeWidth: "1.8"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 138,
				y: "192",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--viz-chosen)",
				children: "左半 → 左子树"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M 326 158 Q 326 168 336 168 L ${x0 + vals.length * dx - 26 - 10} 168 Q ${x0 + vals.length * dx - 26} 168 ${x0 + vals.length * dx - 26} 158`,
				fill: "none",
				stroke: "var(--viz-chosen)",
				strokeWidth: "1.8"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 395,
				y: "192",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--viz-chosen)",
				children: "右半 → 右子树"
			})
		]
	});
}
function IntervalSubtreeFigure() {
	const x0 = 32;
	const dx = 60;
	const bw = 44;
	const n = 5;
	const lo = 2;
	const hi = 4;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 600 224",
		role: "img",
		"aria-label": "一段连续的中序区间恰好对应二叉树的一棵子树",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "ist-ar",
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
				x: "150",
				y: "20",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "中序序列上一段连续区间"
			}),
			Array.from({ length: n }, (_, k) => {
				const inSel = k + 1 >= lo && k + 1 <= hi;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x0 + k * dx},36)`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: bw,
						height: "40",
						rx: "9",
						fill: inSel ? "color-mix(in srgb, var(--accent-1) 20%, var(--surface-3))" : "var(--surface-2)",
						stroke: inSel ? "var(--accent-2)" : "var(--border)",
						strokeWidth: inSel ? 2 : 1
					}), /* @__PURE__ */ jsx("text", {
						x: bw / 2,
						y: "26",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: inSel ? "var(--accent-1)" : "var(--text-3)",
						children: k + 1
					})]
				}, k);
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M 92 84 Q 92 94 102 94 L 246 94 Q 256 94 256 84`,
				fill: "none",
				stroke: "var(--accent-2)",
				strokeWidth: "1.8"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 174,
				y: "112",
				textAnchor: "middle",
				fontSize: "13",
				className: "mono",
				fill: "var(--accent-1)",
				children: "区间 [2, 4]"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "150",
				y: "168",
				textAnchor: "middle",
				fontSize: "26",
				fill: "var(--accent-2)",
				children: "⇕"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "150",
				y: "200",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "就是这一棵子树"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(360,0)",
				children: [
					/* @__PURE__ */ jsx("text", {
						x: "110",
						y: "20",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "[2,4] 的一种二叉子树"
					}),
					/* @__PURE__ */ jsx("line", {
						x1: "110",
						y1: "58",
						x2: "60",
						y2: "112",
						stroke: "var(--accent-2)",
						strokeWidth: "2"
					}),
					/* @__PURE__ */ jsx("line", {
						x1: "110",
						y1: "58",
						x2: "160",
						y2: "112",
						stroke: "var(--accent-2)",
						strokeWidth: "2"
					}),
					/* @__PURE__ */ jsx("line", {
						x1: "160",
						y1: "130",
						x2: "200",
						y2: "176",
						stroke: "var(--accent-2)",
						strokeWidth: "2"
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(110,42)",
						children: [/* @__PURE__ */ jsx("circle", {
							r: "18",
							fill: "var(--grad-accent)",
							stroke: "var(--accent-2)",
							strokeWidth: "2"
						}), /* @__PURE__ */ jsx("text", {
							y: "5",
							textAnchor: "middle",
							fontSize: "14",
							fontWeight: "700",
							fill: "var(--text-on-accent)",
							children: "3"
						})]
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(60,130)",
						children: [/* @__PURE__ */ jsx("circle", {
							r: "18",
							fill: "color-mix(in srgb, var(--accent-1) 18%, var(--surface-3))",
							stroke: "var(--accent-2)",
							strokeWidth: "1.8"
						}), /* @__PURE__ */ jsx("text", {
							y: "5",
							textAnchor: "middle",
							fontSize: "14",
							fontWeight: "700",
							fill: "var(--text-1)",
							children: "2"
						})]
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(160,130)",
						children: [/* @__PURE__ */ jsx("circle", {
							r: "18",
							fill: "color-mix(in srgb, var(--accent-1) 18%, var(--surface-3))",
							stroke: "var(--accent-2)",
							strokeWidth: "1.8"
						}), /* @__PURE__ */ jsx("text", {
							y: "5",
							textAnchor: "middle",
							fontSize: "14",
							fontWeight: "700",
							fill: "var(--text-1)",
							children: "4"
						})]
					}),
					/* @__PURE__ */ jsx("text", {
						x: "60",
						y: "170",
						textAnchor: "middle",
						fontSize: "10.5",
						fill: "var(--text-3)",
						children: "左"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "176",
						y: "150",
						textAnchor: "middle",
						fontSize: "10.5",
						fill: "var(--text-3)",
						children: "右"
					})
				]
			})
		]
	});
}
function ScoreTransFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 260",
		role: "img",
		"aria-label": "枚举根的转移：左子树乘右子树加根分数，空子树记 1",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "sc-ar",
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
						children: "区间 [i, j] 建成一棵子树"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "38",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[i][j] = ?"
					})
				]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "310",
				y: "74",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "枚举根 k：左半 [i,k−1] 作左子树，右半 [k+1,j] 作右子树"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M280 84 L180 118",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#sc-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M340 84 L452 118",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#sc-ar)"
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
						children: "左子树 [i, k−1] 的最大加分"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "112",
						y: "45",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[i][k−1]（空则记 1）"
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
						children: "右子树 [k+1, j] 的最大加分"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "112",
						y: "45",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[k+1][j]（空则记 1）"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M180 178 L300 214",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#sc-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M456 178 L340 214",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#sc-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(146,216)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "328",
					height: "44",
					rx: "14",
					fill: "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: "164",
					y: "28",
					textAnchor: "middle",
					fontSize: "13.5",
					className: "mono",
					fill: "var(--text-1)",
					children: "dp[i][k−1] × dp[k+1][j] + score[k]"
				})]
			})
		]
	});
}
//#endregion
//#region src/content/c/ScoreTree.tsx
var CODE_P1040 = `
#include <iostream>
using namespace std;

const int N = 35;
int n;
long long score[N];              // 每个节点的分数（按中序 1..n 排）
long long dp[N][N];              // dp[i][j] = 区间[i,j]建成一棵子树的最大加分
int root[N][N];                  // root[i][j] = 取到最优时选的根，供前序回溯

// 前序遍历输出最优树：根 → 左子树 → 右子树
void preorder(int i, int j)
{
    if (i > j) return;           // 空子树，什么都不输出
    int k = root[i][j];          // 这段区间的最优根
    cout << k << " ";
    preorder(i, k - 1);          // 左子树 = 区间左半
    preorder(k + 1, j);          // 右子树 = 区间右半
}

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> score[i];

    for (int i = 1; i <= n; i++) // 区间长度 1：单节点自成子树
    {
        dp[i][i] = score[i];
        root[i][i] = i;
    }

    for (int len = 2; len <= n; len++)              // ★外层枚举区间长度，由短到长
        for (int i = 1; i + len - 1 <= n; i++)
        {
            int j = i + len - 1;
            for (int k = i; k <= j; k++)            // 枚举根 k
            {
                // 空子树（k 在端点）的加分记 1：越界即视作 1
                long long lft = (k - 1 >= i) ? dp[i][k - 1] : 1;
                long long rgt = (k + 1 <= j) ? dp[k + 1][j] : 1;
                long long cur = lft * rgt + score[k];
                if (cur > dp[i][j])                 // 取最大，并记下根（相等取更小 k：不覆盖即最小）
                {
                    dp[i][j] = cur;
                    root[i][j] = k;
                }
            }
        }

    cout << dp[1][n] << endl;    // 第一问：最大加分
    preorder(1, n);              // 第二问：最优树的前序遍历
    cout << endl;
    return 0;
}`;
var CODE_P1880 = `
#include <iostream>
using namespace std;

const int INF = 0x3f3f3f3f;
int n;
int a[205];                      // 断环为链：复制一倍成 2n
int pre[205];                    // 前缀和，sum(l..r) = pre[r] - pre[l-1]
int f[205][205];                 // 最小合并代价
int g[205][205];                 // 最大合并代价

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        a[i + n] = a[i];         // 复制一倍
    }
    for (int i = 1; i <= 2 * n; i++)
        pre[i] = pre[i - 1] + a[i];

    for (int len = 2; len <= n; len++)              // 长度只到 n（一圈）
        for (int l = 1; l + len - 1 <= 2 * n; l++)
        {
            int r = l + len - 1;
            int s = pre[r] - pre[l - 1];            // 本区间合并代价 = 区间和
            f[l][r] = INF;
            g[l][r] = -INF;
            for (int k = l; k <= r - 1; k++)        // ★枚举分割点 k（对照：加分树枚举根）
            {
                f[l][r] = min(f[l][r], f[l][k] + f[k + 1][r] + s);
                g[l][r] = max(g[l][r], g[l][k] + g[k + 1][r] + s);
            }
        }

    int mn = INF, mx = -INF;
    for (int l = 1; l <= n; l++)                    // 枚举起点，取所有长度为 n 的窗口
    {
        mn = min(mn, f[l][l + n - 1]);
        mx = max(mx, g[l][l + n - 1]);
    }
    cout << mn << endl << mx << endl;
    return 0;
}`;
function ScoreTree() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "加分二叉树：中序固定，怎么建最划算"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"换一个和石子合并",
							/* @__PURE__ */ jsx("strong", { children: "神似" }),
							"、却长着「树」外壳的问题。给 ",
							/* @__PURE__ */ jsx("strong", { children: "5 个节点" }),
							"，分数依次是 ",
							/* @__PURE__ */ jsx(M, { children: "5,\\ 7,\\ 1,\\ 2,\\ 10" }),
							"。 要把它们建成一棵",
							/* @__PURE__ */ jsx("strong", { children: "二叉树" }),
							"，唯一约束是：",
							/* @__PURE__ */ jsxs("strong", { children: ["中序遍历必须恰好是 ", /* @__PURE__ */ jsx(M, { children: "1,2,3,4,5" })] }),
							"（即节点编号 = 它在中序里的位置）。一棵子树的",
							/* @__PURE__ */ jsx("strong", { children: "加分" }),
							"这样算——记",
							/* @__PURE__ */ jsx("strong", { children: "左子树加分" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "L" }),
							"、",
							/* @__PURE__ */ jsx("strong", { children: "右子树加分" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "R" }),
							"、",
							/* @__PURE__ */ jsx("strong", { children: "根分数" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "s" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\text{score}_{\\text{tree}}=L\\times R+s" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"并约定",
							/* @__PURE__ */ jsxs("strong", { children: ["空子树的加分为 ", /* @__PURE__ */ jsx(M, { children: "1" })] }),
							"（乘法里的单位元，不改变乘积）。不同的建树方式，总加分不同——问",
							/* @__PURE__ */ jsx("strong", { children: "整棵树能拿到的最大加分" }),
							"，还要",
							/* @__PURE__ */ jsx("strong", { children: "输出这棵最优树的前序遍历" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(InorderRootFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"中序固定为 1…5。任选一个节点当根（图中选了节点 3）——它",
							/* @__PURE__ */ jsx("strong", { children: "左边" }),
							"的节点全落进左子树、",
							/* @__PURE__ */ jsx("strong", { children: "右边" }),
							"的全落进右子树。这就是「枚举根」。"
						]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"为什么这题绕不开区间？关键在",
						/* @__PURE__ */ jsx("strong", { children: "中序被钉死" }),
						"了。二叉树的中序是「左 → 根 → 右」，所以一旦某个节点 ",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						" 当了",
						/* @__PURE__ */ jsx("strong", { children: "根" }),
						"，中序里",
						/* @__PURE__ */ jsx("strong", { children: "排在它前面" }),
						"的节点必然全在",
						/* @__PURE__ */ jsx("strong", { children: "左子树" }),
						"、",
						/* @__PURE__ */ jsx("strong", { children: "排在它后面" }),
						"的全在",
						/* @__PURE__ */ jsx("strong", { children: "右子树" }),
						"——绝不会交叉。于是「以 ",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						" 为根」就把连续的一段编号 ",
						/* @__PURE__ */ jsx(M, { children: "[i,j]" }),
						" ",
						/* @__PURE__ */ jsx("strong", { children: "干净地劈成两段" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "[i,k-1]" }),
						" 与 ",
						/* @__PURE__ */ jsx(M, { children: "[k+1,j]" }),
						"，各自又是一棵",
						/* @__PURE__ */ jsx("strong", { children: "更小的子树" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(IntervalSubtreeFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "一段连续区间 [i,j] ↔ 一棵子树：钦定根 k 后，[i,k−1] 成左子树、[k+1,j] 成右子树——区间的「劈分」正是树的「拆解」，这就是「区间即子树」。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"要枚举",
						/* @__PURE__ */ jsx("strong", { children: "所有" }),
						"合法二叉树？其数量是",
						/* @__PURE__ */ jsx("strong", { children: "卡特兰数" }),
						"，随 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 指数爆炸，不可行。但上面那句「一段连续区间恰好是一棵子树」已经把出路点明——这正是区间 DP 的入口，和石子合并同一个模子。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：枚举根，左右子树相乘"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
						"设 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
						" 表示：把中序编号 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 到 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 这段",
						/* @__PURE__ */ jsx("strong", { children: "连续区间" }),
						"建成",
						/* @__PURE__ */ jsx("strong", { children: "一棵子树" }),
						"能拿到的",
						/* @__PURE__ */ jsx("strong", { children: "最大加分" }),
						"。 要把 ",
						/* @__PURE__ */ jsx(M, { children: "[i,j]" }),
						" 建成子树，必须先",
						/* @__PURE__ */ jsx("strong", { children: "钦定它的根" }),
						"——设根是 ",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "i\\le k\\le j" }),
						"），则左子树是区间 ",
						/* @__PURE__ */ jsx(M, { children: "[i,k-1]" }),
						"、右子树是 ",
						/* @__PURE__ */ jsx(M, { children: "[k+1,j]" }),
						"，两者都是",
						/* @__PURE__ */ jsx("strong", { children: "更短的、已解的子区间" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(ScoreTransFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "dp[i][j] 枚举根 k：左子树取 dp[i][k−1]、右子树取 dp[k+1][j]（任一为空则记 1），二者相乘再加上根分数 score[k]。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"按加分定义，以 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							" 为根时这棵子树的加分是 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i][k-1]\\times dp[k+1][j]+\\mathrm{score}[k]" }),
							"。哪个根最好？",
							/* @__PURE__ */ jsxs("strong", { children: [
								"把每个 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 都试一遍，取最大"
							] }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i][j]=\\max_{i\\le k\\le j}\\big(dp[i][k-1]\\times dp[k+1][j]\\big)+\\mathrm{score}[k]" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"这里 ",
							/* @__PURE__ */ jsx(M, { children: "i>j" }),
							" 的",
							/* @__PURE__ */ jsx("strong", { children: "空区间" }),
							"（当 ",
							/* @__PURE__ */ jsx(M, { children: "k=i" }),
							" 时左子树 ",
							/* @__PURE__ */ jsx(M, { children: "[i,i-1]" }),
							" 就是空、",
							/* @__PURE__ */ jsx(M, { children: "k=j" }),
							" 时右子树为空）约定 ",
							/* @__PURE__ */ jsx(M, { children: "dp=1" }),
							"：空子树没有节点，乘上 ",
							/* @__PURE__ */ jsx(M, { children: "1" }),
							" 不改变乘积。 边界：",
							/* @__PURE__ */ jsx(M, { children: "dp[i][i]=\\mathrm{score}[i]" }),
							"（单节点自成一棵子树）。答案：",
							/* @__PURE__ */ jsx(M, { children: "dp[1][n]" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"和石子合并一样，",
							/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
							" 依赖的都是",
							/* @__PURE__ */ jsx("strong", { children: "更短的子区间" }),
							"，所以递推必须",
							/* @__PURE__ */ jsx("strong", { children: "按区间长度由短到长" }),
							"——短子树先算好，长区间枚举根时才有得引用。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质：区间就是子树，分割点就是根",
					children: [
						"区间 DP 的同一套骨架，在这里换了层皮：石子合并",
						/* @__PURE__ */ jsx("strong", { children: "枚举分割点" }),
						"把区间拆成左右两段",
						/* @__PURE__ */ jsx("strong", { children: "相加" }),
						"；加分二叉树",
						/* @__PURE__ */ jsx("strong", { children: "枚举根" }),
						"把区间拆成左右两棵子树",
						/* @__PURE__ */ jsx("strong", { children: "相乘再加根分" }),
						"。一句话对上号——",
						/* @__PURE__ */ jsx("strong", { children: "「一段连续区间 ⇔ 一棵子树；区间里选的那个分割点/根 ⇔ 子树的根」" }),
						"。认出这层对应，就把「建树」这件看似要枚举卡特兰数棵树的事，压成了 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 张三角表格、每格 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						" 枚举根。"
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
						"用开头的例子（分数 ",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{score}=[5,7,1,2,10]" }),
						"，中序编号 ",
						/* @__PURE__ */ jsx(M, { children: "1..5" }),
						"）走几步，重点盯住",
						/* @__PURE__ */ jsx("strong", { children: "长度由短到长" }),
						"、以及",
						/* @__PURE__ */ jsx("strong", { children: "空子树记 1" }),
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
									" 每个节点自成一棵子树：",
									/* @__PURE__ */ jsx(M, { children: "dp[i][i]=\\mathrm{score}[i]" }),
									"，即 ",
									/* @__PURE__ */ jsx(M, { children: "5,7,1,2,10" }),
									"。这是三角表的地基。"
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
									"，看 ",
									/* @__PURE__ */ jsx(M, { children: "[1,2]" }),
									"（分数 ",
									/* @__PURE__ */ jsx(M, { children: "5,7" }),
									"）：根取 ",
									/* @__PURE__ */ jsx(M, { children: "1" }),
									" → 左空 ",
									/* @__PURE__ */ jsx(M, { children: "1" }),
									"、右 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][2]=7" }),
									"，加分 ",
									/* @__PURE__ */ jsx(M, { children: "1\\times7+5=12" }),
									"；根取 ",
									/* @__PURE__ */ jsx(M, { children: "2" }),
									" → 左 ",
									/* @__PURE__ */ jsx(M, { children: "5" }),
									"、右空 ",
									/* @__PURE__ */ jsx(M, { children: "1" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "5\\times1+7=12" }),
									"。两者都 ",
									/* @__PURE__ */ jsx(M, { children: "12" }),
									"，取 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][2]=12" }),
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
									"（分数 ",
									/* @__PURE__ */ jsx(M, { children: "5,7,1" }),
									"，已知 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][3]=8" }),
									"）：根 ",
									/* @__PURE__ */ jsx(M, { children: "1" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "1\\times dp[2][3]+5=1\\times8+5=13" }),
									"；根 ",
									/* @__PURE__ */ jsx(M, { children: "2" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][1]\\times dp[3][3]+7=5\\times1+7=12" }),
									"；根 ",
									/* @__PURE__ */ jsx(M, { children: "3" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][2]\\times1+1=12\\times1+1=13" }),
									"。最大是 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][3]=13" }),
									"；根 ",
									/* @__PURE__ */ jsx(M, { children: "1" }),
									" 与根 ",
									/* @__PURE__ */ jsx(M, { children: "3" }),
									" 打平，按字典序最小取",
									/* @__PURE__ */ jsx("strong", { children: "根 = 节点 1" }),
									"（详见后文坑）。"
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
									/* @__PURE__ */ jsx("b", { children: "长度 5" }),
									"，整段 ",
									/* @__PURE__ */ jsx(M, { children: "[1,5]" }),
									"：逐个试根，根 = 节点 ",
									/* @__PURE__ */ jsx(M, { children: "3" }),
									" 时 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][2]\\times dp[4][5]+1=12\\times12+1=145" }),
									" 胜出——",
									/* @__PURE__ */ jsx(M, { children: "dp[1][5]=145" }),
									"，正是最大加分。别被「节点 3 分数只有 1」骗到：",
									/* @__PURE__ */ jsx("strong", { children: "乘法结构" }),
									"让它当根反而把左右两个 ",
									/* @__PURE__ */ jsx(M, { children: "12" }),
									" 撑成了 ",
									/* @__PURE__ */ jsx(M, { children: "144" }),
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
						"下面的演示把三角表",
						/* @__PURE__ */ jsx("strong", { children: "按长度一层层填满" }),
						"，高亮每个 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
						" 选中的根 ",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						" 及左右子树来源。改改分数，看最优根如何随之跳动。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "看三角表一层一层长出来 · 枚举根、左右相乘"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(ScoreTreeDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"表是个",
						/* @__PURE__ */ jsx("strong", { children: "上三角" }),
						"（只有 ",
						/* @__PURE__ */ jsx(M, { children: "i\\le j" }),
						" 才是合法区间）。填表",
						/* @__PURE__ */ jsxs("strong", { children: [
							"外层枚举长度 ",
							/* @__PURE__ */ jsx(M, { children: "\\mathrm{len}=2\\ldots n" }),
							"、内层枚举左端点 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							"、最内枚举根 ",
							/* @__PURE__ */ jsx(M, { children: "k" })
						] }),
						"——三层循环、外层是长度，和几乎所有区间 DP 一个骨架。约 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 个区间、每个枚举 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						" 个根，总复杂度 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
						"。加分二叉树的 ",
						/* @__PURE__ */ jsx(M, { children: "n\\le 30" }),
						"，轻松通过。中文伪代码："
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
						children: `for 长度 len = 2 … n:            // ★外层枚举区间长度，由短到长
  for 左端点 i = 1 … n-len+1:
    j = i + len - 1
    for 根 k = i … j:            // 枚举区间 [i,j] 的根
      左 = (k>i) ? dp[i][k-1] : 1   // 空子树记 1
      右 = (k<j) ? dp[k+1][j] : 1
      若 左*右 + score[k] 更大:
        dp[i][j] = 左*右 + score[k]
        root[i][j] = k           // 记下根，供前序回溯`
					})]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化：从 root 表前序回溯出整棵树"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"光有最大加分还不够，本题第二问要",
							/* @__PURE__ */ jsx("strong", { children: "输出最优树的前序遍历" }),
							"。诀窍是在填表时",
							/* @__PURE__ */ jsx("strong", { children: "顺手记下每个区间选的根" }),
							"：转移取到最优的那个 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							"，存进 ",
							/* @__PURE__ */ jsx(M, { children: "\\mathrm{root}[i][j]" }),
							"。等整张表填完，从",
							/* @__PURE__ */ jsxs("strong", { children: [
								"整区间 ",
								/* @__PURE__ */ jsx(M, { children: "[1,n]" }),
								" 出发递归"
							] }),
							"就能把树还原——先",
							/* @__PURE__ */ jsx("strong", { children: "输出根" }),
							"、再",
							/* @__PURE__ */ jsx("strong", { children: "递归左子树" }),
							"、再",
							/* @__PURE__ */ jsx("strong", { children: "递归右子树" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\mathrm{pre}(i,j):\\ k=\\mathrm{root}[i][j];\\ \\text{emit }k;\\ \\mathrm{pre}(i,k-1);\\ \\mathrm{pre}(k+1,j)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"先输出根 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							"、再递归左子树 ",
							/* @__PURE__ */ jsx(M, { children: "[i,k-1]" }),
							"、再递归右子树 ",
							/* @__PURE__ */ jsx(M, { children: "[k+1,j]" }),
							"——这正是",
							/* @__PURE__ */ jsx("strong", { children: "前序遍历（根 → 左 → 右）" }),
							"的定义。空区间 ",
							/* @__PURE__ */ jsx(M, { children: "i>j" }),
							" 直接返回、什么都不输出。 这套",
							/* @__PURE__ */ jsx("strong", { children: "「记录决策 + 回溯还原方案」" }),
							"和石子合并",
							/* @__PURE__ */ jsx("strong", { children: "枚举分割点" }),
							"是同一路数：石子那里若要还原",
							/* @__PURE__ */ jsx("strong", { children: "合并顺序" }),
							"，也照样存 ",
							/* @__PURE__ */ jsx(M, { children: "root[l][r]=" }),
							" 最优分割点、再递归左右段。区别仅在——加分树记的是",
							/* @__PURE__ */ jsx("strong", { children: "根" }),
							"、还原出的是",
							/* @__PURE__ */ jsx("strong", { children: "树结构" }),
							"；石子记的是",
							/* @__PURE__ */ jsx("strong", { children: "分割点" }),
							"、还原出的是",
							/* @__PURE__ */ jsx("strong", { children: "合并树" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面把 ",
						/* @__PURE__ */ jsx(M, { children: "root[i][j]" }),
						" 前序回溯出的",
						/* @__PURE__ */ jsx("strong", { children: "最优树" }),
						"画出来。",
						/* @__PURE__ */ jsx("strong", { children: "点任意节点" }),
						"，看它这棵子树",
						/* @__PURE__ */ jsx("strong", { children: "对应中序上哪一段连续区间" }),
						"——「区间即子树」一目了然。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "建树演示：区间 ⇔ 子树"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(ScoreTreeBuildDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "两个常见坑：空子树的 1，和相等时记哪个根",
					children: [
						"其一，",
						/* @__PURE__ */ jsxs("strong", { children: [
							"空子树加分是 ",
							/* @__PURE__ */ jsx(M, { children: "1" }),
							" 不是 ",
							/* @__PURE__ */ jsx(M, { children: "0" })
						] }),
						"——它进的是",
						/* @__PURE__ */ jsx("strong", { children: "乘法" }),
						"，记 0 会把整棵子树的加分抹成 0。写代码时用「越界即取 1」处理端点根（",
						/* @__PURE__ */ jsx(M, { children: "k=i" }),
						" 或 ",
						/* @__PURE__ */ jsx(M, { children: "k=j" }),
						"）。 其二，本题",
						/* @__PURE__ */ jsx("strong", { children: "前序遍历不唯一时要求字典序最小" }),
						"：枚举 ",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						" 从小到大、且转移用",
						/* @__PURE__ */ jsx("strong", { children: "严格大于" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: ">" }),
						" 才更新，就能让相等时",
						/* @__PURE__ */ jsx("strong", { children: "保留更小的根" }),
						"——更小的根当前序第一个，字典序自然更小。"
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
					pid: "P1040",
					name: "[NOIP2003 提高组] 加分二叉树",
					src: "NOIP2003 提高组",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个节点中序为 ",
								/* @__PURE__ */ jsx(M, { children: "1..n" }),
								"，各带分数。子树加分 = 左子树加分 ",
								/* @__PURE__ */ jsx(M, { children: "\\times" }),
								" 右子树加分 ",
								/* @__PURE__ */ jsx(M, { children: "+" }),
								" 根分数，空树记 ",
								/* @__PURE__ */ jsx(M, { children: "1" }),
								"。求整棵树",
								/* @__PURE__ */ jsx("strong", { children: "最大加分" }),
								"，并输出",
								/* @__PURE__ */ jsx("strong", { children: "最优树的前序遍历" }),
								"（多解取字典序最小）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它（本类型黄金范例）",
							children: [
								"它是「枚举根区间 DP」最纯正的范本，且把",
								/* @__PURE__ */ jsx("strong", { children: "方案回溯" }),
								"逼到台前：不仅要 ",
								/* @__PURE__ */ jsx(M, { children: "dp[1][n]" }),
								"，还要",
								/* @__PURE__ */ jsx("strong", { children: "还原整棵树" }),
								"——必须在转移时记 ",
								/* @__PURE__ */ jsx(M, { children: "root[i][j]" }),
								"、事后前序递归。一题吃透",
								/* @__PURE__ */ jsx("strong", { children: "「区间即子树 + 记录决策回溯」" }),
								"两件事。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "dp[i][j]=\\max_k(dp[i][k-1]\\cdot dp[k+1][j])+\\mathrm{score}[k]" }),
								"，空区间记 ",
								/* @__PURE__ */ jsx(M, { children: "1" }),
								"；外层长度、内层左端点、最内根；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "n\\le 30" }),
								"。分数乘积可能很大，",
								/* @__PURE__ */ jsxs("strong", { children: ["用 ", /* @__PURE__ */ jsx(M, { children: "\\texttt{long long}" })] }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（含前序回溯 · ShanireZ 风）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1040,
								luogu: "P1040"
							})
						})
					]
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
							k: "为什么放这里（同构对照）",
							children: [
								"拿它和加分二叉树",
								/* @__PURE__ */ jsx("strong", { children: "并置" }),
								"，是为了看清两者是",
								/* @__PURE__ */ jsx("strong", { children: "同一个区间 DP" }),
								"：石子",
								/* @__PURE__ */ jsxs("strong", { children: ["枚举分割点 ", /* @__PURE__ */ jsx(M, { children: "k" })] }),
								"、把 ",
								/* @__PURE__ */ jsx(M, { children: "[l,r]" }),
								" 拆成 ",
								/* @__PURE__ */ jsx(M, { children: "[l,k]" }),
								" 与 ",
								/* @__PURE__ */ jsx(M, { children: "[k+1,r]" }),
								" 两段",
								/* @__PURE__ */ jsx("strong", { children: "相加" }),
								"再补区间和；加分树",
								/* @__PURE__ */ jsxs("strong", { children: ["枚举根 ", /* @__PURE__ */ jsx(M, { children: "k" })] }),
								"、把 ",
								/* @__PURE__ */ jsx(M, { children: "[i,j]" }),
								" 拆成 ",
								/* @__PURE__ */ jsx(M, { children: "[i,k-1]" }),
								" 与 ",
								/* @__PURE__ */ jsx(M, { children: "[k+1,j]" }),
								" 两棵子树",
								/* @__PURE__ */ jsx("strong", { children: "相乘" }),
								"再补根分。",
								/* @__PURE__ */ jsx("strong", { children: "枚举根 ↔ 枚举分割点" }),
								"，一层皮之隔。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f/g[l][r]=\\mathrm{opt}(f/g[l][k]+f/g[k+1][r])+\\mathrm{sum}(l,r)" }),
								"；断环为链（复制一倍成 ",
								/* @__PURE__ */ jsx(M, { children: "2n" }),
								"）后取所有长度 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 的窗口；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
								"。详见 ",
								/* @__PURE__ */ jsx(Link, {
									to: "/part/c/stone",
									style: { color: "var(--accent-2)" },
									children: "石子合并（链形）"
								}),
								"一节。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（断环为链 · 双问并行）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1880,
								luogu: "P1880"
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
					pid: "P1436",
					name: "棋盘分割",
					hint: "二维区间递归分割：把棋盘沿横或竖线切成两块，递归下去，求分割成 n 块后各块总分平方和的最小值。状态 dp[次数][x1][y1][x2][y2] 记子矩形，转移枚举每条横/竖切割线——是「枚举分割点」在二维矩形上的推广，记忆化搜索最省事。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1043",
					name: "[NOIP2003 普及组] 数字游戏",
					hint: "环形 + 区间划分 DP：数字排成环，切成 m 段求各段和取模再相乘的最大/最小。断环为链后，dp[l][r][k] 记「区间 [l,r] 分成 k 段」的最优，转移枚举最后一段的分割点。取模后可能为负，求最小值时别漏「负负得正」。与加分树同为『区间上枚举一个分界并合并』的区间 DP。"
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "prose",
					style: {
						maxWidth: "none",
						fontSize: "13px",
						color: "var(--text-3)",
						marginTop: "var(--sp-3)"
					},
					children: [
						"小字说明：洛谷上与「加分二叉树」",
						/* @__PURE__ */ jsx("strong", { children: "完全同型" }),
						"（中序固定 + 枚举根 + 乘法加分 + 前序回溯）的原生题目较少，P1040 本身即该型的代表与压卷题。上面两题都是",
						/* @__PURE__ */ jsx("strong", { children: "更广义的「区间上枚举分界」区间 DP" }),
						"——一个把分割推到二维矩形、一个叠加「分成 k 段」的维度，用来巩固「枚举分割/根 + 按区间递推」的通用手感，而非同题换皮。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pointer-cue",
			children: [
				/* @__PURE__ */ jsx(Gamepad2, { size: 18 }),
				"想亲手感受「同一批分数、换个根，总加分差多少」？到 ",
				/* @__PURE__ */ jsx(Link, {
					to: "/part/c",
					style: {
						color: "var(--accent-1)",
						fontWeight: 600
					},
					children: "C 部分页"
				}),
				"的互动里挑一棵树，再对照 DP 给出的最优。"
			]
		})
	] });
}
//#endregion
export { ScoreTree as default };
