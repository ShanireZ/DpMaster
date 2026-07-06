import { useEffect, useRef, useState } from 'react'

/**
 * 404 背景层 · WebGL 暖调流场。
 * 手写 GLSL：双重 domain-warp fbm 噪声，映射到 Warm Ink 暖墨→琥珀→蜜金调色，
 * 极慢流动、指针微辉光、边缘压暗。WebGL 不可用时降级为 CSS 渐变；
 * prefers-reduced-motion 只渲一帧静止；离屏（切后台）暂停 rAF。
 */

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}`

const FRAG = `precision mediump float;
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
}`

export default function ShaderField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) {
      setFailed(true)
      return
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)
      if (!sh) return null
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      return sh
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    if (!vs || !fs || !prog) {
      setFailed(true)
      return
    }
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true)
      return
    }
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aLoc = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(aLoc)
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')

    const mouse = { x: 0.5, y: 0.5 }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = (e.clientX - r.left) / Math.max(1, r.width)
      mouse.y = 1 - (e.clientY - r.top) / Math.max(1, r.height)
    }
    window.addEventListener('pointermove', onMove)

    const dpr = Math.min(1.5, window.devicePixelRatio || 1)
    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const w = Math.round(r.width), h = Math.round(r.height)
      if (w < 2 || h < 2) return
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    let raf = 0
    let running = true
    let start = performance.now()
    const frame = () => {
      // 每帧内联自愈：显示尺寸与当前缓冲不符就重建（不依赖 RO/resize 事件时序）
      const rect = canvas.getBoundingClientRect()
      const rw = Math.round(rect.width * dpr), rh = Math.round(rect.height * dpr)
      if (rw >= 2 && (Math.abs(rw - canvas.width) > 1 || Math.abs(rh - canvas.height) > 1)) resize()
      if (canvas.width >= 2) {
        const t = (performance.now() - start) / 1000
        gl.uniform2f(uRes, canvas.width, canvas.height)
        gl.uniform1f(uTime, t)
        gl.uniform2f(uMouse, mouse.x, mouse.y)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }
      if (running && !reduce) raf = requestAnimationFrame(frame)
    }
    const onResize = () => { resize(); if (reduce) frame() }
    resize()
    requestAnimationFrame(onResize)
    const ro = new ResizeObserver(onResize)
    ro.observe(canvas)
    window.addEventListener('resize', onResize)
    frame()

    const onVis = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!reduce) {
        running = true
        start = performance.now() - 0
        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  if (failed) return <div className="nf__bg-fallback" aria-hidden="true" />
  return <canvas ref={canvasRef} className="nf__shader" aria-hidden="true" />
}
