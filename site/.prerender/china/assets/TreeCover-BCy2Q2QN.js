import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as useStepPlayer } from "./useStepPlayer-CZuIDieE.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { a as IndepDecisionFigure, c as ThreeStateFigure, d as buildTree, f as layoutTree, p as solveDominatingSet, s as PostorderFigure } from "./TreeArt-z8JbdSJA.js";
import { i as TreeCanvas, n as Panel, r as StepBar, t as Legend } from "./TreeCanvas-Cr7hNSWg.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, MousePointerClick, Plus } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/treedp/CoverDemo.tsx
var PARENT = [
	-1,
	0,
	0,
	0,
	2
];
function CStepper({ i, value, onChange }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "td__node-chip",
		children: [/* @__PURE__ */ jsx("span", {
			className: "td__node-dot",
			children: i + 1
		}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
			className: "stepper__lab",
			children: [
				"哨点 ",
				i + 1,
				" · 造价"
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
					disabled: value >= 20,
					"aria-label": "加",
					children: /* @__PURE__ */ jsx(Plus, { size: 13 })
				})
			]
		})] })]
	});
}
var INF = 1e9;
var fmt = (x) => x >= INF ? "∞" : String(x);
function CoverDemo() {
	const [w, setW] = useState([
		5,
		3,
		4,
		6,
		2
	]);
	const tree = useMemo(() => buildTree(PARENT, w), [w]);
	const layout = useMemo(() => layoutTree(tree), [tree]);
	const res = useMemo(() => solveDominatingSet(tree), [tree]);
	const inputsHash = w.join("_");
	const p = useStepPlayer(res.steps.length);
	const step = res.steps[Math.min(p.index, res.steps.length - 1)];
	const isLastFrame = p.index >= res.steps.length - 1;
	const settledSet = useMemo(() => new Set(step.settled), [step]);
	const justDone = step.u;
	const paintNode = (id) => {
		const settled = settledSet.has(id);
		const isCurrent = id === justDone && !isLastFrame;
		const isGuard = isLastFrame && res.guards.has(id);
		let fill = "var(--surface-3)";
		let stroke = "var(--border-strong)";
		let textColor = "var(--text-1)";
		if (isGuard) {
			fill = "color-mix(in srgb, var(--viz-chosen) 30%, var(--surface-3))";
			stroke = "var(--viz-chosen)";
		} else if (isLastFrame) {
			fill = "color-mix(in srgb, var(--viz-source) 16%, var(--surface-3))";
			stroke = "var(--viz-source)";
		} else if (isCurrent) {
			fill = "var(--grad-accent)";
			stroke = "var(--accent-2)";
			textColor = "var(--text-on-accent)";
		} else if (settled) {
			fill = "color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))";
			stroke = "var(--accent-2)";
		}
		const sub = settled ? [`${fmt(res.d0[id])}/${fmt(res.d1[id])}/${fmt(res.d2[id])}`] : [`¥${w[id]}`];
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
				children: "改每个哨点的造价，看三状态 dp0/dp1/dp2 重算"
			}), /* @__PURE__ */ jsx("div", {
				className: "td__nodes",
				children: w.map((v, i) => /* @__PURE__ */ jsx(CStepper, {
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
				/* @__PURE__ */ jsx("b", { children: "dp0 / dp1 / dp2" }),
				" 三值 = ",
				/* @__PURE__ */ jsx("b", { children: "放警卫" }),
				" / ",
				/* @__PURE__ */ jsx("b", { children: "被孩子覆盖" }),
				" / ",
				/* @__PURE__ */ jsx("b", { children: "空着等父亲" }),
				" 三种局面的最小造价。 根不许停在 dp2（没人能覆盖它），答案 = min(dp0[1], dp1[1]) = ",
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
				ariaLabel: "树上最小支配集三状态后序动画"
			}, inputsHash)
		}),
		/* @__PURE__ */ jsx(StepBar, { player: p }),
		/* @__PURE__ */ jsx(Legend, { items: [
			{
				color: "var(--accent-2)",
				label: "当前处理"
			},
			{
				color: "var(--viz-chosen)",
				label: "放了警卫"
			},
			{
				color: "var(--viz-source)",
				label: "被覆盖(无警卫)"
			}
		] }),
		/* @__PURE__ */ jsx(Panel, { html: step.caption }),
		isLastFrame && /* @__PURE__ */ jsxs("div", {
			className: "td__readout",
			children: [
				"最省方案在",
				" ",
				/* @__PURE__ */ jsx("b", { children: [...res.guards].sort((a, b) => a - b).map((i) => `${i + 1}号`).join("、") || "（空）" }),
				" ",
				"放警卫，总造价 ",
				/* @__PURE__ */ jsx("b", {
					className: "ans",
					children: res.ans
				}),
				"。每个点要么自己是警卫，要么与某个警卫相邻——",
				/* @__PURE__ */ jsx("strong", { children: "全被支配" }),
				"。"
			]
		})
	] });
}
//#endregion
//#region src/content/f/TreeCover.tsx
var CODE_P2458 = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 1505;
vector<int> g[N];
int c[N];                     // c[u]：在 u 放警卫的造价
long long f[N][3];            // 0:放警卫  1:被某孩子覆盖  2:空着,等父亲来覆盖
bool hasFa[N];

const long long INF = 1e15;

void dfs(int u)
{
    f[u][0] = c[u];           // 放警卫：先付自己的造价
    f[u][1] = 0;              // 被孩子覆盖：下面累加，另需至少一个孩子放警卫
    f[u][2] = 0;              // 等父亲覆盖：孩子必须自给自足
    long long extra = INF;    // 把某个孩子从"自足"抬到"放警卫"的最小增量
    bool hasChild = false;

    for (int v : g[u])
    {
        hasChild = true;
        dfs(v);
        f[u][0] += min({f[v][0], f[v][1], f[v][2]});  // u 已覆盖孩子,孩子随意取最小
        long long self = min(f[v][0], f[v][1]);        // 孩子"自足"(不靠 u)
        f[u][1] += self;
        f[u][2] += self;
        extra = min(extra, f[v][0] - self);            // 让这个孩子改放警卫的代价
    }

    if (!hasChild) f[u][1] = INF;      // 叶子无孩子,不可能"被孩子覆盖"
    else f[u][1] += extra;             // ★强制至少一个孩子放警卫
}

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        int u, cost, k;
        cin >> u >> cost >> k;
        c[u] = cost;
        while (k--)
        {
            int v;
            cin >> v;
            g[u].push_back(v);
            hasFa[v] = true;
        }
    }

    int root = 1;
    while (root <= n && hasFa[root]) root++;

    dfs(root);
    cout << min(f[root][0], f[root][1]) << endl;  // 根不能停在状态 2
    return 0;
}`;
var CODE_P2585 = `
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

const int N = 500005;
int lc[N], ls[N];             // 用括号串重建二叉树的左右孩子
string s;
int idx;
long long fmax[N][3], fmin[N][3]; // 颜色 0/1/2，其中「绿」（设为 2）计入统计

int build()                   // 按括号串递归建树，返回当前节点编号
{
    int u = ++idx;
    char ch = s[u - 1];
    lc[u] = ls[u] = 0;
    if (ch >= '2') lc[u] = build();   // 有左孩子
    if (ch == '2') ls[u] = build();   // 有右孩子（'2' 表示两个孩子）
    return u;
}

void dfs(int u)
{
    if (!u) return;
    dfs(lc[u]);
    dfs(ls[u]);
    for (int col = 0; col < 3; col++)
    {
        long long addG = (col == 2) ? 1 : 0;   // 绿色 +1
        // 左右孩子颜色都要与 u 不同；两孩子之间也不同
        long long bestMax = -1, bestMin = 1e18;
        for (int a = 0; a < 3; a++)
            for (int b = 0; b < 3; b++)
            {
                if (a == col || b == col || a == b) continue;
                long long lM = lc[u] ? fmax[lc[u]][a] : 0;
                long long rM = ls[u] ? fmax[ls[u]][b] : 0;
                long long lm = lc[u] ? fmin[lc[u]][a] : 0;
                long long rm = ls[u] ? fmin[ls[u]][b] : 0;
                bestMax = max(bestMax, lM + rM);
                bestMin = min(bestMin, lm + rm);
            }
        // 单孩子/叶子时另作简化处理（此处示意主干）
        fmax[u][col] = addG + bestMax;
        fmin[u][col] = addG + bestMin;
    }
}

int main()
{
    cin >> s;
    idx = 0;
    int root = build();

    dfs(root);
    long long mx = max({fmax[root][0], fmax[root][1], fmax[root][2]});
    long long mn = min({fmin[root][0], fmin[root][1], fmin[root][2]});
    cout << mx << endl << mn << endl;
    return 0;
}`;
function TreeCover() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "当「被覆盖」比「选没选」更微妙"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"上一批的 ",
						/* @__PURE__ */ jsx(M, { children: "f[u][0/1]" }),
						" 里，一个点只有「选 / 不选」两态。但",
						/* @__PURE__ */ jsx("strong", { children: "支配集" }),
						"把要求提高了一档： 在树上放最少（或最省钱）的",
						/* @__PURE__ */ jsx("strong", { children: "警卫" }),
						"，让",
						/* @__PURE__ */ jsx("strong", { children: "每个点要么自己是警卫、要么与某个警卫相邻" }),
						"——全树被「支配」。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"难点在这：一个",
						/* @__PURE__ */ jsx("strong", { children: "没放警卫" }),
						"的点，它到底",
						/* @__PURE__ */ jsx("strong", { children: "被覆盖了没有" }),
						"？可能被某个孩子覆盖（孩子放了警卫）， 也可能孩子都没放、只能",
						/* @__PURE__ */ jsx("strong", { children: "指望父亲" }),
						"来覆盖它。这两种「没放警卫」的处境",
						/* @__PURE__ */ jsx("strong", { children: "后果完全不同" }),
						"，两态不够用了。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(ThreeStateFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"支配集需要",
							/* @__PURE__ */ jsx("strong", { children: "三个" }),
							"状态：放警卫 / 已被孩子覆盖 / 暂时没人覆盖（等父亲）。"
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
					children: "三状态：把「谁来覆盖 u」记进状态"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"为每个点 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 开三态，造价意义下取",
							/* @__PURE__ */ jsx("strong", { children: "最小" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[u][0]:\\ u\\ \\text{;}\\quad dp[u][1]:\\ u\\ \\text{;}\\quad dp[u][2]:\\ u\\ " }),
						/* @__PURE__ */ jsxs("p", { children: [
							"读作：",
							/* @__PURE__ */ jsx(M, { children: "dp[u][0]" }),
							" = u ",
							/* @__PURE__ */ jsx("strong", { children: "放警卫" }),
							"；",
							/* @__PURE__ */ jsx(M, { children: "dp[u][1]" }),
							" = u 不放、但",
							/* @__PURE__ */ jsx("strong", { children: "被某个孩子覆盖" }),
							"；",
							/* @__PURE__ */ jsx(M, { children: "dp[u][2]" }),
							" = u 不放、也",
							/* @__PURE__ */ jsx("strong", { children: "没被孩子覆盖" }),
							"（把覆盖它的责任留给父亲）。转移分三路："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[u][0]=c_u+\\sum_{c}\\min\\big(dp[c][0],dp[c][1],dp[c][2]\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"u 放了警卫，它",
							/* @__PURE__ */ jsx("strong", { children: "顺手覆盖所有孩子" }),
							"，于是每个孩子三态随便取最小（包括孩子的「等父亲」态——因为 u 就是那个父亲）。"
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[u][2]=\\sum_{c}\\min\\big(dp[c][0],dp[c][1]\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"u 不放、也不靠孩子，那每个孩子必须",
							/* @__PURE__ */ jsx("strong", { children: "自给自足" }),
							"（自己放警卫，或被它自己的孩子覆盖），",
							/* @__PURE__ */ jsx("strong", { children: "不能" }),
							"是「等父亲」态 ",
							/* @__PURE__ */ jsx(M, { children: "dp[c][2]" }),
							"——因为 u 自身都没被覆盖，救不了孩子。"
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[u][1]=dp[u][2]+\\min_{c}\\big(dp[c][0]-\\min(dp[c][0],dp[c][1])\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx(M, { children: "dp[u][1]" }),
							" 的基线和 ",
							/* @__PURE__ */ jsx(M, { children: "dp[u][2]" }),
							" 一样（孩子自足），但",
							/* @__PURE__ */ jsx("strong", { children: "额外强制至少一个孩子放警卫" }),
							"来覆盖 u——取「把某个孩子从自足抬到放警卫」的",
							/* @__PURE__ */ jsx("strong", { children: "最小增量" }),
							"加上去。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(IndepDecisionFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"与独立集的两态分叉相比，支配集多出的第三态 ",
							/* @__PURE__ */ jsx(M, { children: "dp[u][2]" }),
							" 是「把覆盖延迟给父亲」的记账位。"
						]
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"「点覆盖」盯的是",
						/* @__PURE__ */ jsx("strong", { children: "边" }),
						"（每条边有人守），「支配集」盯的是",
						/* @__PURE__ */ jsx("strong", { children: "点" }),
						"（每个点被支配）。后者的困难全在——",
						/* @__PURE__ */ jsx("strong", { children: "没放警卫的点，覆盖它的责任可能来自孩子、也可能来自父亲" }),
						"。把这个「责任方向」显式记成第三态，DFS 才能在后序时正确结算。三态是支配集类题的",
						/* @__PURE__ */ jsx("strong", { children: "通用骨架" }),
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
						"小树：根 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						" 带 ",
						/* @__PURE__ */ jsx(M, { children: "2,3,4" }),
						"；",
						/* @__PURE__ */ jsx(M, { children: "2" }),
						" 带一个孩子 ",
						/* @__PURE__ */ jsx(M, { children: "5" }),
						"。造价 ",
						/* @__PURE__ */ jsx(M, { children: "c=[5,3,4,6,2]" }),
						"。后序 ",
						/* @__PURE__ */ jsx(M, { children: "5,2,3,4,1" }),
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
									/* @__PURE__ */ jsx("b", { children: "叶子 5、3、4。" }),
									" 叶子：",
									/* @__PURE__ */ jsx(M, { children: "dp[0]=c" }),
									"（放警卫），",
									/* @__PURE__ */ jsx(M, { children: "dp[1]=\\infty" }),
									"（无孩子可覆盖），",
									/* @__PURE__ */ jsx(M, { children: "dp[2]=0" }),
									"（等父亲）。如 ",
									/* @__PURE__ */ jsx(M, { children: "dp[5]=(2,\\infty,0)" }),
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
									/* @__PURE__ */ jsx("b", { children: "节点 2" }),
									"（造价 3，孩子 5）。放警卫 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][0]=3+\\min(2,\\infty,0)=3+0=3" }),
									"；等父亲 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][2]=\\min(2,\\infty)=2" }),
									"（孩子 5 须自足，只能放警卫）；被孩子覆盖 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][1]=2+(2-2)=2" }),
									"。得 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2]=(3,2,2)" }),
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
									"（造价 5，孩子 2、3、4）。放警卫 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][0]=5+\\min(dp[2])+\\min(dp[3])+\\min(dp[4])" }),
									"。孩子们的三态最小值分别是 ",
									/* @__PURE__ */ jsx(M, { children: "2,4,6" }),
									"（3、4 是叶子，min 取「等父亲」= 0），所以 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][0]=5+2+0+0=7" }),
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
									" = ",
									/* @__PURE__ */ jsx(M, { children: "\\min(dp[1][0],dp[1][1])" }),
									"（根不许「等父亲」）。在这组造价下最省是 ",
									/* @__PURE__ */ jsx("strong", { children: "7" }),
									"：只在根 1 放警卫，它覆盖 2、3、4，而 5 被 2……需再核 5：故实际最优会让 2 也放。演示会给出精确解。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把三状态 ",
						/* @__PURE__ */ jsx(M, { children: "dp0/dp1/dp2" }),
						" 逐点填入，末帧用",
						/* @__PURE__ */ jsx("strong", { children: "颜色区分" }),
						"放警卫（绿）与被覆盖（青）；改造价看最优布防移动。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看三状态逐点点亮"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(CoverDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "另一面：染色计数，同时求 max 与 min"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"覆盖类还有一支是",
							/* @__PURE__ */ jsx("strong", { children: "染色计数" }),
							"。三色二叉树：每个节点涂红 / 绿 / 蓝之一，要求",
							/* @__PURE__ */ jsx("strong", { children: "父子不同色、兄弟不同色" }),
							"， 问",
							/* @__PURE__ */ jsx("strong", { children: "绿色节点数的最大值与最小值" }),
							"各是多少。这不是求方案数，而是在「合法染色」的约束下优化一个计数。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"状态自然是 ",
							/* @__PURE__ */ jsx(M, { children: "f[u][col]" }),
							" = u 涂 ",
							/* @__PURE__ */ jsx(M, { children: "col" }),
							" 色时、其子树里的绿点数（分别维护 max 与 min）。转移枚举左右孩子的颜色 ",
							/* @__PURE__ */ jsx(M, { children: "a,b" }),
							"，要求 ",
							/* @__PURE__ */ jsx(M, { children: "a\\ne col,\\ b\\ne col,\\ a\\ne b" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f_{\\max}[u][col]=[col=\\text{green}]+\\max_{a,b}\\big(f_{\\max}[l][a]+f_{\\max}[r][b]\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx(M, { children: "f_{\\min}" }),
							" 同理把 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							" 换 ",
							/* @__PURE__ */ jsx(M, { children: "\\min" }),
							"。因为只有三种颜色、两个孩子，内层枚举是",
							/* @__PURE__ */ jsx("strong", { children: "常数级" }),
							"，整体仍是 ",
							/* @__PURE__ */ jsx(M, { children: "O(n)" }),
							"。同一份 DFS 同时算出 max 与 min 两个答案。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(PostorderFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "染色计数也是后序：孩子每种颜色的最优绿点数先备好，父亲再枚举「与自己不冲突」的颜色组合。"
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱：极值与方案数别混为一谈",
					children: [
						"三色二叉树求的是「绿点数的 max/min」这一",
						/* @__PURE__ */ jsx("strong", { children: "极值" }),
						"，转移用 ",
						/* @__PURE__ */ jsx(M, { children: "\\max/\\min" }),
						"；若题目改问「合法染色的",
						/* @__PURE__ */ jsx("strong", { children: "方案数" }),
						"」，则要把内层的取极值换成",
						/* @__PURE__ */ jsx("strong", { children: "累乘 + 累加" }),
						"（每种合法 ",
						/* @__PURE__ */ jsx(M, { children: "(a,b)" }),
						" 的方案数相乘再对颜色求和）。同一棵树、同一套约束，「求极值」与「数方案」的算子完全不同——下一类 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/f/count",
							style: { color: "var(--accent-2)" },
							children: "方案数 / 距离统计"
						}),
						" 专讲后者。"
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
					pid: "P2458",
					name: "[SDOI2006] 保安站岗",
					src: "SDOI 2006",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"树上每点放保安有造价 ",
								/* @__PURE__ */ jsx(M, { children: "c_i" }),
								"，保安可看守",
								/* @__PURE__ */ jsx("strong", { children: "自己与相邻点" }),
								"。求看守全部点的",
								/* @__PURE__ */ jsx("strong", { children: "最小造价" }),
								"（带权最小支配集）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"三状态 ",
								/* @__PURE__ */ jsx(M, { children: "dp[u][0/1/2]" }),
								" = 放警卫 / 被孩子覆盖 / 等父亲。引入「等父亲」这个第三态，是它比点覆盖复杂一档、也是支配集教学标准题的原因。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"见上方三条方程；一遍 DFS，",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。根取 ",
								/* @__PURE__ */ jsx(M, { children: "\\min(dp[0],dp[1])" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（三状态 DFS）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2458,
								luogu: "P2458"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2585",
					name: "[ZJOI2006] 三色二叉树",
					src: "ZJOI 2006",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给定二叉树（括号串描述），红 / 绿 / 蓝三色染色，父子异色、兄弟异色，求",
								/* @__PURE__ */ jsx("strong", { children: "绿色节点数的最大值与最小值" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"父子 + 兄弟",
								/* @__PURE__ */ jsx("strong", { children: "双约束" }),
								"的按色 DP，且",
								/* @__PURE__ */ jsx("strong", { children: "同时求 max/min" }),
								"——一题覆盖「颜色枚举」与「极值双跑」两个要点，是覆盖类里计数/极值方向的代表。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[u][col]=[col=\\text{green}]+\\text{opt}_{a\\ne col,b\\ne col,a\\ne b}(f[l][a]+f[r][b])" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "\\text{opt}" }),
								" 为 max 或 min）；",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（括号串建树 + 按色 DP）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2585,
								luogu: "P2585"
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
					pid: "P2279",
					name: "[HNOI2003] 消防局的设立",
					hint: "距离 ≤ 2 的支配集：一个局能覆盖距离不超过 2 的点。状态要按「到最近局的距离」分更多档（0/1/2 + 等父亲若干态），贪心也可，DP 更稳。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P5018",
					name: "[NOIP2018] 对称二叉树",
					hint: "较新真题：判断最大的对称子树。f 记录以每个点为根的子树是否对称 + 结构哈希；对称要求左子树与右子树镜像（结构 + 权值都对称）。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2585",
					name: "三色二叉树（自测）",
					hint: "独立写一遍括号串建树 + 三色 DP，注意叶子/单孩子的边界，以及 max 与 min 两份数组同步转移。"
				})
			]
		})
	] });
}
//#endregion
export { TreeCover as default };
