import { TextEncoder, TextDecoder } from 'util';

globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

process.env.JWT_SECRET = 'test_jwt_secret_for_testing';
