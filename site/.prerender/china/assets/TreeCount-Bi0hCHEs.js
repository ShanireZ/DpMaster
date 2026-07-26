import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { d as buildTree, f as layoutTree, h as solveJointWeight, o as JointWeightFigure, s as PostorderFigure, t as BracketTreeFigure } from "./TreeArt-z8JbdSJA.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, MousePointerClick, Plus } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/treedp/JointWeightDemo.tsx
var PARENT = [
	-1,
	0,
	0,
	0,
	1,
	1
];
function JointWeightDemo() {
	const [w, setW] = useState([
		5,
		3,
		2,
		4,
		6,
		1
	]);
	const [mid, setMid] = useState(0);
	const tree = useMemo(() => buildTree(PARENT, w), [w]);
	const layout = useMemo(() => layoutTree(tree), [tree]);
	const res = useMemo(() => solveJointWeight(tree), [tree]);
	const nbSet = useMemo(() => new Set(res.neighbors[mid]), [res, mid]);
	const paintNode = (id) => {
		const isMid = id === mid;
		const isNb = nbSet.has(id);
		let fill = "var(--surface-3)";
		let stroke = "var(--border-strong)";
		let textColor = "var(--text-1)";
		if (isMid) {
			fill = "var(--grad-accent)";
			stroke = "var(--accent-2)";
			textColor = "var(--text-on-accent)";
		} else if (isNb) {
			fill = "color-mix(in srgb, var(--viz-source) 22%, var(--surface-3))";
			stroke = "var(--viz-source)";
		}
		return {
			fill,
			stroke,
			strokeWidth: isMid ? 2.8 : isNb ? 2.2 : 1.6,
			textColor,
			sub: [`w=${w[id]}`]
		};
	};
	const edgeActive = (a, b) => a === mid && nbSet.has(b) || b === mid && nbSet.has(a);
	const width = 540;
	const padX = 46;
	const topY = 36;
	const rowH = 92;
	const radius = 22;
	const H = topY + layout.maxDepth * rowH + 44;
	const px = (x) => padX + x * (width - 2 * padX);
	const py = (d) => topY + d * rowH;
	const nbList = res.neighbors[mid];
	const pairs = [];
	for (let i = 0; i < nbList.length; i++) for (let j = i + 1; j < nbList.length; j++) pairs.push([nbList[i], nbList[j]]);
	const setWeight = (i, v) => setW((arr) => arr.map((x, k) => k === i ? v : x));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "td__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "td__group-label",
				children: "改点权，点任意节点当「中间点」"
			}), /* @__PURE__ */ jsx("div", {
				className: "td__nodes",
				children: w.map((v, i) => /* @__PURE__ */ jsxs("div", {
					className: "td__node-chip",
					children: [/* @__PURE__ */ jsx("span", {
						className: "td__node-dot",
						children: i + 1
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "stepper__lab",
						children: [
							"点 ",
							i + 1,
							" · 权"
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "stepper__row",
						children: [
							/* @__PURE__ */ jsx("button", {
								onClick: () => setWeight(i, v - 1),
								disabled: v <= 1,
								"aria-label": "减",
								children: /* @__PURE__ */ jsx(Minus, { size: 13 })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "stepper__val",
								children: v
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: () => setWeight(i, v + 1),
								disabled: v >= 15,
								"aria-label": "加",
								children: /* @__PURE__ */ jsx(Plus, { size: 13 })
							})
						]
					})] })]
				}, i))
			})] })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "td__hint",
			children: [
				"距离恰为 2 的点对 ⇔ 有",
				/* @__PURE__ */ jsx("strong", { children: "公共中间点" }),
				"。点选中间点 ",
				/* @__PURE__ */ jsx("b", { children: mid + 1 }),
				"，它的邻居两两配对就是所有以它为中点的距离 2 点对。 全树联合权值总和 = ",
				/* @__PURE__ */ jsx("b", {
					className: "ans",
					children: res.totalSum
				}),
				"，最大 = ",
				/* @__PURE__ */ jsx("b", {
					className: "ans",
					children: res.globalMax
				}),
				"。"
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "td__stage",
			children: /* @__PURE__ */ jsxs("svg", {
				viewBox: `0 0 ${width} ${H}`,
				role: "img",
				"aria-label": "联合权值：以选中点为中间点的距离 2 点对",
				children: [layout.edges.map((e, i) => {
					const a = layout.byId.get(e.a);
					const b = layout.byId.get(e.b);
					const on = edgeActive(e.a, e.b);
					return /* @__PURE__ */ jsx("line", {
						x1: px(a.x),
						y1: py(a.depth) + radius,
						x2: px(b.x),
						y2: py(b.depth) - radius,
						stroke: on ? "var(--viz-source)" : "var(--border-strong)",
						strokeWidth: on ? 3.2 : 1.6
					}, i);
				}), layout.nodes.map((nd) => {
					const pnt = paintNode(nd.id);
					return /* @__PURE__ */ jsxs("g", {
						className: "node",
						transform: `translate(${px(nd.x)},${py(nd.depth)})`,
						style: { cursor: "pointer" },
						onClick: () => setMid(nd.id),
						children: [
							/* @__PURE__ */ jsx("circle", {
								r: radius,
								fill: pnt.fill,
								stroke: pnt.stroke,
								strokeWidth: pnt.strokeWidth ?? 1.6
							}),
							/* @__PURE__ */ jsx("text", {
								y: -3,
								textAnchor: "middle",
								fontSize: "14",
								fontWeight: "700",
								fill: pnt.textColor ?? "var(--text-1)",
								children: nd.id + 1
							}),
							pnt.sub?.map((s, k) => /* @__PURE__ */ jsx("text", {
								y: 11,
								textAnchor: "middle",
								fontSize: "9",
								className: "mono",
								fill: pnt.textColor ?? "var(--text-3)",
								children: s
							}, k))
						]
					}, nd.id);
				})]
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "td__readout",
			children: pairs.length === 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
				"中间点 ",
				/* @__PURE__ */ jsx("b", { children: mid + 1 }),
				" 只有 <2 个邻居，凑不出距离 2 的点对。换一个度更高的点试试。"
			] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
				"以 ",
				/* @__PURE__ */ jsx("b", { children: mid + 1 }),
				" 为中点的点对：",
				/* @__PURE__ */ jsxs("b", { children: [" ", pairs.map(([a, b]) => `(${a + 1},${b + 1})`).join("、")] }),
				"。乘积之和 = ",
				pairs.map(([a, b]) => `${w[a]}×${w[b]}`).join(" + "),
				" =",
				" ",
				/* @__PURE__ */ jsx("b", {
					className: "ans",
					children: res.midSum[mid]
				}),
				"（有序对，正反各算一次）。 O(度) 一次算完，无需两两枚举。"
			] })
		})
	] });
}
//#endregion
//#region src/content/f/TreeCount.tsx
var CODE_P1351 = `
#include <iostream>
#include <vector>
using namespace std;

const int N = 200005;
const long long MOD = 10007;
vector<int> g[N];
long long w[N];
long long sumAns, maxAns;

void dfs(int u, int fa)
{
    long long s1 = 0, s2 = 0;         // 邻居权和、平方和
    long long mx1 = 0, mx2 = 0;       // 最大、次大邻居权

    for (int v : g[u])                // ★邻居 = 所有相连点（父 + 孩子）
    {
        s1 = (s1 + w[v]) % MOD;
        s2 = (s2 + w[v] * w[v]) % MOD;
        if (w[v] > mx1) { mx2 = mx1; mx1 = w[v]; }
        else if (w[v] > mx2) mx2 = w[v];
    }

    // 以 u 为中间点的所有距离 2 有序点对：乘积和 = (Σw)² − Σw²
    sumAns = (sumAns + (s1 * s1 - s2) % MOD + MOD) % MOD;
    maxAns = max(maxAns, mx1 * mx2);  // 最大乘积 = 最大 × 次大

    for (int v : g[u])
        if (v != fa) dfs(v, u);
}

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i < n; i++)
    {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }
    for (int i = 1; i <= n; i++)
        cin >> w[i];

    dfs(1, 0);
    cout << maxAns << " " << sumAns << endl;
    return 0;
}`;
var CODE_P5658 = `
#include <iostream>
#include <vector>
#include <string>
using namespace std;

const int N = 500005;
vector<int> g[N];
string s;                     // 每个点上是 '(' 或 ')'
long long f[N];               // f[u]：以 u 结尾、向上到根方向的合法括号子串数
long long ans;
int stk[N], top;              // 用栈匹配括号（栈存节点编号）
int match[N];                 // match[u]：与 u 配对的那个 '(' 的父亲上一位

void dfs(int u, int fa)
{
    int saved = -1;           // 记录本层对栈的修改，回溯时撤销
    if (s[u - 1] == '(')      // '(' 入栈
    {
        stk[++top] = u;
        // f[u] 继承父亲：新的 '(' 自身不能结尾合法串
        f[u] = f[fa];
    }
    else                      // ')' 尝试与栈顶配对
    {
        if (top > 0)
        {
            int p = stk[top--]; // 弹出配对的 '('
            saved = p;
            // p 的父亲那条链上的 f + 本次新增的 1 个（p..u 这一对）
            f[u] = f[/*p 的父亲*/ fa] + 1;   // 示意：真实实现用 match 链递推
        }
        else
            f[u] = 0;
    }

    ans += f[u];              // ★累加：每个点贡献「以它结尾的合法子串数」

    for (int v : g[u])
        if (v != fa) dfs(v, u);

    if (s[u - 1] == '(') top--;          // 撤销入栈
    else if (saved != -1) stk[++top] = saved;  // 撤销出栈
}

int main()
{
    int n;
    cin >> n >> s;
    for (int i = 2; i <= n; i++)
    {
        int fa;
        cin >> fa;
        g[fa].push_back(i);
    }

    top = 0;
    dfs(1, 0);
    cout << ans << endl;
    return 0;
}`;
function TreeCount() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "从「求最优」转向「数东西」"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"前几类都在求",
							/* @__PURE__ */ jsx("strong", { children: "极值" }),
							"（最大权、最小造价、最长链）。这一类换一副眼镜：",
							/* @__PURE__ */ jsx("strong", { children: "统计" }),
							"—— 数满足某种条件的",
							/* @__PURE__ */ jsx("strong", { children: "点对 / 路径 / 子串" }),
							"有多少、或它们的某个量之和是多少。转移里 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							" 常换成",
							/* @__PURE__ */ jsxs("strong", { children: ["求和 ", /* @__PURE__ */ jsx(M, { children: "+" })] }),
							" 或",
							/* @__PURE__ */ jsx("strong", { children: "乘法" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"先看一类清爽的：",
							/* @__PURE__ */ jsx("strong", { children: "距离恰为 2 的点对" }),
							"统计。给树上每点一个权，要求",
							/* @__PURE__ */ jsx("strong", { children: "所有距离为 2 的点对，其权乘积之和" }),
							"（以及最大乘积）。 直接两两枚举点对是 ",
							/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
							"，",
							/* @__PURE__ */ jsx(M, { children: "n=2\\times10^5" }),
							" 不可行。关键观察一句话解决："
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "两点距离为 2，当且仅当它们有一个公共邻居" }),
							"（那个邻居是路径的中间点）。于是不枚举点对，改",
							/* @__PURE__ */ jsx("strong", { children: "枚举中间点" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "m" }),
							"——m 的任意两个邻居就构成一个距离 2 点对。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(JointWeightFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"距离 2 的点对 ",
							/* @__PURE__ */ jsx(M, { children: "(a,b)" }),
							" 必经一个中间点 ",
							/* @__PURE__ */ jsx(M, { children: "m" }),
							"；枚举 m，它的邻居两两配对即所有此类点对。"
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
					children: "O(度) 一次算完一个中间点"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"固定中间点 ",
							/* @__PURE__ */ jsx(M, { children: "m" }),
							"，设它的邻居权为 ",
							/* @__PURE__ */ jsx(M, { children: "x_1,x_2,\\dots,x_k" }),
							"。所有",
							/* @__PURE__ */ jsx("strong", { children: "有序" }),
							"点对的乘积之和是："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\sum_{i\\ne j} x_i x_j=\\Big(\\sum_i x_i\\Big)^2-\\sum_i x_i^2" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"这是一个恒等式：",
							/* @__PURE__ */ jsx("strong", { children: "「和的平方」减去「平方和」" }),
							"，恰好去掉了 ",
							/* @__PURE__ */ jsx(M, { children: "i=j" }),
							" 的对角项，剩下的正是所有 ",
							/* @__PURE__ */ jsx(M, { children: "i\\ne j" }),
							" 的交叉乘积。 只需扫一遍 m 的邻居累加 ",
							/* @__PURE__ */ jsx(M, { children: "\\sum x" }),
							" 与 ",
							/* @__PURE__ */ jsx(M, { children: "\\sum x^2" }),
							"，",
							/* @__PURE__ */ jsx(M, { children: "O(\\deg m)" }),
							" 就得到以 m 为中点的乘积和； 所有中间点加起来，总和是 ",
							/* @__PURE__ */ jsx(M, { children: "\\sum_m \\deg m=O(n)" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"最大乘积同理：维护 m 邻居里的",
							/* @__PURE__ */ jsx("strong", { children: "最大与次大" }),
							"两个权，",
							/* @__PURE__ */ jsx(M, { children: "x_{(1)}\\cdot x_{(2)}" }),
							" 即以 m 为中点的最大乘积；全局取最大。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(PostorderFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"在树上，m 的邻居 = ",
							/* @__PURE__ */ jsx("strong", { children: "父亲 + 所有孩子" }),
							"；一遍 DFS 到每个点时就地统计，无需额外遍历。"
						]
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"距离统计的通用招数是",
						/* @__PURE__ */ jsx("strong", { children: "换枚举对象" }),
						"：不枚举「点对」而枚举「中间点 / 路径拐点」，把 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 的两两配对，压成每个点 ",
						/* @__PURE__ */ jsx(M, { children: "O(\\deg)" }),
						" 的局部统计。配合",
						/* @__PURE__ */ jsx("strong", { children: "「和的平方 − 平方和」" }),
						"这类恒等式，一次算完一个中心的全部贡献。这是树上「数点对」的核心思维。"
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
						/* @__PURE__ */ jsx(M, { children: "1" }),
						" 的孩子 ",
						/* @__PURE__ */ jsx(M, { children: "2" }),
						" 又带 ",
						/* @__PURE__ */ jsx(M, { children: "5,6" }),
						"。权 ",
						/* @__PURE__ */ jsx(M, { children: "w=[5,3,2,4,6,1]" }),
						"。逐个中间点统计："
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
									/* @__PURE__ */ jsx("b", { children: "中间点 1" }),
									"（邻居 2、3、4，权 3、2、4）。",
									/* @__PURE__ */ jsx(M, { children: "\\sum x=9,\\ \\sum x^2=9+4+16=29" }),
									"。乘积和 ",
									/* @__PURE__ */ jsx(M, { children: "=9^2-29=81-29=52" }),
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
									/* @__PURE__ */ jsx("b", { children: "中间点 2" }),
									"（邻居 1、5、6，权 5、6、1）。",
									/* @__PURE__ */ jsx(M, { children: "\\sum x=12,\\ \\sum x^2=25+36+1=62" }),
									"。乘积和 ",
									/* @__PURE__ */ jsx(M, { children: "=144-62=82" }),
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
								children: [/* @__PURE__ */ jsx("b", { children: "中间点 3、4、5、6" }), " 都是叶子，只有 1 个邻居，凑不出点对，贡献 0。"]
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
									/* @__PURE__ */ jsx("b", { children: "总乘积和" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "52+82=134" }),
									"；",
									/* @__PURE__ */ jsx("b", { children: "最大乘积" }),
									"出现在中间点 2 的「5×6=30」。全程一遍 DFS。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示让你",
						/* @__PURE__ */ jsx("strong", { children: "点选中间点" }),
						"，高亮它的邻居并列出所有距离 2 点对与乘积和；改点权实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "点选中间点，看点对怎么冒出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(JointWeightDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "沿根链递推：括号树的 O(1) 计数"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"另一支是",
							/* @__PURE__ */ jsx("strong", { children: "沿「根到点」的链递推方案计数" }),
							"。括号树：每个节点写着一个 ",
							/* @__PURE__ */ jsx(M, { children: "(" }),
							" 或 ",
							/* @__PURE__ */ jsx(M, { children: ")" }),
							"， 从根到某点的路径拼成一个括号串。要数出",
							/* @__PURE__ */ jsx("strong", { children: "所有节点" }),
							"对应的根链里，",
							/* @__PURE__ */ jsx("strong", { children: "合法括号子串" }),
							"的总数。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"暴力对每个点重扫根链是 ",
							/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
							"。妙处在于：设 ",
							/* @__PURE__ */ jsx(M, { children: "f[u]" }),
							" = 「",
							/* @__PURE__ */ jsx("strong", { children: "以 u 这个字符结尾" }),
							"的合法括号子串数」， 它能从",
							/* @__PURE__ */ jsx("strong", { children: "父亲 O(1) 递推" }),
							"——若 ",
							/* @__PURE__ */ jsx(M, { children: "u" }),
							" 是 ",
							/* @__PURE__ */ jsx(M, { children: ")" }),
							" 且能与链上某个 ",
							/* @__PURE__ */ jsx(M, { children: "(" }),
							" 配对（设那个 ",
							/* @__PURE__ */ jsx(M, { children: "(" }),
							" 的前一位是 ",
							/* @__PURE__ */ jsx(M, { children: "p" }),
							"），则"
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[u]=f[p]+1" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"读作：以 u 结尾的合法子串 = 「以 p 结尾的合法子串」全部各自向右接上这对括号，",
							/* @__PURE__ */ jsx("strong", { children: "再加" }),
							"「刚配好的这一对」本身。 用一个",
							/* @__PURE__ */ jsx("strong", { children: "栈" }),
							"沿 DFS 维护未匹配的 ",
							/* @__PURE__ */ jsx(M, { children: "(" }),
							"，进入子树时压栈 / 匹配，",
							/* @__PURE__ */ jsx("strong", { children: "回溯时撤销" }),
							"。答案 = ",
							/* @__PURE__ */ jsx(M, { children: "\\sum_u f[u]" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BracketTreeFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"根链「(())」：每位的 ",
							/* @__PURE__ */ jsx(M, { children: "f" }),
							" 由父亲 ",
							/* @__PURE__ */ jsx(M, { children: "O(1)" }),
							" 递推，末位结尾有 2 个合法子串（",
							/* @__PURE__ */ jsx(M, { children: "()" }),
							" 与 ",
							/* @__PURE__ */ jsx(M, { children: "(())" }),
							"）。"
						]
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱：DFS 上的栈必须回溯撤销",
					children: [
						"括号树是在",
						/* @__PURE__ */ jsx("strong", { children: "树" }),
						"上而非一条链上递推——从一个子树退回父亲、再进入",
						/* @__PURE__ */ jsx("strong", { children: "另一个" }),
						"子树时，前一支压入栈的 ",
						/* @__PURE__ */ jsx(M, { children: "(" }),
						" 必须",
						/* @__PURE__ */ jsx("strong", { children: "弹出还原" }),
						"，否则会串味。标准写法是「进入时记下本层对栈的修改，",
						/* @__PURE__ */ jsx("strong", { children: "递归返回后原样撤销" }),
						"」（可回滚栈）。另外 ",
						/* @__PURE__ */ jsx(M, { children: "f[u]" }),
						" 与答案都可能超 int，用 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{long long}" }),
						"。"
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"这两支——",
						/* @__PURE__ */ jsx("strong", { children: "枚举中间点做距离统计" }),
						"与",
						/* @__PURE__ */ jsx("strong", { children: "沿根链 O(1) 递推计数" }),
						"——覆盖了树上「数东西」的两大范式： 前者靠「换枚举对象 + 恒等式」摊平代价，后者靠「父到子的增量递推」避免重扫。它们和 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/f/cover",
							style: { color: "var(--accent-2)" },
							children: "覆盖 / 染色"
						}),
						" 里的方案计数一脉相承，只是把极值算子换成了求和 / 乘法。"
					] })
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
					pid: "P1351",
					name: "[NOIP2014] 联合权值",
					src: "NOIP 2014 提高组",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"无根树每点有权 ",
								/* @__PURE__ */ jsx(M, { children: "w_i" }),
								"。距离恰为 2 的",
								/* @__PURE__ */ jsx("strong", { children: "有序" }),
								"点对 ",
								/* @__PURE__ */ jsx(M, { children: "(u,v)" }),
								" 的「联合权值」= ",
								/* @__PURE__ */ jsx(M, { children: "w_u\\cdot w_v" }),
								"。求所有联合权值的",
								/* @__PURE__ */ jsx("strong", { children: "最大值" }),
								"与",
								/* @__PURE__ */ jsx("strong", { children: "之和" }),
								"（对 10007 取模）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"距离 2 ⇔ 有公共中间点。枚举中间点 m，其邻居两两配对；乘积和用 ",
								/* @__PURE__ */ jsx(M, { children: "(\\sum w)^2-\\sum w^2" }),
								"，最大乘积用「最大 × 次大」。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"用",
								/* @__PURE__ */ jsx("strong", { children: "最小的状态" }),
								"把「距离统计」讲透的 NOIP 真题——不需要复杂 DP 数组，只需一个恒等式 + 一遍 DFS，是距离统计入门的最佳载体。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"每个中间点 ",
								/* @__PURE__ */ jsx(M, { children: "O(\\deg)" }),
								"，总 ",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（枚举中间点）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1351,
								luogu: "P1351"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P5658",
					name: "[CSP-S2019] 括号树",
					src: "CSP-S 2019",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个节点的树，每点标 ",
								/* @__PURE__ */ jsx(M, { children: "(" }),
								" 或 ",
								/* @__PURE__ */ jsx(M, { children: ")" }),
								"。对每个点 ",
								/* @__PURE__ */ jsx(M, { children: "u" }),
								"，数根到 u 的字符串里",
								/* @__PURE__ */ jsx("strong", { children: "合法括号子串" }),
								"的个数 ",
								/* @__PURE__ */ jsx(M, { children: "k_u" }),
								"，输出所有 ",
								/* @__PURE__ */ jsx(M, { children: "k_u" }),
								"（题目要求异或和形式）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"「父到子 ",
								/* @__PURE__ */ jsx(M, { children: "O(1)" }),
								" 递推方案计数」的",
								/* @__PURE__ */ jsx("strong", { children: "漂亮范例" }),
								"，CSP 真题热度高。",
								/* @__PURE__ */ jsx(M, { children: "f[u]=f[p]+1" }),
								" 的递推 + DFS 上可回滚栈，把 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								" 降到 ",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[u]=f[p]+1" }),
								"（u 为 ",
								/* @__PURE__ */ jsx(M, { children: ")" }),
								" 且成功匹配时，",
								/* @__PURE__ */ jsx(M, { children: "p" }),
								" 是与之配对的 ",
								/* @__PURE__ */ jsx(M, { children: "(" }),
								" 的前驱），累加得答案；",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（DFS + 可回滚栈，主干示意）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P5658,
								luogu: "P5658"
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
					pid: "P2585",
					name: "[ZJOI2006] 三色二叉树（计数向）",
					hint: "把「求绿点极值」改成「数合法染色方案」：内层枚举 (a,b) 合法颜色对时，方案数相乘、对颜色求和。同树同约束，算子从 max 换成累乘累加。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1131",
					name: "[ZJOI2007] 时态同步",
					hint: "统计/合并型：f[u] = u 子树内到叶子的最长链，每条子边补齐到最长的增量累加。是「沿子树统计路径长度」的练习。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1352",
					name: "没有上司的舞会（回顾）",
					hint: "回到选点：把它当计数思维的对照——同样一遍 DFS 合并子树，只是聚合的是「最大权」而非「计数」。对比体会算子之别。"
				})
			]
		})
	] });
}
//#endregion
export { TreeCount as default };
