# Global SQLite Leaderboard Migration

The current arcade games (Pong, Space Invaders, Snake) record high scores onto the local browser's `localStorage`. The goal is to elevate this into a global database using a lightweight SQLite implementation, ensuring all players can see top global scores across devices and instances.

## Proposed Changes

### Data Layer
- **Install `better-sqlite3`**: The fastest lightweight SQLite driver for Node.js.
- **[NEW] `data/db.js`**: Establish the structural connection. It will create a persistent file `data/adam-scores.db` and initialize the schema `scores(id, game, name, score, date_created)` if it doesn't already exist.

### API Routes
- **[NEW] `app/api/scores/route.js`**: Next.js App Router API.
  - `GET /api/scores?game=...`: Returns the top 10 descending scores for a queried game id.
  - `POST /api/scores`: Receives `{ game, name, score }`, sanitizes input, and saves into the DB via `better-sqlite3`. Then it returns the new standing/rank of the player.

### Frontend Components

#### [MODIFY] `app/games/Leaderboard.js`
- Migrate from synchronous `localStorage.getItem` pattern to a `useEffect` fetching scores from `/api/scores?game=${gameId}` continuously or on mount.
- Transition `submitScore` into an asynchronous server call (`fetch POST /api/scores`).

#### [MODIFY] `components/TerminalEmulator.js`
- Update the `leaderboard` command case inside the React component. Since `processCommand` fetches synchronously currently, we will patch this block to:
  1. `await fetch('/api/scores')` iteratively for each game string.
  2. Parse the global return parameters to render top scores correctly inside `adam-sh`.

## Open Questions

> [!IMPORTANT]  
> Are there any specific payload limit or constraints you'd want on name string length to avoid database trolling? (Currently the frontend accepts max 16 chars).
> Do you approve this architecture approach?

## Verification Plan
### Automated & Manual Verification
- Verify terminal correctly outputs standard queries.
- Score 10 points in Pong under standard incognito. Open standard browser and see the score reflected natively to prove global status.
