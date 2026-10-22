import { StudioProduct } from '@/hooks/useStudioProducts';

let dragged: StudioProduct | null = null;

export const setDraggedProduct = (p: StudioProduct | null) => { dragged = p; };
export const getDraggedProduct = () => dragged;
