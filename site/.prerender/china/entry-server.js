import { Component, StrictMode, Suspense, createContext, lazy, useCallback, useContext, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { prerender } from "react-dom/static";
import { Link, MemoryRouter, NavLink, Route, Routes, useLocation, useMatch, useOutlet, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BookOpen, Check, Circle, Copy, ExternalLink, Gamepad2, Info, Library, Lightbulb, ListTree, Loader2, Menu, MessageSquarePlus, Moon, MoveHorizontal, PanelLeft, PanelLeftClose, Search, Send, SlidersHorizontal, Sparkles, Sun, SunMoon, TriangleAlert, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import katex from "katex";
//#region src/components/PartGlyph.tsx
/** 每个部分的几何母题字形——映射该 DP 的结构（容器/线/弧/网格/放射树/树/比特）。 */
function PartGlyph({ id, size = 120 }) {
	const common = {
		width: size,
		height: size,
		viewBox: "0 0 100 100",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 3,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": true
	};
	switch (id) {
		case "a": return /* @__PURE__ */ jsxs("svg", {
			...common,
			children: [/* @__PURE__ */ jsx("rect", {
				x: 20,
				y: 20,
				width: 60,
				height: 60,
				rx: 6
			}), [
				0,
				1,
				2
			].map((r) => [
				0,
				1,
				2
			].map((c) => /* @__PURE__ */ jsx("rect", {
				x: 28 + c * 16,
				y: 28 + r * 16,
				width: 12,
				height: 12,
				rx: 2,
				fill: (r + c) % 2 === 0 ? "currentColor" : "none",
				fillOpacity: .5,
				strokeWidth: 2
			}, `${r}${c}`)))]
		});
		case "b": return /* @__PURE__ */ jsxs("svg", {
			...common,
			children: [
				/* @__PURE__ */ jsx("path", {
					d: "M12 82 H88",
					strokeOpacity: .5
				}),
				[
					0,
					1,
					2,
					3,
					4
				].map((i) => /* @__PURE__ */ jsx("line", {
					x1: 20 + i * 15,
					y1: 82,
					x2: 20 + i * 15,
					y2: 70 - i * 12
				}, i)),
				/* @__PURE__ */ jsx("path", {
					d: "M20 58 L35 46 L50 34 L65 22 L80 14",
					strokeOpacity: .9
				})
			]
		});
		case "c": return /* @__PURE__ */ jsxs("svg", {
			...common,
			children: [
				/* @__PURE__ */ jsx("path", { d: "M14 74 Q50 6 86 74" }),
				/* @__PURE__ */ jsx("path", {
					d: "M26 74 Q50 26 74 74",
					strokeOpacity: .7
				}),
				/* @__PURE__ */ jsx("path", {
					d: "M38 74 Q50 46 62 74",
					strokeOpacity: .5
				}),
				/* @__PURE__ */ jsx("line", {
					x1: 14,
					y1: 74,
					x2: 86,
					y2: 74,
					strokeOpacity: .4
				})
			]
		});
		case "d": return /* @__PURE__ */ jsxs("svg", {
			...common,
			strokeWidth: 2.4,
			children: [
				/* @__PURE__ */ jsx("rect", {
					x: 20,
					y: 20,
					width: 60,
					height: 60,
					rx: 4
				}),
				[
					1,
					2,
					3
				].map((i) => /* @__PURE__ */ jsx("line", {
					x1: 20,
					y1: 20 + i * 15,
					x2: 80,
					y2: 20 + i * 15,
					strokeOpacity: .6
				}, `h${i}`)),
				[
					1,
					2,
					3
				].map((i) => /* @__PURE__ */ jsx("line", {
					x1: 20 + i * 15,
					y1: 20,
					x2: 20 + i * 15,
					y2: 80,
					strokeOpacity: .6
				}, `v${i}`)),
				/* @__PURE__ */ jsx("path", {
					d: "M20 20 L35 35 L50 50 L65 65 L80 80",
					strokeWidth: 3
				})
			]
		});
		case "e": return /* @__PURE__ */ jsxs("svg", {
			...common,
			children: [/* @__PURE__ */ jsx("circle", {
				cx: 50,
				cy: 50,
				r: 8,
				fill: "currentColor",
				fillOpacity: .5
			}), [
				[22, 24],
				[78, 24],
				[18, 66],
				[82, 66],
				[50, 86]
			].map(([x, y], i) => /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("line", {
				x1: 50,
				y1: 50,
				x2: x,
				y2: y,
				strokeOpacity: .7
			}), /* @__PURE__ */ jsx("circle", {
				cx: x,
				cy: y,
				r: 6
			})] }, i))]
		});
		case "f": return /* @__PURE__ */ jsxs("svg", {
			...common,
			children: [
				/* @__PURE__ */ jsx("circle", {
					cx: 50,
					cy: 18,
					r: 7
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: 28,
					cy: 52,
					r: 7
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: 72,
					cy: 52,
					r: 7
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: 16,
					cy: 84,
					r: 6
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: 40,
					cy: 84,
					r: 6
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: 62,
					cy: 84,
					r: 6
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: 84,
					cy: 84,
					r: 6
				}),
				/* @__PURE__ */ jsx("path", {
					d: "M50 25 L28 46 M50 25 L72 46 M28 59 L16 78 M28 59 L40 78 M72 59 L62 78 M72 59 L84 78",
					strokeOpacity: .7
				})
			]
		});
		case "g": return /* @__PURE__ */ jsxs("svg", {
			...common,
			strokeWidth: 2.6,
			children: [
				/* @__PURE__ */ jsx("path", {
					d: "M30 34 L30 66 L58 82 L58 50 Z",
					strokeOpacity: .85
				}),
				/* @__PURE__ */ jsx("path", {
					d: "M30 34 L58 18 L86 34 L58 50 Z",
					strokeOpacity: .6
				}),
				/* @__PURE__ */ jsx("path", {
					d: "M58 50 L86 34 L86 66 L58 82 Z",
					strokeOpacity: .45
				}),
				[
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ jsx("circle", {
					cx: 16,
					cy: 30 + i * 18,
					r: 3,
					fill: "currentColor",
					fillOpacity: i % 2 ? .2 : .8
				}, i))
			]
		});
	}
}
//#endregion
//#region src/components/motion/Magnet.tsx
/**
* Adapted from the React Bits Magnet interaction pattern.
* Motion values keep pointer updates outside React's render cycle.
*/
function Magnet({ children, className, strength = .2 }) {
	const reduceMotion = useReducedMotion();
	const rawX = useMotionValue(0);
	const rawY = useMotionValue(0);
	const x = useSpring(rawX, {
		stiffness: 360,
		damping: 26,
		mass: .45
	});
	const y = useSpring(rawY, {
		stiffness: 360,
		damping: 26,
		mass: .45
	});
	const reset = () => {
		rawX.set(0);
		rawY.set(0);
	};
	const handlePointerMove = (event) => {
		if (reduceMotion || event.pointerType !== "mouse") return;
		const bounds = event.currentTarget.getBoundingClientRect();
		rawX.set((event.clientX - (bounds.left + bounds.width / 2)) * strength);
		rawY.set((event.clientY - (bounds.top + bounds.height / 2)) * strength);
	};
	return /* @__PURE__ */ jsx("div", {
		className,
		onPointerMove: handlePointerMove,
		onPointerLeave: reset,
		onPointerCancel: reset,
		children: /* @__PURE__ */ jsx(motion.div, {
			className: "react-bits-magnet__body",
			style: reduceMotion ? void 0 : {
				x,
				y
			},
			children
		})
	});
}
//#endregion
//#region src/data/catalog.ts
function lessonContent(source, load) {
	return {
		contentSource: source,
		loadContent: load,
		content: lazy(load)
	};
}
var PARTS = [
	{
		id: "a",
		code: "A",
		title: "背包 DP",
		motif: "逐格填充的容器 / 方格堆",
		tagline: "容量受限下的取舍：物品件数属性决定了背包的谱系。",
		game: {
			title: "装包大师",
			content: lazy(() => import("./assets/PackMasterGame-CQk2dZf0.js"))
		},
		types: [
			{
				slug: "01",
				title: "01 背包",
				blurb: "取或不取·一维逆推·恰好装满",
				status: "ready",
				...lessonContent("../content/a/Knapsack01.tsx", () => import("./assets/Knapsack01-BICe65kr.js"))
			},
			{
				slug: "complete",
				title: "完全背包",
				blurb: "无限件·一维正推",
				status: "ready",
				...lessonContent("../content/a/KnapsackComplete.tsx", () => import("./assets/KnapsackComplete-B2Plgkg-.js"))
			},
			{
				slug: "multiple",
				title: "多重背包",
				blurb: "朴素·二进制·单调队列",
				status: "ready",
				...lessonContent("../content/a/KnapsackMultiple.tsx", () => import("./assets/KnapsackMultiple-G7fKf_cQ.js"))
			},
			{
				slug: "group",
				title: "分组背包",
				blurb: "每组至多选一件",
				status: "ready",
				...lessonContent("../content/a/KnapsackGroup.tsx", () => import("./assets/KnapsackGroup-DquNUZg8.js"))
			},
			{
				slug: "mixed",
				title: "混合背包",
				blurb: "01/完全/多重同题",
				status: "ready",
				...lessonContent("../content/a/KnapsackMixed.tsx", () => import("./assets/KnapsackMixed-wqvprS5x.js"))
			},
			{
				slug: "cost2d",
				title: "二维费用背包",
				blurb: "两种费用同时受限",
				status: "ready",
				...lessonContent("../content/a/KnapsackCost2D.tsx", () => import("./assets/KnapsackCost2D-Bqj4CAxo.js"))
			},
			{
				slug: "dep",
				title: "有依赖的背包",
				blurb: "主件-附件·依赖→分组",
				status: "ready",
				...lessonContent("../content/a/KnapsackDependency.tsx", () => import("./assets/KnapsackDependency-2MMOTCmF.js"))
			},
			{
				slug: "variant",
				title: "背包综合变形",
				blurb: "方案数·撤销·具体方案",
				status: "ready",
				...lessonContent("../content/a/KnapsackVariant.tsx", () => import("./assets/KnapsackVariant-CLzFfmMW.js"))
			},
			{
				slug: "fractional",
				title: "辨析：分数背包=贪心",
				blurb: "可分割⇒贪心 vs 整取⇒DP",
				status: "ready",
				...lessonContent("../content/a/KnapsackFractional.tsx", () => import("./assets/KnapsackFractional-QoGnvFi9.js"))
			}
		]
	},
	{
		id: "b",
		code: "B",
		title: "线性 DP",
		motif: "沿一条链推进的刻度序列",
		tagline: "把问题排成一条推进的序列，dp[i] 只依赖更早的状态。",
		game: {
			title: "LIS 接龙",
			content: lazy(() => import("./assets/LISChainGame-DRifAqLL.js"))
		},
		types: [
			{
				slug: "path",
				title: "路径型 / 递推入门",
				blurb: "数字三角形·过河卒·方格取数",
				status: "ready",
				...lessonContent("../content/b/LinearPath.tsx", () => import("./assets/LinearPath-YbRE9SPE.js"))
			},
			{
				slug: "maxseg",
				title: "最大子段和",
				blurb: "Kadane·环形·两段不相交",
				status: "ready",
				...lessonContent("../content/b/MaxSubarray.tsx", () => import("./assets/MaxSubarray-J4l37EQJ.js"))
			},
			{
				slug: "lis",
				title: "最长上升子序列 LIS",
				blurb: "O(n²) 与 O(n log n)·导弹拦截",
				status: "ready",
				...lessonContent("../content/b/LIS.tsx", () => import("./assets/LIS-BXc1hNrL.js"))
			},
			{
				slug: "lcs",
				title: "最长公共子序列 LCS",
				blurb: "排列 LCS→LIS·计数",
				status: "ready",
				...lessonContent("../content/b/LCS.tsx", () => import("./assets/LCS-CmhgvZ21.js"))
			},
			{
				slug: "edit",
				title: "编辑距离",
				blurb: "删/插/改三向转移",
				status: "ready",
				...lessonContent("../content/b/EditDistance.tsx", () => import("./assets/EditDistance-nyzXasxU.js"))
			},
			{
				slug: "fsm",
				title: "线性状态机 DP",
				blurb: "受限选取·股票买卖",
				status: "ready",
				...lessonContent("../content/b/StateMachine.tsx", () => import("./assets/StateMachine-CAb-AFr6.js"))
			},
			{
				slug: "count",
				title: "计数 / 划分型",
				blurb: "方案数·高精度·整数划分",
				status: "ready",
				...lessonContent("../content/b/LinearCount.tsx", () => import("./assets/LinearCount-QrKNwX76.js"))
			}
		]
	},
	{
		id: "c",
		code: "C",
		title: "区间 DP",
		motif: "嵌套的括号弧 / 区间桥",
		tagline: "dp[l][r] 表示区间最优，枚举分割/合并点，按长度递推。",
		game: {
			title: "合并石子",
			content: lazy(() => import("./assets/StoneMergeGame-CcL3ryAp.js"))
		},
		types: [
			{
				slug: "stone",
				title: "石子合并（链形）",
				blurb: "区间合并基础模型",
				status: "ready",
				...lessonContent("../content/c/StoneMerge.tsx", () => import("./assets/StoneMerge-DvdZqng5.js"))
			},
			{
				slug: "ring",
				title: "环形区间 DP",
				blurb: "断环为链·能量项链",
				status: "ready",
				...lessonContent("../content/c/RingInterval.tsx", () => import("./assets/RingInterval-CaM0uzDK.js"))
			},
			{
				slug: "palindrome",
				title: "回文 / 括号",
				blurb: "收缩扩展·端点匹配",
				status: "ready",
				...lessonContent("../content/c/Palindrome.tsx", () => import("./assets/Palindrome-Dp9lqfLj.js"))
			},
			{
				slug: "tree",
				title: "加分二叉树型",
				blurb: "枚举根·区间即子树",
				status: "ready",
				...lessonContent("../content/c/ScoreTree.tsx", () => import("./assets/ScoreTree-VhltpWgF.js"))
			},
			{
				slug: "merge",
				title: "合并 / 删除类",
				blurb: "2048·区间删除代价",
				status: "ready",
				...lessonContent("../content/c/MergeInterval.tsx", () => import("./assets/MergeInterval-CzI1TMtC.js"))
			}
		]
	},
	{
		id: "d",
		code: "D",
		title: "矩阵 DP",
		motif: "方阵网格 / 矩阵块",
		tagline: "两条主线：网格坐标上的 DP，与矩阵快速幂加速的递推。",
		game: {
			title: "幂次加速器",
			content: lazy(() => import("./assets/PowerAccelGame-C3HzgaMI.js"))
		},
		types: [{
			slug: "grid",
			title: "网格 / 矩阵上的 DP",
			blurb: "路径·最大正方形·双线程",
			status: "ready",
			...lessonContent("../content/d/GridDP.tsx", () => import("./assets/GridDP-Bst0it-P.js"))
		}, {
			slug: "matpow",
			title: "矩阵快速幂加速",
			blurb: "递推→矩阵幂·O(k³log n)",
			status: "ready",
			...lessonContent("../content/d/MatrixPower.tsx", () => import("./assets/MatrixPower-DurQTnZD.js"))
		}]
	},
	{
		id: "e",
		code: "E",
		title: "换根 DP",
		motif: "以不同节点为心的放射树",
		tagline: "二次扫描：固定根一遍 DFS，再一遍换根 O(1) 推每个点。",
		game: {
			title: "换根巡礼",
			content: lazy(() => import("./assets/RerootGame-LR4hZHM5.js"))
		},
		types: [
			{
				slug: "basic",
				title: "换根基础模型",
				blurb: "二次扫描骨架",
				status: "ready",
				...lessonContent("../content/e/RerootBasic.tsx", () => import("./assets/RerootBasic-EBW9_oG-.js"))
			},
			{
				slug: "distsum",
				title: "距离和换根",
				blurb: "深度和·带权距离和",
				status: "ready",
				...lessonContent("../content/e/RerootDistSum.tsx", () => import("./assets/RerootDistSum-DmcsJoBj.js"))
			},
			{
				slug: "inout",
				title: "子树内外合并",
				blurb: "距离≤k 点权和",
				status: "ready",
				...lessonContent("../content/e/RerootInOut.tsx", () => import("./assets/RerootInOut-BBo-e9VB.js"))
			},
			{
				slug: "center",
				title: "中心 / 偏心距",
				blurb: "树的直径·核",
				status: "ready",
				...lessonContent("../content/e/RerootCenter.tsx", () => import("./assets/RerootCenter-6LwWREOD.js"))
			}
		]
	},
	{
		id: "f",
		code: "F",
		title: "树形 DP",
		motif: "分叉的树冠",
		tagline: "dp[u][…] 表示子树最优，后序遍历自底向上合并。",
		game: {
			title: "舞会邀请",
			content: lazy(() => import("./assets/TreePartyGame-9BrI-YUx.js"))
		},
		types: [
			{
				slug: "select",
				title: "选点 / 最大独立集",
				blurb: "没有上司的舞会",
				status: "ready",
				...lessonContent("../content/f/TreeSelect.tsx", () => import("./assets/TreeSelect-BPku48Cl.js"))
			},
			{
				slug: "knapsack",
				title: "树上背包",
				blurb: "二叉苹果树·选课",
				status: "ready",
				...lessonContent("../content/f/TreeKnapsack.tsx", () => import("./assets/TreeKnapsack-DbypWTQ1.js"))
			},
			{
				slug: "diameter",
				title: "直径 / 重心 DP",
				blurb: "过点最长链",
				status: "ready",
				...lessonContent("../content/f/TreeDiameter.tsx", () => import("./assets/TreeDiameter-BG_IUYZ-.js"))
			},
			{
				slug: "cover",
				title: "覆盖 / 支配 / 染色",
				blurb: "三状态·染色计数",
				status: "ready",
				...lessonContent("../content/f/TreeCover.tsx", () => import("./assets/TreeCover-BCy2Q2QN.js"))
			},
			{
				slug: "count",
				title: "方案数 / 距离统计",
				blurb: "联合权值·括号树",
				status: "ready",
				...lessonContent("../content/f/TreeCount.tsx", () => import("./assets/TreeCount-Bi0hCHEs.js"))
			}
		]
	},
	{
		id: "g",
		code: "G",
		title: "状压 DP",
		motif: "比特点阵 / 超立方体",
		tagline: "状态是一个集合，用二进制整数表示；转移在 mask 间进行。",
		game: {
			title: "棋盘布阵",
			content: lazy(() => import("./assets/BitBoardGame-ixHtZIiw.js"))
		},
		types: [
			{
				slug: "board",
				title: "棋盘 / 轮廓状压",
				blurb: "互不侵犯·炮兵阵地",
				status: "ready",
				...lessonContent("../content/g/BitBoard.tsx", () => import("./assets/BitBoard-C04SeOXd.js"))
			},
			{
				slug: "tsp",
				title: "集合状压 / TSP",
				blurb: "最短 Hamilton·吃奶酪",
				status: "ready",
				...lessonContent("../content/g/BitTSP.tsx", () => import("./assets/BitTSP-K75Mv1tC.js"))
			},
			{
				slug: "cover",
				title: "状压 + 覆盖",
				blurb: "愤怒的小鸟·宝藏",
				status: "ready",
				...lessonContent("../content/g/BitCover.tsx", () => import("./assets/BitCover-qGMgUTJu.js"))
			},
			{
				slug: "subset",
				title: "综合技巧",
				blurb: "枚举子集·计数变形",
				status: "ready",
				...lessonContent("../content/g/BitSubset.tsx", () => import("./assets/BitSubset-6OG0DQYC.js"))
			},
			{
				slug: "plug",
				title: "插头 DP（选修）",
				blurb: "轮廓线连通性",
				status: "ready",
				...lessonContent("../content/g/BitPlug.tsx", () => import("./assets/BitPlug-DGlbYob_.js"))
			}
		]
	}
];
var getPart = (id) => PARTS.find((part) => part.id === id);
function getLesson(partId, slug) {
	const part = getPart(partId);
	const type = part?.types.find((candidate) => candidate.slug === slug);
	return part && type ? {
		part,
		type,
		path: `/part/${part.id}/${type.slug}`
	} : void 0;
}
function getLessonNeighbors(partId, slug) {
	const lessons = PARTS.flatMap((part) => part.types.filter((type) => type.status === "ready").map((type) => ({
		part,
		type,
		path: `/part/${part.id}/${type.slug}`
	})));
	const index = lessons.findIndex((lesson) => lesson.part.id === partId && lesson.type.slug === slug);
	return {
		previous: index > 0 ? lessons[index - 1] : void 0,
		next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : void 0
	};
}
//#endregion
//#region src/pages/HomeMotionController.tsx
function HomeMotionController({ rootRef }) {
	useEffect(() => {
		let disposed = false;
		let cleanup = () => {};
		async function mountMotion() {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
			if (disposed || !rootRef.current) return;
			gsap.registerPlugin(ScrollTrigger);
			const root = rootRef.current;
			const media = gsap.matchMedia();
			const context = gsap.context(() => {
				const topbar = document.querySelector(".topbar--home");
				const showAtlasTopbar = () => topbar?.classList.add("topbar--atlas");
				const showHeroTopbar = () => topbar?.classList.remove("topbar--atlas");
				media.add({
					motionAllowed: "(prefers-reduced-motion: no-preference)",
					desktop: "(min-width: 1025px)"
				}, (match) => {
					const { motionAllowed, desktop } = match.conditions;
					if (!motionAllowed) {
						ScrollTrigger.create({
							trigger: ".state-atlas",
							start: "top top",
							end: "bottom top",
							onEnter: showAtlasTopbar,
							onEnterBack: showAtlasTopbar,
							onLeaveBack: showHeroTopbar
						});
						return;
					}
					root.classList.add("home--gsap");
					gsap.fromTo(".home-hero__image", {
						scale: 1,
						yPercent: 0
					}, {
						scale: 1.14,
						yPercent: 4,
						ease: "none",
						scrollTrigger: {
							trigger: ".home-hero",
							start: "top top",
							end: "bottom top",
							scrub: 1
						}
					});
					gsap.to(".home-hero__content", {
						yPercent: -12,
						autoAlpha: .18,
						ease: "none",
						scrollTrigger: {
							trigger: ".home-hero",
							start: "45% top",
							end: "bottom top",
							scrub: 1
						}
					});
					if (desktop) {
						const atlas = root.querySelector(".state-atlas");
						const track = root.querySelector(".state-atlas__track");
						if (!atlas || !track) return;
						const distance = () => Math.max(0, track.scrollWidth - atlas.clientWidth);
						const horizontalTween = gsap.to(track, {
							x: () => -distance(),
							ease: "none",
							scrollTrigger: {
								trigger: atlas,
								start: "top top",
								end: () => `+=${distance()}`,
								pin: true,
								scrub: true,
								invalidateOnRefresh: true,
								onEnter: showAtlasTopbar,
								onEnterBack: showAtlasTopbar,
								onLeaveBack: showHeroTopbar
							}
						});
						let activePointerId = null;
						let dragStartX = 0;
						let dragStartScroll = 0;
						let dragTargetScroll = 0;
						let dragTargetProgress = 0;
						let dragMoved = false;
						let blockClickUntil = 0;
						const scrollBounds = () => {
							const trigger = horizontalTween.scrollTrigger;
							return {
								start: Number(trigger?.start ?? 0),
								end: Number(trigger?.end ?? distance())
							};
						};
						const endDrag = (event) => {
							if (activePointerId === null) return;
							if (event && event.pointerId !== activePointerId) return;
							const pointerId = activePointerId;
							activePointerId = null;
							if (dragMoved) {
								window.scrollTo({
									top: dragTargetScroll,
									left: window.scrollX,
									behavior: "instant"
								});
								ScrollTrigger.update();
								horizontalTween.progress(dragTargetProgress);
							}
							if (atlas.hasPointerCapture(pointerId)) atlas.releasePointerCapture(pointerId);
							if (dragMoved) blockClickUntil = performance.now() + 400;
							atlas.classList.remove("state-atlas--dragging");
						};
						const onPointerDown = (event) => {
							if (event.pointerType === "mouse" && event.button !== 0) return;
							if (activePointerId !== null) return;
							activePointerId = event.pointerId;
							dragStartX = event.clientX;
							window.scrollTo({
								top: window.scrollY,
								left: window.scrollX,
								behavior: "instant"
							});
							ScrollTrigger.update();
							dragStartScroll = window.scrollY;
							dragTargetScroll = dragStartScroll;
							const { start, end } = scrollBounds();
							dragTargetProgress = end > start ? gsap.utils.clamp(0, 1, (dragStartScroll - start) / (end - start)) : 0;
							dragMoved = false;
							atlas.setPointerCapture(event.pointerId);
							atlas.classList.add("state-atlas--dragging");
						};
						const onPointerMove = (event) => {
							if (event.pointerId !== activePointerId) return;
							const delta = event.clientX - dragStartX;
							if (!dragMoved && Math.abs(delta) < 6) return;
							dragMoved = true;
							event.preventDefault();
							const { start, end } = scrollBounds();
							const nextScroll = Math.round(gsap.utils.clamp(start, end, dragStartScroll - delta));
							dragTargetScroll = nextScroll;
							dragTargetProgress = end > start ? (nextScroll - start) / (end - start) : 0;
							horizontalTween.progress(dragTargetProgress);
						};
						const onNativeDragStart = (event) => {
							event.preventDefault();
						};
						const onClickCapture = (event) => {
							if (performance.now() > blockClickUntil) return;
							event.preventDefault();
							event.stopPropagation();
							blockClickUntil = 0;
						};
						atlas.classList.add("state-atlas--draggable");
						atlas.addEventListener("pointerdown", onPointerDown);
						atlas.addEventListener("pointermove", onPointerMove);
						atlas.addEventListener("pointerup", endDrag);
						atlas.addEventListener("pointercancel", endDrag);
						atlas.addEventListener("lostpointercapture", endDrag);
						atlas.addEventListener("dragstart", onNativeDragStart);
						atlas.addEventListener("click", onClickCapture, true);
						return () => {
							endDrag();
							atlas.classList.remove("state-atlas--draggable", "state-atlas--dragging");
							atlas.removeEventListener("pointerdown", onPointerDown);
							atlas.removeEventListener("pointermove", onPointerMove);
							atlas.removeEventListener("pointerup", endDrag);
							atlas.removeEventListener("pointercancel", endDrag);
							atlas.removeEventListener("lostpointercapture", endDrag);
							atlas.removeEventListener("dragstart", onNativeDragStart);
							atlas.removeEventListener("click", onClickCapture, true);
						};
					} else ScrollTrigger.create({
						trigger: ".state-atlas",
						start: "top top",
						end: "bottom top",
						onEnter: showAtlasTopbar,
						onEnterBack: showAtlasTopbar,
						onLeaveBack: showHeroTopbar
					});
				});
			}, root);
			cleanup = () => {
				root.classList.remove("home--gsap");
				document.querySelector(".topbar--home")?.classList.remove("topbar--atlas");
				media.revert();
				context.revert();
			};
		}
		mountMotion();
		return () => {
			disposed = true;
			cleanup();
		};
	}, [rootRef]);
	return null;
}
//#endregion
//#region src/pages/Home.tsx
function Home() {
	const rootRef = useRef(null);
	const lessonTotal = PARTS.reduce((total, part) => total + part.types.length, 0);
	return /* @__PURE__ */ jsxs("div", {
		ref: rootRef,
		className: "home",
		children: [
			/* @__PURE__ */ jsx(HomeMotionController, { rootRef }),
			/* @__PURE__ */ jsxs("section", {
				className: "home-hero",
				"aria-labelledby": "home-hero-title",
				children: [
					/* @__PURE__ */ jsx("img", {
						className: "home-hero__image",
						src: "/og/dpmaster-social.jpg",
						alt: "",
						width: "1200",
						height: "630",
						fetchPriority: "high"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "home-hero__shade",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "home-hero__frame",
						children: /* @__PURE__ */ jsxs("div", {
							className: "home-hero__content",
							children: [
								/* @__PURE__ */ jsxs("h1", {
									id: "home-hero-title",
									children: [/* @__PURE__ */ jsx("span", {
										className: "home-hero__line",
										children: /* @__PURE__ */ jsx("span", {
											"data-home-line": true,
											children: "把 DP 变成"
										})
									}), /* @__PURE__ */ jsx("span", {
										className: "home-hero__line",
										children: /* @__PURE__ */ jsx("span", {
											"data-home-line": true,
											children: "看得见的推演"
										})
									})]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "home-hero__lead",
									children: "从状态定义到模型迁移，用可改值演示和手算过程建立直觉。"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "home-hero__actions",
									children: [/* @__PURE__ */ jsx(Magnet, {
										className: "home-hero__magnet",
										children: /* @__PURE__ */ jsxs(Link, {
											to: "/part/a",
											className: "home-hero__primary",
											children: ["从背包 DP 开始 ", /* @__PURE__ */ jsx(ArrowRight, { size: 18 })]
										})
									}), /* @__PURE__ */ jsxs(Link, {
										to: "/method",
										className: "home-hero__secondary",
										children: ["先读方法论 ", /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })]
									})]
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ jsx("section", {
				className: "state-atlas",
				"aria-labelledby": "state-atlas-title",
				"aria-describedby": "state-atlas-instructions",
				children: /* @__PURE__ */ jsxs("div", {
					className: "state-atlas__track",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "state-atlas__intro",
						children: [
							/* @__PURE__ */ jsxs("h2", {
								id: "state-atlas-title",
								children: ["七种", /* @__PURE__ */ jsx("span", { children: "状态空间" })]
							}),
							/* @__PURE__ */ jsxs("p", { children: [lessonTotal, " 门课程沿七个 DP 家族展开，从状态含义进入，沿转移路径抵达答案。"] }),
							/* @__PURE__ */ jsxs("span", {
								className: "state-atlas__gesture",
								id: "state-atlas-instructions",
								children: [/* @__PURE__ */ jsx(MoveHorizontal, {
									size: 16,
									"aria-hidden": "true"
								}), "滚动或左右拖动浏览"]
							})
						]
					}), /* @__PURE__ */ jsx("ol", {
						className: "family-scenes",
						children: PARTS.map((part) => /* @__PURE__ */ jsx("li", {
							className: "family-scene",
							style: {
								"--family-color": `var(--${part.id}-1)`,
								"--family-gradient": `var(--grad-${part.id})`
							},
							children: /* @__PURE__ */ jsxs(Link, {
								to: `/part/${part.id}`,
								className: "family-scene__link",
								draggable: false,
								"aria-label": `进入${part.title}，共 ${part.types.length} 个类型`,
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "family-scene__code",
										"aria-hidden": "true",
										children: part.code
									}),
									/* @__PURE__ */ jsx("span", {
										className: "family-scene__ghost",
										"aria-hidden": "true",
										children: part.code
									}),
									/* @__PURE__ */ jsx("span", {
										className: "family-scene__glyph",
										"aria-hidden": "true",
										children: /* @__PURE__ */ jsx(PartGlyph, {
											id: part.id,
											size: 240
										})
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "family-scene__copy",
										children: [
											/* @__PURE__ */ jsxs("span", {
												className: "family-scene__meta",
												children: [part.types.length, " 个类型"]
											}),
											/* @__PURE__ */ jsx("h3", { children: part.title }),
											/* @__PURE__ */ jsx("span", {
												className: "family-scene__tagline",
												children: part.tagline
											}),
											/* @__PURE__ */ jsxs("span", {
												className: "family-scene__action",
												children: ["进入这一族 ", /* @__PURE__ */ jsx(ArrowUpRight, { size: 20 })]
											})
										]
									})
								]
							})
						}, part.id))
					})]
				})
			})
		]
	});
}
//#endregion
//#region src/components/GeometryBackdrop.tsx
/** 几何动态渐变背景：随当前部分强调色变色的漂移光斑 + 网格 + 颗粒。
*  纯 CSS 动画（transform/opacity），笔记本友好；prefers-reduced-motion 全局降级。 */
function GeometryBackdrop({ variant = "section" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `backdrop backdrop--${variant}`,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ jsx("div", { className: "backdrop__blob b1" }),
			/* @__PURE__ */ jsx("div", { className: "backdrop__blob b2" }),
			/* @__PURE__ */ jsx("div", { className: "backdrop__blob b3" }),
			/* @__PURE__ */ jsx("div", { className: "backdrop__grid" }),
			/* @__PURE__ */ jsx("div", { className: "backdrop__grain" })
		]
	});
}
//#endregion
//#region src/components/games/runtime/DeferredGame.tsx
function DeferredGame({ children, label }) {
	const [ready, setReady] = useState(false);
	const rootRef = useRef(null);
	useEffect(() => {
		if (ready || typeof window === "undefined") return;
		if (!("IntersectionObserver" in window)) {
			setReady(true);
			return;
		}
		const root = rootRef.current;
		if (!root) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			setReady(true);
			observer.disconnect();
		}, {
			rootMargin: "400px 0px",
			threshold: .01
		});
		observer.observe(root);
		return () => observer.disconnect();
	}, [ready]);
	return /* @__PURE__ */ jsx("div", {
		ref: rootRef,
		className: "deferred-game",
		"aria-label": label,
		"aria-busy": !ready,
		children: ready ? children : /* @__PURE__ */ jsxs("div", {
			className: "deferred-game__placeholder",
			role: "status",
			children: [/* @__PURE__ */ jsx(Gamepad2, {
				size: 24,
				"aria-hidden": "true"
			}), /* @__PURE__ */ jsx("span", { children: "互动游戏将在接近时自动加载" })]
		})
	});
}
//#endregion
//#region src/components/motion/AnimatedContent.tsx
/**
* Adapted from the React Bits Animated Content interaction pattern.
* It reveals structural content once, while reduced-motion users get an instant render.
*/
function AnimatedContent({ children, className, delay = 0, distance = 10, direction = "vertical" }) {
	const reduceMotion = useReducedMotion();
	const offset = reduceMotion ? 0 : distance;
	const initial = direction === "horizontal" ? {
		opacity: reduceMotion ? 1 : 0,
		x: offset
	} : {
		opacity: reduceMotion ? 1 : 0,
		y: offset
	};
	return /* @__PURE__ */ jsx(motion.div, {
		className,
		initial,
		whileInView: {
			opacity: 1,
			x: 0,
			y: 0
		},
		viewport: {
			once: true,
			amount: .12
		},
		transition: reduceMotion ? { duration: 0 } : {
			duration: .42,
			delay,
			ease: [
				.16,
				1,
				.3,
				1
			]
		},
		children
	});
}
//#endregion
//#region src/pages/PartPage.tsx
var NotFound$1 = lazy(() => import("./assets/NotFound-mzxjsqC5.js"));
function PartPage() {
	const { pid } = useParams();
	const part = pid ? getPart(pid) : void 0;
	if (!part) return /* @__PURE__ */ jsx(Suspense, {
		fallback: null,
		children: /* @__PURE__ */ jsx(NotFound$1, {})
	});
	const Game = part.game.content;
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx(AnimatedContent, { children: /* @__PURE__ */ jsxs("header", {
			className: "partcover",
			children: [
				/* @__PURE__ */ jsx(GeometryBackdrop, { variant: "section" }),
				/* @__PURE__ */ jsxs("div", {
					className: "partcover__row",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "partcover__code",
							children: part.code
						}),
						/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h1", { children: part.title }) }),
						/* @__PURE__ */ jsx("span", {
							className: "partcover__glyph",
							children: /* @__PURE__ */ jsx(PartGlyph, {
								id: part.id,
								size: 110
							})
						})
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "partcover__tag",
					children: part.tagline
				})
			]
		}) }),
		/* @__PURE__ */ jsx(AnimatedContent, {
			delay: .06,
			children: /* @__PURE__ */ jsxs("div", {
				className: "typelist",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "typelist__label",
					children: ["类型 · ", part.types.length]
				}), part.types.map((t, i) => {
					const num = String(i + 1).padStart(2, "0");
					if (t.status === "ready") return /* @__PURE__ */ jsxs(Link, {
						to: `/part/${part.id}/${t.slug}`,
						className: "typerow",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "typerow__num",
								children: num
							}),
							/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
								className: "typerow__title",
								children: t.title
							}), /* @__PURE__ */ jsx("span", {
								className: "typerow__blurb",
								style: { display: "block" },
								children: t.blurb
							})] }),
							/* @__PURE__ */ jsx("span", {
								className: "typerow__arrow",
								children: /* @__PURE__ */ jsx(ArrowRight, { size: 18 })
							})
						]
					}, t.slug);
					return /* @__PURE__ */ jsxs("div", {
						className: "typerow planned",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "typerow__num",
								children: num
							}),
							/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
								className: "typerow__title",
								children: t.title
							}), /* @__PURE__ */ jsx("span", {
								className: "typerow__blurb",
								style: { display: "block" },
								children: t.blurb
							})] }),
							/* @__PURE__ */ jsx("span", {
								className: "badge-status planned",
								children: "待建"
							})
						]
					}, t.slug);
				})]
			})
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "partgame",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "本部分 · 互动游戏"
			}), /* @__PURE__ */ jsx(DeferredGame, {
				label: `${part.game.title}互动游戏`,
				children: /* @__PURE__ */ jsx(Suspense, {
					fallback: /* @__PURE__ */ jsx("div", {
						className: "deferred-game__loading",
						"aria-busy": "true"
					}),
					children: /* @__PURE__ */ jsx(Game, {})
				})
			})]
		})
	] });
}
//#endregion
//#region src/config/site.ts
var BRAND = Object.freeze({
	name: "DP大师",
	subtitle: "DP Master",
	owner: "AzureL蔚澜算法",
	slogan: "在算法的海洋中，我就是你的信标"
});
var SITE_CONFIGS = Object.freeze({
	international: {
		region: "international",
		origin: "https://dp.betaoi.cc",
		hostname: "dp.betaoi.cc",
		language: "zh-Hans",
		hreflang: "zh-Hans",
		analytics: {
			provider: "cloudflare",
			endpoint: "/api/analytics",
			cloudflareToken: "c113fb69d7e84d38a645c5160f6f1bda"
		}
	},
	china: {
		region: "china",
		origin: "https://dp.betaoi.cn",
		hostname: "dp.betaoi.cn",
		language: "zh-CN",
		hreflang: "zh-CN",
		analytics: {
			provider: "tencent-edgeone",
			endpoint: "/api/analytics"
		}
	}
});
SITE_CONFIGS["international"].origin;
function getSiteConfig(region) {
	return SITE_CONFIGS[region];
}
function siteRegionFromHostname(hostname) {
	const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
	if (normalized === SITE_CONFIGS.international.hostname) return "international";
	if (normalized === SITE_CONFIGS.china.hostname) return "china";
}
function buildRegion() {
	return "china";
}
function getRuntimeSiteConfig() {
	return getSiteConfig(siteRegionFromHostname(typeof window === "undefined" ? "" : window.location.hostname) ?? buildRegion());
}
//#endregion
//#region src/data/editorial.ts
var LESSON_QUESTIONS = Object.freeze({
	"/part/a/01": "每件物品只能取一次时，为什么容量必须逆序更新",
	"/part/a/complete": "物品可无限取用时，正序更新如何复用本轮状态",
	"/part/a/multiple": "有限件物品怎样从朴素枚举优化到二进制或单调队列",
	"/part/a/group": "每组至多选一件时，如何隔离组内选择",
	"/part/a/mixed": "01、完全和多重物品怎样共用一套转移框架",
	"/part/a/cost2d": "同时受两种容量约束时，状态维度与枚举顺序如何设计",
	"/part/a/dep": "带主件附件依赖的选择怎样转化为合法组合",
	"/part/a/variant": "背包模型如何扩展到计数、撤销和方案恢复",
	"/part/a/fractional": "为什么可分割物品属于贪心而不是 01 背包",
	"/part/b/path": "沿序列或网格推进时，如何定义最小充分状态",
	"/part/b/maxseg": "如何用一个局部状态维护最大连续子段",
	"/part/b/lis": "最长上升子序列如何从二次转移优化到对数查找",
	"/part/b/lcs": "两个序列的公共结构如何通过二维状态刻画",
	"/part/b/edit": "插入、删除和替换如何统一进编辑距离转移",
	"/part/b/fsm": "带持有或选择限制的问题怎样画成有限状态机",
	"/part/b/count": "计数与划分问题如何避免重复或遗漏方案",
	"/part/c/stone": "区间合并代价为何要按长度递增计算",
	"/part/c/ring": "环形区间怎样通过复制序列转化为链形区间",
	"/part/c/palindrome": "端点匹配如何组织回文与括号类转移",
	"/part/c/tree": "枚举区间根节点时，子区间如何对应左右子树",
	"/part/c/merge": "合并与删除过程怎样压缩成区间状态",
	"/part/d/grid": "网格路径、最大正方形和双路径如何选择状态维度",
	"/part/d/matpow": "线性递推怎样写成矩阵并用快速幂加速",
	"/part/e/basic": "一次定根结果如何在线性时间转移到所有根",
	"/part/e/distsum": "换根时全树距离和为什么只需常数时间更新",
	"/part/e/inout": "子树内外贡献如何在第二遍 DFS 中合并",
	"/part/e/center": "偏心距与树中心如何由向下和向上信息共同得到",
	"/part/f/select": "父子不能同时选择时，选与不选状态如何配合",
	"/part/f/knapsack": "树上选取数量约束如何在子树间做背包合并",
	"/part/f/diameter": "过当前节点的多条链如何组合出直径与重心信息",
	"/part/f/cover": "覆盖、支配和染色约束需要哪些互斥状态",
	"/part/f/count": "树上方案数与距离统计如何在合并时避免重复",
	"/part/g/board": "逐行棋盘约束怎样编码为兼容位掩码",
	"/part/g/tsp": "集合访问状态如何保证 Hamilton 路径不重不漏",
	"/part/g/cover": "几何覆盖选择怎样预处理成可转移的状态集合",
	"/part/g/subset": "子集枚举与计数变形有哪些可复用的位运算技巧",
	"/part/g/plug": "轮廓线上的连通性怎样压缩为插头状态"
});
function getLessonEditorial(lesson) {
	const question = LESSON_QUESTIONS[lesson.path] ?? `${lesson.type.title}的状态、转移与实现顺序应如何设计`;
	return {
		summary: `${lesson.type.title}课程回答“${question}”。内容以${lesson.type.blurb}为主线，配合逐步推导、可编辑演示、例题与练习形成可复查的学习闭环。`,
		question,
		outcomes: [
			`判断${lesson.type.title}的适用条件与状态边界`,
			`围绕“${lesson.type.blurb}”推导转移与计算顺序`,
			"用演示、复杂度分析和配套题目校验实现"
		],
		reviewedBy: BRAND.owner,
		reviewStatus: "持续复核"
	};
}
//#endregion
//#region src/data/routeLastModified.ts
var ROUTE_LAST_MODIFIED = Object.freeze({
	"/": "2026-07-26",
	"/part/a": "2026-07-26",
	"/part/b": "2026-07-26",
	"/part/c": "2026-07-26",
	"/part/d": "2026-07-26",
	"/part/e": "2026-07-26",
	"/part/f": "2026-07-26",
	"/part/g": "2026-07-26",
	"/part/a/01": "2026-07-26",
	"/part/a/complete": "2026-07-26",
	"/part/a/multiple": "2026-07-26",
	"/part/a/group": "2026-07-26",
	"/part/a/mixed": "2026-07-26",
	"/part/a/cost2d": "2026-07-26",
	"/part/a/dep": "2026-07-26",
	"/part/a/variant": "2026-07-26",
	"/part/a/fractional": "2026-07-26",
	"/part/b/path": "2026-07-26",
	"/part/b/maxseg": "2026-07-26",
	"/part/b/lis": "2026-07-26",
	"/part/b/lcs": "2026-07-26",
	"/part/b/edit": "2026-07-26",
	"/part/b/fsm": "2026-07-26",
	"/part/b/count": "2026-07-26",
	"/part/c/stone": "2026-07-26",
	"/part/c/ring": "2026-07-26",
	"/part/c/palindrome": "2026-07-26",
	"/part/c/tree": "2026-07-26",
	"/part/c/merge": "2026-07-26",
	"/part/d/grid": "2026-07-26",
	"/part/d/matpow": "2026-07-26",
	"/part/e/basic": "2026-07-26",
	"/part/e/distsum": "2026-07-26",
	"/part/e/inout": "2026-07-26",
	"/part/e/center": "2026-07-26",
	"/part/f/select": "2026-07-26",
	"/part/f/knapsack": "2026-07-26",
	"/part/f/diameter": "2026-07-26",
	"/part/f/cover": "2026-07-26",
	"/part/f/count": "2026-07-26",
	"/part/g/board": "2026-07-26",
	"/part/g/tsp": "2026-07-26",
	"/part/g/cover": "2026-07-26",
	"/part/g/subset": "2026-07-26",
	"/part/g/plug": "2026-07-26",
	"/method": "2026-07-26",
	"/problems": "2026-07-26",
	"/about": "2026-07-26"
});
//#endregion
//#region src/analytics/index.ts
function sendFirstPartyEvent(provider, endpoint, event) {
	const site = getRuntimeSiteConfig();
	const body = JSON.stringify({
		provider,
		event: event.event,
		path: event.path,
		title: event.title ?? "",
		metadata: {
			region: site.region,
			build: "95ecc7b14b01",
			...event.metadata ?? {}
		},
		ts: (/* @__PURE__ */ new Date()).toISOString()
	});
	try {
		if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }))) return;
	} catch {}
	fetch(endpoint, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body,
		keepalive: true
	}).catch(() => {});
}
function cloudflareProvider() {
	const site = getRuntimeSiteConfig();
	return {
		name: "cloudflare",
		initialize() {
			const token = site.analytics.cloudflareToken;
			if (window.location.hostname !== site.hostname || !token || document.querySelector("script[data-dp-analytics=\"cloudflare\"]")) return;
			const script = document.createElement("script");
			script.type = "module";
			script.src = "https://static.cloudflareinsights.com/beacon.min.js";
			script.dataset.cfBeacon = JSON.stringify({ token });
			script.dataset.dpAnalytics = "cloudflare";
			document.body.append(script);
		},
		track(event) {
			sendFirstPartyEvent("cloudflare", site.analytics.endpoint, event);
		}
	};
}
function tencentEdgeOneProvider() {
	const site = getRuntimeSiteConfig();
	return {
		name: "tencent-edgeone",
		initialize() {},
		track(event) {
			sendFirstPartyEvent("tencent-edgeone", site.analytics.endpoint, event);
		}
	};
}
var activeProvider;
function provider() {
	if (typeof window === "undefined") return void 0;
	if (!activeProvider) {
		activeProvider = getRuntimeSiteConfig().analytics.provider === "cloudflare" ? cloudflareProvider() : tencentEdgeOneProvider();
		activeProvider.initialize();
	}
	return activeProvider;
}
function trackAnalyticsEvent(event) {
	provider()?.track(event);
}
//#endregion
//#region src/learning/LearningProgressContext.tsx
var STORAGE_KEY = "dp-master-progress:v1";
var LESSON_PATHS = new Set(PARTS.flatMap((part) => part.types.filter((type) => type.status === "ready").map((type) => `/part/${part.id}/${type.slug}`)));
var EMPTY = {
	completed: [],
	lastVisited: null
};
var Context = createContext({
	...EMPTY,
	hydrated: false,
	visit: () => {},
	markComplete: () => {},
	toggleComplete: () => {}
});
function parseStoredProgress(raw) {
	if (!raw) return EMPTY;
	try {
		const value = JSON.parse(raw);
		return {
			completed: Array.isArray(value.completed) ? [...new Set(value.completed.filter((item) => typeof item === "string" && LESSON_PATHS.has(item)))] : [],
			lastVisited: typeof value.lastVisited === "string" ? value.lastVisited : null
		};
	} catch {
		return EMPTY;
	}
}
function LearningProgressProvider({ children }) {
	const [progress, setProgress] = useState(EMPTY);
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => {
		let stored = null;
		try {
			stored = localStorage.getItem(STORAGE_KEY);
		} catch {}
		setProgress(parseStoredProgress(stored));
		setHydrated(true);
	}, []);
	useEffect(() => {
		if (!hydrated) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
		} catch {}
	}, [hydrated, progress]);
	const visit = useCallback((path) => {
		setProgress((current) => current.lastVisited === path ? current : {
			...current,
			lastVisited: path
		});
	}, []);
	const markComplete = useCallback((path) => {
		setProgress((current) => current.completed.includes(path) ? current : {
			...current,
			completed: [...current.completed, path]
		});
	}, []);
	const toggleComplete = useCallback((path) => {
		setProgress((current) => ({
			...current,
			completed: current.completed.includes(path) ? current.completed.filter((item) => item !== path) : [...current.completed, path]
		}));
	}, []);
	const value = useMemo(() => ({
		...progress,
		hydrated,
		visit,
		markComplete,
		toggleComplete
	}), [
		hydrated,
		markComplete,
		progress,
		toggleComplete,
		visit
	]);
	return /* @__PURE__ */ jsx(Context.Provider, {
		value,
		children
	});
}
var useLearningProgress = () => useContext(Context);
//#endregion
//#region src/app/StaticLessonContent.ts
var StaticLessonContentContext = createContext(void 0);
function useStaticLessonContents() {
	return useContext(StaticLessonContentContext);
}
//#endregion
//#region src/pages/TypePage.tsx
var NotFound = lazy(() => import("./assets/NotFound-mzxjsqC5.js"));
var startedLessons = /* @__PURE__ */ new Set();
function headingId(label, index) {
	return `section-${label.toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 48) || index + 1}`;
}
function OutlineLinks({ items, activeId }) {
	if (items.length === 0) return /* @__PURE__ */ jsx("p", {
		className: "lesson-outline__pending",
		children: "正在整理目录…"
	});
	return /* @__PURE__ */ jsx("ol", { children: items.map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
		href: `#${item.id}`,
		"aria-current": activeId === item.id ? "location" : void 0,
		children: item.label
	}) }, item.id)) });
}
function TypePage() {
	const { pid, slug } = useParams();
	const lesson = pid && slug ? getLesson(pid, slug) : void 0;
	const part = lesson?.part;
	const type = lesson?.type;
	const staticLessonContents = useStaticLessonContents();
	const path = lesson?.path ?? "";
	const StaticBody = path ? staticLessonContents?.[path] : void 0;
	const Body = StaticBody || type?.content;
	const articleRef = useRef(null);
	const completionRef = useRef(null);
	const [outline, setOutline] = useState([]);
	const [activeId, setActiveId] = useState("");
	const { completed, visit, markComplete, toggleComplete } = useLearningProgress();
	const editorial = lesson ? getLessonEditorial(lesson) : void 0;
	const neighbors = pid && slug ? getLessonNeighbors(pid, slug) : {
		previous: void 0,
		next: void 0
	};
	const isComplete = Boolean(path && completed.includes(path));
	useEffect(() => {
		if (!path || !type) return;
		visit(path);
		if (!startedLessons.has(path)) {
			startedLessons.add(path);
			trackAnalyticsEvent({
				event: "lesson_started",
				path,
				title: type.title
			});
		}
	}, [
		path,
		type,
		visit
	]);
	useEffect(() => {
		if (!path) return;
		const article = articleRef.current;
		if (!article) return;
		let sectionObserver;
		const refresh = () => {
			const headings = Array.from(article.querySelectorAll("h2.section-title"));
			const items = headings.map((heading, index) => {
				if (!heading.id) heading.id = headingId(heading.textContent?.trim() || "", index);
				return {
					id: heading.id,
					label: heading.textContent?.trim() || `第 ${index + 1} 节`
				};
			});
			setOutline(items);
			sectionObserver?.disconnect();
			sectionObserver = new IntersectionObserver((entries) => {
				const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);
				if (visible[0]) setActiveId(visible[0].target.id);
			}, { rootMargin: "-15% 0px -70% 0px" });
			headings.forEach((heading) => sectionObserver?.observe(heading));
			return headings.length > 0;
		};
		const mutationObserver = new MutationObserver(() => {
			if (refresh()) mutationObserver.disconnect();
		});
		if (!refresh()) mutationObserver.observe(article, {
			childList: true,
			subtree: true
		});
		return () => {
			mutationObserver.disconnect();
			sectionObserver?.disconnect();
		};
	}, [path]);
	useEffect(() => {
		if (!path || !type) return;
		const target = completionRef.current;
		if (!target || isComplete) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry?.isIntersecting) return;
			markComplete(path);
			trackAnalyticsEvent({
				event: "lesson_completed",
				path,
				title: type.title,
				metadata: { method: "reached_end" }
			});
			observer.disconnect();
		}, { threshold: .8 });
		observer.observe(target);
		return () => observer.disconnect();
	}, [
		isComplete,
		markComplete,
		outline.length,
		path,
		type
	]);
	if (!part || !type || !Body) return /* @__PURE__ */ jsx(Suspense, {
		fallback: null,
		children: /* @__PURE__ */ jsx(NotFound, {})
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "typepage-layout",
		children: [/* @__PURE__ */ jsxs("article", {
			className: "typepage",
			ref: articleRef,
			children: [
				/* @__PURE__ */ jsx(AnimatedContent, { children: /* @__PURE__ */ jsxs("header", {
					className: "typehead",
					children: [
						/* @__PURE__ */ jsxs("span", {
							className: "typehead__eyebrow",
							children: [/* @__PURE__ */ jsx("span", {
								className: "typehead__code",
								children: part.code
							}), part.title]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "typehead__titleline",
							children: [/* @__PURE__ */ jsx("h1", { children: type.title }), /* @__PURE__ */ jsxs("button", {
								type: "button",
								className: `typehead__complete${isComplete ? " is-complete" : ""}`,
								onClick: () => {
									if (!isComplete) trackAnalyticsEvent({
										event: "lesson_completed",
										path,
										title: type.title,
										metadata: { method: "manual" }
									});
									toggleComplete(path);
								},
								children: [isComplete ? /* @__PURE__ */ jsx(Check, { size: 15 }) : /* @__PURE__ */ jsx(Circle, { size: 15 }), isComplete ? "已学完" : "标为学完"]
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "typehead__blurb",
							children: type.blurb
						}),
						editorial && /* @__PURE__ */ jsxs("section", {
							className: "lesson-abstract",
							"aria-labelledby": "lesson-abstract-title",
							children: [
								/* @__PURE__ */ jsx("h2", {
									id: "lesson-abstract-title",
									children: "本课摘要"
								}),
								/* @__PURE__ */ jsx("p", { children: editorial.summary }),
								/* @__PURE__ */ jsx("ul", { children: editorial.outcomes.map((outcome) => /* @__PURE__ */ jsx("li", { children: outcome }, outcome)) }),
								/* @__PURE__ */ jsxs("footer", { children: [
									/* @__PURE__ */ jsxs("span", { children: ["内容维护：", editorial.reviewedBy] }),
									/* @__PURE__ */ jsxs("span", { children: ["审核状态：", editorial.reviewStatus] }),
									ROUTE_LAST_MODIFIED[path] && /* @__PURE__ */ jsxs("span", { children: ["最近更新：", /* @__PURE__ */ jsx("time", {
										dateTime: ROUTE_LAST_MODIFIED[path],
										children: ROUTE_LAST_MODIFIED[path]
									})] })
								] })
							]
						}),
						/* @__PURE__ */ jsxs("details", {
							className: "lesson-outline lesson-outline--mobile",
							children: [/* @__PURE__ */ jsxs("summary", { children: [
								/* @__PURE__ */ jsx(ListTree, { size: 15 }),
								" 本课目录 · ",
								outline.length,
								" 节"
							] }), /* @__PURE__ */ jsx(OutlineLinks, {
								items: outline,
								activeId
							})]
						})
					]
				}) }),
				StaticBody ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(StaticBody, {}), /* @__PURE__ */ jsx("div", {
					ref: completionRef,
					className: "lesson-completion-marker",
					"aria-hidden": "true"
				})] }) : /* @__PURE__ */ jsxs(Suspense, {
					fallback: /* @__PURE__ */ jsx("div", {
						style: { minHeight: "50vh" },
						"aria-busy": "true"
					}),
					children: [/* @__PURE__ */ jsx(Body, {}), /* @__PURE__ */ jsx("div", {
						ref: completionRef,
						className: "lesson-completion-marker",
						"aria-hidden": "true"
					})]
				}),
				/* @__PURE__ */ jsx(AnimatedContent, {
					distance: 12,
					children: /* @__PURE__ */ jsxs("nav", {
						className: "type-nav",
						"aria-label": "课程导航",
						children: [neighbors.previous ? /* @__PURE__ */ jsxs(Link, {
							to: neighbors.previous.path,
							children: [/* @__PURE__ */ jsx("span", {
								className: "dir",
								children: "← 上一类型"
							}), /* @__PURE__ */ jsx("span", {
								className: "nm",
								children: neighbors.previous.type.title
							})]
						}) : /* @__PURE__ */ jsxs(Link, {
							to: `/part/${part.id}`,
							children: [/* @__PURE__ */ jsx("span", {
								className: "dir",
								children: "← 返回本部分"
							}), /* @__PURE__ */ jsx("span", {
								className: "nm",
								children: part.title
							})]
						}), neighbors.next ? /* @__PURE__ */ jsxs(Link, {
							to: neighbors.next.path,
							children: [/* @__PURE__ */ jsx("span", {
								className: "dir",
								children: neighbors.next.part.id === part.id ? "下一类型 →" : "下一部分 →"
							}), /* @__PURE__ */ jsx("span", {
								className: "nm",
								children: neighbors.next.type.title
							})]
						}) : /* @__PURE__ */ jsxs(Link, {
							to: "/problems",
							children: [/* @__PURE__ */ jsx("span", {
								className: "dir",
								children: "完成课程 →"
							}), /* @__PURE__ */ jsx("span", {
								className: "nm",
								children: "题目索引"
							})]
						})]
					})
				})
			]
		}), /* @__PURE__ */ jsxs("aside", {
			className: "lesson-outline lesson-outline--desktop",
			"aria-label": "本课目录",
			children: [/* @__PURE__ */ jsxs("p", {
				className: "lesson-outline__label",
				children: [/* @__PURE__ */ jsx(ListTree, { size: 14 }), " 本课目录"]
			}), /* @__PURE__ */ jsx(OutlineLinks, {
				items: outline,
				activeId
			})]
		})]
	});
}
//#endregion
//#region src/pages/AboutPage.tsx
var USE = [
	{
		icon: SlidersHorizontal,
		title: "可改值的演示",
		desc: "DP 表逐格填充，支持播放 / 单步 / 进度条拖动；改动输入会立即重跑求解、重播动画。"
	},
	{
		icon: Gamepad2,
		title: "互动小游戏",
		desc: "多数家族配一个小游戏（装包大师、LIS 接龙……），在玩中对照 DP 的最优决策。"
	},
	{
		icon: PanelLeft,
		title: "按家族浏览",
		desc: "左侧边栏把 DP 分成七大家族，每个类型自带推导、配图、例题与练习。"
	},
	{
		icon: SunMoon,
		title: "深浅两色",
		desc: "右上角一键切换暖墨深色与暖奶油浅色，长时间阅读不累眼。"
	}
];
function AboutPage() {
	const allTypes = PARTS.flatMap((p) => p.types);
	const ready = allTypes.filter((t) => t.status === "ready").length;
	return /* @__PURE__ */ jsxs("div", {
		className: "about",
		children: [
			/* @__PURE__ */ jsx(AnimatedContent, { children: /* @__PURE__ */ jsxs("section", {
				className: "about-hero",
				children: [
					/* @__PURE__ */ jsx(GeometryBackdrop, { variant: "section" }),
					/* @__PURE__ */ jsxs("span", {
						className: "about-hero__eyebrow",
						children: [/* @__PURE__ */ jsx(Sparkles, { size: 14 }), " 关于 · 如何使用"]
					}),
					/* @__PURE__ */ jsxs("h1", { children: [
						"把动态规划",
						/* @__PURE__ */ jsx("br", {}),
						/* @__PURE__ */ jsx("span", {
							className: "grad-text-brand",
							children: "一格一格讲清楚"
						})
					] }),
					/* @__PURE__ */ jsx("p", {
						className: "about-hero__lead",
						children: "DP大师围绕动态规划的七大家族展开，每个类型都配可改值的演示动画与互动小游戏， 让状态、转移与无后效性在你眼前一格一格地长出来。例题全部取自洛谷原生题库。"
					})
				]
			}) }),
			/* @__PURE__ */ jsx(AnimatedContent, {
				delay: .04,
				children: /* @__PURE__ */ jsxs("section", {
					className: "about-block",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "about-block__title",
						children: "怎么用"
					}), /* @__PURE__ */ jsx("div", {
						className: "about-grid",
						children: USE.map((u) => /* @__PURE__ */ jsxs("div", {
							className: "about-card",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "about-card__icon",
									children: /* @__PURE__ */ jsx(u.icon, { size: 22 })
								}),
								/* @__PURE__ */ jsx("h3", { children: u.title }),
								/* @__PURE__ */ jsx("p", { children: u.desc })
							]
						}, u.title))
					})]
				})
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "about-block",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "about-block__title",
						children: "覆盖范围"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "about-stats",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "about-stat",
								children: [/* @__PURE__ */ jsx("b", { children: "7" }), /* @__PURE__ */ jsx("span", { children: "大家族" })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "about-stat",
								children: [/* @__PURE__ */ jsx("b", { children: allTypes.length }), /* @__PURE__ */ jsx("span", { children: "个类型" })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "about-stat",
								children: [/* @__PURE__ */ jsx("b", { children: ready }), /* @__PURE__ */ jsx("span", { children: "已上线" })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "about-stat",
								children: [/* @__PURE__ */ jsx("b", { children: "100%" }), /* @__PURE__ */ jsx("span", { children: "洛谷原生题" })]
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "about-parts",
						children: PARTS.map((p) => /* @__PURE__ */ jsxs(Link, {
							to: `/part/${p.id}`,
							className: "about-part",
							style: { ["--pg"]: `var(--grad-${p.id})` },
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "about-part__code",
									children: p.code
								}),
								/* @__PURE__ */ jsx("span", {
									className: "about-part__title",
									children: p.title
								}),
								/* @__PURE__ */ jsx("span", {
									className: "about-part__n",
									children: p.types.length
								})
							]
						}, p.id))
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "about-block",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "about-block__title",
						children: "数据来源与许可"
					}),
					/* @__PURE__ */ jsxs("ul", {
						className: "about-list",
						children: [
							/* @__PURE__ */ jsxs("li", { children: [
								/* @__PURE__ */ jsx("b", { children: "例题" }),
								"：全部来自",
								" ",
								/* @__PURE__ */ jsx("a", {
									href: "https://www.luogu.com.cn",
									target: "_blank",
									rel: "noopener noreferrer",
									children: "洛谷"
								}),
								" ",
								"原生题库（P / B 题），按难度与家族逐题精选。"
							] }),
							/* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("b", { children: "字体" }), "：Space Grotesk / JetBrains Mono 自托管，中文正文走 Noto Sans SC / 微软雅黑等系统字体栈。"] }),
							/* @__PURE__ */ jsxs("li", { children: [
								/* @__PURE__ */ jsx("b", { children: "图标" }),
								" Lucide（MIT）·",
								/* @__PURE__ */ jsx("b", { children: "公式" }),
								" KaTeX ·",
								/* @__PURE__ */ jsx("b", { children: "代码高亮" }),
								" Shiki——公式在组件中渲染，代码高亮按需懒加载。"
							] }),
							/* @__PURE__ */ jsx("li", { children: "本站为教学用途，非商业项目。" })
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "about-feedback",
						children: "有建议或发现错误？点右下角的反馈按钮告诉我们。"
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "about-block about-policy",
				id: "privacy",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "about-block__title",
						children: "隐私与反馈说明"
					}),
					/* @__PURE__ */ jsx("p", { children: "反馈表单只在你主动提交时发送数据。必需字段包括反馈类型、当前页面名称与路径、具体描述和提交时间； 复现步骤与联系方式均可留空。完整网址、浏览器标识和视口尺寸属于诊断信息，默认关闭，只有你勾选后才会附带。" }),
					/* @__PURE__ */ jsx("p", { children: "提交成功仅在维护通道确认接收后显示，并提供回执编号；通道不可用时页面会明确提示失败，不会把“仅写入日志”冒充送达。 Web Vitals 与使用事件只记录页面路径、事件类别和性能数值，不采集姓名、联系方式或输入内容。" }),
					/* @__PURE__ */ jsx("p", { children: "反馈内容用于定位错误、回复建议和改进课程。运行日志的保存期限由部署平台配置，维护策略应设为不超过 30 天； 需要删除曾提交的联系方式时，可在新反馈中附上原回执编号提出请求。" })
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "about-cta",
				children: [/* @__PURE__ */ jsx(Link, {
					to: "/",
					className: "about-btn about-btn--primary",
					children: "回首页"
				}), /* @__PURE__ */ jsxs(Link, {
					to: "/part/a/01",
					className: "about-btn about-btn--ghost",
					children: ["从 01 背包开始 ", /* @__PURE__ */ jsx(ArrowRight, { size: 16 })]
				})]
			})
		]
	});
}
//#endregion
//#region src/components/ui/Math.tsx
function render(tex, displayMode) {
	return katex.renderToString(tex, {
		displayMode,
		throwOnError: false,
		strict: false,
		output: "htmlAndMathml"
	});
}
var M = ({ children }) => /* @__PURE__ */ jsx("span", { dangerouslySetInnerHTML: { __html: render(children, false) } });
var MB = ({ children }) => /* @__PURE__ */ jsx("div", {
	className: "mathblock",
	dangerouslySetInnerHTML: { __html: render(children, true) }
});
//#endregion
//#region src/components/ui/InfoBox.tsx
function InfoBox({ kind = "key", title, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `infobox infobox--${kind}`,
		children: [/* @__PURE__ */ jsx("span", {
			className: "infobox__icon",
			children: kind === "warn" ? /* @__PURE__ */ jsx(TriangleAlert, { size: 18 }) : /* @__PURE__ */ jsx(Lightbulb, { size: 18 })
		}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", { children: title }), /* @__PURE__ */ jsx("p", { children })] })]
	});
}
//#endregion
//#region src/lib/highlighter.ts
var hlP = null;
function getHighlighter() {
	if (!hlP) hlP = (async () => {
		const [core, engine, cpp, dark, light] = await Promise.all([
			import("shiki/core"),
			import("shiki/engine/javascript"),
			import("shiki/langs/cpp.mjs"),
			import("shiki/themes/github-dark.mjs"),
			import("shiki/themes/github-light.mjs")
		]);
		return core.createHighlighterCore({
			langs: [cpp.default],
			themes: [dark.default, light.default],
			engine: engine.createJavaScriptRegexEngine()
		});
	})();
	return hlP;
}
//#endregion
//#region src/components/ui/CodeBlock.tsx
function CodeBlock({ code, lang = "cpp", luogu, title }) {
	const src = code.replace(/^\n+|\n+$/g, "");
	const [html, setHtml] = useState("");
	const [copied, setCopied] = useState(false);
	const rootRef = useRef(null);
	useEffect(() => {
		let alive = true;
		let idleHandle;
		let timeoutHandle;
		let observer;
		const highlight = () => {
			const run = () => {
				getHighlighter().then((hl) => hl.codeToHtml(src, {
					lang,
					themes: {
						light: "github-light",
						dark: "github-dark"
					},
					defaultColor: false
				})).then((h) => alive && setHtml(h)).catch(() => {});
			};
			if ("requestIdleCallback" in window) idleHandle = window.requestIdleCallback(run, { timeout: 1200 });
			else timeoutHandle = globalThis.setTimeout(run, 80);
		};
		const element = rootRef.current;
		if (!element || !("IntersectionObserver" in window)) highlight();
		else {
			observer = new IntersectionObserver(([entry]) => {
				if (!entry.isIntersecting) return;
				observer?.disconnect();
				highlight();
			}, { rootMargin: "360px 0px" });
			observer.observe(element);
		}
		return () => {
			alive = false;
			observer?.disconnect();
			if (idleHandle !== void 0 && "cancelIdleCallback" in window) window.cancelIdleCallback(idleHandle);
			if (timeoutHandle !== void 0) globalThis.clearTimeout(timeoutHandle);
		};
	}, [src, lang]);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(src);
			setCopied(true);
			setTimeout(() => setCopied(false), 1400);
		} catch {}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "codeblock",
		ref: rootRef,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "codeblock__bar",
			children: [/* @__PURE__ */ jsx("span", {
				className: "codeblock__title",
				children: title ?? "C++"
			}), /* @__PURE__ */ jsxs("div", {
				className: "codeblock__actions",
				children: [luogu && /* @__PURE__ */ jsxs("a", {
					className: "cb-btn",
					href: `https://www.luogu.com.cn/problem/${luogu}`,
					target: "_blank",
					rel: "noreferrer",
					children: [
						"在洛谷打开 ",
						luogu,
						" ",
						/* @__PURE__ */ jsx(ExternalLink, { size: 13 })
					]
				}), /* @__PURE__ */ jsxs("button", {
					className: "cb-btn",
					onClick: copy,
					children: [
						copied ? /* @__PURE__ */ jsx(Check, { size: 14 }) : /* @__PURE__ */ jsx(Copy, { size: 14 }),
						" ",
						copied ? "已复制" : "复制"
					]
				})]
			})]
		}), html ? /* @__PURE__ */ jsx("div", {
			className: "codeblock__code",
			dangerouslySetInnerHTML: { __html: html }
		}) : /* @__PURE__ */ jsx("pre", {
			className: "codeblock__code codeblock__fallback",
			children: /* @__PURE__ */ jsx("code", { children: src })
		})]
	});
}
//#endregion
//#region src/pages/MethodPage.tsx
var CODE_MEMO = `
int f[N];                 // 备忘录，-1 表示"尚未计算"
bool vis[N];

int dp(int s)             // 求状态 s 的答案
{
    if (vis[s]) return f[s];        // 算过就直接查表，绝不重算
    vis[s] = true;
    int res = BASE;                 // 边界 / 初值
    for (auto &d : decisions(s))    // 枚举"最后一步"的决策
        res = max(res, dp(prev(s, d)) + cost(d));
    return f[s] = res;
}`;
var CODE_ROLL = `
// 01 背包压成一维：f[j] = 容量恰为 j 时的最大价值
int f[M + 1] = {0};
for (int i = 1; i <= n; i++)
    for (int j = m; j >= w[i]; j--)        // ★逆推：先算大 j
        f[j] = max(f[j], f[j - w[i]] + v[i]);

// 完全背包：同一段转移，内层改成正推即可（每件可无限取）
// for (int j = w[i]; j <= m; j++) ...`;
function MethodPage() {
	return /* @__PURE__ */ jsxs("article", {
		className: "typepage",
		children: [
			/* @__PURE__ */ jsx(AnimatedContent, { children: /* @__PURE__ */ jsxs("header", {
				className: "typehead",
				children: [
					/* @__PURE__ */ jsxs("span", {
						className: "typehead__eyebrow",
						children: [/* @__PURE__ */ jsx("span", {
							className: "typehead__code",
							children: /* @__PURE__ */ jsx(Sparkles, { size: 14 })
						}), "DP大师 · 总纲"]
					}),
					/* @__PURE__ */ jsx("h1", { children: "动态规划 · 通用方法论" }),
					/* @__PURE__ */ jsx("p", {
						className: "typehead__blurb",
						children: "先把框架立起来，再进七大家族——学会用一张逐格填写的表，装下指数级的搜索。"
					})
				]
			}) }),
			/* @__PURE__ */ jsxs("section", {
				className: "lesson",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "动态规划在做什么"
				}), /* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"一句话：把一个大问题拆成许多",
						/* @__PURE__ */ jsx("strong", { children: "重叠的子问题" }),
						"，每个子问题只算一次、把答案记下来， 后面遇到就直接查表。它介于两种极端之间——",
						/* @__PURE__ */ jsx("strong", { children: "暴力搜索" }),
						"把所有可能都试一遍（常是 ",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 或 ",
						/* @__PURE__ */ jsx(M, { children: "n!" }),
						" 级），",
						/* @__PURE__ */ jsx("strong", { children: "贪心" }),
						"每步只顾眼前最优（快，但常常错）。DP 用「记忆」换「重复」，把暴力的指数压成多项式，又比贪心稳。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"所以判断一道题「能不能 DP」，本质是问三件事：子问题的最优",
						/* @__PURE__ */ jsx("strong", { children: "能不能拼出" }),
						"大问题的最优？ 一个局面定下来后，",
						/* @__PURE__ */ jsx("strong", { children: "还需不需要回头" }),
						"看它是怎么来的？这些子问题",
						/* @__PURE__ */ jsx("strong", { children: "会不会反复出现" }),
						"？ 三个「是」，就是下面的三个前提。"
					] })]
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "lesson",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "section-title",
						children: "能用 DP 的三个前提"
					}),
					/* @__PURE__ */ jsxs(InfoBox, {
						kind: "key",
						title: "① 最优子结构",
						children: [
							"大问题的最优解，由它",
							/* @__PURE__ */ jsx("strong", { children: "子问题的最优解" }),
							"拼成。比如「前 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 件、容量 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 的最优」， 一定建立在「前 ",
							/* @__PURE__ */ jsx(M, { children: "i-1" }),
							" 件」的最优之上——否则把更优的子解换进来，整体还能更优，矛盾。"
						]
					}),
					/* @__PURE__ */ jsxs(InfoBox, {
						kind: "key",
						title: "② 无后效性",
						children: [
							"一个状态一旦确定，",
							/* @__PURE__ */ jsx("strong", { children: "后续决策只看这个状态本身" }),
							"，与「它是经由哪条路径到达的」无关。 这让我们可以只记状态、不记历史。若「怎么来的」会影响未来，就得把那部分信息",
							/* @__PURE__ */ jsx("strong", { children: "补进状态维度" }),
							"里。"
						]
					}),
					/* @__PURE__ */ jsxs(InfoBox, {
						kind: "key",
						title: "③ 重叠子问题",
						children: [
							"同一个子问题会被",
							/* @__PURE__ */ jsx("strong", { children: "反复用到" }),
							"。正因为重叠，「算一次、记下来」才划算——这也是 DP 区别于分治的地方 （分治的子问题通常互不相交）。"
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "lesson",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "section-title",
						children: "解一道 DP，就这五步"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "prose",
						children: /* @__PURE__ */ jsx("p", { children: "拿到题别急着写循环，按这五步想清楚，代码几乎是抄出来的：" })
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
										/* @__PURE__ */ jsx("b", { children: "定状态。" }),
										"用最少的维度，把「当前局面」不重不漏地描述出来。问自己：",
										/* @__PURE__ */ jsx("strong", { children: "有几样东西在变？" }),
										"每样就是一维。",
										/* @__PURE__ */ jsx(M, { children: "dp[\\cdots]" }),
										" 的含义要一句话说得清（例：以 ",
										/* @__PURE__ */ jsx(M, { children: "i" }),
										" 结尾的最长上升子序列长度）。"
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
										/* @__PURE__ */ jsx("b", { children: "写转移。" }),
										"盯住",
										/* @__PURE__ */ jsx("strong", { children: "最后一步决策" }),
										"：当前状态是从哪些更小的状态、付出什么代价得到的？把它们取 ",
										/* @__PURE__ */ jsx(M, { children: "\\max/\\min/\\sum" }),
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
										/* @__PURE__ */ jsx("b", { children: "定边界与初值。" }),
										"最小的子问题答案是什么？没被转移覆盖的格子要手动填对（求最大常填 ",
										/* @__PURE__ */ jsx(M, { children: "0" }),
										" 或 ",
										/* @__PURE__ */ jsx(M, { children: "-\\infty" }),
										"，计数填 ",
										/* @__PURE__ */ jsx(M, { children: "0" }),
										" 而起点填 ",
										/* @__PURE__ */ jsx(M, { children: "1" }),
										"）。"
									]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "step",
								children: [/* @__PURE__ */ jsx("span", {
									className: "step__n",
									children: "4"
								}), /* @__PURE__ */ jsxs("div", {
									className: "step__b",
									children: [
										/* @__PURE__ */ jsx("b", { children: "定递推顺序。" }),
										"保证算 ",
										/* @__PURE__ */ jsx(M, { children: "dp[x]" }),
										" 之前，它依赖的子状态",
										/* @__PURE__ */ jsx("strong", { children: "都已算好" }),
										"——见下一节。"
									]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "step",
								children: [/* @__PURE__ */ jsx("span", {
									className: "step__n",
									children: "5"
								}), /* @__PURE__ */ jsxs("div", {
									className: "step__b",
									children: [
										/* @__PURE__ */ jsx("b", { children: "取答案。" }),
										"答案未必是最后一格，可能是",
										/* @__PURE__ */ jsx("strong", { children: "某一维的最值" }),
										"（如 LIS 取 ",
										/* @__PURE__ */ jsx(M, { children: "\\max_i dp[i]" }),
										"）。想清楚要读哪个/哪些格子。"
									]
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "lesson",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态：DP 的灵魂"
				}), /* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"九成的 DP，难在",
						/* @__PURE__ */ jsx("strong", { children: "状态怎么定" }),
						"，而非转移。维度 = 有几个「限制/进度」在同时变化： 背包是「考虑到第几件」×「用了多少容量」，于是 ",
						/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
						"；区间 DP 是「左右端点」，于是 ",
						/* @__PURE__ */ jsx(M, { children: "f[l][r]" }),
						"； 树形 DP 是「以谁为根的子树」×「选没选它」，于是 ",
						/* @__PURE__ */ jsx(M, { children: "f[u][0/1]" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"两条经验：状态要",
						/* @__PURE__ */ jsx("strong", { children: "刚好够用" }),
						"——少一维会漏信息（无后效性被破坏），多一维会白白拖慢； 当「怎么来的」影响未来时，",
						/* @__PURE__ */ jsx("strong", { children: "把它编码进状态" }),
						"（比如上一步选了什么、当前奇偶、集合用二进制压成一个整数）。"
					] })]
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "lesson",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "转移：从子问题推当前"
				}), /* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"写转移的通用姿势，是枚举",
							/* @__PURE__ */ jsx("strong", { children: "「最后一步」" }),
							"的所有可能决策，在对应的更小状态上取最优："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[s]=\\operatorname*{opt}_{s\\,\\leftarrow\\,s'}\\big(\\,dp[s']+\\text{cost}(s'\\to s)\\,\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"这里 ",
							/* @__PURE__ */ jsx(M, { children: "\\text{opt}" }),
							" 按题意是 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							"、",
							/* @__PURE__ */ jsx(M, { children: "\\min" }),
							" 或求和 ",
							/* @__PURE__ */ jsx(M, { children: "\\sum" }),
							"（计数）。 把「最优」换成「累加」，最优 DP 就变成",
							/* @__PURE__ */ jsx("strong", { children: "计数 DP" }),
							"；同一套状态与转移骨架，常能一题多吃。"
						] })
					]
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "lesson",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "section-title",
						children: "递推顺序：先算谁"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "prose",
						children: /* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsxs("strong", { children: [
							"铁律：算 ",
							/* @__PURE__ */ jsx(M, { children: "dp[x]" }),
							" 前，它依赖的每个子状态必须都已经算好。"
						] }), "顺序错了，你读到的是没填好的空格。三种常见姿势："] })
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "steps",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "step",
								children: [/* @__PURE__ */ jsx("span", {
									className: "step__n",
									children: "→"
								}), /* @__PURE__ */ jsxs("div", {
									className: "step__b",
									children: [
										/* @__PURE__ */ jsx("b", { children: "按维度顺推。" }),
										"线性 DP 从小到大扫下标；区间 DP 按",
										/* @__PURE__ */ jsx("strong", { children: "区间长度" }),
										"从短到长（短区间先算，长区间才能用）。"
									]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "step",
								children: [/* @__PURE__ */ jsx("span", {
									className: "step__n",
									children: "↑"
								}), /* @__PURE__ */ jsxs("div", {
									className: "step__b",
									children: [/* @__PURE__ */ jsx("b", { children: "后序遍历。" }), "树形 DP 自底向上——先把所有孩子的子树算完，再合并到父亲。"]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "step",
								children: [/* @__PURE__ */ jsx("span", {
									className: "step__n",
									children: "↺"
								}), /* @__PURE__ */ jsxs("div", {
									className: "step__b",
									children: [
										/* @__PURE__ */ jsx("b", { children: "记忆化搜索。" }),
										"懒得推顺序？写成递归 + 备忘录，让递归调用",
										/* @__PURE__ */ jsx("strong", { children: "天然" }),
										"保证「依赖先算」——它就是自顶向下的 DP。"
									]
								})]
							})
						]
					}),
					/* @__PURE__ */ jsx(CodeBlock, {
						title: "记忆化搜索 · 通用模板",
						code: CODE_MEMO
					}),
					/* @__PURE__ */ jsxs(InfoBox, {
						kind: "key",
						title: "记忆化 = 自顶向下的 DP",
						children: [
							"递推是「自底向上」填表，记忆化是「自顶向下」递归 + 缓存。两者算的是同一批状态、同一个转移，只是",
							/* @__PURE__ */ jsx("strong", { children: "谁先谁后" }),
							"的组织方式不同。状态空间稀疏、或顺序难推时，记忆化往往更好写。"
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "lesson",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "section-title",
						children: "空间优化：把一维滚掉"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "prose",
						children: /* @__PURE__ */ jsxs("p", { children: [
							"当 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i][\\cdot]" }),
							" 只依赖 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i-1][\\cdot]" }),
							"，就没必要保留所有行——用一维数组",
							/* @__PURE__ */ jsx("strong", { children: "就地更新" }),
							"，空间从 ",
							/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
							" 降到 ",
							/* @__PURE__ */ jsx(M, { children: "O(m)" }),
							"。"
						] })
					}),
					/* @__PURE__ */ jsx(CodeBlock, {
						title: "滚动数组 · 01 背包一维",
						code: CODE_ROLL
					}),
					/* @__PURE__ */ jsxs(InfoBox, {
						kind: "warn",
						title: "降维后，循环方向决定物种",
						children: [
							"压成一维后，正 / 逆序决定你读到的是「上一层的旧值」还是「本层已更新的新值」：01 背包",
							/* @__PURE__ */ jsx("strong", { children: "逆推" }),
							"（每件至多一次）， 完全背包",
							/* @__PURE__ */ jsx("strong", { children: "正推" }),
							"（每件无限次）。",
							/* @__PURE__ */ jsx("strong", { children: "同一段转移，方向反了就是另一道题。" })
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "lesson",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "调试与常见陷阱"
				}), /* @__PURE__ */ jsxs("div", {
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
									/* @__PURE__ */ jsx("b", { children: "打印整张表。" }),
									"DP 错了先别改代码，把 ",
									/* @__PURE__ */ jsx(M, { children: "dp" }),
									" 数组打出来逐格对照手算——错在哪一格，一眼看见。"
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
									/* @__PURE__ */ jsx("b", { children: "对拍。" }),
									"写个 ",
									/* @__PURE__ */ jsx(M, { children: "O(2^n)" }),
									" 暴力，用小数据随机对拍 DP，最快揪出转移或边界的偏差。"
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
									/* @__PURE__ */ jsx("b", { children: "初值与边界。" }),
									"「求最大」忘了把不可达状态设成 ",
									/* @__PURE__ */ jsx(M, { children: "-\\infty" }),
									"、计数忘了 ",
									/* @__PURE__ */ jsx(M, { children: "dp[0]=1" }),
									"，是最高频的错。"
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "step",
							children: [/* @__PURE__ */ jsx("span", {
								className: "step__n",
								children: "4"
							}), /* @__PURE__ */ jsxs("div", {
								className: "step__b",
								children: [
									/* @__PURE__ */ jsx("b", { children: "溢出与越界。" }),
									"方案数、代价和很容易爆 ",
									/* @__PURE__ */ jsx("code", { children: "int" }),
									"，果断上 ",
									/* @__PURE__ */ jsx("code", { children: "long long" }),
									"；一维逆推注意 ",
									/* @__PURE__ */ jsx(M, { children: "j\\ge w_i" }),
									" 的下界。"
								]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx(AnimatedContent, {
				distance: 12,
				children: /* @__PURE__ */ jsxs("section", {
					className: "lesson",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "section-title",
							children: "七大家族速览"
						}),
						/* @__PURE__ */ jsx("div", {
							className: "prose",
							children: /* @__PURE__ */ jsxs("p", { children: [
								"框架立好了，就进具体家族。每个家族其实是一类",
								/* @__PURE__ */ jsx("strong", { children: "状态设计的范式" }),
								"——认出题目属于哪一类，状态怎么定就有了模板："
							] })
						}),
						/* @__PURE__ */ jsx("div", {
							className: "about-parts",
							style: { marginTop: "var(--sp-5)" },
							children: PARTS.map((p) => /* @__PURE__ */ jsxs(Link, {
								to: `/part/${p.id}`,
								className: "about-part",
								style: { ["--pg"]: `var(--grad-${p.id})` },
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "about-part__code",
										children: p.code
									}),
									/* @__PURE__ */ jsx("span", {
										className: "about-part__title",
										children: p.title
									}),
									/* @__PURE__ */ jsx("span", {
										className: "about-part__n",
										children: p.types.length
									})
								]
							}, p.id))
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("nav", {
				className: "type-nav",
				children: [/* @__PURE__ */ jsx("span", {}), /* @__PURE__ */ jsxs(Link, {
					to: "/part/a/01",
					className: "next",
					children: [/* @__PURE__ */ jsx("span", {
						className: "dir",
						children: "开始第一题 →"
					}), /* @__PURE__ */ jsxs("span", {
						className: "nm",
						children: ["01 背包 ", /* @__PURE__ */ jsx(ArrowRight, {
							size: 15,
							style: { verticalAlign: "-2px" }
						})]
					})]
				})]
			})
		]
	});
}
//#endregion
//#region src/data/problems.ts
var PROBLEMS = [
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "01",
		typeTitle: "01 背包",
		pid: "P1048",
		name: "采药",
		diff: "普及-",
		kind: "example",
		src: "NOIP2005 普及组"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "01",
		typeTitle: "01 背包",
		pid: "P2871",
		name: "[USACO07DEC] Charm Bracelet S",
		diff: "普及/提高-",
		kind: "example",
		src: "USACO 2007"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "01",
		typeTitle: "01 背包",
		pid: "P1164",
		name: "小 A 点菜",
		diff: "普及-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "01",
		typeTitle: "01 背包",
		pid: "P1049",
		name: "[NOIP2001 普及组] 装箱问题",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "01",
		typeTitle: "01 背包",
		pid: "P1417",
		name: "烹调方案",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "01",
		typeTitle: "01 背包",
		pid: "P1466",
		name: "[USACO2.2] 集合 Subset Sums",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "complete",
		typeTitle: "完全背包",
		pid: "P1616",
		name: "疯狂的采药",
		diff: "普及/提高-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "complete",
		typeTitle: "完全背包",
		pid: "P5662",
		name: "[CSP-J2019] 纪念品",
		diff: "普及+/提高",
		kind: "example",
		src: "CSP-J 2019"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "complete",
		typeTitle: "完全背包",
		pid: "P5020",
		name: "[NOIP2018 提高组] 货币系统",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOIP2018 提高"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "complete",
		typeTitle: "完全背包",
		pid: "P2918",
		name: "[USACO08NOV] Buying Hay S",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "complete",
		typeTitle: "完全背包",
		pid: "P2725",
		name: "[USACO3.1] 邮票 Stamps",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "complete",
		typeTitle: "完全背包",
		pid: "P1832",
		name: "A+B Problem（再升级）",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "multiple",
		typeTitle: "多重背包",
		pid: "P2347",
		name: "[NOIP1996 提高组] 砝码称重",
		diff: "普及/提高-",
		kind: "example",
		src: "NOIP1996 提高"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "multiple",
		typeTitle: "多重背包",
		pid: "P1776",
		name: "宝物筛选",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOI导刊2010"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "multiple",
		typeTitle: "多重背包",
		pid: "P6771",
		name: "[USACO05DEC] Space Elevator 太空电梯",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "multiple",
		typeTitle: "多重背包",
		pid: "P1077",
		name: "[NOIP2012 普及组] 摆花",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "multiple",
		typeTitle: "多重背包",
		pid: "P1833",
		name: "樱花",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "group",
		typeTitle: "分组背包",
		pid: "P1757",
		name: "通天之分组背包",
		diff: "普及/提高-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "group",
		typeTitle: "分组背包",
		pid: "P5322",
		name: "[BJOI2019] 排兵布阵",
		diff: "提高+/省选-",
		kind: "example",
		src: "BJOI2019"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "group",
		typeTitle: "分组背包",
		pid: "P1064",
		name: "[NOIP2006 提高组] 金明的预算方案",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "group",
		typeTitle: "分组背包",
		pid: "P1757",
		name: "通天之分组背包",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "mixed",
		typeTitle: "混合背包",
		pid: "P1833",
		name: "樱花",
		diff: "普及/提高-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "mixed",
		typeTitle: "混合背包",
		pid: "P2851",
		name: "[USACO2006 Dec] The Fewest Coins S",
		diff: "提高+/省选-",
		kind: "example",
		src: "USACO 2006"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "mixed",
		typeTitle: "混合背包",
		pid: "P1616",
		name: "疯狂的采药",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "mixed",
		typeTitle: "混合背包",
		pid: "P1077",
		name: "[NOIP2012 普及组] 摆花",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "cost2d",
		typeTitle: "二维费用背包",
		pid: "P1855",
		name: "榨取 kkksc03",
		diff: "普及-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "cost2d",
		typeTitle: "二维费用背包",
		pid: "P1507",
		name: "NASA 的食物计划",
		diff: "普及/提高-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "cost2d",
		typeTitle: "二维费用背包",
		pid: "P1509",
		name: "找啊找啊找 GF",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "cost2d",
		typeTitle: "二维费用背包",
		pid: "P1855",
		name: "榨取 kkksc03",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "dep",
		typeTitle: "有依赖的背包",
		pid: "P1064",
		name: "[NOIP2006 提高组] 金明的预算方案",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOIP2006 提高组"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "dep",
		typeTitle: "有依赖的背包",
		pid: "P2014",
		name: "[CTSC1997] 选课",
		diff: "提高+/省选-",
		kind: "example",
		src: "CTSC1997（洛谷原生 P）"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "dep",
		typeTitle: "有依赖的背包",
		pid: "P1064",
		name: "[NOIP2006 提高组] 金明的预算方案",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "dep",
		typeTitle: "有依赖的背包",
		pid: "P2014",
		name: "[CTSC1997] 选课",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "variant",
		typeTitle: "背包综合变形",
		pid: "P1164",
		name: "小 A 点菜",
		diff: "普及-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "variant",
		typeTitle: "背包综合变形",
		pid: "P4141",
		name: "消失之物",
		diff: "提高+/省选-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "variant",
		typeTitle: "背包综合变形",
		pid: "P2347",
		name: "[NOIP1996 提高组] 砝码称重",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "variant",
		typeTitle: "背包综合变形",
		pid: "P2563",
		name: "[AHOI2001] 质数和分解",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "variant",
		typeTitle: "背包综合变形",
		pid: "P1077",
		name: "[NOIP2012 普及组] 摆花",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "fractional",
		typeTitle: "辨析：分数背包=贪心",
		pid: "P1208",
		name: "[USACO1.3] 混合牛奶 Mixing Milk",
		diff: "普及-",
		kind: "example",
		src: "USACO 原生"
	},
	{
		part: "a",
		partTitle: "背包 DP",
		slug: "fractional",
		typeTitle: "辨析：分数背包=贪心",
		pid: "P1208",
		name: "[USACO1.3] 混合牛奶 Mixing Milk",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "path",
		typeTitle: "路径型 / 递推入门",
		pid: "P1216",
		name: "[USACO1.5][IOI1994] 数字三角形 Number Triangles",
		diff: "普及-",
		kind: "example",
		src: "IOI1994"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "path",
		typeTitle: "路径型 / 递推入门",
		pid: "P1002",
		name: "[NOIP2002 普及组] 过河卒",
		diff: "普及-",
		kind: "example",
		src: "NOIP2002 普及组"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "path",
		typeTitle: "路径型 / 递推入门",
		pid: "P1004",
		name: "[NOIP2000 提高组] 方格取数",
		diff: "普及/提高-",
		kind: "example",
		src: "NOIP2000 提高组"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "path",
		typeTitle: "路径型 / 递推入门",
		pid: "P1508",
		name: "Likecloud-吃、吃、吃",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "path",
		typeTitle: "路径型 / 递推入门",
		pid: "P1216",
		name: "[USACO1.5][IOI1994] 数字三角形",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "path",
		typeTitle: "路径型 / 递推入门",
		pid: "P1057",
		name: "[NOIP2008 普及组] 传球游戏",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "maxseg",
		typeTitle: "最大子段和",
		pid: "P1115",
		name: "最大子段和",
		diff: "普及-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "maxseg",
		typeTitle: "最大子段和",
		pid: "P2642",
		name: "双子序列最大和",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "maxseg",
		typeTitle: "最大子段和",
		pid: "P1121",
		name: "环状最大两段子段和",
		diff: "提高+/省选-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "maxseg",
		typeTitle: "最大子段和",
		pid: "P1719",
		name: "最大加权矩形",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "maxseg",
		typeTitle: "最大子段和",
		pid: "P2642",
		name: "双子序列最大和（回炉自测）",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "lis",
		typeTitle: "最长上升子序列 LIS",
		pid: "B3637",
		name: "最长上升子序列",
		diff: "入门",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "lis",
		typeTitle: "最长上升子序列 LIS",
		pid: "P1020",
		name: "[NOIP1999 提高组] 导弹拦截",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOIP1999 提高"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "lis",
		typeTitle: "最长上升子序列 LIS",
		pid: "P1091",
		name: "[NOIP2004 提高组] 合唱队形",
		diff: "普及/提高-",
		kind: "example",
		src: "NOIP2004 提高"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "lis",
		typeTitle: "最长上升子序列 LIS",
		pid: "P2782",
		name: "友好城市",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "lis",
		typeTitle: "最长上升子序列 LIS",
		pid: "P1439",
		name: "【模板】最长公共子序列",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "lis",
		typeTitle: "最长上升子序列 LIS",
		pid: "P1725",
		name: "琪露诺",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "lcs",
		typeTitle: "最长公共子序列 LCS",
		pid: "P1439",
		name: "【模板】最长公共子序列",
		diff: "提高+/省选-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "lcs",
		typeTitle: "最长公共子序列 LCS",
		pid: "P4303",
		name: "[AHOI2006] 基因匹配",
		diff: "提高+/省选-",
		kind: "example",
		src: "AHOI2006"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "lcs",
		typeTitle: "最长公共子序列 LCS",
		pid: "P2516",
		name: "[HAOI2010] 最长公共子序列",
		diff: "提高+/省选-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "lcs",
		typeTitle: "最长公共子序列 LCS",
		pid: "P2837",
		name: "晚餐队列优化 Dining Cows",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "lcs",
		typeTitle: "最长公共子序列 LCS",
		pid: "P1279",
		name: "字串距离",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "edit",
		typeTitle: "编辑距离",
		pid: "P2758",
		name: "编辑距离",
		diff: "普及/提高-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "edit",
		typeTitle: "编辑距离",
		pid: "P1279",
		name: "字串距离",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "edit",
		typeTitle: "编辑距离",
		pid: "P1032",
		name: "[NOIP2002 提高组] 字串变换",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "fsm",
		typeTitle: "线性状态机 DP",
		pid: "P2196",
		name: "[NOIP1996 提高组] 挖地雷",
		diff: "普及/提高-",
		kind: "example",
		src: "NOIP1996 提高"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "fsm",
		typeTitle: "线性状态机 DP",
		pid: "P4310",
		name: "绝世好题",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "fsm",
		typeTitle: "线性状态机 DP",
		pid: "P2569",
		name: "[SCOI2010] 股票交易",
		diff: "省选/NOI-",
		kind: "example",
		src: "SCOI2010"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "fsm",
		typeTitle: "线性状态机 DP",
		pid: "P1799",
		name: "数列",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "fsm",
		typeTitle: "线性状态机 DP",
		pid: "P1103",
		name: "书本整理",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "fsm",
		typeTitle: "线性状态机 DP",
		pid: "P1868",
		name: "饥饿的奶牛",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "count",
		typeTitle: "计数 / 划分型",
		pid: "P1255",
		name: "数楼梯",
		diff: "普及-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "count",
		typeTitle: "计数 / 划分型",
		pid: "P1077",
		name: "[NOIP2012 普及组] 摆花",
		diff: "普及/提高-",
		kind: "example",
		src: "NOIP2012 普及"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "count",
		typeTitle: "计数 / 划分型",
		pid: "P2401",
		name: "不等数列",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "count",
		typeTitle: "计数 / 划分型",
		pid: "P2513",
		name: "[HAOI2009] 逆序对数列",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "count",
		typeTitle: "计数 / 划分型",
		pid: "P1057",
		name: "[NOIP2008 普及组] 传球游戏",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "b",
		partTitle: "线性 DP",
		slug: "count",
		typeTitle: "计数 / 划分型",
		pid: "P2404",
		name: "自然数的拆分问题",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "stone",
		typeTitle: "石子合并（链形）",
		pid: "P1880",
		name: "[NOI1995] 石子合并",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOI1995"
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "stone",
		typeTitle: "石子合并（链形）",
		pid: "P5019",
		name: "[NOIP2018 提高组] 铺设道路",
		diff: "普及/提高-",
		kind: "example",
		src: "NOIP2018 提高组"
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "stone",
		typeTitle: "石子合并（链形）",
		pid: "P1775",
		name: "石子合并（弱化版）",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "stone",
		typeTitle: "石子合并（链形）",
		pid: "P1043",
		name: "[NOIP2003 普及组] 数字游戏",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "ring",
		typeTitle: "环形区间 DP",
		pid: "P1880",
		name: "[NOI1995] 石子合并",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOI1995"
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "ring",
		typeTitle: "环形区间 DP",
		pid: "P1063",
		name: "[NOIP2006 提高组] 能量项链",
		diff: "普及+/提高",
		kind: "example",
		src: "NOIP2006 提高组"
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "ring",
		typeTitle: "环形区间 DP",
		pid: "P1043",
		name: "[NOIP2003 普及组] 数字游戏",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "ring",
		typeTitle: "环形区间 DP",
		pid: "P2426",
		name: "删数",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "palindrome",
		typeTitle: "回文 / 括号",
		pid: "P1435",
		name: "[IOI2000] 回文字串",
		diff: "普及/提高-",
		kind: "example",
		src: "IOI2000"
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "palindrome",
		typeTitle: "回文 / 括号",
		pid: "P4170",
		name: "[CQOI2007] 涂色",
		diff: "普及+/提高",
		kind: "example",
		src: "CQOI2007"
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "palindrome",
		typeTitle: "回文 / 括号",
		pid: "P3205",
		name: "[HNOI2010] 合唱队",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "palindrome",
		typeTitle: "回文 / 括号",
		pid: "P2426",
		name: "删数",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "tree",
		typeTitle: "加分二叉树型",
		pid: "P1040",
		name: "[NOIP2003 提高组] 加分二叉树",
		diff: "普及+/提高",
		kind: "example",
		src: "NOIP2003 提高组"
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "tree",
		typeTitle: "加分二叉树型",
		pid: "P1880",
		name: "[NOI1995] 石子合并",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOI1995"
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "tree",
		typeTitle: "加分二叉树型",
		pid: "P1436",
		name: "棋盘分割",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "tree",
		typeTitle: "加分二叉树型",
		pid: "P1043",
		name: "[NOIP2003 普及组] 数字游戏",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "merge",
		typeTitle: "合并 / 删除类",
		pid: "P3146",
		name: "[USACO16OPEN] 248 G",
		diff: "普及+/提高",
		kind: "example",
		src: "USACO2016(原生P)"
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "merge",
		typeTitle: "合并 / 删除类",
		pid: "P1436",
		name: "棋盘分割",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOI1999"
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "merge",
		typeTitle: "合并 / 删除类",
		pid: "P2858",
		name: "[USACO06FEB] Treats for the Cows G/S 奶牛零食",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "merge",
		typeTitle: "合并 / 删除类",
		pid: "P2426",
		name: "删数",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "c",
		partTitle: "区间 DP",
		slug: "merge",
		typeTitle: "合并 / 删除类",
		pid: "P2196",
		name: "[NOIP1996 提高组] 挖地雷",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "d",
		partTitle: "矩阵 DP",
		slug: "grid",
		typeTitle: "网格 / 矩阵上的 DP",
		pid: "P1387",
		name: "最大正方形",
		diff: "普及/提高-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "d",
		partTitle: "矩阵 DP",
		slug: "grid",
		typeTitle: "网格 / 矩阵上的 DP",
		pid: "P1006",
		name: "[NOIP2008 提高组] 传纸条",
		diff: "普及+/提高",
		kind: "example",
		src: "NOIP2008 提高组"
	},
	{
		part: "d",
		partTitle: "矩阵 DP",
		slug: "grid",
		typeTitle: "网格 / 矩阵上的 DP",
		pid: "P1719",
		name: "最大加权矩形",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "d",
		partTitle: "矩阵 DP",
		slug: "grid",
		typeTitle: "网格 / 矩阵上的 DP",
		pid: "P1736",
		name: "创意吃鱼法",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "d",
		partTitle: "矩阵 DP",
		slug: "grid",
		typeTitle: "网格 / 矩阵上的 DP",
		pid: "P2701",
		name: "[USACO5.3] 巨大的牛棚 Big Barn",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "d",
		partTitle: "矩阵 DP",
		slug: "matpow",
		typeTitle: "矩阵快速幂加速",
		pid: "P1962",
		name: "斐波那契数列",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "d",
		partTitle: "矩阵 DP",
		slug: "matpow",
		typeTitle: "矩阵快速幂加速",
		pid: "P3390",
		name: "【模板】矩阵快速幂",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "d",
		partTitle: "矩阵 DP",
		slug: "matpow",
		typeTitle: "矩阵快速幂加速",
		pid: "P1939",
		name: "【模板】矩阵加速（数列）",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "d",
		partTitle: "矩阵 DP",
		slug: "matpow",
		typeTitle: "矩阵快速幂加速",
		pid: "P2233",
		name: "[HNOI2002] 公交车路线",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "d",
		partTitle: "矩阵 DP",
		slug: "matpow",
		typeTitle: "矩阵快速幂加速",
		pid: "P4159",
		name: "[SCOI2009] 迷路",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "d",
		partTitle: "矩阵 DP",
		slug: "matpow",
		typeTitle: "矩阵快速幂加速",
		pid: "P1707",
		name: "刷题比赛",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "basic",
		typeTitle: "换根基础模型",
		pid: "P3478",
		name: "[POI2008] STA-Station",
		diff: "提高+/省选-",
		kind: "example",
		src: "POI 2008"
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "basic",
		typeTitle: "换根基础模型",
		pid: "P1395",
		name: "会议",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "basic",
		typeTitle: "换根基础模型",
		pid: "P2986",
		name: "[USACO10MAR] Great Cow Gathering G",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "basic",
		typeTitle: "换根基础模型",
		pid: "P3047",
		name: "[USACO12FEB] Nearby Cows G",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "basic",
		typeTitle: "换根基础模型",
		pid: "P1364",
		name: "医院设置",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "distsum",
		typeTitle: "距离和换根",
		pid: "P2986",
		name: "[USACO10MAR] Great Cow Gathering G",
		diff: "提高+/省选-",
		kind: "example",
		src: "USACO 2010"
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "distsum",
		typeTitle: "距离和换根",
		pid: "P1364",
		name: "医院设置",
		diff: "普及/提高-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "distsum",
		typeTitle: "距离和换根",
		pid: "P1395",
		name: "会议",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "distsum",
		typeTitle: "距离和换根",
		pid: "P3478",
		name: "[POI2008] STA-Station",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "distsum",
		typeTitle: "距离和换根",
		pid: "P2986",
		name: "[USACO10MAR] Great Cow Gathering G",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "inout",
		typeTitle: "子树内外合并",
		pid: "P3047",
		name: "[USACO12FEB] Nearby Cows G",
		diff: "提高+/省选-",
		kind: "example",
		src: "USACO 2012"
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "inout",
		typeTitle: "子树内外合并",
		pid: "P1395",
		name: "会议",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "inout",
		typeTitle: "子树内外合并",
		pid: "P6419",
		name: "[COCI2014-2015#1] Kamp",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "inout",
		typeTitle: "子树内外合并",
		pid: "P1395",
		name: "会议",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "inout",
		typeTitle: "子树内外合并",
		pid: "P3478",
		name: "[POI2008] STA-Station",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "center",
		typeTitle: "中心 / 偏心距",
		pid: "P1099",
		name: "[NOIP2007 提高组] 树网的核",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOIP 2007"
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "center",
		typeTitle: "中心 / 偏心距",
		pid: "P1364",
		name: "医院设置",
		diff: "普及/提高-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "center",
		typeTitle: "中心 / 偏心距",
		pid: "P3574",
		name: "[POI2014] FAR-FarmCraft",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "center",
		typeTitle: "中心 / 偏心距",
		pid: "P1364",
		name: "医院设置",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "e",
		partTitle: "换根 DP",
		slug: "center",
		typeTitle: "中心 / 偏心距",
		pid: "P1099",
		name: "[NOIP2007 提高组] 树网的核",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "select",
		typeTitle: "选点 / 最大独立集",
		pid: "P1352",
		name: "没有上司的舞会",
		diff: "普及/提高-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "select",
		typeTitle: "选点 / 最大独立集",
		pid: "P2016",
		name: "战略游戏",
		diff: "普及/提高-",
		kind: "example",
		src: "SEERC 2000"
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "select",
		typeTitle: "选点 / 最大独立集",
		pid: "P2458",
		name: "[SDOI2006] 保安站岗",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "select",
		typeTitle: "选点 / 最大独立集",
		pid: "P1122",
		name: "最大子树和",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "select",
		typeTitle: "选点 / 最大独立集",
		pid: "P1352",
		name: "没有上司的舞会（自测）",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "knapsack",
		typeTitle: "树上背包",
		pid: "P2015",
		name: "二叉苹果树",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "knapsack",
		typeTitle: "树上背包",
		pid: "P2014",
		name: "[CTSC1997] 选课",
		diff: "提高+/省选-",
		kind: "example",
		src: "CTSC 1997"
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "knapsack",
		typeTitle: "树上背包",
		pid: "P1273",
		name: "有线电视网",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "knapsack",
		typeTitle: "树上背包",
		pid: "P3177",
		name: "[HAOI2015] 树上染色",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "knapsack",
		typeTitle: "树上背包",
		pid: "P1064",
		name: "[NOIP2006] 金明的预算方案",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "diameter",
		typeTitle: "直径 / 重心 DP",
		pid: "P1099",
		name: "[NOIP2007] 树网的核",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOIP 2007 提高组"
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "diameter",
		typeTitle: "直径 / 重心 DP",
		pid: "P1122",
		name: "最大子树和",
		diff: "普及/提高-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "diameter",
		typeTitle: "直径 / 重心 DP",
		pid: "P1131",
		name: "[ZJOI2007] 时态同步",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "diameter",
		typeTitle: "直径 / 重心 DP",
		pid: "P1364",
		name: "医院设置",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "diameter",
		typeTitle: "直径 / 重心 DP",
		pid: "P1122",
		name: "最大子树和（自测）",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "cover",
		typeTitle: "覆盖 / 支配 / 染色",
		pid: "P2458",
		name: "[SDOI2006] 保安站岗",
		diff: "提高+/省选-",
		kind: "example",
		src: "SDOI 2006"
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "cover",
		typeTitle: "覆盖 / 支配 / 染色",
		pid: "P2585",
		name: "[ZJOI2006] 三色二叉树",
		diff: "提高+/省选-",
		kind: "example",
		src: "ZJOI 2006"
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "cover",
		typeTitle: "覆盖 / 支配 / 染色",
		pid: "P2279",
		name: "[HNOI2003] 消防局的设立",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "cover",
		typeTitle: "覆盖 / 支配 / 染色",
		pid: "P5018",
		name: "[NOIP2018] 对称二叉树",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "cover",
		typeTitle: "覆盖 / 支配 / 染色",
		pid: "P2585",
		name: "三色二叉树（自测）",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "count",
		typeTitle: "方案数 / 距离统计",
		pid: "P1351",
		name: "[NOIP2014] 联合权值",
		diff: "普及+/提高",
		kind: "example",
		src: "NOIP 2014 提高组"
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "count",
		typeTitle: "方案数 / 距离统计",
		pid: "P5658",
		name: "[CSP-S2019] 括号树",
		diff: "提高+/省选-",
		kind: "example",
		src: "CSP-S 2019"
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "count",
		typeTitle: "方案数 / 距离统计",
		pid: "P2585",
		name: "[ZJOI2006] 三色二叉树（计数向）",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "count",
		typeTitle: "方案数 / 距离统计",
		pid: "P1131",
		name: "[ZJOI2007] 时态同步",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "f",
		partTitle: "树形 DP",
		slug: "count",
		typeTitle: "方案数 / 距离统计",
		pid: "P1352",
		name: "没有上司的舞会（回顾）",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "board",
		typeTitle: "棋盘 / 轮廓状压",
		pid: "P1896",
		name: "[SCOI2005] 互不侵犯",
		diff: "普及+/提高",
		kind: "example",
		src: "SCOI2005"
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "board",
		typeTitle: "棋盘 / 轮廓状压",
		pid: "P1879",
		name: "[USACO06NOV] Corn Fields G",
		diff: "普及+/提高",
		kind: "example",
		src: "USACO 2006"
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "board",
		typeTitle: "棋盘 / 轮廓状压",
		pid: "P2704",
		name: "[NOI2001] 炮兵阵地",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOI2001"
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "board",
		typeTitle: "棋盘 / 轮廓状压",
		pid: "P2622",
		name: "关灯问题 II",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "board",
		typeTitle: "棋盘 / 轮廓状压",
		pid: "P2915",
		name: "[USACO08NOV] Mixed Up Cows G",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "board",
		typeTitle: "棋盘 / 轮廓状压",
		pid: "P3694",
		name: "邦邦的大合唱站队",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "tsp",
		typeTitle: "集合状压 / TSP",
		pid: "P10447",
		name: "最短 Hamilton 路径",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "tsp",
		typeTitle: "集合状压 / TSP",
		pid: "P1433",
		name: "吃奶酪",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "tsp",
		typeTitle: "集合状压 / TSP",
		pid: "P1171",
		name: "售货员的难题",
		diff: "普及+/提高",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "tsp",
		typeTitle: "集合状压 / TSP",
		pid: "P2831",
		name: "[NOIP2016 提高组] 愤怒的小鸟",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "tsp",
		typeTitle: "集合状压 / TSP",
		pid: "P2915",
		name: "[USACO08NOV] Mixed Up Cows G",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "cover",
		typeTitle: "状压 + 覆盖",
		pid: "P2831",
		name: "[NOIP2016 提高组] 愤怒的小鸟",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOIP2016"
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "cover",
		typeTitle: "状压 + 覆盖",
		pid: "P3959",
		name: "[NOIP2017 提高组] 宝藏",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOIP2017"
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "cover",
		typeTitle: "状压 + 覆盖",
		pid: "P2622",
		name: "关灯问题 II",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "cover",
		typeTitle: "状压 + 覆盖",
		pid: "P3694",
		name: "邦邦的大合唱站队",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "subset",
		typeTitle: "综合技巧",
		pid: "P4163",
		name: "[SCOI2007] 排列",
		diff: "普及+/提高",
		kind: "example",
		src: "SCOI2007"
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "subset",
		typeTitle: "综合技巧",
		pid: "P3959",
		name: "[NOIP2017 提高组] 宝藏",
		diff: "提高+/省选-",
		kind: "example",
		src: "NOIP2017"
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "subset",
		typeTitle: "综合技巧",
		pid: "P2831",
		name: "[NOIP2016 提高组] 愤怒的小鸟",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "subset",
		typeTitle: "综合技巧",
		pid: "P2915",
		name: "[USACO08NOV] Mixed Up Cows G",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "subset",
		typeTitle: "综合技巧",
		pid: "P3959",
		name: "[NOIP2017 提高组] 宝藏",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "plug",
		typeTitle: "插头 DP（选修）",
		pid: "P5056",
		name: "【模板】插头 DP",
		diff: "省选/NOI-",
		kind: "example",
		src: "洛谷原生"
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "plug",
		typeTitle: "插头 DP（选修）",
		pid: "P5056",
		name: "【模板】插头 DP（反复精练）",
		diff: "",
		kind: "exercise",
		src: ""
	},
	{
		part: "g",
		partTitle: "状压 DP",
		slug: "plug",
		typeTitle: "插头 DP（选修）",
		pid: "P2704",
		name: "[NOI2001] 炮兵阵地（对照回顾）",
		diff: "",
		kind: "exercise",
		src: ""
	}
];
//#endregion
//#region src/pages/ProblemsPage.tsx
var PAGE_SIZE = 30;
var KINDS$1 = [
	{
		k: "all",
		label: "全部"
	},
	{
		k: "example",
		label: "例题"
	},
	{
		k: "exercise",
		label: "练习"
	}
];
function diffTier(d) {
	if (!d) return "none";
	if (d.includes("入门")) return "t1";
	if (d.includes("省选") || d.includes("NOI")) return "t4";
	if (d.includes("提高")) return "t3";
	if (d.includes("普及")) return "t2";
	return "t2";
}
function ProblemsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const requestedPart = searchParams.get("part") || "all";
	const part = requestedPart === "all" || PARTS.some((item) => item.id === requestedPart) ? requestedPart : "all";
	const requestedKind = searchParams.get("kind");
	const kind = requestedKind === "example" || requestedKind === "exercise" ? requestedKind : "all";
	const q = (searchParams.get("q") || "").slice(0, 80);
	const deferredQ = useDeferredValue(q);
	const lastSearchEvent = useRef("");
	const updateParams = (changes, options = { resetPage: true }) => {
		const next = new URLSearchParams(searchParams);
		for (const [key, value] of Object.entries(changes)) if (!value || value === "all" || key === "page" && value === "1") next.delete(key);
		else next.set(key, value);
		if (options.resetPage !== false) next.delete("page");
		setSearchParams(next, { replace: true });
	};
	const filtered = useMemo(() => {
		const query = deferredQ.trim().toLowerCase();
		return PROBLEMS.filter((p) => {
			if (part !== "all" && p.part !== part) return false;
			if (kind !== "all" && p.kind !== kind) return false;
			if (query && !`${p.pid} ${p.name} ${p.typeTitle}`.toLowerCase().includes(query)) return false;
			return true;
		});
	}, [
		part,
		kind,
		deferredQ
	]);
	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
	const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1;
	const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter((value) => value === 1 || value === totalPages || Math.abs(value - page) <= 2);
	useEffect(() => {
		const search = deferredQ.trim();
		if (search.length < 2 || lastSearchEvent.current === search) return;
		lastSearchEvent.current = search;
		trackAnalyticsEvent({
			event: filtered.length === 0 ? "search_no_result" : "search_used",
			path: "/problems",
			metadata: {
				queryLength: search.length,
				results: filtered.length
			}
		});
	}, [deferredQ, filtered.length]);
	const exCount = PROBLEMS.filter((p) => p.kind === "example").length;
	const uniqueCount = new Set(PROBLEMS.map((p) => p.pid)).size;
	const readyParts = PARTS.filter((p) => p.types.some((t) => t.status === "ready"));
	return /* @__PURE__ */ jsxs("div", {
		className: "problems",
		children: [
			/* @__PURE__ */ jsx(AnimatedContent, { children: /* @__PURE__ */ jsxs("section", {
				className: "problems-hero",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "problems-hero__eyebrow",
						children: "题库"
					}),
					/* @__PURE__ */ jsx("h1", { children: "题目索引" }),
					/* @__PURE__ */ jsxs("p", {
						className: "problems-hero__lead",
						children: [
							"全站 ",
							PROBLEMS.length,
							" 个学习条目（例题 ",
							exCount,
							" · 练习 ",
							PROBLEMS.length - exCount,
							" · 去重后 ",
							uniqueCount,
							" 道题），全部洛谷原生。 点题号去洛谷提交，点类型进对应讲解。"
						]
					})
				]
			}) }),
			/* @__PURE__ */ jsxs("div", {
				className: "problems-toolbar",
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "problems-search",
						children: [/* @__PURE__ */ jsx(Search, { size: 16 }), /* @__PURE__ */ jsx("input", {
							value: q,
							onChange: (e) => updateParams({ q: e.target.value }),
							placeholder: "搜题号 / 题名 / 类型…",
							"aria-label": "搜索题目"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "problems-chips",
						children: [/* @__PURE__ */ jsx("button", {
							className: `chip${part === "all" ? " on" : ""}`,
							onClick: () => updateParams({ part: "all" }),
							children: "全部家族"
						}), readyParts.map((p) => /* @__PURE__ */ jsxs("button", {
							className: `chip${part === p.id ? " on" : ""}`,
							onClick: () => updateParams({ part: p.id }),
							children: [
								p.code,
								" · ",
								p.title
							]
						}, p.id))]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "problems-chips",
						children: KINDS$1.map((k) => /* @__PURE__ */ jsx("button", {
							className: `chip${kind === k.k ? " on" : ""}`,
							onClick: () => updateParams({ kind: k.k }),
							children: k.label
						}, k.k))
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "problems-count",
				role: "status",
				children: [
					filtered.length,
					" 个条目",
					filtered.length > PAGE_SIZE && ` · 第 ${page} / ${totalPages} 页`
				]
			}),
			/* @__PURE__ */ jsx(AnimatedContent, {
				distance: 10,
				delay: .02,
				children: /* @__PURE__ */ jsxs("div", {
					className: "problems-list",
					children: [visible.map((p, i) => /* @__PURE__ */ jsxs("div", {
						className: "prob",
						children: [
							/* @__PURE__ */ jsxs("a", {
								className: "prob__pid",
								href: `https://www.luogu.com.cn/problem/${p.pid}`,
								target: "_blank",
								rel: "noreferrer",
								onClick: () => trackAnalyticsEvent({
									event: "problem_outbound",
									path: "/problems",
									metadata: {
										problem: p.pid,
										part: p.part
									}
								}),
								children: [
									p.pid,
									" ",
									/* @__PURE__ */ jsx(ExternalLink, { size: 12 })
								]
							}),
							/* @__PURE__ */ jsx("span", {
								className: "prob__name",
								children: p.name
							}),
							p.diff && /* @__PURE__ */ jsx("span", {
								className: "prob__diff",
								"data-tier": diffTier(p.diff),
								children: p.diff
							}),
							/* @__PURE__ */ jsxs(Link, {
								className: "prob__type",
								to: `/part/${p.part}/${p.slug}`,
								children: [
									p.partTitle,
									" · ",
									p.typeTitle
								]
							}),
							/* @__PURE__ */ jsx("span", {
								className: `prob__kind prob__kind--${p.kind}`,
								children: p.kind === "example" ? "例题" : "练习"
							})
						]
					}, `${p.pid}-${p.part}-${p.slug}-${i}`)), filtered.length === 0 && /* @__PURE__ */ jsx("div", {
						className: "problems-empty",
						children: "没有匹配的题目。"
					})]
				})
			}, `${part}-${kind}-${deferredQ}-${page}`),
			filtered.length > PAGE_SIZE && /* @__PURE__ */ jsxs("nav", {
				className: "problems-pagination",
				"aria-label": "题库分页",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						disabled: page === 1,
						onClick: () => updateParams({ page: String(page - 1) }, { resetPage: false }),
						children: "上一页"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "problems-pagination__pages",
						children: pageNumbers.map((value, index) => {
							const previous = pageNumbers[index - 1];
							return /* @__PURE__ */ jsxs("span", {
								className: "problems-pagination__item",
								children: [previous && value - previous > 1 && /* @__PURE__ */ jsx("span", {
									"aria-hidden": "true",
									children: "…"
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									className: value === page ? "current" : "",
									"aria-current": value === page ? "page" : void 0,
									onClick: () => updateParams({ page: String(value) }, { resetPage: false }),
									children: value
								})]
							}, value);
						})
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						disabled: page === totalPages,
						onClick: () => updateParams({ page: String(page + 1) }, { resetPage: false }),
						children: "下一页"
					})
				]
			})
		]
	});
}
//#endregion
//#region src/theme/ThemeContext.tsx
var Ctx = createContext({
	theme: "dark",
	toggle: () => {}
});
var KEY = "dp-master-theme";
function ThemeProvider({ children }) {
	const [theme, setTheme] = useState("dark");
	const hydrated = useRef(false);
	useEffect(() => {
		if (!hydrated.current) {
			hydrated.current = true;
			let saved = null;
			try {
				saved = localStorage.getItem(KEY);
			} catch {}
			if (saved === "light") setTheme("light");
			else document.documentElement.dataset.theme = "dark";
			return;
		}
		document.documentElement.dataset.theme = theme;
		document.querySelector("meta[name=\"theme-color\"]")?.setAttribute("content", theme === "light" ? "#f4f1ea" : "#0b0a09");
		try {
			localStorage.setItem(KEY, theme);
		} catch {}
	}, [theme]);
	const toggle = () => setTheme((t) => t === "dark" ? "light" : "dark");
	return /* @__PURE__ */ jsx(Ctx.Provider, {
		value: {
			theme,
			toggle
		},
		children
	});
}
var useTheme = () => useContext(Ctx);
//#endregion
//#region src/components/layout/ErrorBoundary.tsx
var ErrorBoundary = class extends Component {
	state = { error: null };
	static getDerivedStateFromError(error) {
		return { error };
	}
	componentDidCatch(error, info) {
		console.error("[DP大师] 路由渲染出错：", error, info.componentStack);
		trackAnalyticsEvent({
			event: "client_error",
			path: window.location.pathname,
			metadata: {
				source: "react_boundary",
				message: error.message.slice(0, 160),
				component: (info.componentStack || "").trim().slice(0, 160)
			}
		});
	}
	mainRef = (node) => {
		node?.focus();
	};
	handleReload = () => {
		window.location.reload();
	};
	render() {
		const { error } = this.state;
		if (!error) return this.props.children;
		return /* @__PURE__ */ jsx("div", {
			ref: this.mainRef,
			tabIndex: -1,
			className: "error-boundary",
			role: "alert",
			"aria-live": "assertive",
			children: /* @__PURE__ */ jsxs("div", {
				className: "error-boundary__card",
				children: [
					/* @__PURE__ */ jsx("h1", { children: "这一页加载出了问题" }),
					/* @__PURE__ */ jsx("p", { children: "页面在渲染时出错。你可以重试，或返回首页继续学习。" }),
					/* @__PURE__ */ jsx("p", {
						className: "error-boundary__detail",
						children: error.message
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "error-boundary__actions",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: this.handleReload,
							children: "重新加载"
						}), /* @__PURE__ */ jsx("a", {
							href: "/",
							children: "返回首页"
						})]
					})
				]
			})
		});
	}
};
//#endregion
//#region src/components/layout/Sidebar.tsx
function Sidebar({ onNavigate }) {
	const activePid = useMatch("/part/:pid/*")?.params.pid;
	const { completed } = useLearningProgress();
	const reduceMotion = useReducedMotion();
	return /* @__PURE__ */ jsxs("div", {
		className: "sidebar-inner",
		children: [/* @__PURE__ */ jsxs("nav", {
			className: "sidebar-nav",
			"aria-label": "主导航",
			children: [
				/* @__PURE__ */ jsxs(NavLink, {
					to: "/",
					end: true,
					className: "brand",
					onClick: onNavigate,
					children: [/* @__PURE__ */ jsx("span", {
						className: "brand__mark",
						"aria-hidden": "true",
						children: /* @__PURE__ */ jsx("img", {
							src: "/favicon.svg",
							alt: "",
							width: "32",
							height: "32"
						})
					}), /* @__PURE__ */ jsxs("span", {
						className: "brand__wordmark",
						children: [/* @__PURE__ */ jsx("span", {
							className: "brand__name",
							children: BRAND.name
						}), /* @__PURE__ */ jsx("span", {
							className: "brand__sub",
							children: BRAND.subtitle
						})]
					})]
				}),
				PARTS.map((p) => {
					const open = p.id === activePid;
					return /* @__PURE__ */ jsxs("div", {
						className: "nav-group",
						children: [/* @__PURE__ */ jsxs(NavLink, {
							to: `/part/${p.id}`,
							end: true,
							className: `nav-part${open ? " active open" : ""}`,
							onClick: onNavigate,
							title: p.title,
							children: [/* @__PURE__ */ jsx("span", {
								className: "nav-part__badge",
								style: { ["--nav-family"]: `var(--${p.id}-1)` },
								children: /* @__PURE__ */ jsx("span", {
									className: "nav-part__code",
									children: p.code
								})
							}), /* @__PURE__ */ jsx("span", {
								className: "nav-part__title",
								children: p.title
							})]
						}), /* @__PURE__ */ jsx(AnimatePresence, {
							initial: false,
							children: open && /* @__PURE__ */ jsx(motion.div, {
								className: "nav-types",
								initial: reduceMotion ? false : {
									height: 0,
									opacity: 0,
									y: -8
								},
								animate: {
									height: "auto",
									opacity: 1,
									y: 0
								},
								exit: reduceMotion ? { height: 0 } : {
									height: 0,
									opacity: 0,
									y: -6
								},
								transition: reduceMotion ? { duration: 0 } : {
									duration: .28,
									ease: [
										.16,
										1,
										.3,
										1
									]
								},
								children: p.types.map((t, index) => {
									const compactCode = String(index + 1).padStart(2, "0");
									return t.status === "ready" ? /* @__PURE__ */ jsxs(NavLink, {
										to: `/part/${p.id}/${t.slug}`,
										className: ({ isActive }) => `nav-type${isActive ? " active" : ""}`,
										onClick: onNavigate,
										"aria-label": t.title,
										title: t.title,
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "nav-type__label",
												children: t.title
											}),
											/* @__PURE__ */ jsx("span", {
												className: "nav-type__compact",
												"aria-hidden": "true",
												children: compactCode
											}),
											/* @__PURE__ */ jsx("span", {
												className: "nav-type__progress",
												"aria-hidden": "true",
												children: completed.includes(`/part/${p.id}/${t.slug}`) && /* @__PURE__ */ jsx(Check, { size: 12 })
											})
										]
									}, t.slug) : /* @__PURE__ */ jsxs("span", {
										className: "nav-type planned",
										title: t.title,
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "nav-type__label",
												children: t.title
											}),
											/* @__PURE__ */ jsx("span", {
												className: "nav-type__compact",
												"aria-hidden": "true",
												children: compactCode
											}),
											/* @__PURE__ */ jsx("span", {
												className: "nav-type__tag",
												children: "待建"
											})
										]
									}, t.slug);
								})
							})
						})]
					}, p.id);
				}),
				/* @__PURE__ */ jsxs(NavLink, {
					to: "/method",
					className: ({ isActive }) => `nav-part${isActive ? " active" : ""}`,
					onClick: onNavigate,
					style: { marginTop: "var(--sp-4)" },
					title: "通用方法论",
					children: [/* @__PURE__ */ jsx("span", {
						className: "nav-part__badge",
						style: { ["--nav-family"]: "var(--accent-1)" },
						children: /* @__PURE__ */ jsx(BookOpen, { size: 15 })
					}), /* @__PURE__ */ jsx("span", {
						className: "nav-part__title",
						children: "通用方法论"
					})]
				}),
				/* @__PURE__ */ jsxs(NavLink, {
					to: "/problems",
					className: ({ isActive }) => `nav-part${isActive ? " active" : ""}`,
					onClick: onNavigate,
					title: "题目索引",
					children: [/* @__PURE__ */ jsx("span", {
						className: "nav-part__badge",
						style: { ["--nav-family"]: "var(--accent-1)" },
						children: /* @__PURE__ */ jsx(Library, { size: 15 })
					}), /* @__PURE__ */ jsx("span", {
						className: "nav-part__title",
						children: "题目索引"
					})]
				}),
				/* @__PURE__ */ jsxs(NavLink, {
					to: "/about",
					className: ({ isActive }) => `nav-part${isActive ? " active" : ""}`,
					onClick: onNavigate,
					title: "关于 · 如何使用",
					children: [/* @__PURE__ */ jsx("span", {
						className: "nav-part__badge",
						style: { ["--nav-family"]: "var(--accent-1)" },
						children: /* @__PURE__ */ jsx(Info, { size: 15 })
					}), /* @__PURE__ */ jsx("span", {
						className: "nav-part__title",
						children: "关于 · 如何使用"
					})]
				})
			]
		}), /* @__PURE__ */ jsxs("footer", {
			className: "sidebar-records",
			"aria-label": "备案信息",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "sidebar-records__intro",
					children: [/* @__PURE__ */ jsx("p", {
						className: "sidebar-records__motto",
						children: BRAND.slogan
					}), /* @__PURE__ */ jsxs("p", {
						className: "sidebar-records__copyright",
						children: [
							"© 2026 ",
							BRAND.owner,
							". All rights reserved."
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "sidebar-record",
					children: [/* @__PURE__ */ jsx("img", {
						className: "sidebar-record__icon",
						src: "/beian.png",
						alt: ""
					}), /* @__PURE__ */ jsx("span", { children: "鲁公网安备37100202000975号" })]
				}),
				/* @__PURE__ */ jsx("a", {
					className: "sidebar-record sidebar-record--icp",
					href: "https://beian.miit.gov.cn/",
					children: "鲁ICP备2026039717号"
				})
			]
		})]
	});
}
//#endregion
//#region src/lib/pageMeta.ts
var HOME_DESCRIPTION = "DP大师面向算法学习者，用精讲、逐帧可视化、题目索引和小游戏讲清状态定义、转移顺序与模型迁移。";
var STATIC_META = {
	"/method": {
		title: `通用方法论 · ${BRAND.name}`,
		description: "用状态设计、转移方程、计算顺序、空间优化和调试清单，建立可复用的动态规划解题方法。",
		breadcrumb: "通用方法论"
	},
	"/problems": {
		title: `题目索引 · ${BRAND.name}`,
		description: "按 DP 家族、课程、难度和关键词检索教程中的例题与练习，快速定位对应的洛谷题目和学习路径。",
		breadcrumb: "题目索引"
	},
	"/about": {
		title: `关于 · ${BRAND.name}`,
		description: `了解${BRAND.name}的教学目标、使用方式、内容边界、开源说明与反馈渠道，更高效地使用交互式 DP 课程。`,
		breadcrumb: "关于"
	}
};
function normalizePathname(pathname) {
	const path = (pathname.split(/[?#]/, 1)[0] || "/").replace(/\/{2,}/g, "/");
	return path.length > 1 ? path.replace(/\/$/, "") : "/";
}
function href(origin, path) {
	return `${origin}${path}`;
}
function alternates(path) {
	return [
		{
			hreflang: SITE_CONFIGS.international.hreflang,
			href: href(SITE_CONFIGS.international.origin, path)
		},
		{
			hreflang: SITE_CONFIGS.china.hreflang,
			href: href(SITE_CONFIGS.china.origin, path)
		},
		{
			hreflang: "x-default",
			href: href(SITE_CONFIGS.international.origin, path)
		}
	];
}
function meta(site, path, title, description, routeKind, breadcrumbs, ogType = "website", options = {}) {
	return {
		path,
		title,
		description,
		summary: options.summary ?? description,
		canonical: href(site.origin, path),
		alternates: alternates(path),
		ogType,
		routeKind,
		indexable: true,
		breadcrumbs,
		dateModified: options.dateModified ?? ROUTE_LAST_MODIFIED[path],
		teaches: options.teaches ?? [],
		reviewedBy: options.reviewedBy,
		reviewStatus: options.reviewStatus
	};
}
function getPageMeta(pathname, site = getRuntimeSiteConfig(), lastModified) {
	const path = normalizePathname(pathname);
	if (path === "/") return meta(site, "/", `${BRAND.name} · ${BRAND.subtitle}`, HOME_DESCRIPTION, "home", [{
		name: "首页",
		path: "/"
	}], "website", { dateModified: lastModified });
	const staticMeta = STATIC_META[path];
	if (staticMeta) return meta(site, path, staticMeta.title, staticMeta.description, "static", [{
		name: "首页",
		path: "/"
	}, {
		name: staticMeta.breadcrumb,
		path
	}], "website", { dateModified: lastModified });
	const familyMatch = path.match(/^\/part\/([^/]+)$/);
	if (familyMatch) {
		const part = getPart(familyMatch[1]);
		if (part) return meta(site, path, `${part.title} · ${BRAND.name}`, `${part.title}：${part.tagline}通过 ${part.types.length} 门系统课程、逐帧演示和互动游戏建立完整知识谱系。`, "family", [{
			name: "首页",
			path: "/"
		}, {
			name: part.title,
			path
		}], "website", {
			summary: `${part.title}学习路径以“${part.tagline}”为主线，串联 ${part.types.length} 门课程的状态模型、转移顺序、可视化验证与配套题目。`,
			teaches: part.types.map((type) => type.title),
			dateModified: lastModified
		});
	}
	const lessonMatch = path.match(/^\/part\/([^/]+)\/([^/]+)$/);
	if (lessonMatch) {
		const lesson = getLesson(lessonMatch[1], lessonMatch[2]);
		if (lesson?.type.status === "ready") {
			const editorial = getLessonEditorial(lesson);
			return meta(site, path, `${lesson.type.title} · ${lesson.part.title} · ${BRAND.name}`, `${lesson.type.title}是${BRAND.name}「${lesson.part.title}」家族课程：${lesson.type.blurb}。通过状态定义、转移推导、可编辑演示和配套题目掌握这一类 DP。`, "lesson", [
				{
					name: "首页",
					path: "/"
				},
				{
					name: lesson.part.title,
					path: `/part/${lesson.part.id}`
				},
				{
					name: lesson.type.title,
					path
				}
			], "article", {
				summary: editorial.summary,
				teaches: editorial.outcomes,
				reviewedBy: editorial.reviewedBy,
				reviewStatus: editorial.reviewStatus,
				dateModified: lastModified
			});
		}
	}
	return {
		path,
		title: `页面未找到 · ${BRAND.name}`,
		description: `该页面不在${BRAND.name}当前的课程目录中，请返回首页、家族目录或题目索引继续学习动态规划。`,
		summary: "请求的页面不在当前课程目录中。",
		canonical: null,
		alternates: [],
		ogType: "website",
		routeKind: "not-found",
		indexable: false,
		breadcrumbs: [{
			name: "页面未找到",
			path
		}],
		teaches: []
	};
}
//#endregion
//#region src/components/layout/TopBar.tsx
function TopBar({ onHamburger, mobileOpen }) {
	const { theme, toggle } = useTheme();
	const location = useLocation();
	const match = useMatch("/part/:pid/*");
	const pid = match?.params.pid;
	const slug = match?.params["*"];
	const part = pid ? getPart(pid) : void 0;
	const type = part && slug ? part.types.find((t) => t.slug === slug) : void 0;
	const currentLabel = getPageMeta(location.pathname).title.split(" · ")[0];
	const isHome = location.pathname === "/";
	return /* @__PURE__ */ jsxs("header", {
		className: `topbar${isHome ? " topbar--home" : ""}${mobileOpen ? " topbar--menu-open" : ""}`,
		children: [
			/* @__PURE__ */ jsx("button", {
				className: "icon-btn hamburger",
				onClick: onHamburger,
				"aria-label": mobileOpen ? "关闭导航" : "打开导航",
				"aria-expanded": mobileOpen,
				"aria-controls": "site-sidebar",
				children: mobileOpen ? /* @__PURE__ */ jsx(X, { size: 18 }) : /* @__PURE__ */ jsx(Menu, { size: 18 })
			}),
			!isHome && /* @__PURE__ */ jsxs("nav", {
				className: "crumbs",
				"aria-label": "面包屑",
				children: [
					/* @__PURE__ */ jsx(NavLink, {
						to: "/",
						end: true,
						children: "首页"
					}),
					part && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
						className: "sep",
						children: "/"
					}), type ? /* @__PURE__ */ jsx(Link, {
						to: `/part/${part.id}`,
						children: part.title
					}) : /* @__PURE__ */ jsx("span", {
						className: "cur",
						"aria-current": "page",
						children: part.title
					})] }),
					type && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
						className: "sep",
						children: "/"
					}), /* @__PURE__ */ jsx("span", {
						className: "cur",
						"aria-current": "page",
						children: type.title
					})] }),
					!part && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
						className: "sep",
						children: "/"
					}), /* @__PURE__ */ jsx("span", {
						className: "cur",
						"aria-current": "page",
						children: currentLabel
					})] })
				]
			}),
			/* @__PURE__ */ jsx("div", { className: "topbar__spacer" }),
			/* @__PURE__ */ jsx("button", {
				className: "icon-btn",
				onClick: toggle,
				"aria-label": "切换深浅色",
				children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { size: 18 }) : /* @__PURE__ */ jsx(Moon, { size: 18 })
			})
		]
	});
}
//#endregion
//#region src/components/layout/RouteStage.tsx
var routeEase = [
	.16,
	1,
	.3,
	1
];
function RouteStage() {
	const location = useLocation();
	const outlet = useOutlet();
	const reduceMotion = useReducedMotion();
	const [hasMounted, setHasMounted] = useState(false);
	useEffect(() => {
		setHasMounted(true);
	}, []);
	return /* @__PURE__ */ jsx(motion.div, {
		className: "route-stage",
		initial: reduceMotion || !hasMounted ? false : { opacity: .94 },
		animate: { opacity: 1 },
		transition: reduceMotion ? { duration: 0 } : {
			duration: .22,
			ease: routeEase
		},
		children: outlet
	}, location.pathname);
}
//#endregion
//#region src/components/feedback/FeedbackWidget.tsx
var KINDS = [
	"内容有误",
	"显示异常",
	"功能问题",
	"建议",
	"其他"
];
/** 把当前路由翻成一个人话页面标签，便于反馈自动定位。 */
function pageLabel(pathname) {
	const m = pathname.match(/^\/part\/([a-g])(?:\/([a-z0-9]+))?/);
	if (m) {
		const part = getPart(m[1]);
		if (part) {
			const type = m[2] ? part.types.find((t) => t.slug === m[2]) : void 0;
			return type ? `${part.code} ${part.title} · ${type.title}` : `${part.code} ${part.title}`;
		}
	}
	if (pathname === "/" || pathname === "") return "首页";
	if (pathname.startsWith("/method")) return "方法论";
	return pathname;
}
function FeedbackWidget() {
	const location = useLocation();
	const [open, setOpen] = useState(false);
	const [kind, setKind] = useState("内容有误");
	const [desc, setDesc] = useState("");
	const [steps, setSteps] = useState("");
	const [contact, setContact] = useState("");
	const [includeDiagnostics, setIncludeDiagnostics] = useState(false);
	const [status, setStatus] = useState("idle");
	const [errorMessage, setErrorMessage] = useState("");
	const [receiptId, setReceiptId] = useState("");
	const [copied, setCopied] = useState(false);
	const [page, setPage] = useState("");
	const triggerRef = useRef(null);
	const descRef = useRef(null);
	const dialogRef = useRef(null);
	const doneRef = useRef(null);
	useEffect(() => {
		if (!open) return;
		setPage(pageLabel(location.pathname));
		const t = setTimeout(() => descRef.current?.focus(), 40);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e) => {
			if (e.key === "Escape") close();
			if (e.key === "Tab") {
				const focusable = Array.from(dialogRef.current?.querySelectorAll("button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex=\"-1\"])") ?? []).filter((element) => element.offsetParent !== null);
				if (focusable.length === 0) return;
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (e.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener("keydown", onKey);
		return () => {
			clearTimeout(t);
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);
	const reset = () => {
		setKind("内容有误");
		setDesc("");
		setSteps("");
		setContact("");
		setIncludeDiagnostics(false);
		setStatus("idle");
		setErrorMessage("");
		setReceiptId("");
		setCopied(false);
	};
	const close = () => {
		setOpen(false);
		setTimeout(() => triggerRef.current?.focus(), 0);
		if (status === "ok") setTimeout(reset, 200);
	};
	useEffect(() => {
		if (status === "ok") doneRef.current?.focus();
	}, [status]);
	const payload = () => ({
		kind,
		page,
		path: location.pathname,
		description: desc.trim(),
		steps: steps.trim(),
		contact: contact.trim(),
		url: includeDiagnostics && typeof window !== "undefined" ? window.location.href : "",
		ua: includeDiagnostics && typeof navigator !== "undefined" ? navigator.userAgent : "",
		viewport: includeDiagnostics && typeof window !== "undefined" ? `${window.innerWidth}×${window.innerHeight}` : "",
		ts: (/* @__PURE__ */ new Date()).toISOString()
	});
	const asText = () => {
		const p = payload();
		return [
			`【DP大师 · 反馈】`,
			`类型：${p.kind}`,
			`页面：${p.page}（${p.path}）`,
			`描述：${p.description}`,
			p.steps && `复现/期望：${p.steps}`,
			p.contact && `联系方式：${p.contact}`,
			p.viewport && `环境：${p.viewport} · ${p.ua}`,
			`时间：${p.ts}`
		].filter(Boolean).join("\n");
	};
	const submit = async () => {
		if (desc.trim().length < 4) {
			descRef.current?.focus();
			return;
		}
		setStatus("sending");
		setErrorMessage("");
		trackAnalyticsEvent({
			event: "feedback_submitted",
			path: location.pathname,
			metadata: { kind }
		});
		try {
			const res = await fetch("/api/feedback", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload())
			});
			let result = null;
			try {
				result = await res.json();
			} catch {
				result = null;
			}
			if (!res.ok || !result?.ok || result.status !== "delivered") {
				setErrorMessage(res.status === 429 ? "提交太频繁，请稍后再试。" : result?.message || "提交没成功，请检查网络后再试。");
				setStatus("error");
				trackAnalyticsEvent({
					event: "feedback_failed",
					path: location.pathname,
					metadata: { status: res.status }
				});
				return;
			}
			setReceiptId(result.requestId || "");
			setStatus("ok");
			trackAnalyticsEvent({
				event: "feedback_succeeded",
				path: location.pathname,
				metadata: { kind }
			});
		} catch {
			setErrorMessage("提交没成功，请检查网络后再试。");
			setStatus("error");
			trackAnalyticsEvent({
				event: "feedback_failed",
				path: location.pathname,
				metadata: { status: "network" }
			});
		}
	};
	const copyFallback = async () => {
		try {
			await navigator.clipboard.writeText(asText());
			setCopied(true);
			setTimeout(() => setCopied(false), 1800);
		} catch {}
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("button", {
		ref: triggerRef,
		className: "fbw__fab",
		onClick: () => {
			setOpen(true);
			trackAnalyticsEvent({
				event: "feedback_opened",
				path: location.pathname
			});
		},
		"aria-label": "反馈问题或建议",
		title: "反馈 / 报错",
		children: [/* @__PURE__ */ jsx(MessageSquarePlus, { size: 18 }), /* @__PURE__ */ jsx("span", {
			className: "fbw__fab-label",
			children: "反馈"
		})]
	}), open && /* @__PURE__ */ jsx("div", {
		className: "fbw__overlay",
		onMouseDown: close,
		children: /* @__PURE__ */ jsxs("div", {
			className: "fbw__dialog",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "fbw-title",
			ref: dialogRef,
			onMouseDown: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ jsxs("div", {
				className: "fbw__head",
				children: [/* @__PURE__ */ jsx("h2", {
					id: "fbw-title",
					className: "fbw__title",
					children: "报告问题 · 提建议"
				}), /* @__PURE__ */ jsx("button", {
					className: "fbw__close",
					onClick: close,
					"aria-label": "关闭",
					children: /* @__PURE__ */ jsx(X, { size: 18 })
				})]
			}), status === "ok" ? /* @__PURE__ */ jsxs("div", {
				className: "fbw__done",
				"aria-live": "polite",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "fbw__done-icon",
						children: /* @__PURE__ */ jsx(Check, { size: 26 })
					}),
					/* @__PURE__ */ jsx("p", {
						className: "fbw__done-title",
						children: "已收到，谢谢你！"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "fbw__done-sub",
						children: "反馈已送达维护通道，我们会据此复核和改进。"
					}),
					receiptId && /* @__PURE__ */ jsxs("p", {
						className: "fbw__receipt",
						children: ["回执编号 ", /* @__PURE__ */ jsx("code", { children: receiptId })]
					}),
					/* @__PURE__ */ jsx("button", {
						ref: doneRef,
						className: "fbw__btn fbw__btn--primary",
						onClick: close,
						children: "完成"
					})
				]
			}) : /* @__PURE__ */ jsxs("div", {
				className: "fbw__body",
				children: [
					/* @__PURE__ */ jsxs("fieldset", {
						className: "fbw__field",
						children: [/* @__PURE__ */ jsx("legend", {
							className: "fbw__label",
							children: "这是关于"
						}), /* @__PURE__ */ jsx("div", {
							className: "fbw__kinds",
							children: KINDS.map((k) => /* @__PURE__ */ jsx("button", {
								type: "button",
								className: `fbw__kind${kind === k ? " on" : ""}`,
								"aria-pressed": kind === k,
								onClick: () => setKind(k),
								children: k
							}, k))
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "fbw__field",
						children: [/* @__PURE__ */ jsxs("label", {
							className: "fbw__label",
							children: ["当前页面 ", /* @__PURE__ */ jsx("span", {
								className: "fbw__hint",
								children: "（自动带上，便于定位）"
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "fbw__page",
							children: page
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "fbw__field",
						children: [/* @__PURE__ */ jsxs("label", {
							className: "fbw__label",
							htmlFor: "fbw-desc",
							children: ["具体问题 / 建议 ", /* @__PURE__ */ jsx("span", {
								className: "fbw__req",
								children: "*"
							})]
						}), /* @__PURE__ */ jsx("textarea", {
							id: "fbw-desc",
							ref: descRef,
							className: "fbw__textarea",
							rows: 4,
							value: desc,
							onChange: (e) => setDesc(e.target.value),
							placeholder: "例如：完全背包「跟着算一遍」第 2 步，f[4] 应为 6 不是 5；或某处公式没渲染、演示点了没反应……",
							maxLength: 2e3
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "fbw__field",
						children: [/* @__PURE__ */ jsxs("label", {
							className: "fbw__label",
							htmlFor: "fbw-steps",
							children: ["复现步骤 / 期望 ", /* @__PURE__ */ jsx("span", {
								className: "fbw__hint",
								children: "（选填）"
							})]
						}), /* @__PURE__ */ jsx("textarea", {
							id: "fbw-steps",
							className: "fbw__textarea",
							rows: 2,
							value: steps,
							onChange: (e) => setSteps(e.target.value),
							placeholder: "怎么触发的、你期望是什么样",
							maxLength: 1e3
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "fbw__field",
						children: [/* @__PURE__ */ jsxs("label", {
							className: "fbw__label",
							htmlFor: "fbw-contact",
							children: ["联系方式 ", /* @__PURE__ */ jsx("span", {
								className: "fbw__hint",
								children: "（选填，便于回复）"
							})]
						}), /* @__PURE__ */ jsx("input", {
							id: "fbw-contact",
							className: "fbw__input",
							value: contact,
							onChange: (e) => setContact(e.target.value),
							placeholder: "邮箱 / QQ / 微信，可留空匿名",
							maxLength: 120
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "fbw__privacy",
						children: [/* @__PURE__ */ jsxs("label", {
							className: "fbw__diagnostics",
							children: [/* @__PURE__ */ jsx("input", {
								type: "checkbox",
								checked: includeDiagnostics,
								onChange: (event) => setIncludeDiagnostics(event.target.checked)
							}), /* @__PURE__ */ jsxs("span", { children: ["附带设备诊断信息", /* @__PURE__ */ jsx("small", { children: "当前完整网址、浏览器标识和视口尺寸，默认不收集。" })] })]
						}), /* @__PURE__ */ jsxs("p", { children: [
							"页面名称和路径会随反馈提交；联系方式可留空匿名。详见",
							" ",
							/* @__PURE__ */ jsx(Link, {
								to: "/about#privacy",
								onClick: close,
								children: "隐私与反馈说明"
							}),
							"。"
						] })]
					}),
					status === "error" && /* @__PURE__ */ jsxs("div", {
						className: "fbw__error",
						role: "alert",
						children: [
							errorMessage,
							"你也可以",
							/* @__PURE__ */ jsx("button", {
								type: "button",
								className: "fbw__link",
								onClick: copyFallback,
								children: copied ? "已复制 ✓" : "复制反馈内容"
							}),
							"，再贴到反馈群 / 邮件里。"
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "fbw__actions",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							className: "fbw__btn",
							onClick: close,
							children: "取消"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "fbw__btn fbw__btn--primary",
							onClick: submit,
							disabled: status === "sending" || desc.trim().length < 4,
							children: status === "sending" ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, {
								size: 15,
								className: "fbw__spin"
							}), " 提交中"] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Send, { size: 15 }), " 提交"] })
						})]
					})
				]
			})]
		})
	})] });
}
//#endregion
//#region src/components/layout/Shell.tsx
var SIDEBAR_STORAGE_KEY = "dp-master-sidebar-collapsed:v1";
function Shell() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const location = useLocation();
	const mainRef = useRef(null);
	const previousPath = useRef(location.pathname);
	const reduceMotion = useReducedMotion();
	const pid = useMatch("/part/:pid/*")?.params.pid;
	const routeMeta = getPageMeta(location.pathname);
	useLayoutEffect(() => {
		try {
			setSidebarCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
		} catch {}
	}, []);
	useEffect(() => {
		if (pid) document.documentElement.dataset.part = pid;
		else delete document.documentElement.dataset.part;
	}, [pid]);
	useLayoutEffect(() => {
		const changed = previousPath.current !== location.pathname;
		previousPath.current = location.pathname;
		setMobileOpen(false);
		window.scrollTo({ top: 0 });
		if (changed) mainRef.current?.focus({ preventScroll: true });
	}, [location.pathname]);
	const toggleSidebar = () => {
		setSidebarCollapsed((collapsed) => {
			const next = !collapsed;
			try {
				window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
			} catch {}
			return next;
		});
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
		className: "skip-link",
		href: "#main-content",
		children: "跳到主要内容"
	}), /* @__PURE__ */ jsxs("div", {
		className: `shell${sidebarCollapsed ? " shell--sidebar-collapsed" : ""}`,
		children: [
			/* @__PURE__ */ jsx("aside", {
				id: "site-sidebar",
				className: `sidebar${mobileOpen ? " mobile-open" : ""}`,
				children: /* @__PURE__ */ jsx(Sidebar, { onNavigate: () => setMobileOpen(false) })
			}),
			/* @__PURE__ */ jsx(motion.button, {
				type: "button",
				className: "sidebar-collapse",
				onClick: toggleSidebar,
				"aria-label": sidebarCollapsed ? "展开侧栏" : "收起侧栏",
				"aria-expanded": !sidebarCollapsed,
				"aria-controls": "site-sidebar",
				whileHover: reduceMotion ? void 0 : { x: sidebarCollapsed ? 2 : -2 },
				whileTap: reduceMotion ? void 0 : { scale: .9 },
				transition: {
					type: "spring",
					stiffness: 520,
					damping: 32
				},
				children: /* @__PURE__ */ jsx(motion.span, {
					"aria-hidden": "true",
					animate: { rotate: sidebarCollapsed ? 180 : 0 },
					transition: reduceMotion ? { duration: 0 } : {
						duration: .28,
						ease: [
							.16,
							1,
							.3,
							1
						]
					},
					children: /* @__PURE__ */ jsx(PanelLeftClose, {
						size: 15,
						strokeWidth: 1.8
					})
				})
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: `sidebar__scrim${mobileOpen ? " show" : ""}`,
				onClick: () => setMobileOpen(false),
				"aria-label": "关闭导航",
				"aria-hidden": !mobileOpen,
				tabIndex: mobileOpen ? 0 : -1
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "main",
				children: [/* @__PURE__ */ jsx(TopBar, {
					onHamburger: () => setMobileOpen((open) => !open),
					mobileOpen
				}), /* @__PURE__ */ jsx("main", {
					id: "main-content",
					ref: mainRef,
					className: "content",
					tabIndex: -1,
					children: /* @__PURE__ */ jsx(RouteStage, {})
				})]
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "route-announcer",
				role: "status",
				"aria-live": "polite",
				"aria-atomic": "true",
				children: ["已进入 ", routeMeta.title]
			}),
			/* @__PURE__ */ jsx(FeedbackWidget, {})
		]
	})] });
}
//#endregion
//#region src/lib/seoHead.ts
var OG_IMAGE_PATH = "/og/dpmaster-social.jpg";
function structuredDataForPage(page, site) {
	const websiteId = `${site.origin}/#website`;
	const publisherId = `${site.origin}/#publisher`;
	const graph = [{
		"@type": "Organization",
		"@id": publisherId,
		name: BRAND.owner,
		url: site.origin,
		logo: `${site.origin}/favicon.svg`,
		brand: {
			"@type": "Brand",
			name: BRAND.name
		}
	}, {
		"@type": "WebSite",
		"@id": websiteId,
		name: BRAND.name,
		url: `${site.origin}/`,
		description: `${BRAND.name}用精讲、逐帧可视化、题目索引和小游戏讲清动态规划。`,
		inLanguage: site.language,
		publisher: { "@id": publisherId }
	}];
	if (page.indexable && page.canonical) {
		const pageId = `${page.canonical}#webpage`;
		const pageType = page.routeKind === "lesson" ? [
			"Course",
			"LearningResource",
			"TechArticle"
		] : page.routeKind === "family" ? "CollectionPage" : "WebPage";
		graph.push({
			"@type": pageType,
			"@id": pageId,
			url: page.canonical,
			name: page.title,
			description: page.description,
			abstract: page.summary,
			inLanguage: site.language,
			isPartOf: { "@id": websiteId },
			provider: page.routeKind === "lesson" ? { "@id": publisherId } : void 0,
			publisher: { "@id": publisherId },
			learningResourceType: page.routeKind === "lesson" ? "课程讲解" : void 0,
			educationalLevel: page.routeKind === "lesson" ? "算法竞赛学习者" : void 0,
			teaches: page.teaches.length > 0 ? page.teaches : void 0,
			dateModified: page.dateModified,
			reviewedBy: page.reviewedBy ? {
				"@type": "Organization",
				name: page.reviewedBy
			} : void 0,
			image: `${site.origin}${OG_IMAGE_PATH}`
		});
		if (page.routeKind === "family") {
			const partId = page.path.match(/^\/part\/([a-g])$/)?.[1];
			const part = partId ? getPart(partId) : void 0;
			if (part) graph.push({
				"@type": "ItemList",
				"@id": `${page.canonical}#courses`,
				name: `${part.title}课程目录`,
				numberOfItems: part.types.filter((type) => type.status === "ready").length,
				itemListElement: part.types.filter((type) => type.status === "ready").map((type, index) => ({
					"@type": "ListItem",
					position: index + 1,
					name: type.title,
					url: `${site.origin}/part/${part.id}/${type.slug}`
				}))
			});
		}
		if (page.breadcrumbs.length > 1) graph.push({
			"@type": "BreadcrumbList",
			"@id": `${page.canonical}#breadcrumb`,
			itemListElement: page.breadcrumbs.map((item, index) => ({
				"@type": "ListItem",
				position: index + 1,
				name: item.name,
				item: `${site.origin}${item.path}`
			}))
		});
	}
	return {
		"@context": "https://schema.org",
		"@graph": graph
	};
}
//#endregion
//#region src/components/seo/RouteMeta.tsx
function upsertMeta(attribute, key, content) {
	let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
	if (!element) {
		element = document.createElement("meta");
		element.setAttribute(attribute, key);
		document.head.append(element);
	}
	element.content = content;
}
function syncCanonical(href) {
	const existing = document.head.querySelector("link[rel=\"canonical\"]");
	if (!href) {
		existing?.remove();
		return;
	}
	const element = existing ?? document.createElement("link");
	element.rel = "canonical";
	element.href = href;
	if (!existing) document.head.append(element);
}
function syncAlternates(alternates) {
	document.head.querySelectorAll("link[rel=\"alternate\"][hreflang]").forEach((element) => element.remove());
	for (const alternate of alternates) {
		const element = document.createElement("link");
		element.rel = "alternate";
		element.hreflang = alternate.hreflang;
		element.href = alternate.href;
		document.head.append(element);
	}
}
function syncStructuredData(value) {
	let element = document.head.querySelector("#dp-structured-data");
	if (!element) {
		element = document.createElement("script");
		element.id = "dp-structured-data";
		element.type = "application/ld+json";
		document.head.append(element);
	}
	element.textContent = JSON.stringify(value);
}
function RouteMeta() {
	const location = useLocation();
	const site = useMemo(() => getRuntimeSiteConfig(), []);
	const page = useMemo(() => getPageMeta(location.pathname, site), [location.pathname, site]);
	useEffect(() => {
		document.title = page.title;
		upsertMeta("name", "description", page.description);
		upsertMeta("name", "abstract", page.summary);
		upsertMeta("name", "robots", page.indexable ? "index,follow" : "noindex,nofollow");
		syncCanonical(page.canonical);
		syncAlternates(page.alternates);
		upsertMeta("property", "og:title", page.title);
		upsertMeta("property", "og:description", page.description);
		upsertMeta("property", "og:url", page.canonical ?? `${site.origin}${page.path}`);
		upsertMeta("property", "og:type", page.ogType);
		upsertMeta("property", "og:site_name", BRAND.name);
		upsertMeta("property", "og:locale", "zh_CN");
		upsertMeta("property", "og:image", `${site.origin}/og/dpmaster-social.jpg`);
		upsertMeta("property", "og:image:width", "1200");
		upsertMeta("property", "og:image:height", "630");
		upsertMeta("property", "og:image:alt", `${BRAND.name}动态规划状态空间与信标视觉`);
		if (page.dateModified && page.ogType === "article") upsertMeta("property", "article:modified_time", page.dateModified);
		else document.head.querySelector("meta[property=\"article:modified_time\"]")?.remove();
		upsertMeta("name", "twitter:card", "summary_large_image");
		upsertMeta("name", "twitter:title", page.title);
		upsertMeta("name", "twitter:description", page.description);
		upsertMeta("name", "twitter:image", `${site.origin}/og/dpmaster-social.jpg`);
		syncStructuredData(structuredDataForPage(page, site));
	}, [page, site]);
	return null;
}
//#endregion
//#region src/analytics/AnalyticsRouteTracker.tsx
var lastTrackedPath = "";
function AnalyticsRouteTracker() {
	const location = useLocation();
	useEffect(() => {
		if (lastTrackedPath === location.pathname) return;
		lastTrackedPath = location.pathname;
		const page = getPageMeta(location.pathname);
		trackAnalyticsEvent({
			event: "page_view",
			path: page.path,
			title: page.title
		});
		if (!page.indexable) trackAnalyticsEvent({
			event: "route_not_found",
			path: location.pathname,
			title: page.title
		});
	}, [location.pathname]);
	return null;
}
//#endregion
//#region src/analytics/AnalyticsRuntime.tsx
var initialized = false;
function safeMessage(value) {
	if (value instanceof Error) return value.message.slice(0, 160);
	if (typeof value === "string") return value.slice(0, 160);
	return "unknown client error";
}
function startRuntime() {
	if (initialized || typeof window === "undefined") return;
	initialized = true;
	window.addEventListener("error", (event) => {
		trackAnalyticsEvent({
			event: "client_error",
			path: window.location.pathname,
			metadata: {
				source: "window",
				message: safeMessage(event.error ?? event.message),
				line: event.lineno,
				column: event.colno
			}
		});
	});
	window.addEventListener("unhandledrejection", (event) => {
		trackAnalyticsEvent({
			event: "client_error",
			path: window.location.pathname,
			metadata: {
				source: "promise",
				message: safeMessage(event.reason)
			}
		});
	});
	import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
		const report = (metric) => {
			trackAnalyticsEvent({
				event: "web_vital",
				path: window.location.pathname,
				metadata: {
					name: metric.name,
					value: Math.round(metric.value * 100) / 100,
					delta: Math.round(metric.delta * 100) / 100,
					rating: metric.rating,
					navigationType: metric.navigationType
				}
			});
		};
		onCLS(report);
		onFCP(report);
		onINP(report);
		onLCP(report);
		onTTFB(report);
	}).catch(() => {});
}
function AnalyticsRuntime() {
	useEffect(startRuntime, []);
	return null;
}
//#endregion
//#region src/app/AppContent.tsx
function RouteView({ View }) {
	return /* @__PURE__ */ jsx(Suspense, {
		fallback: /* @__PURE__ */ jsx("div", {
			className: "route-view-loading",
			role: "status",
			"aria-label": "页面载入中"
		}),
		children: /* @__PURE__ */ jsx(View, {})
	});
}
function AppContent({ views }) {
	const { Home: HomeView, PartPage: PartPageView, TypePage: TypePageView, NotFound: NotFoundView, AboutPage: AboutPageView, MethodPage: MethodPageView, ProblemsPage: ProblemsPageView } = views;
	return /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsxs(LearningProgressProvider, { children: [
		/* @__PURE__ */ jsx(RouteMeta, {}),
		/* @__PURE__ */ jsx(AnalyticsRouteTracker, {}),
		/* @__PURE__ */ jsx(AnalyticsRuntime, {}),
		/* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsx(Routes, { children: /* @__PURE__ */ jsxs(Route, {
			element: /* @__PURE__ */ jsx(Shell, {}),
			children: [
				/* @__PURE__ */ jsx(Route, {
					path: "/",
					element: /* @__PURE__ */ jsx(RouteView, { View: HomeView })
				}),
				/* @__PURE__ */ jsx(Route, {
					path: "/part/:pid",
					element: /* @__PURE__ */ jsx(RouteView, { View: PartPageView })
				}),
				/* @__PURE__ */ jsx(Route, {
					path: "/part/:pid/:slug",
					element: /* @__PURE__ */ jsx(RouteView, { View: TypePageView })
				}),
				/* @__PURE__ */ jsx(Route, {
					path: "/method",
					element: /* @__PURE__ */ jsx(RouteView, { View: MethodPageView })
				}),
				/* @__PURE__ */ jsx(Route, {
					path: "/problems",
					element: /* @__PURE__ */ jsx(RouteView, { View: ProblemsPageView })
				}),
				/* @__PURE__ */ jsx(Route, {
					path: "/about",
					element: /* @__PURE__ */ jsx(RouteView, { View: AboutPageView })
				}),
				/* @__PURE__ */ jsx(Route, {
					path: "*",
					element: /* @__PURE__ */ jsx(RouteView, { View: NotFoundView })
				})
			]
		}) }) })
	] }) });
}
//#endregion
//#region src/app/StaticLessonContentContext.tsx
function StaticLessonContentProvider({ children, contents }) {
	return /* @__PURE__ */ jsx(StaticLessonContentContext, {
		value: contents,
		children
	});
}
//#endregion
//#region src/app/StaticApp.tsx
var STATIC_VIEWS = {
	Home,
	PartPage,
	TypePage,
	NotFound: lazy(() => import("./assets/NotFound-mzxjsqC5.js")),
	AboutPage,
	MethodPage,
	ProblemsPage
};
function StaticApp({ url, lessonContents }) {
	return /* @__PURE__ */ jsx(MemoryRouter, {
		initialEntries: [url],
		children: /* @__PURE__ */ jsx(StaticLessonContentProvider, {
			contents: lessonContents,
			children: /* @__PURE__ */ jsx(AppContent, { views: STATIC_VIEWS })
		})
	});
}
//#endregion
//#region src/entry-server.tsx
async function loadLessonContents(pathname) {
	const match = pathname.match(/^\/part\/([a-g])\/([^/]+)$/);
	if (!match) return {};
	const lesson = getLesson(match[1], match[2]);
	if (!lesson) return {};
	const module = await lesson.type.loadContent();
	return { [lesson.path]: module.default };
}
async function renderRoute(pathname) {
	const errors = [];
	const { prelude } = await prerender(/* @__PURE__ */ jsx(StrictMode, { children: /* @__PURE__ */ jsx(StaticApp, {
		url: pathname,
		lessonContents: await loadLessonContents(pathname)
	}) }), { onError(error) {
		errors.push(error);
	} });
	const html = await new Response(prelude).text();
	if (errors.length > 0) throw new AggregateError(errors, `React prerender failed for ${pathname}`);
	return html;
}
//#endregion
export { MB as i, InfoBox as n, M as r, renderRoute, CodeBlock as t };
