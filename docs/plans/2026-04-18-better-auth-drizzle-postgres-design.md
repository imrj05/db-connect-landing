# Better Auth + Drizzle + PostgreSQL Migration Design

Date: 2026-04-18
Project: `db-connect-landing`

## Goal

Replace all `Supabase` and `Appwrite` usage with:

- `Better Auth` for authentication
- standalone PostgreSQL for persistence
- `Drizzle` for schema, queries, and migrations

This is a fresh-start migration. No user, auth, license, or activation data needs to be migrated from Supabase.

## Product Decisions

- Remove `Supabase` entirely
- Remove `Appwrite` entirely
- Use a separate PostgreSQL database
- Support email/password authentication
- Support Google and GitHub OAuth
- Include email verification
- Include password reset
- Start with an empty database

## Recommended Architecture

Use `Better Auth` as the single auth system and `Drizzle` as the data layer for both auth-backed and app-owned tables.

### Auth

- Define Better Auth in `lib/auth.ts`
- Expose the auth handler at `app/api/auth/[...all]/route.ts`
- Use a dedicated client helper in `lib/auth-client.ts`
- Enable:
  - email/password auth
  - email verification
  - password reset
  - Google OAuth
  - GitHub OAuth

### Database

- Use PostgreSQL through `Drizzle`
- Add:
  - `drizzle.config.ts`
  - `lib/db/index.ts`
  - `lib/db/schema.ts`
  - focused query helpers under `lib/db/queries/*`
- Replace the current setup route and SQL bootstrap logic with Drizzle migrations

### UI and Data Access

- Stop using client-side direct database access
- Replace `supabase.auth.getSession()` checks with Better Auth session checks
- Replace `supabase.from(...)` reads and writes with Drizzle-backed server routes or server helpers
- Preserve the current UI structure where practical, but move sensitive reads and writes to server code

## Data Model

### Better Auth managed tables

Better Auth owns auth tables for:

- users
- sessions
- accounts
- verification tokens
- OAuth-linked identities

### App-owned tables

#### `profiles`

- `userId` primary key referencing the Better Auth user row
- `name`
- `email`
- `createdAt`
- `updatedAt`

#### `licenses`

- `id`
- `userId`
- `licenseKey` unique
- `planId`
- `planName`
- `status`
- `expiresAt`
- `maxDevices`
- `price`
- `signature`
- `createdAt`
- `updatedAt`

#### `activations`

- `id`
- `licenseId`
- `deviceId`
- `deviceName`
- `platform`
- `lastSeen`
- `activatedAt`
- unique constraint on `licenseId + deviceId`

## Request Flow

### Auth routes and screens

- `/login`
  - email/password sign-in
  - Google/GitHub OAuth sign-in
- `/signup`
  - email/password sign-up
  - Google/GitHub OAuth sign-up
- `/verify-email`
  - verification completion/status page
- `/forgot-password`
  - request password reset
- `/reset-password`
  - submit new password with token

### Dashboard and account flows

- Protected routes resolve the current session on the server
- Dashboard queries `profiles`, `licenses`, and `activations` through Drizzle
- Profile updates:
  - update Better Auth user fields where relevant
  - mirror display fields into `profiles`
- Sign-out is handled only through Better Auth

### Payments and licensing

- Razorpay order creation derives the authenticated user from the Better Auth session instead of trusting a client-passed `userId`
- Verify and webhook routes use Drizzle for license writes
- License activation, validation, and deactivation keep current API behavior and CORS behavior, but use Drizzle-backed queries

## Error Handling

- Protected pages redirect unauthenticated users to `/login`
- Verification-required auth errors render explicit UI states
- OAuth callback failures round-trip through readable query errors
- Password reset and email verification pages show explicit success/failure states
- License APIs preserve current validation semantics
- Payment verification and webhook processing remain idempotent

## Implementation Scope

### Remove

- `Supabase` packages and helpers
- `Appwrite` packages and helpers
- `/api/setup`

### Add

- Better Auth server/client integration
- Drizzle schema, queries, and config
- PostgreSQL connection layer
- new auth pages for verification and password reset flows
- updated env and README documentation

### Refactor

- auth pages
- navbar/dashboard auth state handling
- dashboard/profile/billing pages
- subscription routes
- license server helpers and license routes

## Verification Plan

- `npm run lint`
- `next build`
- smoke-test sign up, verification, sign in, sign out
- smoke-test Google/GitHub OAuth callback flow
- smoke-test password reset
- verify dashboard, billing, and profile reads/writes
- verify license activate, validate, and deactivate endpoints
- verify Razorpay order creation and payment verification paths

## Risks

- Existing files already have local modifications, so migration edits must be merged carefully instead of overwritten
- Full auth flows depend on correct provider, email, and callback env configuration
- Better Auth and Drizzle schema setup must stay aligned with the installed package versions
- Fresh-start database means old Supabase-linked assumptions must be fully removed from route handlers and UI
