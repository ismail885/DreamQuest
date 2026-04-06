import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface SaveParams {
  userId: number | null;
  adventureId: number | null;
  characterId: number | null;
  branchId: number | null;
  progression: number;
  /** Active ou désactive la sauvegarde automatique (défaut: true) */
  enabled?: boolean;
  /** Intervalle en ms entre deux sauvegardes automatiques (défaut: 30 000) */
  intervalMs?: number;
}

interface SaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  saveId: number | null;
}

/**
 * Hook de sauvegarde automatique.
 * Sauvegarde la progression d'une aventure toutes les `intervalMs` ms.
 * Expose aussi une fonction `save()` pour déclencher une sauvegarde manuelle.
 */
export function useSave({
  userId,
  adventureId,
  characterId,
  branchId,
  progression,
  enabled = true,
  intervalMs = 30_000,
}: SaveParams) {
  const [state, setState] = useState<SaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
    saveId: null,
  });

  // Garde les dernières valeurs en ref pour que `save` n'ait pas de dépendances instables
  const paramsRef = useRef({ userId, adventureId, characterId, branchId, progression });
  paramsRef.current = { userId, adventureId, characterId, branchId, progression };

  const save = useCallback(async (): Promise<boolean> => {
    const { userId, adventureId, characterId, branchId, progression } = paramsRef.current;

    console.log('Tentative de sauvegarde:', { userId, adventureId, characterId, branchId, progression });

    if (!userId || !adventureId || !characterId) {
      console.log('Sauvegarde annulée: paramètres manquants');
      return false;
    }

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('sauvegarde')
        .upsert(
          {
            id_utilisateur: userId,
            id_aventure: adventureId,
            id_personnage: characterId,
            id_embranchement_actuel: branchId,
            progression,
            date_sauvegarde: new Date().toISOString(),
          },
          { onConflict: 'id_utilisateur,id_aventure,id_personnage' }
        )
        .select('id')
        .single();

      if (error) {
        console.error('Erreur sauvegarde:', error);
        throw error;
      }

      setState({
        isSaving: false,
        lastSaved: new Date(),
        error: null,
        saveId: data?.id ?? null,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setState(prev => ({ ...prev, isSaving: false, error: message }));
      return false;
    }
  }, []);

  // Sauvegarde automatique à intervalle régulier
  useEffect(() => {
    if (!enabled || !userId || !adventureId || !characterId) return;

    const interval = setInterval(() => {
      save();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, userId, adventureId, characterId, intervalMs, save]);

  return { ...state, save };
}

