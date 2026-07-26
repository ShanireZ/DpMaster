import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { f as layoutTree, l as buildTree, n as CoefFigure, p as rerootDistSum, r as DistSetupFigure, s as TreeCanvas, t as BruteFigure } from "./RerootArt-BJig3uFo.js";
import { useMemo, useState } from "react";
import { MousePointerClick } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/reroot/RerootDistDemo.tsx
var N = 7;
var EDGES = [
	{
		u: 0,
		v: 1
	},
	{
		u: 0,
		v: 2
	},
	{
		u: 1,
		v: 3
	},
	{
		u: 1,
		v: 4
	},
	{
		u: 2,
		v: 5
	},
	{
		u: 2,
		v: 6
	}
];
var WEIGHT = [
	1,
	3,
	1,
	2,
	1,
	4,
	1
];
function RerootDistDemo() {
	const [mode, setMode] = useState("unweighted");
	const [rootSel, setRootSel] = useState(0);
	const wt = mode === "nodeWeighted" ? WEIGHT : new Array(N).fill(1);
	const { nodes, maxDepth, distAll, best, bestNode, W, treeRooted, resRooted } = useMemo(() => {
		const res0 = rerootDistSum(buildTree(N, EDGES, 0, wt), mode);
		const tR = buildTree(N, EDGES, rootSel, wt);
		const resR = rerootDistSum(tR, mode);
		const { nodes, maxDepth } = layoutTree(tR);
		return {
			nodes,
			maxDepth,
			distAll: res0.dist,
			best: res0.best,
			bestNode: res0.bestNode,
			W: res0.totalW,
			treeRooted: tR,
			resRooted: resR
		};
	}, [
		mode,
		rootSel,
		wt
	]);
	const distOfSel = distAll[rootSel];
	const nodeStyle = (id) => {
		const isRoot = id === rootSel;
		const isBest = id === bestNode;
		if (isRoot) return {
			fill: "var(--grad-accent)",
			stroke: "var(--accent-1)",
			strokeWidth: 3,
			textFill: "var(--text-on-accent)",
			r: 23
		};
		if (isBest) return {
			fill: "color-mix(in srgb, var(--viz-chosen) 20%, var(--surface-3))",
			stroke: "var(--viz-chosen)",
			strokeWidth: 2.5,
			textFill: "var(--text-1)"
		};
		return {
			fill: "var(--surface-3)",
			stroke: "var(--border-strong)",
			strokeWidth: 1.5,
			textFill: "var(--text-1)"
		};
	};
	const edgeStyle = () => ({
		stroke: "var(--border-strong)",
		strokeWidth: 1.8
	});
	const subLabel = (id) => {
		if (mode === "nodeWeighted") return `w${wt[id]}·d${distAll[id]}`;
		return `d${distAll[id]}`;
	};
	const childRows = treeRooted.children[rootSel].map((c) => ({
		c,
		sz: resRooted.sz[c],
		out: W - resRooted.sz[c],
		coef: W - 2 * resRooted.sz[c]
	}));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "rr__toolbar",
			children: [/* @__PURE__ */ jsx("span", {
				className: "rr__toolbar-label",
				children: "模式"
			}), /* @__PURE__ */ jsxs("div", {
				className: "rr__tree-picker",
				role: "group",
				"aria-label": "选择模式",
				children: [/* @__PURE__ */ jsx("button", {
					className: `rr__tree-pill${mode === "unweighted" ? " on" : ""}`,
					onClick: () => setMode("unweighted"),
					"aria-pressed": mode === "unweighted",
					children: "无权（每点算 1）"
				}), /* @__PURE__ */ jsx("button", {
					className: `rr__tree-pill${mode === "nodeWeighted" ? " on" : ""}`,
					onClick: () => setMode("nodeWeighted"),
					"aria-pressed": mode === "nodeWeighted",
					children: "点权（点上带数量）"
				})]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "rr__hint",
			children: [
				"点任意节点，把它设成",
				/* @__PURE__ */ jsx("strong", { children: "根" }),
				"——立刻显示",
				/* @__PURE__ */ jsx("strong", { children: "它到所有其它点的距离和" }),
				"。 绿圈是使距离和",
				/* @__PURE__ */ jsx("strong", { children: "最小" }),
				"的点（",
				/* @__PURE__ */ jsxs("b", { children: ["d = ", best] }),
				"），也就是树的",
				mode === "nodeWeighted" ? "带权" : "",
				"重心方向。"
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "rr__stage",
			children: /* @__PURE__ */ jsx(TreeCanvas, {
				nodes,
				maxDepth,
				nodeStyle,
				edgeStyle,
				subLabel,
				onNodeClick: setRootSel,
				ariaLabel: "点节点把它设为根，看它到所有其它点的距离和"
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "rr__split",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "rr__split-card tot",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "k",
						children: [
							"当前根 = 节点 ",
							rootSel + 1,
							" 的距离和"
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "v",
						children: [
							"d[",
							rootSel + 1,
							"] = ",
							distOfSel
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rr__split-card down",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "k",
						children: ["总点权 W ", mode === "nodeWeighted" ? "（各点数量之和）" : "（= 点数 n）"]
					}), /* @__PURE__ */ jsxs("div", {
						className: "v",
						children: ["W = ", W]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rr__split-card up",
					children: [/* @__PURE__ */ jsx("div", {
						className: "k",
						children: "最小距离和（重心）"
					}), /* @__PURE__ */ jsxs("div", {
						className: "v",
						children: [
							"节点 ",
							bestNode + 1,
							" · d = ",
							best
						]
					})]
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "rr__caption",
			children: [
				"以 ",
				/* @__PURE__ */ jsxs("b", {
					style: { color: "var(--accent-1)" },
					children: ["节点 ", rootSel + 1]
				}),
				" 为根，往它的每个孩子换根时的系数",
				" ",
				/* @__PURE__ */ jsx(M, { children: "W-2\\cdot \\mathrm{sz}" }),
				"：",
				/* @__PURE__ */ jsx("div", {
					className: "rr__layer-tags",
					children: childRows.length === 0 ? /* @__PURE__ */ jsx("span", {
						className: "rr__layer-tag",
						children: "它是叶子，没有向下的孩子可换根"
					}) : childRows.map((r) => /* @__PURE__ */ jsxs("span", {
						className: "rr__layer-tag",
						children: [
							"→ 子 ",
							r.c + 1,
							"：子树内 ",
							r.sz,
							"、外 ",
							r.out,
							"，系数 = ",
							W,
							" − 2×",
							r.sz,
							" =",
							" ",
							/* @__PURE__ */ jsx("b", {
								style: { color: r.coef < 0 ? "var(--viz-chosen)" : "var(--viz-invalid)" },
								children: r.coef
							})
						]
					}, r.c))
				}),
				/* @__PURE__ */ jsxs("p", {
					style: {
						margin: "10px 0 0",
						fontSize: 13,
						color: "var(--text-3)"
					},
					children: [
						"系数为",
						/* @__PURE__ */ jsx("span", {
							style: { color: "var(--viz-chosen)" },
							children: "负"
						}),
						"（子树内点权 > 一半）→ 往那边挪根",
						/* @__PURE__ */ jsx("strong", { children: "更优" }),
						"； 为",
						/* @__PURE__ */ jsx("span", {
							style: { color: "var(--viz-invalid)" },
							children: "正"
						}),
						"→ 挪过去更差。顺着「负系数」的方向一路走，就走到重心。"
					]
				})
			]
		})
	] });
}
//#endregion
//#region src/content/e/RerootDistSum.tsx
var CODE_P2986 = `
#include <iostream>
#include <vector>
using namespace std;
typedef long long ll;

const int N = 100005;
int n;
struct E { int to; ll w; };
vector<E> g[N];
ll c[N];                      // c[u]：点 u 的牛数（点权）
ll sz[N];                     // sz[u]：子树内牛数之和（不是节点数！）
ll W;                         // 总牛数
ll f[N];                      // f[u]：把 u 当集合点时的带权距离和

// 第一遍：sz[u] = 子树牛数和；f[1] 顺带累加（子树 c 走 w 到 1）
void dfs1(int u, int fa, ll dep)
{
    sz[u] = c[u];
    f[1] += c[u] * dep;       // 以 1 为根：u 的牛各走 dep 到 1
    for (E e : g[u])
    {
        if (e.to == fa) continue;
        dfs1(e.to, u, dep + e.w);
        sz[u] += sz[e.to];
    }
}

// 第二遍：换根 f[v] = f[u] + w*(W - 2*sz[v])
void dfs2(int u, int fa)
{
    for (E e : g[u])
    {
        if (e.to == fa) continue;
        // 子树 v 的 sz[v] 头牛各近 w，其余 W - sz[v] 头牛各远 w
        f[e.to] = f[u] + e.w * (W - 2 * sz[e.to]);
        dfs2(e.to, u);
    }
}

int main()
{
    cin >> n;
    W = 0;
    for (int i = 1; i <= n; i++) { cin >> c[i]; W += c[i]; }
    for (int i = 1; i < n; i++)
    {
        int a, b; ll w;
        cin >> a >> b >> w;
        g[a].push_back({b, w});
        g[b].push_back({a, w});
    }

    dfs1(1, 0, 0);
    dfs2(1, 0);

    ll ans = f[1];
    for (int i = 2; i <= n; i++) ans = min(ans, f[i]);
    cout << ans << endl;
    return 0;
}`;
var CODE_P1364 = `
#include <iostream>
#include <vector>
using namespace std;
typedef long long ll;

const int N = 105;
int n;
ll c[N];                      // 该点居民数
vector<int> g[N];
ll sz[N], f[N], W;

void dfs1(int u, int fa, ll dep)
{
    sz[u] = c[u];
    f[1] += c[u] * dep;
    for (int v : g[u])
    {
        if (v == fa) continue;
        dfs1(v, u, dep + 1);   // 医院设置边权=1
        sz[u] += sz[v];
    }
}

void dfs2(int u, int fa)
{
    for (int v : g[u])
    {
        if (v == fa) continue;
        f[v] = f[u] + (W - 2 * sz[v]);   // 无边权，系数即 W - 2*sz[v]
        dfs2(v, u);
    }
}

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        int l, r;
        cin >> c[i] >> l >> r;   // 居民数、左儿子、右儿子（0 表示无）
        W += c[i];
        if (l) { g[i].push_back(l); g[l].push_back(i); }
        if (r) { g[i].push_back(r); g[r].push_back(i); }
    }

    dfs1(1, 0, 0);
    dfs2(1, 0);

    ll ans = f[1];
    for (int i = 2; i <= n; i++) ans = min(ans, f[i]);
    cout << ans << endl;
    return 0;
}`;
function RerootDistSum() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "从「无权」到「带权」的距离和"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"上一节的「距离和」默认每条边长 1、每个点算 1。真实题目常常带",
						/* @__PURE__ */ jsx("strong", { children: "两种权" }),
						"：",
						/* @__PURE__ */ jsx("strong", { children: "点权" }),
						"（每个村庄住着不同人数 / 每个牧场有不同头数的牛）与",
						/* @__PURE__ */ jsx("strong", { children: "边权" }),
						"（路的长短不一）。 目标变成：选一个",
						/* @__PURE__ */ jsx("strong", { children: "集合点" }),
						"，使",
						/* @__PURE__ */ jsx("strong", { children: "所有人赶来的总路程最小" }),
						"—— 也就是 ",
						/* @__PURE__ */ jsx(M, { children: "\\sum_v c_v\\cdot \\mathrm{dis}(u,v)" }),
						" 最小，其中 ",
						/* @__PURE__ */ jsx(M, { children: "c_v" }),
						" 是点 ",
						/* @__PURE__ */ jsx(M, { children: "v" }),
						" 的人数、",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{dis}" }),
						" 是带边权的树上距离。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(DistSetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "带点权的树：每个点标 ×w 表示人数/牛数。集合点要让「人数 × 距离」的加权总和最小。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"朴素解还是「枚举每个点当集合点，各跑一遍带权 BFS/最短路累加」——",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						"。 换根 DP 的思路完全不变，只是",
						/* @__PURE__ */ jsxs("strong", { children: [
							"把「点数」换成「点权和」、把「1 步」换成「边权 ",
							/* @__PURE__ */ jsx(M, { children: "w" }),
							" 步」"
						] }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BruteFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "同样地，暴力对每个集合点各算一遍加权总距离——n 遍，O(n²)，大树上不可行。"
					})]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "换根系数：把「点数」升级成「点权和」"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"重新定义两个量：",
						/* @__PURE__ */ jsx(M, { children: "W=\\sum_v c_v" }),
						" 是",
						/* @__PURE__ */ jsx("strong", { children: "总点权" }),
						"；",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[u]" }),
						" 改成 ",
						/* @__PURE__ */ jsx("strong", { children: "子树内点权之和" }),
						"（不再是节点数）。 第一遍后序：",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[u]=c_u+\\sum_{c\\in son}\\mathrm{sz}[c]" }),
						"，并累加固定根的加权距离和 ",
						/* @__PURE__ */ jsx(M, { children: "f[1]" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(CoefFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "根 u→v 走一条长 w 的边：v 子树内的点权 sz[v] 各近 w，其余 W−sz[v] 各远 w。系数乘上边权 w。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"根从 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 挪到孩子 ",
							/* @__PURE__ */ jsx(M, { children: "v" }),
							"（这条边长 ",
							/* @__PURE__ */ jsx(M, { children: "w" }),
							"）时：",
							/* @__PURE__ */ jsx(M, { children: "v" }),
							" 子树内那 ",
							/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[v]" }),
							" 的点权，每单位都",
							/* @__PURE__ */ jsxs("strong", { children: ["近了 ", /* @__PURE__ */ jsx(M, { children: "w" })] }),
							"； 其余 ",
							/* @__PURE__ */ jsx(M, { children: "W-\\mathrm{sz}[v]" }),
							" 的点权，每单位都",
							/* @__PURE__ */ jsxs("strong", { children: ["远了 ", /* @__PURE__ */ jsx(M, { children: "w" })] }),
							"。于是带权换根方程："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[v]=f[u]+w\\cdot\\big(\\,(W-\\mathrm{sz}[v])-\\mathrm{sz}[v]\\,\\big)=f[u]+w\\cdot\\big(W-2\\,\\mathrm{sz}[v]\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"无权是它的特例：",
							/* @__PURE__ */ jsx(M, { children: "c_v\\equiv1" }),
							" 时 ",
							/* @__PURE__ */ jsx(M, { children: "W=n" }),
							"、",
							/* @__PURE__ */ jsx(M, { children: "w\\equiv1" }),
							"，方程退回 ",
							/* @__PURE__ */ jsx(M, { children: "f[v]=f[u]+(n-2\\,\\mathrm{sz}[v])" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"距离和换根的通式是 ",
						/* @__PURE__ */ jsx(M, { children: "f[v]=f[u]+w\\cdot(W-2\\,\\mathrm{sz}[v])" }),
						"：",
						/* @__PURE__ */ jsxs("strong", { children: [/* @__PURE__ */ jsx(M, { children: "W" }), " 是「有多少东西要移动」"] }),
						"（点权和），",
						/* @__PURE__ */ jsxs("strong", { children: [
							/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[v]" }),
							" 是「往 ",
							/* @__PURE__ */ jsx(M, { children: "v" }),
							" 那边挪时有多少东西变近」"
						] }),
						"，",
						/* @__PURE__ */ jsxs("strong", { children: [/* @__PURE__ */ jsx(M, { children: "w" }), " 是「每样东西挪动的步长」"] }),
						"。 把这三者填对，无权 / 点权 / 边权就是同一份代码。"
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
						"小例子：一条链 ",
						/* @__PURE__ */ jsx(M, { children: "1-2-3" }),
						"，点权 ",
						/* @__PURE__ */ jsx(M, { children: "c=[1,1,4]" }),
						"（点 3 上住了 4 个人），边权都为 1。总点权 ",
						/* @__PURE__ */ jsx(M, { children: "W=6" }),
						"。固定根 1："
					] })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "steps",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "step",
							children: [/* @__PURE__ */ jsx("span", {
								className: "step__n",
								children: "1"
							}), /* @__PURE__ */ jsxs("div", {
								className: "step__b",
								children: [
									/* @__PURE__ */ jsx("b", { children: "第一遍 sz（点权和）。" }),
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[3]=4,\\ \\mathrm{sz}[2]=4+1=5,\\ \\mathrm{sz}[1]=6=W" }),
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
									/* @__PURE__ */ jsx("b", { children: "起点 f[1]。" }),
									"点 1、2、3 到根 1 的距离是 ",
									/* @__PURE__ */ jsx(M, { children: "0,1,2" }),
									"，加权和 ",
									/* @__PURE__ */ jsx(M, { children: "f[1]=1\\cdot0+1\\cdot1+4\\cdot2=9" }),
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
									/* @__PURE__ */ jsx("b", { children: "换根 1→2。" }),
									"系数 ",
									/* @__PURE__ */ jsx(M, { children: "W-2\\,\\mathrm{sz}[2]=6-2\\times5=-4" }),
									"。",
									/* @__PURE__ */ jsx(M, { children: "f[2]=9+(-4)=5" }),
									"。 （2 那侧点权 5 各近 1，只有点 1 的权 1 远 1，净 ",
									/* @__PURE__ */ jsx(M, { children: "-4" }),
									"。）"
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
									/* @__PURE__ */ jsx("b", { children: "换根 2→3。" }),
									"系数 ",
									/* @__PURE__ */ jsx(M, { children: "6-2\\times4=-2" }),
									"。",
									/* @__PURE__ */ jsx(M, { children: "f[3]=5+(-2)=3" }),
									"。 最小在",
									/* @__PURE__ */ jsx("strong", { children: "点 3" }),
									"——人最多的地方，把会开在那儿最省，符合直觉。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面切换「无权 / 点权」两种模式，点节点当集合点看加权距离和，并盯住每个孩子的",
						/* @__PURE__ */ jsx("strong", { children: "换根系数正负" }),
						"——负号指向更优的方向。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "点节点，看距离和实时变"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(RerootDistDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "n 小时：拿暴力给换根「对拍」"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"像「医院设置」这种 ",
						/* @__PURE__ */ jsx(M, { children: "n\\le 100" }),
						" 的题，暴力 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						"（对每个点 BFS 累加）",
						/* @__PURE__ */ jsx("strong", { children: "也能过" }),
						"。 这反而是好事：你可以先写暴力拿到分，再写换根 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						"，两者",
						/* @__PURE__ */ jsx("strong", { children: "输出必须完全一致" }),
						"—— 这是验证换根系数没写错的最省心办法。等题目把 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 放大到 ",
						/* @__PURE__ */ jsx(M, { children: "10^5,10^6" }),
						"，暴力挂了，你手里的换根已经拍过、可靠。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"「医院设置」输入按",
						/* @__PURE__ */ jsx("strong", { children: "二叉树的左右儿子" }),
						"给出，但换根不关心二叉不二叉——照样建无向邻接表，当一般树跑两遍 DFS 即可。"
					] })]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "易错点",
					children: [
						"带权时 ",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[u]" }),
						" 是",
						/* @__PURE__ */ jsx("strong", { children: "子树点权和" }),
						"而非节点数——初值要写 ",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[u]=c_u" }),
						"，不是 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						"。 换根系数别忘了",
						/* @__PURE__ */ jsxs("strong", { children: ["乘边权 ", /* @__PURE__ */ jsx(M, { children: "w" })] }),
						"。加权距离和更容易爆 ",
						/* @__PURE__ */ jsx(M, { children: "int" }),
						"，全程 ",
						/* @__PURE__ */ jsx(M, { children: "\\text{long long}" }),
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
					children: "例题"
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2986",
					name: "[USACO10MAR] Great Cow Gathering G",
					src: "USACO 2010",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个牧场连成树，牧场 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 有 ",
								/* @__PURE__ */ jsx(M, { children: "c_i" }),
								" 头牛，边有长度。选一个牧场聚会，使",
								/* @__PURE__ */ jsx("strong", { children: "所有牛走的总路程最小" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"距离和换根的",
								/* @__PURE__ */ jsx("strong", { children: "完整形态" }),
								"：点权（牛数）与边权（路长）",
								/* @__PURE__ */ jsx("strong", { children: "同时" }),
								"进入系数",
								" ",
								/* @__PURE__ */ jsx(M, { children: "w\\cdot(W-2\\,\\mathrm{sz}[v])" }),
								"。把它吃透，无权 / 只带点权 / 只带边权都是它的简化。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[u]=c_u+\\sum \\mathrm{sz}[son]" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "f[v]=f[u]+w(W-2\\,\\mathrm{sz}[v])" }),
								"；两遍 DFS，",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"，必开 ",
								/* @__PURE__ */ jsx(M, { children: "\\text{long long}" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（点权 + 边权换根）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2986,
								luogu: "P2986"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1364",
					name: "医院设置",
					src: "洛谷原生",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"带居民数的二叉树，选一点设医院，使",
								/* @__PURE__ */ jsx("strong", { children: "所有居民到医院的距离 × 人数" }),
								"之和最小。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n\\le100" }),
								"，是",
								/* @__PURE__ */ jsx("strong", { children: "「暴力 ↔ 换根」对照" }),
								"的最佳载体：既能 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								" 每点 BFS，也能 ",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								" 换根， 两法对拍验证。输入是左右儿子，但建成无向邻接表后当一般带点权树处理即可（边权恒 1）。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（换根 · 边权 1）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1364,
								luogu: "P1364"
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
					pid: "P1395",
					name: "会议",
					hint: "无权距离和求最小——本节通式里令 c≡1、w≡1 的最简特例，先拿它热身。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P3478",
					name: "[POI2008] STA-Station",
					hint: "深度和求最大：同一 f[]，把 min 换成 max。n≤10⁶ 提醒你 long long 与两遍 DFS 的常数。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2986",
					name: "[USACO10MAR] Great Cow Gathering G",
					hint: "自测变形：试着把边权全设为 1 再跑，验证结果与『只带点权』的手算一致。"
				})
			]
		})
	] });
}
//#endregion
export { RerootDistSum as default };
