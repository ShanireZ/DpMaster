import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
import { n as playGameTone, t as useRoundStats } from "./useRoundStats-CJJWDPot.js";
import { n as createSeededRandom, r as randomInt, t as useRoundSeed } from "./useRoundSeed-gEA7j6AH.js";
/* empty css              */
import { t as executeZeroOneKnapsack } from "./internal-VjiERoSM.js";
import { useLayoutEffect, useMemo, useState } from "react";
import { Package, Shuffle, Sparkles, Trophy, Volume2, VolumeX } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/knapsack/index.ts
function solveZeroOneKnapsack(items, capacity) {
	return executeZeroOneKnapsack(items, capacity, ignoreEvents);
}
//#endregion
//#region src/components/games/PackMasterGame.tsx
var DIFFS = {
	easy: {
		label: "简单",
		count: 4,
		wMin: 2,
		wRange: 4,
		vMin: 3,
		vRange: 7,
		capRatio: .5
	},
	medium: {
		label: "中等",
		count: 5,
		wMin: 2,
		wRange: 6,
		vMin: 3,
		vRange: 10,
		capRatio: .5
	},
	hard: {
		label: "困难",
		count: 6,
		wMin: 3,
		wRange: 7,
		vMin: 4,
		vRange: 15,
		capRatio: .45
	}
};
var DIFF_ORDER = [
	"easy",
	"medium",
	"hard"
];
function solveGreedy(items, cap) {
	const order = items.map((_, i) => i).sort((a, b) => items[b].v / items[b].w - items[a].v / items[a].w);
	const pick = Array(items.length).fill(false);
	let load = 0;
	let value = 0;
	for (const i of order) if (load + items[i].w <= cap) {
		pick[i] = true;
		load += items[i].w;
		value += items[i].v;
	}
	return {
		value,
		pick
	};
}
function buildPackRound(difficulty, random) {
	const d = DIFFS[difficulty];
	const items = Array.from({ length: d.count }, () => ({
		w: randomInt(random, d.wMin, d.wMin + d.wRange - 1),
		v: randomInt(random, d.vMin, d.vMin + d.vRange - 1)
	}));
	const totalW = items.reduce((s, it) => s + it.w, 0);
	return {
		items,
		cap: Math.max(6, Math.round(totalW * d.capRatio))
	};
}
function PackMasterGame() {
	const [difficulty, setDifficulty] = useState("medium");
	const roundSeed = useRoundSeed();
	const [game, setGame] = useState(() => buildPackRound("medium", createSeededRandom(roundSeed.seed)));
	const [sel, setSel] = useState(() => game.items.map(() => false));
	const [revealed, setRevealed] = useState(false);
	const [muted, setMuted] = useState(false);
	const round = useRoundStats();
	const startRound = round.start;
	useLayoutEffect(() => {
		const nextGame = buildPackRound(difficulty, createSeededRandom(roundSeed.seed));
		setGame(nextGame);
		setSel(nextGame.items.map(() => false));
		setRevealed(false);
		startRound();
	}, [
		difficulty,
		roundSeed,
		startRound
	]);
	const opt = useMemo(() => solveZeroOneKnapsack(game.items, game.cap), [game]);
	const greedy = useMemo(() => solveGreedy(game.items, game.cap), [game]);
	const curW = game.items.reduce((s, it, i) => s + (sel[i] ? it.w : 0), 0);
	const curV = game.items.reduce((s, it, i) => s + (sel[i] ? it.v : 0), 0);
	const over = curW > game.cap;
	const win = !over && revealed && curV === opt.value;
	const sameAsReference = sel.every((picked, index) => picked === opt.pick[index]);
	const greedyBeaten = greedy.value < opt.value;
	const toggle = (i) => {
		playGameTone({ frequency: 440 + i * 55 }, muted);
		setSel((s) => s.map((x, k) => k === i ? !x : x));
		setRevealed(false);
	};
	const reveal = () => {
		setRevealed(true);
		const w = !over && curV === opt.value;
		round.record(w);
		if (w) {
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
	let feedback = "点物品放进背包，凑出你认为最大的总价值，再核对最优值。";
	let fbClass = "";
	if (over) {
		feedback = `超重了！当前 ${curW} > 容量 ${game.cap}，先卸下点东西。`;
		fbClass = "over";
	} else if (win) {
		feedback = sameAsReference ? `正确！你找到了一组价值为 ${opt.value} 的最优取法。` : `正确！你找到了另一组价值同为 ${opt.value} 的最优取法，不必和星标方案相同。`;
		fbClass = "win";
	} else if (revealed) feedback = `最优价值是 ${opt.value}，你现在 ${curV}，还差 ${opt.value - curV}。星标方案只是参考最优解之一。`;
	return /* @__PURE__ */ jsxs("div", {
		className: "game",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "game__head",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "game__title",
					children: [/* @__PURE__ */ jsx(Package, { size: 18 }), " 装包大师"]
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "game__sub",
					children: [
						"容量 ",
						game.cap,
						"——凭直觉挑，能追平 DP 吗？"
					]
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
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "game__shelf-label",
				children: "货架（点击放入 / 取出）"
			}), /* @__PURE__ */ jsx("div", {
				className: "game__items",
				children: game.items.map((it, i) => /* @__PURE__ */ jsxs("button", {
					className: `gitem${sel[i] ? " in" : ""}`,
					onClick: () => toggle(i),
					children: [
						revealed && opt.pick[i] && /* @__PURE__ */ jsx("span", {
							className: "gitem__star",
							children: /* @__PURE__ */ jsx(Sparkles, { size: 16 })
						}),
						/* @__PURE__ */ jsx("div", {
							className: "gitem__v",
							children: it.v
						}),
						/* @__PURE__ */ jsx("div", {
							className: "gitem__vlab",
							children: "价值"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "gitem__w",
							children: ["重 ", it.w]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "gitem__ratio",
							children: ["性价比 ", (it.v / it.w).toFixed(1)]
						})
					]
				}, i))
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "game__panel",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "gauge__row",
						children: [/* @__PURE__ */ jsxs("span", { children: [
							"背包 ",
							curW,
							"/",
							game.cap
						] }), /* @__PURE__ */ jsx("span", { children: over ? "超重" : "" })]
					}), /* @__PURE__ */ jsx("div", {
						className: "gauge",
						children: /* @__PURE__ */ jsx("div", {
							className: `gauge__fill${over ? " over" : ""}`,
							style: { width: `${Math.min(100, curW / game.cap * 100)}%` }
						})
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "game__value",
						children: [/* @__PURE__ */ jsx("b", {
							className: win ? "grad-text" : "",
							children: curV
						}), /* @__PURE__ */ jsx("span", { children: "当前总价值" })]
					}),
					/* @__PURE__ */ jsx("div", {
						className: `game__feedback ${fbClass}`,
						children: feedback
					}),
					revealed && /* @__PURE__ */ jsxs("div", {
						className: "game__compare",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "game__compare-row",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "game__cmp game__cmp--greedy",
										children: [
											"贪心",
											/* @__PURE__ */ jsx("span", {
												className: "game__cmp-note",
												children: "（按性价比）"
											}),
											/* @__PURE__ */ jsx("b", { children: greedy.value })
										]
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "game__cmp game__cmp--you",
										children: ["你 ", /* @__PURE__ */ jsx("b", { children: curV })]
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "game__cmp game__cmp--dp",
										children: ["DP 最优 ", /* @__PURE__ */ jsx("b", { children: opt.value })]
									})
								]
							}),
							greedyBeaten && /* @__PURE__ */ jsx("div", {
								className: "game__compare-tip",
								children: "贪心不是最优——这正是要用 DP 的原因。"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "game__compare-tip",
								children: "星标只展示参考最优解之一。系统按容量合法性和总价值判定，不要求你的选法与星标一致。"
							})
						]
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
							children: [/* @__PURE__ */ jsx(Trophy, { size: 16 }), " 核对最优值"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "game__stats",
						children: [/* @__PURE__ */ jsxs("span", { children: [
							"已玩 ",
							round.stats.played,
							" 局 · 追平 DP ",
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
export { buildPackRound, PackMasterGame as default };
