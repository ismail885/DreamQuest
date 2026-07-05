import { calculateTrophies, SEASON_POINTS_CAP, TrophyStatsInput } from '@/lib/trophies';

const ZERO: TrophyStatsInput = {
  storiesPlayed: 0,
  charactersCreated: 0,
  votes: 0,
  storiesCreated: 0,
  totalLikes: 0,
  level: 0,
};

describe('trophies - calculateTrophies', () => {
  it('génère 60 trophées (12 saisons × 5 paliers)', () => {
    const result = calculateTrophies(ZERO);
    expect(result.total).toBe(60);
    expect(result.trophies).toHaveLength(60);
  });

  it('maxPoints vaut 12 × le cap de saison', () => {
    const result = calculateTrophies(ZERO);
    expect(SEASON_POINTS_CAP).toBe(5000);
    expect(result.maxPoints).toBe(12 * SEASON_POINTS_CAP);
  });

  it('ne débloque rien avec des stats nulles', () => {
    const result = calculateTrophies(ZERO);
    expect(result.totalUnlocked).toBe(0);
    expect(result.totalPoints).toBe(0);
  });

  it('débloque tout avec des stats très élevées', () => {
    const maxed: TrophyStatsInput = {
      storiesPlayed: 9999,
      charactersCreated: 9999,
      votes: 9999,
      storiesCreated: 9999,
      totalLikes: 9999,
      level: 9999,
    };
    const result = calculateTrophies(maxed);
    expect(result.totalUnlocked).toBe(60);
    expect(result.totalPoints).toBe(result.maxPoints);
  });

  it('calcule current, goal et progress correctement (saison 1 = storiesPlayed)', () => {
    const result = calculateTrophies({ ...ZERO, storiesPlayed: 5 });
    const season1 = result.trophies.filter((t) => t.seasonId === 1);
    // paliers saison 1 : [1, 2, 4, 7, 12] → 3 débloqués avec 5
    expect(season1.filter((t) => t.unlocked)).toHaveLength(3);
    for (const trophy of season1) {
      expect(trophy.current).toBe(Math.min(5, trophy.goal));
      expect(trophy.progress).toBeCloseTo(Math.min(1, 5 / trophy.goal));
    }
  });

  it('borne progress à 1 quand la valeur dépasse le palier', () => {
    const result = calculateTrophies({ ...ZERO, storiesPlayed: 9999 });
    const season1 = result.trophies.filter((t) => t.seasonId === 1);
    expect(season1.every((t) => t.progress === 1)).toBe(true);
  });
});
