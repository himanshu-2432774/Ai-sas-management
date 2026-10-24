# AI SaaS Management

A full-stack college/demo project for account access and visibility into subscription credits and usage. The React frontend uses the existing Express API for authentication, account data, usage, and demo AI generation.

**AI Generator is in Demo/Mock Mode.** Real AI API integration is not configured; generated text is a local testing response.

## Implemented features

### Frontend

- Responsive sign-in and account-registration pages.
- Email-verification landing page and resend control for unverified accounts.
- JWT-backed protected routes, user dashboard, profile editing, and logout.
- Account plan, credits, subscription status, verification status, usage totals, and recent usage from backend responses.
- Authenticated AI Generator page with prompt validation, response display, credit refresh, and copy action.
- Admin-only overview with real admin statistics and the first page of users from the backend's paginated endpoint.
- Loading, validation, empty, and API error states.

### Backend

- Express API with MongoDB/Mongoose persistence and Redis integration.
- JWT authentication, user registration, login, current-user and profile endpoints.
- Required email verification for login, with SMTP delivery and expiring single-use verification links.
- User profile editing, plan and credit fields, usage history and usage statistics.
- Admin-protected statistics and user listing.
- AI generation endpoints, health endpoint, and Swagger UI at `/api-docs`.

The backend has a subscription plan field and returns the signed-in user's current plan and credits. There is no plan catalogue or subscription-purchase endpoint in the inspected API, so the frontend does not present plan selection or upgrades. New accounts must verify their email before login; verification links are sent through the configured SMTP provider.

## Technology

- **Frontend:** React, Vite, Tailwind CSS v4, React Router, Axios, Lucide.
- **Backend:** Node.js, Express, MongoDB/Mongoose, Redis, JWT.

## Repository structure

```text
.
├── client/                 # React + Vite frontend
├── server/                 # Express API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── scripts/
└── README.md
```

## Prerequisites

- Node.js 20.19+ (Node.js 24 is also supported by the current Vite release).
- npm.
- MongoDB and Redis for the backend.
- Backend environment configuration in `server/.env`.

## Deployment preparation

This repository contains two deployable applications: the React/Vite frontend in `client/` and the Node.js/Express API in `server/`. Both must be deployed, along with persistent MongoDB and Redis services. No hosting provider is selected or configured here.

Choose one of these origin layouts before deploying:

1. **Separate frontend and API origins:** deploy the Vite build as a static SPA and the Express server as a Node service. Set the frontend build variable `VITE_API_BASE_URL` to the complete public API base URL ending in `/api` (for example, `https://api.example.com/api`). Set backend `FRONTEND_URL` to the exact public frontend origin (for example, `https://app.example.com`) for both CORS and email links. Configure the static host to rewrite SPA paths such as `/verify-email` to `index.html`.
2. **Same public origin with an API reverse proxy:** serve the frontend and route `/api` to Express at the same public origin. Set `VITE_API_BASE_URL=/api` and set `FRONTEND_URL` to that public origin. The reverse proxy must forward API requests to the backend; the static host must still provide SPA fallback for `/verify-email`.

These URLs have different responsibilities: `VITE_API_BASE_URL` is public and compiled into the frontend at build time; `VITE_BACKEND_ORIGIN` configures only the local Vite development proxy; `FRONTEND_URL` is a server-only environment variable used by Express CORS and by the email-link builder; `BACKEND_URL` is an optional server-only public API URL used for links such as Swagger. `PORT` is supplied by many hosting platforms and defaults to `5000` if absent. Never put credentials or other secrets in variables prefixed with `VITE_`, in frontend source, or in the built frontend bundle.

### Production environment settings

Configure these in the appropriate deployment environment or secret store. Example hostnames are placeholders, not recommendations for a provider.

**Express backend**

| Variable | Production setting |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | The port supplied by the backend host |
| `FRONTEND_URL` | Exact public frontend origin, scheme and host only; no `/verify-email` path |
| `BACKEND_URL` | Public backend origin, if needed for Swagger/API links |
| `MONGO_URI` | Persistent production MongoDB connection string; store as a backend secret |
| `DB_NAME` | Optional database name; defaults to `ai_saas` |
| `JWT_SECRET` | Long, randomly generated production secret stored only in backend secrets |
| `REDIS_URL` | Reachable production Redis connection URL; store as a backend secret |
| `EMAIL_USER` | SMTP account identity, held only by backend |
| `EMAIL_PASSWORD` | SMTP password/app password, held only by backend secret storage |
| `SMTP_HOST` | SMTP provider hostname |
| `SMTP_PORT` | Provider port; commonly `587` for STARTTLS or `465` for implicit TLS |
| `SMTP_SECURE` | `false` for STARTTLS on 587; `true` for implicit TLS on 465 |
| `EMAIL_FROM` | Optional sender allowed by the SMTP provider; defaults to `EMAIL_USER` |

**React/Vite frontend build**

| Variable | Production setting |
|---|---|
| `VITE_API_BASE_URL` | Public backend origin plus `/api` for separate origins, or `/api` behind a same-origin reverse proxy |

`VITE_BACKEND_ORIGIN` is only for local development and does not replace the production API URL. Frontend environment values are exposed to browsers by design, so only the public API URL belongs there. Build the frontend after setting `VITE_API_BASE_URL`; changing a hosting environment variable after building does not rewrite an already-built bundle.

The backend allows browser requests only from the exact `FRONTEND_URL` origin. With separate origins, use HTTPS on both and include the frontend scheme and hostname (and a non-default port if applicable); do not add a route path. Verification email URLs are built from `FRONTEND_URL` at send time, so set it to the deployed frontend origin before enabling registration. The API verifies through `GET /api/auth/verify-email/:token`; no token or SMTP credential belongs in frontend configuration.

Use a persistent MongoDB deployment and permit network access from the backend host. Production startup fails instead of silently switching to in-memory MongoDB if the configured database is unavailable. Redis is also expected by backend environment validation and should be reachable from the backend service.

Email delivery uses the SMTP settings above. Configure the selected provider's SMTP host, port, TLS mode, credentials, and permitted sender; Gmail commonly requires an app password for accounts with 2-Step Verification. Some providers require sender or domain verification. Verify sender/domain requirements with the provider you select. Never commit `.env` files or enter SMTP credentials in frontend-host settings.

## Local setup

### Backend

1. Copy `server/.env.example` to `server/.env`.
2. Set local MongoDB/Redis connection details and a private JWT secret in `server/.env`.
3. Start the API:

```powershell
cd server
npm install
npm run dev
```

The backend uses `PORT` from `server/.env` and defaults to port `5000` when it is unset. The checked-in example uses `5001`. Check `http://127.0.0.1:5001/api/health` for the local health endpoint.

The backend requires `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, and `REDIS_URL`. `PORT` is optional and defaults to `5000`. Email verification delivery requires `EMAIL_USER` and `EMAIL_PASSWORD` plus the SMTP host/port settings below. If email delivery is not configured or fails, registration still creates the unverified account and explicitly reports that no email was sent; the user can resend after server mail settings are corrected.

Backend environment variables:

| Variable | Safe local example |
|---|---|
| `MONGO_URI` | `mongodb://127.0.0.1:27017/ai_saas` |
| `JWT_SECRET` | `replace-with-a-long-random-secret` |
| `FRONTEND_URL` | `http://127.0.0.1:5173` |
| `REDIS_URL` | `redis://127.0.0.1:6379` |
| `PORT` | `5001` |

Optional variables: `DB_NAME` (`ai_saas`), `BACKEND_URL` (`http://127.0.0.1:5001`), `OPENAI_API_KEY`, `EMAIL_USER`, `EMAIL_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, and `EMAIL_FROM`. For Gmail SMTP, use an account-specific app password rather than your normal sign-in password; other providers can use their SMTP host and credentials. Put provider values only in `server/.env`. Never put mail credentials in `client/.env`. `.env` files are ignored by Git; `.env.example` files contain safe examples/placeholders only.

### Frontend

```powershell
cd client
npm install
npm run dev
```

The Vite development server is configured for `http://127.0.0.1:5173`. Its `/api` proxy forwards requests to `VITE_BACKEND_ORIGIN`, defaulting to `http://127.0.0.1:5001`. The browser-side Axios base URL defaults to `/api`; set `VITE_API_BASE_URL` only when using a different API base URL. These are public frontend settings, not secrets.

Frontend environment example in `client/.env.example`:

```dotenv
VITE_API_BASE_URL=/api
VITE_BACKEND_ORIGIN=http://127.0.0.1:5001
```

### How authentication and API requests work

Axios sends requests to the configured API base and attaches the JWT as `Authorization: Bearer <token>`. The login screen reads the token from the backend's `data.token` response, then requests `/api/auth/me` to load the actual user and role. The token is stored in browser local storage and cleared when the backend returns HTTP 401 or the user signs out.

In development, the browser contacts the same-origin Vite `/api` proxy, avoiding direct browser-to-backend CORS calls. For a separately hosted frontend, configure backend `FRONTEND_URL` to the exact frontend origin and set `VITE_API_BASE_URL` to the backend API base URL ending in `/api`.

The current API only provides a bearer token, so the frontend stores it in browser local storage; the backend does not currently provide an HttpOnly cookie session or token-refresh endpoint.

## Frontend pages and integrations

| Page | Backend integration |
|---|---|
| `/login` | `POST /api/auth/login`, `GET /api/auth/me` |
| `/register` | `POST /api/auth/register` |
| `/verify-email` | `GET /api/auth/verify-email/:token` |
| Login resend action | `POST /api/auth/resend-verification` |
| `/app` | `GET /api/user/profile`, `GET /api/usage/stats`, `GET /api/usage` |
| `/app/generator` | `POST /api/ai/generate`, then `GET /api/auth/me` to refresh account credits |
| `/app/profile` | `GET /api/user/profile`, `PUT /api/user/profile` |
| `/app/admin` (admin role only) | `GET /api/admin/stats`, `GET /api/admin/users` |

### AI Generator (Demo/Mock Mode)

Sign in and select **AI Generator** from the workspace sidebar, or open `/app/generator`. Enter a non-empty prompt and select **Generate response**. The frontend sends `{ "prompt": "..." }` to `POST /api/ai/generate` through the shared Axios client with bearer-token authentication. The page displays the returned local testing text, labels it **Demo/Mock Mode**, shows the remaining credit count, refreshes the signed-in user, and provides a copy action. Empty prompts are blocked; authentication, insufficient-credit, expired-subscription, and backend errors are surfaced in the form.

The backend currently constructs a mock response locally and does **not** call a real AI model. Real AI API integration is not configured. A successful generation request records one usage event and deducts one credit. The response's credit balance is shown, and the frontend also refreshes the signed-in account using `GET /api/auth/me`.

Browser checks performed: opened the page from the authenticated sidebar; verified empty prompts are blocked; verified the backend demo response and refreshed balance; and exercised loading and API failure states. Successful requests used for verification consumed credits.

### Email verification

Registration creates an unverified account and sends a verification link to the submitted address when SMTP is configured. The link opens the frontend `/verify-email` page, which calls the existing `GET /api/auth/verify-email/:token` endpoint. The page shows a clear success or invalid/expired-link message. Tokens are generated with a cryptographically secure random source, stored only as SHA-256 hashes, expire after 15 minutes, and are invalidated after one successful use. Token fields are excluded from normal user queries. Resend is limited to three requests per client IP per 15 minutes. Login continues to reject unverified accounts.

Configure `EMAIL_USER`, `EMAIL_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, and optionally `EMAIL_FROM` in `server/.env`. `SMTP_HOST` defaults to Gmail's SMTP host, `SMTP_PORT` to 587, and TLS is enabled automatically for port 465 unless `SMTP_SECURE` is explicitly set. For Gmail, create an app password and use it as `EMAIL_PASSWORD`; for another provider, use its SMTP host, port, TLS mode, and SMTP credentials. Set `FRONTEND_URL` to the frontend origin so email links point to the correct app. With mail credentials missing or provider delivery failing, the API does not claim delivery; the signup page explains the problem and offers resend. Email setup is a server-only configuration; never put credentials in `client/.env`.

Signup and resend failures are logged with a sanitized category (for example, SMTP authentication rejected, sender rejected, or connection/TLS failed) and, when supplied by SMTP, the numeric response code. Provider response text, credentials, recipient addresses, and verification links are not logged. Gmail SMTP requires an app password when the account's security policy requires one (typically with 2-Step Verification); use a sender address that Gmail permits for that authenticated account. Gmail consumer accounts do not require domain verification, while custom SMTP providers may require a verified sender or domain.

For local verification without sending real mail, the backend integration tests use a temporary local SMTP capture server and in-memory MongoDB. Run `npm --prefix .\\server run test:auth`.

Usage administration and destructive account-management actions are not implemented in the frontend.

### Dashboard and admin verification status

The user dashboard and admin overview are implemented and connected to the API routes listed above. The dashboard uses authenticated profile and usage endpoints; the admin route and navigation are restricted to authenticated users whose backend profile has the `admin` role. Admin statistics and the initial users page load independently and display API errors or empty states when unavailable.

The signed-in dashboard loaded the account and usage data during verification. Profile editing and admin data flows have **not been end-to-end verified**. No account was created and no credentials or tokens were accessed.

The AI Generator's signed-in flow was verified in the existing local browser session: a prompt was accepted, the backend response was displayed, and the returned credit balance refreshed. The successful request consumed one credit. The backend response is mock/demo output, not live model generation. Email verification flows are covered by the backend integration tests; provider delivery in production still requires valid SMTP configuration.

## Checks

From `client/`:

```powershell
npm run lint
npm run build
```

From `server/`:

```powershell
npm run test:auth
npm run test:smoke
```

The backend smoke test expects the API to be running.

## Frontend Development Steps

1. **React/Vite project creation:** Scaffolded React in the existing empty `client` directory with `npm create vite@latest . -- --template react`.
2. **Tailwind setup:** Installed `tailwindcss` and `@tailwindcss/vite` with `npm install -D tailwindcss @tailwindcss/vite`, added the Vite Tailwind plugin, and imported Tailwind in `src/index.css`.
3. **React Router configuration:** Installed `react-router-dom` with `npm install react-router-dom` and wrapped the app in `BrowserRouter`; configured public, protected, and admin-only routes.
4. **Axios/API base URL setup:** Installed `axios`, created a shared Axios client using `VITE_API_BASE_URL` (default `/api`), attached bearer tokens centrally, and configured the Vite `/api` proxy to the backend origin.
5. **Authentication and protected routes:** Added login and registration pages, read the actual `data.token` login response, fetched `/auth/me`, and gated user/admin pages by authenticated role.
6. **Dashboard components and API integration:** Added account/usage cards, recent activity, editable profile fields, and an admin overview using the existing profile, usage, and admin endpoints.
7. **Responsive styling:** Built a responsive sidebar, mobile navigation, accessible labeled forms, status/error/empty states, and a Tailwind-based design system with reduced-motion support.
8. **Build and verification:** Ran `npm --prefix .\client install`, `npm --prefix .\client run lint`, and `npm --prefix .\client run build`. Started the backend and Vite locally, confirmed the health endpoint returns HTTP 200 through the Vite proxy, ran `npm --prefix .\server run test:smoke`, and opened the login/registration pages in a browser. Also checked the protected-route redirect and narrow-layout horizontal overflow.
9. **AI Generator:** Added the authenticated `/app/generator` route and sidebar link. Connected its prompt form to `POST /api/ai/generate` with the existing Axios bearer-token client, handled API errors, refreshed the current profile after success, and documented that the backend currently returns mock/demo output. Corrected the AI router middleware order so credit lookup populates the user object before subscription validation.
