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

    // 2. Lire les IDs depuis le body
    const body = (await request.json()) as { userIds?: number[] };
    const userIds = body?.userIds;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Aucun utilisateur spécifié' }, { status: 400 });
    }

    // 3. Empêcher l'admin de se supprimer lui-même
    const currentUserId = Number(payload.userId);
    const filteredIds = userIds.filter((id) => id !== currentUserId);
    if (filteredIds.length === 0) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte administrateur' },
        { status: 400 },
      );
    }

    // 4. Supprimer en cascade avec le client admin (bypass RLS)
    const admin = createAdminClient();

    for (const userId of filteredIds) {
      // Récupérer les aventures de l'utilisateur
      const { data: advs } = await admin
        .from('aventure')
        .select('id')
        .eq('auteur_id', userId);
      const advIds = (advs || []).map((a: { id: number }) => a.id);

      if (advIds.length > 0) {
        await admin.from('embranchement').delete().in('id_aventure', advIds);
        await admin.from('vote').delete().in('id_aventure', advIds);
        await admin.from('sauvegarde').delete().in('id_aventure', advIds);
        await admin.from('aventure').delete().in('id', advIds);
      }

      await admin.from('vote').delete().eq('id_utilisateur', userId);
      await admin.from('sauvegarde').delete().eq('id_utilisateur', userId);
      await admin.from('quete_quotidienne').delete().eq('id_utilisateur', userId);
      await admin.from('personnage').delete().eq('id_utilisateur', userId);
      await admin.from('utilisateur').delete().eq('id', userId);
    }

    return NextResponse.json({ ok: true, deleted: filteredIds.length });
  } catch (error) {
    console.error('[Admin] Erreur suppression utilisateur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
