"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Character } from "@/types";

const ITEMS_PER_PAGE = 10;

export interface CharacterWithUser extends Character {
  nom_utilisateur?: string;
}

export function useAdminCharacters() {
  const [characters, setCharacters] = useState<CharacterWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [viewCharacter, setViewCharacter] = useState<CharacterWithUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("personnage")
        .select("*", { count: "exact" })
        .order("id", { ascending: false })
        .range(
          (currentPage - 1) * ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE - 1,
        );

      if (searchTerm) {
        query = query.ilike("nom_personnage", `%${searchTerm}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      const userIds = [
        ...new Set(
          (data || [])
            .map((c) => c.id_utilisateur)
            .filter(Boolean),
        ),
      ];
      const { data: users } = await supabase
        .from("utilisateur")
        .select("id, nom_utilisateur")
        .in("id", userIds);

      const userMap = new Map(
        (users || []).map((u) => [u.id, u.nom_utilisateur]),
      );

      const charactersWithUser = (data || []).map((c) => ({
        ...c,
        nom_utilisateur: userMap.get(c.id_utilisateur),
      }));

      setCharacters(charactersWithUser);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching characters:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleDelete = async (characterId: number) => {
    try {
      const res = await fetch('/api/admin/characters/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression');
      setDeleteConfirm(null);
      fetchCharacters();
    } catch (error) {
      console.error("Error deleting character:", error);
      setActionError(
        error instanceof Error ? error.message : "Erreur lors de la suppression du personnage.",
      );
      setDeleteConfirm(null);
    }
  };

  return {
    characters,
    loading,
    searchTerm,
    currentPage,
    totalCount,
    totalPages,
    viewCharacter,
    deleteConfirm,
    actionError,
    setSearchTerm,
    setCurrentPage,
    setViewCharacter,
    setDeleteConfirm,
    setActionError,
    fetchCharacters,
    handleDelete,
  };
}
