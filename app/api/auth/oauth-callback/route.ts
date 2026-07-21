import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseClient';

function buildUsername(user: {
  user_metadata?: Record<string, string | undefined>;
  email?: string | null;
}): string {
  const fromMeta =
    user.user_metadata?.user_name ||
    user.user_metadata?.name ||
    user.user_metadata?.preferred_username ||
    '';
  const fromEmail = user.email ? user.email.split('@')[0] : 'joueur';
  const candidate = (fromMeta || fromEmail || 'joueur').trim();
  return candidate.slice(0, 50) || 'joueur';
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = body?.accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token requis' }, { status: 400 });
    }

    // Vérifier le token Supabase côté serveur
    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    const supabaseUser = authData.user;
    if (!supabaseUser.email) {
      return NextResponse.json({ error: 'Email OAuth manquant' }, { status: 400 });
    }

    const username = buildUsername(supabaseUser);

    // Vérifier si l'utilisateur existe déjà par auth_id
    const { data: existingByAuthId } = await admin
      .from('utilisateur')
      .select('id')
      .eq('auth_id', supabaseUser.id)
      .maybeSingle();

    if (existingByAuthId) {
      return NextResponse.json({ ok: true, created: false });
    }

    // Essayer de lier un compte existant avec le même email (auth_id null)
    const { data: updatedByEmail } = await admin
      .from('utilisateur')
      .update({
        auth_id: supabaseUser.id,
        nom_utilisateur: username,
      })
      .eq('email', supabaseUser.email)
      .is('auth_id', null)
      .select('id')
      .maybeSingle();

    if (updatedByEmail) {
      return NextResponse.json({ ok: true, created: false });
    }

    // Créer un nouvel utilisateur
    const { data: inserted, error: insertError } = await admin
      .from('utilisateur')
      .insert({
        nom_utilisateur: username,
        email: supabaseUser.email,
        mot_de_passe: null,
        role: 'joueur',
        auth_id: supabaseUser.id,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[OAuth] Erreur création utilisateur:', insertError);
      return NextResponse.json({ error: 'Erreur lors de la création du profil' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, created: true });
  } catch (error) {
    console.error('[OAuth] Erreur callback:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
