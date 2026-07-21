import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/jwt';
import { createAdminClient } from '@/lib/supabaseClient';

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
    const body = (await request.json()) as {
      adventureId?: number;
      characterId?: number;
      currentBranchId?: number;
      progression?: number;
    };

    if (!body.adventureId || !body.characterId) {
      return NextResponse.json({ error: 'ID aventure et personnage requis' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Vérifier si une sauvegarde existe déjà
    const { data: existing } = await admin
      .from('sauvegarde')
      .select('id')
      .eq('id_utilisateur', userId)
      .eq('id_aventure', body.adventureId)
      .eq('id_personnage', body.characterId)
      .maybeSingle();

    if (existing) {
      // Mise à jour
      const { error } = await admin
        .from('sauvegarde')
        .update({
          id_embranchement_actuel: body.currentBranchId ?? null,
          progression: body.progression ?? 0,
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Création
      const { error } = await admin
        .from('sauvegarde')
        .insert({
          id_utilisateur: userId,
          id_aventure: body.adventureId,
          id_personnage: body.characterId,
          id_embranchement_actuel: body.currentBranchId ?? null,
          progression: body.progression ?? 0,
        });

      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Saves] Erreur:', error);
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
    const { error } = await admin
      .from('sauvegarde')
      .delete()
      .eq('id_aventure', adventureId)
      .eq('id_utilisateur', userId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Saves] Erreur DELETE:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
