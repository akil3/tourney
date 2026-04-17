# Tourney

A volleyball tournament management PWA for organizing indoor, sand, and grass volleyball competitions. Live scoring, automatic bracket generation, pool play standings, and team registration.

## Features

- **4 Tournament Formats**: Pool Play, Single Elimination, Double Elimination, Round Robin
- **Live Scoring**: Tap-to-score interface with configurable volleyball rules (sets, points, deciding set, win-by, point cap)
- **Auto Brackets**: Seeded bracket generation with BYE handling and winner advancement
- **Pool Standings**: Auto-calculated rankings by wins, set ratio, and point differential
- **Team Management**: Rosters, seeding, pool assignment
- **Auth & Roles**: Super admin, tournament admin, captain, player
- **Dark/Light Mode**: Warm "Court Heat" theme with coral accent
- **PWA**: Installable, works offline for cached pages

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up database
npx prisma db push

# Create super admin account
npx tsx scripts/seed.ts
# => admin@tourney.local / admin123

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in to create your first tournament.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite via Prisma 6 |
| Auth | NextAuth.js v5 |
| Icons | Lucide React |
| PWA | Serwist |
| Fonts | DM Sans + Bebas Neue |

## Tournament Flow

```
Create Tournament → Add Teams → Generate Schedule → Score Matches → View Standings/Bracket
       ↓                ↓              ↓                  ↓                    ↓
   Set format     Add players    Auto-seeds &       +/- point entry     Auto-ranked by
   & scoring      & rosters     creates matches    with set tracking    W/L, sets, points
     rules
```

## Project Structure

```
app/               Pages and API routes
components/        UI components (Button, Card, Badge, etc.) and navigation
lib/               Core logic (scoring, standings, generators, auth)
prisma/            Database schema
scripts/           Seed script
```

See [CLAUDE.md](CLAUDE.md) for detailed developer documentation and [AGENTS.md](AGENTS.md) for agent/contributor guidelines.

## Scoring Rules

All configurable per tournament:

| Setting | Default | Description |
|---------|---------|-------------|
| Sets to Win | 2 | Best of 3 (set to 3 for best of 5) |
| Points per Set | 25 | Standard volleyball |
| Deciding Set | 15 | Last set uses fewer points |
| Win By | 2 | Must win by 2 points |
| Point Cap | None | Optional max score cap |

## API

All `GET` endpoints are public. Mutations require authentication.

```
POST   /api/auth/register                     Register
POST   /api/tournaments                       Create tournament
POST   /api/tournaments/:id/generate          Generate schedule
POST   /api/tournaments/:id/teams             Add team
PUT    /api/tournaments/:id/matches/:matchId  Score match
GET    /api/tournaments/:id/standings         Pool standings
```

## License

Private
