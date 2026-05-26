const ADVENTURE_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=500&fit=crop",
  2: "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=500&fit=crop",
  3: "https://images.unsplash.com/photo-1589308078059-be1415eab064?w=1200&h=500&fit=crop",
  4: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&h=500&fit=crop",
  5: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=500&fit=crop",
  6: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1200&h=500&fit=crop",
};

export function getAdventureImage(adventureId: number): string {
  return ADVENTURE_IMAGES[adventureId] ?? ADVENTURE_IMAGES[1];
}
