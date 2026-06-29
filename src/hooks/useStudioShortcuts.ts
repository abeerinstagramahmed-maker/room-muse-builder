import { useEffect } from 'react';
import { useStudioStore } from '@/stores/studioStore';

/**
 * Global keyboard shortcuts for the 3D studio. Ignores key presses while the
 * user is typing in an input, textarea or contentEditable element.
 */
export function useStudioShortcuts() {
  const deleteSelected = useStudioStore((s) => s.deleteSelected);
  const duplicateSelected = useStudioStore((s) => s.duplicateSelected);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const select = useStudioStore((s) => s.select);
  const selectWall = useStudioStore((s) => s.selectWall);
  const toggleGrid = useStudioStore((s) => s.toggleGrid);
  const setTransformMode = useStudioStore((s) => s.setTransformMode);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          deleteSelected();
          break;
        case 'Escape':
          select(null);
          selectWall(null);
          break;
        case 'g':
        case 'G':
          toggleGrid();
          break;
        case 'm':
        case 'M':
          setTransformMode('translate');
          break;
        case 'r':
        case 'R':
          setTransformMode('rotate');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    deleteSelected,
    duplicateSelected,
    undo,
    redo,
    select,
    selectWall,
    toggleGrid,
    setTransformMode,
  ]);
}
