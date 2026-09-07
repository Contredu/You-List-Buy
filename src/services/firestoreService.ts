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

// Seed Database if empty: Only creates active monthly list for current month with 0 items, NO mock products or mock members.
export async function seedInitialDataIfEmpty(
  currentUser?: User | null,
  householdId?: string
): Promise<void> {
  try {
    const finalHouseholdId = householdId || DEFAULT_HOUSEHOLD_ID;
    const listsRef = collection(db, "monthly_lists");
    const q = query(listsRef, where("householdId", "==", finalHouseholdId));
    const listsSnap = await getDocs(q);
    if (listsSnap.empty) {
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      const title = `Lista de ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
      const listId = `list_${monthKey.replace("-", "_")}_${finalHouseholdId.slice(-6)}`;

      await setDoc(doc(db, "monthly_lists", listId), sanitizeForFirestore({
        id: listId,
        monthKey,
        title,
        budget: 400,
        status: "activa",
        householdId: finalHouseholdId,
        ownerUid: currentUser?.uid || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    if (currentUser) {
      const memberDoc = doc(db, "family_members", currentUser.uid);
      await setDoc(memberDoc, sanitizeForFirestore({
        id: currentUser.uid,
        name: currentUser.displayName || currentUser.email?.split("@")[0] || "Administrador",
        role: "Administrador",
        avatar: "👑",
        color: "#10b981",
        email: currentUser.email || "",
        householdId: finalHouseholdId,
        userId: currentUser.uid,
      }), { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "seedInitialData");
  }
}

// Purge legacy mock data (prod_1..prod_25, mock lists, dummy family members) from Firestore
export async function purgeMockDataFromFirestore(currentUser: User): Promise<void> {
  try {
    // 1. Delete all mock products
    const prodSnap = await getDocs(collection(db, "base_products"));
    const prodBatch = writeBatch(db);
    let prodDeleteCount = 0;
    prodSnap.forEach((d) => {
      if (d.id.startsWith("prod_")) {
        prodBatch.delete(d.ref);
        prodDeleteCount++;
      }
    });
    if (prodDeleteCount > 0) {
      await prodBatch.commit();
    }

    // 2. Delete mock family members (keeping only real authenticated users)
    const membersSnap = await getDocs(collection(db, "family_members"));
    const memberBatch = writeBatch(db);
    let memberDeleteCount = 0;
    membersSnap.forEach((d) => {
      if (d.id !== currentUser.uid && (d.id.startsWith("mem_") || d.id === "default_user")) {
        memberBatch.delete(d.ref);
        memberDeleteCount++;
      }
    });
    // Ensure current user is active in family_members
    const userMemberDoc = doc(db, "family_members", currentUser.uid);
    memberBatch.set(userMemberDoc, sanitizeForFirestore({
      id: currentUser.uid,
      name: currentUser.displayName || currentUser.email?.split("@")[0] || "Administrador",
      role: "Administrador",
      avatar: "👑",
      color: "#10b981",
      email: currentUser.email || "",
    }));
    await memberBatch.commit();

    // 3. Delete mock monthly lists
    const listsSnap = await getDocs(collection(db, "monthly_lists"));
    for (const d of listsSnap.docs) {
      if (d.id === "list_aug_2026" || d.id === "list_jul_2026" || d.id === "list_jun_2026") {
        const itemsSnap = await getDocs(collection(db, `monthly_lists/${d.id}/items`));
        const itemsBatch = writeBatch(db);
        itemsSnap.forEach((itemDoc) => itemsBatch.delete(itemDoc.ref));
        itemsBatch.delete(d.ref);
        await itemsBatch.commit();
      }
    }

    // 4. Clean household dummy members
    await getOrCreateDefaultHousehold(currentUser);
  } catch (error) {
    console.error("Error purging mock data from Firestore:", error);
  }
}

// ----------------------------------------------------
// Realtime Subscriptions
// ----------------------------------------------------

export function subscribeToFamilyMembers(
  onData: (members: FamilyMember[]) => void,
  householdId?: string
): () => void {
  if (!auth.currentUser) return () => {};
  const colRef = collection(db, "family_members");
  const q = householdId
    ? query(colRef, where("householdId", "==", householdId))
    : colRef;
  return onSnapshot(
    q,
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
  onData: (products: BaseProduct[]) => void,
  householdId?: string
): () => void {
  if (!auth.currentUser) return () => {};
  const colRef = collection(db, "base_products");
  const q = householdId
    ? query(colRef, where("householdId", "==", householdId))
    : colRef;
  return onSnapshot(
    q,
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
  onData: (lists: MonthlyList[]) => void,
  householdId?: string
): () => void {
  if (!auth.currentUser) return () => {};
  const colRef = collection(db, "monthly_lists");
  const q = householdId
    ? query(colRef, where("householdId", "==", householdId))
    : colRef;
  return onSnapshot(
    q,
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
          householdId: data.householdId,
          ownerUid: data.ownerUid,
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
  onData: (notifications: NotificationItem[]) => void,
  householdId?: string
): () => void {
  if (!auth.currentUser) return () => {};
  const colRef = collection(db, "notifications");
  const q = householdId
    ? query(colRef, where("householdId", "==", householdId))
    : colRef;
  return onSnapshot(
    q,
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

export async function saveBaseProductToDb(
  product: BaseProduct,
  householdId?: string
): Promise<void> {
  const path = `base_products/${product.id}`;
  try {
    const finalHouseholdId = householdId || product.householdId || DEFAULT_HOUSEHOLD_ID;
    const finalOwnerUid = product.ownerUid || auth.currentUser?.uid || "";
    await setDoc(
      doc(db, "base_products", product.id),
      sanitizeForFirestore({
        ...product,
        householdId: finalHouseholdId,
        ownerUid: finalOwnerUid,
      })
    );
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

export async function saveMonthlyListToDb(
  list: MonthlyList,
  householdId?: string
): Promise<void> {
  const path = `monthly_lists/${list.id}`;
  try {
    const finalHouseholdId = householdId || list.householdId || DEFAULT_HOUSEHOLD_ID;
    const finalOwnerUid = list.ownerUid || auth.currentUser?.uid || "";
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
        householdId: finalHouseholdId,
        ownerUid: finalOwnerUid,
      }),
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveMonthlyListItemToDb(
  listId: string,
  item: MonthlyListItem,
  householdId?: string
): Promise<void> {
  const path = `monthly_lists/${listId}/items/${item.id}`;
  try {
    const finalHouseholdId = householdId || item.householdId || DEFAULT_HOUSEHOLD_ID;
    await setDoc(
      doc(db, `monthly_lists/${listId}/items`, item.id),
      sanitizeForFirestore({
        ...item,
        householdId: finalHouseholdId,
      })
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
  notification: NotificationItem,
  householdId?: string
): Promise<void> {
  const path = `notifications/${notification.id}`;
  try {
    const finalHouseholdId = householdId || notification.householdId || DEFAULT_HOUSEHOLD_ID;
    const finalOwnerUid = notification.ownerUid || auth.currentUser?.uid || "";
    await setDoc(
      doc(db, "notifications", notification.id),
      sanitizeForFirestore({
        ...notification,
        householdId: finalHouseholdId,
        ownerUid: finalOwnerUid,
        userId: auth.currentUser?.uid,
      })
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
  name: "Mi Hogar Familiar",
  inviteCode: DEFAULT_INVITE_CODE,
  ownerUid: "",
  ownerEmail: "",
  members: [],
  memberUids: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
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
      // Filter out dummy members without a real google uid
      const cleanMembers = (hData.members || []).filter(
        (m) =>
          m.uid !== "mem_juana" &&
          m.uid !== "mem_noelia" &&
          m.uid !== "mem_1" &&
          m.uid !== "mem_2" &&
          m.uid !== "mem_3"
      );

      // Check if current authenticated user is listed
      const hasMember = cleanMembers.some(
        (m) =>
          m.uid === currentUser.uid ||
          (currentUser.email && m.email.toLowerCase() === currentUser.email?.toLowerCase())
      );

      let updatedMembers = cleanMembers;
      if (!hasMember) {
        const newMember: HouseholdMember = {
          uid: currentUser.uid,
          name: currentUser.displayName || currentUser.email?.split("@")[0] || "Administrador",
          email: currentUser.email || "",
          role: cleanMembers.length === 0 ? "Administrador" : "Familiar",
          avatar: cleanMembers.length === 0 ? "👑" : "👤",
          joinedAt: new Date().toISOString(),
        };
        updatedMembers = [...cleanMembers, newMember];
      }

      // If owner was dummy or missing, assign to current user
      const updatedOwnerUid =
        !hData.ownerUid || hData.ownerUid.startsWith("mem_")
          ? currentUser.uid
          : hData.ownerUid;
      const updatedOwnerEmail =
        !hData.ownerEmail || hData.ownerEmail.includes("example.com")
          ? currentUser.email || ""
          : hData.ownerEmail;
      const updatedName =
        hData.name === "Hogar Familia Contreras"
          ? currentUser.displayName
            ? `Hogar de ${currentUser.displayName}`
            : "Mi Hogar Familiar"
          : hData.name;

      const updatedMemberUids = Array.from(
        new Set(updatedMembers.map((m) => m.uid))
      );

      const updatedHousehold: Household = {
        ...hData,
        name: updatedName,
        ownerUid: updatedOwnerUid,
        ownerEmail: updatedOwnerEmail,
        members: updatedMembers,
        memberUids: updatedMemberUids,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(hRef, sanitizeForFirestore(updatedHousehold), { merge: true });
      return updatedHousehold;
    }

    // Create fresh default household with ONLY the authenticated user
    const initialMembers: HouseholdMember[] = [
      {
        uid: currentUser.uid,
        name: currentUser.displayName || currentUser.email?.split("@")[0] || "Administrador",
        email: currentUser.email || "",
        role: "Administrador",
        avatar: "👑",
        joinedAt: new Date().toISOString(),
      },
    ];

    const defaultHousehold: Household = {
      id: DEFAULT_HOUSEHOLD_ID,
      name: currentUser.displayName ? `Hogar de ${currentUser.displayName}` : "Mi Hogar Familiar",
      inviteCode: DEFAULT_INVITE_CODE,
      ownerUid: currentUser.uid,
      ownerEmail: currentUser.email || "",
      members: initialMembers,
      memberUids: [currentUser.uid],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const batch = writeBatch(db);
    batch.set(hRef, sanitizeForFirestore(defaultHousehold));
    batch.set(doc(db, "invite_codes", DEFAULT_INVITE_CODE), sanitizeForFirestore({
      code: DEFAULT_INVITE_CODE,
      householdId: DEFAULT_HOUSEHOLD_ID,
      householdName: defaultHousehold.name,
      ownerUid: currentUser.uid,
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
    memberUids: [user.uid],
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
      ownerUid: user.uid,
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
    const existingIndex = (household.members || []).findIndex(
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

    const updatedMembers = [...(household.members || []), newMember];
    const updatedMemberUids = Array.from(
      new Set([...(household.memberUids || (household.members || []).map((m) => m.uid)), user.uid])
    );

    await setDoc(
      hRef,
      sanitizeForFirestore({
        members: updatedMembers,
        memberUids: updatedMemberUids,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );

    household.members = updatedMembers;
    household.memberUids = updatedMemberUids;

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
      (hData.members || []).some(
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

    const memberToDelete = (hData.members || []).find((m) => m.uid === memberUid);
    const updatedMembers = (hData.members || []).filter((m) => m.uid !== memberUid);
    const updatedMemberUids = updatedMembers.map((m) => m.uid);

    await setDoc(
      hRef,
      sanitizeForFirestore({
        ...hData,
        members: updatedMembers,
        memberUids: updatedMemberUids,
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

