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
  });

 const userIdRef = useRef(userId);
 userIdRef.current = userId;
 const onChoiceRef = useRef(onChoice);
 onChoiceRef.current = onChoice;
 const isLoadingRef = useRef(false);

 // Charger l'aventure depuis la BDD
 useEffect(() => {
 if (!adventureId) return;

 const loadAdventure = async () => {
 setState((s) => ({ ...s, loading: true, error: null }));
 try {
 // Fetch adventure
 const { data: adventure, error: advError } = await supabase
 .from('aventure')
 .select('id,titre,description,auteur_id,date_creation,popularite')
 .eq('id', adventureId)
 .single();

  if (advError || !adventure) {
    setState((s) => ({ ...s, loading: false, error: "Aventure introuvable." }));
    return;
  }

  // Compter le nombre total d'embranchements
  const { count: totalBranches } = await supabase
    .from('embranchement')
    .select('*', { count: 'exact', head: true })
    .eq('id_aventure', adventureId);

  // Trouver le nœud de départ (le plus ancien = plus petit id)
  const { data: firstBranch } = await supabase
 .from('embranchement')
 .select('id')
 .eq('id_aventure', adventureId)
 .order('id', { ascending: true })
 .limit(1)
 .single();

 if (!firstBranch) {
 setState((s) => ({ ...s, adventure, loading: false, error: "Cette aventure n'a pas encore de contenu." }));
 return;
 }

 let branchIdToLoad = firstBranch.id;
 
 if (userIdRef.current) {
 const { data: save } = await supabase
 .from('sauvegarde')
 .select('id_embranchement_actuel')
 .eq('id_utilisateur', userIdRef.current)
 .eq('id_aventure', adventureId)
 .single();
 
 if (save?.id_embranchement_actuel) {
 branchIdToLoad = save.id_embranchement_actuel;
 }
 }

 // Charger le nœud actuel
 const { data: branch, error: branchError } = await supabase
 .from('embranchement')
 .select('id,texte,choix1,choix1_lien,choix1_consequences,choix2,choix2_lien,choix2_consequences,id_aventure')
 .eq('id', branchIdToLoad)
 .single();

 if (branchError || !branch) {
 // Fallback au premier nœud si le nœud sauvegardé n'existe plus
 const { data: fallbackBranch } = await supabase
 .from('embranchement')
 .select('id,texte,choix1,choix1_lien,choix1_consequences,choix2,choix2_lien,choix2_consequences,id_aventure')
 .eq('id', firstBranch.id)
 .single();
 
  if (fallbackBranch) {
    const isEnd = !fallbackBranch.choix1_lien && !fallbackBranch.choix2_lien;
    setState({ adventure, currentBranch: fallbackBranch, loading: false, error: null, isEnd, history: [fallbackBranch], totalBranches: totalBranches ?? 0 });
  } else {
    setState((s) => ({ ...s, adventure, loading: false, error: "Impossible de charger l'histoire." }));
  }
  return;
    }

  const isEnd = !branch.choix1_lien && !branch.choix2_lien;
  setState({ adventure, currentBranch: branch, loading: false, error: null, isEnd, history: [branch], totalBranches: totalBranches ?? 0 });
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

 // Supprimer la sauvegarde BDD
 try {
 await supabase
 .from('sauvegarde')
 .delete()
 .eq('id_aventure', state.adventure.id)
 .eq('id_utilisateur', userIdRef.current);
  } catch (err) {
    console.warn('[useAdventure] restart delete save failed:', err)
  }

 // Charger le premier nœud
 const { data: firstBranch } = await supabase
 .from('embranchement')
 .select('id,texte,choix1,choix1_lien,choix1_consequences,choix2,choix2_lien,choix2_consequences,id_aventure')
 .eq('id_aventure', state.adventure.id)
 .order('id', { ascending: true })
 .limit(1)
 .single();

 if (firstBranch) {
 const isEnd = !firstBranch.choix1_lien && !firstBranch.choix2_lien;
 setState((s) => ({
 ...s,
 currentBranch: firstBranch,
 loading: false,
 isEnd,
 history: [firstBranch],
 }));
 } else {
 setState((s) => ({ ...s, loading: false, error: "Impossible de recommencer." }));
 }
 }, [state.adventure]);

 return { ...state, chooseOption, restart };
}
