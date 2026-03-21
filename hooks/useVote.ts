import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface UseVoteProps {
  adventureId: number;
  userId: number | null;
  initialHasVoted?: boolean;
  initialPopularite?: number;
}

interface UseVoteReturn {
  hasVoted: boolean;
  popularite: number;
  isLoading: boolean;
  error: string | null;
  toggleVote: () => Promise<void>;
}

export function useVote({
  adventureId,
  userId,
  initialHasVoted = false,
  initialPopularite = 0,
}: UseVoteProps): UseVoteReturn {
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [popularite, setPopularite] = useState(initialPopularite);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleVote = useCallback(async () => {
    if (!userId) {
      setError("Vous devez être connecté pour voter");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (hasVoted) {
        const { error: deleteError } = await supabase
          .from('vote')
          .delete()
          .eq('id_utilisateur', userId)
          .eq('id_aventure', adventureId);

        if (deleteError) throw deleteError;

        const { error: updateError } = await supabase
          .from('aventure')
          .update({ popularite: popularite - 1 })
          .eq('id', adventureId);

        if (updateError) throw updateError;

        setHasVoted(false);
        setPopularite(prev => prev - 1);
      } else {
        const { error: insertError } = await supabase
          .from('vote')
          .insert({ id_utilisateur: userId, id_aventure: adventureId });

        if (insertError) throw insertError;

        const { error: updateError } = await supabase
          .from('aventure')
          .update({ popularite: popularite + 1 })
          .eq('id', adventureId);

        if (updateError) throw updateError;

        setHasVoted(true);
        setPopularite(prev => prev + 1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du vote";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, hasVoted, popularite, adventureId, isLoading]);

  return { hasVoted, popularite, isLoading, error, toggleVote };
}
