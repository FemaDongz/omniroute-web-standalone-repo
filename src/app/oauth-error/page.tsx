'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OAuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const description = searchParams.get('description');

  return (
    <main style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '30px',
        maxWidth: '500px',
        textAlign: 'center',
      }}>
        <h1 style={{ color: 'var(--danger)', marginBottom: '10px' }}>OAuth Error</h1>
        
        {error && (
          <p style={{ color: 'var(--muted)', marginBottom: '10px' }}>
            <strong>Error:</strong> {error}
          </p>
        )}
        
        {description && (
          <p style={{ color: 'var(--muted)', marginBottom: '10px' }}>
            <strong>Details:</strong> {description}
          </p>
        )}
        
        {message && (
          <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
            {message}
          </p>
        )}

        <Link href="/" style={{
          display: 'inline-block',
          padding: '10px 20px',
          background: 'var(--accent)',
          color: '#082414',
          textDecoration: 'none',
          borderRadius: '10px',
          fontWeight: '600',
        }}>
          Back to Chat
        </Link>
      </div>
    </main>
  );
}
