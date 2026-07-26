import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { a as InOutFigure, f as layoutTree, i as EccentricityFigure, l as buildTree, s as TreeCanvas, u as eccentricity } from "./RerootArt-BJig3uFo.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MousePointerClick } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/reroot/RerootEccDemo.tsx
var N = 8;
var EDGES = [
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
		u: 2,
		v: 5
	},
	{
		u: 5,
		v: 6
	},
	{
		u: 1,
		v: 7
	}
];
function RerootEccDemo() {
	const [sel, setSel] = useState(2);
	const { nodes, maxDepth, ecc } = useMemo(() => {
		const tree = buildTree(N, EDGES, 0);
		const { nodes, maxDepth } = layoutTree(tree);
		return {
			tree,
			nodes,
			maxDepth,
			ecc: eccentricity(tree)
		};
	}, []);
	const nodeStyle = (id) => {
		if (id === sel) return {
			fill: "var(--grad-accent)",
			stroke: "var(--accent-1)",
			strokeWidth: 3,
			textFill: "var(--text-on-accent)",
			r: 23
		};
		if (id === ecc.center) return {
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
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "rr__hint",
			children: [
				"点任意节点，看它的",
				/* @__PURE__ */ jsx("strong", { children: "偏心距" }),
				"（到最远点的距离）= max(向下最长链 down, 向上最长链 up)。 绿圈是偏心距",
				/* @__PURE__ */ jsx("strong", { children: "最小" }),
				"的点 = 树的",
				/* @__PURE__ */ jsx("strong", { children: "中心" }),
				"（半径 ",
				/* @__PURE__ */ jsx("b", { children: ecc.radius }),
				"）， 全树最大偏心距 = ",
				/* @__PURE__ */ jsx("strong", { children: "直径" }),
				" ",
				/* @__PURE__ */ jsx("b", { children: ecc.diameter }),
				"。"
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "rr__stage",
			children: /* @__PURE__ */ jsx(TreeCanvas, {
				nodes,
				maxDepth,
				nodeStyle,
				edgeStyle,
				subLabel: (id) => `e${ecc.ecc[id]}`,
				onNodeClick: setSel,
				ariaLabel: "点节点看它的偏心距，绿圈为树的中心"
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "rr__split",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "rr__split-card down",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "k",
						children: [
							"向下最长链 down1[",
							sel + 1,
							"]"
						]
					}), /* @__PURE__ */ jsx("div", {
						className: "v",
						children: ecc.down1[sel]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rr__split-card up",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "k",
						children: [
							"向上最长链 up[",
							sel + 1,
							"]（父方向）"
						]
					}), /* @__PURE__ */ jsx("div", {
						className: "v",
						children: ecc.up[sel]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rr__split-card tot",
					children: [/* @__PURE__ */ jsx("div", {
						className: "k",
						children: "偏心距 = max(down, up)"
					}), /* @__PURE__ */ jsxs("div", {
						className: "v",
						children: [
							"max(",
							ecc.down1[sel],
							", ",
							ecc.up[sel],
							") = ",
							ecc.ecc[sel]
						]
					})]
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "rr__caption",
			children: [
				"节点 ",
				/* @__PURE__ */ jsx("b", {
					style: { color: "var(--accent-1)" },
					children: sel + 1
				}),
				" 到最远点的距离是 ",
				/* @__PURE__ */ jsx("b", { children: ecc.ecc[sel] }),
				"。 它由两支较量决出：往子树里最深走 ",
				/* @__PURE__ */ jsx(M, { children: "\\mathrm{down}" }),
				"，或经父亲往树的其余部分最远走 ",
				/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}" }),
				"，取较大者。",
				/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}" }),
				" 正是换根第二遍求的——把「父的最长链（避开自己这支）」加一条边传下来。",
				sel === ecc.center && /* @__PURE__ */ jsx("strong", { children: "　它就是当前的中心（偏心距最小）。" })
			]
		})
	] });
}
//#endregion
//#region src/content/e/RerootCenter.tsx
var CODE_ECC = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 100005;
int n;
vector<int> g[N];
int down1[N], down2[N], best[N], up[N];   // 向下最长/次长链、贡献最长的孩子、向上最长链
int ecc[N];                                // 偏心距 = max(down1, up)

// 第一遍：后序求每点向下最长/次长链
void dfs1(int u, int fa)
{
    down1[u] = down2[u] = 0;
    best[u] = -1;
    for (int v : g[u])
    {
        if (v == fa) continue;
        dfs1(v, u);
        int cand = down1[v] + 1;      // 经孩子 v 向下最长
        if (cand > down1[u])
        {
            down2[u] = down1[u];
            down1[u] = cand;
            best[u] = v;
        }
        else if (cand > down2[u])
            down2[u] = cand;
    }
}

// 第二遍：前序求向上最长链 up[]，合成偏心距
void dfs2(int u, int fa)
{
    for (int v : g[u])
    {
        if (v == fa) continue;
        // v 往上：父的 up 或父『避开 v 这支』的最长向下链，取大 + 1
        int uDown = (best[u] == v) ? down2[u] : down1[u];
        up[v] = max(up[u], uDown) + 1;
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
    up[1] = 0;
    dfs2(1, 0);

    int center = 1;
    for (int i = 1; i <= n; i++)
    {
        ecc[i] = max(down1[i], up[i]);        // 每点到最远点的距离
        if (ecc[i] < ecc[center]) center = i; // 偏心距最小 = 树的中心
    }

    cout << center << " " << ecc[center] << endl;  // 中心及其偏心距（半径）
    return 0;
}`;
var CODE_P1364 = `
#include <iostream>
#include <vector>
using namespace std;
typedef long long ll;

const int N = 105;
int n;
ll c[N];
vector<int> g[N];
ll sz[N], f[N], W;

void dfs1(int u, int fa, ll dep)
{
    sz[u] = c[u];
    f[1] += c[u] * dep;
    for (int v : g[u]) if (v != fa) { dfs1(v, u, dep + 1); sz[u] += sz[v]; }
}

void dfs2(int u, int fa)
{
    for (int v : g[u]) if (v != fa)
    {
        f[v] = f[u] + (W - 2 * sz[v]);   // 逐点距离和：换根一次性求全
        dfs2(v, u);
    }
}

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        int l, r;
        cin >> c[i] >> l >> r;
        W += c[i];
        if (l) { g[i].push_back(l); g[l].push_back(i); }
        if (r) { g[i].push_back(r); g[r].push_back(i); }
    }
    dfs1(1, 0, 0);
    dfs2(1, 0);

    ll ans = f[1];
    for (int i = 2; i <= n; i++) ans = min(ans, f[i]);   // 逐点统计后取最优
    cout << ans << endl;
    return 0;
}`;
function RerootCenter() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "给每个点算「到最远点有多远」"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"换根的第三类目标是",
						/* @__PURE__ */ jsx("strong", { children: "偏心量" }),
						"：对每个点 ",
						/* @__PURE__ */ jsx(M, { children: "u" }),
						"，求它的",
						/* @__PURE__ */ jsx("strong", { children: "偏心距" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{ecc}[u]" }),
						" = 「",
						/* @__PURE__ */ jsx(M, { children: "u" }),
						" 到树上最远点的距离」。偏心距最小的点就是",
						/* @__PURE__ */ jsx("strong", { children: "树的中心" }),
						"，最小值叫",
						/* @__PURE__ */ jsx("strong", { children: "半径" }),
						"； 所有偏心距里的最大值 = ",
						/* @__PURE__ */ jsx("strong", { children: "树的直径" }),
						"（最长链长度）。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"又是「对每个点都要一个答案」的形状。朴素做法照旧 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						"（每点各 BFS 求最远）。 换根 DP 把它压到 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						"：每个点的最远点，要么在",
						/* @__PURE__ */ jsx("strong", { children: "它的子树里（向下）" }),
						"，要么在",
						/* @__PURE__ */ jsx("strong", { children: "子树外（经父亲向上）" }),
						"——两支取较大。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(EccentricityFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "每点标 e = 偏心距（到最远点的边数）。绿圈是偏心距最小的中心；虚线是直径（最长链 1↔5，长 4）。"
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "与 F 部分·直径/重心 DP 的分工",
					children: [
						"「树的直径」本身有一套",
						/* @__PURE__ */ jsx("strong", { children: "固定根一遍 DFS" }),
						" 的经典求法（子树最深链 + 次深链拼出过点最长路径）， 那是 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/f/diameter",
							style: { color: "var(--accent-2)" },
							children: "F 部分·直径 / 重心 DP"
						}),
						" 的主场，含完整推导。",
						/* @__PURE__ */ jsx("strong", { children: "本页站在换根视角" }),
						"：不止求「一条直径」，而是",
						/* @__PURE__ */ jsx("strong", { children: "给每个点都算出偏心距" }),
						"（二次扫描逐点求最远），两页互补——先在 F 学会「一条最长链」，再来这里学「每点的最远」。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "两遍扫描：向下最长链 + 向上最长链"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "第一遍 · 后序，求「向下最长链」。" }),
							"对每个点 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							"，记它子树内向下的",
							/* @__PURE__ */ jsxs("strong", { children: ["最长链 ", /* @__PURE__ */ jsx(M, { children: "\\mathrm{down1}[u]" })] }),
							" 和",
							/* @__PURE__ */ jsxs("strong", { children: ["次长链 ", /* @__PURE__ */ jsx(M, { children: "\\mathrm{down2}[u]" })] }),
							"（次长必须来自与最长",
							/* @__PURE__ */ jsx("strong", { children: "不同的孩子" }),
							"）。为什么要次长？换根时可能要「避开某个孩子」，届时就得退而求其次。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "第二遍 · 前序，求「向上最长链」。" }),
							"孩子 ",
							/* @__PURE__ */ jsx(M, { children: "v" }),
							" 经父 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 往上能走多远？ 两条候选：走 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 自己的向上链 ",
							/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[u]" }),
							"，或走 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 的",
							/* @__PURE__ */ jsxs("strong", { children: [
								"「避开 ",
								/* @__PURE__ */ jsx(M, { children: "v" }),
								" 那支」的向下最长链"
							] }),
							"—— 若 ",
							/* @__PURE__ */ jsx(M, { children: "v" }),
							" 恰是贡献 ",
							/* @__PURE__ */ jsx(M, { children: "\\mathrm{down1}[u]" }),
							" 的那个孩子，就只能用 ",
							/* @__PURE__ */ jsx(M, { children: "\\mathrm{down2}[u]" }),
							"，否则用 ",
							/* @__PURE__ */ jsx(M, { children: "\\mathrm{down1}[u]" }),
							"。取较大再加这条边："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\mathrm{up}[v]=\\max\\big(\\mathrm{up}[u],\\ \\mathrm{down\\text{-}except}_v[u]\\big)+w(u,v)" }),
						/* @__PURE__ */ jsx("p", { children: "合成偏心距：" }),
						/* @__PURE__ */ jsx(MB, { children: "\\mathrm{ecc}[u]=\\max\\big(\\mathrm{down1}[u],\\ \\mathrm{up}[u]\\big)" })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(InOutFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "和内外合并同构：down（子树内向下）第一遍备好，up（父方向向上）第二遍由父传子。偏心距取两者较大。"
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"「每点偏心距」就是「每点的最远」这个换根问题。第一遍备好",
						/* @__PURE__ */ jsx("strong", { children: "向下最长/次长两条链" }),
						"， 第二遍把",
						/* @__PURE__ */ jsx("strong", { children: "向上最长链" }),
						"沿边传下去；「避开自己那支」正是换根一贯的",
						/* @__PURE__ */ jsx("strong", { children: "「父贡献减去本孩子子树」" }),
						"—— 只不过这里的聚合是取 ",
						/* @__PURE__ */ jsx(M, { children: "\\max" }),
						" 而非求和。有了每点偏心距，中心 / 半径 / 直径一并落袋。"
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
						"主链 ",
						/* @__PURE__ */ jsx(M, { children: "1-2-3-4-5" }),
						" 加一个分支 ",
						/* @__PURE__ */ jsx(M, { children: "3-6" }),
						"（无权）。固定根 1，逐步："
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
									/* @__PURE__ */ jsx("b", { children: "第一遍 down1。" }),
									"叶子 5、6 的 ",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{down1}=0" }),
									"；",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{down1}[4]=1,\\ \\mathrm{down1}[3]=\\max(1{+}1,\\,0{+}1)=2" }),
									"（走 4 那支）；",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{down1}[2]=3,\\ \\mathrm{down1}[1]=4" }),
									"。点 3 的 ",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{down2}[3]=1" }),
									"（来自分支 6）。"
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
									/* @__PURE__ */ jsx("b", { children: "根 up = 0。" }),
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[1]=0" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{ecc}[1]=\\max(4,0)=4" }),
									"（最远到点 5）。"
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
									/* @__PURE__ */ jsx("b", { children: "换根往下传 up。" }),
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[2]=\\max(\\mathrm{up}[1],\\,0)+1=\\max(0,0)+1=1" }),
									"（式中第二项 ",
									/* @__PURE__ */ jsx(M, { children: "0" }),
									" = 节点 1 避开 2 那支的向下最长链）；",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[3]=\\max(\\mathrm{up}[2],0)+1=2" }),
									"；",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{ecc}[3]=\\max(\\mathrm{down1}[3],\\mathrm{up}[3])=\\max(2,2)=2" }),
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
									/* @__PURE__ */ jsx("b", { children: "找中心。" }),
									"算完全部：偏心距为 ",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{ecc}=[4,3,2,3,4,3]" }),
									"，最小在",
									/* @__PURE__ */ jsx("strong", { children: "点 3" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{ecc}=2" }),
									"）—— 树的中心，半径 2；最大偏心距 4 = 直径长度。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面点任一节点，看它的偏心距如何由",
						/* @__PURE__ */ jsx("strong", { children: "向下 down 与向上 up 两支较量" }),
						"决出，绿圈标出全树中心。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看每点偏心距与中心"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(RerootEccDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "逐点统计是换根的通用形"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"回头看：距离和、距离分层点权和、偏心距——它们表面差别很大，但换根的",
						/* @__PURE__ */ jsx("strong", { children: "骨架完全一样" }),
						"： 第一遍后序把「子树内的某个聚合」备好，第二遍前序用「",
						/* @__PURE__ */ jsx("strong", { children: "父的信息减去本孩子那份，再沿边合并" }),
						"」把「子树外」补齐， 每点答案 = 内 + 外。变的只是",
						/* @__PURE__ */ jsx("strong", { children: "聚合方式" }),
						"：求和（距离和 / 点权和）还是取 ",
						/* @__PURE__ */ jsx(M, { children: "\\max" }),
						"（偏心距）。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"像「医院设置」（",
						/* @__PURE__ */ jsx(M, { children: "n\\le100" }),
						"）这类，本质就是",
						/* @__PURE__ */ jsx("strong", { children: "逐点距离和统计" }),
						"：换根一遍求出每个点作医院的总代价，再取最优。 换根让你把「对每个候选点各评估一次」的 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 收成 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						"——这正是换根 DP 最通用的用途。"
					] })]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "易错点",
					children: [
						"求偏心距务必维护",
						/* @__PURE__ */ jsxs("strong", { children: ["次长链 ", /* @__PURE__ */ jsx(M, { children: "\\mathrm{down2}" })] }),
						" 与「贡献最长链的孩子编号」：换根到那个孩子时必须",
						/* @__PURE__ */ jsx("strong", { children: "避开它自己" }),
						"、改用次长，否则会把「自己走出去又走回来」的假链算进最远。 「避开自己那支」是所有 ",
						/* @__PURE__ */ jsx(M, { children: "\\max" }),
						" 型换根的通病，格外小心。"
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
					pid: "P1099",
					name: "[NOIP2007 提高组] 树网的核",
					src: "NOIP 2007",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"在树的某条",
								/* @__PURE__ */ jsx("strong", { children: "直径" }),
								"上取一段长度不超过 ",
								/* @__PURE__ */ jsx(M, { children: "s" }),
								" 的路径（「核」），使",
								/* @__PURE__ */ jsx("strong", { children: "全树到这段核的最大距离（偏心距）最小" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角（本页站换根/逐点偏心距）",
							children: [
								"本题集",
								/* @__PURE__ */ jsx("strong", { children: "直径 + 中心 + 最小偏心距" }),
								"于一身。",
								/* @__PURE__ */ jsxs("strong", { children: [
									"直径三件套的完整推导在",
									" ",
									/* @__PURE__ */ jsx(Link, {
										to: "/part/f/diameter",
										style: { color: "var(--accent-2)" },
										children: "F 部分·直径 / 重心 DP"
									})
								] }),
								"； 这里我们用换根的眼光看它的另一半——",
								/* @__PURE__ */ jsx("strong", { children: "二次扫描求「每个点到最远点的距离」" }),
								"（偏心距）， 为「核」的偏心量评估提供逐点数据。两页互补：F 讲怎么求出那条最长链，本页讲怎么对每个点都得到偏心距。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"两遍 DFS 求 ",
								/* @__PURE__ */ jsx(M, { children: "\\mathrm{down1}/\\mathrm{down2}/\\mathrm{up}" }),
								" → 每点 ",
								/* @__PURE__ */ jsx(M, { children: "\\mathrm{ecc}[u]=\\max(\\mathrm{down1}[u],\\mathrm{up}[u])" }),
								"； 结合直径上滑动取核，整体 ",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"～",
								/* @__PURE__ */ jsx(M, { children: "O(n\\log n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（换根求每点偏心距 · 中心与半径）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_ECC,
								luogu: "P1099"
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
						/* @__PURE__ */ jsx(Field, {
							k: "题意",
							children: "带居民数的树，选一点设医院使加权距离和最小。"
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么再选它",
							children: [
								"换根「",
								/* @__PURE__ */ jsx("strong", { children: "逐点统计" }),
								"」用途的最小样例：一遍换根算出",
								/* @__PURE__ */ jsx("strong", { children: "每个点" }),
								"作医院的距离和，再逐点取最优。",
								/* @__PURE__ */ jsx(M, { children: "n\\le100" }),
								"，还能与 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								" 暴力对拍，收束整个 E 部分「每点一个答案」的主线。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[v]=f[u]+(W-2\\,\\mathrm{sz}[v])" }),
								" 逐点求距离和；两遍 DFS，",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（换根逐点距离和）",
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
					pid: "P3574",
					name: "[POI2014] FAR-FarmCraft",
					hint: "拔高：遍历顺序 + 换根最小化『最晚装好』的瓶颈。子树内先算最优遍历代价，换根定每点作起点的答案。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1364",
					name: "医院设置",
					hint: "先写 O(n²) 暴力拿分，再换根 O(n) 对拍——亲手确认逐点统计的两法一致。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1099",
					name: "[NOIP2007 提高组] 树网的核",
					hint: "自测：先按 F 部分求出直径与每点偏心距，再在直径上滑动窗口取长度≤s 的核。"
				})
			]
		})
	] });
}
//#endregion
export { RerootCenter as default };
