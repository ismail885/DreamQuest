import {
  signToken,
  verifyToken,
  getTokenFromCookies,
  createAuthCookie,
  clearAuthCookie,
} from '@/lib/jwt'

describe('JWT Utility Functions', () => {
  // Reset JWT_SECRET for each test
  beforeEach(() => {
    process.env.JWT_SECRET = 'test_jwt_secret_for_testing'
  })

  describe('signToken', () => {
    it('devrait créer un token JWT', async () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'joueur',
      }

      const token = await signToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token).toContain('mocked_token')
    })

    it('devrait créer un token différent pour chaque payload', async () => {
      const payload1 = { userId: '111', email: 'a@test.com', username: 'a', role: 'joueur' }
      const payload2 = { userId: '222', email: 'b@test.com', username: 'b', role: 'admin' }

      const token1 = await signToken(payload1)
      const token2 = await signToken(payload2)

      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyToken', () => {
    it('devrait vérifier un token et retourner le payload', async () => {
      // Create and verify a token
      const payload = { userId: '999', email: 'test@test.com', username: 'test', role: 'joueur' }
      const token = await signToken(payload)
      const decoded = await verifyToken(token)

      expect(decoded).not.toBeNull()
      expect(decoded?.userId).toBe('999')
      expect(decoded?.email).toBe('test@test.com')
    })

    it('devrait retourner null pour un token vide', async () => {
      const decoded = await verifyToken('')
      expect(decoded).toBeNull()
    })
  })

  describe('getTokenFromCookies', () => {
    it('devrait extraire le token du header cookies', () => {
      const cookieHeader = 'auth_token=my_token_value; path=/'
      const token = getTokenFromCookies(cookieHeader)

      expect(token).toBe('my_token_value')
    })

    it('devrait retourner null si pas de header cookies', () => {
      const token = getTokenFromCookies(null)
      expect(token).toBeNull()
    })

    it('devrait retourner null si pas de token auth_token', () => {
      const cookieHeader = 'other_cookie=value; path=/'
      const token = getTokenFromCookies(cookieHeader)

      expect(token).toBeNull()
    })

    it('devrait gérer les cookies avec des espaces', () => {
      const cookieHeader = 'auth_token=token123; path=/; domain=localhost'
      const token = getTokenFromCookies(cookieHeader)

      expect(token).toBe('token123')
    })

    it('devrait gérer plusieurs cookies', () => {
      const cookieHeader = 'cookie1=value1; auth_token=secret_token; cookie2=value2'
      const token = getTokenFromCookies(cookieHeader)

      expect(token).toBe('secret_token')
    })
  })

  describe('createAuthCookie', () => {
    it('devrait créer un cookie avec le token', () => {
      const token = 'my_jwt_token'
      const cookie = createAuthCookie(token)

      expect(cookie).toContain('auth_token=my_jwt_token')
      expect(cookie).toContain('Path=/')
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('SameSite=Strict')
      expect(cookie).toContain('Max-Age=')
    })

    it('devrait avoir une durée de 1 heure (3600 secondes)', () => {
      const token = 'test'
      const cookie = createAuthCookie(token)

      expect(cookie).toContain('Max-Age=3600')
    })
  })

  describe('clearAuthCookie', () => {
    it('devrait créer un cookie de suppression', () => {
      const cookie = clearAuthCookie()

      expect(cookie).toContain('auth_token=')
      expect(cookie).toContain('Path=/')
      expect(cookie).toContain('Max-Age=0')
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('SameSite=Strict')
    })

    it('devrait avoir Max-Age à 0 pour supprimer le cookie', () => {
      const cookie = clearAuthCookie()
      
      expect(cookie).toMatch(/Max-Age=0/)
    })
  })
})
