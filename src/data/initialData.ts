import { BaseProduct, FamilyMember, MonthlyList, NotificationItem } from "../types";

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getCurrentMonthTitle(): string {
  const now = new Date();
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return `Lista de ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
}

// Clean start: No dummy or preloaded products/members.
// The app starts empty so new users create their own actual family products.
export const INITIAL_MEMBERS: FamilyMember[] = [];

export const INITIAL_BASE_PRODUCTS: BaseProduct[] = [];

export const INITIAL_MONTHLY_LISTS: MonthlyList[] = [
  {
    id: `list_${getCurrentMonthKey().replace("-", "_")}`,
    monthKey: getCurrentMonthKey(),
    title: getCurrentMonthTitle(),
    budget: 400,
    status: "en_progreso",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [],
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

// Local Storage Keys (v2 clean start)
const STORAGE_KEYS = {
  PRODUCTS: "despensa_base_products_clean_v2",
  LISTS: "despensa_monthly_lists_clean_v2",
  MEMBERS: "despensa_family_members_clean_v2",
  CURRENT_MEMBER: "despensa_current_member_clean_v2",
  NOTIFICATIONS: "despensa_notifications_clean_v2",
  ACTIVE_MONTH: "despensa_active_month_clean_v2",
};

export function loadBaseProducts(): BaseProduct[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveBaseProducts(products: BaseProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent("stock_storage_updated"));
  } catch (e) {
    console.error("Failed to save base products:", e);
  }
}

export function loadMonthlyLists(): MonthlyList[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LISTS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return INITIAL_MONTHLY_LISTS;
  } catch (e) {
    return INITIAL_MONTHLY_LISTS;
  }
}

export function saveMonthlyLists(lists: MonthlyList[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
    window.dispatchEvent(new CustomEvent("stock_storage_updated"));
  } catch (e) {
    console.error("Failed to save monthly lists:", e);
  }
}

export function loadFamilyMembers(): FamilyMember[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveFamilyMembers(members: FamilyMember[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    window.dispatchEvent(new CustomEvent("stock_storage_updated"));
  } catch (e) {
    console.error("Failed to save family members:", e);
  }
}

export function loadCurrentMember(): FamilyMember {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_MEMBER);
    if (data) return JSON.parse(data);
  } catch (e) {
    // fallback
  }
  return {
    id: "default_user",
    name: "Usuario",
    role: "Administrador",
    avatar: "👤",
    color: "#10b981",
    email: "",
  };
}

export function saveCurrentMember(member: FamilyMember) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_MEMBER, JSON.stringify(member));
    window.dispatchEvent(new CustomEvent("stock_storage_updated"));
  } catch (e) {
    console.error("Failed to save current member:", e);
  }
}

export function loadNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveNotifications(notifications: NotificationItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent("stock_storage_updated"));
  } catch (e) {
    console.error("Failed to save notifications:", e);
  }
}

export function loadActiveMonthKey(): string {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_MONTH);
    return data || getCurrentMonthKey();
  } catch (e) {
    return getCurrentMonthKey();
  }
}

export function saveActiveMonthKey(monthKey: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MONTH, monthKey);
    window.dispatchEvent(new CustomEvent("stock_storage_updated"));
  } catch (e) {
    console.error("Failed to save active month key:", e);
  }
}
