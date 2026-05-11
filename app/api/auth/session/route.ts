import { NextRequest, NextResponse } from 'next/server';
import { signToken, createAuthCookies, clearAuthCookies, UserJWTPayload } from '@/lib/jwt';

type SessionPayload = {
  userId: string;
  email: string;
  username: string;
  role: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SessionPayload;
    const { userId, email, username, role } = body || {};

    if (!userId || !email || !username || !role) {
      return new NextResponse(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = await signToken({ userId, email, username, role } as Omit<UserJWTPayload, 'iat' | 'exp'>);
    const { userCookie, roleCookie } = createAuthCookies(token, role);

    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${userCookie}, ${roleCookie}`,
      },
    });
  } catch {
    return new NextResponse(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE() {
  const { user, role } = clearAuthCookies();
  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${user}, ${role}`,
    },
  });
}

export const runtime = 'nodejs';