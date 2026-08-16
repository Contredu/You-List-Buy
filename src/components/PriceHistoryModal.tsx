import React, { useState } from "react";
import {
  X,
  History,
  Plus,
  TrendingUp,
  TrendingDown,
  Store,
  Calendar,
  DollarSign,
  Tag,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BaseProduct, PriceRecord } from "../types";
import { formatCurrency, formatDateSpanish, calculatePriceTrend } from "../utils/helpers";

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: BaseProduct | null;
  onAddPriceRecord: (productId: string, record: PriceRecord) => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddPriceRecord,
}) => {
  const [newPrice, setNewPrice] = useState("");
  const [newStore, setNewStore] = useState("Mercadona");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newNotes, setNewNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen || !product) return null;

  const trend = calculatePriceTrend(product);

  const sortedHistory = [...product.priceHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = sortedHistory.map((item) => ({
    date: formatDateSpanish(item.date),
    rawDate: item.date,
    precio: item.price,
    tienda: item.store,
  }));

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    const record: PriceRecord = {
      id: `pr_${Date.now()}`,
      date: newDate,
      price: priceNum,
      store: newStore.trim() || "Supermercado",
      notes: newNotes.trim() || undefined,
    };

    onAddPriceRecord(product.id, record);
    setNewPrice("");
    setNewNotes("");
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Historial de Precios: {product.name}
              </h2>
              <p className="text-xs text-stone-500">
                Seguimiento de inflación y comparativa entre supermercados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Top Stat Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-xs text-stone-500 font-medium">
                Precio Actual
              </span>
              <p className="text-lg font-bold text-stone-900 mt-0.5">
                {formatCurrency(product.currentPrice)}
              </p>
              <span className="text-[10px] text-stone-400">/{product.unit}</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-xs text-stone-500 font-medium">
                Tendencia Reciente
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {trend.direction === "up" ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-bold text-rose-600">
                      +{trend.percent}%
                    </span>
                  </>
                ) : trend.direction === "down" ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-600">
                      {trend.percent}%
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-stone-700">
                    Estable
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400">vs precio anterior</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-xs text-stone-500 font-medium">
                Registros Totales
              </span>
              <p className="text-lg font-bold text-stone-900 mt-0.5">
                {sortedHistory.length}
              </p>
              <span className="text-[10px] text-stone-400">
                Comprobantes guardados
              </span>
            </div>
          </div>

          {/* Chart View */}
          <div className="p-4 rounded-2xl bg-stone-50/50 border border-stone-200">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              Curva de Variación de Precio (€)
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), "Precio"]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return `${label} (${payload[0].payload.tienda})`;
                      }
                      return label;
                    }}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="precio"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ fill: "#059669", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Add Price Record Toggle Form */}
          <div>
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Nuevo Precio de Compra</span>
              </button>
            ) : (
              <form
                onSubmit={handleAddRecord}
                className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3 animate-in fade-in duration-100"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">
                    Añadir Registro de Ticket
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-stone-500 hover:text-stone-700"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">
                      Precio Pagado (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">
                      Supermercado / Tienda
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mercadona, Lidl..."
                      value={newStore}
                      onChange={(e) => setNewStore(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">
                      Fecha de Compra
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Notas (ej. Oferta 2ª unidad al 50%, envase ahorro...)"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Guardar Precio en Historial
                </button>
              </form>
            )}
          </div>

          {/* Historical Records Table */}
          <div>
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Histórico de Comprobantes ({sortedHistory.length})
            </h4>
            <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-xs">
              {sortedHistory.reverse().map((record) => (
                <div
                  key={record.id}
                  className="p-3 flex items-center justify-between hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center font-bold">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">
                        {record.store}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {formatDateSpanish(record.date)}
                        {record.notes && ` - ${record.notes}`}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-stone-900">
                    {formatCurrency(record.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 flex justify-end bg-stone-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-stone-900 hover:bg-black text-white rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
