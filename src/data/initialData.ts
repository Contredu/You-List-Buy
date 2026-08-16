import { BaseProduct, FamilyMember, MonthlyList, NotificationItem } from "../types";

export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: "mem_1",
    name: "Carmen (Mamá)",
    role: "Madre",
    avatar: "👩‍🍳",
    color: "#ec4899", // pink
    email: "carmen@familia.es",
  },
  {
    id: "mem_2",
    name: "David (Papá)",
    role: "Padre",
    avatar: "👨‍💼",
    color: "#3b82f6", // blue
    email: "david@familia.es",
  },
  {
    id: "mem_3",
    name: "Lucía (Hija)",
    role: "Hija",
    avatar: "👧",
    color: "#8b5cf6", // purple
    email: "lucia@familia.es",
  },
  {
    id: "mem_4",
    name: "Mateo (Hijo)",
    role: "Hijo",
    avatar: "🧒",
    color: "#10b981", // green
    email: "mateo@familia.es",
  },
];

export const INITIAL_BASE_PRODUCTS: BaseProduct[] = [
  {
    id: "prod_1",
    name: "Leche Entera Calcio (Brick 1L)",
    category: "Lácteos y Huevos",
    unit: "uds",
    currentStock: 2,
    minStock: 4,
    idealStock: 12,
    currentPrice: 1.05,
    brand: "Hacendado / Puleva",
    favoriteStore: "Mercadona",
    notes: "Comprar preferentemente pack de 6 bricks.",
    lastUpdated: "2026-08-10",
    priceHistory: [
      { id: "pr_1", date: "2026-04-12", price: 0.96, store: "Mercadona" },
      { id: "pr_2", date: "2026-05-18", price: 0.98, store: "Carrefour" },
      { id: "pr_3", date: "2026-06-20", price: 1.02, store: "Lidl" },
      { id: "pr_4", date: "2026-07-15", price: 1.02, store: "Mercadona" },
      { id: "pr_5", date: "2026-08-10", price: 1.05, store: "Mercadona" },
    ],
  },
  {
    id: "prod_2",
    name: "Huevos Camperos Clase L (Docena)",
    category: "Lácteos y Huevos",
    unit: "packs",
    currentStock: 1,
    minStock: 2,
    idealStock: 3,
    currentPrice: 2.75,
    brand: "Granja Local",
    favoriteStore: "Lidl",
    notes: "Código 1 o 0 de cría en libertad.",
    lastUpdated: "2026-08-11",
    priceHistory: [
      { id: "pr_6", date: "2026-04-05", price: 2.50, store: "Lidl" },
      { id: "pr_7", date: "2026-06-02", price: 2.65, store: "Mercadona" },
      { id: "pr_8", date: "2026-08-11", price: 2.75, store: "Lidl" },
    ],
  },
  {
    id: "prod_3",
    name: "Aceite de Oliva Virgen Extra (1L)",
    category: "Despensa y Granos",
    unit: "botellas",
    currentStock: 1,
    minStock: 2,
    idealStock: 4,
    currentPrice: 8.90,
    brand: "Carbonell / Hacendado",
    favoriteStore: "Carrefour",
    notes: "Si hay garrafa de 5L a menos de 38€, priorizar garrafa.",
    lastUpdated: "2026-08-12",
    priceHistory: [
      { id: "pr_9", date: "2026-03-10", price: 7.80, store: "Mercadona" },
      { id: "pr_10", date: "2026-05-15", price: 8.20, store: "Dia" },
      { id: "pr_11", date: "2026-07-01", price: 8.60, store: "Carrefour" },
      { id: "pr_12", date: "2026-08-12", price: 8.90, store: "Carrefour" },
    ],
  },
  {
    id: "prod_4",
    name: "Pechuga de Pollo Fileteada (Bandeja 1kg)",
    category: "Carnes y Pescados",
    unit: "kg",
    currentStock: 0,
    minStock: 2,
    idealStock: 3,
    currentPrice: 7.20,
    brand: "Carnicería Fresca",
    favoriteStore: "Mercadona",
    notes: "Dividir en bolsas herméticas para congelador.",
    lastUpdated: "2026-08-14",
    priceHistory: [
      { id: "pr_13", date: "2026-04-10", price: 6.95, store: "Mercadona" },
      { id: "pr_14", date: "2026-06-18", price: 7.10, store: "Carrefour" },
      { id: "pr_15", date: "2026-08-14", price: 7.20, store: "Mercadona" },
    ],
  },
  {
    id: "prod_5",
    name: "Arroz Redondo Extra (Paquete 1kg)",
    category: "Despensa y Granos",
    unit: "kg",
    currentStock: 3,
    minStock: 2,
    idealStock: 4,
    currentPrice: 1.45,
    brand: "SOS / Brillante",
    favoriteStore: "Mercadona",
    notes: "Ideal para paellas y guisos.",
    lastUpdated: "2026-07-29",
    priceHistory: [
      { id: "pr_16", date: "2026-03-20", price: 1.35, store: "Mercadona" },
      { id: "pr_17", date: "2026-06-10", price: 1.40, store: "Lidl" },
      { id: "pr_18", date: "2026-07-29", price: 1.45, store: "Mercadona" },
    ],
  },
  {
    id: "prod_6",
    name: "Pasta Spaguetti Nº5 (1kg)",
    category: "Despensa y Granos",
    unit: "kg",
    currentStock: 1,
    minStock: 2,
    idealStock: 3,
    currentPrice: 1.30,
    brand: "Barilla / Gallo",
    favoriteStore: "Carrefour",
    notes: "Favoritos de los niños.",
    lastUpdated: "2026-08-01",
    priceHistory: [
      { id: "pr_19", date: "2026-04-15", price: 1.25, store: "Carrefour" },
      { id: "pr_20", date: "2026-08-01", price: 1.30, store: "Carrefour" },
    ],
  },
  {
    id: "prod_7",
    name: "Plátano de Canarias IGP (1kg)",
    category: "Frutas y Verduras",
    unit: "kg",
    currentStock: 0,
    minStock: 1.5,
    idealStock: 3,
    currentPrice: 2.15,
    brand: "Plátano Canario",
    favoriteStore: "Frutería del Barrio",
    notes: "Comprar un poco verdes para toda la semana.",
    lastUpdated: "2026-08-15",
    priceHistory: [
      { id: "pr_21", date: "2026-05-10", price: 1.95, store: "Frutería" },
      { id: "pr_22", date: "2026-07-05", price: 2.25, store: "Mercadona" },
      { id: "pr_23", date: "2026-08-15", price: 2.15, store: "Frutería" },
    ],
  },
  {
    id: "prod_8",
    name: "Tomate Triturado Natural (Lata 800g)",
    category: "Despensa y Granos",
    unit: "latas",
    currentStock: 4,
    minStock: 3,
    idealStock: 6,
    currentPrice: 1.15,
    brand: "Orlando / Cidacos",
    favoriteStore: "Mercadona",
    notes: "Sin azúcares añadidos.",
    lastUpdated: "2026-07-20",
    priceHistory: [
      { id: "pr_24", date: "2026-03-10", price: 1.05, store: "Mercadona" },
      { id: "pr_25", date: "2026-07-20", price: 1.15, store: "Mercadona" },
    ],
  },
  {
    id: "prod_9",
    name: "Detergente Líquido Lavadora (50 Lavados)",
    category: "Limpieza del Hogar",
    unit: "botellas",
    currentStock: 0,
    minStock: 1,
    idealStock: 2,
    currentPrice: 8.50,
    brand: "Ariel / Dixan",
    favoriteStore: "Carrefour",
    notes: "Aprovechar 2ª unidad al 50% si está activa.",
    lastUpdated: "2026-08-08",
    priceHistory: [
      { id: "pr_26", date: "2026-04-18", price: 7.90, store: "Carrefour" },
      { id: "pr_27", date: "2026-08-08", price: 8.50, store: "Carrefour" },
    ],
  },
  {
    id: "prod_10",
    name: "Papel Higiénico Doble Capa (Pack 24 rollos)",
    category: "Higiene y Cuidado Personal",
    unit: "packs",
    currentStock: 1,
    minStock: 1,
    idealStock: 2,
    currentPrice: 5.40,
    brand: "Bosque Verde / Foxy",
    favoriteStore: "Mercadona",
    notes: "Textura suave.",
    lastUpdated: "2026-08-05",
    priceHistory: [
      { id: "pr_28", date: "2026-03-01", price: 4.95, store: "Mercadona" },
      { id: "pr_29", date: "2026-06-12", price: 5.20, store: "Mercadona" },
      { id: "pr_30", date: "2026-08-05", price: 5.40, store: "Mercadona" },
    ],
  },
  {
    id: "prod_11",
    name: "Café Molido Natural Mezcla (250g)",
    category: "Despensa y Granos",
    unit: "packs",
    currentStock: 1,
    minStock: 2,
    idealStock: 4,
    currentPrice: 2.85,
    brand: "Marcilla / Lavazza",
    favoriteStore: "Alcampo",
    notes: "Tueste medio para cafetera italiana.",
    lastUpdated: "2026-08-09",
    priceHistory: [
      { id: "pr_31", date: "2026-04-02", price: 2.60, store: "Alcampo" },
      { id: "pr_32", date: "2026-08-09", price: 2.85, store: "Alcampo" },
    ],
  },
  {
    id: "prod_12",
    name: "Salmón Fresco en Porciones (500g)",
    category: "Carnes y Pescados",
    unit: "packs",
    currentStock: 0,
    minStock: 1,
    idealStock: 2,
    currentPrice: 8.90,
    brand: "Pescadería",
    favoriteStore: "Mercadona",
    notes: "Cena rica en Omega 3 para los martes.",
    lastUpdated: "2026-08-14",
    priceHistory: [
      { id: "pr_33", date: "2026-05-12", price: 8.40, store: "Mercadona" },
      { id: "pr_34", date: "2026-08-14", price: 8.90, store: "Mercadona" },
    ],
  },
  {
    id: "prod_13",
    name: "Comida Seca para Gato / Pienso Esterilizado (1.5kg)",
    category: "Mascotas",
    unit: "packs",
    currentStock: 1,
    minStock: 1,
    idealStock: 2,
    currentPrice: 9.75,
    brand: "Ultima / Purina",
    favoriteStore: "Kiwoko / Carrefour",
    notes: "Sabor salmón para Misi.",
    lastUpdated: "2026-08-02",
    priceHistory: [
      { id: "pr_35", date: "2026-04-20", price: 9.20, store: "Carrefour" },
      { id: "pr_36", date: "2026-08-02", price: 9.75, store: "Carrefour" },
    ],
  },
  {
    id: "prod_14",
    name: "Manzanas Fuji / Gala (Bolsa 1.5kg)",
    category: "Frutas y Verduras",
    unit: "kg",
    currentStock: 1,
    minStock: 2,
    idealStock: 3,
    currentPrice: 2.45,
    brand: "Fruta Nacional",
    favoriteStore: "Lidl",
    notes: "Meriendas saludables.",
    lastUpdated: "2026-08-13",
    priceHistory: [
      { id: "pr_37", date: "2026-04-09", price: 2.20, store: "Lidl" },
      { id: "pr_38", date: "2026-08-13", price: 2.45, store: "Lidl" },
    ],
  },
  {
    id: "prod_15",
    name: "Queso Curado Cuña (350g)",
    category: "Lácteos y Huevos",
    unit: "packs",
    currentStock: 0,
    minStock: 1,
    idealStock: 2,
    currentPrice: 4.60,
    brand: "García Baquero / Entrepinares",
    favoriteStore: "Mercadona",
    notes: "Para aperitivos y tablas.",
    lastUpdated: "2026-08-06",
    priceHistory: [
      { id: "pr_39", date: "2026-03-15", price: 4.25, store: "Mercadona" },
      { id: "pr_40", date: "2026-08-06", price: 4.60, store: "Mercadona" },
    ],
  },
];

export const INITIAL_MONTHLY_LISTS: MonthlyList[] = [
  {
    id: "list_2026-06",
    monthKey: "2026-06",
    title: "Junio 2026",
    budget: 380,
    status: "completada",
    notes: "Compra mensual de inicio de verano cerrada satisfactoriamente.",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-30",
    items: [
      {
        id: "item_jun_1",
        productId: "prod_1",
        productName: "Leche Entera Calcio (Brick 1L)",
        category: "Lácteos y Huevos",
        unit: "uds",
        estimatedPrice: 1.02,
        actualPrice: 1.02,
        quantity: 12,
        purchased: true,
        purchasedBy: "David (Papá)",
        purchasedAt: "2026-06-08",
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_1",
            memberName: "Carmen (Mamá)",
            memberAvatar: "👩‍🍳",
            quantityAdded: 6,
            timestamp: "2026-06-02",
          },
          {
            memberId: "mem_2",
            memberName: "David (Papá)",
            memberAvatar: "👨‍💼",
            quantityAdded: 6,
            timestamp: "2026-06-04",
          },
        ],
      },
      {
        id: "item_jun_2",
        productId: "prod_3",
        productName: "Aceite de Oliva Virgen Extra (1L)",
        category: "Despensa y Granos",
        unit: "botellas",
        estimatedPrice: 8.60,
        actualPrice: 8.60,
        quantity: 3,
        purchased: true,
        purchasedBy: "Carmen (Mamá)",
        purchasedAt: "2026-06-10",
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_1",
            memberName: "Carmen (Mamá)",
            memberAvatar: "👩‍🍳",
            quantityAdded: 3,
            timestamp: "2026-06-02",
          },
        ],
      },
      {
        id: "item_jun_3",
        productId: "prod_4",
        productName: "Pechuga de Pollo Fileteada (Bandeja 1kg)",
        category: "Carnes y Pescados",
        unit: "kg",
        estimatedPrice: 7.10,
        actualPrice: 7.10,
        quantity: 4,
        purchased: true,
        purchasedBy: "David (Papá)",
        purchasedAt: "2026-06-15",
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_2",
            memberName: "David (Papá)",
            memberAvatar: "👨‍💼",
            quantityAdded: 4,
            timestamp: "2026-06-03",
          },
        ],
      },
      {
        id: "item_jun_4",
        productId: "prod_9",
        productName: "Detergente Líquido Lavadora (50 Lavados)",
        category: "Limpieza del Hogar",
        unit: "botellas",
        estimatedPrice: 7.90,
        actualPrice: 7.90,
        quantity: 2,
        purchased: true,
        purchasedBy: "Carmen (Mamá)",
        purchasedAt: "2026-06-12",
        priority: "media",
        addedBy: [
          {
            memberId: "mem_1",
            memberName: "Carmen (Mamá)",
            memberAvatar: "👩‍🍳",
            quantityAdded: 2,
            timestamp: "2026-06-02",
          },
        ],
      },
      {
        id: "item_jun_5",
        productId: "prod_10",
        productName: "Papel Higiénico Doble Capa (Pack 24 rollos)",
        category: "Higiene y Cuidado Personal",
        unit: "packs",
        estimatedPrice: 5.20,
        actualPrice: 5.20,
        quantity: 2,
        purchased: true,
        purchasedBy: "Carmen (Mamá)",
        purchasedAt: "2026-06-12",
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_1",
            memberName: "Carmen (Mamá)",
            memberAvatar: "👩‍🍳",
            quantityAdded: 2,
            timestamp: "2026-06-02",
          },
        ],
      },
    ],
  },
  {
    id: "list_2026-07",
    monthKey: "2026-07",
    title: "Julio 2026",
    budget: 420,
    status: "completada",
    notes: "Mes de vacaciones, se incluyeron extras familiares.",
    createdAt: "2026-07-01",
    updatedAt: "2026-07-31",
    items: [
      {
        id: "item_jul_1",
        productId: "prod_1",
        productName: "Leche Entera Calcio (Brick 1L)",
        category: "Lácteos y Huevos",
        unit: "uds",
        estimatedPrice: 1.02,
        actualPrice: 1.02,
        quantity: 14,
        purchased: true,
        purchasedBy: "Carmen (Mamá)",
        purchasedAt: "2026-07-08",
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_1",
            memberName: "Carmen (Mamá)",
            memberAvatar: "👩‍🍳",
            quantityAdded: 8,
            timestamp: "2026-07-02",
          },
          {
            memberId: "mem_4",
            memberName: "Mateo (Hijo)",
            memberAvatar: "🧒",
            quantityAdded: 6,
            timestamp: "2026-07-04",
            note: "Para batidos y cereales",
          },
        ],
      },
      {
        id: "item_jul_2",
        productId: "prod_3",
        productName: "Aceite de Oliva Virgen Extra (1L)",
        category: "Despensa y Granos",
        unit: "botellas",
        estimatedPrice: 8.60,
        actualPrice: 8.75,
        quantity: 4,
        purchased: true,
        purchasedBy: "David (Papá)",
        purchasedAt: "2026-07-12",
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_2",
            memberName: "David (Papá)",
            memberAvatar: "👨‍💼",
            quantityAdded: 4,
            timestamp: "2026-07-03",
          },
        ],
      },
      {
        id: "item_jul_3",
        productId: "prod_4",
        productName: "Pechuga de Pollo Fileteada (Bandeja 1kg)",
        category: "Carnes y Pescados",
        unit: "kg",
        estimatedPrice: 7.10,
        actualPrice: 7.20,
        quantity: 5,
        purchased: true,
        purchasedBy: "Carmen (Mamá)",
        purchasedAt: "2026-07-15",
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_1",
            memberName: "Carmen (Mamá)",
            memberAvatar: "👩‍🍳",
            quantityAdded: 5,
            timestamp: "2026-07-02",
          },
        ],
      },
      {
        id: "item_jul_4",
        productId: "prod_12",
        productName: "Salmón Fresco en Porciones (500g)",
        category: "Carnes y Pescados",
        unit: "packs",
        estimatedPrice: 8.90,
        actualPrice: 8.90,
        quantity: 4,
        purchased: true,
        purchasedBy: "David (Papá)",
        purchasedAt: "2026-07-20",
        priority: "media",
        addedBy: [
          {
            memberId: "mem_3",
            memberName: "Lucía (Hija)",
            memberAvatar: "👧",
            quantityAdded: 2,
            timestamp: "2026-07-05",
          },
          {
            memberId: "mem_2",
            memberName: "David (Papá)",
            memberAvatar: "👨‍💼",
            quantityAdded: 2,
            timestamp: "2026-07-06",
          },
        ],
      },
      {
        id: "item_jul_5",
        productId: "prod_13",
        productName: "Comida Seca para Gato / Pienso Esterilizado (1.5kg)",
        category: "Mascotas",
        unit: "packs",
        estimatedPrice: 9.75,
        actualPrice: 9.75,
        quantity: 2,
        purchased: true,
        purchasedBy: "Lucía (Hija)",
        purchasedAt: "2026-07-22",
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_3",
            memberName: "Lucía (Hija)",
            memberAvatar: "👧",
            quantityAdded: 2,
            timestamp: "2026-07-05",
            note: "Comida favorita de Misi",
          },
        ],
      },
    ],
  },
  {
    id: "list_2026-08",
    monthKey: "2026-08",
    title: "Agosto 2026 (Actual)",
    budget: 400,
    status: "en_progreso",
    notes: "Lista activa del mes corriente. Añadiendo faltantes de stock y compras semanales.",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-16",
    items: [
      {
        id: "item_aug_1",
        productId: "prod_1",
        productName: "Leche Entera Calcio (Brick 1L)",
        category: "Lácteos y Huevos",
        unit: "uds",
        estimatedPrice: 1.05,
        actualPrice: 1.05,
        quantity: 10,
        purchased: true,
        purchasedBy: "David (Papá)",
        purchasedAt: "2026-08-05",
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_1",
            memberName: "Carmen (Mamá)",
            memberAvatar: "👩‍🍳",
            quantityAdded: 6,
            timestamp: "2026-08-01",
          },
          {
            memberId: "mem_2",
            memberName: "David (Papá)",
            memberAvatar: "👨‍💼",
            quantityAdded: 4,
            timestamp: "2026-08-03",
          },
        ],
      },
      {
        id: "item_aug_2",
        productId: "prod_2",
        productName: "Huevos Camperos Clase L (Docena)",
        category: "Lácteos y Huevos",
        unit: "packs",
        estimatedPrice: 2.75,
        quantity: 2,
        purchased: false,
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_1",
            memberName: "Carmen (Mamá)",
            memberAvatar: "👩‍🍳",
            quantityAdded: 2,
            timestamp: "2026-08-12",
            note: "Queda solo 1 huevo en la nevera",
          },
        ],
      },
      {
        id: "item_aug_3",
        productId: "prod_4",
        productName: "Pechuga de Pollo Fileteada (Bandeja 1kg)",
        category: "Carnes y Pescados",
        unit: "kg",
        estimatedPrice: 7.20,
        quantity: 3,
        purchased: false,
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_2",
            memberName: "David (Papá)",
            memberAvatar: "👨‍💼",
            quantityAdded: 2,
            timestamp: "2026-08-14",
          },
          {
            memberId: "mem_4",
            memberName: "Mateo (Hijo)",
            memberAvatar: "🧒",
            quantityAdded: 1,
            timestamp: "2026-08-15",
            note: "Para milanesas del fin de semana",
          },
        ],
      },
      {
        id: "item_aug_4",
        productId: "prod_9",
        productName: "Detergente Líquido Lavadora (50 Lavados)",
        category: "Limpieza del Hogar",
        unit: "botellas",
        estimatedPrice: 8.50,
        quantity: 1,
        purchased: false,
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_1",
            memberName: "Carmen (Mamá)",
            memberAvatar: "👩‍🍳",
            quantityAdded: 1,
            timestamp: "2026-08-10",
            note: "Stock actual en 0",
          },
        ],
      },
      {
        id: "item_aug_5",
        productId: "prod_7",
        productName: "Plátano de Canarias IGP (1kg)",
        category: "Frutas y Verduras",
        unit: "kg",
        estimatedPrice: 2.15,
        quantity: 3,
        purchased: false,
        priority: "media",
        addedBy: [
          {
            memberId: "mem_3",
            memberName: "Lucía (Hija)",
            memberAvatar: "👧",
            quantityAdded: 2,
            timestamp: "2026-08-14",
          },
          {
            memberId: "mem_4",
            memberName: "Mateo (Hijo)",
            memberAvatar: "🧒",
            quantityAdded: 1,
            timestamp: "2026-08-15",
          },
        ],
      },
      {
        id: "item_aug_6",
        productId: "prod_11",
        productName: "Café Molido Natural Mezcla (250g)",
        category: "Despensa y Granos",
        unit: "packs",
        estimatedPrice: 2.85,
        quantity: 2,
        purchased: false,
        priority: "media",
        addedBy: [
          {
            memberId: "mem_2",
            memberName: "David (Papá)",
            memberAvatar: "👨‍💼",
            quantityAdded: 2,
            timestamp: "2026-08-13",
          },
        ],
      },
      {
        id: "item_aug_7",
        productId: "prod_15",
        productName: "Queso Curado Cuña (350g)",
        category: "Lácteos y Huevos",
        unit: "packs",
        estimatedPrice: 4.60,
        quantity: 2,
        purchased: false,
        priority: "media",
        addedBy: [
          {
            memberId: "mem_1",
            memberName: "Carmen (Mamá)",
            memberAvatar: "👩‍🍳",
            quantityAdded: 2,
            timestamp: "2026-08-12",
          },
        ],
      },
    ],
  },
  {
    id: "list_2026-09",
    monthKey: "2026-09",
    title: "Septiembre 2026 (Próximo Mes)",
    budget: 450,
    status: "planificacion",
    notes: "Planificación temprana para la vuelta al cole y aprovisionamiento mensual.",
    createdAt: "2026-08-14",
    updatedAt: "2026-08-16",
    items: [
      {
        id: "item_sep_1",
        productId: "prod_1",
        productName: "Leche Entera Calcio (Brick 1L)",
        category: "Lácteos y Huevos",
        unit: "uds",
        estimatedPrice: 1.05,
        quantity: 12,
        purchased: false,
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_1",
            memberName: "Carmen (Mamá)",
            memberAvatar: "👩‍🍳",
            quantityAdded: 12,
            timestamp: "2026-08-14",
            note: "2 packs de 6 bricks para desayunos escolares",
          },
        ],
      },
      {
        id: "item_sep_2",
        productId: "prod_3",
        productName: "Aceite de Oliva Virgen Extra (1L)",
        category: "Despensa y Granos",
        unit: "botellas",
        estimatedPrice: 8.90,
        quantity: 3,
        purchased: false,
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_2",
            memberName: "David (Papá)",
            memberAvatar: "👨‍💼",
            quantityAdded: 3,
            timestamp: "2026-08-14",
          },
        ],
      },
      {
        id: "item_sep_3",
        productId: "prod_10",
        productName: "Papel Higiénico Doble Capa (Pack 24 rollos)",
        category: "Higiene y Cuidado Personal",
        unit: "packs",
        estimatedPrice: 5.40,
        quantity: 2,
        purchased: false,
        priority: "alta",
        addedBy: [
          {
            memberId: "mem_1",
            memberName: "Carmen (Mamá)",
            memberAvatar: "👩‍🍳",
            quantityAdded: 2,
            timestamp: "2026-08-15",
          },
        ],
      },
      {
        id: "item_sep_4",
        productId: "prod_6",
        productName: "Pasta Spaguetti Nº5 (1kg)",
        category: "Despensa y Granos",
        unit: "kg",
        estimatedPrice: 1.30,
        quantity: 3,
        purchased: false,
        priority: "media",
        addedBy: [
          {
            memberId: "mem_4",
            memberName: "Mateo (Hijo)",
            memberAvatar: "🧒",
            quantityAdded: 2,
            timestamp: "2026-08-15",
          },
          {
            memberId: "mem_3",
            memberName: "Lucía (Hija)",
            memberAvatar: "👧",
            quantityAdded: 1,
            timestamp: "2026-08-16",
          },
        ],
      },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    type: "stock_low",
    title: "Stock Crítico: Pechuga de Pollo",
    message: "Quedan 0 kg en stock (mínimo recomendado: 2 kg). Añadido a la lista mensual de compras.",
    timestamp: "2026-08-16T02:15:00.000Z",
    read: false,
    relatedProductId: "prod_4",
    severity: "danger",
  },
  {
    id: "notif_2",
    type: "stock_low",
    title: "Stock Crítico: Detergente Lavadora",
    message: "El stock de detergente llegó a 0 botellas. Se sugiere reponer urgentemente.",
    timestamp: "2026-08-15T18:30:00.000Z",
    read: false,
    relatedProductId: "prod_9",
    severity: "warning",
  },
  {
    id: "notif_3",
    type: "item_added",
    title: "Mateo sumó cantidades a Pechuga de Pollo",
    message: "Mateo añadió +1 kg a la lista de Agosto: 'Para milanesas del fin de semana'.",
    timestamp: "2026-08-15T16:20:00.000Z",
    read: false,
    relatedMonthKey: "2026-08",
    severity: "info",
  },
  {
    id: "notif_4",
    type: "budget_warning",
    title: "Proyección Presupuestaria de Agosto",
    message: "El gasto estimado actual está dentro de los 400€ proyectados (42% ejecutado).",
    timestamp: "2026-08-14T09:00:00.000Z",
    read: true,
    relatedMonthKey: "2026-08",
    severity: "success",
  },
];

// Helper functions for persistent storage
const STORAGE_KEYS = {
  PRODUCTS: "despensa_base_products_v1",
  LISTS: "despensa_monthly_lists_v1",
  MEMBERS: "despensa_family_members_v1",
  CURRENT_MEMBER: "despensa_current_member_v1",
  NOTIFICATIONS: "despensa_notifications_v1",
  ACTIVE_MONTH: "despensa_active_month_v1",
};

export function loadBaseProducts(): BaseProduct[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_BASE_PRODUCTS;
  } catch (e) {
    return INITIAL_BASE_PRODUCTS;
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
    return data ? JSON.parse(data) : INITIAL_MONTHLY_LISTS;
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
    return data ? JSON.parse(data) : INITIAL_MEMBERS;
  } catch (e) {
    return INITIAL_MEMBERS;
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
    return INITIAL_MEMBERS[0];
  } catch (e) {
    return INITIAL_MEMBERS[0];
  }
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
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
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
    return data || "2026-08";
  } catch (e) {
    return "2026-08";
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
