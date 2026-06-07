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

 if (!userId || !adventureId || !characterId) {
 return false;
 }

 setState(prev => ({ ...prev, isSaving: true, error: null }));

 try {
 const payload = {
 id_utilisateur: userId,
 id_aventure: adventureId,
 id_personnage: characterId,
 id_embranchement_actuel: branchId,
 progression: progression,
 date_sauvegarde: new Date().toISOString(),
 };

 // UPSERT : crée ou met à jour selon la contrainte UNIQUE (id_utilisateur, id_aventure, id_personnage)
 const { data, error } = await supabase
 .from('sauvegarde')
 .upsert(payload, {
 onConflict: 'id_utilisateur,id_aventure,id_personnage',
 ignoreDuplicates: false,
 })
 .select('id')
 .single();

 if (error) {
 throw error;
 }

 if (!data?.id) {
 throw new Error('La sauvegarde a echoue — aucun ID retourne');
 }

 setState({
 isSaving: false,
 lastSaved: new Date(),
 error: null,
 saveId: data.id,
 });
 return true;
 } catch (err) {
 const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
 setState(prev => ({ ...prev, isSaving: false, error: message }));
 return false;
 }
 }, []);

  useEffect(() => {
  if (!enabled || !userId || !adventureId || !characterId) return;

  const interval = setInterval(() => {
  save();
  }, intervalMs);

  return () => clearInterval(interval);
  }, [enabled, userId, adventureId, characterId, intervalMs, save]);

  useEffect(() => {
 if (enabled && userId && adventureId && characterId) {
 save();
 }
 }, [enabled, userId, adventureId, characterId, save]);

 return { ...state, save };
}