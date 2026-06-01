import { create } from 'zustand';
import {
  PlacedFurniture,
  RoomDimensions,
  SceneData,
  WallColors,
  WallId,
} from '@/types/studio';
import {
  DEFAULT_FLOORING_ID,
  DEFAULT_ROOM,
  DEFAULT_WALL_COLORS,
} from '@/lib/studioConstants';

export type TransformMode = 'translate' | 'rotate';

let instanceCounter = 0;
function newInstanceId(): string {
  instanceCounter += 1;
  return `inst_${Date.now()}_${instanceCounter}`;
}

interface StudioState {
  room: RoomDimensions;
  wallColors: WallColors;
  flooringId: string;
  gridVisible: boolean;
  furniture: PlacedFurniture[];
  selectedId: string | null;
  selectedWall: WallId | null;
  transformMode: TransformMode;
  /** Increment to request a camera reset from the editor. */
  cameraResetToken: number;
  /** Resolver supplied by the canvas for screenshot capture. */
  captureScreenshot: (() => void) | null;

  setRoom: (patch: Partial<RoomDimensions>) => void;
  setWallColor: (wall: WallId, color: string) => void;
  setFlooring: (id: string) => void;
  toggleGrid: () => void;
  setTransformMode: (mode: TransformMode) => void;

  addFurniture: (item: Omit<PlacedFurniture, 'instanceId'>) => void;
  updateFurniture: (instanceId: string, patch: Partial<PlacedFurniture>) => void;
  duplicateFurniture: (instanceId: string) => void;
  deleteFurniture: (instanceId: string) => void;
  select: (instanceId: string | null) => void;
  selectWall: (wall: WallId | null) => void;

  requestCameraReset: () => void;
  registerCapture: (fn: (() => void) | null) => void;

  newRoom: () => void;
  loadScene: (data: SceneData) => void;
  serialize: () => SceneData;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  room: { ...DEFAULT_ROOM },
  wallColors: { ...DEFAULT_WALL_COLORS },
  flooringId: DEFAULT_FLOORING_ID,
  gridVisible: true,
  furniture: [],
  selectedId: null,
  selectedWall: null,
  transformMode: 'translate',
  cameraResetToken: 0,
  captureScreenshot: null,

  setRoom: (patch) => set((s) => ({ room: { ...s.room, ...patch } })),
  setWallColor: (wall, color) =>
    set((s) => ({ wallColors: { ...s.wallColors, [wall]: color } })),
  setFlooring: (id) => set({ flooringId: id }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  setTransformMode: (transformMode) => set({ transformMode }),

  addFurniture: (item) => {
    const instanceId = newInstanceId();
    set((s) => ({
      furniture: [...s.furniture, { ...item, instanceId }],
      selectedId: instanceId,
    }));
  },

  updateFurniture: (instanceId, patch) =>
    set((s) => ({
      furniture: s.furniture.map((f) =>
        f.instanceId === instanceId ? { ...f, ...patch } : f,
      ),
    })),

  duplicateFurniture: (instanceId) => {
    const original = get().furniture.find((f) => f.instanceId === instanceId);
    if (!original) return;
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

  deleteFurniture: (instanceId) =>
    set((s) => ({
      furniture: s.furniture.filter((f) => f.instanceId !== instanceId),
      selectedId: s.selectedId === instanceId ? null : s.selectedId,
    })),

  select: (selectedId) => set({ selectedId, selectedWall: null }),
  selectWall: (selectedWall) => set({ selectedWall, selectedId: null }),

  requestCameraReset: () =>
    set((s) => ({ cameraResetToken: s.cameraResetToken + 1 })),
  registerCapture: (fn) => set({ captureScreenshot: fn }),

  newRoom: () =>
    set({
      room: { ...DEFAULT_ROOM },
      wallColors: { ...DEFAULT_WALL_COLORS },
      flooringId: DEFAULT_FLOORING_ID,
      furniture: [],
      selectedId: null,
    }),

  loadScene: (data) =>
    set({
      room: { ...DEFAULT_ROOM, ...data.room },
      wallColors: { ...DEFAULT_WALL_COLORS, ...data.wallColors },
      flooringId: data.flooringId ?? DEFAULT_FLOORING_ID,
      furniture: (data.furniture ?? []).map((f) => ({
        ...f,
        instanceId: f.instanceId ?? newInstanceId(),
      })),
      selectedId: null,
    }),

  serialize: () => {
    const s = get();
    return {
      version: 1,
      room: s.room,
      wallColors: s.wallColors,
      flooringId: s.flooringId,
      furniture: s.furniture,
    };
  },
}));
