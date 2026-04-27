/**
 * POST /api/chat/completions
 * Universal chat completion endpoint
 * Routes ke provider yang dipilih dengan auth yang sesuai
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProvider } from '@/lib/providers/config';
import { createChatClient } from '@/lib/chat/client';
import { ChatCompletionRequest } from '@/lib/chat/types';

export async function POST(req: NextRequest) {
  try {
    const body: ChatCompletionRequest & { provider: string; apiKey?: string } = await req.json();

    const { provider, apiKey, ...chatRequest } = body;

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    const providerConfig = getProvider(provider);
    if (!providerConfig) {
      return NextResponse.json(
        { error: `Unknown provider: ${provider}` },
        { status: 400 }
      );
    }

    let authToken = apiKey;

    // Jika provider adalah Codex dan tidak ada API key, gunakan OAuth token
    if (provider === 'codex' && !apiKey) {
      const cookies = req.cookies;
      const oauthToken = cookies.get('oauth_token')?.value;
      const oauthProvider = cookies.get('oauth_provider')?.value;

      if (!oauthToken || oauthProvider !== 'codex') {
        return NextResponse.json(
          { error: 'No authentication token found. Please login with OAuth.' },
          { status: 401 }
        );
      }

      authToken = oauthToken;
    } else if (!authToken) {
      return NextResponse.json(
        { error: `API key required for provider: ${provider}` },
        { status: 400 }
      );
    }

    // Create chat client
    const chatClient = createChatClient(provider, providerConfig.baseUrl, authToken);

    // Validate model
    if (!providerConfig.models.includes(chatRequest.model)) {
      return NextResponse.json(
        {
          error: `Invalid model for ${provider}. Available: ${providerConfig.models.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Stream response jika diminta
    if (chatRequest.stream) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of chatClient.chatStream(chatRequest)) {
              controller.enqueue(`data: {"content":"${chunk.replace(/"/g, '\\"')}"}\n\n`);
            }
            controller.enqueue('data: [DONE]\n\n');
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const result = await chatClient.chat(chatRequest);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: (error as any).message || 'Chat request failed' },
      { status: 500 }
    );
  }
}
