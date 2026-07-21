import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Adventure, Branch } from '@/types/adventure';

interface UseAdventureState {
  adventure: Adventure | null;
  currentBranch: Branch | null;
  loading: boolean;
  error: string | null;
  isEnd: boolean;
  history: Branch[];
  totalBranches: number;
  savedProgression: number;
}

export function useAdventure(
 adventureId: number,
 userId: number | null = null,
 onChoice?: (branchId: number, currentHistory: Branch[]) => void,
) {
  const [state, setState] = useState<UseAdventureState>({
    adventure: null,
    currentBranch: null,
    loading: true,
    error: null,
    isEnd: false,
    history: [],
    totalBranches: 0,
    savedProgression: 0,
  });

 const userIdRef = useRef(userId);
 userIdRef.current = userId;
 const onChoiceRef = useRef(onChoice);
 onChoiceRef.current = onChoice;
 const isLoadingRef = useRef(false);

  useEffect(() => {
 if (!adventureId) return;

 const loadAdventure = async () => {
 setState((s) => ({ ...s, loading: true, error: null }));
 try {
  const { data: adventure, error: advError } = await supabase
 .from('aventure')
 .select('id,titre,description,auteur_id,date_creation,popularite,genre,embranchement_initial_id')
 .eq('id', adventureId)
 .single();

  if (advError || !adventure) {
    setState((s) => ({ ...s, loading: false, error: "Aventure introuvable." }));
    return;
  }

  const { count: totalBranches } = await supabase
    .from('embranchement')
    .select('*', { count: 'exact', head: true })
    .eq('id_aventure', adventureId);

  const rootId = adventure.embranchement_initial_id;

  if (!rootId) {
 setState((s) => ({ ...s, adventure, loading: false, error: "Cette aventure n'a pas encore de contenu." }));
 return;
 }

 let branchIdToLoad = rootId;
 let resumedProgression = 0;

 if (userIdRef.current) {
 const { data: save } = await supabase
 .from('sauvegarde')
 .select('id_embranchement_actuel, progression')
 .eq('id_utilisateur', userIdRef.current)
 .eq('id_aventure', adventureId)
 .single();

 if (save?.id_embranchement_actuel) {
 branchIdToLoad = save.id_embranchement_actuel;
 resumedProgression = save.progression ?? 0;
 }
 }

  const { data: branch, error: branchError } = await supabase
 .from('embranchement')
 .select('id,texte,choix1,choix1_lien,choix1_consequences,choix2,choix2_lien,choix2_consequences,id_aventure')
 .eq('id', branchIdToLoad)
 .single();

 if (branchError || !branch) {
  // Fallback au nœud racine si le nœud sauvegardé n'existe plus
  const { data: fallbackBranch } = await supabase
 .from('embranchement')
 .select('id,texte,choix1,choix1_lien,choix1_consequences,choix2,choix2_lien,choix2_consequences,id_aventure')
 .eq('id', rootId)
 .single();
 
  if (fallbackBranch) {
    const isEnd = !fallbackBranch.choix1_lien && !fallbackBranch.choix2_lien;
    setState({ adventure, currentBranch: fallbackBranch, loading: false, error: null, isEnd, history: [fallbackBranch], totalBranches: totalBranches ?? 0, savedProgression: 0 });
  } else {
    setState((s) => ({ ...s, adventure, loading: false, error: "Impossible de charger l'histoire." }));
  }
  return;
    }

  const isEnd = !branch.choix1_lien && !branch.choix2_lien;
  setState({ adventure, currentBranch: branch, loading: false, error: null, isEnd, history: [branch], totalBranches: totalBranches ?? 0, savedProgression: resumedProgression });
  } catch (err) {
    console.error('[useAdventure] loadAdventure failed:', err, 'adventureId:', adventureId)
    setState((s) => ({ ...s, loading: false, error: "Une erreur est survenue." }));
  }
  };

  loadAdventure();
  }, [adventureId, userId]);

  const chooseOption = useCallback(async (branchId: number | null) => {
  if (!branchId) return;
  if (isLoadingRef.current) return;

  isLoadingRef.current = true;
  try {
  const { data: branch, error } = await supabase
  .from('embranchement')
  .select('id,texte,choix1,choix1_lien,choix1_consequences,choix2,choix2_lien,choix2_consequences,id_aventure')
  .eq('id', branchId)
  .single();

  if (error || !branch) {
  setState((s) => ({ ...s, error: "Impossible de charger la suite." }));
  isLoadingRef.current = false;
  return;
  }

  const isEnd = !branch.choix1_lien && !branch.choix2_lien;

  setState((s) => {
  onChoiceRef.current?.(branchId, s.history);
  return {
  ...s,
  currentBranch: branch,
  isEnd,
  history: [...s.history, branch],
  };
  });
  isLoadingRef.current = false;
  } catch (err) {
    console.error('[useAdventure] chooseOption failed:', err, 'branchId:', branchId)
    setState((s) => ({ ...s, error: "Une erreur est survenue." }));
    isLoadingRef.current = false;
  }
  }, []);

 const restart = useCallback(async () => {
 if (!state.adventure || !userIdRef.current) return;
 setState((s) => ({ ...s, loading: true }));

  try {
 await supabase
 .from('sauvegarde')
 .delete()
 .eq('id_aventure', state.adventure.id)
 .eq('id_utilisateur', userIdRef.current);
  } catch (err) {
    console.warn('[useAdventure] restart delete save failed:', err)
  }

  const rootId = state.adventure.embranchement_initial_id;

  if (!rootId) {
 setState((s) => ({ ...s, loading: false, error: "Impossible de recommencer." }));
 return;
  }

  const { data: rootBranch } = await supabase
 .from('embranchement')
 .select('id,texte,choix1,choix1_lien,choix1_consequences,choix2,choix2_lien,choix2_consequences,id_aventure')
 .eq('id', rootId)
 .single();

 if (rootBranch) {
 const isEnd = !rootBranch.choix1_lien && !rootBranch.choix2_lien;
 setState((s) => ({
 ...s,
 currentBranch: rootBranch,
 loading: false,
 isEnd,
 history: [rootBranch],
 }));
 } else {
 setState((s) => ({ ...s, loading: false, error: "Impossible de recommencer." }));
 }
 }, [state.adventure]);

 return { ...state, chooseOption, restart };
}
