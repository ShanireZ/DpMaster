import { a as recordRerootDistance, i as solveRerootDistanceBrute, n as layoutRerootTree, o as recordRerootEccentricity, s as recordRerootInOut, t as buildRerootTree } from "./reroot-COID7zms.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/reroot/rerootSolver.ts
function buildTree(n, edges, root = 0, weight) {
	return buildRerootTree(n, edges, root, weight);
}
function layoutTree(tree) {
	return layoutRerootTree(tree);
}
function rerootDistSum(tree, mode = "unweighted") {
	return recordRerootDistance(tree, mode).result;
}
function bruteDistSum(tree, mode = "unweighted") {
	return solveRerootDistanceBrute(tree, mode);
}
function rerootFrames(tree, result) {
	const run = recordRerootDistance(tree);
	const frames = [];
	const szKnown = Array(tree.n).fill(false);
	const distKnown = Array(tree.n).fill(false);
	frames.push({
		phase: "intro",
		active: null,
		fromParent: null,
		szKnown: szKnown.slice(),
		distKnown: distKnown.slice(),
		rootHighlight: result.fixedRoot,
		caption: `先固定节点 <b>${result.fixedRoot + 1}</b> 为根：第一遍后序求子树，第二遍沿边 O(1) 换根。`,
		formula: `\\text{fixed root}=${result.fixedRoot + 1}`
	});
	for (const event of run.events) {
		if (event.type !== "subtree-settled") continue;
		szKnown[event.node] = true;
		frames.push({
			phase: "pass1",
			active: event.node,
			fromParent: null,
			szKnown: szKnown.slice(),
			distKnown: distKnown.slice(),
			rootHighlight: result.fixedRoot,
			caption: `<b>第一遍 · 后序</b>：结算节点 <b>${event.node + 1}</b>，子树权重 sz=<b>${event.subtreeWeight}</b>，子树内距离和 down=<b>${event.down}</b>。`,
			formula: `\\mathrm{sz}[${event.node + 1}]=${event.subtreeWeight}`
		});
	}
	distKnown[result.fixedRoot] = true;
	frames.push({
		phase: "pass1done",
		active: result.fixedRoot,
		fromParent: null,
		szKnown: szKnown.slice(),
		distKnown: distKnown.slice(),
		rootHighlight: result.fixedRoot,
		caption: `固定根的距离和 f[${result.fixedRoot + 1}]=<b>${result.dist[result.fixedRoot]}</b>，作为换根起点。`,
		formula: `f[${result.fixedRoot + 1}]=${result.dist[result.fixedRoot]}`
	});
	for (const event of run.events) {
		if (event.type !== "root-shifted") continue;
		distKnown[event.node] = true;
		frames.push({
			phase: "pass2",
			active: event.node,
			fromParent: event.parent,
			szKnown: szKnown.slice(),
			distKnown: distKnown.slice(),
			rootHighlight: event.node,
			caption: `<b>第二遍 · 换根</b>：从 ${event.parent + 1} 移到 <b>${event.node + 1}</b>，系数 W−2·sz=<b>${event.coefficient}</b>，得到 f=<b>${event.distance}</b>。`,
			formula: `f[${event.node + 1}]=f[${event.parent + 1}]+(${event.coefficient})=${event.distance}`
		});
	}
	frames.push({
		phase: "done",
		active: result.bestNode,
		fromParent: null,
		szKnown: szKnown.slice(),
		distKnown: distKnown.slice(),
		rootHighlight: result.bestNode,
		caption: `两遍扫描结束，最小距离和是节点 <b>${result.bestNode + 1}</b> 的 <b>${result.best}</b>。`,
		formula: `\\min_u f[u]=${result.best}`
	});
	return frames;
}
function inOutDecompose(tree) {
	return recordRerootInOut(tree).result;
}
function eccentricity(tree) {
	return recordRerootEccentricity(tree).result;
}
//#endregion
//#region src/components/demos/reroot/TreeCanvas.tsx
function TreeCanvas({ nodes, maxDepth, nodeStyle, edgeStyle, subLabel, edgeLabel, onNodeClick, ariaLabel, height }) {
	const W = 620;
	const padX = 44;
	const topY = 42;
	const rowH = 88;
	const H = height ?? topY + maxDepth * rowH + 54;
	const px = (x) => padX + x * (W - 2 * padX);
	const py = (d) => topY + d * rowH;
	const byId = /* @__PURE__ */ new Map();
	nodes.forEach((nd) => byId.set(nd.id, nd));
	const edges = [];
	nodes.forEach((nd) => {
		if (nd.parent >= 0) {
			const p = byId.get(nd.parent);
			if (p) edges.push({
				c: nd.id,
				p: nd.parent,
				cx: px(nd.x),
				cy: py(nd.depth),
				px2: px(p.x),
				py2: py(p.depth)
			});
		}
	});
	const R = 21;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: `0 0 ${W} ${H}`,
		role: "img",
		"aria-label": ariaLabel,
		children: [
			edges.map((e, i) => {
				const st = edgeStyle(e.c, e.p);
				return /* @__PURE__ */ jsx("line", {
					x1: e.cx,
					y1: e.cy,
					x2: e.px2,
					y2: e.py2,
					stroke: st.stroke,
					strokeWidth: st.strokeWidth,
					strokeLinecap: "round"
				}, `e${i}`);
			}),
			edgeLabel && edges.map((e, i) => {
				const lab = edgeLabel(e.c, e.p);
				if (!lab) return null;
				return /* @__PURE__ */ jsx("text", {
					x: (e.cx + e.px2) / 2 + 11,
					y: (e.cy + e.py2) / 2 + 4,
					fontSize: "11",
					className: "mono",
					fill: "var(--text-3)",
					children: lab
				}, `el${i}`);
			}),
			nodes.map((nd) => {
				const st = nodeStyle(nd.id);
				const sub = subLabel ? subLabel(nd.id) : null;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${px(nd.x)},${py(nd.depth)})`,
					className: onNodeClick ? "rr__node-hit" : void 0,
					onClick: onNodeClick ? () => onNodeClick(nd.id) : void 0,
					children: [
						/* @__PURE__ */ jsx("circle", {
							r: st.r ?? R,
							fill: st.fill,
							stroke: st.stroke,
							strokeWidth: st.strokeWidth
						}),
						/* @__PURE__ */ jsx("text", {
							y: sub ? -3 : 5,
							textAnchor: "middle",
							fontSize: "14",
							fontWeight: "700",
							fill: st.textFill,
							children: nd.id + 1
						}),
						sub && /* @__PURE__ */ jsx("text", {
							y: "13",
							textAnchor: "middle",
							fontSize: "9.5",
							className: "mono",
							fill: st.textFill,
							children: sub
						})
					]
				}, nd.id);
			})
		]
	});
}
//#endregion
//#region src/content/e/RerootArt.tsx
function Node({ x, y, label, sub, variant = "plain", r = 19 }) {
	const style = {
		plain: {
			fill: "var(--surface-3)",
			stroke: "var(--border-strong)",
			sw: 1.5,
			tx: "var(--text-1)"
		},
		root: {
			fill: "var(--grad-accent)",
			stroke: "var(--accent-1)",
			sw: 2.5,
			tx: "var(--text-on-accent)"
		},
		in: {
			fill: "color-mix(in srgb, var(--viz-source) 16%, var(--surface-3))",
			stroke: "var(--viz-source)",
			sw: 2,
			tx: "var(--text-1)"
		},
		out: {
			fill: "color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))",
			stroke: "color-mix(in srgb, var(--accent-1) 55%, var(--border-strong))",
			sw: 1.8,
			tx: "var(--text-1)"
		},
		best: {
			fill: "color-mix(in srgb, var(--viz-chosen) 18%, var(--surface-3))",
			stroke: "var(--viz-chosen)",
			sw: 2.4,
			tx: "var(--text-1)"
		}
	}[variant];
	return /* @__PURE__ */ jsxs("g", {
		transform: `translate(${x},${y})`,
		children: [
			/* @__PURE__ */ jsx("circle", {
				r,
				fill: style.fill,
				stroke: style.stroke,
				strokeWidth: style.sw
			}),
			/* @__PURE__ */ jsx("text", {
				y: sub ? -3 : 5,
				textAnchor: "middle",
				fontSize: "13.5",
				fontWeight: "700",
				fill: style.tx,
				children: label
			}),
			sub && /* @__PURE__ */ jsx("text", {
				y: "13",
				textAnchor: "middle",
				fontSize: "9",
				className: "mono",
				fill: style.tx,
				children: sub
			})
		]
	});
}
function Edge({ x1, y1, x2, y2, on = false }) {
	return /* @__PURE__ */ jsx("line", {
		x1,
		y1,
		x2,
		y2,
		stroke: on ? "var(--accent-1)" : "var(--border-strong)",
		strokeWidth: on ? 3 : 1.8,
		strokeLinecap: "round"
	});
}
function BruteFigure() {
	const mini = (ox, rootIdx, label) => {
		const pos = [
			{
				x: 40,
				y: 16
			},
			{
				x: 16,
				y: 54
			},
			{
				x: 64,
				y: 54
			}
		];
		return /* @__PURE__ */ jsxs("g", {
			transform: `translate(${ox},0)`,
			children: [
				[[0, 1], [0, 2]].map(([a, b], i) => /* @__PURE__ */ jsx(Edge, {
					x1: pos[a].x,
					y1: pos[a].y,
					x2: pos[b].x,
					y2: pos[b].y
				}, i)),
				pos.map((p, i) => /* @__PURE__ */ jsx(Node, {
					x: p.x,
					y: p.y,
					label: `${i + 1}`,
					variant: i === rootIdx ? "root" : "plain",
					r: 13
				}, i)),
				/* @__PURE__ */ jsx("text", {
					x: "40",
					y: "92",
					textAnchor: "middle",
					fontSize: "11",
					fill: "var(--text-2)",
					children: label
				})
			]
		});
	};
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 130",
		role: "img",
		"aria-label": "暴力：每个点各自从头跑一遍，共 n 遍",
		children: [
			mini(30, 0, "以 1 为根：BFS"),
			mini(190, 1, "以 2 为根：再 BFS"),
			mini(350, 2, "以 3 为根：又 BFS"),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(470,50)",
				children: [/* @__PURE__ */ jsx("text", {
					x: "0",
					y: "0",
					fontSize: "13",
					fill: "var(--text-2)",
					children: "…共 n 遍"
				}), /* @__PURE__ */ jsx("text", {
					x: "0",
					y: "22",
					fontSize: "15",
					className: "mono",
					fill: "var(--viz-invalid)",
					children: "O(n²)"
				})]
			})
		]
	});
}
function TwoPassFigure() {
	const pos = [
		{
			x: 210,
			y: 30
		},
		{
			x: 120,
			y: 96
		},
		{
			x: 300,
			y: 96
		},
		{
			x: 70,
			y: 162
		},
		{
			x: 168,
			y: 162
		},
		{
			x: 252,
			y: 162
		},
		{
			x: 348,
			y: 162
		}
	];
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 214",
		role: "img",
		"aria-label": "换根两遍 DFS：第一遍后序求子树大小，第二遍前序换根",
		children: [
			/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsx("marker", {
				id: "rr-up",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--viz-source)"
				})
			}), /* @__PURE__ */ jsx("marker", {
				id: "rr-dn",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--accent-1)"
				})
			})] }),
			[
				[0, 1],
				[0, 2],
				[1, 3],
				[1, 4],
				[2, 5],
				[2, 6]
			].map(([a, b], i) => /* @__PURE__ */ jsx(Edge, {
				x1: pos[a].x,
				y1: pos[a].y,
				x2: pos[b].x,
				y2: pos[b].y
			}, i)),
			pos.map((p, i) => /* @__PURE__ */ jsx(Node, {
				x: p.x,
				y: p.y,
				label: `${i + 1}`,
				variant: i === 0 ? "root" : "plain"
			}, i)),
			/* @__PURE__ */ jsx("path", {
				d: "M92 150 Q60 124 108 104",
				fill: "none",
				stroke: "var(--viz-source)",
				strokeWidth: "2",
				markerEnd: "url(#rr-up)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "44",
				y: "128",
				fontSize: "11",
				fill: "var(--viz-source)",
				children: "第一遍"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "44",
				y: "142",
				fontSize: "10",
				fill: "var(--viz-source)",
				children: "后序求 sz"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M300 116 Q340 138 322 150",
				fill: "none",
				stroke: "var(--accent-1)",
				strokeWidth: "2",
				markerEnd: "url(#rr-dn)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "470",
				y: "80",
				fontSize: "11",
				fill: "var(--accent-1)",
				children: "第二遍"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "470",
				y: "94",
				fontSize: "10",
				fill: "var(--accent-1)",
				children: "前序换根"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "470",
				y: "120",
				fontSize: "10.5",
				className: "mono",
				fill: "var(--viz-chosen)",
				children: "合计 O(n)"
			})
		]
	});
}
function CoefFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 220",
		role: "img",
		"aria-label": "根从 u 挪到子 v：子树内每点近 1，子树外每点远 1",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "rr-mv",
				markerWidth: "9",
				markerHeight: "9",
				refX: "7",
				refY: "3.2",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L7,3.2 L0,6.4 Z",
					fill: "var(--accent-1)"
				})
			}) }),
			/* @__PURE__ */ jsx(Edge, {
				x1: 200,
				y1: 60,
				x2: 200,
				y2: 140,
				on: true
			}),
			/* @__PURE__ */ jsx(Node, {
				x: 200,
				y: 60,
				label: "u",
				variant: "plain",
				r: 22
			}),
			/* @__PURE__ */ jsx(Node, {
				x: 200,
				y: 140,
				label: "v",
				variant: "root",
				r: 22
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M240 100 L286 100",
				stroke: "var(--accent-1)",
				strokeWidth: "2.4",
				markerEnd: "url(#rr-mv)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "263",
				y: "90",
				textAnchor: "middle",
				fontSize: "11",
				fill: "var(--accent-1)",
				children: "根 u→v"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(120,150)",
				children: [
					/* @__PURE__ */ jsx("ellipse", {
						cx: "80",
						cy: "34",
						rx: "96",
						ry: "44",
						fill: "color-mix(in srgb, var(--viz-source) 10%, transparent)",
						stroke: "var(--viz-source)",
						strokeWidth: "1.5",
						strokeDasharray: "4 4"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "80",
						y: "30",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--viz-source)",
						children: "v 的子树 · sz 个点"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "80",
						y: "50",
						textAnchor: "middle",
						fontSize: "12",
						className: "mono",
						fill: "var(--viz-source)",
						children: "每点 −1（更近）"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(330,20)",
				children: [
					/* @__PURE__ */ jsx("ellipse", {
						cx: "120",
						cy: "40",
						rx: "128",
						ry: "46",
						fill: "color-mix(in srgb, var(--accent-1) 8%, transparent)",
						stroke: "color-mix(in srgb, var(--accent-1) 55%, var(--border-strong))",
						strokeWidth: "1.5",
						strokeDasharray: "4 4"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "34",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--accent-1)",
						children: "其余 n − sz 个点"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "54",
						textAnchor: "middle",
						fontSize: "12",
						className: "mono",
						fill: "var(--accent-1)",
						children: "每点 +1（更远）"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(96,196)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "428",
					height: "20",
					rx: "10",
					fill: "color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))",
					stroke: "color-mix(in srgb, var(--viz-chosen) 40%, transparent)",
					strokeWidth: "1"
				}), /* @__PURE__ */ jsx("text", {
					x: "214",
					y: "14",
					textAnchor: "middle",
					fontSize: "12",
					className: "mono",
					fill: "var(--text-1)",
					children: "Δ = +(n−sz) − sz = n − 2·sz　⇒　f[v] = f[u] + (n − 2·sz[v])"
				})]
			})
		]
	});
}
function DistSetupFigure() {
	const pos = [
		{
			x: 100,
			y: 40,
			w: 2
		},
		{
			x: 250,
			y: 40,
			w: 5
		},
		{
			x: 400,
			y: 40,
			w: 1
		},
		{
			x: 175,
			y: 130,
			w: 3
		},
		{
			x: 325,
			y: 130,
			w: 4
		}
	];
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 520 180",
		role: "img",
		"aria-label": "带点权的树：每个村庄有人数，求集合点使总距离最小",
		children: [
			[
				[0, 3],
				[1, 3],
				[1, 4],
				[2, 4]
			].map(([a, b], i) => /* @__PURE__ */ jsx(Edge, {
				x1: pos[a].x,
				y1: pos[a].y,
				x2: pos[b].x,
				y2: pos[b].y
			}, i)),
			pos.map((p, i) => /* @__PURE__ */ jsx(Node, {
				x: p.x,
				y: p.y,
				label: `${i + 1}`,
				sub: `×${p.w}`,
				variant: i === 3 ? "best" : "plain",
				r: 21
			}, i)),
			/* @__PURE__ */ jsx("text", {
				x: "175",
				y: "172",
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--viz-chosen)",
				children: "绿圈=当前最优集合点（带权距离和最小）"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "440",
				y: "40",
				fontSize: "11",
				fill: "var(--text-3)",
				children: "×w = 该点"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "440",
				y: "55",
				fontSize: "11",
				fill: "var(--text-3)",
				children: "人数/牛数"
			})
		]
	});
}
function InOutFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 210",
		role: "img",
		"aria-label": "每点距离和 = 子树内 down 加子树外 up",
		children: [
			/* @__PURE__ */ jsx(Node, {
				x: 280,
				y: 104,
				label: "u",
				variant: "root",
				r: 24
			}),
			/* @__PURE__ */ jsx(Edge, {
				x1: 280,
				y1: 104,
				x2: 210,
				y2: 170,
				on: true
			}),
			/* @__PURE__ */ jsx(Edge, {
				x1: 280,
				y1: 104,
				x2: 280,
				y2: 178,
				on: true
			}),
			/* @__PURE__ */ jsx(Edge, {
				x1: 280,
				y1: 104,
				x2: 350,
				y2: 170,
				on: true
			}),
			/* @__PURE__ */ jsx(Node, {
				x: 210,
				y: 176,
				label: "",
				variant: "in",
				r: 12
			}),
			/* @__PURE__ */ jsx(Node, {
				x: 280,
				y: 184,
				label: "",
				variant: "in",
				r: 12
			}),
			/* @__PURE__ */ jsx(Node, {
				x: 350,
				y: 176,
				label: "",
				variant: "in",
				r: 12
			}),
			/* @__PURE__ */ jsx(Edge, {
				x1: 280,
				y1: 104,
				x2: 280,
				y2: 40
			}),
			/* @__PURE__ */ jsx(Node, {
				x: 280,
				y: 32,
				label: "p",
				variant: "out",
				r: 16
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(150,150)",
				children: [/* @__PURE__ */ jsx("ellipse", {
					cx: "130",
					cy: "30",
					rx: "140",
					ry: "42",
					fill: "color-mix(in srgb, var(--viz-source) 8%, transparent)",
					stroke: "var(--viz-source)",
					strokeWidth: "1.5",
					strokeDasharray: "4 4"
				}), /* @__PURE__ */ jsx("text", {
					x: "130",
					y: "66",
					textAnchor: "middle",
					fontSize: "12",
					fill: "var(--viz-source)",
					children: "子树内 down[u]：第一遍后序备好"
				})]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(300,20)",
				children: [
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "10",
						fontSize: "12",
						fill: "var(--accent-1)",
						children: "子树外 up[u]（父方向）"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "27",
						fontSize: "11",
						fill: "var(--text-2)",
						children: "= 父的全部 − 朝自己子树那部分"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "44",
						fontSize: "11",
						fill: "var(--text-2)",
						children: "第二遍前序由父传子"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(70,2)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "200",
					height: "20",
					rx: "10",
					fill: "color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))",
					stroke: "color-mix(in srgb, var(--viz-chosen) 40%, transparent)",
					strokeWidth: "1"
				}), /* @__PURE__ */ jsx("text", {
					x: "100",
					y: "14",
					textAnchor: "middle",
					fontSize: "11.5",
					className: "mono",
					fill: "var(--text-1)",
					children: "dist[u] = down[u] + up[u]"
				})]
			})
		]
	});
}
function EccentricityFigure() {
	const pos = [
		{
			x: 60,
			y: 100
		},
		{
			x: 160,
			y: 100
		},
		{
			x: 260,
			y: 100
		},
		{
			x: 360,
			y: 100
		},
		{
			x: 460,
			y: 100
		},
		{
			x: 260,
			y: 40
		}
	];
	const edges = [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 4],
		[2, 5]
	];
	const ecc = [
		4,
		3,
		2,
		3,
		4,
		3
	];
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 540 170",
		role: "img",
		"aria-label": "每个点的偏心距=它到最远点的距离，最小者是树的中心",
		children: [
			edges.map(([a, b], i) => /* @__PURE__ */ jsx(Edge, {
				x1: pos[a].x,
				y1: pos[a].y,
				x2: pos[b].x,
				y2: pos[b].y
			}, i)),
			pos.map((p, i) => /* @__PURE__ */ jsx(Node, {
				x: p.x,
				y: p.y,
				label: `${i + 1}`,
				sub: `e${ecc[i]}`,
				variant: ecc[i] === 2 ? "best" : "plain",
				r: 20
			}, i)),
			/* @__PURE__ */ jsx("text", {
				x: "260",
				y: "150",
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--viz-chosen)",
				children: "绿圈=偏心距最小(2)=树的中心"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "470",
				y: "150",
				fontSize: "10.5",
				className: "mono",
				fill: "var(--text-3)",
				children: "e = 偏心距"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M60 128 Q260 152 460 128",
				fill: "none",
				stroke: "var(--accent-1)",
				strokeWidth: "1.5",
				strokeDasharray: "5 4"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "150",
				y: "146",
				fontSize: "10.5",
				fill: "var(--accent-1)",
				children: "直径 = 最长链(1↔5，长 4)"
			})
		]
	});
}
//#endregion
export { InOutFigure as a, bruteDistSum as c, inOutDecompose as d, layoutTree as f, EccentricityFigure as i, buildTree as l, rerootFrames as m, CoefFigure as n, TwoPassFigure as o, rerootDistSum as p, DistSetupFigure as r, TreeCanvas as s, BruteFigure as t, eccentricity as u };
