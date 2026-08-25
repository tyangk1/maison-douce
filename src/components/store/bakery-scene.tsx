"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export type SceneQuality = {
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
/* Croissant — CC0 scan by Poly Haven (polyhaven.com, license CC0)     */
/* ------------------------------------------------------------------ */
function Croissant({ scrollRef }: { scrollRef: SceneProps["scrollRef"] }) {
  const { scene } = useGLTF("/models/croissant.gltf");
  const group = useRef<THREE.Group>(null);
  const bornAt = useRef<number | null>(null);

  // Normalize: center + scale the scan to fill the frame regardless of
  // the source model's real-world units.
  const { clone, fitScale } = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const fitScale = 2.85 / Math.max(size.x, size.y, size.z);
    clone.position.set(-center.x, -box.min.y, -center.z);
    return { clone, fitScale };
  }, [scene]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    if (bornAt.current === null) bornAt.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - bornAt.current;
    // Cinematic entry: rotates in from a quarter turn while rising
    const emerge = Math.min(age / 1.8, 1);
    const eased = 1 - Math.pow(1 - emerge, 3);
    g.rotation.y = (1 - eased) * -1.1 + state.clock.elapsedTime * 0.1;
    g.position.y = (1 - eased) * -0.7;
    g.scale.setScalar(fitScale * (0.7 + 0.3 * eased));
    // Present the top of the croissant to the camera
    g.rotation.x = 0.42 + Math.sin(state.clock.elapsedTime * 0.35) * 0.03;
    const s = scrollRef.current ?? 0;
    g.position.y += s * 0.8;
  });

  return (
    <group ref={group} scale={fitScale}>
      <primitive object={clone} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Flour dust — single Points cloud with a soft radial sprite          */
/* ------------------------------------------------------------------ */
function FlourDust({ count, scrollRef }: { count: number; scrollRef: SceneProps["scrollRef"] }) {
  const points = useRef<THREE.Points>(null);
  const bornAt = useRef<number | null>(null);

  const { geometry, sprite, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
      spd[i] = 0.08 + Math.random() * 0.22;
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
    return { geometry: geo, sprite: new THREE.CanvasTexture(cnv), speeds: spd };
  }, [count]);

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
/* Crumbs — small instanced grains orbiting the composition            */
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
      camera={{ position: [0, 0.9, 5.9], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
      aria-hidden
      onCreated={() => onReady?.()}
    >
      <ambientLight intensity={0.8} color="#f6ead6" />
      <directionalLight position={[3.5, 4.5, 2.5]} intensity={1.5} color="#ffd9a8" />
      <directionalLight position={[-4.5, 2.5, -3]} intensity={0.9} color="#e8b98a" />
      <Suspense fallback={null}>
        <Rig scrollRef={scrollRef}>
          <Float speed={1.1} rotationIntensity={0.06} floatIntensity={0.3}>
            <Croissant scrollRef={scrollRef} />
          </Float>
          <Crumbs count={quality.grains} scrollRef={scrollRef} />
          <FlourDust count={quality.dustCount} scrollRef={scrollRef} />
          <ContactShadows position={[0, -1.75, 0]} opacity={0.35} scale={6} blur={2.6} far={3} color="#3a2a18" />
        </Rig>
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/models/croissant.gltf");

