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
  Menu,
  X,
  Copy,
  Check,
  ArrowRight,
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
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const activeList = monthlyLists.find((l) => l.monthKey === activeMonthKey);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSelectTabMobile = (tab: "lists" | "list" | "catalog" | "ai" | "reports" | "notifications") => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Logo & App Name */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => onSelectTab("lists")}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs shrink-0 cursor-pointer"
                title="Ir a Mis Listas"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-900 text-sm sm:text-base md:text-lg tracking-tight truncate">
                    Despensa & Compras
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    Familiar
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 hidden md:block truncate">
                  Control de stock y presupuesto mensual compartido
                </p>
              </div>
            </div>

            {/* Desktop Center / Right Controls (Hidden on Mobile < md) */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
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
                  <span className="font-semibold truncate max-w-[140px] sm:max-w-[190px]">
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

              {/* Session Members Viewer */}
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

              {/* User Profile Button */}
              {authUser ? (
                <button
                  id="user-profile-nav-button"
                  onClick={onOpenUserProfile}
                  className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-300 text-stone-900 text-xs font-medium transition-all cursor-pointer shadow-xs shrink-0"
                  title="Ver perfil, rol, sincronización en la nube o cerrar sesión"
                >
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
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse"
                      title="Conectado a Firebase Firestore en tiempo real"
                    />
                  </div>

                  <div className="text-left hidden lg:block leading-tight">
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

                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden lg:inline ml-0.5" />
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

            {/* Mobile Header Controls (Visible only on < md: iPhone 13, etc.) */}
            <div className="flex md:hidden items-center gap-1.5 shrink-0">
              {/* Compact Month Pill button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-semibold max-w-[130px] truncate"
                title="Cambiar lista activa"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{activeList?.title || "Lista"}</span>
              </button>

              {/* Mobile Notification Bell */}
              <button
                type="button"
                id="mobile-notification-bell"
                onClick={() => onSelectTab("notifications")}
                className={`relative p-2 rounded-xl border transition-colors ${
                  currentTab === "notifications"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-stone-50 border-stone-200 text-stone-700"
                }`}
                title="Notificaciones"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger Menu Toggle Button */}
              <button
                type="button"
                id="mobile-hamburger-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  isMobileMenuOpen
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                }`}
                aria-label="Abrir menú de navegación"
                title="Menú de opciones"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Menu className="w-5 h-5 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on Mobile to eliminate horizontal sliding!) */}
          <div className="hidden md:flex items-center gap-1 sm:gap-2 py-2 border-t border-stone-100">
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
          </div>
        </div>
      </header>

      {/* Mobile Hamburger Drawer / Modal Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
            {/* Drawer Drag handle & Header */}
            <div className="p-4 pb-3 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base leading-none">
                    Menú Principal
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {currentHousehold?.name || "Hogar Familiar"} • Código:{" "}
                    <span className="font-mono font-bold text-stone-700">
                      {currentHousehold?.inviteCode || "FAM-2026"}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="close-mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Quick Active List Switcher Card */}
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Lista Activa Actual
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenNewMonthModal();
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Nueva Lista
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {monthlyLists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => {
                        onSelectMonth(list.monthKey);
                        handleSelectTabMobile("list");
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                        list.monthKey === activeMonthKey
                          ? "bg-emerald-600 text-white font-bold shadow-xs"
                          : "bg-white hover:bg-stone-100 text-stone-800 border border-stone-200/70"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs truncate">{list.title}</div>
                        <div
                          className={`text-[10px] ${
                            list.monthKey === activeMonthKey ? "text-emerald-100" : "text-stone-400"
                          }`}
                        >
                          Presupuesto: {formatCurrency(list.budget)} • {list.items.length} productos
                        </div>
                      </div>
                      {list.monthKey === activeMonthKey && (
                        <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded-full font-bold">
                          Activa
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Navigation Options (Large Touch Targets, No Horizontal Scroll) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-1">
                  Secciones de la App
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTabMobile("lists")}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left ${
                    currentTab === "lists"
                      ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        currentTab === "lists" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm">Mis Listas</div>
                      <div
                        className={`text-xs ${
                          currentTab === "lists" ? "text-emerald-100" : "text-stone-400"
                        }`}
                      >
                        Historial y creación de listas por mes
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      currentTab === "lists" ? "bg-white/20 text-white" : "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {monthlyLists.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTabMobile("list")}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left ${
                    currentTab === "list"
                      ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        currentTab === "list" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm">Lista de Compras</div>
                      <div
                        className={`text-xs ${
                          currentTab === "list" ? "text-emerald-100" : "text-stone-400"
                        }`}
                      >
                        {activeList ? activeList.title : "Ver productos del mes"}
                      </div>
                    </div>
                  </div>
                  {activeList && (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        currentTab === "list" ? "bg-white/20 text-white" : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {activeList.items.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTabMobile("catalog")}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left ${
                    currentTab === "catalog"
                      ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        currentTab === "catalog" ? "bg-white/20 text-white" : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm">Catálogo Base & Stock</div>
                      <div
                        className={`text-xs ${
                          currentTab === "catalog" ? "text-emerald-100" : "text-stone-400"
                        }`}
                      >
                        Despensa de casa, stock mínimo e ideal
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTabMobile("ai")}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left ${
                    currentTab === "ai"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md"
                      : "bg-amber-50/70 hover:bg-amber-100/80 text-amber-950 border border-amber-200/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        currentTab === "ai" ? "bg-white/20 text-white" : "bg-amber-200 text-amber-900"
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        <span>Optimizar con IA</span>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-400 text-amber-950">
                          Gemini
                        </span>
                      </div>
                      <div
                        className={`text-xs ${
                          currentTab === "ai" ? "text-amber-100" : "text-amber-800/80"
                        }`}
                      >
                        Consejos de ahorro y análisis de precios
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTabMobile("reports")}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left ${
                    currentTab === "reports"
                      ? "bg-emerald-600 text-white font-bold shadow-md"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        currentTab === "reports" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm">Reporte de Gastos</div>
                      <div
                        className={`text-xs ${
                          currentTab === "reports" ? "text-emerald-100" : "text-stone-400"
                        }`}
                      >
                        Evolución mensual y desglose por categorías
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTabMobile("notifications")}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left ${
                    currentTab === "notifications"
                      ? "bg-emerald-600 text-white font-bold shadow-md"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        currentTab === "notifications"
                          ? "bg-white/20 text-white"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm">Notificaciones</div>
                      <div
                        className={`text-xs ${
                          currentTab === "notifications" ? "text-emerald-100" : "text-stone-400"
                        }`}
                      >
                        Alertas de stock y avisos del hogar
                      </div>
                    </div>
                  </div>
                  {unreadCount > 0 ? (
                    <span className="text-xs bg-rose-500 text-white px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                      {unreadCount} nuevas
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  )}
                </button>
              </div>

              {/* Action Buttons: Supermarket Mode & Family Invite */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSupermarketMode();
                  }}
                  className="w-full p-3.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Abrir Modo Supermercado</span>
                </button>

                <div className="bg-emerald-50/80 rounded-2xl p-3 border border-emerald-200/80 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      Invitar a Familiares
                    </div>
                    <div className="text-[11px] text-emerald-800 mt-0.5 truncate">
                      Código: <span className="font-mono font-bold">{currentHousehold?.inviteCode || "FAM-2026"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(currentHousehold?.inviteCode || "FAM-2026")}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? "Copiado" : "Copiar"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenInviteModal();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-2xs"
                    >
                      Ver más
                    </button>
                  </div>
                </div>
              </div>

              {/* User Account & Profile Footer */}
              <div className="pt-2 border-t border-stone-100">
                {authUser ? (
                  <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs overflow-hidden border border-emerald-300 shrink-0">
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
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 text-xs truncate">
                          {authUser.displayName || authUser.email?.split("@")[0] || "Mi Perfil"}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate">
                          {authUser.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenUserProfile();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold shadow-2xs"
                      >
                        Perfil
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onSignOut();
                        }}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs"
                        title="Cerrar sesión"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSignInWithGoogle();
                    }}
                    className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión con Google</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (iPhone 13 native layout - thumb-accessible, no horizontal scrolling) */}
      <nav
        id="mobile-bottom-nav-bar"
        className="fixed bottom-0 inset-x-0 z-20 md:hidden bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 shadow-lg flex items-center justify-around"
      >
        <button
          type="button"
          onClick={() => onSelectTab("lists")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] ${
            currentTab === "lists"
              ? "text-emerald-700 font-bold"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Calendar className={`w-5 h-5 ${currentTab === "lists" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[10px] mt-0.5 leading-none">Listas</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("list")}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] ${
            currentTab === "list"
              ? "text-emerald-700 font-bold"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <ShoppingCart className={`w-5 h-5 ${currentTab === "list" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[10px] mt-0.5 leading-none">Compra</span>
          {activeList && activeList.items.length > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
              {activeList.items.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("catalog")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] ${
            currentTab === "catalog"
              ? "text-emerald-700 font-bold"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Package className={`w-5 h-5 ${currentTab === "catalog" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[10px] mt-0.5 leading-none">Despensa</span>
        </button>

        {/* Quick Supermarket Mode bottom button */}
        <button
          type="button"
          onClick={onOpenSupermarketMode}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-stone-700 hover:text-stone-900 transition-all cursor-pointer min-w-[56px]"
          title="Modo Supermercado"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Store className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] mt-0.5 font-semibold text-emerald-800 leading-none">Super</span>
        </button>

        {/* Mobile Menu trigger */}
        <button
          type="button"
          id="mobile-bottom-menu-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] ${
            isMobileMenuOpen || currentTab === "ai" || currentTab === "reports" || currentTab === "notifications"
              ? "text-emerald-700 font-bold"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] mt-0.5 leading-none">Menú</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>
      </nav>
    </>
  );
};
