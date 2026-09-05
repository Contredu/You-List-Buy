import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Package,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  History,
  CheckCircle2,
  Store,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import { BaseProduct, Category, FamilyMember } from "../types";
import {
  formatCurrency,
  getCategoryColor,
  calculatePriceTrend,
  formatDateSpanish,
} from "../utils/helpers";

interface BaseCatalogViewProps {
  products: BaseProduct[];
  currentMember: FamilyMember;
  onEditProduct: (product: BaseProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onOpenNewProductModal: () => void;
  onOpenPriceHistoryModal: (product: BaseProduct) => void;
  onAddProductToCurrentList: (product: BaseProduct) => void;
  onQuickUpdateStock: (productId: string, newStock: number) => void;
}

export const BaseCatalogView: React.FC<BaseCatalogViewProps> = ({
  products,
  currentMember,
  onEditProduct,
  onDeleteProduct,
  onOpenNewProductModal,
  onOpenPriceHistoryModal,
  onAddProductToCurrentList,
  onQuickUpdateStock,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "ok">("all");
  const [sortBy, setSortBy] = useState<"name" | "stock" | "price" | "category">("name");

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

  // Filtering & Sorting
  const filteredProducts = products
    .filter((prod) => {
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.brand && prod.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (prod.notes && prod.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === "all" || prod.category === selectedCategory;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && prod.currentStock <= prod.minStock) ||
        (stockFilter === "ok" && prod.currentStock > prod.minStock);

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return b.currentPrice - a.currentPrice;
      if (sortBy === "stock") return a.currentStock - b.currentStock;
      if (sortBy === "category") return a.category.localeCompare(b.category);
      return 0;
    });

  const lowStockTotal = products.filter((p) => p.currentStock <= p.minStock).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              Catálogo Base & Control de Stock
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
              {products.length} productos registrados
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Base de datos configurable con histórico de precios, stock actual de la despensa y umbrales mínimos.
          </p>
        </div>

        <button
          id="btn-create-base-product"
          onClick={onOpenNewProductModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto Base</span>
        </button>
      </div>

      {/* Stock Health Badges Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">Total Productos</p>
              <p className="text-lg font-bold text-stone-900">{products.length}</p>
            </div>
          </div>
          <span className="text-xs text-stone-400">En despensa</span>
        </div>

        <div
          onClick={() => setStockFilter(stockFilter === "low" ? "all" : "low")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            lowStockTotal > 0
              ? "bg-amber-50/70 border-amber-200 hover:bg-amber-100/70"
              : "bg-white border-stone-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-amber-800 font-medium">Stock Crítico / Agotado</p>
              <p className="text-lg font-bold text-amber-900">{lowStockTotal}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-700">
            {stockFilter === "low" ? "Filtrando activos" : "Ver faltantes"}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">Precios Históricos</p>
              <p className="text-lg font-bold text-stone-900">
                {products.reduce((acc, p) => acc + p.priceHistory.length, 0)} registros
              </p>
            </div>
          </div>
          <span className="text-xs text-stone-400">Multi-tiendas</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-base-catalog-input"
            type="text"
            placeholder="Buscar por nombre, marca o notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            id="select-base-category"
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

          {/* Sort By */}
          <select
            id="select-base-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="name">Ordenar por Nombre</option>
            <option value="stock">Ordenar por Stock (Menor a Mayor)</option>
            <option value="price">Ordenar por Precio (Mayor a Menor)</option>
            <option value="category">Ordenar por Categoría</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">
            No se encontraron productos
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 mb-4">
            Prueba ajustando los filtros o añade un nuevo producto base al catálogo.
          </p>
          <button
            onClick={onOpenNewProductModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            Añadir Producto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => {
            const catColor = getCategoryColor(prod.category);
            const trend = calculatePriceTrend(prod);
            const isLowStock = prod.currentStock <= prod.minStock;

            return (
              <div
                key={prod.id}
                id={`base-product-card-${prod.id}`}
                className={`bg-white rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between ${
                  isLowStock
                    ? "border-amber-300 ring-1 ring-amber-300/50 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 shadow-xs"
                }`}
              >
                <div>
                  {/* Top Bar: Category badge & Action Buttons */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${catColor.bg} ${catColor.text} ${catColor.border}`}
                    >
                      {prod.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditProduct(prod)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar producto base"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(prod.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar producto del catálogo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Product Title & Brand */}
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug break-words">
                    {prod.name}
                  </h3>
                  {prod.brand && (
                    <p className="text-xs text-stone-500 mt-0.5">
                      Marca: <span className="font-medium text-stone-700">{prod.brand}</span>
                    </p>
                  )}

                  {/* Price & Price Trend Tag */}
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-bold text-stone-900">
                        {formatCurrency(prod.currentPrice)}
                      </span>
                      <span className="text-xs text-stone-400 ml-1">
                        /{prod.unit}
                      </span>
                    </div>

                    {/* Price Trend Badge */}
                    <button
                      onClick={() => onOpenPriceHistoryModal(prod)}
                      className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium border cursor-pointer transition-colors ${
                        trend.direction === "up"
                          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          : trend.direction === "down"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                      }`}
                      title="Ver gráfico y registros históricos de precios"
                    >
                      {trend.direction === "up" && (
                        <>
                          <TrendingUp className="w-3 h-3 text-rose-500" />
                          <span>+{trend.percent}%</span>
                        </>
                      )}
                      {trend.direction === "down" && (
                        <>
                          <TrendingDown className="w-3 h-3 text-emerald-600" />
                          <span>{trend.percent}%</span>
                        </>
                      )}
                      {trend.direction === "equal" && <span>Estable</span>}
                      {trend.direction === "single" && <span>1 Registro</span>}
                      <History className="w-3 h-3 text-stone-400 ml-0.5" />
                    </button>
                  </div>

                  {/* Stock Management Box */}
                  <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-medium text-stone-600 flex items-center gap-1.5">
                        Stock en Casa
                        {isLowStock && (
                          <span className="text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded font-bold">
                            Bajo
                          </span>
                        )}
                      </span>
                      <span className="text-stone-400 text-[11px]">
                        Mín: {prod.minStock} {prod.unit}
                      </span>
                    </div>

                    {/* Stock stepper & visual meter */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center border border-stone-200 rounded-lg bg-white p-0.5">
                        <button
                          onClick={() =>
                            onQuickUpdateStock(
                              prod.id,
                              Math.max(0, prod.currentStock - 1)
                            )
                          }
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded font-bold text-xs cursor-pointer"
                          title="Restar 1 de stock en casa"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-stone-900">
                          {prod.currentStock}
                        </span>
                        <button
                          onClick={() =>
                            onQuickUpdateStock(prod.id, prod.currentStock + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded font-bold text-xs cursor-pointer"
                          title="Sumar 1 de stock en casa"
                        >
                          +
                        </button>
                      </div>

                      {/* Stock Bar Meter */}
                      <div className="flex-1">
                        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              prod.currentStock === 0
                                ? "bg-rose-500"
                                : prod.currentStock <= prod.minStock
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (prod.currentStock / Math.max(1, prod.idealStock)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Store preferences if any */}
                  {(prod.favoriteStore || prod.notes) && (
                    <div className="mt-2.5 text-[11px] text-stone-500 flex items-center gap-1.5 truncate">
                      {prod.favoriteStore && (
                        <span className="flex items-center gap-1 text-stone-600 font-medium">
                          <Store className="w-3 h-3 text-stone-400" />
                          {prod.favoriteStore}
                        </span>
                      )}
                      {prod.notes && (
                        <span className="text-stone-400 truncate italic">
                          - {prod.notes}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Card Action: Add to Current Monthly List */}
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <button
                    onClick={() => onAddProductToCurrentList(prod)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Añadir a Lista del Mes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
