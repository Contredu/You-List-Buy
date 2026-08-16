import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Trash2,
  Check,
  Filter,
  Sparkles,
} from "lucide-react";
import { NotificationItem } from "../types";
import { formatDateSpanish } from "../utils/helpers";

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onSelectTab: (tab: "list" | "catalog" | "ai" | "reports") => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onDeleteNotification,
  onSelectTab,
}) => {
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = notifications.filter((n) => {
    if (filterType === "unread") return !n.read;
    if (filterType === "stock") return n.type === "stock_low";
    if (filterType === "items") return n.type === "item_added";
    if (filterType === "budget") return n.type === "budget_warning";
    return true;
  });

  const getIcon = (type: NotificationItem["type"], severity: NotificationItem["severity"]) => {
    switch (type) {
      case "stock_low":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "item_added":
        return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case "budget_warning":
        return <TrendingUp className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              Notificaciones & Alertas Familiares
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Avisos automáticos de stock mínimo, adiciones de compras por miembros de la familia y alertas presupuestarias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Marcar todas leídas</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            filterType === "all"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
          }`}
        >
          Todas ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType("unread")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            filterType === "unread"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
          }`}
        >
          No leídas ({notifications.filter((n) => !n.read).length})
        </button>
        <button
          onClick={() => setFilterType("stock")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            filterType === "stock"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
          }`}
        >
          Stock Bajo
        </button>
        <button
          onClick={() => setFilterType("items")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            filterType === "items"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
          }`}
        >
          Ítems Añadidos
        </button>
      </div>

      {/* Notification Items */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <Bell className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">
            No hay notificaciones en este filtro
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Los avisos aparecerán automáticamente cuando baje el stock o la familia añada compras.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                item.read
                  ? "bg-white border-stone-200 opacity-80"
                  : "bg-emerald-50/30 border-emerald-200 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-stone-100 shrink-0 mt-0.5">
                  {getIcon(item.type, item.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-stone-900 truncate">
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-stone-400 mt-2 block">
                    {formatDateSpanish(item.timestamp)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {!item.read && (
                  <button
                    onClick={() => onMarkAsRead(item.id)}
                    className="p-1.5 text-stone-400 hover:text-emerald-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Marcar como leída"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDeleteNotification(item.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Eliminar notificación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
