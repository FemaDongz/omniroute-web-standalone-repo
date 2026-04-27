/**
 * GET /api/oauth/codex/callback
 * OAuth callback handler untuk Codex
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodexToken, getCodexUserInfo, getCodexRedirectUri } from '@/lib/oauth/utils';
import {
  clearOAuthCallbackState,
  isOAuthCallbackStateValid,
} from '@/lib/oauth/callbackStateManager';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const clientId = process.env.CODEX_CLIENT_ID;

    if (error) {
      return NextResponse.redirect(
        `/oauth-error?error=${error}&description=${searchParams.get('error_description')}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect('/oauth-error?error=missing_code_or_state');
    }

    const { isValid, codeVerifier } = isOAuthCallbackStateValid(req, state);
    if (!isValid || !codeVerifier) {
      return NextResponse.redirect('/oauth-error?error=invalid_state');
    }

    const redirectUri = getCodexRedirectUri(req);

    try {
      if (!clientId) {
        console.error('[ArcvourHUB][CodexOAuth][ERROR] Missing CODEX_CLIENT_ID');
        return NextResponse.redirect('/oauth-error?error=missing_codex_client_id');
      }

      // Exchange code for token
      const tokens = await exchangeCodexToken(
        code,
        redirectUri,
        codeVerifier,
        clientId,
        process.env.CODEX_CLIENT_SECRET
      );

      // Get user info
      const userInfo = await getCodexUserInfo(tokens.access_token);

      // Store token in session/cookie
      const response = NextResponse.redirect('/');
      clearOAuthCallbackState(response);
      response.cookies.set('oauth_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokens.expires_in,
      });
      response.cookies.set('oauth_provider', 'codex', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      response.cookies.set('oauth_user', JSON.stringify(userInfo), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return response;
    } catch (tokenError) {
      console.error('Token exchange error:', tokenError);
      return NextResponse.redirect(
        `/oauth-error?error=token_exchange_failed&message=${(tokenError as any).message}`
      );
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect('/oauth-error?error=callback_error');
  }
}
