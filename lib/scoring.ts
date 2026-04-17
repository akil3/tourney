import { SetScore, TournamentSettings } from "./types";

export interface MatchState {
  sets: SetScore[];
  homeSetsWon: number;
  awaySetsWon: number;
  isComplete: boolean;
  winner: "home" | "away" | null;
}

export function computeMatchState(sets: SetScore[], settings: TournamentSettings): MatchState {
  let homeSetsWon = 0;
  let awaySetsWon = 0;

  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    const isDeciding = i === settings.setsToWin * 2 - 2;
    if (isSetComplete(set, isDeciding, settings)) {
      if (set.home > set.away) homeSetsWon++;
      else awaySetsWon++;
    }
  }

  const isComplete = homeSetsWon >= settings.setsToWin || awaySetsWon >= settings.setsToWin;
  const winner = isComplete
    ? homeSetsWon >= settings.setsToWin
      ? "home"
      : "away"
    : null;

  return { sets, homeSetsWon, awaySetsWon, isComplete, winner };
}

export function isSetComplete(
  set: SetScore,
  isDeciding: boolean,
  settings: TournamentSettings
): boolean {
  const target = isDeciding ? settings.decidingSetPoints : settings.pointsToWin;
  const maxScore = Math.max(set.home, set.away);
  const minScore = Math.min(set.home, set.away);

  if (maxScore < target) return false;
  if (settings.pointCap && maxScore >= settings.pointCap) return true;
  return maxScore - minScore >= settings.winBy;
}

export function getCurrentSetIndex(sets: SetScore[], settings: TournamentSettings): number {
  for (let i = 0; i < sets.length; i++) {
    const isDeciding = i === settings.setsToWin * 2 - 2;
    if (!isSetComplete(sets[i], isDeciding, settings)) return i;
  }
  // All sets complete, need a new one
  return sets.length;
}

export function addPoint(
  sets: SetScore[],
  team: "home" | "away",
  settings: TournamentSettings
): SetScore[] {
  const newSets = sets.map((s) => ({ ...s }));
  const state = computeMatchState(newSets, settings);

  if (state.isComplete) return newSets;

  const setIndex = getCurrentSetIndex(newSets, settings);

  // Create new set if needed
  while (newSets.length <= setIndex) {
    newSets.push({ home: 0, away: 0 });
  }

  newSets[setIndex][team]++;

  return newSets;
}

export function removePoint(
  sets: SetScore[],
  team: "home" | "away",
  settings: TournamentSettings
): SetScore[] {
  const newSets = sets.map((s) => ({ ...s }));
  const setIndex = getCurrentSetIndex(newSets, settings);

  // Try current set first, then previous
  const idx = newSets[setIndex]?.[team] > 0 ? setIndex : setIndex - 1;
  if (idx < 0 || !newSets[idx]) return newSets;

  newSets[idx][team] = Math.max(0, newSets[idx][team] - 1);

  return newSets;
}
