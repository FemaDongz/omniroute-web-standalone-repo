/**
 * GET /api/oauth/codex/start
 * Memulai OAuth flow untuk Codex
 * Returns auth URL dan setup untuk callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePKCE, generateCodexAuthUrl, getCodexRedirectUri } from '@/lib/oauth/utils';
import { setOAuthCallbackState } from '@/lib/oauth/callbackStateManager';

export async function GET(req: NextRequest) {
  try {
    const { codeVerifier, codeChallenge } = generatePKCE();
    const state = Math.random().toString(36).substring(7);
    const redirectUri = getCodexRedirectUri(req);
    const clientId = process.env.CODEX_CLIENT_ID;

    if (
      process.env.NODE_ENV === 'production' &&
      !process.env.CODEX_OAUTH_REDIRECT_URI &&
      !process.env.NEXT_PUBLIC_APP_URL
    ) {
      console.warn(
        '[ArcvourHUB][CodexOAuth][WARN] Missing CODEX_OAUTH_REDIRECT_URI or NEXT_PUBLIC_APP_URL in production; redirect_uri will fall back to the request origin.'
      );
    }

    if (!clientId) {
      console.error('[ArcvourHUB][CodexOAuth][ERROR] Missing CODEX_CLIENT_ID');
      return NextResponse.json(
        {
          success: false,
          error: 'Missing CODEX_CLIENT_ID environment variable.',
        },
        { status: 500 }
      );
    }

    const authUrl = generateCodexAuthUrl(
      clientId,
      redirectUri,
      codeChallenge,
      state
    );

    const response = NextResponse.json({
      success: true,
      authUrl,
      state,
      redirectUri,
    });

    // Persist PKCE data in short-lived cookies for callback verification.
    setOAuthCallbackState(response, state, codeVerifier);

    return response;
  } catch (error) {
    console.error('OAuth start error:', error);
    return NextResponse.json(
      { error: 'Failed to start OAuth' },
      { status: 500 }
    );
  }
}
