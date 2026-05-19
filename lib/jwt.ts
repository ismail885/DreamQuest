import { SignJWT, jwtVerify, JWTPayload } from 'jose';

// ============================================
// Configuration JWT
// ============================================

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined. Please set it in your .env.local file.');
  }
  return secret;
}

const MAX_AGE_SECONDS = 3600; // 1h - aligné sur la session Supabase Auth
const ALGORITHM = 'HS256';

// ============================================
// Types
// ============================================

export interface UserJWTPayload extends JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
}

export type TokenPayload = Omit<UserJWTPayload, 'iat' | 'exp'>;

// ============================================
// Fonctions JWT
// ============================================

/**
 * Signe un token JWT avec les données utilisateur.
 * Expire après 1h (aligné sur Supabase Auth).
 */
export async function signToken(payload: TokenPayload): Promise<string> {
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

// ============================================
// Gestion des cookies HttpOnly
// ============================================

/** Strict�t� du cookie : Secure uniquement en production (HTTPS) */
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
/** @deprecated Utiliser createAuthCookie */
export const createAuthCookies = createAuthCookie;
/** @deprecated Utiliser clearAuthCookie */
export const clearAuthCookies = clearAuthCookie;

