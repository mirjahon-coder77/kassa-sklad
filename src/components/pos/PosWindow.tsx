import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, PaymentMethod, Shift, StoreSettings, Sale } from '../../types/pos';
import { StorageService } from '../../services/storage';
import { ProductPickerModal } from './ProductPickerModal';
import { ReceiptModal } from './ReceiptModal';
import confetti from 'canvas-confetti';
import {
  Search,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Receipt,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  Package,
} from 'lucide-react';

interface PosWindowProps {
  shift: Shift | null;
  settings: StoreSettings;
  onOpenShiftModal: () => void;
  onDataChanged: () => void;
}

const BarcodeLinesIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-slate-400' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 5h2v14H2zm3 0h1v14H5zm2 0h2v14H7zm3 0h1v14h-1zm2 0h2v14h-2zm3 0h1v14h-1zm2 0h3v14h-3zm4 0h1v14h-1z" />
  </svg>
);

export const PosWindow: React.FC<PosWindowProps> = ({
  shift,
  settings,
  onOpenShiftModal,
  onDataChanged,
}) => {
  const products = StorageService.getProducts();

  // Birlamchi savat bo'sh bo'ladi — foydalanuvchi o'zi kiritadi
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('NAQD');
  const [manualDiscount, setManualDiscount] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' } | null>(
    null
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus scanner input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard shortcuts (F2, F9, F10, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setIsPickerOpen(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        setPaymentMethod('NAQD');
      } else if (e.key === 'F10') {
        e.preventDefault();
        setPaymentMethod('KARTA');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (text: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAddToCart = (product: Product, quantityToAdd = 1) => {
    if (product.stock <= 0) {
      showToast(`Ogohlantirish: "${product.name}" qoldig'i tugagan (0 dona)!`, 'warning');
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex !== -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantityToAdd;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        showToast(
          `✓ Qo'shildi: ${product.name} (${newQty}-dona) — qoldiq: ${product.stock} dona`
        );
        return updated;
      } else {
        showToast(
          `✓ Qo'shildi: ${product.name} — qoldiq: ${product.stock} dona`
        );
        return [...prevCart, { product, quantity: quantityToAdd }];
      }
    });

    setBarcodeInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    let product = StorageService.getProductByCodeOrBarcode(query);

    if (!product) {
      const q = query.toLowerCase();
      product = products.find(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.barcode.includes(q)
      );
    }

    if (product) {
      handleAddToCart(product, 1);
    } else {
      showToast(`Tovar topilmadi: "${query}". Kod yoki shtrix-kodni tekshiring!`, 'warning');
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          if (newQuantity > item.product.stock) {
            showToast(
              `Diqqat: Sklad qoldig'i kam (${item.product.stock} dona mavjud)!`,
              'warning'
            );
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCashGiven('');
    setManualDiscount(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Calculations
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalOriginal = cart.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0
  );

  const autoDiscount = cart.reduce((sum, item) => {
    if (item.product.hasDiscount && item.product.discountPrice) {
      return (
        sum + (item.product.salePrice - item.product.discountPrice) * item.quantity
      );
    }
    return sum;
  }, 0);

  const effectiveDiscount = autoDiscount + (manualDiscount || 0);
  const itog = Math.max(0, totalOriginal - effectiveDiscount);

  // Cash change calculation
  const numericCashGiven = parseFloat(cashGiven) || 0;
  const cashChange = numericCashGiven > 0 ? numericCashGiven - itog : 0;

  // Checkout & Print Receipt
  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast('Savat bo\'sh! Avval tovar qo\'shing.', 'warning');
      return;
    }

    if (!shift || shift.status !== 'open') {
      showToast('Smena ochiq emas! Chek chiqarish uchun avval smenani oching.', 'warning');
      onOpenShiftModal();
      return;
    }

    try {
      const saleItems = cart.map((item) => {
        const p = item.product;
        const soldPrice =
          p.hasDiscount && p.discountPrice ? p.discountPrice : p.salePrice;
        const customParts: string[] = [];
        if (p.customFields?.size) customParts.push(p.customFields.size);
        if (p.customFields?.color) customParts.push(p.customFields.color);
        if (p.customFields?.volume) customParts.push(p.customFields.volume);

        return {
          productId: p.id,
          productCode: p.code,
          productName: p.name,
          customInfo: customParts.join(', '),
          quantity: item.quantity,
          originalPrice: p.salePrice,
          soldPrice: soldPrice,
          hasDiscount: p.hasDiscount,
          total: soldPrice * item.quantity,
        };
      });

      const cashierName = StorageService.getCurrentUser()?.name || 'Kassir';

      const sale = StorageService.createSale(
        cart,
        paymentMethod,
        paymentMethod === 'NAQD' && numericCashGiven > 0 ? numericCashGiven : undefined,
        paymentMethod === 'NAQD' && cashChange > 0 ? cashChange : undefined
      );

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      setActiveReceipt(sale);
      clearCart();
      onDataChanged();
    } catch (err: any) {
      showToast(`Xatolik yuz berdi: ${err.message}`, 'warning');
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden p-6 gap-6 bg-[#f1f5f9] select-none">
      {/* LEFT COLUMN: Cart Table & Barcode Search matching image_f5bf5453.png */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 overflow-hidden min-h-[calc(100vh-112px)]">
        {/* Top Barcode Input & Catalog button */}
        <div className="mb-4">
          <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-3.5 pointer-events-none">
                <BarcodeLinesIcon className="w-5 h-5 text-slate-400" />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Shtrix-kod yoki tovar nomini kiriting..."
                className="w-full pl-11 pr-11 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-sans shadow-2xs"
                autoComplete="off"
              />
              <span className="absolute right-3.5 top-3.5 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="px-4 py-3 bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <LayoutGrid className="w-4 h-4" />
              Katalogdan tanlash
            </button>
          </form>

          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`mt-2.5 p-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          )}
        </div>

        {/* Cart Table matching image_f5bf5453.png */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400 border border-slate-200">
                <BarcodeLinesIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">
                Savat hozircha bo'sh
              </h3>
              <p className="text-xs max-w-sm text-slate-500 mb-4">
                Shtrix-kodni skanerlang, tovar nomini yozing yoki «Katalogdan tanlash» tugmasini bosing.
              </p>
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="px-4 py-2.5 bg-[#0f172a] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <LayoutGrid className="w-4 h-4" />
                Katalogdan tanlash (F2)
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium text-xs">
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      defaultChecked
                    />
                  </th>
                  <th className="py-3 px-3 font-semibold text-slate-600">Tovar</th>
                  <th className="py-3 px-3 font-semibold text-slate-600 w-32">Narx</th>
                  <th className="py-3 px-3 font-semibold text-slate-600 w-36 text-center">Miqdor</th>
                  <th className="py-3 px-3 font-semibold text-slate-600 w-32">Jami</th>
                  <th className="py-3 px-3 font-semibold text-slate-600 w-16 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {cart.map((item) => {
                  const p = item.product;
                  const itemPrice =
                    p.hasDiscount && p.discountPrice ? p.discountPrice : p.salePrice;
                  const rowTotal = itemPrice * item.quantity;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          defaultChecked
                        />
                      </td>

                      {/* Tovar cell with image thumbnail matching image_f5bf5453.png */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback on image load error
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Package className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {p.category}
                              {p.customFields?.size ? ` · ${p.customFields.size}` : ''}
                              {p.customFields?.color ? ` · ${p.customFields.color}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Narx cell */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 text-xs font-mono-num">
                          {p.salePrice.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400">so'm</div>
                      </td>

                      {/* Miqdor stepper matching image_f5bf5453.png */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(p.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(p.id, parseInt(e.target.value, 10) || 1)
                            }
                            className="w-10 text-center font-bold text-xs py-1 border-x border-slate-200 font-mono-num bg-transparent focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(p.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Jami cell */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 text-xs font-mono-num">
                          {rowTotal.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400">so'm</div>
                      </td>

                      {/* Amallar cell with red trash icon */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeFromCart(p.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Savatdan o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Bar matching image_f5bf5453.png */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="px-4 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start"
          >
            <Plus className="w-4 h-4" />
            Tovar qo'shish
          </button>

          {/* Hotkey hints bar */}
          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono font-bold text-[11px]">
                F2
              </kbd>
              <span>Qidirish</span>
            </span>

            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono font-bold text-[11px]">
                F9
              </kbd>
              <span>Naqd to'lov</span>
            </span>

            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono font-bold text-[11px]">
                F10
              </kbd>
              <span>Karta to'lov</span>
            </span>

            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono font-bold text-[11px]">
                Enter
              </kbd>
              <span>Chek chiqarish</span>
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: To'lov (Payment Panel) matching image_f5bf5453.png */}
      <div className="w-96 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between overflow-y-auto shrink-0 min-h-[calc(100vh-112px)]">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-5">
            To'lov
          </h2>

          {/* Summary calculations */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">
                Jami ({totalItemsCount} ta tovar)
              </span>
              <span className="font-bold text-slate-900 font-mono-num text-sm">
                {totalOriginal.toLocaleString()} so'm
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Chegirma</span>
              <div className="flex items-center border border-slate-200 rounded-lg px-2.5 py-1 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 shadow-2xs">
                <input
                  type="number"
                  min="0"
                  value={manualDiscount || ''}
                  onChange={(e) => setManualDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 text-right text-xs font-bold font-mono-num text-slate-800 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-400 font-medium pl-1">so'm</span>
              </div>
            </div>

            {/* Yakuniy summa matching image_f5bf5453.png */}
            <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
              <span className="font-bold text-base text-slate-900">
                Yakuniy summa
              </span>
              <span className="font-black text-2xl text-slate-900 font-mono-num">
                {itog.toLocaleString()} so'm
              </span>
            </div>
          </div>

          {/* To'lov usuli selector matching image_f5bf5453.png */}
          <div className="mt-6 space-y-2">
            <label className="block text-xs font-bold text-slate-900">
              To'lov usuli
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Naqd button */}
              <button
                type="button"
                onClick={() => setPaymentMethod('NAQD')}
                className={`p-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer relative shadow-2xs ${
                  paymentMethod === 'NAQD'
                    ? 'border-2 border-emerald-500 bg-emerald-50/40 text-emerald-900'
                    : 'border border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                {paymentMethod === 'NAQD' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute top-2 right-2 fill-emerald-100" />
                )}
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Naqd</span>
              </button>

              {/* Karta button */}
              <button
                type="button"
                onClick={() => setPaymentMethod('KARTA')}
                className={`p-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer relative shadow-2xs ${
                  paymentMethod === 'KARTA'
                    ? 'border-2 border-emerald-500 bg-emerald-50/40 text-emerald-900'
                    : 'border border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                {paymentMethod === 'KARTA' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute top-2 right-2 fill-emerald-100" />
                )}
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span>Karta</span>
              </button>
            </div>
          </div>

          {/* Tez to'lov (ixtiyoriy) buttons matching image_f5bf5453.png */}
          <div className="mt-6 space-y-2">
            <label className="block text-xs text-slate-500 font-medium">
              Tez to'lov (ixtiyoriy)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[50000, 100000, 200000, 500000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setCashGiven(amount.toString())}
                  className={`py-2 px-1 rounded-xl text-xs font-bold font-mono-num border transition-all cursor-pointer shadow-2xs text-center ${
                    numericCashGiven === amount
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {amount.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Cash change preview if cash entered */}
            {paymentMethod === 'NAQD' && numericCashGiven > 0 && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Berilgan naqd:</span>
                  <span className="font-mono-num font-bold">{numericCashGiven.toLocaleString()} so'm</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
                  <span className="text-slate-800">Qaytim (Sdacha):</span>
                  <span className={cashChange >= 0 ? 'text-emerald-700 font-mono-num text-sm' : 'text-rose-600 font-mono-num'}>
                    {cashChange >= 0 ? `${cashChange.toLocaleString()} so'm` : 'Yetarli emas!'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons matching image_f5bf5453.png */}
        <div className="pt-6 space-y-2">
          <button
            type="button"
            onClick={handleCheckout}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs text-sm cursor-pointer transition-all tracking-wide"
          >
            <Receipt className="w-4 h-4" />
            CHEK CHIQARISH (Enter)
          </button>

          <button
            type="button"
            onClick={clearCart}
            className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 active:scale-98 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 text-xs cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            Savatni tozalash
          </button>
        </div>
      </div>

      {/* Product Catalog Picker Modal (F2) */}
      <ProductPickerModal
        isOpen={isPickerOpen}
        products={products}
        onSelect={(p) => {
          handleAddToCart(p, 1);
          setIsPickerOpen(false);
        }}
        onClose={() => {
          setIsPickerOpen(false);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      />

      {/* Thermal Receipt Print Modal */}
      {activeReceipt && (
        <ReceiptModal
          sale={activeReceipt}
          settings={settings}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
};
