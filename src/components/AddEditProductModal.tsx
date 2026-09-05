import React, { useState, useEffect } from "react";
import { X, Package, DollarSign, Store, Tag } from "lucide-react";
import { BaseProduct, Category } from "../types";

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: BaseProduct) => void;
  productToEdit?: BaseProduct | null;
}

export const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Despensa y Granos");
  const [unit, setUnit] = useState<BaseProduct["unit"]>("uds");
  const [currentStock, setCurrentStock] = useState("1");
  const [minStock, setMinStock] = useState("2");
  const [idealStock, setIdealStock] = useState("4");
  const [currentPrice, setCurrentPrice] = useState("2.50");
  const [brand, setBrand] = useState("");
  const [favoriteStore, setFavoriteStore] = useState("Mercadona");
  const [notes, setNotes] = useState("");

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

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setUnit(productToEdit.unit);
      setCurrentStock(productToEdit.currentStock.toString());
      setMinStock(productToEdit.minStock.toString());
      setIdealStock(productToEdit.idealStock.toString());
      setCurrentPrice(productToEdit.currentPrice.toString());
      setBrand(productToEdit.brand || "");
      setFavoriteStore(productToEdit.favoriteStore || "");
      setNotes(productToEdit.notes || "");
    } else {
      setName("");
      setCategory("Despensa y Granos");
      setUnit("uds");
      setCurrentStock("1");
      setMinStock("2");
      setIdealStock("4");
      setCurrentPrice("2.50");
      setBrand("");
      setFavoriteStore("Mercadona");
      setNotes("");
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const priceNum = parseFloat(currentPrice) || 0;
    const currentStockNum = parseFloat(currentStock) || 0;
    const minStockNum = parseFloat(minStock) || 0;
    const idealStockNum = parseFloat(idealStock) || 0;
    const today = new Date().toISOString().split("T")[0];

    const updatedProduct: BaseProduct = {
      id: productToEdit ? productToEdit.id : `prod_${Date.now()}`,
      name: name.trim(),
      category,
      unit,
      currentStock: currentStockNum,
      minStock: minStockNum,
      idealStock: idealStockNum,
      currentPrice: priceNum,
      brand: brand.trim(),
      favoriteStore: favoriteStore.trim(),
      notes: notes.trim(),
      lastUpdated: today,
      priceHistory: productToEdit
        ? [
            ...productToEdit.priceHistory,
            // If price changed, add price record
            ...(Math.abs(productToEdit.currentPrice - priceNum) > 0.001
              ? [
                  {
                    id: `pr_${Date.now()}`,
                    date: today,
                    price: priceNum,
                    store: favoriteStore.trim() || "Tienda Habitual",
                  },
                ]
              : []),
          ]
        : [
            {
              id: `pr_${Date.now()}`,
              date: today,
              price: priceNum,
              store: favoriteStore.trim() || "Tienda Habitual",
            },
          ],
    };

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {productToEdit ? "Editar Producto Base" : "Nuevo Producto en Catálogo"}
              </h2>
              <p className="text-xs text-stone-500">
                Configuración de stock mínimo y precio de referencia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Arroz Redondo Extra 1kg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Unidad de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="uds">Unidades (uds)</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="g">Gramos (g)</option>
                <option value="L">Litros (L)</option>
                <option value="packs">Packs / Paquetes</option>
                <option value="botellas">Botellas</option>
                <option value="latas">Latas</option>
              </select>
            </div>
          </div>

          {/* Stock Levels: Current, Min, Ideal */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Stock en Casa
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Stock Mínimo (Alarma)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Stock Ideal
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={idealStock}
                onChange={(e) => setIdealStock(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-bold"
              />
            </div>
          </div>

          {/* Reference Price & Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Precio de Referencia (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Marca Habitual (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Hacendado / Gallo"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Favorite Store & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Supermercado / Tienda
              </label>
              <input
                type="text"
                placeholder="Ej. Mercadona, Lidl, Carrefour"
                value={favoriteStore}
                onChange={(e) => setFavoriteStore(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Notas / Consejos
              </label>
              <input
                type="text"
                placeholder="Ej. Comprar en pack familiar"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Footer */}
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
              {productToEdit ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
