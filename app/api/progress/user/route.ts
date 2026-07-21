import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/jwt';
import { createAdminClient } from '@/lib/supabaseClient';
import { getCurrentSeason } from '@/lib/seasons';
import { calculateRequiredXP } from '@/lib/characters/classDefinitions';
import { MAX_LEVEL } from '@/lib/seasons';

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
    const body = (await request.json()) as { xpAmount?: number; source?: string };

    if (!body.xpAmount || typeof body.xpAmount !== 'number' || body.xpAmount <= 0) {
      return NextResponse.json({ error: 'Montant XP invalide' }, { status: 400 });
    }

    const xpAmount = Math.min(body.xpAmount, 10000); // Anti-exploit : cap à 10k XP par requête

    const admin = createAdminClient();
    const season = getCurrentSeason();
    const multiplier = season.xpMultiplier;
    const adjustedAmount = Math.round(xpAmount * multiplier);

    // Lire l'utilisateur
    const { data: user, error: userError } = await admin
      .from('utilisateur')
      .select('experience, niveau, saison_actuelle, meilleur_niveau')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const currentLevel = user.niveau ?? 1;
    const currentXP = user.experience ?? 0;
    const newExperience = currentXP + adjustedAmount;

    // Calculer le nouveau niveau
    let newLevel = currentLevel;
    function getTotalXPForLevel(level: number): number {
      if (level <= 1) return 0;
      let total = 0;
      for (let i = 1; i < level; i++) total += calculateRequiredXP(i);
      return total;
    }
    while (newLevel < MAX_LEVEL && newExperience >= getTotalXPForLevel(newLevel + 1)) {
      newLevel++;
    }

    const levelsGained = newLevel - currentLevel;
    const newBestLevel = Math.max(newLevel, user.meilleur_niveau ?? 1);

    const { error: updateError } = await admin
      .from('utilisateur')
      .update({
        experience: newExperience,
        niveau: newLevel,
        meilleur_niveau: newBestLevel,
        saison_actuelle: season.id,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return NextResponse.json({
      ok: true,
      newLevel,
      newExperience,
      leveledUp: levelsGained > 0,
      levelsGained,
      seasonId: season.id,
    });
  } catch (error) {
    console.error('[Progress/User] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
