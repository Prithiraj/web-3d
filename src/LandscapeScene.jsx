import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const BASE_Y = -1.34

const TUBE_A = [
  [1.9, -1.08, 0.45],
  [2.0, -0.15, 0.4],
  [2.55, 0.5, 0.1],
  [2.95, 1.15, -0.3],
]

const TUBE_B = [
  [2.75, -1.12, 0.65],
  [3.05, -0.35, 0.62],
  [2.85, 0.38, 0.35],
]

function seededRandom(seed) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646

  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function CameraRig({ reducedMotion }) {
  useFrame(({ camera, pointer }, delta) => {
    const targetX = reducedMotion ? 0 : pointer.x * 0.55
    const targetY = reducedMotion ? 2.45 : 2.45 + pointer.y * 0.18

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.2, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.2, delta)
    camera.lookAt(0, -0.05, 0)
  })

  return null
}

function Mountain({ position, scale, color = '#d7d7cc', rotation = 0 }) {
  return (
    <mesh position={position} scale={scale} rotation={[0, rotation, 0]} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial color={color} roughness={1} flatShading />
    </mesh>
  )
}

function Mountains() {
  return (
    <group>
      <Mountain position={[-3.9, 0.35, -1.25]} scale={[1.45, 2.4, 1.15]} rotation={0.25} />
      <Mountain position={[-2.85, 0.05, -1.55]} scale={[1.15, 1.9, 0.95]} color="#c9cbc1" rotation={0.8} />
      <Mountain position={[-4.75, -0.2, -0.55]} scale={[0.9, 1.55, 0.8]} color="#e0dfd5" rotation={0.5} />
      <Mountain position={[-1.95, -0.35, -1.65]} scale={[0.75, 1.3, 0.72]} color="#bfc4b9" rotation={0.1} />
    </group>
  )
}

function InstancedForest({ count = 58 }) {
  const trunks = useRef()
  const lowerNeedles = useRef()
  const upperNeedles = useRef()

  const trees = useMemo(() => {
    const random = seededRandom(8128)
    const items = []

    for (let index = 0; index < count; index += 1) {
      const sideBias = random() > 0.55 ? 1 : -1
      const x = sideBias * (1.05 + random() * 4.15)
      const z = -0.45 + random() * 2.4
      const scale = 0.55 + random() * 0.72
      const shade = random()
      items.push({ x, z, scale, shade })
    }

    return items
  }, [count])

  useLayoutEffect(() => {
    const object = new THREE.Object3D()

    trees.forEach((tree, index) => {
      const { x, z, scale } = tree

      object.position.set(x, BASE_Y + 0.27 * scale, z)
      object.scale.set(0.07 * scale, 0.54 * scale, 0.07 * scale)
      object.rotation.set(0, 0, 0)
      object.updateMatrix()
      trunks.current.setMatrixAt(index, object.matrix)

      object.position.set(x, BASE_Y + 0.72 * scale, z)
      object.scale.set(0.43 * scale, 0.72 * scale, 0.43 * scale)
      object.rotation.set(0, tree.shade * Math.PI, 0)
      object.updateMatrix()
      lowerNeedles.current.setMatrixAt(index, object.matrix)

      object.position.set(x, BASE_Y + 1.08 * scale, z)
      object.scale.set(0.3 * scale, 0.62 * scale, 0.3 * scale)
      object.rotation.set(0, tree.shade * Math.PI * 0.5, 0)
      object.updateMatrix()
      upperNeedles.current.setMatrixAt(index, object.matrix)
    })

    trunks.current.instanceMatrix.needsUpdate = true
    lowerNeedles.current.instanceMatrix.needsUpdate = true
    upperNeedles.current.instanceMatrix.needsUpdate = true
  }, [trees])

  return (
    <group>
      <instancedMesh ref={trunks} args={[null, null, count]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.15, 1, 6]} />
        <meshStandardMaterial color="#655e49" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={lowerNeedles} args={[null, null, count]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#173c2b" roughness={0.92} />
      </instancedMesh>
      <instancedMesh ref={upperNeedles} args={[null, null, count]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#25563a" roughness={0.92} />
      </instancedMesh>
    </group>
  )
}

function Pod({ position = [0, BASE_Y, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.72, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e8e5da" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.23, 0.704]} scale={[0.28, 0.34, 1]}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#173126" roughness={1} />
      </mesh>
      <mesh position={[0, 0.08, 0.71]} scale={[0.56, 0.2, 0.04]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#173126" roughness={1} />
      </mesh>
    </group>
  )
}

function Arch({ position = [0, BASE_Y, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <torusGeometry args={[0.62, 0.14, 16, 48, Math.PI]} />
        <meshStandardMaterial color="#ece9de" roughness={0.72} />
      </mesh>
      <mesh position={[-0.62, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.6, 20]} />
        <meshStandardMaterial color="#ece9de" roughness={0.72} />
      </mesh>
      <mesh position={[0.62, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.6, 20]} />
        <meshStandardMaterial color="#ece9de" roughness={0.72} />
      </mesh>
    </group>
  )
}

function FlowTube({ points, radius = 0.16 }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))),
    [points],
  )

  return (
    <mesh castShadow receiveShadow>
      <tubeGeometry args={[curve, 64, radius, 12, false]} />
      <meshStandardMaterial color="#e5e2d7" roughness={0.68} />
    </mesh>
  )
}

function Architecture() {
  return (
    <group>
      <Pod position={[-0.35, BASE_Y, 0.82]} scale={0.86} />
      <Arch position={[0.95, BASE_Y, 0.86]} scale={0.82} />
      <FlowTube points={TUBE_A} radius={0.18} />
      <FlowTube points={TUBE_B} radius={0.15} />

      <mesh position={[3.72, -0.22, -0.45]} castShadow>
        <boxGeometry args={[0.48, 2.45, 0.48]} />
        <meshStandardMaterial color="#e3e0d5" roughness={0.8} />
      </mesh>
      <mesh position={[4.25, -0.48, -0.25]} castShadow>
        <boxGeometry args={[0.33, 1.95, 0.42]} />
        <meshStandardMaterial color="#f0ede2" roughness={0.82} />
      </mesh>
      <mesh position={[3.2, -0.82, 0.38]} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.39, 0.11, 16, 40]} />
        <meshStandardMaterial color="#eeeade" roughness={0.72} />
      </mesh>
    </group>
  )
}

function FloatingStone({ position, scale = 0.25, speed = 0.5, phase = 0, reducedMotion }) {
  const ref = useRef()
  const baseY = position[1]

  useFrame(({ clock }, delta) => {
    if (!ref.current || reducedMotion) return
    ref.current.rotation.x += delta * 0.12
    ref.current.rotation.y += delta * 0.18
    ref.current.position.y = baseY + Math.sin(clock.elapsedTime * speed + phase) * 0.12
  })

  return (
    <mesh ref={ref} position={position} scale={scale} castShadow>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial color="#d8dcd3" roughness={0.94} flatShading />
    </mesh>
  )
}

function SceneContent() {
  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  return (
    <>
      <color attach="background" args={['#afbea9']} />
      <fog attach="fog" args={['#afbea9', 9.5, 18]} />

      <ambientLight intensity={1.2} />
      <hemisphereLight args={['#edf0e7', '#405449', 1.2]} />
      <directionalLight
        position={[4, 8, 6]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={22}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-6}
      />

      <CameraRig reducedMotion={reducedMotion} />

      <RoundedBox
        args={[11.4, 0.24, 4.6]}
        radius={0.08}
        smoothness={4}
        position={[0, -1.5, 0.3]}
        receiveShadow
      >
        <meshStandardMaterial color="#ddd9cb" roughness={0.9} />
      </RoundedBox>

      <Mountains />
      <InstancedForest />
      <Architecture />

      <FloatingStone
        position={[-4.65, 2.72, 0.2]}
        scale={0.22}
        speed={0.42}
        phase={0.5}
        reducedMotion={reducedMotion}
      />
      <FloatingStone
        position={[-1.55, 3.36, -0.8]}
        scale={0.17}
        speed={0.52}
        phase={1.8}
        reducedMotion={reducedMotion}
      />
      <FloatingStone
        position={[3.55, 2.55, -0.5]}
        scale={0.46}
        speed={0.36}
        phase={2.4}
        reducedMotion={reducedMotion}
      />
      <FloatingStone
        position={[4.72, 1.18, 0.8]}
        scale={0.17}
        speed={0.48}
        phase={3.1}
        reducedMotion={reducedMotion}
      />

      <ContactShadows
        position={[0, -1.37, 0.4]}
        scale={13}
        opacity={0.34}
        blur={2.5}
        far={3.8}
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
      dpr={[1, 1.75]}
      camera={{ position: [0, 2.45, 11], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <SceneContent />
    </Canvas>
  )
}
