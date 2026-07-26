import { n as playGameTone, t as useRoundStats } from "./useRoundStats-CJJWDPot.js";
import { n as createSeededRandom, r as randomInt, t as useRoundSeed } from "./useRoundSeed-gEA7j6AH.js";
/* empty css              */
import { t as solveStoneMerge } from "./stone-merge-Yx6UFvnL.js";
import { useLayoutEffect, useMemo, useState } from "react";
import { Layers, RotateCcw, Shuffle, Trophy, Undo2, Volume2, VolumeX } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/games/StoneMergeGame.tsx
var DIFFS = {
	easy: {
		label: "简单",
		count: 4,
		vMin: 3,
		vRange: 8
	},
	medium: {
		label: "中等",
		count: 5,
		vMin: 3,
		vRange: 12
	},
	hard: {
		label: "困难",
		count: 6,
		vMin: 4,
		vRange: 16
	}
};
var DIFF_ORDER = [
	"easy",
	"medium",
	"hard"
];
/**
* 贪心基线（相邻版哈夫曼）：反复挑「相邻两堆之和最小」的一对合并，累加代价。
* 只受相邻约束——它常常不是最优，正好和 DP 拉开差距。返回贪心总代价。
*/
function solveGreedy(a) {
	let heaps = a.slice();
	let cost = 0;
	while (heaps.length > 1) {
		let bi = 0;
		let bv = Infinity;
		for (let i = 0; i < heaps.length - 1; i++) {
			const s = heaps[i] + heaps[i + 1];
			if (s < bv) {
				bv = s;
				bi = i;
			}
		}
		cost += bv;
		heaps = [
			...heaps.slice(0, bi),
			bv,
			...heaps.slice(bi + 2)
		];
	}
	return cost;
}
function buildStoneRound(difficulty, random) {
	const d = DIFFS[difficulty];
	return Array.from({ length: d.count }, () => randomInt(random, d.vMin, d.vMin + d.vRange - 1));
}
function StoneMergeGame() {
	const [difficulty, setDifficulty] = useState("medium");
	const roundSeed = useRoundSeed();
	const [init] = useState(() => buildStoneRound("medium", createSeededRandom(roundSeed.seed)));
	const [stones, setStones] = useState(init);
	const [heaps, setHeaps] = useState(() => init.map((v, i) => ({
		value: v,
		src: [i]
	})));
	const [cost, setCost] = useState(0);
	const [history, setHistory] = useState([]);
	const [firstSel, setFirstSel] = useState(null);
	const [revealed, setRevealed] = useState(false);
	const [muted, setMuted] = useState(false);
	const round = useRoundStats();
	const startRound = round.start;
	const dpMin = useMemo(() => solveStoneMerge(stones, "min").cost, [stones]);
	const greedy = useMemo(() => solveGreedy(stones), [stones]);
	const done = heaps.length === 1;
	const win = revealed && done && cost === dpMin;
	const greedyWorse = greedy > dpMin;
	const resetWith = (arr) => {
		setStones(arr);
		setHeaps(arr.map((v, i) => ({
			value: v,
			src: [i]
		})));
		setCost(0);
		setHistory([]);
		setFirstSel(null);
		setRevealed(false);
	};
	useLayoutEffect(() => {
		resetWith(buildStoneRound(difficulty, createSeededRandom(roundSeed.seed)));
		startRound();
	}, [
		difficulty,
		roundSeed,
		startRound
	]);
	const clickHeap = (i) => {
		if (revealed || done) return;
		if (firstSel === null) {
			setFirstSel(i);
			playGameTone({ frequency: 430 + i * 40 }, muted);
			return;
		}
		if (i === firstSel) {
			setFirstSel(null);
			playGameTone({
				frequency: 300,
				duration: .06,
				type: "sine"
			}, muted);
			return;
		}
		if (Math.abs(i - firstSel) === 1) {
			const lo = Math.min(i, firstSel);
			const a = heaps[lo];
			const b = heaps[lo + 1];
			const mergedValue = a.value + b.value;
			const merged = {
				value: mergedValue,
				src: [...a.src, ...b.src]
			};
			setHistory((h) => [...h, {
				heaps: heaps.slice(),
				cost,
				mergedValue
			}]);
			setHeaps((hs) => [
				...hs.slice(0, lo),
				merged,
				...hs.slice(lo + 2)
			]);
			setCost((c) => c + mergedValue);
			setFirstSel(null);
			playGameTone({
				frequency: 360 + Math.min(mergedValue * 4, 520),
				duration: .11
			}, muted);
		} else {
			setFirstSel(i);
			playGameTone({
				frequency: 220,
				duration: .07,
				type: "sine"
			}, muted);
		}
	};
	const undo = () => {
		if (history.length === 0 || revealed) return;
		const last = history[history.length - 1];
		setHeaps(last.heaps);
		setCost(last.cost);
		setHistory((h) => h.slice(0, -1));
		setFirstSel(null);
		playGameTone({
			frequency: 300,
			duration: .07,
			type: "sine"
		}, muted);
	};
	const restart = () => {
		resetWith(stones);
		round.start();
		playGameTone({
			frequency: 320,
			duration: .06,
			type: "sine"
		}, muted);
	};
	const reveal = () => {
		setRevealed(true);
		const w = done && cost === dpMin;
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
	let feedback = "点两堆相邻石子把它们并成一堆，代价 = 两堆之和，累加到总代价。并到只剩一堆，看能否追平 DP 的最小总代价。";
	let fbClass = "";
	if (firstSel !== null && !done) feedback = `已选中第 ${firstSel + 1} 堆（值 ${heaps[firstSel].value}）——再点它左边或右边相邻的一堆完成合并。`;
	if (win) {
		feedback = `正确！你的总代价 ${cost}，达到了 DP 求得的最小合并代价。其它达到同一总代价的合法合并顺序也同样正确。`;
		fbClass = "win";
	} else if (revealed) feedback = done ? `DP 最小是 ${dpMin}，你的总代价 ${cost}，还差 ${cost - dpMin}。合并顺序不同，总代价就不同——这正是区间 DP 要解决的。` : `还没并完（剩 ${heaps.length} 堆）。DP 最小合并代价是 ${dpMin}，把石子并到只剩一堆再来对照吧。`;
	else if (done) feedback = `并完了！你的总代价 ${cost}。核对一下它是否已经达到最小值。`;
	return /* @__PURE__ */ jsxs("div", {
		className: "game",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "game__head",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "game__title",
					children: [/* @__PURE__ */ jsx(Layers, { size: 18 }), " 合并石子"]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "game__sub",
					children: "手选合并顺序——总代价能压到 DP 最小吗？"
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
			className: "game__body gsm__body",
			children: [/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "game__shelf-label",
					children: [
						"石子（点相邻两堆合并 · ",
						done ? "已并成一堆" : `剩 ${heaps.length} 堆`,
						"）"
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "gsm__row",
					children: heaps.map((h, i) => {
						const selected = firstSel === i;
						const adjacent = firstSel !== null && !selected && Math.abs(i - firstSel) === 1;
						return /* @__PURE__ */ jsxs("button", {
							className: [
								"gsm__stone",
								selected ? "sel" : "",
								adjacent ? "adj" : "",
								h.src.length > 1 ? "merged" : ""
							].filter(Boolean).join(" "),
							onClick: () => clickHeap(i),
							"aria-pressed": selected,
							disabled: revealed || done,
							children: [/* @__PURE__ */ jsx("span", {
								className: "gsm__val",
								children: h.value
							}), /* @__PURE__ */ jsx("span", {
								className: "gsm__src",
								children: h.src.length > 1 ? `${h.src.length} 颗` : `第 ${h.src[0] + 1} 颗`
							})]
						}, i);
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "gsm__origin",
					"aria-label": "原始石子",
					children: [/* @__PURE__ */ jsx("span", {
						className: "gsm__origin-label",
						children: "原始"
					}), stones.map((v, i) => /* @__PURE__ */ jsx("span", {
						className: "gsm__origin-chip",
						children: v
					}, i))]
				})
			] }), /* @__PURE__ */ jsxs("div", {
				className: "game__panel",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "game__value",
						children: [/* @__PURE__ */ jsx("b", {
							className: win ? "grad-text" : "",
							children: cost
						}), /* @__PURE__ */ jsx("span", { children: "已累计代价" })]
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
												children: "（每次并最小相邻两堆）"
											}),
											/* @__PURE__ */ jsx("b", { children: greedy })
										]
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "game__cmp game__cmp--you",
										children: ["你 ", /* @__PURE__ */ jsx("b", { children: cost })]
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "game__cmp game__cmp--dp",
										children: ["DP 最小 ", /* @__PURE__ */ jsx("b", { children: dpMin })]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "game__compare-tip",
								children: ["本题越小越好。", greedyWorse ? "注意贪心（总挑最小相邻两堆）在这组也没压到最小——因为只能并相邻堆，此刻并哪对取决于全局，这正是要用区间 DP 的原因。" : "这组贪心恰好也达到了最小，但它未必总是最优——只能并相邻堆时，最优要靠区间 DP 枚举所有断点。"]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "game__compare-tip",
								children: "系统只比较合并是否合法以及总代价是否最小，不要求使用某一条固定合并顺序。"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "game__actions",
						children: [/* @__PURE__ */ jsxs("button", {
							className: "gbtn",
							onClick: undo,
							disabled: history.length === 0 || revealed,
							children: [/* @__PURE__ */ jsx(Undo2, { size: 16 }), " 撤销一步"]
						}), /* @__PURE__ */ jsxs("button", {
							className: "gbtn",
							onClick: restart,
							disabled: history.length === 0 || revealed,
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
							children: [/* @__PURE__ */ jsx(Trophy, { size: 16 }), " 核对最小值"]
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
export { buildStoneRound, StoneMergeGame as default };
