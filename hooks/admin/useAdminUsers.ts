"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, UserRole } from "@/types";

const ITEMS_PER_PAGE = 10;

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [userCharacters, setUserCharacters] = useState<
    { id: number; nom_personnage: string; classe: string; niveau: number }[]
  >([]);
  const [userSavesCount, setUserSavesCount] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nom_utilisateur: "",
    email: "",
    role: "joueur" as UserRole,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("utilisateur")
        .select("*", { count: "exact" })
        .order("date_creation", { ascending: false })
        .range(
          (currentPage - 1) * ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE - 1,
        );

      if (searchTerm) {
        query = query.or(
          `nom_utilisateur.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
        );
      }

      const { data, count, error } = await query;

      if (error) throw error;
      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(
        new Set(users.map((u) => u.id!).filter(Boolean)),
      );
    }
  };

  const toggleSelectUser = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Supprimer ${selectedUsers.size} utilisateurs ? Cette action est irréversible.`,
      )
    )
      return;
    try {
      for (const userId of selectedUsers) {
        await supabase.from("vote").delete().eq("id_utilisateur", userId);
        await supabase
          .from("sauvegarde")
          .delete()
          .eq("id_utilisateur", userId);
        await supabase
          .from("personnage")
          .delete()
          .eq("id_utilisateur", userId);
        await supabase.from("utilisateur").delete().eq("id", userId);
      }
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      console.error("Error deleting users:", error);
      setActionError("Erreur lors de la suppression des utilisateurs.");
    }
  };

  const handleBulkRoleChange = async (newRole: UserRole) => {
    try {
      for (const userId of selectedUsers) {
        await supabase
          .from("utilisateur")
          .update({ role: newRole })
          .eq("id", userId);
      }
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      console.error("Error updating roles:", error);
      setActionError("Erreur lors du changement de rôle.");
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nom_utilisateur: user.nom_utilisateur,
        email: user.email,
        role: user.role as UserRole,
      });
    } else {
      setEditingUser(null);
      setFormData({ nom_utilisateur: "", email: "", role: "joueur" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ nom_utilisateur: "", email: "", role: "joueur" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const { error } = await supabase
          .from("utilisateur")
          .update({
            nom_utilisateur: formData.nom_utilisateur,
            email: formData.email,
            role: formData.role,
          })
          .eq("id", editingUser.id);

        if (error) throw error;
      } else {
        setActionError(
          "La création d'utilisateur via admin nécessite le formulaire d'inscription.",
        );
        return;
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      setActionError("Erreur lors de la sauvegarde de l'utilisateur.");
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await supabase.from("vote").delete().eq("id_utilisateur", userId);
      await supabase
        .from("sauvegarde")
        .delete()
        .eq("id_utilisateur", userId);
      await supabase
        .from("personnage")
        .delete()
        .eq("id_utilisateur", userId);

      const { error } = await supabase
        .from("utilisateur")
        .delete()
        .eq("id", userId);

      if (error) throw error;
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setActionError("Erreur lors de la suppression de l'utilisateur.");
      setDeleteConfirm(null);
    }
  };

  const loadUserDetails = async (user: User) => {
    setDetailUser(user);
    setDetailLoading(true);
    try {
      const [charsResult, savesResult] = await Promise.all([
        supabase
          .from("personnage")
          .select("id, nom_personnage, classe, niveau")
          .eq("id_utilisateur", user.id),
        supabase
          .from("sauvegarde")
          .select("id", { count: "exact", head: true })
          .eq("id_utilisateur", user.id),
      ]);
      setUserCharacters(charsResult.data || []);
      setUserSavesCount(savesResult.count || 0);
    } catch (error) {
      console.error("Error loading user details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  return {
    users,
    loading,
    searchTerm,
    currentPage,
    totalCount,
    totalPages,
    selectedUsers,
    actionError,
    detailUser,
    userCharacters,
    userSavesCount,
    detailLoading,
    isModalOpen,
    editingUser,
    formData,
    deleteConfirm,
    setSearchTerm,
    setCurrentPage,
    setDetailUser,
    setFormData,
    setActionError,
    setDeleteConfirm,
    fetchUsers,
    toggleSelectAll,
    toggleSelectUser,
    handleBulkDelete,
    handleBulkRoleChange,
    openModal,
    closeModal,
    handleSubmit,
    handleDelete,
    loadUserDetails,
  };
}
