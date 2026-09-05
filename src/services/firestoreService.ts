import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  BaseProduct,
  FamilyMember,
  MonthlyList,
  MonthlyListItem,
  NotificationItem,
} from "../types";

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
      batch.set(memberDoc, member);
    });

    // 2. Seed Base Products
    defaultProducts.forEach((product) => {
      const prodDoc = doc(db, "base_products", product.id);
      batch.set(prodDoc, product);
    });

    // 3. Seed Monthly Lists and their items
    for (const list of defaultLists) {
      const listDoc = doc(db, "monthly_lists", list.id);
      batch.set(listDoc, {
        id: list.id,
        monthKey: list.monthKey,
        title: list.title,
        budget: list.budget,
        status: list.status,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      });

      // Seed items in subcollection
      list.items.forEach((item) => {
        const itemDoc = doc(db, `monthly_lists/${list.id}/items`, item.id);
        batch.set(itemDoc, item);
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
    await setDoc(doc(db, "base_products", product.id), product);
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
      {
        id: list.id,
        monthKey: list.monthKey,
        title: list.title,
        budget: list.budget,
        status: list.status,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      },
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
    await setDoc(doc(db, `monthly_lists/${listId}/items`, item.id), item);
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
    await setDoc(doc(db, "notifications", notification.id), notification);
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
