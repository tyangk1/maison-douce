"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type SceneQuality = {
  segments: number;
  dustCount: number;
  dpr: [number, number];
  grains: number;
};

export type SceneProps = {
  quality: SceneQuality;
  active: boolean;
  scrollRef: React.MutableRefObject<number>;
  onReady?: () => void;
};

/* ------------------------------------------------------------------ */
/* Procedural sourdough boule — CPU-displaced icosahedron, built once  */
/* ------------------------------------------------------------------ */
function useBouleGeometry(segments: number) {
  return useMemo(() => {
    // Polyhedron geometry is non-indexed (flat shading); merge duplicate
    // vertices first so computeVertexNormals yields smooth organic normals.
    const raw = new THREE.IcosahedronGeometry(1.35, segments);
    const geo = mergeVertices(raw, 1e-4);
    raw.dispose();
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      // Layered organic displacement — oven-spring irregularity
      const d =
        0.09 * Math.sin(n.x * 3.1 + 1.3) * Math.sin(n.y * 2.3 - 0.7) +
        0.05 * Math.sin(n.y * 5.2 + n.z * 3.9) +
        0.03 * Math.sin(n.z * 9.1 + n.x * 7.3);
      v.addScaledVector(n, d);
      v.y *= 0.86; // gently proofed, slightly flattened
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, [segments]);
}

function Boule({ segments, scrollRef }: { segments: number; scrollRef: SceneProps["scrollRef"] }) {
  const geo = useBouleGeometry(segments);
  const mesh = useRef<THREE.Mesh>(null);
  const bornAt = useRef<number | null>(null);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    if (bornAt.current === null) bornAt.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - bornAt.current;
    // Cinematic emergence: rises from 0.55 with soft overshoot over ~1.6s
    const emerge = Math.min(age / 1.6, 1);
    const eased = 1 - Math.pow(1 - emerge, 3);
    m.scale.setScalar(0.55 + 0.45 * eased);
    m.rotation.y += delta * 0.12;
    m.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
    // Scroll: drifts upward and recedes as the hero hands off to content
    const s = scrollRef.current ?? 0;
    m.position.y = s * 0.9;
    m.scale.setScalar((0.55 + 0.45 * eased) * (1 - s * 0.18));
  });

  return (
    <mesh ref={mesh} geometry={geo} position={[0, -0.1, 0]}>
      <meshStandardMaterial color="#a97743" roughness={0.58} metalness={0.03} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Flour dust — single Points cloud with a soft radial sprite          */
/* ------------------------------------------------------------------ */
function FlourDust({ count, scrollRef }: { count: number; scrollRef: SceneProps["scrollRef"] }) {
  const points = useRef<THREE.Points>(null);
  const bornAt = useRef<number | null>(null);

  const { geometry, sprite } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
      speeds[i] = 0.08 + Math.random() * 0.22;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const cnv = document.createElement("canvas");
    cnv.width = cnv.height = 64;
    const ctx = cnv.getContext("2d")!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,244,224,1)");
    grad.addColorStop(0.4, "rgba(255,244,224,0.55)");
    grad.addColorStop(1, "rgba(255,244,224,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(cnv);
    return { geometry: geo, sprite: tex };
  }, [count]);

  const speeds = useMemo(() => new Float32Array(count).map(() => 0.08 + Math.random() * 0.22), [count]);

  useFrame((state) => {
    const p = points.current;
    if (!p) return;
    if (bornAt.current === null) bornAt.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - bornAt.current;
    const mat = p.material as THREE.PointsMaterial;
    // Dust becomes visible at ~1.8s into the entry sequence
    mat.opacity = Math.min(Math.max((age - 1.8) / 1.4, 0), 1) * 0.55 * (1 - (scrollRef.current ?? 0) * 0.7);
    p.rotation.y = state.clock.elapsedTime * 0.02;
    const pos = p.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) + speeds[i] * 0.0035;
      if (y > 2.6) y = -2.6;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        map={sprite}
        size={0.055}
        transparent
        opacity={0}
        depthWrite={false}
        sizeAttenuation
        color="#fff4e0"
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Crumbs — small instanced grains orbiting the boule                  */
/* ------------------------------------------------------------------ */
function Crumbs({ count, scrollRef }: { count: number; scrollRef: SceneProps["scrollRef"] }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        radius: 1.9 + Math.random() * 1.1,
        phase: (i / count) * Math.PI * 2 + Math.random() * 0.8,
        speed: 0.06 + Math.random() * 0.1,
        tilt: (Math.random() - 0.5) * 1.1,
        scale: 0.03 + Math.random() * 0.045,
      })),
    [count]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const s = scrollRef.current ?? 0;
    seeds.forEach((c, i) => {
      const a = c.phase + state.clock.elapsedTime * c.speed;
      dummy.position.set(
        Math.cos(a) * c.radius,
        Math.sin(a * 0.8 + c.tilt) * 0.9 - s * 0.9,
        Math.sin(a) * c.radius * 0.55
      );
      dummy.scale.setScalar(c.scale);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#d9b98c" roughness={0.8} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* Scene root — pointer parallax + scroll response                     */
/* ------------------------------------------------------------------ */
function Rig({ children, scrollRef }: { children: React.ReactNode; scrollRef: SceneProps["scrollRef"] }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const px = state.pointer.x;
    const py = state.pointer.y;
    // Restrained parallax — a few degrees, never aggressive
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, px * 0.16, 2.5, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -py * 0.1, 2.5, delta);
    const s = scrollRef.current ?? 0;
    g.position.y = THREE.MathUtils.damp(g.position.y, s * 0.5, 3, delta);
  });

  return <group ref={group}>{children}</group>;
}

export default function BakeryScene({ quality, active, scrollRef, onReady }: SceneProps) {
  return (
    <Canvas
      dpr={quality.dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.35, 6.1], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
      aria-hidden
      onCreated={() => onReady?.()}
    >
      <ambientLight intensity={0.75} color="#f6ead6" />
      <directionalLight position={[3.5, 4.5, 2.5]} intensity={1.4} color="#ffd9a8" />
      <directionalLight position={[-4.5, 2.5, -3]} intensity={1.1} color="#e8b98a" />
      <pointLight position={[-3.5, 1.2, -2]} intensity={12} color="#c98d82" distance={12} />
      <Rig scrollRef={scrollRef}>
        <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.35}>
          <Boule segments={quality.segments} scrollRef={scrollRef} />
        </Float>
        <Crumbs count={quality.grains} scrollRef={scrollRef} />
        <FlourDust count={quality.dustCount} scrollRef={scrollRef} />
        {/* flour ring dusted beneath the boule */}
        <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0.4]}>
          <torusGeometry args={[1.6, 0.09, 10, 56]} />
          <meshStandardMaterial color="#e9decf" roughness={0.95} />
        </mesh>
        <ContactShadows position={[0, -1.72, 0]} opacity={0.32} scale={6} blur={2.6} far={3} color="#3a2a18" />
      </Rig>
    </Canvas>
  );
}
