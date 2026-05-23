import { NextResponse } from 'next/server';
import { 
 generateRandomStats, 
 getRandomAbility, 
 getAbilitiesForLevel, 
 getRandomEvent,
 LEVEL_BONUS
} from '@/lib/randomGenerator';
import { getPoolAbilityNames } from '@/lib/abilities';
import { calculateLevel } from '@/lib/xp';
import { calculateRequiredXP } from '@/lib/characters/classDefinitions';
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
  const niveauRaw = searchParams.get('niveau') || '1';
  const niveau = parseInt(niveauRaw, 10);
  const xpRaw = searchParams.get('xp') || '0';
  const xp = parseInt(xpRaw, 10);
  const ownedAbilities = searchParams.get('owned') ? searchParams.get('owned')!.split(',') : [];

  if (!classeParam || !isValidCharacterClass(classeParam)) {
    return NextResponse.json({ error: 'Classe invalide' }, { status: 400 });
  }

  if (!Number.isInteger(niveau) || niveau < 1 || niveau > 100) {
    return NextResponse.json({ error: 'Niveau invalide (1-100)' }, { status: 400 });
  }

  if (!Number.isInteger(xp) || xp < 0) {
    return NextResponse.json({ error: 'XP invalide' }, { status: 400 });
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
    const xpNeeded = calculateRequiredXP(niveau);
    const levelFromXP = calculateLevel(xp);
    return NextResponse.json({ xpNeeded, levelFromXP });

 case 'event':
 const event = getRandomEvent();
 return NextResponse.json(event);

  case 'pool':
  const pool = getPoolAbilityNames(classe);
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