import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as DPViz } from "./DPViz-B4WSCgkp.js";
import { n as CompleteSetupFigure, o as KnapsackDemo, s as knapsack1D, t as CompleteOptFigure } from "./KnapsackArt-BC9uYoX-.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, Minus, MousePointerClick, Plus } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/knapsack/CompleteContrastDemo.tsx
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
/** 同一组物品：01(逆推，每种至多 1 件) vs 完全(正推，每种可多件)并排，直观看出完全 ≥ 01。 */
function CompleteContrastDemo() {
	const [items, setItems] = useState([{
		w: 2,
		v: 3
	}, {
		w: 3,
		v: 5
	}]);
	const [cap, setCap] = useState(9);
	const setItem = (i, patch) => setItems((a) => a.map((it, k) => k === i ? {
		...it,
		...patch
	} : it));
	const only01 = useMemo(() => knapsack1D(items, cap, "reverse"), [items, cap]);
	const full = useMemo(() => knapsack1D(items, cap, "complete"), [items, cap]);
	const v01 = finalCap(only01, cap);
	const vFull = finalCap(full, cap);
	const k = `${cap}-${items.map((it) => `${it.w}.${it.v}`).join("_")}`;
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "物品（可改重量 / 价值）"
			}), /* @__PURE__ */ jsx("div", {
				className: "fbug__steppers",
				children: items.map((it, i) => /* @__PURE__ */ jsxs("div", {
					className: "kd__item",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "kd__item-i",
							children: i + 1
						}),
						/* @__PURE__ */ jsx(Stepper, {
							label: "重量 w",
							value: it.w,
							min: 1,
							max: cap,
							onChange: (w) => setItem(i, { w })
						}),
						/* @__PURE__ */ jsx(Stepper, {
							label: "价值 v",
							value: it.v,
							min: 1,
							max: 30,
							onChange: (v) => setItem(i, { v })
						})
					]
				}, i))
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "背包容量"
			}), /* @__PURE__ */ jsx(Stepper, {
				label: "m",
				value: cap,
				min: 3,
				max: 12,
				onChange: (c) => {
					setCap(c);
					setItems((a) => a.map((it) => it.w > c ? {
						...it,
						w: c
					} : it));
				}
			})] })]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"01 最优 ",
				/* @__PURE__ */ jsxs("b", {
					className: "you",
					children: [
						"f[",
						cap,
						"] = ",
						v01
					]
				}),
				"（每种至多 1 件） · 完全最优 ",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: [
						"f[",
						cap,
						"] = ",
						vFull
					]
				}),
				vFull > v01 ? /* @__PURE__ */ jsxs(Fragment, { children: [
					"（多拿 ",
					/* @__PURE__ */ jsx("b", {
						className: "ok",
						children: vFull - v01
					}),
					"——靠反复取用同一种）"
				] }) : /* @__PURE__ */ jsx(Fragment, { children: "（本例容量下两者相同）" })
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__pair",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "fbug__side-label you",
				children: "01 背包 · 逆推（每种一件）"
			}), /* @__PURE__ */ jsx(DPViz, { model: only01 }, `o${k}`)] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "fbug__side-label ok",
				children: "完全背包 · 正推（每种无限件）"
			}), /* @__PURE__ */ jsx(DPViz, { model: full }, `c${k}`)] })]
		})
	] });
}
//#endregion
//#region src/content/a/KnapsackComplete.tsx
var CODE_P1616 = `
#include <iostream>
#include <algorithm>
using namespace std;

int t[10005], v[10005];
int f[10005];

int main()
{
    int T, M;
    cin >> T >> M;
    for (int i = 1; i <= M; i++)
        cin >> t[i] >> v[i];

    for (int i = 1; i <= M; i++)
        for (int j = t[i]; j <= T; j++)     // ★正推：允许同一物品被重复取
            f[j] = max(f[j], f[j - t[i]] + v[i]);

    cout << f[T] << endl;
    return 0;
}`;
var CODE_P5662 = `
#include <iostream>
#include <algorithm>
using namespace std;

int p[105][105];             // p[d][j]：第 d 天第 j 种纪念品价格
int f[100005];

int main()
{
    int T, n, m;
    cin >> T >> n >> m;
    for (int d = 1; d <= T; d++)
        for (int j = 1; j <= n; j++)
            cin >> p[d][j];

    for (int d = 1; d < T; d++)             // 枚举每一天，用当天买、次日卖
    {
        for (int j = 0; j <= m; j++) f[j] = 0;      // 每天现金独立，重置
        for (int j = 1; j <= n; j++)                // 每种纪念品可买多份 → 完全背包
            for (int c = p[d][j]; c <= m; c++)      // ★正推
                f[c] = max(f[c], f[c - p[d][j]] + p[d + 1][j] - p[d][j]);
        m += f[m];                           // 当天最优收益并入本金
    }

    cout << m << endl;
    return 0;
}`;
var CODE_P5020 = `
#include <iostream>
#include <algorithm>
using namespace std;

int a[105];
bool f[25005];               // f[j]：用已保留的面值能否凑出金额 j

int main()
{
    int T;
    cin >> T;
    while (T--)
    {
        int n;
        cin >> n;
        for (int i = 1; i <= n; i++)
            cin >> a[i];
        sort(a + 1, a + n + 1);              // 从小到大处理

        int m = a[n];                        // 最大面值即可达范围上界
        for (int j = 0; j <= m; j++) f[j] = false;
        f[0] = true;

        int cnt = 0;
        for (int i = 1; i <= n; i++)
            if (!f[a[i]])                    // 这个面值凑不出来 → 必须保留
            {
                cnt++;
                for (int j = a[i]; j <= m; j++)     // 完全背包正推标记可达
                    f[j] = f[j] || f[j - a[i]];
            }

        cout << cnt << endl;
    }
    return 0;
}`;
function KnapsackComplete() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "同一种物品，取之不尽"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"完全背包与 01 背包只差一个字：01 里每件",
						/* @__PURE__ */ jsx("strong", { children: "要么取要么留" }),
						"，完全里每种物品有",
						/* @__PURE__ */ jsx("strong", { children: "无限件" }),
						"，同一种想拿几件就拿几件。 目标不变——在不超过容量的前提下，让装入的",
						/* @__PURE__ */ jsx("strong", { children: "总价值最大" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(CompleteSetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "每种物品都带 ×∞：容量 m=9 时，物品 1（w=2,v=3）可拿到 4 件价值 12，物品 2（w=3,v=5）可拿 3 件价值 15——同一种可反复取用。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"状态定义也不用改：",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" 仍表示容量不超过 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 时的最大价值。变的只有一件事—— 「考虑第 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 种物品」这个动作，现在可以对同一种",
						/* @__PURE__ */ jsx("strong", { children: "反复施加" }),
						"，而不是只做一次决断。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "与 01 只差一个方向：正推即「允许重复」"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"转移方程写出来，和 01 背包的一维式子",
							/* @__PURE__ */ jsx("strong", { children: "一模一样" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[j]=\\max\\big(f[j],\\ f[j-w_i]+v_i\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"差别",
							/* @__PURE__ */ jsx("strong", { children: "只在循环方向" }),
							"：01 背包逆推（",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 从 ",
							/* @__PURE__ */ jsx(M, { children: "m" }),
							" 到 ",
							/* @__PURE__ */ jsx(M, { children: "w_i" }),
							"，保证每件至多取一次）， 完全背包",
							/* @__PURE__ */ jsx("strong", { children: "正推" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 从 ",
							/* @__PURE__ */ jsx(M, { children: "w_i" }),
							" 到 ",
							/* @__PURE__ */ jsx(M, { children: "m" }),
							"）。就这一处方向之差，决定了「每种一件」还是「每种无限件」。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质 · 为什么正推就对了",
					children: [
						"正推时算 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" 用到的 ",
						/* @__PURE__ */ jsx(M, { children: "f[j-w_i]" }),
						"，可能",
						/* @__PURE__ */ jsxs("strong", { children: [
							"已经包含了第 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 种"
						] }),
						"——于是这一种被自然地再取一次。 这正是 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/01",
							style: { color: "var(--accent-2)" },
							children: "01 背包「不能正推」那一节"
						}),
						"里的同一个机制：在 01 里它是要极力避开的 bug，在完全背包里它",
						/* @__PURE__ */ jsx("strong", { children: "恰恰是我们想要的特性" }),
						"。同一段转移，方向决定物种。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "为什么还是 O(nm)：从枚举件数到一次转移"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"「无限件」听起来更复杂，最朴素的想法是",
							/* @__PURE__ */ jsxs("strong", { children: [
								"枚举第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 种取几件"
							] }),
							"：取 ",
							/* @__PURE__ */ jsx(M, { children: "0,1,2,\\dots" }),
							" 件各算一遍再取最大——"
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[i][j]=\\max_{k\\ge 0}\\ \\big(f[i-1][j-k\\,w_i]+k\\,v_i\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"这比 01 多了一层「枚举件数」，复杂度升到 ",
							/* @__PURE__ */ jsx(M, { children: "O\\!\\big(nm\\cdot m/w\\big)" }),
							"。但盯住 ",
							/* @__PURE__ */ jsx(M, { children: "f[i][j-w_i]" }),
							" 看：它本身已经是「前 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 种、容量 ",
							/* @__PURE__ */ jsx(M, { children: "j-w_i" }),
							"」把所有件数都枚举过的最优——",
							/* @__PURE__ */ jsxs("strong", { children: [
								"已经包含了「再多取一件第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 种」的全部可能"
							] }),
							"。于是那一整层枚举可以折叠成",
							/* @__PURE__ */ jsx("strong", { children: "一步" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[i][j]=\\max\\big(f[i-1][j],\\ f[i][j-w_i]+v_i\\big)" })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(CompleteOptFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"唯一的差别在「取」这条转移的来源：01 背包指向",
							/* @__PURE__ */ jsx("strong", { children: "上一行" }),
							" f[i−1][j−w]（这一种只能用一次）；完全背包指向",
							/* @__PURE__ */ jsx("strong", { children: "本行" }),
							" f[i][j−w]（这一种刚刚可能已经取过，于是能再取）。正是「同一行回看」把复杂度压回 O(nm)。"
						]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"降到一维后，",
						/* @__PURE__ */ jsx(M, { children: "f[i][\\cdot]" }),
						" 与 ",
						/* @__PURE__ */ jsx(M, { children: "f[i-1][\\cdot]" }),
						" 共用同一个数组，「本行的 ",
						/* @__PURE__ */ jsx(M, { children: "f[j-w_i]" }),
						"」正是",
						/* @__PURE__ */ jsx("strong", { children: "正推" }),
						"时那个已被本种更新过的值——上一节循环方向的由来，到这里就完全说通了。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "跟着算一遍：看它把一件反复拿"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"拿一件物品 ",
						/* @__PURE__ */ jsx(M, { children: "(w,v)=(2,3)" }),
						"、容量 6，把正推 ",
						/* @__PURE__ */ jsx(M, { children: "j:2\\to 4\\to 6" }),
						" 走一遍："
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
									/* @__PURE__ */ jsx("b", { children: "初始化。" }),
									" 空背包，任何容量下价值都是 0：",
									/* @__PURE__ */ jsx(M, { children: "f[0..6]=0" }),
									"。"
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
									/* @__PURE__ */ jsxs("b", { children: [
										"正推到 ",
										/* @__PURE__ */ jsx(M, { children: "j=2" }),
										"。"
									] }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "f[2]=\\max(f[2],f[0]+3)=3" }),
									"——放进第 ",
									/* @__PURE__ */ jsx("b", { children: "1" }),
									" 件。"
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
									/* @__PURE__ */ jsxs("b", { children: [
										"正推到 ",
										/* @__PURE__ */ jsx(M, { children: "j=4" }),
										"。"
									] }),
									" 此刻 ",
									/* @__PURE__ */ jsx(M, { children: "f[2]=3" }),
									" ",
									/* @__PURE__ */ jsx("b", { children: "已经含这件了" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "f[4]=f[2]+3=6" }),
									"——同一种又拿了 1 件，共 ",
									/* @__PURE__ */ jsx("b", { children: "2" }),
									" 件。"
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
									/* @__PURE__ */ jsxs("b", { children: [
										"正推到 ",
										/* @__PURE__ */ jsx(M, { children: "j=6" }),
										"。"
									] }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "f[6]=f[4]+3=9" }),
									"——第 ",
									/* @__PURE__ */ jsx("b", { children: "3" }),
									" 件。容量 6、每件重 2，最多 3 件，总价值 ",
									/* @__PURE__ */ jsx("b", { children: "9" }),
									"。这就是完全背包要的答案。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示会把 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" 沿正方向",
						/* @__PURE__ */ jsx("strong", { children: "逐格累积" }),
						"填满，高亮同一件物品被反复计入的来源。改物品或容量，看表实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "看它累积起来"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"改物品与容量，观察 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" 如何沿正方向累积——同一件物品在一条链上被反复加进来。这与 01 背包的",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/01",
							style: { color: "var(--accent-2)" },
							children: " 「顺推 bug」"
						}),
						"是同一个机制，只是这里它是",
						/* @__PURE__ */ jsx("strong", { children: "特性" }),
						"而非缺陷。"
					] })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(KnapsackDemo, { variant: "complete" })
					})
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "01 还是完全？并排看差别"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"同一组物品、同一容量，左边按 01（每种至多 1 件）、右边按完全（每种无限件）各算一遍——改改 ",
						/* @__PURE__ */ jsx(M, { children: "w,v" }),
						" 和容量， 看完全背包如何靠",
						/* @__PURE__ */ jsx("strong", { children: "反复取用同一种" }),
						"，拿到不低于 01 的价值。"
					] })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(CompleteContrastDemo, {})
					})
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
					pid: "P1616",
					name: "疯狂的采药",
					src: "洛谷原生",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"与 P1048 采药同型，但每株草药可采",
								/* @__PURE__ */ jsx("strong", { children: "无限次" }),
								"。求 ",
								/* @__PURE__ */ jsx(M, { children: "T" }),
								" 时间内最大价值。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"和 01 背包的 P1048 构成「逆推 ↔ 正推」黄金对照——代码",
								/* @__PURE__ */ jsx("strong", { children: "只差内层循环方向" }),
								"，一眼看清两类背包的分界。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（一维正推）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1616,
								luogu: "P1616"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P5662",
					name: "[CSP-J2019] 纪念品",
					src: "CSP-J 2019",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "T" }),
								" 天、",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 种纪念品，每天可无限量买卖。用初始金币 ",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								"，问 ",
								/* @__PURE__ */ jsx(M, { children: "T" }),
								" 天后最多有多少金币。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"较新的 CSP-J 真题：把「当天买、次日卖」的收益当价值，",
								/* @__PURE__ */ jsx("strong", { children: "每天做一次完全背包" }),
								"，收益并入本金滚动。是「完全背包 + 贪心持币」的贴近真题的代表。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P5662,
								luogu: "P5662"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P5020",
					name: "[NOIP2018 提高组] 货币系统",
					src: "NOIP2018 提高",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给定 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 种面值的货币系统，求一个",
								/* @__PURE__ */ jsx("strong", { children: "面值种数最少" }),
								"的等价系统（能表示的金额集合完全相同）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角看完全背包",
							children: [
								"把完全背包当「",
								/* @__PURE__ */ jsx("strong", { children: "可表示性判定" }),
								"」工具：面值从小到大处理，若当前面值",
								/* @__PURE__ */ jsx("strong", { children: "已能被更小的保留面值凑出" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "f[a_i]" }),
								" 为真），它就是多余的；否则必须保留，并作为一件完全背包物品去标记新的可达金额。答案即保留的面值数。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"可达性递推 ",
								/* @__PURE__ */ jsx(M, { children: "f[j]\\ |=\\ f[j-a_i]" }),
								"（正推）；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n\\cdot a_{\\max})" }),
								"。是「完全背包 ≠ 只会求最值」的最佳一课。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P5020,
								luogu: "P5020"
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
					pid: "P2918",
					name: "[USACO08NOV] Buying Hay S",
					hint: "完全背包求最小花费；注意可以「超采」，容量要开到 m + 最大单件重量，再在 ≥ m 的区间取最小。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2725",
					name: "[USACO3.1] 邮票 Stamps",
					hint: "可达性完全背包：f[j] 表示凑出面值 j 最少用几张邮票，求从 1 起最长连续可凑区间。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1832",
					name: "A+B Problem（再升级）",
					hint: "完全背包求方案数：把 n 分解为若干质数之和，先筛质数当物品，f[j] 累加（注意开 long long）。"
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pointer-cue",
			children: [
				/* @__PURE__ */ jsx(Gamepad2, { size: 18 }),
				"回到 ",
				/* @__PURE__ */ jsx(Link, {
					to: "/part/a",
					style: {
						color: "var(--accent-1)",
						fontWeight: 600
					},
					children: "A 部分页的「装包大师」"
				}),
				"时，不妨设想若同一件宝物可以无限件地装——完全背包正是把「每件只拿一次」的枷锁彻底松开的那一步。"
			]
		})
	] });
}
//#endregion
export { KnapsackComplete as default };
