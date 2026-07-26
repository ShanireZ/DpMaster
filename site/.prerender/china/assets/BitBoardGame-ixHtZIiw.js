import { t as solveKingsBoard } from "./bitmask-board-BEcYuxMB.js";
import { n as playGameTone, t as useRoundStats } from "./useRoundStats-CJJWDPot.js";
import { useMemo, useState } from "react";
import { Grid3x3, RotateCcw, Sigma, Trophy, Volume2, VolumeX } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/games/BitBoardGame.tsx
var DIFFS = {
	easy: {
		label: "简单",
		N: 4,
		K: 4
	},
	medium: {
		label: "中等",
		N: 5,
		K: 5
	},
	hard: {
		label: "困难",
		N: 5,
		K: 6
	}
};
var DIFF_ORDER = [
	"easy",
	"medium",
	"hard"
];
function adjacent(r, c, r2, c2) {
	return Math.max(Math.abs(r - r2), Math.abs(c - c2)) === 1;
}
function BitBoardGame() {
	const [difficulty, setDifficulty] = useState("easy");
	const { N, K } = DIFFS[difficulty];
	const [rows, setRows] = useState(() => Array(DIFFS["easy"].N).fill(0));
	const [muted, setMuted] = useState(false);
	const [revealed, setRevealed] = useState(false);
	const round = useRoundStats();
	const kings = useMemo(() => {
		const list = [];
		for (let r = 0; r < rows.length; r++) for (let c = 0; c < N; c++) if (rows[r] >> c & 1) list.push({
			r,
			c
		});
		return list;
	}, [rows, N]);
	const conflictSet = useMemo(() => {
		const bad = /* @__PURE__ */ new Set();
		for (let i = 0; i < kings.length; i++) for (let j = i + 1; j < kings.length; j++) {
			const a = kings[i];
			const b = kings[j];
			if (adjacent(a.r, a.c, b.r, b.c)) {
				bad.add(`${a.r},${a.c}`);
				bad.add(`${b.r},${b.c}`);
			}
		}
		return bad;
	}, [kings]);
	const placed = kings.length;
	const hasConflict = conflictSet.size > 0;
	const win = placed === K && !hasConflict;
	const [totalShown, setTotalShown] = useState(null);
	const resetBoard = (spec) => {
		setRows(Array(spec.N).fill(0));
		setRevealed(false);
		setTotalShown(null);
		round.start();
	};
	const wouldWinAfter = (nextRows) => {
		const list = [];
		for (let r = 0; r < nextRows.length; r++) for (let c = 0; c < N; c++) if (nextRows[r] >> c & 1) list.push({
			r,
			c
		});
		if (list.length !== K) return false;
		for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) if (adjacent(list[i].r, list[i].c, list[j].r, list[j].c)) return false;
		return true;
	};
	const toggle = (r, c) => {
		const placing = (rows[r] >> c & 1) === 0;
		const nx = rows.slice();
		nx[r] = nx[r] ^ 1 << c;
		setRows(nx);
		setRevealed(false);
		if (wouldWinAfter(nx)) {
			round.record(true);
			playGameTone({
				frequency: 659,
				duration: .1
			}, muted);
			setTimeout(() => playGameTone({
				frequency: 988,
				duration: .16
			}, muted), 90);
		} else playGameTone({
			frequency: placing ? 480 + r * 40 : 300,
			duration: .07
		}, muted);
	};
	const pickDiff = (d) => {
		if (d === difficulty) return;
		setDifficulty(d);
		resetBoard(DIFFS[d]);
		playGameTone({
			frequency: 420,
			duration: .06
		}, muted);
	};
	const clear = () => {
		resetBoard(DIFFS[difficulty]);
		playGameTone({
			frequency: 360,
			duration: .06
		}, muted);
	};
	const reveal = () => {
		const total = solveKingsBoard(N, K).total;
		setTotalShown(total);
		setRevealed(true);
		playGameTone({
			frequency: 523,
			duration: .12
		}, muted);
		setTimeout(() => playGameTone({
			frequency: 784,
			duration: .16
		}, muted), 110);
	};
	let feedback = `在 ${N}×${N} 棋盘上放 ${K} 个王，两两不能相邻（含斜角）。点格子放 / 取。`;
	let fbClass = "";
	if (hasConflict) {
		feedback = `有王互相攻击了（红色高亮）——王之间至少要隔一格。挪开冲突的王。`;
		fbClass = "bad";
	} else if (win) {
		feedback = `完成！${K} 个王互不攻击。这只是其中一种布局，点「看方案总数」看看一共有多少种。`;
		fbClass = "win";
	} else if (placed < K) feedback = `已放 ${placed} / ${K} 个，继续——保持两两不相邻。`;
	else if (placed > K) {
		feedback = `放多了：当前 ${placed} 个，目标是正好 ${K} 个。`;
		fbClass = "bad";
	}
	const CELL = 52;
	const boardPx = N * CELL;
	return /* @__PURE__ */ jsxs("div", {
		className: "gbb",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "gbb__head",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "gbb__title",
					children: [/* @__PURE__ */ jsx(Grid3x3, { size: 18 }), " 棋盘布阵"]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "gbb__sub",
					children: "放满 K 个互不攻击的王"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "gbb__diff",
					role: "group",
					"aria-label": "难度",
					children: DIFF_ORDER.map((d) => /* @__PURE__ */ jsx("button", {
						className: `gbb__diff-pill${d === difficulty ? " on" : ""}`,
						onClick: () => pickDiff(d),
						"aria-pressed": d === difficulty,
						children: DIFFS[d].label
					}, d))
				}),
				/* @__PURE__ */ jsx("button", {
					className: "gbb__icon-btn",
					onClick: () => setMuted((m) => !m),
					"aria-label": "静音",
					children: muted ? /* @__PURE__ */ jsx(VolumeX, { size: 16 }) : /* @__PURE__ */ jsx(Volume2, { size: 16 })
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "gbb__body",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "gbb__board-col",
				children: [/* @__PURE__ */ jsx("div", {
					className: "gbb__board",
					style: {
						width: boardPx,
						height: boardPx
					},
					children: /* @__PURE__ */ jsx("svg", {
						viewBox: `0 0 ${boardPx} ${boardPx}`,
						width: boardPx,
						height: boardPx,
						role: "img",
						"aria-label": "棋盘布阵游戏棋盘",
						children: Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
							const hasKing = (rows[r] >> c & 1) === 1;
							const bad = conflictSet.has(`${r},${c}`);
							const dark = (r + c) % 2 === 1;
							return /* @__PURE__ */ jsxs("g", {
								transform: `translate(${c * CELL},${r * CELL})`,
								onClick: () => toggle(r, c),
								style: { cursor: "pointer" },
								children: [/* @__PURE__ */ jsx("rect", {
									width: CELL,
									height: CELL,
									fill: dark ? "var(--surface-2)" : "var(--surface-3)",
									stroke: "var(--border)",
									strokeWidth: "1"
								}), hasKing && /* @__PURE__ */ jsxs("g", {
									transform: `translate(${CELL / 2},${CELL / 2})`,
									children: [/* @__PURE__ */ jsx("circle", {
										r: CELL * .32,
										fill: bad ? "color-mix(in srgb, var(--viz-invalid) 82%, #000)" : "var(--grad-accent)",
										stroke: bad ? "var(--viz-invalid)" : "var(--accent-2)",
										strokeWidth: bad ? 2.5 : 1.5
									}), /* @__PURE__ */ jsx("text", {
										y: "5",
										textAnchor: "middle",
										fontSize: "18",
										fontWeight: "700",
										fill: bad ? "#fff" : "var(--text-on-accent)",
										children: "♔"
									})]
								})]
							}, `${r}-${c}`);
						}))
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "gbb__masks",
					children: [/* @__PURE__ */ jsx("span", {
						className: "gbb__masks-lab",
						children: "各行 mask（二进制）"
					}), /* @__PURE__ */ jsx("div", {
						className: "gbb__mask-list",
						children: rows.map((m, r) => /* @__PURE__ */ jsxs("span", {
							className: `gbb__mask${!(m & m << 1) ? "" : " bad"}`,
							children: [
								"行",
								r + 1,
								":",
								" ",
								/* @__PURE__ */ jsx("b", { children: Array.from({ length: N }, (_, k) => m >> N - 1 - k & 1).join("") })
							]
						}, r))
					})]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "gbb__panel",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "gbb__count",
						children: [/* @__PURE__ */ jsx("b", {
							className: win ? "gbb__grad" : hasConflict ? "gbb__bad" : "",
							children: placed
						}), /* @__PURE__ */ jsxs("span", { children: ["已放王 / 目标 ", K] })]
					}),
					/* @__PURE__ */ jsx("div", {
						className: `gbb__feedback ${fbClass}`,
						children: feedback
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "gbb__hint",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "gbb__hint-k",
								children: "判定原理"
							}),
							"同一行用 ",
							/* @__PURE__ */ jsx("code", { children: "x&(x<<1)" }),
							" 查横向相邻；相邻两行用 ",
							/* @__PURE__ */ jsx("code", { children: "x&y" }),
							"、",
							/* @__PURE__ */ jsx("code", { children: "x&(y<<1)" }),
							"、",
							/* @__PURE__ */ jsx("code", { children: "x&(y>>1)" }),
							" 查上下 / 斜角冲突——红色王就是这些位运算查出的攻击对。"
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "gbb__actions",
						children: [/* @__PURE__ */ jsxs("button", {
							className: "gbb__btn",
							onClick: clear,
							children: [/* @__PURE__ */ jsx(RotateCcw, { size: 16 }), " 清空"]
						}), /* @__PURE__ */ jsxs("button", {
							className: "gbb__btn gbb__btn--primary",
							onClick: reveal,
							children: [/* @__PURE__ */ jsx(Sigma, { size: 16 }), " 看方案总数"]
						})]
					}),
					revealed && totalShown != null && /* @__PURE__ */ jsxs("div", {
						className: "gbb__reveal",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "gbb__reveal-row",
							children: [/* @__PURE__ */ jsx(Trophy, { size: 15 }), /* @__PURE__ */ jsxs("span", { children: [
								N,
								"×",
								N,
								" 放 ",
								K,
								" 个互不攻击的王，合法布局共",
								" ",
								/* @__PURE__ */ jsx("b", { children: totalShown }),
								" 种。"
							] })]
						}), /* @__PURE__ */ jsxs("div", {
							className: "gbb__reveal-tip",
							children: [
								"你找到的是其中 ",
								/* @__PURE__ */ jsx("b", { children: "1" }),
								" 种；状压 DP 一次数清了全部 ",
								totalShown,
								" 种——这正是「找一个解」和「数所有解」的差别。"
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "gbb__stats",
						children: [
							"已玩 ",
							round.stats.played,
							" 局 · 已完成布局 ",
							round.stats.matched,
							" 次"
						]
					})
				]
			})]
		})]
	});
}
//#endregion
export { BitBoardGame as default };
