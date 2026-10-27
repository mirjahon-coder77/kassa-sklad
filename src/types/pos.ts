export type UserRole = 'owner' | 'cashier';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  password?: string;
  createdAt: string;
}

export type ProductCategory =
  | 'Kiyim'
  | 'Parfumeriya'
  | 'Bijuteriya'
  | 'Aksessuar'
  | 'Poyabzal'
  | 'Ichimliklar'
  | 'Bakaleya'
  | 'Maishiy kimyo'
  | 'Boshqa';

export interface Product {
  id: string;
  code: string; // e.g. "K-0012", "P-0034", "A-0007"
  barcode: string; // Code 128 number e.g. "200000000012"
  name: string;
  category: ProductCategory;
  costPrice: number; // Kelish narxi (tannarx)
  salePrice: number; // Asl sotuv narxi
  hasDiscount: boolean; // Chegirma bor/yo'q
  discountPrice: number; // Chegirmali narx
  stock: number; // Hozirgi qoldiq
  minStock: number; // Minimal xavfsiz qoldiq
  imageUrl?: string; // Tovar rasmi (kichik thumbnail)
  customFields?: {
    size?: string; // O'lcham: XS, S, M, L, XL
    color?: string; // Rang: qora, qizil, oq...
    volume?: string; // Hajm: 50 ml, 100 ml
    expiryDate?: string; // Yaroqlilik muddati: 12.2028
    brand?: string; // Brend nomi
    [key: string]: any;
  };
  createdAt: string;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date';
  required: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'NAQD' | 'KARTA';

export interface SaleItem {
  productId: string;
  productCode: string;
  productName: string;
  customInfo: string;
  quantity: number;
  originalPrice: number;
  soldPrice: number;
  hasDiscount: boolean;
  total: number;
}

export interface Sale {
  id: string;
  receiptNumber: string; // e.g. "000124"
  timestamp: string; // ISO string
  cashierName: string;
  paymentMethod: PaymentMethod;
  items: SaleItem[];
  totalOriginal: number;
  totalDiscount: number;
  itog: number;
  cashReceived?: number;
  cashChange?: number;
  status: 'active' | 'cancelled';
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  shiftId: string;
}

export interface Shift {
  id: string;
  openedAt: string;
  closedAt?: string;
  status: 'open' | 'closed';
  cashierName: string;
  startingCash: number;
  cashSales: number;
  cardSales: number;
  totalSales: number;
  totalDiscount: number;
  salesCount: number;
  cancelledCount: number;
  cancelledSum: number;
  itemsCount: number;
  countedCash?: number;
  cashDifference?: number;
  notes?: string;
}

export type StockMoveType = 'kirim' | 'savdo' | 'bekor' | 'spisanie' | 'inventarizatsiya';

export interface StockMove {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  type: StockMoveType;
  quantity: number; // Musbat yoki manfiy
  previousStock: number;
  newStock: number;
  date: string;
  reason?: string;
  supplier?: string;
  operator: string;
}

export interface StoreSettings {
  storeName: string;
  subtitle: string;
  address: string;
  phone: string;
  telegram: string;
  instagram: string;
  receiptFooter: string;
  paperWidth: '80mm' | '58mm';
  labelFormat: '40x30' | '58x40' | '30x20';
  currency: string;
}
