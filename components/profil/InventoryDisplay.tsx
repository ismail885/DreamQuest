"use client";

import { useInventory } from "@/hooks/useInventory";
import { GameItem } from "@/types/inventory";
import { 
  Sword, Shield, Wand, Gem, FlaskConical, Scroll, Backpack, Check, X, 
  Zap, Heart, Sparkles, Package, Crosshair, Crown, Footprints, Hexagon, Star, 
  Leaf, Hammer, Axe, Drumstick, Candy, Coffee, LucideIcon
} from "lucide-react";

interface InventoryDisplayProps {
  characterId: number;
}

const categoryLabels: Record<string, string> = {
  weapon: "Armes",
  armor: "Armures",
  accessory: "Accessoires",
  consumable: "Consommables",
  material: "Matériaux",
};

const categoryIcons: Record<string, LucideIcon> = {
  weapon: Sword,
  armor: Shield,
  accessory: Gem,
  consumable: FlaskConical,
  material: Package,
};

const iconMap: Record<string, LucideIcon> = {
  Sword: Sword,
  Shield: Shield,
  Wand: Wand,
  Gem: Gem,
  Potion: FlaskConical,
  FlaskConical: FlaskConical,
  Scroll: Scroll,
  Backpack: Backpack,
  Zap: Zap,
  Heart: Heart,
  Sparkles: Sparkles,
  Package: Package,
  Crosshair: Crosshair,
  Crown: Crown,
  Footprints: Footprints,
  Hexagon: Hexagon,
  Star: Star,
  Leaf: Leaf,
  Hammer: Hammer,
  Axe: Axe,
  Drumstick: Drumstick,
  Candy: Candy,
  Coffee: Coffee,
};

function ItemIcon({ iconName, className }: { iconName: string; className?: string }) {
  const Icon = iconMap[iconName] || Package;
  return <Icon className={className} />;
}

function getCategoryFromItem(item: { objet?: GameItem }): string {
  if (!item.objet) return "material";
  const type = item.objet.type;
  if (type === "arme") return "weapon";
  if (type === "armure") return "armor";
  if (type === "potion") return "consumable";
  if (type === "clé") return "accessory";
  return "material";
}

export default function InventoryDisplay({ characterId }: InventoryDisplayProps) {
  const { inventory, loading } = useInventory({ characterId });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <Backpack className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-content-primary mb-2">Inventaire vide</h3>
        <p className="text-gray-400">Votre inventaire est vide. Trouvez des objets dans vos aventures!</p>
      </div>
    );
  }

  // Grouper par catégorie
  const itemsByCategory = inventory.reduce((acc, item) => {
    const category = getCategoryFromItem(item);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof inventory>);

  const categories = Object.keys(itemsByCategory);

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const CatIcon = categoryIcons[category] || Package;
        const items = itemsByCategory[category];

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
              <CatIcon className="w-4 h-4" />
              <span>{categoryLabels[category] || category}</span>
              <span className="text-gray-600">({items.length})</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((item, idx) => {
                const equipped = item.est_équipé;
                const isEquipment = ["weapon", "armor", "accessoire"].includes(item.objet?.type || "");
                const rarity = item.objet?.rareté;
                const itemName = item.objet?.nom || `Objet ${item.id_objet}`;

                const rarityColors: Record<string, string> = {
                  légendaire: "text-orange-400",
                  épique: "text-purple-400",
                  rare: "text-blue-400",
                  commun: "text-gray-500",
                };

                return (
                  <div
                    key={`${item.id_objet}-${idx}`}
                    className={`relative p-3 rounded-lg border transition-all ${
                      equipped
                        ? "bg-cyan-500/10 border-cyan-400/50"
                        : "bg-gray-800/30 border-gray-700/30 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${equipped ? "bg-cyan-500/20" : "bg-gray-700/30"}`}>
                        <ItemIcon iconName={item.objet?.icon || "Package"} className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-content-primary truncate">{itemName}</p>
                        {rarity && (
                          <p className={`text-xs ${rarityColors[rarity] || "text-gray-500"}`}>
                            {rarity}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Équipé indicator */}
                    {equipped && (
                      <span className="absolute top-2 right-2 text-xs text-cyan-400">Équipé</span>
                    )}

                    {/* Quantité */}
                    {item.quantite > 1 && (
                      <span className="absolute bottom-2 right-2 text-xs text-gray-500">x{item.quantite}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}