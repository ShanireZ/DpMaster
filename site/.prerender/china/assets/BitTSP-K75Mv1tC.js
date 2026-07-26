import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
/* empty css                      */
import { d as TspTransFigure, s as OpenClosedFigure, t as BitLattice, u as TspStateFigure } from "./BitArt-C1NRBGYU.js";
import { useMemo, useState } from "react";
import { Minus, MousePointerClick, Plus, RotateCcw } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/bitmask-tsp/internal.ts
function executeBitmaskTsp(distances, emit) {
	const n = distances.length;
	if (n < 1 || n > 20) throw new RangeError("TSP requires between 1 and 20 points");
	for (const row of distances) {
		if (row.length !== n) throw new RangeError("TSP distance matrix must be square");
		for (const value of row) if (!Number.isFinite(value)) throw new RangeError("TSP distances must be finite");
	}
	const states = 1 << n;
	const table = Array.from({ length: states }, () => Array(n).fill(Number.POSITIVE_INFINITY));
	table[1][0] = 0;
	for (let mask = 1; mask < states; mask++) {
		if ((mask & 1) === 0) continue;
		for (let from = 0; from < n; from++) {
			if ((mask & 1 << from) === 0 || !Number.isFinite(table[mask][from])) continue;
			const base = table[mask][from];
			for (let to = 0; to < n; to++) {
				if ((mask & 1 << to) !== 0) continue;
				const nextMask = mask | 1 << to;
				const candidate = base + distances[from][to];
				const before = table[nextMask][to];
				const updated = candidate < before;
				if (updated) table[nextMask][to] = candidate;
				emit({
					type: "transition",
					mask,
					from,
					to,
					nextMask,
					base,
					edge: distances[from][to],
					candidate,
					before,
					updated,
					value: table[nextMask][to]
				});
			}
		}
	}
	const final = table[states - 1];
	let distance = Number.POSITIVE_INFINITY;
	let end = 0;
	for (let node = 0; node < n; node++) if (final[node] < distance) {
		distance = final[node];
		end = node;
	}
	return {
		distance,
		end,
		table
	};
}
function recordBitmaskTsp(distances) {
	const events = [];
	return {
		result: executeBitmaskTsp(distances, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/algorithms/bitmask-tsp/index.ts
function formatBitmask(mask, width) {
	return mask.toString(2).padStart(width, "0");
}
//#endregion
//#region src/components/demos/bitmask/tspSolver.ts
function maskBits(mask, width) {
	return formatBitmask(mask, width);
}
function tspHamilton(n, distances) {
	if (n !== distances.length) throw new RangeError("TSP point count must match the distance matrix");
	const run = recordBitmaskTsp(distances);
	const states = 1 << n;
	const table = Array.from({ length: states }, () => Array(n).fill(Number.POSITIVE_INFINITY));
	table[1][0] = 0;
	const values = () => table.map((row) => row.map((value) => Number.isFinite(value) ? value : null));
	const settled = () => {
		const cellStates = {};
		for (let mask = 0; mask < states; mask++) for (let node = 0; node < n; node++) if (Number.isFinite(table[mask][node])) cellStates[key(mask, node)] = "settled";
		return cellStates;
	};
	const initialStates = settled();
	initialStates[key(1, 0)] = "chosen";
	const frames = [{
		values: values(),
		states: initialStates,
		caption: "<b>起点</b>：dp[0001][0]=0，只访问点 0 并停在点 0。",
		formula: "dp[\\{0\\}][0]=0"
	}];
	for (const event of run.events) {
		if (event.updated) table[event.nextMask][event.to] = event.value;
		const cellStates = settled();
		cellStates[key(event.mask, event.from)] = "source";
		cellStates[key(event.nextMask, event.to)] = "current";
		const arrows = [{
			from: {
				r: event.mask,
				c: event.from
			},
			to: {
				r: event.nextMask,
				c: event.to
			},
			kind: event.updated ? "chosen" : "source"
		}];
		frames.push({
			values: values(),
			states: cellStates,
			active: {
				r: event.nextMask,
				c: event.to
			},
			arrows,
			caption: `从 dp[${maskBits(event.mask, n)}][${event.from}]=<b>${event.base}</b> 走向点 <b>${event.to}</b>：候选 ${event.base}+${event.edge}=<b>${event.candidate}</b>，${event.updated ? "更新" : `不优于 ${event.value}`}。`,
			formula: `dp[S\\cup\\{${event.to}\\}][${event.to}]=\\min(\\cdot,${event.candidate})`
		});
	}
	const finalStates = settled();
	finalStates[key(states - 1, run.result.end)] = "chosen";
	frames.push({
		values: values(),
		states: finalStates,
		caption: `访问全部 ${n} 个点后，最短 Hamilton 路径长度为 <b>${run.result.distance}</b>（停在点 ${run.result.end}）。`,
		formula: `\\min_i dp[2^${n}-1][i]=${run.result.distance}`
	});
	return {
		rows: states,
		cols: n,
		cell: 44,
		rowHeaderLabels: Array.from({ length: states }, (_, mask) => maskBits(mask, n)),
		colHeaderLabels: Array.from({ length: n }, (_, node) => `${node}`),
		frames
	};
}
//#endregion
//#region src/components/demos/bitmask/TspDemo.tsx
var INIT = [
	{
		x: 1,
		y: 1
	},
	{
		x: 5,
		y: 2
	},
	{
		x: 4,
		y: 6
	},
	{
		x: 1,
		y: 5
	}
];
function distMat(pts) {
	const n = pts.length;
	const d = Array.from({ length: n }, () => Array(n).fill(0));
	for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.abs(pts[i].x - pts[j].x) + Math.abs(pts[i].y - pts[j].y);
	return d;
}
function TspDemo() {
	const [pts, setPts] = useState(INIT);
	const n = pts.length;
	const dist = useMemo(() => distMat(pts), [pts]);
	const model = useMemo(() => tspHamilton(n, dist), [n, dist]);
	const modelKey = `tsp-${pts.map((p) => `${p.x}.${p.y}`).join("_")}`;
	const move = (i, dx, dy) => setPts((arr) => arr.map((p, k) => k === i ? {
		x: Math.max(0, Math.min(7, p.x + dx)),
		y: Math.max(0, Math.min(7, p.y + dy))
	} : p));
	const addPt = () => setPts((arr) => arr.length < 5 ? [...arr, {
		x: 3,
		y: 3
	}] : arr);
	const removePt = () => setPts((arr) => arr.length > 3 ? arr.slice(0, -1) : arr);
	const S = 30;
	const pad = 18;
	const mapW = 246;
	const px = (x) => pad + x * S;
	const py = (y) => pad + (7 - y) * S;
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "bm__toolbar",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "bm__map-wrap",
				children: [/* @__PURE__ */ jsx("div", {
					className: "kd__group-label",
					children: "点位（点 0 = 起点 · 可移动 · 曼哈顿距离）"
				}), /* @__PURE__ */ jsxs("svg", {
					className: "bm__map",
					viewBox: `0 0 ${mapW} ${mapW}`,
					role: "img",
					"aria-label": "TSP 点位小地图",
					children: [Array.from({ length: 8 }, (_, g) => /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("line", {
						x1: px(g),
						y1: py(0),
						x2: px(g),
						y2: py(7),
						stroke: "var(--border)",
						strokeWidth: "1"
					}), /* @__PURE__ */ jsx("line", {
						x1: px(0),
						y1: py(g),
						x2: px(7),
						y2: py(g),
						stroke: "var(--border)",
						strokeWidth: "1"
					})] }, g)), pts.map((p, i) => /* @__PURE__ */ jsxs("g", {
						transform: `translate(${px(p.x)},${py(p.y)})`,
						children: [/* @__PURE__ */ jsx("circle", {
							r: "13",
							fill: i === 0 ? "var(--grad-accent)" : "color-mix(in srgb, var(--accent-1) 20%, var(--surface-3))",
							stroke: "var(--accent-2)",
							strokeWidth: "1.6"
						}), /* @__PURE__ */ jsx("text", {
							y: "4",
							textAnchor: "middle",
							fontSize: "12",
							fontWeight: "700",
							fill: i === 0 ? "var(--text-on-accent)" : "var(--text-1)",
							children: i
						})]
					}, i))]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "bm__controls",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "kd__group-label",
						children: "移动每个点"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "bm__movers",
						children: pts.map((p, i) => /* @__PURE__ */ jsxs("div", {
							className: "bm__mover",
							children: [/* @__PURE__ */ jsx("span", {
								className: "bm__mover-id",
								children: i
							}), /* @__PURE__ */ jsxs("div", {
								className: "bm__pad",
								children: [
									/* @__PURE__ */ jsx("button", {
										onClick: () => move(i, 0, 1),
										"aria-label": `点${i}上移`,
										children: "↑"
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "bm__pad-mid",
										children: [
											/* @__PURE__ */ jsx("button", {
												onClick: () => move(i, -1, 0),
												"aria-label": `点${i}左移`,
												children: "←"
											}),
											/* @__PURE__ */ jsxs("span", {
												className: "bm__coord",
												children: [
													p.x,
													",",
													p.y
												]
											}),
											/* @__PURE__ */ jsx("button", {
												onClick: () => move(i, 1, 0),
												"aria-label": `点${i}右移`,
												children: "→"
											})
										]
									}),
									/* @__PURE__ */ jsx("button", {
										onClick: () => move(i, 0, -1),
										"aria-label": `点${i}下移`,
										children: "↓"
									})
								]
							})]
						}, i))
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bm__count",
						children: [
							/* @__PURE__ */ jsxs("span", {
								className: "kd__group-label",
								style: { margin: 0 },
								children: ["点数 ", n]
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: removePt,
								disabled: n <= 3,
								"aria-label": "减少点",
								children: /* @__PURE__ */ jsx(Minus, { size: 13 })
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: addPt,
								disabled: n >= 5,
								"aria-label": "增加点",
								children: /* @__PURE__ */ jsx(Plus, { size: 13 })
							}),
							/* @__PURE__ */ jsxs("button", {
								className: "bm__reset",
								onClick: () => setPts(INIT),
								"aria-label": "重置点位",
								children: [/* @__PURE__ */ jsx(RotateCcw, { size: 13 }), " 复位"]
							})
						]
					})
				]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "bm__note",
			children: [
				"行 = 已访问集合 mask（二进制，共 ",
				/* @__PURE__ */ jsxs("b", { children: ["2^", n] }),
				" 行）；列 = 当前停留的点。看它如何从起点 ",
				/* @__PURE__ */ jsx("code", { children: "0001" }),
				" 逐步点亮，最后一行取最小即答案。"
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/content/g/BitTSP.tsx
var CODE_P10447 = `
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

int n;
int w[25][25];               // 两点间边权
int f[1 << 20][25];          // f[S][i]：走过集合 S、当前停在 i 的最短路

int main()
{
    cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            cin >> w[i][j];

    memset(f, 0x3f, sizeof f);
    f[1][0] = 0;                            // 只到过点 0、停在 0，路程 0

    for (int S = 1; S < (1 << n); S++)      // 枚举集合（升序保证子集先算）
        for (int i = 0; i < n; i++)
        {
            if (!(S >> i & 1)) continue;    // i 必须已在集合内
            if (f[S][i] == 0x3f3f3f3f) continue;
            for (int j = 0; j < n; j++)
            {
                if (S >> j & 1) continue;   // ★j 必须尚未访问
                int T = S | (1 << j);       // 把 j 加入集合
                f[T][j] = min(f[T][j], f[S][i] + w[i][j]);
            }
        }

    cout << f[(1 << n) - 1][n - 1] << endl; // 走遍全集、停在点 n-1
    return 0;
}`;
var CODE_P1433 = `
#include <iostream>
#include <cmath>
#include <cstring>
#include <algorithm>
using namespace std;

int n;
double x[20], y[20];
double dist[20][20];
double f[1 << 16][16];       // 下标 0 代表原点 (0,0)，1..n 为奶酪

int main()
{
    cin >> n;
    x[0] = y[0] = 0;                        // 原点当作第 0 个点
    for (int i = 1; i <= n; i++)
        cin >> x[i] >> y[i];

    for (int i = 0; i <= n; i++)
        for (int j = 0; j <= n; j++)
            dist[i][j] = sqrt((x[i] - x[j]) * (x[i] - x[j])
                            + (y[i] - y[j]) * (y[i] - y[j]));

    int m = n + 1;                          // 连原点共 m 个点
    for (int S = 0; S < (1 << m); S++)
        for (int i = 0; i < m; i++) f[S][i] = 1e18;
    f[1][0] = 0;                            // 从原点出发

    for (int S = 1; S < (1 << m); S++)
        for (int i = 0; i < m; i++)
        {
            if (!(S >> i & 1) || f[S][i] > 1e17) continue;
            for (int j = 0; j < m; j++)
            {
                if (S >> j & 1) continue;
                int T = S | (1 << j);
                f[T][j] = min(f[T][j], f[S][i] + dist[i][j]);
            }
        }

    double ans = 1e18;
    for (int i = 1; i < m; i++)             // 吃完所有奶酪，停哪都行
        ans = min(ans, f[(1 << m) - 1][i]);
    printf("%.2f\\n", ans);
    return 0;
}`;
var CODE_P1171 = `
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

int n;
int w[25][25];
int f[1 << 20][25];

int main()
{
    cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            cin >> w[i][j];

    memset(f, 0x3f, sizeof f);
    f[1][0] = 0;                            // 从 1 号城市（下标 0）出发

    for (int S = 1; S < (1 << n); S++)
        for (int i = 0; i < n; i++)
        {
            if (!(S >> i & 1) || f[S][i] == 0x3f3f3f3f) continue;
            for (int j = 0; j < n; j++)
            {
                if (S >> j & 1) continue;
                int T = S | (1 << j);
                f[T][j] = min(f[T][j], f[S][i] + w[i][j]);
            }
        }

    int ans = 0x3f3f3f3f;
    for (int i = 1; i < n; i++)             // ★闭环：末尾必须再回到起点 0
        ans = min(ans, f[(1 << n) - 1][i] + w[i][0]);
    cout << ans << endl;
    return 0;
}`;
function BitTSP() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "走遍所有点，暴力为何不行"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"旅行商问题（TSP）：从起点出发，",
						/* @__PURE__ */ jsxs("strong", { children: [
							"不重不漏地走遍所有 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 个点"
						] }),
						"，让总路程最短。最直白的想法是枚举点的排列——",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个点有 ",
						/* @__PURE__ */ jsx(M, { children: "n!" }),
						" 种走法，",
						/* @__PURE__ */ jsx(M, { children: "n=12" }),
						" 已接近五亿，",
						/* @__PURE__ */ jsx(M, { children: "n=15" }),
						" 就上万亿，彻底不可行。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"但仔细想：走到某一步时，",
						/* @__PURE__ */ jsx("strong", { children: "接下来怎么走最优，只跟两件事有关" }),
						"——「",
						/* @__PURE__ */ jsx("strong", { children: "已经走过了哪些点" }),
						"」（一个集合）和「",
						/* @__PURE__ */ jsx("strong", { children: "此刻站在哪个点" }),
						"」。至于这些点是按什么顺序走到的，对未来毫无影响。这就把 ",
						/* @__PURE__ */ jsx(M, { children: "n!" }),
						" 条路径，坍缩成了「已访问集合 × 当前点」这么多状态。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(TspStateFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "TSP 状态两个维度：已访问集合 S（用比特点阵表示）+ 当前停留的点 i。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"「已访问集合」用",
						/* @__PURE__ */ jsx("strong", { children: "状态压缩" }),
						"再合适不过：",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个点的子集，正好是一个 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 位二进制数 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						"，第 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 位为 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						" 表示点 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 已访问。集合共 ",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 个，配上 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个「当前点」，状态总数 ",
						/* @__PURE__ */ jsx(M, { children: "2^n\\cdot n" }),
						"——",
						/* @__PURE__ */ jsx(M, { children: "n=18" }),
						" 也只有约 ",
						/* @__PURE__ */ jsx(M, { children: "470" }),
						" 万，可以承受。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：dp[S][i]"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
						"设 ",
						/* @__PURE__ */ jsx(M, { children: "dp[S][i]" }),
						" 表示：已经走过的点集合恰为 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						"、当前停在点 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 必属于 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						"）时，走出这条路径的",
						/* @__PURE__ */ jsx("strong", { children: "最短总长" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "转移。" }),
						"从 ",
						/* @__PURE__ */ jsx(M, { children: "dp[S][i]" }),
						" 出发，选一个",
						/* @__PURE__ */ jsx("strong", { children: "还没访问过" }),
						"的点 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						"（即第 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 位在 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 里是 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						"），走过去。新集合是 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 点亮第 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 位，当前点变成 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						"，路程加上 ",
						/* @__PURE__ */ jsx(M, { children: "dist(i,j)" }),
						"："
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(TspTransFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"从当前点 i 走向未访问点 j：集合并入 j，用 S ∪ ",
							"{j}",
							" 更新 dp[S∪",
							"{j}",
							"][j]。"
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsx(MB, { children: "dp[S\\cup\\{j\\}][j]=\\min\\big(dp[S\\cup\\{j\\}][j],\\ dp[S][i]+dist(i,j)\\big)" }), /* @__PURE__ */ jsxs("p", { children: [
						"边界：",
						/* @__PURE__ */ jsx(M, { children: "dp[\\{0\\}][0]=0" }),
						"（从点 0 出发，只到过点 0，路程 0）。答案：走遍全集后停在终点 ",
						/* @__PURE__ */ jsx(M, { children: "t" }),
						"，即 ",
						/* @__PURE__ */ jsx(M, { children: "dp[(1{<}{<}n)-1][t]" }),
						"。 实现时按 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 从小到大枚举——因为并入新点后 ",
						/* @__PURE__ */ jsx(M, { children: "S\\cup\\{j\\}>S" }),
						"，保证每个状态被用到时，它依赖的子状态已经算好。"
					] })]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"状压把「已访问哪些点」这个",
						/* @__PURE__ */ jsx("strong", { children: "集合" }),
						"编码成一个整数下标，于是「走过的历史」被压进 ",
						/* @__PURE__ */ jsx(M, { children: "dp" }),
						" 的第一维。",
						/* @__PURE__ */ jsx(M, { children: "n!" }),
						" 条排列坍缩为 ",
						/* @__PURE__ */ jsx(M, { children: "O(2^n\\cdot n)" }),
						" 个状态、每个状态 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						" 转移，总复杂度 ",
						/* @__PURE__ */ jsx(M, { children: "O(2^n\\cdot n^2)" }),
						"——这是 ",
						/* @__PURE__ */ jsx(M, { children: "n\\le 20" }),
						" 的 TSP 唯一可行的通用解法。"
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
						"取 ",
						/* @__PURE__ */ jsx(M, { children: "4" }),
						" 个点，起点为 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						"，看几个关键状态怎么被填出来。集合用 4 位二进制表示（最高位是点 3）："
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BitLattice, {
						bits: [
							1,
							1,
							0,
							0
						],
						labels: [
							"0",
							"1",
							"2",
							"3"
						],
						showBinary: false
					}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "集合 S = 0011：点 0、1 已访问，点 2、3 待访问（顶端为点编号）。"
					})]
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
									/* @__PURE__ */ jsx(M, { children: "dp[0001][0]=0" }),
									"——集合只含点 0，停在 0，路程 0。其余状态先设为 ",
									/* @__PURE__ */ jsx(M, { children: "+\\infty" }),
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
									/* @__PURE__ */ jsx("b", { children: "从 0 走到 1。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "j=1" }),
									" 未访问：",
									/* @__PURE__ */ jsx(M, { children: "dp[0011][1]=dp[0001][0]+dist(0,1)=dist(0,1)" }),
									"。集合从 ",
									/* @__PURE__ */ jsx(M, { children: "0001" }),
									" 点亮第 1 位成 ",
									/* @__PURE__ */ jsx(M, { children: "0011" }),
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
									/* @__PURE__ */ jsx("b", { children: "再从 1 走到 2。" }),
									" 现在 ",
									/* @__PURE__ */ jsx(M, { children: "S=0011" }),
									"、当前在 ",
									/* @__PURE__ */ jsx(M, { children: "1" }),
									"，去 ",
									/* @__PURE__ */ jsx(M, { children: "j=2" }),
									"：",
									/* @__PURE__ */ jsx(M, { children: "dp[0111][2]=dp[0011][1]+dist(1,2)" }),
									"。集合变 ",
									/* @__PURE__ */ jsx(M, { children: "0111" }),
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
									/* @__PURE__ */ jsx("b", { children: "收尾。" }),
									" 当 ",
									/* @__PURE__ */ jsx(M, { children: "S=1111" }),
									"（全走过）时，",
									/* @__PURE__ */ jsx(M, { children: "dp[1111][i]" }),
									" 就是「走遍四点、停在 ",
									/* @__PURE__ */ jsx(M, { children: "i" }),
									"」的最短路。开环 TSP 取 ",
									/* @__PURE__ */ jsx(M, { children: "\\min_i dp[1111][i]" }),
									" 即答案。"
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
						/* @__PURE__ */ jsx(M, { children: "dp[S][i]" }),
						" 直接铺成",
						/* @__PURE__ */ jsx("strong", { children: "网格" }),
						"：行是集合 mask，列是当前点。拖动小地图上的点、增删点数，看整张表怎么从起点一格格点亮。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "dp[S][i] 就是一张表"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx(M, { children: "dp[S][i]" }),
						" 有两个下标，天生就是",
						/* @__PURE__ */ jsx("strong", { children: "二维表格" }),
						"：把 ",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 个集合当作行、",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个当前点当作列。每一步转移，都是从某个已算好的格子，指向「集合更大一位、当前点为 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						"」的新格子。"
					] })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(TspDemo, {})
					})
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "开环还是闭环：一个 +dist(i,0) 的差别"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"上面求的是",
						/* @__PURE__ */ jsx("strong", { children: "Hamilton 路径" }),
						"——走遍所有点就结束，",
						/* @__PURE__ */ jsx("strong", { children: "不必回到起点" }),
						"，答案是 ",
						/* @__PURE__ */ jsx(M, { children: "\\min_i dp[(1{<}{<}n)-1][i]" }),
						"。这是「最短 Hamilton 路径」和「吃奶酪」的形态。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"但「售货员的难题」要求走一圈",
						/* @__PURE__ */ jsx("strong", { children: "回到出发城市" }),
						"——这是",
						/* @__PURE__ */ jsx("strong", { children: "闭环" }),
						" TSP（Hamilton 回路）。状态转移一模一样，只有最后一步不同：停在 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 后还得",
						/* @__PURE__ */ jsx("strong", { children: "补上回起点的边" }),
						"，答案变成 ",
						/* @__PURE__ */ jsx(M, { children: "\\min_i\\big(dp[(1{<}{<}n)-1][i]+dist(i,0)\\big)" }),
						"。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(OpenClosedFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "开环：走遍即止；闭环：末尾必须再加一条回到起点 0 的边（虚线）。差别只在收尾。"
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱：开环 / 闭环、有向 / 无向别混",
					children: [
						"闭环忘了 ",
						/* @__PURE__ */ jsx(M, { children: "+dist(i,0)" }),
						" 会算成开环，答案偏小；开环误加了回边则偏大。另外「售货员」是",
						/* @__PURE__ */ jsx("strong", { children: "有向图" }),
						"，",
						/* @__PURE__ */ jsx(M, { children: "dist(i,j)" }),
						" 未必等于 ",
						/* @__PURE__ */ jsx(M, { children: "dist(j,i)" }),
						"，转移里务必用",
						/* @__PURE__ */ jsx("strong", { children: "方向正确" }),
						"的那条边。起点固定为 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						" 是惯例——回路从哪点断开都一样，固定起点可省去一层枚举。"
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
					pid: "P10447",
					name: "最短 Hamilton 路径",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给定 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个点的带权无向图（",
								/* @__PURE__ */ jsx(M, { children: "n\\le 20" }),
								"），求从点 ",
								/* @__PURE__ */ jsx(M, { children: "0" }),
								" 到点 ",
								/* @__PURE__ */ jsx(M, { children: "n-1" }),
								"、恰好经过每个点各一次的最短路径长。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"TSP 状压",
								/* @__PURE__ */ jsx("strong", { children: "最纯的模板" }),
								"：没有坐标、没有几何，输入直接给邻接矩阵，让你把注意力全放在 ",
								/* @__PURE__ */ jsx(M, { children: "dp[S][i]" }),
								" 的状态设计和「枚举未访问点」的转移上。先立骨架就选它。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "状态 · 转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "dp[S][i]" }),
								"=走过 ",
								/* @__PURE__ */ jsx(M, { children: "S" }),
								"、停在 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 的最短路；",
								/* @__PURE__ */ jsx(M, { children: "dp[S\\cup\\{j\\}][j]=\\min(\\cdot,dp[S][i]+w_{ij})" }),
								"；",
								/* @__PURE__ */ jsx(M, { children: "O(2^n n^2)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P10447,
								luogu: "P10447"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1433",
					name: "吃奶酪",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"平面上 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 块奶酪（",
								/* @__PURE__ */ jsx(M, { children: "n\\le 15" }),
								"），老鼠从原点 ",
								/* @__PURE__ */ jsx(M, { children: "(0,0)" }),
								" 出发，求吃完所有奶酪走过的最短欧氏距离。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角",
							children: [
								"把",
								/* @__PURE__ */ jsx("strong", { children: "原点也当作一个点" }),
								"（编号 0），就化归为「从 0 出发的开环 TSP」，只是边权是",
								/* @__PURE__ */ jsx("strong", { children: "欧氏距离" }),
								"（用 ",
								/* @__PURE__ */ jsx(M, { children: "double" }),
								"）。题面亲切、坐标直观，是把抽象 TSP 落到几何上的最佳过渡。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1433,
								luogu: "P1433"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1171",
					name: "售货员的难题",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个村庄，售货员从",
								/* @__PURE__ */ jsx("strong", { children: "家（1 号）出发，走遍所有村庄再回到家" }),
								"，给定两两距离，求最短总路程（",
								/* @__PURE__ */ jsx(M, { children: "n\\le 20" }),
								"）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角",
							children: [
								"与前两题的关键差别：这是",
								/* @__PURE__ */ jsx("strong", { children: "闭环" }),
								"——末尾必须 ",
								/* @__PURE__ */ jsx(M, { children: "+dist(i,0)" }),
								" 回到起点。把它和开环并排，正好暴露「回不回起点」这个最常见的 TSP 坑。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1171,
								luogu: "P1171"
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
					pid: "P2831",
					name: "[NOIP2016 提高组] 愤怒的小鸟",
					hint: "换个集合含义：S=已消灭的猪的集合。预处理每条抛物线能打掉哪些猪（压成 mask），转移选一条线覆盖新猪——是 TSP 之外的「集合覆盖」状压，见下一类。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2915",
					name: "[USACO08NOV] Mixed Up Cows G",
					hint: "排列型集合状压，与 TSP 同构：f[S][i]=用完集合 S、末位是 i 的合法排列数，转移要求相邻编号差 > K。把「最短路」换成「计数」。"
				})
			]
		})
	] });
}
//#endregion
export { BitTSP as default };
