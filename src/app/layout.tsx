import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OmniRoute Web Chat',
  description: 'Standalone AI Chat with multiple providers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
