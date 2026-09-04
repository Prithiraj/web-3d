import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const BASE_Y = -1.42
const IVORY = '#e8e5da'
const SAGE_FOG = '#aebba7'

function seededRandom(seed) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function createCragGeometry(seed) {
  const geometry = new THREE.IcosahedronGeometry(1, 4)
  const position = geometry.attributes.position

  for (let index = 0; index < position.count; index += 1) {
    let x = position.getX(index)
    let y = position.getY(index)
    let z = position.getZ(index)
    const radius = Math.max(Math.sqrt(x * x + y * y + z * z), 0.0001)
    const normalizedY = y / radius
    const height = (normalizedY + 1) * 0.5
    const angle = Math.atan2(z, x)

    const taper = 1.16 - height * 0.46
    const ridge =
      Math.sin(angle * 5 + y * 2.8 + seed * 0.91) * 0.055 +
      Math.sin(angle * 9 - y * 4.1 + seed * 1.37) * 0.023 +
      Math.sin(y * 9 + seed * 0.63) * 0.018
    const waist = 1 + Math.sin(height * Math.PI) * 0.08

    x *= taper * waist * (1 + ridge)
    z *= taper * waist * (0.92 + ridge * 0.8)
    y *= 1.26
    x += height * 0.055 * Math.sin(seed * 1.7)
    z += height * 0.04 * Math.cos(seed * 1.2)

    position.setXYZ(index, x, y, z)
  }

  geometry.computeVertexNormals()
  return geometry
}

function Crag({ x, z, scale, seed, tone, rotation = 0 }) {
  const geometry = useMemo(() => createCragGeometry(seed), [seed])
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
      <meshPhysicalMaterial color={tone} roughness={0.98} metalness={0} clearcoat={0.015} />
    </mesh>
  )
}

function MountainMass() {
  return (
    <group>
      <Crag x={-4.38} z={-0.9} scale={[1.0, 1.92, 0.82]} seed={3} rotation={0.28} tone="#c5c6bd" />
      <Crag x={-3.78} z={-1.08} scale={[0.82, 1.58, 0.76]} seed={6} rotation={-0.17} tone="#b8bdb4" />
      <Crag x={-4.95} z={-0.48} scale={[0.65, 1.25, 0.6]} seed={9} rotation={0.5} tone="#d4d2c8" />
      <Crag x={-3.18} z={-0.75} scale={[0.67, 1.23, 0.62]} seed={12} rotation={0.34} tone="#c8c9bf" />
      <Crag x={-2.72} z={-1.0} scale={[0.42, 0.88, 0.43]} seed={15} rotation={-0.36} tone="#d3d2c9" />
      <Crag x={-4.96} z={-1.1} scale={[0.44, 0.82, 0.42]} seed={18} tone="#b7bbb2" />
    </group>
  )
}

function useForest(count = 44) {
  return useMemo(() => {
    const random = seededRandom(28411)
    const trees = []
    let attempts = 0

    while (trees.length < count && attempts < count * 10) {
      attempts += 1
      const x = -5.15 + random() * 10.3
      const z = -0.15 + random() * 2.48
      const centreKeepout = x > -1.45 && x < 1.72 && z > 0.18
      const architectureKeepout = x > 2.05 && x < 4.72 && z > -0.05
      const detailKeepout = x > -2.82 && x < -1.55 && z > 0.82
      if (centreKeepout || architectureKeepout || detailKeepout) continue

      const depthScale = THREE.MathUtils.mapLinear(z, -0.15, 2.33, 0.67, 1.05)
      trees.push({
        x,
        z,
        scale: (0.34 + random() * 0.48) * depthScale,
        rotation: random() * Math.PI,
      })
    }

    return trees
  }, [count])
}

function InstancedForest({ count = 44 }) {
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
      object.scale.set(0.05 * scale, 0.45 * scale, 0.05 * scale)
      object.rotation.set(0, rotation, 0)
      object.updateMatrix()
      trunks.current.setMatrixAt(index, object.matrix)

      object.position.set(x, BASE_Y + 0.48 * scale, z)
      object.scale.set(0.32 * scale, 0.47 * scale, 0.32 * scale)
      object.rotation.set(0, rotation, 0)
      object.updateMatrix()
      low.current.setMatrixAt(index, object.matrix)

      object.position.set(x, BASE_Y + 0.72 * scale, z)
      object.scale.set(0.25 * scale, 0.41 * scale, 0.25 * scale)
      object.rotation.set(0, rotation + 0.35, 0)
      object.updateMatrix()
      middle.current.setMatrixAt(index, object.matrix)

      object.position.set(x, BASE_Y + 0.93 * scale, z)
      object.scale.set(0.17 * scale, 0.33 * scale, 0.17 * scale)
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
        <meshStandardMaterial color="#675f4a" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={low} args={[null, null, count]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 14]} />
        <meshStandardMaterial color="#153b2b" roughness={0.98} />
      </instancedMesh>
      <instancedMesh ref={middle} args={[null, null, count]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 14]} />
        <meshStandardMaterial color="#205239" roughness={0.98} />
      </instancedMesh>
      <instancedMesh ref={high} args={[null, null, count]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 14]} />
        <meshStandardMaterial color="#34704e" roughness={0.98} />
      </instancedMesh>
    </group>
  )
}

function ShrubCluster() {
  const shrubs = useMemo(() => {
    const random = seededRandom(9441)
    return Array.from({ length: 17 }, (_, index) => ({
      x: -1.85 + random() * 6.45,
      z: 0.12 + random() * 1.7,
      size: 0.11 + random() * 0.15,
      index,
    })).filter(({ x }) => !(x > -1.08 && x < 1.62))
  }, [])

  return (
    <group>
      {shrubs.map((shrub) => (
        <mesh
          key={shrub.index}
          position={[shrub.x, BASE_Y + shrub.size * 0.72, shrub.z]}
          scale={[shrub.size * 1.15, shrub.size * 0.8, shrub.size]}
          castShadow
        >
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial color={shrub.index % 2 ? '#71934e' : '#587d40'} roughness={1} />
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
        <meshPhysicalMaterial color={IVORY} roughness={0.92} clearcoat={0.018} />
      </mesh>
      <RoundedBox args={[0.28, 0.4, 0.06]} radius={0.11} smoothness={5} position={[0, 0.2, 0.61]}>
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
        <meshPhysicalMaterial color="#ece8dc" roughness={0.88} clearcoat={0.025} />
      </mesh>
      <mesh position={[-0.57, 0.29, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.58, 24]} />
        <meshStandardMaterial color="#ece8dc" roughness={0.92} />
      </mesh>
      <mesh position={[0.57, 0.29, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.58, 24]} />
        <meshStandardMaterial color="#ece8dc" roughness={0.92} />
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
      <meshPhysicalMaterial color="#e8e5da" roughness={0.8} clearcoat={0.035} />
    </mesh>
  )
}

function MicroDetails() {
  return (
    <group>
      <group position={[-2.25, BASE_Y, 1.33]}>
        <mesh position={[-0.24, 0.2, 0]} castShadow>
          <boxGeometry args={[0.045, 0.4, 0.045]} />
          <meshStandardMaterial color="#9a7449" roughness={1} />
        </mesh>
        <mesh position={[0.24, 0.2, 0]} castShadow>
          <boxGeometry args={[0.045, 0.4, 0.045]} />
          <meshStandardMaterial color="#9a7449" roughness={1} />
        </mesh>
        <mesh position={[0, 0.41, 0]} castShadow>
          <boxGeometry args={[0.62, 0.055, 0.065]} />
          <meshStandardMaterial color="#9a7449" roughness={1} />
        </mesh>
      </group>

      <group position={[-1.62, BASE_Y, 1.45]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.48, 0.045, 0.15]} />
          <meshStandardMaterial color="#a48155" roughness={1} />
        </mesh>
        <mesh position={[-0.17, 0.055, 0]}>
          <boxGeometry args={[0.035, 0.11, 0.08]} />
          <meshStandardMaterial color="#766347" roughness={1} />
        </mesh>
        <mesh position={[0.17, 0.055, 0]}>
          <boxGeometry args={[0.035, 0.11, 0.08]} />
          <meshStandardMaterial color="#766347" roughness={1} />
        </mesh>
      </group>

      <group position={[4.58, BASE_Y, 1.23]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.68, 0.44, 0.32]} />
          <meshStandardMaterial color="#ebe7dc" roughness={0.94} />
        </mesh>
        <mesh position={[0, 0.24, 0.166]}>
          <boxGeometry args={[0.24, 0.035, 0.01]} />
          <meshStandardMaterial color="#314a3d" roughness={1} />
        </mesh>
      </group>
    </group>
  )
}

function Architecture() {
  const tubeA = useMemo(() => [
    [2.12, BASE_Y + 0.04, 0.42],
    [2.24, BASE_Y + 0.85, 0.28],
    [2.68, BASE_Y + 1.36, 0.02],
    [2.86, BASE_Y + 1.88, -0.25],
  ], [])
  const tubeB = useMemo(() => [
    [2.76, BASE_Y + 0.04, 0.72],
    [2.98, BASE_Y + 0.56, 0.74],
    [2.82, BASE_Y + 1.0, 0.52],
  ], [])

  return (
    <group>
      <DomeShelter position={[-0.42, BASE_Y, 0.86]} scale={0.78} />
      <ArchPassage position={[0.86, BASE_Y, 0.9]} scale={0.75} />

      <mesh position={[-1.14, BASE_Y - 0.01, 0.9]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.07, 0.42]} />
        <meshStandardMaterial color="#aa8e65" roughness={0.98} />
      </mesh>

      <FlowTube points={tubeA} radius={0.13} />
      <FlowTube points={tubeB} radius={0.11} />

      <mesh position={[2.57, BASE_Y + 0.82, 0.48]} rotation={[0.03, 0.18, 0]} castShadow>
        <torusGeometry args={[0.33, 0.095, 18, 52]} />
        <meshPhysicalMaterial color="#ece8dc" roughness={0.86} clearcoat={0.025} />
      </mesh>

      <RoundedBox args={[0.34, 2.04, 0.42]} radius={0.035} smoothness={4} position={[3.52, BASE_Y + 1.02, -0.42]} castShadow>
        <meshStandardMaterial color="#dfddd2" roughness={0.92} />
      </RoundedBox>
      <RoundedBox args={[0.27, 1.62, 0.37]} radius={0.03} smoothness={4} position={[3.98, BASE_Y + 0.81, -0.1]} castShadow>
        <meshStandardMaterial color="#ece9df" roughness={0.93} />
      </RoundedBox>
      <RoundedBox args={[0.21, 1.12, 0.31]} radius={0.03} smoothness={4} position={[4.35, BASE_Y + 0.56, 0.08]} castShadow>
        <meshStandardMaterial color="#d7d5ca" roughness={0.94} />
      </RoundedBox>

      <mesh position={[3.16, BASE_Y + 0.67, 0.53]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.12, 48]} />
        <meshPhysicalMaterial color="#ece9de" roughness={0.86} clearcoat={0.025} />
      </mesh>
      <mesh position={[3.16, BASE_Y + 0.67, 0.595]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.02, 24]} />
        <meshStandardMaterial color="#516257" roughness={1} />
      </mesh>
    </group>
  )
}

function Pebble({ position, scale, phase, reducedMotion }) {
  const ref = useRef()

  useFrame(({ clock }, delta) => {
    if (!ref.current || reducedMotion) return
    ref.current.rotation.y += delta * 0.07
    ref.current.rotation.x += delta * 0.04
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.34 + phase) * 0.04
  })

  return (
    <mesh ref={ref} position={position} scale={scale} castShadow>
      <icosahedronGeometry args={[1, 3]} />
      <meshPhysicalMaterial color="#d4d6cd" roughness={0.98} clearcoat={0.01} />
    </mesh>
  )
}

function PresentationBase() {
  return (
    <group>
      <RoundedBox args={[11.15, 0.15, 3.48]} radius={0.045} smoothness={4} position={[0, BASE_Y - 0.1, 0.38]} receiveShadow>
        <meshStandardMaterial color="#ddd9ce" roughness={0.99} />
      </RoundedBox>
      <mesh position={[0, BASE_Y - 0.205, 0.38]} receiveShadow>
        <boxGeometry args={[11.38, 0.065, 3.64]} />
        <meshStandardMaterial color="#c9c7bc" roughness={1} />
      </mesh>
    </group>
  )
}

function World({ reducedMotion }) {
  const group = useRef()

  useFrame(({ pointer }, delta) => {
    if (!group.current) return
    const targetY = reducedMotion ? 0 : pointer.x * 0.01
    const targetX = reducedMotion ? 0 : -pointer.y * 0.005
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3.5, delta)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 3.5, delta)
  })

  return (
    <group ref={group} position={[0, -0.02, 0]}>
      <PresentationBase />
      <MountainMass />
      <ShrubCluster />
      <MicroDetails />
      <Architecture />
      <InstancedForest count={44} />

      <Pebble position={[-4.92, 2.12, -0.32]} scale={[0.14, 0.105, 0.125]} phase={0.2} reducedMotion={reducedMotion} />
      <Pebble position={[-2.06, 2.76, -0.72]} scale={[0.09, 0.07, 0.08]} phase={1.4} reducedMotion={reducedMotion} />
      <Pebble position={[3.76, 2.2, -0.6]} scale={[0.29, 0.25, 0.27]} phase={2.1} reducedMotion={reducedMotion} />
      <Pebble position={[4.68, 1.24, 0.36]} scale={[0.105, 0.08, 0.095]} phase={3.2} reducedMotion={reducedMotion} />
    </group>
  )
}

function SceneContent() {
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  return (
    <>
      <fog attach="fog" args={[SAGE_FOG, 9.2, 17.2]} />
      <ambientLight intensity={1.04} />
      <hemisphereLight args={['#f3f0e7', '#56705f', 1.22]} />
      <directionalLight
        position={[-3.8, 7.5, 5.6]}
        intensity={2.08}
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
      <directionalLight position={[5, 2.2, 3]} intensity={0.54} color="#dce7d8" />

      <World reducedMotion={reducedMotion} />

      <ContactShadows position={[0, BASE_Y - 0.015, 0.38]} scale={12} opacity={0.2} blur={3.2} far={4.2} resolution={1024} frames={1} />
    </>
  )
}

export default function LandscapeScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.72, 12.75], fov: 29, near: 0.1, far: 45 }}
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
