"use client";
import { useRef, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture, Environment } from "@react-three/drei";
import * as THREE from "three";

const TRAIL_LEN = 60;
const START = new THREE.Vector3(11, 7, 5);
const IMPACT = new THREE.Vector3(0, 0, 0);

function Earth() {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useTexture("/earth.jpg");
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0008;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.8, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[2.96, 64, 64]} />
      <meshStandardMaterial
        color="#4499ff"
        emissive="#1144aa"
        emissiveIntensity={0.35}
        transparent
        opacity={0.1}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Meteor() {
  const { scene } = useGLTF("/luchibeats-model.glb");
  const meteorRef = useRef<THREE.Group>(null);
  const fireLightRef = useRef<THREE.PointLight>(null);
  const impactLightRef = useRef<THREE.PointLight>(null);
  const trailOrangeRef = useRef<THREE.Points>(null);
  const trailYellowRef = useRef<THREE.Points>(null);

  const progress = useRef(0);
  const impactTimer = useRef(0);

  // Shared trail position buffer (mutated each frame)
  const trailPos = useMemo(() => {
    const arr = new Float32Array(TRAIL_LEN * 3);
    for (let i = 0; i < TRAIL_LEN; i++) {
      arr[i * 3] = START.x;
      arr[i * 3 + 1] = START.y;
      arr[i * 3 + 2] = START.z;
    }
    return arr;
  }, []);

  const trailBuf = useRef<[number, number, number][]>(
    Array.from({ length: TRAIL_LEN }, () => [START.x, START.y, START.z] as [number, number, number])
  );

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!(m instanceof THREE.MeshStandardMaterial)) return;
        m.metalness = 0.9;
        m.roughness = 0.05;
        m.envMapIntensity = 4;
        m.emissive.setHex(0xff5500);
        m.emissiveIntensity = 2.0;
        m.needsUpdate = true;
      });
    });
  }, [scene]);

  useFrame((_, delta) => {
    // ── Impact flash countdown ─────────────────────────────
    if (impactTimer.current > 0) {
      impactTimer.current -= delta;
      if (impactLightRef.current) {
        impactLightRef.current.intensity = Math.max(0, (impactTimer.current / 0.6) * 30);
      }
      if (impactTimer.current <= 0) {
        // Reset for next pass
        progress.current = 0;
        trailBuf.current = Array.from(
          { length: TRAIL_LEN },
          () => [START.x, START.y, START.z] as [number, number, number]
        );
        if (meteorRef.current) meteorRef.current.position.copy(START);
      }
      return;
    }

    // ── Advance meteor ─────────────────────────────────────
    progress.current += delta * 0.13; // ~7.5 s per pass
    if (progress.current >= 1) {
      impactTimer.current = 0.6;
      if (impactLightRef.current) impactLightRef.current.intensity = 30;
      return;
    }

    // Cubic ease-in: starts slow, screams in at the end
    const t = progress.current;
    const eased = t * t * t;
    const pos = new THREE.Vector3().lerpVectors(START, IMPACT, eased);

    if (meteorRef.current) {
      meteorRef.current.position.copy(pos);
      // Tumble like a real meteor/asteroid
      meteorRef.current.rotation.x += delta * 1.8;
      meteorRef.current.rotation.z += delta * 1.1;
    }

    // Fire light surges as meteor accelerates
    if (fireLightRef.current) {
      fireLightRef.current.intensity = 0.5 + eased * 12;
    }

    // ── Update trail buffer ────────────────────────────────
    trailBuf.current.unshift([pos.x, pos.y, pos.z]);
    if (trailBuf.current.length > TRAIL_LEN) trailBuf.current.pop();

    for (let i = 0; i < TRAIL_LEN; i++) {
      const p = trailBuf.current[i];
      trailPos[i * 3] = p[0];
      trailPos[i * 3 + 1] = p[1];
      trailPos[i * 3 + 2] = p[2];
    }

    if (trailOrangeRef.current) {
      trailOrangeRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (trailYellowRef.current) {
      trailYellowRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Impact flash at Earth's surface */}
      <pointLight
        ref={impactLightRef}
        position={[0, 0, 0]}
        intensity={0}
        color="#ff9966"
        distance={12}
        decay={1.2}
      />

      {/* The meteor itself */}
      <group ref={meteorRef} position={[START.x, START.y, START.z]}>
        <pointLight
          ref={fireLightRef}
          position={[0, 0, 0]}
          intensity={0.5}
          color="#ff4400"
          distance={7}
          decay={2}
        />
        <primitive object={scene} scale={1.3} />
      </group>

      {/* Trail — wide orange glow layer */}
      <points ref={trailOrangeRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trailPos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.22}
          color="#ff5500"
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Trail — tight bright-yellow hot core */}
      <points ref={trailYellowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trailPos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          color="#ffee44"
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function BackgroundScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9.5], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 5, 5]} intensity={2} color="#ffffff" />
      <pointLight position={[-5, -3, 3]} intensity={0.8} color="#4488ff" />
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Atmosphere />
        <Earth />
        <Meteor />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/luchibeats-model.glb");
