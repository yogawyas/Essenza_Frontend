// Supabase falls back to plain PKCE when the Hermes runtime lacks Web Crypto.
// Install only what the SDK needs for S256 and reject insecure debug runtimes.
export function ensurePkceCrypto() {
  if (typeof global.crypto?.getRandomValues !== 'function') {
    if (
      __DEV__ &&
      global.RN$Bridgeless !== true &&
      typeof global.nativeCallSyncHook !== 'function'
    ) {
      throw new Error('Secure randomness is unavailable in this runtime.');
    }
    require('react-native-get-random-values');
  }

  if (typeof global.crypto?.getRandomValues !== 'function') {
    throw new Error('Secure randomness is unavailable in this runtime.');
  }

  if (typeof global.TextEncoder === 'undefined') {
    require('fast-text-encoding');
  }
  if (typeof global.btoa === 'undefined') {
    const { fromByteArray } = require('base64-js');
    global.btoa = value =>
      fromByteArray(
        Uint8Array.from(value, character => {
          const byte = character.charCodeAt(0);
          if (byte > 255) {
            throw new TypeError('Base64 encoding requires a binary string.');
          }
          return byte;
        }),
      );
  }
  if (typeof global.crypto.subtle?.digest !== 'function') {
    const { sha256 } = require('@noble/hashes/sha2.js');
    const subtle = global.crypto.subtle || {};
    subtle.digest = async (algorithm, data) => {
      const name = typeof algorithm === 'string' ? algorithm : algorithm?.name;
      if (name?.toUpperCase() !== 'SHA-256') {
        throw new Error('This runtime only supports SHA-256 here.');
      }
      const bytes = ArrayBuffer.isView(data)
        ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
        : new Uint8Array(data);
      return sha256(bytes).buffer;
    };
    if (!global.crypto.subtle) {
      global.crypto.subtle = subtle;
    }
  }
  if (typeof global.TextEncoder !== 'function') {
    throw new Error('Secure text encoding is unavailable in this runtime.');
  }
}
