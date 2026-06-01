import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SceneData } from '@/types/studio';
import { toast } from 'sonner';

export interface SavedScene {
  id: string;
  name: string;
  scene_data: SceneData;
  created_at: string;
  updated_at: string;
}

export function useSavedScenes() {
  const { user } = useAuth();
  const [scenes, setScenes] = useState<SavedScene[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchScenes = useCallback(async () => {
    if (!user) {
      setScenes([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_scenes')
      .select('*')
      .order('updated_at', { ascending: false });
    setLoading(false);
    if (error) {
      toast.error('Could not load saved scenes.');
      return;
    }
    setScenes((data ?? []) as unknown as SavedScene[]);
  }, [user]);

  useEffect(() => {
    fetchScenes();
  }, [fetchScenes]);

  const saveScene = useCallback(
    async (name: string, sceneData: SceneData): Promise<boolean> => {
      if (!user) {
        toast.error('Please sign in to save scenes.');
        return false;
      }
      const { error } = await supabase.from('saved_scenes').insert({
        user_id: user.id,
        name,
        scene_data: JSON.parse(JSON.stringify(sceneData)),
      });
      if (error) {
        toast.error('Failed to save scene.');
        return false;
      }
      toast.success('Scene saved.');
      await fetchScenes();
      return true;
    },
    [user, fetchScenes],
  );

  const renameScene = useCallback(
    async (id: string, name: string) => {
      const { error } = await supabase
        .from('saved_scenes')
        .update({ name })
        .eq('id', id);
      if (error) return toast.error('Failed to rename scene.');
      await fetchScenes();
    },
    [fetchScenes],
  );

  const deleteScene = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('saved_scenes').delete().eq('id', id);
      if (error) return toast.error('Failed to delete scene.');
      toast.success('Scene deleted.');
      await fetchScenes();
    },
    [fetchScenes],
  );

  return { scenes, loading, fetchScenes, saveScene, renameScene, deleteScene };
}
