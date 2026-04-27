'use client';

import { useEffect, useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { getAvailableProviders } from '@/lib/providers/config';

export default function Home() {
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
  const [oauthUser, setOauthUser] = useState<{ email: string; name?: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if user is logged in via OAuth
    const provider = document.cookie
      .split('; ')
      .find(row => row.startsWith('oauth_provider='))
      ?.split('=')[1];
    
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('oauth_user='))
      ?.split('=')[1];

    if (provider) setOauthProvider(provider);
    if (userCookie) {
      try {
        setOauthUser(JSON.parse(decodeURIComponent(userCookie)));
      } catch (e) {
        console.error('Failed to parse user cookie:', e);
      }
    }

    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="container">
      <div className="grid-2col">
        <div>
          <div className="card">
            <h1>OmniRoute Web Chat</h1>
            <p>Standalone chat application dengan multiple AI providers</p>

            <div className="mt-4">
              <h2>Status Login</h2>
              {oauthProvider && oauthUser ? (
                <div className="status-logged-in">
                  <p>Logged in sebagai: <strong>{oauthUser.email}</strong></p>
                  <p>Provider: <strong>{oauthProvider}</strong></p>
                  <button
                    className="btn-secondary mt-2"
                    onClick={() => {
                      document.cookie = 'oauth_token=; max-age=0';
                      document.cookie = 'oauth_provider=; max-age=0';
                      document.cookie = 'oauth_user=; max-age=0';
                      window.location.reload();
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="status-logged-out">
                  <p>Belum login. Silakan login dengan OAuth untuk Codex.</p>
                  <button
                    className="btn-primary mt-2"
                    onClick={async () => {
                      const res = await fetch('/api/oauth/codex/start');
                      if (!res.ok) {
                        const data = await res.json().catch(() => null);
                        alert(data?.error || 'Failed to start OAuth flow.');
                        return;
                      }
                      const data = await res.json();
                      if (!data?.authUrl) {
                        alert('OAuth flow did not return an authorization URL.');
                        return;
                      }
                      window.location.href = data.authUrl;
                    }}
                  >
                    Login dengan Codex (OAuth)
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h2>Providers</h2>
              <ul style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '10px' }}>
                {getAvailableProviders().map((p) => (
                  <li key={p.id}>
                    <strong>{p.name}</strong> - {p.authType === 'oauth' ? 'OAuth' : 'API Key'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <ChatInterface
            oauthProvider={oauthProvider}
            oauthUser={oauthUser}
          />
        </div>
      </div>

      <style jsx>{`
        .grid-2col {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 20px;
          margin-top: 20px;
        }

        .mt-2 { margin-top: 10px; }
        .mt-4 { margin-top: 20px; }

        h2 {
          font-size: 14px;
          color: #d2def0;
          margin-bottom: 10px;
        }

        .status-logged-in {
          padding: 12px;
          background: rgba(38, 208, 124, 0.1);
          border: 1px solid rgba(38, 208, 124, 0.3);
          border-radius: 8px;
        }

        .status-logged-out {
          padding: 12px;
          background: rgba(239, 76, 76, 0.1);
          border: 1px solid rgba(239, 76, 76, 0.3);
          border-radius: 8px;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          padding: 6px 0;
          border-bottom: 1px solid var(--border);
        }

        li:last-child {
          border-bottom: none;
        }

        @media (max-width: 1024px) {
          .grid-2col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
