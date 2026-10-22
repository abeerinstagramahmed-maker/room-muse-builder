import { useState } from 'react';
import { Home, Ruler, Smartphone, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStudioStore } from '@/stores/studioStore';
import { ROOM_TEMPLATES } from '@/lib/roomTemplates';
import { OPENING_PRESETS } from '@/lib/studioConstants';
import { RoomDimensions, WallOpening } from '@/types/studio';
import { floorArea } from '@/lib/roomLayout';

type O = Omit<WallOpening, 'id'>;
const win = (wall: WallOpening['wall'], offset = 0, wide = false): O => {
  const p = OPENING_PRESETS[wide ? 'wide-window' : 'window'];
  return { type: wide ? 'wide-window' : 'window', wall, offset, width: p.width, height: p.height, sill: p.sill };
};
const door = (wall: WallOpening['wall'], offset = 0, double = false): O => {
  const p = OPENING_PRESETS[double ? 'double-door' : 'door'];
  return { type: double ? 'double-door' : 'door', wall, offset, width: p.width, height: p.height, sill: 0 };
};

export const TEMPLATE_OPENINGS: Record<string, O[]> = {
  'living-room': [win('north', 0, true), door('east', 6), win('west', -3)],
  bedroom: [win('north', 0), door('south', 4)],
  'home-office': [win('north', 0), door('east', 3.5)],
  'dining-room': [door('north', 0, true), door('south', -4), win('west', 0)],
  'studio-apartment': [win('north', -5, true), win('north', 5, true), door('south', 7)],
  'kids-room': [win('north', 0), door('east', 3.5)],
};

const L_ROOMS: { label: string; room: RoomDimensions }[] = [
  { label: 'L-shaped Living', room: { width: 18, depth: 20, height: 9, notch: { width: 7, depth: 8 } } },
  { label: 'L-shaped Studio', room: { width: 16, depth: 16, height: 9, notch: { width: 6, depth: 6 } } },
];

export function StartHub({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const startRoom = useStudioStore((s) => s.startRoom);
  const [view, setView] = useState<'start' | 'choose' | 'scan'>('start');

  const close = () => { onOpenChange(false); setView('start'); };

  const build = () => {
    startRoom({
      room: { width: 10, depth: 10, height: 8 },
      wallColor: '#e8e4dd',
      flooringId: 'oak',
      openings: [win('north', 0), door('east', 2.5)],
    });
    close();
  };

  const cards = [
    { tag: 'Quick start', icon: Home, title: 'Choose a room to test furnishing ideas now', cta: 'Choose a room', onClick: () => setView('choose') },
    { tag: 'Customizable', icon: Ruler, title: 'Build a room to plan your layout', cta: 'Build a room', onClick: build },
    { tag: 'Most personalized', icon: Smartphone, title: 'Visualize products together in your home', cta: 'Scan your room', onClick: () => setView('scan') },
  ];

  const scanUrl = `${window.location.origin}/design-my-room`;

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : close())}>
      <DialogContent className="max-h-[90dvh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {view === 'start' ? 'Ways to start' : view === 'choose' ? 'Choose a room' : 'Scan your room'}
          </DialogTitle>
          <DialogDescription>
            {view === 'start' && 'Pick a ready room, build your own, or scan your space on your phone.'}
            {view === 'choose' && 'Each room comes with windows and doors. Furnish it from the catalog.'}
            {view === 'scan' && 'Room scanning works best on a phone camera. Scan this code to continue on mobile.'}
          </DialogDescription>
        </DialogHeader>

        {view !== 'start' && (
          <Button variant="ghost" size="sm" className="w-fit gap-1.5" onClick={() => setView('start')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        )}

        {view === 'start' && (
          <div className="grid gap-4 md:grid-cols-3">
            {cards.map((c) => (
              <div key={c.cta} className="flex flex-col overflow-hidden rounded-xl border bg-card">
                <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-muted to-secondary">
                  <span className="absolute left-3 top-3 rounded-md border bg-background px-2 py-0.5 text-xs">{c.tag}</span>
                  <c.icon className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <p className="font-semibold leading-snug">{c.title}</p>
                  <Button variant="outline" className="mt-auto w-fit rounded-full" onClick={c.onClick}>{c.cta}</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'choose' && (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {L_ROOMS.map((l) => (
              <Button
                variant="ghost"
                key={l.label}
                onClick={() => { startRoom({ room: l.room, wallColor: '#e8e4dd', flooringId: 'oak', openings: [win('north', -4), win('west', 2), door('south', 3)] }); close(); }}
                className="relative flex h-auto flex-col items-stretch gap-0 overflow-hidden rounded-lg bg-card p-0 text-left whitespace-normal shadow-card hover:bg-accent"
              >
                <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-muted">
                  <svg viewBox="0 0 100 100" className="h-3/4 w-3/4" aria-hidden>
                    <path d="M10 10 H55 V45 H90 V90 H10 Z" className="fill-secondary stroke-foreground" strokeWidth="3" />
                  </svg>
                  <span className="absolute right-2 top-2 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-card">{floorArea(l.room)} sq.ft</span>
                </div>
                <div className="space-y-1 p-3">
                  <p className="text-sm font-semibold">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.room.width}′ × {l.room.depth}′ · L-shaped</p>
                </div>
              </Button>
            ))}
            {ROOM_TEMPLATES.map((t) => (
              <Button
                variant="ghost"
                key={t.id}
                onClick={() => {
                  startRoom({ room: t.room, wallColor: t.wallColor, flooringId: t.flooringId, openings: TEMPLATE_OPENINGS[t.id] ?? [win('north')] });
                  close();
                }}
                className="group relative flex h-auto flex-col items-stretch gap-0 overflow-hidden rounded-lg bg-card p-0 text-left whitespace-normal shadow-card hover:bg-accent"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img src={`/room-templates/${t.id}.jpg`} alt={`${t.label} empty 3D room with windows and doors`} className="h-full w-full object-cover" />
                  <span className="absolute right-2 top-2 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-card">{floorArea(t.room)} sq.ft</span>
                </div>
                <div className="space-y-1 p-3">
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.room.width}′ × {t.room.depth}′ × {t.room.height}′</p>
                </div>
              </Button>
            ))}
          </div>
        )}

        {view === 'scan' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(scanUrl)}`}
              alt="QR code to open room scanning on your phone"
              className="h-48 w-48 rounded-lg border bg-background p-2"
            />
            <p className="text-sm text-muted-foreground">{scanUrl}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
