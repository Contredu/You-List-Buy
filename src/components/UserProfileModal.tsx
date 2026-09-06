import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  LogOut,
  X,
  Check,
  Sparkles,
  Save,
  Users,
  Trash2,
} from "lucide-react";
import { User } from "firebase/auth";
import { Household } from "../types";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: User | null;
  household: Household | null;
  onSaveProfile: (name: string, avatar: string) => Promise<void>;
  onSignOut: () => void;
  onShowToast: (msg: string) => void;
  onResetToCleanDatabase?: () => Promise<void>;
}

const AVATAR_OPTIONS = [
  "👨‍💼", "👩‍🍳", "👧", "👦", "👵", "👴", "🛒", "🥑", "👑", "🌟", "🍎", "⚡"
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  authUser,
  household,
  onSaveProfile,
  onSignOut,
  onShowToast,
  onResetToCleanDatabase,
}) => {
  const currentMember = household?.members.find(
    (m) =>
      m.uid === authUser?.uid ||
      (authUser?.email && m.email.toLowerCase() === authUser.email.toLowerCase())
  );

  const isOwnerOrAdmin = Boolean(
    authUser &&
    household &&
    (household.ownerUid === authUser.uid ||
      (household.ownerEmail &&
        authUser.email &&
        household.ownerEmail.toLowerCase() === authUser.email.toLowerCase()) ||
      currentMember?.role === "Administrador")
  );

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("👤");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentMember?.name || authUser?.displayName || "");
      setAvatar(currentMember?.avatar || "👤");

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, currentMember, authUser, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast("El nombre no puede estar vacío");
      return;
    }
    setIsSaving(true);
    try {
      await onSaveProfile(name.trim(), avatar);
      onShowToast("Perfil actualizado correctamente");
      onClose();
    } catch {
      onShowToast("Error al actualizar información de perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Click-outside backdrop layer */}
      <div
        id="user-profile-modal-backdrop"
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Content Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 px-6 py-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl backdrop-blur-xs border border-white/15">
              {avatar}
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Mi Perfil Familiar
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Editar datos y preferencias de cuenta
              </p>
            </div>
          </div>
          <button
            id="close-profile-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Cloud Connection & Status Banner */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <span className="font-bold block">Nube Firebase Firestore</span>
                <span className="text-[11px] text-emerald-700">Sincronización en tiempo real activa</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
              En línea
            </span>
          </div>
          {/* Role & Session Information Badge */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isOwnerOrAdmin
                ? "bg-amber-50/80 border-amber-200 text-amber-950"
                : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isOwnerOrAdmin ? (
                <span className="text-lg">👑</span>
              ) : (
                <span className="text-lg">🛒</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isOwnerOrAdmin ? "Administrador de la Sesión" : "Familiar Invitado"}
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/80 border border-current">
                  {household?.name || "Hogar"}
                </span>
              </div>
              <p className="text-xs mt-1 text-stone-600 leading-relaxed">
                {isOwnerOrAdmin
                  ? "Creaste o administras este hogar. Tienes permiso para invitar a otros familiares o eliminarlos de la sesión compartida cuando lo decidas."
                  : "Estás participando como familiar. Puedes añadir, modificar y tachar productos de la lista de la compra común."}
              </p>
            </div>
          </div>

          {/* Email Info (Read-only) */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              Correo Electrónico
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 text-xs sm:text-sm">
              <Mail className="w-4 h-4 text-stone-400 shrink-0" />
              <span className="font-mono text-stone-800 truncate flex-1">
                {authUser?.email || "Sin correo registrado"}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                Verificado
              </span>
            </div>
          </div>

          {/* Display Name Input */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              Nombre Visible en la Familia
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="profile-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Carlos Enrique, Mamá, Juan..."
                className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-stone-900 font-medium"
                required
              />
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-2">
              Elige tu Avatar o Icono Familiar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`h-10 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                    avatar === emoji
                      ? "border-emerald-600 bg-emerald-50 scale-105 shadow-xs ring-2 ring-emerald-400/30"
                      : "border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            id="save-profile-btn"
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </form>

        {/* Sign Out and Admin Maintenance Section in Footer */}
        <div className="bg-stone-50 p-5 border-t border-stone-200 space-y-2.5">
          {isOwnerOrAdmin && onResetToCleanDatabase && (
            <button
              id="profile-reset-db-btn"
              type="button"
              disabled={isResetting}
              onClick={async () => {
                const confirmed = window.confirm(
                  "¿Estás seguro de que deseas limpiar los productos y datos de prueba? Esta acción dejará el catálogo y las listas listos desde cero para ingresar tus propios productos familiares."
                );
                if (!confirmed) return;
                setIsResetting(true);
                try {
                  await onResetToCleanDatabase();
                  onShowToast("Base de datos reiniciada a estado limpio");
                  onClose();
                } catch {
                  onShowToast("Error al reiniciar la base de datos");
                } finally {
                  setIsResetting(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 text-amber-600" />
              <span>{isResetting ? "Limpiando base de datos..." : "Limpiar datos de prueba (Iniciar desde cero)"}</span>
            </button>
          )}

          <button
            id="profile-signout-btn"
            type="button"
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión y volver a la Landing Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
