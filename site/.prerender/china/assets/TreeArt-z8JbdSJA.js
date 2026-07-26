import { a as recordTreeIndependentSet, c as recordTreeMaxSubtreeChain, i as recordTreeDominatingSet, n as layoutRootedTree, o as recordTreeJointWeight, s as recordTreeKnapsack, t as buildRootedTree } from "./tree-dp-PvQdSlXM.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/treedp/treedpSolver.ts
function buildTree(parent, weight) {
	return buildRootedTree(parent, weight);
}
function layoutTree(tree) {
	return layoutRootedTree(tree);
}
function solveIndepSet(tree) {
	const run = recordTreeIndependentSet(tree);
	const steps = run.events.map((event) => ({
		u: event.node,
		dp0: event.dp0,
		dp1: event.dp1,
		settled: [...event.settled],
		leaf: event.leaf,
		caption: event.leaf ? `叶子 <b>${event.node + 1}</b>：不选为 <b>0</b>，选择为点权 <b>${event.dp1}</b>。` : `节点 <b>${event.node + 1}</b> 合并孩子：不选得 <b>${event.dp0}</b>，选择得 <b>${event.dp1}</b>。`
	}));
	return {
		...run.result,
		steps
	};
}
function solveDominatingSet(tree) {
	const run = recordTreeDominatingSet(tree);
	const steps = run.events.map((event) => ({
		u: event.node,
		d0: event.d0,
		d1: event.d1,
		d2: event.d2,
		settled: [...event.settled],
		leaf: event.leaf,
		caption: event.leaf ? `叶子 <b>${event.node + 1}</b>：放警卫 d0=<b>${event.d0}</b>，靠孩子覆盖不可行，等父亲 d2=<b>0</b>。` : `节点 <b>${event.node + 1}</b>：放警卫 d0=<b>${event.d0}</b>，靠孩子 d1=<b>${event.d1}</b>，等父亲 d2=<b>${event.d2}</b>。`
	}));
	return {
		...run.result,
		steps
	};
}
function solveMaxSubtreeChain(tree) {
	const run = recordTreeMaxSubtreeChain(tree);
	const steps = run.events.map((event) => ({
		u: event.node,
		down: event.down,
		best1: event.best1,
		best2: event.best2,
		through: event.through,
		settled: [...event.settled],
		caption: tree.children[event.node].length === 0 ? `叶子 <b>${event.node + 1}</b>：down=<b>${event.down}</b>，过点链=<b>${event.through}</b>。` : `节点 <b>${event.node + 1}</b> 接最大两条正贡献 ${event.best1}、${event.best2}：down=<b>${event.down}</b>，过点链=<b>${event.through}</b>。`
	}));
	return {
		...run.result,
		steps
	};
}
function solveTreeKnapsack(tree, parentEdge, edgeLimit) {
	return recordTreeKnapsack(tree, parentEdge, edgeLimit).result;
}
function solveJointWeight(tree) {
	return recordTreeJointWeight(tree).result;
}
//#endregion
//#region src/content/f/TreeArt.tsx
function Node({ x, y, label, accent = false, r = 20 }) {
	return /* @__PURE__ */ jsxs("g", {
		transform: `translate(${x},${y})`,
		children: [/* @__PURE__ */ jsx("circle", {
			r,
			fill: accent ? "color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))" : "var(--surface-3)",
			stroke: accent ? "var(--accent-2)" : "var(--border-strong)",
			strokeWidth: accent ? 2.2 : 1.5
		}), /* @__PURE__ */ jsx("text", {
			textAnchor: "middle",
			y: "5",
			fontSize: "14",
			fontWeight: "700",
			fill: "var(--text-1)",
			children: label
		})]
	});
}
function PostorderFigure() {
	const P = {
		"1": [300, 40],
		"2": [170, 130],
		"3": [430, 130],
		"4": [110, 220],
		"5": [230, 220]
	};
	const edges = [
		["1", "2"],
		["1", "3"],
		["2", "4"],
		["2", "5"]
	];
	const orderNo = {
		"4": 1,
		"5": 2,
		"2": 3,
		"3": 4,
		"1": 5
	};
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 268",
		role: "img",
		"aria-label": "后序遍历：孩子先于父亲被处理",
		children: [
			edges.map(([a, b], i) => /* @__PURE__ */ jsx("line", {
				x1: P[a][0],
				y1: P[a][1] + 20,
				x2: P[b][0],
				y2: P[b][1] - 20,
				stroke: "var(--border-strong)",
				strokeWidth: "1.6"
			}, i)),
			Object.entries(P).map(([k, [x, y]]) => /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx(Node, {
				x,
				y,
				label: k,
				accent: k === "1"
			}), /* @__PURE__ */ jsxs("g", {
				transform: `translate(${x + 22},${y - 20})`,
				children: [/* @__PURE__ */ jsx("circle", {
					r: "11",
					fill: "var(--grad-accent)"
				}), /* @__PURE__ */ jsx("text", {
					textAnchor: "middle",
					y: "4",
					fontSize: "11",
					fontWeight: "700",
					fill: "var(--text-on-accent)",
					children: orderNo[k]
				})]
			})] }, k)),
			/* @__PURE__ */ jsx("text", {
				x: "300",
				y: "258",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "金色序号 = 处理次序：叶子 4、5 先算好，父亲 2 才能合并；根 1 最后收口。"
			})
		]
	});
}
function IndepDecisionFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 600 300",
		role: "img",
		"aria-label": "选点 u 时 dp[u][0] 与 dp[u][1] 的分叉",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "fa-ar",
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
						width: "136",
						height: "46",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "68",
						y: "20",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "节点 u（权 w）"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "68",
						y: "38",
						textAnchor: "middle",
						fontSize: "13",
						className: "mono",
						fill: "var(--text-1)",
						children: "选它？"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M280 54 L150 96",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#fa-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M320 54 L470 96",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#fa-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "182",
				y: "82",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "不选 u"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "404",
				y: "82",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "选 u"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(30,100)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "240",
						height: "80",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "26",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "孩子自由：各取较大"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "52",
						textAnchor: "middle",
						fontSize: "13",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[u][0] ="
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "70",
						textAnchor: "middle",
						fontSize: "12.5",
						className: "mono",
						fill: "var(--accent-1)",
						children: "Σ max(dp[c][0], dp[c][1])"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(330,100)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "240",
						height: "80",
						rx: "12",
						fill: "color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))",
						stroke: "var(--viz-chosen)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "26",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "孩子必须全不选"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "52",
						textAnchor: "middle",
						fontSize: "13",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[u][1] = w +"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "70",
						textAnchor: "middle",
						fontSize: "12.5",
						className: "mono",
						fill: "var(--viz-chosen)",
						children: "Σ dp[c][0]"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M150 180 L280 232",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#fa-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M450 180 L320 232",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#fa-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(196,234)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "208",
					height: "50",
					rx: "13",
					fill: "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: "104",
					y: "30",
					textAnchor: "middle",
					fontSize: "13",
					className: "mono",
					fill: "var(--text-1)",
					children: "答案 = max(dp[root][0], dp[root][1])"
				})]
			})
		]
	});
}
function CoverContrastFigure() {
	const P = {
		"1": [130, 40],
		"2": [70, 130],
		"3": [190, 130],
		"4": [190, 218]
	};
	const edges = [
		["1", "2"],
		["1", "3"],
		["3", "4"]
	];
	const panel = (dx, title, picked, color) => /* @__PURE__ */ jsxs("g", {
		transform: `translate(${dx},0)`,
		children: [
			/* @__PURE__ */ jsx("text", {
				x: "130",
				y: "18",
				textAnchor: "middle",
				fontSize: "13",
				fontWeight: "600",
				fill: color,
				children: title
			}),
			edges.map(([a, b], i) => /* @__PURE__ */ jsx("line", {
				x1: P[a][0],
				y1: P[a][1] + 20,
				x2: P[b][0],
				y2: P[b][1] - 20,
				stroke: "var(--border-strong)",
				strokeWidth: "1.6"
			}, i)),
			Object.entries(P).map(([k, [x, y]]) => {
				const on = picked.includes(k);
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x},${y})`,
					children: [/* @__PURE__ */ jsx("circle", {
						r: "19",
						fill: on ? `color-mix(in srgb, ${color} 26%, var(--surface-3))` : "var(--surface-3)",
						stroke: on ? color : "var(--border-strong)",
						strokeWidth: on ? 2.4 : 1.5
					}), /* @__PURE__ */ jsx("text", {
						textAnchor: "middle",
						y: "5",
						fontSize: "13",
						fontWeight: "700",
						fill: "var(--text-1)",
						children: k
					})]
				}, k);
			})
		]
	});
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 268",
		role: "img",
		"aria-label": "同一棵树上的最大独立集与最小点覆盖互补",
		children: [
			panel(10, "最大独立集：选 {2,4}", ["2", "4"], "var(--viz-chosen)"),
			panel(290, "最小点覆盖：选 {1,3}", ["1", "3"], "var(--viz-source)"),
			/* @__PURE__ */ jsx("text", {
				x: "280",
				y: "258",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "选中集互为补集：独立集要「谁都不挨着」，点覆盖要「每条边至少一端被选」。"
			})
		]
	});
}
function ThreeStateFigure() {
	const cell = (x, color, tag, desc) => /* @__PURE__ */ jsxs("g", {
		transform: `translate(${x},20)`,
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "40",
				cy: "34",
				r: "24",
				fill: `color-mix(in srgb, ${color} 22%, var(--surface-3))`,
				stroke: color,
				strokeWidth: "2.2"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "40",
				y: "40",
				textAnchor: "middle",
				fontSize: "15",
				fontWeight: "700",
				fill: "var(--text-1)",
				children: "u"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "40",
				y: "82",
				textAnchor: "middle",
				fontSize: "12.5",
				fontWeight: "600",
				fill: color,
				children: tag
			}),
			/* @__PURE__ */ jsx("text", {
				x: "40",
				y: "102",
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--text-2)",
				children: desc
			})
		]
	});
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 150",
		role: "img",
		"aria-label": "支配集的三种状态",
		children: [
			cell(30, "var(--viz-chosen)", "dp0 · 放警卫", "自己 + 全部孩子被覆盖"),
			cell(220, "var(--viz-source)", "dp1 · 被孩子覆盖", "至少一个孩子放了警卫"),
			cell(410, "var(--viz-invalid)", "dp2 · 等父亲", "暂时没人覆盖它")
		]
	});
}
function DiameterFigure() {
	const P = {
		u: [280, 46],
		a: [160, 130],
		a2: [120, 214],
		b: [400, 130],
		b2: [440, 214],
		c: [280, 130]
	};
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 268",
		role: "img",
		"aria-label": "过某点的最长链由两条最深孩子链拼成",
		children: [
			/* @__PURE__ */ jsx("line", {
				x1: P.u[0],
				y1: P.u[1] + 20,
				x2: P.c[0],
				y2: P.c[1] - 20,
				stroke: "var(--border-strong)",
				strokeWidth: "1.6"
			}),
			[
				["u", "a"],
				["a", "a2"],
				["u", "b"],
				["b", "b2"]
			].map(([a, b], i) => /* @__PURE__ */ jsx("line", {
				x1: P[a][0],
				y1: P[a][1] + 20,
				x2: P[b][0],
				y2: P[b][1] - 20,
				stroke: "var(--viz-chosen)",
				strokeWidth: "3.4"
			}, i)),
			Object.entries(P).map(([k, [x, y]]) => {
				const onChain = k !== "c";
				const peak = k === "u";
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x},${y})`,
					children: [/* @__PURE__ */ jsx("circle", {
						r: "20",
						fill: peak ? "var(--grad-accent)" : onChain ? "color-mix(in srgb, var(--viz-chosen) 20%, var(--surface-3))" : "var(--surface-3)",
						stroke: peak ? "var(--accent-2)" : onChain ? "var(--viz-chosen)" : "var(--border-strong)",
						strokeWidth: peak ? 2.6 : onChain ? 2.2 : 1.5
					}), /* @__PURE__ */ jsx("text", {
						textAnchor: "middle",
						y: "5",
						fontSize: "13",
						fontWeight: "700",
						fill: peak ? "var(--text-on-accent)" : "var(--text-1)",
						children: k === "a2" || k === "b2" ? "" : k === "u" ? "u" : ""
					})]
				}, k);
			}),
			/* @__PURE__ */ jsx("text", {
				x: P.u[0],
				y: P.u[1] - 28,
				textAnchor: "middle",
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--accent-1)",
				children: "拐点 u"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "150",
				y: "150",
				fontSize: "11.5",
				fill: "var(--viz-chosen)",
				children: "最深链"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "360",
				y: "150",
				fontSize: "11.5",
				fill: "var(--viz-chosen)",
				children: "次深链"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "280",
				y: "258",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "每个点当一次「拐点」，取它两条最深的向下链拼起来——全局最大即直径。"
			})
		]
	});
}
function TreeKnapDepFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 200",
		role: "img",
		"aria-label": "树上背包：选子树先花掉连父亲的边",
		children: [
			/* @__PURE__ */ jsx(Node, {
				x: 160,
				y: 44,
				label: "u",
				accent: true
			}),
			/* @__PURE__ */ jsx(Node, {
				x: 160,
				y: 150,
				label: "c"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "160",
				y1: "64",
				x2: "160",
				y2: "130",
				stroke: "var(--viz-chosen)",
				strokeWidth: "3"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(178,84)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "120",
						height: "34",
						rx: "9",
						fill: "color-mix(in srgb, var(--viz-chosen) 14%, var(--surface-2))",
						stroke: "var(--viz-chosen)",
						strokeWidth: "1.4"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "60",
						y: "15",
						textAnchor: "middle",
						fontSize: "11",
						fill: "var(--text-1)",
						children: "连 c 的边"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "60",
						y: "28",
						textAnchor: "middle",
						fontSize: "11",
						className: "mono",
						fill: "var(--viz-chosen)",
						children: "先花 1 条容量"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(330,54)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "210",
						height: "110",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "105",
						y: "26",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "给孩子 c 这一组分 t 条边"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "105",
						y: "54",
						textAnchor: "middle",
						fontSize: "13",
						className: "mono",
						fill: "var(--text-1)",
						children: "收益 = 边权(c)"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "105",
						y: "76",
						textAnchor: "middle",
						fontSize: "13",
						className: "mono",
						fill: "var(--accent-1)",
						children: "+ dp[c][t−1]"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "105",
						y: "98",
						textAnchor: "middle",
						fontSize: "11.5",
						fill: "var(--text-2)",
						children: "（1 条连边 + t−1 条子树内）"
					})
				]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "280",
				y: "190",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "每个孩子是一「组」物品，父亲对孩子们做分组背包——这就是有依赖背包的树上形态。"
			})
		]
	});
}
function JointWeightFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 200",
		role: "img",
		"aria-label": "距离为 2 的点对有一个公共中间点",
		children: [
			/* @__PURE__ */ jsx(Node, {
				x: 280,
				y: 44,
				label: "m",
				accent: true
			}),
			/* @__PURE__ */ jsx(Node, {
				x: 150,
				y: 150,
				label: "a"
			}),
			/* @__PURE__ */ jsx(Node, {
				x: 410,
				y: 150,
				label: "b"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "280",
				y1: "64",
				x2: "150",
				y2: "130",
				stroke: "var(--viz-source)",
				strokeWidth: "2.6"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "280",
				y1: "64",
				x2: "410",
				y2: "130",
				stroke: "var(--viz-source)",
				strokeWidth: "2.6"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M150 168 Q280 226 410 168",
				fill: "none",
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				strokeDasharray: "5 4"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "280",
				y: "212",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--accent-1)",
				children: "dist(a,b) = 2"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "210",
				y: "105",
				fontSize: "11.5",
				fill: "var(--viz-source)",
				children: "1 步"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "340",
				y: "105",
				fontSize: "11.5",
				fill: "var(--viz-source)",
				children: "1 步"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "490",
				y: "52",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "中间点 m"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "280",
				y: "26",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "枚举中间点 m，它的邻居两两配对即所有距离 2 点对"
			})
		]
	});
}
function VirtualRootFigure() {
	const trees = [
		[
			[110, 130],
			[70, 210],
			[150, 210]
		],
		[[290, 130]],
		[[430, 130], [430, 210]]
	];
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 250",
		role: "img",
		"aria-label": "森林接一个虚根 0 合成一棵树",
		children: [
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(280,44)",
				children: [/* @__PURE__ */ jsx("circle", {
					r: "22",
					fill: "var(--grad-accent)",
					stroke: "var(--accent-2)",
					strokeWidth: "2.2",
					strokeDasharray: "4 3"
				}), /* @__PURE__ */ jsx("text", {
					textAnchor: "middle",
					y: "5",
					fontSize: "15",
					fontWeight: "700",
					fill: "var(--text-on-accent)",
					children: "0"
				})]
			}),
			trees.map((t, i) => /* @__PURE__ */ jsx("line", {
				x1: "280",
				y1: "66",
				x2: t[0][0],
				y2: t[0][1] - 20,
				stroke: "var(--accent-2)",
				strokeWidth: "1.8",
				strokeDasharray: "4 3"
			}, `ve${i}`)),
			trees.map((t, ti) => t.slice(1).map(([x, y], k) => /* @__PURE__ */ jsx("line", {
				x1: t[0][0],
				y1: t[0][1] + 20,
				x2: x,
				y2: y - 20,
				stroke: "var(--border-strong)",
				strokeWidth: "1.6"
			}, `te${ti}-${k}`))),
			trees.flat().map(([x, y], i) => /* @__PURE__ */ jsx("g", {
				transform: `translate(${x},${y})`,
				children: /* @__PURE__ */ jsx("circle", {
					r: "19",
					fill: "var(--surface-3)",
					stroke: "var(--border-strong)",
					strokeWidth: "1.5"
				})
			}, i)),
			/* @__PURE__ */ jsx("text", {
				x: "280",
				y: "240",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "虚线 = 虚根 0 补出的边：三棵依赖树瞬间变成一棵以 0 为根的树，选 m 门真课 = 含虚根选 m+1 个点。"
			})
		]
	});
}
function CentroidFigure() {
	const P = {
		c: [280, 130],
		a: [160, 60],
		b: [400, 60],
		d: [180, 210],
		e: [380, 210]
	};
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 250",
		role: "img",
		"aria-label": "树的重心：删去后最大子树最小",
		children: [
			[
				["c", "a"],
				["c", "b"],
				["c", "d"],
				["c", "e"]
			].map(([a, b], i) => /* @__PURE__ */ jsx("line", {
				x1: P[a][0],
				y1: P[a][1],
				x2: P[b][0],
				y2: P[b][1],
				stroke: "var(--border-strong)",
				strokeWidth: "1.6"
			}, i)),
			Object.entries(P).map(([k, [x, y]]) => {
				const isC = k === "c";
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x},${y})`,
					children: [/* @__PURE__ */ jsx("circle", {
						r: "20",
						fill: isC ? "var(--grad-accent)" : "var(--surface-3)",
						stroke: isC ? "var(--accent-2)" : "var(--border-strong)",
						strokeWidth: isC ? 2.6 : 1.5
					}), /* @__PURE__ */ jsx("text", {
						textAnchor: "middle",
						y: "5",
						fontSize: "13",
						fontWeight: "700",
						fill: isC ? "var(--text-on-accent)" : "var(--text-1)",
						children: k === "c" ? "重心" : ""
					})]
				}, k);
			}),
			/* @__PURE__ */ jsxs("text", {
				x: "280",
				y: "240",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-2)",
				children: [
					"重心：以它为根时，最大的那棵子树的节点数",
					/* @__PURE__ */ jsx("strong", { children: "最小" }),
					"（各方向最均衡）。用子树大小 sz[u] 判定。"
				]
			})
		]
	});
}
function BracketTreeFigure() {
	const seq = [
		"(",
		"(",
		")",
		")"
	];
	const xs = [
		130,
		230,
		330,
		430
	];
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 200",
		role: "img",
		"aria-label": "括号树沿根链 O(1) 递推 f",
		children: [
			xs.slice(0, -1).map((x, i) => /* @__PURE__ */ jsx("line", {
				x1: x + 22,
				y1: "70",
				x2: xs[i + 1] - 22,
				y2: "70",
				stroke: "var(--border-strong)",
				strokeWidth: "1.6"
			}, i)),
			seq.map((ch, i) => {
				const matched = i >= 2;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${xs[i]},70)`,
					children: [
						/* @__PURE__ */ jsx("circle", {
							r: "22",
							fill: matched ? "color-mix(in srgb, var(--viz-chosen) 20%, var(--surface-3))" : "var(--surface-3)",
							stroke: matched ? "var(--viz-chosen)" : "var(--border-strong)",
							strokeWidth: matched ? 2.2 : 1.5
						}),
						/* @__PURE__ */ jsx("text", {
							textAnchor: "middle",
							y: "6",
							fontSize: "18",
							fontWeight: "700",
							className: "mono",
							fill: "var(--text-1)",
							children: ch
						}),
						/* @__PURE__ */ jsxs("text", {
							textAnchor: "middle",
							y: "42",
							fontSize: "11",
							className: "mono",
							fill: "var(--accent-1)",
							children: ["f=", [
								0,
								0,
								1,
								2
							][i]]
						})
					]
				}, i);
			}),
			/* @__PURE__ */ jsx("text", {
				x: "280",
				y: "130",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "沿根到点的链：每个 ) 若配对成功，f[u] = f[配对(的前驱] + 1"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "280",
				y: "172",
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--text-3)",
				children: "「(())」在最后一位结尾有 2 个合法子串：() 与 (())——f 逐位 O(1) 累进，无需重扫"
			})
		]
	});
}
//#endregion
export { solveTreeKnapsack as _, IndepDecisionFigure as a, ThreeStateFigure as c, buildTree as d, layoutTree as f, solveMaxSubtreeChain as g, solveJointWeight as h, DiameterFigure as i, TreeKnapDepFigure as l, solveIndepSet as m, CentroidFigure as n, JointWeightFigure as o, solveDominatingSet as p, CoverContrastFigure as r, PostorderFigure as s, BracketTreeFigure as t, VirtualRootFigure as u };
