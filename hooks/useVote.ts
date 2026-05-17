import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

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

 if (loadingRef.current) return;
 loadingRef.current = true;
 setIsLoading(true);
 setError(null);

 try {
 if (hasVoted) {
 await withTimeout(
 (async () => {
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
 })(),
 VOTE_TIMEOUT
 );
 setHasVoted(false);
 } else {
 await withTimeout(
 (async () => {
 const { error: insertError } = await supabase
 .from('vote')
 .insert({ id_utilisateur: userId, id_aventure: adventureId });
 if (insertError) throw insertError;

 const { error: rpcError } = await supabase
 .rpc('incrementer_popularite', { aventure_id: adventureId });
 if (rpcError && !rpcError.message?.includes('does not exist')) {
 throw rpcError;
 }
 })(),
 VOTE_TIMEOUT
 );
 setHasVoted(true);
 }

 await withTimeout(refetchPopularite(), VOTE_TIMEOUT);
 } catch (err) {
 const message = err instanceof Error ? err.message : "Erreur lors du vote";
 setError(message);
 } finally {
 setIsLoading(false);
 loadingRef.current = false;
 }
 }, [userId, hasVoted, adventureId, refetchPopularite]);

 return { hasVoted, popularite, isLoading, error, toggleVote };
}
