import { jsx, jsxs } from "react/jsx-runtime";
//#region src/content/g/BitArt.tsx
/** 可复用比特点阵：把一个集合画成 n 个方块（亮=在集合内 / 灭=不在），下方标出二进制串。
*  bits[0] 是最低位（右起第 1 个格），与代码里 `mask & (1<<i)` 的 i 对应；渲染时最高位在左，符合书写习惯。 */
function BitLattice({ bits, labels, cell = 34, gap = 7, showBinary = true, highlight }) {
	const n = bits.length;
	const hl = new Set(highlight ?? []);
	const totalW = n * cell + (n - 1) * gap;
	const topPad = labels ? 20 : 6;
	const botPad = showBinary ? 26 : 6;
	const H = topPad + cell + botPad;
	const colX = (i) => (n - 1 - i) * (cell + gap);
	return /* @__PURE__ */ jsx("svg", {
		viewBox: `0 0 ${Math.max(totalW, 40)} ${H}`,
		width: totalW,
		height: H,
		role: "img",
		"aria-label": "比特点阵",
		children: bits.map((b, i) => {
			const on = b === 1;
			const emph = hl.has(i);
			return /* @__PURE__ */ jsxs("g", {
				transform: `translate(${colX(i)},${topPad})`,
				children: [
					labels && labels[i] != null && /* @__PURE__ */ jsx("text", {
						x: cell / 2,
						y: -7,
						textAnchor: "middle",
						fontSize: "10.5",
						className: "mono",
						fill: "var(--text-3)",
						children: labels[i]
					}),
					/* @__PURE__ */ jsx("rect", {
						width: cell,
						height: cell,
						rx: "7",
						fill: on ? "color-mix(in srgb, var(--accent-1) 30%, var(--surface-3))" : "var(--surface-3)",
						stroke: emph ? "var(--viz-current)" : on ? "var(--accent-2)" : "var(--border-strong)",
						strokeWidth: emph ? 2.6 : 1.6
					}),
					/* @__PURE__ */ jsx("text", {
						x: cell / 2,
						y: cell / 2 + 6,
						textAnchor: "middle",
						fontSize: "16",
						fontWeight: "700",
						className: "mono",
						fill: on ? "var(--accent-1)" : "var(--text-3)",
						children: b
					}),
					showBinary && /* @__PURE__ */ jsx("text", {
						x: cell / 2,
						y: cell + 18,
						textAnchor: "middle",
						fontSize: "10",
						className: "mono",
						fill: "var(--text-3)",
						children: `2^${i}`
					})
				]
			}, i);
		})
	});
}
function RowToMaskFigure() {
	const row = [
		1,
		0,
		1,
		0,
		0
	];
	const cell = 46;
	const x0 = 40;
	const y0 = 26;
	const bx = 40;
	const by = 128;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 520 210",
		role: "img",
		"aria-label": "一行棋盘压成二进制 mask",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "b-r2m",
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
			/* @__PURE__ */ jsx("text", {
				x: x0,
				y: 16,
				fontSize: "12",
				fill: "var(--text-2)",
				children: "棋盘的一行（放 / 不放）"
			}),
			row.map((v, c) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${x0 + c * 54},${y0})`,
				children: [/* @__PURE__ */ jsx("rect", {
					width: cell,
					height: cell,
					rx: "9",
					fill: v ? "color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))" : "var(--surface-3)",
					stroke: v ? "var(--accent-2)" : "var(--border-strong)",
					strokeWidth: "1.6"
				}), v === 1 && /* @__PURE__ */ jsx("circle", {
					cx: cell / 2,
					cy: cell / 2,
					r: "12",
					fill: "var(--accent-1)"
				})]
			}, c)),
			/* @__PURE__ */ jsx("path", {
				d: `M 170 96 L 170 ${by - 8}`,
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#b-r2m)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 190,
				y: 112,
				fontSize: "12",
				fill: "var(--text-2)",
				children: "压成一个整数 mask"
			}),
			[
				0,
				0,
				1,
				0,
				1
			].map((b, k) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${bx + k * 54},${by})`,
				children: [/* @__PURE__ */ jsx("rect", {
					width: cell,
					height: cell,
					rx: "9",
					fill: "var(--surface-3)",
					stroke: "var(--border-strong)",
					strokeWidth: "1.4"
				}), /* @__PURE__ */ jsx("text", {
					x: cell / 2,
					y: 30,
					textAnchor: "middle",
					fontSize: "19",
					fontWeight: "700",
					className: "mono",
					fill: b ? "var(--accent-1)" : "var(--text-3)",
					children: b
				})]
			}, k)),
			/* @__PURE__ */ jsx("text", {
				x: 310,
				y: 158,
				fontSize: "14",
				className: "mono",
				fill: "var(--text-1)",
				children: "= 00101"
			})
		]
	});
}
function BoardCheckFigure() {
	const cell = 40;
	const rowY = 44;
	const nextY = 114;
	const x0 = 250;
	const draw = (bits, y, lit, dark) => bits.map((b, c) => /* @__PURE__ */ jsxs("g", {
		transform: `translate(${x0 + c * 47},${y})`,
		children: [/* @__PURE__ */ jsx("rect", {
			width: cell,
			height: cell,
			rx: "8",
			fill: b ? lit : dark,
			stroke: b ? "var(--accent-2)" : "var(--border-strong)",
			strokeWidth: "1.5"
		}), b === 1 && /* @__PURE__ */ jsx("circle", {
			cx: cell / 2,
			cy: cell / 2,
			r: "10",
			fill: "var(--accent-1)"
		})]
	}, `${y}-${c}`));
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 168",
		role: "img",
		"aria-label": "行内相邻与行间相邻的位运算判定",
		children: [
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: 62,
				fontSize: "13",
				fontWeight: "600",
				fill: "var(--viz-chosen)",
				children: "行内 ✓"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: 80,
				fontSize: "11",
				className: "mono",
				fill: "var(--text-3)",
				children: "x&(x<<1)=0"
			}),
			draw([
				0,
				1,
				0,
				1,
				0
			], rowY, "color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))", "var(--surface-3)"),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: 132,
				fontSize: "13",
				fontWeight: "600",
				fill: "var(--viz-invalid)",
				children: "行间 ✗"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: 150,
				fontSize: "11",
				className: "mono",
				fill: "var(--viz-invalid)",
				children: "x&y≠0"
			}),
			draw([
				0,
				1,
				0,
				0,
				1
			], nextY, "color-mix(in srgb, var(--viz-invalid) 22%, var(--surface-3))", "var(--surface-3)"),
			[1, 4].map((c) => /* @__PURE__ */ jsx("line", {
				x1: x0 + c * 47 + cell / 2,
				y1: 84,
				x2: x0 + c * 47 + cell / 2,
				y2: nextY,
				stroke: "var(--viz-invalid)",
				strokeWidth: "2",
				strokeDasharray: "3 3"
			}, c)),
			/* @__PURE__ */ jsx("text", {
				x: x0,
				y: rowY - 6,
				fontSize: "11",
				fill: "var(--text-3)",
				children: "当前行 x"
			}),
			/* @__PURE__ */ jsx("text", {
				x: x0,
				y: nextY - 6,
				fontSize: "11",
				fill: "var(--text-3)",
				children: "上一行 y（同列相邻即冲突）"
			})
		]
	});
}
function CannonTwoRowFigure() {
	const cell = 30;
	const x0 = 60;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 470 176",
		role: "img",
		"aria-label": "炮兵阵地需要记住前两行状态",
		children: [
			[
				{
					y: 22,
					label: "i−2 行",
					bits: [
						1,
						0,
						0,
						0,
						1,
						0
					],
					dim: false
				},
				{
					y: 74,
					label: "i−1 行",
					bits: [
						0,
						0,
						1,
						0,
						0,
						0
					],
					dim: false
				},
				{
					y: 126,
					label: "i 行 (?)",
					bits: [
						0,
						1,
						0,
						0,
						0,
						1
					],
					dim: true
				}
			].map((r, ri) => /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("text", {
				x: "10",
				y: r.y + cell / 2 + 5,
				fontSize: "11",
				className: "mono",
				fill: r.dim ? "var(--accent-1)" : "var(--text-3)",
				children: r.label
			}), r.bits.map((b, c) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${x0 + c * 35},${r.y})`,
				children: [/* @__PURE__ */ jsx("rect", {
					width: cell,
					height: cell,
					rx: "6",
					fill: b ? "color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))" : "var(--surface-3)",
					stroke: r.dim ? "var(--viz-current)" : b ? "var(--accent-2)" : "var(--border-strong)",
					strokeWidth: r.dim ? 2 : 1.4,
					strokeDasharray: r.dim ? "4 3" : void 0
				}), b === 1 && /* @__PURE__ */ jsx("circle", {
					cx: cell / 2,
					cy: cell / 2,
					r: "8",
					fill: "var(--accent-1)"
				})]
			}, c))] }, ri)),
			/* @__PURE__ */ jsx("text", {
				x: 270,
				y: 48,
				fontSize: "11.5",
				fill: "var(--text-2)",
				children: "新行要同时避开"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 270,
				y: 90,
				fontSize: "11.5",
				fill: "var(--text-2)",
				children: "i−1 与 i−2 两行"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 270,
				y: 140,
				fontSize: "11",
				className: "mono",
				fill: "var(--text-3)",
				children: "状态 = (前两行 mask)"
			})
		]
	});
}
function TspStateFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 150",
		role: "img",
		"aria-label": "TSP 状态 dp[S][i] 的两个维度",
		children: [
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(20,20)",
				children: [
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "0",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "维度一：已访问集合 S（用点阵表示）"
					}),
					[
						0,
						1,
						1,
						0
					].map((bit, k) => /* @__PURE__ */ jsxs("g", {
						transform: `translate(${k * 44},14)`,
						children: [
							/* @__PURE__ */ jsx("rect", {
								width: "38",
								height: "38",
								rx: "8",
								fill: bit ? "color-mix(in srgb, var(--accent-1) 28%, var(--surface-3))" : "var(--surface-3)",
								stroke: bit ? "var(--accent-2)" : "var(--border-strong)",
								strokeWidth: "1.5"
							}),
							/* @__PURE__ */ jsx("text", {
								x: "19",
								y: "25",
								textAnchor: "middle",
								fontSize: "16",
								fontWeight: "700",
								className: "mono",
								fill: bit ? "var(--accent-1)" : "var(--text-3)",
								children: bit
							}),
							/* @__PURE__ */ jsx("text", {
								x: "19",
								y: "52",
								textAnchor: "middle",
								fontSize: "9.5",
								className: "mono",
								fill: "var(--text-3)",
								children: 3 - k
							})
						]
					}, k)),
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "82",
						fontSize: "12",
						className: "mono",
						fill: "var(--text-1)",
						children: "S = 0110 → 已到过点 1、2"
					})
				]
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "290",
				y1: "24",
				x2: "290",
				y2: "118",
				stroke: "var(--border)",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(320,20)",
				children: [
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "0",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "维度二：当前停在点 i"
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(60,20)",
						children: [/* @__PURE__ */ jsx("circle", {
							cx: "0",
							cy: "20",
							r: "18",
							fill: "var(--grad-accent)",
							stroke: "var(--accent-2)",
							strokeWidth: "1.5"
						}), /* @__PURE__ */ jsx("text", {
							x: "0",
							y: "25",
							textAnchor: "middle",
							fontSize: "15",
							fontWeight: "700",
							fill: "var(--text-on-accent)",
							children: "i=2"
						})]
					}),
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "82",
						fontSize: "12",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[0110][2] = 到此最短路"
					})
				]
			})
		]
	});
}
function TspTransFigure() {
	const dot = (x, y, id, on, cur = false) => /* @__PURE__ */ jsxs("g", {
		transform: `translate(${x},${y})`,
		children: [/* @__PURE__ */ jsx("circle", {
			r: "19",
			fill: cur ? "var(--grad-accent)" : on ? "color-mix(in srgb, var(--accent-1) 22%, var(--surface-3))" : "var(--surface-3)",
			stroke: cur ? "var(--accent-2)" : on ? "var(--accent-2)" : "var(--border-strong)",
			strokeWidth: cur ? 2.2 : 1.5
		}), /* @__PURE__ */ jsx("text", {
			y: "5",
			textAnchor: "middle",
			fontSize: "14",
			fontWeight: "700",
			fill: cur ? "var(--text-on-accent)" : on ? "var(--accent-1)" : "var(--text-3)",
			children: id
		})]
	});
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 560 190",
		role: "img",
		"aria-label": "TSP 从当前点走向未访问点的转移",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "tsp-ar",
				markerWidth: "9",
				markerHeight: "9",
				refX: "7",
				refY: "3",
				orient: "auto",
				children: /* @__PURE__ */ jsx("path", {
					d: "M0,0 L6,3 L0,6 Z",
					fill: "var(--viz-chosen)"
				})
			}) }),
			/* @__PURE__ */ jsxs("text", {
				x: "20",
				y: "20",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: [
					"已在集合 S=",
					"{0,1}",
					"、当前停在点 1，下一步去未访问的点 2 或 3"
				]
			}),
			dot(70, 90, 0, true),
			dot(160, 60, 1, false, true),
			dot(320, 60, 2, false),
			dot(360, 140, 3, false),
			/* @__PURE__ */ jsx("line", {
				x1: "178",
				y1: "66",
				x2: "300",
				y2: "62",
				stroke: "var(--viz-chosen)",
				strokeWidth: "2.4",
				markerEnd: "url(#tsp-ar)"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "176",
				y1: "76",
				x2: "342",
				y2: "132",
				stroke: "var(--viz-source)",
				strokeWidth: "1.8",
				strokeDasharray: "4 3",
				markerEnd: "url(#tsp-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "230",
				y: "48",
				fontSize: "11",
				className: "mono",
				fill: "var(--viz-chosen)",
				children: "+dist(1,2)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(400,54)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "150",
						height: "80",
						rx: "10",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.4"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "12",
						y: "24",
						fontSize: "11.5",
						className: "mono",
						fill: "var(--text-1)",
						children: "新状态："
					}),
					/* @__PURE__ */ jsxs("text", {
						x: "12",
						y: "46",
						fontSize: "11.5",
						className: "mono",
						fill: "var(--text-1)",
						children: [
							"S ∪ ",
							"{2}",
							" = 0111"
						]
					}),
					/* @__PURE__ */ jsx("text", {
						x: "12",
						y: "66",
						fontSize: "11.5",
						className: "mono",
						fill: "var(--accent-1)",
						children: "dp[0111][2]"
					})
				]
			})
		]
	});
}
function OpenClosedFigure() {
	const ring = (cx, cy, close) => {
		const pts = [
			[cx, cy - 34],
			[cx + 32, cy - 10],
			[cx + 20, cy + 30],
			[cx - 20, cy + 30],
			[cx - 32, cy - 10]
		];
		const lines = [];
		const last = close ? pts.length : pts.length - 1;
		for (let k = 0; k < last; k++) {
			const a = pts[k];
			const b = pts[(k + 1) % pts.length];
			lines.push(/* @__PURE__ */ jsx("line", {
				x1: a[0],
				y1: a[1],
				x2: b[0],
				y2: b[1],
				stroke: close && k === pts.length - 1 ? "var(--viz-chosen)" : "var(--accent-2)",
				strokeWidth: close && k === pts.length - 1 ? 2.8 : 2,
				strokeDasharray: close && k === pts.length - 1 ? "5 3" : void 0
			}, k));
		}
		return /* @__PURE__ */ jsxs("g", { children: [lines, pts.map((p, k) => /* @__PURE__ */ jsxs("g", {
			transform: `translate(${p[0]},${p[1]})`,
			children: [/* @__PURE__ */ jsx("circle", {
				r: "13",
				fill: k === 0 ? "var(--grad-accent)" : "var(--surface-3)",
				stroke: "var(--accent-2)",
				strokeWidth: "1.6"
			}), /* @__PURE__ */ jsx("text", {
				y: "4",
				textAnchor: "middle",
				fontSize: "11",
				fontWeight: "700",
				fill: k === 0 ? "var(--text-on-accent)" : "var(--text-1)",
				children: k
			})]
		}, k))] });
	};
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 460 190",
		role: "img",
		"aria-label": "开环 Hamilton 路径与闭环售货员回路的区别",
		children: [
			/* @__PURE__ */ jsx("text", {
				x: "70",
				y: "20",
				textAnchor: "middle",
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--text-2)",
				children: "开环：Hamilton 路径"
			}),
			/* @__PURE__ */ jsx("g", {
				transform: "translate(0,20)",
				children: ring(90, 90, false)
			}),
			/* @__PURE__ */ jsx("text", {
				x: "90",
				y: "185",
				textAnchor: "middle",
				fontSize: "11",
				fill: "var(--text-3)",
				children: "终态 dp[(1<<n)−1][i]"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "230",
				y1: "30",
				x2: "230",
				y2: "160",
				stroke: "var(--border)",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "350",
				y: "20",
				textAnchor: "middle",
				fontSize: "12.5",
				fontWeight: "600",
				fill: "var(--text-2)",
				children: "闭环：售货员回路"
			}),
			/* @__PURE__ */ jsx("g", {
				transform: "translate(270,20)",
				children: ring(90, 90, true)
			}),
			/* @__PURE__ */ jsx("text", {
				x: "360",
				y: "185",
				textAnchor: "middle",
				fontSize: "11",
				fill: "var(--viz-chosen)",
				children: "末尾必须 +dist(i,0)"
			})
		]
	});
}
function CoverMaskFigure() {
	const choices = [
		{
			name: "选择 A",
			bits: [
				1,
				1,
				0,
				0,
				0
			]
		},
		{
			name: "选择 B",
			bits: [
				0,
				0,
				1,
				1,
				0
			]
		},
		{
			name: "选择 C",
			bits: [
				0,
				0,
				0,
				0,
				1
			]
		}
	];
	const cell = 30;
	const x0 = 96;
	const draw = (bits, y, strong) => bits.map((b, k) => /* @__PURE__ */ jsxs("g", {
		transform: `translate(${x0 + k * 36},${y})`,
		children: [/* @__PURE__ */ jsx("rect", {
			width: cell,
			height: cell,
			rx: "6",
			fill: b ? "color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))" : "var(--surface-3)",
			stroke: b ? strong ? "var(--viz-chosen)" : "var(--accent-2)" : "var(--border-strong)",
			strokeWidth: "1.5"
		}), /* @__PURE__ */ jsx("text", {
			x: cell / 2,
			y: 20,
			textAnchor: "middle",
			fontSize: "13",
			fontWeight: "700",
			className: "mono",
			fill: b ? "var(--accent-1)" : "var(--text-3)",
			children: b
		})]
	}, k));
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 400 226",
		role: "img",
		"aria-label": "每个选择覆盖的元素压成 mask，并集填满全集",
		children: [
			choices.map((c, ci) => /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("text", {
				x: "16",
				y: 22 + ci * 44 + cell / 2 + 5,
				fontSize: "12",
				fill: "var(--text-2)",
				children: c.name
			}), draw(c.bits, 22 + ci * 44, false)] }, ci)),
			/* @__PURE__ */ jsx("line", {
				x1: x0 - 6,
				y1: 150,
				x2: 272,
				y2: 150,
				stroke: "var(--border-strong)",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "16",
				y: 177,
				fontSize: "12",
				className: "mono",
				fill: "var(--viz-chosen)",
				children: "并集"
			}),
			draw([
				1,
				1,
				1,
				1,
				1
			], 158, true),
			/* @__PURE__ */ jsx("text", {
				x: x0,
				y: 222,
				fontSize: "11.5",
				className: "mono",
				fill: "var(--text-1)",
				children: "= 11111 = 全集 (1<<5)−1 → 覆盖完成"
			})
		]
	});
}
function SubsetEnumFigure() {
	const S = [
		1,
		1,
		0,
		1
	];
	const subs = [
		[
			1,
			1,
			0,
			1
		],
		[
			1,
			0,
			0,
			1
		],
		[
			0,
			1,
			0,
			1
		],
		[
			0,
			0,
			0,
			1
		],
		[
			1,
			1,
			0,
			0
		],
		[
			1,
			0,
			0,
			0
		],
		[
			0,
			1,
			0,
			0
		]
	];
	const cell = 22;
	const rowH = 30;
	const bx = 130;
	const drawMini = (bits, x, y, dimZero) => Array.from({ length: bits.length }, (_, k) => {
		const i = bits.length - 1 - k;
		const bit = bits[i];
		return /* @__PURE__ */ jsxs("g", {
			transform: `translate(${x + k * 26},${y})`,
			children: [/* @__PURE__ */ jsx("rect", {
				width: cell,
				height: cell,
				rx: "5",
				fill: bit ? "color-mix(in srgb, var(--accent-1) 28%, var(--surface-3))" : "var(--surface-3)",
				stroke: bit ? "var(--accent-2)" : "var(--border-strong)",
				strokeWidth: "1.2",
				opacity: dimZero && S[i] === 0 ? .35 : 1
			}), /* @__PURE__ */ jsx("text", {
				x: cell / 2,
				y: 15,
				textAnchor: "middle",
				fontSize: "11",
				fontWeight: "700",
				className: "mono",
				fill: bit ? "var(--accent-1)" : "var(--text-3)",
				children: bit
			})]
		}, k);
	});
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 400 290",
		role: "img",
		"aria-label": "枚举集合 S 的所有非空子集",
		children: [
			/* @__PURE__ */ jsx("text", {
				x: "16",
				y: "20",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "母集 S = 1011（元素 0、1、3）"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(0,6)",
				children: [/* @__PURE__ */ jsx("text", {
					x: "16",
					y: 38,
					fontSize: "12",
					className: "mono",
					fill: "var(--text-1)",
					children: "S"
				}), drawMini(S, bx, 26, false)]
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "16",
				y1: "60",
				x2: "384",
				y2: "60",
				stroke: "var(--border)",
				strokeWidth: "1"
			}),
			subs.map((sub, si) => /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("text", {
				x: "16",
				y: 78 + si * rowH + cell / 2,
				fontSize: "11",
				className: "mono",
				fill: "var(--text-3)",
				children: si + 1
			}), drawMini(sub, bx, 76 + si * rowH, true)] }, si)),
			/* @__PURE__ */ jsx("text", {
				x: "16",
				y: 78 + subs.length * rowH + 4,
				fontSize: "11",
				className: "mono",
				fill: "var(--text-2)",
				children: "T = (T−1) & S 只在 S 的 1 位上取值，7 个非空子集全枚举，O(3ⁿ)"
			})
		]
	});
}
function CountVariantFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 440 168",
		role: "img",
		"aria-label": "位掩码加附加维的计数状态",
		children: [
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(30,30)",
				children: [/* @__PURE__ */ jsx("text", {
					x: "0",
					y: "0",
					fontSize: "12.5",
					fill: "var(--text-2)",
					children: "主维：已用数字集合 mask"
				}), [
					0,
					1,
					0,
					1
				].map((bit, k) => /* @__PURE__ */ jsxs("g", {
					transform: `translate(${k * 40},14)`,
					children: [/* @__PURE__ */ jsx("rect", {
						width: "34",
						height: "34",
						rx: "7",
						fill: bit ? "color-mix(in srgb, var(--accent-1) 28%, var(--surface-3))" : "var(--surface-3)",
						stroke: bit ? "var(--accent-2)" : "var(--border-strong)",
						strokeWidth: "1.5"
					}), /* @__PURE__ */ jsx("text", {
						x: "17",
						y: "23",
						textAnchor: "middle",
						fontSize: "15",
						fontWeight: "700",
						className: "mono",
						fill: bit ? "var(--accent-1)" : "var(--text-3)",
						children: bit
					})]
				}, k))]
			}),
			/* @__PURE__ */ jsx("text", {
				x: "40",
				y: "118",
				fontSize: "12",
				className: "mono",
				fill: "var(--text-1)",
				children: "mask = 0101"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "240",
				y1: "24",
				x2: "240",
				y2: "140",
				stroke: "var(--border)",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(270,30)",
				children: [
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "0",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "附加维：当前数 mod d"
					}),
					/* @__PURE__ */ jsxs("g", {
						transform: "translate(20,16)",
						children: [/* @__PURE__ */ jsx("rect", {
							width: "120",
							height: "40",
							rx: "9",
							fill: "color-mix(in srgb, var(--accent-1) 14%, var(--surface-2))",
							stroke: "var(--accent-2)",
							strokeWidth: "1.5"
						}), /* @__PURE__ */ jsx("text", {
							x: "60",
							y: "26",
							textAnchor: "middle",
							fontSize: "14",
							className: "mono",
							fill: "var(--text-1)",
							children: "余数 r"
						})]
					}),
					/* @__PURE__ */ jsx("text", {
						x: "0",
						y: "100",
						fontSize: "12",
						className: "mono",
						fill: "var(--accent-1)",
						children: "dp[mask][r] = 方案数"
					})
				]
			})
		]
	});
}
function ContourFigure() {
	const cols = 5;
	const rows = 4;
	const cell = 34;
	const x0 = 40;
	const y0 = 30;
	const cutR = 1;
	const cutC = 2;
	const decided = (r, c) => r < cutR || r === cutR && c <= cutC;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 300 200",
		role: "img",
		"aria-label": "轮廓线把网格分成已决与未决两区",
		children: [
			Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
				const dec = decided(r, c);
				const isCur = r === cutR && c === cutC;
				return /* @__PURE__ */ jsx("g", {
					transform: `translate(${x0 + c * cell},${y0 + r * cell})`,
					children: /* @__PURE__ */ jsx("rect", {
						width: cell - 3,
						height: cell - 3,
						rx: "5",
						fill: isCur ? "color-mix(in srgb, var(--viz-current) 24%, var(--surface-3))" : dec ? "color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))" : "var(--surface-3)",
						stroke: isCur ? "var(--viz-current)" : dec ? "var(--accent-2)" : "var(--border-strong)",
						strokeWidth: isCur ? 2.2 : 1.3
					})
				}, `${r}-${c}`);
			})),
			/* @__PURE__ */ jsx("polyline", {
				points: `${x0},96.5 140.5,96.5 140.5,62.5 208.5,62.5`,
				fill: "none",
				stroke: "var(--viz-source)",
				strokeWidth: "3"
			}),
			/* @__PURE__ */ jsx("text", {
				x: x0,
				y: y0 - 10,
				fontSize: "11",
				fill: "var(--accent-1)",
				children: "已决区"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 140,
				y: 182,
				fontSize: "11",
				fill: "var(--text-3)",
				children: "未决区"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 206,
				y: 56,
				textAnchor: "end",
				fontSize: "10.5",
				className: "mono",
				fill: "var(--viz-source)",
				children: "轮廓线"
			})
		]
	});
}
//#endregion
export { CountVariantFigure as a, RowToMaskFigure as c, TspTransFigure as d, ContourFigure as i, SubsetEnumFigure as l, BoardCheckFigure as n, CoverMaskFigure as o, CannonTwoRowFigure as r, OpenClosedFigure as s, BitLattice as t, TspStateFigure as u };
