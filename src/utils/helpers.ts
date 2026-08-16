import { Category, BaseProduct, MonthlyList } from "../types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateSpanish(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      const months = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
      ];
      return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function formatMonthTitle(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const idx = parseInt(month, 10) - 1;
  return `${monthNames[idx] || month} ${year}`;
}

export function getCategoryColor(category: Category): { bg: string; text: string; border: string; accent: string } {
  switch (category) {
    case "Lácteos y Huevos":
      return { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", accent: "#f59e0b" };
    case "Frutas y Verduras":
      return { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", accent: "#10b981" };
    case "Carnes y Pescados":
      return { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200", accent: "#ef4444" };
    case "Despensa y Granos":
      return { bg: "bg-amber-100/60", text: "text-amber-900", border: "border-amber-300/80", accent: "#d97706" };
    case "Panadería y Dulces":
      return { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200", accent: "#f97316" };
    case "Bebidas":
      return { bg: "bg-cyan-50", text: "text-cyan-800", border: "border-cyan-200", accent: "#06b6d4" };
    case "Limpieza del Hogar":
      return { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200", accent: "#3b82f6" };
    case "Higiene y Cuidado Personal":
      return { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200", accent: "#6366f1" };
    case "Congelados":
      return { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200", accent: "#0ea5e9" };
    case "Mascotas":
      return { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200", accent: "#14b8a6" };
    default:
      return { bg: "bg-slate-50", text: "text-slate-800", border: "border-slate-200", accent: "#64748b" };
  }
}

export function calculatePriceTrend(product: BaseProduct): {
  diff: number;
  percent: number;
  direction: "up" | "down" | "equal" | "single";
} {
  const history = [...product.priceHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  if (history.length < 2) {
    return { diff: 0, percent: 0, direction: "single" };
  }
  const latest = history[history.length - 1].price;
  const previous = history[history.length - 2].price;
  const diff = latest - previous;
  const percent = previous > 0 ? (diff / previous) * 100 : 0;

  if (Math.abs(diff) < 0.001) return { diff: 0, percent: 0, direction: "equal" };
  return {
    diff: Number(diff.toFixed(2)),
    percent: Number(percent.toFixed(1)),
    direction: diff > 0 ? "up" : "down",
  };
}

export function calculateListFinancials(list: MonthlyList) {
  let estimatedTotal = 0;
  let purchasedTotal = 0;
  let pendingTotal = 0;
  let purchasedCount = 0;
  let totalItemsCount = list.items.length;

  for (const item of list.items) {
    const unitPrice = item.actualPrice !== undefined ? item.actualPrice : item.estimatedPrice;
    const itemTotal = unitPrice * item.quantity;
    estimatedTotal += item.estimatedPrice * item.quantity;

    if (item.purchased) {
      purchasedTotal += itemTotal;
      purchasedCount += 1;
    } else {
      pendingTotal += item.estimatedPrice * item.quantity;
    }
  }

  const projectedTotal = purchasedTotal + pendingTotal;
  const remainingBudget = list.budget - projectedTotal;
  const percentSpent = list.budget > 0 ? Math.min(100, Math.round((projectedTotal / list.budget) * 100)) : 0;

  let status: "ok" | "warning" | "exceeded" = "ok";
  if (projectedTotal > list.budget) {
    status = "exceeded";
  } else if (projectedTotal > list.budget * 0.85) {
    status = "warning";
  }

  return {
    estimatedTotal: Number(estimatedTotal.toFixed(2)),
    purchasedTotal: Number(purchasedTotal.toFixed(2)),
    pendingTotal: Number(pendingTotal.toFixed(2)),
    projectedTotal: Number(projectedTotal.toFixed(2)),
    remainingBudget: Number(remainingBudget.toFixed(2)),
    percentSpent,
    purchasedCount,
    totalItemsCount,
    status,
  };
}
