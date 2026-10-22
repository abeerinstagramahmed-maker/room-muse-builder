import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStudioStore } from '@/stores/studioStore';
import { getFlooring } from '@/lib/studioConstants';
import { FlooringOption, Rug, WallId, WallOpening } from '@/types/studio';
import { isWallCutAway } from '@/lib/studioCamera';
import { notchRect } from '@/lib/roomLayout';

const TRIM = '#f7f5f0';

function floorTexture(f: FlooringOption, w: number, d: number): THREE.CanvasTexture | null {
  const pattern = f.pattern ?? 'solid';
  if (pattern === 'solid') return null;
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  if (!g) return null;
  const base = new THREE.Color(f.color);
  const shade = (k: number) => {
    const col = base.clone().multiplyScalar(k);
    return `#${col.getHexString()}`;
  };
  g.fillStyle = f.color;
  g.fillRect(0, 0, size, size);
  let tilesPerFt = 0.5;
  if (pattern === 'plank') {
    const rows = 8;
    const rh = size / rows;
    for (let r = 0; r < rows; r++) {
      let x = -((r * 137) % 300);
      while (x < size) {
        const len = 220 + ((r * 53 + x) % 160);
        g.fillStyle = shade(0.88 + ((r * 7 + Math.abs(x)) % 5) * 0.05);
        g.fillRect(x, r * rh, len, rh);
        g.strokeStyle = shade(0.65);
        g.lineWidth = 2;
        g.strokeRect(x, r * rh, len, rh);
        x += len;
      }
    }
    tilesPerFt = 1 / 5;
  } else if (pattern === 'herringbone') {
    const u = 32;
    for (let i = -size; i < size * 2; i += u * 2) {
      for (let j = -size; j < size * 2; j += u) {
        g.save();
        g.translate(i + j, j);
        g.rotate(Math.PI / 4);
        g.fillStyle = shade(0.85 + (((i + j) / u) % 3) * 0.07);
        g.fillRect(0, 0, u * 3, u);
        g.strokeStyle = shade(0.6);
        g.strokeRect(0, 0, u * 3, u);
        g.restore();
      }
    }
    tilesPerFt = 1 / 4;
  } else if (pattern === 'tile' || pattern === 'checker') {
    const n = 4;
    const t = size / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        g.fillStyle =
          pattern === 'checker' && (i + j) % 2 ? shade(0.35) : shade(0.94 + ((i * 3 + j) % 3) * 0.03);
        g.fillRect(i * t, j * t, t, t);
      }
    g.strokeStyle = shade(0.7);
    g.lineWidth = 3;
    for (let i = 0; i <= n; i++) {
      g.beginPath(); g.moveTo(i * t, 0); g.lineTo(i * t, size); g.stroke();
      g.beginPath(); g.moveTo(0, i * t); g.lineTo(size, i * t); g.stroke();
    }
    tilesPerFt = 1 / 8;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(w * tilesPerFt, d * tilesPerFt);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function rugTexture(r: Rug): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  if (!g) return new THREE.CanvasTexture(c);
  const base = new THREE.Color(r.color);
  const alt = `#${base.clone().lerp(new THREE.Color('#ffffff'), 0.45).getHexString()}`;
  g.fillStyle = r.color;
  g.fillRect(0, 0, 256, 256);
  if (r.pattern === 'stripe') {
    g.fillStyle = alt;
    for (let i = 0; i < 256; i += 32) g.fillRect(i, 0, 12, 256);
  } else if (r.pattern === 'border') {
    g.strokeStyle = alt;
    g.lineWidth = 14;
    g.strokeRect(22, 22, 212, 212);
    g.lineWidth = 4;
    g.strokeRect(44, 44, 168, 168);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function RugMesh({ rug }: { rug: Rug }) {
  const selectRug = useStudioStore((s) => s.selectRug);
  const selected = useStudioStore((s) => s.selectedRugId === rug.id);
  const tex = useMemo(() => rugTexture(rug), [rug.color, rug.pattern]);
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[rug.x, 0.012, rug.z]}
      receiveShadow
      scale={rug.shape === 'round' ? [rug.width / 2, rug.depth / 2, 1] : [1, 1, 1]}
      onClick={(e) => { e.stopPropagation(); selectRug(rug.id); }}
    >
      {rug.shape === 'round' ? <circleGeometry args={[1, 48]} /> : <planeGeometry args={[rug.width, rug.depth]} />}
      <meshStandardMaterial
        map={tex}
        roughness={1}
        emissive={selected ? '#3b82f6' : '#000000'}
        emissiveIntensity={selected ? 0.2 : 0}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  );
}

function OpeningMesh({ o }: { o: WallOpening }) {
  const selectOpening = useStudioStore((s) => s.selectOpening);
  const selected = useStudioStore((s) => s.selectedOpeningId === o.id);
  const t = 0.18;
  const fw = 0.25;
  const cy = o.sill + o.height / 2;
  const isDoor = o.type === 'door' || o.type === 'double-door';
  const frameColor = selected ? '#93c5fd' : TRIM;
  const click = (e: any) => { e.stopPropagation(); selectOpening(o.id); };
  return (
    <group position={[o.offset, 0, 0]} onClick={click}>
      <mesh position={[0, o.sill + o.height + fw / 2, 0]} castShadow>
        <boxGeometry args={[o.width + fw * 2, fw, t]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (o.width / 2 + fw / 2), cy, 0]}>
          <boxGeometry args={[fw, o.height, t]} />
          <meshStandardMaterial color={frameColor} />
        </mesh>
      ))}
      {!isDoor && (
        <>
          <mesh position={[0, o.sill - fw / 4, 0.12]}>
            <boxGeometry args={[o.width + fw * 2.4, fw / 2, 0.35]} />
            <meshStandardMaterial color={frameColor} />
          </mesh>
          <mesh position={[0, cy, 0]}>
            <boxGeometry args={[0.08, o.height, 0.08]} />
            <meshStandardMaterial color={TRIM} />
          </mesh>
          <mesh position={[0, cy, 0]}>
            <boxGeometry args={[o.width, 0.08, 0.08]} />
            <meshStandardMaterial color={TRIM} />
          </mesh>
          <mesh position={[0, cy, 0]}>
            <planeGeometry args={[o.width, o.height]} />
            <meshPhysicalMaterial color="#cfe6f5" transparent opacity={0.25} roughness={0.05} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, cy, -1.5]}>
            <planeGeometry args={[o.width + 3, o.height + 3]} />
            <meshBasicMaterial color="#cde3ee" side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      {isDoor &&
        (o.type === 'double-door' ? [-1, 1] : [0]).map((side) => {
          const pw = o.type === 'double-door' ? o.width / 2 : o.width;
          return (
            <group key={side} position={[side * (pw / 2), 0, 0.02]}>
              <mesh position={[0, o.height / 2, 0]} castShadow>
                <boxGeometry args={[pw - 0.04, o.height - 0.02, 0.12]} />
                <meshStandardMaterial color={TRIM} roughness={0.6} />
              </mesh>
              {o.type === 'double-door' ? (
                <mesh position={[0, o.height / 2 + 0.3, 0.07]}>
                  <planeGeometry args={[pw - 0.6, o.height - 1.6]} />
                  <meshPhysicalMaterial color="#cfe6f5" transparent opacity={0.5} roughness={0.05} />
                </mesh>
              ) : (
                [o.height * 0.72, o.height * 0.28].map((y) => (
                  <mesh key={y} position={[0, y, 0.065]}>
                    <boxGeometry args={[pw - 0.8, o.height * 0.36, 0.02]} />
                    <meshStandardMaterial color="#ece9e2" />
                  </mesh>
                ))
              )}
              <mesh position={[side === -1 ? pw / 2 - 0.3 : -pw / 2 + 0.3 + (side === 0 ? pw - 0.6 : 0), 3.2, 0.12]}>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshStandardMaterial color="#b8a27a" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          );
        })}
    </group>
  );
}

interface WallProps {
  id: WallId;
  length: number;
  height: number;
  position: [number, number, number];
  rotationY: number;
  cutaway: boolean;
}

function Wall({ id, length, height, position, rotationY, cutaway }: WallProps) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    if (group.current) group.current.visible = !cutaway || !isWallCutAway(id, camera.position, useStudioStore.getState().room);
  });
  const color = useStudioStore((s) => s.wallColors[id]);
  const selected = useStudioStore((s) => s.selectedWall === id);
  const selectWall = useStudioStore((s) => s.selectWall);
  const allOpenings = useStudioStore((s) => s.openings);
  const openings = useMemo(() => allOpenings.filter((o) => o.wall === id), [allOpenings, id]);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-length / 2, 0);
    shape.lineTo(length / 2, 0);
    shape.lineTo(length / 2, height);
    shape.lineTo(-length / 2, height);
    shape.closePath();
    openings.forEach((o) => {
      const x0 = Math.max(-length / 2 + 0.05, o.offset - o.width / 2);
      const x1 = Math.min(length / 2 - 0.05, o.offset + o.width / 2);
      const y0 = Math.max(0.001, o.sill);
      const y1 = Math.min(height - 0.05, o.sill + o.height);
      const hole = new THREE.Path();
      hole.moveTo(x0, y0);
      hole.lineTo(x0, y1);
      hole.lineTo(x1, y1);
      hole.lineTo(x1, y0);
      hole.closePath();
      shape.holes.push(hole);
    });
    return new THREE.ShapeGeometry(shape);
  }, [length, height, openings]);

  return (
    <group ref={group} name={`wall-${id}`} position={position} rotation={[0, rotationY, 0]}>
      <mesh
        geometry={geometry}
        receiveShadow
        onClick={(e) => { e.stopPropagation(); selectWall(id); }}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.92}
          emissive={selected ? '#3b82f6' : '#000000'}
          emissiveIntensity={selected ? 0.18 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.25, 0.03]}>
        <boxGeometry args={[length, 0.5, 0.06]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      {openings.map((o) => (
        <OpeningMesh key={o.id} o={o} />
      ))}
    </group>
  );
}

/** Solid corner volume that turns the rectangle into an L-shaped room. */
function NotchBlock() {
  const room = useStudioStore((s) => s.room);
  const north = useStudioStore((s) => s.wallColors.north);
  const east = useStudioStore((s) => s.wallColors.east);
  const n = notchRect(room);
  if (!n) return null;
  const w = n.x1 - n.x0;
  const d = n.z1 - n.z0;
  const h = room.height;
  return (
    <group position={[n.x0 + w / 2, 0, n.z0 + d / 2]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.02, h, d + 0.02]} />
        {[east, east, '#d9d4cc', '#d9d4cc', north, north].map((c, i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color={c} roughness={0.92} />
        ))}
      </mesh>
      <mesh position={[-w / 2 - 0.03, 0.25, 0]}>
        <boxGeometry args={[0.06, 0.5, d]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      <mesh position={[0, 0.25, d / 2 + 0.03]}>
        <boxGeometry args={[w, 0.5, 0.06]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
    </group>
  );
}

/** Room shell: textured floor, ceiling, four walls with cut-out windows/doors, and rugs. */
export function Room({ cutaway = false }: { cutaway?: boolean }) {
  const room = useStudioStore((s) => s.room);
  const flooringId = useStudioStore((s) => s.flooringId);
  const rugs = useStudioStore((s) => s.rugs);

  const flooring = getFlooring(flooringId);
  const { width: w, depth: d, height: h } = room;
  const halfW = w / 2;
  const halfD = d / 2;

  const floorMat = useMemo(() => {
    const map = floorTexture(flooring, w, d);
    return new THREE.MeshStandardMaterial({
      color: map ? '#ffffff' : flooring.color,
      map,
      roughness: flooring.roughness,
      metalness: 0.05,
    });
  }, [flooring, w, d]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow material={floorMat}>
        <planeGeometry args={[w, d]} />
      </mesh>

      <mesh visible={!cutaway} rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#f4f4f5" side={THREE.DoubleSide} />
      </mesh>

      <Wall cutaway={cutaway} id="north" length={w} height={h} position={[0, 0, -halfD]} rotationY={0} />
      <Wall cutaway={cutaway} id="south" length={w} height={h} position={[0, 0, halfD]} rotationY={Math.PI} />
      <Wall cutaway={cutaway} id="west" length={d} height={h} position={[-halfW, 0, 0]} rotationY={Math.PI / 2} />
      <Wall cutaway={cutaway} id="east" length={d} height={h} position={[halfW, 0, 0]} rotationY={-Math.PI / 2} />

      <NotchBlock />

      {rugs.map((r) => (
        <RugMesh key={r.id} rug={r} />
      ))}
    </group>
  );
}
