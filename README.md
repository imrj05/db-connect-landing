# DBConnect Landing
This project now uses:
- `Better Auth` for authentication
- `Drizzle ORM` for database access and migrations
- standalone `PostgreSQL`
- `Razorpay` for paid license checkout
## Development
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

Production startup now runs checked-in SQL migrations automatically before the app starts. It also runs the seed script once when the database is still empty. Set `AUTO_DB_MIGRATE="false"` or `AUTO_DB_SEED="false"` if you need to skip either behavior for a specific environment.
## Environment
Set these variables before running auth, migrations, or checkout flows:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbconnect"
DATABASE_SSL="false"
BETTER_AUTH_SECRET="replace-this-with-a-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="/api/auth"
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED="false"
NEXT_PUBLIC_GITHUB_AUTH_ENABLED="false"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="DBConnect <no-reply@example.com>"
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
NEXT_PUBLIC_APTABASE_APP_KEY="A-...-SH"
NEXT_PUBLIC_APTABASE_HOST="https://aptabase.your-domain.com"
ADMIN_EMAILS="admin@example.com"
LICENSE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
LICENSE_PRIVATE_KEY_ALGORITHM="RSASSA-PKCS1-v1_5"
NEXT_PUBLIC_LICENSE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
LICENSE_PUBLIC_KEY_ALGORITHM="RSASSA-PKCS1-v1_5"
LICENSE_API_ALLOWED_ORIGINS="https://db-connect.rajeshwarkashyap.in,http://localhost:1420"
```
For Docker Compose and Dokploy deployments, PEM-based key variables must stay on a single logical `.env` line.
Do not paste raw multiline PEM blocks into the Dokploy environment editor.
Use quoted values with literal `\n` escapes instead:
```bash
LICENSE_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEI...\n-----END EC PRIVATE KEY-----"
LICENSE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYI...\n-----END PUBLIC KEY-----"
```
If Dokploy writes the PEM across multiple lines, Docker will fail before the container starts while reading `.env`, often with an error like `unexpected character "/" in variable name`.
That means part of the base64 body was parsed as a new variable name instead of the value for the original key.
For local OAuth callbacks, register these redirect URIs with each provider:
```text
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/github
```
This repo uses `localhost` in `.env` for local development. `docker-compose.yml` keeps the app on internal container port `3000` so Dokploy or another reverse proxy can route traffic without binding a fixed host port, and it publishes Postgres on `127.0.0.1:5432` for host-run tools while overriding `DATABASE_URL` to use the Compose service host `db` for the app container.
The Aptabase integration uses the React SDK with a self-hosted endpoint. It is enabled only in production builds, and the self-hosted app key must use the `SH` region format so `NEXT_PUBLIC_APTABASE_HOST` is honored.
If SMTP is not configured, auth emails are logged to the server console instead of being sent.
`ADMIN_EMAILS` is a comma-separated allowlist for the new admin panel, for example `admin@example.com,owner@example.com`.
## Database Setup
1. Generate the Better Auth Drizzle schema:
```bash
npm run auth:generate
```
2. Generate Drizzle migrations:
```bash
npm run db:generate
```
3. Apply migrations:
```bash
npm run db:migrate
```

For container and production starts, `npm start` now waits for the database, applies any unapplied checked-in migrations from `drizzle/*.sql`, runs the seed script when the database has no users/profiles/licenses yet, and then launches Next.js.
4. Bootstrap the local database with one command:
```bash
npm run db:setup
```
This command starts Docker Postgres, waits for readiness, applies Drizzle migrations, and seeds a demo login plus sample billing data.
Demo credentials:
```text
email: demo@dbconnect.local
password: demo12345
```
You can override the seeded credentials when needed:
```bash
DB_SETUP_DEMO_EMAIL="demo@example.com" DB_SETUP_DEMO_PASSWORD="change-me-123" npm run db:setup
```
## Auth Flows
Implemented flows:
- email/password sign up
- email/password sign in
- Google OAuth
- GitHub OAuth
- email verification
- forgot password
- reset password
- sign out
- profile name update
- password change for credential accounts
## License API
Shared verification utility:
```ts
import { verifyLicense } from "@/lib/license/verify";
const result = await verifyLicense(license);
```
Activation request:
```bash
curl -X POST http://localhost:3000/api/license/activate \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "DBK-XXXX-XXXX-XXXX-XXXX",
    "device_id": "macbook-pro-serial-123",
    "device_name": "Rajeshwar MacBook Pro"
  }'
```
Validation request:
```bash
curl "http://localhost:3000/api/license/validate?key=DBK-XXXX-XXXX-XXXX-XXXX"
```
Deactivation request:
```bash
curl -X POST http://localhost:3000/api/license/deactivate \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "DBK-XXXX-XXXX-XXXX-XXXX",
    "device_id": "macbook-pro-serial-123"
  }'
```
