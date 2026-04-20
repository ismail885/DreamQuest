export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  theme: "halloween" | "christmas" | "spring" | "default";
  adventureIds?: number[];
  badge: string;
  reward: number;
}

const EVENTS: SpecialEvent[] = [
  {
    id: "spring_2026",
    name: "Festival de Printemps",
    description: "La nature se réveille. Participez pour earn special rewards!",
    startDate: "2026-04-20",
    endDate: "2026-05-01",
    theme: "spring",
    badge: "Fleur",
    reward: 300,
  },
  {
    id: "summer_2026",
    name: "Ete Magique",
    description: "Les jours rallongent... des nouvelles quetes vous attendent.",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    theme: "default",
    badge: "Soleil",
    reward: 400,
  },
  {
    id: "halloween_2026",
    name: "Nuit d'Halloween",
    description: "Les tenebres arrivent...",
    startDate: "2026-10-25",
    endDate: "2026-11-01",
    theme: "halloween",
    badge: "Fantome",
    reward: 500,
  },
];

export function getActiveEvent(): SpecialEvent | null {
  const now = new Date();
  const current = EVENTS.find(e => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    return now >= start && now <= end;
  });
  return current || null;
}

export function getUpcomingEvent(): SpecialEvent | null {
  const now = new Date();
  const upcoming = EVENTS.find(e => new Date(e.startDate) > now);
  return upcoming || null;
}

export function getTimeRemaining(event: SpecialEvent): { days: number; hours: number; minutes: number } {
  const now = new Date();
  const end = new Date(event.endDate);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes };
}

export function hasParticipated(userId: number, eventId: string): boolean {
  const key = `dq_event_${userId}_${eventId}`;
  return localStorage.getItem(key) === "true";
}

export function markParticipated(userId: number, eventId: string): void {
  const key = `dq_event_${userId}_${eventId}`;
  localStorage.setItem(key, "true");
}