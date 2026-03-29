import { signToken, verifyToken, createAuthCookie, clearAuthCookie } from '@/lib/jwt'

describe('Intégration - Authentification', () => {
  describe('Flux complet: inscription -> connexion -> vérification', () => {
    it('devrait créer un token et le vérifier', async () => {
      // 1. Création du token lors de l'inscription
      const userPayload = {
        userId: '42',
        email: 'nouveau_utilisateur@test.com',
        username: 'nouveauuser',
        role: 'joueur',
      }

      const token = await signToken(userPayload)
      expect(token).toBeDefined()

      // 2. Vérification du token lors des requêtes suivantes
      const decoded = await verifyToken(token)
      expect(decoded).not.toBeNull()
      expect(decoded?.userId).toBe('42')
      expect(decoded?.email).toBe('nouveau_utilisateur@test.com')
    })

    it('devrait gérer le cycle de vie complet du cookie', () => {
      // 1. Création du cookie lors de la connexion
      const token = 'jwt_token_abc123'
      const authCookie = createAuthCookie(token)

      expect(authCookie).toContain(`auth_token=${token}`)
      expect(authCookie).toContain('HttpOnly')
      expect(authCookie).toContain('Max-Age=604800') // 7 jours

      // 2. Le cookie est envoyé au navigateur...
      // (simulation de l'extraction)
      const extractedToken = authCookie.split('=')[1].split(';')[0]
      expect(extractedToken).toBe(token)

      // 3. Suppression du cookie lors de la déconnexion
      const clearedCookie = clearAuthCookie()
      expect(clearedCookie).toContain('Max-Age=0')
    })

    it('devrait maintenir la session utilisateur entre les pages', async () => {
      // Simulation: utilisateur connecté qui navigue
      const sessionPayload = {
        userId: '100',
        email: 'session@test.com',
        username: 'sessionuser',
        role: 'joueur',
      }

      const token1 = await signToken(sessionPayload)
      const decoded1 = await verifyToken(token1)
      expect(decoded1?.userId).toBe('100')

      // Navigation vers une autre page (même session)
      const token2 = await signToken(sessionPayload)
      const decoded2 = await verifyToken(token2)
      expect(decoded2?.userId).toBe('100')
    })

    it('devrait protéger une route avec le rôle utilisateur', async () => {
      // Utilisateur avec rôle 'joueur'
      const joueurPayload = {
        userId: '1',
        email: 'joueur@test.com',
        username: 'joueur',
        role: 'joueur',
      }

      const joueurToken = await signToken(joueurPayload)
      const joueurDecoded = await verifyToken(joueurToken)

      // Vérification du rôle
      expect(joueurDecoded?.role).toBe('joueur')

      // Simulation: accès à une route protégée
      const hasAccess = joueurDecoded?.role === 'joueur' || joueurDecoded?.role === 'admin'
      expect(hasAccess).toBe(true)
    })

    it('devrait permettre l\'accès admin avec rôle admin', async () => {
      const adminPayload = {
        userId: '99',
        email: 'admin@test.com',
        username: 'admin',
        role: 'admin',
      }

      const adminToken = await signToken(adminPayload)
      const adminDecoded = await verifyToken(adminToken)

      expect(adminDecoded?.role).toBe('admin')
    })
  })

  describe('Gestion des erreurs d\'authentification', () => {
    it('devrait échouer sans token', async () => {
      const decoded = await verifyToken('')
      expect(decoded).toBeNull()
    })

    it('devrait gérer plusieurs utilisateurs simultanés', async () => {
      const users = [
        { userId: '1', email: 'user1@test.com', username: 'user1', role: 'joueur' },
        { userId: '2', email: 'user2@test.com', username: 'user2', role: 'joueur' },
        { userId: '3', email: 'user3@test.com', username: 'user3', role: 'admin' },
      ]

      const tokens = await Promise.all(users.map(u => signToken(u)))
      const decoded = await Promise.all(tokens.map(t => verifyToken(t)))

      expect(decoded[0]?.userId).toBe('1')
      expect(decoded[1]?.userId).toBe('2')
      expect(decoded[2]?.userId).toBe('3')
      expect(decoded[2]?.role).toBe('admin')
    })
  })
})
