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

    console.log('Sauvegarde appelée:', { userId, adventureId, characterId, branchId, progression });

    if (!userId || !adventureId || !characterId) {
      console.log('Sauvegarde annulée: paramètres manquants', { userId: !!userId, adventureId: !!adventureId, characterId: !!characterId });
      return false;
    }

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      // Utiliser insert au lieu de upsert pour éviter les problèmes de contrainte
      const { data, error } = await supabase
        .from('sauvegarde')
        .insert({
          id_utilisateur: userId,
          id_aventure: adventureId,
          id_personnage: characterId,
          id_embranchement_actuel: branchId,
          progression,
          date_sauvegarde: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erreur sauvegarde:', error);
        throw error;
      }

      console.log('Sauvegarde réussie:', data);

      setState({
        isSaving: false,
        lastSaved: new Date(),
        error: null,
        saveId: data?.id ?? null,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      console.error('Erreur catch:', message);
      setState(prev => ({ ...prev, isSaving: false, error: message }));
      return false;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !userId || !adventureId || !characterId) {
      console.log('Sauvegarde automatique désactivée:', { enabled, userId: !!userId, adventureId: !!adventureId, characterId: !!characterId });
      return;
    }

    console.log('Sauvegarde automatique activée, interval:', intervalMs);
    const interval = setInterval(() => {
      console.log('Sauvegarde automatique déclenchée');
      save();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, userId, adventureId, characterId, intervalMs, save]);

  return { ...state, save };
}
