import React, { useState } from "react";
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Store,
  Layers,
} from "lucide-react";
import { MonthlyList, BaseProduct, AIBudgetAdvice } from "../types";
import { formatCurrency } from "../utils/helpers";

interface AIBudgetAdvisorViewProps {
  activeList: MonthlyList;
  pastLists: MonthlyList[];
  baseProducts: BaseProduct[];
  onApplySuggestedBudget: (newBudget: number) => void;
}

export const AIBudgetAdvisorView: React.FC<AIBudgetAdvisorViewProps> = ({
  activeList,
  pastLists,
  baseProducts,
  onApplySuggestedBudget,
}) => {
  const [advice, setAdvice] = useState<AIBudgetAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAppliedBudget, setHasAppliedBudget] = useState(false);

  const fetchAdvice = async () => {
    setIsLoading(true);
    setHasAppliedBudget(false);
    try {
      const pastSummary = pastLists.map((l) => ({
        month: l.title,
        budget: l.budget,
        totalItems: l.items.length,
        totalSpent: l.items.reduce(
          (acc, i) =>
            acc + (i.actualPrice !== undefined ? i.actualPrice : i.estimatedPrice) * i.quantity,
          0
        ),
      }));

      const res = await fetch("/api/ai/budget-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthTitle: activeList.title,
          budget: activeList.budget,
          items: activeList.items.map((i) => ({
            name: i.productName,
            category: i.category,
            quantity: i.quantity,
            estimatedPrice: i.estimatedPrice,
            unit: i.unit,
            addedByCount: i.addedBy.length,
          })),
          baseProducts: baseProducts.map((p) => ({
            name: p.name,
            currentPrice: p.currentPrice,
            priceHistory: p.priceHistory,
          })),
          pastMonthsSummary: pastSummary,
        }),
      });

      const data = await res.json();
      if (data && data.advice) {
        setAdvice(data.advice);
      }
    } catch (err) {
      console.error("Error fetching AI advice:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load if empty
  React.useEffect(() => {
    if (!advice && !isLoading) {
      fetchAdvice();
    }
  }, []);

  const totalPotentialSavings = advice?.savingsOpportunities.reduce(
    (acc, s) => acc + (s.potentialSavings || 0),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Asesor Financiero & Optimización IA
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Optimización de Presupuesto para {activeList.title}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Analizamos los {activeList.items.length} productos de tu lista mensual, los precios históricos de las tiendas y el consumo familiar para detectar oportunidades de ahorro y sugerir un presupuesto optimizado.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={fetchAdvice}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Analizando lista..." : "Re-analizar con IA"}</span>
            </button>
            <span className="text-xs text-emerald-200/70">
              Modelo: Gemini 3.7 Flash
            </span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800">
            Analizando tendencias de precios y despensa...
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mt-1">
            Calculando elasticidad de precios, paquetes familiares y asignaciones óptimas por categoría.
          </p>
        </div>
      )}

      {!isLoading && advice && (
        <div className="space-y-6">
          {/* Executive Summary & Suggested Budget Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Summary Text Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <Lightbulb className="w-4 h-4" />
                  Diagnóstico Ejecutivo
                </div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2">
                  Estado de la Compra Mensual
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {advice.summary}
                </p>
              </div>

              {totalPotentialSavings > 0 && (
                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-semibold text-stone-700">
                      Ahorro Potencial Total Identificado:
                    </span>
                  </div>
                  <span className="text-base font-bold text-emerald-700">
                    ~{formatCurrency(totalPotentialSavings)}
                  </span>
                </div>
              )}
            </div>

            {/* Suggested Budget CTA Card */}
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800">
                  Presupuesto Óptimo Sugerido
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">
                  {formatCurrency(advice.suggestedBudget)}
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Presupuesto actual: {formatCurrency(activeList.budget)} (
                  {advice.suggestedBudget < activeList.budget
                    ? `Ahorras ${formatCurrency(activeList.budget - advice.suggestedBudget)}`
                    : `Ajuste +${formatCurrency(advice.suggestedBudget - activeList.budget)}`}
                  )
                </p>
              </div>

              <button
                onClick={() => {
                  onApplySuggestedBudget(advice.suggestedBudget);
                  setHasAppliedBudget(true);
                }}
                disabled={hasAppliedBudget}
                className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  hasAppliedBudget
                    ? "bg-emerald-700 text-white opacity-90"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                }`}
              >
                {hasAppliedBudget ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Presupuesto Aplicado!</span>
                  </>
                ) : (
                  <>
                    <span>Aplicar Presupuesto a {activeList.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Savings Opportunities */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-emerald-600" />
              Oportunidades Concretas de Ahorro
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {advice.savingsOpportunities.map((op, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-stone-800">
                        {op.title}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                        +{formatCurrency(op.potentialSavings)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {op.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Alerts & Inflation Monitoring */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Price Alerts */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-rose-500" />
                Alertas de Variación de Precios
              </h3>
              <div className="space-y-3">
                {advice.priceAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-stone-100 bg-stone-50 flex items-start gap-3"
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        alert.trend === "up"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {alert.trend === "up" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">
                          {alert.product}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            alert.trend === "up"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {alert.trend === "up" ? "+" : "-"}
                          {Math.abs(alert.changePercent)}%
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">{alert.advice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bulk Buy & Store Recommendations */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                Recomendaciones de Compra por Volumen
              </h3>
              <ul className="space-y-2.5">
                {advice.bulkBuyRecommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 text-xs text-stone-700 border border-stone-100"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Category Spending Breakdown */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
            <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Distribución Sugerida por Categorías
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {advice.categoryBreakdown.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-center"
                >
                  <p className="text-xs font-semibold text-stone-800 truncate">
                    {cat.category}
                  </p>
                  <p className="text-base font-bold text-emerald-700 mt-1">
                    {formatCurrency(cat.suggestedAllocation)}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Proyectado: {formatCurrency(cat.currentSpending)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
