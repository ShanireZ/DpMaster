import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as recordLis, t as solveLis } from "./lis-3svrgd26.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
import { n as PlaybackControls, t as useStepPlayer } from "./useStepPlayer-CZuIDieE.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, MousePointerClick, Plus, Shuffle, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/lis/lisSolver.ts
/**
* O(n²) LIS 的教学 Adapter。算法 Module 产生长度、前驱与领域事件；
* 本函数只把事件投影为逐格表格、箭头、公式和讲解文案。
*/
function lisNaive(a) {
	const n = a.length;
	const run = recordLis(a);
	const dp = Array(n).fill(null);
	const snap = () => [a.slice(), dp.slice()];
	const settled = () => {
		const states = {};
		for (let column = 0; column < n; column++) states[key(0, column)] = "settled";
		for (let column = 0; column < n; column++) if (dp[column] !== null) states[key(1, column)] = "settled";
		return states;
	};
	const frames = [{
		values: snap(),
		states: settled(),
		caption: "上排是原数组 <b>a[]</b>（只读参照），下排 <b>dp[i]</b> 表示「以 a[i] 结尾的最长上升子序列长度」。每个 dp[i] 至少是 <b>1</b>（数字自己就是长度 1 的串），再看左边有没有更矮的数能接在它前面。",
		formula: "dp[i]=1\\ \\ (\\text{init, each element alone})"
	}];
	for (const event of run.events) {
		if (event.type === "initialized") {
			const i = event.index;
			dp[i] = 1;
			const states = settled();
			states[key(0, i)] = "current";
			states[key(1, i)] = "current";
			frames.push({
				values: snap(),
				states,
				active: {
					r: 1,
					c: i
				},
				caption: `轮到 <b>i=${i}</b>（a[${i}]=<b>${a[i]}</b>）。先给它一个保底：<b>dp[${i}]=1</b>（它自己单独成一个长度 1 的上升串）。接着往左扫 j&lt;${i}，找能接在它前面的更矮的数。`,
				formula: `dp[${i}]=1`
			});
			continue;
		}
		if (event.type === "compared") {
			const { index: i, previousIndex: j, canExtend, candidate, before, after, chosen } = event;
			dp[i] = after;
			const states = settled();
			states[key(0, j)] = canExtend ? "source" : "invalid";
			states[key(1, j)] = canExtend ? "source" : "invalid";
			states[key(0, i)] = "current";
			states[key(1, i)] = "current";
			const arrows = canExtend ? [{
				from: {
					r: 1,
					c: j
				},
				to: {
					r: 1,
					c: i
				},
				kind: chosen ? "chosen" : "source"
			}] : [];
			if (chosen) {
				states[key(1, j)] = "chosen";
				states[key(0, j)] = "chosen";
			}
			const caption = canExtend ? `看 <b>j=${j}</b>：a[${j}]=<b>${a[j]}</b> &lt; a[${i}]=<b>${a[i]}</b>，可以接。候选长度 dp[${j}]+1 = ${dp[j]}+1 = <b>${candidate}</b>${chosen ? `，比当前 dp[${i}] 更长 → 更新 dp[${i}]=<b>${after}</b>` : `，不超过当前 dp[${i}]=<b>${after}</b>，保持不变`}。` : `看 <b>j=${j}</b>：a[${j}]=<b>${a[j]}</b> ≥ a[${i}]=<b>${a[i]}</b>，接上去就不是「上升」了，<b>跳过</b>。`;
			const formula = canExtend ? `dp[${i}]=\\max(${before},\\ dp[${j}]{+}1)=\\max(${before},\\ ${candidate})=${after}` : `a[${j}]\\ge a[${i}]\\ \\Rightarrow\\ \\text{skip}`;
			frames.push({
				values: snap(),
				states,
				active: {
					r: 1,
					c: i
				},
				arrows,
				caption,
				formula
			});
			continue;
		}
		const { index: i, predecessor } = event;
		const best = dp[i];
		const states = settled();
		states[key(1, i)] = "settled";
		if (predecessor >= 0) states[key(1, predecessor)] = "source";
		const arrows = predecessor >= 0 ? [{
			from: {
				r: 1,
				c: predecessor
			},
			to: {
				r: 1,
				c: i
			},
			kind: "chosen"
		}] : [];
		frames.push({
			values: snap(),
			states,
			arrows,
			caption: `<b>dp[${i}]=${best}</b> 定了${predecessor >= 0 ? `——最优是接在 a[${predecessor}]=${a[predecessor]}（dp=${dp[predecessor]}）后面` : `——左边没有更矮的数，只能自成一串`}。`,
			formula: `dp[${i}]=${best}`
		});
	}
	const finalStates = settled();
	const end = run.result.endIndex;
	if (end !== null) finalStates[key(1, end)] = "chosen";
	frames.push({
		values: snap(),
		states: finalStates,
		caption: end === null ? "空数组没有上升子序列，LIS 长度为 <b>0</b>。" : `扫完。答案是 dp[] 里的<b>最大值</b>：<b>${run.result.length}</b>（在 i=${end} 处取得，a[${end}]=${a[end]}）。注意 LIS 可以在<b>任意位置</b>结尾，所以取整行最大，而不是 dp[n−1]。`,
		formula: `\\text{LIS}=\\max_i dp[i]=${run.result.length}`
	});
	return {
		rows: 2,
		cols: n,
		cell: 46,
		rowHeaderLabels: ["a", "dp"],
		colHeaderLabels: Array.from({ length: n }, (_, index) => `${index}`),
		frames
	};
}
//#endregion
//#region src/components/demos/lis/LISDemo.tsx
var PRESETS$1 = [
	{
		label: "经典乱序",
		a: [
			2,
			1,
			5,
			3,
			6,
			4,
			8,
			9,
			7
		]
	},
	{
		label: "已升序",
		a: [
			1,
			2,
			3,
			4,
			5,
			6
		]
	},
	{
		label: "严格递减",
		a: [
			7,
			5,
			4,
			3,
			1
		]
	}
];
function NumStepper({ value, min, max, onChange, onRemove, removable }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "kd__item",
		children: [removable && /* @__PURE__ */ jsx("button", {
			className: "kd__remove",
			onClick: onRemove,
			"aria-label": "删除元素",
			children: /* @__PURE__ */ jsx(X, { size: 12 })
		}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "stepper__lab",
			children: "a 值"
		}), /* @__PURE__ */ jsxs("div", {
			className: "stepper__row",
			children: [
				/* @__PURE__ */ jsx("button", {
					onClick: () => onChange(value - 1),
					disabled: value <= min,
					"aria-label": "减",
					children: /* @__PURE__ */ jsx(Minus, { size: 13 })
				}),
				/* @__PURE__ */ jsx("span", {
					className: "stepper__val",
					children: value
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: () => onChange(value + 1),
					disabled: value >= max,
					"aria-label": "加",
					children: /* @__PURE__ */ jsx(Plus, { size: 13 })
				})
			]
		})] })]
	});
}
/**
* O(n²) LIS 主演示：一维 dp[i]「以 a[i] 结尾的最长上升子序列长度」，逐格填表。
* 数组可编辑（改每个值 / 加删元素 / 一键换预设），实时重算并重播动画。
*/
function LISDemo() {
	const [a, setA] = useState(PRESETS$1[0].a);
	const model = useMemo(() => lisNaive(a), [a]);
	const ans = useMemo(() => solveLis(a).length, [a]);
	const modelKey = `lis-${a.join("_")}`;
	const setAt = (i, v) => setA((arr) => arr.map((x, k) => k === i ? v : x));
	const removeAt = (i) => setA((arr) => arr.filter((_, k) => k !== i));
	const addOne = () => setA((arr) => [...arr, Math.max(1, arr[arr.length - 1] ?? 1)]);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "kd__modes",
			children: [PRESETS$1.map((p) => /* @__PURE__ */ jsx("button", {
				className: `kd__mode${a.join(",") === p.a.join(",") ? " on" : ""}`,
				onClick: () => setA(p.a),
				children: p.label
			}, p.label)), /* @__PURE__ */ jsxs("button", {
				className: "kd__mode",
				onClick: () => setA(shuffle$1(a)),
				title: "打乱当前数组",
				children: [/* @__PURE__ */ jsx(Shuffle, {
					size: 13,
					style: {
						verticalAlign: "-2px",
						marginRight: 4
					}
				}), "打乱"]
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "kd__toolbar",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "数组 a[]（每个值可增减；上升即可，重复值不算「上升」）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "kd__items",
				children: [a.map((v, i) => /* @__PURE__ */ jsx(NumStepper, {
					value: v,
					min: 1,
					max: 20,
					onChange: (nv) => setAt(i, nv),
					onRemove: () => removeAt(i),
					removable: a.length > 2
				}, i)), a.length < 10 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: addOne,
					children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加元素"]
				})]
			})] })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"当前数组的最长上升子序列长度：",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: ["LIS = ", ans]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "you",
					children: " （= dp[] 全行最大值，可在任意位置结尾）"
				})
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
function shuffle$1(src) {
	const a = src.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	if (a.length >= 2 && a.join(",") === src.join(",")) [a[0], a[1]] = [a[1], a[0]];
	return a;
}
//#endregion
//#region src/components/demos/lis/LISPatienceDemo.tsx
var PRESETS = [
	{
		label: "经典乱序",
		a: [
			2,
			1,
			5,
			3,
			6,
			4,
			8,
			9,
			7
		]
	},
	{
		label: "已升序",
		a: [
			1,
			2,
			3,
			4,
			5,
			6
		]
	},
	{
		label: "严格递减",
		a: [
			7,
			5,
			4,
			3,
			1
		]
	}
];
/** 用 lower_bound 维护 tails，逐元素记录一步（供动画步进）。 */
function buildSteps(a) {
	const tails = [];
	const steps = [];
	for (let i = 0; i < a.length; i++) {
		const x = a[i];
		let lo = 0;
		let hi = tails.length;
		while (lo < hi) {
			const mid = lo + hi >> 1;
			if (tails[mid] >= x) hi = mid;
			else lo = mid + 1;
		}
		const pos = lo;
		const before = tails.slice();
		const append = pos === tails.length;
		if (append) tails.push(x);
		else tails[pos] = x;
		steps.push({
			i,
			x,
			pos,
			append,
			before,
			after: tails.slice()
		});
	}
	return steps;
}
/**
* O(n log n) LIS · 耐心排序动画（自建可视化，非 DPViz）。
* 维护 tails[k]=「长度为 k+1 的上升子序列里最小的结尾」。逐元素二分：
* 比末尾大 → 追加（LIS 长度 +1）；否则替换第一个 ≥ 它的位置（把该长度的结尾压得更小）。
* 最终 tails 的长度就是 LIS。tails 本身不一定是某条真实子序列，但长度恒正确。
*/
function LISPatienceDemo() {
	const [a, setA] = useState(PRESETS[0].a);
	const steps = useMemo(() => buildSteps(a), [a]);
	const player = useStepPlayer(steps.length + 1);
	const idx = player.index - 1;
	const started = idx >= 0;
	const cur = started ? steps[idx] : null;
	const tails = cur ? cur.after : [];
	const lisLen = tails.length;
	const setPreset = (arr) => {
		player.reset();
		setA(arr);
	};
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "lp__toolbar",
			children: /* @__PURE__ */ jsxs("div", {
				className: "lp__modes",
				children: [PRESETS.map((p) => /* @__PURE__ */ jsx("button", {
					className: `lp__mode${a.join(",") === p.a.join(",") ? " on" : ""}`,
					onClick: () => setPreset(p.a),
					children: p.label
				}, p.label)), /* @__PURE__ */ jsxs("button", {
					className: "lp__mode",
					onClick: () => {
						player.reset();
						setA(shuffle(a));
					},
					title: "打乱当前数组",
					children: [/* @__PURE__ */ jsx(Shuffle, {
						size: 13,
						style: {
							verticalAlign: "-2px",
							marginRight: 4
						}
					}), "打乱"]
				})]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "lp__seq",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "lp__seq-label",
				children: [/* @__PURE__ */ jsx("span", { children: "逐个扫描输入序列 a[]，每个数用二分决定它在 tails 里的落点" }), /* @__PURE__ */ jsxs("span", {
					className: "mono",
					children: [
						"已扫 ",
						idx + 1,
						"/",
						steps.length
					]
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "lp__seq-row",
				children: a.map((v, i) => /* @__PURE__ */ jsx("span", {
					className: `lp__num${cur && i === cur.i ? " cur" : started && i <= idx ? " done" : ""}`,
					children: v
				}, i))
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "lp__stage",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "lp__stage-head",
				children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("b", {
					style: {
						fontFamily: "var(--font-mono)",
						color: "var(--text-1)"
					},
					children: "tails"
				}), " —— tails[k] 记「长度 k+1 的上升子序列的最小结尾」"] }), /* @__PURE__ */ jsxs("span", {
					className: "mono",
					children: ["长度 = LIS = ", lisLen]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "lp__tails",
				children: [tails.length === 0 && /* @__PURE__ */ jsxs("div", {
					className: "lp__tail ghost",
					children: [/* @__PURE__ */ jsx("span", {
						className: "lp__tail-idx",
						children: "0"
					}), /* @__PURE__ */ jsx("div", {
						className: "lp__tail-box",
						children: "·"
					})]
				}), tails.map((t, k) => {
					return /* @__PURE__ */ jsxs("div", {
						className: `lp__tail${(cur ? k === cur.pos : false) ? " just" : ""}`,
						children: [/* @__PURE__ */ jsx("span", {
							className: "lp__tail-idx",
							children: k
						}), /* @__PURE__ */ jsx("div", {
							className: "lp__tail-box",
							children: t
						})]
					}, k);
				})]
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "lp__readout",
			children: !started ? /* @__PURE__ */ jsxs(Fragment, { children: [
				"点",
				/* @__PURE__ */ jsx("b", {
					className: "cur",
					children: " 播放 "
				}),
				"或",
				/* @__PURE__ */ jsx("b", { children: " 下一步 " }),
				"开始。tails 从空开始，逐个把 a[] 里的数二分安放进去；",
				/* @__PURE__ */ jsx("b", { children: "它的长度" }),
				"随追加而增长，最终就是 ",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: "LIS 长度"
				}),
				"。"
			] }) : cur.append ? /* @__PURE__ */ jsxs(Fragment, { children: [
				"第 ",
				/* @__PURE__ */ jsx("b", {
					className: "cur",
					children: cur.i + 1
				}),
				" 个数 ",
				/* @__PURE__ */ jsx("b", { children: cur.x }),
				"：比 tails 末尾还大，",
				/* @__PURE__ */ jsx("b", { children: " 追加" }),
				"到位置 ",
				/* @__PURE__ */ jsx("b", { children: cur.pos }),
				" → LIS 长度增长到 ",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: lisLen
				}),
				"。"
			] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
				"第 ",
				/* @__PURE__ */ jsx("b", {
					className: "cur",
					children: cur.i + 1
				}),
				" 个数 ",
				/* @__PURE__ */ jsx("b", { children: cur.x }),
				"：二分找到第一个 ≥ 它的位置 ",
				/* @__PURE__ */ jsx("b", { children: cur.pos }),
				"（原值 ",
				/* @__PURE__ */ jsx("b", { children: cur.before[cur.pos] }),
				"），",
				/* @__PURE__ */ jsx("b", { children: "替换" }),
				"成 ",
				/* @__PURE__ */ jsx("b", { children: cur.x }),
				"——把「长度 ",
				cur.pos + 1,
				" 的结尾」压得更小， 长度不变（仍 ",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: lisLen
				}),
				"），却给后面留了更多接续空间。"
			] })
		}),
		/* @__PURE__ */ jsx(PlaybackControls, {
			player,
			variant: "compact",
			label: "耐心排序逐帧播放",
			className: "lp__ctl"
		})
	] });
}
function shuffle(src) {
	const a = src.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	if (a.length >= 2 && a.join(",") === src.join(",")) [a[0], a[1]] = [a[1], a[0]];
	return a;
}
//#endregion
//#region src/content/b/LISArt.tsx
function SetupFigure() {
	const a = [
		2,
		1,
		5,
		3,
		6,
		4,
		8,
		9,
		7
	];
	const pick = /* @__PURE__ */ new Set([
		1,
		3,
		4,
		6,
		7
	]);
	const x0 = 26;
	const dx = 64;
	const bw = 46;
	const cx = (i) => x0 + i * dx + bw / 2;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 200",
		role: "img",
		"aria-label": "一条序列与其中一条最长上升子序列",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "lis-up",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--accent-2)"
				})
			}) }),
			[
				1,
				3,
				4,
				6
			].map((i, k) => {
				const j = [
					1,
					3,
					4,
					6,
					7
				][k + 1];
				return /* @__PURE__ */ jsx("path", {
					d: `M ${cx(i)} ${150 - a[i] * 9} L ${cx(j)} ${150 - a[j] * 9}`,
					stroke: "var(--accent-2)",
					strokeWidth: "2.5",
					fill: "none",
					markerEnd: "url(#lis-up)"
				}, `ln${i}`);
			}),
			a.map((v, i) => {
				const on = pick.has(i);
				const y = 150 - v * 9;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x0 + i * dx},0)`,
					children: [
						/* @__PURE__ */ jsx("rect", {
							x: "0",
							y,
							width: bw,
							height: 158 - y,
							rx: "8",
							fill: on ? "color-mix(in srgb, var(--accent-1) 30%, var(--surface-3))" : "var(--surface-3)",
							stroke: on ? "var(--accent-2)" : "var(--border-strong)",
							strokeWidth: on ? "2" : "1.5"
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: y - 8,
							textAnchor: "middle",
							fontSize: "15",
							className: "mono",
							fill: on ? "var(--accent-1)" : "var(--text-2)",
							children: v
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "176",
							textAnchor: "middle",
							fontSize: "10.5",
							className: "mono",
							fill: "var(--text-3)",
							children: i
						})
					]
				}, i);
			}),
			/* @__PURE__ */ jsx("text", {
				x: "26",
				y: "194",
				fontSize: "11.5",
				fill: "var(--text-3)",
				children: "下标 i →"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "470",
				y: "194",
				fontSize: "11.5",
				fill: "var(--accent-1)",
				children: "高亮：一条长度 5 的上升子序列"
			})
		]
	});
}
function DecisionFigure() {
	const cells = [
		{
			lab: "a=3",
			dp: 2,
			ok: true
		},
		{
			lab: "a=6",
			dp: 3,
			ok: true
		},
		{
			lab: "a=4",
			dp: 3,
			ok: true
		},
		{
			lab: "a=9",
			dp: null,
			ok: false,
			cur: true
		}
	];
	const x0 = 40;
	const dx = 132;
	const bw = 104;
	const bh = 56;
	const topY = 118;
	const cx = (i) => x0 + i * dx + bw / 2;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 220",
		role: "img",
		"aria-label": "O(n²) 转移：dp[i] 取左侧可接的 dp 最大值加一",
		children: [
			/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsx("marker", {
				id: "lis-src",
				markerWidth: "7",
				markerHeight: "7",
				refX: "5.5",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--viz-source)"
				})
			}), /* @__PURE__ */ jsx("marker", {
				id: "lis-cho",
				markerWidth: "7",
				markerHeight: "7",
				refX: "5.5",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--viz-chosen)"
				})
			})] }),
			/* @__PURE__ */ jsx("text", {
				x: "310",
				y: "22",
				textAnchor: "middle",
				fontSize: "13",
				fill: "var(--text-2)",
				children: "算 dp（a=9）：向左看每个更矮的数，取它们 dp 的最大值，再 +1"
			}),
			cells.slice(0, 3).map((_, i) => {
				const chosen = i === 1;
				return /* @__PURE__ */ jsx("path", {
					d: `M ${cx(i)} ${topY} Q ${(cx(i) + cx(3)) / 2} ${topY - 44} ${cx(3)} ${topY}`,
					stroke: chosen ? "var(--viz-chosen)" : "var(--viz-source)",
					strokeWidth: chosen ? "2.6" : "1.8",
					fill: "none",
					markerEnd: `url(#${chosen ? "lis-cho" : "lis-src"})`,
					opacity: chosen ? 1 : .7
				}, `ar${i}`);
			}),
			cells.map((c, i) => {
				const chosen = i === 1;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x0 + i * dx},${topY})`,
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: bw,
							height: bh,
							rx: "12",
							fill: c.cur ? "color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))" : chosen ? "color-mix(in srgb, var(--viz-chosen) 15%, var(--surface-3))" : "var(--surface-3)",
							stroke: c.cur ? "var(--viz-current)" : chosen ? "var(--viz-chosen)" : "var(--border-strong)",
							strokeWidth: "1.6"
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "22",
							textAnchor: "middle",
							fontSize: "13",
							className: "mono",
							fill: "var(--text-2)",
							children: c.lab
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "43",
							textAnchor: "middle",
							fontSize: "14",
							className: "mono",
							fill: "var(--text-1)",
							children: c.dp === null ? "dp = ?" : `dp = ${c.dp}`
						})
					]
				}, i);
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(180,188)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "260",
					height: "28",
					rx: "10",
					fill: "color-mix(in srgb, var(--accent-1) 14%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.4"
				}), /* @__PURE__ */ jsx("text", {
					x: "130",
					y: "19",
					textAnchor: "middle",
					fontSize: "13",
					className: "mono",
					fill: "var(--text-1)",
					children: "dp(9) = max(2,3,3) + 1 = 4"
				})]
			})
		]
	});
}
function PatienceFigure() {
	const panel = (dx, title, tone, tails, x, hitIdx) => {
		const bw = 42;
		const accent = tone === "append" ? "var(--viz-chosen)" : "var(--viz-current)";
		return /* @__PURE__ */ jsxs("g", {
			transform: `translate(${dx},0)`,
			children: [
				/* @__PURE__ */ jsx("text", {
					x: "0",
					y: "16",
					fontSize: "12.5",
					fontWeight: "600",
					fill: accent,
					children: title
				}),
				/* @__PURE__ */ jsxs("g", {
					transform: "translate(0,30)",
					children: [/* @__PURE__ */ jsx("rect", {
						width: "46",
						height: "34",
						rx: "9",
						fill: "var(--grad-accent)"
					}), /* @__PURE__ */ jsx("text", {
						x: "23",
						y: "23",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--text-on-accent)",
						children: x
					})]
				}),
				/* @__PURE__ */ jsx("text", {
					x: "60",
					y: "52",
					fontSize: "11.5",
					fill: "var(--text-3)",
					children: "当前数"
				}),
				/* @__PURE__ */ jsxs("g", {
					transform: "translate(0,84)",
					children: [tails.map((t, k) => {
						const hit = k === hitIdx;
						return /* @__PURE__ */ jsxs("g", {
							transform: `translate(${k * 50},0)`,
							children: [/* @__PURE__ */ jsx("rect", {
								width: bw,
								height: bw,
								rx: "9",
								fill: hit ? `color-mix(in srgb, ${accent} 24%, var(--surface-3))` : "color-mix(in srgb, var(--accent-1) 20%, var(--surface-3))",
								stroke: hit ? accent : "var(--border-strong)",
								strokeWidth: hit ? "2" : "1.4"
							}), /* @__PURE__ */ jsx("text", {
								x: bw / 2,
								y: 27,
								textAnchor: "middle",
								fontSize: "16",
								className: "mono",
								fill: "var(--text-1)",
								children: t
							})]
						}, k);
					}), tone === "append" && /* @__PURE__ */ jsxs("g", {
						transform: `translate(${tails.length * 50},0)`,
						children: [/* @__PURE__ */ jsx("rect", {
							width: bw,
							height: bw,
							rx: "9",
							fill: "var(--surface-2)",
							stroke: accent,
							strokeWidth: "2",
							strokeDasharray: "4 3"
						}), /* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: 27,
							textAnchor: "middle",
							fontSize: "16",
							className: "mono",
							fill: accent,
							children: x
						})]
					})]
				}),
				/* @__PURE__ */ jsx("text", {
					x: "0",
					y: "152",
					fontSize: "11.5",
					fill: "var(--text-2)",
					children: tone === "append" ? "比末尾大 → 追加，长度 +1" : "二分命中 → 替换，长度不变"
				})
			]
		}, tone);
	};
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 172",
		role: "img",
		"aria-label": "tails 维护的两种动作：追加与替换",
		children: [panel(10, "① 追加（x 比 tails 末尾大）", "append", [
			1,
			3,
			4
		], 8, -1), panel(330, "② 替换（二分找第一个 ≥ x）", "replace", [
			1,
			3,
			6
		], 4, 2)]
	});
}
//#endregion
//#region src/content/b/LIS.tsx
var CODE_B3637 = `
#include <algorithm>
#include <iostream>
using namespace std;

int n, ans, a[5005], dp[5005];

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
    }

    for (int i = 1; i <= n; i++)
    {
        dp[i] = 1;                      // 每个数自成长度 1 的上升串
        for (int j = 1; j < i; j++)     // 向左看能接在谁后面
        {
            if (a[j] < a[i])            // 严格上升才能接
            {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
        ans = max(ans, dp[i]);          // ★LIS 可在任意位置结尾，取全局最大
    }

    cout << ans << endl;
    return 0;
}
// TAG: 线性DP LIS 最长上升子序列`;
var CODE_P1020 = `
#include <algorithm>
#include <iostream>
using namespace std;

int n, a[100005];
int g1[100005], len1;            // 第一问：最长不升子序列的「结尾」栈
int g2[100005], len2;            // 第二问：最长上升子序列的「结尾」栈

int main()
{
    while (cin >> a[++n]);           // 读到文件尾，n 会多算 1
    n--;

    for (int i = 1; i <= n; i++)
    {
        // 第一问：一套系统能拦的最多导弹 = 最长「不升」子序列长度。
        // 维护一个「各长度的最大结尾」序列 g1（单调不升），二分找第一个 < a[i] 的位置替换。
        if (len1 == 0 || g1[len1] >= a[i])
        {
            g1[++len1] = a[i];
        }
        else
        {
            int l = 1, r = len1;
            while (l <= r)                       // 找第一个 g1[p] < a[i]
            {
                int mid = (l + r) >> 1;
                g1[mid] < a[i] ? r = mid - 1 : l = mid + 1;
            }
            g1[l] = a[i];
        }

        // 第二问（Dilworth）：最少拦截系统数 = 最长「上升」子序列长度。
        // g2 单调上升，二分找第一个 >= a[i] 的位置替换（lower_bound）。
        if (len2 == 0 || g2[len2] < a[i])
        {
            g2[++len2] = a[i];
        }
        else
        {
            int l = 1, r = len2;
            while (l <= r)                       // 找第一个 g2[p] >= a[i]
            {
                int mid = (l + r) >> 1;
                g2[mid] >= a[i] ? r = mid - 1 : l = mid + 1;
            }
            g2[l] = a[i];
        }
    }

    cout << len1 << endl << len2 << endl;
    return 0;
}
// TAG: LIS 最长不升 Dilworth 二分 O(nlogn)`;
var CODE_P1091 = `
#include <algorithm>
#include <iostream>
using namespace std;

int n, ans, a[105];
int up[105], down[105];          // up[i]：以 i 结尾的最长上升；down[i]：从 i 起的最长下降

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
    }

    for (int i = 1; i <= n; i++)         // 正向：每人左侧的最长上升
    {
        up[i] = 1;
        for (int j = 1; j < i; j++)
        {
            if (a[j] < a[i])
            {
                up[i] = max(up[i], up[j] + 1);
            }
        }
    }

    for (int i = n; i >= 1; i--)         // 反向：每人右侧的最长下降
    {
        down[i] = 1;
        for (int j = n; j > i; j--)
        {
            if (a[j] < a[i])
            {
                down[i] = max(down[i], down[j] + 1);
            }
        }
    }

    for (int i = 1; i <= n; i++)         // 枚举峰顶 i，合唱队形长 up[i]+down[i]-1
    {
        ans = max(ans, up[i] + down[i] - 1);
    }

    cout << n - ans << endl;             // 最少出列 = 总人数 − 最长合唱队形
    return 0;
}
// TAG: 线性DP 双向LIS 枚举峰顶`;
function LIS() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "什么是「上升子序列」"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"给一串数 ",
						/* @__PURE__ */ jsx(M, { children: "a_1,a_2,\\dots,a_n" }),
						"，",
						/* @__PURE__ */ jsx("strong", { children: "子序列" }),
						"是从中挑出若干个数、",
						/* @__PURE__ */ jsx("strong", { children: "保持原来的先后次序" }),
						"（但不必相邻）得到的序列； 若挑出的这串数",
						/* @__PURE__ */ jsx("strong", { children: "严格递增" }),
						"，就是一条",
						/* @__PURE__ */ jsx("strong", { children: "上升子序列" }),
						"。我们要找的，是其中",
						/* @__PURE__ */ jsx("strong", { children: "最长" }),
						"的一条——它的长度就是 LIS （Longest Increasing Subsequence）。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(SetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "序列 2 1 5 3 6 4 8 9 7：柱高即数值。高亮的 1→3→6→8→9 是一条长度 5 的上升子序列——下标递增、数值也递增。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"盯住上图：",
							/* @__PURE__ */ jsx(M, { children: "1,3,6,8,9" }),
							" 这五个数在原序列里的",
							/* @__PURE__ */ jsx("strong", { children: "下标" }),
							"是 ",
							/* @__PURE__ */ jsx(M, { children: "1<3<4<6<7" }),
							"（递增，说明保持了原次序）， 对应的",
							/* @__PURE__ */ jsx("strong", { children: "数值" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "1<3<6<8<9" }),
							" 也递增——两个条件都满足，是合法的上升子序列。能不能更长？试遍所有挑法，答案是不能，所以这题的 LIS 长度是 ",
							/* @__PURE__ */ jsx("strong", { children: "5" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"那能不能",
							/* @__PURE__ */ jsx("strong", { children: "贪心" }),
							"，从左到右「能接就接」？看这条链就会翻车：从 2 起步，遇到 5 接上（2,5），再遇 6 接上（2,5,6）， 往后 8、9 也接，得到 2,5,6,8,9——长度也是 5，碰巧不差。但若序列是 ",
							/* @__PURE__ */ jsx(M, { children: "1,100,2,3,4" }),
							"，贪心从 1 接了 100 就卡死（后面再没有比 100 大的），只得长度 2； 而正解是 ",
							/* @__PURE__ */ jsx(M, { children: "1,2,3,4" }),
							" 长度 4。",
							/* @__PURE__ */ jsx("strong", { children: "此刻接哪个数最好，取决于后面还有什么" }),
							"——这正是需要 DP 的信号。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"要枚举",
							/* @__PURE__ */ jsx("strong", { children: "所有" }),
							"子序列？那是 ",
							/* @__PURE__ */ jsx(M, { children: "2^n" }),
							" 种挑法，",
							/* @__PURE__ */ jsx(M, { children: "n=1000" }),
							" 就已无从枚举。下面用 DP 把它压成 ",
							/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
							"，再进一步压到 ",
							/* @__PURE__ */ jsx(M, { children: "O(n\\log n)" }),
							"。"
						] })
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：以某个数「结尾」"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"难点在于「子序列可以在任意位置结尾」，直接对整体设状态很滑。换个抓手：",
						/* @__PURE__ */ jsx("strong", { children: "强制枚举它以哪个数结尾" }),
						"。 设 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i]" }),
						" 表示：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"以 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							" 为最后一个元素"
						] }),
						"的最长上升子序列的长度。这样每条上升子序列都被它的结尾唯一「认领」，不重不漏。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(DecisionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "算 dp（以 9 结尾）：向左看每个比 9 小的数，谁的 dp 最大就接在谁后面，再 +1。这里 6 的 dp=3 最大，故 dp=3+1=4。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"怎么算 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i]" }),
							"？既然它",
							/* @__PURE__ */ jsxs("strong", { children: [
								"以 ",
								/* @__PURE__ */ jsx(M, { children: "a_i" }),
								" 结尾"
							] }),
							"，那 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							" 前面那个数 ",
							/* @__PURE__ */ jsx(M, { children: "a_j" }),
							" 必须满足两件事：下标更靠前（",
							/* @__PURE__ */ jsx(M, { children: "j<i" }),
							"）、数值更小（",
							/* @__PURE__ */ jsx(M, { children: "a_j<a_i" }),
							"，才「上升」）。 在所有这样的 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 里，谁结尾的子序列最长（",
							/* @__PURE__ */ jsx(M, { children: "dp[j]" }),
							" 最大），就把 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							" 接到它后面，长度 ",
							/* @__PURE__ */ jsx(M, { children: "+1" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i]=1+\\max_{\\,j<i,\\ a_j<a_i}dp[j]" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"如果左边没有任何更小的数可接，这个 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							" 为空，",
							/* @__PURE__ */ jsx(M, { children: "dp[i]" }),
							" 就取",
							/* @__PURE__ */ jsx("strong", { children: "初值 1" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							" 自己单独成一条长度 1 的串）。 最终答案不是 ",
							/* @__PURE__ */ jsx(M, { children: "dp[n]" }),
							"——因为 LIS 可以在任何位置收尾——而是",
							/* @__PURE__ */ jsx("strong", { children: "整个 dp 数组的最大值" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\text{LIS}=\\max_{1\\le i\\le n}dp[i]" })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"「以 ",
						/* @__PURE__ */ jsx(M, { children: "a_i" }),
						" 结尾」这个限定，把「求全局最长」拆成了 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 个彼此独立、可按下标顺序递推的小问题。 每个 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i]" }),
						" 只依赖它",
						/* @__PURE__ */ jsx("strong", { children: "左边" }),
						"已算好的 ",
						/* @__PURE__ */ jsx(M, { children: "dp[j]" }),
						"，于是 ",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 种挑法被 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 次比较装下。★答案取全行最大，别顺手写成 ",
						/* @__PURE__ */ jsx(M, { children: "dp[n]" }),
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
						"用序列 ",
						/* @__PURE__ */ jsx(M, { children: "a=[2,1,5,3,6]" }),
						" 走几步（下标从 1 记），把方程跑起来："
					] })
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
									/* @__PURE__ */ jsx("b", { children: "前两个数。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "dp[1]=1" }),
									"（2 自成一串）；到 1 时，左边只有 2，而 ",
									/* @__PURE__ */ jsx(M, { children: "2<1" }),
									" 不成立，接不上 → ",
									/* @__PURE__ */ jsx(M, { children: "dp[2]=1" }),
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
									/* @__PURE__ */ jsx("b", { children: "第 3 个数 5。" }),
									" 左边 ",
									/* @__PURE__ */ jsx(M, { children: "2<5" }),
									"、",
									/* @__PURE__ */ jsx(M, { children: "1<5" }),
									" 都能接，取 ",
									/* @__PURE__ */ jsx(M, { children: "\\max(dp[1],dp[2])+1=\\max(1,1)+1=2" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "dp[3]=2" }),
									"（如 2,5）。"
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
									/* @__PURE__ */ jsx("b", { children: "第 4 个数 3。" }),
									" 能接的是 ",
									/* @__PURE__ */ jsx(M, { children: "2<3" }),
									"、",
									/* @__PURE__ */ jsx(M, { children: "1<3" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "5<3" }),
									" 不行），",
									/* @__PURE__ */ jsx(M, { children: "\\max(dp[1],dp[2])+1=2" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "dp[4]=2" }),
									"（如 2,3）。"
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
									/* @__PURE__ */ jsx("b", { children: "第 5 个数 6。" }),
									" 左边全比它小，来源里 ",
									/* @__PURE__ */ jsx(M, { children: "dp[3]=2" }),
									"（结尾 5）与 ",
									/* @__PURE__ */ jsx(M, { children: "dp[4]=2" }),
									"（结尾 3）最大，",
									/* @__PURE__ */ jsx(M, { children: "2+1=3" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "dp[5]=3" }),
									"。 当前全行最大是 ",
									/* @__PURE__ */ jsx("strong", { children: "3" }),
									"（如 2,5,6 或 2,3,6）。"
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
						/* @__PURE__ */ jsx(M, { children: "dp[]" }),
						" 逐格填出来，并高亮每个 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i]" }),
						" 向左扫描时「能接 / 跳过 / 采纳」的来源。改数组、加删元素，或换个预设看它实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看它一格一格长出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(LISDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化：O(n log n) 贪心 + 二分"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 应付 ",
						/* @__PURE__ */ jsx(M, { children: "n\\le 5000" }),
						" 绰绰有余，但 ",
						/* @__PURE__ */ jsx(M, { children: "n=10^5" }),
						" 就会超时。瓶颈在那句「向左扫所有 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						"」。能不能不扫？ 关键洞察是一个贪心：",
						/* @__PURE__ */ jsx("strong", { children: "要让子序列有机会更长，同样长度的上升子序列，它的结尾越小越好" }),
						"——结尾越小，后面越容易接上更多数。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"于是维护一个数组 ",
						/* @__PURE__ */ jsx(M, { children: "tails" }),
						"：",
						/* @__PURE__ */ jsx(M, { children: "tails[k]" }),
						" 表示",
						/* @__PURE__ */ jsxs("strong", { children: [
							"所有长度为 ",
							/* @__PURE__ */ jsx(M, { children: "k{+}1" }),
							" 的上升子序列中，最小的那个结尾"
						] }),
						"。 它有个漂亮性质——",
						/* @__PURE__ */ jsxs("strong", { children: [/* @__PURE__ */ jsx(M, { children: "tails" }), " 本身严格递增"] }),
						"（长度越长，最小结尾必然越大）。逐个处理 ",
						/* @__PURE__ */ jsx(M, { children: "a_i" }),
						"："
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(PatienceFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "两种动作：① 当前数比 tails 末尾大 → 追加到末尾，LIS 长度 +1；② 否则二分找第一个 ≥ 它的位置，替换掉——把那个长度的结尾压得更小。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "动作一 · 追加。" }),
							"若 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							" 比 ",
							/* @__PURE__ */ jsx(M, { children: "tails" }),
							" 当前末尾还大，它能接在",
							/* @__PURE__ */ jsx("strong", { children: "最长" }),
							"那条的后面，于是把它",
							/* @__PURE__ */ jsx("strong", { children: "追加" }),
							"到 ",
							/* @__PURE__ */ jsx(M, { children: "tails" }),
							" 末尾——LIS 长度增长 1。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "动作二 · 替换。" }),
							"否则，用",
							/* @__PURE__ */ jsx("strong", { children: "二分" }),
							"在 ",
							/* @__PURE__ */ jsx(M, { children: "tails" }),
							" 里找",
							/* @__PURE__ */ jsxs("strong", { children: [
								"第一个 ",
								/* @__PURE__ */ jsx(M, { children: "\\ge a_i" }),
								" 的位置"
							] }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "\\texttt{lower\\_bound}" }),
							"），把那一格",
							/* @__PURE__ */ jsx("strong", { children: "替换" }),
							"成 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							"。 含义是：某个长度的子序列，如今找到了一个",
							/* @__PURE__ */ jsx("strong", { children: "更小的结尾" }),
							"，长度没变，但为后面接续腾出了更多空间。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"因为 ",
							/* @__PURE__ */ jsx(M, { children: "tails" }),
							" 始终有序，二分只需 ",
							/* @__PURE__ */ jsx(M, { children: "O(\\log n)" }),
							"，总复杂度降到 ",
							/* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsx(M, { children: "O(n\\log n)" }) }),
							"。",
							/* @__PURE__ */ jsxs("strong", { children: [
								"最终 ",
								/* @__PURE__ */ jsx(M, { children: "tails" }),
								" 的长度就是 LIS"
							] }),
							"。要当心一个常见误解：",
							/* @__PURE__ */ jsx(M, { children: "tails" }),
							" 的",
							/* @__PURE__ */ jsx("strong", { children: "内容" }),
							"不一定是某条真实存在的上升子序列（它是被反复替换出来的）， 但它的",
							/* @__PURE__ */ jsx("strong", { children: "长度" }),
							"恒等于 LIS，这才是我们要的答案。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的动画把耐心排序逐元素放慢：看每个数如何二分命中 ",
						/* @__PURE__ */ jsx(M, { children: "tails" }),
						" 的某一格——追加（末尾长出新格）还是替换（某格数字被压小）。同一个「经典乱序」，最终 ",
						/* @__PURE__ */ jsx(M, { children: "tails" }),
						" 长度依旧是 ",
						/* @__PURE__ */ jsx("strong", { children: "5" }),
						"，和上面 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 的答案完全一致。"
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(LISPatienceDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱 · 严格上升 vs 不降",
					children: [
						"求",
						/* @__PURE__ */ jsx("strong", { children: "严格" }),
						"上升子序列，二分用 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{lower\\_bound}" }),
						"（第一个 ",
						/* @__PURE__ */ jsx(M, { children: "\\ge a_i" }),
						"，相等也替换）；若改求",
						/* @__PURE__ */ jsx("strong", { children: "不降" }),
						"（允许相等）子序列，则要换成 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{upper\\_bound}" }),
						"（第一个 ",
						/* @__PURE__ */ jsx(M, { children: "> a_i" }),
						"）。 一字之差，结果就差一截——",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/b/lcs",
							style: { color: "var(--accent-2)" },
							children: "下一节 LCS"
						}),
						" 里 ",
						/* @__PURE__ */ jsx("strong", { children: "P1439 排列 LCS" }),
						" 正是靠把问题转成 LIS、再用这套二分做到 ",
						/* @__PURE__ */ jsx(M, { children: "O(n\\log n)" }),
						" 的。"
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
					pid: "B3637",
					name: "最长上升子序列",
					src: "洛谷原生",
					diff: "入门",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给定长度 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 的序列，求其最长",
								/* @__PURE__ */ jsx("strong", { children: "严格上升" }),
								"子序列的长度。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"最裸的 LIS 模板，",
								/* @__PURE__ */ jsx(M, { children: "n\\le 5000" }),
								" 正好让 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								" 双层循环通过——拿来把「以 ",
								/* @__PURE__ */ jsx(M, { children: "a_i" }),
								" 结尾 + 全行取最大」这套状态设计写熟，一行不多一行不少。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "dp[i]=1+\\max_{j<i,\\,a_j<a_i}dp[j]" }),
								"，答案 ",
								/* @__PURE__ */ jsx(M, { children: "\\max_i dp[i]" }),
								"；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（O(n²) 裸模板）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_B3637,
								luogu: "B3637"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1020",
					name: "[NOIP1999 提高组] 导弹拦截",
					src: "NOIP1999 提高",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsx(Field, {
							k: "题意",
							children: "一套拦截系统首发不限高度，此后每发不能高于前一发。给出依次飞来的导弹高度，求：① 一套系统最多拦几发；② 最少几套系统才能全拦。"
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"① = 最长",
								/* @__PURE__ */ jsx("strong", { children: "不升" }),
								"子序列长度；② 由 ",
								/* @__PURE__ */ jsx("strong", { children: "Dilworth 定理" }),
								"，「最少用几条不升子序列覆盖整个序列」等于「最长",
								/* @__PURE__ */ jsx("strong", { children: "上升" }),
								"子序列长度」。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 可达十万级，",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								" 会 T——",
								/* @__PURE__ */ jsxs("strong", { children: [
									"逼你上 ",
									/* @__PURE__ */ jsx(M, { children: "O(n\\log n)" }),
									" 二分"
								] }),
								"。同时它把「不升」和「上升」两种变体、以及 Dilworth 这条经典结论一次讲透，是 LIS 进阶第一题。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"两个单调栈 ",
								/* @__PURE__ */ jsx(M, { children: "g1" }),
								"（不升）、",
								/* @__PURE__ */ jsx(M, { children: "g2" }),
								"（上升）各做一遍二分替换；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n\\log n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（O(n log n) 二分 + Dilworth）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1020,
								luogu: "P1020"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1091",
					name: "[NOIP2004 提高组] 合唱队形",
					src: "NOIP2004 提高",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 名同学各有身高，要求出列若干人后剩下的队形",
								/* @__PURE__ */ jsx("strong", { children: "先升后降" }),
								"（存在一个峰顶）。求最少出列多少人。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"典型的",
								/* @__PURE__ */ jsx("strong", { children: "双向 LIS" }),
								"：正着做一遍「以 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 结尾的最长上升」",
								/* @__PURE__ */ jsx(M, { children: "up[i]" }),
								"，反着做一遍「从 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 起的最长下降」",
								/* @__PURE__ */ jsx(M, { children: "down[i]" }),
								"， 再",
								/* @__PURE__ */ jsx("strong", { children: "枚举峰顶" }),
								" ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								"——它教会你 LIS 不止正向一种跑法，正反两遍再拼接是一大类题的通法。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"峰顶在 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 的合唱队形长 ",
								/* @__PURE__ */ jsx(M, { children: "up[i]+down[i]-1" }),
								"，答案 ",
								/* @__PURE__ */ jsx(M, { children: "n-\\max_i(up[i]+down[i]-1)" }),
								"；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "n\\le 100" }),
								" 足够）。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（双向 LIS + 枚举峰顶）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1091,
								luogu: "P1091"
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
					pid: "P2782",
					name: "友好城市",
					hint: "二维偏序转 LIS：把每座城市看成 (南岸坐标, 北岸坐标)，按南岸排序后，答案就是北岸坐标的最长上升子序列——排序消去一维，剩一维做 LIS。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1439",
					name: "【模板】最长公共子序列",
					hint: "两个排列的 LCS：把 a 中每个值映射成它在 a 里的位置，再把 b 按这个映射改写，b 的 LIS 长度就是答案，用 O(n log n) 二分。（亦属 A4 LCS。）"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1725",
					name: "琪露诺",
					hint: "LIS 思想的延伸——带区间转移的线性 DP：dp[i] 从 [i−r, i−l] 这段窗口取最大值转移，用单调队列把每步的区间最大值优化到 O(1)。"
				})
			]
		})
	] });
}
//#endregion
export { LIS as default };
