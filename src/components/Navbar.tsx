import React, { useState } from "react";
import {
  ShoppingCart,
  Package,
  Sparkles,
  BarChart3,
  Bell,
  Plus,
  Calendar,
  ChevronDown,
  Users,
  CheckCircle2,
  AlertTriangle,
  Store,
  Smartphone,
  Cloud,
  LogOut,
  LogIn,
  User as UserIcon,
  Crown,
} from "lucide-react";
import { FamilyMember, MonthlyList, NotificationItem, Household } from "../types";
import { formatCurrency, formatMonthTitle } from "../utils/helpers";
import { User } from "firebase/auth";

interface NavbarProps {
  currentTab: "lists" | "list" | "catalog" | "ai" | "reports" | "notifications";
  onSelectTab: (tab: "lists" | "list" | "catalog" | "ai" | "reports" | "notifications") => void;
  familyMembers: FamilyMember[];
  currentMember: FamilyMember;
  onSelectMember: (member: FamilyMember) => void;
  monthlyLists: MonthlyList[];
  activeMonthKey: string;
  onSelectMonth: (monthKey: string) => void;
  onOpenNewMonthModal: () => void;
  notifications: NotificationItem[];
  onOpenSupermarketMode: () => void;
  onOpenMobileInstallModal: () => void;
  unreadCount: number;
  authUser: User | null;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  isSyncing: boolean;
  currentHousehold: Household | null;
  onOpenInviteModal: () => void;
  onReturnToLanding: () => void;
  onOpenUserProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  familyMembers,
  currentMember,
  onSelectMember,
  monthlyLists,
  activeMonthKey,
  onSelectMonth,
  onOpenNewMonthModal,
  onOpenSupermarketMode,
  onOpenMobileInstallModal,
  unreadCount,
  authUser,
  onSignInWithGoogle,
  onSignOut,
  isSyncing,
  currentHousehold,
  onOpenInviteModal,
  onReturnToLanding,
  onOpenUserProfile,
}) => {
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showCloudDropdown, setShowCloudDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const activeList = monthlyLists.find((l) => l.monthKey === activeMonthKey);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
      {/* Top bar with family switcher & month selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-base sm:text-lg tracking-tight">
                  Despensa & Compras
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Familiar
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden md:block">
                Control de stock y presupuesto mensual compartido
              </p>
            </div>
          </div>

          {/* Center / Right controls: Month Selector + Member Switcher + Notifications + Supermarket Mode */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Month Picker Dropdown */}
            <div className="relative">
              <button
                id="month-selector-button"
                onClick={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowMemberDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                title="Cambiar mes de compra"
              >
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                  {activeList?.title || formatMonthTitle(activeMonthKey)}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {showMonthDropdown && (
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setShowMonthDropdown(false)}
                />
              )}

              {showMonthDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Listas Mensuales
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {monthlyLists.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          onSelectMonth(l.monthKey);
                          setShowMonthDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-stone-50 transition-colors ${
                          l.monthKey === activeMonthKey
                            ? "bg-emerald-50 text-emerald-900 font-semibold"
                            : "text-stone-700"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{l.title}</span>
                          <span className="text-xs text-stone-400">
                            Presupuesto: {formatCurrency(l.budget)} ({l.items.length} items)
                          </span>
                        </div>
                        {l.status === "completada" ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                            Cerrada
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                            Activa
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-stone-100 mt-1 pt-1 px-2">
                    <button
                      onClick={() => {
                        setShowMonthDropdown(false);
                        onOpenNewMonthModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Crear Nuevo Mes
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Session Members Viewer (Read-only list, no profile swapping) */}
            <div className="relative">
              <button
                id="session-members-button"
                onClick={() => {
                  setShowMemberDropdown(!showMemberDropdown);
                  setShowMonthDropdown(false);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                title="Ver qué integrantes están en esta sesión"
              >
                <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="hidden md:inline font-semibold">Integrantes</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {currentHousehold?.members?.length || familyMembers.length}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:inline" />
              </button>

              {/* Outside click backdrop for dropdown */}
              {showMemberDropdown && (
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setShowMemberDropdown(false)}
                />
              )}

              {showMemberDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-3 px-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        Integrantes en esta sesión
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {currentHousehold?.name || "Hogar Familiar"} • Código:{" "}
                        <span className="font-mono font-semibold text-stone-700">
                          {currentHousehold?.inviteCode || "FAM-2026"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Informational list of members: strictly read-only, cannot impersonate */}
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {(currentHousehold?.members && currentHousehold.members.length > 0
                      ? currentHousehold.members
                      : familyMembers.map((m) => ({
                          uid: m.id,
                          name: m.name,
                          email: m.email,
                          role: m.role as "Administrador" | "Familiar",
                          avatar: m.avatar,
                          joinedAt: new Date().toISOString(),
                        }))
                    ).map((m) => {
                      const isMe =
                        Boolean(authUser && (m.uid === authUser.uid ||
                        (authUser.email && m.email?.toLowerCase() === authUser.email.toLowerCase())));
                      const isSessionAdmin =
                        m.role === "Administrador" ||
                        (currentHousehold && m.uid === currentHousehold.ownerUid);

                      return (
                        <div
                          key={m.uid || m.email}
                          className={`px-2.5 py-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                            isMe ? "bg-emerald-50/80 border border-emerald-200/60" : "hover:bg-stone-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg shrink-0">{m.avatar || "👤"}</span>
                            <div className="min-w-0">
                              <div className="font-semibold text-stone-900 truncate flex items-center gap-1.5">
                                <span className="truncate">{m.name}</span>
                                {isMe && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-600 text-white shrink-0">
                                    Tú
                                  </span>
                                )}
                              </div>
                              {m.email && (
                                <div className="text-[10px] text-stone-400 truncate">
                                  {m.email}
                                </div>
                              )}
                            </div>
                          </div>

                          <span
                            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSessionAdmin
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {isSessionAdmin ? "👑 Admin" : "🛒 Familiar"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100">
                    <p className="text-[10px] text-stone-400 mb-2 leading-tight">
                      Sesión personal vinculada. Cada usuario gestiona la lista desde su propia cuenta.
                    </p>
                    <button
                      id="members-dropdown-invite-btn"
                      onClick={() => {
                        setShowMemberDropdown(false);
                        onOpenInviteModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Invitar a más familiares</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Supermarket Mode quick button */}
            <button
              id="supermarket-mode-button"
              onClick={onOpenSupermarketMode}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
              title="Abrir modo supermercado para tachar compras en tienda"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Modo Super</span>
            </button>

            {/* Notification Bell */}
            <button
              id="notification-tab-button"
              onClick={() => onSelectTab("notifications")}
              className={`relative p-2 rounded-lg border transition-colors cursor-pointer ${
                currentTab === "notifications"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
              title="Notificaciones y Alertas"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Unified User Account & Live Cloud Profile Button (No Duplicates) */}
            {authUser ? (
              <button
                id="user-profile-nav-button"
                onClick={onOpenUserProfile}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-300 text-stone-900 text-xs font-medium transition-all cursor-pointer shadow-xs shrink-0"
                title="Ver perfil, rol, sincronización en la nube o cerrar sesión"
              >
                {/* User Avatar with Live Cloud Connection Indicator */}
                <div className="relative shrink-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs overflow-hidden border border-emerald-300/60 shadow-xs">
                    {authUser.photoURL ? (
                      <img
                        src={authUser.photoURL}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      currentMember?.avatar || "👤"
                    )}
                  </div>
                  {/* Live green pulse dot indicating Firestore connection */}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse"
                    title="Conectado a Firebase Firestore en tiempo real"
                  />
                </div>

                {/* User Name & Role Badge */}
                <div className="text-left hidden sm:block leading-tight">
                  <div className="font-bold text-stone-900 truncate max-w-[110px] text-xs">
                    {authUser.displayName || authUser.email?.split("@")[0] || "Mi Perfil"}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {currentHousehold &&
                    (currentHousehold.ownerUid === authUser.uid ||
                      (currentHousehold.ownerEmail &&
                        authUser.email &&
                        currentHousehold.ownerEmail.toLowerCase() === authUser.email.toLowerCase())) ? (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200/80">
                        👑 Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                        🛒 Familiar
                      </span>
                    )}
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:inline ml-0.5" />
              </button>
            ) : (
              <button
                id="navbar-signin-google-button"
                onClick={onSignInWithGoogle}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isSyncing ? "Conectando..." : "Iniciar Sesión"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-stone-100 no-scrollbar">
          <button
            id="tab-monthly-hub"
            onClick={() => onSelectTab("lists")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              currentTab === "lists"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Mis Listas</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentTab === "lists"
                  ? "bg-emerald-800/80 text-emerald-100"
                  : "bg-stone-200 text-stone-700"
              }`}
            >
              {monthlyLists.length}
            </span>
          </button>

          <button
            id="tab-monthly-list"
            onClick={() => onSelectTab("list")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              currentTab === "list"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Lista de Compras</span>
            {activeList && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentTab === "list"
                    ? "bg-emerald-800/80 text-emerald-100"
                    : "bg-stone-200 text-stone-700"
                }`}
              >
                {activeList.items.length}
              </span>
            )}
          </button>

          <button
            id="tab-base-catalog"
            onClick={() => onSelectTab("catalog")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              currentTab === "catalog"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catálogo Base & Stock</span>
          </button>

          <button
            id="tab-ai-budget"
            onClick={() => onSelectTab("ai")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              currentTab === "ai"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Optimizar con IA</span>
          </button>

          <button
            id="tab-reports"
            onClick={() => onSelectTab("reports")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              currentTab === "reports"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reporte de Gastos</span>
          </button>

          <button
            id="tab-notifications"
            onClick={() => onSelectTab("notifications")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer sm:hidden ${
              currentTab === "notifications"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notificaciones ({unreadCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
