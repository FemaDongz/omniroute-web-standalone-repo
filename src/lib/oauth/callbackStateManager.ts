import type { NextRequest, NextResponse } from 'next/server';

const STATE_COOKIE_NAME = 'codex_oauth_state';
const VERIFIER_COOKIE_NAME = 'codex_oauth_verifier';
const DEFAULT_STATE_MAX_AGE = 10 * 60;

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  maxAge: number;
  path: string;
};

function createCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  };
}

export function setOAuthCallbackState(
  response: NextResponse,
  state: string,
  codeVerifier: string,
  maxAge = DEFAULT_STATE_MAX_AGE
) {
  response.cookies.set(STATE_COOKIE_NAME, state, createCookieOptions(maxAge));
  response.cookies.set(VERIFIER_COOKIE_NAME, codeVerifier, createCookieOptions(maxAge));
}

export function clearOAuthCallbackState(response: NextResponse) {
  response.cookies.set(STATE_COOKIE_NAME, '', createCookieOptions(0));
  response.cookies.set(VERIFIER_COOKIE_NAME, '', createCookieOptions(0));
}

export function getOAuthCallbackState(req: NextRequest) {
  return {
    state: req.cookies.get(STATE_COOKIE_NAME)?.value ?? null,
    codeVerifier: req.cookies.get(VERIFIER_COOKIE_NAME)?.value ?? null,
  };
}

export function isOAuthCallbackStateValid(
  req: NextRequest,
  state: string | null | undefined
) {
  const cookieState = req.cookies.get(STATE_COOKIE_NAME)?.value ?? null;
  const codeVerifier = req.cookies.get(VERIFIER_COOKIE_NAME)?.value ?? null;

  return {
    isValid: Boolean(cookieState && codeVerifier && state && cookieState === state),
    cookieState,
    codeVerifier,
  };
}
