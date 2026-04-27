/**
 * OAuth Callback State Manager
 * Manage state untuk OAuth flow
 */

interface CallbackState {
  codeVerifier: string;
  state: string;
  expiresAt: number;
}

// Store callback state in memory (in production, use proper session store)
const callbackStates = new Map<string, CallbackState>();

// Clean up expired states setiap menit
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of callbackStates.entries()) {
    if (value.expiresAt < now) {
      callbackStates.delete(key);
    }
  }
}, 60000);

/**
 * Store callback state
 */
export function setCallbackState(state: string, data: Omit<CallbackState, 'state'>): void {
  callbackStates.set(state, { ...data, state });
}

/**
 * Get callback state
 */
export function getCallbackState(state: string): CallbackState | undefined {
  return callbackStates.get(state);
}

/**
 * Remove callback state
 */
export function removeCallbackState(state: string): void {
  callbackStates.delete(state);
}
