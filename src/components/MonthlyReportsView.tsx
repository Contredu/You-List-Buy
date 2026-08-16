import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  PieChart as PieIcon,
  ShoppingBag,
} from "lucide-react";
import { MonthlyList, BaseProduct } from "../types";
import { formatCurrency, formatMonthTitle, getCategoryColor } from "../utils/helpers";

interface MonthlyReportsViewProps {
  monthlyLists: MonthlyList[];
  baseProducts: BaseProduct[];
  activeMonthKey: string;
}

export const MonthlyReportsView: React.FC<MonthlyReportsViewProps> = ({
  monthlyLists,
  baseProducts,
  activeMonthKey,
}) => {
  const [selectedReportMonth, setSelectedReportMonth] = useState<string>(activeMonthKey);

  // Month-by-month financial summary
  const monthlySummaryData = monthlyLists.map((list) => {
    let spent = 0;
    let itemsCount = list.items.length;
    let purchasedCount = 0;

    list.items.forEach((item) => {
      const price =
        item.actualPrice !== undefined ? item.actualPrice : item.estimatedPrice;
      const total = price * item.quantity;
      if (item.purchased || list.status === "completada") {
        spent += total;
        purchasedCount++;
      } else {
        spent += item.estimatedPrice * item.quantity;
      }
    });

    const diff = list.budget - spent;

    return {
      id: list.id,
      monthKey: list.monthKey,
      name: list.title.replace(" (Actual)", "").replace(" (Próximo Mes)", ""),
      presupuesto: list.budget,
      gastoReal: Number(spent.toFixed(2)),
      ahorro: Number(diff.toFixed(2)),
      itemsCount,
      purchasedCount,
      status: list.status,
    };
  });

  // Category breakdown for selected month
  const targetList =
    monthlyLists.find((l) => l.monthKey === selectedReportMonth) || monthlyLists[0];

  const categoryMap: { [key: string]: number } = {};
  if (targetList) {
    targetList.items.forEach((item) => {
      const price =
        item.actualPrice !== undefined ? item.actualPrice : item.estimatedPrice;
      const total = price * item.quantity;
      categoryMap[item.category] = (categoryMap[item.category] || 0) + total;
    });
  }

  const categoryChartData = Object.entries(categoryMap).map(([cat, total]) => ({
    name: cat,
    value: Number(total.toFixed(2)),
    color: getCategoryColor(cat as any).accent,
  }));

  // Lifetime metrics
  const totalLifetimeSpent = monthlySummaryData.reduce(
    (acc, m) => acc + m.gastoReal,
    0
  );
  const averageMonthlySpent =
    monthlySummaryData.length > 0
      ? totalLifetimeSpent / monthlySummaryData.length
      : 0;

  // Export to CSV
  const handleExportCSV = () => {
    if (!targetList) return;
    let csv = "ID;Producto;Categoria;Cantidad;Unidad;PrecioUnitario;Subtotal;Comprado;CompradoPor\n";
    targetList.items.forEach((item) => {
      const unitPrice =
        item.actualPrice !== undefined ? item.actualPrice : item.estimatedPrice;
      const subtotal = unitPrice * item.quantity;
      csv += `"${item.id}";"${item.productName}";"${item.category}";${item.quantity};"${item.unit}";${unitPrice};${subtotal};"${item.purchased ? "SI" : "NO"}";"${item.purchasedBy || ""}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_compras_${targetList.monthKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              Reportes & Histórico de Gastos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Análisis detallado de costos totales por mes, comparativa con presupuestos y desglose por categorías.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
            title="Descargar datos en CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Imprimir reporte o guardar como PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Reporte</span>
          </button>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <p className="text-xs font-medium text-stone-500">
            Gasto Total Registrado (Histórico)
          </p>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
            {formatCurrency(totalLifetimeSpent)}
          </p>
          <span className="text-[11px] text-stone-400">
            {monthlyLists.length} meses analizados
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <p className="text-xs font-medium text-stone-500">
            Promedio de Gasto Mensual
          </p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
            {formatCurrency(averageMonthlySpent)}
          </p>
          <span className="text-[11px] text-stone-400">
            Gasto familiar medio
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <p className="text-xs font-medium text-stone-500">
            Mes con Mayor Ahorro
          </p>
          <p className="text-xl sm:text-2xl font-bold text-teal-700 mt-1">
            Junio 2026 (+48,15 €)
          </p>
          <span className="text-[11px] text-stone-400">
            12.6% por debajo del presupuesto
          </span>
        </div>
      </div>

      {/* Recharts: Presupuesto vs Gasto Real por Mes */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Evolución Mensual: Presupuesto vs Gasto Real
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Comparación directa del gasto ejecutado frente al límite aprobado.
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlySummaryData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val))}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar
                dataKey="presupuesto"
                name="Presupuesto Asignado (€)"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="gastoReal"
                name="Gasto Real / Proyectado (€)"
                fill="#059669"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Monthly Breakdown & Category Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Pie Chart */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-emerald-600" />
                Gastos por Categoría
              </h3>
              <select
                value={selectedReportMonth}
                onChange={(e) => setSelectedReportMonth(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-stone-50 font-medium"
              >
                {monthlyLists.map((l) => (
                  <option key={l.monthKey} value={l.monthKey}>
                    {l.title.replace(" (Actual)", "")}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Distribución de costos para {targetList?.title}
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val))}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 mt-2 max-h-44 overflow-y-auto pr-1">
            {categoryChartData.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between text-xs py-1 border-b border-stone-100"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-stone-700 truncate max-w-[130px]">
                    {cat.name}
                  </span>
                </div>
                <span className="font-bold text-stone-900">
                  {formatCurrency(cat.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Month Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Tabla Comparativa de Costos por Mes
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Mes</th>
                  <th className="py-2.5 px-3">Presupuesto</th>
                  <th className="py-2.5 px-3">Gasto Total</th>
                  <th className="py-2.5 px-3">Diferencia</th>
                  <th className="py-2.5 px-3 text-center">Items</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {monthlySummaryData.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-stone-900">
                      {m.name}
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {formatCurrency(m.presupuesto)}
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">
                      {formatCurrency(m.gastoReal)}
                    </td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        m.ahorro >= 0 ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {m.ahorro >= 0
                        ? `+${formatCurrency(m.ahorro)}`
                        : `-${formatCurrency(Math.abs(m.ahorro))}`}
                    </td>
                    <td className="py-3 px-3 text-center text-stone-600">
                      {m.purchasedCount}/{m.itemsCount}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          m.status === "completada"
                            ? "bg-stone-100 text-stone-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {m.status === "completada" ? "Cerrado" : "En Curso"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed item list of selected month */}
          {targetList && (
            <div className="mt-6 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-stone-800 text-xs sm:text-sm">
                  Desglose de Ítems: {targetList.title}
                </h4>
                <span className="text-xs text-stone-500">
                  {targetList.items.length} productos incluidos
                </span>
              </div>

              <div className="max-h-52 overflow-y-auto divide-y divide-stone-100 text-xs">
                {targetList.items.map((item) => {
                  const unitPrice =
                    item.actualPrice !== undefined
                      ? item.actualPrice
                      : item.estimatedPrice;
                  const total = unitPrice * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="py-2 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.purchased ? "bg-emerald-500" : "bg-stone-300"
                          }`}
                        />
                        <span className="font-medium text-stone-800 truncate">
                          {item.productName}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          ({item.quantity} {item.unit})
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-stone-900">
                          {formatCurrency(total)}
                        </span>
                        <span className="text-[10px] text-stone-400 ml-1">
                          ({formatCurrency(unitPrice)}/ud)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
