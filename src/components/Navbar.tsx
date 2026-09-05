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
} from "lucide-react";
import { FamilyMember, MonthlyList, NotificationItem } from "../types";
import { formatCurrency, formatMonthTitle } from "../utils/helpers";
import { User } from "firebase/auth";

interface NavbarProps {
  currentTab: "list" | "catalog" | "ai" | "reports" | "notifications";
  onSelectTab: (tab: "list" | "catalog" | "ai" | "reports" | "notifications") => void;
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
                <span className="font-semibold">
                  {formatMonthTitle(activeMonthKey)}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

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

            {/* Cloud Realtime Sync / Google Login Widget */}
            <div className="relative">
              {authUser ? (
                <button
                  id="cloud-sync-status-button"
                  onClick={() => {
                    setShowCloudDropdown(!showCloudDropdown);
                    setShowMemberDropdown(false);
                    setShowMonthDropdown(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Sincronización en tiempo real activa con Firestore"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden xl:inline">Nube Activa</span>
                </button>
              ) : (
                <button
                  id="cloud-signin-button"
                  onClick={onSignInWithGoogle}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Conectar con Google para sincronizar en tiempo real entre móviles"
                >
                  <Cloud className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Conectar Nube</span>
                  <LogIn className="w-3 h-3 text-amber-700" />
                </button>
              )}

              {showCloudDropdown && authUser && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-100">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {authUser.photoURL ? (
                        <img
                          src={authUser.photoURL}
                          alt={authUser.displayName || "Google"}
                          className="w-8 h-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        (authUser.email?.[0] || "U").toUpperCase()
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {authUser.displayName || "Usuario Google"}
                      </p>
                      <p className="text-[10px] text-stone-500 truncate">
                        {authUser.email}
                      </p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-2 mb-2.5 text-[11px] text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sincronizando despensa con Firestore en tiempo real.</span>
                  </div>
                  <button
                    id="cloud-signout-button"
                    onClick={() => {
                      onSignOut();
                      setShowCloudDropdown(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión en este dispositivo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile / PWA App Guide Button */}
            <button
              id="mobile-install-button"
              onClick={onOpenMobileInstallModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Ver cómo instalar como App en Android o iPhone"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Instalar App</span>
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

            {/* Active Family Member Switcher */}
            <div className="relative">
              <button
                id="member-switcher-button"
                onClick={() => {
                  setShowMemberDropdown(!showMemberDropdown);
                  setShowMonthDropdown(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 bg-stone-50 transition-colors cursor-pointer"
                title="Cambiar usuario activo de la familia"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-xs"
                  style={{ backgroundColor: currentMember.color + "20" }}
                >
                  <span>{currentMember.avatar}</span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-stone-800 leading-tight">
                    {currentMember.name.split(" ")[0]}
                  </p>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    {currentMember.role}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {showMemberDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                  <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    ¿Quién está añadiendo?
                  </div>
                  {familyMembers.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectMember(m);
                        setShowMemberDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-stone-50 transition-colors ${
                        m.id === currentMember.id
                          ? "bg-emerald-50 text-emerald-900 font-semibold"
                          : "text-stone-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{m.avatar}</span>
                        <div>
                          <div className="text-xs font-medium text-stone-900">
                            {m.name}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {m.role}
                          </div>
                        </div>
                      </div>
                      {m.id === currentMember.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-stone-100 no-scrollbar">
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
