/**
 * OAuth Utilities
 * Helper functions untuk OAuth flow
 */

import crypto from 'crypto';

/**
 * Generate PKCE code challenge dan verifier
 */
export function generatePKCE() {
  const codeVerifier = crypto
    .randomBytes(32)
    .toString('base64url')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return { codeVerifier, codeChallenge };
}

/**
 * Generate authorization URL untuk Codex OAuth
 */
export function generateCodexAuthUrl(
  clientId: string,
  redirectUri: string,
  codeChallenge: string,
  state?: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email offline_access',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    prompt: 'consent',
  });

  if (state) {
    params.append('state', state);
  }

  return `https://auth.openai.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code untuk access token (Codex)
 */
export async function exchangeCodexToken(
  code: string,
  redirectUri: string,
  codeVerifier: string,
  clientId: string,
  clientSecret?: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });

  if (clientSecret) {
    body.append('client_secret', clientSecret);
  }

  const response = await fetch('https://auth.openai.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OAuth token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Get user info dari Codex menggunakan access token
 */
export async function getCodexUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  name?: string;
}> {
  const response = await fetch('https://api.openai.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`);
  }

  return response.json();
}
