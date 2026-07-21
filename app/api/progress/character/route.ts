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

    const body = (await request.json()) as {
      characterId?: number;
      niveau?: number;
      experience?: number;
      force_personnage?: number;
      agility_personnage?: number;
      magie_personnage?: number;
      endurance_personnage?: number;
      points_vie?: number;
    };

    if (!body.characterId || typeof body.characterId !== 'number') {
      return NextResponse.json({ error: 'ID personnage requis' }, { status: 400 });
    }

    // Validation des bornes
    const updateData: Record<string, number> = {};
    if (body.niveau !== undefined) {
      if (body.niveau < 1 || body.niveau > 100) {
        return NextResponse.json({ error: 'Niveau invalide (1-100)' }, { status: 400 });
      }
      updateData.niveau = body.niveau;
    }
    if (body.experience !== undefined) {
      if (body.experience < 0) {
        return NextResponse.json({ error: 'XP invalide' }, { status: 400 });
      }
      updateData.experience = body.experience;
    }
    if (body.force_personnage !== undefined) updateData.force_personnage = Math.max(0, body.force_personnage);
    if (body.agility_personnage !== undefined) updateData.agility_personnage = Math.max(0, body.agility_personnage);
    if (body.magie_personnage !== undefined) updateData.magie_personnage = Math.max(0, body.magie_personnage);
    if (body.endurance_personnage !== undefined) updateData.endurance_personnage = Math.max(0, body.endurance_personnage);
    if (body.points_vie !== undefined) updateData.points_vie = Math.max(0, body.points_vie);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('personnage')
      .update(updateData)
      .eq('id', body.characterId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Progress/Character] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
