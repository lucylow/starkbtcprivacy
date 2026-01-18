import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 400;

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 12;

      // Blue to purple gradient
      const t = Math.random();
      colors[i] = 0.2 + t * 0.4;
      colors[i + 1] = 0.3 + (1 - t) * 0.2;
      colors[i + 2] = 0.8 + Math.random() * 0.2;
    }

    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <Points ref={particlesRef} positions={positions} colors={colors}>
      <PointMaterial
        size={0.08}
        sizeAttenuation
        depthWrite={false}
        vertexColors
        transparent
        opacity={0.7}
      />
    </Points>
  );
}

function ConnectionLines() {
  const linesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const lineColors: number[] = [];

    for (let i = 0; i < 40; i++) {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );

      const end = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );

      positions.push(start.x, start.y, start.z);
      positions.push(end.x, end.y, end.z);

      // Blue to purple colors
      lineColors.push(0.3, 0.5, 1, 0.3);
      lineColors.push(0.6, 0.2, 0.9, 0.3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color="#6366f1" transparent opacity={0.15} />
    </lineSegments>
  );
}

export default function NetworkVisualizer() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <Particles />
        <ConnectionLines />
      </Canvas>
    </div>
  );
}
