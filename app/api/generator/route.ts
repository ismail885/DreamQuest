import { NextResponse } from 'next/server';
import { 
  generateRandomStats, 
  getRandomAbility, 
  getAbilitiesForLevel, 
  calculateXPForLevel, 
  getLevelFromXP,
  getRandomEvent,
  ABILITIES_POOL,
  LEVEL_BONUS
} from '@/lib/randomGenerator';
import { CHARACTER_CLASSES, type CharacterClass } from '@/types';

// Validate that a string is a valid CharacterClass
function isValidCharacterClass(value: string | null): value is CharacterClass {
  if (!value) return false;
  return value in CHARACTER_CLASSES;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const classeParam = searchParams.get('classe');
  const niveau = parseInt(searchParams.get('niveau') || '1');
  const ownedAbilities = searchParams.get('owned') ? searchParams.get('owned')!.split(',') : [];

  if (!classeParam || !isValidCharacterClass(classeParam)) {
    return NextResponse.json({ error: 'Classe invalide' }, { status: 400 });
  }
  
  const classe = classeParam as CharacterClass;

  switch (action) {
    case 'stats':
      const stats = generateRandomStats(classe);
      return NextResponse.json({ stats });

    case 'ability':
      const ability = getRandomAbility(classe, ownedAbilities);
      return NextResponse.json({ ability });

    case 'abilities':
      const abilities = getAbilitiesForLevel(classe, niveau, ownedAbilities);
      return NextResponse.json({ abilities });

    case 'xp':
      const xpNeeded = calculateXPForLevel(niveau);
      const levelFromXP = getLevelFromXP(parseInt(searchParams.get('xp') || '0'));
      return NextResponse.json({ xpNeeded, levelFromXP });

    case 'event':
      const event = getRandomEvent();
      return NextResponse.json(event);

    case 'pool':
      const pool = ABILITIES_POOL[classe] || [];
      return NextResponse.json({ pool });

    case 'levelBonus':
      const bonus = LEVEL_BONUS[niveau] || {};
      return NextResponse.json({ bonus });

    default:
      return NextResponse.json({ 
        error: 'Action non reconnue. Actions disponibles: stats, ability, abilities, xp, event, pool, levelBonus' 
      });
  }
}