import { n as playGameTone, t as useRoundStats } from "./useRoundStats-CJJWDPot.js";
import { n as createSeededRandom, r as randomInt, t as useRoundSeed } from "./useRoundSeed-gEA7j6AH.js";
/* empty css              */
import { n as layoutRerootTree, r as solveRerootDistance, t as buildRerootTree } from "./reroot-COID7zms.js";
import { useLayoutEffect, useMemo, useState } from "react";
import { Shuffle, Trophy, Volume2, VolumeX, Waypoints } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/games/RerootGame.tsx
var DIFFS = {
	easy: {
		label: "简单",
		n: 6
	},
	medium: {
		label: "中等",
		n: 8
	},
	hard: {
		label: "困难",
		n: 11
	}
};
var DIFF_ORDER = [
	"easy",
	"medium",
	"hard"
];
function buildTreeRound(difficulty, random) {
	const n = DIFFS[difficulty].n;
	const edges = [];
	for (let v = 1; v < n; v++) {
		const p = randomInt(random, 0, v - 1);
		edges.push({
			u: p,
			v
		});
	}
	return edges;
}
function RerootGame() {
	const [difficulty, setDifficulty] = useState("medium");
	const roundSeed = useRoundSeed();
	const [n, setN] = useState(DIFFS.medium.n);
	const [edges, setEdges] = useState(() => buildTreeRound("medium", createSeededRandom(roundSeed.seed)));
	const [rootSel, setRootSel] = useState(0);
	const [revealed, setRevealed] = useState(false);
	const [muted, setMuted] = useState(false);
	const round = useRoundStats();
	const startRound = round.start;
	useLayoutEffect(() => {
		setN(DIFFS[difficulty].n);
		setEdges(buildTreeRound(difficulty, createSeededRandom(roundSeed.seed)));
		setRootSel(0);
		setRevealed(false);
		startRound();
	}, [
		difficulty,
		roundSeed,
		startRound
	]);
	const { nodes, maxDepth, dist, best, bestNodes } = useMemo(() => {
		const t = buildRerootTree(n, edges, 0);
		const { nodes, maxDepth } = layoutRerootTree(t);
		const res = solveRerootDistance(t, "unweighted");
		const bestNodes = res.dist.flatMap((value, id) => value === res.best ? [id] : []);
		return {
			nodes,
			maxDepth,
			dist: res.dist,
			best: res.best,
			bestNodes
		};
	}, [n, edges]);
	const distOfSel = dist[rootSel];
	const win = revealed && distOfSel === best;
	const pickNode = (id) => {
		if (revealed) return;
		setRootSel(id);
		playGameTone({ frequency: 430 + id * 30 }, muted);
	};
	const reveal = () => {
		setRevealed(true);
		const w = distOfSel === best;
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
	let feedback = "点一个节点把它当「集合点」，实时看它到所有其它点的距离和。挑战：找到距离和最小的点（树的重心方向）。";
	let fbClass = "";
	if (win) {
		feedback = `正确！节点 ${rootSel + 1} 的距离和 ${distOfSel} 是全树最小。${bestNodes.length > 1 ? "这棵树有多个同样正确的最优点。" : ""}`;
		fbClass = "win";
	} else if (revealed) feedback = `最小距离和是 ${best}，最优点为节点 ${bestNodes.map((id) => id + 1).join("、")}。你选的节点 ${rootSel + 1} 是 ${distOfSel}，还差 ${distOfSel - best}。`;
	const W = 560;
	const padX = 40;
	const topY = 38;
	const rowH = 78;
	const H = topY + maxDepth * rowH + 44;
	const px = (x) => padX + x * (W - 2 * padX);
	const py = (d) => topY + d * rowH;
	const byId = new Map(nodes.map((nd) => [nd.id, nd]));
	const treeEdges = nodes.filter((nd) => nd.parent >= 0).map((nd) => ({
		c: nd,
		p: byId.get(nd.parent)
	}));
	return /* @__PURE__ */ jsxs("div", {
		className: "game",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "game__head",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "game__title",
					children: [/* @__PURE__ */ jsx(Waypoints, { size: 18 }), " 换根巡礼"]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "game__sub",
					children: "点节点当集合点——凭直觉找到距离和最小的重心？"
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
			className: "game__body grr__body",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "game__shelf-label",
				children: [
					"树（点节点设为根 · 当前根 = 节点 ",
					rootSel + 1,
					"）"
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "grr__stage",
				children: /* @__PURE__ */ jsxs("svg", {
					viewBox: `0 0 ${W} ${H}`,
					role: "img",
					"aria-label": "点节点把它当集合点，看它到所有其它点的距离和",
					children: [treeEdges.map((e, i) => /* @__PURE__ */ jsx("line", {
						x1: px(e.c.x),
						y1: py(e.c.depth),
						x2: px(e.p.x),
						y2: py(e.p.depth),
						stroke: "var(--border-strong)",
						strokeWidth: "1.8",
						strokeLinecap: "round"
					}, `e${i}`)), nodes.map((nd) => {
						const isSel = nd.id === rootSel;
						const isBest = revealed && bestNodes.includes(nd.id);
						const fill = isSel ? "var(--grad-accent)" : isBest ? "color-mix(in srgb, var(--viz-chosen) 22%, var(--surface-3))" : "var(--surface-3)";
						const stroke = isSel ? "var(--accent-1)" : isBest ? "var(--viz-chosen)" : "var(--border-strong)";
						const tx = isSel ? "var(--text-on-accent)" : "var(--text-1)";
						return /* @__PURE__ */ jsxs("g", {
							transform: `translate(${px(nd.x)},${py(nd.depth)})`,
							onClick: () => pickNode(nd.id),
							style: { cursor: revealed ? "default" : "pointer" },
							children: [
								/* @__PURE__ */ jsx("circle", {
									r: isSel ? 21 : 18,
									fill,
									stroke,
									strokeWidth: isSel ? 3 : 1.8
								}),
								/* @__PURE__ */ jsx("text", {
									y: revealed ? -2 : 5,
									textAnchor: "middle",
									fontSize: "13",
									fontWeight: "700",
									fill: tx,
									children: nd.id + 1
								}),
								revealed && /* @__PURE__ */ jsxs("text", {
									y: "12",
									textAnchor: "middle",
									fontSize: "9",
									className: "mono",
									fill: tx,
									children: ["d", dist[nd.id]]
								})
							]
						}, nd.id);
					})]
				})
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "game__panel",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "game__value",
						children: [/* @__PURE__ */ jsx("b", {
							className: win ? "grad-text" : "",
							children: distOfSel
						}), /* @__PURE__ */ jsxs("span", { children: [
							"节点 ",
							rootSel + 1,
							" 的距离和"
						] })]
					}),
					/* @__PURE__ */ jsx("div", {
						className: `game__feedback ${fbClass}`,
						children: feedback
					}),
					revealed && /* @__PURE__ */ jsxs("div", {
						className: "game__compare",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "game__compare-row",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "game__cmp game__cmp--you",
								children: ["你选 ", /* @__PURE__ */ jsx("b", { children: distOfSel })]
							}), /* @__PURE__ */ jsxs("span", {
								className: "game__cmp game__cmp--dp",
								children: ["DP 最小 ", /* @__PURE__ */ jsx("b", { children: best })]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "game__compare-tip",
							children: [
								"换根 DP 用",
								/* @__PURE__ */ jsx("strong", { children: "两遍 DFS" }),
								" 就能同时算出全部 ",
								n,
								" 个点的距离和（图上每点已标 d 值），",
								win ? "你命中了一个最优点。" : `最优点为节点 ${bestNodes.map((id) => id + 1).join("、")}。`,
								"若逐点暴力则要 ",
								n,
								"×",
								n,
								" 级别的工作量。"
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "game__actions",
						children: [/* @__PURE__ */ jsxs("button", {
							className: "gbtn",
							onClick: shuffle,
							children: [/* @__PURE__ */ jsx(Shuffle, { size: 16 }), " 换一棵树"]
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
							" 局 · 命中重心 ",
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
export { buildTreeRound, RerootGame as default };
