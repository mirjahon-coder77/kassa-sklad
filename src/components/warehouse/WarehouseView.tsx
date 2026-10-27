import React, { useState } from 'react';
import { Product, StockMove, StoreSettings } from '../../types/pos';
import { StorageService } from '../../services/storage';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
  Trash,
  AlertTriangle,
  PlusCircle,
  History,
  Search,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface WarehouseViewProps {
  settings: StoreSettings;
  onDataChanged: () => void;
}

export const WarehouseView: React.FC<WarehouseViewProps> = ({ settings, onDataChanged }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'moves' | 'inventory'>('stock');
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [stockMoves, setStockMoves] = useState<StockMove[]>(StorageService.getStockMoves());
  const [search, setSearch] = useState('');

  // Modals state
  const [isKirimOpen, setIsKirimOpen] = useState(false);
  const [isSpisanieOpen, setIsSpisanieOpen] = useState(false);
  const [isInventModalOpen, setIsInventModalOpen] = useState(false);

  // Kirim Form
  const [kirimProductId, setKirimProductId] = useState<string>(
    products.length > 0 ? products[0].id : ''
  );
  const [kirimQty, setKirimQty] = useState<number>(10);
  const [kirimSupplier, setKirimSupplier] = useState<string>('Toshkent Tekstil / Oltin Ipak MCHJ');
  const [kirimCostPrice, setKirimCostPrice] = useState<number>(0);
  const [kirimNotes, setKirimNotes] = useState<string>('');

  // Spisanie Form
  const [spisanieProductId, setSpisanieProductId] = useState<string>(
    products.length > 0 ? products[0].id : ''
  );
  const [spisanieQty, setSpisanieQty] = useState<number>(1);
  const [spisanieReason, setSpisanieReason] = useState<string>('Brak (yaroqsiz tovar)');

  // Inventarizatsiya Form
  const [inventProductId, setInventProductId] = useState<string>(
    products.length > 0 ? products[0].id : ''
  );
  const [inventActualCount, setInventActualCount] = useState<number>(0);
  const [inventNotes, setInventNotes] = useState<string>('Davriy sanov hisobi');

  const refreshData = () => {
    setProducts(StorageService.getProducts());
    setStockMoves(StorageService.getStockMoves());
    onDataChanged();
  };

  // Warehouse Statistics
  const totalItemsCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalCostValue = products.reduce((acc, p) => acc + p.stock * (p.costPrice || 0), 0);
  const totalSaleValue = products.reduce(
    (acc, p) => acc + p.stock * (p.hasDiscount && p.discountPrice ? p.discountPrice : p.salePrice),
    0
  );
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  // Handle Kirim Submit
  const handleKirimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kirimProductId || kirimQty <= 0) return;

    StorageService.addStockIn(
      kirimProductId,
      kirimQty,
      kirimSupplier,
      kirimCostPrice > 0 ? kirimCostPrice : undefined,
      kirimNotes
    );
    setIsKirimOpen(false);
    refreshData();
  };

  // Handle Spisanie Submit
  const handleSpisanieSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spisanieProductId || spisanieQty <= 0) return;

    StorageService.writeOffStock(spisanieProductId, spisanieQty, spisanieReason);
    setIsSpisanieOpen(false);
    refreshData();
  };

  // Handle Inventarizatsiya Submit
  const handleInventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventProductId) return;

    StorageService.adjustStock(inventProductId, inventActualCount, inventNotes);
    setIsInventModalOpen(false);
    refreshData();
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sklad hisobi (Kirim va Qoldiqlar)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tovar kirimi, qoldiq qiymati, inventarizatsiya va hisobdan chiqarish nazorati
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (products.length > 0) {
                setKirimProductId(products[0].id);
                setKirimCostPrice(products[0].costPrice);
              }
              setIsKirimOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowDownLeft className="w-4 h-4" />
            + Tovar kirim qilish
          </button>

          <button
            onClick={() => {
              if (products.length > 0) setSpisanieProductId(products[0].id);
              setIsSpisanieOpen(true);
            }}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash className="w-3.5 h-3.5" />
            Hisobdan chiqarish (Spisanie)
          </button>
        </div>
      </div>

      {/* KPI Value Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Skladdagi tovarlar soni</div>
          <div className="text-xl font-bold font-mono-num text-slate-900 mt-1">
            {totalItemsCount} <span className="text-xs font-medium text-slate-500">dona</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{products.length} ta xil tovar (SKU)</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Qoldiq tannarx qiymati</div>
          <div className="text-xl font-bold font-mono-num text-slate-900 mt-1">
            {totalCostValue.toLocaleString()}{' '}
            <span className="text-xs font-medium text-slate-500">{settings.currency}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Kelish narxi bo'yicha</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Kutilayotgan sotuv summasi</div>
          <div className="text-xl font-bold font-mono-num text-emerald-700 mt-1">
            {totalSaleValue.toLocaleString()}{' '}
            <span className="text-xs font-medium text-emerald-600">{settings.currency}</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-mono-num">
            Foyda salohiyati: +{(totalSaleValue - totalCostValue).toLocaleString()} so'm
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Kam qolgan tovarlar</div>
          <div
            className={`text-xl font-bold font-mono-num mt-1 ${
              lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {lowStockCount} <span className="text-xs font-medium text-slate-500">ta tovar</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Qoldiq ≤ minimal me'yor</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'stock'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Hozirgi tovar qoldiqlari ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('moves')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'moves'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          Sklad harakatlari jurnali ({stockMoves.length})
        </button>
      </div>

      {/* TAB 1: STOCK INVENTORY */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Qoldiqlar ichidan qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white"
              />
            </div>

            <button
              onClick={() => {
                if (products.length > 0) {
                  setInventProductId(products[0].id);
                  setInventActualCount(products[0].stock);
                }
                setIsInventModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              Inventarizatsiya (Sanab to'g'rilash)
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kod</th>
                  <th className="py-3 px-4">Tovar nomi</th>
                  <th className="py-3 px-3">Kategoriya</th>
                  <th className="py-3 px-4 text-center">Hozirgi qoldiq</th>
                  <th className="py-3 px-4 text-right">Kelish tannarxi</th>
                  <th className="py-3 px-4 text-right">Jami tannarx</th>
                  <th className="py-3 px-4 text-right">Sotuv narxi</th>
                  <th className="py-3 px-4 text-center">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((p) => {
                  const isOut = p.stock <= 0;
                  const isLow = p.stock <= p.minStock;
                  const rowCostTotal = p.stock * (p.costPrice || 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {p.name}
                        {p.customFields?.size && (
                          <span className="ml-2 text-[11px] text-slate-500 font-normal">
                            ({p.customFields.size})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4 text-center font-mono-num font-bold text-slate-900 text-sm">
                        {p.stock} dona
                      </td>
                      <td className="py-3 px-4 text-right font-mono-num text-slate-500">
                        {p.costPrice > 0 ? `${p.costPrice.toLocaleString()} so'm` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-num font-semibold text-slate-800">
                        {rowCostTotal.toLocaleString()} so'm
                      </td>
                      <td className="py-3 px-4 text-right font-mono-num font-bold text-slate-900">
                        {p.hasDiscount ? (
                          <span className="text-emerald-700">
                            {p.discountPrice.toLocaleString()} so'm
                          </span>
                        ) : (
                          `${p.salePrice.toLocaleString()} so'm`
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="bg-rose-100 text-rose-800 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md">
                            Tugagan
                          </span>
                        ) : isLow ? (
                          <span className="bg-amber-100 text-amber-800 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Kam qolgan
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md">
                            Yetarli
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK MOVES AUDIT LOG */}
      {activeTab === 'moves' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Sana va vaqt</th>
                <th className="py-3 px-4">Harakat turi</th>
                <th className="py-3 px-4">Tovar va kod</th>
                <th className="py-3 px-3 text-center">Miqdor</th>
                <th className="py-3 px-3 text-center">Oldingi → Yangi qoldiq</th>
                <th className="py-3 px-4">Izoh / Manba</th>
                <th className="py-3 px-3">Mas'ul</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stockMoves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Hali sklad harakatlari qayd etilmagan.
                  </td>
                </tr>
              ) : (
                stockMoves.map((m) => {
                  const isPositive = m.quantity > 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(m.date).toLocaleString('ru-RU')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            m.type === 'kirim'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.type === 'savdo'
                              ? 'bg-blue-100 text-blue-800'
                              : m.type === 'bekor'
                              ? 'bg-purple-100 text-purple-800'
                              : m.type === 'spisanie'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {m.productName}{' '}
                        <span className="font-mono text-slate-500 font-normal">[{m.productCode}]</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono-num font-bold">
                        <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                          {isPositive ? `+${m.quantity}` : m.quantity} dona
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono-num text-slate-500 text-[11px]">
                        {m.previousStock} → <strong className="text-slate-900">{m.newStock}</strong>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {m.reason || (m.supplier ? `Ta'minotchi: ${m.supplier}` : '—')}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">{m.operator}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal 1: Kirim (Add Stock) */}
      {isKirimOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                Tovar kirimi (Skladga qabul qilish)
              </h3>
              <button onClick={() => setIsKirimOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleKirimSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kirim qilinadigan tovar:
                </label>
                <select
                  value={kirimProductId}
                  onChange={(e) => {
                    setKirimProductId(e.target.value);
                    const sel = products.find((p) => p.id === e.target.value);
                    if (sel) setKirimCostPrice(sel.costPrice || 0);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} · {p.name} (Hozirgi qoldiq: {p.stock} dona)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelgan soni (dona)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={kirimQty}
                    onChange={(e) => setKirimQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Yangi kelish tannarxi (so'm)
                  </label>
                  <input
                    type="number"
                    value={kirimCostPrice}
                    onChange={(e) => setKirimCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono-num"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yetkazib beruvchi (Ta'minotchi nomi)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Toshkent Tekstil, Gulbahor MCHJ"
                  value={kirimSupplier}
                  onChange={(e) => setKirimSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qo'shimcha izoh / Nakladnoy raqami
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Nakladnoy №4829, partiya 2"
                  value={kirimNotes}
                  onChange={(e) => setKirimNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKirimOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                >
                  Kirimni tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Spisanie (Hisobdan chiqarish) */}
      {isSpisanieOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-rose-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Trash className="w-4 h-4" />
                Tovarni hisobdan chiqarish (Spisanie)
              </h3>
              <button onClick={() => setIsSpisanieOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleSpisanieSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chiqariladigan tovar:
                </label>
                <select
                  value={spisanieProductId}
                  onChange={(e) => setSpisanieProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} · {p.name} (Qoldiq: {p.stock} dona)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hisobdan chiqarish soni (dona)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={spisanieQty}
                  onChange={(e) => setSpisanieQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg font-mono-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chiqarish sababi (majburiy)
                </label>
                <select
                  value={spisanieReason}
                  onChange={(e) => setSpisanieReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Brak (yaroqsiz tovar / nuqson)">Brak (yaroqsiz tovar / nuqson)</option>
                  <option value="Muddati o'tgan (parfumeriya/kosmetika)">
                    Muddati o'tgan (parfumeriya/kosmetika)
                  </option>
                  <option value="Shikastlangan / Yirtilgan">Shikastlangan / Yirtilgan</option>
                  <option value="Do'kon ehtiyoji / Ko'rgazma">Do'kon ehtiyoji / Ko'rgazma</option>
                  <option value="Boshqa sabab">Boshqa sabab</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSpisanieOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Hisobdan chiqarish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Inventarizatsiya (Sanab to'g'rilash) */}
      {isInventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-indigo-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-300" />
                Inventarizatsiya (Haqiqiy qoldiqni to'g'rilash)
              </h3>
              <button
                onClick={() => setIsInventModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInventSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tovar tanlang:
                </label>
                <select
                  value={inventProductId}
                  onChange={(e) => {
                    setInventProductId(e.target.value);
                    const p = products.find((pr) => pr.id === e.target.value);
                    if (p) setInventActualCount(p.stock);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} · {p.name} (Tizimda: {p.stock} dona)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amalda sanalgan faktik miqdor (dona):
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={inventActualCount}
                  onChange={(e) => setInventActualCount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg font-mono-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Izoh / Asos:
                </label>
                <input
                  type="text"
                  value={inventNotes}
                  onChange={(e) => setInventNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInventModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Qoldiqni yangilash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
