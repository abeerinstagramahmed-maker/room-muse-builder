import { useState } from 'react';
import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import { useStudioStore } from '@/stores/studioStore';

/** Format a distance in feet as feet + inches, e.g. 7.5 -> 7' 6". */
export function formatFeet(feet: number): string {
  const whole = Math.floor(feet);
  const inches = Math.round((feet - whole) * 12);
  if (inches === 12) return `${whole + 1}' 0"`;
  return `${whole}' ${inches}"`;
}

function DistanceLabel({ a, b }: { a: [number, number, number]; b: [number, number, number] }) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const dist = va.distanceTo(vb);
  return (
    <Html position={[mid.x, mid.y + 0.1, mid.z]} center distanceFactor={12}>
      <div className="pointer-events-none whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow">
        {formatFeet(dist)}
      </div>
    </Html>
  );
}

export function MeasurementLayer() {
  const measureMode = useStudioStore((s) => s.measureMode);
  const measurements = useStudioStore((s) => s.measurements);
  const addMeasurement = useStudioStore((s) => s.addMeasurement);
  const [pending, setPending] = useState<[number, number, number] | null>(null);

  const handleClick = (e: any) => {
    if (!measureMode) return;
    e.stopPropagation();
    const p: [number, number, number] = [e.point.x, 0.05, e.point.z];
    if (!pending) {
      setPending(p);
    } else {
      addMeasurement(pending, p);
      setPending(null);
    }
  };

  return (
    <group>
      {measureMode && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          onClick={handleClick}
          visible={false}
        >
          <planeGeometry args={[500, 500]} />
          <meshBasicMaterial />
        </mesh>
      )}

      {measurements.map((m) => (
        <group key={m.id}>
          <Line points={[m.a, m.b]} color="#3b82f6" lineWidth={2} dashed dashSize={0.2} gapSize={0.1} />
          <DistanceLabel a={m.a} b={m.b} />
        </group>
      ))}

      {pending && (
        <mesh position={pending}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
      )}
    </group>
  );
}
