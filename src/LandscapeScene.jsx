import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const BASE_Y = -1.42
const IVORY = '#e7e4d8'
const STONE = '#c8c9bf'
const SAGE_FOG = '#aebba7'

function seededRandom(seed) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function createSpireGeometry(seed) {
  const geometry = new THREE.ConeGeometry(1, 2.35, 32, 10, false)
  const positions = geometry.attributes.position

  for (let index = 0; index < positions.count; index += 1) {
    let x = positions.getX(index)
    let y = positions.getY(index)
    let z = positions.getZ(index)
    const angle = Math.atan2(z, x)
    const height = THREE.MathUtils.clamp((y + 1.175) / 2.35, 0, 1)
    const ridge =
      Math.sin(angle * 3 + seed * 1.17) * 0.055 +
      Math.sin(angle * 7 + y * 4.2 + seed * 0.73) * 0.028 +
      Math.sin(angle * 11 - y * 2.4 + seed) * 0.012
    const taperVariation = 1 + ridge * (0.45 + height * 0.7)

    x *= taperVariation
    z *= taperVariation * (0.94 + Math.cos(angle * 2 + seed) * 0.025)
    x += height * 0.055 * Math.sin(seed * 2.1)
    z += height * 0.045 * Math.cos(seed * 1.7)
    y += Math.sin(angle * 4 + seed) * 0.012 * (1 - height)

    positions.setXYZ(index, x, y, z)
  }

  geometry.computeVertexNormals()
  return geometry
}

function RockSpire({ x, z, scale, seed, tone = STONE, rotation = 0 }) {
  const geometry = useMemo(() => createSpireGeometry(seed), [seed])
  const [sx, sy, sz] = scale

  return (
    <mesh
      geometry={geometry}
      position={[x, BASE_Y + sy * 1.13, z]}
      rotation={[0, rotation, 0]}
      scale={[sx, sy, sz]}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial color={tone} roughness={0.96} metalness={0} clearcoat={0.025} />
    </mesh>
  )
}

function MountainMass() {
  return (
    <group>
      <RockSpire x={-4.25} z={-0.95} scale={[0.92, 2.08, 0.9]} seed={3} rotation={0.22} tone="#cbc9be" />
      <RockSpire x={-3.62} z={-1.14} scale={[0.84, 1.78, 0.8]} seed={5} rotation={-0.18} tone="#c0c3b9" />
      <RockSpire x={-4.86} z={-0.5} scale={[0.58, 1.38, 0.6]} seed={9} rotation={0.48} tone="#d4d2c8" />
      <RockSpire x={-3.08} z={-0.78} scale={[0.63, 1.38, 0.66]} seed={12} rotation={0.36} tone="#b9beb3" />
      <RockSpire x={-2.62} z={-1.02} scale={[0.42, 0.98, 0.48]} seed={15} rotation={-0.45} tone="#d1d1c7" />
      <RockSpire x={-4.92} z={-1.18} scale={[0.4, 0.9, 0.43]} seed={18} rotation={0.1} tone="#b8bcb2" />
    </group>
  )
}

function useForest(count = 48) {
  return useMemo(() => {
    const random = seededRandom(28411)
    const trees = []
    let attempts = 0

    while (trees.length < count && attempts < count * 8) {
      attempts += 1
      const x = -5.2 + random() * 10.4
      const z = -0.15 + random() * 2.5
      const centreKeepout = x > -1.45 && x < 1.75 && z > 0.2
      const architectureKeepout = x > 2.05 && x < 4.55 && z > -0.05
      if (centreKeepout || architectureKeepout) continue

      const depthScale = THREE.MathUtils.mapLinear(z, -0.15, 2.35, 0.72, 1.08)
      trees.push({
        x,
        z,
        scale: (0.38 + random() * 0.46) * depthScale,
        rotation: random() * Math.PI,
      })
    }

    return trees
  }, [count])
}

function InstancedForest({ count = 48 }) {
  const trunks = useRef()
  const low = useRef()
  const middle = useRef()
  const high = useRef()
  const trees = useForest(count)

  useLayoutEffect(() => {
    const object = new THREE.Object3D()

    trees.forEach((tree, index) => {
      const { x, z, scale, rotation } = tree

      object.position.set(x, BASE_Y + 0.23 * scale, z)
      object.scale.set(0.055 * scale, 0.46 * scale, 0.055 * scale)
      object.rotation.set(0, rotation, 0)
      object.updateMatrix()
      trunks.current.setMatrixAt(index, object.matrix)

      object.position.set(x, BASE_Y + 0.5 * scale, z)
      object.scale.set(0.34 * scale, 0.5 * scale, 0.34 * scale)
      object.rotation.set(0, rotation, 0)
      object.updateMatrix()
      low.current.setMatrixAt(index, object.matrix)

      object.position.set(x, BASE_Y + 0.76 * scale, z)
      object.scale.set(0.27 * scale, 0.44 * scale, 0.27 * scale)
      object.rotation.set(0, rotation + 0.35, 0)
      object.updateMatrix()
      middle.current.setMatrixAt(index, object.matrix)

      object.position.set(x, BASE_Y + 0.99 * scale, z)
      object.scale.set(0.19 * scale, 0.36 * scale, 0.19 * scale)
      object.rotation.set(0, rotation + 0.65, 0)
      object.updateMatrix()
      high.current.setMatrixAt(index, object.matrix)
    })

    ;[trunks, low, middle, high].forEach((ref) => {
      ref.current.instanceMatrix.needsUpdate = true
    })
  }, [trees])

  return (
    <group>
      <instancedMesh ref={trunks} args={[null, null, count]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.08, 1, 8]} />
        <meshStandardMaterial color="#655d49" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={low} args={[null, null, count]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 12]} />
        <meshStandardMaterial color="#143b2b" roughness={0.96} />
      </instancedMesh>
      <instancedMesh ref={middle} args={[null, null, count]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 12]} />
        <meshStandardMaterial color="#1f5237" roughness={0.96} />
      </instancedMesh>
      <instancedMesh ref={high} args={[null, null, count]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 12]} />
        <meshStandardMaterial color="#2c6948" roughness={0.96} />
      </instancedMesh>
    </group>
  )
}

function ShrubCluster() {
  const shrubs = useMemo(() => {
    const random = seededRandom(9441)
    return Array.from({ length: 16 }, (_, index) => ({
      x: -1.9 + random() * 6.5,
      z: 0.15 + random() * 1.7,
      size: 0.12 + random() * 0.16,
      seed: index,
    })).filter(({ x }) => !(x > -1.1 && x < 1.7))
  }, [])

  return (
    <group>
      {shrubs.map((shrub) => (
        <mesh
          key={shrub.seed}
          position={[shrub.x, BASE_Y + shrub.size * 0.7, shrub.z]}
          scale={[shrub.size * 1.15, shrub.size * 0.8, shrub.size]}
          castShadow
        >
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial color={shrub.seed % 2 ? '#72934c' : '#55783c'} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function DomeShelter({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.62, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={IVORY} roughness={0.9} clearcoat={0.02} />
      </mesh>
      <RoundedBox
        args={[0.28, 0.4, 0.06]}
        radius={0.11}
        smoothness={5}
        position={[0, 0.2, 0.61]}
      >
        <meshStandardMaterial color="#183126" roughness={1} />
      </RoundedBox>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.64, 0.64, 0.06, 48]} />
        <meshStandardMaterial color="#d8d4c7" roughness={1} />
      </mesh>
    </group>
  )
}

function ArchPassage({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.59, 0]} castShadow>
        <torusGeometry args={[0.57, 0.13, 18, 56, Math.PI]} />
        <meshPhysicalMaterial color="#ece8dc" roughness={0.86} clearcoat={0.03} />
      </mesh>
      <mesh position={[-0.57, 0.29, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.58, 24]} />
        <meshStandardMaterial color="#ece8dc" roughness={0.9} />
      </mesh>
      <mesh position={[0.57, 0.29, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.58, 24]} />
        <meshStandardMaterial color="#ece8dc" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.27, -0.06]}>
        <planeGeometry args={[0.9, 0.54]} />
        <meshStandardMaterial color="#213d31" roughness={1} />
      </mesh>
    </group>
  )
}

function FlowTube({ points, radius = 0.14 }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))),
    [points],
  )

  return (
    <mesh castShadow receiveShadow>
      <tubeGeometry args={[curve, 80, radius, 20, false]} />
      <meshPhysicalMaterial color="#e8e5da" roughness={0.78} clearcoat={0.04} />
    </mesh>
  )
}

function Architecture() {
  const tubeA = useMemo(() => [
    [2.15, BASE_Y + 0.04, 0.42],
    [2.25, BASE_Y + 0.9, 0.28],
    [2.72, BASE_Y + 1.45, 0.02],
    [2.9, BASE_Y + 2.0, -0.26],
  ], [])

  const tubeB = useMemo(() => [
    [2.78, BASE_Y + 0.04, 0.72],
    [3.0, BASE_Y + 0.62, 0.74],
    [2.82, BASE_Y + 1.08, 0.5],
  ], [])

  return (
    <group>
      <DomeShelter position={[-0.42, BASE_Y, 0.86]} scale={0.82} />
      <ArchPassage position={[0.88, BASE_Y, 0.9]} scale={0.78} />

      <mesh position={[-1.15, BASE_Y - 0.01, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.08, 0.46]} />
        <meshStandardMaterial color="#a98e66" roughness={0.96} />
      </mesh>

      <FlowTube points={tubeA} radius={0.14} />
      <FlowTube points={tubeB} radius={0.12} />

      <RoundedBox args={[0.36, 2.15, 0.44]} radius={0.035} smoothness={4} position={[3.58, BASE_Y + 1.08, -0.42]} castShadow>
        <meshStandardMaterial color="#dfddd2" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.28, 1.72, 0.38]} radius={0.03} smoothness={4} position={[4.06, BASE_Y + 0.86, -0.12]} castShadow>
        <meshStandardMaterial color="#ece9df" roughness={0.91} />
      </RoundedBox>
      <RoundedBox args={[0.22, 1.22, 0.32]} radius={0.03} smoothness={4} position={[4.44, BASE_Y + 0.61, 0.08]} castShadow>
        <meshStandardMaterial color="#d7d5ca" roughness={0.92} />
      </RoundedBox>

      <mesh position={[3.22, BASE_Y + 0.7, 0.52]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.31, 0.31, 0.13, 48]} />
        <meshPhysicalMaterial color="#ece9de" roughness={0.84} clearcoat={0.03} />
      </mesh>
      <mesh position={[3.22, BASE_Y + 0.7, 0.59]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 24]} />
        <meshStandardMaterial color="#516257" roughness={1} />
      </mesh>

      <mesh position={[4.45, BASE_Y + 0.13, 0.82]} castShadow>
        <boxGeometry args={[0.74, 0.34, 0.48]} />
        <meshStandardMaterial color="#e4e1d6" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Pebble({ position, scale, phase, reducedMotion }) {
  const ref = useRef()

  useFrame(({ clock }, delta) => {
    if (!ref.current || reducedMotion) return
    ref.current.rotation.y += delta * 0.08
    ref.current.rotation.x += delta * 0.045
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.36 + phase) * 0.045
  })

  return (
    <mesh ref={ref} position={position} scale={scale} castShadow>
      <icosahedronGeometry args={[1, 3]} />
      <meshPhysicalMaterial color="#d3d5cc" roughness={0.96} clearcoat={0.015} />
    </mesh>
  )
}

function PresentationBase() {
  return (
    <group>
      <RoundedBox
        args={[11.25, 0.16, 3.55]}
        radius={0.045}
        smoothness={4}
        position={[0, BASE_Y - 0.11, 0.38]}
        receiveShadow
      >
        <meshStandardMaterial color="#dbd8cc" roughness={0.98} />
      </RoundedBox>
      <mesh position={[0, BASE_Y - 0.22, 0.38]} receiveShadow>
        <boxGeometry args={[11.48, 0.07, 3.72]} />
        <meshStandardMaterial color="#c9c7bb" roughness={1} />
      </mesh>
    </group>
  )
}

function World({ reducedMotion }) {
  const group = useRef()

  useFrame(({ pointer }, delta) => {
    if (!group.current) return
    const targetY = reducedMotion ? 0 : pointer.x * 0.012
    const targetX = reducedMotion ? 0 : -pointer.y * 0.006
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3.5, delta)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 3.5, delta)
  })

  return (
    <group ref={group} position={[0, -0.03, 0]}>
      <PresentationBase />
      <MountainMass />
      <ShrubCluster />
      <Architecture />
      <InstancedForest count={48} />

      <Pebble position={[-4.92, 2.18, -0.32]} scale={[0.16, 0.12, 0.14]} phase={0.2} reducedMotion={reducedMotion} />
      <Pebble position={[-2.1, 2.88, -0.7]} scale={[0.1, 0.08, 0.09]} phase={1.4} reducedMotion={reducedMotion} />
      <Pebble position={[3.78, 2.26, -0.6]} scale={[0.31, 0.27, 0.29]} phase={2.1} reducedMotion={reducedMotion} />
      <Pebble position={[4.72, 1.28, 0.36]} scale={[0.12, 0.09, 0.11]} phase={3.2} reducedMotion={reducedMotion} />
    </group>
  )
}

function SceneContent() {
  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  return (
    <>
      <fog attach="fog" args={[SAGE_FOG, 9.2, 17.2]} />

      <ambientLight intensity={1.05} />
      <hemisphereLight args={['#f2f0e8', '#56705f', 1.25]} />
      <directionalLight
        position={[-3.5, 7.5, 5.5]}
        intensity={2.15}
        color="#fff9eb"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={6}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[5, 2.2, 3]} intensity={0.58} color="#dce7d8" />

      <World reducedMotion={reducedMotion} />

      <ContactShadows
        position={[0, BASE_Y - 0.015, 0.38]}
        scale={12}
        opacity={0.22}
        blur={3.1}
        far={4.2}
        resolution={1024}
        frames={1}
      />
    </>
  )
}

export default function LandscapeScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.78, 12.7], fov: 29, near: 0.1, far: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.93
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.setClearColor(0x000000, 0)
      }}
    >
      <SceneContent />
    </Canvas>
  )
}
