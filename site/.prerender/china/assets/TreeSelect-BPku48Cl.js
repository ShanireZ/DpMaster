import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as useStepPlayer } from "./useStepPlayer-CZuIDieE.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { a as IndepDecisionFigure, d as buildTree, f as layoutTree, m as solveIndepSet, r as CoverContrastFigure, s as PostorderFigure } from "./TreeArt-z8JbdSJA.js";
import { i as TreeCanvas, n as Panel, r as StepBar, t as Legend } from "./TreeCanvas-Cr7hNSWg.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, MousePointerClick, Plus } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/treedp/IndepSetDemo.tsx
var PARENT = [
	-1,
	0,
	0,
	0,
	1,
	1
];
var LABELS = [
	"董事长",
	"经理A",
	"经理B",
	"主管",
	"员工X",
	"员工Y"
];
function WStepper({ i, value, onChange }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "td__node-chip",
		children: [/* @__PURE__ */ jsx("span", {
			className: "td__node-dot",
			children: i + 1
		}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
			className: "stepper__lab",
			children: [LABELS[i], " · 欢乐值"]
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
					disabled: value >= 20,
					"aria-label": "加",
					children: /* @__PURE__ */ jsx(Plus, { size: 13 })
				})
			]
		})] })]
	});
}
function IndepSetDemo() {
	const [w, setW] = useState([
		3,
		6,
		2,
		5,
		4,
		7
	]);
	const tree = useMemo(() => buildTree(PARENT, w), [w]);
	const layout = useMemo(() => layoutTree(tree), [tree]);
	const res = useMemo(() => solveIndepSet(tree), [tree]);
	const inputsHash = w.join("_");
	const p = useStepPlayer(res.steps.length);
	const step = res.steps[Math.min(p.index, res.steps.length - 1)];
	const isLastFrame = p.index >= res.steps.length - 1;
	const settledSet = useMemo(() => new Set(step.settled), [step]);
	const justDone = step.u;
	const paintNode = (id) => {
		const settled = settledSet.has(id);
		const inChosen = isLastFrame && res.chosen.has(id);
		const isCurrent = id === justDone && !isLastFrame;
		let fill = "var(--surface-3)";
		let stroke = "var(--border-strong)";
		let textColor = "var(--text-1)";
		if (inChosen) {
			fill = "color-mix(in srgb, var(--viz-chosen) 26%, var(--surface-3))";
			stroke = "var(--viz-chosen)";
		} else if (isCurrent) {
			fill = "var(--grad-accent)";
			stroke = "var(--accent-2)";
			textColor = "var(--text-on-accent)";
		} else if (settled) {
			fill = "color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))";
			stroke = "var(--accent-2)";
		}
		const sub = settled ? [`0:${res.dp0[id]}`, `1:${res.dp1[id]}`] : [`w=${w[id]}`];
		return {
			fill,
			stroke,
			strokeWidth: isCurrent ? 2.6 : settled ? 2 : 1.6,
			textColor,
			sub,
			dim: !settled && !isCurrent
		};
	};
	const setWeight = (i, v) => setW((arr) => arr.map((x, k) => k === i ? v : x));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "td__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "td__group-label",
				children: "改每个员工的欢乐值，看 dp 自底向上重算"
			}), /* @__PURE__ */ jsx("div", {
				className: "td__nodes",
				children: w.map((v, i) => /* @__PURE__ */ jsx(WStepper, {
					i,
					value: v,
					onChange: (nv) => setWeight(i, nv)
				}, i))
			})] })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "td__hint",
			children: [
				"后序遍历（孩子先于父亲）逐个点亮节点，节点下方两行是 ",
				/* @__PURE__ */ jsx("b", { children: "dp[u][0]" }),
				"（不选 u）/ ",
				/* @__PURE__ */ jsx("b", { children: "dp[u][1]" }),
				"（选 u）。 走到根，答案 = max(dp[1][0], dp[1][1]) = ",
				/* @__PURE__ */ jsx("b", {
					className: "ans",
					children: res.ans
				}),
				"。"
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "td__stage",
			children: /* @__PURE__ */ jsx(TreeCanvas, {
				layout,
				paintNode,
				ariaLabel: "公司树上的最大权独立集后序动画"
			}, inputsHash)
		}),
		/* @__PURE__ */ jsx(StepBar, { player: p }),
		/* @__PURE__ */ jsx(Legend, { items: [
			{
				color: "var(--accent-2)",
				label: "当前处理"
			},
			{
				color: "var(--accent-2)",
				label: "dp 已确定",
				bg: false
			},
			{
				color: "var(--viz-chosen)",
				label: "入选最优独立集"
			}
		] }),
		/* @__PURE__ */ jsx(Panel, { html: step.caption }),
		isLastFrame && /* @__PURE__ */ jsxs("div", {
			className: "td__readout",
			children: [
				"最优独立集选中了",
				" ",
				/* @__PURE__ */ jsx("b", { children: [...res.chosen].sort((a, b) => a - b).map((i) => `${i + 1}号(${LABELS[i]})`).join("、") }),
				"，欢乐值合计 ",
				/* @__PURE__ */ jsx("b", {
					className: "ans",
					children: res.ans
				}),
				"。注意",
				/* @__PURE__ */ jsx("strong", { children: "没有任何一对直接上下级同时入选" }),
				"——这正是独立集约束。"
			]
		})
	] });
}
//#endregion
//#region src/content/f/TreeSelect.tsx
var CODE_P1352 = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 6005;
vector<int> g[N];             // 邻接表：g[u] 存 u 的直接下属
int r[N];                     // 每个人的欢乐值
int f[N][2];                  // f[u][0/1]：u 不选/选时，u 子树的最大欢乐值
int fa[N];                    // 记录父亲，用来找根
bool hasFa[N];

void dfs(int u)               // 固定根，一遍后序 DFS
{
    f[u][0] = 0;              // 不选 u：先清零
    f[u][1] = r[u];           // 选 u：先加上自己的欢乐值
    for (int v : g[u])        // 逐个孩子合并
    {
        dfs(v);               // ★先把孩子子树算完（后序）
        f[u][0] += max(f[v][0], f[v][1]); // u 不选：孩子随意，各取较大
        f[u][1] += f[v][0];   // u 选了：孩子必须都不选
    }
}

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> r[i];

    for (int i = 1; i < n; i++)
    {
        int l, k;
        cin >> l >> k;        // l 的上司是 k
        g[k].push_back(l);
        hasFa[l] = true;
    }

    int root = 1;
    while (root <= n && hasFa[root]) root++;  // 没有上司的那个人就是根

    dfs(root);
    cout << max(f[root][0], f[root][1]) << endl;
    return 0;
}`;
var CODE_P2016 = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 1505;
vector<int> g[N];
int f[N][2];                  // f[u][0]：u 不放兵；f[u][1]：u 放兵
bool hasFa[N];

void dfs(int u)
{
    f[u][0] = 0;              // u 不放兵：它的每条边要靠孩子那端守
    f[u][1] = 1;              // u 放兵：+1 个士兵
    for (int v : g[u])
    {
        dfs(v);
        f[u][0] += f[v][1];   // ★u 不放 → 孩子必须放（否则边 u-v 没人看守）
        f[u][1] += min(f[v][0], f[v][1]); // u 放了 → 孩子放不放都行，取较小
    }
}

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        int u, cnt;
        cin >> u >> cnt;      // 洛谷本题为 0-based，读入时 +1 归一到 1-based
        u++;
        while (cnt--)
        {
            int v;
            cin >> v;
            v++;
            g[u].push_back(v);
            hasFa[v] = true;
        }
    }

    int root = 1;
    while (root <= n && hasFa[root]) root++;

    dfs(root);
    cout << min(f[root][0], f[root][1]) << endl;
    return 0;
}`;
function TreeSelect() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "从一场不能同席的舞会说起"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"公司是一棵",
						/* @__PURE__ */ jsx("strong", { children: "树" }),
						"：董事长在根，每个人往下带若干直接下属。现在办舞会，每个人来了会带来一份",
						/* @__PURE__ */ jsx("strong", { children: "欢乐值" }),
						"。 只有一条规矩——",
						/* @__PURE__ */ jsx("strong", { children: "任何人都不愿与自己的直接上司同场" }),
						"。要让到场的总欢乐值最大，该请谁？"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"用图论的话说：在树上选一个",
						/* @__PURE__ */ jsx("strong", { children: "点集" }),
						"，使得",
						/* @__PURE__ */ jsx("strong", { children: "没有任何一条边的两端同时被选" }),
						"（这样的点集叫「独立集」）， 并让选中点的权和最大。这就是",
						/* @__PURE__ */ jsx("strong", { children: "最大权独立集" }),
						"。"
					] })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"先想想能不能",
						/* @__PURE__ */ jsx("strong", { children: "贪心" }),
						"：按欢乐值从大到小挑，能选就选？会翻车。设董事长欢乐值 ",
						/* @__PURE__ */ jsx(M, { children: "10" }),
						"，他有两个下属各 ",
						/* @__PURE__ */ jsx(M, { children: "6" }),
						"， 两个下属又各带一个孙辈 ",
						/* @__PURE__ */ jsx(M, { children: "6" }),
						"。贪心先抢董事长（10），于是两个下属都不能选；孙辈可选，得 ",
						/* @__PURE__ */ jsx(M, { children: "10+6+6=22" }),
						"。 但只要",
						/* @__PURE__ */ jsx("strong", { children: "放弃董事长" }),
						"、改选两个下属加两个孙辈，就是 ",
						/* @__PURE__ */ jsx(M, { children: "6\\times4=24" }),
						"——贪心又输了。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"那枚举每个点「选 / 不选」的所有组合呢？",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 种，",
						/* @__PURE__ */ jsx(M, { children: "n=6000" }),
						" 直接爆炸。 问题的结构是",
						/* @__PURE__ */ jsx("strong", { children: "树" }),
						"，而树天生适合",
						/* @__PURE__ */ jsx("strong", { children: "把子树的答案往上合并" }),
						"——这正是树形 DP 的舞台。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(PostorderFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"树形 DP 的处理次序是",
							/* @__PURE__ */ jsx("strong", { children: "后序遍历" }),
							"：先把每棵子树算透，父亲才拿孩子的结果做决策。"
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
					children: "状态与转移：这个点，选还是不选"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
							"对每个点 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 开",
							/* @__PURE__ */ jsx("strong", { children: "两个" }),
							"状态，把「u 自己选没选」记进状态里："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[u][0]:\\ u\\ \\text{;}\\quad f[u][1]:\\ u" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"读作：",
							/* @__PURE__ */ jsx(M, { children: "f[u][0]" }),
							" = ",
							/* @__PURE__ */ jsx("strong", { children: "u 不选" }),
							"时，以 u 为根的整棵子树能取到的最大权；",
							/* @__PURE__ */ jsx(M, { children: "f[u][1]" }),
							" = ",
							/* @__PURE__ */ jsx("strong", { children: "u 选" }),
							"时子树的最大权。 把状态开成两份，是为了让父亲知道「孩子到底选没选」——因为父子不能同时选，这个信息必须显式带上。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(IndepDecisionFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"u 不选，孩子自由（各取 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							"）；u 选，孩子被禁（只能取孩子的「不选」态）。"
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "u 不选" }),
							"：它没占位，每个孩子 ",
							/* @__PURE__ */ jsx(M, { children: "c" }),
							" 选不选都行，各自取更优的那个："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[u][0]=\\sum_{c\\in son(u)}\\max\\big(f[c][0],\\,f[c][1]\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "u 选" }),
							"：它占了位，所有孩子都",
							/* @__PURE__ */ jsx("strong", { children: "不许选" }),
							"，只能取孩子的「不选」态，再加上 u 自己的权 ",
							/* @__PURE__ */ jsx(M, { children: "w_u" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[u][1]=w_u+\\sum_{c\\in son(u)}f[c][0]" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"边界：",
							/* @__PURE__ */ jsx("strong", { children: "叶子" }),
							"没有孩子，",
							/* @__PURE__ */ jsx(M, { children: "f[\\text{leaf}][0]=0" }),
							"、",
							/* @__PURE__ */ jsx(M, { children: "f[\\text{leaf}][1]=w_{\\text{leaf}}" }),
							"。 答案在根：",
							/* @__PURE__ */ jsx(M, { children: "\\max(f[root][0],\\,f[root][1])" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"把「u 选没选」压进状态，父子那条",
						/* @__PURE__ */ jsx("strong", { children: "唯一的约束" }),
						"就变成了两条干净的求和公式；",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 的组合塌缩成每个点 ",
						/* @__PURE__ */ jsx(M, { children: "O(1)" }),
						" 的合并，总复杂度 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						"。这套 ",
						/* @__PURE__ */ jsx(M, { children: "f[u][0/1]" }),
						" 是所有树形 DP 的第一块积木。"
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
						"用一棵小树：根 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						"（权 3）带两个孩子 ",
						/* @__PURE__ */ jsx(M, { children: "2" }),
						"（权 6）、",
						/* @__PURE__ */ jsx(M, { children: "3" }),
						"（权 2）；",
						/* @__PURE__ */ jsx(M, { children: "2" }),
						" 再带两个叶子 ",
						/* @__PURE__ */ jsx(M, { children: "4" }),
						"（权 4）、",
						/* @__PURE__ */ jsx(M, { children: "5" }),
						"（权 7）。后序次序 ",
						/* @__PURE__ */ jsx(M, { children: "4,5,2,3,1" }),
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
								children: "1"
							}), /* @__PURE__ */ jsxs("div", {
								className: "step__b",
								children: [
									/* @__PURE__ */ jsx("b", { children: "叶子 4、5、3。" }),
									" 没有孩子：",
									/* @__PURE__ */ jsx(M, { children: "f[4]=(0,4)" }),
									"、",
									/* @__PURE__ */ jsx(M, { children: "f[5]=(0,7)" }),
									"、",
									/* @__PURE__ */ jsx(M, { children: "f[3]=(0,2)" }),
									"（左不选、右选）。"
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
									"（权 6，孩子 4、5）。不选 2：",
									/* @__PURE__ */ jsx(M, { children: "\\max(0,4)+\\max(0,7)=4+7=11" }),
									"。选 2：",
									/* @__PURE__ */ jsx(M, { children: "6+f[4][0]+f[5][0]=6+0+0=6" }),
									"。得 ",
									/* @__PURE__ */ jsx(M, { children: "f[2]=(11,6)" }),
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
									"（权 3，孩子 2、3）。不选 1：",
									/* @__PURE__ */ jsx(M, { children: "\\max(11,6)+\\max(0,2)=11+2=13" }),
									"。选 1：",
									/* @__PURE__ */ jsx(M, { children: "3+f[2][0]+f[3][0]=3+11+0=14" }),
									"。得 ",
									/* @__PURE__ */ jsx(M, { children: "f[1]=(13,14)" }),
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
									/* @__PURE__ */ jsx(M, { children: "\\max(13,14)=14" }),
									"。最优取法：选 ",
									/* @__PURE__ */ jsx("strong", { children: "1、4、5" }),
									"（欢乐 3+4+7=14），没有任何一对直接上下级同时到场。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把这棵树的后序过程",
						/* @__PURE__ */ jsx("strong", { children: "逐点点亮" }),
						"：改任意员工的欢乐值，看 ",
						/* @__PURE__ */ jsx(M, { children: "f[u][0/1]" }),
						" 自底向上重新填入，根节点吐出答案。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看 dp 自底向上长出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(IndepSetDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "翻个面：最小点覆盖，转移方向正好相反"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"换一个问题：树上",
							/* @__PURE__ */ jsx("strong", { children: "放最少的士兵看守所有边" }),
							"——每条边至少有一端站着士兵（这叫",
							/* @__PURE__ */ jsx("strong", { children: "最小点覆盖" }),
							"）。 状态还是 ",
							/* @__PURE__ */ jsx(M, { children: "f[u][0/1]" }),
							"（u 不放 / 放），但转移和独立集",
							/* @__PURE__ */ jsx("strong", { children: "恰好对称" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[u][0]=\\sum_{c}f[c][1]\\qquad f[u][1]=1+\\sum_{c}\\min\\big(f[c][0],f[c][1]\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"盯住 ",
							/* @__PURE__ */ jsx(M, { children: "f[u][0]" }),
							"：u ",
							/* @__PURE__ */ jsx("strong", { children: "不放" }),
							"兵，那每条 ",
							/* @__PURE__ */ jsx(M, { children: "u\\text{-}c" }),
							" 的边就只能靠 ",
							/* @__PURE__ */ jsx("strong", { children: "c 那端" }),
							"守，于是孩子",
							/* @__PURE__ */ jsx("strong", { children: "必须放" }),
							"（取 ",
							/* @__PURE__ */ jsx(M, { children: "f[c][1]" }),
							"）。 这与独立集「u 不选、孩子自由取 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							"」正好反过来——独立集要「避免相邻」，点覆盖要「盯住每条边」。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(CoverContrastFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"同一棵树：最大独立集与最小点覆盖的选中集",
							/* @__PURE__ */ jsx("strong", { children: "互为补集" }),
							"（König 定理在树上的直观体现）。"
						]
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱：别把「孩子自由」照抄过来",
					children: [
						"写点覆盖时最容易犯的错，是把独立集的 ",
						/* @__PURE__ */ jsx(M, { children: "f[u][0]=\\sum\\max(\\dots)" }),
						" 直接搬来。",
						/* @__PURE__ */ jsx("strong", { children: "u 不放兵，孩子就没有「自由」" }),
						"——边必须有人守，孩子被强制取 ",
						/* @__PURE__ */ jsx(M, { children: "f[c][1]" }),
						"。看清「约束落在点上还是边上」，转移方向就不会写反。更复杂的「支配集」还要引入第三个状态，见 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/f/cover",
							style: { color: "var(--accent-2)" },
							children: "覆盖 / 支配 / 染色"
						}),
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
					pid: "P1352",
					name: "没有上司的舞会",
					src: "洛谷原生",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 名职员构成一棵树，每人有快乐值 ",
								/* @__PURE__ */ jsx(M, { children: "r_i" }),
								"。若某人来了，他的",
								/* @__PURE__ */ jsx("strong", { children: "直接上司" }),
								"就不来。求到场者快乐值之和的最大值。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"标准最大权独立集。",
								/* @__PURE__ */ jsx(M, { children: "f[u][0]" }),
								" = u 不来时子树最大快乐，",
								/* @__PURE__ */ jsx(M, { children: "f[u][1]" }),
								" = u 来时子树最大快乐；答案取根的两态较大。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[u][0]=\\sum\\max(f[c][0],f[c][1])" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "f[u][1]=r_u+\\sum f[c][0]" }),
								"；一遍 DFS，",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（邻接表 + 后序 DFS）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1352,
								luogu: "P1352"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2016",
					name: "战略游戏",
					src: "SEERC 2000",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"在树的节点上放士兵，每个士兵能看守",
								/* @__PURE__ */ jsx("strong", { children: "与它相连的所有边" }),
								"。求看守全部边所需的",
								/* @__PURE__ */ jsx("strong", { children: "最少士兵数" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"它是最小点覆盖，与独立集",
								/* @__PURE__ */ jsxs("strong", { children: [
									"同为 ",
									/* @__PURE__ */ jsx(M, { children: "f[u][0/1]" }),
									" 却转移方向相反"
								] }),
								"。放在独立集之后学，最能看清「约束在点还是在边」如何决定转移——一次吃透两类模型。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[u][0]=\\sum f[c][1]" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "f[u][1]=1+\\sum\\min(f[c][0],f[c][1])" }),
								"；",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2016,
								luogu: "P2016"
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
					pid: "P2458",
					name: "[SDOI2006] 保安站岗",
					hint: "最小支配集：不止「选/不选」，还要区分「被孩子覆盖」与「等父亲覆盖」，共三状态。是本部分 cover 类的核心。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1122",
					name: "最大子树和",
					hint: "f[u] = 含 u 的最大子树权和；孩子贡献为正才接上（max(0, f[c])）。链式合并、无第二维，是选点思想的轻量版。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1352",
					name: "没有上司的舞会（自测）",
					hint: "把例题不看代码独立写一遍：邻接表建树、找根、后序 DFS 填 f[u][0/1]。手熟这套骨架，后面所有树形 DP 都顺。"
				})
			]
		})
	] });
}
//#endregion
export { TreeSelect as default };
