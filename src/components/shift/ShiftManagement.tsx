import React, { useState } from 'react';
import { Shift, StoreSettings, Sale, Product } from '../../types/pos';
import { StorageService } from '../../services/storage';
import {
  Clock,
  CheckCircle2,
  Lock,
  Printer,
  Calendar,
  Banknote,
  CreditCard,
  AlertTriangle,
  FileSpreadsheet,
  Award,
} from 'lucide-react';

interface ShiftManagementProps {
  currentShift: Shift | null;
  settings: StoreSettings;
  onDataChanged: () => void;
}

export const ShiftManagement: React.FC<ShiftManagementProps> = ({
  currentShift,
  settings,
  onDataChanged,
}) => {
  const [shifts, setShifts] = useState<Shift[]>(StorageService.getAllShifts());
  const [isOpeningShift, setIsOpeningShift] = useState(false);
  const [isClosingShift, setIsClosingShift] = useState(false);
  const [startingCash, setStartingCash] = useState<number>(200000);
  const [countedCash, setCountedCash] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState<string>('');

  // Selected shift for viewing Z-Report
  const [viewingShift, setViewingShift] = useState<Shift | null>(null);

  const currentUser = StorageService.getCurrentUser();
  const sales = StorageService.getSales();
  const products = StorageService.getProducts();

  const refreshShifts = () => {
    setShifts(StorageService.getAllShifts());
    onDataChanged();
  };

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    const cashierName = currentUser?.name || 'Kassir';
    StorageService.openShift(cashierName, startingCash);
    setIsOpeningShift(false);
    refreshShifts();
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShift) return;

    const closed = StorageService.closeShift(countedCash, closeNotes);
    setIsClosingShift(false);
    setViewingShift(closed);
    refreshShifts();
  };

  // Calculate current shift dynamic metrics strictly for the active shift
  const activeShift = currentShift && currentShift.status === 'open' ? currentShift : null;
  const currentShiftSales = activeShift
    ? sales.filter((s) => s.status === 'active' && s.shiftId === activeShift.id)
    : [];

  const currentShiftCashSales = currentShiftSales
    .filter((s) => s.paymentMethod === 'NAQD')
    .reduce((sum, s) => sum + s.itog, 0);

  const currentShiftCardSales = currentShiftSales
    .filter((s) => s.paymentMethod === 'KARTA')
    .reduce((sum, s) => sum + s.itog, 0);

  const currentShiftTotalSales = currentShiftCashSales + currentShiftCardSales;
  const currentShiftSalesCount = currentShiftSales.length;

  const expectedCashInDrawer = activeShift
    ? activeShift.startingCash + currentShiftCashSales
    : 0;

  // Calculate top sold products strictly in this current shift
  const topProductsMap: Record<string, { name: string; count: number }> = {};
  currentShiftSales.forEach((s) => {
    s.items.forEach((item) => {
      if (!topProductsMap[item.productName]) {
        topProductsMap[item.productName] = { name: item.productName, count: 0 };
      }
      topProductsMap[item.productName].count += item.quantity;
    });
  });

  const topProducts = Object.values(topProductsMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Smena (Kunni ochish va yopish / Kun yakuni)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kassir smenasi, kassa qoldig'i, kutilgan naqd va Z-Otchet hisoboti
          </p>
        </div>

        <div>
          {activeShift ? (
            <button
              onClick={() => {
                setCountedCash(expectedCashInDrawer);
                setIsClosingShift(true);
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Lock className="w-4 h-4" />
              Kunni yopish (Z-Otchet)
            </button>
          ) : (
            <button
              onClick={() => setIsOpeningShift(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Clock className="w-4 h-4" />
              Kunni ochish (Yangi smena)
            </button>
          )}
        </div>
      </div>

      {/* Current Active Shift Status Card */}
      {activeShift ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    Smena: OCHIQ ({new Date(activeShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Faol
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Kassir: <strong>{activeShift.cashierName}</strong> · Ochilgan sana: {new Date(activeShift.openedAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewingShift(activeShift)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Oraliq hisobot (X-Otchet)
            </button>
          </div>

          {/* Current Numbers Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">Jami savdo (ITOG):</span>
              <div className="text-xl font-bold font-mono-num text-slate-900 mt-1">
                {currentShiftTotalSales.toLocaleString()} {settings.currency}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {currentShiftSalesCount} ta chek berildi
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">Naqd tushum:</span>
              <div className="text-xl font-bold font-mono-num text-emerald-700 mt-1">
                {currentShiftCashSales.toLocaleString()} {settings.currency}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Boshlang'ich kassa: {activeShift.startingCash.toLocaleString()} so'm
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">Karta tushum:</span>
              <div className="text-xl font-bold font-mono-num text-indigo-700 mt-1">
                {currentShiftCardSales.toLocaleString()} {settings.currency}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Terminal / Karta</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">Kassadagi naqd (kutilgan):</span>
              <div className="text-xl font-bold font-mono-num text-amber-700 mt-1">
                {expectedCashInDrawer.toLocaleString()} {settings.currency}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Kassada bo'lishi kerak bo'lgan naqd pul
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Smena yopiq</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Kassada savdo qilish uchun avval kunni oching. Kun boshida kassadagi boshlang'ich naqd
            pulni kiritish tavsiya etiladi.
          </p>
          <button
            onClick={() => setIsOpeningShift(true)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Kunni ochish (Smena boshlash)
          </button>
        </div>
      )}

      {/* Shifts History Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Avvalgi yopilgan smenalar arxivi
        </h3>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Sana va vaqt</th>
                <th className="py-3 px-4">Kassir</th>
                <th className="py-3 px-4 text-center">Cheklar</th>
                <th className="py-3 px-4 text-right">Naqd tushum</th>
                <th className="py-3 px-4 text-right">Karta tushum</th>
                <th className="py-3 px-4 text-right">Jami savdo</th>
                <th className="py-3 px-4 text-center">Naqd sanalgan / Farq</th>
                <th className="py-3 px-4 text-right">Z-Otchet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Avvalgi yopilgan smenalar topilmadi.
                  </td>
                </tr>
              ) : (
                shifts.map((s, idx) => (
                  <tr key={`${s.id}-${idx}`} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div>{new Date(s.openedAt).toLocaleDateString('ru-RU')}</div>
                      <div className="text-slate-400">
                        {new Date(s.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {s.closedAt ? new Date(s.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hozir'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.cashierName}</td>
                    <td className="py-3 px-4 text-center font-mono-num font-medium">
                      {s.salesCount} ta
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num text-emerald-700 font-semibold">
                      {s.cashSales.toLocaleString()} so'm
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num text-indigo-700 font-semibold">
                      {s.cardSales.toLocaleString()} so'm
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num font-bold text-slate-900">
                      {s.totalSales.toLocaleString()} so'm
                    </td>
                    <td className="py-3 px-4 text-center font-mono-num text-[11px]">
                      {s.countedCash !== undefined ? (
                        <div>
                          <div>{s.countedCash.toLocaleString()} so'm</div>
                          <span
                            className={`text-[10px] font-bold ${
                              s.cashDifference === 0
                                ? 'text-emerald-700'
                                : (s.cashDifference || 0) < 0
                                ? 'text-rose-600'
                                : 'text-amber-600'
                            }`}
                          >
                            Farq: {(s.cashDifference || 0) > 0 ? '+' : ''}
                            {(s.cashDifference || 0).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewingShift(s)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Z-Chek
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Open Shift */}
      {isOpeningShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Kunni ochish (Yangi smena)
              </h3>
              <button onClick={() => setIsOpeningShift(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleOpenShift} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kassir ismi:
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.name || 'Kassir'}
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kassadagi boshlang'ich naqd pul (so'm):
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={startingCash}
                  onChange={(e) => setStartingCash(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg font-mono-num"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Kun boshida kassadagi qaytim uchun qo'yilgan naqd pul miqdori.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpeningShift(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                >
                  Smenani ochish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Close Shift (Z-Report confirmation) */}
      {isClosingShift && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                Kunni yopish (Z-Otchet)
              </h3>
              <button onClick={() => setIsClosingShift(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleCloseShift} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Jami savdo summasi:</span>
                  <strong className="font-mono-num">{activeShift.totalSales.toLocaleString()} so'm</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Naqd tushum:</span>
                  <strong className="text-emerald-700 font-mono-num">
                    {activeShift.cashSales.toLocaleString()} so'm
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Karta tushum:</span>
                  <strong className="text-indigo-700 font-mono-num">
                    {activeShift.cardSales.toLocaleString()} so'm
                  </strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Kassadagi kutilgan naqd:</span>
                  <strong className="font-bold text-slate-900 font-mono-num">
                    {expectedCashInDrawer.toLocaleString()} so'm
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kassir sanagan haqiqiy naqd pul (so'm):
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={countedCash}
                  onChange={(e) => setCountedCash(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg font-mono-num"
                />
                <div className="mt-1 flex justify-between text-[11px]">
                  <span>Farq:</span>
                  <span
                    className={`font-bold font-mono-num ${
                      countedCash - expectedCashInDrawer === 0
                        ? 'text-emerald-700'
                        : countedCash - expectedCashInDrawer < 0
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {countedCash - expectedCashInDrawer > 0 ? '+' : ''}
                    {(countedCash - expectedCashInDrawer).toLocaleString()} so'm
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Izoh (ixtiyoriy):
                </label>
                <textarea
                  rows={2}
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="Kassa topshirildi, farq sabablari..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClosingShift(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                >
                  Smenani yopish va Z-Otchet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Authentic Thermal Z-Report View & Print (Page 3 format) */}
      {viewingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden my-auto">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold">
                  {viewingShift.status === 'open' ? 'X-Otchet (Oraliq)' : 'Z-Otchet (Kun yakuni hisoboti)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    document.body.classList.add('printing-receipt');
                    window.print();
                    setTimeout(() => {
                      document.body.classList.remove('printing-receipt');
                    }, 1000);
                  }}
                  className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Chop etish
                </button>
                <button onClick={() => setViewingShift(null)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>

            {/* Thermal Print Area */}
            <div className="p-6 bg-slate-100 flex justify-center items-start overflow-y-auto max-h-[75vh]">
              <div className="printable-receipt w-full max-w-[360px] bg-white p-6 shadow-md border border-slate-200 font-mono text-[12px] text-black leading-relaxed select-none print:shadow-none print:border-none print:p-0">
                <div className="text-center space-y-1 mb-2">
                  <div className="font-bold text-sm">{settings.storeName}</div>
                  <div className="font-bold text-xs uppercase tracking-wider">
                    KUN YAKUNI HISOBOTI (Z-OTCHET)
                  </div>
                </div>

                <div className="text-center tracking-widest text-[11px] my-1">
                  ****************************************
                </div>

                <div className="text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Sana:</span>
                    <span>{new Date(viewingShift.openedAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Smena:</span>
                    <span>
                      {new Date(viewingShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                      -{' '}
                      {viewingShift.closedAt
                        ? new Date(viewingShift.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'OCHIQ'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kassir:</span>
                    <span>{viewingShift.cashierName}</span>
                  </div>
                </div>

                <div className="text-center tracking-widest text-[11px] my-1">
                  ----------------------------------------
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Cheklar soni:</span>
                    <span className="font-bold font-mono-num">{viewingShift.salesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bekor qilingan:</span>
                    <span className="font-mono-num">
                      {viewingShift.cancelledCount} ta (-{viewingShift.cancelledSum.toLocaleString()})
                    </span>
                  </div>
                </div>

                <div className="text-center tracking-widest text-[11px] my-1">
                  ----------------------------------------
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Naqd tushum:</span>
                    <span className="font-mono-num font-bold">
                      {viewingShift.cashSales.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Karta tushum:</span>
                    <span className="font-mono-num font-bold">
                      {viewingShift.cardSales.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-center tracking-widest text-[11px] my-1">
                  ========================================
                </div>

                <div className="flex justify-between items-baseline py-1 text-sm font-bold">
                  <span>JAMI SAVDO:</span>
                  <span className="text-base font-mono-num">
                    {viewingShift.totalSales.toLocaleString()} {settings.currency}
                  </span>
                </div>

                <div className="text-center tracking-widest text-[11px] my-1">
                  ========================================
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Jami chegirma:</span>
                    <span className="font-mono-num">
                      -{viewingShift.totalDiscount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sotilgan tovar:</span>
                    <span className="font-mono-num">{viewingShift.itemsCount} dona</span>
                  </div>
                </div>

                <div className="text-center tracking-widest text-[11px] my-1">
                  ----------------------------------------
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Kassadagi naqd (kutilgan):</span>
                    <span className="font-mono-num">
                      {(viewingShift.startingCash + viewingShift.cashSales).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kassadagi naqd (sanalgan):</span>
                    <span className="font-mono-num">
                      {(viewingShift.countedCash ?? (viewingShift.startingCash + viewingShift.cashSales)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Farq:</span>
                    <span className="font-mono-num">
                      {viewingShift.cashDifference ?? 0}
                    </span>
                  </div>
                </div>

                <div className="text-center tracking-widest text-[11px] my-1">
                  ----------------------------------------
                </div>

                {topProducts.length > 0 && (
                  <div className="space-y-1 text-[11px] my-2">
                    <div className="font-bold">TOP-3 tovar:</div>
                    {topProducts.map((p, i) => (
                      <div key={i} className="flex justify-between text-[11px]">
                        <span>
                          {i + 1}. {p.name}
                        </span>
                        <span className="font-mono-num">{p.count} dona</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-center tracking-widest text-[11px] my-1">
                  ----------------------------------------
                </div>

                <div className="text-[10px] text-neutral-600 space-y-0.5 text-center mt-2">
                  <div>Kam qolgan tovarlar: {lowStockCount} ta (ro'yxat ilovada)</div>
                  <div>
                    Chop etildi:{' '}
                    {new Date().toLocaleDateString('ru-RU')}{' '}
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 text-right no-print">
              <button
                onClick={() => setViewingShift(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
