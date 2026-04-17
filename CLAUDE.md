# Tourney - Volleyball Tournament Manager

## Project Overview

A full-stack volleyball tournament management PWA for organizing indoor, sand, and grass volleyball tournaments. Handles registration, roster management, pool play, elimination brackets, live scoring, and standings.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Database**: Prisma 6 + SQLite (`prisma/dev.db`)
- **Auth**: NextAuth.js v5 (credentials provider, JWT sessions)
- **PWA**: Serwist service worker
- **Fonts**: DM Sans (body) + Bebas Neue (display/scores)

## Quick Start

```bash
pnpm install
npx prisma db push        # Create/sync database
npx tsx scripts/seed.ts   # Create super admin (admin@tourney.local / admin123)
pnpm dev                  # Start dev server at localhost:3000
```

## Project Structure

```
app/                    # Next.js App Router pages and API routes
  api/                  # REST API endpoints
  auth/                 # Login and registration pages
  tournaments/          # Tournament management pages
  profile/              # User profile page
components/
  ui/                   # Reusable UI primitives (Button, Card, Badge, Input, Select, Modal)
  navigation/           # App shell, top nav, bottom nav, tournament tabs
  providers/            # Session and theme context providers
lib/
  auth.ts               # NextAuth configuration
  auth-helpers.ts       # Role-based access control helpers
  prisma.ts             # Prisma client singleton
  scoring.ts            # Pure-function scoring engine
  standings.ts          # Standings calculation
  progression.ts        # Bracket winner advancement
  types.ts              # Shared TypeScript types
  generators/           # Tournament bracket/schedule generators
    single-elimination.ts
    double-elimination.ts
    round-robin.ts
    pool-play.ts
prisma/
  schema.prisma         # Database schema (12 models)
scripts/
  seed.ts               # Super admin seeder
```

## Key Commands

```bash
pnpm dev                        # Dev server (Turbopack)
pnpm build                      # Production build
npx prisma db push              # Sync schema to database
npx prisma generate             # Regenerate Prisma client
npx prisma studio               # Visual database browser
npx tsx scripts/seed.ts          # Seed super admin
```

## Auth Roles

| Role | Scope | Can Do |
|------|-------|--------|
| `superadmin` | Platform-wide | Create/delete tournaments, manage all |
| Tournament Admin | Per-tournament | Manage teams, schedule, scoring |
| `captain` | Per-team | Manage own roster |
| `player` | Per-team | View only |

## Tournament Formats

- **POOL_PLAY**: Snake-seeded pools with round-robin, then elimination bracket
- **SINGLE_ELIMINATION**: Standard bracket with seeded BYEs
- **DOUBLE_ELIMINATION**: Winners + losers bracket + grand finals
- **ROUND_ROBIN**: All teams play each other once

## Scoring Engine

The scoring engine (`lib/scoring.ts`) is pure functions — no DB access. Tournament settings control:
- `setsToWin` (default 2, best of 3)
- `pointsToWin` (default 25)
- `decidingSetPoints` (default 15)
- `winBy` (default 2)
- `pointCap` (optional, no cap by default)

## Theming

Uses CSS variables in `app/globals.css` with light/dark mode via `next-themes`. The "Court Heat" theme uses warm earthy tones with coral (#FF6B35) accent. All components reference `var(--*)` tokens — never hardcoded colors.

## Database

SQLite via Prisma. The database file is `prisma/dev.db` (gitignored). Key models: User, Tournament, Team, Player, Pool, Bracket, Match, Standing, TournamentAdmin. See `prisma/schema.prisma` for the full schema.

## API Auth Guards

- `GET` routes are public (anyone can view schedules, scores, standings)
- `POST/PUT/DELETE` require authentication
- Tournament mutations require `isTournamentAdmin()` check
- Tournament creation/deletion requires `superadmin` role
- Use `lib/auth-helpers.ts` for role checks in API routes

## Conventions

- Use `pnpm` (not npm/yarn)
- Pages use server components for data fetching, client components for interactivity
- API mutations use Next.js API routes (not server actions, except the generate button)
- All UI components support both themes via CSS variables
- Mobile-first: 44px minimum touch targets, bottom nav on mobile, top nav on desktop
