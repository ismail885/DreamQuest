import { SignJWT, jwtVerify, JWTPayload } from 'jose';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined. Please set it in your .env.local file.');
  }
  if (secret.length < 32) {
    console.warn('[JWT] Warning: JWT_SECRET is shorter than 32 characters. Recommended for security.');
  }
  return secret;
}

const ALGORITHM = 'HS256';

/**
 * Parse une durée lisible (ex: "7d", "24h", "3600") en secondes.
 */
export function parseDuration(value: string | undefined): number {
  if (!value) return 3600;
  const match = value.match(/^(\d+)\s*(s|m|h|d)?$/i);
  if (!match) return 3600;
  const num = parseInt(match[1], 10);
  const unit = (match[2] || 's').toLowerCase();
  switch (unit) {
    case 'd': return num * 86400;
    case 'h': return num * 3600;
    case 'm': return num * 60;
    default: return num;
  }
}

const MAX_AGE_SECONDS = parseDuration(process.env.JWT_EXPIRES_IN);

export interface UserJWTPayload extends JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
}

export type TokenPayload = Omit<UserJWTPayload, 'iat' | 'exp'>;

/**
 * Signe un token JWT avec les données utilisateur.
 * Expire après 1h (aligné sur Supabase Auth).
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  if (!payload.userId || !payload.email) {
    throw new Error('Invalid token payload: userId and email are required');
  }
  
  const secret = new TextEncoder().encode(getJwtSecret());
  
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret);
  
  return token;
}

/**
 * Vérifie et décode un token JWT.
 * Retourne null si le token est invalide ou expiré.
 */
export async function verifyToken(token: string): Promise<UserJWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(getJwtSecret());
    const { payload } = await jwtVerify(token, secret);
    return payload as UserJWTPayload;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn('[JWT] Verification failed:', error.message);
    }
    return null;
  }
}

/** Sécurité du cookie : Secure uniquement en production (HTTPS) */
const COOKIE_OPTIONS = `Path=/; HttpOnly${process.env.NODE_ENV === 'production' ? '; Secure' : ''}; SameSite=Strict`;

/**
 * Crée le cookie d'auth HttpOnly avec le token JWT.
 */
export function createAuthCookie(token: string): string {
  return `auth_token=${token}; ${COOKIE_OPTIONS}; Max-Age=${MAX_AGE_SECONDS}`;
}

/**
 * Supprime le cookie d'auth (Max-Age=0).
 */
export function clearAuthCookie(): string {
  return `auth_token=; ${COOKIE_OPTIONS}; Max-Age=0`;
}

/**
 * Parse un cookie header en objet clé/valeur.
 * Gère les valeurs contenant '=' (ex: base64 tokens).
 */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, cookie) => {
    const [key, ...valueParts] = cookie.trim().split('=');
    if (key) {
      acc[key] = valueParts.join('=');
    }
    return acc;
  }, {});
}

/**
 * Extrait le token JWT du cookie header.
 */
export function getTokenFromCookies(cookieHeader: string | null): string | null {
  return parseCookies(cookieHeader)['auth_token'] || null;
}

// Backup des anciennes signatures pour compatibilité
/** @deprecated Utiliser signToken */
export const createToken = signToken;


