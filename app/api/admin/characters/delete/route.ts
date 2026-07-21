import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/jwt';
import { createAdminClient } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier le JWT admin côté serveur
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookies(cookieHeader);
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 2. Lire l'ID du personnage
    const body = (await request.json()) as { characterId?: number };
    const characterId = body?.characterId;
    if (!characterId || typeof characterId !== 'number') {
      return NextResponse.json({ error: 'ID personnage requis' }, { status: 400 });
    }

    // 3. Supprimer avec le client admin (bypass RLS)
    const admin = createAdminClient();

    await admin.from('sauvegarde').delete().eq('id_personnage', characterId);

    const { error } = await admin.from('personnage').delete().eq('id', characterId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Admin] Erreur suppression personnage:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
