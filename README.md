<p align="center">
  <h1 align="center">Collaborative Essay</h1>
  <p align="center">
    Open-source essays that evolve through pull requests — from humans and AI.
    <br />
    <strong>Next.js 16 &bull; TypeScript &bull; Prisma &bull; PostgreSQL &bull; Vercel AI SDK</strong>
  </p>
</p>

<p align="center">
  <a href="https://github.com/duketopceo/Collaborative-essay/releases/tag/v1.0.0"><img src="https://img.shields.io/badge/release-v1.0.0-blue.svg" alt="Release"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/framework-Next.js%2016-000000.svg" alt="Next.js"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/database-PostgreSQL-4169E1.svg" alt="PostgreSQL"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/ORM-Prisma%207-2D3748.svg" alt="Prisma"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/AI-Vercel%20AI%20SDK-000000.svg" alt="Vercel AI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License"></a>
</p>

---

## Overview

Collaborative Essay brings the pull request workflow to writing. Authors create essays on any topic, then anyone — human or AI — can propose changes via PRs. Review diffs, discuss edits, merge improvements. Knowledge compounds over time.

Think of it as **GitHub for prose**.

---

## Features

| Feature | Description |
|---------|-------------|
| **Essay Management** | Create, edit, and fork essays. Single-file or multi-section structure with full version history. |
| **Pull Request Workflow** | Propose changes, view rich diffs, review, comment, and merge — exactly like code PRs. |
| **AI Integration** | AI suggests improvements, expands sections, refines style, and reviews PRs. Optional AI-generated PRs. |
| **Multi-auth** | Sign in with GitHub, Google, or email/password via NextAuth.js v5. |
| **Rich Editor** | Markdown-based editing with live preview and formatting toolbar. |
| **Version History** | Full change history with rollback to any previous version. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7 |
| **Auth** | NextAuth.js v5 (Auth.js) |
| **AI** | Vercel AI SDK + OpenAI |
| **Styling** | Tailwind CSS |

---

## Project Structure

```
Collaborative-essay/
├── src/
│   ├── app/               # Next.js App Router (pages, API routes, layouts)
│   ├── components/        # UI components (editor, diff viewer, PR interface, AI panel)
│   └── lib/               # Database client, auth config, AI orchestrator, versioning (diff/merge/history)
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Migration history
├── public/                # Static assets
├── docker-compose.yml     # PostgreSQL + app containers
├── package.json
└── tsconfig.json
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (or use Docker)

### Setup

```bash
# Clone and install
git clone https://github.com/duketopceo/Collaborative-essay.git
cd Collaborative-essay
npm install

# Configure environment
cp .env.example .env
# Set DATABASE_URL and optionally AUTH_SECRET, OAuth keys, OPENAI_API_KEY

# Start PostgreSQL
docker compose up -d postgres

# Run migrations and generate client
npx prisma migrate deploy
npm run db:generate

# Start dev server
npm run dev
```

Open `http://localhost:3000`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | NextAuth secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | App URL (e.g. `http://localhost:3000`) |
| `GITHUB_CLIENT_ID` / `SECRET` | No | GitHub OAuth (for GitHub sign-in) |
| `GOOGLE_CLIENT_ID` / `SECRET` | No | Google OAuth (for Google sign-in) |
| `OPENAI_API_KEY` | No | Enables AI-assisted editing and PR suggestions |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema (no migrations) |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |

---

## License

MIT
