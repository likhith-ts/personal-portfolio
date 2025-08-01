// src/components/TerrainWireframe.tsx

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

// --- Configuration (can be adjusted for different looks) ---
const TERRAIN_WIDTH = 200;
const TERRAIN_HEIGHT = 200;
const TERRAIN_SEGMENTS_X = 150;
const TERRAIN_SEGMENTS_Y = 150;

const NOISE_SETTINGS = {
  scale: 25,
  octaves: 4,
  persistence: 0.4,
  lacunarity: 2.5,
  height: 20,
};

/**
 * The Terrain component is now much simpler.
 * It generates the static 3D geometry once and does not animate its vertices.
 */
const Terrain = () => {
  const noise3D = useMemo(() => createNoise3D(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      TERRAIN_WIDTH,
      TERRAIN_HEIGHT,
      TERRAIN_SEGMENTS_X,
      TERRAIN_SEGMENTS_Y
    );
    geo.rotateX(-Math.PI / 2);
    const positions = geo.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      let amplitude = 1;
      let frequency = 1;
      let noiseHeight = 0;

      for (let j = 0; j < NOISE_SETTINGS.octaves; j++) {
        const sampleX = (x + 1000) / NOISE_SETTINGS.scale * frequency;
        const sampleZ = (z + 1000) / NOISE_SETTINGS.scale * frequency;
        const noise = noise3D(sampleX, 0, sampleZ);
        noiseHeight += noise * amplitude;
        amplitude *= NOISE_SETTINGS.persistence;
        frequency *= NOISE_SETTINGS.lacunarity;
      }
      positions.setY(i, noiseHeight * NOISE_SETTINGS.height);
    }
    geo.computeVertexNormals();
    return geo;
  }, [noise3D]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial wireframe color="#666666" emissive="#ff3c00" emissiveIntensity={0.2} />
    </mesh>
  );
};

/**
 * NEW: This component wraps the Terrain and handles all interactive rotation.
 */
const InteractiveGroup = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const { mouse } = useThree();
  const targetRotation = useRef({ x: 0, y: 0, z: 0 }).current;

  // Handle scroll for z-axis rotation
  useEffect(() => {
    let scrollTimeout: string | number | NodeJS.Timeout | undefined;
    const handleScroll = (event: { deltaY: number; }) => {
      // Rotate on the z-axis based on scroll direction
      targetRotation.z += event.deltaY > 0 ? 0.05 : -0.05;

      // Add a timeout to smoothly return to center after scrolling stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        targetRotation.z = 0;
      }, 2000); // Reset after 2 seconds of inactivity
    };

    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, [targetRotation]);

  useFrame(() => {
    // Mouse movement controls x and y rotation
    targetRotation.y = -mouse.x * 0.2; // Yaw
    targetRotation.x = mouse.y * 0.2; // Pitch

    // Smoothly interpolate the group's rotation towards the target
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.x, 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.y, 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotation.z, 0.05);
  });

  return (
    <group ref={groupRef}>
      <Terrain />
    </group>
  );
};


/**
 * The main scene component, now simplified to use the InteractiveGroup.
 */
const TerrainWireframe: React.FC = () => {
  return (
    <Canvas
      // Set a static camera position
      camera={{ position: [0, 10, 50], fov: 75, near: 0.1, far: 1000 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#0d0d0d']} />
      <fog attach="fog" args={['#0d0d0d', 30, 120]} />

      {/* The interactive wrapper contains our static terrain model */}
      <InteractiveGroup />

      {/* Post-processing effects are unchanged */}
      <EffectComposer>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.8}
          height={480}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.001, 0.001)}
        />
      </EffectComposer>
    </Canvas>
  );
};

export default TerrainWireframe;