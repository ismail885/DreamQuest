import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_in_production';

export interface UserJWTPayload extends JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
}

export async function signToken(payload: Omit<UserJWTPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  
  return token;
}

export async function verifyToken(token: string): Promise<UserJWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as UserJWTPayload;
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return null;
  }
}

export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies['auth_token'] || null;
}

export function createAuthCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60;
  return `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;
}

export function clearAuthCookie(): string {
  return 'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
}
