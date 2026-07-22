import { TextEncoder, TextDecoder } from 'util';

globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

process.env.JWT_SECRET = 'test_jwt_secret_for_testing_12345678';

// jsdom n'inclut pas fetch — placeholder pour que jest.spyOn puisse l'attraper
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = (() => Promise.resolve({} as Response)) as unknown as typeof globalThis.fetch;
}
