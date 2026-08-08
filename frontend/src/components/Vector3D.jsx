import { useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { NV_AXES } from "../lib/nvPhysics";

function Arrow({ dir, length, color, label, headScale = 1 }) {
  const points = useMemo(() => [[0, 0, 0], dir.map((d) => d * length)], [dir, length]);
  const end = dir.map((d) => d * length);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize());
    return q;
  }, [dir]);

  return (
    <group>
      <Line points={points} color={color} lineWidth={2.5} />
      <mesh position={end} quaternion={quat}>
        <coneGeometry args={[0.045 * headScale, 0.14 * headScale, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      {label && (
        <Html position={end} distanceFactor={8}>
          <div style={{ color, fontSize: 11, fontFamily: "JetBrains Mono", whiteSpace: "nowrap", textShadow: "0 0 4px rgba(0,0,0,0.8)" }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function DiamondLattice() {
  // simplified tetrahedral unit-cell scaffold, not a literal crystallography render
  const corners = [
    [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1],
    [-1, -1, -1], [-1, 1, 1], [1, -1, 1], [1, 1, -1],
  ].map((c) => c.map((v) => v * 0.55));

  return (
    <group>
      {corners.map((c, i) => (
        <mesh key={i} position={c}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#334155" emissive="#0B0F19" />
        </mesh>
      ))}
      {corners.map((c, i) =>
        corners.slice(i + 1).map((c2, j) => {
          const dist = Math.hypot(c[0] - c2[0], c[1] - c2[1], c[2] - c2[2]);
          if (dist > 1.3) return null;
          return <Line key={`${i}-${j}`} points={[c, c2]} color="#1E293B" lineWidth={1} />;
        })
      )}
    </group>
  );
}

export default function Vector3D({ B_uT = [0, 0, 0], showBias = false, biasVec = [0, 0, 60] }) {
  const bMag = Math.hypot(...B_uT) || 1;
  const bDir = B_uT.map((v) => v / bMag);
  const bLen = Math.min(1.6, 0.4 + bMag / 40);

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [2.4, 1.8, 2.4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 3, 3]} intensity={40} color="#00F0FF" />
        <pointLight position={[-3, -2, -3]} intensity={20} color="#10B981" />

        <DiamondLattice />

        {NV_AXES.map((axis) => (
          <Arrow key={axis.id} dir={axis.vec} length={0.85} color={axis.color} label={axis.id} headScale={0.7} />
        ))}

        <Arrow dir={bDir} length={bLen} color="#FFFFFF" label="B" headScale={1.3} />

        {showBias && (
          <Arrow
            dir={biasVec.map((v) => v / (Math.hypot(...biasVec) || 1))}
            length={1.2}
            color="#F59E0B"
            label="B_bias"
            headScale={0.9}
          />
        )}

        <gridHelper args={[3, 12, "#1E293B", "#131B2E"]} position={[0, -0.9, 0]} />
        <OrbitControls enablePan={false} minDistance={1.5} maxDistance={6} />
      </Canvas>
    </div>
  );
}
