/* ── Base64 URL ───────────────────────────────────────── */

function base64UrlDecode(str: string): string {
  // Replace URL-safe chars and pad
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/* ── Types ────────────────────────────────────────────── */

export interface JWTHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

export interface JWTPayload {
  [key: string]: unknown;
  iat?: number;
  exp?: number;
  nbf?: number;
  iss?: string;
  sub?: string;
  aud?: string | string[];
}

export interface DecodedToken {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  raw: { header: string; payload: string; signature: string };
}

/* ── Decode ───────────────────────────────────────────── */

export function decodeJWT(token: string): DecodedToken | null {
  const trimmed = token.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(base64UrlDecode(parts[0])) as JWTHeader;
    const payload = JSON.parse(base64UrlDecode(parts[1])) as JWTPayload;
    return {
      header,
      payload,
      signature: parts[2],
      raw: { header: parts[0], payload: parts[1], signature: parts[2] },
    };
  } catch {
    return null;
  }
}

/* ── Encode ───────────────────────────────────────────── */

export async function encodeJWT(
  header: JWTHeader,
  payload: JWTPayload,
  secret: string,
): Promise<string> {
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  let signature: string;

  if (header.alg.startsWith('HS')) {
    // HMAC
    const algo = header.alg === 'HS256' ? 'SHA-256' : header.alg === 'HS384' ? 'SHA-384' : 'SHA-512';
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: algo }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    signature = base64UrlEncode(String.fromCharCode(...new Uint8Array(sig)));
  } else if (header.alg === 'none') {
    signature = '';
  } else {
    // For RS/ES algs, return unsigned — those need key import
    signature = '';
  }

  return `${data}.${signature}`;
}

/* ── Verify ───────────────────────────────────────────── */

export async function verifyJWT(
  token: string,
  secret: string,
): Promise<{ valid: boolean; error?: string }> {
  const trimmed = token.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Invalid JWT format — expected 3 dot-separated parts' };
  }

  const decoded = decodeJWT(trimmed);
  if (!decoded) {
    return { valid: false, error: 'Failed to decode header or payload' };
  }

  const alg = decoded.header.alg ?? 'none';

  if (alg === 'none') {
    return parts[2] === ''
      ? { valid: true }
      : { valid: false, error: 'Token has a signature but alg is "none"' };
  }

  if (!alg.startsWith('HS')) {
    return { valid: false, error: `Only HMAC (HS256/HS384/HS512) verification is supported in-browser. For RS/ES/PS algorithms, use a server-side library.` };
  }

  try {
    const data = `${parts[0]}.${parts[1]}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const algo = alg === 'HS256' ? 'SHA-256' : alg === 'HS384' ? 'SHA-384' : 'SHA-512';

    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: algo }, false, ['verify']);

    const expectedSig = base64UrlDecode(parts[2]);
    const sigBytes = Uint8Array.from(expectedSig, c => c.charCodeAt(0));

    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));
    return { valid, error: valid ? undefined : 'Signature does not match' };
  } catch (e: unknown) {
    return { valid: false, error: `Verification error: ${(e as Error).message}` };
  }
}

/* ── Inspector helpers ────────────────────────────────── */

export function formatTimestamp(unix: number | undefined): string {
  if (!unix) return '—';
  const d = new Date(unix * 1000);
  return `${d.toISOString()} (${relativeTime(d)})`;
}

function relativeTime(d: Date): string {
  const now = Date.now();
  const diff = d.getTime() - now;
  const abs = Math.abs(diff);
  const units: [number, string][] = [
    [31536000000, 'year'], [2592000000, 'month'], [86400000, 'day'],
    [3600000, 'hour'], [60000, 'minute'], [1000, 'second'],
  ];
  for (const [ms, label] of units) {
    if (abs >= ms) {
      const n = Math.round(abs / ms);
      const plural = `${n} ${label}${n !== 1 ? 's' : ''}`;
      return diff > 0 ? `in ${plural}` : `${plural} ago`;
    }
  }
  return 'just now';
}

export function isExpired(payload: JWTPayload): boolean {
  if (!payload.exp) return false;
  return Date.now() > payload.exp * 1000;
}

export function isBeforeNbf(payload: JWTPayload): boolean {
  if (!payload.nbf) return false;
  return Date.now() < payload.nbf * 1000;
}

/* ── Common algorithms ────────────────────────────────── */

export const ALGORITHMS = [
  { value: 'HS256', label: 'HS256 — HMAC with SHA-256' },
  { value: 'HS384', label: 'HS384 — HMAC with SHA-384' },
  { value: 'HS512', label: 'HS512 — HMAC with SHA-512' },
  { value: 'RS256', label: 'RS256 — RSA with SHA-256 (server-side only)' },
  { value: 'RS384', label: 'RS384 — RSA with SHA-384 (server-side only)' },
  { value: 'RS512', label: 'RS512 — RSA with SHA-512 (server-side only)' },
  { value: 'ES256', label: 'ES256 — ECDSA with P-256 (server-side only)' },
  { value: 'ES384', label: 'ES384 — ECDSA with P-384 (server-side only)' },
  { value: 'none', label: 'none — No algorithm (unsecured)' },
];

/* ── Registered claims ────────────────────────────────── */

export const REGISTERED_CLAIMS: { key: string; label: string; description: string }[] = [
  { key: 'iss', label: 'Issuer', description: 'Who issued the token' },
  { key: 'sub', label: 'Subject', description: 'Who the token is about' },
  { key: 'aud', label: 'Audience', description: 'Who the token is for' },
  { key: 'exp', label: 'Expiration', description: 'When the token expires' },
  { key: 'nbf', label: 'Not Before', description: 'When the token becomes valid' },
  { key: 'iat', label: 'Issued At', description: 'When the token was created' },
  { key: 'jti', label: 'JWT ID', description: 'Unique token identifier' },
];
