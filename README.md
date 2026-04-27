# OmniRoute Web - Standalone TypeScript Version

Versi TypeScript standalone dari OmniRoute yang bisa dijalankan di website tanpa Docker.

## Features

✅ **Multiple Providers**: Codex (OAuth), NVIDIA, OpenRouter, Ollama  
✅ **OAuth Support**: Codex with OAuth 2.0 + PKCE flow  
✅ **API Key Auth**: Support untuk NVIDIA, OpenRouter, Ollama  
✅ **Chat Interface**: Clean, modern chat UI dengan streaming support  
✅ **Configuration Management**: Settings disimpan di localStorage  
✅ **TypeScript**: Full TypeScript support untuk type safety  

## Quick Start

### 1. Install Dependencies

```bash
cd web-standalone
npm install
```

### 2. Setup Environment

Copy `.env.example` ke `.env.local` dan isi dengan credentials Anda:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Codex OAuth
CODEX_CLIENT_ID=your_codex_client_id
CODEX_CLIENT_SECRET=your_codex_client_secret (optional)

# Direct API Keys (gunakan salah satu dari providers berikut)
OPENAI_API_KEY=sk-your-key
NVIDIA_API_KEY=your-key
OPENROUTER_API_KEY=your-key

# Ollama (jika installed locally)
OLLAMA_BASE_URL=http://localhost:11434

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 4. Login dengan Codex (OAuth)

1. Click tombol "Login dengan Codex (OAuth)"
2. Akan membuka window OAuth dari OpenAI
3. Approve akses
4. Redirect kembali ke aplikasi dengan token tersimpan

### 5. Start Chatting!

- Pilih provider di settings
- Pilih model
- (Opsional) Masukkan API key untuk non-OAuth providers
- Ketik pesan dan send

## Deployment

### Vercel (Recommended)

```bash
# Push ke GitHub
git push

# Deploy di Vercel
vercel
```

Set environment variables di Vercel dashboard.

### Self-Hosted (Node.js)

```bash
# Build
npm run build

# Start production server
npm start
```

Pastikan PORT 3000 terbuka (atau sesuaikan).

### Docker (Optional)

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY .next ./.next
COPY public ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

## Architecture

```
web-standalone/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── oauth/codex/        # OAuth endpoints
│   │   │   │   ├── start/          # Initiate OAuth flow
│   │   │   │   └── callback/       # OAuth callback handler
│   │   │   └── chat/
│   │   │       └── completions/    # Chat API endpoint
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   └── ChatInterface.tsx       # Main chat component
│   └── lib/
│       ├── providers/config.ts     # Provider configurations
│       ├── oauth/utils.ts          # OAuth utilities
│       └── chat/
│           ├── types.ts            # Type definitions
│           └── client.ts           # Chat client
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## How It Works

### OAuth Flow (Codex)

```
1. User click "Login dengan Codex"
   ↓
2. GET /api/oauth/codex/start
   - Generate PKCE: codeVerifier & codeChallenge
   - Return authUrl + state
   ↓
3. Frontend redirect ke OpenAI OAuth
   - User login & approve
   ↓
4. OpenAI redirect ke /api/oauth/codex/callback?code=...&state=...
   ↓
5. Server exchange code untuk access token
   ↓
6. Save token di secure HTTP-only cookie
   ↓
7. Redirect ke home, user logged in ✓
```

### Chat Flow

```
1. User send message
   ↓
2. POST /api/chat/completions
   {
     provider: "codex",
     model: "gpt-4o",
     messages: [...],
     apiKey: "..." (optional if OAuth)
   }
   ↓
3. Server validate provider & auth
   ↓
4. Forward ke provider API (OpenAI, NVIDIA, etc)
   ↓
5. Stream/return response
   ↓
6. Display di UI
```

## Security Notes

- OAuth tokens disimpan di HTTP-only cookies (tidak accessible dari JS)
- API keys bisa di-cache di localStorage (opsi user, encrypted recommended)
- Sensitive data tidak pernah di-log atau di-expose ke frontend
- PKCE untuk OAuth compliance
- CORS policies untuk API access

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CODEX_CLIENT_ID` | Yes (OAuth) | Codex OAuth app ID |
| `CODEX_CLIENT_SECRET` | No | Codex OAuth secret |
| `OPENAI_API_KEY` | No | Direct OpenAI API key |
| `NVIDIA_API_KEY` | No | NVIDIA API key |
| `OPENROUTER_API_KEY` | No | OpenRouter API key |
| `OLLAMA_BASE_URL` | No | Ollama server URL (default: localhost:11434) |
| `NEXT_PUBLIC_APP_URL` | No | App URL untuk OAuth callback |
| `NODE_ENV` | No | Environment (development/production) |

## Troubleshooting

### OAuth login tidak work

- Check `CODEX_CLIENT_ID` di `.env.local`
- Pastikan `NEXT_PUBLIC_APP_URL` sesuai dengan deployed URL
- Verify OAuth app settings di OpenAI console

### Chat API error 401

- Untuk Codex: Login dengan OAuth dulu
- Untuk lain: Pastikan API key benar di settings

### "No response" atau timeout

- Check provider API status
- Verify network connection
- Pastikan model name benar

### Ollama not working

- Pastikan Ollama running: `ollama serve`
- Verify `OLLAMA_BASE_URL` (default: http://localhost:11434)
- Check model installed: `ollama list`

## Development

```bash
# Run development server dengan hot reload
npm run dev

# Build untuk production
npm run build

# Lint code
npm run lint

# Run production server
npm start
```

## Contributing

Contributions welcome! Fork dan submit pull requests.

## License

MIT

## Support

- Issues: [GitHub Issues](https://github.com/diegosouzapw/OmniRoute)
- Docs: [OmniRoute Docs](https://omniroute.online/docs)

---

**Made with ❤️ for developers who love AI tools**
