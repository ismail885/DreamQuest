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

  const refetchPopularite = useCallback(async () => {
    const { data } = await supabase
      .from('aventure')
      .select('popularite')
      .eq('id', adventureId)
      .single();
    if (data) {
      setPopularite(data.popularite);
    }
  }, [adventureId]);

  const toggleVote = useCallback(async () => {
    if (!userId) {
      setError("Vous devez etre connecte pour voter");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (hasVoted) {
        // Annuler le vote
        const { error: deleteError } = await supabase
          .from('vote')
          .delete()
          .eq('id_utilisateur', userId)
          .eq('id_aventure', adventureId);

        if (deleteError) throw deleteError;

        const { error: rpcError } = await supabase
          .rpc('decrementer_popularite', { aventure_id: adventureId });
        
        if (rpcError && !rpcError.message?.includes('does not exist')) {
          throw rpcError;
        }

        setHasVoted(false);
      } else {
        // Voter
        const { error: insertError } = await supabase
          .from('vote')
          .insert({ id_utilisateur: userId, id_aventure: adventureId });

        if (insertError) throw insertError;

        const { error: rpcError } = await supabase
          .rpc('incrementer_popularite', { aventure_id: adventureId });
        
        if (rpcError && !rpcError.message?.includes('does not exist')) {
          throw rpcError;
        }

        setHasVoted(true);
      }

      await refetchPopularite();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du vote";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, hasVoted, adventureId, isLoading, refetchPopularite]);

  return { hasVoted, popularite, isLoading, error, toggleVote };
}
