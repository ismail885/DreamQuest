import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/jwt';
import { createAdminClient } from '@/lib/supabaseClient';

const VALID_ROLES = ['joueur', 'createur', 'admin'] as const;
type ValidRole = (typeof VALID_ROLES)[number];

function isValidRole(role: string): role is ValidRole {
  return VALID_ROLES.includes(role as ValidRole);
}

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

    const currentUserId = Number(payload.userId);

    // 2. Lire les données
    const body = (await request.json()) as {
      userIds?: number[];
      role?: string;
      nom_utilisateur?: string;
      email?: string;
    };

    // 3. Bulk role change
    if (body.role !== undefined) {
      if (!isValidRole(body.role)) {
        return NextResponse.json(
          { error: `Rôle invalide. Valeurs autorisées: ${VALID_ROLES.join(', ')}` },
          { status: 400 },
        );
      }

      const userIds = body.userIds;
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return NextResponse.json({ error: 'Aucun utilisateur spécifié' }, { status: 400 });
      }

      // Empêcher l'admin de retirer son propre rôle admin
      if (userIds.includes(currentUserId) && body.role !== 'admin') {
        return NextResponse.json(
          { error: 'Vous ne pouvez pas retirer votre propre rôle administrateur' },
          { status: 400 },
        );
      }

      const admin = createAdminClient();
      for (const userId of userIds) {
        const { error } = await admin
          .from('utilisateur')
          .update({ role: body.role })
          .eq('id', userId);

        if (error) {
          console.error(`[Admin] Erreur mise à jour rôle user ${userId}:`, error);
        }
      }

      return NextResponse.json({ ok: true, updated: userIds.length });
    }

    // 4. Single user edit (nom + email + role)
    if (body.nom_utilisateur !== undefined || body.email !== undefined) {
      const singleUserId = body.userIds?.[0];
      if (!singleUserId) {
        return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 });
      }

      if (singleUserId === currentUserId && body.role !== undefined && body.role !== 'admin') {
        return NextResponse.json(
          { error: 'Vous ne pouvez pas retirer votre propre rôle administrateur' },
          { status: 400 },
        );
      }

      const updateData: Record<string, string> = {};
      if (body.nom_utilisateur !== undefined) {
        if (body.nom_utilisateur.trim().length < 2) {
          return NextResponse.json({ error: 'Nom trop court (min 2 caractères)' }, { status: 400 });
        }
        updateData.nom_utilisateur = body.nom_utilisateur.trim();
      }
      if (body.email !== undefined) {
        if (!body.email.includes('@')) {
          return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
        }
        updateData.email = body.email.trim();
      }
      if (body.role !== undefined) {
        if (!isValidRole(body.role)) {
          return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
        }
        updateData.role = body.role;
      }

      const admin = createAdminClient();
      const { error } = await admin
        .from('utilisateur')
        .update(updateData)
        .eq('id', singleUserId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 });
  } catch (error) {
    console.error('[Admin] Erreur mise à jour utilisateur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
