import { create } from 'zustand';
import {
  PlacedFurniture,
  Rug,
  WallOpening,
  RoomDimensions,
  SceneData,
  WallColors,
  WallId,
} from '@/types/studio';
import {
  DEFAULT_FLOORING_ID,
  DEFAULT_LIGHTING_ID,
  DEFAULT_ROOM,
  DEFAULT_WALL_COLORS,
} from '@/lib/studioConstants';
import { RoomTemplate, makeWallColors } from '@/lib/roomTemplates';

export type TransformMode = 'translate' | 'rotate';

export interface Measurement {
  id: string;
  a: [number, number, number];
  b: [number, number, number];
}

/** Axis-aligned footprint overlap test between two floor items. */
function footprintsOverlap(a: PlacedFurniture, b: PlacedFurniture): boolean {
  const halfA = [(a.size[0] * a.scale) / 2, (a.size[2] * a.scale) / 2];
  const halfB = [(b.size[0] * b.scale) / 2, (b.size[2] * b.scale) / 2];
  const dx = Math.abs(a.position[0] - b.position[0]);
  const dz = Math.abs(a.position[2] - b.position[2]);
  // Small tolerance so touching edges do not count as a collision.
  const tol = 0.02;
  return dx < halfA[0] + halfB[0] - tol && dz < halfA[1] + halfB[1] - tol;
}

/** Returns instanceIds of floor items whose footprints overlap another item. */
function computeCollisions(furniture: PlacedFurniture[]): string[] {
  const floor = furniture.filter((f) => f.mountType !== 'wall');
  const hits = new Set<string>();
  for (let i = 0; i < floor.length; i++) {
    for (let j = i + 1; j < floor.length; j++) {
      if (footprintsOverlap(floor[i], floor[j])) {
        hits.add(floor[i].instanceId);
        hits.add(floor[j].instanceId);
      }
    }
  }
  return Array.from(hits);
}

let instanceCounter = 0;
function newInstanceId(): string {
  instanceCounter += 1;
  return `inst_${Date.now()}_${instanceCounter}`;
}

interface SceneSnapshot {
  room: RoomDimensions;
  wallColors: WallColors;
  flooringId: string;
  furniture: PlacedFurniture[];
  backgroundImageUrl: string | null;
  openings: WallOpening[];
  rugs: Rug[];
}

const HISTORY_LIMIT = 50;

interface StudioState {
  room: RoomDimensions;
  wallColors: WallColors;
  flooringId: string;
  gridVisible: boolean;
  snapEnabled: boolean;
  /** Grid increment (in feet) used when snapping is enabled. */
  snapSize: number;
  measureMode: boolean;
  measurements: Measurement[];
  furniture: PlacedFurniture[];
  openings: WallOpening[];
  rugs: Rug[];
  selectedOpeningId: string | null;
  selectedRugId: string | null;
  selectedId: string | null;
  selectedWall: WallId | null;
  transformMode: TransformMode;
  /** Whether collision highlighting is active. */
  collisionEnabled: boolean;
  /** instanceIds of floor items currently overlapping another item. */
  collidingIds: string[];
  /** Active lighting preset id (time of day / mood). */
  lightingId: string;
  /** Master brightness multiplier applied on top of the preset. */
  brightness: number;
  /** Optional photo (e.g. AI-cleaned room) shown as scene backdrop. */
  backgroundImageUrl: string | null;
  /** Increment to request a camera reset from the editor. */
  cameraResetToken: number;
  /** Resolver supplied by the canvas for screenshot capture. */
  captureScreenshot: (() => void) | null;

  /** Undo/redo history stacks. */
  past: SceneSnapshot[];
  future: SceneSnapshot[];

  setRoom: (patch: Partial<RoomDimensions>) => void;
  setWallColor: (wall: WallId, color: string) => void;
  setFlooring: (id: string) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  setSnapSize: (value: number) => void;
  toggleMeasureMode: () => void;
  addMeasurement: (a: [number, number, number], b: [number, number, number]) => void;
  clearMeasurements: () => void;
  setTransformMode: (mode: TransformMode) => void;
  setBackgroundImage: (url: string | null) => void;

  toggleCollision: () => void;
  setLighting: (id: string) => void;
  setBrightness: (value: number) => void;

  addFurniture: (item: Omit<PlacedFurniture, 'instanceId'>) => void;
  updateFurniture: (instanceId: string, patch: Partial<PlacedFurniture>) => void;
  duplicateFurniture: (instanceId: string) => void;
  deleteFurniture: (instanceId: string) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  select: (instanceId: string | null) => void;
  selectWall: (wall: WallId | null) => void;

  /** Capture current state into the undo stack before a continuous edit. */
  beginHistory: () => void;
  undo: () => void;
  redo: () => void;

  requestCameraReset: () => void;
  registerCapture: (fn: (() => void) | null) => void;

  addOpening: (o: Omit<WallOpening, 'id'>) => void;
  updateOpening: (id: string, patch: Partial<WallOpening>) => void;
  removeOpening: (id: string) => void;
  selectOpening: (id: string | null) => void;
  addRug: (r: Omit<Rug, 'id'>) => void;
  updateRug: (id: string, patch: Partial<Rug>) => void;
  removeRug: (id: string) => void;
  selectRug: (id: string | null) => void;
  startRoom: (input: { room: RoomDimensions; wallColor: string; flooringId: string; openings?: Omit<WallOpening, 'id'>[]; rugs?: Omit<Rug, 'id'>[] }) => void;
  newRoom: () => void;
  applyTemplate: (template: RoomTemplate) => void;
  loadScene: (data: SceneData) => void;
  applyRoomAnalysis: (input: {
    room?: Partial<RoomDimensions>;
    wallColor?: string;
    backgroundImageUrl?: string | null;
    furniture?: Omit<PlacedFurniture, 'instanceId'>[];
  }) => void;
  serialize: () => SceneData;
}

export const useStudioStore = create<StudioState>((set, get) => {
  const snapshot = (): SceneSnapshot => {
    const s = get();
    return {
      room: s.room,
      wallColors: s.wallColors,
      flooringId: s.flooringId,
      furniture: s.furniture,
      backgroundImageUrl: s.backgroundImageUrl,
      openings: s.openings,
      rugs: s.rugs,
    };
  };

  /** Push the current state to history, clearing the redo stack. */
  const record = () =>
    set((s) => ({
      past: [...s.past, snapshot()].slice(-HISTORY_LIMIT),
      future: [],
    }));

  return {
    room: { ...DEFAULT_ROOM },
    wallColors: { ...DEFAULT_WALL_COLORS },
    flooringId: DEFAULT_FLOORING_ID,
    gridVisible: true,
    snapEnabled: true,
    snapSize: 0.25,
    measureMode: false,
    measurements: [],
    furniture: [],
    openings: [],
    rugs: [],
    selectedOpeningId: null,
    selectedRugId: null,
    selectedId: null,
    selectedWall: null,
    transformMode: 'translate',
    collisionEnabled: true,
    collidingIds: [],
    lightingId: DEFAULT_LIGHTING_ID,
    brightness: 1,
    backgroundImageUrl: null,
    cameraResetToken: 0,
    captureScreenshot: null,
    past: [],
    future: [],

    setRoom: (patch) => set((s) => ({ room: { ...s.room, ...patch } })),
    setWallColor: (wall, color) =>
      set((s) => ({ wallColors: { ...s.wallColors, [wall]: color } })),
    setFlooring: (id) => {
      record();
      set({ flooringId: id });
    },
    toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
    toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
    setSnapSize: (snapSize) => set({ snapSize }),
    toggleMeasureMode: () =>
      set((s) => ({ measureMode: !s.measureMode, selectedId: null, selectedWall: null })),
    addMeasurement: (a, b) =>
      set((s) => ({
        measurements: [...s.measurements, { id: newInstanceId(), a, b }],
      })),
    clearMeasurements: () => set({ measurements: [] }),
    setTransformMode: (transformMode) => set({ transformMode }),
    setBackgroundImage: (backgroundImageUrl) => set({ backgroundImageUrl }),
    toggleCollision: () =>
      set((s) => {
        const collisionEnabled = !s.collisionEnabled;
        return {
          collisionEnabled,
          collidingIds: collisionEnabled ? computeCollisions(s.furniture) : [],
        };
      }),
    setLighting: (lightingId) => set({ lightingId }),
    setBrightness: (brightness) => set({ brightness }),

    addFurniture: (item) => {
      record();
      const instanceId = newInstanceId();
      set((s) => {
        const furniture = [...s.furniture, { ...item, instanceId }];
        return {
          furniture,
          selectedId: instanceId,
          collidingIds: s.collisionEnabled ? computeCollisions(furniture) : [],
        };
      });
    },

    updateFurniture: (instanceId, patch) =>
      set((s) => {
        const furniture = s.furniture.map((f) =>
          f.instanceId === instanceId ? { ...f, ...patch } : f,
        );
        return {
          furniture,
          collidingIds: s.collisionEnabled ? computeCollisions(furniture) : [],
        };
      }),

    duplicateFurniture: (instanceId) => {
      const original = get().furniture.find((f) => f.instanceId === instanceId);
      if (!original) return;
      record();
      const id = newInstanceId();
      set((s) => ({
        furniture: [
          ...s.furniture,
          {
            ...original,
            instanceId: id,
            position: [
              original.position[0] + 1,
              original.position[1],
              original.position[2] + 1,
            ],
          },
        ],
        selectedId: id,
      }));
    },

    deleteFurniture: (instanceId) => {
      record();
      set((s) => {
        const furniture = s.furniture.filter((f) => f.instanceId !== instanceId);
        return {
          furniture,
          selectedId: s.selectedId === instanceId ? null : s.selectedId,
          collidingIds: s.collisionEnabled ? computeCollisions(furniture) : [],
        };
      });
    },

    deleteSelected: () => {
      const id = get().selectedId;
      if (id) get().deleteFurniture(id);
    },

    duplicateSelected: () => {
      const id = get().selectedId;
      if (id) get().duplicateFurniture(id);
    },

    select: (selectedId) => set({ selectedId, selectedWall: null, selectedRugId: null, selectedOpeningId: null }),
    selectWall: (selectedWall) => set({ selectedWall, selectedId: null, selectedRugId: null }),

    addOpening: (o) => {
      record();
      const id = newInstanceId();
      set((s) => ({ openings: [...s.openings, { ...o, id }], selectedOpeningId: id, selectedWall: o.wall, selectedId: null }));
    },
    updateOpening: (id, patch) =>
      set((s) => ({ openings: s.openings.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
    removeOpening: (id) => {
      record();
      set((s) => ({ openings: s.openings.filter((o) => o.id !== id), selectedOpeningId: null }));
    },
    selectOpening: (id) => {
      const o = get().openings.find((x) => x.id === id);
      set({ selectedOpeningId: id, selectedWall: o ? o.wall : get().selectedWall, selectedId: null, selectedRugId: null });
    },
    addRug: (r) => {
      record();
      const id = newInstanceId();
      set((s) => ({ rugs: [...s.rugs, { ...r, id }], selectedRugId: id, selectedId: null, selectedWall: null }));
    },
    updateRug: (id, patch) =>
      set((s) => ({ rugs: s.rugs.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
    removeRug: (id) => {
      record();
      set((s) => ({ rugs: s.rugs.filter((r) => r.id !== id), selectedRugId: null }));
    },
    selectRug: (selectedRugId) => set({ selectedRugId, selectedId: null, selectedWall: null }),
    startRoom: ({ room, wallColor, flooringId, openings = [], rugs = [] }) => {
      record();
      set({
        room: { ...room },
        wallColors: makeWallColors(wallColor),
        flooringId,
        furniture: [],
        openings: openings.map((o) => ({ ...o, id: newInstanceId() })),
        rugs: rugs.map((r) => ({ ...r, id: newInstanceId() })),
        selectedId: null,
        selectedWall: null,
        selectedRugId: null,
        selectedOpeningId: null,
        collidingIds: [],
        backgroundImageUrl: null,
        cameraResetToken: get().cameraResetToken + 1,
      });
    },

    beginHistory: () => record(),

    undo: () =>
      set((s) => {
        if (s.past.length === 0) return {};
        const previous = s.past[s.past.length - 1];
        return {
          past: s.past.slice(0, -1),
          future: [snapshot(), ...s.future].slice(0, HISTORY_LIMIT),
          room: previous.room,
          wallColors: previous.wallColors,
          flooringId: previous.flooringId,
          furniture: previous.furniture,
          backgroundImageUrl: previous.backgroundImageUrl,
          openings: previous.openings,
          rugs: previous.rugs,
          selectedId: null,
        };
      }),

    redo: () =>
      set((s) => {
        if (s.future.length === 0) return {};
        const next = s.future[0];
        return {
          future: s.future.slice(1),
          past: [...s.past, snapshot()].slice(-HISTORY_LIMIT),
          room: next.room,
          wallColors: next.wallColors,
          flooringId: next.flooringId,
          furniture: next.furniture,
          backgroundImageUrl: next.backgroundImageUrl,
          openings: next.openings,
          rugs: next.rugs,
          selectedId: null,
        };
      }),

    requestCameraReset: () =>
      set((s) => ({ cameraResetToken: s.cameraResetToken + 1 })),
    registerCapture: (fn) => set({ captureScreenshot: fn }),

    newRoom: () => {
      record();
      set({
        room: { ...DEFAULT_ROOM },
        wallColors: { ...DEFAULT_WALL_COLORS },
        flooringId: DEFAULT_FLOORING_ID,
        furniture: [],
        openings: [],
        rugs: [],
        selectedId: null,
        backgroundImageUrl: null,
      });
    },

    applyTemplate: (template) => {
      record();
      set({
        room: { ...template.room },
        wallColors: makeWallColors(template.wallColor),
        flooringId: template.flooringId,
        furniture: [],
        openings: [],
        rugs: [],
        selectedId: null,
        backgroundImageUrl: null,
        cameraResetToken: get().cameraResetToken + 1,
      });
    },

    applyRoomAnalysis: ({ room, wallColor, backgroundImageUrl, furniture }) => {
      record();
      set((s) => ({
        room: { ...s.room, ...(room ?? {}) },
        wallColors: wallColor ? makeWallColors(wallColor) : s.wallColors,
        backgroundImageUrl:
          backgroundImageUrl !== undefined ? backgroundImageUrl : s.backgroundImageUrl,
        furniture: (furniture ?? []).map((f) => ({
          ...f,
          instanceId: newInstanceId(),
        })),
        selectedId: null,
      }));
    },

    loadScene: (data) => {
      record();
      set({
        room: { ...DEFAULT_ROOM, ...data.room },
        wallColors: { ...DEFAULT_WALL_COLORS, ...data.wallColors },
        flooringId: data.flooringId ?? DEFAULT_FLOORING_ID,
        furniture: (data.furniture ?? []).map((f) => ({
          ...f,
          instanceId: f.instanceId ?? newInstanceId(),
        })),
        openings: data.openings ?? [],
        rugs: data.rugs ?? [],
        lightingId: data.lightingId ?? DEFAULT_LIGHTING_ID,
        brightness: data.brightness ?? 1,
        selectedId: null,
        cameraResetToken: get().cameraResetToken + 1,
      });
    },

    serialize: () => {
      const s = get();
      return {
        version: 1,
        room: s.room,
        wallColors: s.wallColors,
        flooringId: s.flooringId,
        furniture: s.furniture,
        lightingId: s.lightingId,
        brightness: s.brightness,
        openings: s.openings,
        rugs: s.rugs,
      };
    },
  };
});
