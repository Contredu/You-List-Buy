import React, { useState } from "react";
import {
  Calendar,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  ShoppingCart,
  Users,
  Copy,
  Check,
  Share2,
  Trash2,
  Search,
  Sparkles,
  Archive,
  ChevronRight,
  TrendingUp,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { MonthlyList, FamilyMember, Household } from "../types";
import { formatCurrency, formatMonthTitle, calculateListFinancials } from "../utils/helpers";
import { User } from "firebase/auth";

interface MonthlyListsHubViewProps {
  monthlyLists: MonthlyList[];
  activeListId: string | null;
  activeMonthKey: string;
  onSelectList: (list: MonthlyList) => void;
  onOpenNewMonthModal: () => void;
  onOpenInviteModal: (list?: MonthlyList) => void;
  onDeleteList: (listId: string) => void;
  currentMember: FamilyMember;
  household: Household;
  authUser: User | null;
  onShowToast: (msg: string) => void;
}

export const MonthlyListsHubView: React.FC<MonthlyListsHubViewProps> = ({
  monthlyLists,
  activeListId,
  activeMonthKey,
  onSelectList,
  onOpenNewMonthModal,
  onOpenInviteModal,
  onDeleteList,
  currentMember,
  household,
  authUser,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "activa" | "completada">("all");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [listIdToDelete, setListIdToDelete] = useState<string | null>(null);

  // Find active list (either matching activeListId or activeMonthKey, or first list)
  const activeList =
    monthlyLists.find((l) => (activeListId ? l.id === activeListId : l.monthKey === activeMonthKey)) ||
    monthlyLists[0] ||
    null;

  // Other historical lists (all except activeList)
  const otherLists = monthlyLists.filter((l) => (activeList ? l.id !== activeList.id : true));

  // Filtered other lists
  const filteredOtherLists = otherLists.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.monthKey.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "activa" && l.status !== "completada") ||
      (statusFilter === "completada" && l.status === "completada");
    return matchesSearch && matchesStatus;
  });

  const handleCopyCode = async (code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      onShowToast(`Código ${code} copiado al portapapeles`);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch {
      onShowToast(`Código: ${code}`);
    }
  };

  const handleShareListInvite = (list: MonthlyList, e: React.MouseEvent) => {
    e.stopPropagation();
    const code = list.inviteCode || household.inviteCode;
    const url = typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?join=${code}`
      : `https://app.com/?join=${code}`;
    const text = encodeURIComponent(
      `¡Hola! Únete a nuestra lista de compra "${list.title}".\n\nCódigo de invitación: ${code}\nEnlace: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const confirmDelete = (listId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteList(listId);
    setListIdToDelete(null);
  };

  const activeFinancials = activeList ? calculateListFinancials(activeList) : null;
  const activeBudgetPercent =
    activeList && activeList.budget > 0 && activeFinancials
      ? Math.min(100, Math.round((activeFinancials.estimatedTotal / activeList.budget) * 100))
      : 0;

  const totalListsCount = monthlyLists.length;
  const completedListsCount = monthlyLists.filter((l) => l.status === "completada").length;
  const totalProductsOverall = monthlyLists.reduce((acc, l) => acc + l.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {currentMember.role === "Administrador" ? "👑 Eres Administrador" : "👤 Familiar"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                {household.name || "Mi Hogar Familiar"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Centro de Listas Mensuales
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
              Aquí puedes revisar tus listas de compras de meses anteriores o planificar la lista para el siguiente mes. Cada lista cuenta con su propio código único de invitación familiar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              id="hub-create-next-month-btn"
              onClick={onOpenNewMonthModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Crear Lista del Siguiente Mes</span>
            </button>

            <button
              id="hub-invite-family-btn"
              onClick={() => onOpenInviteModal(activeList || undefined)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-stone-600" />
              <span>Invitar a Familiar</span>
            </button>
          </div>
        </div>

        {/* Quick Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-stone-100">
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Total Listas
            </div>
            <div className="text-xl font-extrabold text-stone-800 mt-0.5">
              {totalListsCount}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Meses Completados
            </div>
            <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
              {completedListsCount}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Productos en Historial
            </div>
            <div className="text-xl font-extrabold text-stone-800 mt-0.5">
              {totalProductsOverall}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Miembros en Hogar
            </div>
            <div className="text-xl font-extrabold text-stone-800 mt-0.5">
              {household.members?.length || 1}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Card: Active / In-Progress List */}
      {activeList && activeFinancials && (
        <div className="bg-gradient-to-br from-emerald-900 to-stone-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Lista Activa Principal
                </span>
                <span className="text-xs text-stone-300">
                  {formatMonthTitle(activeList.monthKey)}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {activeList.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Unique invite code for this active list */}
              {activeList.inviteCode && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white">
                  <span className="text-stone-300 text-[11px]">Código de Lista:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {activeList.inviteCode}
                  </span>
                  <button
                    onClick={(e) => handleCopyCode(activeList.inviteCode!, `active_${activeList.id}`, e)}
                    className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer text-stone-200"
                    title="Copiar código de esta lista"
                  >
                    {copiedCodeId === `active_${activeList.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleShareListInvite(activeList, e)}
                    className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer text-stone-200"
                    title="Compartir por WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                id="hub-open-active-list-btn"
                onClick={() => onSelectList(activeList)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-stone-950" />
                <span>Abrir Lista de Compras</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>
            </div>
          </div>

          {/* Active List Progress and Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            <div>
              <div className="text-xs text-stone-400 font-medium">Presupuesto Asignado</div>
              <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                {formatCurrency(activeList.budget)}
              </div>
            </div>
            <div>
              <div className="text-xs text-stone-400 font-medium">Gasto Estimado</div>
              <div className="text-lg sm:text-xl font-black text-emerald-300 mt-0.5">
                {formatCurrency(activeFinancials.estimatedTotal)}
              </div>
            </div>
            <div>
              <div className="text-xs text-stone-400 font-medium">Productos Comprados</div>
              <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                {activeFinancials.purchasedCount} / {activeFinancials.totalItemsCount} items
              </div>
            </div>
            <div>
              <div className="text-xs text-stone-400 font-medium">Estado del Periodo</div>
              <div className="text-sm sm:text-base font-bold text-stone-200 mt-1 capitalize">
                {activeList.status === "completada" ? "Completada" : "En Curso"}
              </div>
            </div>
          </div>

          {/* Budget progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-stone-300 mb-1 font-medium">
              <span>Uso del Presupuesto ({activeBudgetPercent}%)</span>
              <span>
                {formatCurrency(activeFinancials.estimatedTotal)} de {formatCurrency(activeList.budget)}
              </span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  activeBudgetPercent > 100
                    ? "bg-rose-500"
                    : activeBudgetPercent > 85
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${Math.min(100, activeBudgetPercent)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Historical Lists Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
              <Archive className="w-5 h-5 text-emerald-600" />
              <span>Historial de Listas y Meses Anteriores</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Consulta lo que se compró en cada mes, presupuestos anteriores y precios registrados.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar lista..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white font-medium text-stone-700"
            >
              <option value="all">Todos los estados</option>
              <option value="activa">En Curso</option>
              <option value="completada">Completadas</option>
            </select>
          </div>
        </div>

        {/* List of Previous Month Cards */}
        {filteredOtherLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOtherLists.map((list) => {
              const fin = calculateListFinancials(list);
              const isSelected = activeListId === list.id;
              const isConfirmingDelete = listIdToDelete === list.id;

              return (
                <div
                  key={list.id}
                  onClick={() => onSelectList(list)}
                  className={`group rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                    isSelected
                      ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300"
                      : "bg-stone-50/50 hover:bg-white border-stone-200"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                          {formatMonthTitle(list.monthKey)}
                        </span>
                        <h3 className="font-bold text-stone-900 text-base group-hover:text-emerald-700 transition-colors">
                          {list.title}
                        </h3>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          list.status === "completada"
                            ? "bg-stone-200 text-stone-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {list.status === "completada" ? "Cerrada" : "En Curso"}
                      </span>
                    </div>

                    {/* Financial Metrics */}
                    <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-white border border-stone-100 text-xs">
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                          Presupuesto
                        </span>
                        <span className="font-extrabold text-stone-800">
                          {formatCurrency(list.budget)}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                          Gasto Estimado
                        </span>
                        <span className="font-extrabold text-emerald-700">
                          {formatCurrency(fin.estimatedTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
                      <span>{fin.totalItemsCount} productos en lista</span>
                      <span className="font-semibold text-stone-700">
                        {fin.purchasedCount} comprados
                      </span>
                    </div>

                    {/* Unique Invite Code for this list */}
                    {list.inviteCode && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs mb-3"
                      >
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-[11px] text-stone-600">Código Familiar:</span>
                          <span className="font-mono font-bold text-emerald-900">
                            {list.inviteCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleCopyCode(list.inviteCode!, list.id, e)}
                            className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                            title="Copiar código"
                          >
                            {copiedCodeId === list.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleShareListInvite(list, e)}
                            className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                            title="Compartir por WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2"
                  >
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <span className="text-[11px] text-rose-700 font-semibold">¿Eliminar lista?</span>
                        <button
                          onClick={(e) => confirmDelete(list.id, e)}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer ml-auto"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setListIdToDelete(null)}
                          className="px-2 py-1 bg-stone-200 text-stone-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        {currentMember.role === "Administrador" && (
                          <button
                            onClick={() => setListIdToDelete(list.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar esta lista"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onSelectList(list)}
                          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          <span>Abrir Lista</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 px-4 rounded-2xl bg-stone-50 border border-dashed border-stone-200">
            <Archive className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-stone-700">
              No hay otras listas archivadas en este momento
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4">
              Cada mes puedes crear la lista del siguiente periodo con tu presupuesto y nombre personalizado para guardar un histórico completo de la despensa.
            </p>
            <button
              onClick={onOpenNewMonthModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Lista del Siguiente Mes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
