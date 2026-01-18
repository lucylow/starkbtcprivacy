import React, { useRef, useMemo, forwardRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ParticlesInner() {
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
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        sizeAttenuation
        depthWrite={false}
        vertexColors
        transparent
        opacity={0.7}
      />
    </points>
  );
}

function ConnectionLinesInner() {
  const linesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const positions: number[] = [];

    for (let i = 0; i < 40; i++) {
      const startX = (Math.random() - 0.5) * 10;
      const startY = (Math.random() - 0.5) * 10;
      const startZ = (Math.random() - 0.5) * 10;

      const endX = (Math.random() - 0.5) * 10;
      const endY = (Math.random() - 0.5) * 10;
      const endZ = (Math.random() - 0.5) * 10;

      positions.push(startX, startY, startZ);
      positions.push(endX, endY, endZ);
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
        <ParticlesInner />
        <ConnectionLinesInner />
      </Canvas>
    </div>
  );
}
