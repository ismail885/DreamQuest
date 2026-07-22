import { TextEncoder, TextDecoder } from 'util';

globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

process.env.JWT_SECRET = 'test_jwt_secret_for_testing_12345678';

// jsdom n'inclut pas fetch — placeholder minimal
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = function fetch() {
    return Promise.resolve({
      ok: true as const,
      status: 200,
      json: () => Promise.resolve({}),
    }) as unknown as Promise<Response>;
  } as unknown as typeof globalThis.fetch;
}
