import { n as playGameTone, t as useRoundStats } from "./useRoundStats-CJJWDPot.js";
import { t as solveLis } from "./lis-3svrgd26.js";
import { n as createSeededRandom, r as randomInt, t as useRoundSeed } from "./useRoundSeed-gEA7j6AH.js";
/* empty css              */
import { useLayoutEffect, useMemo, useState } from "react";
import { RotateCcw, Shuffle, Sparkles, TrendingUp, Trophy, Volume2, VolumeX } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/games/LISChainGame.tsx
var DIFFS = {
	easy: {
		label: "简单",
		count: 8,
		vMin: 1,
		vRange: 20
	},
	medium: {
		label: "中等",
		count: 11,
		vMin: 1,
		vRange: 30
	},
	hard: {
		label: "困难",
		count: 14,
		vMin: 1,
		vRange: 40
	}
};
var DIFF_ORDER = [
	"easy",
	"medium",
	"hard"
];
function chainLen(selOrder) {
	return selOrder.length;
}
function buildSequenceRound(difficulty, random) {
	const d = DIFFS[difficulty];
	const seq = Array.from({ length: d.count }, () => randomInt(random, d.vMin, d.vMin + d.vRange - 1));
	if (solveLis(seq).length < 3) return buildSequenceRound(difficulty, random);
	return seq;
}
function LISChainGame() {
	const [difficulty, setDifficulty] = useState("medium");
	const roundSeed = useRoundSeed();
	const [seq, setSeq] = useState(() => buildSequenceRound("medium", createSeededRandom(roundSeed.seed)));
	const [selOrder, setSelOrder] = useState([]);
	const [revealed, setRevealed] = useState(false);
	const [muted, setMuted] = useState(false);
	const round = useRoundStats();
	const startRound = round.start;
	useLayoutEffect(() => {
		setSeq(buildSequenceRound(difficulty, createSeededRandom(roundSeed.seed)));
		setSelOrder([]);
		setRevealed(false);
		startRound();
	}, [
		difficulty,
		roundSeed,
		startRound
	]);
	const dp = useMemo(() => solveLis(seq), [seq]);
	const you = chainLen(selOrder);
	const win = revealed && you === dp.length && you > 0;
	const sameAsReference = dp.pick.every((picked, index) => picked === selOrder.includes(index));
	const rank = useMemo(() => {
		const r = Array(seq.length).fill(0);
		selOrder.forEach((idx, k) => r[idx] = k + 1);
		return r;
	}, [selOrder, seq.length]);
	const lastVal = selOrder.length ? seq[selOrder[selOrder.length - 1]] : -Infinity;
	const lastIdx = selOrder.length ? selOrder[selOrder.length - 1] : -1;
	const canPick = (i) => !revealed && i > lastIdx && seq[i] > lastVal;
	const clickCard = (i) => {
		if (revealed) return;
		const pos = selOrder.indexOf(i);
		if (pos !== -1) {
			playGameTone({
				frequency: 320,
				duration: .07,
				type: "sine"
			}, muted);
			setSelOrder((s) => s.slice(0, pos));
			return;
		}
		if (!canPick(i)) {
			playGameTone({
				frequency: 180,
				duration: .08,
				type: "sine"
			}, muted);
			return;
		}
		playGameTone({ frequency: 460 + selOrder.length * 60 }, muted);
		setSelOrder((s) => [...s, i]);
	};
	const resetChain = () => {
		setSelOrder([]);
		playGameTone({
			frequency: 300,
			duration: .06,
			type: "sine"
		}, muted);
	};
	const reveal = () => {
		setRevealed(true);
		const w = you === dp.length && you > 0;
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
	let feedback = "从左到右依次点数字，接出一条尽量长的严格上升子序列（后一个要比前一个大），再核对最长长度。";
	let fbClass = "";
	if (win) {
		feedback = sameAsReference ? `正确！你接出了一条长度为 ${you} 的最长上升子序列。` : `正确！你接出了另一条长度同为 ${you} 的最长上升子序列，不必和星标方案相同。`;
		fbClass = "win";
	} else if (revealed) feedback = you < dp.length ? `最长长度是 ${dp.length}，你接出了 ${you}，还差 ${dp.length - you}。星标方案只是参考最长链之一。` : `最长长度是 ${dp.length}。星标方案只是参考最长链之一。`;
	else if (selOrder.length) feedback = `已接 ${you} 个：${selOrder.map((i) => seq[i]).join(" → ")}。还能往后接更大的数吗？`;
	return /* @__PURE__ */ jsxs("div", {
		className: "game",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "game__head",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "game__title",
					children: [/* @__PURE__ */ jsx(TrendingUp, { size: 18 }), " LIS 接龙"]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "game__sub",
					children: "手挑一条最长上升子序列——能追平 DP 吗？"
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
			className: "game__body glis__body",
			children: [/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx("div", {
					className: "game__shelf-label",
					children: "数列（按原序点击接龙 · 点已选的可回退到该处）"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "glis__row",
					children: seq.map((v, i) => {
						const picked = rank[i] > 0;
						const star = revealed && dp.pick[i];
						const selectable = canPick(i);
						return /* @__PURE__ */ jsxs("button", {
							className: [
								"glis__cell",
								picked ? "picked" : "",
								star ? "opt" : "",
								!picked && !selectable && !revealed ? "blocked" : ""
							].filter(Boolean).join(" "),
							onClick: () => clickCard(i),
							"aria-pressed": picked,
							children: [
								star && /* @__PURE__ */ jsx("span", {
									className: "glis__star",
									children: /* @__PURE__ */ jsx(Sparkles, { size: 14 })
								}),
								picked && /* @__PURE__ */ jsx("span", {
									className: "glis__rank",
									children: rank[i]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "glis__val",
									children: v
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "glis__pos",
									children: ["#", i + 1]
								})
							]
						}, i);
					})
				}),
				selOrder.length > 0 && /* @__PURE__ */ jsxs("div", {
					className: "glis__chain",
					"aria-label": "你的链",
					children: [/* @__PURE__ */ jsx("span", {
						className: "glis__chain-label",
						children: "你的链"
					}), selOrder.map((idx, k) => /* @__PURE__ */ jsxs("span", {
						className: "glis__chip",
						children: [k > 0 && /* @__PURE__ */ jsx("span", {
							className: "glis__arrow",
							children: "→"
						}), seq[idx]]
					}, idx))]
				})
			] }), /* @__PURE__ */ jsxs("div", {
				className: "game__panel",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "game__value",
						children: [/* @__PURE__ */ jsx("b", {
							className: win ? "grad-text" : "",
							children: you
						}), /* @__PURE__ */ jsx("span", { children: "当前链长度" })]
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
								children: [/* @__PURE__ */ jsxs("span", {
									className: "game__cmp game__cmp--you",
									children: ["你 ", /* @__PURE__ */ jsx("b", { children: you })]
								}), /* @__PURE__ */ jsxs("span", {
									className: "game__cmp game__cmp--dp",
									children: ["DP 最长 ", /* @__PURE__ */ jsx("b", { children: dp.length })]
								})]
							}),
							you < dp.length && /* @__PURE__ */ jsx("div", {
								className: "game__compare-tip",
								children: "贪心「能接就接」常常不是最长——此刻接哪个，取决于后面还剩什么，这正是要用 DP 的原因。"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "game__compare-tip",
								children: "星标只展示参考最长链之一。系统按原下标顺序、严格递增和链长度判定。"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "game__actions",
						children: [/* @__PURE__ */ jsxs("button", {
							className: "gbtn",
							onClick: resetChain,
							disabled: selOrder.length === 0 || revealed,
							children: [/* @__PURE__ */ jsx(RotateCcw, { size: 16 }), " 重接"]
						}), /* @__PURE__ */ jsxs("button", {
							className: "gbtn gbtn--primary",
							onClick: reveal,
							children: [/* @__PURE__ */ jsx(Trophy, { size: 16 }), " 核对最长长度"]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "game__actions",
						children: /* @__PURE__ */ jsxs("button", {
							className: "gbtn",
							onClick: shuffle,
							children: [/* @__PURE__ */ jsx(Shuffle, { size: 16 }), " 换一批"]
						})
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
export { buildSequenceRound, LISChainGame as default };
