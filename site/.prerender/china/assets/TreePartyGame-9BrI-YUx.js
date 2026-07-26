import { n as playGameTone, t as useRoundStats } from "./useRoundStats-CJJWDPot.js";
import { n as createSeededRandom, r as randomInt, t as useRoundSeed } from "./useRoundSeed-gEA7j6AH.js";
import { n as layoutRootedTree, r as solveTreeIndependentSet, t as buildRootedTree } from "./tree-dp-PvQdSlXM.js";
import { useLayoutEffect, useMemo, useState } from "react";
import { PartyPopper, Shuffle, Sparkles, Trophy, Volume2, VolumeX } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/games/TreePartyGame.tsx
var DIFFS = {
	easy: {
		label: "小公司",
		count: 6,
		maxChildren: 2,
		wMin: 2,
		wRange: 8
	},
	medium: {
		label: "中型公司",
		count: 9,
		maxChildren: 3,
		wMin: 2,
		wRange: 12
	},
	hard: {
		label: "大集团",
		count: 12,
		maxChildren: 3,
		wMin: 3,
		wRange: 15
	}
};
var DIFF_ORDER = [
	"easy",
	"medium",
	"hard"
];
function buildPartyRound(difficulty, random) {
	const d = DIFFS[difficulty];
	const parent = [-1];
	const childCount = [0];
	for (let i = 1; i < d.count; i++) {
		const cand = [];
		for (let j = 0; j < i; j++) if (childCount[j] < d.maxChildren) cand.push(j);
		const fa = cand[randomInt(random, 0, cand.length - 1)];
		parent.push(fa);
		childCount[fa]++;
		childCount.push(0);
	}
	return {
		parent,
		weight: Array.from({ length: d.count }, () => randomInt(random, d.wMin, d.wMin + d.wRange - 1))
	};
}
function TreePartyGame() {
	const [difficulty, setDifficulty] = useState("easy");
	const roundSeed = useRoundSeed();
	const [game, setGame] = useState(() => buildPartyRound("easy", createSeededRandom(roundSeed.seed)));
	const [sel, setSel] = useState(() => game.weight.map(() => false));
	const [revealed, setRevealed] = useState(false);
	const [muted, setMuted] = useState(false);
	const round = useRoundStats();
	const startRound = round.start;
	useLayoutEffect(() => {
		const nextGame = buildPartyRound(difficulty, createSeededRandom(roundSeed.seed));
		setGame(nextGame);
		setSel(nextGame.weight.map(() => false));
		setRevealed(false);
		startRound();
	}, [
		difficulty,
		roundSeed,
		startRound
	]);
	const tree = useMemo(() => buildRootedTree(game.parent, game.weight), [game]);
	const layout = useMemo(() => layoutRootedTree(tree), [tree]);
	const opt = useMemo(() => solveTreeIndependentSet(tree), [tree]);
	const conflictPairs = useMemo(() => {
		const bad = [];
		for (let u = 0; u < tree.n; u++) if (game.parent[u] >= 0 && sel[u] && sel[game.parent[u]]) bad.push([game.parent[u], u]);
		return bad;
	}, [
		sel,
		tree,
		game
	]);
	const conflictSet = useMemo(() => {
		const s = /* @__PURE__ */ new Set();
		conflictPairs.forEach(([a, b]) => {
			s.add(a);
			s.add(b);
		});
		return s;
	}, [conflictPairs]);
	const curJoy = game.weight.reduce((s, w, i) => s + (sel[i] ? w : 0), 0);
	const valid = conflictPairs.length === 0;
	const win = valid && revealed && curJoy === opt.ans;
	const sameAsReference = sel.every((picked, index) => picked === opt.chosen.has(index));
	const toggle = (i) => {
		playGameTone({ frequency: 430 + i * 40 }, muted);
		setSel((s) => s.map((x, k) => k === i ? !x : x));
		setRevealed(false);
	};
	const reveal = () => {
		setRevealed(true);
		const w = valid && curJoy === opt.ans;
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
	let feedback = "点员工把他请来舞会，凑最大欢乐值，但不能同时请一对直接上下级。完成后核对最优值。";
	let fbClass = "";
	if (!valid) {
		feedback = `冲突！有直接上下级同时被选中（高亮成红色），先取消其中一个。`;
		fbClass = "over";
	} else if (win) {
		feedback = sameAsReference ? `正确！你找到了一组欢乐值为 ${opt.ans} 的最优邀请方案。` : `正确！你找到了另一组欢乐值同为 ${opt.ans} 的最优邀请方案，不必和星标方案相同。`;
		fbClass = "win";
	} else if (revealed) feedback = `最优欢乐值是 ${opt.ans}，你现在 ${curJoy}，还差 ${opt.ans - curJoy}。星标方案只是参考最优解之一。`;
	const width = 640;
	const padX = 40;
	const topY = 36;
	const rowH = 84;
	const radius = 24;
	const H = topY + layout.maxDepth * rowH + 44;
	const px = (x) => padX + x * (width - 2 * padX);
	const py = (dep) => topY + dep * rowH;
	return /* @__PURE__ */ jsxs("div", {
		className: "tpg",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "tpg__head",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "tpg__title",
					children: [/* @__PURE__ */ jsx(PartyPopper, { size: 18 }), " 舞会邀请"]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "tpg__sub",
					children: "点员工组队，别请一对直接上下级——能追平 DP 吗？"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "tpg__diff",
					role: "group",
					"aria-label": "难度",
					children: DIFF_ORDER.map((d) => /* @__PURE__ */ jsx("button", {
						className: `tpg__diff-pill${d === difficulty ? " on" : ""}`,
						onClick: () => pickDiff(d),
						"aria-pressed": d === difficulty,
						children: DIFFS[d].label
					}, d))
				}),
				/* @__PURE__ */ jsx("button", {
					className: "tpg__icon-btn",
					onClick: () => setMuted((m) => !m),
					"aria-label": "静音",
					children: muted ? /* @__PURE__ */ jsx(VolumeX, { size: 16 }) : /* @__PURE__ */ jsx(Volume2, { size: 16 })
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "tpg__body",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "tpg__stage",
				children: [/* @__PURE__ */ jsxs("svg", {
					viewBox: `0 0 ${width} ${H}`,
					role: "img",
					"aria-label": "公司树，点员工加入舞会独立集",
					children: [layout.edges.map((e, i) => {
						const a = layout.byId.get(e.a);
						const b = layout.byId.get(e.b);
						const bad = conflictSet.has(e.a) && conflictSet.has(e.b) && sel[e.a] && sel[e.b];
						return /* @__PURE__ */ jsx("line", {
							x1: px(a.x),
							y1: py(a.depth) + radius,
							x2: px(b.x),
							y2: py(b.depth) - radius,
							stroke: bad ? "var(--viz-invalid)" : "var(--border-strong)",
							strokeWidth: bad ? 3.4 : 1.6
						}, i);
					}), layout.nodes.map((nd) => {
						const id = nd.id;
						const on = sel[id];
						const bad = conflictSet.has(id);
						const star = revealed && opt.chosen.has(id);
						let fill = "var(--surface-3)";
						let stroke = "var(--border-strong)";
						let textColor = "var(--text-1)";
						if (bad) {
							fill = "color-mix(in srgb, var(--viz-invalid) 26%, var(--surface-3))";
							stroke = "var(--viz-invalid)";
						} else if (on) {
							fill = "var(--grad-accent)";
							stroke = "var(--accent-2)";
							textColor = "var(--text-on-accent)";
						}
						return /* @__PURE__ */ jsxs("g", {
							className: "tpg__node",
							transform: `translate(${px(nd.x)},${py(nd.depth)})`,
							style: { cursor: "pointer" },
							onClick: () => toggle(id),
							children: [
								star && /* @__PURE__ */ jsx("circle", {
									r: 29,
									fill: "none",
									stroke: "var(--viz-chosen)",
									strokeWidth: "2.4",
									strokeDasharray: "4 3"
								}),
								/* @__PURE__ */ jsx("circle", {
									r: radius,
									fill,
									stroke,
									strokeWidth: on || bad ? 2.6 : 1.6
								}),
								/* @__PURE__ */ jsx("text", {
									y: -2,
									textAnchor: "middle",
									fontSize: "13",
									fontWeight: "700",
									fill: textColor,
									children: id + 1
								}),
								/* @__PURE__ */ jsx("text", {
									y: 13,
									textAnchor: "middle",
									fontSize: "11",
									className: "tpg__mono",
									fill: textColor,
									children: game.weight[id]
								}),
								star && /* @__PURE__ */ jsx("g", {
									transform: `translate(${radius - 4},-22)`,
									children: /* @__PURE__ */ jsx(Sparkles, {
										size: 14,
										color: "var(--viz-chosen)"
									})
								})
							]
						}, id);
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "tpg__legend",
					children: [
						/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { style: { background: "var(--accent-1)" } }), " 已邀请"] }),
						/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { style: {
							borderColor: "var(--viz-invalid)",
							background: "transparent"
						} }), " 上下级冲突"] }),
						/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { style: {
							borderColor: "var(--viz-chosen)",
							background: "transparent"
						} }), " 参考最优请法之一"] })
					]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "tpg__panel",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "tpg__value",
						children: [/* @__PURE__ */ jsx("b", {
							className: win ? "grad-text" : "",
							children: curJoy
						}), /* @__PURE__ */ jsxs("span", { children: ["当前欢乐值", valid ? "" : "（有冲突）"] })]
					}),
					/* @__PURE__ */ jsx("div", {
						className: `tpg__feedback ${fbClass}`,
						children: feedback
					}),
					revealed && valid && /* @__PURE__ */ jsxs("div", {
						className: "tpg__compare",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "tpg__compare-row",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "tpg__cmp tpg__cmp--you",
									children: ["你 ", /* @__PURE__ */ jsx("b", { children: curJoy })]
								}), /* @__PURE__ */ jsxs("span", {
									className: "tpg__cmp tpg__cmp--dp",
									children: ["DP 最优 ", /* @__PURE__ */ jsx("b", { children: opt.ans })]
								})]
							}),
							curJoy < opt.ans && /* @__PURE__ */ jsx("div", {
								className: "tpg__compare-tip",
								children: "贪心地「先请欢乐值最高的」往往不是最优——放弃一个高薪上司，可能腾出两个下属的名额。"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "tpg__compare-tip",
								children: "星标只展示参考最优解之一。系统按上下级约束和欢乐总值判定。"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "tpg__actions",
						children: [/* @__PURE__ */ jsxs("button", {
							className: "tpg__btn",
							onClick: shuffle,
							children: [/* @__PURE__ */ jsx(Shuffle, { size: 16 }), " 换公司"]
						}), /* @__PURE__ */ jsxs("button", {
							className: "tpg__btn tpg__btn--primary",
							onClick: reveal,
							children: [/* @__PURE__ */ jsx(Trophy, { size: 16 }), " 核对最优值"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "tpg__stats",
						children: [/* @__PURE__ */ jsxs("span", { children: [
							"已玩 ",
							round.stats.played,
							" 局 · 追平 DP ",
							round.stats.matched,
							" 次 · 种子 ",
							roundSeed.seed
						] }), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "tpg__btn",
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
export { buildPartyRound, TreePartyGame as default };
