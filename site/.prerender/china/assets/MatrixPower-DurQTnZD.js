import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gauge, Minus, MousePointerClick, Plus, X, Zap } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/demos/matrix/MatrixPowerDemo.tsx
var MOD = 1000000007;
var FIB_M = [
	1,
	1,
	1,
	0
];
var IDENT = [
	1,
	0,
	0,
	1
];
function mul(x, y) {
	return [
		(x[0] * y[0] + x[1] * y[2]) % MOD,
		(x[0] * y[1] + x[1] * y[3]) % MOD,
		(x[2] * y[0] + x[3] * y[2]) % MOD,
		(x[2] * y[1] + x[3] * y[3]) % MOD
	];
}
function fastPowTrace(n) {
	const steps = [];
	let pow = FIB_M;
	let acc = IDENT;
	let k = n;
	let bit = 0;
	if (n === 0) return {
		steps: [],
		result: IDENT,
		bits: 1
	};
	while (k > 0) {
		const bitVal = k & 1;
		const used = bitVal === 1;
		if (used) acc = mul(acc, pow);
		steps.push({
			bit,
			bitVal,
			pow,
			used,
			acc
		});
		k >>= 1;
		if (k > 0) pow = mul(pow, pow);
		bit++;
	}
	return {
		steps,
		result: acc,
		bits: steps.length
	};
}
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
function MatCell({ m, tone, cap }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `mpw__mat mpw__mat--${tone}`,
		children: [cap && /* @__PURE__ */ jsx("div", {
			className: "mpw__mat-cap",
			children: cap
		}), /* @__PURE__ */ jsx("div", {
			className: "mpw__grid",
			children: m.map((v, i) => /* @__PURE__ */ jsx("span", {
				className: "mpw__num",
				children: v
			}, i))
		})]
	});
}
/**
* 斐波那契矩阵快速幂 · 二进制倍增可视化（自建轻量，非 DPViz）。
* 用户改指数 n：把 n 写成二进制，展示倍增平方序列 M, M², M⁴, M⁸ …，
* 并按 n 的每个为 1 的二进制位把对应幂次「累乘」成 Mⁿ；
* 每步显示 2×2 数值、当前操作（平方 / 累乘）、以及步数对比（暴力 n 次 vs 快速幂 ~2·⌊log₂n⌋ 次）。
* 核对：M^5 左上 = F(6) = 8；M^10 左上 = F(11) = 89（F(1)=F(2)=1）。
*/
function MatrixPowerDemo() {
	const [n, setN] = useState(5);
	const { steps, result, bits } = useMemo(() => fastPowTrace(n), [n]);
	const binStr = n.toString(2);
	const squarings = Math.max(0, bits - 1);
	const accMuls = steps.filter((s) => s.used).length;
	const fastMuls = squarings + accMuls;
	const naiveMuls = Math.max(1, n - 1);
	const fibNext = result[0];
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "mpw__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "mpw__group-label",
				children: "指数 n（要算 Mⁿ，即斐波那契第 n+1 项）"
			}), /* @__PURE__ */ jsx(Stepper, {
				label: "n",
				value: n,
				min: 1,
				max: 30,
				onChange: setN
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "mpw__bin",
				children: [/* @__PURE__ */ jsx("div", {
					className: "mpw__group-label",
					children: "n 的二进制（低位驱动倍增）"
				}), /* @__PURE__ */ jsxs("div", {
					className: "mpw__bin-row",
					children: [binStr.split("").map((b, i) => /* @__PURE__ */ jsx("span", {
						className: `mpw__bit${b === "1" ? " on" : ""}`,
						children: b
					}, i)), /* @__PURE__ */ jsxs("span", {
						className: "mpw__bin-eq",
						children: [
							"= ",
							n,
							/* @__PURE__ */ jsx("sub", { children: "10" })
						]
					})]
				})]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mpw__trace",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mpw__trace-head",
					children: [/* @__PURE__ */ jsxs("span", { children: [
						"倍增序列 ",
						/* @__PURE__ */ jsx("span", {
							className: "mono",
							children: "M, M², M⁴, M⁸ …"
						}),
						"：每行处理 n 的一个二进制位（低位在上）"
					] }), /* @__PURE__ */ jsx("span", {
						className: "mono",
						children: "位为 1 才累乘"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mpw__acc-start",
					children: [/* @__PURE__ */ jsx(MatCell, {
						m: IDENT,
						tone: "acc",
						cap: "起点 acc = I（单位阵）"
					}), /* @__PURE__ */ jsx("span", {
						className: "mpw__acc-note",
						children: "从单位阵出发，逐位累乘"
					})]
				}),
				steps.map((s, i) => /* @__PURE__ */ jsxs("div", {
					className: `mpw__step${s.used ? " used" : ""}`,
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mpw__step-bit",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "mpw__step-power mono",
								children: ["M", /* @__PURE__ */ jsx("sup", { children: 1 << s.bit })]
							}), /* @__PURE__ */ jsxs("span", {
								className: `mpw__step-flag${s.used ? " on" : ""}`,
								children: [
									"位",
									/* @__PURE__ */ jsx("sub", { children: s.bit }),
									"=",
									s.bitVal
								]
							})]
						}),
						/* @__PURE__ */ jsx(MatCell, {
							m: s.pow,
							tone: "pow",
							cap: `M^${1 << s.bit}（平方倍增得到）`
						}),
						/* @__PURE__ */ jsx("span", {
							className: "mpw__op",
							children: s.used ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(X, { size: 13 }), " 累乘"] }) : /* @__PURE__ */ jsx("span", {
								className: "mpw__op-skip",
								children: "跳过"
							})
						}),
						/* @__PURE__ */ jsx(MatCell, {
							m: s.acc,
							tone: "acc",
							cap: s.used ? "累乘后 acc" : "acc 不变"
						})
					]
				}, i))
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mpw__result",
			children: /* @__PURE__ */ jsxs("div", {
				className: "mpw__result-mat",
				children: [/* @__PURE__ */ jsx(MatCell, {
					m: result,
					tone: "acc",
					cap: `Mⁿ = M^${n}`
				}), /* @__PURE__ */ jsxs("div", {
					className: "mpw__result-read",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "mpw__result-line",
						children: [
							"左上角 = ",
							/* @__PURE__ */ jsxs("b", {
								className: "mono",
								children: [
									"F(",
									n + 1,
									")"
								]
							}),
							" = ",
							/* @__PURE__ */ jsx("b", {
								className: "mono",
								children: fibNext
							})
						]
					}), /* @__PURE__ */ jsx("div", {
						className: "mpw__result-sub",
						children: "斐波那契 F(1)=F(2)=1；Mⁿ 左上恒为 F(n+1)（n=5→F(6)=8，n=10→F(11)=89）。"
					})]
				})]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mpw__compare",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mpw__card",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "mpw__card-head",
						children: [/* @__PURE__ */ jsx(Gauge, { size: 15 }), " 暴力：连乘 M"]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mpw__card-val",
						children: [naiveMuls, /* @__PURE__ */ jsx("small", { children: "次乘法" })]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mpw__card-sub",
						children: "M¹→Mⁿ 逐个乘，共 n−1 次 · O(n)"
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mpw__card win",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "mpw__card-head",
						children: [/* @__PURE__ */ jsx(Zap, { size: 15 }), " 快速幂：倍增"]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mpw__card-val",
						children: [fastMuls, /* @__PURE__ */ jsx("small", { children: "次乘法" })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mpw__card-sub",
						children: [
							"平方 ",
							squarings,
							" + 累乘 ",
							accMuls,
							" · O(log n)"
						]
					})
				]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mpw__delta",
			children: [
				"n=",
				n,
				" 时，暴力要做 ",
				/* @__PURE__ */ jsx("b", { children: naiveMuls }),
				" 次矩阵乘法，快速幂只用 ",
				/* @__PURE__ */ jsx("b", { children: fastMuls }),
				" 次—— 把线性的 ",
				/* @__PURE__ */ jsx("span", {
					className: "mono",
					children: "O(n)"
				}),
				" 压成对数的 ",
				/* @__PURE__ */ jsx("span", {
					className: "mono",
					children: "O(log n)"
				}),
				"。 真正题目里 n 可达 ",
				/* @__PURE__ */ jsx("span", {
					className: "mono",
					children: "2⁶³"
				}),
				"，暴力 ",
				/* @__PURE__ */ jsx("span", {
					className: "mono",
					children: "O(n)"
				}),
				" 必然超时， 快速幂却只需约 ",
				/* @__PURE__ */ jsx("b", { children: Math.ceil(Math.log2(Math.max(2, n))) }),
				" 层倍增即可。"
			]
		})
	] });
}
//#endregion
//#region src/components/demos/matrix/MatrixBuildDemo.tsx
var PRESETS = [{
	key: "f13",
	label: "a[x] = a[x-1] + a[x-3]",
	coef: [
		1,
		0,
		1
	]
}, {
	key: "fib",
	label: "a[x] = a[x-1] + a[x-2]",
	coef: [1, 1]
}];
var prevLabels = (order) => Array.from({ length: order }, (_, i) => `a[x-${i + 1}]`);
var nextLabels = (order) => Array.from({ length: order }, (_, i) => i === 0 ? "a[x]" : `a[x-${i}]`);
/**
* 由递推构造转移矩阵：第 0 行是递推系数；其余每行是「位移」——
* 新状态里的 a[x-i]（i≥1）恰好等于旧状态里的 a[x-i]，即单位位移。
* 对 a[x]=a[x-1]+a[x-3]：矩阵 = [[1,0,1],[1,0,0],[0,1,0]]，核对无误。
*/
function buildMatrix(coef) {
	const order = coef.length;
	const M = [];
	M.push([...coef]);
	for (let r = 1; r < order; r++) {
		const row = new Array(order).fill(0);
		row[r - 1] = 1;
		M.push(row);
	}
	return M;
}
function rowExplain(order, r, coef) {
	const nl = nextLabels(order);
	const pl = prevLabels(order);
	if (r === 0) {
		const terms = coef.map((c, t) => c === 0 ? null : c === 1 ? pl[t] : `${c}·${pl[t]}`).filter(Boolean).join(" + ");
		return `${nl[0]} 由递推给出 = ${terms}，故本行系数就是递推系数。`;
	}
	return `${nl[r]} 其实就是旧向量里现成的 ${pl[r - 1]}，原样搬过来 → 只在第 ${r} 列放一个 1（位移行）。`;
}
/**
* 递推 → 构造转移矩阵（自建轻量可视化，非 DPViz）。
* 切换 1~2 个递推预设；把状态向量 [a[x-1],a[x-2],…] 与输出向量 [a[x],a[x-1],…] 并排，
* 逐行点亮矩阵：hover / 选中某一行时，高亮它对应的输出分量，并解释系数来源。
*/
function MatrixBuildDemo() {
	const [key, setKey] = useState(PRESETS[0].key);
	const [activeRow, setActiveRow] = useState(0);
	const recur = useMemo(() => PRESETS.find((p) => p.key === key), [key]);
	const order = recur.coef.length;
	const M = useMemo(() => buildMatrix(recur.coef), [recur]);
	const pl = prevLabels(order);
	const nl = nextLabels(order);
	const row = Math.min(activeRow, order - 1);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "mbd__toolbar",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "mpw__group-label",
				children: "选一个线性递推"
			}), /* @__PURE__ */ jsx("div", {
				className: "mbd__preset-row",
				children: PRESETS.map((p) => /* @__PURE__ */ jsxs("button", {
					className: `mbd__preset${p.key === key ? " on" : ""}`,
					onClick: () => {
						setKey(p.key);
						setActiveRow(0);
					},
					children: [/* @__PURE__ */ jsx("span", {
						className: "mono",
						children: p.label
					}), /* @__PURE__ */ jsxs("span", {
						className: "mbd__preset-ord",
						children: [p.coef.length, " 阶"]
					})]
				}, p.key))
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "mbd__hint",
				children: [
					"状态向量 ",
					/* @__PURE__ */ jsx("b", { children: order }),
					" 维 → 转移矩阵 ",
					/* @__PURE__ */ jsxs("b", { children: [
						order,
						"×",
						order
					] }),
					"。 点矩阵任意一行，看这行系数从哪来。"
				]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mbd__convention",
			children: [
				"此处按",
				/* @__PURE__ */ jsx("b", { children: "列向量左乘" }),
				" ",
				/* @__PURE__ */ jsx("span", {
					className: "mono",
					children: "M · 旧状态 = 新状态"
				}),
				" 摆放（矩阵在左、状态是列）， 矩阵",
				/* @__PURE__ */ jsx("b", { children: "第 r 行" }),
				"正好算出新状态的第 r 个分量——与正文的",
				/* @__PURE__ */ jsx("b", { children: "行向量右乘" }),
				" ",
				/* @__PURE__ */ jsx("span", {
					className: "mono",
					children: "[…]·M"
				}),
				" 只是转置写法，结果等价。"
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mbd__equation",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mbd__mat",
					children: [/* @__PURE__ */ jsx("div", {
						className: "mbd__vec-cap",
						children: "转移矩阵 M"
					}), /* @__PURE__ */ jsx("div", {
						className: "mbd__mat-grid",
						style: { gridTemplateColumns: `repeat(${order}, 1fr)` },
						children: M.map((r, ri) => r.map((v, ci) => {
							const active = ri === row;
							return /* @__PURE__ */ jsx("button", {
								className: `mbd__mcell${active ? " row" : ""}${active && v !== 0 ? " src" : ""}${v === 0 ? " zero" : ""}`,
								onClick: () => setActiveRow(ri),
								title: `第 ${ri} 行 第 ${ci} 列 = ${v}`,
								children: v
							}, `${ri}-${ci}`);
						}))
					})]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "mbd__times",
					children: "×"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mbd__vec",
					children: [/* @__PURE__ */ jsx("div", {
						className: "mbd__vec-cap",
						children: "旧状态"
					}), /* @__PURE__ */ jsx("div", {
						className: "mbd__vec-body",
						children: pl.map((lab, i) => /* @__PURE__ */ jsx("span", {
							className: `mbd__vcell${i === (row === 0 ? -1 : row - 1) ? " hot" : ""}`,
							title: lab,
							children: lab
						}, i))
					})]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "mbd__eq",
					children: "="
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mbd__vec",
					children: [/* @__PURE__ */ jsx("div", {
						className: "mbd__vec-cap",
						children: "新状态"
					}), /* @__PURE__ */ jsx("div", {
						className: "mbd__vec-body",
						children: nl.map((lab, i) => /* @__PURE__ */ jsx("span", {
							className: `mbd__vcell out${i === row ? " hot" : ""}`,
							title: lab,
							children: lab
						}, i))
					})]
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mbd__explain",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mbd__explain-head",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "mbd__explain-tag mono",
					children: [
						"第 ",
						row,
						" 行"
					]
				}), /* @__PURE__ */ jsxs("span", {
					className: "mono",
					children: [
						nl[row],
						" = ",
						M[row].map((v, t) => `${v}·${pl[t]}`).join(" + ")
					]
				})]
			}), /* @__PURE__ */ jsx("p", { children: rowExplain(order, row, recur.coef) })]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mbd__legend",
			children: [
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { className: "mbd__sw src" }), " 递推系数行（本步真正做加法）"] }),
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { className: "mbd__sw shift" }), " 位移行（把旧分量原样下移，只一个 1）"] }),
				/* @__PURE__ */ jsx(ArrowRight, {
					size: 13,
					className: "mbd__legend-arrow"
				}),
				/* @__PURE__ */ jsxs("span", { children: [
					"有了 M，求第 x 项就是算 ",
					/* @__PURE__ */ jsx("span", {
						className: "mono",
						children: "Mˣ"
					}),
					" 乘初始向量——用矩阵快速幂 O(k³log x)。"
				] })
			]
		})
	] });
}
//#endregion
//#region src/content/d/MatrixPowerArt.tsx
function RecurExplodeFigure() {
	const cells = [
		{
			i: 0,
			v: "1"
		},
		{
			i: 1,
			v: "1"
		},
		{
			i: 2,
			v: "2"
		},
		{
			i: 3,
			v: "3"
		},
		{
			i: 4,
			v: "5"
		},
		{
			i: 5,
			v: "8"
		}
	];
	const x0 = 24;
	const dx = 74;
	const cw = 60;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 172",
		role: "img",
		"aria-label": "线性递推逐项计算，n 极大时超时",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "mp-re",
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
			cells.map((c, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${x0 + i * dx},46)`,
				children: [
					/* @__PURE__ */ jsxs("text", {
						x: cw / 2,
						y: "-8",
						textAnchor: "middle",
						fontSize: "11.5",
						className: "mono",
						fill: "var(--text-3)",
						children: [
							"f[",
							c.i,
							"]"
						]
					}),
					/* @__PURE__ */ jsx("rect", {
						width: cw,
						height: "46",
						rx: "10",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: cw / 2,
						y: "30",
						textAnchor: "middle",
						fontSize: "17",
						className: "mono",
						fill: "var(--text-1)",
						children: c.v
					})
				]
			}, i)),
			[
				0,
				1,
				2,
				3
			].map((i) => /* @__PURE__ */ jsx("path", {
				d: `M ${x0 + i * dx + cw / 2} 40 Q ${x0 + i * dx + dx} 14 ${x0 + (i + 2) * dx + cw / 2} 40`,
				fill: "none",
				stroke: "var(--accent-2)",
				strokeWidth: "1.6",
				markerEnd: "url(#mp-re)",
				opacity: "0.85"
			}, `a${i}`)),
			/* @__PURE__ */ jsx("text", {
				x: 460,
				y: "76",
				fontSize: "20",
				className: "mono",
				fill: "var(--text-3)",
				children: "· · ·"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: `translate(508,46)`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "120",
						height: "46",
						rx: "10",
						fill: "color-mix(in srgb, var(--viz-invalid) 14%, var(--surface-3))",
						stroke: "var(--viz-invalid)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "60",
						y: "20",
						textAnchor: "middle",
						fontSize: "12",
						className: "mono",
						fill: "var(--viz-invalid)",
						children: "f[n]"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "60",
						y: "36",
						textAnchor: "middle",
						fontSize: "11",
						fill: "var(--viz-invalid)",
						children: "n ≈ 2⁶³"
					})
				]
			}),
			/* @__PURE__ */ jsxs("text", {
				x: "320",
				y: "146",
				textAnchor: "middle",
				fontSize: "13",
				fill: "var(--text-2)",
				children: [
					"逐项递推要走 ",
					/* @__PURE__ */ jsx("tspan", {
						className: "mono",
						fill: "var(--viz-invalid)",
						children: "n"
					}),
					" 步——n 达 2⁶³ 时 O(n) 必然超时"
				]
			})
		]
	});
}
function VecMatFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 210",
		role: "img",
		"aria-label": "状态向量乘以转移矩阵得到下一状态向量",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "mp-vm",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--accent-1)"
				})
			}) }),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(24,58)",
				children: [
					/* @__PURE__ */ jsx("text", {
						x: "76",
						y: "-14",
						textAnchor: "middle",
						fontSize: "11.5",
						fill: "var(--text-3)",
						children: "旧状态（行向量）"
					}),
					/* @__PURE__ */ jsx("rect", {
						width: "152",
						height: "42",
						rx: "10",
						fill: "var(--surface-3)",
						stroke: "var(--viz-source)",
						strokeWidth: "1.6"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "76",
						y: "27",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "[ F(n−1)  F(n−2) ]"
					})
				]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "192",
				y: "86",
				fontSize: "20",
				className: "mono",
				fill: "var(--text-3)",
				children: "×"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(214,40)",
				children: [
					/* @__PURE__ */ jsx("text", {
						x: "60",
						y: "-4",
						textAnchor: "middle",
						fontSize: "11.5",
						fill: "var(--text-3)",
						children: "转移矩阵 M"
					}),
					/* @__PURE__ */ jsx("rect", {
						width: "120",
						height: "78",
						rx: "10",
						fill: "color-mix(in srgb, var(--accent-1) 10%, var(--surface-3))",
						stroke: "var(--accent-2)",
						strokeWidth: "1.8"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "42",
						y: "34",
						textAnchor: "middle",
						fontSize: "16",
						className: "mono",
						fill: "var(--text-1)",
						children: "1"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "80",
						y: "34",
						textAnchor: "middle",
						fontSize: "16",
						className: "mono",
						fill: "var(--text-1)",
						children: "1"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "42",
						y: "62",
						textAnchor: "middle",
						fontSize: "16",
						className: "mono",
						fill: "var(--text-1)",
						children: "1"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "80",
						y: "62",
						textAnchor: "middle",
						fontSize: "16",
						className: "mono",
						fill: "var(--text-1)",
						children: "0"
					})
				]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "352",
				y: "86",
				fontSize: "20",
				className: "mono",
				fill: "var(--text-3)",
				children: "="
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(378,58)",
				children: [
					/* @__PURE__ */ jsx("text", {
						x: "76",
						y: "-14",
						textAnchor: "middle",
						fontSize: "11.5",
						fill: "var(--text-3)",
						children: "新状态"
					}),
					/* @__PURE__ */ jsx("rect", {
						width: "152",
						height: "42",
						rx: "10",
						fill: "color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))",
						stroke: "var(--accent-2)",
						strokeWidth: "1.8"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "76",
						y: "27",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "[ F(n)  F(n−1) ]"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M100 130 Q 260 168 300 132",
				fill: "none",
				stroke: "var(--accent-1)",
				strokeWidth: "1.5",
				markerEnd: "url(#mp-vm)",
				opacity: "0.8"
			}),
			/* @__PURE__ */ jsxs("text", {
				x: "320",
				y: "176",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: [
					"第一列做 ",
					/* @__PURE__ */ jsx("tspan", {
						className: "mono",
						children: "F(n−1)+F(n−2)=F(n)"
					}),
					"；第二列把 F(n−1) 原样移下来"
				]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "320",
				y: "196",
				textAnchor: "middle",
				fontSize: "12",
				fill: "var(--text-3)",
				children: "一次乘法 = 递推走一步；乘 M 的 n 次方 = 一步跨过 n 项"
			})
		]
	});
}
function FastPowFigure() {
	const powers = [
		"M",
		"M²",
		"M⁴",
		"M⁸"
	];
	const bits = [
		1,
		0,
		1,
		1
	];
	const x0 = 40;
	const dx = 130;
	const bw = 96;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 218",
		role: "img",
		"aria-label": "矩阵快速幂：倍增平方序列按二进制位选取相乘",
		children: [
			/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsx("marker", {
				id: "mp-sq",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--viz-source)"
				})
			}), /* @__PURE__ */ jsx("marker", {
				id: "mp-pk",
				markerWidth: "8",
				markerHeight: "8",
				refX: "6",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--accent-1)"
				})
			})] }),
			/* @__PURE__ */ jsxs("text", {
				x: "24",
				y: "20",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: [
					"n = 13 = ",
					/* @__PURE__ */ jsx("tspan", {
						className: "mono",
						fill: "var(--accent-1)",
						children: "1101"
					}),
					"₂ → 平方倍增，再挑「位为 1」的幂相乘"
				]
			}),
			powers.map((p, i) => {
				const on = bits[i] === 1;
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x0 + i * dx},44)`,
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: bw,
							height: "46",
							rx: "11",
							fill: on ? "color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))" : "var(--surface-3)",
							stroke: on ? "var(--accent-2)" : "var(--viz-source)",
							strokeWidth: "1.8"
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "29",
							textAnchor: "middle",
							fontSize: "17",
							className: "mono",
							fill: "var(--text-1)",
							children: p
						}),
						/* @__PURE__ */ jsxs("g", {
							transform: `translate(${bw / 2 - 20},58)`,
							children: [/* @__PURE__ */ jsx("rect", {
								width: "40",
								height: "20",
								rx: "10",
								fill: on ? "color-mix(in srgb, var(--accent-1) 60%, var(--surface-1))" : "var(--surface-2)",
								stroke: on ? "var(--accent-2)" : "var(--border-strong)",
								strokeWidth: "1"
							}), /* @__PURE__ */ jsxs("text", {
								x: "20",
								y: "14",
								textAnchor: "middle",
								fontSize: "11",
								className: "mono",
								fill: on ? "var(--text-on-accent)" : "var(--text-3)",
								children: [
									"位",
									i,
									"=",
									bits[i]
								]
							})]
						})
					]
				}, i);
			}),
			[
				0,
				1,
				2
			].map((i) => /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("path", {
				d: `M ${x0 + i * dx + bw} 67 H ${x0 + (i + 1) * dx - 2}`,
				stroke: "var(--viz-source)",
				strokeWidth: "1.8",
				markerEnd: "url(#mp-sq)",
				fill: "none"
			}), /* @__PURE__ */ jsx("text", {
				x: x0 + i * dx + bw + (dx - bw) / 2,
				y: "60",
				textAnchor: "middle",
				fontSize: "12",
				className: "mono",
				fill: "var(--viz-source)",
				children: "²"
			})] }, `s${i}`)),
			powers.map((_, i) => bits[i] === 1 ? /* @__PURE__ */ jsx("path", {
				d: `M ${x0 + i * dx + bw / 2} 102 L 320 158`,
				stroke: "var(--accent-1)",
				strokeWidth: "1.6",
				markerEnd: "url(#mp-pk)",
				fill: "none",
				opacity: "0.8"
			}, `p${i}`) : null),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(214,160)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "212",
					height: "46",
					rx: "12",
					fill: "color-mix(in srgb, var(--accent-1) 18%, var(--surface-3))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.8"
				}), /* @__PURE__ */ jsx("text", {
					x: "106",
					y: "29",
					textAnchor: "middle",
					fontSize: "15",
					className: "mono",
					fill: "var(--text-1)",
					children: "M⁸ · M⁴ · M¹ = M¹³"
				})]
			})
		]
	});
}
function BuildRowsFigure() {
	const rows = [
		{
			cells: [
				1,
				0,
				1
			],
			kind: "coef",
			out: "a[x]",
			note: "递推系数：1·a[x-1] + 0·a[x-2] + 1·a[x-3]"
		},
		{
			cells: [
				1,
				0,
				0
			],
			kind: "shift",
			out: "a[x-1]",
			note: "位移：搬来旧的 a[x-1]"
		},
		{
			cells: [
				0,
				1,
				0
			],
			kind: "shift",
			out: "a[x-2]",
			note: "位移：搬来旧的 a[x-2]"
		}
	];
	const gy = (r) => 30 + r * 44;
	const gx0 = 214;
	const cw = 40;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 200",
		role: "img",
		"aria-label": "从 a[x]=a[x-1]+a[x-3] 构造 3x3 转移矩阵",
		children: [
			/* @__PURE__ */ jsxs("text", {
				x: "24",
				y: "20",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: [/* @__PURE__ */ jsx("tspan", {
					className: "mono",
					fill: "var(--accent-1)",
					children: "a[x] = a[x-1] + a[x-3]"
				}), " → 状态 3 维 → 3×3 矩阵，逐行填"]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(28,30)",
				children: [/* @__PURE__ */ jsx("text", {
					x: "52",
					y: "-2",
					textAnchor: "middle",
					fontSize: "10.5",
					fill: "var(--text-3)",
					children: "旧状态"
				}), [
					"a[x-1]",
					"a[x-2]",
					"a[x-3]"
				].map((l, i) => /* @__PURE__ */ jsxs("g", {
					transform: `translate(0,${i * 44})`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: "104",
						height: "34",
						rx: "8",
						fill: "var(--surface-3)",
						stroke: "var(--viz-source)",
						strokeWidth: "1.3"
					}), /* @__PURE__ */ jsx("text", {
						x: "52",
						y: "22",
						textAnchor: "middle",
						fontSize: "12.5",
						className: "mono",
						fill: "var(--text-2)",
						children: l
					})]
				}, i))]
			}),
			rows.map((row, ri) => {
				const isCoef = row.kind === "coef";
				return /* @__PURE__ */ jsxs("g", { children: [
					row.cells.map((v, ci) => {
						const src = v !== 0;
						return /* @__PURE__ */ jsxs("g", {
							transform: `translate(${gx0 + ci * 44},${gy(ri)})`,
							children: [/* @__PURE__ */ jsx("rect", {
								width: cw,
								height: "34",
								rx: "7",
								fill: src && isCoef ? "color-mix(in srgb, var(--accent-1) 70%, var(--surface-1))" : src ? "color-mix(in srgb, var(--accent-1) 16%, var(--viz-cell))" : "var(--viz-cell)",
								stroke: isCoef && src ? "var(--accent-2)" : "var(--border-strong)",
								strokeWidth: "1.2"
							}), /* @__PURE__ */ jsx("text", {
								x: cw / 2,
								y: "22",
								textAnchor: "middle",
								fontSize: "15",
								className: "mono",
								fill: src && isCoef ? "var(--text-on-accent)" : src ? "var(--text-1)" : "var(--text-3)",
								children: v
							})]
						}, ci);
					}),
					/* @__PURE__ */ jsxs("text", {
						x: 360,
						y: gy(ri) + 15,
						fontSize: "12.5",
						className: "mono",
						fill: isCoef ? "var(--accent-1)" : "var(--text-2)",
						children: ["→ ", row.out]
					}),
					/* @__PURE__ */ jsx("text", {
						x: 360,
						y: gy(ri) + 30,
						fontSize: "10.5",
						fill: "var(--text-3)",
						children: row.note
					})
				] }, ri);
			})
		]
	});
}
//#endregion
//#region src/content/d/MatrixPower.tsx
var preMono = {
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
};
var CODE_P1962 = `
#include <iostream>
using namespace std;

typedef long long ll;
const ll MOD = 1000000007;

// 2×2 矩阵，封装乘法（每步取模，防溢出）。斐波那契转移 M = {{1,1},{1,0}}。
struct Mat
{
    ll a[2][2];
};

Mat mul(const Mat &x, const Mat &y)     // 矩阵乘法：C[i][j] = Σ x[i][k]·y[k][j]
{
    Mat c;
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++)
        {
            ll s = 0;
            for (int k = 0; k < 2; k++)
            {
                s = (s + x.a[i][k] * y.a[k][j]) % MOD; // ★显式 long long + 逐步取模
            }
            c.a[i][j] = s;
        }
    return c;
}

Mat power(Mat base, ll n)               // 矩阵快速幂：base^n
{
    Mat res = {{{1, 0}, {0, 1}}};       // 单位阵起步
    while (n > 0)
    {
        if (n & 1)                      // 当前二进制位为 1 → 累乘
        {
            res = mul(res, base);
        }
        base = mul(base, base);         // 平方倍增
        n >>= 1;
    }
    return res;
}

int main()
{
    ll n;
    cin >> n;
    Mat M = {{{1, 1}, {1, 0}}};
    Mat r = power(M, n - 1);            // F(n) = (M^{n-1})[0][0]，F(1)=F(2)=1
    cout << r.a[0][0] << endl;
    return 0;
}
// TAG: 矩阵DP 矩阵快速幂 斐波那契 取模`;
var CODE_P3390 = `
#include <iostream>
using namespace std;

typedef long long ll;
const ll MOD = 1000000007;

int n;                                   // 矩阵阶数（n×n）

struct Mat
{
    ll a[105][105];
};

Mat mul(const Mat &x, const Mat &y)      // 通用 n×n 矩阵乘法，O(n³)
{
    Mat c;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
        {
            ll s = 0;
            for (int k = 1; k <= n; k++)
            {
                s = (s + x.a[i][k] * y.a[k][j]) % MOD;
            }
            c.a[i][j] = s;
        }
    return c;
}

int main()
{
    ll k;
    cin >> n >> k;

    Mat A, res;
    for (int i = 1; i <= n; i++)         // 读入待幂的矩阵
        for (int j = 1; j <= n; j++)
        {
            cin >> A.a[i][j];
        }
    for (int i = 1; i <= n; i++)         // res 初始化为单位阵
        for (int j = 1; j <= n; j++)
        {
            res.a[i][j] = (i == j) ? 1 : 0;
        }

    while (k > 0)                        // 快速幂：A^k
    {
        if (k & 1)
        {
            res = mul(res, A);
        }
        A = mul(A, A);
        k >>= 1;
    }

    for (int i = 1; i <= n; i++)         // 输出结果矩阵
    {
        for (int j = 1; j <= n; j++)
        {
            cout << res.a[i][j] << " \\n"[j == n];
        }
    }
    return 0;
}
// TAG: 矩阵DP 矩阵快速幂 模板`;
var CODE_P1939 = `
#include <iostream>
#include <cstring>
using namespace std;

typedef long long ll;
const ll MOD = 1000000007;               // 本题模 1e9+7

// a[x] = a[x-1] + a[x-3]，a[1]=a[2]=a[3]=1。
// 状态向量 (a[x-1], a[x-2], a[x-3]) → 转移矩阵 {{1,0,1},{1,0,0},{0,1,0}}。
struct Mat
{
    ll a[3][3];
};

Mat mul(const Mat &x, const Mat &y)
{
    Mat c;
    memset(c.a, 0, sizeof(c.a));
    for (int i = 0; i < 3; i++)
        for (int k = 0; k < 3; k++)
        {
            if (x.a[i][k] == 0) continue;   // 稀疏小优化，可省
            for (int j = 0; j < 3; j++)
            {
                c.a[i][j] = (c.a[i][j] + x.a[i][k] * y.a[k][j]) % MOD;
            }
        }
    return c;
}

Mat power(Mat base, ll n)
{
    Mat res;
    memset(res.a, 0, sizeof(res.a));
    for (int i = 0; i < 3; i++) res.a[i][i] = 1;  // 单位阵
    while (n > 0)
    {
        if (n & 1) res = mul(res, base);
        base = mul(base, base);
        n >>= 1;
    }
    return res;
}

int main()
{
    int T;
    cin >> T;
    Mat M = {{{1, 0, 1}, {1, 0, 0}, {0, 1, 0}}};
    while (T--)
    {
        ll n;
        cin >> n;
        if (n <= 3)                       // 前三项直接答 1
        {
            cout << 1 << endl;
            continue;
        }
        Mat r = power(M, n - 3);          // 从 (a3,a2,a1) 推到第 n 项
        // 结果向量第 0 分量 = a[n] = r 作用在初始向量 (1,1,1) 上的首行之和
        ll ans = (r.a[0][0] + r.a[0][1] + r.a[0][2]) % MOD;
        cout << ans << endl;
    }
    return 0;
}
// TAG: 矩阵DP 矩阵加速 自构转移矩阵 取模`;
function MatrixPower() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "当递推项数大到没法一格一格填"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"回到最朴素的斐波那契：",
						/* @__PURE__ */ jsx(M, { children: "f[i]=f[i-1]+f[i-2]" }),
						"，从 ",
						/* @__PURE__ */ jsx(M, { children: "f[1]=f[2]=1" }),
						" 起逐项往上加。 只要 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 不大，一个 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						" 的循环就够——这正是 ",
						/* @__PURE__ */ jsx(Link, {
							to: "/part/b/count",
							style: { color: "var(--accent-2)" },
							children: "B 部分计数 DP"
						}),
						" 里数楼梯那一套。 可一旦题目把 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 抬到 ",
						/* @__PURE__ */ jsx(M, { children: "n<2^{63}" }),
						"（例题 P1962 就是），逐项递推要走近 ",
						/* @__PURE__ */ jsx("strong", { children: "九百亿亿" }),
						" 步，任何机器都算不完。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(RecurExplodeFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "逐项递推每次只前进一格，要走 n 步才到 f[n]；n 达 2⁶³ 时 O(n) 彻底超时，逐格填表的思路在这里失效。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"瓶颈很清楚：递推",
						/* @__PURE__ */ jsx("strong", { children: "一步只跨一项" }),
						"，代价被死死锁在 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						"。要提速，就得想办法",
						/* @__PURE__ */ jsx("strong", { children: "一次跨过很多项" }),
						"。 突破口在于——斐波那契这类递推是",
						/* @__PURE__ */ jsx("strong", { children: "线性" }),
						"的（新项是旧几项的线性组合，没有平方、没有取最值）。",
						/* @__PURE__ */ jsx("strong", { children: "线性变换恰好可以写成矩阵乘法" }),
						"，而「重复施加同一个线性变换 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 次」就是求矩阵的 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 次幂—— 幂运算有",
						/* @__PURE__ */ jsx("strong", { children: "快速幂" }),
						"（二进制倍增），能把 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 次压成 ",
						/* @__PURE__ */ jsx(M, { children: "\\log n" }),
						" 次。这一节就把这条「递推 → 矩阵 → 快速幂」的加速链讲透。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "把递推写成矩阵乘法"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"关键一步：",
						/* @__PURE__ */ jsx("strong", { children: "把「当前需要记住的几项」打包成一个状态向量" }),
						"。斐波那契的新项只用到前两项，于是取行向量 ",
						/* @__PURE__ */ jsx(M, { children: "[\\,F(n-1),\\ F(n-2)\\,]" }),
						" 作状态。 我们要找一个",
						/* @__PURE__ */ jsx("strong", { children: "固定的" }),
						"矩阵 ",
						/* @__PURE__ */ jsx(M, { children: "M" }),
						"，让它右乘这个向量后，正好",
						/* @__PURE__ */ jsx("strong", { children: "整体前移一步" }),
						"，得到 ",
						/* @__PURE__ */ jsx(M, { children: "[\\,F(n),\\ F(n-1)\\,]" }),
						"："
					] }), /* @__PURE__ */ jsx(MB, { children: "[\\,F(n),\\ F(n-1)\\,]=[\\,F(n-1),\\ F(n-2)\\,]\\cdot M" })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(VecMatFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "状态向量右乘转移矩阵 M=[[1,1],[1,0]]：结果第一列算出 F(n-1)+F(n-2)=F(n)，第二列把 F(n-1) 原样移下——一次乘法 = 递推走一步。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"怎么定出 ",
							/* @__PURE__ */ jsx(M, { children: "M" }),
							" 的每个数？逐个输出分量看它由旧分量",
							/* @__PURE__ */ jsx("strong", { children: "怎样线性组合" }),
							"：新向量第一个分量要等于 ",
							/* @__PURE__ */ jsx(M, { children: "F(n)=F(n-1)+F(n-2)" }),
							"， 即旧的两个分量",
							/* @__PURE__ */ jsx("strong", { children: "各取一份" }),
							"相加 → 对应 ",
							/* @__PURE__ */ jsx(M, { children: "M" }),
							" 的第一列是 ",
							/* @__PURE__ */ jsx(M, { children: "\\binom{1}{1}" }),
							"；新向量第二个分量要等于 ",
							/* @__PURE__ */ jsx(M, { children: "F(n-1)" }),
							"， 即只取旧的第一个分量 → 第二列是 ",
							/* @__PURE__ */ jsx(M, { children: "\\binom{1}{0}" }),
							"。合起来："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "M=\\begin{bmatrix}1 & 1\\\\ 1 & 0\\end{bmatrix}" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"于是从初始向量 ",
							/* @__PURE__ */ jsx(M, { children: "[\\,F(2),F(1)\\,]=[\\,1,1\\,]" }),
							" 出发，",
							/* @__PURE__ */ jsxs("strong", { children: [
								"右乘一次 ",
								/* @__PURE__ */ jsx(M, { children: "M" }),
								" 前进一项"
							] }),
							"，乘 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							" 次就前进 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							" 项。 把 ",
							/* @__PURE__ */ jsx(M, { children: "k" }),
							" 次乘法凑成一个整体，就是 ",
							/* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsx(M, { children: "M^{k}" }) }),
							"——「跨过一大段递推」被压缩成「求一个矩阵的高次幂」。可以验证 ",
							/* @__PURE__ */ jsx(M, { children: "M^{n-1}" }),
							" 的左上角恰是 ",
							/* @__PURE__ */ jsx(M, { children: "F(n)" }),
							"。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质 · 递推 ↔ 矩阵，一次乘法 = 一步递推",
					children: [
						/* @__PURE__ */ jsx("strong", { children: "线性递推" }),
						"与",
						/* @__PURE__ */ jsx("strong", { children: "矩阵乘法" }),
						"是同一件事的两种写法：把「本步要用到的历史项」摆成状态向量，转移的每个系数就落进矩阵的一列；",
						/* @__PURE__ */ jsxs("strong", { children: [
							"右乘一次 ",
							/* @__PURE__ */ jsx(M, { children: "M" }),
							" = 递推推进一步"
						] }),
						"，",
						/* @__PURE__ */ jsxs("strong", { children: [
							"右乘 ",
							/* @__PURE__ */ jsx(M, { children: "M^{n}" }),
							" = 一口气推进 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 步"
						] }),
						"。 原本 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						" 的逐项递推，就此转化为「求矩阵幂 ",
						/* @__PURE__ */ jsx(M, { children: "M^{n}" }),
						"」这个能被快速幂加速的问题。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "快速幂：把 Mⁿ 的 n 次拆成 log n 层"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"剩下的问题是",
							/* @__PURE__ */ jsxs("strong", { children: ["怎样快速求 ", /* @__PURE__ */ jsx(M, { children: "M^{n}" })] }),
							"。若老老实实 ",
							/* @__PURE__ */ jsx(M, { children: "M\\cdot M\\cdot M\\cdots" }),
							" 连乘，还是 ",
							/* @__PURE__ */ jsx(M, { children: "n-1" }),
							" 次矩阵乘法，白忙一场。",
							/* @__PURE__ */ jsx("strong", { children: "快速幂" }),
							"（二进制倍增）的思路：把指数 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 写成",
							/* @__PURE__ */ jsx("strong", { children: "二进制" }),
							"，例如 ",
							/* @__PURE__ */ jsx(M, { children: "13=1101_2=8+4+1" }),
							"，于是"
						] }),
						/* @__PURE__ */ jsx(MB, { children: "M^{13}=M^{8}\\cdot M^{4}\\cdot M^{1}" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"而 ",
							/* @__PURE__ */ jsx(M, { children: "M^{1},M^{2},M^{4},M^{8},\\dots" }),
							" 这串",
							/* @__PURE__ */ jsx("strong", { children: "倍增幂" }),
							"，每个都是前一个",
							/* @__PURE__ */ jsx("strong", { children: "平方" }),
							"得来（",
							/* @__PURE__ */ jsx(M, { children: "M^{2k}=(M^{k})^{2}" }),
							"），只需 ",
							/* @__PURE__ */ jsx(M, { children: "\\log n" }),
							" 次平方就能全部算出。 再按 ",
							/* @__PURE__ */ jsx(M, { children: "n" }),
							" 的二进制里",
							/* @__PURE__ */ jsx("strong", { children: "哪几位是 1" }),
							"，把对应的倍增幂",
							/* @__PURE__ */ jsx("strong", { children: "累乘" }),
							"进结果即可。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(FastPowFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "n=13=1101₂：上排 M,M²,M⁴,M⁸ 靠平方逐个倍增；n 的二进制里为 1 的位（第 0、2、3 位）对应的幂被挑出，相乘得到 M¹³。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						"总代价：",
						/* @__PURE__ */ jsx(M, { children: "\\log n" }),
						" 次平方 + 至多 ",
						/* @__PURE__ */ jsx(M, { children: "\\log n" }),
						" 次累乘，共约 ",
						/* @__PURE__ */ jsx(M, { children: "2\\log n" }),
						" 次",
						/* @__PURE__ */ jsx("strong", { children: "矩阵乘法" }),
						"；每次矩阵乘法是 ",
						/* @__PURE__ */ jsx(M, { children: "O(k^{3})" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "k" }),
						" 为矩阵阶数）。 合起来 ",
						/* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsx(M, { children: "O(k^{3}\\log n)" }) }),
						"。斐波那契 ",
						/* @__PURE__ */ jsx(M, { children: "k=2" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "n=2^{63}" }),
						" 时也不过约 ",
						/* @__PURE__ */ jsx(M, { children: "63" }),
						" 层倍增、百余次 ",
						/* @__PURE__ */ jsx(M, { children: "2\\times2" }),
						" 乘法，瞬间出解。把这套骨架写成中文伪代码："
					] }), /* @__PURE__ */ jsx("pre", {
						className: "mono",
						style: preMono,
						children: `# 矩阵快速幂：求 base^n（base 是 k×k 矩阵）
res = 单位阵 I                 # 任何矩阵乘 I 不变，作累乘的起点
while n > 0:
    if n & 1 == 1:            # 当前二进制最低位为 1
        res = res × base      # ★把这一位对应的倍增幂累乘进结果
    base = base × base        # 平方 → 得到下一个倍增幂 M^(2^k)
    n >>= 1                   # 右移一位，看下一位
return res                    # 循环 ⌊log₂ n⌋+1 次，每次一到两回矩阵乘法`
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 写成二进制，",
						/* @__PURE__ */ jsx("strong", { children: "逐位" }),
						"展示 ",
						/* @__PURE__ */ jsx(M, { children: "M,M^2,M^4,\\dots" }),
						" 的平方倍增，并把「位为 1」的幂累乘成 ",
						/* @__PURE__ */ jsx(M, { children: "M^{n}" }),
						"。改指数 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						"，看矩阵数值、当前操作与步数对比实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看 Mⁿ 在倍增里累乘出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(MatrixPowerDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化 · 非标准递推：怎么构造转移矩阵"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"斐波那契的 ",
							/* @__PURE__ */ jsx(M, { children: "M" }),
							" 太经典，容易让人以为矩阵是「背下来」的。真正的功夫在于",
							/* @__PURE__ */ jsx("strong", { children: "面对一个陌生递推，自己把矩阵拼出来" }),
							"。 来看一个非标准递推（正是例题 P1939 的模型）：",
							/* @__PURE__ */ jsx(M, { children: "a[x]=a[x-1]+a[x-3]" }),
							"——新项跳过了 ",
							/* @__PURE__ */ jsx(M, { children: "a[x-2]" }),
							"，只由 ",
							/* @__PURE__ */ jsx(M, { children: "a[x-1]" }),
							" 和 ",
							/* @__PURE__ */ jsx(M, { children: "a[x-3]" }),
							" 决定。"
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "第一步，定状态向量。" }),
							"新项用到往前",
							/* @__PURE__ */ jsx("strong", { children: "三项" }),
							"（最远到 ",
							/* @__PURE__ */ jsx(M, { children: "a[x-3]" }),
							"），所以状态要装下最近三项：",
							/* @__PURE__ */ jsx(M, { children: "[\\,a[x-1],\\ a[x-2],\\ a[x-3]\\,]" }),
							"，是 ",
							/* @__PURE__ */ jsx("strong", { children: "3 维" }),
							"向量，矩阵就是 ",
							/* @__PURE__ */ jsx(M, { children: "3\\times3" }),
							"。 推进一步后，新状态应当是 ",
							/* @__PURE__ */ jsx(M, { children: "[\\,a[x],\\ a[x-1],\\ a[x-2]\\,]" }),
							"。"
						] }),
						/* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: "第二步，逐行确定系数——盯住新状态的每个分量由旧分量怎样组合：" }) }),
						/* @__PURE__ */ jsx(MB, { children: "M=\\begin{bmatrix}1 & 0 & 1\\\\ 1 & 0 & 0\\\\ 0 & 1 & 0\\end{bmatrix}" })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(BuildRowsFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "a[x]=a[x-1]+a[x-3] 的 3×3 转移矩阵：首行是递推系数 [1,0,1]（真正做加法的一行）；其余两行是「位移行」，把旧的 a[x-1]、a[x-2] 原样搬下来，各只有一个 1。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"读这三行——",
						/* @__PURE__ */ jsxs("strong", { children: [
							"第一行（算 ",
							/* @__PURE__ */ jsx(M, { children: "a[x]" }),
							"）"
						] }),
						"：",
						/* @__PURE__ */ jsx(M, { children: "a[x]=1\\cdot a[x-1]+0\\cdot a[x-2]+1\\cdot a[x-3]" }),
						"，系数就是递推式里的系数，写成 ",
						/* @__PURE__ */ jsx(M, { children: "[\\,1,0,1\\,]" }),
						"——",
						/* @__PURE__ */ jsx("strong", { children: "这是唯一「真正做递推加法」的一行" }),
						"。",
						/* @__PURE__ */ jsxs("strong", { children: [
							"第二行（算 ",
							/* @__PURE__ */ jsx(M, { children: "a[x-1]" }),
							"）"
						] }),
						"：新状态里的 ",
						/* @__PURE__ */ jsx(M, { children: "a[x-1]" }),
						" 不过是旧状态里现成的 ",
						/* @__PURE__ */ jsx(M, { children: "a[x-1]" }),
						"，原样搬过来 → ",
						/* @__PURE__ */ jsx(M, { children: "[\\,1,0,0\\,]" }),
						"。",
						/* @__PURE__ */ jsxs("strong", { children: [
							"第三行（算 ",
							/* @__PURE__ */ jsx(M, { children: "a[x-2]" }),
							"）"
						] }),
						"：同理搬旧的 ",
						/* @__PURE__ */ jsx(M, { children: "a[x-2]" }),
						" → ",
						/* @__PURE__ */ jsx(M, { children: "[\\,0,1,0\\,]" }),
						"。 后两行统称",
						/* @__PURE__ */ jsx("strong", { children: "位移行" }),
						"，作用只是把向量整体「下移一格」，好腾出位置给新项——它们对任何这类递推都长得差不多，套路固定。"
					] })
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "构造要诀 · 一行递推系数，其余全是位移",
					children: [
						"面对形如 ",
						/* @__PURE__ */ jsx(M, { children: "a[x]=\\sum_{t\\ge1} c_t\\,a[x-t]" }),
						" 的",
						/* @__PURE__ */ jsx("strong", { children: "常系数线性递推" }),
						"：状态向量取",
						/* @__PURE__ */ jsx("strong", { children: "最近的若干项" }),
						"（维数 = 递推用到的最远回溯步数）； 转移矩阵",
						/* @__PURE__ */ jsx("strong", { children: "第一行" }),
						"直接填递推系数 ",
						/* @__PURE__ */ jsx(M, { children: "[\\,c_1,c_2,\\dots\\,]" }),
						"，",
						/* @__PURE__ */ jsx("strong", { children: "其余每一行" }),
						"是把旧分量原样下移的",
						/* @__PURE__ */ jsx("strong", { children: "位移行" }),
						"（一个 1，其余 0）。 矩阵一旦搭好，求第 ",
						/* @__PURE__ */ jsx(M, { children: "x" }),
						" 项就是算 ",
						/* @__PURE__ */ jsx(M, { children: "M^{x}" }),
						" 乘初始向量，复杂度 ",
						/* @__PURE__ */ jsx(M, { children: "O(k^{3}\\log x)" }),
						"——",
						/* @__PURE__ */ jsx("strong", { children: "递推越是「奇形怪状」，这套矩阵化越显威力" }),
						"。"
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示给你两个递推预设，把状态向量、转移矩阵、输出向量",
						/* @__PURE__ */ jsx("strong", { children: "并排" }),
						"摆好；点矩阵任意一行，它会点亮对应的输出分量并讲清",
						/* @__PURE__ */ jsx("strong", { children: "这一行系数从哪来" }),
						"。切换预设，看维数与矩阵一起变。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看转移矩阵怎么从递推拼出来"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(MatrixBuildDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "例题"
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1962",
					name: "斐波那契数列",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"求斐波那契数列第 ",
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 项对 ",
								/* @__PURE__ */ jsx(M, { children: "10^9+7" }),
								" 取模的值，",
								/* @__PURE__ */ jsx(M, { children: "F(1)=F(2)=1" }),
								"，",
								/* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsx(M, { children: "n<2^{63}" }) }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								/* @__PURE__ */ jsx(M, { children: "n" }),
								" 大到 ",
								/* @__PURE__ */ jsx(M, { children: "2^{63}" }),
								"，逐项递推的 ",
								/* @__PURE__ */ jsx(M, { children: "O(n)" }),
								" 无论如何都超时——",
								/* @__PURE__ */ jsx("strong", { children: "逼你把递推矩阵化再快速幂" }),
								"。是「递推 → 矩阵快速幂」这条加速链最干净的入门题，一切从这个 ",
								/* @__PURE__ */ jsx(M, { children: "2\\times2" }),
								" 的 ",
								/* @__PURE__ */ jsx(M, { children: "M" }),
								" 开始。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "M=[[1,1],[1,0]]" }),
								"，答案取 ",
								/* @__PURE__ */ jsx(M, { children: "(M^{n-1})[0][0]" }),
								"；每次矩阵乘法 ",
								/* @__PURE__ */ jsx(M, { children: "O(2^{3})" }),
								"，快速幂 ",
								/* @__PURE__ */ jsx(M, { children: "O(\\log n)" }),
								" 层，总 ",
								/* @__PURE__ */ jsx(M, { children: "O(8\\log n)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（2×2 矩阵快速幂）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1962,
								luogu: "P1962"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P3390",
					name: "【模板】矩阵快速幂",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给定 ",
								/* @__PURE__ */ jsx(M, { children: "n\\times n" }),
								" 矩阵 ",
								/* @__PURE__ */ jsx(M, { children: "A" }),
								" 与指数 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								"，求 ",
								/* @__PURE__ */ jsx(M, { children: "A^{k}" }),
								" 的每个元素对 ",
								/* @__PURE__ */ jsx(M, { children: "10^9+7" }),
								" 取模。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"把「",
								/* @__PURE__ */ jsx("strong", { children: "矩阵乘法 + 快速幂" }),
								"」这副骨架单独拎出来夯实——没有递推包装，纯粹练 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
								" 通用矩阵乘法和二进制倍增的写法。写熟了它，所有矩阵加速题的底座就通了。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"单位阵起步，",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 按二进制逐位：为 1 则累乘、每步平方；矩阵乘法 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
								"，共 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^{3}\\log k)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（通用 n×n 快速幂）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P3390,
								luogu: "P3390"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P1939",
					name: "【模板】矩阵加速（数列）",
					src: "洛谷原生",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"数列 ",
								/* @__PURE__ */ jsx(M, { children: "a[1]=a[2]=a[3]=1" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "a[x]=a[x-1]+a[x-3]" }),
								"（",
								/* @__PURE__ */ jsx(M, { children: "x\\ge4" }),
								"），",
								/* @__PURE__ */ jsx(M, { children: "T" }),
								" 组询问，每组求 ",
								/* @__PURE__ */ jsx(M, { children: "a[n]\\bmod (10^9+7)" }),
								"，",
								/* @__PURE__ */ jsx(M, { children: "n\\le 2\\times10^{9}" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"典型的",
								/* @__PURE__ */ jsx("strong", { children: "非标准递推自构转移矩阵" }),
								"：跳项的 ",
								/* @__PURE__ */ jsx(M, { children: "a[x]=a[x-1]+a[x-3]" }),
								" 逼你亲手推出 ",
								/* @__PURE__ */ jsx(M, { children: "3\\times3" }),
								" 的 ",
								/* @__PURE__ */ jsx(M, { children: "M=[[1,0,1],[1,0,0],[0,1,0]]" }),
								"（一行系数 + 两行位移），正是本页深化演示所讲。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"状态 ",
								/* @__PURE__ */ jsx(M, { children: "[a[x-1],a[x-2],a[x-3]]" }),
								"，求 ",
								/* @__PURE__ */ jsx(M, { children: "M^{n-3}" }),
								" 作用于初始向量；单组 ",
								/* @__PURE__ */ jsx(M, { children: "O(3^{3}\\log n)" }),
								"，多组累加。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（3×3 自构矩阵）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1939,
								luogu: "P1939"
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
					pid: "P2233",
					name: "[HNOI2002] 公交车路线",
					hint: "8 个站点排成环 = 邻接矩阵 A（相邻两站连边）。定长路径计数：A^k 的第 (i,j) 项 = 从 i 走恰好 k 步到 j 的方案数。用矩阵快速幂求 A^n，读出起点到终点的方案数（注意不能提前到终点，需按题意处理）。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P4159",
					name: "[SCOI2009] 迷路",
					hint: "带边权（1~9）的定长路径计数。把每条权为 w 的边拆成 w 段、中间加虚拟点，化为 0/1 邻接矩阵（规模 9n×9n），再对邻接矩阵做矩阵快速幂求 T 时刻从起点到终点的方案数 mod 2009。拆点是关键技巧。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P1707",
					name: "刷题比赛",
					hint: "多条数列相互耦合的递推。把所有相关量塞进一个大状态向量，按题目给的耦合关系写出一个大转移矩阵，矩阵快速幂一并推进。核心是「多个序列 → 合并成一个高维状态 → 一个矩阵统一转移」。"
				})
			]
		})
	] });
}
//#endregion
export { MatrixPower as default };
