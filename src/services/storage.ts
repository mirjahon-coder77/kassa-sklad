import {
  User,
  Product,
  CustomFieldDefinition,
  Sale,
  Shift,
  StockMove,
  StoreSettings,
} from '../types/pos';

const STORAGE_KEYS = {
  USERS: 'dws_pos_users',
  CURRENT_USER: 'dws_pos_current_user',
  PRODUCTS: 'dws_pos_products',
  CUSTOM_FIELDS: 'dws_pos_custom_fields',
  SALES: 'dws_pos_sales',
  SHIFTS: 'dws_pos_shifts',
  CURRENT_SHIFT: 'dws_pos_current_shift',
  STOCK_MOVES: 'dws_pos_stock_moves',
  SETTINGS: 'dws_pos_settings',
  LAST_RECEIPT_NUM: 'dws_pos_last_receipt_num',
};

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'DUNYO WOMEN SHOP',
  subtitle: 'Ayollar kiyimi va parfumeriya',
  address: "Qarshi sh., Islom Karimov ko'chasi, 14-uy",
  phone: '+998 90 123 45 67',
  telegram: '@dunyo_women_shop',
  instagram: '@dunyo_women_shop',
  receiptFooter: 'Xaridingiz uchun rahmat!',
  paperWidth: '80mm',
  labelFormat: '40x30',
  currency: "so'm",
};

const DEFAULT_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Madina Karimova (Ega)',
    phone: '+998 90 123 45 67',
    role: 'owner',
    password: '123',
    createdAt: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'u-2',
    name: 'Nilufar Kassir',
    phone: '+998 93 987 65 43',
    role: 'cashier',
    password: '123',
    createdAt: '2026-10-15T09:00:00.000Z',
  },
];

const DEFAULT_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  { id: 'f-1', name: "O'lcham", type: 'text', required: false },
  { id: 'f-2', name: 'Rang', type: 'text', required: false },
  { id: 'f-3', name: 'Hajm (ml)', type: 'text', required: false },
  { id: 'f-4', name: 'Yaroqlilik muddati', type: 'text', required: false },
  { id: 'f-5', name: 'Brend', type: 'text', required: false },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p-cola',
    code: 'C-0001',
    barcode: '5449000000996',
    name: 'Coca-Cola 1.5L',
    category: 'Ichimliklar',
    costPrice: 11000,
    salePrice: 15000,
    hasDiscount: false,
    discountPrice: 15000,
    stock: 45,
    minStock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-10-20T08:00:00.000Z',
  },
  {
    id: 'p-rice',
    code: 'G-0001',
    barcode: '4780001234567',
    name: 'Guruch 1 kg',
    category: 'Bakaleya',
    costPrice: 26000,
    salePrice: 32000,
    hasDiscount: false,
    discountPrice: 32000,
    stock: 80,
    minStock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-10-20T08:15:00.000Z',
  },
  {
    id: 'p-detergent',
    code: 'K-0002',
    barcode: '4780009876543',
    name: 'Kir yuvish kukuni',
    category: 'Maishiy kimyo',
    costPrice: 21000,
    salePrice: 27000,
    hasDiscount: false,
    discountPrice: 27000,
    stock: 30,
    minStock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-10-20T08:30:00.000Z',
  },
  {
    id: 'p-1',
    code: 'K-0012',
    barcode: '200000000012',
    name: "Ko'ylak (M, qora)",
    category: 'Kiyim',
    costPrice: 110000,
    salePrice: 189000,
    hasDiscount: true,
    discountPrice: 159000,
    stock: 14,
    minStock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=120&auto=format&fit=crop&q=80',
    customFields: {
      size: 'M',
      color: 'qora',
      brand: 'Dunyo Collection',
    },
    createdAt: '2026-10-10T10:00:00.000Z',
  },
  {
    id: 'p-2',
    code: 'P-0034',
    barcode: '200000000034',
    name: "Atir 'Rose' (50 ml)",
    category: 'Parfumeriya',
    costPrice: 85000,
    salePrice: 120000,
    hasDiscount: false,
    discountPrice: 120000,
    stock: 8,
    minStock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=120&auto=format&fit=crop&q=80',
    customFields: {
      volume: '50 ml',
      expiryDate: '12.2028',
      brand: 'French Rose Lab',
    },
    createdAt: '2026-10-12T11:00:00.000Z',
  },
  {
    id: 'p-3',
    code: 'A-0007',
    barcode: '200000000007',
    name: 'Ipak sharf (qizil)',
    category: 'Aksessuar',
    costPrice: 20000,
    salePrice: 35000,
    hasDiscount: false,
    discountPrice: 35000,
    stock: 18,
    minStock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=120&auto=format&fit=crop&q=80',
    customFields: {
      color: 'qizil',
      brand: 'Ipak Yo\'li',
    },
    createdAt: '2026-10-15T12:00:00.000Z',
  },
  {
    id: 'p-4',
    code: 'K-0013',
    barcode: '200000000013',
    name: "Ko'ylak (L, oq)",
    category: 'Kiyim',
    costPrice: 110000,
    salePrice: 189000,
    hasDiscount: false,
    discountPrice: 189000,
    stock: 2, // Low stock warning!
    minStock: 4,
    customFields: {
      size: 'L',
      color: 'oq',
      brand: 'Dunyo Collection',
    },
    createdAt: '2026-10-15T14:30:00.000Z',
  },
  {
    id: 'p-5',
    code: 'P-0019',
    barcode: '200000000019',
    name: "Atir 'Vanilla Dream' (100 ml)",
    category: 'Parfumeriya',
    costPrice: 135000,
    salePrice: 210000,
    hasDiscount: true,
    discountPrice: 185000,
    stock: 6,
    minStock: 2,
    customFields: {
      volume: '100 ml',
      expiryDate: '06.2027',
      brand: 'Maison Luxe',
    },
    createdAt: '2026-10-18T16:20:00.000Z',
  },
  {
    id: 'p-6',
    code: 'B-0003',
    barcode: '200000000003',
    name: "Kumush sirg'a 'Zamondosh'",
    category: 'Bijuteriya',
    costPrice: 42000,
    salePrice: 75000,
    hasDiscount: false,
    discountPrice: 75000,
    stock: 1, // Low stock!
    minStock: 3,
    customFields: {
      color: 'kumush',
      brand: 'Sharq Bijou',
    },
    createdAt: '2026-10-20T09:10:00.000Z',
  },
  {
    id: 'p-7',
    code: 'A-0015',
    barcode: '200000000015',
    name: 'Charm ayollar kamari (jigarrang)',
    category: 'Aksessuar',
    costPrice: 28000,
    salePrice: 55000,
    hasDiscount: false,
    discountPrice: 55000,
    stock: 9,
    minStock: 3,
    customFields: {
      color: 'jigarrang',
      brand: 'Leather Chic',
    },
    createdAt: '2026-10-21T10:00:00.000Z',
  },
  {
    id: 'p-8',
    code: 'K-0018',
    barcode: '200000000018',
    name: 'Klassik ayollar kostyumi (qora)',
    category: 'Kiyim',
    costPrice: 220000,
    salePrice: 380000,
    hasDiscount: true,
    discountPrice: 330000,
    stock: 5,
    minStock: 2,
    customFields: {
      size: 'M/L',
      color: 'qora',
      brand: 'Dunyo Premium',
    },
    createdAt: '2026-10-22T13:45:00.000Z',
  },
];

const DEFAULT_SALES: Sale[] = [
  {
    id: 'sale-124',
    receiptNumber: '000124',
    timestamp: '2026-10-26T14:32:00.000Z',
    cashierName: 'Nilufar Kassir',
    paymentMethod: 'NAQD',
    items: [
      {
        productId: 'p-1',
        productCode: 'K-0012',
        productName: "Ko'ylak (M, qora)",
        customInfo: 'M, qora',
        quantity: 1,
        originalPrice: 189000,
        soldPrice: 159000,
        hasDiscount: true,
        total: 159000,
      },
      {
        productId: 'p-2',
        productCode: 'P-0034',
        productName: "Atir 'Rose' (50 ml)",
        customInfo: '50 ml',
        quantity: 1,
        originalPrice: 120000,
        soldPrice: 120000,
        hasDiscount: false,
        total: 120000,
      },
      {
        productId: 'p-3',
        productCode: 'A-0007',
        productName: 'Sharf (ipak, qizil)',
        customInfo: 'qizil',
        quantity: 2,
        originalPrice: 35000,
        soldPrice: 35000,
        hasDiscount: false,
        total: 70000,
      },
    ],
    totalOriginal: 379000,
    totalDiscount: 30000,
    itog: 349000,
    cashReceived: 350000,
    cashChange: 1000,
    status: 'active',
    shiftId: 'shift-current',
  },
];

export const StorageService = {
  // --- USERS & AUTH ---
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      // Default to the first owner user for convenience
      const users = this.getUsers();
      if (users.length > 0) {
        this.setCurrentUser(users[0]);
        return users[0];
      }
      return null;
    }
    return JSON.parse(raw);
  },

  setCurrentUser(user: User | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  },

  addUser(name: string, phone: string, role: 'owner' | 'cashier', password?: string): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      phone,
      role,
      password: password || '123',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const currentUser = this.getCurrentUser();
    if (currentUser?.id === id) {
      this.setCurrentUser(users[idx]);
    }
    return users[idx];
  },

  // --- SETTINGS ---
  getSettings(): StoreSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(raw);
  },

  updateSettings(settings: Partial<StoreSettings>): StoreSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // --- CUSTOM FIELDS ---
  getCustomFields(): CustomFieldDefinition[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_FIELDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(DEFAULT_CUSTOM_FIELDS));
      return DEFAULT_CUSTOM_FIELDS;
    }
    return JSON.parse(raw);
  },

  addCustomField(name: string, type: 'text' | 'number' | 'date'): CustomFieldDefinition {
    const fields = this.getCustomFields();
    const newField: CustomFieldDefinition = {
      id: `f-${Date.now()}`,
      name,
      type,
      required: false,
    };
    fields.push(newField);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(fields));
    return newField;
  },

  deleteCustomField(id: string): void {
    const fields = this.getCustomFields().filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(fields));
  },

  // --- PRODUCTS ---
  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    return JSON.parse(raw);
  },

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  },

  getProductByCodeOrBarcode(query: string): Product | undefined {
    const q = query.trim().toUpperCase();
    return this.getProducts().find(
      (p) => p.code.toUpperCase() === q || p.barcode.toUpperCase() === q
    );
  },

  saveProduct(productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }): Product {
    const products = this.getProducts();
    if (productData.id) {
      const idx = products.findIndex((p) => p.id === productData.id);
      if (idx !== -1) {
        const oldProduct = products[idx];
        const updated: Product = {
          ...oldProduct,
          ...productData,
          id: productData.id,
        };
        products[idx] = updated;
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

        // If stock changed manually, record move
        if (oldProduct.stock !== updated.stock) {
          this.recordStockMove({
            productId: updated.id,
            productName: updated.name,
            productCode: updated.code,
            type: 'inventarizatsiya',
            quantity: updated.stock - oldProduct.stock,
            previousStock: oldProduct.stock,
            newStock: updated.stock,
            reason: 'Katalog orqali to\'g\'rilandi',
          });
        }
        return updated;
      }
    }

    // New Product
    const newProduct: Product = {
      ...productData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    this.recordStockMove({
      productId: newProduct.id,
      productName: newProduct.name,
      productCode: newProduct.code,
      type: 'kirim',
      quantity: newProduct.stock,
      previousStock: 0,
      newStock: newProduct.stock,
      reason: 'Boshlang\'ich qoldiq kiritildi',
    });

    return newProduct;
  },

  deleteProduct(id: string): void {
    const products = this.getProducts().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Helper to generate next unique code like K-0013, P-0035, A-0008, B-0004
  getNextProductCode(category: string): string {
    const prefixMap: Record<string, string> = {
      Kiyim: 'K',
      Parfumeriya: 'P',
      Aksessuar: 'A',
      Bijuteriya: 'B',
      Poyabzal: 'Y',
      Boshqa: 'T',
    };
    const prefix = prefixMap[category] || 'T';
    const products = this.getProducts();
    const codes = products
      .map((p) => p.code)
      .filter((c) => c.startsWith(`${prefix}-`))
      .map((c) => {
        const numPart = parseInt(c.replace(`${prefix}-`, ''), 10);
        return isNaN(numPart) ? 0 : numPart;
      });
    const maxNum = codes.length > 0 ? Math.max(...codes) : 0;
    const nextNum = maxNum + 1;
    return `${prefix}-${String(nextNum).padStart(4, '0')}`;
  },

  // --- SHIFTS (Kunni ochish / yopish) ---
  getCurrentShift(): Shift | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_SHIFT);
    if (!raw) {
      const initialized = localStorage.getItem('dws_pos_initialized');
      if (initialized) {
        // Smena yopilgan!
        return null;
      }
      // Birinchi marta kirganda namunaviy ochiq smena
      const defaultShift: Shift = {
        id: 'shift-current',
        openedAt: '2026-10-26T09:00:00.000Z',
        status: 'open',
        cashierName: 'Nilufar Kassir',
        startingCash: 200000,
        cashSales: 349000,
        cardSales: 0,
        totalSales: 349000,
        totalDiscount: 30000,
        salesCount: 1,
        cancelledCount: 0,
        cancelledSum: 0,
        itemsCount: 4,
      };
      localStorage.setItem('dws_pos_initialized', 'true');
      localStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, JSON.stringify(defaultShift));
      return defaultShift;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.status === 'open') {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  getAllShifts(): Shift[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    if (!raw) return [];
    try {
      const list: Shift[] = JSON.parse(raw);
      if (!Array.isArray(list)) return [];
      // Deduplicate by id so React keys never collide
      const seen = new Set<string>();
      return list.filter((s) => {
        if (!s || !s.id || seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
    } catch {
      return [];
    }
  },

  openShift(cashierName: string, startingCash: number): Shift {
    const newShiftId = `shift-${Date.now()}`;
    const newShift: Shift = {
      id: newShiftId,
      openedAt: new Date().toISOString(),
      status: 'open',
      cashierName,
      startingCash,
      cashSales: 0,
      cardSales: 0,
      totalSales: 0,
      totalDiscount: 0,
      salesCount: 0,
      cancelledCount: 0,
      cancelledSum: 0,
      itemsCount: 0,
    };
    localStorage.setItem('dws_pos_initialized', 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, JSON.stringify(newShift));
    return newShift;
  },

  closeShift(countedCash: number, notes?: string): Shift {
    const currentShift = this.getCurrentShift();
    if (!currentShift) throw new Error('Ochiq smena topilmadi');

    // Yangi ochilgan kundagi sotuvlarni qayta tekshirib aniqlashtirish
    const currentShiftSales = this.getSales().filter(
      (s) => s.shiftId === currentShift.id && s.status === 'active'
    );
    const actualCashSales = currentShiftSales
      .filter((s) => s.paymentMethod === 'NAQD')
      .reduce((sum, s) => sum + s.itog, 0);
    const actualCardSales = currentShiftSales
      .filter((s) => s.paymentMethod === 'KARTA')
      .reduce((sum, s) => sum + s.itog, 0);
    const actualTotalSales = actualCashSales + actualCardSales;
    const actualTotalDiscount = currentShiftSales.reduce((sum, s) => sum + s.totalDiscount, 0);
    const actualItemsCount = currentShiftSales.reduce(
      (sum, s) => sum + s.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );

    const expectedCash = currentShift.startingCash + actualCashSales;
    const cashDifference = countedCash - expectedCash;

    // Har bir yopilgan smenaga takrorlanmas noyob ID berish
    const closedShiftId =
      currentShift.id === 'shift-current'
        ? `shift-closed-${Date.now()}`
        : currentShift.id;

    const closedShift: Shift = {
      ...currentShift,
      id: closedShiftId,
      cashSales: actualCashSales,
      cardSales: actualCardSales,
      totalSales: actualTotalSales,
      totalDiscount: actualTotalDiscount,
      salesCount: currentShiftSales.length,
      itemsCount: actualItemsCount,
      closedAt: new Date().toISOString(),
      status: 'closed',
      countedCash,
      cashDifference,
      notes,
    };

    const shifts = this.getAllShifts().filter((s) => s.id !== closedShiftId);
    shifts.unshift(closedShift);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SHIFT);
    localStorage.setItem('dws_pos_initialized', 'true');

    return closedShift;
  },

  // Faqat joriy ochiq smenadagi sotilgan cheklar
  getCurrentShiftSales(): Sale[] {
    const currentShift = this.getCurrentShift();
    if (!currentShift) return [];
    return this.getSales().filter(
      (s) => s.shiftId === currentShift.id && s.status === 'active'
    );
  },

  // Faqat joriy ochiq smenada sotilgan tovarlar statistikasi
  getCurrentShiftTopProducts(): Array<{ name: string; code: string; count: number; total: number }> {
    const shiftSales = this.getCurrentShiftSales();
    const map: Record<string, { name: string; code: string; count: number; total: number }> = {};

    shiftSales.forEach((s) => {
      s.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = {
            name: item.productName,
            code: item.productCode,
            count: 0,
            total: 0,
          };
        }
        map[item.productId].count += item.quantity;
        map[item.productId].total += item.total;
      });
    });

    return Object.values(map).sort((a, b) => b.count - a.count);
  },

  // --- SALES & TRANSACTIONS ---
  getSales(): Sale[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(DEFAULT_SALES));
      return DEFAULT_SALES;
    }
    return JSON.parse(raw);
  },

  getNextReceiptNumber(): string {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_RECEIPT_NUM);
    const lastNum = raw ? parseInt(raw, 10) : 124;
    const nextNum = lastNum + 1;
    localStorage.setItem(STORAGE_KEYS.LAST_RECEIPT_NUM, String(nextNum));
    return String(nextNum).padStart(6, '0');
  },

  createSale(
    items: Array<{
      product: Product;
      quantity: number;
    }>,
    paymentMethod: 'NAQD' | 'KARTA',
    cashReceived?: number,
    cashChange?: number
  ): Sale {
    const currentShift = this.getCurrentShift();
    const currentUser = this.getCurrentUser();
    const cashierName = currentUser?.name || currentShift?.cashierName || 'Kassir';

    let totalOriginal = 0;
    let totalDiscount = 0;
    let itog = 0;
    let itemsCount = 0;

    const saleItems = items.map((cartItem) => {
      const p = cartItem.product;
      const qty = cartItem.quantity;
      const origPrice = p.salePrice;
      const soldPrice = p.hasDiscount && p.discountPrice ? p.discountPrice : origPrice;
      const rowTotal = soldPrice * qty;
      const rowDiscount = (origPrice - soldPrice) * qty;

      totalOriginal += origPrice * qty;
      totalDiscount += rowDiscount;
      itog += rowTotal;
      itemsCount += qty;

      // Deduct stock from products
      const products = this.getProducts();
      const pIdx = products.findIndex((prod) => prod.id === p.id);
      if (pIdx !== -1) {
        const prev = products[pIdx].stock;
        const next = Math.max(0, prev - qty);
        products[pIdx].stock = next;
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

        this.recordStockMove({
          productId: p.id,
          productName: p.name,
          productCode: p.code,
          type: 'savdo',
          quantity: -qty,
          previousStock: prev,
          newStock: next,
          reason: `Savdo cheki`,
        });
      }

      // Build custom info string e.g. "M, qora" or "50 ml"
      const customParts: string[] = [];
      if (p.customFields?.size) customParts.push(p.customFields.size);
      if (p.customFields?.color) customParts.push(p.customFields.color);
      if (p.customFields?.volume) customParts.push(p.customFields.volume);

      return {
        productId: p.id,
        productCode: p.code,
        productName: p.name,
        customInfo: customParts.join(', '),
        quantity: qty,
        originalPrice: origPrice,
        soldPrice,
        hasDiscount: p.hasDiscount,
        total: rowTotal,
      };
    });

    const receiptNumber = this.getNextReceiptNumber();
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      receiptNumber,
      timestamp: new Date().toISOString(),
      cashierName,
      paymentMethod,
      items: saleItems,
      totalOriginal,
      totalDiscount,
      itog,
      cashReceived,
      cashChange,
      status: 'active',
      shiftId: currentShift?.id || 'default',
    };

    const sales = this.getSales();
    sales.unshift(newSale);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

    // Update active shift stats
    if (currentShift) {
      if (paymentMethod === 'NAQD') {
        currentShift.cashSales += itog;
      } else {
        currentShift.cardSales += itog;
      }
      currentShift.totalSales += itog;
      currentShift.totalDiscount += totalDiscount;
      currentShift.salesCount += 1;
      currentShift.itemsCount += itemsCount;
      localStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, JSON.stringify(currentShift));
    }

    return newSale;
  },

  // Cancel receipt with mandatory reason and return inventory to stock
  cancelSale(saleId: string, reason: string): Sale | null {
    const sales = this.getSales();
    const idx = sales.findIndex((s) => s.id === saleId);
    if (idx === -1) return null;

    const sale = sales[idx];
    if (sale.status === 'cancelled') return sale;

    const currentUser = this.getCurrentUser();

    // 1. Mark as cancelled
    sale.status = 'cancelled';
    sale.cancellationReason = reason;
    sale.cancelledAt = new Date().toISOString();
    sale.cancelledBy = currentUser?.name || 'Kassir';
    sales[idx] = sale;
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

    // 2. Rollback stock
    const products = this.getProducts();
    sale.items.forEach((item) => {
      const pIdx = products.findIndex((p) => p.id === item.productId);
      if (pIdx !== -1) {
        const prev = products[pIdx].stock;
        const next = prev + item.quantity;
        products[pIdx].stock = next;

        this.recordStockMove({
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
          type: 'bekor',
          quantity: item.quantity,
          previousStock: prev,
          newStock: next,
          reason: `Chek #${sale.receiptNumber} bekor qilindi (${reason})`,
        });
      }
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // 3. Update shift stats
    const currentShift = this.getCurrentShift();
    if (currentShift && currentShift.id === sale.shiftId) {
      if (sale.paymentMethod === 'NAQD') {
        currentShift.cashSales = Math.max(0, currentShift.cashSales - sale.itog);
      } else {
        currentShift.cardSales = Math.max(0, currentShift.cardSales - sale.itog);
      }
      currentShift.totalSales = Math.max(0, currentShift.totalSales - sale.itog);
      currentShift.cancelledCount += 1;
      currentShift.cancelledSum += sale.itog;
      localStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, JSON.stringify(currentShift));
    }

    return sale;
  },

  // --- STOCK & WAREHOUSE INVENTORY ---
  getStockMoves(): StockMove[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STOCK_MOVES);
    if (!raw) return [];
    return JSON.parse(raw);
  },

  recordStockMove(data: {
    productId: string;
    productName: string;
    productCode: string;
    type: StockMove['type'];
    quantity: number;
    previousStock: number;
    newStock: number;
    reason?: string;
    supplier?: string;
  }): StockMove {
    const currentUser = this.getCurrentUser();
    const move: StockMove = {
      id: `move-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...data,
      date: new Date().toISOString(),
      operator: currentUser?.name || 'Administrator',
    };
    const moves = this.getStockMoves();
    moves.unshift(move);
    // Keep max 500 moves in localStorage
    if (moves.length > 500) moves.length = 500;
    localStorage.setItem(STORAGE_KEYS.STOCK_MOVES, JSON.stringify(moves));
    return move;
  },

  // Stock In (Kirim)
  addStockIn(
    productId: string,
    quantity: number,
    supplier: string,
    newCostPrice?: number,
    notes?: string
  ): Product | null {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx === -1) return null;

    const product = products[idx];
    const prev = product.stock;
    const next = prev + quantity;
    product.stock = next;
    if (newCostPrice !== undefined && newCostPrice > 0) {
      product.costPrice = newCostPrice;
    }
    products[idx] = product;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    this.recordStockMove({
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      type: 'kirim',
      quantity,
      previousStock: prev,
      newStock: next,
      supplier,
      reason: notes || `Yetkazib beruvchi: ${supplier}`,
    });

    return product;
  },

  // Write off (Spisanie)
  writeOffStock(productId: string, quantity: number, reason: string): Product | null {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx === -1) return null;

    const product = products[idx];
    const prev = product.stock;
    const next = Math.max(0, prev - quantity);
    product.stock = next;
    products[idx] = product;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    this.recordStockMove({
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      type: 'spisanie',
      quantity: -quantity,
      previousStock: prev,
      newStock: next,
      reason,
    });

    return product;
  },

  // Inventory adjustment (Inventarizatsiya)
  adjustStock(productId: string, actualCount: number, notes?: string): Product | null {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx === -1) return null;

    const product = products[idx];
    const prev = product.stock;
    const diff = actualCount - prev;
    product.stock = actualCount;
    products[idx] = product;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    this.recordStockMove({
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      type: 'inventarizatsiya',
      quantity: diff,
      previousStock: prev,
      newStock: actualCount,
      reason: notes || `Inventarizatsiya (farq: ${diff > 0 ? '+' : ''}${diff})`,
    });

    return product;
  },

  // --- BACKUP & RESTORE ---
  exportBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      storeName: this.getSettings().storeName,
      users: this.getUsers(),
      products: this.getProducts(),
      customFields: this.getCustomFields(),
      sales: this.getSales(),
      shifts: this.getAllShifts(),
      currentShift: this.getCurrentShift(),
      stockMoves: this.getStockMoves(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.products || !Array.isArray(data.products)) {
        return { success: false, message: "Noto'g'ri zaxira fayl formati!" };
      }

      if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      if (data.products) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
      if (data.customFields)
        localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(data.customFields));
      if (data.sales) localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data.sales));
      if (data.shifts) localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(data.shifts));
      if (data.currentShift)
        localStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, JSON.stringify(data.currentShift));
      if (data.stockMoves)
        localStorage.setItem(STORAGE_KEYS.STOCK_MOVES, JSON.stringify(data.stockMoves));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));

      return { success: true, message: 'Ma\'lumotlar muvaffaqiyatli tiklandi!' };
    } catch (err: any) {
      return { success: false, message: `Xatolik: ${err.message}` };
    }
  },

  // Reset to factory sample state
  resetAllData(): void {
    localStorage.clear();
    this.getUsers();
    this.getProducts();
    this.getCustomFields();
    this.getSales();
    this.getCurrentShift();
    this.getSettings();
  },
};
