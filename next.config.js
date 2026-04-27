/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  serverRuntimeConfig: {
    // Will only be available on the server side
    CODEX_CLIENT_ID: process.env.CODEX_CLIENT_ID,
    CODEX_CLIENT_SECRET: process.env.CODEX_CLIENT_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    APP_NAME: 'OmniRoute Web Chat',
  },
};

module.exports = nextConfig;
