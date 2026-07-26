import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as SafeCaption } from "./SafeCaption-Be4RF0ZI.js";
import { n as PlaybackControls, t as useStepPlayer } from "./useStepPlayer-CZuIDieE.js";
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { c as bruteDistSum, f as layoutTree, l as buildTree, m as rerootFrames, n as CoefFigure, o as TwoPassFigure, p as rerootDistSum, s as TreeCanvas, t as BruteFigure } from "./RerootArt-BJig3uFo.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, MousePointerClick } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/reroot/RerootTwoPassDemo.tsx
var TREES = [
	{
		key: "chain",
		label: "链 (6 点)",
		n: 6,
		edges: [
			{
				u: 0,
				v: 1
			},
			{
				u: 1,
				v: 2
			},
			{
				u: 2,
				v: 3
			},
			{
				u: 3,
				v: 4
			},
			{
				u: 4,
				v: 5
			}
		]
	},
	{
		key: "star",
		label: "星形 (6 点)",
		n: 6,
		edges: [
			{
				u: 0,
				v: 1
			},
			{
				u: 0,
				v: 2
			},
			{
				u: 0,
				v: 3
			},
			{
				u: 0,
				v: 4
			},
			{
				u: 0,
				v: 5
			}
		]
	},
	{
		key: "bushy",
		label: "分叉树 (7 点)",
		n: 7,
		edges: [
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
		]
	}
];
function RerootTwoPassDemo() {
	const [treeKey, setTreeKey] = useState("bushy");
	const spec = TREES.find((t) => t.key === treeKey) ?? TREES[2];
	const { nodes, maxDepth, res, frames, brute } = useMemo(() => {
		const tree = buildTree(spec.n, spec.edges, 0);
		const { nodes, maxDepth } = layoutTree(tree);
		const res = rerootDistSum(tree, "unweighted");
		return {
			nodes,
			maxDepth,
			res,
			frames: rerootFrames(tree, res),
			brute: bruteDistSum(tree, "unweighted")
		};
	}, [spec]);
	const player = useStepPlayer(frames.length);
	const f = frames[Math.min(player.index, frames.length - 1)];
	const nodeStyle = (id) => {
		const isActive = f.active === id;
		const isRoot = f.rootHighlight === id;
		const szOn = f.szKnown[id];
		const distOn = f.distKnown[id];
		if (isActive) return {
			fill: "var(--grad-accent)",
			stroke: "var(--accent-1)",
			strokeWidth: 3,
			textFill: "var(--text-on-accent)",
			r: 23
		};
		if (f.phase === "pass1" || f.phase === "pass1done") return szOn ? {
			fill: "color-mix(in srgb, var(--viz-source) 16%, var(--surface-3))",
			stroke: "var(--viz-source)",
			strokeWidth: 2,
			textFill: "var(--text-1)"
		} : {
			fill: "var(--surface-3)",
			stroke: "var(--border-strong)",
			strokeWidth: 1.5,
			textFill: "var(--text-2)"
		};
		if (isRoot) return {
			fill: "color-mix(in srgb, var(--accent-1) 22%, var(--surface-3))",
			stroke: "var(--accent-1)",
			strokeWidth: 2.5,
			textFill: "var(--text-1)"
		};
		return distOn ? {
			fill: "color-mix(in srgb, var(--viz-chosen) 15%, var(--surface-3))",
			stroke: "var(--viz-chosen)",
			strokeWidth: 2,
			textFill: "var(--text-1)"
		} : {
			fill: "var(--surface-3)",
			stroke: "var(--border-strong)",
			strokeWidth: 1.5,
			textFill: "var(--text-2)"
		};
	};
	const edgeStyle = (child, parent) => {
		if (f.phase === "pass2" && f.active === child && f.fromParent === parent) return {
			stroke: "var(--accent-1)",
			strokeWidth: 3.5
		};
		return {
			stroke: "var(--border-strong)",
			strokeWidth: 1.8
		};
	};
	const subLabel = (id) => {
		if (f.phase === "intro") return null;
		if (f.phase === "pass1" || f.phase === "pass1done") return f.szKnown[id] ? `sz${res.sz[id]}` : null;
		return f.distKnown[id] ? `f${res.dist[id]}` : null;
	};
	const phasePill = f.phase === "pass1" || f.phase === "pass1done" ? /* @__PURE__ */ jsx("span", {
		className: "rr__phase p1",
		children: "第一遍 · 求 sz[]"
	}) : f.phase === "pass2" ? /* @__PURE__ */ jsx("span", {
		className: "rr__phase p2",
		children: "第二遍 · 换根"
	}) : f.phase === "done" ? /* @__PURE__ */ jsx("span", {
		className: "rr__phase p2",
		children: "完成 · O(n)"
	}) : /* @__PURE__ */ jsx("span", {
		className: "rr__phase",
		children: "准备"
	});
	const n = spec.n;
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "rr__toolbar",
			children: [/* @__PURE__ */ jsx("span", {
				className: "rr__toolbar-label",
				children: "选一棵树"
			}), /* @__PURE__ */ jsx("div", {
				className: "rr__tree-picker",
				role: "group",
				"aria-label": "选择树形",
				children: TREES.map((t) => /* @__PURE__ */ jsx("button", {
					className: `rr__tree-pill${t.key === treeKey ? " on" : ""}`,
					onClick: () => setTreeKey(t.key),
					"aria-pressed": t.key === treeKey,
					children: t.label
				}, t.key))
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "rr__phase-row",
			children: phasePill
		}),
		/* @__PURE__ */ jsx(PlaybackControls, {
			player,
			variant: "compact",
			label: "换根 DP 两遍扫描逐帧播放"
		}),
		/* @__PURE__ */ jsx("div", {
			className: "rr__stage",
			children: /* @__PURE__ */ jsx(TreeCanvas, {
				nodes,
				maxDepth,
				nodeStyle,
				edgeStyle,
				subLabel,
				ariaLabel: "换根 DP 两遍扫描：第一遍自底向上求子树大小，第二遍顺边换根"
			})
		}),
		/* @__PURE__ */ jsx(SafeCaption, {
			html: f.caption,
			className: "rr__caption"
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "rr__cmp",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "rr__cmp-card brute",
				children: [/* @__PURE__ */ jsx("div", {
					className: "k",
					children: "暴力 · 每点各跑一遍 BFS"
				}), /* @__PURE__ */ jsxs("div", {
					className: "v",
					children: [
						"O(n²) · 共访问 ",
						brute.ops,
						" 次"
					]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "rr__cmp-card reroot",
				children: [/* @__PURE__ */ jsx("div", {
					className: "k",
					children: "换根 · 两遍 DFS 合计"
				}), /* @__PURE__ */ jsxs("div", {
					className: "v",
					children: [
						"O(n) · 约 ",
						2 * n,
						" 步"
					]
				})]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "rr__dist-legend",
			children: [
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
					className: "sw",
					style: { background: "var(--viz-source)" }
				}), "第一遍点亮 = sz[] 已求"] }),
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
					className: "sw",
					style: { background: "var(--viz-chosen)" }
				}), "第二遍点亮 = 该点距离和已求"] }),
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
					className: "sw",
					style: { background: "var(--accent-1)" }
				}), "当前处理 / 当前根"] })
			]
		}),
		/* @__PURE__ */ jsxs("p", {
			style: {
				marginTop: "var(--sp-3)",
				fontSize: 13,
				color: "var(--text-3)"
			},
			children: [
				"暴力的 ",
				/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
				" 是「每个点都从头 BFS 一遍」；换根只走两遍 DFS 就把全部 ",
				/* @__PURE__ */ jsx(M, { children: "n" }),
				" 个点的答案填满。"
			]
		})
	] }, treeKey);
}
//#endregion
//#region src/content/e/RerootBasic.tsx
var CODE_P3478 = `
#include <iostream>
#include <vector>
using namespace std;
typedef long long ll;

const int N = 1000005;
int n;
vector<int> g[N];             // 邻接表
ll sz[N];                     // sz[u]：以 1 为根时 u 的子树节点数
ll f[N];                      // f[u]：以 u 为根时的深度和（距离和）
ll dep[N];                    // dep[u]：以 1 为根时 u 的深度

// 第一遍：后序求子树大小 sz[]，顺带累加 f[1] = Σ dep[i]
void dfs1(int u, int fa)
{
    sz[u] = 1;
    for (int v : g[u])
    {
        if (v == fa) continue;
        dep[v] = dep[u] + 1;
        dfs1(v, u);
        sz[u] += sz[v];       // 子必先算好——所以后序
    }
}

// 第二遍：前序换根 f[v] = f[u] + (n - 2*sz[v])
void dfs2(int u, int fa)
{
    for (int v : g[u])
    {
        if (v == fa) continue;
        f[v] = f[u] + (n - 2 * sz[v]);   // ★O(1) 换根：子树内 sz 个近 1，其余远 1
        dfs2(v, u);
    }
}

int main()
{
    cin >> n;
    for (int i = 1; i < n; i++)
    {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    dep[1] = 0;
    dfs1(1, 0);
    for (int i = 1; i <= n; i++)
        f[1] += dep[i];        // 以 1 为根的深度和 = 起点

    dfs2(1, 0);

    int best = 1;
    for (int i = 1; i <= n; i++)
        if (f[i] > f[best]) best = i;   // 本题求深度和最大的点

    cout << best << endl;
    return 0;
}`;
var CODE_P1395 = `
#include <iostream>
#include <vector>
using namespace std;
typedef long long ll;

const int N = 50005;
int n;
vector<int> g[N];
ll sz[N], f[N], dep[N];

void dfs1(int u, int fa)
{
    sz[u] = 1;
    for (int v : g[u])
    {
        if (v == fa) continue;
        dep[v] = dep[u] + 1;
        dfs1(v, u);
        sz[u] += sz[v];
    }
}

void dfs2(int u, int fa)
{
    for (int v : g[u])
    {
        if (v == fa) continue;
        f[v] = f[u] + (n - 2 * sz[v]);
        dfs2(v, u);
    }
}

int main()
{
    cin >> n;
    for (int i = 1; i < n; i++)
    {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    dfs1(1, 0);
    for (int i = 1; i <= n; i++) f[1] += dep[i];
    dfs2(1, 0);

    int best = 1;
    for (int i = 1; i <= n; i++)
        if (f[i] < f[best]) best = i;   // 会议：求距离和最小的点
    cout << best << " " << f[best] << endl;
    return 0;
}`;
function RerootBasic() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "同一个量，要对「每个点」都算一遍"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"换根 DP 解决这样一类问题：给一棵",
						/* @__PURE__ */ jsx("strong", { children: "无根树" }),
						"，要对",
						/* @__PURE__ */ jsx("strong", { children: "每一个点" }),
						"，都算出「把它当根时的某个量」—— 比如「它到所有其它点的距离之和」「它的子树深度和」。注意关键词是",
						/* @__PURE__ */ jsx("strong", { children: "每一个点" }),
						"：不是求一个全局最优，而是要 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个答案。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"先看最朴素的想法：",
						/* @__PURE__ */ jsx("strong", { children: "枚举每个点当根，各自跑一遍遍历" }),
						"。以某点为根做一次 BFS/DFS，就能得到它到全树的距离和，",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						"。 但要对 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个点都这么做，总共就是 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						"。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BruteFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "暴力：把每个点轮流当根，各自从头遍历一遍——同样的树被反复走了 n 遍，总计 O(n²)。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx(M, { children: "n\\le 10^6" }),
						" 时 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 直接爆炸。可这 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 遍遍历里藏着",
						/* @__PURE__ */ jsx("strong", { children: "大量重复" }),
						"： 相邻两个点当根，绝大多数点到它们的距离只差了「一步」。换根 DP 正是要抓住这个「只差一步」， 让相邻根之间 ",
						/* @__PURE__ */ jsx(M, { children: "O(1)" }),
						" 递推，把 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 压回 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
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
					children: "两遍 DFS：先立地基，再顺边换根"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"换根 DP 的骨架是",
						/* @__PURE__ */ jsx("strong", { children: "两遍 DFS" }),
						"，以「深度和 / 距离和」为例（每条边长 1、每个点算 1）："
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(TwoPassFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "第一遍后序（叶→根）求子树大小 sz[]，第二遍前序（根→叶）顺着边把根一路换下去——两遍合计 O(n)。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "第一遍 · 后序，固定一个根（记作 1）。" }),
						"求出每个点的子树大小",
						" ",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[u]" }),
						"（= 它自己 + 各孩子子树大小之和）。因为父要用到子的结果，必须",
						/* @__PURE__ */ jsx("strong", { children: "子先于父" }),
						"，所以是后序。 顺手把固定根的距离和 ",
						/* @__PURE__ */ jsx(M, { children: "f[1]=\\sum_i \\mathrm{dep}(1,i)" }),
						" 也累加出来——这是唯一一个「老实一层层加」得到的答案，作为",
						/* @__PURE__ */ jsx("strong", { children: "换根的起点" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "第二遍 · 前序，从根出发把根「挪」给每个孩子。" }),
						"关键是想清楚：根从 ",
						/* @__PURE__ */ jsx(M, { children: "u" }),
						" 挪到相邻的孩子 ",
						/* @__PURE__ */ jsx(M, { children: "v" }),
						" 时，距离和怎么变？"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(CoefFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "根 u→v：v 的子树里 sz[v] 个点各近 1 步（−sz），其余 n−sz[v] 个点各远 1 步（+）。净变化 = n − 2·sz[v]。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"把根从 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 移到孩子 ",
							/* @__PURE__ */ jsx(M, { children: "v" }),
							"，相当于所有点相对根「整体挪了一条边」：",
							/* @__PURE__ */ jsxs("strong", { children: [
								"落在 ",
								/* @__PURE__ */ jsx(M, { children: "v" }),
								" 子树里的 ",
								/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[v]" }),
								" 个点，离新根近了 1"
							] }),
							"；",
							/* @__PURE__ */ jsxs("strong", { children: [
								"其余 ",
								/* @__PURE__ */ jsx(M, { children: "n-\\mathrm{sz}[v]" }),
								" 个点，离新根远了 1"
							] }),
							"。于是"
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[v]=f[u]+\\big(n-\\mathrm{sz}[v]\\big)-\\mathrm{sz}[v]=f[u]+\\big(n-2\\,\\mathrm{sz}[v]\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"一次加法就把 ",
							/* @__PURE__ */ jsx(M, { children: "f[v]" }),
							" 算出来了。沿树前序递归，每条边做一次这样的 ",
							/* @__PURE__ */ jsx(M, { children: "O(1)" }),
							" 更新，走完就得到",
							/* @__PURE__ */ jsx("strong", { children: "所有点" }),
							"的答案。 边界：起点 ",
							/* @__PURE__ */ jsx(M, { children: "f[1]" }),
							" 由第一遍给出。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"换根 DP = 「固定根的一份答案」+「相邻根之间的 ",
						/* @__PURE__ */ jsx(M, { children: "O(1)" }),
						" 增量」。第一遍 DFS 花 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						" 立好地基（",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[]" }),
						" 与起点 ",
						/* @__PURE__ */ jsx(M, { children: "f[\\text{root}]" }),
						"）， 第二遍 DFS 用 ",
						/* @__PURE__ */ jsx(M, { children: "f[v]=f[u]+\\Delta" }),
						" 把答案沿边「传染」出去。把 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 次独立遍历，换成一次遍历里 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个相互推导的增量。"
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
						"用一条 ",
						/* @__PURE__ */ jsx("strong", { children: "5 个点的链" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "1-2-3-4-5" }),
						" 手推（无权，求每点距离和）。固定根取 1："
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
									/* @__PURE__ */ jsx("b", { children: "第一遍求 sz。" }),
									"从叶子 5 往上：",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[5]=1,\\ \\mathrm{sz}[4]=2,\\ \\mathrm{sz}[3]=3,\\ \\mathrm{sz}[2]=4,\\ \\mathrm{sz}[1]=5" }),
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
									"以 1 为根，深度为 ",
									/* @__PURE__ */ jsx(M, { children: "0,1,2,3,4" }),
									"，距离和 ",
									/* @__PURE__ */ jsx(M, { children: "f[1]=0+1+2+3+4=10" }),
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
									/* @__PURE__ */ jsx("b", { children: "换根 1→2。" }),
									/* @__PURE__ */ jsx(M, { children: "n=5,\\ \\mathrm{sz}[2]=4" }),
									"，系数 ",
									/* @__PURE__ */ jsx(M, { children: "5-2\\times4=-3" }),
									"。",
									/* @__PURE__ */ jsx(M, { children: "f[2]=f[1]+(-3)=10-3=7" }),
									"。 （2 那侧 4 个点各近 1，只有点 1 远 1，净 ",
									/* @__PURE__ */ jsx(M, { children: "-3" }),
									"，合理。）"
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "step",
							children: [/* @__PURE__ */ jsx("span", {
								className: "step__n",
								children: "4"
							}), /* @__PURE__ */ jsxs("div", {
								className: "step__b",
								children: [
									/* @__PURE__ */ jsx("b", { children: "继续换到底。" }),
									/* @__PURE__ */ jsx(M, { children: "f[3]=f[2]+(5-2\\times3)=7-1=6" }),
									"；",
									/* @__PURE__ */ jsx(M, { children: "f[4]=f[3]+(5-2\\times2)=6+1=7" }),
									"；",
									/* @__PURE__ */ jsx(M, { children: "f[5]=f[4]+(5-2\\times1)=7+3=10" }),
									"。 最小在",
									/* @__PURE__ */ jsx("strong", { children: "中点 3" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "f[3]=6" }),
									"）——正是链的重心，符合直觉。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把这",
						/* @__PURE__ */ jsx("strong", { children: "两遍扫描逐帧放给你看" }),
						"：先看 sz[] 自底向上点亮，再看根顺着边一步步换、每步只做一次加法。换棵树试试。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看两遍扫描跑起来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(RerootTwoPassDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "写法要点：无根树、任取一根、别回头"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"换根题的输入几乎都是",
						/* @__PURE__ */ jsx("strong", { children: "无根树" }),
						"（只给 ",
						/* @__PURE__ */ jsx(M, { children: "n-1" }),
						" 条无向边）。实现时统一套路： 用 ",
						/* @__PURE__ */ jsx(M, { children: "\\text{vector<int> g[N]}" }),
						" 存",
						/* @__PURE__ */ jsx("strong", { children: "双向" }),
						"邻接表，DFS 时传一个 ",
						/* @__PURE__ */ jsx(M, { children: "\\text{fa}" }),
						"（父亲）参数， 遇到 ",
						/* @__PURE__ */ jsx(M, { children: "v==\\text{fa}" }),
						" 就跳过——这样就把无向图当有根树遍历，不会走回头路。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"两遍 DFS 都从固定根 1 出发：",
						/* @__PURE__ */ jsx(M, { children: "\\text{dfs1}" }),
						" 后序累加 ",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}" }),
						"（递归返回后再 ",
						/* @__PURE__ */ jsx(M, { children: "+=" }),
						" 子树），",
						/* @__PURE__ */ jsx(M, { children: "\\text{dfs2}" }),
						" 前序换根（先算 ",
						/* @__PURE__ */ jsx(M, { children: "f[v]" }),
						" 再递归进 ",
						/* @__PURE__ */ jsx(M, { children: "v" }),
						"，保证父答案已就绪）。",
						/* @__PURE__ */ jsx(M, { children: "n\\le 10^6" }),
						" 时递归可能栈深较大——洛谷默认栈够用，实在担心可手写栈迭代。"
					] })]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "易错点",
					children: [
						"换根的增量必须用",
						/* @__PURE__ */ jsxs("strong", { children: ["「相对固定根 1」算出的 ", /* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[v]" })] }),
						"（第一遍那套）， 而不是「相对当前根」。第二遍前序时每个 ",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[v]" }),
						" 都是固定值，别在换根途中去改它。 另外距离和常常爆 ",
						/* @__PURE__ */ jsx(M, { children: "int" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "n=10^6" }),
						" 时和可达 ",
						/* @__PURE__ */ jsx(M, { children: "10^{12}" }),
						"），",
						/* @__PURE__ */ jsxs("strong", { children: ["全程开 ", /* @__PURE__ */ jsx(M, { children: "\\text{long long}" })] }),
						"。"
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(Gamepad2, { size: 18 }),
						"想直接上手？到 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/e",
							style: {
								color: "var(--accent-1)",
								fontWeight: 600
							},
							children: "E 部分页的「换根巡礼」"
						}),
						"点节点当根，实时看距离和，再点「看 DP 最优」一次算出全部点、找出重心。"
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
					pid: "P3478",
					name: "[POI2008] STA-Station",
					src: "POI 2008",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给一棵 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个点的树，找一个点作根，使",
								/* @__PURE__ */ jsx("strong", { children: "所有点的深度之和最大" }),
								"，输出这个点。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"换根 DP 的",
								/* @__PURE__ */ jsx("strong", { children: "官方模板题" }),
								"：深度和 = 距离和，转移就是最干净的",
								" ",
								/* @__PURE__ */ jsx(M, { children: "f[v]=f[u]+(n-2\\,\\mathrm{sz}[v])" }),
								"。本题求",
								/* @__PURE__ */ jsx("strong", { children: "最大" }),
								"（越浅的点当根、越多点被拉深）， 正好和「会议」求最小对照——同一个 ",
								/* @__PURE__ */ jsx(M, { children: "f[]" }),
								"，一个取 max、一个取 min。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[1]=\\sum \\mathrm{dep}(1,i)" }),
								" 起步，",
								/* @__PURE__ */ jsx(M, { children: "f[v]=f[u]+(n-2\\,\\mathrm{sz}[v])" }),
								" 换根；两遍 DFS，",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。",
								/* @__PURE__ */ jsx(M, { children: "n\\le 10^6" }),
								" 必开 ",
								/* @__PURE__ */ jsx(M, { children: "\\text{long long}" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（两遍 DFS · 求最大）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P3478,
								luogu: "P3478"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1395",
					name: "会议",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"树上 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个点，选一个点开会，使",
								/* @__PURE__ */ jsx("strong", { children: "所有点到它的距离和最小" }),
								"，输出该点与最小距离和。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"无权距离和 = 深度和，与 P3478 是",
								/* @__PURE__ */ jsxs("strong", { children: ["同一个 ", /* @__PURE__ */ jsx(M, { children: "f[]" })] }),
								"，只是这里取 ",
								/* @__PURE__ */ jsx(M, { children: "\\min" }),
								"。",
								/* @__PURE__ */ jsx(M, { children: "n\\le 5\\times10^4" }),
								"——足以卡掉 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								" 的每点重算，是「从暴力过渡到换根」最好的一题。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（换 max 为 min）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1395,
								luogu: "P1395"
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
					pid: "P2986",
					name: "[USACO10MAR] Great Cow Gathering G",
					hint: "带权 + 带边权距离和：换根系数升级为 w·(W − 2·sz)，sz 改成子树『牛数』之和。见下一类型精讲。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P3047",
					name: "[USACO12FEB] Nearby Cows G",
					hint: "距离 ≤ k 的点权和：状态多一维 dp[u][j]，换根要『父贡献减去自身子树贡献』。见『子树内外合并』。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1364",
					name: "医院设置",
					hint: "n≤100，可先写 O(n²) 暴力对拍，再用换根 O(n) 验证——最适合亲手体会两种复杂度的落差。"
				})
			]
		})
	] });
}
//#endregion
export { RerootBasic as default };
