import React, { useState } from "react";
import {
  X,
  Plus,
  Search,
  ShoppingCart,
  DollarSign,
  Users,
  CheckCircle2,
  Check,
  Package,
  AlertTriangle,
} from "lucide-react";
import { BaseProduct, FamilyMember, MonthlyList, MonthlyListItem } from "../types";
import { formatCurrency, getCategoryColor } from "../utils/helpers";

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseProducts: BaseProduct[];
  activeList: MonthlyList;
  currentMember: FamilyMember;
  onConfirmAdd: (
    productId: string,
    quantity: number,
    priority: "alta" | "media" | "baja",
    note?: string
  ) => void;
  preSelectedProduct?: BaseProduct | null;
}

export const AddToListModal: React.FC<AddToListModalProps> = ({
  isOpen,
  onClose,
  baseProducts,
  activeList,
  currentMember,
  onConfirmAdd,
  preSelectedProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preSelectedProduct ? preSelectedProduct.id : baseProducts[0]?.id || ""
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [priority, setPriority] = useState<"alta" | "media" | "baja">("media");
  const [note, setNote] = useState<string>("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  React.useEffect(() => {
    if (preSelectedProduct) {
      setSelectedProductId(preSelectedProduct.id);
    }
  }, [preSelectedProduct]);

  if (!isOpen) return null;

  const selectedProduct = baseProducts.find((p) => p.id === selectedProductId);
  const filteredProducts = baseProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const existingItemInList = activeList.items.find(
    (i) => i.productId === selectedProductId
  );

  const estimatedAdditionCost = selectedProduct
    ? selectedProduct.currentPrice * quantity
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;
    onConfirmAdd(selectedProductId, quantity, priority, note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Click outside backdrop */}
      <div
        id="add-to-list-backdrop"
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 leading-tight">
                Añadir a Lista de {activeList.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500">
                Usuario activo: <span className="font-semibold text-stone-700">{currentMember.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Product Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                1. Elige el Producto
              </label>
              <span className="text-[11px] text-stone-500">
                {filteredProducts.length} disponibles
              </span>
            </div>

            {/* Selected Product Banner for absolute visual clarity */}
            {selectedProduct && (
              <div className="mb-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 shadow-2xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Producto Seleccionado:</span>
                  </div>
                  <h4 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug mt-0.5 break-words">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-[11px] text-stone-600 mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-emerald-800">{selectedProduct.category}</span>
                    {selectedProduct.brand && <span>• {selectedProduct.brand}</span>}
                    <span>• Stock en casa: <strong>{selectedProduct.currentStock} {selectedProduct.unit}</strong></span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-black text-emerald-800 block">
                    {formatCurrency(selectedProduct.currentPrice)}
                  </span>
                  <span className="text-[10px] text-stone-500 block">
                    por {selectedProduct.unit}
                  </span>
                </div>
              </div>
            )}

            <div className="relative mb-2">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Escribe para buscar por nombre, categoría o marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="max-h-48 sm:max-h-56 overflow-y-auto space-y-1.5 border border-stone-200 rounded-2xl p-1.5 bg-stone-50/60">
              {filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-500">
                  No se encontraron productos con "{searchQuery}".
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const isSelected = prod.id === selectedProductId;
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setSelectedProductId(prod.id)}
                      className={`w-full text-left p-2.5 sm:p-3 rounded-xl text-xs flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white hover:bg-emerald-50/50 text-stone-800 border border-stone-100"
                      }`}
                    >
                      {/* Left: Product Name in bold + secondary line for Category & Stock */}
                      <div className="flex-1 min-w-0 pr-1">
                        <p
                          className={`font-bold text-xs sm:text-sm leading-snug break-words ${
                            isSelected ? "text-white" : "text-stone-900"
                          }`}
                        >
                          {prod.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              isSelected
                                ? "bg-emerald-700 text-white"
                                : "bg-stone-100 text-stone-600 border border-stone-200"
                            }`}
                          >
                            {prod.category}
                          </span>
                          {prod.brand && (
                            <span
                              className={`text-[10px] ${
                                isSelected ? "text-emerald-100" : "text-stone-500"
                              }`}
                            >
                              • {prod.brand}
                            </span>
                          )}
                          <span
                            className={`text-[10px] ${
                              isSelected
                                ? "text-emerald-100"
                                : prod.currentStock <= prod.minStock
                                ? "text-amber-600 font-semibold"
                                : "text-stone-400"
                            }`}
                          >
                            • Stock: {prod.currentStock} {prod.unit}
                          </span>
                        </div>
                      </div>

                      {/* Right: Unit price */}
                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs sm:text-sm font-extrabold block ${
                            isSelected ? "text-white" : "text-stone-900"
                          }`}
                        >
                          {formatCurrency(prod.currentPrice)}
                        </span>
                        <span
                          className={`text-[10px] block ${
                            isSelected ? "text-emerald-100" : "text-stone-400"
                          }`}
                        >
                          por {prod.unit}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* If already in monthly list notice */}
          {existingItemInList && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Este producto ya tiene {existingItemInList.quantity} {existingItemInList.unit} en la lista.</strong>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  La cantidad que introduzcas se <strong>sumará al total</strong> acumulado de la compra mensual.
                </p>
              </div>
            </div>
          )}

          {/* Quantity Stepper & Price Calculation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Cantidad a Añadir
              </label>
              <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-2xs font-bold text-stone-700 hover:bg-stone-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center text-sm font-bold bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-2xs font-bold text-stone-700 hover:bg-stone-100"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="baja">Baja</option>
                <option value="media">Media (Normal)</option>
                <option value="alta">Alta (Urgente / Falta ya)</option>
              </select>
            </div>
          </div>

          {/* Family Member Note */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nota o Motivo (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Para la merienda de Mateo, comprar marca blanca..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Budget Impact Calculation Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-900">
              Impacto en Presupuesto (+{quantity} {selectedProduct?.unit}):
            </span>
            <span className="text-sm font-extrabold text-emerald-900">
              +{formatCurrency(estimatedAdditionCost)}
            </span>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {existingItemInList ? "Sumar Cantidad" : "Añadir a la Lista"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
