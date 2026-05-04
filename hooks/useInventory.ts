"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { InventoryItem, GameItem, getItemById, DEFAULT_ITEMS } from '@/types';

interface UseInventoryProps {
  characterId: number | null;
  enabled?: boolean;
}

interface StoredItem {
  id: number;        // id_objet
  q: number;         // quantite
  e: boolean;        // est_equipe
  d: string;         // date_obtention
}

const MAX_CAPACITY = 20;

export function useInventory({ characterId, enabled = true }: UseInventoryProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger l'inventaire depuis le champ JSON de personnage
  const fetchInventory = useCallback(async () => {
    if (!characterId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('personnage')
        .select('inventaire')
        .eq('id', characterId)
        .single();

      if (fetchError) throw fetchError;

      // Parser le JSON
      const storedItems: StoredItem[] = data?.inventaire || [];
      
      // Enrichir avec les données des objets
      const enrichedInventory: InventoryItem[] = storedItems.map((item, index) => ({
        id: index + 1,
        id_personnage: characterId,
        id_objet: item.id,
        quantite: item.q,
        est_équipé: item.e,
        date_obtention: item.d,
        objet: getItemById(item.id) || Object.values(DEFAULT_ITEMS)[0],
      }));

      setInventory(enrichedInventory);
    } catch (err) {
      console.error('Erreur fetchInventory:', err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [characterId, enabled]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Sauvegarder l'inventaire dans le champ JSON
  const saveInventory = useCallback(async (items: StoredItem[]) => {
    if (!characterId) return;

    try {
      const { error: updateError } = await supabase
        .from('personnage')
        .update({ inventaire: JSON.stringify(items) })
        .eq('id', characterId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Erreur saveInventory:', err);
    }
  }, [characterId]);

  // Ajouter un objet à l'inventaire
  const addItem = useCallback(async (objetId: number, quantite: number = 1) => {
    if (!characterId) return { success: false, error: 'Personnage non défini' };

    // Vérifier la capacité
    const currentCount = inventory.reduce((sum, item) => sum + item.quantite, 0);
    if (currentCount >= MAX_CAPACITY) {
      return { success: false, error: 'Inventaire plein' };
    }

    try {
      const storedItems: StoredItem[] = inventory.map(item => ({
        id: item.id_objet,
        q: item.quantite,
        e: item.est_équipé,
        d: item.date_obtention,
      }));

      // Vérifier si l'objet existe déjà
      const existingIndex = storedItems.findIndex(item => item.id === objetId);
      
      if (existingIndex >= 0) {
        // Augmenter la quantité
        storedItems[existingIndex].q += quantite;
      } else {
        // Ajouter nouveau
        storedItems.push({
          id: objetId,
          q: quantite,
          e: false,
          d: new Date().toISOString(),
        });
      }

      await saveInventory(storedItems);
      await fetchInventory();
      return { success: true };
    } catch (err) {
      console.error('Erreur addItem:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  }, [characterId, inventory, saveInventory, fetchInventory]);

  // Retirer un objet de l'inventaire
  const removeItem = useCallback(async (inventoryItemId: number, quantite: number = 1) => {
    if (!characterId) return { success: false };

    try {
      const item = inventory[inventoryItemId - 1];
      if (!item) return { success: false, error: 'Objet non trouvé' };

      const storedItems: StoredItem[] = inventory.map(i => ({
        id: i.id_objet,
        q: i.quantite,
        e: i.est_équipé,
        d: i.date_obtention,
      }));

      const idx = storedItems.findIndex(s => s.id === item.id_objet);
      if (idx === -1) return { success: false };

      if (storedItems[idx].q <= quantite) {
        storedItems.splice(idx, 1);
      } else {
        storedItems[idx].q -= quantite;
      }

      await saveInventory(storedItems);
      await fetchInventory();
      return { success: true };
    } catch (err) {
      console.error('Erreur removeItem:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  }, [characterId, inventory, saveInventory, fetchInventory]);

  // Équiper/Déséquiper un objet
  const toggleEquip = useCallback(async (inventoryItemId: number) => {
    if (!characterId) return { success: false };

    try {
      const item = inventory[inventoryItemId - 1];
      if (!item) return { success: false, error: 'Objet non trouvé' };

      const storedItems: StoredItem[] = inventory.map(i => ({
        id: i.id_objet,
        q: i.quantite,
        e: i.est_équipé,
        d: i.date_obtention,
      }));

      const idx = storedItems.findIndex(s => s.id === item.id_objet);
      if (idx === -1) return { success: false };

      const newEquipped = !storedItems[idx].e;

      // Si on équipe, déséquiper les autres du même slot
      if (newEquipped && item.objet?.slot) {
        inventory.forEach((i, index) => {
          if (i.est_équipé && i.objet?.slot === item.objet?.slot) {
            storedItems[index].e = false;
          }
        });
      }

      storedItems[idx].e = newEquipped;

      await saveInventory(storedItems);
      await fetchInventory();
      return { success: true };
    } catch (err) {
      console.error('Erreur toggleEquip:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  }, [characterId, inventory, saveInventory, fetchInventory]);

  // Calculer les bonus stats des objets équipés
  const equippedBonus = inventory.reduce((bonus, item) => {
    if (item.est_équipé && item.objet?.stats) {
      return {
        force: (bonus.force || 0) + (item.objet.stats.force || 0),
        agility: (bonus.agility || 0) + (item.objet.stats.agility || 0),
        intelligence: (bonus.intelligence || 0) + (item.objet.stats.intelligence || 0),
        endurance: (bonus.endurance || 0) + (item.objet.stats.endurance || 0),
        pv: (bonus.pv || 0) + (item.objet.stats.pv || 0),
      };
    }
    return bonus;
  }, { force: 0, agility: 0, intelligence: 0, endurance: 0, pv: 0 });

  const equippedItems = inventory.filter(item => item.est_équipé);

  return {
    inventory,
    equippedItems,
    equippedBonus,
    loading,
    error,
    addItem,
    removeItem,
    toggleEquip,
    refresh: fetchInventory,
    capacity: {
      used: inventory.reduce((sum, item) => sum + item.quantite, 0),
      max: MAX_CAPACITY,
    },
  };
}