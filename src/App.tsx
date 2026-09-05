/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  loadBaseProducts,
  saveBaseProducts,
  loadMonthlyLists,
  saveMonthlyLists,
  loadFamilyMembers,
  saveFamilyMembers,
  loadCurrentMember,
  saveCurrentMember,
  loadNotifications,
  saveNotifications,
  loadActiveMonthKey,
  saveActiveMonthKey,
} from "./data/initialData";
import {
  BaseProduct,
  Category,
  FamilyMember,
  MonthlyList,
  MonthlyListItem,
  NotificationItem,
  PriceRecord,
} from "./types";
import { auth, googleProvider, testFirestoreConnection } from "./lib/firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  seedInitialDataIfEmpty,
  subscribeToFamilyMembers,
  subscribeToBaseProducts,
  subscribeToMonthlyLists,
  subscribeToMonthlyListItems,
  subscribeToNotifications,
  saveBaseProductToDb,
  deleteBaseProductFromDb,
  saveMonthlyListToDb,
  saveMonthlyListItemToDb,
  deleteMonthlyListItemFromDb,
  saveNotificationToDb,
  markNotificationReadInDb,
} from "./services/firestoreService";
import {
  INITIAL_MEMBERS,
  INITIAL_BASE_PRODUCTS,
  INITIAL_MONTHLY_LISTS,
} from "./data/initialData";
import { Navbar } from "./components/Navbar";
import { MonthlyListView } from "./components/MonthlyListView";
import { BaseCatalogView } from "./components/BaseCatalogView";
import { AIBudgetAdvisorView } from "./components/AIBudgetAdvisorView";
import { MonthlyReportsView } from "./components/MonthlyReportsView";
import { NotificationsView } from "./components/NotificationsView";
import { AddToListModal } from "./components/AddToListModal";
import { AddEditProductModal } from "./components/AddEditProductModal";
import { PriceHistoryModal } from "./components/PriceHistoryModal";
import { NewMonthModal } from "./components/NewMonthModal";
import { SupermarketModeModal } from "./components/SupermarketModeModal";
import { MobileInstallModal } from "./components/MobileInstallModal";

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<
    "list" | "catalog" | "ai" | "reports" | "notifications"
  >("list");

  // Core Domain State
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(loadFamilyMembers);
  const [currentMember, setCurrentMember] = useState<FamilyMember>(loadCurrentMember);
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>(loadBaseProducts);
  const [monthlyLists, setMonthlyLists] = useState<MonthlyList[]>(loadMonthlyLists);
  const [activeMonthKey, setActiveMonthKey] = useState<string>(loadActiveMonthKey);
  const [notifications, setNotifications] = useState<NotificationItem[]>(loadNotifications);

  // Firebase Realtime State
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // Modals
  const [isAddToListOpen, setIsAddToListOpen] = useState(false);
  const [preSelectedProductForAdd, setPreSelectedProductForAdd] = useState<BaseProduct | null>(null);
  const [isAddEditProductOpen, setIsAddEditProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<BaseProduct | null>(null);
  const [isPriceHistoryOpen, setIsPriceHistoryOpen] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<BaseProduct | null>(null);
  const [isNewMonthOpen, setIsNewMonthOpen] = useState(false);
  const [isSupermarketModeOpen, setIsSupermarketModeOpen] = useState(false);
  const [isMobileInstallOpen, setIsMobileInstallOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Firebase Auth State Listener & DB Seeder
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          await testFirestoreConnection();
          // Seed DB if it's the first time
          await seedInitialDataIfEmpty(
            INITIAL_MEMBERS,
            INITIAL_BASE_PRODUCTS,
            INITIAL_MONTHLY_LISTS
          );
          setIsCloudConnected(true);
          showToast(`Sincronización en la Nube activa como ${user.displayName || user.email}`);
        } catch (err) {
          console.error("Error al conectar Firestore:", err);
        } finally {
          setIsSyncing(false);
        }
      } else {
        setIsCloudConnected(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Realtime Subscriptions with Firestore when authenticated
  useEffect(() => {
    if (!authUser) return;

    const unsubMembers = subscribeToFamilyMembers((members) => {
      if (members && members.length > 0) {
        setFamilyMembers(members);
        // Automatically switch active member to match signed-in user's email if possible
        if (authUser.email) {
          const matched = members.find(
            (m) => m.email.toLowerCase() === authUser.email?.toLowerCase()
          );
          if (matched) {
            setCurrentMember(matched);
          }
        }
      }
    });

    const unsubProducts = subscribeToBaseProducts((products) => {
      if (products && products.length > 0) {
        setBaseProducts(products);
      }
    });

    const unsubLists = subscribeToMonthlyLists((lists) => {
      if (lists && lists.length > 0) {
        setMonthlyLists((prevLists) => {
          return lists.map((newList) => {
            const existing = prevLists.find((p) => p.id === newList.id);
            return {
              ...newList,
              items: existing && existing.items.length > 0 ? existing.items : [],
            };
          });
        });
      }
    });

    const unsubNotifs = subscribeToNotifications((notifs) => {
      setNotifications(notifs);
    });

    return () => {
      unsubMembers();
      unsubProducts();
      unsubLists();
      unsubNotifs();
    };
  }, [authUser]);

  // Realtime Subcollection subscription for items of the active monthly list
  useEffect(() => {
    if (!authUser) return;
    const currentList = monthlyLists.find((l) => l.monthKey === activeMonthKey);
    if (!currentList) return;

    const unsubItems = subscribeToMonthlyListItems(currentList.id, (items) => {
      setMonthlyLists((prev) =>
        prev.map((l) => (l.id === currentList.id ? { ...l, items } : l))
      );
    });

    return () => unsubItems();
  }, [authUser, activeMonthKey]);

  // Auth Action Handlers
  const handleSignInWithGoogle = async () => {
    try {
      setIsSyncing(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      showToast("Error al conectar cuenta Google");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast("Sesión cerrada. Modo local activado.");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    saveBaseProducts(baseProducts);
  }, [baseProducts]);

  useEffect(() => {
    saveMonthlyLists(monthlyLists);
  }, [monthlyLists]);

  useEffect(() => {
    saveFamilyMembers(familyMembers);
  }, [familyMembers]);

  useEffect(() => {
    saveCurrentMember(currentMember);
  }, [currentMember]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveActiveMonthKey(activeMonthKey);
  }, [activeMonthKey]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Find active monthly list
  const activeList =
    monthlyLists.find((l) => l.monthKey === activeMonthKey) || monthlyLists[0];

  // Past lists for AI and comparison
  const pastLists = monthlyLists.filter((l) => l.monthKey !== activeMonthKey);

  // Low stock calculation
  const lowStockProducts = baseProducts.filter(
    (p) => p.currentStock <= p.minStock
  );

  // Unread notifications
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Handler: Add or Sum product to active monthly list
  const handleConfirmAddToList = (
    productId: string,
    quantity: number,
    priority: "alta" | "media" | "baja",
    note?: string
  ) => {
    const product = baseProducts.find((p) => p.id === productId);
    if (!product || !activeList) return;

    const existingItemIndex = activeList.items.findIndex(
      (i) => i.productId === productId
    );

    let updatedItems: MonthlyListItem[] = [...activeList.items];

    if (existingItemIndex >= 0) {
      // Sum quantities
      const existing = updatedItems[existingItemIndex];
      const newQuantity = existing.quantity + quantity;
      const newAddedBy = [
        ...existing.addedBy,
        {
          memberId: currentMember.id,
          memberName: currentMember.name,
          memberAvatar: currentMember.avatar,
          quantityAdded: quantity,
          timestamp: new Date().toISOString(),
          note,
        },
      ];

      updatedItems[existingItemIndex] = {
        ...existing,
        quantity: newQuantity,
        addedBy: newAddedBy,
        priority: priority === "alta" ? "alta" : existing.priority,
      };

      showToast(
        `Se sumaron +${quantity} ${product.unit} a "${product.name}" (Total: ${newQuantity})`
      );
    } else {
      // Add new item entry
      const newItem: MonthlyListItem = {
        id: `item_${Date.now()}`,
        productId: product.id,
        productName: product.name,
        category: product.category,
        unit: product.unit,
        estimatedPrice: product.currentPrice,
        quantity,
        purchased: false,
        priority,
        notes: note,
        addedBy: [
          {
            memberId: currentMember.id,
            memberName: currentMember.name,
            memberAvatar: currentMember.avatar,
            quantityAdded: quantity,
            timestamp: new Date().toISOString(),
            note,
          },
        ],
      };

      updatedItems.push(newItem);
      showToast(`Añadido "${product.name}" a la lista de ${activeList.title}`);
    }

    const updatedList: MonthlyList = {
      ...activeList,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    handleUpdateMonthlyList(updatedList);

    // Auto notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      type: "item_added",
      title: `${currentMember.name.split(" ")[0]} añadió ${product.name}`,
      message: `${currentMember.name} sumó +${quantity} ${product.unit} a la lista de ${activeList.title}.`,
      timestamp: new Date().toISOString(),
      read: false,
      relatedProductId: product.id,
      relatedMonthKey: activeList.monthKey,
      severity: "info",
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (authUser) {
      saveNotificationToDb(newNotif);
    }
  };

  // Handler: Update monthly list
  const handleUpdateMonthlyList = (updatedList: MonthlyList) => {
    setMonthlyLists((prev) =>
      prev.map((l) => (l.id === updatedList.id ? updatedList : l))
    );
    if (authUser) {
      saveMonthlyListToDb(updatedList);
      updatedList.items.forEach((item) => {
        saveMonthlyListItemToDb(updatedList.id, item);
      });
    }
  };

  // Handler: Save or create base product
  const handleSaveBaseProduct = (savedProduct: BaseProduct) => {
    const exists = baseProducts.some((p) => p.id === savedProduct.id);
    if (exists) {
      setBaseProducts((prev) =>
        prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
      );
      showToast(`Producto "${savedProduct.name}" actualizado`);
    } else {
      setBaseProducts((prev) => [savedProduct, ...prev]);
      showToast(`Producto "${savedProduct.name}" creado en catálogo`);
    }
    if (authUser) {
      saveBaseProductToDb(savedProduct);
    }
  };

  // Handler: Delete base product
  const handleDeleteBaseProduct = (productId: string) => {
    const prod = baseProducts.find((p) => p.id === productId);
    if (!prod) return;
    setBaseProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast(`Producto "${prod.name}" eliminado del catálogo base`);
    if (authUser) {
      deleteBaseProductFromDb(productId);
    }
  };

  // Handler: Quick update stock in house
  const handleQuickUpdateStock = (productId: string, newStock: number) => {
    let updatedProd: BaseProduct | null = null;
    setBaseProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = {
            ...p,
            currentStock: newStock,
            lastUpdated: new Date().toISOString().split("T")[0],
          };
          updatedProd = updated;

          // If reached 0 or <= minStock, trigger notification
          if (newStock <= p.minStock && p.currentStock > p.minStock) {
            const notif: NotificationItem = {
              id: `notif_${Date.now()}`,
              type: "stock_low",
              title: `Alerta de Stock: ${p.name}`,
              message: `El stock en casa bajó a ${newStock} ${p.unit} (mínimo recomendado: ${p.minStock}).`,
              timestamp: new Date().toISOString(),
              read: false,
              relatedProductId: p.id,
              severity: newStock === 0 ? "danger" : "warning",
            };
            setNotifications((prevNotifs) => [notif, ...prevNotifs]);
            if (authUser) {
              saveNotificationToDb(notif);
            }
          }

          return updated;
        }
        return p;
      })
    );
    if (authUser && updatedProd) {
      saveBaseProductToDb(updatedProd);
    }
  };

  // Handler: Add Price Record
  const handleAddPriceRecord = (productId: string, record: PriceRecord) => {
    setBaseProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newHistory = [...p.priceHistory, record];
          return {
            ...p,
            currentPrice: record.price,
            priceHistory: newHistory,
            lastUpdated: record.date,
          };
        }
        return p;
      })
    );
    showToast(`Nuevo precio registrado: ${record.price} € (${record.store})`);
  };

  // Handler: Auto-import low stock items into current month
  const handleAutoImportLowStock = () => {
    if (!activeList) return;

    let addedCount = 0;
    let updatedItems = [...activeList.items];

    lowStockProducts.forEach((prod) => {
      const alreadyInList = updatedItems.some((i) => i.productId === prod.id);
      if (!alreadyInList) {
        const neededQty = Math.max(1, prod.idealStock - prod.currentStock);
        updatedItems.push({
          id: `item_auto_${Date.now()}_${prod.id}`,
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          unit: prod.unit,
          estimatedPrice: prod.currentPrice,
          quantity: neededQty,
          purchased: false,
          priority: "alta",
          notes: "Importado automáticamente por stock bajo en despensa",
          addedBy: [
            {
              memberId: currentMember.id,
              memberName: currentMember.name,
              memberAvatar: currentMember.avatar,
              quantityAdded: neededQty,
              timestamp: new Date().toISOString(),
              note: "Stock bajo en casa",
            },
          ],
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      handleUpdateMonthlyList({
        ...activeList,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      });
      showToast(
        `Se añadieron ${addedCount} productos con stock crítico a ${activeList.title}`
      );
    } else {
      showToast("Todos los productos con stock bajo ya están en la lista.");
    }
  };

  // Handler: Finalize shopping & replenish stock in house
  const handleFinalizeShoppingAndReplenishStock = () => {
    if (!activeList) return;

    // Increment base products stock for all purchased items
    let replenishedCount = 0;
    setBaseProducts((prev) =>
      prev.map((prod) => {
        const item = activeList.items.find(
          (i) => i.productId === prod.id && i.purchased
        );
        if (item) {
          replenishedCount++;
          return {
            ...prod,
            currentStock: prod.currentStock + item.quantity,
            lastUpdated: new Date().toISOString().split("T")[0],
          };
        }
        return prod;
      })
    );

    // Mark list as completed
    handleUpdateMonthlyList({
      ...activeList,
      status: "completada",
      updatedAt: new Date().toISOString(),
    });

    // Send notification
    const finishNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      type: "purchase_done",
      title: `¡Compra de ${activeList.title} completada!`,
      message: `${currentMember.name} finalizó la compra en tienda y se actualizó el stock de ${replenishedCount} productos en la despensa.`,
      timestamp: new Date().toISOString(),
      read: false,
      severity: "success",
    };
    setNotifications((prev) => [finishNotif, ...prev]);

    showToast(
      `¡Compra finalizada! Se repuso el stock de ${replenishedCount} productos en la despensa.`
    );
  };

  // Handler: Create new month
  const handleCreateNewMonth = (
    monthKey: string,
    title: string,
    budget: number,
    autoImportLowStock: boolean
  ) => {
    let initialItems: MonthlyListItem[] = [];

    if (autoImportLowStock) {
      lowStockProducts.forEach((prod) => {
        const neededQty = Math.max(1, prod.idealStock - prod.currentStock);
        initialItems.push({
          id: `item_init_${Date.now()}_${prod.id}`,
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          unit: prod.unit,
          estimatedPrice: prod.currentPrice,
          quantity: neededQty,
          purchased: false,
          priority: "alta",
          notes: "Importado por stock bajo",
          addedBy: [
            {
              memberId: currentMember.id,
              memberName: currentMember.name,
              memberAvatar: currentMember.avatar,
              quantityAdded: neededQty,
              timestamp: new Date().toISOString(),
            },
          ],
        });
      });
    }

    const newList: MonthlyList = {
      id: `list_${monthKey}`,
      monthKey,
      title,
      budget,
      status: "planificacion",
      items: initialItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMonthlyLists((prev) => [newList, ...prev]);
    setActiveMonthKey(monthKey);
    setCurrentTab("list");
    showToast(`Lista de ${title} creada con presupuesto de ${budget} €`);
    if (authUser) {
      saveMonthlyListToDb(newList);
      initialItems.forEach((item) => {
        saveMonthlyListItemToDb(newList.id, item);
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        familyMembers={familyMembers}
        currentMember={currentMember}
        onSelectMember={(m) => {
          setCurrentMember(m);
          showToast(`Cambiado a usuario: ${m.name}`);
        }}
        monthlyLists={monthlyLists}
        activeMonthKey={activeMonthKey}
        onSelectMonth={(k) => {
          setActiveMonthKey(k);
          showToast(`Mes activo cambiado`);
        }}
        onOpenNewMonthModal={() => setIsNewMonthOpen(true)}
        onOpenSupermarketMode={() => setIsSupermarketModeOpen(true)}
        onOpenMobileInstallModal={() => setIsMobileInstallOpen(true)}
        unreadCount={unreadNotificationsCount}
        authUser={authUser}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignOut={handleSignOut}
        isSyncing={isSyncing}
      />

      {/* Cloud Sync Announcement Banner if not authenticated */}
      {!authUser && (
        <div className="bg-amber-50 border-b border-amber-200/70 px-4 py-2 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-amber-900">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="text-base">☁️</span>
              <span>
                <strong>Base de datos Firestore activa:</strong> Conecta tu cuenta de Google para sincronizar en tiempo real las compras con Juana, Noelia y Carlos entre todos vuestros dispositivos móviles.
              </span>
            </div>
            <button
              id="banner-signin-google"
              onClick={handleSignInWithGoogle}
              disabled={isSyncing}
              className="shrink-0 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>{isSyncing ? "Conectando..." : "Conectar Nube con Google"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === "list" && activeList && (
          <MonthlyListView
            activeList={activeList}
            baseProducts={baseProducts}
            currentMember={currentMember}
            onUpdateList={handleUpdateMonthlyList}
            onOpenAddToListModal={() => {
              setPreSelectedProductForAdd(null);
              setIsAddToListOpen(true);
            }}
            onOpenSupermarketMode={() => setIsSupermarketModeOpen(true)}
            onAutoImportLowStock={handleAutoImportLowStock}
            lowStockCount={lowStockProducts.length}
          />
        )}

        {currentTab === "catalog" && (
          <BaseCatalogView
            products={baseProducts}
            currentMember={currentMember}
            onEditProduct={(p) => {
              setProductToEdit(p);
              setIsAddEditProductOpen(true);
            }}
            onDeleteProduct={handleDeleteBaseProduct}
            onOpenNewProductModal={() => {
              setProductToEdit(null);
              setIsAddEditProductOpen(true);
            }}
            onOpenPriceHistoryModal={(p) => {
              setSelectedProductForHistory(p);
              setIsPriceHistoryOpen(true);
            }}
            onAddProductToCurrentList={(p) => {
              setPreSelectedProductForAdd(p);
              setIsAddToListOpen(true);
            }}
            onQuickUpdateStock={handleQuickUpdateStock}
          />
        )}

        {currentTab === "ai" && activeList && (
          <AIBudgetAdvisorView
            activeList={activeList}
            pastLists={pastLists}
            baseProducts={baseProducts}
            onApplySuggestedBudget={(newBudget) => {
              handleUpdateMonthlyList({
                ...activeList,
                budget: newBudget,
                updatedAt: new Date().toISOString(),
              });
              showToast(`Presupuesto de ${activeList.title} actualizado a ${newBudget} €`);
            }}
          />
        )}

        {currentTab === "reports" && (
          <MonthlyReportsView
            monthlyLists={monthlyLists}
            baseProducts={baseProducts}
            activeMonthKey={activeMonthKey}
          />
        )}

        {currentTab === "notifications" && (
          <NotificationsView
            notifications={notifications}
            onMarkAllAsRead={() => {
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              showToast("Todas las notificaciones marcadas como leídas");
            }}
            onMarkAsRead={(id) => {
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
              );
            }}
            onDeleteNotification={(id) => {
              setNotifications((prev) => prev.filter((n) => n.id !== id));
            }}
            onSelectTab={setCurrentTab}
          />
        )}
      </main>

      {/* Interactive Modals */}
      <AddToListModal
        isOpen={isAddToListOpen}
        onClose={() => {
          setIsAddToListOpen(false);
          setPreSelectedProductForAdd(null);
        }}
        baseProducts={baseProducts}
        activeList={activeList}
        currentMember={currentMember}
        onConfirmAdd={handleConfirmAddToList}
        preSelectedProduct={preSelectedProductForAdd}
      />

      <AddEditProductModal
        isOpen={isAddEditProductOpen}
        onClose={() => {
          setIsAddEditProductOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveBaseProduct}
        productToEdit={productToEdit}
      />

      <PriceHistoryModal
        isOpen={isPriceHistoryOpen}
        onClose={() => {
          setIsPriceHistoryOpen(false);
          setSelectedProductForHistory(null);
        }}
        product={selectedProductForHistory}
        onAddPriceRecord={handleAddPriceRecord}
      />

      <NewMonthModal
        isOpen={isNewMonthOpen}
        onClose={() => setIsNewMonthOpen(false)}
        onCreateMonth={handleCreateNewMonth}
        existingMonthKeys={monthlyLists.map((l) => l.monthKey)}
      />

      {activeList && (
        <SupermarketModeModal
          isOpen={isSupermarketModeOpen}
          onClose={() => setIsSupermarketModeOpen(false)}
          activeList={activeList}
          currentMember={currentMember}
          onUpdateList={handleUpdateMonthlyList}
          onFinalizeShoppingAndReplenishStock={handleFinalizeShoppingAndReplenishStock}
        />
      )}

      <MobileInstallModal
        isOpen={isMobileInstallOpen}
        onClose={() => setIsMobileInstallOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-800 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
