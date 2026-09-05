import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  BaseProduct,
  FamilyMember,
  MonthlyList,
  MonthlyListItem,
  NotificationItem,
  Household,
  HouseholdMember,
} from "../types";

/**
 * Recursively cleans any object or array by removing properties with `undefined` values.
 * Firestore strictly rejects `undefined` values anywhere in the document payload.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === "object" && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// Seed Database if empty
export async function seedInitialDataIfEmpty(
  defaultMembers: FamilyMember[],
  defaultProducts: BaseProduct[],
  defaultLists: MonthlyList[]
): Promise<void> {
  const membersRef = collection(db, "family_members");
  try {
    const membersSnap = await getDocs(membersRef);
    if (!membersSnap.empty) {
      return; // Already seeded
    }

    const batch = writeBatch(db);

    // 1. Seed Family Members
    defaultMembers.forEach((member) => {
      const memberDoc = doc(db, "family_members", member.id);
      batch.set(memberDoc, sanitizeForFirestore(member));
    });

    // 2. Seed Base Products
    defaultProducts.forEach((product) => {
      const prodDoc = doc(db, "base_products", product.id);
      batch.set(prodDoc, sanitizeForFirestore(product));
    });

    // 3. Seed Monthly Lists and their items
    for (const list of defaultLists) {
      const listDoc = doc(db, "monthly_lists", list.id);
      batch.set(listDoc, sanitizeForFirestore({
        id: list.id,
        monthKey: list.monthKey,
        title: list.title,
        budget: list.budget,
        status: list.status,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      }));

      // Seed items in subcollection
      list.items.forEach((item) => {
        const itemDoc = doc(db, `monthly_lists/${list.id}/items`, item.id);
        batch.set(itemDoc, sanitizeForFirestore(item));
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "seedInitialData");
  }
}

// ----------------------------------------------------
// Realtime Subscriptions
// ----------------------------------------------------

export function subscribeToFamilyMembers(
  onData: (members: FamilyMember[]) => void
): () => void {
  if (!auth.currentUser) return () => {};
  const colRef = collection(db, "family_members");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const members: FamilyMember[] = [];
      snapshot.forEach((d) => {
        members.push(d.data() as FamilyMember);
      });
      onData(members);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "family_members");
    }
  );
}

export function subscribeToBaseProducts(
  onData: (products: BaseProduct[]) => void
): () => void {
  if (!auth.currentUser) return () => {};
  const colRef = collection(db, "base_products");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const products: BaseProduct[] = [];
      snapshot.forEach((d) => {
        products.push(d.data() as BaseProduct);
      });
      onData(products);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "base_products");
    }
  );
}

export function subscribeToMonthlyLists(
  onData: (lists: MonthlyList[]) => void
): () => void {
  if (!auth.currentUser) return () => {};
  const colRef = collection(db, "monthly_lists");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const lists: MonthlyList[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        lists.push({
          id: data.id,
          monthKey: data.monthKey,
          title: data.title,
          budget: data.budget,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          items: [], // Will be filled by subcollection listener
        });
      });
      onData(lists);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "monthly_lists");
    }
  );
}

export function subscribeToMonthlyListItems(
  listId: string,
  onData: (items: MonthlyListItem[]) => void
): () => void {
  if (!auth.currentUser) return () => {};
  const path = `monthly_lists/${listId}/items`;
  const itemsRef = collection(db, path);
  return onSnapshot(
    itemsRef,
    (snapshot) => {
      const items: MonthlyListItem[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as MonthlyListItem);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToNotifications(
  onData: (notifications: NotificationItem[]) => void
): () => void {
  if (!auth.currentUser) return () => {};
  const colRef = collection(db, "notifications");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const notifs: NotificationItem[] = [];
      snapshot.forEach((d) => {
        notifs.push(d.data() as NotificationItem);
      });
      // Sort newest first
      notifs.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      onData(notifs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "notifications");
    }
  );
}

// ----------------------------------------------------
// Mutations
// ----------------------------------------------------

export async function saveBaseProductToDb(product: BaseProduct): Promise<void> {
  const path = `base_products/${product.id}`;
  try {
    await setDoc(doc(db, "base_products", product.id), sanitizeForFirestore(product));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBaseProductFromDb(productId: string): Promise<void> {
  const path = `base_products/${productId}`;
  try {
    await deleteDoc(doc(db, "base_products", productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveMonthlyListToDb(list: MonthlyList): Promise<void> {
  const path = `monthly_lists/${list.id}`;
  try {
    await setDoc(
      doc(db, "monthly_lists", list.id),
      sanitizeForFirestore({
        id: list.id,
        monthKey: list.monthKey,
        title: list.title,
        budget: list.budget,
        status: list.status,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      }),
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveMonthlyListItemToDb(
  listId: string,
  item: MonthlyListItem
): Promise<void> {
  const path = `monthly_lists/${listId}/items/${item.id}`;
  try {
    await setDoc(
      doc(db, `monthly_lists/${listId}/items`, item.id),
      sanitizeForFirestore(item)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMonthlyListItemFromDb(
  listId: string,
  itemId: string
): Promise<void> {
  const path = `monthly_lists/${listId}/items/${itemId}`;
  try {
    await deleteDoc(doc(db, `monthly_lists/${listId}/items`, itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveNotificationToDb(
  notification: NotificationItem
): Promise<void> {
  const path = `notifications/${notification.id}`;
  try {
    await setDoc(
      doc(db, "notifications", notification.id),
      sanitizeForFirestore(notification)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markNotificationReadInDb(
  notificationId: string
): Promise<void> {
  const path = `notifications/${notificationId}`;
  try {
    await setDoc(
      doc(db, "notifications", notificationId),
      { read: true },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteNotificationFromDb(
  notificationId: string
): Promise<void> {
  const path = `notifications/${notificationId}`;
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------------------------------------------
// Household & Shared Session Management
// ----------------------------------------------------

export const DEFAULT_HOUSEHOLD_ID = "household_familia_principal";
export const DEFAULT_INVITE_CODE = "FAM-2026";

export const DEFAULT_LOCAL_HOUSEHOLD: Household = {
  id: DEFAULT_HOUSEHOLD_ID,
  name: "Hogar Familia Contreras",
  inviteCode: DEFAULT_INVITE_CODE,
  ownerUid: "mem_carlos",
  ownerEmail: "carlos.contredu@gmail.com",
  members: [
    {
      uid: "mem_carlos",
      name: "Carlos Enrique",
      email: "carlos.contredu@gmail.com",
      role: "Administrador",
      avatar: "👨‍💼",
      joinedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      uid: "mem_juana",
      name: "Juana Ysabel",
      email: "diazsaenzj@yahoo.com",
      role: "Familiar",
      avatar: "👩‍🍳",
      joinedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      uid: "mem_noelia",
      name: "Noelia Isabel",
      email: "noejua9255@gmail.com",
      role: "Familiar",
      avatar: "👧",
      joinedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export function generateRandomInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "FAM-";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function getOrCreateDefaultHousehold(
  user?: User | null
): Promise<Household> {
  // If no user or currentUser is active, return local household without hitting Firestore
  const currentUser = user || auth.currentUser;
  if (!currentUser) {
    return DEFAULT_LOCAL_HOUSEHOLD;
  }

  const hRef = doc(db, "households", DEFAULT_HOUSEHOLD_ID);
  try {
    const snap = await getDoc(hRef);
    if (snap.exists()) {
      const hData = snap.data() as Household;
      // If user is authenticated, ensure they are listed in members
      if (currentUser && currentUser.email) {
        const hasMember = hData.members.some(
          (m) => m.email.toLowerCase() === currentUser.email?.toLowerCase()
        );
        if (!hasMember) {
          const newMember: HouseholdMember = {
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email.split("@")[0],
            email: currentUser.email,
            role: "Familiar",
            avatar: "👤",
            joinedAt: new Date().toISOString(),
          };
          const updatedMembers = [...hData.members, newMember];
          await setDoc(hRef, sanitizeForFirestore({ members: updatedMembers }), { merge: true });
          hData.members = updatedMembers;
        }
      }
      return hData;
    }

    // Create default household
    const initialMembers: HouseholdMember[] = [
      {
        uid: currentUser?.uid || "mem_carlos",
        name: currentUser?.displayName || "Carlos Enrique",
        email: currentUser?.email || "carlos.contredu@gmail.com",
        role: "Administrador",
        avatar: "👨‍💼",
        joinedAt: new Date().toISOString(),
      },
      {
        uid: "mem_juana",
        name: "Juana Ysabel",
        email: "diazsaenzj@yahoo.com",
        role: "Familiar",
        avatar: "👩‍🍳",
        joinedAt: new Date().toISOString(),
      },
      {
        uid: "mem_noelia",
        name: "Noelia Isabel",
        email: "noejua9255@gmail.com",
        role: "Familiar",
        avatar: "👧",
        joinedAt: new Date().toISOString(),
      },
    ];

    const defaultHousehold: Household = {
      id: DEFAULT_HOUSEHOLD_ID,
      name: "Hogar Familia Contreras",
      inviteCode: DEFAULT_INVITE_CODE,
      ownerUid: currentUser?.uid || "mem_carlos",
      ownerEmail: currentUser?.email || "carlos.contredu@gmail.com",
      members: initialMembers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const batch = writeBatch(db);
    batch.set(hRef, sanitizeForFirestore(defaultHousehold));
    batch.set(doc(db, "invite_codes", DEFAULT_INVITE_CODE), sanitizeForFirestore({
      code: DEFAULT_INVITE_CODE,
      householdId: DEFAULT_HOUSEHOLD_ID,
      householdName: defaultHousehold.name,
      createdAt: new Date().toISOString(),
    }));
    await batch.commit();

    return defaultHousehold;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "households");
  }
}

export async function createNewHousehold(
  name: string,
  user: User
): Promise<Household> {
  const householdId = `household_${Date.now()}`;
  const inviteCode = generateRandomInviteCode();

  const newHousehold: Household = {
    id: householdId,
    name: name.trim() || "Mi Hogar Familiar",
    inviteCode,
    ownerUid: user.uid,
    ownerEmail: user.email || "",
    members: [
      {
        uid: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "Administrador",
        email: user.email || "",
        role: "Administrador",
        avatar: "👑",
        joinedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, "households", householdId), sanitizeForFirestore(newHousehold));
    batch.set(doc(db, "invite_codes", inviteCode), sanitizeForFirestore({
      code: inviteCode,
      householdId,
      householdName: newHousehold.name,
      createdAt: new Date().toISOString(),
    }));
    await batch.commit();
    return newHousehold;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `households/${householdId}`);
  }
}

export async function joinHouseholdByCode(
  rawCode: string,
  user: User,
  customName?: string
): Promise<{ success: boolean; household?: Household; message: string }> {
  const cleanCode = rawCode.trim().toUpperCase();
  try {
    const codeDocRef = doc(db, "invite_codes", cleanCode);
    const codeSnap = await getDoc(codeDocRef);

    if (!codeSnap.exists()) {
      return {
        success: false,
        message: `El código "${cleanCode}" no existe o es inválido. Verifica el código con tu familiar.`,
      };
    }

    const { householdId } = codeSnap.data();
    const hRef = doc(db, "households", householdId);
    const hSnap = await getDoc(hRef);

    if (!hSnap.exists()) {
      return {
        success: false,
        message: "No se encontró el espacio familiar asociado.",
      };
    }

    const household = hSnap.data() as Household;
    const existingIndex = household.members.findIndex(
      (m) =>
        m.uid === user.uid ||
        (user.email && m.email.toLowerCase() === user.email.toLowerCase())
    );

    if (existingIndex >= 0) {
      return {
        success: true,
        household,
        message: `¡Ya formas parte de "${household.name}"! Sesión conectada.`,
      };
    }

    const newMember: HouseholdMember = {
      uid: user.uid,
      name:
        customName ||
        user.displayName ||
        user.email?.split("@")[0] ||
        "Familiar",
      email: user.email || "",
      role: "Familiar",
      avatar: "🛒",
      joinedAt: new Date().toISOString(),
    };

    const updatedMembers = [...household.members, newMember];
    await setDoc(
      hRef,
      sanitizeForFirestore({
        members: updatedMembers,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );

    household.members = updatedMembers;

    return {
      success: true,
      household,
      message: `¡Te has unido con éxito a "${household.name}"! Ahora compartís la misma lista en vivo.`,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "invite_codes");
  }
}

export function subscribeToHousehold(
  householdId: string,
  onData: (h: Household | null) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }
  const hRef = doc(db, "households", householdId);
  return onSnapshot(
    hRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as Household);
      } else {
        onData(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `households/${householdId}`);
    }
  );
}

export async function removeMemberFromHousehold(
  householdId: string,
  memberUid: string,
  requester: User
): Promise<{ success: boolean; message: string }> {
  try {
    const hRef = doc(db, "households", householdId);
    const snap = await getDoc(hRef);
    if (!snap.exists()) {
      return { success: false, message: "El hogar no existe." };
    }
    const hData = snap.data() as Household;

    // Check if requester is owner or has role Administrador
    const isOwner =
      hData.ownerUid === requester.uid ||
      Boolean(requester.email && hData.ownerEmail?.toLowerCase() === requester.email.toLowerCase());
    const isAdmin =
      isOwner ||
      hData.members.some(
        (m) => m.uid === requester.uid && m.role === "Administrador"
      );

    if (!isAdmin) {
      return {
        success: false,
        message: "Solo el Administrador de la sesión tiene permiso para eliminar miembros.",
      };
    }

    if (memberUid === hData.ownerUid || memberUid === requester.uid) {
      return {
        success: false,
        message: "El Administrador principal no puede ser eliminado de su propia sesión.",
      };
    }

    const memberToDelete = hData.members.find((m) => m.uid === memberUid);
    const updatedMembers = hData.members.filter((m) => m.uid !== memberUid);

    await setDoc(
      hRef,
      sanitizeForFirestore({
        ...hData,
        members: updatedMembers,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );

    return {
      success: true,
      message: `${memberToDelete ? memberToDelete.name : "Familiar"} ha sido eliminado de la sesión de compras.`,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `households/${householdId}`);
    return { success: false, message: "Error al eliminar miembro de la sesión." };
  }
}

export async function updateHouseholdMemberProfile(
  householdId: string,
  uid: string,
  newName: string,
  newAvatar?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const hRef = doc(db, "households", householdId);
    const snap = await getDoc(hRef);
    if (!snap.exists()) {
      return { success: false, message: "El hogar no existe." };
    }
    const hData = snap.data() as Household;

    const updatedMembers = hData.members.map((m) => {
      if (m.uid === uid) {
        return {
          ...m,
          name: newName.trim() || m.name,
          avatar: newAvatar || m.avatar || "👤",
        };
      }
      return m;
    });

    await setDoc(
      hRef,
      sanitizeForFirestore({
        ...hData,
        members: updatedMembers,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );

    return { success: true, message: "Información de perfil actualizada en el hogar." };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `households/${householdId}`);
    return { success: false, message: "Error al actualizar la información en la base de datos." };
  }
}

