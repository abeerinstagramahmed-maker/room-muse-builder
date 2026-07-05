import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Room } from './Room';
import { FurnitureItem } from './FurnitureItem';
import { MeasurementLayer } from './MeasurementLayer';
import { DimensionLabels } from './DimensionLabels';
import { useStudioStore } from '@/stores/studioStore';

/** Resets the camera when cameraResetToken changes. */
function CameraRig() {
  const { camera, controls } = useThree() as any;
  const token = useStudioStore((s) => s.cameraResetToken);
  const room = useStudioStore((s) => s.room);

  useEffect(() => {
    const dist = Math.max(room.width, room.depth) * 1.1 + 8;
    camera.position.set(dist, dist * 0.8, dist);
    camera.lookAt(0, room.height / 2, 0);
    if (controls) {
      controls.target.set(0, room.height / 2, 0);
      controls.update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ position: [initialDist.current, initialDist.current * 0.8, initialDist.current], fov: 45 }}
    >
      <color attach="background" args={[lighting.background]} />
      <hemisphereLight intensity={0.6 * brightness} groundColor={lighting.groundColor} />
      <ambientLight intensity={lighting.ambient * brightness} />
      <directionalLight
        position={[10, 18, 8]}
        intensity={lighting.directional * brightness}
        color={lighting.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <BackgroundCatcher />
      <Room />

      {furniture.map((item) => (
        <FurnitureItem key={item.instanceId} item={item} />
      ))}

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

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.05} enableRotate={!measureMode} />
      <CameraRig />
      <ScreenshotBridge />

      <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
      </GizmoHelper>
    </Canvas>
  );
}
