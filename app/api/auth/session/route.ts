import { NextRequest, NextResponse } from 'next/server';
import { signToken, createAuthCookie, clearAuthCookie } from '@/lib/jwt';
import { createAdminClient } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = body?.accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. Vérifie le token Supabase côté serveur (signature + expiration)
    const { data: authData, error: authError } = await admin.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // 2. Relit l'utilisateur réel en BDD — le rôle vient de la base, jamais du client
    const { data: dbUser, error: dbError } = await admin
      .from('utilisateur')
      .select('id, email, nom_utilisateur, role')
      .eq('auth_id', authData.user.id)
      .maybeSingle();
    if (dbError || !dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Signe le JWT avec des valeurs serveur non falsifiables
    const token = await signToken({
      userId: String(dbUser.id),
      email: dbUser.email,
      username: dbUser.nom_utilisateur,
      role: dbUser.role,
    });

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { 'Set-Cookie': createAuthCookie(token) } }
    );
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { 'Set-Cookie': clearAuthCookie() } }
  );
}

export const runtime = 'nodejs';
