"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCachedQuery } from "@/hooks/useCachedQuery";
import type { AdventureListItem } from "@/types/adventure";

const ITEMS_PER_PAGE = 12;

export type AdventureFilter = "tous" | "fantasy" | "scifi" | "horreur" | "romance";

export const FILTER_OPTIONS: { value: AdventureFilter; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "fantasy", label: "Fantasy" },
  { value: "scifi", label: "Sci-Fi" },
  { value: "horreur", label: "Horreur" },
];

interface UseAdventureListReturn {
  adventures: AdventureListItem[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalCount: number;
  totalPages: number;
  activeFilter: AdventureFilter;
  searchQuery: string;
  setCurrentPage: (page: number) => void;
  setActiveFilter: (filter: AdventureFilter) => void;
  setSearchQuery: (query: string) => void;
}

export function useAdventureList(): UseAdventureListReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [adventures, setAdventures] = useState<AdventureListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<AdventureFilter>("tous");

  // Fonction de fetch mise en cache
  const fetchAdventures = async () => {
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const query = supabase
      .from("aventure")
      .select("id, titre, description, popularite", { count: "exact" })
      .order("popularite", { ascending: false });

    const { data, error: fetchError, count } = await query.range(from, to);

    if (fetchError) {
      setError("Impossible de charger les aventures.");
      return [];
    } else {
      setAdventures(data ?? []);
      setTotalCount(count ?? 0);
      return data ?? [];
    }
  };

  // Utiliser le cache pour optimiser les appels API
  const { loading: cacheLoading } = useCachedQuery(
    `adventures_page_${currentPage}`,
    fetchAdventures,
    { cacheDuration: 3 * 60 * 1000, refetchOnFocus: true } // Cache 3 minutes
  );

  useEffect(() => {
    setLoading(cacheLoading);
  }, [cacheLoading]);

  const filteredAdventures = adventures.filter((adventure) =>
    adventure.titre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return {
    adventures: filteredAdventures,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    activeFilter,
    searchQuery,
    setCurrentPage,
    setActiveFilter,
    setSearchQuery,
  };
}
