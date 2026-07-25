import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/jwt';
import { createAdminClient } from '@/lib/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Compte les votes pour une aventure et met à jour la colonne popularite.
 * Retourne le nouveau nombre, ou undefined en cas d'erreur.
 */
async function syncPopularite(admin: SupabaseClient, adventureId: number): Promise<number | undefined> {
  try {
    const { count, error } = await admin
      .from('vote')
      .select('*', { count: 'exact', head: true })
      .eq('id_aventure', adventureId);

    if (error || count === null) return undefined;

    const { error: updateError } = await admin
      .from('aventure')
      .update({ popularite: count })
      .eq('id', adventureId);

    if (updateError) return undefined;
    return count;
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier le JWT
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    const userId = Number(payload.userId);
    const body = (await request.json()) as { adventureId?: number };

    if (!body.adventureId || typeof body.adventureId !== 'number') {
      return NextResponse.json({ error: 'ID aventure requis' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Vérifier si l'utilisateur a déjà voté (unique constraint)
    const { data: existing } = await admin
      .from('vote')
      .select('id')
      .eq('id_utilisateur', userId)
      .eq('id_aventure', body.adventureId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Vous avez déjà voté pour cette aventure' }, { status: 409 });
    }

    // Insérer le vote
    const { error: insertError } = await admin
      .from('vote')
      .insert({ id_utilisateur: userId, id_aventure: body.adventureId });

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Vous avez déjà voté' }, { status: 409 });
      }
      throw insertError;
    }

    // Synchroniser la popularité (comptage direct, pas de dépendance RPC)
    const popularite = await syncPopularite(admin, body.adventureId);

    return NextResponse.json({
      ok: true,
      hasVoted: true,
      popularite,
    });
  } catch (error) {
    console.error('[Vote] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. Vérifier le JWT
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    const userId = Number(payload.userId);
    const { searchParams } = new URL(request.url);
    const adventureIdRaw = searchParams.get('adventureId');
    const adventureId = adventureIdRaw ? parseInt(adventureIdRaw, 10) : null;

    if (!adventureId || isNaN(adventureId)) {
      return NextResponse.json({ error: 'ID aventure requis' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { error: deleteError } = await admin
      .from('vote')
      .delete()
      .eq('id_utilisateur', userId)
      .eq('id_aventure', adventureId);

    if (deleteError) throw deleteError;

    // Synchroniser la popularité (comptage direct, pas de dépendance RPC)
    const popularite = await syncPopularite(admin, adventureId);

    return NextResponse.json({
      ok: true,
      hasVoted: false,
      popularite,
    });
  } catch (error) {
    console.error('[Vote] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
