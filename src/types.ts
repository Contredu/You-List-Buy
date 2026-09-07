export type Category =
  | "Lácteos y Huevos"
  | "Frutas y Verduras"
  | "Carnes y Pescados"
  | "Despensa y Granos"
  | "Panadería y Dulces"
  | "Bebidas"
  | "Limpieza del Hogar"
  | "Higiene y Cuidado Personal"
  | "Congelados"
  | "Mascotas"
  | "Otros";

export interface PriceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  price: number;
  store: string;
  isPromotion?: boolean;
  notes?: string;
}

export interface BaseProduct {
  id: string;
  name: string;
  category: Category;
  unit: "uds" | "kg" | "g" | "L" | "ml" | "packs" | "botellas" | "latas";
  currentStock: number;
  minStock: number; // Umbral de alerta
  idealStock: number;
  currentPrice: number; // Precio de referencia actual
  priceHistory: PriceRecord[];
  brand?: string;
  favoriteStore?: string;
  notes?: string;
  barcode?: string;
  lastUpdated: string;
  householdId?: string;
  ownerUid?: string;
}

export interface AddedByEntry {
  memberId: string;
  memberName: string;
  memberAvatar: string;
  quantityAdded: number;
  timestamp: string;
  note?: string;
}

export interface MonthlyListItem {
  id: string;
  productId: string; // Relación con el producto base
  productName: string;
  category: Category;
  unit: string;
  estimatedPrice: number;
  actualPrice?: number;
  quantity: number; // Cantidad acumulada
  addedBy: AddedByEntry[];
  purchased: boolean;
  purchasedBy?: string;
  purchasedAt?: string;
  priority: "alta" | "media" | "baja";
  notes?: string;
  householdId?: string;
}

export interface MonthlyList {
  id: string;
  monthKey: string; // YYYY-MM
  title: string; // ej. "Agosto 2026", "Septiembre 2026"
  budget: number; // Presupuesto asignado
  items: MonthlyListItem[];
  status: "planificacion" | "en_progreso" | "completada";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  householdId?: string;
  ownerUid?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: "Administrador" | "Padre" | "Madre" | "Hijo" | "Hija" | "Familiar";
  avatar: string;
  color: string;
  email?: string;
  householdId?: string;
  userId?: string;
}

export interface NotificationItem {
  id: string;
  type: "stock_low" | "item_added" | "budget_warning" | "price_change" | "purchase_done" | "ai_tip";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedProductId?: string;
  relatedMonthKey?: string;
  severity: "info" | "warning" | "danger" | "success";
  householdId?: string;
  ownerUid?: string;
  userId?: string;
}

export interface SavingsOpportunity {
  title: string;
  explanation: string;
  potentialSavings: number;
}

export interface PriceAlert {
  product: string;
  trend: "up" | "down" | "stable";
  changePercent: number;
  advice: string;
}

export interface CategoryBreakdown {
  category: string;
  suggestedAllocation: number;
  currentSpending: number;
}

export interface AIBudgetAdvice {
  summary: string;
  suggestedBudget: number;
  savingsOpportunities: SavingsOpportunity[];
  priceAlerts: PriceAlert[];
  bulkBuyRecommendations: string[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface HouseholdMember {
  uid: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  joinedAt: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  ownerUid: string;
  ownerEmail: string;
  members: HouseholdMember[];
  memberUids: string[];
  createdAt: string;
  updatedAt: string;
}

