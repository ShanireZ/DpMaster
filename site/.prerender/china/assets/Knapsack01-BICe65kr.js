import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as DPViz } from "./DPViz-B4WSCgkp.js";
import { a as SetupFigure, i as ForwardBugFigure, o as KnapsackDemo, r as DecisionFigure, s as knapsack1D } from "./KnapsackArt-BC9uYoX-.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Gamepad2, Minus, MousePointerClick, Plus, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/knapsack/ForwardBugDemo.tsx
function Stepper({ label, value, min, max, onChange }) {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
		className: "stepper__lab",
		children: label
	}), /* @__PURE__ */ jsxs("div", {
		className: "stepper__row",
		children: [
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value - 1),
				disabled: value <= min,
				"aria-label": `${label} 减`,
				children: /* @__PURE__ */ jsx(Minus, { size: 13 })
			}),
			/* @__PURE__ */ jsx("span", {
				className: "stepper__val",
				children: value
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value + 1),
				disabled: value >= max,
				"aria-label": `${label} 加`,
				children: /* @__PURE__ */ jsx(Plus, { size: 13 })
			})
		]
	})] });
}
var finalCap = (m, cap) => {
	const x = m.frames[m.frames.length - 1].values[0][cap];
	return x == null ? 0 : x;
};
/** 单件物品的逆推(正确) vs 顺推(错误)并排对照——直观揭示"01 背包为何不能正推"。 */
function ForwardBugDemo() {
	const [w, setW] = useState(2);
	const [v, setV] = useState(3);
	const [cap, setCap] = useState(6);
	const items = useMemo(() => [{
		w,
		v
	}], [w, v]);
	const reverse = useMemo(() => knapsack1D(items, cap, "reverse"), [items, cap]);
	const forward = useMemo(() => knapsack1D(items, cap, "forward"), [items, cap]);
	const fRev = finalCap(reverse, cap);
	const fFwd = finalCap(forward, cap);
	const times = v > 0 ? Math.round(fFwd / v) : 0;
	const k = `${w}.${v}.${cap}`;
	const setCapClamped = (c) => {
		setCap(c);
		if (w > c) setW(c);
	};
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "一件物品（可改重量 / 价值）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "fbug__steppers",
				children: [/* @__PURE__ */ jsx(Stepper, {
					label: "重量 w",
					value: w,
					min: 1,
					max: cap,
					onChange: setW
				}), /* @__PURE__ */ jsx(Stepper, {
					label: "价值 v",
					value: v,
					min: 1,
					max: 30,
					onChange: setV
				})]
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "背包容量"
			}), /* @__PURE__ */ jsx(Stepper, {
				label: "m",
				value: cap,
				min: 2,
				max: 12,
				onChange: setCapClamped
			})] })]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"逆推 ",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: [
						"f[",
						cap,
						"] = ",
						fRev
					]
				}),
				"（只装 1 件） · 正推 ",
				/* @__PURE__ */ jsxs("b", {
					className: "bad",
					children: [
						"f[",
						cap,
						"] = ",
						fFwd
					]
				}),
				times > 1 ? /* @__PURE__ */ jsxs(Fragment, { children: [
					"（同一件被装了 ",
					/* @__PURE__ */ jsx("b", {
						className: "bad",
						children: times
					}),
					" 次！）"
				] }) : /* @__PURE__ */ jsx(Fragment, { children: "（容量不足以重复装）" })
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__pair",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "fbug__side-label ok",
				children: [/* @__PURE__ */ jsx(Check, { size: 15 }), " 逆推 · 正确（每件至多一次）"]
			}), /* @__PURE__ */ jsx(DPViz, { model: reverse }, `r${k}`)] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "fbug__side-label bad",
				children: [/* @__PURE__ */ jsx(X, { size: 15 }), " 正推 · 错误（同一件被重复计入）"]
			}), /* @__PURE__ */ jsx(DPViz, { model: forward }, `f${k}`)] })]
		})
	] });
}
//#endregion
//#region src/content/a/Knapsack01.tsx
var CODE_P1048 = `
#include <iostream>
#include <algorithm>
using namespace std;

int t[105], v[105];
int f[1005];                 // f[j]：用时不超过 j 的最大价值

int main()
{
    int T, M;
    cin >> T >> M;
    for (int i = 1; i <= M; i++)
        cin >> t[i] >> v[i];

    for (int i = 1; i <= M; i++)        // 逐株草药
        for (int j = T; j >= t[i]; j--) // ★逆推：从大容量往小推
            f[j] = max(f[j], f[j - t[i]] + v[i]);

    cout << f[T] << endl;
    return 0;
}`;
var CODE_P2871 = `
#include <iostream>
#include <algorithm>
using namespace std;

int w[3405], d[3405];
int f[12885];

int main()
{
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        cin >> w[i] >> d[i];

    for (int i = 1; i <= n; i++)        // N 大，二维会 MLE，必须一维
        for (int j = m; j >= w[i]; j--)
            f[j] = max(f[j], f[j - w[i]] + d[i]);

    cout << f[m] << endl;
    return 0;
}`;
var CODE_P1164 = `
#include <iostream>
using namespace std;

int a[105];
int f[10005];                // f[j]：恰好花 j 元的方案数

int main()
{
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        cin >> a[i];

    f[0] = 1;                           // 花 0 元有 1 种方案（什么都不点）
    for (int i = 1; i <= n; i++)
        for (int j = m; j >= a[i]; j--)
            f[j] += f[j - a[i]];        // 计数：max 换成累加

    cout << f[m] << endl;
    return 0;
}`;
function Knapsack01() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "从「整件取舍」说起"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"先看一个具体场景：有 3 件物品，一个容量 ",
						/* @__PURE__ */ jsx(M, { children: "m=8" }),
						" 的背包。每件物品有自己的",
						/* @__PURE__ */ jsxs("strong", { children: ["重量 ", /* @__PURE__ */ jsx(M, { children: "w" })] }),
						" 和",
						/* @__PURE__ */ jsxs("strong", { children: ["价值 ", /* @__PURE__ */ jsx(M, { children: "v" })] }),
						"， 而且要么",
						/* @__PURE__ */ jsx("strong", { children: "整件装入" }),
						"、要么",
						/* @__PURE__ */ jsx("strong", { children: "留下" }),
						"——没有「装半件」这回事（这就是「01」的含义：每件取 0 次或 1 次）。目标：在不超重的前提下，让装入的",
						/* @__PURE__ */ jsx("strong", { children: "总价值最大" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(SetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "3 件物品（重量 w、价值 v）与容量 m=8 的背包——该带走哪些？"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"第一反应也许是",
							/* @__PURE__ */ jsx("strong", { children: "贪心" }),
							"：按「性价比」",
							/* @__PURE__ */ jsx(M, { children: "v/w" }),
							" 从高到低装。这里三件的性价比是 ",
							/* @__PURE__ */ jsx(M, { children: "1.5,\\ 1.33,\\ 1.25" }),
							"， 于是先装物品 1（",
							/* @__PURE__ */ jsx(M, { children: "w=2" }),
							"），再装物品 2（",
							/* @__PURE__ */ jsx(M, { children: "w=3" }),
							"，累计 5），想装物品 3 时 ",
							/* @__PURE__ */ jsx(M, { children: "5+4=9>8" }),
							" 塞不下——贪心只拿到 ",
							/* @__PURE__ */ jsx(M, { children: "3+4=7" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"可最优其实是",
							/* @__PURE__ */ jsx("strong", { children: "物品 2 + 物品 3" }),
							"：重量 ",
							/* @__PURE__ */ jsx(M, { children: "3+4=7\\le 8" }),
							"，价值 ",
							/* @__PURE__ */ jsx(M, { children: "4+5=9" }),
							"。贪心输了 2。",
							/* @__PURE__ */ jsx("strong", { children: "「整件取舍」的最优，贪心按不住" }),
							"——因为此刻的最优选择，依赖后面还剩多少空间，是一个牵一发动全身的全局问题。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"那把 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 件物品「取 / 不取」的所有组合都枚举一遍？那是 ",
							/* @__PURE__ */ jsx(M, { children: "2^n" }),
							" 种，",
							/* @__PURE__ */ jsx(M, { children: "n=100" }),
							" 就已是天文数字。 DP 的思路，是把这 ",
							/* @__PURE__ */ jsx(M, { children: "2^n" }),
							" 的爆炸，压成一张",
							/* @__PURE__ */ jsx("strong", { children: "逐格填写的表" }),
							"。"
						] })
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：取，还是不取"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
						"设 ",
						/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
						" 表示：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"只在前 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 件物品里挑选、且总重量不超过 ",
							/* @__PURE__ */ jsx(M, { children: "j" })
						] }),
						" 时，能得到的最大价值。 把「逐件考虑」当作阶段，第 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 阶段只决断一件事——第 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 件，取还是不取？"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(DecisionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "每一格 f[i][j] 只有两条路：不取继承上一行，取则腾出 w 再补上 v，最后取较大者。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsxs("strong", { children: [
								"不取第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 件"
							] }),
							"：它没参与，前 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 件的最优就等于前 ",
							/* @__PURE__ */ jsx(M, { children: "i-1" }),
							" 件在同容量 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 下的最优，即 ",
							/* @__PURE__ */ jsx(M, { children: "f[i-1][j]" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsxs("strong", { children: [
								"取第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 件"
							] }),
							"（前提装得下 ",
							/* @__PURE__ */ jsx(M, { children: "j\\ge w_i" }),
							"）：先腾出 ",
							/* @__PURE__ */ jsx(M, { children: "w_i" }),
							" 的空间给它，剩下的 ",
							/* @__PURE__ */ jsx(M, { children: "j-w_i" }),
							" 容量留给前 ",
							/* @__PURE__ */ jsx(M, { children: "i-1" }),
							" 件去最优，再加上它自己的价值 ",
							/* @__PURE__ */ jsx(M, { children: "v_i" }),
							"，即 ",
							/* @__PURE__ */ jsx(M, { children: "f[i-1][j-w_i]+v_i" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"两条路要价值最大，取较大者，就得到",
							/* @__PURE__ */ jsx("strong", { children: "转移方程" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[i][j]=\\max\\big(\\,f[i-1][j],\\ f[i-1][j-w_i]+v_i\\,\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"边界：",
							/* @__PURE__ */ jsx(M, { children: "f[0][j]=0" }),
							"（一件都不考虑，价值为 0）。答案：",
							/* @__PURE__ */ jsx(M, { children: "f[n][m]" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"这一步把「",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 种组合」拆成了「每件物品在参与 / 不参与两种局面下的最优」，用 ",
						/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
						" 张表格格子，装下了指数级的搜索。"
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
						"用刚才的例子（物品 ",
						/* @__PURE__ */ jsx(M, { children: "(w,v)=(2,3),(3,4),(4,5)" }),
						"，容量 8）走几步，把方程「跑起来」："
					] })
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
									/* @__PURE__ */ jsx("b", { children: "初始化第 0 行。" }),
									" 一件物品都不考虑时，任何容量下价值都是 0：",
									/* @__PURE__ */ jsx(M, { children: "f[0][0..8]=0" }),
									"。这是整张表的地基。"
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
									/* @__PURE__ */ jsx("b", { children: "放入物品 1" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "w=2,v=3" }),
									"）。容量 ",
									/* @__PURE__ */ jsx(M, { children: "j<2" }),
									" 装不下 → 仍是 0；",
									/* @__PURE__ */ jsx(M, { children: "j\\ge2" }),
									" 时 ",
									/* @__PURE__ */ jsx(M, { children: "f[1][j]=\\max(0,\\ 0+3)=3" }),
									"。于是第 1 行变成 ",
									/* @__PURE__ */ jsx(M, { children: "0,0,3,3,3,3,3,3,3" }),
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
									/* @__PURE__ */ jsx("b", { children: "放入物品 2" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "w=3,v=4" }),
									"）。看容量 5：不取 = ",
									/* @__PURE__ */ jsx(M, { children: "f[1][5]=3" }),
									"；取 = ",
									/* @__PURE__ */ jsx(M, { children: "f[1][5-3]+4=f[1][2]+4=3+4=7" }),
									"。取较大 → ",
									/* @__PURE__ */ jsx(M, { children: "f[2][5]=7" }),
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
									/* @__PURE__ */ jsx("b", { children: "放入物品 3" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "w=4,v=5" }),
									"），看容量 8：取 = ",
									/* @__PURE__ */ jsx(M, { children: "f[2][8-4]+5=f[2][4]+5=4+5=9" }),
									"，大于不取的 ",
									/* @__PURE__ */ jsx(M, { children: "f[2][8]=7" }),
									"。 于是 ",
									/* @__PURE__ */ jsx(M, { children: "f[3][8]=9" }),
									"——正是最优解，和我们手算的「物品 2+3」吻合。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示会把整张表",
						/* @__PURE__ */ jsx("strong", { children: "逐格填满" }),
						"，并高亮每一格的两个来源。试着改物品或容量，看表格实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看它一格一格长出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(KnapsackDemo, { variant: "01" })
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "卷成一维：滚动数组与逆推"
			}), /* @__PURE__ */ jsxs("div", {
				className: "prose",
				children: [
					/* @__PURE__ */ jsxs("p", { children: [
						"注意转移只用到",
						/* @__PURE__ */ jsx("strong", { children: "上一行" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "f[i-1][\\cdot]" }),
						"。既然如此，何必保留所有行？用一维 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" 就地更新即可，空间从 ",
						/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
						" 压到 ",
						/* @__PURE__ */ jsx(M, { children: "O(m)" }),
						"："
					] }),
					/* @__PURE__ */ jsx(MB, { children: "f[j]=\\max\\big(f[j],\\ f[j-w_i]+v_i\\big)" }),
					/* @__PURE__ */ jsxs("p", { children: [
						"但方向",
						/* @__PURE__ */ jsx("strong", { children: "必须逆推" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 从 ",
						/* @__PURE__ */ jsx(M, { children: "m" }),
						" 到 ",
						/* @__PURE__ */ jsx(M, { children: "w_i" }),
						"）：算 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" 要用「上一件」留下的 ",
						/* @__PURE__ */ jsx(M, { children: "f[j-w_i]" }),
						"，逆推时它还没被本件动过，是",
						/* @__PURE__ */ jsx("strong", { children: "干净的旧值" }),
						"。方向反过来会怎样？这不是小瑕疵，而是会让答案",
						/* @__PURE__ */ jsx("strong", { children: "彻底跑偏" }),
						"——下一节把它摊开看。"
					] })
				]
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "为什么不能正推：一件物品被反复装入"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"把内层循环从逆推改成",
						/* @__PURE__ */ jsx("strong", { children: "正推" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 从 ",
						/* @__PURE__ */ jsx(M, { children: "w_i" }),
						" 到 ",
						/* @__PURE__ */ jsx(M, { children: "m" }),
						"），代码只差一个方向，结果却会错得离谱。病根就一句话：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"正推时，你用来更新 ",
							/* @__PURE__ */ jsx(M, { children: "f[j]" }),
							" 的 ",
							/* @__PURE__ */ jsx(M, { children: "f[j-w_i]" }),
							"，可能在本轮已经被同一件物品改过了。"
						] })
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"用最干净的例子看——只有",
						/* @__PURE__ */ jsx("strong", { children: "一件" }),
						"物品 ",
						/* @__PURE__ */ jsx(M, { children: "(w,v)=(2,3)" }),
						"，容量 6："
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(ForwardBugFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "同一件物品：逆推每格都取「装它之前」的旧值，恒为 3（只装 1 件）；正推却让 f[0]→f[2]→f[4]→f[6] 链式 +3，一路滚到 9——同一件被装了 3 次。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "steps",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "step",
						children: [/* @__PURE__ */ jsx("span", {
							className: "step__n",
							children: "✓"
						}), /* @__PURE__ */ jsxs("div", {
							className: "step__b",
							children: [
								/* @__PURE__ */ jsx("b", { children: "逆推" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "j:6\\to 4\\to 2" }),
								"）：算 ",
								/* @__PURE__ */ jsx(M, { children: "f[6]" }),
								" 用 ",
								/* @__PURE__ */ jsx(M, { children: "f[4]" }),
								" 的",
								/* @__PURE__ */ jsx("b", { children: "旧值 0" }),
								" → 3；算 ",
								/* @__PURE__ */ jsx(M, { children: "f[4]" }),
								" 用 ",
								/* @__PURE__ */ jsx(M, { children: "f[2]" }),
								" 旧值 0 → 3；算 ",
								/* @__PURE__ */ jsx(M, { children: "f[2]" }),
								" 用 ",
								/* @__PURE__ */ jsx(M, { children: "f[0]=0" }),
								" → 3。每格都落在「这件还没进过」的旧值上，只加一次 → ",
								/* @__PURE__ */ jsx("b", { children: "f[6]=3，装 1 件" }),
								"。"
							]
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "step",
						children: [/* @__PURE__ */ jsx("span", {
							className: "step__n",
							children: "✗"
						}), /* @__PURE__ */ jsxs("div", {
							className: "step__b",
							children: [
								/* @__PURE__ */ jsx("b", { children: "正推" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "j:2\\to 4\\to 6" }),
								"）：",
								/* @__PURE__ */ jsx(M, { children: "f[2]=f[0]+3=3" }),
								"；到 ",
								/* @__PURE__ */ jsx(M, { children: "f[4]" }),
								" 时 ",
								/* @__PURE__ */ jsx(M, { children: "f[2]" }),
								" ",
								/* @__PURE__ */ jsx("b", { children: "已经含这件了" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "f[4]=f[2]+3=6" }),
								"（2 件）；",
								/* @__PURE__ */ jsx(M, { children: "f[6]=f[4]+3=9" }),
								"（",
								/* @__PURE__ */ jsx("b", { children: "3 件" }),
								"）。一件 ",
								/* @__PURE__ */ jsx(M, { children: "w=2" }),
								" 的物品被当成「无限件」反复塞了进去。"
							]
						})]
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "记死：01 逆推、完全顺推",
					children: [
						"01 背包每件至多取一次，必须",
						/* @__PURE__ */ jsx("strong", { children: "逆推" }),
						"，让 ",
						/* @__PURE__ */ jsx(M, { children: "f[j-w_i]" }),
						" 保持「上一件」留下的干净旧值；而这个「正推会重复取」的 bug，到 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/complete",
							style: { color: "var(--accent-2)" },
							children: "完全背包"
						}),
						" 里恰好翻身成",
						/* @__PURE__ */ jsx("strong", { children: "想要的特性" }),
						"（每种无限件）。同一段转移，循环方向决定物种。"
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"下面把两个方向",
						/* @__PURE__ */ jsx("strong", { children: "并排跑给你看" }),
						"——改物品的 ",
						/* @__PURE__ */ jsx(M, { children: "w,v" }),
						" 或容量：左边逆推恒等于一件的价值，右边正推随容量成倍上涨。"
					] })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(ForwardBugDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(Gamepad2, { size: 18 }),
						"想更直观？到 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a",
							style: {
								color: "var(--accent-1)",
								fontWeight: 600
							},
							children: "A 部分页的「装包大师」"
						}),
						"亲手挑物品，再点「看 DP 最优」，体验一次贪心为何会输给 DP。"
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
					pid: "P1048",
					name: "采药",
					src: "NOIP2005 普及组",
					diff: "普及-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给定总时间 ",
								/* @__PURE__ */ jsx(M, { children: "T" }),
								" 与 ",
								/* @__PURE__ */ jsx(M, { children: "M" }),
								" 株草药，每株耗时 ",
								/* @__PURE__ */ jsx(M, { children: "t_i" }),
								"、价值 ",
								/* @__PURE__ */ jsx(M, { children: "v_i" }),
								"，每株至多采一次。求 ",
								/* @__PURE__ */ jsx(M, { children: "T" }),
								" 时间内最大总价值。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"「时间」= 重量 ",
								/* @__PURE__ */ jsx(M, { children: "w" }),
								"，「价值」= ",
								/* @__PURE__ */ jsx(M, { children: "v" }),
								"，「总时间 ",
								/* @__PURE__ */ jsx(M, { children: "T" }),
								"」= 容量 ",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								"。标准 01 背包。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[j]=\\max(f[j],f[j-t_i]+v_i)" }),
								"，一维逆推；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(TM)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（一维逆推）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1048,
								luogu: "P1048"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2871",
					name: "[USACO07DEC] Charm Bracelet S",
					src: "USACO 2007",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "N" }),
								" 个饰品，每个重量 ",
								/* @__PURE__ */ jsx(M, { children: "W_i" }),
								"、魅力 ",
								/* @__PURE__ */ jsx(M, { children: "D_i" }),
								"，背包承重 ",
								/* @__PURE__ */ jsx(M, { children: "M" }),
								"，求最大魅力和。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								/* @__PURE__ */ jsx(M, { children: "N\\le 3402,\\ M\\le 12880" }),
								"——二维表 ",
								/* @__PURE__ */ jsx(M, { children: "N\\times M" }),
								" 直接 MLE，逼你写一维滚动数组。是讲「为何必须一维、为何倒序」的最佳载体。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2871,
								luogu: "P2871"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1164",
					name: "小 A 点菜",
					src: "洛谷原生",
					diff: "普及-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 道菜价格已知，手上恰好 ",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								" 元，求",
								/* @__PURE__ */ jsx("strong", { children: "恰好花完" }),
								"的点菜方案数。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "关键变形",
							children: [
								"把「求最优」换成「求方案数」：转移里的 ",
								/* @__PURE__ */ jsx(M, { children: "\\max" }),
								" 换成",
								/* @__PURE__ */ jsx("strong", { children: "累加" }),
								" ",
								/* @__PURE__ */ jsx(M, { children: "+" }),
								"，初值 ",
								/* @__PURE__ */ jsx(M, { children: "f[0]=1" }),
								"（花 0 元有 1 种方案）。这是从「最优 DP」跨到「计数 DP」最平滑的一题。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1164,
								luogu: "P1164"
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
					pid: "P1049",
					name: "[NOIP2001 普及组] 装箱问题",
					hint: "布尔可行性：让 f[j] 表示容量 j 能否恰好装满，求最小剩余空间 = m − 最大可装。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1417",
					name: "烹调方案",
					hint: "01 背包 + 邻项交换排序：先按系数 b 决定处理顺序，再做背包。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1466",
					name: "[USACO2.2] 集合 Subset Sums",
					hint: "求方案数：能否把 1..n 分成两个和相等的子集，f[j] 计数。"
				})
			]
		})
	] });
}
//#endregion
export { Knapsack01 as default };
