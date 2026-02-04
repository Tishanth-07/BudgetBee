# Budget Bee

A mobile budgeting app with Node.js backend and React Native Expo frontend.

## Structure

- `budget-bee-backend`: Node.js, Express, PostgreSQL, Prisma.
- `budget-bee-frontend`: React Native, Expo, NativeWind, TanStack Query.

## Setup

### Backend

1. Navigate to `budget-bee-backend`.
2. Install dependencies: `pnpm install`.
3. Setup Environment:
   - Copy `.env.example` to `.env`.
   - Update `DATABASE_URL` with your local PostgreSQL credentials.
4. Initialize Database:
   - `pnpm prisma migrate dev` (or `pnpm prisma db push`).
5. Run server:
   - `pnpm dev`
   - Server runs on http://localhost:3000

### Frontend

1. Navigate to `budget-bee-frontend`.
2. Install dependencies: `pnpm install`.
3. Start Expo:
   - `npx expo start`
   - Use Android Emulator or Expo Go app.
4. Check `lib/api/client.ts` to ensure `API_URL` points to your backend (use `10.0.2.2` for Android emulator).

## Known Issues

- NativeWind v4 setup might require restart of bundler using `npx expo start -c`.
- Prisma generate might need `pnpm dotenv -e .env -- prisma generate` if env vars aren't picked up automatically.
