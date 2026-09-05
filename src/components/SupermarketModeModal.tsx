import React, { useState } from "react";
import {
  X,
  Store,
  CheckCircle2,
  Circle,
  ShoppingCart,
  DollarSign,
  Layers,
  Sparkles,
  ArrowLeft,
  Check,
} from "lucide-react";
import { MonthlyList, MonthlyListItem, BaseProduct, FamilyMember } from "../types";
import { formatCurrency, getCategoryColor, calculateListFinancials } from "../utils/helpers";

interface SupermarketModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeList: MonthlyList;
  currentMember: FamilyMember;
  onUpdateList: (updatedList: MonthlyList) => void;
  onFinalizeShoppingAndReplenishStock: () => void;
}

export const SupermarketModeModal: React.FC<SupermarketModeModalProps> = ({
  isOpen,
  onClose,
  activeList,
  currentMember,
  onUpdateList,
  onFinalizeShoppingAndReplenishStock,
}) => {
  const [showOnlyPending, setShowOnlyPending] = useState(true);

  if (!isOpen) return null;

  const financials = calculateListFinancials(activeList);

  // Group items by category (like store aisles)
  const groupedItems: { [category: string]: MonthlyListItem[] } = {};
  activeList.items.forEach((item) => {
    if (showOnlyPending && item.purchased) return;
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

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

  return (
    <div className="fixed inset-0 z-50 bg-stone-900 text-white flex flex-col animate-in fade-in duration-150">
      {/* Top Header Bar */}
      <div className="bg-stone-950 border-b border-stone-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-sm sm:text-base text-white">
                Modo Supermercado: {activeList.title}
              </h2>
            </div>
            <p className="text-[11px] text-stone-400">
              Comprando como: <span className="text-emerald-400 font-semibold">{currentMember.name}</span>
            </p>
          </div>
        </div>

        {/* Financial Gauge in Supermarket Mode */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
              En Carrito
            </span>
            <span className="text-base font-extrabold text-emerald-400">
              {formatCurrency(financials.purchasedTotal)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Floating Sticky Status Banner */}
      <div className="bg-stone-800/90 backdrop-blur border-b border-stone-700 px-4 sm:px-6 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-200">
            {financials.purchasedCount} de {financials.totalItemsCount} productos tachados
          </span>
          <span className="text-stone-400">
            (Restante estimado: {formatCurrency(financials.pendingTotal)})
          </span>
        </div>

        <button
          onClick={() => setShowOnlyPending(!showOnlyPending)}
          className="text-xs px-2.5 py-1 rounded-lg bg-stone-700 hover:bg-stone-600 font-medium text-stone-200"
        >
          {showOnlyPending ? "Mostrar Todos" : "Ocultar Comprados"}
        </button>
      </div>

      {/* Main Checklist Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">
              ¡Todos los productos han sido comprados!
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 mb-6 max-w-md mx-auto">
              Has completado la lista de compras del mes. Puedes reponer el stock en la despensa familiar ahora.
            </p>
            <button
              onClick={() => {
                onFinalizeShoppingAndReplenishStock();
                onClose();
              }}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm shadow-lg cursor-pointer"
            >
              Finalizar y Sumar al Stock de Despensa
            </button>
          </div>
        ) : (
          Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-2">
              {/* Category / Supermarket Section Header */}
              <div className="flex items-center gap-2 pb-1 border-b border-stone-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {category}
                </span>
                <span className="text-[10px] text-stone-500">
                  ({items.length} {items.length === 1 ? "artículo" : "artículos"})
                </span>
              </div>

              {/* Items in this category */}
              <div className="grid grid-cols-1 gap-2.5">
                {items.map((item) => {
                  const price =
                    item.actualPrice !== undefined ? item.actualPrice : item.estimatedPrice;
                  const total = price * item.quantity;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleTogglePurchased(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                        item.purchased
                          ? "bg-stone-900/40 border-stone-800 opacity-50"
                          : "bg-stone-800/90 border-stone-700 hover:border-emerald-500/60 shadow-sm"
                      }`}
                    >
                      {/* Left: Huge tap-friendly checkbox + item info */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                            item.purchased
                              ? "bg-emerald-500 text-stone-950"
                              : "border-2 border-stone-500 text-transparent"
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`font-bold text-sm sm:text-base ${
                              item.purchased
                                ? "line-through text-stone-500"
                                : "text-stone-100"
                            }`}
                          >
                            {item.productName}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-stone-400">
                            <span className="font-semibold text-emerald-400">
                              {item.quantity} {item.unit}
                            </span>
                            {item.notes && (
                              <span className="italic text-stone-400 text-[11px]">
                                • {item.notes}
                              </span>
                            )}
                            {item.addedBy.length > 0 && (
                              <span className="text-[10px] text-stone-500">
                                (Pidio: {item.addedBy.map((a) => a.memberName.split(" ")[0]).join(", ")})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Subtotal */}
                      <div className="text-right shrink-0">
                        <span className="font-bold text-sm sm:text-base text-white">
                          {formatCurrency(total)}
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          {formatCurrency(price)}/ud
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Footer Actions in Supermarket Mode */}
      <div className="bg-stone-950 border-t border-stone-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Toca cualquier producto para tacharlo conforme lo metas al carrito.</span>
        </div>

        <button
          onClick={() => {
            onFinalizeShoppingAndReplenishStock();
            onClose();
          }}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
        >
          Guardar Compra & Actualizar Stock Despensa
        </button>
      </div>
    </div>
  );
};
