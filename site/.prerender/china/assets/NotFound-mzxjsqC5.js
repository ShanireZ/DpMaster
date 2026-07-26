import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/notfound/ShaderField.tsx
/**
* 404 背景层 · WebGL 暖调流场。
* 手写 GLSL：双重 domain-warp fbm 噪声，映射到 Warm Ink 暖墨→琥珀→蜜金调色，
* 极慢流动、指针微辉光、边缘压暗。WebGL 不可用时降级为 CSS 渐变；
* prefers-reduced-motion 只渲一帧静止；离屏（切后台）暂停 rAF。
*/
var VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}`;
var FRAG = `precision mediump float;
uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);
  float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));
  vec2 u=f*f*(3.0-2.0*f);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.02;a*=0.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res.xy;
  float asp=u_res.x/max(u_res.y,1.0);
  vec2 p=vec2(uv.x*asp,uv.y)*2.6;
  float t=u_time*0.045;
  vec2 q=vec2(fbm(p+vec2(0.0,t)),fbm(p+vec2(5.2,-t)));
  vec2 r=vec2(fbm(p+2.0*q+vec2(1.7,9.2)+0.5*t),fbm(p+2.0*q+vec2(8.3,2.8)-0.5*t));
  float f=fbm(p+2.2*r);
  vec3 ink=vec3(0.043,0.039,0.035);
  vec3 ember=vec3(0.40,0.22,0.10);
  vec3 honey=vec3(0.86,0.62,0.29);
  vec3 col=mix(ink,ember,smoothstep(0.20,0.78,f));
  col=mix(col,honey,smoothstep(0.62,1.08,f*f));
  vec2 pp=vec2(uv.x*asp,uv.y);
  vec2 m=vec2(u_mouse.x*asp,u_mouse.y);
  col+=honey*0.10*smoothstep(0.42,0.0,distance(pp,m));
  float vig=smoothstep(1.25,0.35,length(uv-0.5));
  col*=0.42+0.58*vig;
  col+=(hash(gl_FragCoord.xy+u_time)-0.5)*0.02;
  gl_FragColor=vec4(max(col,0.0),1.0);
}`;
function ShaderField() {
	const canvasRef = useRef(null);
	const [failed, setFailed] = useState(false);
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const gl = canvas.getContext("webgl", {
			antialias: false,
			alpha: false,
			powerPreference: "low-power"
		});
		if (!gl) {
			setFailed(true);
			return;
		}
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const compile = (type, src) => {
			const sh = gl.createShader(type);
			if (!sh) return null;
			gl.shaderSource(sh, src);
			gl.compileShader(sh);
			return sh;
		};
		const vs = compile(gl.VERTEX_SHADER, VERT);
		const fs = compile(gl.FRAGMENT_SHADER, FRAG);
		const prog = gl.createProgram();
		if (!vs || !fs || !prog) {
			setFailed(true);
			return;
		}
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			setFailed(true);
			return;
		}
		gl.useProgram(prog);
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1,
			-1,
			3,
			-1,
			-1,
			3
		]), gl.STATIC_DRAW);
		const aLoc = gl.getAttribLocation(prog, "a");
		gl.enableVertexAttribArray(aLoc);
		gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
		const uRes = gl.getUniformLocation(prog, "u_res");
		const uTime = gl.getUniformLocation(prog, "u_time");
		const uMouse = gl.getUniformLocation(prog, "u_mouse");
		const mouse = {
			x: .5,
			y: .5
		};
		const onMove = (e) => {
			const r = canvas.getBoundingClientRect();
			mouse.x = (e.clientX - r.left) / Math.max(1, r.width);
			mouse.y = 1 - (e.clientY - r.top) / Math.max(1, r.height);
		};
		window.addEventListener("pointermove", onMove);
		const dpr = Math.min(1.5, window.devicePixelRatio || 1);
		const resize = () => {
			const r = canvas.getBoundingClientRect();
			const w = Math.round(r.width), h = Math.round(r.height);
			if (w < 2 || h < 2) return;
			canvas.width = Math.max(1, Math.floor(w * dpr));
			canvas.height = Math.max(1, Math.floor(h * dpr));
			gl.viewport(0, 0, canvas.width, canvas.height);
		};
		let raf = 0;
		let running = true;
		let start = performance.now();
		const frame = () => {
			const rect = canvas.getBoundingClientRect();
			const rw = Math.round(rect.width * dpr), rh = Math.round(rect.height * dpr);
			if (rw >= 2 && (Math.abs(rw - canvas.width) > 1 || Math.abs(rh - canvas.height) > 1)) resize();
			if (canvas.width >= 2) {
				const t = (performance.now() - start) / 1e3;
				gl.uniform2f(uRes, canvas.width, canvas.height);
				gl.uniform1f(uTime, t);
				gl.uniform2f(uMouse, mouse.x, mouse.y);
				gl.drawArrays(gl.TRIANGLES, 0, 3);
			}
			if (running && !reduce) raf = requestAnimationFrame(frame);
		};
		const onResize = () => {
			resize();
			if (reduce) frame();
		};
		resize();
		requestAnimationFrame(onResize);
		const ro = new ResizeObserver(onResize);
		ro.observe(canvas);
		window.addEventListener("resize", onResize);
		frame();
		const onVis = () => {
			if (document.hidden) {
				running = false;
				cancelAnimationFrame(raf);
			} else if (!reduce) {
				running = true;
				start = performance.now() - 0;
				raf = requestAnimationFrame(frame);
			}
		};
		document.addEventListener("visibilitychange", onVis);
		return () => {
			running = false;
			cancelAnimationFrame(raf);
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("resize", onResize);
			document.removeEventListener("visibilitychange", onVis);
			ro.disconnect();
			gl.getExtension("WEBGL_lose_context")?.loseContext();
		};
	}, []);
	if (failed) return /* @__PURE__ */ jsx("div", {
		className: "nf__bg-fallback",
		"aria-hidden": "true"
	});
	return /* @__PURE__ */ jsx("canvas", {
		ref: canvasRef,
		className: "nf__shader",
		"aria-hidden": "true"
	});
}
//#endregion
//#region src/components/notfound/GridSolver.tsx
/**
* 404 中景层 · Canvas 2D 的 DP 叙事。
* 一张 DP 表：填表波沿对角线（无后效性顺序）逐格点亮，一条「最优路径」抢先冲向
* 画面中央的断层；越过断层边缘时路径断裂、红叉标记、碎片四散——隐喻「无法到达的状态」。
* 指针经过会激起青色涟漪（重新计算的转移）。配色全部取自 tokens 的 --viz-* 语义色。
* prefers-reduced-motion 只渲一帧静止残局；离屏暂停。replayKey 变化即重挂载重播。
*/
function GridSolver() {
	const ref = useRef(null);
	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const css = getComputedStyle(document.documentElement);
		const tok = (n, f) => css.getPropertyValue(n).trim() || f;
		const C = {
			cell2: tok("--viz-cell-2", "#201b17"),
			settled: tok("--viz-settled", "#57524b"),
			current: tok("--viz-current", "#ef9f5e"),
			source: tok("--viz-source", "#6fb6c6"),
			chosen: tok("--viz-chosen", "#93c06b"),
			invalid: tok("--viz-invalid", "#e07e7e"),
			border: tok("--border-strong", "rgba(240,234,225,0.16)")
		};
		let W = 0, H = 0, cell = 46, cols = 0, rows = 0, vTop = 0, vBot = 0;
		let path = [];
		const build = () => {
			const r = canvas.getBoundingClientRect();
			const nw = Math.round(r.width), nh = Math.round(r.height);
			if (nw < 2 || nh < 2) return;
			W = nw;
			H = nh;
			canvas.width = Math.floor(W * dpr);
			canvas.height = Math.floor(H * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			cell = W < 640 ? 30 : W < 1024 ? 38 : 46;
			cols = Math.ceil(W / cell) + 1;
			rows = Math.ceil(H / cell) + 1;
			vTop = Math.floor(rows * .42);
			vBot = Math.ceil(rows * .58);
			path = [{
				x: 0,
				y: 0
			}];
			let x = 0, y = 0;
			const target = Math.max(2, Math.floor(cols * .46));
			while (y < vTop) {
				if (x < target && (x + y) % 3 !== 0) x++;
				else y++;
				path.push({
					x,
					y
				});
			}
		};
		build();
		requestAnimationFrame(build);
		const ro = new ResizeObserver(build);
		ro.observe(canvas);
		window.addEventListener("resize", build);
		const isVoid = (j) => j >= vTop && j < vBot;
		const mouse = {
			i: -99,
			j: -99,
			t: -1
		};
		const onMove = (e) => {
			const r = canvas.getBoundingClientRect();
			mouse.i = Math.floor((e.clientX - r.left) / cell);
			mouse.j = Math.floor((e.clientY - r.top) / cell);
			mouse.t = performance.now();
		};
		window.addEventListener("pointermove", onMove);
		let parts = [];
		const spawn = (cx, cy) => {
			for (let k = 0; k < 36; k++) {
				const a = Math.random() * Math.PI * 2;
				const sp = 40 + Math.random() * 170;
				parts.push({
					x: cx,
					y: cy,
					vx: Math.cos(a) * sp,
					vy: Math.sin(a) * sp - 40,
					life: 0,
					max: .7 + Math.random() * .8
				});
			}
		};
		const arrow = (x1, y1, x2, y2, color, alpha) => {
			ctx.strokeStyle = color;
			ctx.globalAlpha = alpha;
			ctx.lineWidth = 1.4;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			const ang = Math.atan2(y2 - y1, x2 - x1);
			const h = 5;
			ctx.beginPath();
			ctx.moveTo(x2, y2);
			ctx.lineTo(x2 - h * Math.cos(ang - .5), y2 - h * Math.sin(ang - .5));
			ctx.moveTo(x2, y2);
			ctx.lineTo(x2 - h * Math.cos(ang + .5), y2 - h * Math.sin(ang + .5));
			ctx.stroke();
			ctx.globalAlpha = 1;
		};
		const FORWARD = 3.6, HOLD = .9, BACK = 3;
		const PERIOD = 7.5;
		let start = performance.now(), last = start, raf = 0, running = true;
		let lastPhase = 0, burst = false;
		const render = (now) => {
			const rect = canvas.getBoundingClientRect();
			const rw = Math.round(rect.width), rh = Math.round(rect.height);
			if (rw >= 2 && rh >= 2 && (Math.abs(rw - W) > 1 || Math.abs(rh - H) > 1)) build();
			if (W < 2 || path.length < 2) {
				raf = requestAnimationFrame(render);
				return;
			}
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			const elapsed = (now - start) / 1e3;
			const phase = reduce ? FORWARD : elapsed % PERIOD;
			if (phase < lastPhase) {
				burst = false;
				parts = [];
			}
			lastPhase = phase;
			let prog;
			if (phase < FORWARD) prog = phase / FORWARD;
			else if (phase < 4.5) prog = 1;
			else prog = 1 - (phase - FORWARD - HOLD) / BACK;
			const front = prog * (cols + vTop + 2);
			const pathLen = path.length;
			const s = cell - 3;
			ctx.clearRect(0, 0, W, H);
			for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
				const x = i * cell + 1.5, y = j * cell + 1.5;
				if (isVoid(j)) {
					const d = (j - vTop) / Math.max(1, vBot - vTop);
					ctx.fillStyle = "#000";
					ctx.globalAlpha = .34 * (1 - Math.abs(d - .5) * 1.4);
					ctx.fillRect(x, y, s, s);
					ctx.globalAlpha = 1;
					continue;
				}
				ctx.fillStyle = C.cell2;
				ctx.globalAlpha = .45;
				ctx.fillRect(x, y, s, s);
				ctx.strokeStyle = C.border;
				ctx.globalAlpha = .5;
				ctx.lineWidth = 1;
				ctx.strokeRect(x, y, s, s);
				ctx.globalAlpha = 1;
				const diag = i + j;
				if (diag < front - 1.6) {
					ctx.fillStyle = C.settled;
					ctx.globalAlpha = .2;
					ctx.fillRect(x, y, s, s);
					ctx.globalAlpha = 1;
				}
				const band = front - diag;
				if (band >= 0 && band < 1.8) {
					ctx.fillStyle = C.current;
					ctx.globalAlpha = .55 * (1 - band / 1.8);
					ctx.fillRect(x, y, s, s);
					ctx.globalAlpha = 1;
				}
				if (mouse.t > 0) {
					const dtm = (now - mouse.t) / 1e3;
					if (dtm < 1.1) {
						const dd = Math.hypot(i - mouse.i, j - mouse.j);
						if (Math.abs(dd - dtm * 9) < 1) {
							ctx.fillStyle = C.source;
							ctx.globalAlpha = .45 * (1 - dtm / 1.1);
							ctx.fillRect(x, y, s, s);
							ctx.globalAlpha = 1;
						}
					}
				}
			}
			const shown = Math.max(1, Math.min(pathLen, Math.floor(front)));
			ctx.strokeStyle = C.chosen;
			ctx.lineWidth = 3;
			ctx.lineJoin = "round";
			ctx.lineCap = "round";
			ctx.globalAlpha = .92;
			ctx.beginPath();
			for (let k = 0; k < shown; k++) {
				const px = path[k].x * cell + cell / 2, py = path[k].y * cell + cell / 2;
				if (k === 0) ctx.moveTo(px, py);
				else ctx.lineTo(px, py);
			}
			ctx.stroke();
			ctx.globalAlpha = 1;
			for (let k = 2; k < shown - 1; k += 3) {
				const a = path[k], b = path[k + 1];
				arrow(a.x * cell + cell / 2, a.y * cell + cell / 2, b.x * cell + cell / 2, b.y * cell + cell / 2, C.source, .5);
			}
			if (shown >= 1 && front < pathLen) {
				const hd = path[shown - 1];
				const hx = hd.x * cell + cell / 2, hy = hd.y * cell + cell / 2;
				ctx.fillStyle = C.current;
				ctx.shadowColor = C.current;
				ctx.shadowBlur = 18;
				ctx.beginPath();
				ctx.arc(hx, hy, 5, 0, Math.PI * 2);
				ctx.fill();
				ctx.shadowBlur = 0;
			}
			const end = path[pathLen - 1];
			const ex = end.x * cell + cell / 2, ey = end.y * cell + cell / 2;
			if (front >= pathLen && !burst && !reduce) {
				spawn(ex, ey);
				burst = true;
			}
			if (front >= pathLen) {
				ctx.strokeStyle = C.invalid;
				ctx.globalAlpha = .9;
				ctx.lineWidth = 2.5;
				const r = 8;
				ctx.beginPath();
				ctx.moveTo(ex - r, ey - r);
				ctx.lineTo(ex + r, ey + r);
				ctx.moveTo(ex + r, ey - r);
				ctx.lineTo(ex - r, ey + r);
				ctx.stroke();
				ctx.globalAlpha = 1;
			}
			parts.forEach((p) => {
				p.life += dt;
				p.vy += 220 * dt;
				p.x += p.vx * dt;
				p.y += p.vy * dt;
				ctx.fillStyle = C.invalid;
				ctx.globalAlpha = Math.max(0, 1 - p.life / p.max);
				ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
			});
			ctx.globalAlpha = 1;
			parts = parts.filter((p) => p.life < p.max);
			if (running && !reduce) raf = requestAnimationFrame(render);
		};
		raf = requestAnimationFrame(render);
		const onVis = () => {
			if (document.hidden) {
				running = false;
				cancelAnimationFrame(raf);
			} else if (!reduce) {
				running = true;
				last = performance.now();
				raf = requestAnimationFrame(render);
			}
		};
		document.addEventListener("visibilitychange", onVis);
		return () => {
			running = false;
			cancelAnimationFrame(raf);
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("resize", build);
			document.removeEventListener("visibilitychange", onVis);
			ro.disconnect();
		};
	}, []);
	return /* @__PURE__ */ jsx("canvas", {
		ref,
		className: "nf__grid",
		"aria-hidden": "true"
	});
}
//#endregion
//#region src/pages/NotFound.tsx
/**
* 404 · 越界的状态。
* 把「页面不存在」双关成 DP 的「状态不可达」。
* 背景 WebGL 流场 + Canvas DP 填表与断裂路径（往返播放：正放填表→断裂→倒放收回）。
*/
function NotFound() {
	return /* @__PURE__ */ jsxs("div", {
		className: "nf",
		children: [
			/* @__PURE__ */ jsx(ShaderField, {}),
			/* @__PURE__ */ jsx(GridSolver, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "nf__stage",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "nf__badge",
						children: "HTTP 404 · Out of Bounds"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "nf__code",
						"aria-hidden": "true",
						children: [
							/* @__PURE__ */ jsx("span", { children: "4" }),
							/* @__PURE__ */ jsx("span", { children: "0" }),
							/* @__PURE__ */ jsx("span", { children: "4" })
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "nf__eq",
						"aria-hidden": "true",
						children: [/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx("i", { children: "f" }),
							"[",
							/* @__PURE__ */ jsx("i", { children: "page" }),
							"]\xA0=\xA0",
							/* @__PURE__ */ jsx("b", { children: "−∞" })
						] }), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { children: "state" }), "\xA0∉\xA0reachable"] })]
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "nf__title",
						children: "状态不可达 · 页面越界"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "nf__desc",
						children: "你请求的状态不在 DP 表的可达集合里。"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "nf__cta",
						children: /* @__PURE__ */ jsxs(Link, {
							to: "/",
							className: "nf-btn nf-btn--primary",
							children: [/* @__PURE__ */ jsx(ArrowLeft, { size: 18 }), " 回到 dp[0][0]"]
						})
					})
				]
			})
		]
	});
}
//#endregion
export { NotFound as default };
