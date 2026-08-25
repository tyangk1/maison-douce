"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * HeroCanvas — a single raw-WebGL fragment shader rendering a slowly drifting
 * warm "flour grain" field behind the hero headline. ~2KB of JS instead of a
 * Three.js dependency.
 *
 * Policy (VISUAL_DIRECTION.md §13):
 * - dynamically imported after first paint; never blocks LCP
 * - paused off-screen via IntersectionObserver
 * - static gradient fallback for: reduced motion, missing WebGL, or any error
 */

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_motion;

float hash(vec2 q) { return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 q) {
  vec2 i = floor(q), f = fract(q);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  // Warm paper base: cream -> sand, lit from upper right
  vec3 cream = vec3(0.984, 0.968, 0.945);
  vec3 sand  = vec3(0.914, 0.870, 0.812);
  vec3 gold  = vec3(0.725, 0.541, 0.266);

  float t = u_time * 0.03 * u_motion;
  float n1 = noise(uv * 3.0 + vec2(t, -t * 0.6));
  float n2 = noise(uv * 7.0 - vec2(t * 0.7, t));
  float n3 = noise(uv * 18.0 + n1 * 1.4 + t);          // grain speckle
  float grain = smoothstep(0.72, 0.98, n3) * 0.10 * u_motion;

  vec3 col = mix(cream, sand, smoothstep(0.15, 0.95, uv.x * 0.55 + uv.y * 0.6 + n1 * 0.28));
  col = mix(col, gold, smoothstep(0.62, 1.0, n2 * 0.75 + uv.x * 0.35) * 0.16);
  col += grain;

  // Vignette keeps text contrast high in the reading zone
  float vig = smoothstep(1.25, 0.35, length(uv - vec2(0.85, 0.25)));
  col *= mix(1.0, 0.94, vig);
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
  return s;
}

export default function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;
    // Skip on low-memory devices and when WebGL is unavailable.
    const nav = navigator as Navigator & { deviceMemory?: number };
    if ((nav.deviceMemory ?? 8) < 2) return;
    try {
      const test = document.createElement("canvas").getContext("webgl");
      if (!test) return;
    } catch {
      return;
    }
    setEnabled(true);
  }, [reduce]);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const canvas = ref.current;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) {
      setEnabled(false);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      setEnabled(false);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setEnabled(false);
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMotion = gl.getUniformLocation(prog, "u_motion");

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(canvas);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function resize() {
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl!.viewport(0, 0, w, h);
      }
    }
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = 0;
    const start = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 33) return; // ~30fps cap, pause off-screen
      last = now;
      resize();
      gl!.uniform2f(uRes, canvas.width, canvas.height);
      gl!.uniform1f(uTime, (now - start) / 1000);
      gl!.uniform1f(uMotion, reduce ? 0 : 1);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [enabled, reduce]);

  if (!enabled) {
    // Static fallback — same palette as the shader's average output.
    return (
      <div aria-hidden className="absolute inset-0 bg-gradient-to-bl from-parchment via-cream to-sand" />
    );
  }

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}
