import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as PlaybackControls, t as useStepPlayer } from "./useStepPlayer-CZuIDieE.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
/* empty css                      */
import { o as CoverMaskFigure, t as BitLattice } from "./BitArt-C1NRBGYU.js";
import { useMemo, useState } from "react";
import { Minus, MousePointerClick, Plus, RotateCcw } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/bitmask-cover/internal.ts
var INF = Number.POSITIVE_INFINITY;
function executeBitmaskCover(universe, choices, emit) {
	if (!Number.isInteger(universe) || universe < 0 || universe > 20) throw new RangeError("cover universe must be between 0 and 20");
	const full = (1 << universe) - 1;
	for (const choice of choices) {
		if (!Number.isInteger(choice.cover) || choice.cover < 0 || (choice.cover | full) !== full) throw new RangeError("cover masks must stay inside the universe");
		if (!Number.isFinite(choice.cost) || choice.cost < 0) throw new RangeError("cover costs must be non-negative");
	}
	const table = Array(full + 1).fill(INF);
	table[0] = 0;
	const snapshot = () => table.map((value) => Number.isFinite(value) ? value : -1);
	for (let covered = 0; covered <= full; covered++) {
		if (!Number.isFinite(table[covered])) continue;
		for (let choice = 0; choice < choices.length; choice++) {
			const next = covered | choices[choice].cover;
			if (next === covered) continue;
			const before = table[next];
			const candidate = table[covered] + choices[choice].cost;
			const updated = candidate < before;
			if (updated) table[next] = candidate;
			emit({
				type: "transition",
				covered,
				choice,
				next,
				before: Number.isFinite(before) ? before : -1,
				candidate,
				updated,
				table: snapshot()
			});
		}
	}
	return {
		cost: Number.isFinite(table[full]) ? table[full] : -1,
		full,
		universe,
		table: snapshot()
	};
}
function recordBitmaskCover(universe, choices) {
	const events = [];
	return {
		result: executeBitmaskCover(universe, choices, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/components/demos/bitmask/coverSolver.ts
function solveCover(universe, choices) {
	const run = recordBitmaskCover(universe, choices);
	return {
		steps: run.events.map((event) => ({
			S: event.covered,
			choice: event.choice,
			nextS: event.next,
			before: event.before,
			cand: event.candidate,
			took: event.updated,
			dp: [...event.table],
			full: run.result.full
		})),
		ans: run.result.cost,
		full: run.result.full,
		n: run.result.universe
	};
}
function toBits(value, width) {
	return Array.from({ length: width }, (_, index) => value >> index & 1);
}
//#endregion
//#region src/components/demos/bitmask/CoverDemo.tsx
var N = 4;
var INIT = [
	{
		cover: 3,
		cost: 2
	},
	{
		cover: 12,
		cost: 2
	},
	{
		cover: 15,
		cost: 5
	}
];
function MiniBits({ mask, n, tone }) {
	const bits = toBits(mask, n);
	const cell = 18;
	const w = n * cell + (n - 1) * 3;
	return /* @__PURE__ */ jsx("svg", {
		viewBox: `0 0 ${w} ${cell}`,
		width: w,
		height: cell,
		className: "bm__minibits",
		children: bits.map((b, i) => /* @__PURE__ */ jsx("rect", {
			x: i * 21,
			y: 0,
			width: cell,
			height: cell,
			rx: "4",
			fill: b ? tone === "full" ? "color-mix(in srgb, var(--viz-chosen) 34%, var(--surface-3))" : "color-mix(in srgb, var(--accent-1) 30%, var(--surface-3))" : "var(--surface-3)",
			stroke: b ? tone === "full" ? "var(--viz-chosen)" : "var(--accent-2)" : "var(--border-strong)",
			strokeWidth: "1.3"
		}, i))
	});
}
function CoverDemo() {
	const [choices, setChoices] = useState(INIT);
	const res = useMemo(() => solveCover(N, choices), [choices]);
	const p = useStepPlayer(res.steps.length);
	const step = res.steps.length ? res.steps[Math.min(p.index, res.steps.length - 1)] : null;
	const reset = () => {
		setChoices(INIT);
		p.reset();
	};
	const toggleCover = (ci, el) => {
		setChoices((arr) => arr.map((c, k) => k === ci ? {
			...c,
			cover: c.cover ^ 1 << el
		} : c));
		p.reset();
	};
	const bumpCost = (ci, d) => {
		setChoices((arr) => arr.map((c, k) => k === ci ? {
			...c,
			cost: Math.max(1, Math.min(15, c.cost + d))
		} : c));
		p.reset();
	};
	const full = res.full;
	const dpNow = step ? step.dp : Array.from({ length: full + 1 }, (_, i) => i === 0 ? 0 : -1);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "bm__toolbar bm__toolbar--cover",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "kd__group-label",
					style: { width: "100%" },
					children: ["选择（点元素格切换是否覆盖 · 调代价）· 全集 = ", "{0,1,2,3}"]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "bm__choices",
					children: choices.map((c, ci) => /* @__PURE__ */ jsxs("div", {
						className: "bm__choice",
						children: [
							/* @__PURE__ */ jsxs("span", {
								className: "bm__choice-name",
								children: ["选择 ", String.fromCharCode(65 + ci)]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "bm__choice-cells",
								children: Array.from({ length: N }, (_, el) => {
									return /* @__PURE__ */ jsx("button", {
										className: `bm__cover-cell${(c.cover >> el & 1) === 1 ? " on" : ""}`,
										onClick: () => toggleCover(ci, el),
										"aria-label": `选择${ci}覆盖元素${el}`,
										children: el
									}, el);
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "bm__choice-cost",
								children: [
									/* @__PURE__ */ jsx("span", { children: "代价" }),
									/* @__PURE__ */ jsx("button", {
										onClick: () => bumpCost(ci, -1),
										disabled: c.cost <= 1,
										"aria-label": "代价减",
										children: /* @__PURE__ */ jsx(Minus, { size: 11 })
									}),
									/* @__PURE__ */ jsx("b", { children: c.cost }),
									/* @__PURE__ */ jsx("button", {
										onClick: () => bumpCost(ci, 1),
										disabled: c.cost >= 15,
										"aria-label": "代价加",
										children: /* @__PURE__ */ jsx(Plus, { size: 11 })
									})
								]
							})
						]
					}, ci))
				}),
				/* @__PURE__ */ jsxs("button", {
					className: "bm__reset",
					onClick: reset,
					"aria-label": "重置",
					children: [/* @__PURE__ */ jsx(RotateCcw, { size: 13 }), " 复位"]
				})
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "bm__dp-strip",
			children: Array.from({ length: full + 1 }, (_, S) => {
				const v = dpNow[S];
				const isFull = S === full;
				const isSrc = step && step.S === S;
				const isDst = step && step.nextS === S;
				return /* @__PURE__ */ jsxs("div", {
					className: `bm__dp-cell${isFull ? " full" : ""}${isSrc ? " src" : ""}${isDst ? " dst" : ""}`,
					children: [/* @__PURE__ */ jsx(MiniBits, {
						mask: S,
						n: N,
						tone: isFull ? "full" : "on"
					}), /* @__PURE__ */ jsx("span", {
						className: "bm__dp-val",
						children: v < 0 ? "∞" : v
					})]
				}, S);
			})
		}),
		step && /* @__PURE__ */ jsxs("div", {
			className: "bm__caption",
			children: [
				"用",
				/* @__PURE__ */ jsxs("b", { children: ["选择 ", String.fromCharCode(65 + step.choice)] }),
				"：从已覆盖 ",
				/* @__PURE__ */ jsx("span", {
					className: "mono",
					children: toBits(step.S, N).slice().reverse().join("")
				}),
				"（代价 ",
				dpNow[step.S] < 0 ? "∞" : dpNow[step.S],
				"）并入它覆盖的元素 → 变成 ",
				/* @__PURE__ */ jsx("span", {
					className: "mono",
					children: toBits(step.nextS, N).slice().reverse().join("")
				}),
				"。 新代价 = ",
				step.cand,
				"，原 dp[",
				toBits(step.nextS, N).slice().reverse().join(""),
				"] = ",
				step.before < 0 ? "∞" : step.before,
				" →",
				" ",
				step.took ? /* @__PURE__ */ jsxs("b", {
					style: { color: "var(--viz-chosen)" },
					children: ["更新为 ", step.cand]
				}) : "不更新",
				"。"
			]
		}),
		/* @__PURE__ */ jsx(PlaybackControls, {
			player: p,
			variant: "compact",
			label: "集合覆盖逐帧播放"
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "bm__note",
			children: [
				"终态 ",
				/* @__PURE__ */ jsx("b", {
					className: "mono",
					children: toBits(full, N).slice().reverse().join("")
				}),
				"（全集）的最小代价 =",
				" ",
				/* @__PURE__ */ jsx("b", {
					style: { color: "var(--viz-chosen)" },
					children: res.ans < 0 ? "无法覆盖" : res.ans
				}),
				"。"
			]
		})
	] });
}
//#endregion
//#region src/content/g/BitCover.tsx
var CODE_P2831 = `
#include <iostream>
#include <cstring>
#include <cmath>
#include <algorithm>
using namespace std;

const double EPS = 1e-6;
int T, n, m;
double X[20], Y[20];
int line[20][20];               // line[i][j]：过点 i、j 的抛物线能打掉的猪 mask
int f[1 << 18];

int main()
{
    cin >> T;
    while (T--)
    {
        cin >> n >> m;
        for (int i = 0; i < n; i++) cin >> X[i] >> Y[i];
        memset(line, 0, sizeof line);

        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
            {
                if (fabs(X[i] - X[j]) < EPS) continue;      // 竖直，无法定抛物线
                // 由 (X[i],Y[i])、(X[j],Y[j]) 解 y=a x^2 + b x（过原点）
                double a = (Y[i] / X[i] - Y[j] / X[j]) / (X[i] - X[j]);
                double b = Y[i] / X[i] - a * X[i];
                if (a > -EPS) continue;                     // 开口必须朝下
                int s = 0;
                for (int k = 0; k < n; k++)                 // ★这条线覆盖哪些猪
                    if (fabs(a * X[k] * X[k] + b * X[k] - Y[k]) < EPS)
                        s |= (1 << k);
                line[i][j] = s;
            }

        memset(f, 0x3f, sizeof f);
        f[0] = 0;
        for (int S = 0; S < (1 << n); S++)
        {
            if (f[S] == 0x3f3f3f3f) continue;
            int p = 0;
            while (p < n && (S >> p & 1)) p++;              // 找第一只没打的猪 p
            if (p == n) continue;
            f[S | (1 << p)] = min(f[S | (1 << p)], f[S] + 1); // 单点一发
            for (int j = 0; j < n; j++)                     // 选一条过 p 的抛物线
                f[S | line[p][j]] = min(f[S | line[p][j]], f[S] + 1);
        }
        cout << f[(1 << n) - 1] << endl;
    }
    return 0;
}`;
var CODE_P3959 = `
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

int n, m;
int road[15][15];               // 两点间道路长度（无边为 INF）
int cost[1 << 12][15];          // cost[S][j]：从集合 S 向外接一步到 j 的最小边权
int f[13][1 << 12];             // f[dep][S]：已连成集合 S、最大深度 dep 的最小代价

int main()
{
    memset(road, 0x3f, sizeof road);
    cin >> n >> m;
    for (int i = 0; i < m; i++)
    {
        int a, b, c; cin >> a >> b >> c;
        a--; b--;
        road[a][b] = road[b][a] = min(road[a][b], c);
    }

    // 预处理：集合 S 之外的点 j，到 S 的最短单边
    for (int S = 0; S < (1 << n); S++)
        for (int j = 0; j < n; j++)
        {
            if (S >> j & 1) continue;
            int mn = 0x3f3f3f3f;
            for (int i = 0; i < n; i++)
                if ((S >> i & 1) && road[i][j] < mn) mn = road[i][j];
            cost[S][j] = mn;
        }

    memset(f, 0x3f, sizeof f);
    for (int i = 0; i < n; i++) f[1][1 << i] = 0;   // 任一点单独作根，深度 1

    for (int dep = 2; dep <= n; dep++)
        for (int S = 1; S < (1 << n); S++)
        {
            if (f[dep - 1][S] == 0x3f3f3f3f) continue;
            int rest = ((1 << n) - 1) ^ S;              // S 外的点
            // ★枚举 rest 的非空子集 sub，作为这一层新接入的点
            for (int sub = rest; sub; sub = (sub - 1) & rest)
            {
                int w = 0; bool ok = true;
                for (int j = 0; j < n; j++)
                    if (sub >> j & 1)
                    {
                        if (cost[S][j] == 0x3f3f3f3f) { ok = false; break; }
                        w += cost[S][j];                // 每个新点边权 × 当前深度
                    }
                if (!ok) continue;
                f[dep][S | sub] = min(f[dep][S | sub],
                                      f[dep - 1][S] + w * (dep - 1));
            }
        }

    int ans = 0x3f3f3f3f;
    for (int dep = 1; dep <= n; dep++)
        ans = min(ans, f[dep][(1 << n) - 1]);
    cout << ans << endl;
    return 0;
}`;
function BitCover() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "当「一步」能盖住一批元素"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"TSP 里，走一步只到达",
						/* @__PURE__ */ jsx("strong", { children: "一个" }),
						"新点。但很多问题里，一次「选择」能一口气",
						/* @__PURE__ */ jsx("strong", { children: "覆盖一批元素" }),
						"：一条抛物线砸下去打掉好几只猪、按一个开关翻转好几盏灯、修一条路连通好几个城市。目标不再是「排好顺序」，而是「",
						/* @__PURE__ */ jsx("strong", { children: "用最小代价把全部元素覆盖掉" }),
						"」。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"先看一个抽象的小例子：全集有 5 个元素 ",
						/* @__PURE__ */ jsx(M, { children: "\\{0,1,2,3,4\\}" }),
						"，有若干「选择」，每个选择覆盖其中一部分、各有代价。要选出一组选择，让它们的覆盖",
						/* @__PURE__ */ jsx("strong", { children: "并起来等于全集" }),
						"，总代价最小。这就是",
						/* @__PURE__ */ jsx("strong", { children: "集合覆盖" }),
						"——它是 NP 难的，但当元素个数 ",
						/* @__PURE__ */ jsx(M, { children: "n\\le 20" }),
						" 时，状压给出可行解。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(CoverMaskFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "每个选择覆盖的元素压成一个 mask；若干 mask 按位或起来，填满全集 (1<<5)−1 就算覆盖完成。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"关键的预处理：把每个选择「",
						/* @__PURE__ */ jsx("strong", { children: "覆盖了哪些元素" }),
						"」压成一个 mask。于是「加入一个选择」就是把当前已覆盖集合 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 和这个选择的 mask 做",
						/* @__PURE__ */ jsx("strong", { children: "按位或" }),
						"——",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 只会变大或不变，永远单调朝全集靠拢。「覆盖满」就是 ",
						/* @__PURE__ */ jsx(M, { children: "S=(1{<}{<}n)-1" }),
						"。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：dp[S] = 覆盖 S 的最小代价"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
							"这里的集合 ",
							/* @__PURE__ */ jsx(M, { children: "S" }),
							" 含义变了——不再是 TSP 的「已访问点」，而是「",
							/* @__PURE__ */ jsx("strong", { children: "已被覆盖的元素" }),
							"」。设 ",
							/* @__PURE__ */ jsx(M, { children: "dp[S]" }),
							" = 让 ",
							/* @__PURE__ */ jsx(M, { children: "S" }),
							" 里所有元素都被覆盖所需的",
							/* @__PURE__ */ jsx("strong", { children: "最小代价" }),
							"。注意状态只有",
							/* @__PURE__ */ jsx("strong", { children: "一维" }),
							"，没有「当前点」——因为覆盖问题不关心顺序。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "转移。" }),
							"从 ",
							/* @__PURE__ */ jsx(M, { children: "dp[S]" }),
							" 出发，选第 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							" 个选择（覆盖 mask 记 ",
							/* @__PURE__ */ jsx(M, { children: "c_k" }),
							"、代价 ",
							/* @__PURE__ */ jsx(M, { children: "w_k" }),
							"），新覆盖集合是 ",
							/* @__PURE__ */ jsx(M, { children: "S\\ |\\ c_k" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[\\,S\\ |\\ c_k\\,]=\\min\\big(dp[S\\ |\\ c_k],\\ dp[S]+w_k\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"边界：",
							/* @__PURE__ */ jsx(M, { children: "dp[0]=0" }),
							"（什么都没覆盖，代价 0），其余 ",
							/* @__PURE__ */ jsx(M, { children: "+\\infty" }),
							"。答案：",
							/* @__PURE__ */ jsx(M, { children: "dp[(1{<}{<}n)-1]" }),
							"。按 ",
							/* @__PURE__ */ jsx(M, { children: "S" }),
							" 从小到大枚举即可，因为 ",
							/* @__PURE__ */ jsx(M, { children: "S\\,|\\,c_k\\ge S" }),
							"，依赖的子状态先算好。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BitLattice, {
						bits: [
							1,
							1,
							1,
							1,
							1
						],
						labels: [
							"0",
							"1",
							"2",
							"3",
							"4"
						],
						showBinary: false
					}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "目标态：全集 (1<<n)−1（全 1）。dp 从 dp[0]=0 出发，每次按位或把 S 推向这一格，取到它的最小代价即答案。"
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"状压把「覆盖进度」编码成一个整数：",
						/* @__PURE__ */ jsx("strong", { children: "「还差哪些没盖」一目了然，「加一个选择」就是一次按位或" }),
						"。TSP 的 ",
						/* @__PURE__ */ jsx(M, { children: "dp[S][i]" }),
						" 关心「停在哪」，覆盖的 ",
						/* @__PURE__ */ jsx(M, { children: "dp[S]" }),
						" 只关心「盖到哪」——同样是 ",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 个集合状态，少一维。预处理每个选择的覆盖 mask，是这类题的",
						/* @__PURE__ */ jsx("strong", { children: "题眼" }),
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
						"用 4 个元素的小例子：选择 A 覆盖 ",
						/* @__PURE__ */ jsx(M, { children: "\\{0,1\\}" }),
						" 代价 2、B 覆盖 ",
						/* @__PURE__ */ jsx(M, { children: "\\{2,3\\}" }),
						" 代价 2、C 覆盖全部 ",
						/* @__PURE__ */ jsx(M, { children: "\\{0,1,2,3\\}" }),
						" 代价 5。看 ",
						/* @__PURE__ */ jsx(M, { children: "dp" }),
						" 怎么填："
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BitLattice, {
						bits: [
							1,
							1,
							0,
							0
						],
						labels: [
							"0",
							"1",
							"2",
							"3"
						],
						showBinary: false
					}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "选择 A 的覆盖 mask = 0011（元素 0、1）；顶端为元素编号。"
					})]
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
									/* @__PURE__ */ jsx("b", { children: "起点。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "dp[0000]=0" }),
									"，其余全设 ",
									/* @__PURE__ */ jsx(M, { children: "+\\infty" }),
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
									/* @__PURE__ */ jsx("b", { children: "从空集用 A。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "0000\\ |\\ 0011=0011" }),
									"：",
									/* @__PURE__ */ jsx(M, { children: "dp[0011]=\\min(\\infty,0+2)=2" }),
									"。同理用 B 得 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1100]=2" }),
									"，用 C 得 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1111]=5" }),
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
									/* @__PURE__ */ jsx("b", { children: "在 A 的基础上用 B。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "S=0011" }),
									" 时再选 B：",
									/* @__PURE__ */ jsx(M, { children: "0011\\ |\\ 1100=1111" }),
									"，",
									/* @__PURE__ */ jsx(M, { children: "dp[1111]=\\min(5,\\ dp[0011]+2)=\\min(5,4)=4" }),
									"。",
									/* @__PURE__ */ jsx("strong", { children: "A+B 组合（代价 4）比单用 C（代价 5）更省" }),
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
									/* @__PURE__ */ jsx("b", { children: "读答案。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "dp[1111]=4" }),
									"——覆盖全集的最小代价。状压自动比较了「一步全覆盖」和「拼图式组合」两条路。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把 ",
						/* @__PURE__ */ jsx(M, { children: "dp[S]" }),
						" 按集合从小到大排成一排。改选择的覆盖范围和代价，看每一步按位或如何把覆盖推向全集，终态取到最小代价。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看覆盖一步步填满全集"
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
					children: "状压不止 TSP：从覆盖到「逐层生成树」"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"集合覆盖让我们看清：状压的 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 可以是",
						/* @__PURE__ */ jsx("strong", { children: "任何「一批东西的选取状态」" }),
						"，转移的核心是",
						/* @__PURE__ */ jsxs("strong", { children: [
							"用按位或把 ",
							/* @__PURE__ */ jsx(M, { children: "S" }),
							" 变大"
						] }),
						"。顺着这条路，「宝藏」（P3959）把状压推得更远——它求的是一棵",
						/* @__PURE__ */ jsx("strong", { children: "生成树" }),
						"的最小代价，边权 = 深度 × 长度。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"它的状态是 ",
						/* @__PURE__ */ jsx(M, { children: "f[dep][S]" }),
						"：已经连成的点集为 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						"、当前生成树最大深度为 ",
						/* @__PURE__ */ jsx(M, { children: "dep" }),
						" 的最小代价。转移时，从已连通的 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 向外「长一层」——枚举 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" ",
						/* @__PURE__ */ jsx("strong", { children: "补集的一个子集" }),
						"作为新接入的点，每个新点用「它到 ",
						/* @__PURE__ */ jsx(M, { children: "S" }),
						" 的最短边 × 当前深度」计费。这里既用到",
						/* @__PURE__ */ jsx("strong", { children: "覆盖式的按位或扩展" }),
						"，又要",
						/* @__PURE__ */ jsx("strong", { children: "枚举子集" }),
						"（下一类的核心技巧）。"
					] })]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱：覆盖 mask 的预处理别算错、别漏",
					children: [
						/* @__PURE__ */ jsx("strong", { children: "愤怒的小鸟" }),
						"里，两点定一条抛物线要求横坐标不同、开口朝下（",
						/* @__PURE__ */ jsx(M, { children: "a<0" }),
						"），还要用",
						/* @__PURE__ */ jsxs("strong", { children: ["浮点误差 ", /* @__PURE__ */ jsx(M, { children: "\\varepsilon" })] }),
						" 判点是否落在线上——漏判或精度不当会让某条线的覆盖 mask 出错，答案随之全错。稳妥的骨架是：先固定「第一只还没打的猪」 ",
						/* @__PURE__ */ jsx(M, { children: "p" }),
						"，再枚举过 ",
						/* @__PURE__ */ jsx(M, { children: "p" }),
						" 的所有抛物线去覆盖，避免重复与遗漏。"
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
					pid: "P2831",
					name: "[NOIP2016 提高组] 愤怒的小鸟",
					src: "NOIP2016",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"平面上 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 只猪（",
								/* @__PURE__ */ jsx(M, { children: "n\\le 18" }),
								"），每发小鸟沿一条过原点、开口朝下的抛物线飞行，砸掉线上所有猪，求打光所有猪的最少发数。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"集合覆盖的",
								/* @__PURE__ */ jsx("strong", { children: "标杆题" }),
								"：教学点「",
								/* @__PURE__ */ jsx("strong", { children: "两点定抛物线 → 预处理这条线覆盖哪些猪（压成 mask）" }),
								"」极其清晰。",
								/* @__PURE__ */ jsx(M, { children: "dp[S]" }),
								"=打掉集合 ",
								/* @__PURE__ */ jsx(M, { children: "S" }),
								" 的最少发数，转移选一条线做按位或。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "状态 · 转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "dp[S\\,|\\,line]=\\min(\\cdot,dp[S]+1)" }),
								"；固定第一只未打的猪减少枚举。",
								/* @__PURE__ */ jsx(M, { children: "O(2^n\\cdot n)" }),
								"（外加 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								" 预处理）。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2831,
								luogu: "P2831"
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
								"），选一点为根建生成树，一条边的开采代价 = 边权 × 它到根的",
								/* @__PURE__ */ jsx("strong", { children: "层数" }),
								"，求最小总代价。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角",
							children: [
								"展示「",
								/* @__PURE__ */ jsx("strong", { children: "状压不止 TSP" }),
								"」：状态 ",
								/* @__PURE__ */ jsx(M, { children: "f[dep][S]" }),
								" 记「已连通点集 + 当前深度」，转移",
								/* @__PURE__ */ jsx("strong", { children: "逐层" }),
								"把补集的子集接进来。它同时用到「按位或扩展」和「枚举子集」，是承上启下的一题。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P3959,
								luogu: "P3959"
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
					pid: "P2622",
					name: "关灯问题 II",
					hint: "灯的开关态压成 mask，每个按钮=对若干位做一次翻转（异或）——按一个按钮就是 S ⊕ 按钮mask。求从初始态到全灭的最少按压，状压 + BFS 最短步。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P3694",
					name: "邦邦的大合唱站队",
					hint: "把「已经排成连续块的乐队集合」压成 mask，dp[S]=让 S 中乐队各自连续所需最少移出人数，枚举下一个整块接入的乐队——覆盖式扩展 + 前缀计数。"
				})
			]
		})
	] });
}
//#endregion
export { BitCover as default };
