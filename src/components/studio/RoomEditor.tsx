import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, GizmoHelper, GizmoViewport, Grid, OrthographicCamera, PerspectiveCamera, Environment, Lightformer } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { Room } from './Room';
import { DropBridge } from './DropBridge';
import { FurnitureItem } from './FurnitureItem';
import { MeasurementLayer } from './MeasurementLayer';
import { DimensionLabels } from './DimensionLabels';
import { useStudioStore } from '@/stores/studioStore';
import { getLighting } from '@/lib/studioConstants';
import { cameraPose } from '@/lib/studioCamera';
import { clampToFloor } from '@/lib/roomLayout';
import { walkInput } from '@/lib/walkInput';

/** Resets the camera when cameraResetToken changes. */
function CameraRig({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl> }) {
  const { camera, size } = useThree();
  const token = useStudioStore((s) => s.cameraResetToken);
  const view = useStudioStore((s) => s.cameraView);
  const room = useStudioStore((s) => s.room);

  useEffect(() => {
    const pose = cameraPose(view, room, size.width / size.height);
    camera.position.set(...pose.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(...pose.target);
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = Math.min(size.width / room.width, size.height / room.depth) * 0.7;
      camera.updateProjectionMatrix();
    }
    const controls = controlsRef.current;
    if (controls) {
      controls.target.set(...pose.target);
      controls.update();
    }
  }, [camera, token, view, room.width, room.depth, room.height, size.width, size.height, controlsRef]);

  return null;
}

const WALK_SPEED = 6;
const TURN_SPEED = 1.8;

/** First-person eye-level walking: drag to look, WASD/arrows or on-screen pad to move. */
function WalkControls() {
  const { camera, gl } = useThree();
  const room = useStudioStore((s) => s.room);
  const token = useStudioStore((s) => s.cameraResetToken);
  const look = useRef({ yaw: 0, pitch: 0 });
  const keys = useRef(new Set<string>());

  useEffect(() => {
    look.current = { yaw: 0, pitch: 0 };
    camera.rotation.order = 'YXZ';
  }, [camera, token]);

  useEffect(() => {
    const el = gl.domElement;
    let last: { x: number; y: number } | null = null;
    const down = (e: PointerEvent) => { last = { x: e.clientX, y: e.clientY }; };
    const move = (e: PointerEvent) => {
      if (!last) return;
      look.current.yaw -= (e.clientX - last.x) * 0.005;
      look.current.pitch = Math.max(-1.2, Math.min(1.2, look.current.pitch - (e.clientY - last.y) * 0.005));
      last = { x: e.clientX, y: e.clientY };
    };
    const up = () => { last = null; };
    const kd = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      keys.current.add(e.key.toLowerCase());
    };
    const ku = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      walkInput.forward = walkInput.strafe = walkInput.turn = 0;
    };
  }, [gl]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const k = keys.current;
    const fwd = (k.has('w') || k.has('arrowup') ? 1 : 0) - (k.has('s') || k.has('arrowdown') ? 1 : 0) + walkInput.forward;
    const strafe = (k.has('d') ? 1 : 0) - (k.has('a') ? 1 : 0) + walkInput.strafe;
    const turn = (k.has('arrowleft') ? 1 : 0) - (k.has('arrowright') ? 1 : 0) + walkInput.turn;
    look.current.yaw += turn * TURN_SPEED * dt;
    const { yaw, pitch } = look.current;
    const dx = (-Math.sin(yaw) * fwd + Math.cos(yaw) * strafe) * WALK_SPEED * dt;
    const dz = (-Math.cos(yaw) * fwd - Math.sin(yaw) * strafe) * WALK_SPEED * dt;
    const [x, z] = clampToFloor(camera.position.x + dx, camera.position.z + dz, room, [0.8, 0.8]);
    camera.position.set(x, Math.min(5.5, room.height - 0.5), z);
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  });

  return null;
}

/** Registers a screenshot capture callback into the store. */
function ScreenshotBridge() {
  const { gl, scene, camera } = useThree();
  const register = useStudioStore((s) => s.registerCapture);

  useEffect(() => {
    register(() => {
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `room-design-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    });
    return () => register(null);
  }, [gl, scene, camera, register]);

  return null;
}

/** Deselects everything when clicking empty space. */
function BackgroundCatcher() {
  const select = useStudioStore((s) => s.select);
  return (
    <mesh
      position={[0, -0.5, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={() => select(null)}
      visible={false}
    >
      <planeGeometry args={[500, 500]} />
      <meshBasicMaterial />
    </mesh>
  );
}

export function RoomEditor() {
  const furniture = useStudioStore((s) => s.furniture);
  const gridVisible = useStudioStore((s) => s.gridVisible);
  const measureMode = useStudioStore((s) => s.measureMode);
  const room = useStudioStore((s) => s.room);
  const lightingId = useStudioStore((s) => s.lightingId);
  const brightness = useStudioStore((s) => s.brightness);
  const lighting = getLighting(lightingId);
  const initialDist = useRef(Math.max(room.width, room.depth) * 1.1 + 8);
  const view = useStudioStore((s) => s.cameraView);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ position: [initialDist.current, initialDist.current * 0.8, initialDist.current], fov: 45 }}
    >
      {view === 'top' ? <OrthographicCamera makeDefault position={[0, 40, 0.001]} near={0.1} far={500} /> : <PerspectiveCamera makeDefault fov={view === 'eye' ? 65 : 45} near={0.1} far={500} />}
      <color attach="background" args={[lighting.background]} />
      <Environment resolution={128}>
        <Lightformer intensity={0.6 * brightness} color="#ffe6c7" position={[-10, 5, 0]} rotation-y={Math.PI / 2} scale={[20, 6, 1]} />
        <Lightformer intensity={0.5 * brightness} position={[0, 15, 0]} rotation-x={-Math.PI / 2} scale={[25, 25, 1]} />
      </Environment>
      <hemisphereLight intensity={0.6 * brightness} groundColor={lighting.groundColor} />
      <ambientLight intensity={lighting.ambient * brightness} />
      <directionalLight
        position={[10, 18, 8]}
        intensity={lighting.directional * brightness}
        color={lighting.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      <BackgroundCatcher />
      <Room cutaway />

      {furniture.map((item) => (
        <FurnitureItem key={item.instanceId} item={item} />
      ))}

      <ContactShadows position={[0, 0.015, 0]} scale={Math.max(room.width, room.depth) + 4} opacity={0.45} blur={2.4} far={6} resolution={512} />
      <DropBridge />
      <MeasurementLayer />
      <DimensionLabels />


      {gridVisible && (
        <Grid
          args={[80, 80]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#9ca3af"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#6b7280"
          fadeDistance={60}
          infiniteGrid
          position={[0, 0.01, 0]}
        />
      )}

      <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2} enabled={view !== 'eye'} enableRotate={!measureMode && view === 'dollhouse'} />
      {view === 'eye' && <WalkControls />}
      <CameraRig controlsRef={controlsRef} />
      <ScreenshotBridge />

      <GizmoHelper alignment="top-right" margin={[70, 120]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
      </GizmoHelper>
    </Canvas>
  );
}
