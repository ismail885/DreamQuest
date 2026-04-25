import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Aventure, Embranchement } from '@/lib/supabaseClient';

interface UseAdventureState {
  adventure: Aventure | null;
  currentBranch: Embranchement | null;
  loading: boolean;
  error: string | null;
  isEnd: boolean;
  history: Embranchement[];
}

export function useAdventure(adventureId: number, userId: number | null = null) {
  const [state, setState] = useState<UseAdventureState>({
    adventure: null,
    currentBranch: null,
    loading: true,
    error: null,
    isEnd: false,
    history: [],
  });

  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  useEffect(() => {
    if (!adventureId) return;

    const loadAdventure = async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        // Fetch adventure
        const { data: adventure, error: advError } = await supabase
          .from('aventure')
          .select('id,titre,description,auteur_id,date_creation,popularite,embranchement_initial_id')
          .eq('id', adventureId)
          .single();

        if (advError || !adventure) {
          setState((s) => ({ ...s, loading: false, error: "Aventure introuvable." }));
          return;
        }

        // Fetch initial branch
        if (adventure.embranchement_initial_id) {
          const { data: branch, error: branchError } = await supabase
            .from('embranchement')
            .select('id,texte,choix1,choix1_lien,choix1_consequences,choix2,choix2_lien,choix2_consequences,id_aventure')
            .eq('id', adventure.embranchement_initial_id)
            .single();

          if (branchError || !branch) {
            setState((s) => ({ ...s, adventure, loading: false, error: "Impossible de charger l'histoire." }));
            return;
          }

          const isEnd = !branch.choix1_lien && !branch.choix2_lien;
          setState({ adventure, currentBranch: branch, loading: false, error: null, isEnd, history: [branch] });
        } else {
          setState((s) => ({ ...s, adventure, loading: false, error: "Cette aventure n'a pas encore de contenu." }));
        }
      } catch {
        setState((s) => ({ ...s, loading: false, error: "Une erreur est survenue." }));
      }
    };

    loadAdventure();
  }, [adventureId]);

  const chooseOption = useCallback(async (branchId: number | null) => {
    if (!branchId) return;

    setState((s) => ({ ...s, loading: true }));
    try {
      const { data: branch, error } = await supabase
        .from('embranchement')
        .select('id,texte,choix1,choix1_lien,choix1_consequences,choix2,choix2_lien,choix2_consequences,id_aventure')
        .eq('id', branchId)
        .single();

      if (error || !branch) {
        setState((s) => ({ ...s, loading: false, error: "Impossible de charger la suite." }));
        return;
      }

      const isEnd = !branch.choix1_lien && !branch.choix2_lien;
      setState((s) => ({
        ...s,
        currentBranch: branch,
        loading: false,
        isEnd,
        history: [...s.history, branch],
      }));
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Une erreur est survenue." }));
    }
  }, []);

  const restart = useCallback(async () => {
    if (!state.adventure?.embranchement_initial_id) return;
    setState((s) => ({ ...s, loading: true }));

    // Supprimer l'ancienne sauvegarde si elle existe
    if (state.adventure && userIdRef.current) {
      try {
        await supabase
          .from('sauvegarde')
          .delete()
          .eq('id_aventure', state.adventure.id)
          .eq('id_utilisateur', userIdRef.current);
      } catch {
        // Ignore l'erreur de suppression
      }
    }

    supabase
      .from('embranchement')
      .select('id,texte,choix1,choix1_lien,choix1_consequences,choix2,choix2_lien,choix2_consequences,id_aventure')
      .eq('id', state.adventure!.embranchement_initial_id!)
      .single()
      .then(({ data: branch, error }) => {
        if (error || !branch) {
          setState((s) => ({ ...s, loading: false, error: "Impossible de recommencer." }));
          return;
        }
        const isEnd = !branch.choix1_lien && !branch.choix2_lien;
        setState((s) => ({
          ...s,
          currentBranch: branch,
          loading: false,
          isEnd,
          history: [branch],
        }));
      });
  }, [state.adventure]);

  return { ...state, chooseOption, restart };
}

