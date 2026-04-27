'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/lib/chat/types';
import { getAvailableProviders } from '@/lib/providers/config';

interface ChatInterfaceProps {
  oauthProvider: string | null;
  oauthUser: { email: string; name?: string } | null;
}

export default function ChatInterface({ oauthProvider, oauthUser }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('codex');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [systemPrompt, setSystemPrompt] = useState('Anda adalah asisten AI yang helpful dan friendly.');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const providers = getAvailableProviders();
  const currentProvider = providers.find(p => p.id === selectedProvider);
  const models = currentProvider?.models || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        if (settings.provider) setSelectedProvider(settings.provider);
        if (settings.model) setSelectedModel(settings.model);
        if (settings.systemPrompt) setSystemPrompt(settings.systemPrompt);
        if (settings.apiKey) setApiKey(settings.apiKey);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (provider?: string, model?: string, system?: string, key?: string) => {
    const settings = {
      provider: provider || selectedProvider,
      model: model || selectedModel,
      systemPrompt: system !== undefined ? system : systemPrompt,
      apiKey: key !== undefined ? key : apiKey,
    };
    localStorage.setItem('chat-settings', JSON.stringify(settings));
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Check authentication
    if (selectedProvider === 'codex' && !oauthProvider) {
      alert('Please login with OAuth for Codex');
      return;
    }

    if (selectedProvider !== 'codex' && !apiKey) {
      alert(`API Key required for ${selectedProvider}`);
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMessages,
          ],
          temperature: 0.7,
          max_tokens: 2000,
          apiKey: selectedProvider === 'codex' ? undefined : apiKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const result = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.choices?.[0]?.message?.content || 'No response',
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${(error as any).message}`,
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat</h2>
        <button
          className="btn-secondary"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? 'Hide' : 'Settings'}
        </button>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="setting-group">
            <label>Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => {
                const provider = e.target.value;
                setSelectedProvider(provider);
                setSelectedModel(providers.find(p => p.id === provider)?.models?.[0] || '');
                saveSettings(provider);
              }}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.authType === 'oauth' ? '(OAuth)' : '(API Key)'}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-group">
            <label>Model</label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                saveSettings(undefined, e.target.value);
              }}
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {selectedProvider !== 'codex' && (
            <div className="setting-group">
              <label>API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  saveSettings(undefined, undefined, undefined, e.target.value);
                }}
                placeholder={`Enter ${selectedProvider} API key`}
              />
            </div>
          )}

          <div className="setting-group">
            <label>System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => {
                setSystemPrompt(e.target.value);
                saveSettings(undefined, undefined, e.target.value);
              }}
            />
          </div>

          {selectedProvider === 'codex' && oauthUser && (
            <div className="info-box">
              Logged in as: <strong>{oauthUser.email}</strong>
            </div>
          )}
        </div>
      )}

      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>Mulai percakapan dengan memilih provider dan model.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.role}`}>
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message-assistant">
            <div className="message-content">
              <span className="typing-indicator">
                <span></span><span></span><span></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          className="btn-primary"
          onClick={handleSendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 78vh;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0));
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
          border-bottom: 1px solid var(--border);
        }

        .chat-header h2 {
          margin: 0;
          font-size: 16px;
        }

        .settings-panel {
          padding: 14px;
          border-bottom: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
          max-height: 300px;
          overflow-y: auto;
        }

        .setting-group {
          margin-bottom: 12px;
        }

        .setting-group:last-child {
          margin-bottom: 0;
        }

        .setting-group label {
          display: block;
          font-size: 12px;
          color: #c8d4e8;
          margin-bottom: 4px;
        }

        .setting-group input,
        .setting-group select,
        .setting-group textarea {
          width: 100%;
        }

        .info-box {
          padding: 8px 12px;
          background: rgba(38, 208, 124, 0.1);
          border: 1px solid rgba(38, 208, 124, 0.3);
          border-radius: 6px;
          font-size: 12px;
          color: var(--muted);
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--muted);
          text-align: center;
        }

        .message {
          display: flex;
          max-width: 80%;
        }

        .message-user {
          justify-content: flex-end;
          align-self: flex-end;
          width: 100%;
        }

        .message-assistant {
          justify-content: flex-start;
          width: 100%;
        }

        .message-content {
          padding: 10px 14px;
          border-radius: 10px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .message-user .message-content {
          background: var(--accent);
          color: #082414;
          margin-left: auto;
          margin-right: 0;
          max-width: 80%;
        }

        .message-assistant .message-content {
          background: var(--card);
          color: var(--text);
          border: 1px solid var(--border);
          max-width: 90%;
        }

        .typing-indicator {
          display: inline-flex;
          gap: 4px;
        }

        .typing-indicator span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent);
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }

        .input-area {
          display: flex;
          gap: 8px;
          padding: 14px;
          border-top: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.1);
        }

        .input-area input {
          flex: 1;
        }

        .input-area button {
          min-width: 80px;
        }

        .input-area button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
