import { n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { a as InOutFigure, d as inOutDecompose, f as layoutTree, l as buildTree, o as TwoPassFigure, s as TreeCanvas } from "./RerootArt-BJig3uFo.js";
import { useMemo, useState } from "react";
import { MousePointerClick } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/reroot/RerootInOutDemo.tsx
var N = 8;
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
		u: 3,
		v: 5
	},
	{
		u: 2,
		v: 6
	},
	{
		u: 2,
		v: 7
	}
];
function RerootInOutDemo() {
	const [sel, setSel] = useState(1);
	const { tree, nodes, maxDepth, io, inSub } = useMemo(() => {
		const tree = buildTree(N, EDGES, 0);
		const { nodes, maxDepth } = layoutTree(tree);
		const io = inOutDecompose(tree);
		const inSub = new Array(N).fill(false);
		const stack = [sel];
		while (stack.length) {
			const u = stack.pop();
			inSub[u] = true;
			for (const c of tree.children[u]) stack.push(c);
		}
		return {
			tree,
			nodes,
			maxDepth,
			io,
			inSub
		};
	}, [sel]);
	const nodeStyle = (id) => {
		if (id === sel) return {
			fill: "var(--grad-accent)",
			stroke: "var(--accent-1)",
			strokeWidth: 3,
			textFill: "var(--text-on-accent)",
			r: 23
		};
		return inSub[id] ? {
			fill: "color-mix(in srgb, var(--viz-source) 16%, var(--surface-3))",
			stroke: "var(--viz-source)",
			strokeWidth: 2,
			textFill: "var(--text-1)"
		} : {
			fill: "color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))",
			stroke: "color-mix(in srgb, var(--accent-1) 55%, var(--border-strong))",
			strokeWidth: 1.8,
			textFill: "var(--text-1)"
		};
	};
	const edgeStyle = (child) => {
		return inSub[child] ? {
			stroke: "var(--viz-source)",
			strokeWidth: 2.4
		} : {
			stroke: "var(--border-strong)",
			strokeWidth: 1.6
		};
	};
	const down = io.down[sel];
	const up = io.up[sel];
	const dist = io.dist[sel];
	const parent = tree.parent[sel];
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "rr__hint",
			children: [
				"固定根 = 节点 1。点任意节点，把它的距离和拆成两块：",
				/* @__PURE__ */ jsx("span", {
					style: { color: "var(--viz-source)" },
					children: "子树内（向下，down）"
				}),
				" +",
				" ",
				/* @__PURE__ */ jsx("span", {
					style: { color: "var(--accent-1)" },
					children: "子树外（父方向，up）"
				}),
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
				subLabel: (id) => id === sel ? null : inSub[id] ? "内" : "外",
				onNodeClick: setSel,
				ariaLabel: "点节点，把它的距离和拆成子树内与子树外两部分"
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
							"子树内 down[",
							sel + 1,
							"]（向下）"
						]
					}), /* @__PURE__ */ jsx("div", {
						className: "v",
						children: down
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rr__split-card up",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "k",
						children: [
							"子树外 up[",
							sel + 1,
							"]（父方向）"
						]
					}), /* @__PURE__ */ jsx("div", {
						className: "v",
						children: up
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rr__split-card tot",
					children: [/* @__PURE__ */ jsx("div", {
						className: "k",
						children: "距离和 = 内 + 外"
					}), /* @__PURE__ */ jsxs("div", {
						className: "v",
						children: [
							down,
							" + ",
							up,
							" = ",
							dist
						]
					})]
				})
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "rr__caption",
			children: parent < 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("b", { children: [
					"节点 ",
					sel + 1,
					" 是根"
				] }),
				"：它没有「子树外」，",
				/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}=0" }),
				"，距离和就等于向下的",
				" ",
				/* @__PURE__ */ jsxs("b", { children: ["down = ", down] }),
				"。这是换根的",
				/* @__PURE__ */ jsx("strong", { children: "起点" }),
				"。"
			] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
				"换根到 ",
				/* @__PURE__ */ jsxs("b", { children: ["节点 ", sel + 1] }),
				" 时，它的「子树外」",
				/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[u]" }),
				" 要从父亲",
				" ",
				/* @__PURE__ */ jsxs("b", { children: ["节点 ", parent + 1] }),
				" 那里回推：父亲的全部信息里，",
				/* @__PURE__ */ jsx("strong", { children: "减去「本来朝着自己这棵子树」的那部分" }),
				"， 剩下的就是 ",
				/* @__PURE__ */ jsx(M, { children: "u" }),
				" 的父方向贡献。子树内 ",
				/* @__PURE__ */ jsx(M, { children: "\\mathrm{down}" }),
				" 在第一遍后序里已备好， 子树外 ",
				/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}" }),
				" 在第二遍前序里由父传子——两者一合并，",
				/* @__PURE__ */ jsxs("b", { children: [
					"dist[",
					sel + 1,
					"] = ",
					dist
				] }),
				"。"
			] })
		})
	] });
}
//#endregion
//#region src/content/e/RerootInOut.tsx
var CODE_P3047 = `
#include <iostream>
#include <vector>
using namespace std;

const int N = 100005;
int n, k;
vector<int> g[N];
long long val[N];             // 点权
long long dp[N][21];          // dp[u][j]：只在 u 子树内，距 u 恰为 j 的点权和

// 第一遍：子树内的分层点权和（后序）
void dfs1(int u, int fa)
{
    dp[u][0] = val[u];
    for (int v : g[u])
    {
        if (v == fa) continue;
        dfs1(v, u);
        for (int j = 1; j <= k; j++)
            dp[u][j] += dp[v][j - 1];   // 子树 v 里距 v 为 j-1 的点，距 u 就是 j
    }
}

// 第二遍：换根，把『父方向』的分层点权补进来（前序）
void dfs2(int u, int fa)
{
    for (int v : g[u])
    {
        if (v == fa) continue;
        // ★先扣除重复：父 u 距 j-2 的层里，含了『经 v 又回来』的 dp[v][j-2]
        for (int j = k; j >= 2; j--)
            dp[u][j] -= dp[v][j - 2];   // 撤销自身子树对父这一层的贡献
        for (int j = 1; j <= k; j++)
            dp[v][j] += dp[u][j - 1];   // 再把父方向（此刻的 dp[u]）下推给 v
        // 复原 dp[u]，供 u 的其它孩子换根时仍是『完整的 u』
        for (int j = 2; j <= k; j++)
            dp[u][j] += dp[v][j - 2];
        dfs2(v, u);
    }
}

int main()
{
    cin >> n >> k;
    for (int i = 1; i < n; i++)
    {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }
    for (int i = 1; i <= n; i++) cin >> val[i];

    dfs1(1, 0);
    dfs2(1, 0);

    for (int i = 1; i <= n; i++)
    {
        long long s = 0;
        for (int j = 0; j <= k; j++) s += dp[i][j];   // 距 i 不超过 k 的点权和
        cout << s << endl;
    }
    return 0;
}`;
function RerootInOut() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "每个点的答案 = 子树内 + 子树外"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"前两节的距离和，换根系数是一句 ",
						/* @__PURE__ */ jsx(M, { children: "n-2\\,\\mathrm{sz}" }),
						" 就搞定的",
						/* @__PURE__ */ jsx("strong", { children: "标量" }),
						"。但很多换根题的「答案」是一个更复杂的东西—— 比如 ",
						/* @__PURE__ */ jsxs("strong", { children: [
							"「距离不超过 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							" 的点权和」"
						] }),
						"，它天然分成两截："
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"固定一个根后，任一点 ",
						/* @__PURE__ */ jsx(M, { children: "u" }),
						" 的答案 = ",
						/* @__PURE__ */ jsxs("strong", { children: ["子树内贡献 ", /* @__PURE__ */ jsx(M, { children: "\\mathrm{down}[u]" })] }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "u" }),
						" 往下的部分） + ",
						/* @__PURE__ */ jsxs("strong", { children: ["子树外贡献 ", /* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[u]" })] }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "u" }),
						" 经父亲往「树的其余部分」的那截）。 子树内的一截，第一遍后序就能直接算；难点全在",
						/* @__PURE__ */ jsxs("strong", { children: [
							"子树外那一截怎么 ",
							/* @__PURE__ */ jsx(M, { children: "O(1)" }),
							" 补上"
						] }),
						"。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(InOutFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "u 的答案分两块：向下的 down[u]（第一遍后序备好）+ 父方向的 up[u]（第二遍前序由父传子补上）。"
					})]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "父贡献减去「自己那一份」：换根的核心操作"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"换根到孩子 ",
							/* @__PURE__ */ jsx(M, { children: "v" }),
							" 时，它的「子树外」",
							/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[v]" }),
							" 要从父亲 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 借。 但不能直接把 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 的全部信息给 ",
							/* @__PURE__ */ jsx(M, { children: "v" }),
							"——因为 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 的信息里，",
							/* @__PURE__ */ jsxs("strong", { children: [
								"有一部分正是「朝着 ",
								/* @__PURE__ */ jsx(M, { children: "v" }),
								" 这棵子树」的"
							] }),
							"， 对 ",
							/* @__PURE__ */ jsx(M, { children: "v" }),
							" 来说那属于「子树内」，会重复计算。"
						] }),
						/* @__PURE__ */ jsx("p", { children: "核心操作就一句话：" }),
						/* @__PURE__ */ jsxs("p", {
							style: {
								textAlign: "center",
								fontWeight: 600,
								margin: "var(--sp-3) 0",
								color: "var(--text-1)"
							},
							children: [
								"父方向给 ",
								/* @__PURE__ */ jsx(M, { children: "v" }),
								" 的贡献 = （父 ",
								/* @__PURE__ */ jsx(M, { children: "u" }),
								" 的完整信息） − （朝 ",
								/* @__PURE__ */ jsx(M, { children: "v" }),
								" 子树的那一份）"
							]
						}),
						/* @__PURE__ */ jsxs("p", { children: [
							"以「距离分层点权和」",
							/* @__PURE__ */ jsx(M, { children: "dp[u][j]" }),
							"（子树内距 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 恰为 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 的点权和）为例，换根 ",
							/* @__PURE__ */ jsx(M, { children: "u\\to v" }),
							" 分三步："
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(TwoPassFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "仍是两遍 DFS：第一遍后序把每层的子树内点权和堆好，第二遍前序换根时「先扣重复、再合并、后复原」。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "① 扣重复：" }),
						"父 ",
						/* @__PURE__ */ jsx(M, { children: "u" }),
						" 距 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 的层里，混进了「从 ",
						/* @__PURE__ */ jsx(M, { children: "u" }),
						" 走到 ",
						/* @__PURE__ */ jsx(M, { children: "v" }),
						" 再拐回 ",
						/* @__PURE__ */ jsx(M, { children: "v" }),
						" 子树、距 ",
						/* @__PURE__ */ jsx(M, { children: "j-2" }),
						"」的点，即 ",
						/* @__PURE__ */ jsx(M, { children: "dp[v][j-2]" }),
						"；先减掉。",
						/* @__PURE__ */ jsx("br", {}),
						/* @__PURE__ */ jsx("strong", { children: "② 合并下推：" }),
						"此刻的 ",
						/* @__PURE__ */ jsx(M, { children: "dp[u][\\cdot]" }),
						" 已是「",
						/* @__PURE__ */ jsx(M, { children: "v" }),
						" 看出去的父方向」，把它的 ",
						/* @__PURE__ */ jsx(M, { children: "j-1" }),
						" 层加到 ",
						/* @__PURE__ */ jsx(M, { children: "dp[v][j]" }),
						"——父方向的点距 ",
						/* @__PURE__ */ jsx(M, { children: "v" }),
						" 要多走一步。",
						/* @__PURE__ */ jsx("br", {}),
						/* @__PURE__ */ jsx("strong", { children: "③ 复原：" }),
						"把 ① 减掉的加回去，让 ",
						/* @__PURE__ */ jsx(M, { children: "dp[u]" }),
						" 恢复成「完整的 ",
						/* @__PURE__ */ jsx(M, { children: "u" }),
						"」，供 ",
						/* @__PURE__ */ jsx(M, { children: "u" }),
						" 的",
						/* @__PURE__ */ jsx("strong", { children: "其它孩子" }),
						"换根时继续用。"
					] })
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"子树内外合并型换根，把 ",
						/* @__PURE__ */ jsx("strong", { children: "「父的完整信息」减去「本孩子子树贡献」" }),
						" 得到父方向，再合并进孩子—— 这就是「",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[v]" }),
						" 由 ",
						/* @__PURE__ */ jsx(M, { children: "u" }),
						" 回推」的一般套路。第一遍备好",
						/* @__PURE__ */ jsx("strong", { children: "子树内" }),
						"，第二遍用「减一份、加一层、复原」把",
						/* @__PURE__ */ jsx("strong", { children: "子树外" }),
						"沿边传下去。"
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
						"用",
						/* @__PURE__ */ jsx("strong", { children: "距离和" }),
						"把「内 + 外」看清楚（它是分层点权和最简的一维版）。链 ",
						/* @__PURE__ */ jsx(M, { children: "1-2-3" }),
						"，无权，固定根 1："
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
									/* @__PURE__ */ jsx("b", { children: "第一遍 down（子树内距离和）。" }),
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{down}[3]=0" }),
									"（叶）；",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{down}[2]=\\mathrm{down}[3]+\\mathrm{sz}[3]=0+1=1" }),
									"；",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{down}[1]=(\\mathrm{down}[2]+\\mathrm{sz}[2])=1+2=3" }),
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
									/* @__PURE__ */ jsx("b", { children: "根的 up = 0。" }),
									"根没有子树外，",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[1]=0" }),
									"，故 ",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{dist}[1]=\\mathrm{down}[1]+\\mathrm{up}[1]=3" }),
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
									/* @__PURE__ */ jsx("b", { children: "换根 1→2，补 up[2]。" }),
									"父 1 的「除去 2 子树」= 只剩点 1 自己。它距 2 为 1，且这条边外还有 ",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{sz}[1]-\\mathrm{sz}[2]=1" }),
									" 个点。 于是 ",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[2]=\\mathrm{up}[1]+2=0+2=2" }),
									"（式中 ",
									/* @__PURE__ */ jsx(M, { children: "+2" }),
									" 即扣掉节点 2 子树后剩下的量），",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{dist}[2]=\\mathrm{down}[2]+\\mathrm{up}[2]=1+2=3" }),
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
									/* @__PURE__ */ jsx("b", { children: "换根 2→3。" }),
									"同理 ",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[3]" }),
									" 把「除 3 子树的其余两点」补进来，",
									/* @__PURE__ */ jsx(M, { children: "\\mathrm{dist}[3]=\\mathrm{down}[3]+\\mathrm{up}[3]=0+4=4" }),
									"。 与直接换根系数法算出的 ",
									/* @__PURE__ */ jsx(M, { children: "3,3,4" }),
									" 完全一致——两种视角同解。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示固定根后，点任一点就把它的距离和",
						/* @__PURE__ */ jsx("strong", { children: "拆成 down（子树内，青）+ up（子树外，父方向）" }),
						"两块，直观看「父方向 = 全局 − 自身子树」。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看「内 + 外」怎么拼出答案"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(RerootInOutDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "多一维状态：距离分层"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"「距离 ",
						/* @__PURE__ */ jsx(M, { children: "\\le k" }),
						" 的点权和」比标量距离和多一维：",
						/* @__PURE__ */ jsx(M, { children: "dp[u][j]" }),
						" 记录",
						/* @__PURE__ */ jsxs("strong", { children: [
							"子树内距 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 恰为 ",
							/* @__PURE__ */ jsx(M, { children: "j" })
						] }),
						" 的点权和（",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 从 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						" 到 ",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						"）。 第一遍合并子树：",
						/* @__PURE__ */ jsx(M, { children: "dp[u][j]\\mathrel{+}=dp[v][j-1]" }),
						"（子树 ",
						/* @__PURE__ */ jsx(M, { children: "v" }),
						" 里距 ",
						/* @__PURE__ */ jsx(M, { children: "v" }),
						" 为 ",
						/* @__PURE__ */ jsx(M, { children: "j-1" }),
						" 的点，距 ",
						/* @__PURE__ */ jsx(M, { children: "u" }),
						" 就是 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						"）。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"换根时对",
						/* @__PURE__ */ jsxs("strong", { children: ["每一层 ", /* @__PURE__ */ jsx(M, { children: "j" })] }),
						" 都做一次「减一份、加一层、复原」。最终点 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 的答案 = ",
						/* @__PURE__ */ jsx(M, { children: "\\sum_{j=0}^{k}dp[i][j]" }),
						"。 复杂度 ",
						/* @__PURE__ */ jsx(M, { children: "O(nk)" }),
						"——每条边换根时扫 ",
						/* @__PURE__ */ jsx(M, { children: "O(k)" }),
						" 层。"
					] })]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "易错点",
					children: [
						"换根三步的",
						/* @__PURE__ */ jsx("strong", { children: "顺序与循环方向" }),
						"是关键：扣重复用 ",
						/* @__PURE__ */ jsx(M, { children: "dp[v][j-2]" }),
						"，下推用 ",
						/* @__PURE__ */ jsx(M, { children: "dp[u][j-1]" }),
						"，两处下标错位不同； 且「合并下推」会改到 ",
						/* @__PURE__ */ jsx(M, { children: "dp[v]" }),
						"，务必",
						/* @__PURE__ */ jsx("strong", { children: "先扣父、再推子、最后复原父" }),
						"，否则同一个父的多个孩子会互相污染。 分层数组第二维只需开到 ",
						/* @__PURE__ */ jsx(M, { children: "k+1" }),
						"（本题 ",
						/* @__PURE__ */ jsx(M, { children: "k\\le20" }),
						"）。"
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
					pid: "P3047",
					name: "[USACO12FEB] Nearby Cows G",
					src: "USACO 2012",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"树上每点有点权，给定 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								"，对",
								/* @__PURE__ */ jsx("strong", { children: "每个点" }),
								"求「距它不超过 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 的所有点的点权和」。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"子树内外合并的",
								/* @__PURE__ */ jsx("strong", { children: "标准训练题" }),
								"：状态 ",
								/* @__PURE__ */ jsx(M, { children: "dp[u][j]" }),
								" 按距离分层，换根必须做「",
								/* @__PURE__ */ jsx("strong", { children: "父贡献减去自身子树贡献" }),
								"」这一核心操作， 把「内 + 外」讲得最透。",
								/* @__PURE__ */ jsx(M, { children: "k\\le20" }),
								" 让分层维很小，focus 在换根逻辑本身。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"合并 ",
								/* @__PURE__ */ jsx(M, { children: "dp[u][j]\\mathrel{+}=dp[v][j-1]" }),
								"；换根「减 ",
								/* @__PURE__ */ jsx(M, { children: "dp[v][j-2]" }),
								"、加 ",
								/* @__PURE__ */ jsx(M, { children: "dp[u][j-1]" }),
								"、复原」；答案 ",
								/* @__PURE__ */ jsx(M, { children: "\\sum_j dp[i][j]" }),
								"；",
								/* @__PURE__ */ jsx(M, { children: "O(nk)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（分层换根 · 减一份/加一层/复原）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P3047,
								luogu: "P3047"
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
						/* @__PURE__ */ jsx(Field, {
							k: "题意",
							children: "树上选一点，使所有点到它的距离和最小。"
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角",
							children: [
								"换个角度重看第一节的「会议」：把每点距离和写成 ",
								/* @__PURE__ */ jsx(M, { children: "\\mathrm{dist}[u]=\\mathrm{down}[u]+\\mathrm{up}[u]" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "\\mathrm{down}" }),
								" 第一遍后序求，",
								/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[v]" }),
								" 由父回推——正是「子树外距离回推」的最简一维实例。 它和「换根系数 ",
								/* @__PURE__ */ jsx(M, { children: "n-2\\,\\mathrm{sz}" }),
								"」是同一件事的两种写法，互相印证。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "\\mathrm{down}[u]=\\sum(\\mathrm{down}[v]+\\mathrm{sz}[v])" }),
								"；",
								/* @__PURE__ */ jsx(M, { children: "\\mathrm{up}[v]=\\mathrm{up}[u]+(\\mathrm{down}[u]-(\\mathrm{down}[v]+\\mathrm{sz}[v]))+(n-\\mathrm{sz}[v])" }),
								"；",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。"
							]
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
					pid: "P6419",
					name: "[COCI2014-2015#1] Kamp",
					hint: "拔高：每点作起点送客到所有关键点的最短耗时，内外两遍换根 + 『来回一条边只走单程』的直径式修正。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1395",
					name: "会议",
					hint: "用 down/up 分解重写一遍，和换根系数法对拍——两种视角结果必须一致。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P3478",
					name: "[POI2008] STA-Station",
					hint: "深度和最大：同样可拆成 down + up，验证换根不止一种推法。"
				})
			]
		})
	] });
}
//#endregion
export { RerootInOut as default };
