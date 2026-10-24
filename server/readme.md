# AI SaaS Management Backend

A backend application for managing users, authentication, subscription plans, credits, and AI service usage.

## Features

- User registration and login with JWT authentication
- Protected user profile endpoints
- Role-based access control for admin routes
- Subscription plans and credit management
- User administration with pagination and filtering
- Audit logging for selected admin actions
- Redis caching
- Health-check endpoint
- Request ID and API request logging
- Swagger API documentation

> Update this list if any feature is not implemented or is currently incomplete.

## Tech Stack

- **Runtime:** Node.js
- **Backend:** Express.js
- **Database:** MongoDB with Mongoose
- **Cache:** Redis
- **Authentication:** JWT
- **API documentation:** Swagger / OpenAPI

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the backend root and configure the environment variables required by the project.

Do not commit `.env` or expose database credentials, JWT secrets, or API keys.

### 3. Start the development server

```bash
npm run dev
```

Check the startup message for the actual port being used.

## API Endpoints

| Purpose | Endpoint | Method |
|---|---|---|
| Health check | `/api/health` | GET |
| Register | `/api/auth/register` | POST |
| Login | `/api/auth/login` | POST |
| Current user | `/api/auth/me` | GET |
| Admin user management | `/api/admin/users` | GET |
| API documentation | `/api-docs` | GET |

Confirm each route against the actual router before publishing this table. Authentication and admin routes may require a valid JWT and appropriate role.

## Testing

Run the smoke tests with:

```bash
npm run test:smoke
```

Record the result only after running it successfully. If a test is failing, document that it still needs fixing rather than claiming all tests pass.

## Project Status

The backend has been developed as a learning and portfolio project. Review the remaining TODOs, test results, and deployment configuration before using it in production.
