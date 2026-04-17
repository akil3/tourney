# Agent Guidelines for Tourney

## Architecture Decisions

### Why SQLite + Prisma (not Supabase/Postgres)
Simple, file-based, zero-config. The app targets small tournaments (under 20 teams). The database is `prisma/dev.db`. If scaling is needed later, swap `provider = "sqlite"` to `"postgresql"` in `prisma/schema.prisma`.

### Why NextAuth v5 beta (not Auth.js stable)
NextAuth v5 beta was the latest at project start. It uses the `@auth/prisma-adapter` and JWT strategy with credentials provider. The `trustHost: true` config is required for local dev.

### Why API routes (not server actions)
All mutations go through `app/api/` routes so they can be called from both the UI and external tools/scripts. The only exception is the "Generate Schedule" button which uses a server action for simplicity.

### Why CSS variables (not Tailwind theme tokens)
The app supports dark/light mode via `next-themes`. CSS variables in `globals.css` change based on the `.dark` class. All components use `var(--*)` references so they auto-adapt. Never hardcode hex colors in components.

## Working with the Codebase

### Adding a new page
1. Create `app/your-route/page.tsx`
2. Use server components for data fetching, client components for interactivity
3. Import UI components from `@/components/ui/*`
4. Use CSS variables for colors: `text-[var(--text-primary)]`, `bg-[var(--bg-surface)]`, etc.

### Adding a new API route
1. Create `app/api/your-route/route.ts`
2. Add auth guard for mutations:
```typescript
import { auth } from "@/lib/auth";
const session = await auth();
if (!session?.user?.id) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
```
3. For tournament-scoped routes, also check `isTournamentAdmin(session.user.id, tournamentId)`

### Modifying the database schema
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` (dev) or create a migration for production
3. Run `npx prisma generate` to update the client

### Adding a new UI component
1. Create in `components/ui/YourComponent.tsx`
2. Use CSS variables for all colors (check `globals.css` for available tokens)
3. Include `min-h-[44px]` or equivalent for touch targets
4. Support the `className` prop for composition

### Adding a tournament format
1. Create `lib/generators/your-format.ts`
2. Export a function matching the `MatchInsert[]` return type from `single-elimination.ts`
3. Add the format to the `switch` in `app/api/tournaments/[id]/generate/route.ts`
4. Add the option to `formatOptions` in `app/tournaments/new/page.tsx`

## Common Patterns

### Data flow for scoring a match
1. Client calls `PUT /api/tournaments/[id]/matches/[matchId]` with `{ sets: [...] }`
2. API route calls `computeMatchState()` from `lib/scoring.ts` (pure function)
3. If match complete: sets `winnerId`, calls `processMatchResult()` from `lib/progression.ts`
4. `processMatchResult()` advances winner to next bracket match, updates pool standings

### Theme variable naming
```
--bg-base       Page background
--bg-surface    Card/elevated surfaces
--bg-muted      Subtle backgrounds, hover states
--text-primary  Main text
--text-secondary Secondary text
--text-muted    De-emphasized text
--accent        Primary action color (coral #FF6B35)
--border        Default border color
--success       Green for completed/qualified
--warning       Yellow/amber for warnings
--destructive   Red for errors/delete
```

## Testing Locally

```bash
# Seed super admin
npx tsx scripts/seed.ts

# Login: admin@tourney.local / admin123

# Create tournament via API
curl -X POST http://localhost:3000/api/tournaments \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","format":"POOL_PLAY","settings":{"poolCount":2}}'

# Add teams
curl -X POST http://localhost:3000/api/tournaments/{ID}/teams \
  -H "Content-Type: application/json" -d '{"name":"Team A"}'

# Generate schedule
curl -X POST http://localhost:3000/api/tournaments/{ID}/generate

# Score a match
curl -X PUT http://localhost:3000/api/tournaments/{ID}/matches/{MATCH_ID} \
  -H "Content-Type: application/json" \
  -d '{"sets":[{"home":25,"away":20},{"home":25,"away":18}]}'
```

## Don'ts

- Don't use `npm` or `yarn` — this project uses `pnpm`
- Don't hardcode colors — always use CSS variables from `globals.css`
- Don't add `Co-Authored-By` lines to commit messages
- Don't skip auth guards on mutation routes
- Don't use `prisma-client` generator (v7) — this project uses `prisma-client-js` (v6)
- Don't add middleware.ts — Next.js 16 deprecated it; auth is handled in routes/layouts
