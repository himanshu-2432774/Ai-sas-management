# AI SaaS Management frontend

This React/Vite application connects to the Express API in `../server`. The root [README](../README.md) documents backend setup, environment variables, API integrations, known limitations, and the frontend implementation steps.

## Local development

```powershell
npm install
npm run dev
```

The Vite server runs at `http://127.0.0.1:5173` and proxies `/api` to `http://127.0.0.1:5001` by default. Copy `.env.example` to `.env` only if you need to override the public API base URL or backend origin.

## Checks

```powershell
npm run lint
npm run build
```
