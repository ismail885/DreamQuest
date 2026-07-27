import { getRandomEvent, getRandomCombatEvent, getRandomNarrativeEvent, RANDOM_EVENTS, NARRATIVE_EVENTS, COMBAT_EVENTS } from '@/lib/randomEvents';

describe('randomEvents', () => {
  it('expose des événements narratifs et de combat', () => {
    expect(NARRATIVE_EVENTS.length).toBeGreaterThan(0);
    expect(COMBAT_EVENTS.length).toBeGreaterThan(0);
    expect(RANDOM_EVENTS.length).toBe(NARRATIVE_EVENTS.length + COMBAT_EVENTS.length);
  });

  it('retourne un événement narratif quand allowCombat est faux', () => {
    const event = getRandomNarrativeEvent('fantasy');
    expect(event.type).toBe('choice');
    expect(event.choices.length).toBeGreaterThan(0);
  });

  it('retourne un événement de combat quand demandé', () => {
    const event = getRandomCombatEvent('fantasy');
    expect(event.type).toBe('combat');
    expect(event.monsterId).toBeDefined();
  });

  it('retourne un événement aléatoire avec combat autorisé', () => {
    const event = getRandomEvent(true, 'fantasy');
    expect(event).toBeDefined();
    expect(event.choices.length).toBeGreaterThan(0);
  });

  it('retourne un événement aléatoire sans combat', () => {
    const event = getRandomEvent(false, 'fantasy');
    expect(event.type).toBe('choice');
  });
});
