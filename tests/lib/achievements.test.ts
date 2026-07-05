jest.mock('@/lib/supabaseClient', () => ({ supabase: {} }));

import { calculateAchievements, ACHIEVEMENTS_CONFIG } from '@/lib/achievements';

const ZERO = {
  storiesPlayed: 0,
  charactersCreated: 0,
  votes: 0,
  storiesCreated: 0,
  totalLikes: 0,
  level: 0,
};

describe('achievements - calculateAchievements', () => {
  it('ne débloque aucun achievement avec des stats nulles', () => {
    const result = calculateAchievements(ZERO);
    expect(result.totalUnlocked).toBe(0);
    expect(result.achievements).toHaveLength(ACHIEVEMENTS_CONFIG.length);
  });

  it('débloque les paliers atteints', () => {
    const result = calculateAchievements({ ...ZERO, storiesPlayed: 5, level: 10 });
    const unlockedIds = result.achievements.filter((a) => a.unlocked).map((a) => a.id);
    expect(unlockedIds).toContain('first_story');
    expect(unlockedIds).toContain('five_stories');
    expect(unlockedIds).not.toContain('ten_stories');
    expect(unlockedIds).toContain('level_5');
    expect(unlockedIds).toContain('level_10');
    expect(unlockedIds).not.toContain('level_25');
  });

  it('renseigne unlockedAt uniquement pour les achievements débloqués', () => {
    const result = calculateAchievements({ ...ZERO, votes: 1 });
    const firstVote = result.achievements.find((a) => a.id === 'first_vote');
    const tenVotes = result.achievements.find((a) => a.id === 'ten_votes');
    expect(firstVote?.unlocked).toBe(true);
    expect(firstVote?.unlockedAt).toBeDefined();
    expect(tenVotes?.unlocked).toBe(false);
    expect(tenVotes?.unlockedAt).toBeUndefined();
  });

  it('gère l’achievement conditionnel "night_owl"', () => {
    const night = calculateAchievements({ ...ZERO, lastPlayedAt: '2026-01-01T23:00:00' });
    const day = calculateAchievements({ ...ZERO, lastPlayedAt: '2026-01-01T14:00:00' });
    expect(night.achievements.find((a) => a.id === 'night_owl')?.unlocked).toBe(true);
    expect(day.achievements.find((a) => a.id === 'night_owl')?.unlocked).toBe(false);
  });

  it('débloque tout avec des stats maximales', () => {
    const maxed = {
      storiesPlayed: 999,
      charactersCreated: 999,
      votes: 999,
      storiesCreated: 999,
      totalLikes: 999,
      level: 100,
      lastPlayedAt: '2026-01-01T23:00:00',
    };
    const result = calculateAchievements(maxed);
    expect(result.totalUnlocked).toBe(ACHIEVEMENTS_CONFIG.length);
  });
});
