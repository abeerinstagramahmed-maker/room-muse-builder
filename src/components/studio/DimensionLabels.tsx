import { Html } from '@react-three/drei';
import { useStudioStore } from '@/stores/studioStore';
import { formatFeet } from './MeasurementLayer';

function Label({
  position,
  text,
}: {
  position: [number, number, number];
  text: string;
}) {
  return (
    <Html position={position} center distanceFactor={14}>
      <div className="pointer-events-none whitespace-nowrap rounded bg-foreground/80 px-1.5 py-0.5 text-[10px] font-medium text-background shadow">
        {text}
      </div>
    </Html>
  );
}

/** Floating labels for room floor edges and the selected item's dimensions. */
export function DimensionLabels() {
  const room = useStudioStore((s) => s.room);
  const furniture = useStudioStore((s) => s.furniture);
  const selectedId = useStudioStore((s) => s.selectedId);

  const halfW = room.width / 2;
  const halfD = room.depth / 2;

  const selected = furniture.find((f) => f.instanceId === selectedId);

  return (
    <group>
      {/* Room width along the front (+Z) edge */}
      <Label position={[0, 0.05, halfD + 0.5]} text={formatFeet(room.width)} />
      {/* Room depth along the right (+X) edge */}
      <Label position={[halfW + 0.5, 0.05, 0]} text={formatFeet(room.depth)} />

      {selected && (
        <group position={selected.position}>
          <Label
            position={[0, selected.size[1] * selected.scale + 0.4, 0]}
            text={`${formatFeet(selected.size[0] * selected.scale)} W × ${formatFeet(
              selected.size[2] * selected.scale,
            )} D × ${formatFeet(selected.size[1] * selected.scale)} H`}
          />
        </group>
      )}
    </group>
  );
}
