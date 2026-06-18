"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type SymbolPoint = {
  position: [number, number, number];
  size: number;
  color: string;
};

const SYMBOL_POINTS: SymbolPoint[] = [
  { position: [-1.8, 1.15, -1.35], size: 0.16, color: "#efe3bc" },
  { position: [-1.35, -0.7, -0.95], size: 0.165, color: "#9cd3f0" },
  { position: [1.05, 0.9, -1.45], size: 0.17, color: "#d6b889" },
  { position: [1.7, -0.25, -0.55], size: 0.16, color: "#8ec7e4" },
  { position: [-0.55, 1.4, 0.65], size: 0.15, color: "#f2edd1" },
  { position: [0.55, -1.3, 0.6], size: 0.15, color: "#95d2eb" },
  { position: [0.1, 1.0, 1.3], size: 0.145, color: "#cfe8f4" },
  { position: [-1.15, 0.25, 1.15], size: 0.145, color: "#d1c18a" },
  { position: [1.25, 1.35, 0.2], size: 0.14, color: "#f5edd6" },
  { position: [-0.9, -1.5, 0.45], size: 0.14, color: "#a5dbf1" },
];

function DriftScene() {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.045;
      groupRef.current.rotation.x = Math.sin(t * 0.11) * 0.08;
    }

    const target = new THREE.Vector3(0.1, 0.22, 6.4);
    camera.position.lerp(target, 0.018);
    camera.lookAt(0, 0, 0);

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.03);
    }
  });

  return (
    <>
      <color attach="background" args={["#010205"]} />
      <fog attach="fog" args={["#010205", 4.5, 16]} />

      <ambientLight intensity={0.2} />
      <pointLight position={[0, 2.4, 1.6]} intensity={0.65} color="#e6e0ca" decay={1.7} />
      <pointLight position={[-2.4, 1.2, -1.6]} intensity={0.3} color="#8fd0eb" decay={1.8} />

      <Sparkles
        count={32}
        speed={0.18}
        opacity={0.24}
        scale={9}
        size={1.2}
      />

      <group ref={groupRef}>
        <mesh ref={glowRef} position={[0, 0, 0]}>
          <sphereGeometry args={[0.33, 28, 28]} />
          <meshStandardMaterial
            color="#79b9dd"
            emissive="#3f9bc7"
            emissiveIntensity={0.48}
            roughness={0.28}
            metalness={0.22}
            transparent
            opacity={0.86}
          />
        </mesh>

        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.82, 26, 26]} />
          <meshBasicMaterial color="#81caeb" transparent opacity={0.08} />
        </mesh>

        {SYMBOL_POINTS.map((point, index) => (
          <group key={index} position={point.position}>
            <mesh>
              <sphereGeometry args={[point.size, 16, 16]} />
              <meshStandardMaterial
                color={point.color}
                emissive={point.color}
                emissiveIntensity={0.58}
                roughness={0.26}
                metalness={0.22}
                transparent
                opacity={0.84}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[point.size * 2.1, 18, 18]} />
              <meshBasicMaterial color={point.color} transparent opacity={0.12} />
            </mesh>
          </group>
        ))}

        {SYMBOL_POINTS.map((point, index) => (
          <line key={`line-${index}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array([
                    0, 0, 0,
                    point.position[0],
                    point.position[1],
                    point.position[2],
                  ]),
                  3,
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#8fd0eb" transparent opacity={0.19} />
          </line>
        ))}
      </group>
    </>
  );
}

export default function Symbolraum3DPrototype() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      const width = window.innerWidth < 860;

      setMounted(true);
      setIsMobile(isTouch || width);

      try {
        const canvas = document.createElement("canvas");
        const webgl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        setIsWebGLSupported(Boolean(webgl));
      } catch {
        setIsWebGLSupported(false);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  if (!mounted) {
    return (
      <section className="relative min-h-[70vh] rounded-[28px] border border-white/10 bg-[#02050b]/80 px-6 py-8 text-left text-sm text-[#f0ebdf]/70">
        Experiment wird geladen…
      </section>
    );
  }

  if (isMobile || !isWebGLSupported) {
    return (
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#02050b]/85 px-6 py-8 text-left text-sm text-[#f0ebdf]/75 sm:px-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#d0be95]">Experiment</p>
          <h1 className="text-2xl font-semibold text-[#fffaf3]">3D-Symbolraum-Prototyp</h1>
          <p>
            Dieses Experiment nutzt WebGL für die leichten Punkte, Linien und die zentrale Wasser-Atmosphäre. Auf kleinen Bildschirmen oder ohne WebGL wird der Versuch bewusst ausgesetzt, damit die Seite performant bleibt.
          </p>
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.24em] text-[#e8dfca]/70">
            Hinweis: Für den 3D-Test breiteres Display oder ein WebGL-fähiges Gerät verwenden.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#02050b]/80 px-4 py-4 sm:px-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#d0be95]">Experiment</p>
          <h1 className="mt-1 text-xl font-semibold text-[#fffaf3] sm:text-2xl">3D-Symbolraum</h1>
        </div>
        <p className="max-w-xs text-[10px] uppercase tracking-[0.24em] text-[#f0ebdf]/60">
          wenige leuchtende Punkte · zentraler Wasserkern · sanfte Dämpfung
        </p>
      </div>

      <div className="relative h-[58vh] min-h-[420px] overflow-hidden rounded-[26px] border border-white/10 bg-[#010205] sm:h-[66vh]">
        <Canvas
          camera={{ position: [0, 0.25, 5.5], fov: 44 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
          frameloop="always"
        >
          <DriftScene />
        </Canvas>
      </div>
    </section>
  );
}
