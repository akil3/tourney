import { TeamSeed } from "./single-elimination";
import { generateRoundRobin } from "./round-robin";

export interface PoolConfig {
  poolCount: number;
  advancePerPool: number;
}

export interface PoolData {
  name: string;
  teams: TeamSeed[];
  matches: ReturnType<typeof generateRoundRobin>;
}

export function generatePoolPlay(
  teams: TeamSeed[],
  tournamentId: string,
  config: PoolConfig
): PoolData[] {
  const { poolCount } = config;
  const sorted = [...teams].sort((a, b) => a.seed - b.seed);

  // Snake seeding: 1->A, 2->B, 3->C, ..., then reverse
  const pools: TeamSeed[][] = Array.from({ length: poolCount }, () => []);

  for (let i = 0; i < sorted.length; i++) {
    const round = Math.floor(i / poolCount);
    const pos = i % poolCount;
    const poolIndex = round % 2 === 0 ? pos : poolCount - 1 - pos;
    pools[poolIndex].push(sorted[i]);
  }

  const poolNames = pools.map((_, i) => `Pool ${String.fromCharCode(65 + i)}`);

  return pools.map((poolTeams, i) => ({
    name: poolNames[i],
    teams: poolTeams,
    matches: generateRoundRobin(poolTeams, tournamentId),
  }));
}
