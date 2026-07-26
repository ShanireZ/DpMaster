import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as useStepPlayer } from "./useStepPlayer-CZuIDieE.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { d as buildTree, f as layoutTree, g as solveMaxSubtreeChain, i as DiameterFigure, n as CentroidFigure, s as PostorderFigure } from "./TreeArt-z8JbdSJA.js";
import { i as TreeCanvas, n as Panel, r as StepBar, t as Legend } from "./TreeCanvas-Cr7hNSWg.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, MousePointerClick, Plus } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/treedp/DiameterDemo.tsx
var PARENT = [
	-1,
	0,
	0,
	1,
	1,
	2
];
function DStepper({ i, value, onChange }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "td__node-chip",
		children: [/* @__PURE__ */ jsx("span", {
			className: "td__node-dot",
			children: i + 1
		}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
			className: "stepper__lab",
			children: [
				"点 ",
				i + 1,
				" · 点权"
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "stepper__row",
			children: [
				/* @__PURE__ */ jsx("button", {
					onClick: () => onChange(value - 1),
					disabled: value <= 1,
					"aria-label": "减",
					children: /* @__PURE__ */ jsx(Minus, { size: 13 })
				}),
				/* @__PURE__ */ jsx("span", {
					className: "stepper__val",
					children: value
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: () => onChange(value + 1),
					disabled: value >= 15,
					"aria-label": "加",
					children: /* @__PURE__ */ jsx(Plus, { size: 13 })
				})
			]
		})] })]
	});
}
function DiameterDemo() {
	const [w, setW] = useState([
		2,
		3,
		4,
		5,
		1,
		6
	]);
	const tree = useMemo(() => buildTree(PARENT, w), [w]);
	const layout = useMemo(() => layoutTree(tree), [tree]);
	const res = useMemo(() => solveMaxSubtreeChain(tree), [tree]);
	const inputsHash = w.join("_");
	const p = useStepPlayer(res.steps.length);
	const step = res.steps[Math.min(p.index, res.steps.length - 1)];
	const isLastFrame = p.index >= res.steps.length - 1;
	const settledSet = useMemo(() => new Set(step.settled), [step]);
	const justDone = step.u;
	const throughEdges = useMemo(() => {
		if (!isLastFrame) return /* @__PURE__ */ new Set();
		const u = res.argThrough;
		const s = /* @__PURE__ */ new Set();
		const kids = tree.children[u].map((c) => ({
			c,
			g: Math.max(0, res.down[c])
		})).filter((x) => x.g > 0).sort((a, b) => b.g - a.g);
		const walk = (from) => {
			let cur = from;
			let parent = u;
			while (true) {
				s.add(`${parent}-${cur}`);
				const nx = tree.children[cur].map((c) => ({
					c,
					g: Math.max(0, res.down[c])
				})).filter((x) => x.g > 0).sort((a, b) => b.g - a.g)[0];
				if (!nx) break;
				parent = cur;
				cur = nx.c;
			}
		};
		if (kids[0]) walk(kids[0].c);
		if (kids[1]) walk(kids[1].c);
		return s;
	}, [
		isLastFrame,
		res,
		tree
	]);
	const paintNode = (id) => {
		const settled = settledSet.has(id);
		const isCurrent = id === justDone && !isLastFrame;
		const isPeak = isLastFrame && id === res.argThrough;
		let fill = "var(--surface-3)";
		let stroke = "var(--border-strong)";
		let textColor = "var(--text-1)";
		if (isPeak) {
			fill = "color-mix(in srgb, var(--viz-chosen) 28%, var(--surface-3))";
			stroke = "var(--viz-chosen)";
		} else if (isCurrent) {
			fill = "var(--grad-accent)";
			stroke = "var(--accent-2)";
			textColor = "var(--text-on-accent)";
		} else if (settled) {
			fill = "color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))";
			stroke = "var(--accent-2)";
		}
		const sub = settled ? [`↓${res.down[id]}`] : [`w=${w[id]}`];
		return {
			fill,
			stroke,
			strokeWidth: isCurrent ? 2.6 : settled ? 2 : 1.6,
			textColor,
			sub,
			dim: !settled && !isCurrent
		};
	};
	const edgeActive = (a, b) => throughEdges.has(`${a}-${b}`);
	const setWeight = (i, v) => setW((arr) => arr.map((x, k) => k === i ? v : x));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "td__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "td__group-label",
				children: "改点权，看每个点的向下最长链 down 与「过点」最长链"
			}), /* @__PURE__ */ jsx("div", {
				className: "td__nodes",
				children: w.map((v, i) => /* @__PURE__ */ jsx(DStepper, {
					i,
					value: v,
					onChange: (nv) => setWeight(i, nv)
				}, i))
			})] })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "td__hint",
			children: [
				"节点下方 ",
				/* @__PURE__ */ jsx("b", { children: "↓down" }),
				" = 从该点向下、必含它的最长链权和。过某点的最长链 = 它",
				/* @__PURE__ */ jsx("strong", { children: "两条最深孩子链" }),
				"拼起来 + 自身权。 全局最长（带权直径）= ",
				/* @__PURE__ */ jsx("b", {
					className: "ans",
					children: res.diameter
				}),
				"，峰顶在 ",
				/* @__PURE__ */ jsx("b", { children: res.argThrough + 1 }),
				" 号。"
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "td__stage",
			children: /* @__PURE__ */ jsx(TreeCanvas, {
				layout,
				paintNode,
				edgeActive,
				ariaLabel: "树的带权直径：向下链与过点链后序动画"
			}, inputsHash)
		}),
		/* @__PURE__ */ jsx(StepBar, { player: p }),
		/* @__PURE__ */ jsx(Legend, { items: [{
			color: "var(--accent-2)",
			label: "当前处理"
		}, {
			color: "var(--viz-chosen)",
			label: "直径峰顶 + 链"
		}] }),
		/* @__PURE__ */ jsx(Panel, { html: step.caption }),
		isLastFrame && /* @__PURE__ */ jsxs("div", {
			className: "td__readout",
			children: [
				"绿色高亮的两条链在 ",
				/* @__PURE__ */ jsx("b", { children: res.argThrough + 1 }),
				" 号",
				/* @__PURE__ */ jsx("strong", { children: "拐弯拼接" }),
				"，就是全树带权最长路径 ",
				/* @__PURE__ */ jsx("b", {
					className: "ans",
					children: res.diameter
				}),
				"。 每个点只在自己这里当一次「拐点」，一遍后序即可求出——无需两遍 DFS。"
			]
		})
	] });
}
//#endregion
//#region src/content/f/TreeDiameter.tsx
var CODE_DIAM = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 100005;
struct E { int to, w; };
vector<E> g[N];
long long down[N];            // down[u]：从 u 向下、必含 u 的最长链长
long long ans;               // 全局直径

void dfs(int u, int fa)
{
    down[u] = 0;
    long long best1 = 0, best2 = 0;      // 两条最长的孩子向上链
    for (E e : g[u])
    {
        if (e.to == fa) continue;
        dfs(e.to, u);
        long long chain = down[e.to] + e.w;   // 孩子链 + 连它的边
        if (chain > best1) { best2 = best1; best1 = chain; }
        else if (chain > best2) best2 = chain;
    }
    down[u] = best1;                     // 向下最长 = 最深的一条
    ans = max(ans, best1 + best2);       // ★过 u 的最长 = 两条最深拼接
}

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i < n; i++)
    {
        int a, b, w;
        cin >> a >> b >> w;
        g[a].push_back({b, w});
        g[b].push_back({a, w});
    }

    dfs(1, 0);
    cout << ans << endl;                 // 一遍 DFS 即得直径
    return 0;
}`;
var CODE_P1122 = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 16005;
vector<int> g[N];
int w[N];                     // 点权（可正可负）
int f[N];                     // f[u]：含 u 的最大子树权和
int ans;

void dfs(int u, int fa)
{
    f[u] = w[u];              // 至少含它自己
    for (int v : g[u])
    {
        if (v == fa) continue;
        dfs(v, u);
        if (f[v] > 0) f[u] += f[v];      // ★孩子块为正才接上，否则截断
    }
    ans = max(ans, f[u]);
}

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> w[i];
    for (int i = 1; i < n; i++)
    {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    ans = -0x3f3f3f3f;
    dfs(1, 0);
    cout << ans << endl;
    return 0;
}`;
function TreeDiameter() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "树里最长的那条路，怎么一遍找出来"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"树的",
							/* @__PURE__ */ jsx("strong", { children: "直径" }),
							"：任意两点间最长的那条路径。它是许多问题的地基——树网的核、时态同步、乃至距离统计，都要先抓住这条最长路。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"最长路可能",
							/* @__PURE__ */ jsx("strong", { children: "不经过根" }),
							"，也可能在树的任意角落拐弯。枚举所有点对求最短路再取最大？",
							/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
							" 起步，",
							/* @__PURE__ */ jsx(M, { children: "n=10^5" }),
							" 扛不住。 但换个视角就豁然开朗：",
							/* @__PURE__ */ jsx("strong", { children: "任何一条路径，都必有一个「最高点」（深度最浅的那个点）" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"于是只要",
							/* @__PURE__ */ jsxs("strong", { children: ["枚举这个最高点 ", /* @__PURE__ */ jsx(M, { children: "u" })] }),
							"，问题就变成：以 u 为「屋脊」，向它的",
							/* @__PURE__ */ jsx("strong", { children: "两个不同孩子方向" }),
							"各挂一条最长的向下链，拼起来就是「过 u 的最长路径」。全局直径 = 所有点的「过点最长」取最大。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(DiameterFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"过点 u 的最长路径 = u 的",
							/* @__PURE__ */ jsx("strong", { children: "最深孩子链 + 次深孩子链" }),
							"；每个点只在自己当「屋脊」时贡献一次。"
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
					children: "状态：向下最长链 down[u]"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"只需",
							/* @__PURE__ */ jsx("strong", { children: "一个" }),
							"状态：",
							/* @__PURE__ */ jsx(M, { children: "down[u]" }),
							" = 从 u 出发、一路向下（进入子树）、",
							/* @__PURE__ */ jsx("strong", { children: "必含 u" }),
							" 的最长链的长度。它由孩子递推："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "down[u]=\\max_{c\\in son(u)}\\big(down[c]+w_{u,c}\\big)\\quad(\\text{;}0)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"取所有孩子里「孩子链 + 连边」最大的那一条。",
							/* @__PURE__ */ jsx("strong", { children: "叶子" }),
							"没有孩子，",
							/* @__PURE__ */ jsx(M, { children: "down[\\text{leaf}]=0" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"而「过 u 的最长路径」要拿",
							/* @__PURE__ */ jsx("strong", { children: "两条" }),
							"：在遍历孩子时顺手维护",
							/* @__PURE__ */ jsxs("strong", { children: [
								"最大 ",
								/* @__PURE__ */ jsx(M, { children: "best_1" }),
								" 与次大 ",
								/* @__PURE__ */ jsx(M, { children: "best_2" })
							] }),
							" 两条向下链，则"
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\text{through}(u)=best_1+best_2,\\qquad \\text{diam}=\\max_u \\text{through}(u)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"两条链必须来自",
							/* @__PURE__ */ jsx("strong", { children: "不同孩子" }),
							"（否则会走回头路），所以取「最大 + 次大」而非「最大 + 最大」。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(PostorderFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"后序遍历：",
							/* @__PURE__ */ jsx(M, { children: "down[c]" }),
							" 先算好，父亲才能在合并孩子时同步更新 ",
							/* @__PURE__ */ jsx(M, { children: "best_1,best_2" }),
							" 与全局答案。"
						]
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"直径不需要「两遍 BFS」也不需要换根——",
						/* @__PURE__ */ jsx("strong", { children: "一遍后序 DFS" }),
						" 就够：每个点在合并孩子的",
						/* @__PURE__ */ jsx("strong", { children: "那一瞬间" }),
						"，用「最深 + 次深」结算过它的最长路径。把「枚举最高点」这个观察落实成状态，",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 塌成 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
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
					children: "跟着算一遍"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"小树（点权当作到父亲的边权简化演示）：根 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						" 带 ",
						/* @__PURE__ */ jsx(M, { children: "2,3" }),
						"；",
						/* @__PURE__ */ jsx(M, { children: "2" }),
						" 带 ",
						/* @__PURE__ */ jsx(M, { children: "4,5" }),
						"；",
						/* @__PURE__ */ jsx(M, { children: "3" }),
						" 带 ",
						/* @__PURE__ */ jsx(M, { children: "6" }),
						"。设各点权 ",
						/* @__PURE__ */ jsx(M, { children: "w=[2,3,4,5,1,6]" }),
						"，把「过点链」当作点权和："
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
									/* @__PURE__ */ jsx("b", { children: "叶子 4、5、6。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "down[4]=4,\\ down[5]=1,\\ down[6]=6" }),
									"（叶子的向下链就是自己的权）。"
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
									"（权 3，孩子 4、5）。孩子链 ",
									/* @__PURE__ */ jsx(M, { children: "4,1" }),
									"，最大 4、次大 1。",
									/* @__PURE__ */ jsx(M, { children: "down[2]=3+4=7" }),
									"；过 2 的链 ",
									/* @__PURE__ */ jsx(M, { children: "=3+4+1=8" }),
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
									/* @__PURE__ */ jsx("b", { children: "节点 3" }),
									"（权 1，孩子 6）：",
									/* @__PURE__ */ jsx(M, { children: "down[3]=1+6=7" }),
									"，过 3 只有一条孩子链，",
									/* @__PURE__ */ jsx(M, { children: "through=1+6=7" }),
									"。 ",
									/* @__PURE__ */ jsx("b", { children: "根 1" }),
									"（权 2，孩子 2、3）：孩子链 ",
									/* @__PURE__ */ jsx(M, { children: "down[2]=7,down[3]=7" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "through(1)=2+7+7=16" }),
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
									/* @__PURE__ */ jsx("b", { children: "直径" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "\\max(8,7,16,\\dots)=16" }),
									"——峰顶在根 1，链是「4→2→1→3→6」。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示逐点点亮 ",
						/* @__PURE__ */ jsx(M, { children: "down[u]" }),
						"，末帧把「拐点 + 两条最深链」高亮成绿色；改点权看直径与峰顶如何移动。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看直径在哪拐弯"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(DiameterDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "同一套合并：最大子树和"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"把「链」换成「块」，同一套自底向上合并就解另一类题：树上点权有正有负，求",
							/* @__PURE__ */ jsx("strong", { children: "一个连通块" }),
							"使权和最大。 状态 ",
							/* @__PURE__ */ jsx(M, { children: "f[u]" }),
							" = ",
							/* @__PURE__ */ jsx("strong", { children: "含 u 的最大子树权和" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[u]=w_u+\\sum_{c\\in son(u)}\\max\\big(0,\\ f[c]\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"盯住那个 ",
							/* @__PURE__ */ jsx(M, { children: "\\max(0,f[c])" }),
							"：孩子这块若",
							/* @__PURE__ */ jsx("strong", { children: "净收益为正" }),
							"就接上，为负就",
							/* @__PURE__ */ jsx("strong", { children: "剪断" }),
							"（宁可不要）。答案 = ",
							/* @__PURE__ */ jsx(M, { children: "\\max_u f[u]" }),
							"。 这和直径的「孩子链为正才接」是",
							/* @__PURE__ */ jsx("strong", { children: "同一个直觉" }),
							"——只不过直径挑「最深两条」，子树和是「所有正的都要」。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱：负权不能一律截断到 0",
					children: [
						/* @__PURE__ */ jsx(M, { children: "f[u]" }),
						" 起手要塞 ",
						/* @__PURE__ */ jsx(M, { children: "w_u" }),
						"（即使它是负数），只有",
						/* @__PURE__ */ jsx("strong", { children: "孩子的块" }),
						"才用 ",
						/* @__PURE__ */ jsx(M, { children: "\\max(0,\\cdot)" }),
						" 决定接不接。若把 ",
						/* @__PURE__ */ jsx(M, { children: "f[u]" }),
						" 也钳到非负，全负的树会错报 0。答案初值也要设成 ",
						/* @__PURE__ */ jsx(M, { children: "-\\infty" }),
						" 而非 0，防止「必须选至少一个点」时被 0 顶掉。"
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "换个视角看直径。" }),
						"本页从「固定根、一遍 DFS」求出直径与过点最长链；若要对",
						/* @__PURE__ */ jsx("strong", { children: "每个点" }),
						"都问「以它为端点的最远距离（偏心距）」，则需要",
						/* @__PURE__ */ jsx("strong", { children: "换根 DP" }),
						" 把父方向的信息也回推——那条路线见",
						" ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/e/center",
							style: { color: "var(--accent-2)" },
							children: "E 部分 · 中心 / 偏心距"
						}),
						"。两条路互补：这里主讲直径本身的推导，换根篇主讲逐点偏心距。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "顺带说重心。" }),
						"树的",
						/* @__PURE__ */ jsx("strong", { children: "重心" }),
						"是这样一个点：以它为根时，",
						/* @__PURE__ */ jsx("strong", { children: "最大的那棵子树节点数最小" }),
						"。 一遍 DFS 求出每点的子树大小 ",
						/* @__PURE__ */ jsx(M, { children: "sz[u]" }),
						"，判据是——u 的",
						/* @__PURE__ */ jsx("strong", { children: "各个方向" }),
						"（每个孩子子树，以及「上方」",
						/* @__PURE__ */ jsx(M, { children: "n-sz[u]" }),
						"）都 ",
						/* @__PURE__ */ jsx(M, { children: "\\le n/2" }),
						" 时，u 即重心。它和直径同属「一遍 DFS 抓全局结构」的固定根树形 DP。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(CentroidFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"重心：删去它后剩下的最大连通块最小——各方向最均衡。用子树大小 ",
							/* @__PURE__ */ jsx(M, { children: "sz[u]" }),
							" 一遍判定。"
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
					children: "例题"
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1099",
					name: "[NOIP2007] 树网的核",
					src: "NOIP 2007 提高组",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"带权树上找一条长度 ",
								/* @__PURE__ */ jsx(M, { children: "\\le s" }),
								" 的路径（「核」），使全树到这条路径的",
								/* @__PURE__ */ jsx("strong", { children: "最大距离（偏心距）最小" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"先求",
								/* @__PURE__ */ jsx("strong", { children: "直径" }),
								"（本类核心）：最优核一定落在某条直径上。沿直径滑动长度 ",
								/* @__PURE__ */ jsx(M, { children: "\\le s" }),
								" 的窗口，配合每点「向直径外伸出的最长链」，取偏心距最小。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"直径 + 核 + 最小偏心距",
								/* @__PURE__ */ jsx("strong", { children: "三件套集大成" }),
								"的 NOIP 真题。一次把「一遍 DFS 求直径」用到实处，是本类当之无愧的主讲位。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "down[u]=\\max(down[c]+w)" }),
								" 求直径；再沿直径双指针，",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（一遍 DFS 求直径，核部分见题解）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_DIAM,
								luogu: "P1099"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1122",
					name: "最大子树和",
					src: "洛谷原生",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"树上每点有一个「美丽值」（可负）。删去若干点后要剩下一个",
								/* @__PURE__ */ jsx("strong", { children: "连通块" }),
								"，求块内美丽值之和的最大值。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[u]" }),
								" = 含 u 的最大子树和，链式合并、",
								/* @__PURE__ */ jsx("strong", { children: "无背包维度" }),
								"，是「过点最优」最轻量的载体。与直径共享「孩子为正才接」的剪枝直觉，正好巩固。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[u]=w_u+\\sum\\max(0,f[c])" }),
								"，答案 ",
								/* @__PURE__ */ jsx(M, { children: "\\max_u f[u]" }),
								"；",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1122,
								luogu: "P1122"
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
					pid: "P1131",
					name: "[ZJOI2007] 时态同步",
					hint: "让所有叶子到根的路径等长，只能增加边权。f[u] = u 子树内最长链；每条子边补齐到最长，累计增量。是「直径式合并」的变体。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1364",
					name: "医院设置",
					hint: "带点权的重心：找一个点使 Σ(点权 × 到它的距离) 最小。n≤100 可先暴力，再用子树大小判重心对照，纯重心练习。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1122",
					name: "最大子树和（自测）",
					hint: "独立写一遍：注意 f[u] 起手含 w[u]（可负），孩子块 max(0, f[c]) 才接，答案初值 -∞。"
				})
			]
		})
	] });
}
//#endregion
export { TreeDiameter as default };
