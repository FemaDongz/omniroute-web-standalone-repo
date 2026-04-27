/**
 * GET /api/oauth/codex/start
 * Memulai OAuth flow untuk Codex
 * Returns auth URL dan setup untuk callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePKCE, generateCodexAuthUrl } from '@/lib/oauth/utils';

// Store callback state in memory (in production, use proper session store)
const callbackStates = new Map<
  string,
  {
    codeVerifier: string;
    state: string;
    expiresAt: number;
  }
>();

// Clean up expired states
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of callbackStates.entries()) {
    if (value.expiresAt < now) {
      callbackStates.delete(key);
    }
  }
}, 60000);

export async function GET(req: NextRequest) {
  try {
    const { codeVerifier, codeChallenge } = generatePKCE();
    const state = Math.random().toString(36).substring(7);
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/codex/callback`;

    // Store state for verification during callback
    callbackStates.set(state, {
      codeVerifier,
      state,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    const authUrl = generateCodexAuthUrl(
      process.env.CODEX_CLIENT_ID || 'app_EMoamEEZ73f0CkXaXp7hrann',
      redirectUri,
      codeChallenge,
      state
    );

    return NextResponse.json({
      success: true,
      authUrl,
      state,
      redirectUri,
    });
  } catch (error) {
    console.error('OAuth start error:', error);
    return NextResponse.json(
      { error: 'Failed to start OAuth' },
      { status: 500 }
    );
  }
}

// Export state manager untuk digunakan di route lain
export function getCallbackState(state: string) {
  return callbackStates.get(state);
}

export function removeCallbackState(state: string) {
  callbackStates.delete(state);
}
