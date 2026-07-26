import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as countBits, t as solveKingsBoard } from "./bitmask-board-BEcYuxMB.js";
import { t as SafeCaption } from "./SafeCaption-Be4RF0ZI.js";
import { n as PlaybackControls, t as useStepPlayer } from "./useStepPlayer-CZuIDieE.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
/* empty css                      */
import { c as RowToMaskFigure, n as BoardCheckFigure, r as CannonTwoRowFigure, t as BitLattice } from "./BitArt-C1NRBGYU.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, Minus, MousePointerClick, Plus, Sigma } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/bitmask/boardSolver.ts
function layoutFrames(size, kings, layout) {
	const frames = [{
		rows: [],
		activeRow: 0,
		conflictCols: [],
		placed: 0,
		caption: `目标：在 ${size}×${size} 棋盘放 <b>${kings}</b> 个互不攻击的王。逐行确定每行摆法。`
	}];
	let placed = 0;
	for (let row = 0; row < size; row++) {
		const mask = layout[row];
		placed += countBits(mask);
		const columns = Array.from({ length: size }, (_, column) => column).filter((column) => (mask >> column & 1) === 1);
		frames.push({
			rows: layout.slice(0, row + 1),
			activeRow: row,
			conflictCols: [],
			placed,
			caption: mask === 0 ? `第 <b>${row + 1}</b> 行为空（mask=0）。` : `第 <b>${row + 1}</b> 行在第 ${columns.map((column) => column + 1).join("、")} 列放王；行内与相邻行均不冲突。已放 <b>${placed}</b> 个。`
		});
	}
	frames.push({
		rows: layout.slice(),
		activeRow: -1,
		conflictCols: [],
		placed,
		caption: `完成：放满 <b>${kings}</b> 个互不攻击的王，这是其中一种合法布局。`
	});
	return frames;
}
//#endregion
//#region src/components/demos/bitmask/BoardDemo.tsx
function BoardDemo() {
	const [N, setN] = useState(4);
	const [K, setK] = useState(4);
	const [showCount, setShowCount] = useState(false);
	const solution = useMemo(() => solveKingsBoard(N, K), [N, K]);
	const layout = solution.layout;
	const frames = useMemo(() => layout ? layoutFrames(N, K, layout) : [], [
		N,
		K,
		layout
	]);
	const total = showCount ? solution.total : null;
	const p = useStepPlayer(frames.length);
	const frame = frames.length ? frames[Math.min(p.index, frames.length - 1)] : null;
	const resetAll = (nextN = N, nextK = K) => {
		setShowCount(false);
		p.reset();
		setN(nextN);
		setK(nextK);
	};
	const changeN = (v) => {
		const nn = Math.max(3, Math.min(6, v));
		resetAll(nn, Math.min(K, nn * nn));
	};
	const changeK = (v) => {
		const kk = Math.max(1, Math.min(N * N, v));
		resetAll(N, kk);
	};
	const CELL = 44;
	const boardPx = N * CELL;
	const rows = frame?.rows ?? [];
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
		className: "bm__toolbar bm__toolbar--board",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "bm__steppers",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "stepper__lab",
				children: "棋盘边长 N"
			}), /* @__PURE__ */ jsxs("div", {
				className: "stepper__row",
				children: [
					/* @__PURE__ */ jsx("button", {
						onClick: () => changeN(N - 1),
						disabled: N <= 3,
						"aria-label": "N 减",
						children: /* @__PURE__ */ jsx(Minus, { size: 13 })
					}),
					/* @__PURE__ */ jsx("span", {
						className: "stepper__val",
						children: N
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => changeN(N + 1),
						disabled: N >= 6,
						"aria-label": "N 加",
						children: /* @__PURE__ */ jsx(Plus, { size: 13 })
					})
				]
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "stepper__lab",
				children: "放置王数 K"
			}), /* @__PURE__ */ jsxs("div", {
				className: "stepper__row",
				children: [
					/* @__PURE__ */ jsx("button", {
						onClick: () => changeK(K - 1),
						disabled: K <= 1,
						"aria-label": "K 减",
						children: /* @__PURE__ */ jsx(Minus, { size: 13 })
					}),
					/* @__PURE__ */ jsx("span", {
						className: "stepper__val",
						children: K
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => changeK(K + 1),
						disabled: K >= N * N,
						"aria-label": "K 加",
						children: /* @__PURE__ */ jsx(Plus, { size: 13 })
					})
				]
			})] })]
		}), /* @__PURE__ */ jsxs("div", {
			className: "bm__legend-mini",
			children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { className: "bm__sw bm__sw--king" }), " 王"] }), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { className: "bm__sw bm__sw--active" }), " 当前行"] })]
		})]
	}), !layout ? /* @__PURE__ */ jsxs("div", {
		className: "bm__note bm__note--warn",
		children: [
			"在 ",
			N,
			"×",
			N,
			" 的棋盘上放不下 ",
			/* @__PURE__ */ jsx("b", { children: K }),
			" 个互不攻击的王（K 太大）——减小 K 或增大 N 再试。"
		]
	}) : /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("div", {
			className: "bm__board-stage",
			children: /* @__PURE__ */ jsxs("svg", {
				viewBox: `0 0 ${boardPx} ${boardPx}`,
				width: boardPx,
				height: boardPx,
				role: "img",
				"aria-label": "互不侵犯棋盘逐行放置",
				children: [Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
					const isActive = frame?.activeRow === r;
					const hasKing = r < rows.length && (rows[r] >> c & 1) === 1;
					const dark = (r + c) % 2 === 1;
					return /* @__PURE__ */ jsxs("g", {
						transform: `translate(${c * CELL},${r * CELL})`,
						children: [/* @__PURE__ */ jsx("rect", {
							width: CELL,
							height: CELL,
							fill: isActive ? "color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))" : dark ? "var(--surface-2)" : "var(--surface-3)",
							stroke: "var(--border)",
							strokeWidth: "1"
						}), hasKing && /* @__PURE__ */ jsxs("g", {
							transform: `translate(${CELL / 2},${CELL / 2})`,
							children: [/* @__PURE__ */ jsx("circle", {
								r: CELL * .3,
								fill: "var(--grad-accent)",
								stroke: "var(--accent-2)",
								strokeWidth: "1.5"
							}), /* @__PURE__ */ jsx("text", {
								y: "4",
								textAnchor: "middle",
								fontSize: "14",
								fontWeight: "700",
								fill: "var(--text-on-accent)",
								children: "♔"
							})]
						})]
					}, `${r}-${c}`);
				})), frame?.activeRow != null && frame.activeRow >= 0 && /* @__PURE__ */ jsx("rect", {
					x: "0",
					y: frame.activeRow * CELL,
					width: boardPx,
					height: CELL,
					fill: "none",
					stroke: "var(--viz-current)",
					strokeWidth: "2.5",
					rx: "3"
				})]
			})
		}),
		/* @__PURE__ */ jsx(SafeCaption, {
			html: frame?.caption ?? "",
			className: "bm__caption"
		}),
		/* @__PURE__ */ jsx(PlaybackControls, {
			player: p,
			variant: "compact",
			label: "棋盘布局逐帧播放"
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "bm__count-row",
			children: [/* @__PURE__ */ jsxs("button", {
				className: "bm__count-btn",
				onClick: () => setShowCount((s) => !s),
				children: [
					/* @__PURE__ */ jsx(Sigma, { size: 15 }),
					" ",
					showCount ? "收起方案总数" : "看方案总数（状压 DP）"
				]
			}), showCount && total != null && /* @__PURE__ */ jsxs("span", {
				className: "bm__count-out",
				children: [
					N,
					"×",
					N,
					" 放 ",
					K,
					" 个互不攻击的王，合法布局共 ",
					/* @__PURE__ */ jsx("b", { children: total }),
					" 种（演示只展示了其中一种）。"
				]
			})]
		})
	] })] });
}
//#endregion
//#region src/content/g/BitBoard.tsx
var CODE_P1896 = `
#include <iostream>
using namespace std;

long long f[10][2005][1 << 9];   // f[行][已放王数][本行摆法mask]
int st[600], num[600], cnt;      // 预处理：行内合法的 mask 及其王数

int main()
{
    int n, K;
    cin >> n >> K;

    for (int s = 0; s < (1 << n); s++)      // 枚举一行所有摆法
    {
        if (s & (s << 1)) continue;         // ★行内：相邻两列都放则丢弃
        st[cnt] = s;
        num[cnt] = __builtin_popcount(s);   // 这行放了几个王
        cnt++;
    }

    for (int i = 0; i < cnt; i++)           // 第 1 行：直接填
        if (num[i] <= K)
            f[1][num[i]][st[i]] = 1;

    for (int r = 2; r <= n; r++)            // 逐行递推
        for (int i = 0; i < cnt; i++)       // 本行摆法
            for (int j = num[i]; j <= K; j++)
                for (int p = 0; p < cnt; p++) // 上一行摆法
                {
                    int a = st[i], b = st[p];
                    if (a & b) continue;        // ★正上方相邻
                    if (a & (b << 1)) continue; // ★左上相邻
                    if (a & (b >> 1)) continue; // ★右上相邻
                    f[r][j][a] += f[r - 1][j - num[i]][b];
                }

    long long ans = 0;
    for (int i = 0; i < cnt; i++)
        ans += f[n][K][st[i]];
    cout << ans << endl;
    return 0;
}`;
var CODE_P1879 = `
#include <iostream>
using namespace std;

const int MOD = 1e8;
int g[15];                        // g[i]：第 i 行的「贫瘠格」掩码（1=不能种）
int f[15][1 << 12];
int st[5000], cnt;                // 行内合法（无横向相邻）的 mask

int main()
{
    int m, n;
    cin >> m >> n;
    for (int i = 1; i <= m; i++)
        for (int j = 0; j < n; j++)
        {
            int x; cin >> x;
            if (x == 0) g[i] |= (1 << j);   // 0 = 不可种 → 记入贫瘠掩码
        }

    for (int s = 0; s < (1 << n); s++)
        if (!(s & (s << 1))) st[cnt++] = s; // 行内无相邻

    f[0][0] = 1;                            // 第 0 行（虚拟空行）方案数 1
    for (int i = 1; i <= m; i++)
        for (int a = 0; a < cnt; a++)
        {
            int s = st[a];
            if (s & g[i]) continue;         // ★踩到贫瘠格，非法
            for (int b = 0; b < cnt; b++)
            {
                int t = st[b];
                if (s & t) continue;        // 上下相邻同列不能都种
                f[i][s] = (f[i][s] + f[i - 1][t]) % MOD;
            }
        }

    int ans = 0;
    for (int a = 0; a < cnt; a++)
        ans = (ans + f[m][st[a]]) % MOD;
    cout << ans << endl;
    return 0;
}`;
var CODE_P2704 = `
#include <iostream>
#include <algorithm>
using namespace std;

int g[105];                       // g[i]：第 i 行山地(H)掩码，1=不能放
int st[105], num[105], cnt;       // 行内合法：任意两个 1 至少隔 2 列
int f[105][105][105];             // f[行][上一行mask下标][上上行mask下标]

bool ok(int s)                    // 同行炮兵间隔 ≥ 3（攻击隔两格）
{
    return !(s & (s << 1)) && !(s & (s << 2));
}

int main()
{
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < m; j++)
        {
            char c; cin >> c;
            if (c == 'H') g[i] |= (1 << j);
        }

    for (int s = 0; s < (1 << m); s++)
        if (ok(s)) { st[cnt] = s; num[cnt] = __builtin_popcount(s); cnt++; }

    for (int i = 1; i <= n; i++)
        for (int a = 0; a < cnt; a++)       // 本行
        {
            if (st[a] & g[i]) continue;
            for (int b = 0; b < cnt; b++)   // 上一行
            {
                if (st[a] & st[b]) continue;
                for (int c = 0; c < cnt; c++)   // 上上行
                {
                    if (st[a] & st[c]) continue;
                    if (st[b] & st[c]) continue;
                    f[i][a][b] = max(f[i][a][b],
                                     f[i - 1][b][c] + num[a]);
                }
            }
        }

    int ans = 0;
    for (int a = 0; a < cnt; a++)
        for (int b = 0; b < cnt; b++)
            ans = max(ans, f[n][a][b]);
    cout << ans << endl;
    return 0;
}`;
function BitBoard() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "当「一行的选择」有了 2ⁿ 种"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"先看一个具体问题：在 ",
						/* @__PURE__ */ jsx(M, { children: "3\\times 3" }),
						" 的棋盘上放国际象棋的",
						/* @__PURE__ */ jsx("strong", { children: "王" }),
						"，王会攻击周围 8 格，要求两两",
						/* @__PURE__ */ jsx("strong", { children: "互不攻击" }),
						"，问放 2 个王有多少种方案。 如果一行一行地放，每一行的状态无非是「哪些列放了王」——这本身就是 ",
						/* @__PURE__ */ jsx(M, { children: "2^3=8" }),
						" 种可能。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"为什么不能像线性 DP 那样，只记「这一行放了几个王」？因为下一行能不能放，",
						/* @__PURE__ */ jsx("strong", { children: "不只取决于个数，还取决于放在哪些列" }),
						"——两个王只要斜对角相邻就冲突。 「几个」这个标量丢掉了列的信息，是",
						/* @__PURE__ */ jsx("strong", { children: "有后效性" }),
						"的。我们需要把「这一行的完整摆法」原封不动地记进状态里。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(RowToMaskFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "一行棋盘「放 / 不放」正好对应一个二进制整数 mask——第 c 列放了王，就让第 c 位是 1。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"关键的一步：把",
						/* @__PURE__ */ jsx("strong", { children: "一整行的摆法压成一个整数" }),
						"。第 ",
						/* @__PURE__ */ jsx(M, { children: "c" }),
						" 列放了王就让二进制第 ",
						/* @__PURE__ */ jsx(M, { children: "c" }),
						" 位为 ",
						/* @__PURE__ */ jsx(M, { children: "1" }),
						"，否则为 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						"。 于是「列 1、列 3 放了王」就是 ",
						/* @__PURE__ */ jsx(M, { children: "00101_2=5" }),
						"。整行的 ",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 种摆法，一一对应 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						" 到 ",
						/* @__PURE__ */ jsx(M, { children: "2^n-1" }),
						" 这些整数——这就是",
						/* @__PURE__ */ jsx("strong", { children: "状态压缩" }),
						"：用一个 mask 承载一行的全部信息。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"这类「逐行推进、把当前行压成 mask」的状压，叫",
						/* @__PURE__ */ jsx("strong", { children: "棋盘状压 / 轮廓状压" }),
						"。它只在 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 很小（通常 ",
						/* @__PURE__ */ jsx(M, { children: "\\le 12" }),
						"）时可行，因为每行要枚举 ",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 种摆法。"
					] })]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "两道判定：行内合法、行间合法"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"压成 mask 之后，「合不合法」全部变成",
							/* @__PURE__ */ jsx("strong", { children: "位运算" }),
							"——这正是状压的威力。放王有两条约束："
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "① 行内不相邻。" }),
							"同一行里两个王不能挨着（左右相邻会互相攻击）。把摆法 ",
							/* @__PURE__ */ jsx(M, { children: "x" }),
							" 左移一位再和自己按位与：",
							/* @__PURE__ */ jsx(M, { children: "x\\ \\&\\ (x{<}{<}1)" }),
							"。 若结果非 ",
							/* @__PURE__ */ jsx(M, { children: "0" }),
							"，说明存在某位和它左边一位",
							/* @__PURE__ */ jsx("strong", { children: "同时为 1" }),
							"，即有相邻——不合法。合法当且仅当 ",
							/* @__PURE__ */ jsx(M, { children: "x\\ \\&\\ (x{<}{<}1)=0" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "② 行间不冲突。" }),
							"本行 ",
							/* @__PURE__ */ jsx(M, { children: "x" }),
							" 与上一行 ",
							/* @__PURE__ */ jsx(M, { children: "y" }),
							"，王会攻击正下、左下、右下三个方向。用三个按位与一起判： 正上方 ",
							/* @__PURE__ */ jsx(M, { children: "x\\ \\&\\ y" }),
							"、左上 ",
							/* @__PURE__ */ jsx(M, { children: "x\\ \\&\\ (y{<}{<}1)" }),
							"、右上 ",
							/* @__PURE__ */ jsx(M, { children: "x\\ \\&\\ (y{>}{>}1)" }),
							"，三者全为 ",
							/* @__PURE__ */ jsx(M, { children: "0" }),
							" 才合法。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BoardCheckFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "行内用 x&(x<<1) 查横向相邻；行间用 x&y 等查上下同列/斜角冲突（虚线为冲突列）。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"有了判定，状态与转移就顺理成章。设 ",
							/* @__PURE__ */ jsx(M, { children: "f[r][j][x]" }),
							" 表示：前 ",
							/* @__PURE__ */ jsx(M, { children: "r" }),
							" 行、一共放了 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 个王、且",
							/* @__PURE__ */ jsxs("strong", { children: [
								"第 ",
								/* @__PURE__ */ jsx(M, { children: "r" }),
								" 行摆法为 ",
								/* @__PURE__ */ jsx(M, { children: "x" })
							] }),
							" 时的方案数。转移枚举上一行摆法 ",
							/* @__PURE__ */ jsx(M, { children: "y" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[r][j][x]=\\sum_{y\\,\\sim\\,x} f[r-1][\\,j-\\mathrm{popcount}(x)\\,][y]" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"其中记号 ",
							/* @__PURE__ */ jsx(M, { children: "y\\sim x" }),
							" 表示上一行摆法 ",
							/* @__PURE__ */ jsx(M, { children: "y" }),
							" 与本行 ",
							/* @__PURE__ */ jsx(M, { children: "x" }),
							" ",
							/* @__PURE__ */ jsx("strong", { children: "兼容" }),
							"——",
							/* @__PURE__ */ jsx(M, { children: "y" }),
							" 行内合法、且与 ",
							/* @__PURE__ */ jsx(M, { children: "x" }),
							" 行间不冲突。边界：第 1 行 ",
							/* @__PURE__ */ jsx(M, { children: "f[1][\\mathrm{popcount}(x)][x]=1" }),
							"。答案：",
							/* @__PURE__ */ jsx(M, { children: "\\sum_x f[n][K][x]" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"状压把「一行的组合结构」塞进一个整数，于是",
						/* @__PURE__ */ jsx("strong", { children: "合法性判定 = 一两条位运算" }),
						"、",
						/* @__PURE__ */ jsx("strong", { children: "状态转移 = 枚举相邻两行的 mask 配对" }),
						"。指数级的摆法被 ",
						/* @__PURE__ */ jsx(M, { children: "O(n\\cdot K\\cdot 4^n)" }),
						" 的表格容纳——只在 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 小才划算，这也是状压的适用边界。"
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
						"用 ",
						/* @__PURE__ */ jsx(M, { children: "3\\times 3" }),
						" 棋盘、放 ",
						/* @__PURE__ */ jsx(M, { children: "K=2" }),
						" 个王，把方程跑几步。先列出「行内合法」的一行摆法（",
						/* @__PURE__ */ jsx(M, { children: "n=3" }),
						"）："
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BitLattice, {
						bits: [
							1,
							0,
							1
						],
						showBinary: false
					}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "摆法 101（列 1、列 3）——两个 1 不相邻，行内合法；而 011、110 因相邻被淘汰。"
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
									/* @__PURE__ */ jsx("b", { children: "枚举行内合法摆法。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "n=3" }),
									" 的 8 种里，去掉含相邻 1 的（",
									/* @__PURE__ */ jsx(M, { children: "011,110,111" }),
									"），剩 ",
									/* @__PURE__ */ jsx(M, { children: "000,001,010,100,101" }),
									" 共 5 种。其中放了 2 个王的只有 ",
									/* @__PURE__ */ jsx(M, { children: "101" }),
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
									/* @__PURE__ */ jsx("b", { children: "第 1 行初始化。" }),
									" 每个合法摆法各算 1 种：",
									/* @__PURE__ */ jsx(M, { children: "f[1][0][000]=1" }),
									"、",
									/* @__PURE__ */ jsx(M, { children: "f[1][1][001]=1" }),
									"、…、",
									/* @__PURE__ */ jsx(M, { children: "f[1][2][101]=1" }),
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
									/* @__PURE__ */ jsx("b", { children: "第 2 行接上。" }),
									" 想让第 2 行摆 ",
									/* @__PURE__ */ jsx(M, { children: "x=101" }),
									"：它要放 2 个王，需 ",
									/* @__PURE__ */ jsx(M, { children: "j\\ge 2" }),
									"；上一行 ",
									/* @__PURE__ */ jsx(M, { children: "y" }),
									" 必须和它行间不冲突。",
									/* @__PURE__ */ jsx(M, { children: "y=101" }),
									" 时 ",
									/* @__PURE__ */ jsx(M, { children: "x\\&y=101\\ne 0" }),
									" 冲突；只有 ",
									/* @__PURE__ */ jsx(M, { children: "y=000" }),
									" 才兼容 → ",
									/* @__PURE__ */ jsx(M, { children: "f[2][2][101]\\mathrel{+}=f[1][0][000]=1" }),
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
									/* @__PURE__ */ jsx("b", { children: "累到第 3 行求和。" }),
									" 把 ",
									/* @__PURE__ */ jsx(M, { children: "f[3][2][x]" }),
									" 对所有 ",
									/* @__PURE__ */ jsx(M, { children: "x" }),
									" 求和，就得到 ",
									/* @__PURE__ */ jsx(M, { children: "3\\times 3" }),
									" 放 2 个互不攻击的王的方案数（答案是 ",
									/* @__PURE__ */ jsx(M, { children: "16" }),
									"）。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示会在棋盘上",
						/* @__PURE__ */ jsx("strong", { children: "逐行放王" }),
						"，先带你看「其中一种」合法布局怎么一行行搭起来，再一键用状压 DP 算出",
						/* @__PURE__ */ jsx("strong", { children: "方案总数" }),
						"。改 N 和 K 试试。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "逐行放王，再数尽所有方案"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(BoardDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "当攻击「隔两格」：状态升到两行"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"互不侵犯里，冲突只发生在",
						/* @__PURE__ */ jsx("strong", { children: "相邻行" }),
						"之间，所以状态记住「上一行」就够了。可一旦攻击范围更远，一行就不够了——",
						/* @__PURE__ */ jsx("strong", { children: "炮兵阵地" }),
						"就是典型：炮兵沿行、列方向攻击",
						/* @__PURE__ */ jsx("strong", { children: "两格" }),
						"，于是同一列上，第 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 行的炮兵会打到第 ",
						/* @__PURE__ */ jsx(M, { children: "i-1" }),
						" 行",
						/* @__PURE__ */ jsx("strong", { children: "和" }),
						"第 ",
						/* @__PURE__ */ jsx(M, { children: "i-2" }),
						" 行。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"要判断新一行合不合法，必须同时知道",
						/* @__PURE__ */ jsx("strong", { children: "前两行" }),
						"的摆法。状态因此升维成 ",
						/* @__PURE__ */ jsx(M, { children: "f[i][x][y]" }),
						"——第 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 行摆 ",
						/* @__PURE__ */ jsx(M, { children: "x" }),
						"、第 ",
						/* @__PURE__ */ jsx(M, { children: "i-1" }),
						" 行摆 ",
						/* @__PURE__ */ jsx(M, { children: "y" }),
						"；转移再枚举第 ",
						/* @__PURE__ */ jsx(M, { children: "i-2" }),
						" 行的 ",
						/* @__PURE__ */ jsx(M, { children: "z" }),
						"，要求 ",
						/* @__PURE__ */ jsx(M, { children: "x\\&y=x\\&z=y\\&z=0" }),
						"（三行两两同列不撞）。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(CannonTwoRowFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "炮兵攻击隔两格：新行要同时避开 i−1 与 i−2 两行，所以状态必须携带「前两行」的 mask。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"同行内部也更严：两个炮兵至少隔 ",
						/* @__PURE__ */ jsx(M, { children: "3" }),
						" 列，判定变成 ",
						/* @__PURE__ */ jsx(M, { children: "x\\&(x{<}{<}1)=0" }),
						" 且 ",
						/* @__PURE__ */ jsx(M, { children: "x\\&(x{<}{<}2)=0" }),
						"。这一步「从记一行升到记两行」，是轮廓状压最常见的进阶跳板——",
						/* @__PURE__ */ jsx("strong", { children: "状态里到底要留几行，取决于约束能跨多远" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱：合法 mask 要预处理，别每次重算",
					children: [
						/* @__PURE__ */ jsx(M, { children: "n\\le 10" }),
						" 时合法摆法只有几十个，务必",
						/* @__PURE__ */ jsx("strong", { children: "先枚举一遍存进数组" }),
						"（连同它的 ",
						/* @__PURE__ */ jsx(M, { children: "\\mathrm{popcount}" }),
						"），转移时只在这几十个之间配对。若在四重循环里对全部 ",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 现算判定，炮兵那种三行枚举会直接超时。这是棋盘状压能否通过的关键工程点。"
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
					pid: "P1896",
					name: "[SCOI2005] 互不侵犯",
					src: "SCOI2005",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "N\\times N" }),
								" 棋盘放 ",
								/* @__PURE__ */ jsx(M, { children: "K" }),
								" 个王，王攻击相邻 8 格，求两两互不攻击的放置方案数（",
								/* @__PURE__ */ jsx(M, { children: "N\\le 9" }),
								"）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"棋盘状压的「最小完整模型」：",
								/* @__PURE__ */ jsxs("strong", { children: [
									"行内 ",
									/* @__PURE__ */ jsx(M, { children: "x\\&(x{<}{<}1)" }),
									" + 行间 ",
									/* @__PURE__ */ jsx(M, { children: "x\\&y" }),
									" 双判定"
								] }),
								"一次讲透，还带「已放王数」这一维练计数。是本类的立骨题。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "状态 · 转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[r][j][x]" }),
								"=前 ",
								/* @__PURE__ */ jsx(M, { children: "r" }),
								" 行放 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 个、末行摆 ",
								/* @__PURE__ */ jsx(M, { children: "x" }),
								" 的方案数；枚举兼容的上一行 ",
								/* @__PURE__ */ jsx(M, { children: "y" }),
								" 累加。复杂度 ",
								/* @__PURE__ */ jsx(M, { children: "O(N\\cdot K\\cdot M^2)" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "M" }),
								" 为合法摆法数。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1896,
								luogu: "P1896"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1879",
					name: "[USACO06NOV] Corn Fields G",
					src: "USACO 2006",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "M\\times N" }),
								" 田地，部分格",
								/* @__PURE__ */ jsx("strong", { children: "贫瘠不可种" }),
								"，且相邻格不能都种，求（含一块都不种的）种植方案数，对 ",
								/* @__PURE__ */ jsx(M, { children: "10^8" }),
								" 取模。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角",
							children: [
								"比互不侵犯多了「",
								/* @__PURE__ */ jsx("strong", { children: "禁格" }),
								"」：把每行不可种的格压成掩码 ",
								/* @__PURE__ */ jsx(M, { children: "g[i]" }),
								"，一行摆法 ",
								/* @__PURE__ */ jsx(M, { children: "x" }),
								" 合法当且仅当 ",
								/* @__PURE__ */ jsx(M, { children: "x\\&g[i]=0" }),
								"。位运算判定极干净，是「带禁格的棋盘状压」范本。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1879,
								luogu: "P1879"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2704",
					name: "[NOI2001] 炮兵阵地",
					src: "NOI2001",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "N\\times M" }),
								" 地图（",
								/* @__PURE__ */ jsx(M, { children: "M\\le 10" }),
								"），部分为山地不可驻扎；炮兵沿行列攻击",
								/* @__PURE__ */ jsx("strong", { children: "两格" }),
								"，求最多能驻扎多少炮兵互不攻击。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"把状态从「一行」升到「",
								/* @__PURE__ */ jsx("strong", { children: "前两行" }),
								"」的经典进阶：",
								/* @__PURE__ */ jsx(M, { children: "f[i][x][y]" }),
								" 记末两行摆法，转移枚举第三行。它逼你想清「状态要留几行」这个轮廓状压的核心问题。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2704,
								luogu: "P2704"
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
					hint: "把灯的开关状态压成 mask，每个按钮是一次「异或若干位」的操作，求从全亮到全灭的最少按压——状压 + BFS 最短步。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2915",
					name: "[USACO08NOV] Mixed Up Cows G",
					hint: "排列型状压：f[S][i]=用完集合 S 的奶牛、末位是 i 的合法排列数，转移要求相邻编号差 > K。与 TSP 同构。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P3694",
					name: "邦邦的大合唱站队",
					hint: "每个人属于某乐队，把「已归位的乐队集合」压成 mask，f[S]=让 S 中乐队各自连续所需最少移出人数，枚举下一个整块乐队。"
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pointer-cue",
			children: [
				/* @__PURE__ */ jsx(Gamepad2, { size: 18 }),
				"想亲手试试？到 ",
				/* @__PURE__ */ jsx(Link, {
					to: "/part/g",
					style: {
						color: "var(--accent-1)",
						fontWeight: 600
					},
					children: "G 部分页的「棋盘布阵」"
				}),
				"手动放王，实时看位运算判定冲突，再点「看 DP 全部方案数」对照。"
			]
		})
	] });
}
//#endregion
export { BitBoard as default };
