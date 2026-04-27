/**
 * Provider Configuration
 * Mendefinisikan konfigurasi untuk semua provider yang didukung
 */

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'oauth' | 'apikey';
  models: string[];
  icon?: string;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  authorizeUrl: string;
  tokenUrl: string;
  callbackPort: number;
}

// Konfigurasi OAuth untuk Codex
export const CODEX_OAUTH_CONFIG: OAuthConfig = {
  clientId: process.env.CODEX_CLIENT_ID || 'app_EMoamEEZ73f0CkXaXp7hrann',
  clientSecret: process.env.CODEX_CLIENT_SECRET,
  authorizeUrl: 'https://auth.openai.com/oauth/authorize',
  tokenUrl: 'https://auth.openai.com/oauth/token',
  callbackPort: parseInt(process.env.CALLBACK_SERVER_PORT || '1455'),
};

// Provider Registry
export const PROVIDERS: Record<string, ProviderConfig> = {
  codex: {
    id: 'codex',
    name: 'Codex (OpenAI)',
    baseUrl: 'https://api.openai.com/v1',
    authType: 'oauth',
    models: [
      'gpt-4-turbo',
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-3.5-turbo',
    ],
  },
  nvidia: {
    id: 'nvidia',
    name: 'NVIDIA',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    authType: 'apikey',
    models: [
      'meta/llama-3.1-405b-instruct',
      'nvidia/llama-3.1-nemotron-70b-instruct',
      'nvidia/llama-3.1-nemotron-8b-instruct',
    ],
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    authType: 'apikey',
    models: [
      'openai/gpt-4o',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-2-70b-chat',
    ],
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
    authType: 'apikey',
    models: [
      'llama2',
      'mistral',
      'neural-chat',
    ],
  },
};

/**
 * Get available providers
 */
export function getAvailableProviders(): ProviderConfig[] {
  return Object.values(PROVIDERS);
}

/**
 * Get provider by ID
 */
export function getProvider(providerId: string): ProviderConfig | null {
  return PROVIDERS[providerId] || null;
}

/**
 * Get OAuth config for provider
 */
export function getOAuthConfig(providerId: string): OAuthConfig | null {
  if (providerId === 'codex') {
    return CODEX_OAUTH_CONFIG;
  }
  return null;
}
