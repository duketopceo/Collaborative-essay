# Collaborative Essay

Open-source essays that evolve through pull requests—from humans and AI. Write an article on any topic; others (or AI) can propose changes via PRs. Knowledge compounds over time.

## Features

- **Essay management**: Create, edit, and fork essays. Single-file or multi-section structure. Version history.
- **Pull request workflow**: Propose changes, view diffs, review, and merge—just like GitHub for code.
- **AI integration**: AI can suggest improvements, expand sections, improve style, and review PRs. Optional AI-generated PRs.
- **Auth**: Sign in with GitHub, Google, or email/password.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma 7
- **Auth**: NextAuth.js v5 (Auth.js)
- **AI**: Vercel AI SDK + OpenAI
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (or use Docker)

### Setup

1. Clone and install:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Set `DATABASE_URL` in `.env` (and optionally `AUTH_SECRET`, OAuth keys, `OPENAI_API_KEY`).

4. Start PostgreSQL (e.g. with Docker):

   ```bash
   docker compose up -d postgres
   ```

5. Run migrations:

   ```bash
   npx prisma migrate deploy
   ```

   Or for a fresh DB:

   ```bash
   npx prisma db push
   ```

6. Generate Prisma client:

   ```bash
   npm run db:generate
   ```

7. Start the dev server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

See `.env.example`. Required for full functionality:

- `DATABASE_URL` – PostgreSQL connection string
- `AUTH_SECRET` – NextAuth secret (e.g. `openssl rand -base64 32`)
- `NEXTAUTH_URL` – App URL (e.g. `http://localhost:3000`)
- GitHub / Google OAuth (optional): `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- AI (optional): `OPENAI_API_KEY`

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run lint` – Run ESLint
- `npm run format` – Format with Prettier
- `npm run db:generate` – Generate Prisma client
- `npm run db:push` – Push schema (no migrations)
- `npm run db:migrate` – Run migrations
- `npm run db:studio` – Open Prisma Studio

## Project Structure

- `src/app` – Next.js App Router (pages, API routes)
- `src/components` – UI (editor, diff, PR, AI)
- `src/lib` – DB, auth, AI orchestrator, versioning (diff/merge/history)
- `prisma` – Schema and migrations

## License

MIT
