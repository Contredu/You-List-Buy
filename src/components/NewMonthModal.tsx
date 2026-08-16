import React, { useState } from "react";
import { X, Calendar, DollarSign, CheckSquare, Sparkles } from "lucide-react";
import { MonthlyList, BaseProduct } from "../types";

interface NewMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMonth: (
    monthKey: string,
    title: string,
    budget: number,
    autoImportLowStock: boolean
  ) => void;
  existingMonthKeys: string[];
}

export const NewMonthModal: React.FC<NewMonthModalProps> = ({
  isOpen,
  onClose,
  onCreateMonth,
  existingMonthKeys,
}) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState("2026-10");
  const [customTitle, setCustomTitle] = useState("Octubre 2026");
  const [budget, setBudget] = useState("400");
  const [autoImportLowStock, setAutoImportLowStock] = useState(true);

  if (!isOpen) return null;

  const handleMonthKeyChange = (key: string) => {
    setSelectedMonthKey(key);
    const [y, m] = key.split("-");
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const name = monthNames[parseInt(m, 10) - 1] || key;
    setCustomTitle(`${name} ${y}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(budget) || 400;
    onCreateMonth(selectedMonthKey, customTitle, budgetNum, autoImportLowStock);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Crear Nueva Lista Mensual
              </h2>
              <p className="text-xs text-stone-500">
                Planificación y presupuesto para el próximo periodo
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Seleccionar Mes
            </label>
            <input
              type="month"
              value={selectedMonthKey}
              onChange={(e) => handleMonthKeyChange(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Nombre de la Lista
            </label>
            <input
              type="text"
              required
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Presupuesto Mensual Estimado (€)
            </label>
            <input
              type="number"
              min="1"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            />
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5">
            <input
              id="auto-import-check"
              type="checkbox"
              checked={autoImportLowStock}
              onChange={(e) => setAutoImportLowStock(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-stone-300"
            />
            <label htmlFor="auto-import-check" className="text-xs text-emerald-900 cursor-pointer">
              <strong>Importar automáticamente productos con stock bajo</strong>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Carga de inmediato todos los productos de la despensa que estén en nivel crítico a la nueva lista.
              </p>
            </label>
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
              Crear Lista del Mes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
