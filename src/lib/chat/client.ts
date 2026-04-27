/**
 * Chat Client
 * Client untuk berkomunikasi dengan provider (Codex, NVIDIA, OpenRouter, Ollama)
 */

import { ChatCompletionRequest, ChatCompletionResponse } from './types';

export class ChatClient {
  constructor(
    private baseUrl: string,
    private authHeader: string,
    private authToken: string
  ) {}

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [this.authHeader]: this.authToken,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Chat request failed: ${error}`);
    }

    return response.json();
  }

  async *chatStream(request: ChatCompletionRequest): AsyncGenerator<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [this.authHeader]: this.authToken,
      },
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`Chat stream request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');

    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Skip parsing errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

/**
 * Create chat client berdasarkan provider dan token
 */
export function createChatClient(
  provider: string,
  baseUrl: string,
  token: string
): ChatClient {
  let authHeader = 'Authorization';
  let authToken = token;

  // Different providers have different auth headers
  if (provider === 'codex' || provider === 'openai') {
    authHeader = 'Authorization';
    authToken = `Bearer ${token}`;
  } else if (provider === 'nvidia') {
    authHeader = 'Authorization';
    authToken = `Bearer ${token}`;
  } else if (provider === 'openrouter') {
    authHeader = 'Authorization';
    authToken = `Bearer ${token}`;
  } else if (provider === 'ollama') {
    authHeader = 'Authorization';
    authToken = `Bearer ${token}`;
  }

  return new ChatClient(baseUrl, authHeader, authToken);
}
