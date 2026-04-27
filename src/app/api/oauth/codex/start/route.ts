/**
 * GET /api/oauth/codex/start
 * Memulai OAuth flow untuk Codex
 * Returns auth URL dan setup untuk callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePKCE, generateCodexAuthUrl } from '@/lib/oauth/utils';
import { setOAuthCallbackState } from '@/lib/oauth/callbackStateManager';

export async function GET(req: NextRequest) {
  try {
    const { codeVerifier, codeChallenge } = generatePKCE();
    const state = Math.random().toString(36).substring(7);
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/codex/callback`;

    const authUrl = generateCodexAuthUrl(
      process.env.CODEX_CLIENT_ID || 'app_EMoamEEZ73f0CkXaXp7hrann',
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
