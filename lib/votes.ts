import { supabase } from './supabaseClient'

/**
 * Vote pour une aventure (insert + incrémentation popularité).
 * Retourne false si l'utilisateur a déjà voté (duplicate key).
 */
export async function voteForAdventure(userId: number, adventureId: number): Promise<boolean> {
  try {
    const { error: voteError } = await supabase
      .from('vote')
      .insert({ id_utilisateur: userId, id_aventure: adventureId })

    if (voteError) {
      if (voteError.code === '23505' || voteError.message?.includes('duplicate key')) {
        return false
      }
      throw voteError
    }

    const { error: rpcError } = await supabase.rpc('incrementer_popularite', { aventure_id: adventureId })
    if (rpcError && rpcError.message?.includes('does not exist')) {
      // Fallback si la RPC n'existe pas
      const { data: current } = await supabase
        .from('aventure')
        .select('popularite')
        .eq('id', adventureId)
        .single()
      if (current) {
        await supabase
          .from('aventure')
          .update({ popularite: (current as { popularite: number }).popularite + 1 })
          .eq('id', adventureId)
      }
    }

    return true
  } catch (err) {
    console.error('[votes] voteForAdventure failed:', err, 'userId:', userId, 'adventureId:', adventureId)
    return false
  }
}
