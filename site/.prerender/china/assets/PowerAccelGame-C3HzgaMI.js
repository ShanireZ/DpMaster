import { n as playGameTone, t as useRoundStats } from "./useRoundStats-CJJWDPot.js";
import { n as createSeededRandom, r as randomInt, t as useRoundSeed } from "./useRoundSeed-gEA7j6AH.js";
/* empty css              */
import { useLayoutEffect, useMemo, useState } from "react";
import { RotateCcw, Shuffle, Sparkles, Trophy, Undo2, Volume2, VolumeX, Zap } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/games/PowerAccelGame.tsx
var DIFFS = {
	easy: {
		label: "简单",
		nMin: 6,
		nMax: 16
	},
	medium: {
		label: "中等",
		nMin: 18,
		nMax: 50
	},
	hard: {
		label: "困难",
		nMin: 60,
		nMax: 200
	}
};
var DIFF_ORDER = [
	"easy",
	"medium",
	"hard"
];
function fastPowSteps(n) {
	if (n <= 1) return 0;
	const log2 = Math.floor(Math.log2(n));
	let pc = 0;
	let x = n;
	while (x > 0) {
		pc += x & 1;
		x >>= 1;
	}
	return log2 + pc - 1;
}
function bruteSteps(n) {
	return Math.max(0, n - 1);
}
function buildExponentRound(difficulty, random) {
	const d = DIFFS[difficulty];
	return randomInt(random, d.nMin, d.nMax);
}
function PowerAccelGame() {
	const [difficulty, setDifficulty] = useState("medium");
	const roundSeed = useRoundSeed();
	const [target, setTarget] = useState(() => buildExponentRound("medium", createSeededRandom(roundSeed.seed)));
	const [steps, setSteps] = useState([]);
	const [picks, setPicks] = useState([]);
	const [revealed, setRevealed] = useState(false);
	const [muted, setMuted] = useState(false);
	const round = useRoundStats();
	const startRound = round.start;
	useLayoutEffect(() => {
		setTarget(buildExponentRound(difficulty, createSeededRandom(roundSeed.seed)));
		setSteps([]);
		setPicks([]);
		setRevealed(false);
		startRound();
	}, [
		difficulty,
		roundSeed,
		startRound
	]);
	const reachedList = useMemo(() => {
		const seen = /* @__PURE__ */ new Set([1]);
		const out = [1];
		for (const s of steps) if (!seen.has(s.r)) {
			seen.add(s.r);
			out.push(s.r);
		}
		return out;
	}, [steps]);
	const reachedSet = useMemo(() => new Set(reachedList), [reachedList]);
	const fast = fastPowSteps(target);
	const brute = bruteSteps(target);
	const used = steps.length;
	const done = reachedSet.has(target);
	const atOrBeatFast = done && used <= fast;
	const beatFast = done && used < fast;
	const tieFast = done && used === fast;
	const pick = (e) => {
		if (done) return;
		setRevealed(false);
		setPicks((p) => {
			const idx = p.indexOf(e);
			if (idx >= 0) {
				playGameTone({
					frequency: 300,
					duration: .05,
					type: "sine"
				}, muted);
				return p.filter((_, k) => k !== idx);
			}
			if (p.length >= 2) return p;
			playGameTone({ frequency: 440 + e * 3 }, muted);
			return [...p, e];
		});
	};
	const doDouble = () => {
		if (done || picks.length !== 1) return;
		const a = picks[0];
		const r = a + a;
		playGameTone({
			frequency: 620,
			duration: .1
		}, muted);
		setSteps((s) => [...s, {
			a,
			b: a,
			r,
			kind: "double"
		}]);
		setPicks([]);
		setRevealed(false);
	};
	const doAdd = () => {
		if (done || picks.length !== 2) return;
		const [a, b] = picks;
		const r = a + b;
		playGameTone({
			frequency: 560,
			duration: .1
		}, muted);
		setSteps((s) => [...s, {
			a,
			b,
			r,
			kind: "add"
		}]);
		setPicks([]);
		setRevealed(false);
	};
	const undo = () => {
		if (steps.length === 0) return;
		playGameTone({
			frequency: 340,
			duration: .06,
			type: "sine"
		}, muted);
		setSteps((s) => s.slice(0, -1));
		setPicks([]);
		setRevealed(false);
	};
	const resetChain = () => {
		playGameTone({
			frequency: 330,
			duration: .06,
			type: "sine"
		}, muted);
		setSteps([]);
		setPicks([]);
		setRevealed(false);
		round.start();
	};
	const reveal = () => {
		setRevealed(true);
		const beat = done && used <= fast;
		round.record(beat);
		if (beat) {
			playGameTone({
				frequency: 523,
				duration: .12
			}, muted);
			setTimeout(() => playGameTone({
				frequency: 784,
				duration: .16
			}, muted), 110);
		} else playGameTone({
			frequency: 300,
			duration: .1,
			type: "sine"
		}, muted);
	};
	const shuffle = () => {
		roundSeed.next();
		playGameTone({
			frequency: 360,
			duration: .06
		}, muted);
	};
	const pickDiff = (d) => {
		if (d === difficulty) return;
		setDifficulty(d);
		playGameTone({
			frequency: 420,
			duration: .06
		}, muted);
	};
	let feedback = `从指数 1 出发，把已有指数「翻倍」或「相乘（相加）」，用最少步数拼出 x^${target}。`;
	let fbClass = "";
	if (done) if (used < fast) {
		feedback = `超越快速幂！你只用 ${used} 步得到 x^${target}，比快速幂基线（${fast} 步）还少。`;
		fbClass = "win";
	} else if (used === fast) {
		feedback = `追平快速幂！你用 ${used} 步得到 x^${target}（正好等于快速幂基线 ${fast} 步）。`;
		fbClass = "win";
	} else feedback = `到达 x^${target}，用了 ${used} 步。快速幂只要 ${fast} 步——试试更少的路线（可撤销）。`;
	else if (revealed) feedback = `还没拼到 x^${target}。快速幂基线 ${fast} 步、暴力 ${brute} 步——继续合成。`;
	const youMore = done && used > fast;
	return /* @__PURE__ */ jsxs("div", {
		className: "game",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "game__head",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "game__title",
					children: [/* @__PURE__ */ jsx(Zap, { size: 18 }), " 幂次加速器"]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "game__sub",
					children: "用最少乘法算出 x^n——你能追平快速幂吗？"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "game__diff",
					role: "group",
					"aria-label": "难度",
					children: DIFF_ORDER.map((d) => /* @__PURE__ */ jsx("button", {
						className: `game__diff-pill${d === difficulty ? " on" : ""}`,
						onClick: () => pickDiff(d),
						"aria-pressed": d === difficulty,
						children: DIFFS[d].label
					}, d))
				}),
				/* @__PURE__ */ jsx("button", {
					className: "icon-btn",
					style: {
						width: 34,
						height: 34
					},
					onClick: () => setMuted((m) => !m),
					"aria-label": "静音",
					children: muted ? /* @__PURE__ */ jsx(VolumeX, { size: 16 }) : /* @__PURE__ */ jsx(Volume2, { size: 16 })
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "game__body",
			children: [/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "gpw__target-card",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "gpw__target-lab",
							children: "目标幂次"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "gpw__target-n",
							children: ["x", /* @__PURE__ */ jsx("sup", { children: target })]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "gpw__target-hint",
							children: "选两个指数点「相乘」，或选一个点「翻倍」"
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "game__shelf-label",
					children: "已得指数（点击选中来合成）"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "gpw__chips",
					children: reachedList.map((e) => {
						const on = picks.includes(e);
						const isTarget = e === target;
						return /* @__PURE__ */ jsxs("button", {
							className: `gpw__chip${on ? " on" : ""}${isTarget ? " target" : ""}`,
							onClick: () => pick(e),
							disabled: done,
							"aria-pressed": on,
							children: [
								isTarget && /* @__PURE__ */ jsx("span", {
									className: "gpw__chip-star",
									children: /* @__PURE__ */ jsx(Sparkles, { size: 13 })
								}),
								/* @__PURE__ */ jsx("span", {
									className: "gpw__chip-x",
									children: "x"
								}),
								/* @__PURE__ */ jsx("sup", { children: e })
							]
						}, e);
					})
				}),
				steps.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
					className: "game__shelf-label gpw__log-label",
					children: "合成过程"
				}), /* @__PURE__ */ jsx("ol", {
					className: "gpw__log",
					children: steps.map((s, i) => /* @__PURE__ */ jsxs("li", {
						className: "gpw__log-row",
						children: [/* @__PURE__ */ jsx("span", {
							className: "gpw__log-idx",
							children: i + 1
						}), s.kind === "double" ? /* @__PURE__ */ jsxs("span", { children: [
							"翻倍：x",
							/* @__PURE__ */ jsx("sup", { children: s.a }),
							" 平方 → x",
							/* @__PURE__ */ jsx("sup", { children: s.r })
						] }) : /* @__PURE__ */ jsxs("span", { children: [
							"相乘：x",
							/* @__PURE__ */ jsx("sup", { children: s.a }),
							" × x",
							/* @__PURE__ */ jsx("sup", { children: s.b }),
							" → x",
							/* @__PURE__ */ jsx("sup", { children: s.r })
						] })]
					}, i))
				})] })
			] }), /* @__PURE__ */ jsxs("div", {
				className: "game__panel",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "game__value",
						children: [/* @__PURE__ */ jsx("b", {
							className: atOrBeatFast ? "grad-text" : "",
							children: used
						}), /* @__PURE__ */ jsx("span", { children: "你的步数" })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "gpw__ops",
						children: [/* @__PURE__ */ jsx("button", {
							className: "gbtn",
							onClick: doDouble,
							disabled: done || picks.length !== 1,
							title: "选中 1 个指数：平方（指数 ×2）",
							children: "翻倍 (平方)"
						}), /* @__PURE__ */ jsx("button", {
							className: "gbtn",
							onClick: doAdd,
							disabled: done || picks.length !== 2,
							title: "选中 2 个指数：相乘（指数相加）",
							children: "相乘 (×)"
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "gpw__picks",
						children: picks.length === 0 ? "未选中指数" : picks.length === 1 ? `已选 x^${picks[0]}——再选一个可相乘，或直接翻倍` : `已选 x^${picks[0]} 与 x^${picks[1]}——点相乘`
					}),
					/* @__PURE__ */ jsx("div", {
						className: `game__feedback ${fbClass}`,
						children: feedback
					}),
					revealed && /* @__PURE__ */ jsxs("div", {
						className: "game__compare",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "game__compare-row",
							children: [
								/* @__PURE__ */ jsxs("span", {
									className: "game__cmp game__cmp--greedy",
									children: [
										"暴力",
										/* @__PURE__ */ jsx("span", {
											className: "game__cmp-note",
											children: "（逐个乘）"
										}),
										/* @__PURE__ */ jsx("b", { children: brute })
									]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "game__cmp game__cmp--you",
									children: ["你 ", /* @__PURE__ */ jsx("b", { children: done ? used : "—" })]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "game__cmp game__cmp--dp",
									children: ["快速幂 ", /* @__PURE__ */ jsx("b", { children: fast })]
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "game__compare-tip",
							children: [
								"快速幂（二进制）是易得的高效基线：约 ⌊log₂n⌋+popcount(n)−1 步。",
								youMore ? "你比它多几步，还能再压。" : "",
								beatFast ? "你比这条基线还少——漂亮！" : "",
								tieFast ? "你已追平这条基线——漂亮！" : "",
								" ",
								"真正的最少乘法（最短加法链）是难题，用快速幂当可达上界即可。"
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "gpw__manage",
						children: [/* @__PURE__ */ jsxs("button", {
							className: "gbtn",
							onClick: undo,
							disabled: steps.length === 0,
							children: [/* @__PURE__ */ jsx(Undo2, { size: 16 }), " 撤销"]
						}), /* @__PURE__ */ jsxs("button", {
							className: "gbtn",
							onClick: resetChain,
							disabled: steps.length === 0,
							children: [/* @__PURE__ */ jsx(RotateCcw, { size: 16 }), " 重来"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "game__actions",
						children: [/* @__PURE__ */ jsxs("button", {
							className: "gbtn",
							onClick: shuffle,
							children: [/* @__PURE__ */ jsx(Shuffle, { size: 16 }), " 换一批"]
						}), /* @__PURE__ */ jsxs("button", {
							className: "gbtn gbtn--primary",
							onClick: reveal,
							children: [/* @__PURE__ */ jsx(Trophy, { size: 16 }), " 核对效率基线"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "game__stats",
						children: [/* @__PURE__ */ jsxs("span", { children: [
							"已玩 ",
							round.stats.played,
							" 局 · 达到 / 超越快速幂 ",
							round.stats.matched,
							" 次 · 种子 ",
							roundSeed.seed
						] }), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "gbtn",
							onClick: () => roundSeed.replay(roundSeed.seed),
							children: "重放此种子"
						})]
					})
				]
			})]
		})]
	});
}
//#endregion
export { buildExponentRound, PowerAccelGame as default };
