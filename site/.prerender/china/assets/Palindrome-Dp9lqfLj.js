import { i as MB, n as InfoBox, r as M, t as CodeBlock } from "../entry-server.js";
import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
import { n as key, t as DPViz } from "./DPViz-B4WSCgkp.js";
import { n as PlaybackControls, t as useStepPlayer } from "./useStepPlayer-CZuIDieE.js";
/* empty css                       */
import { n as Exercise, r as Field, t as ExampleCard } from "./ProblemBits-uXfGTLmC.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, MousePointerClick, RotateCcw } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/algorithms/palindrome/internal.ts
function normalizePalindromeInput$1(raw) {
	const chars = raw.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8).split("");
	return chars.length > 0 ? chars : ["a"];
}
function executePalindromeLps(chars, emit) {
	const n = chars.length;
	const table = Array.from({ length: n }, () => Array(n).fill(0));
	for (let index = 0; index < n; index++) table[index][index] = 1;
	for (let length = 2; length <= n; length++) for (let left = 0; left + length <= n; left++) {
		const right = left + length - 1;
		const matched = chars[left] === chars[right];
		const inner = length === 2 ? 0 : table[left + 1][right - 1];
		const dropLeft = table[left + 1][right];
		const dropRight = table[left][right - 1];
		let source;
		if (matched) {
			table[left][right] = inner + 2;
			source = "inner";
		} else if (dropLeft >= dropRight) {
			table[left][right] = dropLeft;
			source = "left";
		} else {
			table[left][right] = dropRight;
			source = "right";
		}
		emit({
			type: "settled",
			left,
			right,
			matched,
			value: table[left][right],
			inner,
			dropLeft,
			dropRight,
			source
		});
	}
	return {
		length: n === 0 ? 0 : table[0][n - 1],
		table
	};
}
function recordPalindromeLps(chars) {
	const events = [];
	return {
		result: executePalindromeLps(chars, (event) => events.push(event)),
		events
	};
}
function executePalindromeInsertion(raw, emit) {
	const chars = normalizePalindromeInput$1(raw);
	const n = chars.length;
	const table = Array.from({ length: n }, () => Array(n).fill(0));
	for (let length = 2; length <= n; length++) for (let left = 0; left + length <= n; left++) {
		const right = left + length - 1;
		table[left][right] = chars[left] === chars[right] ? length === 2 ? 0 : table[left + 1][right - 1] : Math.min(table[left + 1][right], table[left][right - 1]) + 1;
	}
	const leftHalf = [];
	const rightHalf = [];
	const shell = () => leftHalf.join("") + "…" + rightHalf.slice().reverse().join("");
	let left = 0;
	let right = n - 1;
	while (left < right) if (chars[left] === chars[right]) {
		leftHalf.push(chars[left]);
		rightHalf.push(chars[right]);
		emit({
			type: "matched",
			left,
			right,
			built: shell()
		});
		left++;
		right--;
	} else if (table[left + 1][right] <= table[left][right - 1]) {
		leftHalf.push(chars[left]);
		rightHalf.push(chars[left]);
		emit({
			type: "inserted",
			left,
			right,
			insertChar: chars[left],
			insertSide: "right",
			built: shell()
		});
		left++;
	} else {
		leftHalf.push(chars[right]);
		rightHalf.push(chars[right]);
		emit({
			type: "inserted",
			left,
			right,
			insertChar: chars[right],
			insertSide: "left",
			built: shell()
		});
		right--;
	}
	const center = left === right ? chars[left] : "";
	const palindrome = leftHalf.join("") + center + rightHalf.slice().reverse().join("");
	const insertCount = table[0][n - 1];
	return {
		chars,
		insertCount,
		lps: n - insertCount,
		palindrome
	};
}
function recordPalindromeInsertion(raw) {
	const events = [];
	return {
		result: executePalindromeInsertion(raw, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/algorithms/palindrome/index.ts
function normalizePalindromeInput(raw) {
	return normalizePalindromeInput$1(raw);
}
function solvePalindromeLps(chars) {
	return executePalindromeLps(chars, ignoreEvents);
}
//#endregion
//#region src/components/demos/interval/palindromeSolver.ts
function settled(table) {
	const states = {};
	for (let row = 0; row < table.length; row++) for (let column = row; column < table.length; column++) if (table[row][column] !== null) states[key(row, column)] = "settled";
	return states;
}
function normalize(raw) {
	return normalizePalindromeInput(raw);
}
function palindromeLps(chars) {
	const run = recordPalindromeLps(chars);
	const n = chars.length;
	const table = Array.from({ length: n }, () => Array(n).fill(null));
	for (let index = 0; index < n; index++) table[index][index] = 1;
	const snapshot = () => table.map((row) => row.slice());
	const frames = [{
		values: snapshot(),
		states: settled(table),
		caption: "<b>对角线（区间长度 1）</b>：单个字符自成回文，dp[i][i]=1。",
		formula: "dp[i][i]=1"
	}];
	for (const event of run.events) {
		table[event.left][event.right] = event.value;
		const states = settled(table);
		const arrows = [];
		let caption;
		let formula;
		if (event.matched) {
			if (event.right - event.left > 1) {
				states[key(event.left + 1, event.right - 1)] = "chosen";
				arrows.push({
					from: {
						r: event.left + 1,
						c: event.right - 1
					},
					to: {
						r: event.left,
						c: event.right
					},
					kind: "chosen"
				});
			}
			caption = `区间 <b>[${event.left},${event.right}]</b> 两端字符相等，把内层回文包起来：${event.inner}+2=<b>${event.value}</b>。`;
			formula = `dp[${event.left}][${event.right}]=${event.inner}+2=${event.value}`;
		} else {
			const source = event.source === "left" ? {
				r: event.left + 1,
				c: event.right
			} : {
				r: event.left,
				c: event.right - 1
			};
			states[key(source.r, source.c)] = "chosen";
			arrows.push({
				from: source,
				to: {
					r: event.left,
					c: event.right
				},
				kind: "chosen"
			});
			caption = `区间 <b>[${event.left},${event.right}]</b> 两端不同，比较丢左 ${event.dropLeft} 与丢右 ${event.dropRight}，取大得 <b>${event.value}</b>。`;
			formula = `dp[${event.left}][${event.right}]=\\max(${event.dropLeft},${event.dropRight})=${event.value}`;
		}
		states[key(event.left, event.right)] = "current";
		frames.push({
			values: snapshot(),
			states,
			arrows,
			active: {
				r: event.left,
				c: event.right
			},
			caption,
			formula
		});
	}
	const finalStates = settled(table);
	if (n > 0) finalStates[key(0, n - 1)] = "chosen";
	frames.push({
		values: snapshot(),
		states: finalStates,
		caption: `整串 "${chars.join("")}" 的最长回文子序列长度是 <b>${run.result.length}</b>。`,
		formula: `dp[0][${n - 1}]=${run.result.length}`
	});
	return {
		rows: n,
		cols: n,
		cell: 42,
		rowHeaderLabels: chars.map((char, index) => `i=${index}·${char}`),
		colHeaderLabels: chars.map((char, index) => `j=${index}·${char}`),
		frames
	};
}
function palindromeInsert(raw) {
	const run = recordPalindromeInsertion(raw);
	const steps = run.events.map((event) => ({
		i: event.left,
		j: event.right,
		matched: event.type === "matched",
		insertChar: event.insertChar,
		insertSide: event.insertSide,
		built: event.built
	}));
	return {
		...run.result,
		steps
	};
}
//#endregion
//#region src/components/demos/interval/PalindromeDemo.tsx
var PRESETS$1 = [
	"bcabb",
	"google",
	"character",
	"aebcbda"
];
/** 最长回文子序列区间 DP 三角表演示：dp[i][j] 按区间长度递推，相等收缩（左下）/不等取大（下·左）。 */
function PalindromeDemo() {
	const [text, setText] = useState("bcabb");
	const chars = useMemo(() => normalize(text), [text]);
	const model = useMemo(() => palindromeLps(chars), [chars]);
	const modelKey = `plps-${chars.join("")}`;
	const lps = useMemo(() => solvePalindromeLps(chars).length, [chars]);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "pal__toolbar",
			children: /* @__PURE__ */ jsxs("div", {
				style: { flex: 1 },
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "kd__group-label",
						children: "字符串（可编辑 · 取前 8 个字母/数字 · 大小写不敏感）"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "pal__inrow",
						children: [/* @__PURE__ */ jsx("input", {
							className: "pal__input",
							value: text,
							maxLength: 16,
							spellCheck: false,
							onChange: (e) => setText(e.target.value),
							"aria-label": "输入字符串"
						}), /* @__PURE__ */ jsxs("button", {
							className: "pal__reset",
							onClick: () => setText("bcabb"),
							"aria-label": "复位",
							children: [/* @__PURE__ */ jsx(RotateCcw, { size: 14 }), " 复位"]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "pal__presets",
						children: PRESETS$1.map((p) => /* @__PURE__ */ jsx("button", {
							className: `pal__chip ${chars.join("") === p ? "on" : ""}`,
							onClick: () => setText(p),
							children: p
						}, p))
					})
				]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"当前串 ",
				/* @__PURE__ */ jsxs("b", {
					className: "you",
					children: [
						"\"",
						chars.join(""),
						"\""
					]
				}),
				"（长度 ",
				chars.length,
				"）· 最长回文子序列长度",
				" ",
				/* @__PURE__ */ jsxs("b", {
					className: "ok",
					children: [
						"dp[0][",
						chars.length - 1,
						"] = ",
						lps
					]
				}),
				" · 表内每格 dp[i][j] = 子串 s[i..j] 的最长回文子序列长。"
			]
		}),
		/* @__PURE__ */ jsx(DPViz, { model }, modelKey)
	] });
}
//#endregion
//#region src/components/demos/interval/PalindromeInsertDemo.tsx
var PRESETS = [
	"google",
	"abcda",
	"raceca",
	"aebcbda"
];
/**
* 最少插入构回文（自建可视化，非 DPViz）。
* 双指针 i、j 从两端向内收缩：s[i]==s[j] 直接内缩（0 插入）；否则在较省一侧插入对端字符（+1）。
* 插入总数 = len − 最长回文子序列——与主演示同源。逐步把非回文串补成回文。
*/
function PalindromeInsertDemo() {
	const [text, setText] = useState("google");
	const res = useMemo(() => palindromeInsert(text), [text]);
	const s = res.chars;
	const n = s.length;
	const player = useStepPlayer(res.steps.length + 1 + 1);
	const idx = player.index - 1;
	const done = idx >= res.steps.length;
	const curStep = idx >= 0 && idx < res.steps.length ? res.steps[idx] : null;
	const roles = new Array(n).fill("idle");
	const processedUpto = done ? res.steps.length : Math.max(0, idx + 1);
	for (let t = 0; t < processedUpto; t++) {
		const st = res.steps[t];
		if (st.matched) {
			roles[st.i] = "matched";
			roles[st.j] = "matched";
		} else {
			roles[st.i] = st.insertSide === "right" ? "inserted-src" : roles[st.i];
			roles[st.j] = st.insertSide === "left" ? "inserted-src" : roles[st.j];
		}
	}
	if (curStep) {
		roles[curStep.i] = "active";
		roles[curStep.j] = "active";
	}
	const centerIdx = done && n > 0 ? (() => {
		let i = 0;
		let j = n - 1;
		for (const st of res.steps) if (st.matched) {
			i++;
			j--;
		} else if (st.insertSide === "right") i++;
		else j--;
		return i === j ? i : -1;
	})() : -1;
	const insertedSoFar = (() => {
		let c = 0;
		for (let t = 0; t < processedUpto; t++) if (!res.steps[t].matched) c++;
		return c;
	})();
	const roleClass = (r, i) => `pal__ch ${r === "active" ? "is-active" : ""} ${r === "matched" ? "is-matched" : ""} ${r === "inserted-src" ? "is-insrc" : ""} ${i === centerIdx ? "is-center" : ""}`;
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "pal__toolbar",
			children: /* @__PURE__ */ jsxs("div", {
				style: { flex: 1 },
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "kd__group-label",
						children: "字符串（可编辑 · 取前 8 个字母/数字）"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "pal__inrow",
						children: [/* @__PURE__ */ jsx("input", {
							className: "pal__input",
							value: text,
							maxLength: 16,
							spellCheck: false,
							onChange: (e) => {
								player.reset();
								setText(e.target.value);
							},
							"aria-label": "输入字符串"
						}), /* @__PURE__ */ jsxs("button", {
							className: "pal__reset",
							onClick: () => {
								player.reset();
								setText("google");
							},
							"aria-label": "复位",
							children: [/* @__PURE__ */ jsx(RotateCcw, { size: 14 }), " 复位"]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "pal__presets",
						children: PRESETS.map((p) => /* @__PURE__ */ jsx("button", {
							className: `pal__chip ${s.join("") === p ? "on" : ""}`,
							onClick: () => {
								player.reset();
								setText(p);
							},
							children: p
						}, p))
					})
				]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fbug__readout",
			children: [
				"原串 ",
				/* @__PURE__ */ jsxs("b", {
					className: "you",
					children: [
						"\"",
						s.join(""),
						"\""
					]
				}),
				"（长度 ",
				n,
				"）· 最长回文子序列 ",
				/* @__PURE__ */ jsx("b", { children: res.lps }),
				" · 最少插入",
				" ",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: res.insertCount
				}),
				" 次 = 长度 ",
				n,
				" − 最长回文子序列 ",
				res.lps,
				" · 补齐后回文",
				" ",
				/* @__PURE__ */ jsxs("b", {
					className: "you",
					children: [
						"\"",
						res.palindrome,
						"\""
					]
				}),
				"。"
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pal__stage",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "pal__stage-head",
				children: [/* @__PURE__ */ jsxs("span", { children: [
					"双指针 ",
					/* @__PURE__ */ jsx("b", {
						className: "pal__ptr-i",
						children: "i →"
					}),
					" 与 ",
					/* @__PURE__ */ jsx("b", {
						className: "pal__ptr-j",
						children: "← j"
					}),
					" 从两端向内收缩"
				] }), /* @__PURE__ */ jsxs("span", {
					className: "mono",
					children: [
						"已插入 ",
						insertedSoFar,
						"/",
						res.insertCount
					]
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "pal__strip",
				children: s.map((c, i) => /* @__PURE__ */ jsxs("div", {
					className: roleClass(roles[i], i),
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "pal__ch-idx",
							children: i
						}),
						/* @__PURE__ */ jsx("span", {
							className: "pal__ch-c",
							children: c
						}),
						curStep && curStep.i === i && /* @__PURE__ */ jsx("span", {
							className: "pal__ptr pal__ptr-i",
							children: "i"
						}),
						curStep && curStep.j === i && curStep.i !== i && /* @__PURE__ */ jsx("span", {
							className: "pal__ptr pal__ptr-j",
							children: "j"
						})
					]
				}, i))
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pal__stage",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "pal__stage-head",
				children: [/* @__PURE__ */ jsxs("span", { children: [
					"逐步锁定的",
					/* @__PURE__ */ jsx("b", { children: "回文外壳" }),
					"（从两端向内长；",
					/* @__PURE__ */ jsx("span", {
						className: "pal__mid",
						children: "…"
					}),
					" 为待定中段）"
				] }), /* @__PURE__ */ jsx("span", {
					className: "mono",
					children: done ? "完成" : `第 ${Math.max(0, idx + 1)}/${res.steps.length} 步`
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "pal__shell",
				children: done ? /* @__PURE__ */ jsx("span", {
					className: "pal__shell-final",
					children: res.palindrome
				}) : /* @__PURE__ */ jsx("span", {
					className: "pal__shell-txt",
					children: idx < 0 ? s.join("") : curStep?.built
				})
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "pal__readout",
			children: idx < 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
				"点",
				/* @__PURE__ */ jsx("b", {
					className: "cur",
					children: " 播放 "
				}),
				"或",
				/* @__PURE__ */ jsx("b", { children: " 下一步 " }),
				"开始：让 ",
				/* @__PURE__ */ jsx("b", {
					className: "pal__ptr-i",
					children: "i"
				}),
				"、",
				/* @__PURE__ */ jsx("b", {
					className: "pal__ptr-j",
					children: "j"
				}),
				" 从两端逼近。相等则内缩（天然对称，0 插入）；不等则在",
				/* @__PURE__ */ jsx("b", { children: "较省的一侧" }),
				"补一个对端字符（+1）， 直到指针相遇——补齐的串即回文。"
			] }) : done ? /* @__PURE__ */ jsxs(Fragment, { children: [
				"指针相遇，全串对称。共插入 ",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: res.insertCount
				}),
				" 个字符，得回文",
				" ",
				/* @__PURE__ */ jsxs("b", {
					className: "you",
					children: [
						"\"",
						res.palindrome,
						"\""
					]
				}),
				"。次数正好 = 长度 − 最长回文子序列——与上方三角表",
				/* @__PURE__ */ jsx("b", { children: "同一答案" }),
				"。"
			] }) : curStep?.matched ? /* @__PURE__ */ jsxs(Fragment, { children: [
				"s[",
				curStep.i,
				"]=s[",
				curStep.j,
				"]=",
				/* @__PURE__ */ jsxs("b", { children: [
					"'",
					s[curStep.i],
					"'"
				] }),
				" ",
				/* @__PURE__ */ jsx("b", {
					className: "ok",
					children: "相等"
				}),
				"：这对天然对称，",
				/* @__PURE__ */ jsx("b", { children: "直接内缩" }),
				"，不插入。"
			] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
				"s[",
				curStep.i,
				"]=",
				/* @__PURE__ */ jsxs("b", { children: [
					"'",
					s[curStep.i],
					"'"
				] }),
				"、s[",
				curStep.j,
				"]=",
				/* @__PURE__ */ jsxs("b", { children: [
					"'",
					s[curStep.j],
					"'"
				] }),
				" ",
				/* @__PURE__ */ jsx("b", { children: "不等" }),
				"： 在",
				/* @__PURE__ */ jsxs("b", { children: [curStep.insertSide === "left" ? "左" : "右", "端"] }),
				"插入 ",
				/* @__PURE__ */ jsxs("b", {
					className: "cur",
					children: [
						"'",
						curStep.insertChar,
						"'"
					]
				}),
				" 与对端配对（",
				/* @__PURE__ */ jsx("b", { children: "+1" }),
				"），再内缩该侧。"
			] })
		}),
		/* @__PURE__ */ jsx(PlaybackControls, {
			player,
			variant: "compact",
			label: "最少插入构回文逐帧播放",
			className: "ll__ctl"
		})
	] });
}
//#endregion
//#region src/content/c/PalindromeArt.tsx
function PalindromeSetupFigure() {
	const s = [
		"c",
		"h",
		"a",
		"r",
		"a",
		"c",
		"t",
		"e",
		"r"
	];
	const pairs = [{
		a: 0,
		b: 5
	}, {
		a: 2,
		b: 4
	}];
	const center = 3;
	const x0 = 30;
	const dx = 54;
	const bw = 44;
	const cx = (i) => x0 + i * dx + bw / 2;
	const picked = /* @__PURE__ */ new Set([
		0,
		2,
		3,
		4,
		5
	]);
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 540 176",
		role: "img",
		"aria-label": "串中最长回文子序列的对称配对",
		children: [
			pairs.map((p, i) => {
				const xa = cx(p.a);
				const xb = cx(p.b);
				return /* @__PURE__ */ jsx("path", {
					d: `M ${xa} 96 Q ${(xa + xb) / 2} ${96 - (40 + i * 22)} ${xb} 96`,
					fill: "none",
					stroke: "var(--viz-chosen)",
					strokeWidth: "2"
				}, i);
			}),
			s.map((c, i) => {
				const on = picked.has(i);
				return /* @__PURE__ */ jsxs("g", {
					transform: `translate(${x0 + i * dx},98)`,
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: bw,
							height: "52",
							rx: "10",
							fill: on ? "color-mix(in srgb, var(--viz-chosen) 16%, var(--surface-3))" : "var(--surface-3)",
							stroke: on ? "var(--viz-chosen)" : "var(--border-strong)",
							strokeWidth: on ? 2.2 : 1.5
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "33",
							textAnchor: "middle",
							fontSize: "22",
							className: "mono",
							fill: on ? "var(--accent-1)" : "var(--text-3)",
							children: c
						}),
						/* @__PURE__ */ jsx("text", {
							x: bw / 2,
							y: "70",
							textAnchor: "middle",
							fontSize: "11",
							className: "mono",
							fill: "var(--text-3)",
							children: i
						})
					]
				}, i);
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: cx(center),
				cy: "124",
				r: "4",
				fill: "var(--accent-2)"
			}),
			/* @__PURE__ */ jsxs("text", {
				x: cx(center),
				y: "16",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: [
					"最长回文子序列 ",
					/* @__PURE__ */ jsx("tspan", {
						className: "mono",
						fill: "var(--accent-1)",
						children: "c a r a c"
					}),
					"（长 5）"
				]
			})
		]
	});
}
function CollapseFigure() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 640 300",
		role: "img",
		"aria-label": "回文区间 DP 的两条转移分叉",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "pc-ar",
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
				transform: "translate(244,8)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "152",
						height: "48",
						rx: "12",
						fill: "var(--surface-3)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "76",
						y: "21",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-2)",
						children: "子串 s[i..j]"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "76",
						y: "39",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[i][j] = ?"
					})
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M296 56 L150 100",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#pc-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M344 56 L494 100",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#pc-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "150",
				y: "82",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--viz-chosen)",
				children: "s[i] = s[j]（相等）"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "496",
				y: "82",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: "s[i] ≠ s[j]（不等）"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(30,104)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "248",
						height: "72",
						rx: "12",
						fill: "color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))",
						stroke: "var(--viz-chosen)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "124",
						y: "26",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "把这对同字符裹到内层两端"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "124",
						y: "52",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "dp[i+1][j−1] + 2"
					})
				]
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(372,104)",
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "240",
						height: "72",
						rx: "12",
						fill: "var(--surface-2)",
						stroke: "var(--border-strong)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "26",
						textAnchor: "middle",
						fontSize: "12.5",
						fill: "var(--text-1)",
						children: "至少丢一端，取较大者"
					}),
					/* @__PURE__ */ jsx("text", {
						x: "120",
						y: "52",
						textAnchor: "middle",
						fontSize: "14",
						className: "mono",
						fill: "var(--text-1)",
						children: "max(dp[i+1][j], dp[i][j−1])"
					})
				]
			}),
			/* @__PURE__ */ jsx("g", {
				transform: "translate(150,192)",
				children: /* @__PURE__ */ jsx("text", {
					x: "0",
					y: "0",
					textAnchor: "middle",
					fontSize: "11.5",
					fill: "var(--viz-chosen)",
					children: "来源在【左下】(内缩一圈)"
				})
			}),
			/* @__PURE__ */ jsx("g", {
				transform: "translate(492,192)",
				children: /* @__PURE__ */ jsx("text", {
					x: "0",
					y: "0",
					textAnchor: "middle",
					fontSize: "11.5",
					fill: "var(--text-3)",
					children: "来源在【下 dp[i+1][j]】/【左 dp[i][j−1]】"
				})
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M150 204 L300 244",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#pc-ar)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M492 204 L340 244",
				stroke: "var(--text-3)",
				strokeWidth: "2",
				markerEnd: "url(#pc-ar)"
			}),
			/* @__PURE__ */ jsxs("g", {
				transform: "translate(206,246)",
				children: [/* @__PURE__ */ jsx("rect", {
					width: "228",
					height: "46",
					rx: "14",
					fill: "color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))",
					stroke: "var(--accent-2)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: "114",
					y: "28",
					textAnchor: "middle",
					fontSize: "13.5",
					className: "mono",
					fill: "var(--text-1)",
					children: "写入 dp[i][j]"
				})]
			})
		]
	});
}
function InsertFigure() {
	const src = [
		"a",
		"b",
		"c",
		"d",
		"a"
	];
	const out = [
		{
			c: "a",
			ins: false
		},
		{
			c: "b",
			ins: false
		},
		{
			c: "c",
			ins: false
		},
		{
			c: "d",
			ins: false
		},
		{
			c: "c",
			ins: true
		},
		{
			c: "b",
			ins: true
		},
		{
			c: "a",
			ins: false
		}
	];
	const bw = 40;
	const gap = 8;
	const rowW = (n) => n * bw + (n - 1) * gap;
	const srcX = (520 - rowW(src.length)) / 2;
	const outX = (520 - rowW(out.length)) / 2;
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 520 216",
		role: "img",
		"aria-label": "最少插入把串补成回文",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
				id: "pi-ar",
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
			/* @__PURE__ */ jsxs("text", {
				x: "260",
				y: "18",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: [
					"原串 ",
					/* @__PURE__ */ jsx("tspan", {
						className: "mono",
						fill: "var(--text-1)",
						children: "abcda"
					}),
					"（不是回文）"
				]
			}),
			src.map((c, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${srcX + i * 48},28)`,
				children: [/* @__PURE__ */ jsx("rect", {
					width: bw,
					height: "42",
					rx: "9",
					fill: "var(--surface-3)",
					stroke: "var(--border-strong)",
					strokeWidth: "1.5"
				}), /* @__PURE__ */ jsx("text", {
					x: bw / 2,
					y: "28",
					textAnchor: "middle",
					fontSize: "19",
					className: "mono",
					fill: "var(--text-1)",
					children: c
				})]
			}, i)),
			/* @__PURE__ */ jsx("path", {
				d: `M 260 74 V 122`,
				stroke: "var(--accent-2)",
				strokeWidth: "2",
				markerEnd: "url(#pi-ar)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "290",
				y: "102",
				textAnchor: "start",
				fontSize: "12",
				fill: "var(--accent-1)",
				children: "插入 2 个 = 5 − 3"
			}),
			/* @__PURE__ */ jsxs("text", {
				x: "260",
				y: "140",
				textAnchor: "middle",
				fontSize: "12.5",
				fill: "var(--text-2)",
				children: ["补齐为回文 ", /* @__PURE__ */ jsx("tspan", {
					className: "mono",
					fill: "var(--viz-chosen)",
					children: "abcdcba"
				})]
			}),
			out.map((o, i) => /* @__PURE__ */ jsxs("g", {
				transform: `translate(${outX + i * 48},150)`,
				children: [/* @__PURE__ */ jsx("rect", {
					width: bw,
					height: "42",
					rx: "9",
					fill: o.ins ? "color-mix(in srgb, var(--viz-source) 18%, var(--surface-3))" : "color-mix(in srgb, var(--viz-chosen) 14%, var(--surface-3))",
					stroke: o.ins ? "var(--viz-source)" : "var(--viz-chosen)",
					strokeWidth: o.ins ? 2.2 : 1.5,
					strokeDasharray: o.ins ? "4 3" : void 0
				}), /* @__PURE__ */ jsx("text", {
					x: bw / 2,
					y: "28",
					textAnchor: "middle",
					fontSize: "19",
					className: "mono",
					fill: o.ins ? "var(--text-on-accent)" : "var(--accent-1)",
					children: o.c
				})]
			}, i)),
			/* @__PURE__ */ jsx("text", {
				x: outX + 192 + bw / 2,
				y: "208",
				textAnchor: "middle",
				fontSize: "10.5",
				fill: "var(--viz-source)",
				children: "↑ 新插入"
			})
		]
	});
}
//#endregion
//#region src/content/c/Palindrome.tsx
var CODE_P1435 = `
#include <iostream>
#include <cstring>
using namespace std;

#define MX 1005
char s[MX];
int len;
int dp[MX][MX];   // dp[i][j]：把子串 s[i..j] 补成回文的最少插入次数

int main()
{
    cin >> (s + 1);                          // 1-based：字符放在 s[1..len]
    len = strlen(s + 1);

    // ★按区间长度由短到长递推；长度 1 的子串已是回文，dp 默认 0
    for (int L = 2; L <= len; L++)
    {
        for (int i = 1; i + L - 1 <= len; i++)
        {
            int j = i + L - 1;
            if (s[i] == s[j])                // 两端天然对称，直接内缩
            {
                dp[i][j] = dp[i + 1][j - 1];
            }
            else                             // 补一端与对端配对，代价 +1，取较省的一侧
            {
                dp[i][j] = min(dp[i + 1][j], dp[i][j - 1]) + 1;
            }
        }
    }

    cout << dp[1][len] << endl;              // dp[1][len] 即整串补成回文的最少插入次数
    return 0;
}
// TAG: 区间DP 回文 最少插入`;
var CODE_P4170 = `
#include <iostream>
#include <cstring>
using namespace std;

#define MX 55
char s[MX];
int len;
int dp[MX][MX];   // dp[i][j]：把区间 s[i..j] 刷成目标颜色的最少次数

int main()
{
    cin >> (s + 1);
    len = strlen(s + 1);

    memset(dp, 0x3f, sizeof(dp));
    for (int i = 1; i <= len; i++)
    {
        dp[i][i] = 1;                        // 单格必刷一次
    }

    for (int L = 2; L <= len; L++)
    {
        for (int i = 1; i + L - 1 <= len; i++)
        {
            int j = i + L - 1;
            if (s[i] == s[j])                // ★端点同色：一笔可顺带覆盖，省一次
            {
                dp[i][j] = min(dp[i + 1][j], dp[i][j - 1]);
            }
            else                             // 否则枚举分割点，两段各自刷再相加
            {
                for (int k = i; k <= j - 1; k++)
                {
                    dp[i][j] = min(dp[i][j], dp[i][k] + dp[k + 1][j]);
                }
            }
        }
    }

    cout << dp[1][len] << endl;
    return 0;
}
// TAG: 区间DP 回文 端点同色 涂色`;
function Palindrome() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "回文，与「藏在串里」的最长回文"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [/* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "回文串" }),
						"就是正着读、反着读一模一样的串：",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{aba}" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{noon}" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{racecar}" }),
						"。 本节要问的不是「整串是不是回文」，而是一个更有嚼头的问题：给一个",
						/* @__PURE__ */ jsx("strong", { children: "不一定回文" }),
						"的串，从中",
						/* @__PURE__ */ jsx("strong", { children: "按原次序挑出若干字符" }),
						"（不必相邻），能拼出的",
						/* @__PURE__ */ jsx("strong", { children: "最长回文" }),
						"有多长？这条挑出来的子序列，就叫",
						/* @__PURE__ */ jsx("strong", { children: "最长回文子序列" }),
						"（LPS）。"
					] }), /* @__PURE__ */ jsxs("p", { children: [
						"拿 ",
						/* @__PURE__ */ jsx(M, { children: "s=\\texttt{character}" }),
						" 做例子。把下标 ",
						/* @__PURE__ */ jsx(M, { children: "0,2,3,4,5" }),
						" 的字符挑出来是 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{carac}" }),
						"——正反都一样，是长度 ",
						/* @__PURE__ */ jsx("strong", { children: "5" }),
						" 的回文。能不能更长？把所有挑法试遍，最长就是 5。注意它",
						/* @__PURE__ */ jsx("strong", { children: "两端对称" }),
						"：最外一对 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{c}\\dots\\texttt{c}" }),
						" 相同，往里一对 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{a}\\dots\\texttt{a}" }),
						" 相同，正中留一个 ",
						/* @__PURE__ */ jsx(M, { children: "\\texttt{r}" }),
						"。"
					] })]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(PalindromeSetupFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "s=character，挑出下标 0 2 3 4 5 的 c a r a c。弧线把对称的字符两两勾出：外层 c↔c、内层 a↔a、中心 r 独坐——这正是回文「从两端向内成对」的结构。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"为什么不能",
						/* @__PURE__ */ jsx("strong", { children: "贪心" }),
						"地扫一遍随手配对？因为",
						/* @__PURE__ */ jsx("strong", { children: "此刻配哪一对，取决于内层还能配出多长" }),
						"——把某个字符过早用掉，可能挤掉里面一段更优的对称。穷举呢？长度 ",
						/* @__PURE__ */ jsx(M, { children: "n" }),
						" 的串子序列有 ",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 条，逐条判回文，指数爆炸。 但那句「回文从两端向内成对」正是",
						/* @__PURE__ */ jsx("strong", { children: "区间" }),
						"的味道：只盯住一段",
						/* @__PURE__ */ jsx("strong", { children: "连续区间的两个端点" }),
						"，就能把大问题剥成更短的子区间——这就是区间 DP 的入口。"
					] })
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "状态与转移：只看区间的两个端点"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						/* @__PURE__ */ jsx("strong", { children: "定状态。" }),
						"设 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
						" 表示",
						/* @__PURE__ */ jsxs("strong", { children: [
							"子串 ",
							/* @__PURE__ */ jsx(M, { children: "s[i..j]" }),
							" 这段连续区间"
						] }),
						"里，最长回文子序列的",
						/* @__PURE__ */ jsx("strong", { children: "长度" }),
						"。 要算它，只需盯住这段区间",
						/* @__PURE__ */ jsx("strong", { children: "最外的两个字符" }),
						" ",
						/* @__PURE__ */ jsx(M, { children: "s_i" }),
						" 与 ",
						/* @__PURE__ */ jsx(M, { children: "s_j" }),
						"——它俩相不相等，决定两条截然不同的路。"
					] })
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(CollapseFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "dp[i][j] 只看两端：相等就把这对字符裹在内层最优回文的两侧，长度 = 内层 dp[i+1][j−1] + 2（来源在左下、内缩一圈）；不等则至少丢一端，取 dp[i+1][j]（丢左）与 dp[i][j−1]（丢右）的较大者。"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "两端相等" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "s_i=s_j" }),
							"）：这对字符",
							/* @__PURE__ */ jsx("strong", { children: "可以且值得" }),
							"做回文的最外一层。把它俩裹在",
							/* @__PURE__ */ jsxs("strong", { children: [
								"内层 ",
								/* @__PURE__ */ jsx(M, { children: "s[i+1..j-1]" }),
								" 的最长回文"
							] }),
							"两侧，长度在内层基础上 ",
							/* @__PURE__ */ jsx(M, { children: "+2" }),
							"："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i][j]=dp[i+1][j-1]+2" }),
						/* @__PURE__ */ jsxs("p", { children: [
							/* @__PURE__ */ jsx("strong", { children: "两端不等" }),
							"（",
							/* @__PURE__ */ jsx(M, { children: "s_i\\ne s_j" }),
							"）：这两个端点",
							/* @__PURE__ */ jsx("strong", { children: "做不成同一对" }),
							"，那么最长回文里 ",
							/* @__PURE__ */ jsx(M, { children: "s_i" }),
							" 与 ",
							/* @__PURE__ */ jsx(M, { children: "s_j" }),
							" 至少有一个用不上。于是要么丢掉左端（转成 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i+1][j]" }),
							"），要么丢掉右端（转成 ",
							/* @__PURE__ */ jsx(M, { children: "dp[i][j-1]" }),
							"），谁大取谁："
						] }),
						/* @__PURE__ */ jsx(MB, { children: "dp[i][j]=\\max\\big(dp[i+1][j],\\ dp[i][j-1]\\big)" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"边界：",
							/* @__PURE__ */ jsx(M, { children: "dp[i][i]=1" }),
							"（单个字符自成回文），空区间记 ",
							/* @__PURE__ */ jsx(M, { children: "0" }),
							"。答案：",
							/* @__PURE__ */ jsx(M, { children: "dp[0][n-1]" }),
							"。 和其余区间 DP 一样，",
							/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
							" 依赖的三个来源（",
							/* @__PURE__ */ jsx(M, { children: "dp[i+1][j-1]" }),
							"、",
							/* @__PURE__ */ jsx(M, { children: "dp[i+1][j]" }),
							"、",
							/* @__PURE__ */ jsx(M, { children: "dp[i][j-1]" }),
							"）都是",
							/* @__PURE__ */ jsx("strong", { children: "更短的子区间" }),
							"。所以递推",
							/* @__PURE__ */ jsx("strong", { children: "不能" }),
							"按 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 或 ",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 顺序走，必须",
							/* @__PURE__ */ jsx("strong", { children: "按区间长度由短到长" }),
							"——或等价地，让 ",
							/* @__PURE__ */ jsx(M, { children: "i" }),
							" 从大到小、",
							/* @__PURE__ */ jsx(M, { children: "j" }),
							" 从小到大。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "key",
					title: "本质",
					children: [
						"回文的最长回文子序列被「连续区间 + 只看两端」拆成一张 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						" 的",
						/* @__PURE__ */ jsx("strong", { children: "三角表" }),
						"：每格只依赖",
						/* @__PURE__ */ jsx("strong", { children: "左下、下、左" }),
						"三个更短的子区间，一步 ",
						/* @__PURE__ */ jsx(M, { children: "O(1)" }),
						"。",
						/* @__PURE__ */ jsx(M, { children: "2^n" }),
						" 的枚举就此压进 ",
						/* @__PURE__ */ jsx(M, { children: "n^2/2" }),
						" 个上三角格子。",
						/* @__PURE__ */ jsx("strong", { children: "「端点相等则收缩 +2，不等则丢一端取大」" }),
						"——这条「收缩 vs 丢弃」的分野是全表的灵魂，也是后面括号匹配、涂色一整族区间问题的共同骨架。"
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
						"用一个短串 ",
						/* @__PURE__ */ jsx(M, { children: "s=\\texttt{bcabb}" }),
						"（下标 ",
						/* @__PURE__ */ jsx(M, { children: "0..4" }),
						"）走几步，重点盯住",
						/* @__PURE__ */ jsx("strong", { children: "长度由短到长" }),
						"、以及每格是「收缩」还是「取大」："
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
									/* @__PURE__ */ jsx("b", { children: "对角线（长度 1）。" }),
									" 每个字符自成回文：",
									/* @__PURE__ */ jsx(M, { children: "dp[i][i]=1" }),
									"。这是整张三角表的地基。"
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
									/* @__PURE__ */ jsx("b", { children: "长度 2" }),
									"：看两端等不等。",
									/* @__PURE__ */ jsx(M, { children: "dp[3][4]" }),
									"：",
									/* @__PURE__ */ jsx(M, { children: "s_3=\\texttt{b}=s_4" }),
									" 相等 → ",
									/* @__PURE__ */ jsx(M, { children: "0+2=2" }),
									"（内层为空记 0）。而 ",
									/* @__PURE__ */ jsx(M, { children: "dp[0][1]" }),
									"：",
									/* @__PURE__ */ jsx(M, { children: "s_0=\\texttt{b}\\ne s_1=\\texttt{c}" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "\\max(dp[1][1],dp[0][0])=1" }),
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
									/* @__PURE__ */ jsx("b", { children: "长度 3～4" }),
									"：",
									/* @__PURE__ */ jsx(M, { children: "dp[2][4]" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "\\texttt{abb}" }),
									"）：",
									/* @__PURE__ */ jsx(M, { children: "s_2=\\texttt{a}\\ne s_4=\\texttt{b}" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "\\max(dp[3][4],dp[2][3])=\\max(2,1)=2" }),
									"。",
									/* @__PURE__ */ jsx(M, { children: "dp[1][4]" }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "\\texttt{cabb}" }),
									"）：",
									/* @__PURE__ */ jsx(M, { children: "s_1=\\texttt{c}\\ne s_4=\\texttt{b}" }),
									" → ",
									/* @__PURE__ */ jsx(M, { children: "\\max(dp[2][4],dp[1][3])=\\max(2,1)=2" }),
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
									/* @__PURE__ */ jsxs("b", { children: ["长度 5，整段 ", /* @__PURE__ */ jsx(M, { children: "[0,4]" })] }),
									"（",
									/* @__PURE__ */ jsx(M, { children: "\\texttt{bcabb}" }),
									"）：",
									/* @__PURE__ */ jsx(M, { children: "s_0=\\texttt{b}=s_4" }),
									" 相等 → 收缩到内层 ",
									/* @__PURE__ */ jsx(M, { children: "dp[1][3]+2" }),
									"。",
									/* @__PURE__ */ jsx(M, { children: "dp[1][3]=\\texttt{cab}" }),
									" 端点不等取大得 ",
									/* @__PURE__ */ jsx(M, { children: "1" }),
									"，故 ",
									/* @__PURE__ */ jsx(M, { children: "dp[0][4]=1+2=3" }),
									"——最长回文子序列长 3（如 ",
									/* @__PURE__ */ jsx(M, { children: "\\texttt{bab}" }),
									" 或 ",
									/* @__PURE__ */ jsx(M, { children: "\\texttt{bcb}" }),
									"）。"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示会把三角表",
						/* @__PURE__ */ jsx("strong", { children: "按长度一层层填满" }),
						"，高亮每个 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
						" 是「相等收缩（左下）」还是「不等取大（下 / 左）」。改改字符串，看表实时重算。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "看三角表一层一层长出来 · 相等收缩、不等取大"
			}), /* @__PURE__ */ jsx("div", {
				className: "demo",
				children: /* @__PURE__ */ jsx("div", {
					className: "demo__body",
					children: /* @__PURE__ */ jsx(PalindromeDemo, {})
				})
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "section-title",
					children: "深化：最少插入构回文，与「括号 / 涂色」同族"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "prose",
					children: [
						/* @__PURE__ */ jsxs("p", { children: [
							"换一个看似不同的问题：给一个串，每次可在",
							/* @__PURE__ */ jsx("strong", { children: "任意位置插入一个字符" }),
							"，问",
							/* @__PURE__ */ jsx("strong", { children: "最少插入几次" }),
							"能让整串变回文？它和最长回文子序列其实是",
							/* @__PURE__ */ jsx("strong", { children: "同一枚硬币的两面" }),
							"——"
						] }),
						/* @__PURE__ */ jsx(MB, { children: "\\text{minInsert}=n-\\text{LPS}" }),
						/* @__PURE__ */ jsxs("p", { children: [
							"道理很直白：串里那条",
							/* @__PURE__ */ jsx("strong", { children: "最长回文子序列" }),
							"本就对称，一个字符都不用动；剩下的 ",
							/* @__PURE__ */ jsx(M, { children: "n-\\text{LPS}" }),
							" 个「落单」字符，每个补一个镜像伙伴即可配对。所以求最少插入，等价于求最长回文子序列，再用总长减去它。 也可以",
							/* @__PURE__ */ jsx("strong", { children: "直接" }),
							"写一张区间 DP：",
							/* @__PURE__ */ jsx(M, { children: "f[i][j]" }),
							" = 把 ",
							/* @__PURE__ */ jsx(M, { children: "s[i..j]" }),
							" 补成回文的最少插入；端点相等则 ",
							/* @__PURE__ */ jsx(M, { children: "f[i+1][j-1]" }),
							"，不等则 ",
							/* @__PURE__ */ jsx(M, { children: "\\min(f[i+1][j],f[i][j-1])+1" }),
							"——与上面的收缩 / 取大",
							/* @__PURE__ */ jsx("strong", { children: "结构一模一样" }),
							"，只是把 +2 换成 +0、把 max 换成 min+1。"
						] })
					]
				}),
				/* @__PURE__ */ jsxs("figure", {
					className: "figure",
					children: [/* @__PURE__ */ jsx(InsertFigure, {}), /* @__PURE__ */ jsx("figcaption", {
						className: "figure__cap",
						children: "abcda 不是回文：最长回文子序列 aba（长 3），落单的 c、d 里需补 2 个字符（= 5 − 3），补成 abcdcba。虚线框是新插入的镜像字符。"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"这套「",
						/* @__PURE__ */ jsx("strong", { children: "端点相等省一步、不等再拆" }),
						"」的骨架，正是一整族区间问题的共同模板。",
						/* @__PURE__ */ jsx("strong", { children: "括号 / 序列匹配" }),
						"同理：",
						/* @__PURE__ */ jsx(M, { children: "s_i" }),
						" 与 ",
						/* @__PURE__ */ jsx(M, { children: "s_j" }),
						" 若能配成一对括号，问题落到内层 ",
						/* @__PURE__ */ jsx(M, { children: "[i+1,j-1]" }),
						"，否则枚举分割点拆两段。",
						/* @__PURE__ */ jsx("strong", { children: "涂色（区间刷漆）" }),
						"也一样：两端颜色相同则一笔顺带覆盖、",
						/* @__PURE__ */ jsx("strong", { children: "省一次" }),
						"（",
						/* @__PURE__ */ jsx(M, { children: "f[i][j]=\\min(f[i+1][j],f[i][j-1])" }),
						"），不同则枚举分割点两段相加——正是例题 ",
						/* @__PURE__ */ jsx("strong", { children: "P4170" }),
						"。 记住这条主线：",
						/* @__PURE__ */ jsx("strong", { children: "区间 DP 的两端，要么配对内缩、要么拆点分治" }),
						"；回文是它最干净的入门形态。"
					] })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pointer-cue",
					children: [
						/* @__PURE__ */ jsx(MousePointerClick, { size: 18 }),
						"下面的演示把「最少插入构回文」",
						/* @__PURE__ */ jsx("strong", { children: "逐步跑给你看" }),
						"：双指针从两端逼近，相等内缩、不等就在较省一侧补一个镜像字符，直到补成回文。核对它的插入次数与上方三角表",
						/* @__PURE__ */ jsx("strong", { children: "同一答案" }),
						"。"
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "demo",
					children: /* @__PURE__ */ jsx("div", {
						className: "demo__body",
						children: /* @__PURE__ */ jsx(PalindromeInsertDemo, {})
					})
				}),
				/* @__PURE__ */ jsxs(InfoBox, {
					kind: "warn",
					title: "别混淆：回文子序列 vs 回文子串",
					children: [
						"本节的 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
						" 求的是最长回文",
						/* @__PURE__ */ jsx("strong", { children: "子序列" }),
						"（字符可不相邻，端点相等就 ",
						/* @__PURE__ */ jsx(M, { children: "+2" }),
						"）。另有一类求最长回文",
						/* @__PURE__ */ jsx("strong", { children: "子串" }),
						"（必须连续），转移与判定都不同：区间 DP 版本记 ",
						/* @__PURE__ */ jsx(M, { children: "g[i][j]" }),
						" = 「",
						/* @__PURE__ */ jsx(M, { children: "s[i..j]" }),
						" 整段是否回文」，",
						/* @__PURE__ */ jsx(M, { children: "g[i][j]=g[i+1][j-1]\\ \\&\\&\\ (s_i=s_j)" }),
						"，专业解法还有 ",
						/* @__PURE__ */ jsx("strong", { children: "Manacher" }),
						" 的 ",
						/* @__PURE__ */ jsx(M, { children: "O(n)" }),
						"。两者",
						/* @__PURE__ */ jsx("strong", { children: "状态含义不同、答案不同" }),
						"，别把「子序列」的 ",
						/* @__PURE__ */ jsx(M, { children: "+2" }),
						" 套到「子串」上。本页只讲子序列一族。"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "lesson",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "section-title",
				children: "为什么按长度递推：填表顺序与复杂度"
			}), /* @__PURE__ */ jsxs("div", {
				className: "prose",
				children: [
					/* @__PURE__ */ jsxs("p", { children: [
						"回文区间 DP 的表是个",
						/* @__PURE__ */ jsx("strong", { children: "上三角" }),
						"（只有 ",
						/* @__PURE__ */ jsx(M, { children: "i\\le j" }),
						" 才是合法区间）。",
						/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
						" 的三个来源 ",
						/* @__PURE__ */ jsx(M, { children: "dp[i+1][j-1]" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "dp[i+1][j]" }),
						"、",
						/* @__PURE__ */ jsx(M, { children: "dp[i][j-1]" }),
						" 的",
						/* @__PURE__ */ jsxs("strong", { children: [
							"区间长度都比 ",
							/* @__PURE__ */ jsx(M, { children: "[i,j]" }),
							" 短"
						] }),
						"。 只要",
						/* @__PURE__ */ jsx("strong", { children: "先把所有短区间算完" }),
						"，长区间要用的就",
						/* @__PURE__ */ jsx("strong", { children: "都已就绪" }),
						"。这就是「外层枚举长度 ",
						/* @__PURE__ */ jsx(M, { children: "L=2\\ldots n" }),
						"、内层枚举左端点 ",
						/* @__PURE__ */ jsx(M, { children: "i" }),
						"」的由来——最长回文子序列没有分割点那层枚举，故是 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
						"（括号 / 涂色因带分割点枚举升到 ",
						/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
						"）："
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
						children: `for i = 0 … n-1:                 // 长度 1：单字符自成回文
  dp[i][i] = 1
for 长度 L = 2 … n:               // ★外层枚举区间长度，由短到长
  for 左端点 i = 0 … n-L:
    j = i + L - 1
    if s[i] == s[j]:              // 端点相等 → 收缩内层再 +2
      dp[i][j] = (L == 2 ? 0 : dp[i+1][j-1]) + 2
    else:                        // 端点不等 → 丢一端取大
      dp[i][j] = max(dp[i+1][j], dp[i][j-1])`
					}),
					/* @__PURE__ */ jsxs("p", { children: [
						"这份「外层长度、端点决定收缩或取大」的骨架，把它记死：它是回文、最少插入、括号匹配、涂色一整族题的",
						/* @__PURE__ */ jsx("strong", { children: "通用模具" }),
						"。"
					] })
				]
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
					pid: "P1435",
					name: "[IOI2000] 回文字串",
					src: "IOI2000",
					diff: "普及/提高-",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"给一个串，每次可在任意位置插入一个字符，求使整串成为回文串的",
								/* @__PURE__ */ jsx("strong", { children: "最少插入次数" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"正是本页深化的",
								/* @__PURE__ */ jsxs("strong", { children: ["最少插入 = ", /* @__PURE__ */ jsx(M, { children: "n-\\text{LPS}" })] }),
								"。可直接写区间 DP：",
								/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
								" = 补成回文的最少插入，端点相等 ",
								/* @__PURE__ */ jsx(M, { children: "dp[i+1][j-1]" }),
								"、不等 ",
								/* @__PURE__ */ jsx(M, { children: "\\min(dp[i+1][j],dp[i][j-1])+1" }),
								"——与最长回文子序列",
								/* @__PURE__ */ jsx("strong", { children: "同一收缩结构" }),
								"，参考代码用的就是它。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"经典的 IOI 入门题，把「插入构回文」和「最长回文子序列」两个视角",
								/* @__PURE__ */ jsx("strong", { children: "焊在一起" }),
								"的最佳载体：收缩过程一步步演示极佳，也让你亲手确认 ",
								/* @__PURE__ */ jsx(M, { children: "n-\\text{LPS}" }),
								" 这条恒等式。注意串可能含大小写混合与数字，全部按字符比较即可。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								"端点相等 ",
								/* @__PURE__ */ jsx(M, { children: "dp[i][j]=dp[i+1][j-1]" }),
								"；不等 ",
								/* @__PURE__ */ jsx(M, { children: "dp[i][j]=\\min(dp[i+1][j],dp[i][j-1])+1" }),
								"。外层长度、内层左端点；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^2)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（最少插入 · 区间 DP）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P1435,
								luogu: "P1435"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(ExampleCard, {
					pid: "P4170",
					name: "[CQOI2007] 涂色",
					src: "CQOI2007",
					diff: "普及+/提高",
					children: [
						/* @__PURE__ */ jsxs(Field, {
							k: "题意",
							children: [
								"一段木板每格有目标颜色，每次可把一段",
								/* @__PURE__ */ jsx("strong", { children: "连续区间" }),
								"刷成同一颜色（后刷覆盖先刷）。求刷出目标配色的最少次数。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "对应关系",
							children: [
								"端点决定收缩 / 分治的",
								/* @__PURE__ */ jsx("strong", { children: "另一面孔" }),
								"：",
								/* @__PURE__ */ jsx(M, { children: "dp[i][j]" }),
								" = 刷好 ",
								/* @__PURE__ */ jsx(M, { children: "[i,j]" }),
								" 的最少次数。",
								/* @__PURE__ */ jsx("strong", { children: "两端颜色相同" }),
								"时，可让某一端的一笔顺带覆盖到另一端，",
								/* @__PURE__ */ jsx("strong", { children: "省一次" }),
								"：",
								/* @__PURE__ */ jsx(M, { children: "dp[i][j]=\\min(dp[i+1][j],dp[i][j-1])" }),
								"；不同则枚举分割点 ",
								/* @__PURE__ */ jsx(M, { children: "k" }),
								" 把两段各自刷再相加。与回文的「端点相等省一步」如出一辙。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "为什么选它",
							children: [
								"省选级区间 DP 的",
								/* @__PURE__ */ jsx("strong", { children: "招牌题" }),
								"：它把回文那条「端点同色 → 优化一步」的直觉，落到「刷漆次数」上，还多出一层",
								/* @__PURE__ */ jsx("strong", { children: "分割点枚举" }),
								"（故 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
								"）。写通它，你就掌握了区间 DP「端点特判 + 分治枚举」的完整模具。"
							]
						}),
						/* @__PURE__ */ jsxs(Field, {
							k: "转移 · 复杂度",
							children: [
								/* @__PURE__ */ jsx(M, { children: "s_i=s_j:\\ dp[i][j]=\\min(dp[i+1][j],dp[i][j-1])" }),
								"；否则 ",
								/* @__PURE__ */ jsx(M, { children: "dp[i][j]=\\min_k(dp[i][k]+dp[k+1][j])" }),
								"。外层长度、内层左端点、最内分割点；时间 ",
								/* @__PURE__ */ jsx(M, { children: "O(n^3)" }),
								"。"
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							k: "参考代码（端点同色优化 · 分割点枚举）",
							children: /* @__PURE__ */ jsx(CodeBlock, {
								code: CODE_P4170,
								luogu: "P4170"
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
					pid: "P3205",
					name: "[HNOI2010] 合唱队",
					hint: "区间 DP 按端点「插入方向」计数：每个人从左端或右端插入当前队列，设 dp[i][j][0/1] 表示区间 [i,j] 且最后一个是从左 / 右插入的方案数，转移按新人比端点高矮决定能从哪侧接上。与回文的「端点决策」同源，只是把「取值」换成「计数」。"
				}),
				/* @__PURE__ */ jsx(Exercise, {
					pid: "P2426",
					name: "删数",
					hint: "区间删除合并：dp[i][j] = 删空区间 [i,j] 能得的最大价值。单个数单独删，或若两端满足给定条件可一起删并加权；否则枚举分割点把区间拆两段相加。端点特判 + 分割点枚举，正是本页涂色一族的骨架。"
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "pointer-cue",
			children: [
				/* @__PURE__ */ jsx(Gamepad2, { size: 18 }),
				"想更直观地感受「端点配对如何向内收缩」？到 ",
				/* @__PURE__ */ jsx(Link, {
					to: "/part/c",
					style: {
						color: "var(--accent-1)",
						fontWeight: 600
					},
					children: "C 部分页"
				}),
				"的互动里亲手挑一条回文子序列，再看 DP 给出的最优。"
			]
		})
	] });
}
//#endregion
export { Palindrome as default };
