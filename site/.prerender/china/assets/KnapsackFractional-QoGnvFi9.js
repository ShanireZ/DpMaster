import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, Minus, MousePointerClick, Plus, Scissors, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/knapsack/KnapsackFractionalDemo.tsx
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
var fmt = (x) => {
	const r = Math.round(x * 100) / 100;
	return Number.isInteger(r) ? String(r) : String(r);
};
function greedyFractional(items, cap) {
	const order = [...items].sort((a, b) => b.v / b.w - a.v / a.w);
	let rest = cap;
	let value = 0;
	const segs = [];
	for (const it of order) {
		if (rest <= 0) break;
		if (rest >= it.w) {
			value += it.v;
			rest -= it.w;
			segs.push({
				kind: "full",
				span: it.w,
				text: `w=${it.w} v=${it.v}`
			});
		} else {
			const frac = rest / it.w;
			value += it.v * frac;
			segs.push({
				kind: "cut",
				span: rest,
				text: `切 ${fmt(frac * 100)}%`
			});
			rest = 0;
		}
	}
	if (rest > 0) segs.push({
		kind: "empty",
		span: rest,
		text: rest === cap ? "空" : "空余"
	});
	return {
		value,
		segs
	};
}
function best01(items, cap) {
	const f = new Array(cap + 1).fill(0);
	for (const it of items) for (let j = cap; j >= it.w; j--) f[j] = Math.max(f[j], f[j - it.w] + it.v);
	return f[cap];
}
/**
* 分数背包（辨析课）自建轻量可视化：
* 贪心按 v/w 降序把整段填进容量条、最后一件切开（斜纹）；
* 旁边并列只读的「整取 01-DP 最优」，凸显可分割时贪心 ≥ 整取且 O(n log n) 更简单。
*/
function KnapsackFractionalDemo() {
	const [items, setItems] = useState([
		{
			w: 2,
			v: 3
		},
		{
			w: 3,
			v: 4
		},
		{
			w: 4,
			v: 5
		}
	]);
	const [cap, setCap] = useState(8);
	const greedy = useMemo(() => greedyFractional(items, cap), [items, cap]);
	const dp = useMemo(() => best01(items, cap), [items, cap]);
	const setItem = (i, patch) => setItems((arr) => arr.map((it, k) => k === i ? {
		...it,
		...patch
	} : it));
	const delta = greedy.value - dp;
	const ticks = Array.from({ length: cap + 1 }, (_, k) => k);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "frd__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "frd__group-label",
				children: "物品（可分割 · 可改重量 / 价值）"
			}), /* @__PURE__ */ jsxs("div", {
				className: "frd__items",
				children: [items.map((it, i) => /* @__PURE__ */ jsxs("div", {
					className: "frd__item",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "frd__item-i",
							children: i + 1
						}),
						items.length > 1 && /* @__PURE__ */ jsx("button", {
							className: "frd__remove",
							onClick: () => setItems((a) => a.filter((_, k) => k !== i)),
							"aria-label": "删除物品",
							children: /* @__PURE__ */ jsx(X, { size: 12 })
						}),
						/* @__PURE__ */ jsx(Stepper, {
							label: "重量 w",
							value: it.w,
							min: 1,
							max: cap,
							onChange: (w) => setItem(i, { w })
						}),
						/* @__PURE__ */ jsx(Stepper, {
							label: "价值 v",
							value: it.v,
							min: 1,
							max: 30,
							onChange: (v) => setItem(i, { v })
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "frd__ratio",
							children: ["v/w=", fmt(it.v / it.w)]
						})
					]
				}, i)), items.length < 5 && /* @__PURE__ */ jsxs("button", {
					className: "frd__add",
					onClick: () => setItems((a) => [...a, {
						w: 3,
						v: 4
					}]),
					children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " 加物品"]
				})]
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "frd__group-label",
				children: "背包容量 C"
			}), /* @__PURE__ */ jsx(Stepper, {
				label: "C",
				value: cap,
				min: 2,
				max: 16,
				onChange: setCap
			})] })]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "frd__stage",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "frd__stage-label",
					children: [/* @__PURE__ */ jsxs("span", { children: [
						"贪心装填：按 ",
						/* @__PURE__ */ jsx("span", {
							className: "mono",
							children: "v/w"
						}),
						" 从高到低填，最后一件切开填满"
					] }), /* @__PURE__ */ jsx("span", {
						className: "mono",
						children: "已排序"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "frd__bar",
					children: greedy.segs.map((s, i) => /* @__PURE__ */ jsx("div", {
						className: `frd__seg ${s.kind}`,
						style: {
							flexGrow: s.span,
							flexBasis: 0
						},
						title: s.text,
						children: /* @__PURE__ */ jsx("span", {
							className: "frd__seg-txt",
							children: s.text
						})
					}, i))
				}),
				/* @__PURE__ */ jsx("div", {
					className: "frd__ticks",
					children: ticks.map((t) => /* @__PURE__ */ jsx("span", {
						className: "frd__tick",
						style: { left: `${t / cap * 100}%` },
						children: t
					}, t))
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "frd__compare",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "frd__card win",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "frd__card-head",
						children: [/* @__PURE__ */ jsx(Scissors, { size: 15 }), " 可分割 · 贪心（本页）"]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "frd__card-val",
						children: fmt(greedy.value)
					}),
					/* @__PURE__ */ jsx("div", {
						className: "frd__card-sub",
						children: "按 v/w 降序、最后一件切开 · O(n log n)"
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "frd__card",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "frd__card-head",
						children: [/* @__PURE__ */ jsx(Boxes, { size: 15 }), " 若整取 · 01-DP 最优"]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "frd__card-val",
						children: fmt(dp)
					}),
					/* @__PURE__ */ jsx("div", {
						className: "frd__card-sub",
						children: "每件整取或不取 · 需要背包 DP"
					})
				]
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "frd__delta",
			children: delta > 1e-9 ? /* @__PURE__ */ jsxs(Fragment, { children: [
				"可切分时，贪心多拿到 ",
				/* @__PURE__ */ jsxs("b", { children: ["+", fmt(delta)] }),
				"：把最值钱的那件切一部分塞满了整取时留下的缝隙。"
			] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
				"这组数据恰好整取就能填满，两者持平（贪心永远 ",
				/* @__PURE__ */ jsx("b", { children: "≥" }),
				" 整取，绝不会更差）。"
			] })
		})
	] });
}
//#endregion
//#region src/content/a/KnapsackFractionalArt.tsx
function DivisibleFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 620 176",
		role: "img",
		"aria-label": "可分割物品：一整袋金粉可以只取一部分",
		children: [
			/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsx("marker", {
				id: "kf-ar",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--text-3)"
				})
			}), /* @__PURE__ */ jsx("pattern", {
				id: "kf-hatch",
				width: "7",
				height: "7",
				patternTransform: "rotate(45)",
				patternUnits: "userSpaceOnUse",
				children: /* @__PURE__ */ jsx("line", {
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "7",
					stroke: "var(--accent-2)",
					strokeWidth: "2.4",
					opacity: "0.55"
				})
			})] }),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(20,26)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "150",
						height: "118",
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
						children: "整件物品（01）"
					}),
					/* @__PURE__ */ jsx("rect", {
						x: "34",
						y: "42",
						width: "82",
						height: "34",
						rx: "7",
						fill: "color-mix(in srgb, var(--accent-1) 55%, var(--surface-1))",
						stroke: "var(--accent-2)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "75",
						y: "98",
						textAnchor: "middle",
						fontSize: "12",
						fill: "var(--text-3)",
						children: "要么整块拿，要么留下"
					})
				]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "245",
				y: "70",
				textAnchor: "middle",
				fontSize: "20",
				fill: "var(--text-3)",
				children: "vs"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(300,26)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "220",
						height: "118",
						rx: "14",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "110",
						y: "26",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "可分割物品（金粉 / 牛奶）"
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(24,40)",
						children: [/* @__PURE__ */ jsx("rect", {
							width: "72",
							height: "52",
							rx: "8",
							fill: "color-mix(in srgb, var(--accent-1) 34%, var(--surface-1))",
							stroke: "var(--accent-2)",
							strokeWidth: "1.5"
						}), /* @__PURE__ */ jsx("text", {
							x: "36",
							y: "72",
							textAnchor: "middle",
							fontSize: "11.5",
							fill: "var(--text-3)",
							children: "一整袋"
						})]
					}),
					/* @__PURE__ */ jsx("path", {
						d: "M108 66 H140",
						stroke: "var(--text-3)",
						strokeWidth: "2",
						markerEnd: "url(#kf-ar)"
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(150,40)",
						children: [
							/* @__PURE__ */ jsx("rect", {
								width: "46",
								height: "52",
								rx: "8",
								fill: "var(--surface-2)",
								stroke: "var(--border-strong)",
								strokeWidth: "1.2"
							}),
							/* @__PURE__ */ jsx("rect", {
								y: "26",
								width: "46",
								height: "26",
								rx: "0",
								fill: "url(#kf-hatch)"
							}),
							/* @__PURE__ */ jsx("rect", {
								width: "46",
								height: "52",
								rx: "8",
								fill: "none",
								stroke: "var(--accent-2)",
								strokeWidth: "1.5"
							}),
							/* @__PURE__ */ jsx("text", {
								x: "23",
								y: "72",
								textAnchor: "middle",
								fontSize: "11.5",
								fill: "var(--accent-1)",
								children: "舀 0.5 袋"
							})
						]
					})
				]
			})
		]
	});
}
function GreedyFillFigure() {
	const C = 8;
	const x0 = 34;
	const barY = 58;
	const barH = 46;
	const barW = 520;
	const u = barW / C;
	const full = [{
		w: 2,
		v: 3,
		label: "w=2 · v=3"
	}, {
		w: 3,
		v: 4,
		label: "w=3 · v=4"
	}];
	const cut = {
		w: 4,
		v: 5,
		taken: 3,
		label: "w=4 · 取 3/4"
	};
	let acc = 0;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 590 168",
		role: "img",
		"aria-label": "贪心按单位价值降序装填容量条，最后一件切开填满",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("pattern", {
				id: "kf-hatch2",
				width: "7",
				height: "7",
				patternTransform: "rotate(45)",
				patternUnits: "userSpaceOnUse",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "7",
					height: "7",
					fill: "color-mix(in srgb, var(--accent-1) 22%, var(--surface-1))"
				}), /* @__PURE__ */ jsx("line", {
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "7",
					stroke: "var(--accent-2)",
					strokeWidth: "2.4",
					opacity: "0.85"
				})]
			}) }),
			/* @__PURE__ */ jsx("text", {
				x: x0,
				y: "30",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "容量条（C = 8）· 按 v/w 从高到低填"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: x0,
				y: barY,
				width: barW,
				height: barH,
				rx: "10",
				fill: "var(--surface-2)",
				stroke: "var(--border-strong)",
				strokeWidth: "1.5"
			}),
			Array.from({ length: 9 }, (_, k) => /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("line", {
				x1: x0 + k * u,
				y1: 104,
				x2: x0 + k * u,
				y2: 110,
				stroke: "var(--border-strong)",
				strokeWidth: "1"
			}), /* @__PURE__ */ jsx("text", {
				x: x0 + k * u,
				y: 124,
				textAnchor: "middle",
				fontSize: "10.5",
				className: "mono",
				fill: "var(--text-3)",
				children: k
			})] }, `t${k}`)),
			full.map((it, i) => {
				const segX = x0 + acc * u;
				const segW = it.w * u;
				acc += it.w;
				return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("rect", {
					x: segX + 2,
					y: 61,
					width: segW - 4,
					height: barH - 6,
					rx: "6",
					fill: "color-mix(in srgb, var(--accent-1) 42%, var(--surface-1))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.3"
				}), /* @__PURE__ */ jsx("text", {
					x: segX + segW / 2,
					y: 86,
					textAnchor: "middle",
					fontSize: "12",
					className: "mono",
					fill: "var(--text-on-accent)",
					children: it.label
				})] }, `s${i}`);
			}),
			(() => {
				const segX = x0 + acc * u;
				const segW = cut.taken * u;
				return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("rect", {
					x: segX + 2,
					y: 61,
					width: segW - 4,
					height: barH - 6,
					rx: "6",
					fill: "url(#kf-hatch2)",
					stroke: "var(--accent-2)",
					strokeWidth: "1.5",
					strokeDasharray: "4 3"
				}), /* @__PURE__ */ jsx("text", {
					x: segX + segW / 2,
					y: 86,
					textAnchor: "middle",
					fontSize: "11.5",
					className: "mono",
					fill: "var(--accent-1)",
					children: cut.label
				})] });
			})(),
			/* @__PURE__ */ jsxs("text", {
				x: x0,
				y: 148,
				fontSize: "13",
				fill: "var(--text-2)",
				children: [
					"贪心总价值 = 3 + 4 + 5 ×",
					/* @__PURE__ */ jsx("tspan", {
						className: "mono",
						fill: "var(--accent-1)",
						children: " 3/4 "
					}),
					"=",
					/* @__PURE__ */ jsx("tspan", {
						className: "mono",
						fontWeight: "700",
						fill: "var(--accent-1)",
						children: " 10.75"
					})
				]
			})
		]
	});
}
function ExchangeFigure() {
	const C = 6;
	const x0 = 150;
	const barH = 40;
	const barW = 396;
	const u = barW / C;
	const yBefore = 40;
	const yAfter = 118;
	const before = [{
		from: 0,
		len: 4,
		kind: "hi"
	}, {
		from: 4,
		len: 1,
		kind: "lo"
	}];
	const after = [{
		from: 0,
		len: 5,
		kind: "hi"
	}];
	const fillFor = (k) => k === "hi" ? "color-mix(in srgb, var(--accent-1) 46%, var(--surface-1))" : "color-mix(in srgb, var(--surface-3) 70%, var(--accent-2))";
	const seg = (row, y, key) => /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("rect", {
		x: x0 + row.from * u + 2,
		y: y + 3,
		width: row.len * u - 4,
		height: barH - 6,
		rx: "6",
		fill: fillFor(row.kind),
		stroke: "var(--accent-2)",
		strokeWidth: "1.3",
		strokeDasharray: row.kind === "lo" ? "4 3" : void 0
	}), /* @__PURE__ */ jsx("text", {
		x: x0 + row.from * u + row.len * u / 2,
		y: y + barH / 2 + 5,
		textAnchor: "middle",
		fontSize: "11.5",
		className: "mono",
		fill: row.kind === "hi" ? "var(--text-on-accent)" : "var(--accent-1)",
		children: row.kind === "hi" ? "v/w=2" : "v/w=1"
	})] }, key);
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 590 196",
		role: "img",
		"aria-label": "交换论证：把低性价比那一格换成高性价比，总价值只增不减",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "kf-ex-ar",
				markerWidth: "9",
				markerHeight: "9",
				refX: "6.5",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--accent-2)"
				})
			}) }),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: 54,
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--text-2)",
				children: "换前"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: 72,
				fontSize: "11",
				fill: "var(--text-3)",
				children: "价值 9"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: x0,
				y: yBefore,
				width: barW,
				height: barH,
				rx: "8",
				fill: "var(--surface-2)",
				stroke: "var(--border-strong)",
				strokeWidth: "1.5"
			}),
			before.map((r, i) => seg(r, yBefore, `b${i}`)),
			/* @__PURE__ */ jsx("text", {
				x: 513,
				y: 65,
				textAnchor: "middle",
				fontSize: "11",
				fill: "var(--text-3)",
				children: "空"
			}),
			/* @__PURE__ */ jsx("path", {
				d: `M 348 84 V ${yAfter - 4}`,
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				markerEnd: "url(#kf-ex-ar)",
				fill: "none"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 360,
				y: 103,
				fontSize: "12",
				fill: "var(--accent-1)",
				fontWeight: "600",
				children: "这一格换成 v/w=2 ⇒ 更优"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: 132,
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--text-2)",
				children: "换后"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: 150,
				fontSize: "11",
				fill: "var(--accent-1)",
				children: "价值 10"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: x0,
				y: yAfter,
				width: barW,
				height: barH,
				rx: "8",
				fill: "var(--surface-2)",
				stroke: "var(--border-strong)",
				strokeWidth: "1.5"
			}),
			after.map((r, i) => seg(r, yAfter, `a${i}`)),
			/* @__PURE__ */ jsx("text", {
				x: 513,
				y: 143,
				textAnchor: "middle",
				fontSize: "11",
				fill: "var(--text-3)",
				children: "空"
			})
		]
	});
}
//#endregion
//#region src/content/a/KnapsackFractional.tsx
var CODE_P1208 = `
#include <iostream>
#include <algorithm>
using namespace std;

struct Farmer          // 一个奶农：单价 p、存量 a
{
    int p, a;
};

Farmer g[5005];

bool cmp(const Farmer &x, const Farmer &y)
{
    return x.p < y.p;               // ★按单价升序：先买最便宜的
}

int main()
{
    int n, m;                       // n 需求量，m 奶农数
    cin >> n >> m;
    for (int i = 1; i <= m; i++)
        cin >> g[i].p >> g[i].a;

    sort(g + 1, g + m + 1, cmp);    // 贪心的核心：排序

    long long cost = 0;             // 总花费
    for (int i = 1; i <= m && n > 0; i++)   // 需求没凑够就继续买
    {
        int buy = min(n, g[i].a);   // ★可只买一部分：这家最多买 min(还差多少, 存量)
        cost += (long long)buy * g[i].p;
        n -= buy;
    }

    cout << cost << endl;
    return 0;
}`;
function KnapsackFractional() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "先分清：这次能不能「取一部分」"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"前面几种背包，物品都是",
						/* @__PURE__ */ jsx("strong", { children: "整件取舍" }),
						"——一件要么整个拿走、要么留下，没有「拿半件」这回事。可现实里有另一类物品： 金粉、牛奶、汽油、矿砂……它们",
						/* @__PURE__ */ jsx("strong", { children: "可以只取一部分" }),
						"，装满剩余空间的一小段也行。这类问题叫",
						/* @__PURE__ */ jsx("strong", { children: "分数背包" }),
						"（也叫部分背包）。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(DivisibleFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "左：整件物品（01 背包），只能整块拿或留；右：可分割物品，一整袋金粉能只舀出 0.5 袋去填满缝隙。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"差别看着小，分量却很重。回想 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/01",
							style: { color: "var(--accent-2)" },
							children: "01 背包的开头"
						}),
						"：那里我们试着用",
						/* @__PURE__ */ jsx("strong", { children: "贪心" }),
						"（按性价比 ",
						/* @__PURE__ */ jsx(M, { children: "v/w" }),
						" 从高到低装），结果",
						/* @__PURE__ */ jsx("strong", { children: "输给了 DP" }),
						"——因为整件取舍时，塞不下的那件只能整个放弃，贪心会在「差一点点」的地方卡住。 但只要物品",
						/* @__PURE__ */ jsx("strong", { children: "可以切开" }),
						"，这个「差一点点」就消失了：装不下整件？那就切下正好填满的一段。于是——",
						/* @__PURE__ */ jsx("strong", { children: "贪心重新变成最优，而且不再需要 DP" }),
						"。这一页专门点破这条分界。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "可切分时，贪心为什么就是最优"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"策略只有一句话：",
						/* @__PURE__ */ jsxs("strong", { children: [
							"按单位价值 ",
							/* @__PURE__ */ jsx(M, { children: "v/w" }),
							" 从高到低装"
						] }),
						"，能整件装就整件装，直到最后",
						/* @__PURE__ */ jsx("strong", { children: "装不下整件的那一件，按剩余容量的比例切开" }),
						"，把背包填满为止。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"为什么这样一定最优？关键在「可切分」赋予的",
						/* @__PURE__ */ jsx("strong", { children: "自由" }),
						"：背包最终一定会被",
						/* @__PURE__ */ jsx("strong", { children: "恰好填满" }),
						"（除非所有物品都装进去还有空）。既然容量必被占满，那把每一单位容量都留给",
						/* @__PURE__ */ jsx("strong", { children: "单位价值最高" }),
						"的物品，总价值自然最大。 严格一点说，用",
						/* @__PURE__ */ jsx("strong", { children: "交换论证" }),
						"：取任一「最优」方案，若其中某一单位空间给了 ",
						/* @__PURE__ */ jsx(M, { children: "v/w" }),
						" 较低的物品，而更高性价比的物品还没装满——那就把这一单位",
						/* @__PURE__ */ jsx("strong", { children: "切下来" }),
						"，换成高性价比那种同样一单位。空间占用不变（可切分保证换得进），而",
						/* @__PURE__ */ jsx("strong", { children: "总价值只增不减" }),
						"（换进来的每单位价值更高）。既然任何「低 ",
						/* @__PURE__ */ jsx(M, { children: "v/w" }),
						" 抢占了本可给高 ",
						/* @__PURE__ */ jsx(M, { children: "v/w" }),
						" 的空间」的方案都能这样被改良，最优方案里就",
						/* @__PURE__ */ jsx("strong", { children: "不可能" }),
						"存在这种错配：必被填满的每一单位，都归当前",
						/* @__PURE__ */ jsxs("strong", { children: [
							"剩余里 ",
							/* @__PURE__ */ jsx(M, { children: "v/w" }),
							" 最高"
						] }),
						"的物品——这恰好就是「按 ",
						/* @__PURE__ */ jsx(M, { children: "v/w" }),
						" 降序填」的贪心。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(ExchangeFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "交换论证：换前那条容量条有一格错给了低性价比物品（v/w=1，虚线格），而高性价比物品（v/w=2）尚未填满；把这一格切换成高性价比的，占用不变、总价值从 9 升到 10。任何这样的错配都可被改良，故最优方案里不存在错配。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"用 01 背包开头的同一组数据体会一遍：物品 ",
						/* @__PURE__ */ jsx(M, { children: "(w,v)=(2,3),(3,4),(4,5)" }),
						"，容量 ",
						/* @__PURE__ */ jsx(M, { children: "C=8" }),
						"。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(GreedyFillFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "按 v/w=1.5, 1.33, 1.25 降序：先装满 (2,3) 与 (3,4)（占 5 格、价值 7），容量还剩 3 格；最值钱但性价比最低的 (4,5) 装不下整件，切下 3/4（3 格）取价值 3.75。贪心总价值 = 10.75。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"对照一下：同样这组数据若",
						/* @__PURE__ */ jsx("strong", { children: "只能整取" }),
						"（01 背包），最优是 ",
						/* @__PURE__ */ jsx(M, { children: "(3,4)+(4,5)=9" }),
						"——因为 ",
						/* @__PURE__ */ jsx(M, { children: "(4,5)" }),
						" 要么整件塞进去、要么彻底放弃，没法只填那 3 格的缝隙。 可切分把这 ",
						/* @__PURE__ */ jsx(M, { children: "10.75-9=1.75" }),
						" 的差额",
						/* @__PURE__ */ jsx("strong", { children: "补了回来" }),
						"。"
					] }), /* @__PURE__ */ jsx(MB, { children: "V_{\\text{greedy}}=\\sum_{k}v_k \\;+\\; v_{\\text{last}}\\cdot\\frac{C_{\\text{rest}}}{w_{\\text{last}}}" })]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质 · 为什么这里贪心够用、轮不到 DP",
					children: [
						"分数背包的最优子结构被「可切分」",
						/* @__PURE__ */ jsx("strong", { children: "抹平" }),
						"了：容量必被填满，每一单位空间独立地归给单位价值最高者即可，",
						/* @__PURE__ */ jsx("strong", { children: "当前最优不再牵扯后面还剩多少整数空间" }),
						"。于是一次排序 + 一趟扫描（",
						/* @__PURE__ */ jsx(M, { children: "O(n\\log n)" }),
						"）就得最优，",
						/* @__PURE__ */ jsx("strong", { children: "不需要背包 DP 那张表" }),
						"。DP 是用来对付「整件取舍」那种牵一发动全身的耦合的——这里没有那种耦合。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "跟着装一遍"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"把贪心用那组数据（物品 ",
						/* @__PURE__ */ jsx(M, { children: "(w,v)=(2,3),(3,4),(4,5)" }),
						"，容量 ",
						/* @__PURE__ */ jsx(M, { children: "C=8" }),
						"）从头装一遍，每一步只做一个动作："
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
									/* @__PURE__ */ jsxs("b", { children: [
										"排序（按 ",
										/* @__PURE__ */ jsx(M, { children: "v/w" }),
										" 降序）。"
									] }),
									" 三件的单位价值是 ",
									/* @__PURE__ */ jsx(M, { children: "3/2=1.5" }),
									"、",
									/* @__PURE__ */ jsx(M, { children: "4/3\\approx1.33" }),
									"、",
									/* @__PURE__ */ jsx(M, { children: "5/4=1.25" }),
									"，已是降序，装填顺序就定为 ",
									/* @__PURE__ */ jsx(M, { children: "(2,3)\\to(3,4)\\to(4,5)" }),
									"。背包空、累计价值 0、剩 8 格。"
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
									/* @__PURE__ */ jsxs("b", { children: [
										"整件装 ",
										/* @__PURE__ */ jsx(M, { children: "(2,3)" }),
										"。"
									] }),
									" 剩 8 格 ",
									/* @__PURE__ */ jsx(M, { children: "\\ge" }),
									" 它的 2 格，整件放入：占 ",
									/* @__PURE__ */ jsx("b", { children: "2" }),
									" 格，累计价值 ",
									/* @__PURE__ */ jsx(M, { children: "0+3=3" }),
									"，还剩 ",
									/* @__PURE__ */ jsx(M, { children: "8-2=6" }),
									" 格。"
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
									/* @__PURE__ */ jsxs("b", { children: [
										"整件装 ",
										/* @__PURE__ */ jsx(M, { children: "(3,4)" }),
										"。"
									] }),
									" 剩 6 格 ",
									/* @__PURE__ */ jsx(M, { children: "\\ge" }),
									" 它的 3 格，整件放入：再占 ",
									/* @__PURE__ */ jsx("b", { children: "3" }),
									" 格，累计价值 ",
									/* @__PURE__ */ jsx(M, { children: "3+4=7" }),
									"，还剩 ",
									/* @__PURE__ */ jsx(M, { children: "6-3=3" }),
									" 格。"
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
									/* @__PURE__ */ jsxs("b", { children: [
										"切最后一件 ",
										/* @__PURE__ */ jsx(M, { children: "(4,5)" }),
										"。"
									] }),
									" 只剩 3 格 ",
									/* @__PURE__ */ jsx(M, { children: "<" }),
									" 它的 4 格，装不下整件——按剩余比例切下 ",
									/* @__PURE__ */ jsx(M, { children: "3/4" }),
									"，取得价值 ",
									/* @__PURE__ */ jsx(M, { children: "5\\times\\frac{3}{4}=3.75" }),
									"。背包被",
									/* @__PURE__ */ jsx("strong", { children: "恰好填满" }),
									"，总价值 ",
									/* @__PURE__ */ jsx(M, { children: "7+3.75=10.75" }),
									"。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }), "下面的对照演示会把这套「排序 → 整件装 → 切尾段」实时跑给你看，并和「若整取」的 01-DP 最优并排比较。"]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "改改看：贪心 vs 整取，两个数一起跳"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"下面把两条路",
						/* @__PURE__ */ jsx("strong", { children: "并排算给你看" }),
						"：左边是",
						/* @__PURE__ */ jsx("strong", { children: "可分割 → 贪心" }),
						"（按 ",
						/* @__PURE__ */ jsx(M, { children: "v/w" }),
						" 降序填、最后一件切开），右边是",
						/* @__PURE__ */ jsx("strong", { children: "若整取 → 01-DP 最优" }),
						"（自写一个小背包）。 改物品的 ",
						/* @__PURE__ */ jsx(M, { children: "w,v" }),
						" 或容量 ",
						/* @__PURE__ */ jsx(M, { children: "C" }),
						"——盯住那条容量条：整件段是实心、被切开的尾段是斜纹。多数情况下贪心的数",
						/* @__PURE__ */ jsx("strong", { children: "更大" }),
						"（切开填满了整取留下的缝隙）；当数据恰好整取就能填满时，两者持平。",
						/* @__PURE__ */ jsxs("strong", { children: [
							"贪心永远 ",
							/* @__PURE__ */ jsx(M, { children: "\\ge" }),
							" 整取，绝不会更差。"
						] })
					] })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(KnapsackFractionalDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"试着把某件的 ",
						/* @__PURE__ */ jsx(M, { children: "v/w" }),
						" 调得很高——看它被排到最前、优先整件装满；再把容量调到刚好卡在半件处，观察尾段如何被切开。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "一句话分界：可分割⇒贪心，不可分割⇒背包 DP"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: ["把这一部分的整条脉络收束成一个判别动作——拿到一道「装东西求最值」的题，先问一句：", /* @__PURE__ */ jsx("strong", { children: "物品能不能取一部分？" })] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "能切分" }),
							"（金粉、牛奶、汽油、按重量卖的散货）→ 按 ",
							/* @__PURE__ */ jsx(M, { children: "v/w" }),
							" 降序",
							/* @__PURE__ */ jsx("strong", { children: "贪心" }),
							"，最后一件切开填满，",
							/* @__PURE__ */ jsx(M, { children: "O(n\\log n)" }),
							"，",
							/* @__PURE__ */ jsx("strong", { children: "用不到 DP" }),
							"。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "整件取舍" }),
							"（一台机器、一本书、一件装备——只能整个拿或不拿）→ 贪心会在「差一点点」处失手，必须回到",
							/* @__PURE__ */ jsx("strong", { children: "背包 DP" }),
							"：01 / 完全 / 多重…… 用一张表把指数级组合压成多项式。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "整取时贪心的经典反例（回扣 01 背包）",
					children: [
						"就是 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/a/01",
							style: { color: "var(--accent-2)" },
							children: "01 背包开头"
						}),
						"那一幕：物品 ",
						/* @__PURE__ */ jsx(M, { children: "(2,3),(3,4),(4,5)" }),
						"、容量 8，按 ",
						/* @__PURE__ */ jsx(M, { children: "v/w" }),
						" 贪心先装 ",
						/* @__PURE__ */ jsx(M, { children: "(2,3)" }),
						" 再装 ",
						/* @__PURE__ */ jsx(M, { children: "(3,4)" }),
						"，剩 3 格塞不下 ",
						/* @__PURE__ */ jsx(M, { children: "(4,5)" }),
						" 只得 ",
						/* @__PURE__ */ jsx("strong", { children: "7" }),
						"；最优却是 ",
						/* @__PURE__ */ jsx(M, { children: "(3,4)+(4,5)=9" }),
						"。",
						/* @__PURE__ */ jsx("strong", { children: "整取时贪心输 2" }),
						"——因为那 3 格的缝隙没法用「半件 ",
						/* @__PURE__ */ jsx(M, { children: "(4,5)" }),
						"」去填。可一旦允许切分，这半件就能塞进去，反例当场消失，贪心反超到 ",
						/* @__PURE__ */ jsx("strong", { children: "10.75" }),
						"。",
						/* @__PURE__ */ jsx("strong", { children: "能不能切开，就是贪心与 DP 的分水岭。" })
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "例题"
			}), /* @__PURE__ */ jsxs(ExampleCard, {
				pid: "P1208",
				name: "[USACO1.3] 混合牛奶 Mixing Milk",
				src: "USACO 原生",
				diff: "普及-",
				children: [
					/* @__PURE__ */ jsxs(Field, {
						k: "题意",
						children: [
							"要收购 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 单位牛奶，有 ",
							/* @__PURE__ */ jsx(M, { children: "m" }),
							" 个奶农，第 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 个单价 ",
							/* @__PURE__ */ jsx(M, { children: "p_i" }),
							"、最多供应 ",
							/* @__PURE__ */ jsx(M, { children: "a_i" }),
							" 单位。每个奶农的奶",
							/* @__PURE__ */ jsx("strong", { children: "可以只买一部分" }),
							"。求凑够 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 单位的",
							/* @__PURE__ */ jsx("strong", { children: "最小花费" }),
							"。"
						]
					}),
					/* @__PURE__ */ jsxs(Field, {
						k: "为什么选它（辨析对照）",
						children: [
							"这是",
							/* @__PURE__ */ jsx("strong", { children: "可分割 → 贪心" }),
							"的教科书题，正好和 01 背包对照：物品能拆散买，于是不必做背包 DP——",
							/* @__PURE__ */ jsx("strong", { children: "按单价升序，从最便宜的开始买，最后一家买够为止" }),
							"。它把「可切分 ⇒ 贪心」这条分界坐实成一道能提交的题。"
						]
					}),
					/* @__PURE__ */ jsxs(Field, {
						k: "思路 · 复杂度",
						children: [
							"按单价 ",
							/* @__PURE__ */ jsx(M, { children: "p_i" }),
							" 升序排序，逐个奶农买「还差量」与存量的较小值 ",
							/* @__PURE__ */ jsx(M, { children: "\\min(r,\\ a_i)" }),
							" 单位（",
							/* @__PURE__ */ jsx(M, { children: "r" }),
							" 为尚未凑够的量），累加花费直到凑满 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							"。排序 ",
							/* @__PURE__ */ jsx(M, { children: "O(m\\log m)" }),
							"，扫描 ",
							/* @__PURE__ */ jsx(M, { children: "O(m)" }),
							"——",
							/* @__PURE__ */ jsx("strong", { children: "纯贪心，没有 DP 表" }),
							"。"
						]
					}),
					/* @__PURE__ */ jsx(Field, {
						k: "参考代码（贪心 · 单价升序）",
						children: /* @__PURE__ */ jsx(CodeBlock, {
							code: CODE_P1208,
							luogu: "P1208"
						})
					})
				]
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson exercises",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "练习"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1208",
					name: "[USACO1.3] 混合牛奶 Mixing Milk",
					hint: "学后自测：按单价升序，逐个奶农买 min(还差量, 存量)，累加到凑满 n。确认自己能一眼判定它「可分割 ⇒ 贪心、无需 DP」。"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					style: { marginTop: "var(--sp-4)" },
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"这是一节",
						/* @__PURE__ */ jsx("strong", { children: "辨析课" }),
						"，配套的洛谷原生题只有 P1208 一道，就不用非原生题凑数了。真正要带走的是这条",
						/* @__PURE__ */ jsx("strong", { children: "判别直觉" }),
						"："
					] }), /* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsxs("strong", { children: [
						"遇到「可取一部分 / 按重量按量买」，先想贪心（按 ",
						/* @__PURE__ */ jsx(M, { children: "v/w" }),
						" 或单价排序）；遇到「整件取舍、只能整个拿或不拿」，再回背包 DP。"
					] }), "前八节的背包 DP 是为后一种情形准备的重武器；这一节告诉你——不是所有「装背包」都要动用它。"] })]
				})
			]
		})
	] });
}
//#endregion
export { KnapsackFractional as default };
