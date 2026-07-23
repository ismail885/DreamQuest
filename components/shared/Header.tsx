"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Plus, ChevronRight } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

function getUserInitials(
  user: { username?: string; email?: string } | null,
): string {
  const name = user?.username || user?.email || "U";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

const Header = React.memo(function Header() {
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  /* Ferme le menu au passage vers desktop */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Ferme si clic en dehors du drawer */
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  /* Bloque le scroll du body quand le drawer est ouvert */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  // Liens desktop — ordre original préservé
  const desktopNavLinks = user
    ? [
        { href: "/dashboard", label: t("nav.dashboard") },
        { href: "/adventure", label: t("nav.adventures") },
        ...(user.role === "createur" || user.role === "admin"
          ? [{ href: "/create-adventure", label: t("nav.creator"), accent: "text-purple-400" as const }]
          : []),
        ...(user.role === "admin"
          ? [{ href: "/admin", label: t("nav.admin"), accent: "text-red-400 font-bold" as const }]
          : []),
        { href: "/classement", label: t("nav.ranking") },
        { href: "/profil", label: t("nav.profile") },
      ]
    : [
        { href: "/", label: t("nav.home") },
        { href: "/adventure", label: t("nav.adventures") },
        { href: "/create-character", label: t("nav.createCharacter") },
        { href: "/classement", label: t("nav.ranking") },
      ];

  // Liens mobile drawer — ordre logique pour petits écrans
  const mobileNavLinks = user
    ? [
        { href: "/dashboard", label: t("nav.dashboard") },
        { href: "/adventure", label: t("nav.adventures") },
        { href: "/classement", label: t("nav.ranking") },
        { href: "/profil", label: t("nav.myProfile") },
        ...(user.role === "createur" || user.role === "admin"
          ? [{ href: "/create-adventure", label: t("nav.creator"), accent: "text-purple-400" as const }]
          : []),
        ...(user.role === "admin"
          ? [{ href: "/admin", label: t("nav.admin"), accent: "text-red-400" as const }]
          : []),
      ]
    : [
        { href: "/", label: t("nav.home") },
        { href: "/adventure", label: t("nav.adventures") },
        { href: "/create-character", label: t("nav.createCharacter") },
        { href: "/classement", label: t("nav.ranking") },
      ];

  return (
    <>
      {/* ── BARRE STICKY ── */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm bg-deep/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <Image
                src="/Logo_DreamQuest.png"
                alt="DreamQuest"
                width={32}
                height={32}
                className="object-contain w-8 h-8 md:w-10 md:h-10"
              />
              <span className="text-lg md:text-xl font-bold text-cyan-400">
                DreamQuest
              </span>
            </Link>

            {/* Nav desktop */}
            <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-8">
              {desktopNavLinks.map(({ href, label, accent }) => (
                <Link
                  key={href}
                  href={href}
                  className={`${accent ?? "text-gray-300 hover:text-cyan-400"} transition-colors font-medium`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Actions desktop */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/create-character">
                    <button className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors">
                      {t("nav.newCharacter")}
                    </button>
                  </Link>
                  <Link href="/profil">
                    <button
                      className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold hover:bg-cyan-600 transition-colors"
                      title={t("nav.profile")}
                    >
                      {getUserInitials(user)}
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <button className="px-5 py-2.5 text-white hover:text-cyan-400 font-medium transition-colors">
                      {t("nav.login")}
                    </button>
                  </Link>
                  <Link href="/auth/register">
                    <button className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors">
                      {t("nav.register")}
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Bouton hamburger — mobile seulement */}
            <button
              onClick={() => setIsOpen((v) => !v)}
              aria-label={isOpen ? t("common.closeMenu") : t("common.openMenu")}
              aria-expanded={isOpen}
              aria-controls="mobile-drawer"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-gray-700/50 text-gray-300 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 active:scale-95 transition-all touch-manipulation"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── OVERLAY ── */}
      <div
        aria-hidden="true"
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── DRAWER ── */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-deep border-l border-gray-800/60 flex flex-col md:hidden transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header du drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/50">
          <span className="text-cyan-400 font-bold">{t("nav.navigation")}</span>
          <button
            onClick={close}
            aria-label={t("common.closeMenu")}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/60 active:scale-95 transition-all touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-1">
          {user && (
            /* Carte utilisateur */
            <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {getUserInitials(user)}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {user.username || "Aventurier"}
                </p>
                <p className="text-gray-400 text-xs truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Liens */}
          {mobileNavLinks.map(({ href, label, accent }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={`flex items-center justify-between px-3 py-3 rounded-xl ${
                accent ?? "text-gray-200"
              } hover:text-white hover:bg-gray-800/60 active:bg-gray-800 transition-all touch-manipulation text-sm font-medium`}
            >
              {label}
              <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </Link>
          ))}

          {/* Boutons d'action */}
          <div className="pt-4 space-y-3">
            {user ? (
              <Link href="/create-character" onClick={close}>
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 active:scale-[0.98] text-white font-semibold rounded-xl transition-all touch-manipulation text-sm">
                  <Plus className="w-4 h-4" />
                  {t("nav.newCharacter")}
                </button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login" onClick={close}>
                  <button className="w-full py-3 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 active:scale-[0.98] font-semibold rounded-xl transition-all touch-manipulation text-sm">
                    {t("nav.login")}
                  </button>
                </Link>
                <Link href="/auth/register" onClick={close}>
                  <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 active:scale-[0.98] text-white font-semibold rounded-xl transition-all touch-manipulation text-sm">
                    {t("nav.register")}
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Pied */}
        <div className="px-5 py-3 border-t border-gray-800/50">
          <p className="text-gray-600 text-xs text-center">© DreamQuest</p>
        </div>
      </div>
    </>
  );
});

export default Header;
