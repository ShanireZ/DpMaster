import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Gamepad2, Minus, MousePointerClick, Plus, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/knapsack-group/internal.ts
function validate(groups, capacity) {
	if (!Number.isInteger(capacity) || capacity < 0) throw new RangeError("capacity must be a non-negative integer");
	for (const group of groups) for (const item of group) {
		if (!Number.isInteger(item.w) || item.w <= 0) throw new RangeError("item weight must be a positive integer");
		if (!Number.isFinite(item.v)) throw new RangeError("item value must be finite");
	}
}
function runTable(groups, capacity, emit) {
	const table = Array.from({ length: groups.length + 1 }, () => Array(capacity + 1).fill(0));
	for (let groupIndex = 1; groupIndex <= groups.length; groupIndex++) {
		const items = groups[groupIndex - 1];
		for (let currentCapacity = 0; currentCapacity <= capacity; currentCapacity++) {
			const skip = table[groupIndex - 1][currentCapacity];
			let bestTake = null;
			let takeIndex = -1;
			for (let index = 0; index < items.length; index++) {
				const item = items[index];
				if (currentCapacity < item.w) continue;
				const candidate = table[groupIndex - 1][currentCapacity - item.w] + item.v;
				if (bestTake === null || candidate > bestTake) {
					bestTake = candidate;
					takeIndex = index;
				}
			}
			const best = bestTake !== null && bestTake > skip ? bestTake : skip;
			const takeWins = bestTake !== null && bestTake > skip;
			table[groupIndex][currentCapacity] = best;
			emit({
				type: "table-cell",
				groupIndex,
				capacity: currentCapacity,
				items,
				skip,
				bestTake,
				takeIndex,
				best,
				takeWins
			});
		}
	}
	return {
		value: table[groups.length][capacity],
		table
	};
}
function runRollingCorrect(groups, capacity, emit) {
	const values = Array(capacity + 1).fill(0);
	for (let groupIndex = 1; groupIndex <= groups.length; groupIndex++) {
		const items = groups[groupIndex - 1];
		for (let currentCapacity = capacity; currentCapacity >= 0; currentCapacity--) {
			const before = values[currentCapacity];
			let best = before;
			let takeIndex = -1;
			let takeFrom = 0;
			for (let index = 0; index < items.length; index++) {
				const item = items[index];
				if (currentCapacity < item.w) continue;
				const candidate = values[currentCapacity - item.w] + item.v;
				if (candidate > best) {
					best = candidate;
					takeIndex = index;
					takeFrom = currentCapacity - item.w;
				}
			}
			values[currentCapacity] = best;
			emit({
				type: "rolling-cell",
				groupIndex,
				capacity: currentCapacity,
				items,
				before,
				best,
				takeIndex,
				takeFrom
			});
		}
	}
	return {
		value: values[capacity],
		table: [values]
	};
}
function runRollingWrong(groups, capacity, emit) {
	const values = Array(capacity + 1).fill(0);
	for (let groupIndex = 1; groupIndex <= groups.length; groupIndex++) {
		const items = groups[groupIndex - 1];
		const dirtyInGroup = /* @__PURE__ */ new Set();
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const item = items[itemIndex];
			for (let currentCapacity = capacity; currentCapacity >= item.w; currentCapacity--) {
				const before = values[currentCapacity];
				const candidate = values[currentCapacity - item.w] + item.v;
				const changed = candidate > before;
				const stacked = changed && dirtyInGroup.has(currentCapacity - item.w);
				if (changed) values[currentCapacity] = candidate;
				emit({
					type: "wrong-cell",
					groupIndex,
					itemIndex,
					capacity: currentCapacity,
					items,
					before,
					candidate,
					after: values[currentCapacity],
					changed,
					stacked
				});
				if (changed) dirtyInGroup.add(currentCapacity);
			}
		}
	}
	return {
		value: values[capacity],
		table: [values]
	};
}
function executeGroupKnapsack(groups, capacity, emit, trace = "table") {
	validate(groups, capacity);
	if (trace === "rolling-correct") return runRollingCorrect(groups, capacity, emit);
	if (trace === "rolling-wrong") return runRollingWrong(groups, capacity, emit);
	return runTable(groups, capacity, emit);
}
function recordGroupKnapsack(groups, capacity, trace = "table") {
	const events = [];
	return {
		result: executeGroupKnapsack(groups, capacity, (event) => events.push(event), trace),
		events
	};
}
//#endregion
//#region src/components/demos/knapsack/groupSolver.ts
function settled$1(vals) {
	const s = {};
	for (let r = 0; r < vals.length; r++) for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = "settled";
	return s;
}
/**
* 二维原型分组背包：f[g][j] = max( f[g-1][j]（本组一件都不选）,
*   max_{组内第 k 件}( f[g-1][j-w_k] + v_k )（本组只选这一件） )
* 关键：转移一律只从上一行 f[g-1][·] 取值——绝不从本行已更新的值来，
* 这样每组至多贡献一件。第 g 行 = 前 g 组的最优。
*/
function group2D(groups, W) {
	const G = groups.length;
	const run = recordGroupKnapsack(groups, W);
	const f = Array.from({ length: G + 1 }, () => Array(W + 1).fill(null));
	for (let j = 0; j <= W; j++) f[0][j] = 0;
	const snap = () => f.map((row) => row.slice());
	const frames = [];
	frames.push({
		values: snap(),
		states: settled$1(f),
		caption: "<b>第 0 行</b>：一组都不考虑时，任何容量下最大价值都是 <b>0</b>（初始化的地基）。",
		formula: "f[0][j] = 0"
	});
	for (const event of run.events) {
		if (event.type !== "table-cell") continue;
		const { groupIndex: g, capacity: j, items, skip, bestTake, takeIndex: takeIdx, best, takeWins } = event;
		f[g][j] = best;
		const states = settled$1(f);
		const arrows = [];
		states[key(g - 1, j)] = "source";
		arrows.push({
			from: {
				r: g - 1,
				c: j
			},
			to: {
				r: g,
				c: j
			},
			kind: takeWins ? "source" : "chosen"
		});
		if (takeIdx >= 0) {
			const w = items[takeIdx].w;
			states[key(g - 1, j - w)] = "source";
			arrows.push({
				from: {
					r: g - 1,
					c: j - w
				},
				to: {
					r: g,
					c: j
				},
				kind: takeWins ? "chosen" : "source"
			});
		}
		if (takeWins) states[key(g - 1, j - items[takeIdx].w)] = "chosen";
		else states[key(g - 1, j)] = "chosen";
		states[key(g, j)] = "current";
		const items_str = items.map((it, k) => `${k === takeIdx ? "★" : ""}(${it.w},${it.v})`).join(" ");
		let caption;
		let formula;
		if (takeIdx >= 0) {
			const { w, v } = items[takeIdx];
			caption = `组 <b>${g}</b> [${items_str}] · 容量 <b>${j}</b>：不选本组 = f[${g - 1}][${j}] = <b>${skip}</b>；选组内 <b>(${w},${v})</b> = f[${g - 1}][${j - w}]+${v} = <b>${bestTake}</b> → 取较大者 <b>${best}</b>。`;
			formula = `f[${g}][${j}]=\\max(${skip},\\ ${f[g - 1][j - w]}+${v})=${best}`;
		} else {
			caption = `组 <b>${g}</b> [${items_str}] · 容量 <b>${j}</b>：组内没有件装得下（j 太小），只能不选本组 = <b>${skip}</b>。`;
			formula = `f[${g}][${j}]=f[${g - 1}][${j}]=${skip}`;
		}
		frames.push({
			values: snap(),
			states,
			arrows,
			active: {
				r: g,
				c: j
			},
			caption,
			formula
		});
	}
	const fin = settled$1(f);
	fin[key(G, W)] = "chosen";
	frames.push({
		values: snap(),
		states: fin,
		caption: `答案在右下角 <b>f[${G}][${W}] = ${run.result.value}</b>——考虑全部 ${G} 组、容量 ${W}、每组至多取一件时的最大价值。`,
		formula: `f[${G}][${W}]=${run.result.value}`
	});
	return {
		rows: G + 1,
		cols: W + 1,
		cell: 40,
		rowHeaderLabels: Array.from({ length: G + 1 }, (_, g) => g === 0 ? "∅" : `组${g}`),
		colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
		frames
	};
}
//#endregion
//#region src/components/demos/knapsack/KnapsackGroupDemo.tsx
function Stepper$1({ label, value, min, max, onChange }) {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
		className: "stepper__lab",
		children: label
	}), /* @__PURE__ */ jsxs("div", {
		className: "stepper__row",
		children: [
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value - 1),
				disabled: value <= min,
				"aria-label": `${label} 减`,
				children: /* @__PURE__ */ jsx(Minus, { size: 13 })
			}),
			/* @__PURE__ */ jsx("span", {
				className: "stepper__val",
				children: value
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value + 1),
				disabled: value >= max,
				"aria-label": `${label} 加`,
				children: /* @__PURE__ */ jsx(Plus, { size: 13 })
			})
		]
	})] });
}
/** 分组背包二维演示：f[组][j]，逐格取「跳过本组」与「选组内某件」的较大者。 */
function KnapsackGroupDemo() {
	const [groups, setGroups] = useState([[{
		w: 2,
		v: 3
	}, {
		w: 3,
		v: 4
	}], [{
		w: 2,
		v: 2
	}, {
		w: 4,
		v: 5
	}]]);
	const [cap, setCap] = useState(6);
	const model = useMemo(() => group2D(groups, cap), [groups, cap]);
	const modelKey = `g-${cap}-${groups.map((grp) => grp.map((it) => `${it.w}.${it.v}`).join("_")).join("|")}`;
	const setItem = (gi, ii, patch) => setGroups((arr) => arr.map((grp, g) => g === gi ? grp.map((it, i) => i === ii ? {
		...it,
		...patch
	} : it) : grp));
	const addItem = (gi) => setGroups((arr) => arr.map((grp, g) => g === gi && grp.length < 3 ? [...grp, {
		w: 2,
		v: 3
	}] : grp));
	const removeItem = (gi, ii) => setGroups((arr) => arr.map((grp, g) => g === gi ? grp.filter((_, i) => i !== ii) : grp));
	const addGroup = () => setGroups((arr) => arr.length < 3 ? [...arr, [{
		w: 2,
		v: 3
	}]] : arr);
	const removeGroup = (gi) => setGroups((arr) => arr.filter((_, g) => g !== gi));
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
		className: "kd__toolbar",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "kd__group-label",
			children: "分组（每组内至多选一件 · 可改 w / v）"
		}), /* @__PURE__ */ jsxs("div", {
			style: {
				display: "flex",
				flexWrap: "wrap",
				gap: "var(--sp-4)",
				alignItems: "flex-start"
			},
			children: [groups.map((grp, gi) => /* @__PURE__ */ jsxs("div", {
				style: {
					position: "relative",
					padding: "16px 12px 12px",
					borderRadius: "var(--r-2)",
					border: "1px solid var(--border-strong)",
					background: "color-mix(in srgb, var(--accent-1) 5%, var(--surface-2))"
				},
				children: [
					/* @__PURE__ */ jsxs("div", {
						style: {
							position: "absolute",
							top: -11,
							left: 12,
							padding: "2px 10px",
							borderRadius: 999,
							background: "var(--grad-accent)",
							color: "var(--text-on-accent)",
							fontSize: 12,
							fontWeight: 700,
							fontFamily: "var(--font-display)"
						},
						children: ["组 ", gi + 1]
					}),
					groups.length > 1 && /* @__PURE__ */ jsx("button", {
						className: "kd__remove",
						style: {
							top: -9,
							right: -9
						},
						onClick: () => removeGroup(gi),
						"aria-label": "删除该组",
						children: /* @__PURE__ */ jsx(X, { size: 12 })
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							display: "flex",
							flexDirection: "column",
							gap: "var(--sp-3)"
						},
						children: [grp.map((it, ii) => /* @__PURE__ */ jsxs("div", {
							className: "kd__item",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "kd__item-i",
									children: ii + 1
								}),
								grp.length > 1 && /* @__PURE__ */ jsx("button", {
									className: "kd__remove",
									onClick: () => removeItem(gi, ii),
									"aria-label": "删除物品",
									children: /* @__PURE__ */ jsx(X, { size: 12 })
								}),
								/* @__PURE__ */ jsx(Stepper$1, {
									label: "重量 w",
									value: it.w,
									min: 1,
									max: cap,
									onChange: (w) => setItem(gi, ii, { w })
								}),
								/* @__PURE__ */ jsx(Stepper$1, {
									label: "价值 v",
									value: it.v,
									min: 1,
									max: 30,
									onChange: (v) => setItem(gi, ii, { v })
								})
							]
						}, ii)), grp.length < 3 && /* @__PURE__ */ jsxs("button", {
							className: "kd__add",
							onClick: () => addItem(gi),
							children: [/* @__PURE__ */ jsx(Plus, { size: 14 }), " 加件"]
						})]
					})
				]
			}, gi)), groups.length < 3 && /* @__PURE__ */ jsxs("button", {
				className: "kd__add",
				style: { alignSelf: "center" },
				onClick: addGroup,
				children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加一组"]
			})]
		})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "kd__group-label",
			children: "背包容量"
		}), /* @__PURE__ */ jsx(Stepper$1, {
			label: "m",
			value: cap,
			min: 2,
			max: 10,
			onChange: setCap
		})] })]
	}), /* @__PURE__ */ jsx(DPViz, { model }, modelKey)] });
}
//#endregion
//#region src/components/demos/knapsack/groupOrderSolver.ts
function settled(row) {
	const s = {};
	for (let c = 0; c < row.length; c++) if (row[c] !== null) s[key(0, c)] = "settled";
	return s;
}
var label = (g) => `组${g}`;
var itemsStr = (items, hit) => items.map((it, k) => `${k === hit ? "★" : ""}(${it.w},${it.v})`).join(" ");
/**
* 一维分组背包 · 正确的循环顺序：
*   for 组 g:  for j = W..0(倒序):  for 组内每件 (w,v):  f[j]=max(f[j], f[j-w]+v)
* 容量循环夹在「组」与「组内件」之间——处理某组时，组内不管试哪一件，f[j-w] 用的都是
* 「本组尚未出手」的旧值，各件在同一起点上竞争，每组至多有一件胜出被计入。
*/
function groupOrderCorrect(groups, W) {
	const run = recordGroupKnapsack(groups, W, "rolling-correct");
	const f = Array(W + 1).fill(0);
	const snap = () => [f.slice()];
	const frames = [];
	frames.push({
		values: snap(),
		states: settled(f),
		caption: "初始：容量 0…W 的最大价值都是 <b>0</b>（空背包）。",
		formula: "f[j]=0"
	});
	for (const event of run.events) {
		if (event.type !== "rolling-cell") continue;
		const { groupIndex: g, capacity: j, items, before: oldJ, best, takeIndex: hit, takeFrom } = event;
		f[j] = best;
		const states = settled(snap()[0]);
		const arrows = [];
		if (hit >= 0) {
			states[key(0, takeFrom)] = "source";
			arrows.push({
				from: {
					r: 0,
					c: takeFrom
				},
				to: {
					r: 0,
					c: j
				},
				kind: "chosen"
			});
			states[key(0, takeFrom)] = "chosen";
		}
		states[key(0, j)] = "current";
		let caption;
		let formula;
		if (hit >= 0) {
			const { w, v } = items[hit];
			const src = best - v;
			caption = `<b>${label(g)}</b> [${itemsStr(items, hit)}] · <b>倒序</b> j=${j}：组内挑最好的一件 <b>(${w},${v})</b> → f[${j - w}]+${v} = <b>${best}</b> &gt; f[${j}]=<b>${oldJ}</b> → 更新为 <b>${best}</b>。<span class="ok"> f[${j - w}] 用的是本组还没动过的旧值，故只计入这一件。</span>`;
			formula = `f[${j}]=\\max(${oldJ},\\ ${src}+${v})=${best}`;
		} else {
			caption = `<b>${label(g)}</b> [${itemsStr(items, -1)}] · <b>倒序</b> j=${j}：组内没有件能让 f[${j}] 变大，保持 <b>${oldJ}</b>。`;
			formula = `f[${j}]=${oldJ}`;
		}
		frames.push({
			values: snap(),
			states,
			active: {
				r: 0,
				c: j
			},
			arrows,
			caption,
			formula
		});
	}
	const fin = settled(f);
	fin[key(0, W)] = "chosen";
	frames.push({
		values: snap(),
		states: fin,
		caption: `正确顺序的答案 <b>f[${W}] = ${run.result.value}</b>：每组至多一件，组内互斥被守住。`,
		formula: `f[${W}]=${run.result.value}`
	});
	return {
		rows: 1,
		cols: W + 1,
		cell: 40,
		rowHeaderLabels: ["f"],
		colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
		frames
	};
}
/**
* 一维分组背包 · 错误的循环顺序：
*   for 组 g:  for 组内每件 (w,v):  for j = W..0:  f[j]=max(f[j], f[j-w]+v)
* 容量循环沉到最里层——组内每一件各自独立跑一遍完整倒序背包。前一件已改过 f[·]，后一件
* 又在「前一件已装进去」的结果上继续叠，于是同组多件可同时选中，答案偏大。
*/
function groupOrderWrong(groups, W) {
	const run = recordGroupKnapsack(groups, W, "rolling-wrong");
	const f = Array(W + 1).fill(0);
	const snap = () => [f.slice()];
	const frames = [];
	frames.push({
		values: snap(),
		states: settled(f),
		caption: "初始：容量 0…W 的最大价值都是 <b>0</b>（空背包）。",
		formula: "f[j]=0"
	});
	for (const event of run.events) {
		if (event.type !== "wrong-cell") continue;
		const { groupIndex: g, itemIndex: k, capacity: j, items, before: oldJ, candidate: cand, after, changed, stacked } = event;
		const { w, v } = items[k];
		f[j] = after;
		const states = settled(snap()[0]);
		states[key(0, j - w)] = "source";
		const arrows = [{
			from: {
				r: 0,
				c: j - w
			},
			to: {
				r: 0,
				c: j
			},
			kind: changed ? "chosen" : "source"
		}];
		if (changed) states[key(0, j - w)] = stacked ? "invalid" : "chosen";
		states[key(0, j)] = "current";
		let caption = `<b>${label(g)}</b> [${itemsStr(items, k)}] · 组内第 <b>${k + 1}</b> 件 <b>(${w},${v})</b> 单独跑倒序 · j=${j}：f[${j - w}]+${v} = <b>${cand}</b> ${changed ? "&gt;" : "≤"} f[${j}]=<b>${oldJ}</b> → ${changed ? `更新为 <b>${cand}</b>` : "不变"}。`;
		if (stacked) caption += ` <span class="bad">⚠ f[${j - w}] 已含本组更早的件——这一步把<b>同一组的两件叠在了一起</b>，组内互斥失效！</span>`;
		const formula = `f[${j}]=\\max(${oldJ},\\ ${cand - v}+${v})=${after}`;
		frames.push({
			values: snap(),
			states,
			active: {
				r: 0,
				c: j
			},
			arrows,
			caption,
			formula
		});
	}
	const fin = settled(f);
	fin[key(0, W)] = "invalid";
	frames.push({
		values: snap(),
		states: fin,
		caption: `错误顺序的答案 <b>f[${W}] = ${run.result.value}</b>：组内多件被重复计入，比正确值偏大。`,
		formula: `f[${W}]=${run.result.value}`
	});
	return {
		rows: 1,
		cols: W + 1,
		cell: 40,
		rowHeaderLabels: ["f"],
		colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
		frames
	};
}
//#endregion
//#region src/components/demos/knapsack/GroupOrderContrastDemo.tsx
function Stepper({ label, value, min, max, onChange }) {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
		className: "stepper__lab",
		children: label
	}), /* @__PURE__ */ jsxs("div", {
		className: "stepper__row",
		children: [
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value - 1),
				disabled: value <= min,
				"aria-label": `${label} 减`,
				children: /* @__PURE__ */ jsx(Minus, { size: 13 })
			}),
			/* @__PURE__ */ jsx("span", {
				className: "stepper__val",
				children: value
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: () => onChange(value + 1),
				disabled: value >= max,
				"aria-label": `${label} 加`,
				children: /* @__PURE__ */ jsx(Plus, { size: 13 })
			})
		]
	})] });
}
var finalCap = (m, cap) => {
	const x = m.frames[m.frames.length - 1].values[0][cap];
	return x == null ? 0 : x;
};
/**
* 分组背包一维 · 循环顺序对错并排：
* 左=容量倒序在「组内件」之外（每组至多一件，正确）；
* 右=容量倒序沉到「组内件」里层（同组多件被叠加，答案偏大，错误）。
* 默认单组 (2,3),(3,4) · W=5 → 正确 f[5]=4、错误 f[5]=7，正是本节手算的教学点。
*/
function GroupOrderContrastDemo() {
	const [groups, setGroups] = useState([[{
		w: 2,
		v: 3
	}, {
		w: 3,
		v: 4
	}]]);
	const [cap, setCap] = useState(5);
	const correct = useMemo(() => groupOrderCorrect(groups, cap), [groups, cap]);
	const wrong = useMemo(() => groupOrderWrong(groups, cap), [groups, cap]);
	const fOk = finalCap(correct, cap);
	const fBad = finalCap(wrong, cap);
	const modelKey = `go-${cap}-${groups.map((grp) => grp.map((it) => `${it.w}.${it.v}`).join("_")).join("|")}`;
	const setItem = (gi, ii, patch) => setGroups((arr) => arr.map((grp, g) => g === gi ? grp.map((it, i) => i === ii ? {
		...it,
		...patch
	} : it) : grp));
	const addItem = (gi) => setGroups((arr) => arr.map((grp, g) => g === gi && grp.length < 3 ? [...grp, {
		w: 2,
		v: 3
	}] : grp));
	const removeItem = (gi, ii) => setGroups((arr) => arr.map((grp, g) => g === gi ? grp.filter((_, i) => i !== ii) : grp));
	const addGroup = () => setGroups((arr) => arr.length < 3 ? [...arr, [{
		w: 2,
		v: 3
	}]] : arr);
	const removeGroup = (gi) => setGroups((arr) => arr.filter((_, g) => g !== gi));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "kd__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "分组（组内至多一件 · 可改 w / v · 默认一组，可再加）"
			}), /* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					flexWrap: "wrap",
					gap: "var(--sp-4)",
					alignItems: "flex-start"
				},
				children: [groups.map((grp, gi) => /* @__PURE__ */ jsxs("div", {
					style: {
						position: "relative",
						padding: "16px 12px 12px",
						borderRadius: "var(--r-2)",
						border: "1px solid var(--border-strong)",
						background: "color-mix(in srgb, var(--accent-1) 5%, var(--surface-2))"
					},
					children: [
						/* @__PURE__ */ jsxs("div", {
							style: {
								position: "absolute",
								top: -11,
								left: 12,
								padding: "2px 10px",
								borderRadius: 999,
								background: "var(--grad-accent)",
								color: "var(--text-on-accent)",
								fontSize: 12,
								fontWeight: 700,
								fontFamily: "var(--font-display)"
							},
							children: ["组 ", gi + 1]
						}),
						groups.length > 1 && /* @__PURE__ */ jsx("button", {
							className: "kd__remove",
							style: {
								top: -9,
								right: -9
							},
							onClick: () => removeGroup(gi),
							"aria-label": "删除该组",
							children: /* @__PURE__ */ jsx(X, { size: 12 })
						}),
						/* @__PURE__ */ jsxs("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "var(--sp-3)"
							},
							children: [grp.map((it, ii) => /* @__PURE__ */ jsxs("div", {
								className: "kd__item",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "kd__item-i",
										children: ii + 1
									}),
									grp.length > 1 && /* @__PURE__ */ jsx("button", {
										className: "kd__remove",
										onClick: () => removeItem(gi, ii),
										"aria-label": "删除物品",
										children: /* @__PURE__ */ jsx(X, { size: 12 })
									}),
									/* @__PURE__ */ jsx(Stepper, {
										label: "重量 w",
										value: it.w,
										min: 1,
										max: cap,
										onChange: (w) => setItem(gi, ii, { w })
									}),
									/* @__PURE__ */ jsx(Stepper, {
										label: "价值 v",
										value: it.v,
										min: 1,
										max: 30,
										onChange: (v) => setItem(gi, ii, { v })
									})
								]
							}, ii)), grp.length < 3 && /* @__PURE__ */ jsxs("button", {
								className: "kd__add",
								onClick: () => addItem(gi),
								children: [/* @__PURE__ */ jsx(Plus, { size: 14 }), " 加件"]
							})]
						})
					]
				}, gi)), groups.length < 3 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					style: { alignSelf: "center" },
					onClick: addGroup,
					children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加一组"]
				})]
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "背包容量"
			}), /* @__PURE__ */ jsx(Stepper, {
				label: "m",
				value: cap,
				min: 2,
				max: 10,
				onChange: setCap
			})] })]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"正确顺序 ",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: [
						"f[",
						cap,
						"] = ",
						fOk
					]
				}),
				"（每组至多一件） · 错误顺序 ",
				/* @__PURE__ */ jsxs("b", {
					className: "bad",
					children: [
						"f[",
						cap,
						"] = ",
						fBad
					]
				}),
				fBad > fOk ? /* @__PURE__ */ jsxs(Fragment, { children: [
					"（错法把",
					/* @__PURE__ */ jsx("b", {
						className: "bad",
						children: "同组多件"
					}),
					"重复计入，答案被抬高了 ",
					/* @__PURE__ */ jsx("b", {
						className: "bad",
						children: fBad - fOk
					}),
					"）"
				] }) : /* @__PURE__ */ jsx(Fragment, { children: "（本组合下两种顺序恰好同值——试试让同组两件都装得下）" })
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__pair",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "fbug__side-label ok",
				children: [/* @__PURE__ */ jsx(Check, { size: 15 }), " 容量倒序在组内件之外 · 正确（每组至多一件）"]
			}), /* @__PURE__ */ jsx(DPViz, { model: correct }, `ok${modelKey}`)] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "fbug__side-label bad",
				children: [/* @__PURE__ */ jsx(X, { size: 15 }), " 容量倒序沉进组内件里层 · 错误（同组多件被叠加）"]
			}), /* @__PURE__ */ jsx(DPViz, { model: wrong }, `bad${modelKey}`)] })]
		})
	] });
}
//#endregion
//#region src/content/a/KnapsackGroupArt.tsx
function GroupSetupFigure() {
	const groups = [{
		name: "组 1",
		items: [{
			w: 2,
			v: 3
		}, {
			w: 3,
			v: 4
		}]
	}, {
		name: "组 2",
		items: [{
			w: 2,
			v: 2
		}, {
			w: 4,
			v: 5
		}]
	}];
	const gw = 200;
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 640 196",
		role: "img",
		"aria-label": "物品被分成若干组，每组至多选一件",
		children: groups.map((grp, gi) => /* @__PURE__ */ jsxs("g", {
			transform: `translate(${20 + gi * 224},22)`,
			children: [
				/* @__PURE__ */ jsx("rect", {
					width: gw,
					height: "152",
					rx: "16",
					fill: "color-mix(in srgb, var(--accent-1) 5%, var(--surface-2))",
					stroke: "var(--border-strong)",
					strokeWidth: "1.5"
				}),
				/* @__PURE__ */ jsxs("g", {
					transform: "translate(14,-11)",
					children: [/* @__PURE__ */ jsx("rect", {
						width: "56",
						height: "22",
						rx: "11",
						fill: "var(--grad-accent)"
					}), /* @__PURE__ */ jsx("text", {
						x: "28",
						y: "15",
						textAnchor: "middle",
						fontSize: "12",
						fontWeight: "700",
						fill: "var(--text-on-accent)",
						children: grp.name
					})]
				}),
				grp.items.map((it, ii) => /* @__PURE__ */ jsxs("g", {
					transform: `translate(${18 + ii * 92},26)`,
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: "76",
							height: "94",
							rx: "12",
							fill: "var(--surface-3)",
							stroke: "var(--border-strong)",
							strokeWidth: "1.5"
						}),
						/* @__PURE__ */ jsxs("text", {
							x: "38",
							y: "26",
							textAnchor: "middle",
							fontSize: "12",
							fill: "var(--text-2)",
							children: [
								"第 ",
								ii + 1,
								" 件"
							]
						}),
						/* @__PURE__ */ jsxs("text", {
							x: "38",
							y: "52",
							textAnchor: "middle",
							fontSize: "14.5",
							className: "mono",
							fill: "var(--text-1)",
							children: ["w=", it.w]
						}),
						/* @__PURE__ */ jsxs("text", {
							x: "38",
							y: "76",
							textAnchor: "middle",
							fontSize: "14.5",
							className: "mono",
							fill: "var(--accent-1)",
							children: ["v=", it.v]
						})
					]
				}, ii)),
				/* @__PURE__ */ jsx("text", {
					x: gw / 2,
					y: "146",
					textAnchor: "middle",
					fontSize: "11.5",
					fill: "var(--text-3)",
					children: "组内至多挑 1 件"
				})
			]
		}, gi))
	});
}
function GroupTransitionFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 300",
		role: "img",
		"aria-label": "分组背包一格 f[g][j] 的两条转移路径",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "kg-ar",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--text-3)"
				})
			}) }),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(250,8)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "140",
						height: "48",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "70",
						y: "21",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "第 g 组 · 容量 j"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "70",
						y: "39",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "f[g][j] = ?"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M300 56 L150 96",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#kg-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M340 56 L494 96",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#kg-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "188",
				y: "82",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "不选本组"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "408",
				y: "82",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "选组内某一件"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(30,100)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "226",
						height: "60",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "113",
						y: "26",
						textAnchor: "middle",
						fontSize: "13",
						fill: "var(--text-1)",
						children: "本组一件都不拿"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "113",
						y: "47",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "= f[g−1][j]"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(384,100)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "234",
						height: "60",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "117",
						y: "26",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "枚举组内第 k 件，取 max"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "117",
						y: "47",
						textAnchor: "middle",
						fontSize: "13.5",
						className: "mono",
						fill: "var(--text-1)",
						children: "= f[g−1][j−wₖ] + vₖ"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M150 160 L300 216",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#kg-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M500 160 L340 216",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#kg-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(200,218)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "240",
					height: "54",
					rx: "14",
					fill: "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: "120",
					y: "32",
					textAnchor: "middle",
					fontSize: "14",
					className: "mono",
					fill: "var(--text-1)",
					children: "取较大者 = max(两者)"
				})]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "320",
				y: "292",
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--text-3)",
				children: "两条路都只回看上一行 f[g−1][·]——所以本组至多贡献一件"
			})
		]
	});
}
function GroupLoopOrderFigure() {
	const panel = (dx, ok, title, outer, inner, note) => {
		const col = ok ? "var(--viz-chosen)" : "var(--viz-invalid)";
		return /* @__PURE__ */ jsxs("g", {
			transform: `translate(${dx},0)`,
			children: [
				/* @__PURE__ */ jsxs("text", {
					x: "0",
					y: "16",
					fontSize: "13",
					fontWeight: "700",
					fill: col,
					children: [ok ? "✓ " : "✗ ", title]
				}),
				/* @__PURE__ */ jsxs("g", {
					transform: "translate(0,26)",
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: "270",
							height: "128",
							rx: "12",
							fill: ok ? "color-mix(in srgb, var(--viz-chosen) 8%, var(--surface-2))" : "color-mix(in srgb, var(--viz-invalid) 8%, var(--surface-2))",
							stroke: col,
							strokeWidth: "1.5"
						}),
						/* @__PURE__ */ jsx("text", {
							x: "18",
							y: "30",
							fontSize: "12.5",
							className: "mono",
							fill: "var(--text-2)",
							children: "for 组 g:"
						}),
						/* @__PURE__ */ jsx("text", {
							x: "34",
							y: "54",
							fontSize: "12.5",
							className: "mono",
							fill: ok ? "var(--accent-1)" : "var(--text-2)",
							children: outer
						}),
						/* @__PURE__ */ jsx("text", {
							x: "50",
							y: "78",
							fontSize: "12.5",
							className: "mono",
							fill: ok ? "var(--text-2)" : "var(--accent-1)",
							children: inner
						}),
						/* @__PURE__ */ jsx("text", {
							x: "66",
							y: "102",
							fontSize: "12",
							className: "mono",
							fill: "var(--text-1)",
							children: "f[j]=max(f[j],f[j−w]+v)"
						})
					]
				}),
				/* @__PURE__ */ jsx("text", {
					x: "135",
					y: "176",
					textAnchor: "middle",
					fontSize: "11.5",
					fill: col,
					children: note
				})
			]
		});
	};
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 600 192",
		role: "img",
		"aria-label": "分组背包容量循环放外层与放内层的对照",
		children: [panel(6, true, "容量在组内物品之外", "for j = m…w:  (倒序)", "for 组内每件 (w,v):", "一组内各件都基于旧值 → 至多选 1 件"), panel(316, false, "容量在组内物品之内", "for 组内每件 (w,v):", "for j = m…w:  (倒序)", "前一件已更新 f → 同组可再选 → 退化")]
	});
}
//#endregion
//#region src/content/a/KnapsackGroup.tsx
var CODE_P1757 = `
#include <iostream>
#include <algorithm>
using namespace std;

int w[3405], v[3405], g[3405]; // 重量、价值、所在组号
int f[3405];                   // f[j]：容量不超过 j 的最大价值
int idx[105][3405], cnt[105];  // 每组归集：idx[组][第几件] = 物品下标
int mx;                        // 出现过的最大组号

int main()
{
    int m, n;
    cin >> m >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> w[i] >> v[i] >> g[i];
        idx[g[i]][++cnt[g[i]]] = i;      // 把第 i 件挂到它所在的组
        mx = max(mx, g[i]);
    }

    for (int t = 1; t <= mx; t++)               // ★外层：逐组
        for (int j = m; j >= 0; j--)            // ★中层：容量倒序（在组内物品之外）
            for (int k = 1; k <= cnt[t]; k++)   // ★内层：枚举本组每一件
            {
                int i = idx[t][k];
                if (j >= w[i])
                    f[j] = max(f[j], f[j - w[i]] + v[i]);
            }

    cout << f[m] << endl;
    return 0;
}`;
function KnapsackGroup() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "当物品被「分了组」"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"先看一个具体场景：有 ",
						/* @__PURE__ */ jsx("strong", { children: "2 组" }),
						"物品，一个容量 ",
						/* @__PURE__ */ jsx(M, { children: "m=6" }),
						" 的背包。组 1 里放着两件",
						/* @__PURE__ */ jsx(M, { children: "(w,v)=(2,3),(3,4)" }),
						"，组 2 里放着两件 ",
						/* @__PURE__ */ jsx(M, { children: "(2,2),(4,5)" }),
						"。规则多了一条硬约束——",
						/* @__PURE__ */ jsx("strong", { children: "每一组里至多挑一件" }),
						"（也可以一件都不挑），组与组之间互不影响。目标仍是不超重的前提下让",
						/* @__PURE__ */ jsx("strong", { children: "总价值最大" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(GroupSetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "2 组物品，组内互斥：每组至多取一件——组 1 里 (2,3) 与 (3,4) 只能二选一或都不选。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"为什么不能把它当普通 01 背包，把 4 件一股脑丢进去做？因为 01 背包允许「组 1 的两件",
						/* @__PURE__ */ jsx("strong", { children: "同时拿" }),
						"」——",
						/* @__PURE__ */ jsx(M, { children: "(2,3)+(3,4)" }),
						" 重 5、价值 7，它会毫不犹豫地收下。可分组规则里这是",
						/* @__PURE__ */ jsx("strong", { children: "非法" }),
						"的：同一组内互斥。 普通 01 背包",
						/* @__PURE__ */ jsx("strong", { children: "压根不知道「组」的存在" }),
						"，自然管不住「一组只能出一件」。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"那把每组「挑哪一件、或不挑」的所有搭配枚举出来呢？",
						/* @__PURE__ */ jsx(M, { children: "g" }),
						" 组、每组约 ",
						/* @__PURE__ */ jsx(M, { children: "c" }),
						" 种选择，就是 ",
						/* @__PURE__ */ jsx(M, { children: "c^g" }),
						" 种组合， 又回到指数爆炸。分组背包的思路，是把这层组内的互斥，",
						/* @__PURE__ */ jsx("strong", { children: "直接焊进背包的转移里" }),
						"——让「组」成为 DP 的阶段。"
					] })]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：以「组」为阶段"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
						"设 ",
						/* @__PURE__ */ jsx(M, { children: "f[g][j]" }),
						" 表示：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"只在前 ",
							/* @__PURE__ */ jsx(M, { children: "g" }),
							" 组里挑选（每组至多一件）、总重量不超过 ",
							/* @__PURE__ */ jsx(M, { children: "j" })
						] }),
						" 时的最大价值。 和 01 背包最大的不同在",
						/* @__PURE__ */ jsx("strong", { children: "阶段的粒度" }),
						"：01 里一个阶段决断「第 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" ",
						/* @__PURE__ */ jsx("strong", { children: "件" }),
						"取不取」，分组里一个阶段决断「第 ",
						/* @__PURE__ */ jsx(M, { children: "g" }),
						" ",
						/* @__PURE__ */ jsx("strong", { children: "组" }),
						"——不选，还是选组内的哪一件」。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(GroupTransitionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "每格 f[g][j] 有两条路：不选本组，继承上一行；或在组内枚举第 k 件取 max。两条路都只回看上一行，本组至多出一件。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsxs("strong", { children: [
								"不选第 ",
								/* @__PURE__ */ jsx(M, { children: "g" }),
								" 组"
							] }),
							"：本组一件都不拿，前 ",
							/* @__PURE__ */ jsx(M, { children: "g" }),
							" 组的最优就等于前 ",
							/* @__PURE__ */ jsx(M, { children: "g-1" }),
							" 组在同容量 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 下的最优，即 ",
							/* @__PURE__ */ jsx(M, { children: "f[g-1][j]" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsxs("strong", { children: [
								"选第 ",
								/* @__PURE__ */ jsx(M, { children: "g" }),
								" 组里的某一件 ",
								/* @__PURE__ */ jsx(M, { children: "k" })
							] }),
							"（需装得下 ",
							/* @__PURE__ */ jsx(M, { children: "j\\ge w_k" }),
							"）：腾出 ",
							/* @__PURE__ */ jsx(M, { children: "w_k" }),
							"，剩下的 ",
							/* @__PURE__ */ jsx(M, { children: "j-w_k" }),
							" 留给前 ",
							/* @__PURE__ */ jsx(M, { children: "g-1" }),
							" 组去最优，再加上这件的价值 ",
							/* @__PURE__ */ jsx(M, { children: "v_k" }),
							"，即 ",
							/* @__PURE__ */ jsx(M, { children: "f[g-1][j-w_k]+v_k" }),
							"。 究竟选组内哪一件？",
							/* @__PURE__ */ jsx("strong", { children: "把每一件都试一遍，取最好的那件" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"合起来，就是",
							/* @__PURE__ */ jsx("strong", { children: "转移方程" }),
							"——注意第二项里那个对组内物品的 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[g][j]=\\max\\Big(\\,f[g-1][j],\\ \\max_{k\\,\\in\\,g,\\ w_k\\le j}\\big(f[g-1][j-w_k]+v_k\\big)\\Big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"边界：",
							/* @__PURE__ */ jsx(M, { children: "f[0][j]=0" }),
							"（一组都不考虑，价值为 0）。答案：",
							/* @__PURE__ */ jsx(M, { children: "f[G][m]" }),
							"。 对比 01 背包 ",
							/* @__PURE__ */ jsx(M, { children: "f[i][j]=\\max(f[i-1][j],\\ f[i-1][j-w_i]+v_i)" }),
							"——分组只是把「取这一件」换成了「",
							/* @__PURE__ */ jsx("strong", { children: "在组内挑最好的一件" }),
							"」，多套了一层组内的 ",
							/* @__PURE__ */ jsx(M, { children: "\\max" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"分组背包是 01 背包的",
						/* @__PURE__ */ jsx("strong", { children: "自然推广" }),
						"：把决策的粒度从「一件」抬升到「一组」。两项候选",
						/* @__PURE__ */ jsxs("strong", { children: [
							"都从上一行 ",
							/* @__PURE__ */ jsx(M, { children: "f[g-1][\\cdot]" }),
							" 取值"
						] }),
						"——这一句就锁死了「每组至多一件」：因为一件都还没往本行写，组内不管试多少件，用的都是「本组尚未出手」的旧值。"
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
						"用开头的例子（组 1 = ",
						/* @__PURE__ */ jsx(M, { children: "(2,3),(3,4)" }),
						"，组 2 = ",
						/* @__PURE__ */ jsx(M, { children: "(2,2),(4,5)" }),
						"，容量 6）走几步，把方程「跑起来」，重点盯住",
						/* @__PURE__ */ jsx("strong", { children: "每组只出一件" }),
						"："
					] })
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
									/* @__PURE__ */ jsx("b", { children: "初始化第 0 行。" }),
									" 一组都不考虑，任何容量下价值都是 0：",
									/* @__PURE__ */ jsx(M, { children: "f[0][0..6]=0" }),
									"。整张表的地基。"
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
									/* @__PURE__ */ jsx("b", { children: "处理组 1" }),
									"（含 ",
									/* @__PURE__ */ jsx(M, { children: "(2,3),(3,4)" }),
									"）。看容量 5：不选本组 = ",
									/* @__PURE__ */ jsx(M, { children: "f[0][5]=0" }),
									"；选 ",
									/* @__PURE__ */ jsx(M, { children: "(2,3)" }),
									" = ",
									/* @__PURE__ */ jsx(M, { children: "f[0][3]+3=3" }),
									"；选 ",
									/* @__PURE__ */ jsx(M, { children: "(3,4)" }),
									" = ",
									/* @__PURE__ */ jsx(M, { children: "f[0][2]+4=4" }),
									"。三者取最大 → ",
									/* @__PURE__ */ jsx(M, { children: "f[1][5]=4" }),
									"。第 1 行整体为 ",
									/* @__PURE__ */ jsx(M, { children: "0,0,3,4,4,4,4" }),
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
									/* @__PURE__ */ jsx("b", { children: "处理组 2" }),
									"（含 ",
									/* @__PURE__ */ jsx(M, { children: "(2,2),(4,5)" }),
									"），看容量 6：不选本组 = ",
									/* @__PURE__ */ jsx(M, { children: "f[1][6]=4" }),
									"；选 ",
									/* @__PURE__ */ jsx(M, { children: "(2,2)" }),
									" = ",
									/* @__PURE__ */ jsx(M, { children: "f[1][4]+2=4+2=6" }),
									"；选 ",
									/* @__PURE__ */ jsx(M, { children: "(4,5)" }),
									" = ",
									/* @__PURE__ */ jsx(M, { children: "f[1][2]+5=3+5=8" }),
									"。取最大 → ",
									/* @__PURE__ */ jsx(M, { children: "f[2][6]=8" }),
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
									/* @__PURE__ */ jsx("b", { children: "读答案。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "f[2][6]=8" }),
									"——它来自「组 1 选 ",
									/* @__PURE__ */ jsx(M, { children: "(2,3)" }),
									" + 组 2 选 ",
									/* @__PURE__ */ jsx(M, { children: "(4,5)" }),
									"」，重 ",
									/* @__PURE__ */ jsx(M, { children: "2+4=6" }),
									"、价值 ",
									/* @__PURE__ */ jsx(M, { children: "3+5=8" }),
									"。",
									/* @__PURE__ */ jsx("strong", { children: "每组恰好一件" }),
									"，正是分组规则下的最优。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示会把整张表",
						/* @__PURE__ */ jsx("strong", { children: "逐格填满" }),
						"，高亮每格「跳过本组」与「选组内某件」两个来源。改改组、件或容量，看表实时重算。"
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
					children: /* @__PURE__ */ jsx(KnapsackGroupDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "压成一维：三重循环，与那道循环顺序的坎"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"和 01 背包一样，转移只用到",
							/* @__PURE__ */ jsx("strong", { children: "上一行" }),
							" ",
							/* @__PURE__ */ jsx(M, { children: "f[g-1][\\cdot]" }),
							"，于是可以卷成一维 ",
							/* @__PURE__ */ jsx(M, { children: "f[j]" }),
							" 就地更新。 但组内多了一层枚举，一维写法的循环",
							/* @__PURE__ */ jsx("strong", { children: "套三层" }),
							"，顺序有讲究："
						] }),
						/* @__PURE__ */ jsx("pre", {
							className: "mono",
							style: {
								margin: "var(--sp-4) 0",
								padding: "var(--sp-4)",
								borderRadius: "var(--r-2)",
								background: "var(--surface-2)",
								border: "1px solid var(--border)",
								fontSize: "13.5px",
								lineHeight: 1.7,
								color: "var(--text-1)",
								overflowX: "auto",
								whiteSpace: "pre"
							},
							children: `for 组 g = 1 … G:
  for j = m downto 0:        // ★容量倒序，在组内枚举之外
    for 组内每件 (w, v):
      f[j] = max( f[j], f[j − w] + v )`
						}),
						/* @__PURE__ */ jsxs("p", { children: [
							"记住这个骨架的关键：",
							/* @__PURE__ */ jsxs("strong", { children: [
								"容量循环 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 必须在「组内物品枚举」的外层"
							] }),
							"，而且照旧",
							/* @__PURE__ */ jsx("strong", { children: "倒序" }),
							"。 这样一来，处理组 ",
							/* @__PURE__ */ jsx(M, { children: "g" }),
							" 时，无论组内枚举到第几件，",
							/* @__PURE__ */ jsx(M, { children: "f[j-w]" }),
							" 用的都是",
							/* @__PURE__ */ jsx("strong", { children: "本组还没动过的旧值" }),
							"（即上一行的值）——组内各件都在「本组尚未出手」的同一起点上竞争，自然只会有",
							/* @__PURE__ */ jsx("strong", { children: "一件" }),
							"胜出被计入。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(GroupLoopOrderFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "左：容量 j 在组内物品之外——组内各件都基于旧值，每组至多选 1 件（正确）。右：容量 j 被塞进组内物品里层——前一件已改 f[j]，同组下一件又叠上去，一组能选出多件，退化成「组内可重复取」（错误）。"
					})]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "若把容量循环放进组内，会怎样"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"把三重循环写反——让",
							/* @__PURE__ */ jsxs("strong", { children: [
								"组内物品在外、容量 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 在里"
							] }),
							"："
						] }),
						/* @__PURE__ */ jsx("pre", {
							className: "mono",
							style: {
								margin: "var(--sp-4) 0",
								padding: "var(--sp-4)",
								borderRadius: "var(--r-2)",
								background: "color-mix(in srgb, var(--viz-invalid) 6%, var(--surface-2))",
								border: "1px solid var(--viz-invalid)",
								fontSize: "13.5px",
								lineHeight: 1.7,
								color: "var(--text-1)",
								overflowX: "auto",
								whiteSpace: "pre"
							},
							children: `for 组 g = 1 … G:
  for 组内每件 (w, v):        // ✗ 组内枚举跑到了外层
    for j = m downto 0:
      f[j] = max( f[j], f[j − w] + v )`
						}),
						/* @__PURE__ */ jsxs("p", { children: [
							"这时组内每一件都",
							/* @__PURE__ */ jsx("strong", { children: "各自独立地跑一遍完整的倒序背包" }),
							"。第一件更新完 ",
							/* @__PURE__ */ jsx(M, { children: "f[\\cdot]" }),
							" 后，第二件是在",
							/* @__PURE__ */ jsx("strong", { children: "「第一件已经装进去」的结果上" }),
							"继续做——于是同一组的两件",
							/* @__PURE__ */ jsx("strong", { children: "可以被同时选中" }),
							"。 这恰好退化成「把这一组当作若干件",
							/* @__PURE__ */ jsx("strong", { children: "各自独立的 01 物品" }),
							"」，组内互斥的约束彻底失效。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"用开头组 1 ",
							/* @__PURE__ */ jsx(M, { children: "(2,3),(3,4)" }),
							"、容量 5 验一下错法：先跑 ",
							/* @__PURE__ */ jsx(M, { children: "(2,3)" }),
							" 得 ",
							/* @__PURE__ */ jsx(M, { children: "f[5]=3" }),
							"；再跑 ",
							/* @__PURE__ */ jsx(M, { children: "(3,4)" }),
							" 时 ",
							/* @__PURE__ */ jsx(M, { children: "f[5]=\\max(3,\\ f[2]+4)=\\max(3,3+4)=7" }),
							"——",
							/* @__PURE__ */ jsx(M, { children: "f[2]=3" }),
							" 里",
							/* @__PURE__ */ jsxs("strong", { children: ["已经含了 ", /* @__PURE__ */ jsx(M, { children: "(2,3)" })] }),
							"，于是 7 = 两件相加。可正确答案（组内至多一件）只该是 ",
							/* @__PURE__ */ jsx(M, { children: "4" }),
							"。一层循环放错位置，答案就从 4 涨成了 7。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "记死：容量循环夹在「组」与「组内件」之间",
					children: [
						"三重循环的正序是 ",
						/* @__PURE__ */ jsx("strong", { children: "组 → 容量(倒序) → 组内件" }),
						"。容量循环",
						/* @__PURE__ */ jsx("strong", { children: "既不能" }),
						"提到最外（那样组与组之间会串味），",
						/* @__PURE__ */ jsx("strong", { children: "也不能" }),
						"沉到最里（那样组内会多选）。它必须",
						/* @__PURE__ */ jsx("strong", { children: "正好夹在中间" }),
						"。这和 01 背包",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/01",
							style: { color: "var(--accent-2)" },
							children: "「必须倒序」"
						}),
						"是同一个「用干净旧值」的道理，只是把粒度从「每件一次」升到了「每组一次」。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "并排看：一层循环放错，答案就涨了"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"道理讲完，不如让两种顺序",
						/* @__PURE__ */ jsx("strong", { children: "同跑一遍并排对照" }),
						"。默认就是本节手算的那组：单独一组 ",
						/* @__PURE__ */ jsx(M, { children: "(2,3),(3,4)" }),
						"、容量 5。 左边把",
						/* @__PURE__ */ jsx("strong", { children: "容量倒序放在组内件之外" }),
						"，组内两件都基于「本组未动过」的旧值竞争，只有一件胜出——",
						/* @__PURE__ */ jsx(M, { children: "f[5]=4" }),
						"； 右边把",
						/* @__PURE__ */ jsx("strong", { children: "容量倒序沉进组内件里层" }),
						"，第二件在「第一件已装进去」的结果上继续叠，两件被同时计入——",
						/* @__PURE__ */ jsx(M, { children: "f[5]=7" }),
						"。 单步走到右侧 ",
						/* @__PURE__ */ jsx(M, { children: "j=5" }),
						" 那一格，会看到来源列被标红：那正是「同组两件叠在一起」的瞬间。改改 w / v 或再加一组，看这 ",
						/* @__PURE__ */ jsx(M, { children: "4" }),
						" 与 ",
						/* @__PURE__ */ jsx(M, { children: "7" }),
						" 的差随之变化。"
					] })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(GroupOrderContrastDemo, {})
					})
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
					pid: "P1757",
					name: "通天之分组背包",
					src: "洛谷原生",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"背包容量 ",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 件物品，每件给出重量 ",
								/* @__PURE__ */ jsx(M, { children: "a_i" }),
								"、价值 ",
								/* @__PURE__ */ jsx(M, { children: "b_i" }),
								" 和",
								/* @__PURE__ */ jsx("strong", { children: "所在组号" }),
								" ",
								/* @__PURE__ */ jsx(M, { children: "c_i" }),
								"。同一组至多取一件，求最大价值。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"分组背包最纯净的",
								/* @__PURE__ */ jsx("strong", { children: "裸模板" }),
								"：读入后按组号归集，直接套三重循环骨架。没有任何抽象包装，是把「组 → 容量倒序 → 组内件」这个顺序",
								/* @__PURE__ */ jsx("strong", { children: "肌肉记忆" }),
								"下来的最佳一题。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[j]=\\max(f[j],\\ f[j-a_i]+b_i)" }),
								"，外层枚举组、中层 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 倒序、内层枚举组内件；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（标准三重循环）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1757,
								luogu: "P1757"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P5322",
					name: "[BJOI2019] 排兵布阵",
					src: "BJOI2019",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "S" }),
								" 位对手、",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 座城池、你有 ",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								" 名士兵，要把兵力分配到各城。在某城派出严格",
								/* @__PURE__ */ jsx("strong", { children: "多于对手 2 倍" }),
								"的兵力即击败该对手，击败第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 城的对手得 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 分（对每位对手分别结算）。求最高总分。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "状态设计（把城池抽象成组）",
							children: [
								/* @__PURE__ */ jsx("strong", { children: "每座城池 = 一组" }),
								"。把该城 ",
								/* @__PURE__ */ jsx(M, { children: "S" }),
								" 位对手在此城的守军",
								/* @__PURE__ */ jsx("strong", { children: "从小到大排序" }),
								"记为 ",
								/* @__PURE__ */ jsx(M, { children: "c_1\\le c_2\\le\\dots\\le c_S" }),
								"，则「同时击败守军最少的前 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 名对手」构成组内第 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 件",
								/* @__PURE__ */ jsx("strong", { children: "物品" }),
								"：击败一名需严格多于其守军 2 倍，同时击败前 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 名只需压过其中门槛最高的一位，故",
								/* @__PURE__ */ jsx("strong", { children: "体积" }),
								" = ",
								/* @__PURE__ */ jsx(M, { children: "2c_k+1" }),
								"（排序后 ",
								/* @__PURE__ */ jsx(M, { children: "c_k" }),
								" 即前 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 名里的最大守军），",
								/* @__PURE__ */ jsx("strong", { children: "价值" }),
								" = ",
								/* @__PURE__ */ jsx(M, { children: "k\\times i" }),
								"（击败 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 名、城池编号 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								"）。一组内至多选一件，恰好对应「在这座城要么不争、要么争到前 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 名」。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"较新的省选题，示范分组背包的",
								/* @__PURE__ */ jsx("strong", { children: "建模功夫" }),
								"：真正的难点不是转移，而是",
								/* @__PURE__ */ jsx("strong", { children: "看出「城池是组、击败前 k 名是组内物品」" }),
								"。转移仍是标准三重循环骨架（见 P1757），代码只需换掉组内物品的「体积/价值」定义。"
							]
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
				/* @__PURE__ */ jsxs("p", {
					className: "prose",
					style: {
						maxWidth: "none",
						fontSize: "13.5px",
						color: "var(--text-3)",
						marginBottom: "var(--sp-4)"
					},
					children: [
						"说明：纯分组背包的洛谷原生题目池较窄，更多「组内互斥」的进阶练习并入 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/dep",
							style: { color: "var(--accent-2)" },
							children: "有依赖的背包"
						}),
						" 与 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/f",
							style: { color: "var(--accent-2)" },
							children: "F 树上背包"
						}),
						"。下面两题分别从「依赖归约」与「裸模板复现」两头夯实基础。"
					]
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1064",
					name: "[NOIP2006 提高组] 金明的预算方案",
					hint: "主件-附件的依赖可归约为分组背包：把「一个主件 + 它的若干附件」的所有合法组合（仅主 / 主+附1 / 主+附2 / 主+附1+2）打包成同一组的组内物品，组内至多选一件。也属有依赖背包，做承接。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1757",
					name: "通天之分组背包",
					hint: "学完回来独立复现三重循环骨架：外层组、中层容量倒序、内层组内件。不看题解默写一遍，巩固「组内至多一件」为何要靠循环顺序保证。"
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pointer-cue",
			children: [
				/* @__PURE__ */ jsx(Gamepad2, { size: 18 }),
				"到 ",
				/* @__PURE__ */ jsx(Link, {
					to: "/part/a",
					style: {
						color: "var(--accent-1)",
						fontWeight: 600
					},
					children: "A 部分页的「装包大师」"
				}),
				"挑物品时留意：若把清单按「同一栏里只能拿一件」重新分栏，你面对的就是分组背包——组内互斥，正是它区别于 01 背包的那一笔。"
			]
		})
	] });
}
//#endregion
export { KnapsackGroup as default };
