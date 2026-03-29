import '@testing-library/jest-dom'
import util from 'util'

// Suppress console.error for expected error scenarios in tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Erreur de vérification du token')
    ) {
      return
    }
    originalConsoleError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
})

// Polyfill TextEncoder/TextDecoder for jsdom
Object.defineProperty(globalThis, 'TextEncoder', {
  value: util.TextEncoder,
})
Object.defineProperty(globalThis, 'TextDecoder', {
  value: util.TextDecoder,
})

// Mock jose library (ESM module)
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation((payload) => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockImplementation(() => {
      // Return a token that encodes the payload
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64')
      return Promise.resolve(`mocked_token_${encoded}`)
    }),
  })),
  jwtVerify: jest.fn().mockImplementation((token) => {
    // Extract payload from mock token
    if (!token || token === 'invalid_token' || token === '' || token.includes('modified')) {
      throw new Error(token.includes('modified') ? 'Token modified' : 'Invalid token')
    }
    
    // Parse the embedded payload from the mock token
    try {
      const encoded = token.replace('mocked_token_', '')
      const payload = JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'))
      
      return Promise.resolve({
        payload: {
          ...payload,
          iat: 1609459200,
          exp: 1609459200 + 7 * 24 * 60 * 60,
        },
      })
    } catch {
      // Default fallback
      return Promise.resolve({
        payload: {
          userId: '123',
          email: 'test@example.com',
          username: 'testuser',
          role: 'joueur',
          iat: 1609459200,
          exp: 1609459200 + 7 * 24 * 60 * 60,
        },
      })
    }
  }),
}))

// Mock Supabase
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: jest.fn(),
    })),
    auth: {
      getSession: jest.fn(),
      signOut: jest.fn(),
    },
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock environment variables
process.env.JWT_SECRET = 'test_jwt_secret_for_testing'
