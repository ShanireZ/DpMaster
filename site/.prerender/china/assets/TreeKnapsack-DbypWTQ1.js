import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { _ as solveTreeKnapsack, d as buildTree, f as layoutTree, l as TreeKnapDepFigure, s as PostorderFigure, u as VirtualRootFigure } from "./TreeArt-z8JbdSJA.js";
import { useMemo, useState } from "react";
import { Minus, MousePointerClick, Plus } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/treedp/TreeKnapsackDemo.tsx
var PARENT = [
	-1,
	0,
	0,
	1,
	1
];
var EDGE0 = [
	0,
	2,
	5,
	3,
	4
];
function TreeKnapsackDemo() {
	const [edge, setEdge] = useState(EDGE0);
	const [K, setK] = useState(3);
	const [focus, setFocus] = useState(0);
	const tree = useMemo(() => buildTree(PARENT, Array(PARENT.length).fill(0)), []);
	const layout = useMemo(() => layoutTree(tree), [tree]);
	const res = useMemo(() => solveTreeKnapsack(tree, edge, K), [
		tree,
		edge,
		K
	]);
	const paintNode = (id) => {
		const isFocus = id === focus;
		const isRoot = id === tree.root;
		let fill = "var(--surface-3)";
		let stroke = "var(--border-strong)";
		let textColor = "var(--text-1)";
		if (isFocus) {
			fill = "var(--grad-accent)";
			stroke = "var(--accent-2)";
			textColor = "var(--text-on-accent)";
		} else if (isRoot) {
			fill = "color-mix(in srgb, var(--accent-1) 14%, var(--surface-3))";
			stroke = "var(--accent-2)";
		}
		return {
			fill,
			stroke,
			strokeWidth: isFocus ? 2.6 : 1.8,
			textColor
		};
	};
	const width = 540;
	const padX = 46;
	const topY = 36;
	const rowH = 94;
	const radius = 22;
	const H = topY + layout.maxDepth * rowH + 40;
	const px = (x) => padX + x * (width - 2 * padX);
	const py = (d) => topY + d * rowH;
	const setEdgeW = (i, v) => setEdge((arr) => arr.map((x, k) => k === i ? v : x));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "td__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "td__group-label",
				children: "改每条边的苹果数（边权）"
			}), /* @__PURE__ */ jsx("div", {
				className: "td__nodes",
				children: edge.map((v, i) => i === tree.root ? null : /* @__PURE__ */ jsxs("div", {
					className: "td__node-chip",
					children: [/* @__PURE__ */ jsx("span", {
						className: "td__node-dot",
						children: i + 1
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "stepper__lab",
						children: [
							"连 ",
							tree.parent[i] + 1,
							"–",
							i + 1,
							" 的边"
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "stepper__row",
						children: [
							/* @__PURE__ */ jsx("button", {
								onClick: () => setEdgeW(i, v - 1),
								disabled: v <= 1,
								"aria-label": "减",
								children: /* @__PURE__ */ jsx(Minus, { size: 13 })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "stepper__val",
								children: v
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: () => setEdgeW(i, v + 1),
								disabled: v >= 20,
								"aria-label": "加",
								children: /* @__PURE__ */ jsx(Plus, { size: 13 })
							})
						]
					})] })]
				}, i))
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "td__group-label",
				children: "保留边数 K"
			}), /* @__PURE__ */ jsxs("div", {
				className: "stepper__row",
				children: [
					/* @__PURE__ */ jsx("button", {
						onClick: () => setK(K - 1),
						disabled: K <= 1,
						"aria-label": "减",
						children: /* @__PURE__ */ jsx(Minus, { size: 13 })
					}),
					/* @__PURE__ */ jsx("span", {
						className: "stepper__val",
						children: K
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => setK(K + 1),
						disabled: K >= 4,
						"aria-label": "加",
						children: /* @__PURE__ */ jsx(Plus, { size: 13 })
					})
				]
			})] })]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "td__hint",
			children: [
				"点节点看它的小背包表 ",
				/* @__PURE__ */ jsx("b", { children: "dp[u][j]" }),
				" = u 子树保留 j 条边的最大苹果数。答案在根 dp[1][",
				K,
				"] =",
				" ",
				/* @__PURE__ */ jsx("b", {
					className: "ans",
					children: res.ans
				}),
				"。"
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "td__stage",
			children: /* @__PURE__ */ jsxs("svg", {
				viewBox: `0 0 ${width} ${H}`,
				role: "img",
				"aria-label": "二叉苹果树，可点节点看其背包表",
				children: [layout.edges.map((e, i) => {
					const a = layout.byId.get(e.a);
					const b = layout.byId.get(e.b);
					const mx = (px(a.x) + px(b.x)) / 2;
					const my = (py(a.depth) + py(b.depth)) / 2;
					return /* @__PURE__ */ jsxs("g", { children: [
						/* @__PURE__ */ jsx("line", {
							x1: px(a.x),
							y1: py(a.depth) + radius,
							x2: px(b.x),
							y2: py(b.depth) - radius,
							stroke: "var(--border-strong)",
							strokeWidth: 2
						}),
						/* @__PURE__ */ jsx("rect", {
							x: mx - 14,
							y: my - 11,
							width: 28,
							height: 20,
							rx: 6,
							fill: "var(--surface-1)",
							stroke: "var(--border)"
						}),
						/* @__PURE__ */ jsx("text", {
							x: mx,
							y: my + 4,
							textAnchor: "middle",
							fontSize: "11",
							className: "mono",
							fill: "var(--accent-1)",
							fontWeight: 700,
							children: edge[e.b]
						})
					] }, i);
				}), layout.nodes.map((nd) => {
					const pnt = paintNode(nd.id);
					return /* @__PURE__ */ jsxs("g", {
						className: "node",
						transform: `translate(${px(nd.x)},${py(nd.depth)})`,
						style: { cursor: "pointer" },
						onClick: () => setFocus(nd.id),
						children: [/* @__PURE__ */ jsx("circle", {
							r: radius,
							fill: pnt.fill,
							stroke: pnt.stroke,
							strokeWidth: pnt.strokeWidth ?? 1.6
						}), /* @__PURE__ */ jsx("text", {
							y: 5,
							textAnchor: "middle",
							fontSize: "15",
							fontWeight: "700",
							fill: pnt.textColor ?? "var(--text-1)",
							children: nd.id + 1
						})]
					}, nd.id);
				})]
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "tk__tables",
			children: tree.postorder.map((u) => {
				const cols = Math.min(res.sizeEdges[u], K);
				return /* @__PURE__ */ jsxs("div", {
					className: `tk__table${u === focus ? " active" : ""}`,
					onClick: () => setFocus(u),
					style: { cursor: "pointer" },
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "tk__table-cap",
							children: [
								"节点 ",
								u + 1,
								u === tree.root ? "（根）" : "",
								" · 子树 ",
								res.sizeEdges[u],
								" 条边"
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "tk__row",
							children: [/* @__PURE__ */ jsx("div", {
								className: "tk__cell head",
								children: "j"
							}), Array.from({ length: cols + 1 }, (_, j) => /* @__PURE__ */ jsx("div", {
								className: "tk__cell head",
								children: j
							}, j))]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "tk__row",
							children: [/* @__PURE__ */ jsx("div", {
								className: "tk__cell head",
								children: "dp"
							}), Array.from({ length: cols + 1 }, (_, j) => /* @__PURE__ */ jsx("div", {
								className: `tk__cell${u === tree.root && j === K ? " best" : ""}`,
								children: res.dp[u][j]
							}, j))]
						})
					]
				}, u);
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "td__readout",
			children: [
				"每个孩子当作",
				/* @__PURE__ */ jsx("strong", { children: "一组物品" }),
				"：给它分 t 条边就得到 ",
				/* @__PURE__ */ jsx("span", {
					className: "mono",
					children: "边权 + dp[孩子][t−1]"
				}),
				" 的苹果， 在父亲的背包里做分组背包合并。",
				/* @__PURE__ */ jsx("strong", { children: "选子必先选连它的那条边" }),
				"——这正是「有依赖背包」的树上形态。"
			]
		})
	] });
}
//#endregion
//#region src/content/f/TreeKnapsack.tsx
var CODE_P2015 = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 105;
struct E { int to, w; };
vector<E> g[N];               // 邻接表带边权（苹果数）
int f[N][N];                  // f[u][j]：u 子树里保留 j 条边的最大苹果数
int sz[N];                    // sz[u]：u 子树内的边数（dp 第二维上界）
int Q;

void dfs(int u, int fa)
{
    for (E e : g[u])
    {
        if (e.to == fa) continue;
        dfs(e.to, u);
        sz[u] += sz[e.to] + 1;          // 加上「连孩子的边」和孩子子树里的边
        for (int j = min(sz[u], Q); j >= 1; j--)      // ★分组背包：容量倒序
            for (int t = 1; t <= sz[e.to] + 1 && t <= j; t++) // 给这个孩子分 t 条边
                f[u][j] = max(f[u][j], f[u][j - t] + f[e.to][t - 1] + e.w);
    }
}

int main()
{
    int n;
    cin >> n >> Q;
    for (int i = 1; i < n; i++)
    {
        int a, b, w;
        cin >> a >> b >> w;
        g[a].push_back({b, w});
        g[b].push_back({a, w});         // 无向，dfs 里用 fa 挡回边
    }

    dfs(1, 0);
    cout << f[1][Q] << endl;
    return 0;
}`;
var CODE_P2014 = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 305;
vector<int> g[N];             // g[u]：以 u 为先修课的那些课
int s[N];                     // s[i]：第 i 门课的学分
int f[N][N];                  // f[u][j]：在 u 子树里选 j 门课的最大学分
int m;

void dfs(int u)
{
    f[u][1] = s[u];           // 选了 u 子树里的课，必先选 u 自己（占 1 门）
    for (int v : g[u])
    {
        dfs(v);
        for (int j = m + 1; j >= 2; j--)        // ★+1：0 号虚根也算一门，容量留够
            for (int k = 1; k <= j - 1; k++)    // 给孩子 v 这一组分 k 门
                f[u][j] = max(f[u][j], f[u][j - k] + f[v][k]);
    }
}

int main()
{
    int n;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
    {
        int fa;
        cin >> fa >> s[i];
        g[fa].push_back(i);   // fa == 0 表示无先修课，挂到虚根 0 下
    }

    dfs(0);                   // ★森林接一个虚根 0，问题化为一棵树
    cout << f[0][m + 1] << endl;   // 选 m 门真课 + 虚根 1 门 = m+1
    return 0;
}`;
function TreeKnapsack() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "当「选子必先选父」遇上容量限制"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"上一类的 ",
							/* @__PURE__ */ jsx(M, { children: "f[u][0/1]" }),
							" 只问「选不选」。但很多问题还带一个",
							/* @__PURE__ */ jsx("strong", { children: "预算" }),
							"：一棵长满苹果的树， 只能",
							/* @__PURE__ */ jsxs("strong", { children: [
								"保留 ",
								/* @__PURE__ */ jsx(M, { children: "Q" }),
								" 条树枝"
							] }),
							"，且——",
							/* @__PURE__ */ jsx("strong", { children: "要留一条枝，它上面那截主干必须先留住" }),
							"（否则这条枝就从树上掉了）。 在预算 ",
							/* @__PURE__ */ jsx(M, { children: "Q" }),
							" 下让保留的苹果最多，这是",
							/* @__PURE__ */ jsx("strong", { children: "树上背包" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"「容量受限的取舍」正是背包的本行，但这里多了一层",
							/* @__PURE__ */ jsx("strong", { children: "依赖" }),
							"：孩子想被选中，得先为「连接它的那条边」付出一份容量。 于是每个点的状态要带上",
							/* @__PURE__ */ jsx("strong", { children: "容量维" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[u][j]:\\ u\\ \\text{;}\\ j\\ " }),
						/* @__PURE__ */ jsxs("p", { children: [
							"读作 ",
							/* @__PURE__ */ jsx(M, { children: "f[u][j]" }),
							" = 在 u 的子树里",
							/* @__PURE__ */ jsx("strong", { children: "恰好保留 j 条边" }),
							"时的最大苹果数。答案在 ",
							/* @__PURE__ */ jsx(M, { children: "f[root][Q]" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(PostorderFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"仍是后序：先把每个孩子子树的 ",
							/* @__PURE__ */ jsx(M, { children: "f[c][\\cdot]" }),
							" 整张小表算好，父亲再把孩子们「分组背包」式地并进来。"
						]
					})]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "把孩子当成一「组」物品"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"怎么合并？关键一步：",
						/* @__PURE__ */ jsx("strong", { children: "把每个孩子子树看成分组背包里的一「组」" }),
						"。给孩子 ",
						/* @__PURE__ */ jsx(M, { children: "c" }),
						" 分配 ",
						/* @__PURE__ */ jsx(M, { children: "t" }),
						" 条边（",
						/* @__PURE__ */ jsx(M, { children: "t\\ge1" }),
						"）， 意味着——先用掉 ",
						/* @__PURE__ */ jsx("strong", { children: "1 条" }),
						"去接通「u 到 c 的边」（拿到它的边权），再把剩下 ",
						/* @__PURE__ */ jsx(M, { children: "t-1" }),
						" 条留给 c 的子树内部去最优，即 ",
						/* @__PURE__ */ jsx(M, { children: "f[c][t-1]" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(TreeKnapDepFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "选孩子 c，先花 1 条容量接通「连 c 的边」；这条边的存在，正是「有依赖背包」的依赖。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"于是父亲对每个孩子做一次分组背包合并（",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 倒序，避免一组被算两次）："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[u][j]=\\max_{1\\le t\\le j}\\Big(f[u][j-t]+\\big(w_{u,c}+f[c][t-1]\\big)\\Big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"这里 ",
							/* @__PURE__ */ jsx(M, { children: "w_{u,c}" }),
							" 是 u 到孩子 c 的边权。注意 ",
							/* @__PURE__ */ jsx(M, { children: "t" }),
							" 从 1 起步——",
							/* @__PURE__ */ jsx("strong", { children: "要碰孩子子树里任何一条边，就必须先付这条连边" }),
							"，这就是依赖被自然编码进转移的方式。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"树上背包 = ",
						/* @__PURE__ */ jsx("strong", { children: "子树维背包 + 依赖" }),
						"。「选子必选连父的边」不是额外判断，而是把 ",
						/* @__PURE__ */ jsx(M, { children: "t" }),
						" 的下界设成 1、并把边权算进那一步——依赖就",
						/* @__PURE__ */ jsx("strong", { children: "免费" }),
						"融进了分组背包的转移里。复杂度是每个点 ",
						/* @__PURE__ */ jsx(M, { children: "O(sz_u^2)" }),
						"，全树合起来 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						"（经典的「树上背包是平方」结论）。"
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
						"小树：根 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						"，两个孩子 ",
						/* @__PURE__ */ jsx(M, { children: "2" }),
						"（连边苹果 2）、",
						/* @__PURE__ */ jsx(M, { children: "3" }),
						"（连边苹果 5）；",
						/* @__PURE__ */ jsx(M, { children: "2" }),
						" 再带两片叶 ",
						/* @__PURE__ */ jsx(M, { children: "4" }),
						"（连边 3）、",
						/* @__PURE__ */ jsx(M, { children: "5" }),
						"（连边 4）。保留 ",
						/* @__PURE__ */ jsx(M, { children: "Q=3" }),
						" 条边："
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
									/* @__PURE__ */ jsx("b", { children: "叶子 4、5、3" }),
									" 子树内没有边：",
									/* @__PURE__ */ jsx(M, { children: "f[\\cdot][0]=0" }),
									"，更高列不存在（",
									/* @__PURE__ */ jsx(M, { children: "sz=0" }),
									"）。"
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
									/* @__PURE__ */ jsx("b", { children: "节点 2" }),
									"（孩子 4、5，连边 3、4）。并入 4：",
									/* @__PURE__ */ jsx(M, { children: "f[2][1]=w_{2,4}+f[4][0]=3" }),
									"。再并入 5：",
									/* @__PURE__ */ jsx(M, { children: "f[2][1]=\\max(3,\\,4)=4" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "f[2][2]=w_{2,4}+w_{2,5}=3+4=7" }),
									"。得 ",
									/* @__PURE__ */ jsx(M, { children: "f[2]=[0,4,7]" }),
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
									/* @__PURE__ */ jsx("b", { children: "根 1" }),
									"（孩子 2、3，连边 2、5）。并入 2：给它 ",
									/* @__PURE__ */ jsx(M, { children: "t" }),
									" 条 → ",
									/* @__PURE__ */ jsx(M, { children: "w_{1,2}+f[2][t-1]" }),
									"，得 ",
									/* @__PURE__ */ jsx(M, { children: "f[1][1..3]=[2,6,9]" }),
									"。再并入 3（",
									/* @__PURE__ */ jsx(M, { children: "sz=0" }),
									"，只能给 1 条 ",
									/* @__PURE__ */ jsx(M, { children: "w_{1,3}=5" }),
									"）：",
									/* @__PURE__ */ jsx(M, { children: "f[1][3]=\\max(9,\\ f[1][2]+5)=\\max(9,6+5)=11" }),
									"。"
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "step",
							children: [/* @__PURE__ */ jsx("span", {
								className: "step__n",
								children: "✓"
							}), /* @__PURE__ */ jsxs("div", {
								className: "step__b",
								children: [
									/* @__PURE__ */ jsx("b", { children: "答案" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "f[1][3]=11" }),
									"——留「1-3」这条边（5）＋「1-2」「2-5」两条（2+4），共 3 条边、苹果 11。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示画出这棵苹果树，点任意节点看它的",
						/* @__PURE__ */ jsxs("strong", { children: ["小背包表 ", /* @__PURE__ */ jsx(M, { children: "f[u][j]" })] }),
						"；改边权或保留数 ",
						/* @__PURE__ */ jsx(M, { children: "Q" }),
						"，所有表实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "每个节点一张小背包表"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(TreeKnapsackDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "依赖成森林：接一个虚根"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"再看「选课」：",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 门课，有的课要",
						/* @__PURE__ */ jsx("strong", { children: "先修另一门" }),
						"才能选；没有先修课的课可以直接选。选 ",
						/* @__PURE__ */ jsx(M, { children: "m" }),
						" 门，最大化学分。 「先修」关系画出来是一片",
						/* @__PURE__ */ jsx("strong", { children: "森林" }),
						"（多棵依赖树），不是单棵树——DFS 从哪开始？"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"技巧极简：",
						/* @__PURE__ */ jsxs("strong", { children: ["造一个虚根 ", /* @__PURE__ */ jsx(M, { children: "0" })] }),
						"，把每棵树的树根都挂到它下面。森林瞬间变成一棵以 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						" 为根的树，前面那套树上背包直接套用。 只是要记得——选 ",
						/* @__PURE__ */ jsx(M, { children: "m" }),
						" 门真课，等价于在含虚根的树里",
						/* @__PURE__ */ jsxs("strong", { children: [
							"选 ",
							/* @__PURE__ */ jsx(M, { children: "m+1" }),
							" 个点"
						] }),
						"（虚根白占一个名额），最后读 ",
						/* @__PURE__ */ jsx(M, { children: "f[0][m+1]" }),
						"。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(VirtualRootFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"三棵依赖树各自的根，用",
							/* @__PURE__ */ jsx("strong", { children: "虚根 0" }),
							" 的虚线边挂起来——森林化为一棵树，树上背包直接套用。"
						]
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱：虚根的「+1」不能漏",
					children: [
						"接虚根后，容量要留给虚根那一门。转移时 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 上界写 ",
						/* @__PURE__ */ jsx(M, { children: "m+1" }),
						"、每个点的 ",
						/* @__PURE__ */ jsx(M, { children: "f[u][1]" }),
						" 先塞自己（占 1 门），答案读 ",
						/* @__PURE__ */ jsx(M, { children: "f[0][m+1]" }),
						"。漏掉这个 +1，会把真课数当成点数，答案系统性偏小一门。"
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
					pid: "P2015",
					name: "二叉苹果树",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"一棵带边权（苹果数）的",
								/* @__PURE__ */ jsx("strong", { children: "二叉" }),
								"苹果树，共 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个节点。只保留 ",
								/* @__PURE__ */ jsx(M, { children: "Q" }),
								" 条树枝（保留的枝必须与根连通），求最多保留多少苹果。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [/* @__PURE__ */ jsx(M, { children: "f[u][j]" }), " = u 子树保留 j 条边的最大苹果数。二叉限制让每个点至多两个孩子，转移最清爽，是树上背包最佳入门。"]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[u][j]=\\max_t(f[u][j-t]+w_{u,c}+f[c][t-1])" }),
								"；一遍 DFS，",
								/* @__PURE__ */ jsx(M, { children: "O(nQ)" }),
								" 级。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（边权分组背包）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2015,
								luogu: "P2015"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2014",
					name: "[CTSC1997] 选课",
					src: "CTSC 1997",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 门课，每门有先修课（0 表示无）与学分。选 ",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								" 门使学分最大，且选一门必须先选它的先修课。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"有依赖背包的",
								/* @__PURE__ */ jsx("strong", { children: "标准母题" }),
								"：先修关系成森林，用",
								/* @__PURE__ */ jsx("strong", { children: "虚根 0" }),
								" 合成一棵树后，就是「点数背包」。它把「依赖 → 树上背包」的转承讲得最透。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[u][j]=\\max_k(f[u][j-k]+f[c][k])" }),
								"，选 ",
								/* @__PURE__ */ jsx(M, { children: "m+1" }),
								" 个点（含虚根）；",
								/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
								" 级。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（虚根 + 点数背包）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2014,
								luogu: "P2014"
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
					pid: "P1273",
					name: "有线电视网",
					hint: "叶子是用户（带收视费），内部点转发有成本。f[u][j] = u 子树覆盖 j 个用户的最大净收益；边权取负成本，用户数当容量。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P3177",
					name: "[HAOI2015] 树上染色",
					hint: "拔高：把 k 个点染黑，f[u][j] = u 子树染 j 个黑点。转移时每条边的贡献 = 边权 × (两侧黑点对数)，边贡献型树上背包。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1064",
					name: "[NOIP2006] 金明的预算方案",
					hint: "主件带 ≤2 附件的依赖背包：把「主件 + 其附件的子集」枚举成一组物品做分组背包。是树上背包退化到「深度 1」的特例。"
				})
			]
		})
	] });
}
//#endregion
export { TreeKnapsack as default };
