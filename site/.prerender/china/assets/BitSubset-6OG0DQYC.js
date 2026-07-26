import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as PlaybackControls, t as useStepPlayer } from "./useStepPlayer-CZuIDieE.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
/* empty css                      */
import { a as CountVariantFigure, l as SubsetEnumFigure, t as BitLattice } from "./BitArt-C1NRBGYU.js";
import { useMemo, useState } from "react";
import { MousePointerClick } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/bitmask-subset/internal.ts
function executeBitmaskSubsets(source, emit) {
	if (!Number.isInteger(source) || source < 0 || source > 1073741823) throw new RangeError("subset source must be a non-negative 30-bit integer");
	const subsets = [];
	for (let subset = source; subset > 0; subset = subset - 1 & source) {
		emit({
			type: "visited",
			subset,
			step: subsets.length + 1,
			previous: subsets.length === 0 ? source : subsets[subsets.length - 1],
			first: subsets.length === 0
		});
		subsets.push(subset);
	}
	return {
		source,
		subsets
	};
}
function recordBitmaskSubsets(source) {
	const events = [];
	return {
		result: executeBitmaskSubsets(source, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/algorithms/bitmask-subset/index.ts
function bitmaskBits(value, width) {
	return Array.from({ length: width }, (_, index) => value >> index & 1);
}
function bitmaskPopcount(value) {
	let count = 0;
	while (value !== 0) {
		value &= value - 1;
		count++;
	}
	return count;
}
//#endregion
//#region src/components/demos/bitmask/subsetSolver.ts
function enumerateSubsets(source) {
	return recordBitmaskSubsets(source).events.map((event) => ({
		T: event.subset,
		step: event.step,
		prevT: event.previous,
		isFirst: event.first
	}));
}
function toBits(value, width) {
	return bitmaskBits(value, width);
}
function popcount(value) {
	return bitmaskPopcount(value);
}
//#endregion
//#region src/components/demos/bitmask/SubsetEnumDemo.tsx
var N = 4;
function SubsetEnumDemo() {
	const [S, setS] = useState(11);
	const steps = useMemo(() => enumerateSubsets(S), [S]);
	const p = useStepPlayer(steps.length);
	const cur = steps.length ? steps[Math.min(p.index, steps.length - 1)] : null;
	const toggle = (i) => {
		setS((s) => s ^ 1 << i);
		p.reset();
	};
	const Sbits = toBits(S, N);
	const Tbits = cur ? toBits(cur.T, N) : Array(N).fill(0);
	const cell = 46;
	const totalW = 214;
	const colX = (i) => (N - 1 - i) * 56;
	const setStr = (mask) => {
		const els = [];
		for (let i = 0; i < N; i++) if (mask >> i & 1) els.push(i);
		return els.length ? `{${els.join(",")}}` : "∅";
	};
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
		className: "bm__toolbar bm__toolbar--subset",
		children: /* @__PURE__ */ jsxs("div", { children: [
			/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "母集 S（点方块把元素放入 / 移出）"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "bm__toggle-row",
				children: Array.from({ length: N }, (_, i) => {
					const on = (S >> i & 1) === 1;
					return /* @__PURE__ */ jsxs("button", {
						className: `bm__toggle${on ? " on" : ""}`,
						onClick: () => toggle(i),
						"aria-pressed": on,
						"aria-label": `元素 ${i}`,
						children: [/* @__PURE__ */ jsxs("span", {
							className: "bm__toggle-el",
							children: ["元素 ", i]
						}), /* @__PURE__ */ jsx("span", {
							className: "bm__toggle-bit",
							children: on ? 1 : 0
						})]
					}, i);
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bm__subset-meta",
				children: [
					"S = ",
					/* @__PURE__ */ jsx("b", {
						className: "mono",
						children: Sbits.slice().reverse().join("")
					}),
					" = ",
					setStr(S),
					"，共有 ",
					/* @__PURE__ */ jsx("b", { children: popcount(S) === 0 ? 0 : (1 << popcount(S)) - 1 }),
					" 个非空子集。"
				]
			})
		] })
	}), steps.length === 0 ? /* @__PURE__ */ jsx("div", {
		className: "bm__note bm__note--warn",
		children: "母集为空 ∅，没有非空子集可枚举。给 S 至少放入一个元素。"
	}) : /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("div", {
			className: "bm__subset-stage",
			children: /* @__PURE__ */ jsx("svg", {
				viewBox: `0 0 ${totalW} 118`,
				width: totalW,
				height: 118,
				role: "img",
				"aria-label": "当前枚举到的子集",
				children: Array.from({ length: N }, (_, i) => {
					const inS = Sbits[i] === 1;
					const inT = Tbits[i] === 1;
					return /* @__PURE__ */ jsxs("g", {
						transform: `translate(${colX(i)},18)`,
						children: [
							/* @__PURE__ */ jsx("rect", {
								width: cell,
								height: cell,
								rx: "9",
								fill: inT ? "color-mix(in srgb, var(--accent-1) 30%, var(--surface-3))" : "var(--surface-3)",
								stroke: inT ? "var(--viz-current)" : inS ? "var(--accent-2)" : "var(--border-strong)",
								strokeWidth: inT ? 2.6 : 1.6,
								opacity: inS ? 1 : .4,
								strokeDasharray: !inS ? "4 3" : void 0
							}),
							/* @__PURE__ */ jsx("text", {
								x: cell / 2,
								y: 30,
								textAnchor: "middle",
								fontSize: "19",
								fontWeight: "700",
								className: "mono",
								fill: inT ? "var(--accent-1)" : "var(--text-3)",
								children: inT ? 1 : 0
							}),
							/* @__PURE__ */ jsxs("text", {
								x: cell / 2,
								y: 62,
								textAnchor: "middle",
								fontSize: "10",
								className: "mono",
								fill: "var(--text-3)",
								children: ["2^", i]
							})
						]
					}, i);
				})
			})
		}),
		cur && /* @__PURE__ */ jsxs("div", {
			className: "bm__caption",
			children: [
				"第 ",
				/* @__PURE__ */ jsx("b", { children: cur.step }),
				" 个子集：T = ",
				/* @__PURE__ */ jsx("b", {
					className: "mono",
					children: Tbits.slice().reverse().join("")
				}),
				" = ",
				setStr(cur.T),
				"。",
				" ",
				cur.isFirst ? /* @__PURE__ */ jsx(Fragment, { children: "枚举从 T = S 开始。" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
					"由上一个 ",
					/* @__PURE__ */ jsx("span", {
						className: "mono",
						children: toBits(cur.prevT, N).slice().reverse().join("")
					}),
					" 做 ",
					/* @__PURE__ */ jsx("code", { children: "(T−1)&S" }),
					" 得到——只在 S 的 1 位里跳，自动跳过所有含 S 之外元素的值。"
				] })
			]
		}),
		/* @__PURE__ */ jsx(PlaybackControls, {
			player: p,
			variant: "compact",
			label: "子集枚举逐帧播放"
		})
	] })] });
}
//#endregion
//#region src/content/g/BitSubset.tsx
var CODE_SUBSET = `
// 枚举集合 S 的所有非空子集 T：经典写法，复杂度对单个 S 是 O(2^popcount(S))
for (int T = S; T; T = (T - 1) & S)
{
    // 这里 T 恰好取遍 S 的每个非空子集
    int rest = S ^ T;           // rest 是 T 在 S 内的补集（另一半）
    // ... 用 (T, rest) 做转移，例如把 S 劈成两块
}

// 对全部 S 求和：Σ 2^popcount(S) = 3^n —— 所以「枚举子集」整体是 O(3^n)`;
var CODE_P4163 = `
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

int T;
long long f[1 << 10][1010];      // f[mask][r]：用了数字集合 mask、当前数 mod d = r 的方案数

int main()
{
    cin >> T;
    while (T--)
    {
        char s[15];
        int d;
        cin >> s >> d;
        int n = strlen(s);
        int digit[15];
        for (int i = 0; i < n; i++) digit[i] = s[i] - '0';

        memset(f, 0, sizeof f);
        f[0][0] = 1;                        // 空排列，余数 0

        for (int mask = 0; mask < (1 << n); mask++)
            for (int r = 0; r < d; r++)
            {
                if (f[mask][r] == 0) continue;
                for (int i = 0; i < n; i++)
                {
                    if (mask >> i & 1) continue;        // 第 i 位已用
                    // ★去重：同一层里相同数字只在「首次出现的那位」用一次
                    if (i > 0 && digit[i] == digit[i - 1] && !(mask >> (i - 1) & 1))
                        continue;
                    int nr = (r * 10 + digit[i]) % d;   // 追加一位后的新余数
                    f[mask | (1 << i)][nr] += f[mask][r];
                }
            }

        cout << f[(1 << n) - 1][0] << endl; // 用完所有位、且整除 d
    }
    return 0;
}`;
function BitSubset() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "当转移要「把集合劈成两半」"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"前三类里，转移都是往集合里",
						/* @__PURE__ */ jsx("strong", { children: "加一个元素或一批元素" }),
						"。但有一类问题，转移需要把当前集合 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" ",
						/* @__PURE__ */ jsx("strong", { children: "拆成两部分" }),
						"：一部分交给这一步处理、另一部分留给子问题。比如「把 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个任务分给若干天、每天做一个子集」，就要枚举「今天做哪个子集」，剩下的递归。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"朴素地想：对每个 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 枚举它的所有子集，再对子集枚举它的子集……听上去是 ",
						/* @__PURE__ */ jsx(M, { children: "4^n" }),
						" 甚至更糟。但有一个漂亮的事实：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"「枚举所有集合的所有子集」总共只有 ",
							/* @__PURE__ */ jsx(M, { children: "3^n" }),
							" 对"
						] }),
						"。因为每个元素对一个 ",
						/* @__PURE__ */ jsx(M, { children: "(S,T)" }),
						" 对只有三种归属——在 ",
						/* @__PURE__ */ jsx(M, { children: "T" }),
						" 里、在 ",
						/* @__PURE__ */ jsx(M, { children: "S\\setminus T" }),
						" 里、或不在 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 里，共 ",
						/* @__PURE__ */ jsx(M, { children: "3^n" }),
						"。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(SubsetEnumFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "母集 S=1011 的全部非空子集，由 T=(T−1)&S 依次生成——只在 S 的 1 位上取值，自动跳过 S 之外的元素。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"怎么",
							/* @__PURE__ */ jsx("strong", { children: "不重不漏" }),
							"地枚举 ",
							/* @__PURE__ */ jsx(M, { children: "S" }),
							" 的所有非空子集？这就是本类的招牌代码——一行 ",
							/* @__PURE__ */ jsx("code", { children: "for" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\texttt{for(int T=S; T; T=(T-1)\\&S)}" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"它从 ",
							/* @__PURE__ */ jsx(M, { children: "T=S" }),
							" 开始，每次令 ",
							/* @__PURE__ */ jsx(M, { children: "T\\leftarrow(T-1)\\ \\&\\ S" }),
							"。",
							/* @__PURE__ */ jsx(M, { children: "T-1" }),
							" 把最低的 ",
							/* @__PURE__ */ jsx(M, { children: "1" }),
							" 位借位变 ",
							/* @__PURE__ */ jsx(M, { children: "0" }),
							"、其下方全变 ",
							/* @__PURE__ */ jsx(M, { children: "1" }),
							"，再 ",
							/* @__PURE__ */ jsx(M, { children: "\\&\\,S" }),
							" 只保留 ",
							/* @__PURE__ */ jsx(M, { children: "S" }),
							" 里有的位——于是 ",
							/* @__PURE__ */ jsx(M, { children: "T" }),
							" 严格递减、且始终是 ",
							/* @__PURE__ */ jsx(M, { children: "S" }),
							" 的子集，直到 ",
							/* @__PURE__ */ jsx(M, { children: "0" }),
							" 停止。恰好把 ",
							/* @__PURE__ */ jsx(M, { children: "S" }),
							" 的每个非空子集访问一次。"
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
					children: "读懂 (T−1)&S：为什么不重不漏"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"盯住 ",
						/* @__PURE__ */ jsx(M, { children: "S=1011" }),
						" 看一轮。子集要在 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 的三个 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						" 位（第 0、1、3 位）里取值，第 2 位恒为 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						"："
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BitLattice, {
						bits: [
							1,
							1,
							0,
							1
						],
						highlight: [
							0,
							1,
							3
						],
						showBinary: false
					}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "母集 S=1011：可自由取值的是第 0、1、3 位（描边）；第 2 位不在 S 里，任何子集该位都是 0。"
					})]
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
									/* @__PURE__ */ jsx("b", { children: "从 T=S 起步。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "T=1011" }),
									" 是最大的子集（即 ",
									/* @__PURE__ */ jsx(M, { children: "S" }),
									" 自己）。"
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
									/* @__PURE__ */ jsx("b", { children: "一步 (T−1)&S。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "1011-1=1010" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "1010\\ \\&\\ 1011=1010" }),
									"。跳过了 ",
									/* @__PURE__ */ jsx(M, { children: "1010" }),
									" 与 ",
									/* @__PURE__ */ jsx(M, { children: "1011" }),
									" 之间那些「含第 2 位」的值，直接落到下一个合法子集。"
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
									/* @__PURE__ */ jsx("b", { children: "继续。" }),
									" 依次得到 ",
									/* @__PURE__ */ jsx(M, { children: "1001,1000,0011,0010,0001" }),
									"，到 ",
									/* @__PURE__ */ jsx(M, { children: "0" }),
									" 停。",
									/* @__PURE__ */ jsx(M, { children: "S" }),
									" 有 3 个 ",
									/* @__PURE__ */ jsx(M, { children: "1" }),
									"，非空子集恰 ",
									/* @__PURE__ */ jsx(M, { children: "2^3-1=7" }),
									" 个，全部命中，无一重复。"
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
						/* @__PURE__ */ jsxs("strong", { children: ["自己拼母集 ", /* @__PURE__ */ jsx(M, { children: "S" })] }),
						"，再单步跑 ",
						/* @__PURE__ */ jsx("code", { children: "T=(T−1)&S" }),
						"——看它每一步落在哪个子集、如何绕开 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 之外的位。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "亲手跑一遍子集枚举"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(SubsetEnumDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "另一副面孔：位掩码 + 附加维做计数"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"状压的第二类「综合技巧」，是给位掩码",
						/* @__PURE__ */ jsx("strong", { children: "再挂一维附加状态" }),
						"，把「求最优」变成「求方案数」。最典型的是",
						/* @__PURE__ */ jsx("strong", { children: "排列计数" }),
						"：逐位决定「这一位放哪个数字」，用 mask 记「哪些数字已用」，同时挂一维记录某种",
						/* @__PURE__ */ jsx("strong", { children: "附加量" }),
						"——比如「当前拼出的数 ",
						/* @__PURE__ */ jsx(M, { children: "\\bmod d" }),
						" 的余数」。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(CountVariantFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "状态 dp[mask][r]：主维 mask 记已用数字集合，附加维 r 记当前数模 d 的余数——位掩码承载「用了谁」，附加维承载「算到哪」。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"以「排列」（P4163）为例：给一串数字，求它的",
							/* @__PURE__ */ jsxs("strong", { children: [
								"全排列中能被 ",
								/* @__PURE__ */ jsx(M, { children: "d" }),
								" 整除"
							] }),
							"的有多少个（数字可能重复）。状态 ",
							/* @__PURE__ */ jsx(M, { children: "dp[mask][r]" }),
							" = 已用数字集合为 ",
							/* @__PURE__ */ jsx(M, { children: "mask" }),
							"、当前拼出的数 ",
							/* @__PURE__ */ jsx(M, { children: "\\bmod d=r" }),
							" 的方案数。转移是在末尾追加一个未用的数字 ",
							/* @__PURE__ */ jsx(M, { children: "digit_i" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[\\,mask\\,|\\,(1{<}{<}i)\\,]\\big[(r\\cdot 10+digit_i)\\bmod d\\big]\\mathrel{+}=dp[mask][r]" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"答案是 ",
							/* @__PURE__ */ jsx(M, { children: "dp[(1{<}{<}n)-1][0]" }),
							"——所有位都用上、且余数为 ",
							/* @__PURE__ */ jsx(M, { children: "0" }),
							"（整除）。这里的转移是「加一位」而非「枚举子集」，但同样属于状压综合技巧：",
							/* @__PURE__ */ jsx("strong", { children: "mask 之外挂一维，把最优 DP 改写成计数 DP" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"「枚举子集」",
						/* @__PURE__ */ jsx(M, { children: "\\big(O(3^n)\\big)" }),
						" 与「位掩码 + 附加维计数」是状压的两把",
						/* @__PURE__ */ jsx("strong", { children: "通用扳手" }),
						"：前者应对「把集合劈成两块」的划分型转移；后者把 ",
						/* @__PURE__ */ jsx(M, { children: "dp[mask]" }),
						" 升成 ",
						/* @__PURE__ */ jsx(M, { children: "dp[mask][k]" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						" 为附加量，如余数），让状压能数方案、能带取模、能挂任意可累加的辅助信息。它们不是新模型，而是嫁接在前几类骨架上的技巧。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "回看「宝藏」：层内枚举子集扩展"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"上一类里「宝藏」（P3959）是从「集合覆盖」的角度看的；换到「枚举子集」的视角，它其实正是本类技巧的实战——转移时对",
						/* @__PURE__ */ jsxs("strong", { children: [
							"已连通集合 ",
							/* @__PURE__ */ jsx(M, { children: "S" }),
							" 的补集"
						] }),
						"枚举一个子集 ",
						/* @__PURE__ */ jsx(M, { children: "sub" }),
						"，作为「这一层新接入的点」。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"代码里那句 ",
						/* @__PURE__ */ jsx("code", { children: "for(int sub=rest; sub; sub=(sub-1)&rest)" }),
						" 就是子集枚举——",
						/* @__PURE__ */ jsx(M, { children: "rest" }),
						" 是 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 的补集，枚举它的每个非空子集当作新增的一层。这也解释了为什么状压 DP 常被说成「",
						/* @__PURE__ */ jsx(M, { children: "O(3^n)" }),
						" 级别」：一旦转移需要",
						/* @__PURE__ */ jsx("strong", { children: "枚举子集" }),
						"，复杂度就从 ",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 抬到 ",
						/* @__PURE__ */ jsx(M, { children: "3^n" }),
						"。"
					] })]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱：计数去重、子集别把空集也算进去",
					children: [
						/* @__PURE__ */ jsx("strong", { children: "排列计数" }),
						"里数字可能",
						/* @__PURE__ */ jsx("strong", { children: "重复" }),
						"，若不去重会把「相同数字换位」的等价排列重复计数。稳妥做法：同一层里，相同数字只允许在",
						/* @__PURE__ */ jsx("strong", { children: "首次出现的那一位" }),
						"被选（见代码里 ",
						/* @__PURE__ */ jsx(M, { children: "digit_i=digit_{i-1}" }),
						" 且前一位未用则跳过）。另外 ",
						/* @__PURE__ */ jsx("code", { children: "for(T=S;T;...)" }),
						" 只枚举",
						/* @__PURE__ */ jsx("strong", { children: "非空" }),
						"子集——若你的转移需要「空子集」（这一层不接任何点），要",
						/* @__PURE__ */ jsx("strong", { children: "另行单独处理" }),
						"，别指望这行循环覆盖它。"
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
					pid: "P4163",
					name: "[SCOI2007] 排列",
					src: "SCOI2007",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给一个数字串和整数 ",
								/* @__PURE__ */ jsx(M, { children: "d" }),
								"，求这些数字的全排列中",
								/* @__PURE__ */ jsxs("strong", { children: [
									"能被 ",
									/* @__PURE__ */ jsx(M, { children: "d" }),
									" 整除"
								] }),
								"的个数（数字可重复，去重后计数），多组数据。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								/* @__PURE__ */ jsx("strong", { children: "位掩码 + 取模计数" }),
								"的样板：",
								/* @__PURE__ */ jsx(M, { children: "dp[mask][r]" }),
								" 主维记已用数字、附加维记 ",
								/* @__PURE__ */ jsx(M, { children: "\\bmod d" }),
								" 的余数，还必须处理",
								/* @__PURE__ */ jsx("strong", { children: "重复数字去重" }),
								"。把「状压计数变形」的三个要点（掩码、附加维、去重）一次讲全。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "状态 · 转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "dp[mask|(1{<}{<}i)][(r\\cdot10+d_i)\\bmod d]\\mathrel{+}=dp[mask][r]" }),
								"；答案 ",
								/* @__PURE__ */ jsx(M, { children: "dp[full][0]" }),
								"；",
								/* @__PURE__ */ jsx(M, { children: "O(2^n\\cdot d\\cdot n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P4163,
								luogu: "P4163"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P3959",
					name: "[NOIP2017 提高组] 宝藏",
					src: "NOIP2017",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个点、",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								" 条带权边（",
								/* @__PURE__ */ jsx(M, { children: "n\\le 12" }),
								"），选根建生成树，边代价 = 边权 × 到根层数，求最小总代价。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角",
							children: [
								"与上一类「覆盖」相比，这里换个角度看它的",
								/* @__PURE__ */ jsx("strong", { children: "转移" }),
								"：对已连通集合 ",
								/* @__PURE__ */ jsx(M, { children: "S" }),
								" 的补集",
								/* @__PURE__ */ jsx("strong", { children: "枚举子集" }),
								" ",
								/* @__PURE__ */ jsx(M, { children: "sub" }),
								" 作为新一层。正是 ",
								/* @__PURE__ */ jsx("code", { children: "sub=(sub-1)&rest" }),
								" 这行子集枚举，把复杂度抬到 ",
								/* @__PURE__ */ jsx(M, { children: "O(3^n)" }),
								"——本类技巧的实战范例。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_SUBSET,
								luogu: "P3959",
								title: "子集枚举骨架（配合上一类的宝藏完整代码）"
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
					pid: "P2831",
					name: "[NOIP2016 提高组] 愤怒的小鸟",
					hint: "复用上一类的覆盖 mask：转移也可写成「对未打的猪集合枚举一条线覆盖」。试着把它和补集/子集枚举结合，体会覆盖与子集两种视角的统一。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2915",
					name: "[USACO08NOV] Mixed Up Cows G",
					hint: "位掩码 + 附加维计数的另一例：f[S][i]=用完集合 S、末位是 i 的合法排列数，附加维就是「末位是谁」。转移追加一头与末位编号差 > K 的牛。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P3959",
					name: "[NOIP2017 提高组] 宝藏",
					hint: "亲手把「层内枚举子集扩展」写一遍：rest=full ^ S，for(sub=rest; sub; sub=(sub-1)&rest) 枚举新接入的一层，注意深度乘子与边权预处理。"
				})
			]
		})
	] });
}
//#endregion
export { BitSubset as default };
