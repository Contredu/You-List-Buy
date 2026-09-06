import React, { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  AlertCircle,
  Store,
  Filter,
  Search,
  Users,
  Edit2,
  DollarSign,
  TrendingDown,
  ShoppingBag,
  ArrowRight,
  Info,
  Clock,
  ArrowDownToLine,
  Check,
} from "lucide-react";
import { Category, MonthlyList, MonthlyListItem, BaseProduct, FamilyMember } from "../types";
import { formatCurrency, getCategoryColor, calculateListFinancials } from "../utils/helpers";

interface MonthlyListViewProps {
  activeList: MonthlyList;
  baseProducts: BaseProduct[];
  currentMember: FamilyMember;
  onUpdateList: (updatedList: MonthlyList) => void;
  onOpenAddToListModal: () => void;
  onOpenSupermarketMode: () => void;
  onAutoImportLowStock: () => void;
  lowStockCount: number;
  onOpenInviteModal?: () => void;
  onOpenNewProductModal?: () => void;
  householdName?: string;
  householdInviteCode?: string;
}

export const MonthlyListView: React.FC<MonthlyListViewProps> = ({
  activeList,
  baseProducts,
  currentMember,
  onUpdateList,
  onOpenAddToListModal,
  onOpenSupermarketMode,
  onAutoImportLowStock,
  lowStockCount,
  onOpenInviteModal,
  onOpenNewProductModal,
  householdName,
  householdInviteCode,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "purchased">("all");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(activeList.budget.toString());
  const [editingActualPriceId, setEditingActualPriceId] = useState<string | null>(null);
  const [tempActualPrice, setTempActualPrice] = useState<string>("");

  const financials = calculateListFinancials(activeList);

  const categories: Category[] = [
    "Lácteos y Huevos",
    "Frutas y Verduras",
    "Carnes y Pescados",
    "Despensa y Granos",
    "Panadería y Dulces",
    "Bebidas",
    "Limpieza del Hogar",
    "Higiene y Cuidado Personal",
    "Congelados",
    "Mascotas",
    "Otros",
  ];

  // Filtered items
  const filteredItems = activeList.items.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" && !item.purchased) ||
      (filterStatus === "purchased" && item.purchased);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Toggle purchased state
  const handleTogglePurchased = (item: MonthlyListItem) => {
    const updatedItems = activeList.items.map((i) => {
      if (i.id === item.id) {
        const newPurchased = !i.purchased;
        return {
          ...i,
          purchased: newPurchased,
          purchasedBy: newPurchased ? currentMember.name : "",
          purchasedAt: newPurchased ? new Date().toISOString() : "",
          actualPrice: newPurchased && !i.actualPrice ? i.estimatedPrice : (i.actualPrice ?? i.estimatedPrice),
        };
      }
      return i;
    });

    onUpdateList({
      ...activeList,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    });
  };

  // Adjust item quantity (+1 / -1)
  const handleAdjustQuantity = (item: MonthlyListItem, delta: number) => {
    const newQty = Math.max(1, item.quantity + delta);
    if (newQty === item.quantity) return;

    const updatedItems = activeList.items.map((i) => {
      if (i.id === item.id) {
        // Record the adjustment under the active member
        const existingMemberIndex = i.addedBy.findIndex(
          (a) => a.memberId === currentMember.id
        );
        let newAddedBy = [...i.addedBy];
        if (existingMemberIndex >= 0) {
          newAddedBy[existingMemberIndex] = {
            ...newAddedBy[existingMemberIndex],
            quantityAdded: Math.max(
              1,
              newAddedBy[existingMemberIndex].quantityAdded + delta
            ),
            timestamp: new Date().toISOString(),
          };
        } else {
          newAddedBy.push({
            memberId: currentMember.id,
            memberName: currentMember.name,
            memberAvatar: currentMember.avatar,
            quantityAdded: Math.max(1, delta),
            timestamp: new Date().toISOString(),
          });
        }

        return {
          ...i,
          quantity: newQty,
          addedBy: newAddedBy,
        };
      }
      return i;
    });

    onUpdateList({
      ...activeList,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    });
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    const updatedItems = activeList.items.filter((i) => i.id !== itemId);
    onUpdateList({
      ...activeList,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    });
  };

  // Save actual purchased price
  const handleSaveActualPrice = (itemId: string) => {
    const priceNum = parseFloat(tempActualPrice);
    if (!isNaN(priceNum) && priceNum >= 0) {
      const updatedItems = activeList.items.map((i) => {
        if (i.id === itemId) {
          return { ...i, actualPrice: priceNum };
        }
        return i;
      });
      onUpdateList({
        ...activeList,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      });
    }
    setEditingActualPriceId(null);
  };

  // Save budget
  const handleSaveBudget = () => {
    const budgetNum = parseFloat(tempBudget);
    if (!isNaN(budgetNum) && budgetNum > 0) {
      onUpdateList({
        ...activeList,
        budget: budgetNum,
        updatedAt: new Date().toISOString(),
      });
    }
    setIsEditingBudget(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Financial Budget Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
                {activeList.title}
              </h1>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  financials.status === "exceeded"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : financials.status === "warning"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {financials.status === "exceeded"
                  ? "Presupuesto Superado"
                  : financials.status === "warning"
                  ? "Presupuesto en Riesgo (>85%)"
                  : "Dentro de Presupuesto"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Lista de compras compartida de la familia. Añade productos y cantidades acumulativas.
            </p>
            {householdInviteCode && (
              <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-600">
                <span className="inline-flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <Users className="w-3 h-3 text-emerald-600" />
                  {householdName || "Hogar Familiar"} (Código: {householdInviteCode})
                </span>
                {onOpenInviteModal && (
                  <button
                    onClick={onOpenInviteModal}
                    className="text-emerald-700 hover:text-emerald-900 font-semibold underline text-[11px] cursor-pointer"
                  >
                    Invitar a otros
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenInviteModal && (
              <button
                id="invite-family-list-header-btn"
                onClick={onOpenInviteModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Invitar a familiares a estar en esta misma sesión de compra"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Invitar a la Sesión</span>
              </button>
            )}

            {lowStockCount > 0 && (
              <button
                id="auto-import-low-stock-btn"
                onClick={onAutoImportLowStock}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Añadir automáticamente todos los productos con stock bajo"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Añadir {lowStockCount} con Stock Bajo</span>
              </button>
            )}

            <button
              id="open-supermarket-mode-btn"
              onClick={onOpenSupermarketMode}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modo Supermercado</span>
            </button>

            <button
              id="add-product-to-list-btn"
              onClick={onOpenAddToListModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Producto</span>
            </button>
          </div>
        </div>

        {/* Budget Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-5">
          {/* Presupuesto Asignado */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">
                Presupuesto Mensual
              </span>
              <button
                onClick={() => {
                  setTempBudget(activeList.budget.toString());
                  setIsEditingBudget(true);
                }}
                className="p-1 text-stone-400 hover:text-emerald-600 rounded-md hover:bg-stone-200 transition-colors"
                title="Editar límite presupuestario"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {isEditingBudget ? (
              <div className="flex items-center gap-1.5 mt-1.5">
                <input
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  className="w-24 px-2 py-1 text-sm font-bold border border-emerald-400 rounded-md bg-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveBudget}
                  className="px-2 py-1 bg-emerald-600 text-white text-xs font-medium rounded-md"
                >
                  OK
                </button>
              </div>
            ) : (
              <p className="text-lg sm:text-xl font-bold text-stone-900 mt-1">
                {formatCurrency(activeList.budget)}
              </p>
            )}
            <span className="text-[11px] text-stone-400">
              Límite configurado
            </span>
          </div>

          {/* Gasto Proyectado Total */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-xs font-medium text-stone-500">
              Costo Proyectado Lista
            </span>
            <p
              className={`text-lg sm:text-xl font-bold mt-1 ${
                financials.projectedTotal > activeList.budget
                  ? "text-rose-600"
                  : "text-stone-900"
              }`}
            >
              {formatCurrency(financials.projectedTotal)}
            </p>
            <span className="text-[11px] text-stone-400">
              {financials.percentSpent}% del presupuesto
            </span>
          </div>

          {/* Comprado hasta ahora */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-xs font-medium text-emerald-800">
              Comprado Real
            </span>
            <p className="text-lg sm:text-xl font-bold text-emerald-900 mt-1">
              {formatCurrency(financials.purchasedTotal)}
            </p>
            <span className="text-[11px] text-emerald-700">
              {financials.purchasedCount} de {financials.totalItemsCount} productos
            </span>
          </div>

          {/* Saldo Restante Disponible */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-xs font-medium text-stone-500">
              Saldo Disponible
            </span>
            <p
              className={`text-lg sm:text-xl font-bold mt-1 ${
                financials.remainingBudget < 0
                  ? "text-rose-600"
                  : "text-emerald-600"
              }`}
            >
              {formatCurrency(financials.remainingBudget)}
            </p>
            <span className="text-[11px] text-stone-400">
              {financials.remainingBudget < 0
                ? "Exceso de gasto"
                : "Margen de ahorro"}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span>Progreso del Presupuesto</span>
            <span className="font-semibold text-stone-700">
              {financials.percentSpent}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 ${
                financials.status === "exceeded"
                  ? "bg-rose-500"
                  : financials.status === "warning"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, financials.percentSpent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-monthly-items-input"
            type="text"
            placeholder="Buscar en la lista del mes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category selector */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="filter-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center rounded-lg bg-stone-100 p-0.5 text-xs">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterStatus === "all"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Todos ({activeList.items.length})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterStatus === "pending"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Faltan ({activeList.items.filter((i) => !i.purchased).length})
            </button>
            <button
              onClick={() => setFilterStatus("purchased")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterStatus === "purchased"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Comprados ({financials.purchasedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-800">
            {activeList.items.length === 0
              ? baseProducts.length === 0
                ? "Tu lista y despensa están listas para comenzar"
                : "Tu lista de compras está vacía"
              : "No hay productos que coincidan con la búsqueda"}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1 mb-5 leading-relaxed">
            {activeList.items.length === 0
              ? baseProducts.length === 0
                ? "Comienza registrando los productos habituales de tu casa (leche, huevos, aceite...) en el catálogo para armar tus listas mensuales."
                : "Añade productos desde tu catálogo base para planificar las compras y controlar el gasto familiar de este mes."
              : "Prueba ajustando los filtros o el texto de búsqueda."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {baseProducts.length === 0 && onOpenNewProductModal && (
              <button
                onClick={onOpenNewProductModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Crear Primer Producto</span>
              </button>
            )}
            <button
              onClick={onOpenAddToListModal}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                baseProducts.length === 0
                  ? "bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Añadir a la Lista</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const catColors = getCategoryColor(item.category);
            const unitPrice =
              item.actualPrice !== undefined ? item.actualPrice : item.estimatedPrice;
            const itemTotal = unitPrice * item.quantity;
            const baseProd = baseProducts.find((p) => p.id === item.productId);

            return (
              <div
                key={item.id}
                id={`monthly-item-${item.id}`}
                className={`bg-white rounded-xl border transition-all duration-200 p-3 sm:p-4 ${
                  item.purchased
                    ? "border-emerald-200 bg-emerald-50/20 opacity-80"
                    : "border-stone-200 hover:border-stone-300 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Top (Mobile) / Left (Desktop): Checkbox + Product Details + Mobile Delete */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleTogglePurchased(item)}
                      className={`mt-0.5 sm:mt-0 p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        item.purchased
                          ? "text-emerald-600 hover:text-emerald-700"
                          : "text-stone-300 hover:text-stone-500"
                      }`}
                      title={
                        item.purchased
                          ? "Marcar como pendiente"
                          : "Marcar como comprado"
                      }
                    >
                      {item.purchased ? (
                        <CheckCircle2 className="w-6 h-6 fill-emerald-100" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span
                          className={`font-bold text-sm sm:text-base leading-snug break-words ${
                            item.purchased
                              ? "line-through text-stone-500"
                              : "text-stone-900"
                          }`}
                        >
                          {item.productName}
                        </span>

                        {/* Category Badge */}
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md border whitespace-nowrap ${catColors.bg} ${catColors.text} ${catColors.border}`}
                        >
                          {item.category}
                        </span>

                        {/* Priority Badge if Alta */}
                        {item.priority === "alta" && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                            Urgente
                          </span>
                        )}

                        {/* Current home stock indicator */}
                        {baseProd && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md whitespace-nowrap ${
                              baseProd.currentStock <= baseProd.minStock
                                ? "bg-amber-50 text-amber-700 font-medium"
                                : "text-stone-400"
                            }`}
                          >
                            Stock en casa: {baseProd.currentStock} {baseProd.unit}
                          </span>
                        )}
                      </div>

                      {/* Family members breakdown who requested this item */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs text-stone-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-stone-400" />
                          <span className="text-[11px] font-medium text-stone-600">
                            Solicitado por:
                          </span>
                        </div>
                        {item.addedBy.map((entry, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-100 text-[11px] text-stone-700 font-medium"
                            title={entry.note || `Añadido el ${entry.timestamp.split("T")[0]}`}
                          >
                            <span>{entry.memberAvatar}</span>
                            <span>{entry.memberName.split(" ")[0]}</span>
                            <span className="text-emerald-700 font-bold">
                              (+{entry.quantityAdded})
                            </span>
                            {entry.note && (
                              <span className="text-stone-400 italic text-[10px]">
                                "{entry.note}"
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mobile-only Delete Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="sm:hidden p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
                      title="Eliminar de la lista mensual"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom (Mobile) / Right (Desktop): Quantity controls + Price subtotal + Desktop Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t border-stone-100 sm:border-t-0 shrink-0">
                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2">
                      <span className="sm:hidden text-xs text-stone-500 font-medium">Cantidad:</span>
                      <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 p-0.5">
                        <button
                          onClick={() => handleAdjustQuantity(item, -1)}
                          className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-stone-600 hover:bg-white hover:text-stone-900 rounded-md transition-colors font-bold text-sm cursor-pointer"
                          title="Restar 1"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs sm:text-sm font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleAdjustQuantity(item, 1)}
                          className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-stone-600 hover:bg-white hover:text-stone-900 rounded-md transition-colors font-bold text-sm cursor-pointer"
                          title="Sumar 1"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price calculation */}
                    <div className="text-right min-w-[75px] sm:min-w-[95px]">
                      <div className="text-sm sm:text-base font-bold text-stone-900">
                        {formatCurrency(itemTotal)}
                      </div>
                      <div className="text-[10px] text-stone-400 flex items-center justify-end gap-1">
                        {editingActualPriceId === item.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.05"
                              value={tempActualPrice}
                              onChange={(e) => setTempActualPrice(e.target.value)}
                              className="w-14 px-1 py-0.5 text-[10px] border border-emerald-400 rounded bg-white"
                              placeholder="Precio"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveActualPrice(item.id)}
                              className="p-0.5 text-emerald-600"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() => {
                              setEditingActualPriceId(item.id);
                              setTempActualPrice(
                                (item.actualPrice || item.estimatedPrice).toString()
                              );
                            }}
                            className="cursor-pointer hover:text-emerald-700 underline decoration-dotted"
                            title="Click para ajustar precio unitario"
                          >
                            {formatCurrency(unitPrice)}/ud
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Desktop delete button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="hidden sm:block p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar de la lista mensual"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Purchased footer note */}
                {item.purchased && item.purchasedBy && (
                  <div className="mt-2 pt-2 border-t border-emerald-100/60 flex items-center justify-between text-[11px] text-emerald-800">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Comprado por <strong>{item.purchasedBy}</strong>
                    </span>
                    {item.purchasedAt && (
                      <span className="text-emerald-600/80">
                        {item.purchasedAt.split("T")[0]}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
