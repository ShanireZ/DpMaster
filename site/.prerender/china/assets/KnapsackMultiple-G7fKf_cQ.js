import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, Gamepad2, Layers, Minus, MousePointerClick, Plus, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/knapsack-multiple/internal.ts
function splitMultipleItems(items) {
	const packs = [];
	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		const { w, v, m } = items[itemIndex];
		let rest = m;
		let size = 1;
		while (size < rest) {
			packs.push({
				itemIdx: itemIndex,
				cnt: size,
				w: size * w,
				v: size * v,
				label: `×${size}`
			});
			rest -= size;
			size <<= 1;
		}
		if (rest > 0) packs.push({
			itemIdx: itemIndex,
			cnt: rest,
			w: rest * w,
			v: rest * v,
			label: `×余${rest}`
		});
	}
	return packs;
}
function multiplePackCounts(items) {
	return {
		naive: items.reduce((sum, item) => sum + item.m, 0),
		binary: splitMultipleItems(items).length
	};
}
function executeMultipleKnapsack(items, capacity, emit) {
	const packs = splitMultipleItems(items);
	const values = Array(capacity + 1).fill(0);
	for (const pack of packs) for (let currentCapacity = capacity; currentCapacity >= pack.w; currentCapacity--) {
		const before = values[currentCapacity];
		const from = values[currentCapacity - pack.w];
		const candidate = from + pack.v;
		const better = candidate > before;
		if (better) values[currentCapacity] = candidate;
		emit({
			type: "cell",
			pack,
			capacity: currentCapacity,
			before,
			from,
			candidate,
			after: values[currentCapacity],
			better
		});
	}
	return {
		value: values[capacity],
		values
	};
}
function recordMultipleKnapsack(items, capacity) {
	const events = [];
	return {
		result: executeMultipleKnapsack(items, capacity, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/components/demos/knapsack/multipleSolver.ts
function settled(vals) {
	const s = {};
	for (let r = 0; r < vals.length; r++) for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = "settled";
	return s;
}
/** 把件数上限 m 二进制拆分成若干打包件：1,2,4,…,以及余数。 */
function binarySplit(items) {
	return splitMultipleItems(items);
}
/** 朴素打包数（Σmᵢ）与二进制打包数（Σ⌈log₂(mᵢ+1)⌉）——供工具条对比。 */
function packCounts(items) {
	return multiplePackCounts(items);
}
/**
* 多重背包 · 二进制拆分 + 一维 01 倒序。
* 把每种物品拆成若干打包件，每包当一件做 01 背包（倒序，保证一包至多用一次）。
* 网格为一维（1 行 W+1 列）。
*/
function multipleKnapsack(items, W) {
	const packs = binarySplit(items);
	const run = recordMultipleKnapsack(items, W);
	const f = Array(W + 1).fill(0);
	const snap = () => [f.slice()];
	const frames = [];
	const cnts = packCounts(items);
	frames.push({
		values: snap(),
		states: settled(snap()),
		caption: `初始：容量 0…${W} 下最大价值都是 <b>0</b>（空背包）。本例把 ${items.length} 种物品拆成 <b>${packs.length}</b> 个打包件（朴素需 <b>${cnts.naive}</b> 件、二进制仅 <b>${cnts.binary}</b> 件）。`,
		formula: "f[j]=0"
	});
	for (const event of run.events) {
		const { pack: pk, capacity: j, before: old, candidate: cand, after, better } = event;
		f[j] = after;
		const states = settled(snap());
		states[key(0, j - pk.w)] = "source";
		const arrows = [{
			from: {
				r: 0,
				c: j - pk.w
			},
			to: {
				r: 0,
				c: j
			},
			kind: better ? "chosen" : "source"
		}];
		if (better) states[key(0, j - pk.w)] = "chosen";
		states[key(0, j)] = "current";
		const orig = items[pk.itemIdx];
		const caption = `物品 <b>${pk.itemIdx + 1}</b> 的打包件 <b>${pk.label}</b>（含 <b>${pk.cnt}</b> 件原物 · 等效 w'=${pk.w}, v'=${pk.v}，源自 w=${orig.w},v=${orig.v}）· <b>倒序</b> j=${j}：f[${j - pk.w}]+${pk.v} = <b>${cand}</b> ${better ? "&gt;" : "≤"} f[${j}]=<b>${old}</b> → ${better ? `更新为 <b>${cand}</b>` : "不变"}。`;
		const formula = `f[${j}]=\\max(f[${j}],\\ f[${j - pk.w}]+${pk.v})=${better ? cand : old}`;
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
	const fin = settled(snap());
	fin[key(0, W)] = "chosen";
	frames.push({
		values: snap(),
		states: fin,
		caption: `答案 <b>f[${W}] = ${run.result.value}</b>：${packs.length} 个打包件全部做完 01 转移后，容量 ${W} 下的最大价值。每种物品的取用件数都不超过它的上限。`,
		formula: `f[${W}]=${run.result.value}`
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
//#region src/components/demos/knapsack/KnapsackMultipleDemo.tsx
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
/** 多重背包演示：物品含件数上限 m，二进制拆包后在一维 f[j] 上倒序做 01 转移。 */
function KnapsackMultipleDemo() {
	const [items, setItems] = useState([{
		w: 2,
		v: 3,
		m: 3
	}, {
		w: 3,
		v: 5,
		m: 2
	}]);
	const [cap, setCap] = useState(10);
	const model = useMemo(() => multipleKnapsack(items, cap), [items, cap]);
	const counts = useMemo(() => packCounts(items), [items]);
	const modelKey = `mul-${cap}-${items.map((it) => `${it.w}.${it.v}.${it.m}`).join("_")}`;
	const setItem = (i, patch) => setItems((arr) => arr.map((it, k) => k === i ? {
		...it,
		...patch
	} : it));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "kd__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "物品（可改重量 / 价值 / 件数）"
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
						}),
						/* @__PURE__ */ jsx(Stepper$1, {
							label: "价值 v",
							value: it.v,
							min: 1,
							max: 30,
							onChange: (v) => setItem(i, { v })
						}),
						/* @__PURE__ */ jsx(Stepper$1, {
							label: "件数 m",
							value: it.m,
							min: 1,
							max: 6,
							onChange: (m) => setItem(i, { m })
						})
					]
				}, i)), items.length < 4 && /* @__PURE__ */ jsxs("button", {
					className: "kd__add",
					onClick: () => setItems((a) => [...a, {
						w: 2,
						v: 3,
						m: 2
					}]),
					children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加物品"]
				})]
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "kd__group-label",
				children: "背包容量"
			}), /* @__PURE__ */ jsx(Stepper$1, {
				label: "m",
				value: cap,
				min: 2,
				max: 12,
				onChange: setCap
			})] })]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"朴素枚举需 ",
				/* @__PURE__ */ jsxs("b", {
					className: "bad",
					children: ["Σmᵢ = ", counts.naive]
				}),
				" 个打包件 · 二进制拆分仅需",
				" ",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: ["Σ⌈log⌉ = ", counts.binary]
				}),
				" 个",
				counts.naive > counts.binary ? /* @__PURE__ */ jsxs(Fragment, { children: [
					"（省下 ",
					/* @__PURE__ */ jsx("b", {
						className: "you",
						children: counts.naive - counts.binary
					}),
					" 次转移）"
				] }) : /* @__PURE__ */ jsx(Fragment, { children: "（件数太少，二者持平）" })
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/components/demos/knapsack/MultipleSplitDemo.tsx
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
* 多重背包 · 二进制拆包可视化（自建轻量，非 DPViz）。
* 拖动件数上限 m：实时看它拆成 1,2,4,…,余r 这些「打包件」，
* 段宽 ∝ 该包件数；下方 0…m 覆盖带示意任选若干包相加恰好覆盖每一个件数；
* 读数条对比「朴素需 m 个 vs 二进制需 ⌈log⌉ 个」。
* binarySplit / packCounts 复用自 multipleSolver（只读，不改）。
*/
function MultipleSplitDemo() {
	const [m, setM] = useState(13);
	const packs = useMemo(() => binarySplit([{
		w: 1,
		v: 1,
		m
	}]), [m]);
	const counts = useMemo(() => packCounts([{
		w: 1,
		v: 1,
		m
	}]), [m]);
	const covered = Array.from({ length: m + 1 }, (_, k) => k);
	const sumExpr = packs.map((p) => p.cnt).join(" + ") + ` = ${m}`;
	const powCount = packs.filter((p) => !p.label.startsWith("×余")).length;
	const hasRem = packs.some((p) => p.label.startsWith("×余"));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "msp__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "msp__group-label",
				children: "件数上限 m（这一种物品有几件）"
			}), /* @__PURE__ */ jsx(Stepper, {
				label: "m",
				value: m,
				min: 1,
				max: 20,
				onChange: setM
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "msp__hint",
				children: [
					"拆出 ",
					/* @__PURE__ */ jsx("b", { children: powCount }),
					" 个 2 的幂包",
					hasRem ? /* @__PURE__ */ jsxs(Fragment, { children: [
						" ",
						"+ ",
						/* @__PURE__ */ jsx("b", { children: "1" }),
						" 个余数包"
					] }) : /* @__PURE__ */ jsx(Fragment, { children: "（恰好凑满，无需余数包）" }),
					"，共 ",
					/* @__PURE__ */ jsx("b", { children: counts.binary }),
					" 包。"
				]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "msp__stage",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "msp__stage-label",
				children: [/* @__PURE__ */ jsxs("span", { children: [
					"二进制拆包：",
					/* @__PURE__ */ jsx("span", {
						className: "mono",
						children: sumExpr
					}),
					"（段宽 ∝ 该包件数）"
				] }), /* @__PURE__ */ jsx("span", {
					className: "mono",
					children: "1,2,4,… + 余r"
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "msp__packbar",
				children: packs.map((p, i) => {
					return /* @__PURE__ */ jsxs("div", {
						className: `msp__pack${p.label.startsWith("×余") ? " rem" : ""}`,
						style: {
							flexGrow: p.cnt,
							flexBasis: 0
						},
						title: `${p.label}：含 ${p.cnt} 件原物`,
						children: [/* @__PURE__ */ jsx("span", {
							className: "msp__pack-lab",
							children: p.label
						}), /* @__PURE__ */ jsxs("span", {
							className: "msp__pack-sub",
							children: [p.cnt, " 件"]
						})]
					}, i);
				})
			})]
		}),
		/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
			className: "msp__cover-label",
			children: [/* @__PURE__ */ jsxs("span", { children: [
				"这些包任选若干相加，恰好覆盖 ",
				/* @__PURE__ */ jsxs("span", {
					className: "mono",
					children: ["0…", m]
				}),
				" 的每一个件数"
			] }), /* @__PURE__ */ jsxs("span", {
				className: "mono",
				children: [m + 1, " 个，全可达"]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "msp__cover",
			children: covered.map((k) => /* @__PURE__ */ jsx("span", {
				className: `msp__cell${k === 0 ? " zero" : ""}`,
				title: `可凑出 ${k} 件`,
				children: k
			}, k))
		})] }),
		/* @__PURE__ */ jsxs("div", {
			className: "msp__compare",
			style: { marginTop: "var(--sp-5)" },
			children: [/* @__PURE__ */ jsxs("div", {
				className: "msp__card",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "msp__card-head",
						children: [/* @__PURE__ */ jsx(Boxes, { size: 15 }), " 朴素：一件一件摊开"]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "msp__card-val",
						children: [counts.naive, /* @__PURE__ */ jsx("small", { children: "个物品" })]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "msp__card-sub",
						children: "Σm · 每件做一次 01 逆推"
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "msp__card win",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "msp__card-head",
						children: [/* @__PURE__ */ jsx(Layers, { size: 15 }), " 二进制：打包"]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "msp__card-val",
						children: [counts.binary, /* @__PURE__ */ jsx("small", { children: "个打包件" })]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "msp__card-sub",
						children: "⌈log₂(m+1)⌉ · 每包做一次 01 逆推"
					})
				]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "msp__delta",
			children: [
				"m=",
				m,
				" 时，朴素要 ",
				/* @__PURE__ */ jsx("b", { children: counts.naive }),
				" 个物品，二进制只用 ",
				/* @__PURE__ */ jsx("b", { children: counts.binary }),
				" 个打包件—— 少做 ",
				/* @__PURE__ */ jsx("b", { children: counts.naive - counts.binary }),
				" 次 01 转移，却依旧能凑出「取 0…",
				m,
				" 件」的每一种， 既不重复、也不遗漏。m 越大，这道差距越悬殊。"
			]
		})
	] });
}
//#endregion
//#region src/content/a/KnapsackMultipleArt.tsx
function MultipleSetupFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 600 172",
		role: "img",
		"aria-label": "每种物品有限 m 件的多重背包场景",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "km-ar",
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
			[{
				w: 2,
				v: 3,
				m: 3
			}, {
				w: 3,
				v: 5,
				m: 2
			}].map((it, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${24 + i * 118},32)`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "98",
						height: "104",
						rx: "14",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(58,-10)",
						children: [/* @__PURE__ */ jsx("rect", {
							width: "50",
							height: "22",
							rx: "11",
							fill: "color-mix(in srgb, var(--accent-1) 20%, var(--surface-2))",
							stroke: "var(--accent-2)",
							strokeWidth: "1.2"
						}), /* @__PURE__ */ jsxs("text", {
							x: "25",
							y: "15",
							textAnchor: "middle",
							fontSize: "12",
							className: "mono",
							fill: "var(--accent-1)",
							children: ["×", it.m]
						})]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "49",
						y: "30",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: ["物品 ", i + 1]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "49",
						y: "60",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--text-1)",
						children: ["w=", it.w]
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "49",
						y: "84",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--accent-1)",
						children: ["v=", it.v]
					})
				]
			}, i)),
			/* @__PURE__ */ jsx("path", {
				d: "M280 84 H344",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#km-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(372,30)",
				children: [
					/* @__PURE__ */ jsx("path", {
						d: "M28 30 Q28 10 50 10 H150 Q172 10 172 30 L188 114 Q188 124 176 124 H24 Q12 124 12 114 Z",
						fill: "color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))",
						stroke: "var(--accent-2)",
						strokeWidth: "2.5"
					}),
					/* @__PURE__ */ jsx("path", {
						d: "M72 10 Q72 -8 100 -8 Q128 -8 128 10",
						fill: "none",
						stroke: "var(--accent-2)",
						strokeWidth: "2.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "60",
						textAnchor: "middle",
						fontSize: "14",
						fill: "var(--text-1)",
						children: "背包"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "100",
						y: "86",
						textAnchor: "middle",
						fontSize: "15",
						className: "mono",
						fill: "var(--accent-1)",
						children: "容量 m=10"
					})
				]
			})
		]
	});
}
function BinarySplitFigure() {
	const packs = [
		{
			label: "×1",
			cnt: 1
		},
		{
			label: "×2",
			cnt: 2
		},
		{
			label: "×4",
			cnt: 4
		},
		{
			label: "×余6",
			cnt: 6,
			rest: true
		}
	];
	const x0 = 24;
	const unit = 40;
	const gap = 10;
	const y = 44;
	const h = 46;
	let cursor = x0;
	const laid = packs.map((p) => {
		const width = p.cnt * unit;
		const g = {
			...p,
			x: cursor,
			width
		};
		cursor += width + gap;
		return g;
	});
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 600 176",
		role: "img",
		"aria-label": "件数上限 13 的二进制拆分",
		children: [
			/* @__PURE__ */ jsxs("text", {
				x: "24",
				y: "24",
				fontSize: "13",
				fill: "var(--text-2)",
				children: [
					"一种物品，件数上限 ",
					/* @__PURE__ */ jsx("tspan", {
						className: "mono",
						fill: "var(--text-1)",
						children: "m=13"
					}),
					" → 拆成 4 个「打包件」"
				]
			}),
			laid.map((p, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${p.x},${y})`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: p.width,
						height: h,
						rx: "10",
						fill: p.rest ? "color-mix(in srgb, var(--accent-2) 14%, var(--surface-3))" : "color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))",
						stroke: p.rest ? "var(--accent-2)" : "var(--accent-1)",
						strokeWidth: "1.8"
					}),
					/* @__PURE__ */ jsx("text", {
						x: p.width / 2,
						y: h / 2 - 2,
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: p.label
					}),
					/* @__PURE__ */ jsxs("text", {
						x: p.width / 2,
						y: 38,
						textAnchor: "middle",
						fontSize: "10.5",
						fill: "var(--text-3)",
						children: [p.cnt, " 件"]
					})
				]
			}, i)),
			/* @__PURE__ */ jsx("text", {
				x: "24",
				y: "132",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "任选若干包相加，恰好能凑出"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(215,120)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "150",
					height: "20",
					rx: "10",
					fill: "color-mix(in srgb, var(--viz-chosen) 15%, var(--surface-3))",
					stroke: "var(--viz-chosen)",
					strokeWidth: "1.4"
				}), /* @__PURE__ */ jsx("text", {
					x: "75",
					y: "14",
					textAnchor: "middle",
					fontSize: "12",
					className: "mono",
					fill: "var(--text-1)",
					children: "0, 1, 2, …, 13"
				})]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "380",
				y: "132",
				fontSize: "12",
				fill: "var(--text-2)",
				children: "中任意件数"
			}),
			/* @__PURE__ */ jsxs("text", {
				x: "24",
				y: "162",
				fontSize: "11",
				fill: "var(--text-3)",
				children: [
					"1+2+4 覆盖 0…7；再叠加余数 6，平移补齐 8…13。用 ",
					/* @__PURE__ */ jsx("tspan", {
						className: "mono",
						fill: "var(--accent-1)",
						children: "⌈log⌉≈4"
					}),
					" 个包代替 13 次枚举。"
				]
			})
		]
	});
}
function NaiveVsBinaryFigure() {
	const naive = 22;
	const binary = 7;
	const bx = 150;
	const bw = 12;
	const rowY = (r) => 40 + r * 62;
	const barH = 30;
	const bar = (n, y, color) => Array.from({ length: n }, (_, i) => /* @__PURE__ */ jsx("rect", {
		x: bx + i * 16,
		y,
		width: bw,
		height: barH,
		rx: "3",
		fill: color,
		opacity: .85
	}, i));
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 600 150",
		role: "img",
		"aria-label": "朴素枚举与二进制拆分的转移次数对比",
		children: [
			/* @__PURE__ */ jsxs("text", {
				x: "20",
				y: "24",
				fontSize: "12",
				fill: "var(--text-3)",
				children: [
					"两种物品：件数上限 ",
					/* @__PURE__ */ jsx("tspan", {
						className: "mono",
						fill: "var(--text-1)",
						children: "7"
					}),
					" 与 ",
					/* @__PURE__ */ jsx("tspan", {
						className: "mono",
						fill: "var(--text-1)",
						children: "15"
					})
				]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: rowY(0) + 20,
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--viz-invalid)",
				children: "朴素"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: rowY(0) + 36,
				fontSize: "11",
				className: "mono",
				fill: "var(--text-3)",
				children: "Σm=22"
			}),
			bar(naive, rowY(0), "var(--viz-invalid)"),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: rowY(1) + 20,
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--viz-chosen)",
				children: "二进制"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: rowY(1) + 36,
				fontSize: "11",
				className: "mono",
				fill: "var(--text-3)",
				children: "Σlog=7"
			}),
			bar(binary, rowY(1), "var(--viz-chosen)"),
			/* @__PURE__ */ jsx("text", {
				x: 510,
				y: rowY(0) + 20,
				fontSize: "12",
				className: "mono",
				fill: "var(--viz-invalid)",
				children: "22 次"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 270,
				y: rowY(1) + 20,
				fontSize: "12",
				className: "mono",
				fill: "var(--viz-chosen)",
				children: "7 次"
			})
		]
	});
}
//#endregion
//#region src/content/a/KnapsackMultiple.tsx
var CODE_P2347 = `
#include <iostream>
using namespace std;

int a[7];                    // 六种砝码的个数
int val[7] = {0, 1, 2, 3, 5, 10, 20};  // 对应面值
bool f[1005];                // f[j]：重量 j 能否被称出

int main()
{
    for (int i = 1; i <= 6; i++)
        cin >> a[i];

    int S = 0;                          // 可达重量的上界
    for (int i = 1; i <= 6; i++)
        S += a[i] * val[i];

    f[0] = true;                        // 重量 0 恒可达（不放砝码）
    for (int i = 1; i <= 6; i++)        // 逐种砝码
        for (int k = 1; k <= a[i]; k++) // ★朴素：这一种一件一件地放
            for (int j = S; j >= val[i]; j--)   // 每件都是一次 01 逆推
                if (f[j - val[i]])
                    f[j] = true;

    int cnt = 0;
    for (int j = 1; j <= S; j++)        // 统计非零可达重量的种数
        if (f[j]) cnt++;

    cout << cnt << endl;
    return 0;
}`;
var CODE_P1776 = `
#include <iostream>
#include <algorithm>
using namespace std;

int f[40005];                // f[j]：容量不超过 j 的最大价值
int w2[100005], v2[100005];  // 二进制拆分后的「打包件」
int cnt;                     // 打包件总数

int main()
{
    int n, W;
    cin >> n >> W;
    for (int i = 1; i <= n; i++)
    {
        int v, w, m;                    // 价值、重量、件数上限
        cin >> v >> w >> m;

        int k = 1;                      // ★二进制拆分：1,2,4,… 各捆一包
        while (k < m)
        {
            cnt++;
            w2[cnt] = k * w;            // 一包含 k 件，等效重量 k*w
            v2[cnt] = k * v;            // 等效价值 k*v
            m -= k;
            k <<= 1;                    // k 翻倍
        }
        if (m > 0)                      // 余数单独成一包
        {
            cnt++;
            w2[cnt] = m * w;
            v2[cnt] = m * v;
        }
    }

    for (int i = 1; i <= cnt; i++)      // 每个打包件当一件做 01 背包
        for (int j = W; j >= w2[i]; j--)    // ★逆推：一包至多用一次
            f[j] = max(f[j], f[j - w2[i]] + v2[i]);

    cout << f[W] << endl;
    return 0;
}`;
function KnapsackMultiple() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "介于「一件」与「无限件」之间"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"前两类背包卡在两个极端：",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/01",
							style: { color: "var(--accent-2)" },
							children: "01 背包"
						}),
						"每种",
						/* @__PURE__ */ jsx("strong", { children: "至多一件" }),
						"，",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/complete",
							style: { color: "var(--accent-2)" },
							children: "完全背包"
						}),
						"每种",
						/* @__PURE__ */ jsx("strong", { children: "无限件" }),
						"。现实往往在中间——第 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 种物品",
						/* @__PURE__ */ jsxs("strong", { children: [
							"恰好有 ",
							/* @__PURE__ */ jsx(M, { children: "m_i" }),
							" 件"
						] }),
						"， 多了没有，这就是",
						/* @__PURE__ */ jsx("strong", { children: "多重背包" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(MultipleSetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "每种物品带 ×m 徽标：物品 1（w=2,v=3）只有 3 件，物品 2（w=3,v=5）只有 2 件——不能像完全背包那样无限取。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"最直接的想法：既然第 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						" 种有 ",
						/* @__PURE__ */ jsx(M, { children: "m_i" }),
						" 件，那就当成 ",
						/* @__PURE__ */ jsx(M, { children: "m_i" }),
						" 件",
						/* @__PURE__ */ jsx("strong", { children: "各不相同的 01 物品" }),
						"摊开，全丢进 01 背包。 正确，但慢——若每种都有上万件，物品总数 ",
						/* @__PURE__ */ jsx(M, { children: "\\sum m_i" }),
						" 会爆炸，",
						/* @__PURE__ */ jsx(M, { children: "O(V\\cdot\\sum m_i)" }),
						" 直接超时。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"也别想着「一件一件试着放」：对同一种枚举「取 0 件、1 件、…、",
						/* @__PURE__ */ jsx(M, { children: "m_i" }),
						" 件」，本质还是把 ",
						/* @__PURE__ */ jsx(M, { children: "m_i" }),
						" 件逐个塞进去，复杂度一样是 ",
						/* @__PURE__ */ jsx(M, { children: "O(V\\cdot\\sum m_i)" }),
						"。 问题的关键是：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"能不能用远少于 ",
							/* @__PURE__ */ jsx(M, { children: "m_i" }),
							" 个「物品」，就表达出「取 0…",
							/* @__PURE__ */ jsx(M, { children: "m_i" }),
							" 件」的全部可能？"
						] }),
						"这一节的主角——",
						/* @__PURE__ */ jsx("strong", { children: "二进制拆分" }),
						"——正是干这个的。"
					] })]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "朴素解：把每种拆成 m 件 01 物品"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"先把最朴素的解法写清楚，它是后面所有优化的地基。",
							/* @__PURE__ */ jsx("strong", { children: "状态照搬 01 背包" }),
							"：",
							/* @__PURE__ */ jsx(M, { children: "f[j]" }),
							" 表示容量不超过 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 时的最大价值。 对第 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 种物品，把它当作 ",
							/* @__PURE__ */ jsx(M, { children: "m_i" }),
							" 件相同的 01 物品，一件一件地做逆推："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\text{for } k=1\\dots m_i:\\quad f[j]=\\max\\big(f[j],\\ f[j-w_i]+v_i\\big)\\ \\ (j:\\,W\\to w_i)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"内层",
							/* @__PURE__ */ jsx("strong", { children: "必须逆推" }),
							"——道理和 01 背包完全一样：每「件」至多取一次，逆推让 ",
							/* @__PURE__ */ jsx(M, { children: "f[j-w_i]" }),
							" 停在「这件还没放进来」的旧值上。 循环层次是「物品种 ",
							/* @__PURE__ */ jsx(M, { children: "\\times" }),
							" 件数 ",
							/* @__PURE__ */ jsx(M, { children: "\\times" }),
							" 容量」，复杂度 ",
							/* @__PURE__ */ jsx(M, { children: "O(V\\cdot\\sum m_i)" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质 · 多重背包 = 带件数上限的 01 背包",
					children: [
						"多重背包并没有新机制：它就是 01 背包，只不过同一种物品被允许取",
						/* @__PURE__ */ jsxs("strong", { children: [
							"不超过 ",
							/* @__PURE__ */ jsx(M, { children: "m_i" }),
							" 次"
						] }),
						"。 朴素解把「",
						/* @__PURE__ */ jsx(M, { children: "m_i" }),
						" 次」老老实实摊成 ",
						/* @__PURE__ */ jsx(M, { children: "m_i" }),
						" 件——正确但冗余。后面要做的，全是",
						/* @__PURE__ */ jsxs("strong", { children: [
							"如何更省地表达这 ",
							/* @__PURE__ */ jsx(M, { children: "m_i" }),
							" 次"
						] }),
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
					children: "二进制拆分：用 log 个「打包件」代替 m 件"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"朴素解的浪费在于：取 5 件，它非要一件一件加五次。可如果我手上有「1 件装」「2 件装」「4 件装」这样的",
							/* @__PURE__ */ jsx("strong", { children: "打包件" }),
							"， 想凑 5 件，只需拿「1 件装 + 4 件装」——两次就够。这正是",
							/* @__PURE__ */ jsx("strong", { children: "二进制拆分" }),
							"的思想：把 ",
							/* @__PURE__ */ jsx(M, { children: "m_i" }),
							" 件拆成 ",
							/* @__PURE__ */ jsx(M, { children: "1,\\ 2,\\ 4,\\ \\dots,\\ 2^{k-1}" }),
							" 这些 2 的幂，再加上一个",
							/* @__PURE__ */ jsx("strong", { children: "余数包" })
						] }),
						/* @__PURE__ */ jsx(MB, { children: "r=m_i-(2^{k}-1)\\ \\ (\\text{where } 2^{k}-1\\le m_i)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"每个「打包件」含 ",
							/* @__PURE__ */ jsx(M, { children: "c" }),
							" 件原物，就等效成",
							/* @__PURE__ */ jsx("strong", { children: "一件" }),
							"重量 ",
							/* @__PURE__ */ jsx(M, { children: "c\\,w_i" }),
							"、价值 ",
							/* @__PURE__ */ jsx(M, { children: "c\\,v_i" }),
							" 的新物品，扔进 01 背包（逆推，每包至多用一次）。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BinarySplitFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "m=13 拆成 1、2、4、余6 四个打包件——用约 ⌈log⌉ 个包，就表达出「取 0…13 件」的每一种可能。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"把上面的静态图变可玩：拖动",
						/* @__PURE__ */ jsxs("strong", { children: ["件数上限 ", /* @__PURE__ */ jsx(M, { children: "m" })] }),
						"，实时看它拆成哪几个打包件（段宽 ∝ 该包件数），下方 ",
						/* @__PURE__ */ jsx(M, { children: "0\\dots m" }),
						" 覆盖带示意「任选若干包相加恰好凑出每一个件数」，读数条对比",
						/* @__PURE__ */ jsxs("strong", { children: [
							"朴素 ",
							/* @__PURE__ */ jsx(M, { children: "m" }),
							" 个 vs 二进制 ⌈log⌉ 个"
						] }),
						"。试试 ",
						/* @__PURE__ */ jsx(M, { children: "m=7" }),
						"（3 包）、",
						/* @__PURE__ */ jsx(M, { children: "m=13" }),
						"（4 包）。"
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(MultipleSplitDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsxs("strong", { children: [
							"为什么这几个包能凑出 0…",
							/* @__PURE__ */ jsx(M, { children: "m_i" }),
							" 的任意件数？"
						] }),
						"先只看 ",
						/* @__PURE__ */ jsx(M, { children: "1,2,4,\\dots,2^{k-1}" }),
						" 这几个 2 的幂——这正是",
						/* @__PURE__ */ jsx("strong", { children: "二进制" }),
						"： 任何 ",
						/* @__PURE__ */ jsx(M, { children: "0" }),
						" 到 ",
						/* @__PURE__ */ jsx(M, { children: "2^{k}-1" }),
						" 之间的整数，都能唯一地写成它们的子集和（比如 ",
						/* @__PURE__ */ jsx(M, { children: "5=1+4" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "6=2+4" }),
						"）。 于是这部分覆盖了 ",
						/* @__PURE__ */ jsx(M, { children: "0\\dots 2^{k}-1" }),
						" 件。再补上",
						/* @__PURE__ */ jsxs("strong", { children: ["余数 ", /* @__PURE__ */ jsx(M, { children: "r" })] }),
						" 这一包：把它加进来，相当于让可凑范围整体",
						/* @__PURE__ */ jsxs("strong", { children: ["平移 ", /* @__PURE__ */ jsx(M, { children: "r" })] }),
						"， 正好把上界从 ",
						/* @__PURE__ */ jsx(M, { children: "2^{k}-1" }),
						" 顶到 ",
						/* @__PURE__ */ jsx(M, { children: "2^{k}-1+r=m_i" }),
						"，中间不留缝。既不重复、也不遗漏——恰好 ",
						/* @__PURE__ */ jsx(M, { children: "0\\dots m_i" }),
						"。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"拆完后，打包件总数从 ",
						/* @__PURE__ */ jsx(M, { children: "m_i" }),
						" 降到 ",
						/* @__PURE__ */ jsx(M, { children: "\\lceil\\log_2(m_i+1)\\rceil" }),
						"，复杂度随之从 ",
						/* @__PURE__ */ jsx(M, { children: "O(V\\cdot\\sum m_i)" }),
						" 压到",
						/* @__PURE__ */ jsxs("strong", { children: [" ", /* @__PURE__ */ jsx(M, { children: "O\\!\\big(V\\cdot\\sum\\log m_i\\big)" })] }),
						"。这是多重背包的",
						/* @__PURE__ */ jsx("strong", { children: "主力解法" }),
						"。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(NaiveVsBinaryFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "件数上限 7 与 15 两种物品：朴素要做 22 次 01 转移，二进制拆分只需 7 次——m 越大，差距越悬殊。"
					})]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质 · 拆完就是 01 背包",
					children: [
						"二进制拆分把多重背包",
						/* @__PURE__ */ jsx("strong", { children: "彻底还原成 01 背包" }),
						"：每个打包件就是一件普通 01 物品，逆推、取或不取，规则分毫不差。 所以它天然是 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/mixed",
							style: { color: "var(--accent-2)" },
							children: "混合背包"
						}),
						"的一块拼图——01、完全、多重三种物品能同题混装，正因为它们最终都落在同一套一维转移上。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "跟着算一遍：把 3 件拆成两包"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"用一种物品 ",
						/* @__PURE__ */ jsx(M, { children: "(w,v,m)=(2,3,3)" }),
						"、容量 6 走一遍。先拆件数 ",
						/* @__PURE__ */ jsx(M, { children: "m=3" }),
						"：取 1（剩 2），再取 2（剩 0），得两个包——",
						/* @__PURE__ */ jsx("strong", { children: "×1 包" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "w{=}2,v{=}3" }),
						"）与 ",
						/* @__PURE__ */ jsx("strong", { children: "×2 包" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "w{=}4,v{=}6" }),
						"）。"
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
									/* @__PURE__ */ jsx("b", { children: "初始化。" }),
									" 空背包，",
									/* @__PURE__ */ jsx(M, { children: "f[0..6]=0" }),
									"。地基和 01 背包一样。"
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
									/* @__PURE__ */ jsx("b", { children: "放 ×1 包" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "w=2,v=3" }),
									"），逆推 ",
									/* @__PURE__ */ jsx(M, { children: "j:6\\to 2" }),
									"。每格 ",
									/* @__PURE__ */ jsx(M, { children: "f[j]=\\max(f[j],f[j-2]+3)" }),
									"，因来源都是旧值 0，第 1 行变成 ",
									/* @__PURE__ */ jsx(M, { children: "0,0,3,3,3,3,3" }),
									"。这一包只代表「取 1 件」。"
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
									/* @__PURE__ */ jsx("b", { children: "放 ×2 包" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "w=4,v=6" }),
									"），逆推 ",
									/* @__PURE__ */ jsx(M, { children: "j:6\\to 4" }),
									"。看 ",
									/* @__PURE__ */ jsx(M, { children: "f[6]=\\max(3,\\ f[2]+6)=\\max(3,9)=9" }),
									"——",
									/* @__PURE__ */ jsx(M, { children: "f[2]=3" }),
									" 是「×1 包」留下的，加上「×2 包」的 6，正好是 ",
									/* @__PURE__ */ jsx("strong", { children: "1+2=3 件" }),
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
									/* @__PURE__ */ jsx(M, { children: "f[6]=9" }),
									"——容量 6、每件重 2，最多装 3 件，价值 ",
									/* @__PURE__ */ jsx(M, { children: "3\\times3=9" }),
									"。两个包组合出的最大件数正好卡在上限 3，没有超过。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把每个",
						/* @__PURE__ */ jsx("strong", { children: "打包件" }),
						"逐格做 01 逆推，读数条实时显示「朴素 Σm vs 二进制 Σlog」的打包数差距。改物品的 ",
						/* @__PURE__ */ jsx(M, { children: "w,v,m" }),
						" 或容量试试。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看它把每个打包件逐格放进去"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(KnapsackMultipleDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "再进一步：单调队列 O(V·n)（选讲）"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"二进制拆分已经够快，应付绝大多数题目。但还有一层",
							/* @__PURE__ */ jsx("strong", { children: "理论最优" }),
							"：",
							/* @__PURE__ */ jsx(M, { children: "O(V\\cdot n)" }),
							" 的",
							/* @__PURE__ */ jsx("strong", { children: "单调队列优化" }),
							"，连那个 ",
							/* @__PURE__ */ jsx(M, { children: "\\log" }),
							" 都抹掉。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"思路是：把容量 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 按",
							/* @__PURE__ */ jsxs("strong", { children: [
								"对 ",
								/* @__PURE__ */ jsx(M, { children: "w_i" }),
								" 取模"
							] }),
							"的余数分组——同余的那些 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							"（即 ",
							/* @__PURE__ */ jsx(M, { children: "r, r{+}w_i, r{+}2w_i,\\dots" }),
							"）恰好构成一条「取第 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 种若干件」的链。 在每条链上，「取不超过 ",
							/* @__PURE__ */ jsx(M, { children: "m_i" }),
							" 件」就变成了一个",
							/* @__PURE__ */ jsx("strong", { children: "定长滑动窗口求最大值" }),
							"的问题，用单调队列可 ",
							/* @__PURE__ */ jsx(M, { children: "O(1)" }),
							" 均摊维护，于是第 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 种物品整体只花 ",
							/* @__PURE__ */ jsx(M, { children: "O(V)" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"它的代码比二进制拆分繁琐不少（要处理余数分组、窗口内加偏移量比较），竞赛里除非 ",
							/* @__PURE__ */ jsx(M, { children: "\\sum m_i" }),
							" 大到二进制都吃紧，一般",
							/* @__PURE__ */ jsx("strong", { children: "首选二进制拆分" }),
							"。这里点到为止，知道有这条路即可。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "常见陷阱 · 别把三法记混",
					children: [
						"三法的分界很清晰：",
						/* @__PURE__ */ jsxs("strong", { children: ["朴素 ", /* @__PURE__ */ jsx(M, { children: "O(V\\sum m_i)" })] }),
						" 是把 ",
						/* @__PURE__ */ jsx(M, { children: "m_i" }),
						" 件摊开；",
						/* @__PURE__ */ jsxs("strong", { children: ["二进制 ", /* @__PURE__ */ jsx(M, { children: "O(V\\sum\\log m_i)" })] }),
						" 是把 ",
						/* @__PURE__ */ jsx(M, { children: "m_i" }),
						" 打包（主力）；",
						/* @__PURE__ */ jsxs("strong", { children: ["单调队列 ", /* @__PURE__ */ jsx(M, { children: "O(Vn)" })] }),
						" 是按同余滑窗（选讲）。三者拿的都是",
						/* @__PURE__ */ jsxs("strong", { children: ["同一个 ", /* @__PURE__ */ jsx(M, { children: "f[W]" })] }),
						"，只是把「取不超过 ",
						/* @__PURE__ */ jsx(M, { children: "m_i" }),
						" 件」表达得越来越省。切莫把二进制的「打包件」当成真的多买了物品——打包只是转移的",
						/* @__PURE__ */ jsx("strong", { children: "组织方式" }),
						"，取用件数始终不超过 ",
						/* @__PURE__ */ jsx(M, { children: "m_i" }),
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
					children: "例题"
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P2347",
					name: "[NOIP1996 提高组] 砝码称重",
					src: "NOIP1996 提高",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"有 6 种面值（",
								/* @__PURE__ */ jsx(M, { children: "1,2,3,5,10,20" }),
								"）的砝码，各给定数量，问用它们能称出多少种",
								/* @__PURE__ */ jsx("strong", { children: "不同的重量" }),
								"（重量 ",
								/* @__PURE__ */ jsx(M, { children: ">0" }),
								"）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"每种砝码有限个 → ",
								/* @__PURE__ */ jsx("strong", { children: "多重背包" }),
								"；不求最值而求",
								/* @__PURE__ */ jsx("strong", { children: "可行性" }),
								"：",
								/* @__PURE__ */ jsx(M, { children: "f[j]" }),
								" 表示「重量 ",
								/* @__PURE__ */ jsx(M, { children: "j" }),
								" 能否被称出」，转移用逻辑或代替 ",
								/* @__PURE__ */ jsx(M, { children: "\\max" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"数据极小（总重量上界才几百），正好拿来",
								/* @__PURE__ */ jsx("strong", { children: "把朴素多重解法写透" }),
								"：三重循环「种 ",
								/* @__PURE__ */ jsx(M, { children: "\\times" }),
								" 件 ",
								/* @__PURE__ */ jsx(M, { children: "\\times" }),
								" 容量」，一件一件放。是理解「多重 = 带上限的 01」最干净的一题。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "f[j]\\ |=\\ f[j-w_i]" }),
								"（对每种的每件逆推）；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(S\\cdot\\sum m_i)" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "S" }),
								" 为总重量上界。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（朴素多重 + 布尔可达）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P2347,
								luogu: "P2347"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1776",
					name: "宝物筛选",
					src: "NOI导刊2010",
					diff: "提高+/省选-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 种宝物，第 ",
								/* @__PURE__ */ jsx(M, { children: "i" }),
								" 种价值 ",
								/* @__PURE__ */ jsx(M, { children: "v_i" }),
								"、重量 ",
								/* @__PURE__ */ jsx(M, { children: "w_i" }),
								"、数量 ",
								/* @__PURE__ */ jsx(M, { children: "m_i" }),
								"，背包承重 ",
								/* @__PURE__ */ jsx(M, { children: "W" }),
								"，求最大总价值。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								/* @__PURE__ */ jsx(M, { children: "\\sum m_i" }),
								" 可达十万级、",
								/* @__PURE__ */ jsx(M, { children: "W" }),
								" 到四万——朴素摊开必然超时，",
								/* @__PURE__ */ jsx("strong", { children: "逼你上二进制拆分" }),
								"。是多重背包二进制模板的标准练手题（",
								/* @__PURE__ */ jsx(M, { children: "\\sum m_i" }),
								" 规模也容得下单调队列，想进一步优化可以试）。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"二进制拆分成打包件后逐件 01 逆推 ",
								/* @__PURE__ */ jsx(M, { children: "f[j]=\\max(f[j],f[j-w']+v')" }),
								"；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O\\!\\big(W\\cdot\\sum\\log m_i\\big)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（二进制拆分）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1776,
								luogu: "P1776"
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
					pid: "P6771",
					name: "[USACO05DEC] Space Elevator 太空电梯",
					hint: "多重背包 + 可达性：每种方块有限块且有高度上限，先按高度上限从小到大排序，再逐种做「不超过 m 件」的可达 DP。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1077",
					name: "[NOIP2012 普及组] 摆花",
					hint: "有限件求方案数：f[j] 表示用前几种花恰好摆 j 盆的方案数，每种不超过 a_i 盆；那一维可用前缀和把枚举件数优化掉。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1833",
					name: "樱花",
					hint: "题内含「无限 / 有限 / 恰一」多种分支，本质是混合背包；先把每种有限的樱花当多重物品做二进制拆分，无限的按完全背包正推。"
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
				"时，把某件宝物想成「库存只有有限件、拿完就没」——这份「有限件」的斤斤计较，正是多重背包要拆包处理的核心。"
			]
		})
	] });
}
//#endregion
export { KnapsackMultiple as default };
