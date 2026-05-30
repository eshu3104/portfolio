"use client"

import { useEffect, useRef, useCallback } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { VRMLoaderPlugin, VRMHumanBoneName, VRM } from "@pixiv/three-vrm"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { PerspectiveCamera } from "@react-three/drei"


// ─── Types ────────────────────────────────────────────────────────────────────

interface TalkingHeadProps {
  /** 0.0 → 1.0 real-time amplitude from WebAudio, drives lip sync */
  amplitude: number
  /** Optional className for the canvas wrapper */
  className?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VISEME_SHAPES = ["aa", "ih", "ou", "ee", "oh"] as const

const CAMERA_AUTO     = true
const MANUAL_CAMERA_POS  = new THREE.Vector3(0, 2.6, 2.0)
const MANUAL_CAMERA_LOOK = new THREE.Vector3(0, 2.0, 0)
const CAMERA_Z        = 2.0
const CAMERA_Y_OFFSET = 0.02
const LOOK_Y_OFFSET   = 0.02

const EYE_LIMIT_X     = 0.25
const EYE_LIMIT_Y     = 0.35
const EYE_SENSITIVITY = 0.5

// ─── VRM loader ───────────────────────────────────────────────────────────────

function VRMModel({ onLoad }: { onLoad: (vrm: VRM) => void }) {
  const sceneRef = useRef<THREE.Group | null>(null)

  useEffect(() => {
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))
    loader.load(
      "/avatar.vrm",
      (gltf) => {
        const vrm: VRM = gltf.userData.vrm
        vrm.scene.rotation.y = Math.PI
        sceneRef.current?.add(vrm.scene)
        onLoad(vrm)
      },
      undefined,
      (err) => console.error("VRM load error:", err)
    )
  }, [onLoad])

  return <group ref={sceneRef} />
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function Scene({ amplitude }: { amplitude: number }) {
  const amplitudeRef = useRef(0)
  const vrmRef    = useRef<VRM | null>(null)
  const clockRef  = useRef(new THREE.Clock())
  const mouseRef  = useRef(new THREE.Vector2(0, 0))
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const tRef      = useRef(0)

  // Reusable vectors — never allocated inside the frame loop
  const eyeCenterRef = useRef(new THREE.Vector3())
  const tempVecRef   = useRef(new THREE.Vector3())

  // Cached bone refs
  const headRef          = useRef<THREE.Object3D | null>(null)
  const leftEyeRef       = useRef<THREE.Object3D | null>(null)
  const rightEyeRef      = useRef<THREE.Object3D | null>(null)
  const neckRef          = useRef<THREE.Object3D | null>(null)
  const spineRef         = useRef<THREE.Object3D | null>(null)
  const leftUpperArmRef  = useRef<THREE.Object3D | null>(null)
  const rightUpperArmRef = useRef<THREE.Object3D | null>(null)

  // Lip-sync
  const speakPhaseRef   = useRef(0)
  const mouthOpenRef    = useRef(0)
  const activeVisemeRef = useRef<(typeof VISEME_SHAPES)[number]>("aa")

  // Blink
  const blinkTimerRef        = useRef(0)
  const blinkStateRef        = useRef<"open" | "closing" | "opening">("open")
  const blinkValueRef        = useRef(0)
  const nextBlinkIntervalRef = useRef(3 + Math.random() * 3)

  const handleVRMLoad = useCallback((vrm: VRM) => {
    vrmRef.current         = vrm
    headRef.current        = vrm.humanoid?.getNormalizedBoneNode(VRMHumanBoneName.Head)          ?? null
    leftEyeRef.current     = vrm.humanoid?.getNormalizedBoneNode(VRMHumanBoneName.LeftEye)        ?? null
    rightEyeRef.current    = vrm.humanoid?.getNormalizedBoneNode(VRMHumanBoneName.RightEye)       ?? null
    neckRef.current        = vrm.humanoid?.getNormalizedBoneNode(VRMHumanBoneName.Neck)           ?? null
    spineRef.current       = vrm.humanoid?.getNormalizedBoneNode(VRMHumanBoneName.Spine)          ?? null
    leftUpperArmRef.current  = vrm.humanoid?.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm)  ?? null
    rightUpperArmRef.current = vrm.humanoid?.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm) ?? null

    // Arms set once — never change
    if (leftUpperArmRef.current) {
      leftUpperArmRef.current.rotation.z = 1.2
      leftUpperArmRef.current.rotation.x = 0.1
    }
    if (rightUpperArmRef.current) {
      rightUpperArmRef.current.rotation.z = -1.2
      rightUpperArmRef.current.rotation.x = 0.1
    }
  }, [])

  useEffect(() => {
  amplitudeRef.current = amplitude
}, [amplitude])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      )
    }
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      mouseRef.current.set(
        (touch.clientX / window.innerWidth) * 2 - 1,
        -(touch.clientY / window.innerHeight) * 2 + 1
      )
    }

    // Default eyes slightly down on mobile (toward the input)
    mouseRef.current.set(0, -0.2)

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("touchmove", onTouchMove)
    }
  }, [])

  useFrame(() => {
    const vrm = vrmRef.current
    if (!vrm) return

    const delta = clockRef.current.getDelta()
    tRef.current += delta
    const t = tRef.current

    // ── Eye center ────────────────────────────────────────────────────────
    const eyeCenter = eyeCenterRef.current
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.getWorldPosition(eyeCenter)
      rightEyeRef.current.getWorldPosition(tempVecRef.current)
      eyeCenter.add(tempVecRef.current).multiplyScalar(0.5)
    } else if (headRef.current) {
      headRef.current.getWorldPosition(eyeCenter)
    } else {
      eyeCenter.set(0, 1.9, 0)
    }

    // ── Camera ────────────────────────────────────────────────────────────
    if (cameraRef.current) {
      if (CAMERA_AUTO) {
        cameraRef.current.position.set(eyeCenter.x, eyeCenter.y + CAMERA_Y_OFFSET, CAMERA_Z)
        cameraRef.current.lookAt(eyeCenter.x, eyeCenter.y + LOOK_Y_OFFSET, 0)
      } else {
        cameraRef.current.position.copy(MANUAL_CAMERA_POS)
        cameraRef.current.lookAt(MANUAL_CAMERA_LOOK)
      }
    }

    // ── Eye tracking ──────────────────────────────────────────────────────
    const targetRotX = THREE.MathUtils.clamp( mouseRef.current.y * EYE_SENSITIVITY, -EYE_LIMIT_X, EYE_LIMIT_X)
    const targetRotY = THREE.MathUtils.clamp( mouseRef.current.x * EYE_SENSITIVITY, -EYE_LIMIT_Y, EYE_LIMIT_Y)

    if (leftEyeRef.current) {
      leftEyeRef.current.rotation.x = THREE.MathUtils.lerp(leftEyeRef.current.rotation.x, targetRotX, 0.1)
      leftEyeRef.current.rotation.y = THREE.MathUtils.lerp(leftEyeRef.current.rotation.y, targetRotY, 0.1)
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.rotation.x = THREE.MathUtils.lerp(rightEyeRef.current.rotation.x, targetRotX, 0.1)
      rightEyeRef.current.rotation.y = THREE.MathUtils.lerp(rightEyeRef.current.rotation.y, targetRotY, 0.1)
    }

    // ── Neck follow ───────────────────────────────────────────────────────
    if (neckRef.current) {
      const headTargetY = THREE.MathUtils.clamp(mouseRef.current.x * 0.15, -0.2, 0.2)
      const headTargetX = THREE.MathUtils.clamp(mouseRef.current.y * 0.08, -0.1, 0.1)
      neckRef.current.rotation.y = THREE.MathUtils.lerp(neckRef.current.rotation.y, headTargetY, 0.04)
      neckRef.current.rotation.x = THREE.MathUtils.lerp(neckRef.current.rotation.x, headTargetX + Math.sin(t * 0.25) * 0.012, 0.04)
      neckRef.current.rotation.z = THREE.MathUtils.lerp(neckRef.current.rotation.z, Math.sin(t * 0.4) * 0.02, 0.04)
    }

    // ── Lip-sync (amplitude-driven) ───────────────────────────────────────
    const exprMgr = vrm.expressionManager
    if (exprMgr) {
      const isSpeaking = amplitudeRef.current > 0.01

      if (isSpeaking) {
        // Drive mouth open directly from real audio amplitude
        mouthOpenRef.current = THREE.MathUtils.lerp(mouthOpenRef.current, amplitudeRef.current * 2.5, 0.4)


        // Cycle visemes in sync with amplitude rhythm
        speakPhaseRef.current += delta * 8.5
        const idx = Math.floor(speakPhaseRef.current * 0.6) % VISEME_SHAPES.length
        const nextViseme = VISEME_SHAPES[idx]
        if (nextViseme !== activeVisemeRef.current) {
          exprMgr.setValue(activeVisemeRef.current, 0)
          activeVisemeRef.current = nextViseme
        }
        exprMgr.setValue(activeVisemeRef.current, mouthOpenRef.current)
      } else if (mouthOpenRef.current > 0.001) {
        // Decay mouth closed when no audio
        mouthOpenRef.current *= 0.82
        exprMgr.setValue(activeVisemeRef.current, mouthOpenRef.current)
        if (mouthOpenRef.current <= 0.001) {
          exprMgr.setValue(activeVisemeRef.current, 0)
          mouthOpenRef.current = 0
        }
      }
    }

    // ── Blinking ──────────────────────────────────────────────────────────
    blinkTimerRef.current += delta
    if (blinkStateRef.current === "open" && blinkTimerRef.current > nextBlinkIntervalRef.current) {
      blinkStateRef.current = "closing"
      blinkTimerRef.current = 0
      nextBlinkIntervalRef.current = 3 + Math.random() * 3
    }
    if (blinkStateRef.current === "closing") {
      blinkValueRef.current = Math.min(1, blinkValueRef.current + delta * 14)
      if (blinkValueRef.current >= 1) blinkStateRef.current = "opening"
    } else if (blinkStateRef.current === "opening") {
      blinkValueRef.current = Math.max(0, blinkValueRef.current - delta * 10)
      if (blinkValueRef.current <= 0) {
        blinkValueRef.current = 0
        blinkStateRef.current = "open"
        blinkTimerRef.current = 0
      }
    }
    exprMgr?.setValue("blink", blinkValueRef.current)

    // ── Idle sway ─────────────────────────────────────────────────────────
    if (spineRef.current) {
      spineRef.current.rotation.z = Math.sin(t * 0.3) * 0.008
    }

    // ── VRM update LAST — must not overwrite our bone rotations ──────────
    vrm.update(delta)
  })

  return (
    <>
      <PerspectiveCamera
        makeDefault
        ref={cameraRef}
        position={[MANUAL_CAMERA_POS.x, MANUAL_CAMERA_POS.y, MANUAL_CAMERA_POS.z]}
        fov={18}
        near={0.01}
        far={10}
      />
      <ambientLight intensity={0.6} />
      <directionalLight position={[1, 2, 2]} intensity={1.2} castShadow />
      <directionalLight position={[-1, 0, 1]} intensity={0.4} color="#c4b5fd" />
      <VRMModel onLoad={handleVRMLoad} />
    </>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function TalkingHead({ amplitude, className = "" }: TalkingHeadProps) {
  return (
    <div className={`relative w-40 h-56 sm:w-44 sm:h-60 rounded-2xl overflow-hidden ${className}`}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene amplitude={amplitude} />
      </Canvas>
    </div>
  )
}