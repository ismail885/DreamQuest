import { NextRequest, NextResponse } from 'next/server';
import { signToken, verifyToken, UserJWTPayload, createAuthCookie, clearAuthCookie } from '@/lib/jwt';

type SessionPayload = {
  userId: string;
  email: string;
  username: string;
  role: string;
};

// POST: Create a signed JWT and expose it as an HttpOnly cookie
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

    // signToken expects payload without iat/exp
    const token = await signToken({ userId, email, username, role } as Omit<UserJWTPayload, 'iat' | 'exp'>);
    const cookie = createAuthCookie(token);

    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });
  } catch (e) {
    return new NextResponse(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE: Clear the httpOnly auth cookie
export async function DELETE(_request: NextRequest) {
  const cookie = clearAuthCookie();
  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    },
  });
}

export const runtime = 'nodejs';
