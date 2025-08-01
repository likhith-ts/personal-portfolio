"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { type Mesh, BufferAttribute, BufferGeometry } from "three"

export default function WireframeTerrain() {
  const meshRef = useRef<Mesh>(null)
  const smokeRef = useRef<Mesh>(null)

  // Create terrain geometry
  const geometry = useMemo(() => {
    const geo = new BufferGeometry()
    const width = 20
    const height = 20
    const widthSegments = 50
    const heightSegments = 50

    const vertices = []
    const indices = []

    // Generate vertices with noise
    for (let i = 0; i <= heightSegments; i++) {
      for (let j = 0; j <= widthSegments; j++) {
        const x = (j / widthSegments) * width - width / 2
        const z = (i / heightSegments) * height - height / 2

        // Create mountain-like terrain with noise
        const noise1 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 2
        const noise2 = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 4
        const y = noise1 + noise2 - 3

        vertices.push(x, y, z)
      }
    }

    // Generate indices for wireframe
    for (let i = 0; i < heightSegments; i++) {
      for (let j = 0; j < widthSegments; j++) {
        const a = i * (widthSegments + 1) + j
        const b = a + widthSegments + 1
        const c = a + 1
        const d = b + 1

        // Create triangles
        indices.push(a, b, c)
        indices.push(b, d, c)
      }
    }

    geo.setIndex(indices)
    geo.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3))
    geo.computeVertexNormals()

    return geo
  }, [])

  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1

      // Animate vertex colors
      const positions = meshRef.current.geometry.attributes.position.array
      const time = state.clock.elapsedTime

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i]
        const z = positions[i + 2]
        positions[i + 1] =
          Math.sin(x * 0.3 + time) * Math.cos(z * 0.3 + time) * 2 +
          Math.sin(x * 0.1 + time * 0.5) * Math.cos(z * 0.1 + time * 0.5) * 4 -
          3
      }

      meshRef.current.geometry.attributes.position.needsUpdate = true
    }

    if (smokeRef.current) {
      smokeRef.current.rotation.y = state.clock.elapsedTime * 0.05
      smokeRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5
    }
  })

  return (
    <group>
      {/* Main wireframe terrain */}
      <mesh ref={meshRef} geometry={geometry} position={[0, -2, 0]}>
        <meshBasicMaterial color="#ff0080" wireframe transparent opacity={0.8} />
      </mesh>

      {/* Additional colored wireframe layers */}
      <mesh geometry={geometry} position={[0, -1.8, 0]}>
        <meshBasicMaterial color="#00ff80" wireframe transparent opacity={0.6} />
      </mesh>

      <mesh geometry={geometry} position={[0, -1.6, 0]}>
        <meshBasicMaterial color="#8000ff" wireframe transparent opacity={0.4} />
      </mesh>

      <mesh geometry={geometry} position={[0, -1.4, 0]}>
        <meshBasicMaterial color="#ff8000" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Smoke/particle effects */}
      <mesh ref={smokeRef} position={[0, 2, -5]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={0.1} />
      </mesh>

      <mesh position={[-3, 3, -8]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#ff6666" transparent opacity={0.08} />
      </mesh>

      <mesh position={[4, 2.5, -6]}>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshBasicMaterial color="#ff3333" transparent opacity={0.06} />
      </mesh>
    </group>
  )
}
