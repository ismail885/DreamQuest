import { useState, useCallback, useRef } from 'react';

const VOTE_TIMEOUT = 10000;

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

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("La requête a pris trop de temps")), ms)
    ),
  ]);
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
  const loadingRef = useRef(false);

  const toggleVote = useCallback(async () => {
    if (!userId) {
      setError("Vous devez etre connecte pour voter");
      return;
    }

    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      if (hasVoted) {
        await withTimeout(
          fetch(`/api/vote?adventureId=${adventureId}`, { method: 'DELETE' }).then(r => r.json()),
          VOTE_TIMEOUT
        );
        setHasVoted(false);
        // Re-fetch popularite depuis la vue publiquement accessible (SELECT anon OK)
        const { default: supabase } = await import('@/lib/supabaseClient');
        const { data } = await supabase.from('aventure').select('popularite').eq('id', adventureId).single();
        if (data) setPopularite(data.popularite);
      } else {
        const res = await withTimeout(
          fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adventureId }),
          }).then(r => r.json()),
          VOTE_TIMEOUT
        );
        if (res.error) throw new Error(res.error);
        setHasVoted(true);
        if (typeof res.popularite === 'number') setPopularite(res.popularite);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du vote";
      setError(message);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [userId, hasVoted, adventureId]);

  return { hasVoted, popularite, isLoading, error, toggleVote };
}
