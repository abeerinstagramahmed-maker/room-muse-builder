import { createContext, useContext } from 'react';
import { PlacedFurniture } from '@/types/studio';
import { Finish, getFinish } from '@/lib/finishes';

const FinishCtx = createContext<Finish | undefined>(undefined);

type Mat = { color: string; roughness: number; metalness?: number; role?: 'fabric' | 'wood' | 'metal' };
const WOOD: Mat = { color: '#8a5a3b', roughness: 0.55, role: 'wood' };
const LIGHT_WOOD: Mat = { color: '#c49a6c', roughness: 0.6, role: 'wood' };
const FABRIC: Mat = { color: '#9c9488', roughness: 0.95, role: 'fabric' };
const CUSHION: Mat = { color: '#b7ae9f', roughness: 1, role: 'fabric' };
const METAL: Mat = { color: '#2f2f33', roughness: 0.35, metalness: 0.85, role: 'metal' };
const BRASS: Mat = { color: '#b8945a', roughness: 0.3, metalness: 0.9, role: 'metal' };
const LINEN: Mat = { color: '#efe9df', roughness: 0.9, role: 'fabric' };

function Part({ p, s, m: base, r = 0 }: { p: [number, number, number]; s: [number, number, number]; m: Mat; r?: number }) {
  const f = useContext(FinishCtx);
  const m = f && base.role === f.group ? f : base;
  return (
    <mesh position={p} castShadow receiveShadow>
      {r ? <cylinderGeometry args={[s[0], s[2], s[1], 24]} /> : <boxGeometry args={s} />}
      <meshStandardMaterial color={m.color} roughness={m.roughness} metalness={m.metalness ?? 0} />
    </mesh>
  );
}

function Legs({ w, d, h, m, inset = 0.15, t = 0.12 }: { w: number; d: number; h: number; m: Mat; inset?: number; t?: number }) {
  return (
    <>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Part key={`${sx}${sz}`} p={[sx * (w / 2 - inset), h / 2, sz * (d / 2 - inset)]} s={[t, h, t]} m={m} />
      ))}
    </>
  );
}

/** Category-aware stand-in built from shaped parts with wood, fabric and metal finishes. */
export function ProceduralFurniture({ item }: { item: PlacedFurniture }) {
  return <FinishCtx.Provider value={getFinish(item.finish)}><Shape item={item} /></FinishCtx.Provider>;
}

function Shape({ item }: { item: PlacedFurniture }) {
  const [w, h, d] = item.size;
  const c = (item.category ?? '').toLowerCase();

  if (item.mountType === 'wall') {
    const mirror = c.includes('mirror');
    const shelf = c.includes('shelf');
    if (shelf) return <Part p={[0, 0, 0]} s={[w, Math.min(h, 0.12), Math.max(d, 0.7)]} m={LIGHT_WOOD} />;
    return (
      <group>
        <Part p={[0, 0, 0]} s={[w, h, 0.08]} m={mirror ? BRASS : METAL} />
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[w - 0.2, h - 0.2]} />
          <meshStandardMaterial color={mirror ? '#dfe7ea' : '#d8c3a5'} roughness={mirror ? 0.02 : 0.8} metalness={mirror ? 1 : 0} />
        </mesh>
      </group>
    );
  }

  if (c.includes('sofa')) {
    const seat = h * 0.45;
    return (
      <group>
        <Part p={[0, 0.12, 0]} s={[w, 0.24, d]} m={WOOD} />
        <Part p={[0, seat / 2 + 0.12, 0.05]} s={[w - 0.6, seat - 0.12, d - 0.4]} m={CUSHION} />
        <Part p={[0, h * 0.6, -d / 2 + 0.25]} s={[w, h * 0.8, 0.5]} m={FABRIC} />
        {[-1, 1].map((sx) => <Part key={sx} p={[sx * (w / 2 - 0.25), h * 0.36, 0]} s={[0.5, h * 0.48, d]} m={FABRIC} />)}
      </group>
    );
  }
  if (c.includes('bed')) {
    return (
      <group>
        <Part p={[0, 0.5, 0]} s={[w, 0.6, d]} m={WOOD} />
        <Part p={[0, 1.05, 0.1]} s={[w - 0.2, 0.5, d - 0.4]} m={LINEN} />
        <Part p={[0, 1.36, 0.5]} s={[w - 0.15, 0.12, d * 0.6]} m={FABRIC} />
        {[-1, 1].map((sx) => <Part key={sx} p={[sx * w / 4, 1.42, -d / 2 + 0.8]} s={[w / 2 - 0.4, 0.3, 0.9]} m={CUSHION} />)}
        <Part p={[0, h / 2, -d / 2 + 0.1]} s={[w, h, 0.2]} m={WOOD} />
      </group>
    );
  }
  if (c.includes('chair')) {
    const seat = Math.min(1.5, h * 0.5);
    return (
      <group>
        <Legs w={w} d={d} h={seat - 0.15} m={WOOD} t={0.1} />
        <Part p={[0, seat - 0.07, 0]} s={[w, 0.2, d]} m={CUSHION} />
        <Part p={[0, (seat + h) / 2, -d / 2 + 0.08]} s={[w, h - seat, 0.16]} m={FABRIC} />
      </group>
    );
  }
  if (c.includes('table')) {
    const top = 0.12;
    return (
      <group>
        <Part p={[0, h - top / 2, 0]} s={[w, top, d]} m={LIGHT_WOOD} />
        <Legs w={w} d={d} h={h - top} m={c.includes('coffee') ? METAL : WOOD} t={0.14} />
      </group>
    );
  }
  if (c.includes('lamp') || c.includes('lighting')) {
    const r = Math.min(w, d) / 2;
    return (
      <group>
        <Part p={[0, 0.05, 0]} s={[r * 0.6, 0.1, r * 0.6]} m={METAL} r={1} />
        <Part p={[0, h * 0.42, 0]} s={[0.04, h * 0.8, 0.04]} m={BRASS} r={1} />
        <mesh position={[0, h * 0.88, 0]} castShadow>
          <cylinderGeometry args={[r * 0.55, r, h * 0.24, 32, 1, true]} />
          <meshStandardMaterial color="#f3ead8" roughness={0.9} emissive="#ffd9a0" emissiveIntensity={0.35} side={2} />
        </mesh>
      </group>
    );
  }
  if (c.includes('plant')) {
    const r = Math.min(w, d) / 2;
    return (
      <group>
        <Part p={[0, h * 0.15, 0]} s={[r * 0.7, h * 0.3, r * 0.55]} m={{ color: '#c9b8a3', roughness: 0.8 }} r={1} />
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.sin(i * 2.1) * r * 0.25, h * (0.55 + i * 0.12), Math.cos(i * 2.1) * r * 0.25]} castShadow>
            <icosahedronGeometry args={[r * (0.8 - i * 0.15), 1]} />
            <meshStandardMaterial color={['#4f6f45', '#5d7f50', '#6b8f5a'][i]} roughness={0.85} flatShading />
          </mesh>
        ))}
      </group>
    );
  }
  if (c.includes('storage')) {
    return (
      <group>
        <Part p={[0, h / 2 + 0.1, 0]} s={[w, h - 0.2, d]} m={LIGHT_WOOD} />
        {[1, 2].map((i) => <Part key={i} p={[0, (h / 3) * i, d / 2 + 0.01]} s={[w - 0.1, 0.03, 0.02]} m={WOOD} />)}
        <Legs w={w} d={d} h={0.2} m={METAL} inset={0.2} t={0.08} />
      </group>
    );
  }
  return <Part p={[0, h / 2, 0]} s={[w, h, d]} m={{ color: '#b9a48a', roughness: 0.7 }} />;
}
