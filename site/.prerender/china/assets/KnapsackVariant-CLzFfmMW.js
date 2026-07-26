import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Minus, MousePointerClick, Plus, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/knapsack-variant/internal.ts
function executeCountKnapsack(items, capacity, emit, victim) {
	const counts = Array(capacity + 1).fill(0);
	counts[0] = 1;
	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		const weight = items[itemIndex].w;
		for (let currentCapacity = capacity; currentCapacity >= weight; currentCapacity--) {
			const before = counts[currentCapacity];
			const add = counts[currentCapacity - weight];
			counts[currentCapacity] = before + add;
			emit({
				type: "count-cell",
				itemIndex,
				weight,
				capacity: currentCapacity,
				before,
				add,
				after: counts[currentCapacity]
			});
		}
	}
	if (victim === void 0) return {
		count: counts[capacity],
		counts,
		victimIndex: null,
		withoutVictim: null
	};
	const victimIndex = Math.min(Math.max(victim, 0), Math.max(items.length - 1, 0));
	const withoutVictim = counts.slice();
	const weight = items.length > 0 ? items[victimIndex].w : 0;
	if (items.length > 0 && weight <= capacity) for (let currentCapacity = weight; currentCapacity <= capacity; currentCapacity++) {
		const before = withoutVictim[currentCapacity];
		const subtract = withoutVictim[currentCapacity - weight];
		withoutVictim[currentCapacity] = before - subtract;
		emit({
			type: "undo-cell",
			victimIndex,
			weight,
			capacity: currentCapacity,
			before,
			subtract,
			after: withoutVictim[currentCapacity]
		});
	}
	return {
		count: counts[capacity],
		counts,
		victimIndex,
		withoutVictim
	};
}
function recordCountKnapsack(items, capacity, victim) {
	const events = [];
	return {
		result: executeCountKnapsack(items, capacity, (event) => events.push(event), victim),
		events
	};
}
//#endregion
//#region src/components/demos/knapsack/variantSolver.ts
function settled$1(vals) {
	const s = {};
	for (let r = 0; r < vals.length; r++) for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = "settled";
	return s;
}
/**
* 计数型 01 背包 · 一维 f[j]「恰好装满容量 j 的方案数」。
* 初值 f[0]=1（凑 0 有 1 种空方案，其余 0），对每件倒序 f[j] += f[j-w]。
* 把最值 max 换成累加 +，就把「求最优」变成了「数方案」。网格为一维（1 行 W+1 列）。
*/
function countKnapsack(items, W) {
	const run = recordCountKnapsack(items, W);
	const f = Array(W + 1).fill(0);
	f[0] = 1;
	const snap = () => [f.slice()];
	const frames = [];
	frames.push({
		values: snap(),
		states: settled$1(snap()),
		caption: "初始：<b>f[0]=1</b>（凑出容量 0 有唯一一种方案——空方案），其余 f[j]=<b>0</b>（还没有物品可用，凑不出来）。这一步取代了最优 DP 里的「全 0」地基。",
		formula: "f[0]=1,\\ f[j]=0\\ (j>0)"
	});
	for (const event of run.events) {
		if (event.type !== "count-cell") continue;
		const { itemIndex: i, weight: w, capacity: j, before: old, add, after: now } = event;
		const grew = add > 0;
		f[j] = now;
		const states = settled$1(snap());
		const arrows = [{
			from: {
				r: 0,
				c: j - w
			},
			to: {
				r: 0,
				c: j
			},
			kind: grew ? "chosen" : "source"
		}];
		states[key(0, j - w)] = grew ? "chosen" : "source";
		states[key(0, j)] = "current";
		const caption = `物品 <b>${i + 1}</b>（w=${w}）· <b>倒序</b> j=${j}：把「不含它、凑出 ${j - w} 的方案」接上它，f[${j}] <b>+=</b> f[${j - w}]=<b>${add}</b> → f[${j}] 从 <b>${old}</b> 变为 <b>${now}</b>${grew ? "" : "（f[" + (j - w) + "]=0，暂无新方案，保持不变）"}。`;
		const formula = `f[${j}]\\mathrel{+}=f[${j - w}]=${old}+${add}=${now}`;
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
	const fin = settled$1(snap());
	fin[key(0, W)] = "chosen";
	frames.push({
		values: snap(),
		states: fin,
		caption: `答案 <b>f[${W}] = ${run.result.count}</b>：恰好装满容量 ${W} 的方案共 <b>${run.result.count}</b> 种。全程没有一次 max——只有一层层累加，把每种能凑出 ${W} 的组合数了个遍。`,
		formula: `f[${W}]=${run.result.count}`
	});
	return {
		rows: 1,
		cols: W + 1,
		rowHeaderLabels: ["f"],
		colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
		frames
	};
}
//#endregion
//#region src/components/demos/knapsack/KnapsackVariantDemo.tsx
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
/**
* 计数型 01 背包演示：一维 f[j]「恰好装满容量 j 的方案数」，逐格累加。
* 方案数只与重量有关，故物品只留重量 w 可编辑；容量 W ≤ 12。
*/
function KnapsackVariantDemo() {
	const [items, setItems] = useState([
		{ w: 2 },
		{ w: 3 },
		{ w: 5 }
	]);
	const [cap, setCap] = useState(5);
	const model = useMemo(() => countKnapsack(items, cap), [items, cap]);
	const answer = model.frames[model.frames.length - 1].values[0][cap] ?? 0;
	const modelKey = `cnt-${cap}-${items.map((it) => it.w).join("_")}`;
	const setItem = (i, patch) => setItems((arr) => arr.map((it, k) => k === i ? {
		...it,
		...patch
	} : it));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "kd__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "物品（只需重量——方案数与价值无关）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "kd__items",
				children: [items.map((it, i) => /* @__PURE__ */ jsxs("div", {
					className: "kd__item",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "kd__item-i",
							children: i + 1
						}),
						items.length > 1 && /* @__PURE__ */ jsx("button", {
							className: "kd__remove",
							onClick: () => setItems((a) => a.filter((_, k) => k !== i)),
							"aria-label": "删除物品",
							children: /* @__PURE__ */ jsx(X, { size: 12 })
						}),
						/* @__PURE__ */ jsx(Stepper$1, {
							label: "重量 w",
							value: it.w,
							min: 1,
							max: cap,
							onChange: (w) => setItem(i, { w })
						})
					]
				}, i)), items.length < 5 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: () => setItems((a) => [...a, { w: 2 }]),
					children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加物品"]
				})]
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "目标容量"
			}), /* @__PURE__ */ jsx(Stepper$1, {
				label: "W",
				value: cap,
				min: 2,
				max: 12,
				onChange: setCap
			})] })]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"恰好装满容量 ",
				/* @__PURE__ */ jsxs("b", {
					className: "you",
					children: ["W = ", cap]
				}),
				" 的方案数：",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: [
						"f[",
						cap,
						"] = ",
						answer
					]
				}),
				answer === 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
					"（当前物品凑不出 ",
					cap,
					"——没有任何子集和恰好等于它）"
				] })
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/components/demos/knapsack/variantUndoSolver.ts
function settled(vals) {
	const s = {};
	for (let r = 0; r < vals.length; r++) for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = "settled";
	return s;
}
/**
* 撤销可视化 · 洛谷 P4141「消失之物」。
* 分两幕：
*   第一幕——先把全部物品都放进去，倒序 f[j] += f[j-w] 建好全集方案数 f[j]（多帧展示）。
*   第二幕——从全集拷一份 g=f，对选定的第 k 件做逆操作 g[j] -= g[j-w]，
*            方向与加时相反（正序 j:w→m），逐帧把这件「退」出去。
* 末帧对比：全集 f[j]（含第 k 件）vs 缺第 k 件 g[j]。
* 网格两行：第 0 行 f（全集，第二幕保持不动作参照），第 1 行 g（正在被退掉第 k 件）。
*/
function undoKnapsack(items, W, victim) {
	const n = items.length;
	const run = recordCountKnapsack(items, W, victim);
	const k = run.result.victimIndex ?? 0;
	const wk = n > 0 ? items[k].w : 0;
	const f = run.result.counts;
	const fRow = Array(W + 1).fill(0);
	fRow[0] = 1;
	let gRow = Array(W + 1).fill(null);
	const snap = () => [fRow.slice(), gRow.slice()];
	const frames = [];
	frames.push({
		values: snap(),
		states: settled(snap()),
		caption: `<b>第一幕 · 先把全部物品都放进去。</b>初值 <b>f[0]=1</b>（空方案），其余 f[j]=0。下面按标准计数背包倒序累加，建出<strong>含全部 ${n} 件</strong>的全集方案数 f[j]。`,
		formula: "f[0]=1,\\ f[j]=0\\ (j>0)"
	});
	for (const event of run.events) {
		if (event.type !== "count-cell") continue;
		const { itemIndex: i, weight: w, capacity: j, before: old, add, after: now } = event;
		const grew = add > 0;
		fRow[j] = now;
		const states = settled(snap());
		const arrows = [{
			from: {
				r: 0,
				c: j - w
			},
			to: {
				r: 0,
				c: j
			},
			kind: grew ? "chosen" : "source"
		}];
		states[key(0, j - w)] = grew ? "chosen" : "source";
		states[key(0, j)] = "current";
		const caption = `建全集 · 物品 <b>${i + 1}</b>（w=${w}）· <b>倒序</b> j=${j}：f[${j}] <b>+=</b> f[${j - w}]=<b>${add}</b> → f[${j}] 从 <b>${old}</b> 变为 <b>${now}</b>${grew ? "" : "（来源为 0，保持不变）"}。`;
		const formula = `f[${j}]\\mathrel{+}=f[${j - w}]=${old}+${add}=${now}`;
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
	{
		const st = settled(snap());
		for (let j = 0; j <= W; j++) st[key(0, j)] = "chosen";
		frames.push({
			values: snap(),
			states: st,
			caption: `<b>全集就绪：</b>f[0..${W}] 已含全部 ${n} 件物品。特别地 <b>f[${W}]=${f[W]}</b>。接下来要让<strong>第 ${k + 1} 件（w=${wk}）消失</strong>——不是重算，而是把它对 f 的贡献「退」出去。`,
			formula: `f[${W}]=${f[W]}`
		});
	}
	if (n === 0 || wk > W) {
		gRow = (run.result.withoutVictim ?? f).slice();
		const st = settled(snap());
		for (let j = 0; j <= W; j++) {
			st[key(0, j)] = "settled";
			st[key(1, j)] = "chosen";
		}
		frames.push({
			values: snap(),
			states: st,
			caption: `第 ${k + 1} 件（w=${wk}）容量放不进（w &gt; W），它本就没给任何 f[j] 贡献，所以「缺它」的方案数 g[j] 与全集 f[j] 完全相同。`,
			formula: `g[j]=f[j]`
		});
		return pack(frames, W, k);
	}
	gRow = fRow.slice();
	{
		const st = settled(snap());
		for (let j = 0; j <= W; j++) st[key(1, j)] = "current";
		frames.push({
			values: snap(),
			states: st,
			caption: `<b>第二幕 · 从全集拷一份 g ← f</b>（别在原数组上减，否则会污染别的物品）。下面对第 <b>${k + 1}</b> 件（w=${wk}）做<strong>逆操作</strong>：加它当初是 f[j] += f[j−w]，退它就是 g[j] −= g[j−w]。<strong>方向与加时相反——正序 j:${wk}→${W}</strong>：撤销要用「已退干净」的 g[j−w]，故小下标必须先退。`,
			formula: `g[j]\\gets f[j]`
		});
	}
	for (const event of run.events) {
		if (event.type !== "undo-cell") continue;
		const { capacity: j, before: old, subtract: sub, after: now } = event;
		const changed = sub > 0;
		gRow[j] = now;
		const states = settled(snap());
		const arrows = [{
			from: {
				r: 1,
				c: j - wk
			},
			to: {
				r: 1,
				c: j
			},
			kind: changed ? "chosen" : "source"
		}];
		states[key(1, j - wk)] = changed ? "chosen" : "source";
		states[key(1, j)] = "current";
		states[key(0, j)] = "source";
		const caption = `正在退第 <b>${k + 1}</b> 件：<b>g[j] −= g[j−w]</b> · <b>正序</b> j=${j}（w=${wk}）：g[${j}] −= g[${j - wk}]=<b>${sub}</b> → g[${j}] 从 <b>${old}</b> 减为 <b>${now}</b>${changed ? "" : "（要减的量为 0，保持不变）"}。对照上方全集 f[${j}]=<b>${f[j]}</b>。`;
		const formula = `g[${j}]\\mathrel{-}=g[${j - wk}]=${old}-${sub}=${now}`;
		frames.push({
			values: snap(),
			states,
			active: {
				r: 1,
				c: j
			},
			arrows,
			caption,
			formula
		});
	}
	{
		const st = settled(snap());
		for (let j = 0; j <= W; j++) {
			st[key(0, j)] = "source";
			st[key(1, j)] = "chosen";
		}
		let demoJ = W;
		for (let j = W; j >= 1; j--) if (gRow[j] !== f[j]) {
			demoJ = j;
			break;
		}
		const drop = f[demoJ] !== gRow[demoJ] ? `例如容量 ${demoJ}：全集 f[${demoJ}]=<b>${f[demoJ]}</b>，缺第 ${k + 1} 件后 g[${demoJ}]=<b>${gRow[demoJ]}</b>——少掉的正是<strong>用到第 ${k + 1} 件</strong>的那些方案。` : `第 ${k + 1} 件（w=${wk}）在 1..${W} 内没改变任何方案数，说明当前物品下它可有可无。`;
		frames.push({
			values: snap(),
			states: st,
			caption: `<b>退完了。</b>上行是<strong>全集 f[j]</strong>（含第 ${k + 1} 件），下行是<strong>缺第 ${k + 1} 件的 g[j]</strong>。${drop} 全程 <b>O(nm)</b>：一次全集 + 一次逆操作，无需为每件重算整张表。`,
			formula: `g[${demoJ}]=${gRow[demoJ]}\\ (\\text{vs }f[${demoJ}]=${f[demoJ]})`
		});
	}
	return pack(frames, W, k);
}
function pack(frames, W, k) {
	return {
		rows: 2,
		cols: W + 1,
		rowHeaderLabels: ["f 全集", `g 缺#${k + 1}`],
		colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
		frames
	};
}
//#endregion
//#region src/components/demos/knapsack/VariantUndoDemo.tsx
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
/**
* 撤销可视化演示（洛谷 P4141「消失之物」）：
* 先算含全部物品的全集方案数 f[j]，再选定「让第几件消失」，
* 对它做逆操作 g[j] -= g[j-w] 正序退掉，看「缺这件」的方案数长出来。
* 物品重量可编辑；目标容量 W ≤ 12；用按钮组挑选要消失的物品。
*/
function VariantUndoDemo() {
	const [items, setItems] = useState([
		{ w: 2 },
		{ w: 3 },
		{ w: 5 }
	]);
	const [cap, setCap] = useState(5);
	const [victim, setVictim] = useState(2);
	const k = Math.min(victim, items.length - 1);
	const model = useMemo(() => undoKnapsack(items, cap, k), [
		items,
		cap,
		k
	]);
	const last = model.frames[model.frames.length - 1].values;
	const fAns = last[0]?.[cap] ?? 0;
	const gAns = last[1]?.[cap] ?? 0;
	const modelKey = `undo-${cap}-${k}-${items.map((it) => it.w).join("_")}`;
	const setItem = (i, patch) => setItems((arr) => arr.map((it, kk) => kk === i ? {
		...it,
		...patch
	} : it));
	const removeItem = (i) => setItems((arr) => {
		const next = arr.filter((_, kk) => kk !== i);
		if (victim >= next.length) setVictim(Math.max(next.length - 1, 0));
		else if (i < victim) setVictim((v) => v - 1);
		return next;
	});
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "kd__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "物品（只需重量——方案数与价值无关）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "kd__items",
				children: [items.map((it, i) => /* @__PURE__ */ jsxs("div", {
					className: "kd__item",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "kd__item-i",
							children: i + 1
						}),
						items.length > 1 && /* @__PURE__ */ jsx("button", {
							className: "kd__remove",
							onClick: () => removeItem(i),
							"aria-label": "删除物品",
							children: /* @__PURE__ */ jsx(X, { size: 12 })
						}),
						/* @__PURE__ */ jsx(Stepper, {
							label: "重量 w",
							value: it.w,
							min: 1,
							max: cap,
							onChange: (w) => setItem(i, { w })
						})
					]
				}, i)), items.length < 5 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: () => setItems((a) => [...a, { w: 2 }]),
					children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加物品"]
				})]
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "目标容量"
			}), /* @__PURE__ */ jsx(Stepper, {
				label: "W",
				value: cap,
				min: 2,
				max: 12,
				onChange: setCap
			})] })]
		}),
		/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "kd__group-label",
			children: "让第几件「消失」（对它做逆操作退掉）"
		}), /* @__PURE__ */ jsx("div", {
			className: "kd__modes",
			children: items.map((it, i) => /* @__PURE__ */ jsxs("button", {
				className: `kd__mode danger${i === k ? " on" : ""}`,
				onClick: () => setVictim(i),
				children: [
					"第 ",
					i + 1,
					" 件 · w=",
					it.w
				]
			}, i))
		})] }),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"全集 ",
				/* @__PURE__ */ jsxs("b", {
					className: "you",
					children: [
						"f[",
						cap,
						"] = ",
						fAns
					]
				}),
				" ，让",
				/* @__PURE__ */ jsxs("b", {
					className: "you",
					children: [
						"第 ",
						k + 1,
						" 件（w=",
						items[k]?.w,
						"）"
					]
				}),
				"消失后 ， 缺它的方案数 ",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: [
						"g[",
						cap,
						"] = ",
						gAns
					]
				}),
				fAns !== gAns && /* @__PURE__ */ jsxs(Fragment, { children: [
					"——退掉了 ",
					/* @__PURE__ */ jsx("b", {
						className: "bad",
						children: fAns - gAns
					}),
					" 种「用到第 ",
					k + 1,
					" 件」的方案。"
				] }),
				fAns === gAns && /* @__PURE__ */ jsxs(Fragment, { children: [
					"——该件在容量 ",
					cap,
					" 上没参与任何方案，退掉前后不变。"
				] })
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/content/a/KnapsackVariantArt.tsx
function OperatorSwapFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 210",
		role: "img",
		"aria-label": "容量骨架不变，替换聚合算子得到不同问题",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "ov-ar",
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
				transform: "translate(20,66)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "150",
						height: "78",
						rx: "14",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "75",
						y: "26",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "容量骨架（不变）"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "75",
						y: "52",
						textAnchor: "middle",
						fontSize: "13",
						className: "mono",
						fill: "var(--text-1)",
						children: "f[j] ⊕ f[j−w]"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "75",
						y: "69",
						textAnchor: "middle",
						fontSize: "11",
						fill: "var(--text-3)",
						children: "枚举物品 · 逐容量"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M170 105 H214",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#ov-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "192",
				y: "96",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "换 ⊕"
			}),
			[
				{
					sym: "max",
					out: "最优价值",
					tint: "var(--accent-1)"
				},
				{
					sym: "+",
					out: "方案数",
					tint: "var(--accent-2)"
				},
				{
					sym: "||",
					out: "可行 / 否",
					tint: "var(--text-2)"
				}
			].map((o, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(230,${18 + i * 62})`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "390",
						height: "50",
						rx: "12",
						fill: `color-mix(in srgb, ${o.tint} 10%, var(--surface-3))`,
						stroke: o.tint,
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(14,10)",
						children: [/* @__PURE__ */ jsx("rect", {
							width: "52",
							height: "30",
							rx: "8",
							fill: "color-mix(in srgb, var(--surface-1) 60%, var(--surface-3))",
							stroke: o.tint,
							strokeWidth: "1.2"
						}), /* @__PURE__ */ jsx("text", {
							x: "26",
							y: "20",
							textAnchor: "middle",
							fontSize: "15",
							className: "mono",
							fill: o.tint,
							children: o.sym
						})]
					}),
					/* @__PURE__ */ jsx("text", {
						x: "86",
						y: "30",
						fontSize: "13",
						className: "mono",
						fill: "var(--text-2)",
						children: "⊕ ="
					}),
					/* @__PURE__ */ jsx("text", {
						x: "140",
						y: "30",
						fontSize: "14",
						fill: "var(--text-1)",
						children: o.out
					})
				]
			}, i))
		]
	});
}
function CountBuildFigure() {
	const cells = [
		0,
		1,
		2,
		3,
		4,
		5
	];
	const vals = [
		1,
		0,
		1,
		1,
		0,
		2
	];
	const x0 = 40;
	const dx = 96;
	const cw = 66;
	const ch = 44;
	const cx = (i) => x0 + i * dx;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 190",
		role: "img",
		"aria-label": "方案数如何由两条组合各累加 1 得到",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "cb-ar",
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
			cells.map((j, i) => /* @__PURE__ */ jsxs("text", {
				x: cx(i) + cw / 2,
				y: "18",
				textAnchor: "middle",
				fontSize: "12",
				className: "mono",
				fill: "var(--text-3)",
				children: ["j=", j]
			}, `h${i}`)),
			cells.map((j, i) => {
				const hi = j === 5;
				const zero = vals[i] === 0;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${cx(i)},30)`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: cw,
						height: ch,
						rx: "10",
						fill: hi ? "color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))" : "var(--surface-3)",
						stroke: hi ? "var(--accent-2)" : "var(--border-strong)",
						strokeWidth: "1.5"
					}), /* @__PURE__ */ jsx("text", {
						x: cw / 2,
						y: 28,
						textAnchor: "middle",
						fontSize: "18",
						className: "mono",
						fill: hi ? "var(--accent-1)" : zero ? "var(--text-3)" : "var(--text-1)",
						children: vals[i]
					})]
				}, `c${i}`);
			}),
			/* @__PURE__ */ jsx("text", {
				x: cx(5) + cw / 2,
				y: "98",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "f[5] = 2"
			}),
			/* @__PURE__ */ jsxs("g", {
				fontSize: "12.5",
				fill: "var(--text-1)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						x: "150",
						y: "120",
						width: "150",
						height: "50",
						rx: "10",
						fill: "var(--surface-2)",
						stroke: "var(--accent-2)",
						strokeWidth: "1.3"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "225",
						y: "141",
						textAnchor: "middle",
						className: "mono",
						children: "{2, 3}"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "225",
						y: "160",
						textAnchor: "middle",
						fontSize: "11",
						fill: "var(--text-3)",
						children: "贡献 1 种"
					}),
					/* @__PURE__ */ jsx("rect", {
						x: "330",
						y: "120",
						width: "150",
						height: "50",
						rx: "10",
						fill: "var(--surface-2)",
						stroke: "var(--accent-2)",
						strokeWidth: "1.3"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "405",
						y: "141",
						textAnchor: "middle",
						className: "mono",
						children: "{5}"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "405",
						y: "160",
						textAnchor: "middle",
						fontSize: "11",
						fill: "var(--text-3)",
						children: "贡献 1 种"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M240 120 L520 88",
				stroke: "var(--accent-2)",
				strokeWidth: "1.8",
				markerEnd: "url(#cb-ar)",
				fill: "none",
				opacity: "0.75"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M400 120 L540 88",
				stroke: "var(--accent-2)",
				strokeWidth: "1.8",
				markerEnd: "url(#cb-ar)",
				fill: "none",
				opacity: "0.75"
			})
		]
	});
}
function UndoFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 214",
		role: "img",
		"aria-label": "从全集方案数撤销某一物品的贡献",
		children: [
			/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsx("marker", {
				id: "un-ar",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--text-3)"
				})
			}), /* @__PURE__ */ jsx("marker", {
				id: "un-back",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--viz-invalid)"
				})
			})] }),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(200,10)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "240",
						height: "56",
						rx: "14",
						fill: "color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))",
						stroke: "var(--accent-2)",
						strokeWidth: "1.8"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "24",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "先算「含全部物品」"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "45",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "g[j] = 全集方案数"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M320 66 L320 96",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#un-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "336",
				y: "86",
				fontSize: "12",
				fill: "var(--viz-invalid)",
				children: "退掉第 k 件"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(150,100)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "340",
						height: "52",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--viz-invalid)",
						strokeWidth: "1.6"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "170",
						y: "22",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "逆操作（正序 j: w → W）"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "170",
						y: "43",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "g[j] −= g[j − w]"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M320 152 L320 180",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#un-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(190,182)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "260",
					height: "30",
					rx: "10",
					fill: "var(--surface-3)",
					stroke: "var(--border-strong)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: "130",
					y: "20",
					textAnchor: "middle",
					fontSize: "13",
					className: "mono",
					fill: "var(--accent-1)",
					children: "缺第 k 件时的方案数"
				})]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(20,104)",
				children: [
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "0",
						fontSize: "11.5",
						fill: "var(--text-3)",
						children: "加它："
					}),
					/* @__PURE__ */ jsx("path", {
						d: "M52 -4 L4 -4",
						stroke: "var(--accent-2)",
						strokeWidth: "1.6",
						markerEnd: "url(#un-ar)"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "18",
						fontSize: "11",
						className: "mono",
						fill: "var(--text-3)",
						children: "倒序 W→w"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "42",
						fontSize: "11.5",
						fill: "var(--viz-invalid)",
						children: "退它："
					}),
					/* @__PURE__ */ jsx("path", {
						d: "M8 38 L56 38",
						stroke: "var(--viz-invalid)",
						strokeWidth: "1.6",
						markerEnd: "url(#un-back)"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "60",
						fontSize: "11",
						className: "mono",
						fill: "var(--viz-invalid)",
						children: "正序 w→W"
					})
				]
			})
		]
	});
}
//#endregion
//#region src/content/a/KnapsackVariant.tsx
var CODE_P1164 = `
#include <iostream>
using namespace std;

int a[105];
long long f[10005];          // f[j]：恰好花 j 元的方案数（方案数常爆 int，用 long long）

int main()
{
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        cin >> a[i];

    f[0] = 1;                           // ★地基：花 0 元有 1 种方案（什么都不点）
    for (int i = 1; i <= n; i++)
        for (int j = m; j >= a[i]; j--) // 倒序：每道菜至多点一次（01）
            f[j] += f[j - a[i]];        // ★把 max 换成累加，就从「求最优」变「数方案」

    cout << f[m] << endl;
    return 0;
}`;
var CODE_P4141 = `
#include <iostream>
using namespace std;

const int MOD = 10;
int w[2005];
int f[2005], g[2005];        // f：含全部物品的方案数；g：撤销某件后的临时方案数

int main()
{
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        cin >> w[i];

    f[0] = 1;                           // 全集方案数：标准计数背包
    for (int i = 1; i <= n; i++)
        for (int j = m; j >= w[i]; j--) // 加它：倒序
            f[j] = (f[j] + f[j - w[i]]) % MOD;

    for (int i = 1; i <= n; i++)        // 逐个「消失」的物品 i
    {
        for (int j = 0; j <= m; j++)
            g[j] = f[j];                // 从全集出发

        for (int j = w[i]; j <= m; j++) // ★退它：正序，方向与加时相反
            g[j] = (g[j] - g[j - w[i]] + MOD) % MOD;   // 逆操作：把第 i 件的贡献减掉

        for (int j = 1; j <= m; j++)    // 缺第 i 件时，体积 j 的方案数
            cout << g[j];
        cout << endl;
    }
    return 0;
}`;
function KnapsackVariant() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "从「求最值」到「换一个聚合算子」"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"到这里，背包的",
						/* @__PURE__ */ jsx("strong", { children: "容量骨架" }),
						"已经很熟：枚举物品、逐容量转移、一维 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" 由 ",
						/* @__PURE__ */ jsx(M, { children: "f[j-w]" }),
						" 推来。 前面几类都在问同一件事——",
						/* @__PURE__ */ jsx("strong", { children: "价值最大是多少" }),
						"，所以转移里坐着一个 ",
						/* @__PURE__ */ jsx(M, { children: "\\max" }),
						"。可现实里的问题未必都求最优： 「恰好花光 ",
						/* @__PURE__ */ jsx(M, { children: "m" }),
						" 元有",
						/* @__PURE__ */ jsx("strong", { children: "多少种" }),
						"点法？」「这堆砝码",
						/* @__PURE__ */ jsx("strong", { children: "能不能" }),
						"称出重量 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						"？」"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(OperatorSwapFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "容量骨架原封不动，只换掉中间的聚合算子：max 得最优、+ 得方案数、|| 得可行性——同一套表，三种问题。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"关键洞察是：",
						/* @__PURE__ */ jsx("strong", { children: "背包的骨架和「求什么」是解耦的" }),
						"。把转移中的 ",
						/* @__PURE__ */ jsx(M, { children: "\\max" }),
						" 换成",
						/* @__PURE__ */ jsxs("strong", { children: ["加法 ", /* @__PURE__ */ jsx(M, { children: "+" })] }),
						"，",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" 的含义就从「最大价值」变成「凑出 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 的方案数」；换成",
						/* @__PURE__ */ jsxs("strong", { children: ["逻辑或 ", /* @__PURE__ */ jsx(M, { children: "\\lor" })] }),
						"，就变成「",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 能否被凑出」的布尔判定。 物品怎么取、循环怎么转，一个字都不用改。这一节就把最常考的一支——",
						/* @__PURE__ */ jsx("strong", { children: "方案数背包" }),
						"——讲透，再看它的一个漂亮延伸：",
						/* @__PURE__ */ jsx("strong", { children: "撤销" }),
						"。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "方案数：把 max 换成加法，f[0] 换成 1"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"设 ",
							/* @__PURE__ */ jsx(M, { children: "f[j]" }),
							" 表示",
							/* @__PURE__ */ jsxs("strong", { children: [
								"恰好装满容量 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 的方案数"
							] }),
							"。对第 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 件物品（重量 ",
							/* @__PURE__ */ jsx(M, { children: "w_i" }),
							"）， 凑出 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 的方案分两类：",
							/* @__PURE__ */ jsx("strong", { children: "不含它" }),
							"——数目已记在旧的 ",
							/* @__PURE__ */ jsx(M, { children: "f[j]" }),
							" 里；",
							/* @__PURE__ */ jsx("strong", { children: "含它" }),
							"——先把它占的 ",
							/* @__PURE__ */ jsx(M, { children: "w_i" }),
							" 抠掉， 剩下的 ",
							/* @__PURE__ */ jsx(M, { children: "j-w_i" }),
							" 由前面的物品去凑，方案数正是 ",
							/* @__PURE__ */ jsx(M, { children: "f[j-w_i]" }),
							"。两类",
							/* @__PURE__ */ jsx("strong", { children: "不重不漏" }),
							"，加起来就是新的 ",
							/* @__PURE__ */ jsx(M, { children: "f[j]" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[j] \\mathrel{+}= f[j-w_i]\\qquad (j:\\,m\\to w_i)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"和 01 背包一样",
							/* @__PURE__ */ jsx("strong", { children: "倒序" }),
							"——每件至多计入一次，倒序让 ",
							/* @__PURE__ */ jsx(M, { children: "f[j-w_i]" }),
							" 停在「这件还没参与」的旧值上。真正的分水岭在",
							/* @__PURE__ */ jsx("strong", { children: "初值" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "f[0]=1,\\qquad f[j]=0\\ (j>0)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"为什么 ",
							/* @__PURE__ */ jsx(M, { children: "f[0]=1" }),
							"？因为「凑出容量 0」有且只有",
							/* @__PURE__ */ jsx("strong", { children: "一种" }),
							"办法——",
							/* @__PURE__ */ jsx("strong", { children: "什么都不装" }),
							"（空方案）。这个 1 是所有计数的",
							/* @__PURE__ */ jsx("strong", { children: "种子" }),
							"： 它顺着 ",
							/* @__PURE__ */ jsx(M, { children: "\\mathrel{+}=" }),
							" 一路传播，每落到一个能被凑出的容量，就点亮一种新组合。若把它写成 0，整张表会永远是 0，一种方案也数不出来。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质 · 算子决定问题，骨架不动",
					children: [
						"背包框架回答的是「用这些物品凑容量」这件事本身；",
						/* @__PURE__ */ jsx("strong", { children: "把结果如何聚合，是另一个正交的维度" }),
						"。",
						/* @__PURE__ */ jsx(M, { children: "\\max" }),
						"（最优）、",
						/* @__PURE__ */ jsx(M, { children: "+" }),
						"（计数）、",
						/* @__PURE__ */ jsx(M, { children: "\\lor" }),
						"（可行）只是同一骨架上换插头。 计数型的两处硬改动就记死：",
						/* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsx(M, { children: "\\max\\to +" }) }),
						"、",
						/* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsx(M, { children: "f[0]=1" }) }),
						"。"
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"还有一个常混的点：",
						/* @__PURE__ */ jsx("strong", { children: "「恰好装满」" }),
						"还是",
						/* @__PURE__ */ jsx("strong", { children: "「不超过」" }),
						"？看你把种子撒在哪、答案读哪格。 要「恰好装满 ",
						/* @__PURE__ */ jsx(M, { children: "m" }),
						"」，就只让 ",
						/* @__PURE__ */ jsx(M, { children: "f[0]=1" }),
						"（唯一合法的空起点），答案读 ",
						/* @__PURE__ */ jsx(M, { children: "f[m]" }),
						"； 若问「总重不超过 ",
						/* @__PURE__ */ jsx(M, { children: "m" }),
						" 的方案数」，则把 ",
						/* @__PURE__ */ jsx(M, { children: "f[0..m]" }),
						" 全设成 1（任何容量都允许「空着」），或最后对 ",
						/* @__PURE__ */ jsx(M, { children: "f[0..m]" }),
						" 求和。本页例题走的都是「恰好」这一支。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "跟着算一遍：两条组合各贡献 1"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"用三件物品 ",
						/* @__PURE__ */ jsx(M, { children: "w=(2,3,5)" }),
						"、目标容量 ",
						/* @__PURE__ */ jsx(M, { children: "5" }),
						" 走一遍。手上先想清答案：恰好凑出 5 的子集只有 ",
						/* @__PURE__ */ jsx(M, { children: "\\{2,3\\}" }),
						" 和 ",
						/* @__PURE__ */ jsx(M, { children: "\\{5\\}" }),
						" 两个，所以 ",
						/* @__PURE__ */ jsx(M, { children: "f[5]" }),
						" 该等于 ",
						/* @__PURE__ */ jsx("strong", { children: "2" }),
						"。看表怎么把这 2 数出来："
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
									/* @__PURE__ */ jsx("b", { children: "撒种子。" }),
									" ",
									/* @__PURE__ */ jsx(M, { children: "f[0]=1" }),
									"，其余 ",
									/* @__PURE__ */ jsx(M, { children: "f[1..5]=0" }),
									"。此刻只有「空方案」这一种被记下。"
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
									/* @__PURE__ */ jsx("b", { children: "放物品 1" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "w=2" }),
									"），倒序 ",
									/* @__PURE__ */ jsx(M, { children: "j:5\\to 2" }),
									"。只有 ",
									/* @__PURE__ */ jsx(M, { children: "f[2]\\mathrel{+}=f[0]=1" }),
									" 有效，其余来源都是 0。表变成 ",
									/* @__PURE__ */ jsx(M, { children: "1,0,1,0,0,0" }),
									"——凑出 2 有 1 种（就 ",
									/* @__PURE__ */ jsx(M, { children: "\\{2\\}" }),
									"）。"
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
									/* @__PURE__ */ jsx("b", { children: "放物品 2" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "w=3" }),
									"），倒序 ",
									/* @__PURE__ */ jsx(M, { children: "j:5\\to 3" }),
									"。",
									/* @__PURE__ */ jsx(M, { children: "f[5]\\mathrel{+}=f[2]=1" }),
									"（这就是 ",
									/* @__PURE__ */ jsx(M, { children: "\\{2,3\\}" }),
									"！）、",
									/* @__PURE__ */ jsx(M, { children: "f[3]\\mathrel{+}=f[0]=1" }),
									"。表变成 ",
									/* @__PURE__ */ jsx(M, { children: "1,0,1,1,0,1" }),
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
									/* @__PURE__ */ jsx("b", { children: "放物品 3" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "w=5" }),
									"），倒序 ",
									/* @__PURE__ */ jsx(M, { children: "j:5" }),
									"。",
									/* @__PURE__ */ jsx(M, { children: "f[5]\\mathrel{+}=f[0]=1" }),
									"（这是 ",
									/* @__PURE__ */ jsx(M, { children: "\\{5\\}" }),
									"）。",
									/* @__PURE__ */ jsx(M, { children: "f[5]" }),
									" 从 1 加到 ",
									/* @__PURE__ */ jsx("strong", { children: "2" }),
									"——两条组合各贡献 1，和手数吻合。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(CountBuildFigure, {}), /* @__PURE__ */ jsxs("figcaption", {
						className: "figure__cap",
						children: [
							"三件全部做完后 f[0..5]=1,0,1,1,0,2：容量 5 由 ",
							"{2,3}",
							" 与 ",
							"{5}",
							" 两条路各累加 1，最终方案数 2。"
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" ",
						/* @__PURE__ */ jsx("strong", { children: "逐格累加" }),
						"给你看，高亮每一步是从哪个 ",
						/* @__PURE__ */ jsx(M, { children: "f[j-w]" }),
						" 加过来的。改物品重量或目标容量，看方案数实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看方案数一格一格叠出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(KnapsackVariantDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化 · 撤销：正难则反，把某件「退」出去"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"方案数背包有一个极漂亮的延伸。设想这样的问题（洛谷 P4141「消失之物」）：",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 个物品， 对",
							/* @__PURE__ */ jsx("strong", { children: "每一个" }),
							"物品 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							"，都要回答「假如第 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							" 件",
							/* @__PURE__ */ jsx("strong", { children: "消失" }),
							"了，凑出体积 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 的方案数是多少」。 最笨的办法是抠掉一件、重算一遍整张表，",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 件就是 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 遍，",
							/* @__PURE__ */ jsx(M, { children: "O(n^2 m)" }),
							"——太慢。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "正难则反" }),
							"：与其一件件「不放进去」，不如先把",
							/* @__PURE__ */ jsx("strong", { children: "全部物品都放进去" }),
							"算出全集方案数 ",
							/* @__PURE__ */ jsx(M, { children: "f[j]" }),
							"， 再针对要消失的那件做一次",
							/* @__PURE__ */ jsx("strong", { children: "逆操作" }),
							"，把它对 ",
							/* @__PURE__ */ jsx(M, { children: "f" }),
							" 的贡献「",
							/* @__PURE__ */ jsx("strong", { children: "退" }),
							"」掉。当初加它是 ",
							/* @__PURE__ */ jsx(M, { children: "f[j]\\mathrel{+}=f[j-w_k]" }),
							"， 那么退它就是它的逆："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "g[j] \\mathrel{-}= g[j-w_k]\\qquad (j:\\,w_k\\to m)" })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(UndoFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "先算含全部物品的 g[j]，再对第 k 件逆操作 g[j] −= g[j−w]，得到「缺这件」的方案数。加它倒序、退它正序，方向恰好相反。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "方向是这里唯一的陷阱。" }),
						"回想计数为什么倒序：为了让 ",
						/* @__PURE__ */ jsx(M, { children: "f[j-w]" }),
						" 保持「本件还没加入」的干净旧值。撤销要的恰恰相反—— 算 ",
						/* @__PURE__ */ jsx(M, { children: "g[j]" }),
						" 时，我需要 ",
						/* @__PURE__ */ jsx(M, { children: "g[j-w_k]" }),
						" 已经是",
						/* @__PURE__ */ jsx("strong", { children: "「本件退干净」" }),
						"的值，这样减出来的 ",
						/* @__PURE__ */ jsx(M, { children: "g[j]" }),
						" 才不含第 ",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						" 件。 而 ",
						/* @__PURE__ */ jsx(M, { children: "j-w_k < j" }),
						"，所以必须让小下标",
						/* @__PURE__ */ jsx("strong", { children: "先" }),
						"被退——也就是 ",
						/* @__PURE__ */ jsx(M, { children: "j" }),
						" 从 ",
						/* @__PURE__ */ jsx(M, { children: "w_k" }),
						" ",
						/* @__PURE__ */ jsx("strong", { children: "正序" }),
						"涨到 ",
						/* @__PURE__ */ jsx(M, { children: "m" }),
						"。 把方向记反，退出来的就是一堆错数。"
					] })
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱 · 撤销的方向与加时相反",
					children: [
						"加一件物品用",
						/* @__PURE__ */ jsx("strong", { children: "倒序" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "j:m\\to w" }),
						"），撤一件物品用",
						/* @__PURE__ */ jsx("strong", { children: "正序" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "j:w\\to m" }),
						"）——这不是可选项，是逆操作的内在要求： 撤销时 ",
						/* @__PURE__ */ jsx(M, { children: "g[j]" }),
						" 依赖",
						/* @__PURE__ */ jsx("strong", { children: "已经退干净" }),
						"的 ",
						/* @__PURE__ */ jsx(M, { children: "g[j-w]" }),
						"，故小下标必须先处理。此外别在原数组上直接减（会污染下一件的撤销）， 每次",
						/* @__PURE__ */ jsxs("strong", { children: [
							"从全集 ",
							/* @__PURE__ */ jsx(M, { children: "f" }),
							" 拷一份 ",
							/* @__PURE__ */ jsx(M, { children: "g" }),
							" 再退"
						] }),
						"；带模数时减法记得 ",
						/* @__PURE__ */ jsx(M, { children: "+\\text{MOD}" }),
						" 再取模，避免出现负数。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "看它把一件「退」出去"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"先看",
						/* @__PURE__ */ jsx("strong", { children: "第一幕" }),
						"把全部物品倒序累加成全集 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						"；再挑「让第几件消失」，",
						/* @__PURE__ */ jsx("strong", { children: "第二幕" }),
						"会拷一份 ",
						/* @__PURE__ */ jsx(M, { children: "g\\gets f" }),
						"， 对那件",
						/* @__PURE__ */ jsx("strong", { children: "正序" }),
						"逐格做 ",
						/* @__PURE__ */ jsx(M, { children: "g[j]\\mathrel{-}=g[j-w_k]" }),
						"——注意方向和加时（倒序）相反。末帧上下两行并排：全集 ",
						/* @__PURE__ */ jsx(M, { children: "f[j]" }),
						" vs 缺那件的 ",
						/* @__PURE__ */ jsx(M, { children: "g[j]" }),
						"。 留意默认这组：",
						/* @__PURE__ */ jsx(M, { children: "w=(2,3,5)" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "W=5" }),
						" 时全集 ",
						/* @__PURE__ */ jsx(M, { children: "f[5]=2" }),
						"，让 ",
						/* @__PURE__ */ jsx(M, { children: "w=5" }),
						" 那件消失后 ",
						/* @__PURE__ */ jsx(M, { children: "g[5]" }),
						" 退成 ",
						/* @__PURE__ */ jsx("strong", { children: "1" }),
						"（只剩 ",
						/* @__PURE__ */ jsx(M, { children: "\\{2,3\\}" }),
						"）——方案数从 2 降到 1，退掉的正是用到它的那条。"
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(VariantUndoDemo, {})
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
					pid: "P1164",
					name: "小 A 点菜",
					src: "洛谷原生",
					diff: "普及-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 道菜价格已知，手上恰好 ",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								" 元，求",
								/* @__PURE__ */ jsx("strong", { children: "恰好花完" }),
								"这 ",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								" 元的点菜方案数。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"「价格」= 重量 ",
								/* @__PURE__ */ jsx(M, { children: "w" }),
								"，「手上的钱 ",
								/* @__PURE__ */ jsx(M, { children: "m" }),
								"」= 目标容量。每道菜至多点一次 → 计数型 ",
								/* @__PURE__ */ jsx("strong", { children: "01 背包" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"从「最优 DP」跨到「计数 DP」",
								/* @__PURE__ */ jsx("strong", { children: "最平滑" }),
								"的一题：转移里的 ",
								/* @__PURE__ */ jsx(M, { children: "\\max" }),
								" 原样换成 ",
								/* @__PURE__ */ jsx(M, { children: "+" }),
								"、初值置 ",
								/* @__PURE__ */ jsx(M, { children: "f[0]=1" }),
								"，其余骨架分毫不动。是理解「换算子」的入门标杆。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[j]\\mathrel{+}=f[j-a_i]" }),
								"，一维倒序、",
								/* @__PURE__ */ jsx(M, { children: "f[0]=1" }),
								"；答案 ",
								/* @__PURE__ */ jsx(M, { children: "f[m]" }),
								"，时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
								"。方案数可能较大，",
								/* @__PURE__ */ jsxs("strong", { children: ["用 ", /* @__PURE__ */ jsx(M, { children: "\\texttt{long long}" })] }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（01 计数）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1164,
								luogu: "P1164"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P4141",
					name: "消失之物",
					src: "洛谷原生",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个物品各有体积 ",
								/* @__PURE__ */ jsx(M, { children: "w_i" }),
								"。对每个 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								"，求「第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 件消失后，用其余物品恰好凑出体积 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "1\\le j\\le m" }),
								"）」的方案数。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"「对每件都要缺它一次的方案数」，直接重算是 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2m)" }),
								"。此题逼你用",
								/* @__PURE__ */ jsx("strong", { children: "撤销（正难则反）" }),
								"：先算全集 ",
								/* @__PURE__ */ jsx(M, { children: "f" }),
								"，再对每件做逆操作退掉贡献——把 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 遍重算压到 ",
								/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
								"。是「计数 DP 可逆」这一思想最经典的载体。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角",
							children: [
								"背包转移在计数意义下是",
								/* @__PURE__ */ jsx("strong", { children: "可逆" }),
								"的：加它 ",
								/* @__PURE__ */ jsx(M, { children: "f[j]\\mathrel{+}=f[j-w]" }),
								" 的逆就是退它 ",
								/* @__PURE__ */ jsx(M, { children: "g[j]\\mathrel{-}=g[j-w]" }),
								"。唯一要翻转的是",
								/* @__PURE__ */ jsx("strong", { children: "循环方向" }),
								"——加倒序、退正序。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"全集 ",
								/* @__PURE__ */ jsx(M, { children: "f[j]\\mathrel{+}=f[j-w_i]" }),
								"（倒序）；对每件拷 ",
								/* @__PURE__ */ jsx(M, { children: "g\\gets f" }),
								" 后 ",
								/* @__PURE__ */ jsx(M, { children: "g[j]\\mathrel{-}=g[j-w_i]" }),
								"（",
								/* @__PURE__ */ jsx("strong", { children: "正序" }),
								"）。时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(nm)" }),
								"，按题意对结果取模。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（全集 + 撤销）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P4141,
								luogu: "P4141"
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
					pid: "P2347",
					name: "[NOIP1996 提高组] 砝码称重",
					hint: "布尔可行变形：f[j] 表示「重量 j 能否被称出」，把 max 换成逻辑或 f[j] |= f[j-w]，f[0]=true；每种砝码有限个，按多重背包逐件处理，最后数一遍有多少个 j 为真。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2563",
					name: "[AHOI2001] 质数和分解",
					hint: "完全背包求方案数：先筛出不超过 n 的质数当「无限件物品」，f[j] += f[j-p] 正序（每种质数可重复用），f[0]=1；f[n] 即把 n 写成若干质数之和的无序分解数。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1077",
					name: "[NOIP2012 普及组] 摆花",
					hint: "有限件求方案数：f[j] 表示恰好摆 j 盆的方案数，第 i 种花取 0..a_i 盆；朴素枚举件数是 O(n·m·a)，可对「枚举本种取几盆」那一维用前缀和优化掉一维。"
				})
			]
		})
	] });
}
//#endregion
export { KnapsackVariant as default };
