import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface SaveParams {
  userId: number | null;
  adventureId: number | null;
  characterId: number | null;
  branchId: number | null;
  progression: number;
  enabled?: boolean;
  intervalMs?: number;
}

interface SaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  saveId: number | null;
}

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

  const paramsRef = useRef({ userId, adventureId, characterId, branchId, progression });
  paramsRef.current = { userId, adventureId, characterId, branchId, progression };

  const save = useCallback(async (): Promise<boolean> => {
    const { userId, adventureId, characterId, branchId, progression } = paramsRef.current;

    console.log('[Save] Tentative:', { userId, adventureId, characterId, branchId, progression });

    if (!userId) {
      console.log('[Save] ERREUR: userId manquant');
      return false;
    }
    if (!adventureId) {
      console.log('[Save] ERREUR: adventureId manquant');
      return false;
    }
    if (!characterId) {
      console.log('[Save] ERREUR: characterId manquant');
      return false;
    }

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      console.log('[Save] Trying to save with:', {
        id_utilisateur: userId,
        id_aventure: adventureId,
        id_personnage: characterId,
        id_embranchement_actuel: branchId,
        progression: progression,
        date_sauvegarde: new Date().toISOString(),
      });

      const { data, error } = await supabase
        .from('sauvegarde')
        .insert({
          id_utilisateur: userId,
          id_aventure: adventureId,
          id_personnage: characterId,
          id_embranchement_actuel: branchId,
          progression: progression,
          date_sauvegarde: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('[Save] Erreur Supabase:', error);
        throw error;
      }

      console.log('[Save] SUCCÈS:', data);

      setState({
        isSaving: false,
        lastSaved: new Date(),
        error: null,
        saveId: data?.id ?? null,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      console.error('[Save] Erreur catch:', message);
      setState(prev => ({ ...prev, isSaving: false, error: message }));
      return false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      console.log('[Save] Désactivé par enabled');
      return;
    }
    if (!userId || !adventureId || !characterId) {
      console.log('[Save] Désactivé - paramètres manquants:', { userId: !!userId, adventureId: !!adventureId, characterId: !!characterId });
      return;
    }

    console.log('[Save] Auto activée, interval:', intervalMs);

    const interval = setInterval(() => {
      save();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, userId, adventureId, characterId, intervalMs, save]);

  useEffect(() => {
    if (enabled && userId && adventureId && characterId) {
      console.log('[Save] Sauvegarde immédiate au démarrage');
      save();
    }
  }, [enabled, userId, adventureId, characterId, save]);

  return { ...state, save };
}