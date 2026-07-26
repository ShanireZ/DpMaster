import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, MousePointerClick, Plus, RotateCcw, Shuffle, TrendingUp, Wallet, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/linear-fsm/internal.ts
function validateFinite(values, label) {
	for (const value of values) if (!Number.isFinite(value)) throw new RangeError(`${label} values must be finite`);
}
function executeLinearFsm(values, emit) {
	validateFinite(values, "linear FSM");
	const table = Array.from({ length: 2 }, () => Array(values.length + 1).fill(0));
	for (let position = 1; position <= values.length; position++) {
		const previousSkip = table[0][position - 1];
		const previousPick = table[1][position - 1];
		const skipFrom = previousSkip >= previousPick ? 0 : 1;
		const skip = Math.max(previousSkip, previousPick);
		const pick = previousSkip + values[position - 1];
		table[0][position] = skip;
		table[1][position] = pick;
		emit({
			type: "settled",
			position,
			value: values[position - 1],
			previousSkip,
			previousPick,
			skip,
			pick,
			skipFrom
		});
	}
	const finalState = table[1][values.length] >= table[0][values.length] ? 1 : 0;
	return {
		value: table[finalState][values.length],
		table,
		finalState
	};
}
function recordLinearFsm(values) {
	const events = [];
	return {
		result: executeLinearFsm(values, (event) => events.push(event)),
		events
	};
}
function executeStockFsm(prices, cooldown, emit) {
	validateFinite(prices, "stock FSM");
	const days = [];
	let previousCash = 0;
	let previousHold = Number.NEGATIVE_INFINITY;
	let cashBeforePrevious = 0;
	for (let index = 0; index < prices.length; index++) {
		const price = prices[index];
		const sell = previousHold + price;
		const cash = Math.max(previousCash, sell);
		const cashFrom = sell > previousCash ? "sell" : "cash";
		const buy = (cooldown ? cashBeforePrevious : previousCash) - price;
		const hold = Math.max(previousHold, buy);
		const holdFrom = buy > previousHold ? "buy" : "hold";
		const froze = cooldown && index >= 1 && days[index - 1].cashFrom === "sell";
		const day = {
			day: index + 1,
			price,
			hold,
			cash,
			holdFrom,
			cashFrom,
			froze
		};
		days.push(day);
		emit({
			type: "settled",
			...day
		});
		cashBeforePrevious = previousCash;
		previousCash = cash;
		previousHold = hold;
	}
	return {
		profit: previousCash,
		days
	};
}
//#endregion
//#region src/algorithms/linear-fsm/index.ts
function solveLinearFsm(values) {
	return executeLinearFsm(values, ignoreEvents);
}
function solveStockFsm(prices, cooldown) {
	return executeStockFsm(prices, cooldown, ignoreEvents);
}
//#endregion
//#region src/components/demos/fsm/fsmSolver.ts
function settled(values) {
	const states = {};
	for (let row = 0; row < values.length; row++) for (let column = 0; column < values[row].length; column++) if (values[row][column] !== null) states[key(row, column)] = "settled";
	return states;
}
function fsmPickTable(values) {
	const run = recordLinearFsm(values);
	const table = Array.from({ length: 2 }, () => Array(values.length + 1).fill(null));
	table[0][0] = 0;
	table[1][0] = 0;
	const snap = () => table.map((row) => row.slice());
	const frames = [{
		values: snap(),
		states: settled(table),
		caption: "<b>哨兵起点</b>：尚未考虑元素时，「不选」与「选」两状态的最优值都是 0。",
		formula: "dp[0][0]=dp[0][1]=0"
	}];
	for (const event of run.events) {
		const position = event.position;
		table[0][position] = event.skip;
		table[1][position] = event.pick;
		{
			const states = settled(table);
			states[key(0, position - 1)] = event.skipFrom === 0 ? "chosen" : "source";
			states[key(1, position - 1)] = event.skipFrom === 1 ? "chosen" : "source";
			states[key(0, position)] = "current";
			const arrows = [{
				from: {
					r: 0,
					c: position - 1
				},
				to: {
					r: 0,
					c: position
				},
				kind: event.skipFrom === 0 ? "chosen" : "source"
			}, {
				from: {
					r: 1,
					c: position - 1
				},
				to: {
					r: 0,
					c: position
				},
				kind: event.skipFrom === 1 ? "chosen" : "source"
			}];
			frames.push({
				values: snap(),
				states,
				active: {
					r: 0,
					c: position
				},
				arrows,
				caption: `位置 <b>${position}</b> · 不选：上一列两状态 ${event.previousSkip} 与 ${event.previousPick} 取较大者 <b>${event.skip}</b>。`,
				formula: `dp[${position}][0]=\\max(${event.previousSkip},${event.previousPick})=${event.skip}`
			});
		}
		{
			const states = settled(table);
			states[key(0, position - 1)] = "chosen";
			states[key(1, position)] = "current";
			const arrows = [{
				from: {
					r: 0,
					c: position - 1
				},
				to: {
					r: 1,
					c: position
				},
				kind: "chosen"
			}];
			frames.push({
				values: snap(),
				states,
				active: {
					r: 1,
					c: position
				},
				arrows,
				caption: `位置 <b>${position}</b> · 选：只能从前一位置的「不选」转来，加上 ${event.value} 得 <b>${event.pick}</b>。`,
				formula: `dp[${position}][1]=${event.previousSkip}+${event.value}=${event.pick}`
			});
		}
	}
	const finalStates = settled(table);
	finalStates[key(run.result.finalState, values.length)] = "chosen";
	finalStates[key(1 - run.result.finalState, values.length)] = "source";
	frames.push({
		values: snap(),
		states: finalStates,
		caption: `末列两状态取较大者，答案是 <b>${run.result.value}</b>。`,
		formula: `\\text{ans}=\\max(dp[${values.length}][0],dp[${values.length}][1])=${run.result.value}`
	});
	return {
		rows: 2,
		cols: values.length + 1,
		cell: 46,
		rowHeaderLabels: ["不选", "选"],
		colHeaderLabels: Array.from({ length: values.length + 1 }, (_, index) => index === 0 ? "起" : `a${index}`),
		frames
	};
}
function stockStates(prices, cooldown) {
	return solveStockFsm(prices, cooldown).days;
}
function stockBestProfit(prices) {
	return solveStockFsm(prices, false).profit;
}
//#endregion
//#region src/components/demos/fsm/StateMachineDemo.tsx
var PRESETS$1 = [
	{
		label: "经典样例",
		a: [
			1,
			2,
			3,
			1
		]
	},
	{
		label: "大谷两侧",
		a: [
			2,
			7,
			9,
			3,
			1
		]
	},
	{
		label: "连号递增",
		a: [
			1,
			2,
			3,
			4,
			5
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
* 主演示 · 选 / 不选两状态填表（打家劫舍 / 选不相邻式）。
* 二维 dp[状态][位置]：行 0=不选、行 1=选，逐位置逐状态填，
* 高亮每格在上一位置的两个来源。数组可编辑，实时重算并重播。
*/
function StateMachineDemo() {
	const [a, setA] = useState(PRESETS$1[0].a);
	const model = useMemo(() => fsmPickTable(a), [a]);
	const ans = useMemo(() => solveLinearFsm(a).value, [a]);
	const modelKey = `fsm-${a.join("_")}`;
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
				onClick: () => setA(shuffle(a)),
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
				children: "数组 a[]（每个值可增减；目标：选一批「两两不相邻」的数，使和最大）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "kd__items",
				children: [a.map((v, i) => /* @__PURE__ */ jsx(NumStepper, {
					value: v,
					min: 1,
					max: 20,
					onChange: (nv) => setAt(i, nv),
					onRemove: () => removeAt(i),
					removable: a.length > 2
				}, i)), a.length < 9 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: addOne,
					children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加元素"]
				})]
			})] })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"当前数组的最大不相邻和：",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: ["ans = ", ans]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "you",
					children: " （= 末列 max(不选, 选)，任意两个被选的数下标都不相邻）"
				})
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
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
//#region src/components/demos/fsm/StockStateDemo.tsx
var PRESETS = [
	{
		label: "经典波动",
		p: [
			7,
			1,
			5,
			3,
			6,
			4
		]
	},
	{
		label: "单调上涨",
		p: [
			1,
			2,
			3,
			4,
			5
		]
	},
	{
		label: "尖峰回落",
		p: [
			2,
			4,
			1,
			7,
			3
		]
	}
];
var NEG = -1e9;
var fmt = (v) => v <= -1e8 ? "−∞" : String(v);
/**
* 第二演示 · 股票买卖状态机（自建可视化，非 DPViz）。
* 两状态节点「持有 / 空仓」逐日更新最优现金，价格时间轴上逐日点亮
* 买 / 卖 / 持有 / 空仓（可选冷却期）四种动作。价格序列可编辑、可勾选冷却。
* 递推来自 stockStates；无冷却时最终「空仓」值 = 无限次交易最优利润（stockBestProfit 核对）。
*/
function StockStateDemo() {
	const [prices, setPrices] = useState(PRESETS[0].p);
	const [cooldown, setCooldown] = useState(false);
	const [day, setDay] = useState(prices.length);
	const days = useMemo(() => stockStates(prices, cooldown), [prices, cooldown]);
	const naiveBest = useMemo(() => stockBestProfit(prices), [prices]);
	const clampDay = (d) => Math.max(1, Math.min(prices.length, d));
	const curIdx = clampDay(day) - 1;
	const cur = days[curIdx];
	const setAt = (i, v) => setPrices((arr) => arr.map((x, k) => k === i ? v : x));
	const removeAt = (i) => setPrices((arr) => {
		const next = arr.filter((_, k) => k !== i);
		setDay((d) => Math.min(d, next.length));
		return next;
	});
	const addOne = () => setPrices((arr) => {
		const next = [...arr, Math.max(1, arr[arr.length - 1] ?? 1)];
		setDay(next.length);
		return next;
	});
	const pickPreset = (p) => {
		setPrices(p);
		setDay(p.length);
	};
	const maxPrice = Math.max(...prices, 1);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "kd__modes",
			children: PRESETS.map((pr) => /* @__PURE__ */ jsx("button", {
				className: `kd__mode${prices.join(",") === pr.p.join(",") ? " on" : ""}`,
				onClick: () => pickPreset(pr.p),
				children: pr.label
			}, pr.label))
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "stk__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "stk__group-label",
				children: "价格序列 price[]（每天一个，可增减 / 加删）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "stk__prices",
				children: [prices.map((v, i) => /* @__PURE__ */ jsxs("div", {
					className: "stk__price-item",
					children: [
						prices.length > 2 && /* @__PURE__ */ jsx("button", {
							className: "kd__remove",
							onClick: () => removeAt(i),
							"aria-label": "删除这天",
							children: /* @__PURE__ */ jsx(X, { size: 12 })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "stepper__lab",
							children: [
								"第 ",
								i + 1,
								" 天"
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "stepper__row",
							children: [
								/* @__PURE__ */ jsx("button", {
									onClick: () => setAt(i, Math.max(1, v - 1)),
									disabled: v <= 1,
									"aria-label": "减",
									children: /* @__PURE__ */ jsx(Minus, { size: 12 })
								}),
								/* @__PURE__ */ jsx("span", {
									className: "stepper__val",
									children: v
								}),
								/* @__PURE__ */ jsx("button", {
									onClick: () => setAt(i, Math.min(20, v + 1)),
									disabled: v >= 20,
									"aria-label": "加",
									children: /* @__PURE__ */ jsx(Plus, { size: 12 })
								})
							]
						})
					]
				}, i)), prices.length < 9 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: addOne,
					children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加一天"]
				})]
			})] }), /* @__PURE__ */ jsxs("label", {
				className: "stk__cd",
				children: [/* @__PURE__ */ jsx("input", {
					type: "checkbox",
					checked: cooldown,
					onChange: (e) => setCooldown(e.target.checked)
				}), "冷却期（卖出次日不能买入）"]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "stk__timeline-label",
			children: [/* @__PURE__ */ jsxs("span", { children: [
				"逐日推演：点某天或用下方按钮走到第 ",
				/* @__PURE__ */ jsx("b", {
					className: "mono",
					children: clampDay(day)
				}),
				" 天"
			] }), /* @__PURE__ */ jsxs("span", {
				className: "mono",
				children: ["买 / 卖 / 持 / 空", cooldown ? " / 冷" : ""]
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "stk__track",
			children: days.map((d, i) => {
				const cls = i < curIdx ? "past" : i > curIdx ? "future" : "active";
				const act = d.cashFrom === "sell" ? "sell" : d.holdFrom === "buy" ? "buy" : d.froze ? "froze" : "hold";
				const actLab = act === "sell" ? "卖" : act === "buy" ? "买" : act === "froze" ? "冷" : "持/空";
				return /* @__PURE__ */ jsxs("div", {
					className: `stk__day ${cls}`,
					onClick: () => setDay(i + 1),
					title: `第 ${i + 1} 天，价 ${d.price}`,
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "stk__price-num",
							children: d.price
						}),
						/* @__PURE__ */ jsx("div", {
							className: "stk__bar-wrap",
							children: /* @__PURE__ */ jsx("div", {
								className: "stk__bar",
								style: { height: `${8 + d.price / maxPrice * 56}px` }
							})
						}),
						/* @__PURE__ */ jsx("span", {
							className: `stk__act ${act}`,
							children: actLab
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "stk__day-idx",
							children: ["d", i + 1]
						})
					]
				}, i);
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "stk__machine",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "stk__machine-label",
				children: [
					"第 ",
					/* @__PURE__ */ jsx("b", { children: clampDay(day) }),
					" 天（价 ",
					/* @__PURE__ */ jsx("b", { children: cur.price }),
					"）结束时，两状态的最优现金："
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "stk__nodes",
				children: [/* @__PURE__ */ jsxs("div", {
					className: `stk__node hold${cur.hold > NEG / 2 ? " on" : ""}`,
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "stk__node-head",
							children: [
								/* @__PURE__ */ jsx("span", { className: "stk__node-dot" }),
								/* @__PURE__ */ jsx(TrendingUp, { size: 15 }),
								" 持有一股（hold）"
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: `stk__node-val${cur.hold <= NEG / 2 ? " neg" : ""}`,
							children: fmt(cur.hold)
						}),
						/* @__PURE__ */ jsx("div", {
							className: "stk__node-sub",
							children: "手里握着一股时的最优现金（已垫付买入价）。今日由："
						}),
						/* @__PURE__ */ jsx("span", {
							className: `stk__edge ${cur.holdFrom === "buy" ? "buy" : "keep"}`,
							children: cur.holdFrom === "buy" ? `今日买入（−${cur.price}）` : "继续持有（不动）"
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "stk__node cash on",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "stk__node-head",
							children: [
								/* @__PURE__ */ jsx("span", { className: "stk__node-dot" }),
								/* @__PURE__ */ jsx(Wallet, { size: 15 }),
								" 空仓（cash）"
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "stk__node-val",
							children: fmt(cur.cash)
						}),
						/* @__PURE__ */ jsx("div", {
							className: "stk__node-sub",
							children: "手里没有股票时的最优现金（落袋利润）。今日由："
						}),
						/* @__PURE__ */ jsx("span", {
							className: `stk__edge ${cur.cashFrom === "sell" ? "sell" : "keep"}`,
							children: cur.cashFrom === "sell" ? `今日卖出（+${cur.price}）` : "继续空仓（不动）"
						})
					]
				})]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "stk__readout",
			children: [
				"走到第 ",
				clampDay(day),
				" 天，空仓最优现金 = ",
				/* @__PURE__ */ jsx("b", { children: fmt(cur.cash) }),
				"。",
				clampDay(day) === prices.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
					" ",
					"全程结束——最终答案取",
					/* @__PURE__ */ jsx("strong", { children: "空仓" }),
					"态（手里不留股才算落袋）：",
					/* @__PURE__ */ jsx("b", { children: fmt(days[prices.length - 1].cash) }),
					"。",
					!cooldown && /* @__PURE__ */ jsxs(Fragment, { children: [
						" ",
						"与「逢涨就吃」贪心核对：无限次交易最优利润 = ",
						/* @__PURE__ */ jsx("b", { children: naiveBest }),
						"，两者一致。"
					] })
				] }) : /* @__PURE__ */ jsx(Fragment, { children: " 继续往后走，看两状态如何随每天买 / 卖 / 不动而更新。" })
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "stk__ctl",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "stk__ctl-btns",
				children: [
					/* @__PURE__ */ jsx("button", {
						onClick: () => setDay(1),
						"aria-label": "回到第一天",
						title: "回到第一天",
						children: /* @__PURE__ */ jsx(RotateCcw, { size: 17 })
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => setDay((d) => clampDay(d - 1)),
						disabled: clampDay(day) <= 1,
						"aria-label": "前一天",
						children: /* @__PURE__ */ jsx(ChevronLeft, { size: 19 })
					}),
					/* @__PURE__ */ jsx("button", {
						className: "primary",
						onClick: () => setDay((d) => clampDay(d + 1)),
						disabled: clampDay(day) >= prices.length,
						"aria-label": "后一天",
						children: /* @__PURE__ */ jsx(ChevronRight, { size: 19 })
					})
				]
			}), /* @__PURE__ */ jsxs("span", {
				className: "stk__ctl-count",
				children: [
					"第 ",
					clampDay(day),
					" / ",
					prices.length,
					" 天"
				]
			})]
		})
	] });
}
//#endregion
//#region src/content/b/StateMachineArt.tsx
function SetupFigure() {
	const a = [
		1,
		2,
		3,
		1
	];
	const pick = /* @__PURE__ */ new Set([0, 2]);
	const x0 = 60;
	const dx = 108;
	const bw = 74;
	const cx = (i) => x0 + i * dx + bw / 2;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 176",
		role: "img",
		"aria-label": "受限选取：选出的数两两不相邻",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "sm-ban",
				markerWidth: "8",
				markerHeight: "8",
				refX: "4",
				refY: "4",
				orient: "auto",
				children: /* @__PURE__ */ jsx("circle", {
					cx: "4",
					cy: "4",
					r: "3",
					fill: "none",
					stroke: "var(--viz-invalid)",
					strokeWidth: "1.4"
				})
			}) }),
			/* @__PURE__ */ jsxs("text", {
				x: "30",
				y: "20",
				fontSize: "13",
				fill: "var(--text-2)",
				children: ["选一批数使和最大，但", /* @__PURE__ */ jsx("tspan", {
					fill: "var(--viz-invalid)",
					children: "相邻两个不能同时选"
				})]
			}),
			a.slice(0, -1).map((_, i) => /* @__PURE__ */ jsx("line", {
				x1: cx(i) + bw / 2 - 6,
				y1: "128",
				x2: cx(i + 1) - bw / 2 + 6,
				y2: "128",
				stroke: "var(--viz-invalid)",
				strokeWidth: "1.6",
				strokeDasharray: "4 4"
			}, `ban${i}`)),
			a.map((v, i) => {
				const on = pick.has(i);
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x0 + i * dx},44)`,
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: bw,
							height: 64,
							rx: "12",
							fill: on ? "color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))" : "var(--surface-3)",
							stroke: on ? "var(--accent-2)" : "var(--border-strong)",
							strokeWidth: on ? "2.2" : "1.5"
						}),
						/* @__PURE__ */ jsxs("text", {
							x: bw / 2,
							y: "28",
							textAnchor: "middle",
							fontSize: "12",
							fill: "var(--text-2)",
							children: ["a", i + 1]
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "50",
							textAnchor: "middle",
							fontSize: "18",
							className: "mono",
							fill: on ? "var(--accent-1)" : "var(--text-1)",
							children: v
						}),
						on && /* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "-8",
							textAnchor: "middle",
							fontSize: "11",
							fill: "var(--accent-1)",
							children: "✓ 选"
						})
					]
				}, i);
			}),
			/* @__PURE__ */ jsx("text", {
				x: "360",
				y: "168",
				fontSize: "12",
				fill: "var(--accent-1)",
				children: "选 a1+a3 = 1+3 = 4（最大）"
			})
		]
	});
}
function TransitionFigure() {
	const colX = [70, 360];
	const rowY = [56, 150];
	const bw = 150;
	const bh = 58;
	const cx = (c) => colX[c] + bw / 2;
	const cy = (r) => rowY[r] + bh / 2;
	const node = (c, r, title, sub, cur = false) => /* @__PURE__ */ jsxs("g", {
		transform: `translate(${colX[c]},${rowY[r]})`,
		children: [
			/* @__PURE__ */ jsx("rect", {
				width: bw,
				height: bh,
				rx: "12",
				fill: cur ? "color-mix(in srgb, var(--viz-current) 15%, var(--surface-3))" : "var(--surface-3)",
				stroke: cur ? "var(--viz-current)" : "var(--border-strong)",
				strokeWidth: "1.6"
			}),
			/* @__PURE__ */ jsx("text", {
				x: bw / 2,
				y: "24",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: title
			}),
			/* @__PURE__ */ jsx("text", {
				x: bw / 2,
				y: "44",
				textAnchor: "middle",
				fontSize: "13",
				className: "mono",
				fill: "var(--text-1)",
				children: sub
			})
		]
	});
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 580 224",
		role: "img",
		"aria-label": "选与不选两状态之间的转移",
		children: [
			/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsx("marker", {
				id: "sm-src",
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
				id: "sm-cho",
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
				x: cx(0),
				y: "28",
				textAnchor: "middle",
				fontSize: "12",
				fontWeight: "600",
				fill: "var(--text-3)",
				children: "位置 i−1"
			}),
			/* @__PURE__ */ jsx("text", {
				x: cx(1),
				y: "28",
				textAnchor: "middle",
				fontSize: "12",
				fontWeight: "600",
				fill: "var(--accent-1)",
				children: "位置 i（a[i]）"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: colX[0] + bw,
				y1: cy(0),
				x2: colX[1],
				y2: cy(0),
				stroke: "var(--viz-source)",
				strokeWidth: "2",
				markerEnd: "url(#sm-src)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M ${colX[0] + bw} ${cy(1)} C ${(colX[0] + bw + colX[1]) / 2} ${cy(1)}, ${(colX[0] + bw + colX[1]) / 2} ${cy(0)}, ${colX[1]} ${cy(0) + 8}`,
				fill: "none",
				stroke: "var(--viz-source)",
				strokeWidth: "2",
				markerEnd: "url(#sm-src)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M ${colX[0] + bw} ${cy(0) + 10} C ${(colX[0] + bw + colX[1]) / 2} ${cy(0) + 10}, ${(colX[0] + bw + colX[1]) / 2} ${cy(1)}, ${colX[1]} ${cy(1)}`,
				fill: "none",
				stroke: "var(--viz-chosen)",
				strokeWidth: "2.6",
				markerEnd: "url(#sm-cho)"
			}),
			node(0, 0, "不选 · dp[i−1][0]", "继承的旧值"),
			node(0, 1, "选 · dp[i−1][1]", "继承的旧值"),
			node(1, 0, "不选 · dp[i][0]", "= max(上两态)", true),
			node(1, 1, "选 · dp[i][1]", "= dp[i−1][0]+a[i]", true),
			/* @__PURE__ */ jsx("text", {
				x: colX[1] + bw / 2,
				y: "212",
				textAnchor: "middle",
				fontSize: "11.5",
				fill: "var(--viz-chosen)",
				children: "「选」只接「上一位置不选」——这就锁死了相邻互斥"
			})
		]
	});
}
function StockFigure() {
	const hold = {
		x: 96,
		y: 88,
		r: 52
	};
	const cash = {
		x: 384,
		y: 88,
		r: 52
	};
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 540 200",
		role: "img",
		"aria-label": "股票买卖的持有与未持有状态机",
		children: [
			/* @__PURE__ */ jsxs("defs", { children: [
				/* @__PURE__ */ jsx("marker", {
					id: "sm-buy",
					markerWidth: "8",
					markerHeight: "8",
					refX: "6",
					refY: "3",
					orient: "auto",
					children: /* @__PURE__ */ jsx("path", {
						d: "M0,0 L6,3 L0,6 Z",
						fill: "var(--viz-chosen)"
					})
				}),
				/* @__PURE__ */ jsx("marker", {
					id: "sm-sell",
					markerWidth: "8",
					markerHeight: "8",
					refX: "6",
					refY: "3",
					orient: "auto",
					children: /* @__PURE__ */ jsx("path", {
						d: "M0,0 L6,3 L0,6 Z",
						fill: "var(--viz-current)"
					})
				}),
				/* @__PURE__ */ jsx("marker", {
					id: "sm-loop",
					markerWidth: "8",
					markerHeight: "8",
					refX: "6",
					refY: "3",
					orient: "auto",
					children: /* @__PURE__ */ jsx("path", {
						d: "M0,0 L6,3 L0,6 Z",
						fill: "var(--text-3)"
					})
				})
			] }),
			/* @__PURE__ */ jsx("path", {
				d: `M ${cash.x - cash.r} ${cash.y - 16} C 300 8, 180 8, ${hold.x + hold.r} ${hold.y - 16}`,
				fill: "none",
				stroke: "var(--viz-chosen)",
				strokeWidth: "2.6",
				markerEnd: "url(#sm-buy)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "240",
				y: "20",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--viz-chosen)",
				children: "买入（现金 − price）"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M ${hold.x + hold.r} ${hold.y + 16} C 180 172, 300 172, ${cash.x - cash.r} ${cash.y + 16}`,
				fill: "none",
				stroke: "var(--viz-current)",
				strokeWidth: "2.6",
				markerEnd: "url(#sm-sell)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "240",
				y: "168",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--viz-current)",
				children: "卖出（现金 + price）"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M ${hold.x - 20} ${hold.y - hold.r} A 22 22 0 1 1 ${hold.x + 20} ${hold.y - hold.r}`,
				fill: "none",
				stroke: "var(--text-3)",
				strokeWidth: "1.8",
				markerEnd: "url(#sm-loop)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M ${cash.x - 20} ${cash.y - cash.r} A 22 22 0 1 1 ${cash.x + 20} ${cash.y - cash.r}`,
				fill: "none",
				stroke: "var(--text-3)",
				strokeWidth: "1.8",
				markerEnd: "url(#sm-loop)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: hold.x,
				y: hold.y - hold.r - 20,
				textAnchor: "middle",
				fontSize: "11",
				fill: "var(--text-3)",
				children: "继续持有"
			}),
			/* @__PURE__ */ jsx("text", {
				x: cash.x,
				y: cash.y - cash.r - 20,
				textAnchor: "middle",
				fontSize: "11",
				fill: "var(--text-3)",
				children: "继续空仓（冷却停这）"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: hold.x,
				cy: hold.y,
				r: hold.r,
				fill: "color-mix(in srgb, var(--accent-1) 14%, var(--surface-3))",
				stroke: "var(--accent-2)",
				strokeWidth: "2.2"
			}),
			/* @__PURE__ */ jsx("text", {
				x: hold.x,
				y: hold.y - 6,
				textAnchor: "middle",
				fontSize: "14",
				fill: "var(--text-1)",
				children: "持有"
			}),
			/* @__PURE__ */ jsx("text", {
				x: hold.x,
				y: hold.y + 14,
				textAnchor: "middle",
				fontSize: "11.5",
				className: "mono",
				fill: "var(--text-2)",
				children: "hold"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: cash.x,
				cy: cash.y,
				r: cash.r,
				fill: "color-mix(in srgb, var(--viz-source) 16%, var(--surface-3))",
				stroke: "var(--border-strong)",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("text", {
				x: cash.x,
				y: cash.y - 6,
				textAnchor: "middle",
				fontSize: "14",
				fill: "var(--text-1)",
				children: "未持有"
			}),
			/* @__PURE__ */ jsx("text", {
				x: cash.x,
				y: cash.y + 14,
				textAnchor: "middle",
				fontSize: "11.5",
				className: "mono",
				fill: "var(--text-2)",
				children: "cash"
			})
		]
	});
}
//#endregion
//#region src/content/b/StateMachine.tsx
var CODE_P2196 = `
#include <iostream>
#include <algorithm>
using namespace std;

int n;
int a[25];                       // 每个地窖的地雷数
bool g[25][25];                  // g[i][j]：i 能否走到 j（题目保证 j>i）
int f[25], nxt[25];              // f[i]：从 i 出发最多能挖的地雷；nxt[i]：路径上 i 的下一个

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> a[i];
    for (int i = 1; i < n; i++)          // 上三角连接矩阵：i 到 i+1..n
        for (int j = i + 1; j <= n; j++)
            cin >> g[i][j];

    int start = 1;
    for (int i = n; i >= 1; i--)         // ★逆序：转移只依赖编号更大的地窖
    {
        f[i] = a[i];                     // 至少挖自己这一窖
        nxt[i] = 0;                      // 0 表示到此为止
        for (int j = i + 1; j <= n; j++)
            if (g[i][j] && a[i] + f[j] > f[i])
            {
                f[i] = a[i] + f[j];      // 接到 j 那条最优链后面
                nxt[i] = j;              // 记下一步，供回溯路径
            }
        if (f[i] > f[start])             // 起点可以是任意地窖，取全局最优
            start = i;
    }

    for (int i = start; i; i = nxt[i])   // 顺着 nxt 链把路径打印出来
        cout << i << (nxt[i] ? " " : "\\n");
    cout << f[start] << endl;
    return 0;
}
// TAG: 线性DP DAG路径 状态机 方案回溯`;
var CODE_P4310 = `
#include <iostream>
#include <algorithm>
using namespace std;

int n, ans;
int f[35];                       // f[b]：以「第 b 位为 1 的数」结尾的最长合法子序列长度

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        int x;
        cin >> x;

        // 决策的记忆压进 31 个「按位状态」里：
        // b_i & b_{i-1} != 0 ⇔ 两数至少共享一个为 1 的位。
        int best = 0;                    // 能接在谁后面：所有与 x 共位的状态取最大
        for (int b = 0; b < 31; b++)
            if (x >> b & 1)
                best = max(best, f[b]);

        int cur = best + 1;              // x 自己接上去，长度 +1
        for (int b = 0; b < 31; b++)     // x 的每个为 1 的位都被刷新为 cur
            if (x >> b & 1)
                f[b] = max(f[b], cur);

        ans = max(ans, cur);
    }

    cout << ans << endl;
    return 0;
}
// TAG: 线性DP 按位状态机 f[bit]转移 O(30n)`;
function StateMachine() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "给每个位置装上一个「状态」"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"到目前为止，线性 DP 的每个位置 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 只记一个数：",
						/* @__PURE__ */ jsx(M, { children: "dp[i]" }),
						"。但很多问题里，「站在位置 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						"」并不是一个笼统的局面—— 它还分",
						/* @__PURE__ */ jsx("strong", { children: "几种互斥的处境" }),
						"。比如手上",
						/* @__PURE__ */ jsx("strong", { children: "有没有股票" }),
						"、第 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 个数",
						/* @__PURE__ */ jsx("strong", { children: "选了没选" }),
						"、机器此刻",
						/* @__PURE__ */ jsx("strong", { children: "停在哪一档" }),
						"。 于是我们给每个位置引入若干",
						/* @__PURE__ */ jsx("strong", { children: "离散状态" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "s" }),
						"，用 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i][s]" }),
						" 分别记录，让转移在",
						/* @__PURE__ */ jsx("strong", { children: "状态之间" }),
						"流动——这就是",
						/* @__PURE__ */ jsx("strong", { children: "线性状态机 DP" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"先看一个最朴素的「受限选取」：给一排数 ",
						/* @__PURE__ */ jsx(M, { children: "a_1,a_2,\\dots,a_n" }),
						"，要挑出若干个使",
						/* @__PURE__ */ jsx("strong", { children: "总和最大" }),
						"，但有一条硬约束——",
						/* @__PURE__ */ jsx("strong", { children: "相邻的两个不能同时选" }),
						"（选了 ",
						/* @__PURE__ */ jsx(M, { children: "a_i" }),
						" 就不能选 ",
						/* @__PURE__ */ jsx(M, { children: "a_{i-1}" }),
						" 和 ",
						/* @__PURE__ */ jsx(M, { children: "a_{i+1}" }),
						"）。这正是「打家劫舍」式的模型。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(SetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "受限选取：a=[1,2,3,1]，相邻两数用红虚线连着表示互斥。选 a1+a3=1+3=4 是最大——不能贪心地把最大的 3 和它两边一起拿。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"为什么不能",
						/* @__PURE__ */ jsx("strong", { children: "贪心" }),
						"地「从大到小挑，冲突就跳过」？看最短的反例 ",
						/* @__PURE__ */ jsx(M, { children: "a=[1,2,3]" }),
						"：贪心先拿最大的 ",
						/* @__PURE__ */ jsx(M, { children: "3" }),
						"（在中间），它左右两个数就都被禁了，只得 ",
						/* @__PURE__ */ jsx(M, { children: "3" }),
						"； 可最优是拿",
						/* @__PURE__ */ jsx("strong", { children: "两端" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "a_1+a_3=1+3=4" }),
						"。贪心为了眼前那个大数，堵死了两侧更划算的组合。",
						/* @__PURE__ */ jsx("strong", { children: "此刻选或不选，牵动前后两侧" }),
						"——又是需要 DP 的信号。而枚举「每个数选或不选」的所有组合是 ",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 种，",
						/* @__PURE__ */ jsx(M, { children: "n=50" }),
						" 就已无从枚举。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：选，还是不选"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
						"光记「前 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 个的最大和」不够——因为下一步能不能选 ",
						/* @__PURE__ */ jsx(M, { children: "a_{i+1}" }),
						"，取决于 ",
						/* @__PURE__ */ jsx(M, { children: "a_i" }),
						" 到底",
						/* @__PURE__ */ jsx("strong", { children: "选没选" }),
						"。 于是把这个「选没选」",
						/* @__PURE__ */ jsx("strong", { children: "显式记进状态" }),
						"：设 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i][0]" }),
						" = 考虑前 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 个、且",
						/* @__PURE__ */ jsx("strong", { children: "不选" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "a_i" }),
						" 时的最大和；",
						/* @__PURE__ */ jsx(M, { children: "dp[i][1]" }),
						" = 前 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 个、且",
						/* @__PURE__ */ jsx("strong", { children: "选" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "a_i" }),
						" 时的最大和。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(TransitionFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "两状态之间的转移：不选 dp[i][0] 可承接上一位置的任一状态（取 max）；选 dp[i][1] 只能接上一位置的「不选」——这条独木桥正是「相邻互斥」的化身。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsxs("strong", { children: ["不选 ", /* @__PURE__ */ jsx(M, { children: "a_i" })] }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "dp[i][0]" }),
							"）：既然本位不取，前一个 ",
							/* @__PURE__ */ jsx(M, { children: "a_{i-1}" }),
							" ",
							/* @__PURE__ */ jsx("strong", { children: "选或不选都行" }),
							"，所以从上一位置的两个状态里取较大者："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i][0]=\\max\\big(dp[i-1][0],\\ dp[i-1][1]\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsxs("strong", { children: ["选 ", /* @__PURE__ */ jsx(M, { children: "a_i" })] }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "dp[i][1]" }),
							"）：本位既然要取，前一个 ",
							/* @__PURE__ */ jsx(M, { children: "a_{i-1}" }),
							" 就",
							/* @__PURE__ */ jsx("strong", { children: "必须不选" }),
							"（相邻互斥），只能接上一位置的「不选」状态，再加上 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							" 自己："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i][1]=dp[i-1][0]+a_i" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"边界：",
							/* @__PURE__ */ jsx(M, { children: "dp[0][0]=dp[0][1]=0" }),
							"（哨兵起点，什么都没考虑）。答案在",
							/* @__PURE__ */ jsx("strong", { children: "末列" }),
							"取两状态较大者——因为最后一个数选不选都可以："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\text{ans}=\\max\\big(dp[n][0],\\ dp[n][1]\\big)" })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质：状态，就是「决策的记忆」",
					children: [
						"普通线性 DP 的 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i]" }),
						" 只背一个总量；状态机 DP 多出的那一维，背的是",
						/* @__PURE__ */ jsx("strong", { children: "「上一步做了什么决定」" }),
						"——正因为把「",
						/* @__PURE__ */ jsx(M, { children: "a_i" }),
						" 选没选」记进了状态，下一步才知道自己能不能选。 它把「后面的决策依赖前面怎么选」这层",
						/* @__PURE__ */ jsx("strong", { children: "耦合" }),
						"，拆成了",
						/* @__PURE__ */ jsx("strong", { children: "每个状态各自独立、可按位置递推" }),
						"的小问题，",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 种组合被 ",
						/* @__PURE__ */ jsx(M, { children: "O(n\\cdot k)" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						" 为状态数）装下。"
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
						"用开头的例子 ",
						/* @__PURE__ */ jsx(M, { children: "a=[1,2,3,1]" }),
						" 走几步，把两个状态",
						/* @__PURE__ */ jsx("strong", { children: "并行" }),
						"推进（下标从 1 记）："
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
									/* @__PURE__ */ jsx("b", { children: "第 1 个数（a₁=1）。" }),
									" 不选 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][0]=\\max(0,0)=0" }),
									"；选 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][1]=dp[0][0]+1=0+1=1" }),
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
									/* @__PURE__ */ jsx("b", { children: "第 2 个数（a₂=2）。" }),
									" 不选 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][0]=\\max(dp[1][0],dp[1][1])=\\max(0,1)=1" }),
									"；选 ",
									/* @__PURE__ */ jsx(M, { children: "dp[2][1]=dp[1][0]+2=0+2=2" }),
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
									/* @__PURE__ */ jsx("b", { children: "第 3 个数（a₃=3）。" }),
									" 不选 ",
									/* @__PURE__ */ jsx(M, { children: "dp[3][0]=\\max(1,2)=2" }),
									"；选 ",
									/* @__PURE__ */ jsx(M, { children: "dp[3][1]=dp[2][0]+3=1+3=4" }),
									"（接的是「a₂ 不选」那条，即选了 a₁）。"
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
									/* @__PURE__ */ jsx("b", { children: "第 4 个数（a₄=1）。" }),
									" 不选 ",
									/* @__PURE__ */ jsx(M, { children: "dp[4][0]=\\max(2,4)=4" }),
									"；选 ",
									/* @__PURE__ */ jsx(M, { children: "dp[4][1]=dp[3][0]+1=2+1=3" }),
									"。 末列取大：",
									/* @__PURE__ */ jsx(M, { children: "\\max(4,3)=4" }),
									"——正是选 ",
									/* @__PURE__ */ jsx(M, { children: "a_1+a_3" }),
									" 的答案，和手算吻合。"
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
						/* @__PURE__ */ jsx(M, { children: "dp[i][0/1]" }),
						" 这张「状态 × 位置」的二维表",
						/* @__PURE__ */ jsx("strong", { children: "逐格填满" }),
						"，并高亮每一格在上一位置的来源。改数组、加删元素、或换个预设，看它实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看两个状态一格一格长出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(StateMachineDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化：股票买卖——把「持有 / 未持有」做成状态机"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"「选 / 不选」只是最简单的两状态。真正让状态机大显身手的，是",
						/* @__PURE__ */ jsx("strong", { children: "股票买卖" }),
						"一族：给出每天的价格 ",
						/* @__PURE__ */ jsx(M, { children: "p_1,\\dots,p_n" }),
						"，可以在某天",
						/* @__PURE__ */ jsx("strong", { children: "买入" }),
						"、某天",
						/* @__PURE__ */ jsx("strong", { children: "卖出" }),
						"（手上最多持一股），求最大利润。 关键抓手同样是——",
						/* @__PURE__ */ jsxs("strong", { children: [
							"站在第 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 天，你此刻「手里有没有股票」是两种截然不同的处境"
						] }),
						"，能做的动作也不同。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"于是设两个状态：",
						/* @__PURE__ */ jsx(M, { children: "\\mathit{hold}[i]" }),
						" = 第 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 天结束时",
						/* @__PURE__ */ jsx("strong", { children: "持有" }),
						"一股的最优现金；",
						/* @__PURE__ */ jsx(M, { children: "\\mathit{cash}[i]" }),
						" = 第 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 天结束时",
						/* @__PURE__ */ jsx("strong", { children: "空仓" }),
						"的最优现金（现金相对初始 0 计，买入是垫钱、卖出是回款）。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(StockFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "股票状态机：持有(hold) 与 未持有(cash) 两节点。买入边把 cash→hold（现金 −price），卖出边把 hold→cash（现金 +price），两个自环是「不动」。若带冷却，卖出后要在 cash 多停一天才能再买入。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsx("p", { children: "逐日在两状态间转移（无限次交易版）：" }),
						/* @__PURE__ */ jsx(MB, { children: "\\mathit{cash}[i]=\\max\\big(\\mathit{cash}[i-1],\\ \\mathit{hold}[i-1]+p_i\\big)" }),
						/* @__PURE__ */ jsx(MB, { children: "\\mathit{hold}[i]=\\max\\big(\\mathit{hold}[i-1],\\ \\mathit{cash}[i-1]-p_i\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"前者：空仓 = 昨天就空仓（不动）、或昨天持有今天",
							/* @__PURE__ */ jsx("strong", { children: "卖出" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "+p_i" }),
							"）；后者：持有 = 昨天就持有（不动）、或昨天空仓今天",
							/* @__PURE__ */ jsx("strong", { children: "买入" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "-p_i" }),
							"）。 初始 ",
							/* @__PURE__ */ jsx(M, { children: "\\mathit{cash}[0]=0" }),
							"、",
							/* @__PURE__ */ jsx(M, { children: "\\mathit{hold}[0]=-\\infty" }),
							"（还没买过）。答案取末日的 ",
							/* @__PURE__ */ jsx(M, { children: "\\mathit{cash}[n]" }),
							"——手里不留股才算落袋。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"再加一条",
							/* @__PURE__ */ jsx("strong", { children: "冷却期" }),
							"（卖出后次日不能买入）会怎样？只需把买入时的现金基准从「昨日空仓」改成「",
							/* @__PURE__ */ jsx("strong", { children: "前天" }),
							"空仓」",
							/* @__PURE__ */ jsx(M, { children: "\\mathit{cash}[i-2]" }),
							"——这样刚卖出的那天就买不回来了。 换句话说，",
							/* @__PURE__ */ jsx("strong", { children: "加一条规则，只是给状态机换一条边" }),
							"，主干丝毫不动。这正是状态机模型的威力：现实约束越复杂，越能靠「多设一个状态 / 改一条转移边」优雅地容纳。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把状态机",
						/* @__PURE__ */ jsx("strong", { children: "逐日推演" }),
						"：点某天或用按钮前进，看「持有 / 空仓」两状态的最优现金如何随每天",
						/* @__PURE__ */ jsx("strong", { children: "买 / 卖 / 不动" }),
						"更新。改价格、勾上「冷却期」，观察那条被改的边如何影响全局。"
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(StockStateDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱 · 答案取「空仓」态，别取 max",
					children: [
						"股票问题最终答案是 ",
						/* @__PURE__ */ jsx(M, { children: "\\mathit{cash}[n]" }),
						"（末日空仓），",
						/* @__PURE__ */ jsx("strong", { children: "不是" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "\\max(\\mathit{hold}[n],\\mathit{cash}[n])" }),
						"——手里还攥着一股不叫利润。 另一处易错：",
						/* @__PURE__ */ jsx(M, { children: "\\mathit{hold}" }),
						" 的初值必须是 ",
						/* @__PURE__ */ jsx(M, { children: "-\\infty" }),
						" 而非 0，否则「还没买就先算持有」会凭空多出一股。状态机 DP 的边界，往往就藏在这些「哪个状态一开始根本不可能」的细节里。"
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
					pid: "P2196",
					name: "[NOIP1996 提高组] 挖地雷",
					src: "NOIP1996 提高",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 个地窖各有若干地雷，给出哪些地窖间有地道（只能从",
								/* @__PURE__ */ jsx("strong", { children: "编号小" }),
								"走向",
								/* @__PURE__ */ jsx("strong", { children: "编号大" }),
								"）。从任一地窖出发一路挖下去，求最多地雷数，并输出",
								/* @__PURE__ */ jsx("strong", { children: "具体路径" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"状态机 DP 的",
								/* @__PURE__ */ jsx("strong", { children: "入门底子" }),
								"：边只朝编号增大的方向 → 天然是一张 DAG，",
								/* @__PURE__ */ jsx(M, { children: "f[i]" }),
								"=「从 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 出发最多挖多少」就是最朴素的路径 DP。更重要的是它逼你练",
								/* @__PURE__ */ jsx("strong", { children: "方案回溯" }),
								"——多存一个 ",
								/* @__PURE__ */ jsx(M, { children: "nxt[i]" }),
								" 记住每步走向谁，再顺链打印。这是「状态里存决策、事后还原路径」的第一课。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[i]=a_i+\\max_{\\,j>i,\\ g[i][j]}f[j]" }),
								"，逆序递推；起点取 ",
								/* @__PURE__ */ jsx(M, { children: "\\arg\\max_i f[i]" }),
								"；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（逆序 DP + nxt 回溯路径）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2196,
								luogu: "P2196"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P4310",
					name: "绝世好题",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给长度 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 的序列，求最长子序列 ",
								/* @__PURE__ */ jsx(M, { children: "b" }),
								"，使相邻两项",
								/* @__PURE__ */ jsx("strong", { children: "按位与不为 0" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "b_i\\ \\&\\ b_{i-1}\\neq 0" }),
								"，即至少共享一个为 1 的二进制位）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "换个视角（把状态藏进「位」里）",
							children: [
								"若沿用 LIS 的「",
								/* @__PURE__ */ jsx(M, { children: "dp[i]" }),
								" 向左扫所有 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								"」是 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								"，会超时。妙处在于：",
								/* @__PURE__ */ jsx("strong", { children: "能不能接" }),
								"只看「有没有公共位」，与具体是哪个数无关。于是不按「下标」记状态，而按",
								/* @__PURE__ */ jsx("strong", { children: "二进制位" }),
								"记：",
								/* @__PURE__ */ jsx(M, { children: "f[b]" }),
								" = 以「第 ",
								/* @__PURE__ */ jsx(M, { children: "b" }),
								" 位为 1 的数」结尾的最长合法子序列长度。 处理 ",
								/* @__PURE__ */ jsx(M, { children: "a_i" }),
								" 时，它能接的最长链 = 它所有为 1 的位对应 ",
								/* @__PURE__ */ jsx(M, { children: "f[b]" }),
								" 的最大值，",
								/* @__PURE__ */ jsx(M, { children: "+1" }),
								" 后再",
								/* @__PURE__ */ jsx("strong", { children: "回写" }),
								"到它每个为 1 的位。是「",
								/* @__PURE__ */ jsx("strong", { children: "状态即决策的记忆" }),
								"」的绝佳变体——记忆被压进了 31 个按位状态。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "\\mathit{cur}=1+\\max_{\\,b:\\ a_i\\ \\&\\ 2^b\\neq 0}f[b]" }),
								"，再对每个这样的 ",
								/* @__PURE__ */ jsx(M, { children: "b" }),
								" 令 ",
								/* @__PURE__ */ jsx(M, { children: "f[b]\\leftarrow\\max(f[b],\\mathit{cur})" }),
								"；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(30n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（按位状态机 f[bit]）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P4310,
								luogu: "P4310"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2569",
					name: "[SCOI2010] 股票交易",
					src: "SCOI2010",
					diff: "省选/NOI-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "T" }),
								" 天，每天给出买入价 ",
								/* @__PURE__ */ jsx(M, { children: "ap_i" }),
								"、卖出价 ",
								/* @__PURE__ */ jsx(M, { children: "bp_i" }),
								" 及单日买入上限 ",
								/* @__PURE__ */ jsx(M, { children: "as_i" }),
								"、卖出上限 ",
								/* @__PURE__ */ jsx(M, { children: "bs_i" }),
								"；任意时刻持股不超过 ",
								/* @__PURE__ */ jsx(M, { children: "\\max P" }),
								"；",
								/* @__PURE__ */ jsxs("strong", { children: [
									"两次交易之间必须间隔 ",
									/* @__PURE__ */ jsx(M, { children: "W" }),
									" 天"
								] }),
								"（冷却）。求最大收益。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "状态设计（拔高 · 只给思路）",
							children: [
								"设 ",
								/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
								" = 第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 天结束、持股 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 股的最优收益。四类转移：① ",
								/* @__PURE__ */ jsx("strong", { children: "凭空建仓" }),
								"（此前 ",
								/* @__PURE__ */ jsx(M, { children: "W" }),
								" 天没交易）",
								/* @__PURE__ */ jsx(M, { children: "f[i][j]=-j\\cdot ap_i" }),
								"；② ",
								/* @__PURE__ */ jsx("strong", { children: "不动" }),
								" ",
								/* @__PURE__ */ jsx(M, { children: "f[i][j]=f[i-1][j]" }),
								"； ③ ",
								/* @__PURE__ */ jsx("strong", { children: "买入" }),
								" ",
								/* @__PURE__ */ jsx(M, { children: "f[i][j]=\\max_{\\,j-as_i\\le k<j}\\big(f[i-W-1][k]-(j-k)ap_i\\big)" }),
								"；④ ",
								/* @__PURE__ */ jsx("strong", { children: "卖出" }),
								" ",
								/* @__PURE__ */ jsx(M, { children: "f[i][j]=\\max_{\\,j<k\\le j+bs_i}\\big(f[i-W-1][k]+(k-j)bp_i\\big)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它 · 优化关键",
							children: [
								"冷却把「合法转移源」精确锁到 ",
								/* @__PURE__ */ jsx(M, { children: "i-W-1" }),
								" 那一天，是状态机「隔 ",
								/* @__PURE__ */ jsx(M, { children: "W" }),
								" 天才能再动」的硬核版。③④ 的内层 ",
								/* @__PURE__ */ jsx(M, { children: "\\max" }),
								" 是",
								/* @__PURE__ */ jsx("strong", { children: "定长滑动窗口取极值" }),
								"——把式子按 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 拆成「只含 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 的项 + 只含 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 的项」后，用",
								/* @__PURE__ */ jsx("strong", { children: "单调队列" }),
								"把每天的转移从 ",
								/* @__PURE__ */ jsx(M, { children: "O(\\max P^2)" }),
								" 降到 ",
								/* @__PURE__ */ jsx(M, { children: "O(\\max P)" }),
								"，总复杂度 ",
								/* @__PURE__ */ jsx(M, { children: "O(T\\cdot\\max P)" }),
								"。它示范了状态机 DP 与单调队列优化的经典合流。"
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
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1799",
					name: "数列",
					hint: "选 / 删两状态：设 f[i][j] = 前 i 个数里保留 j 个、且第 i 个保留时的最大「匹配数」（a_i 恰好落在第 j 位，即 a_i=j 记一分）。删则继承、留则从 f[i-1][j-1] 转来——正是「选 / 不选」状态机换了个计分规则。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1103",
					name: "书本整理",
					hint: "保留 n−k 本的选段 DP：按高度排序后，设 f[i][j] = 前 i 本选 j 本、且第 i 本入选时的最小「宽度差之和」。第 i 本选或不选构成两状态，选时差值只与上一本入选者相邻——又一个线性状态机。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1868",
					name: "饥饿的奶牛",
					hint: "区间不相交选取（打家劫舍的区间版）：把每段区间按右端点排序，f[x] = 覆盖到坐标 x 的最大收益。对每段 [l,r]，f[r]=max(f[r-1], f[l-1]+长度)——「选这段」要求前一段在 l 之前结束，正是相邻互斥推广到区间。"
				})
			]
		})
	] });
}
//#endregion
export { StateMachine as default };
