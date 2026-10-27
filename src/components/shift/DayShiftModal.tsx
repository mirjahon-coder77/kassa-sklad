import React, { useState } from 'react';
import { Shift, StoreSettings, User } from '../../types/pos';
import { StorageService } from '../../services/storage';
import { Clock, Lock, Play, Printer, Check, X, AlertTriangle } from 'lucide-react';

interface DayShiftModalProps {
  isOpen: boolean;
  mode: 'open' | 'close' | 'z-report';
  currentShift: Shift | null;
  currentUser: User | null;
  settings: StoreSettings;
  onClose: () => void;
  onShiftUpdated: (shift: Shift | null) => void;
  onPrintZReport?: (shift: Shift) => void;
}

export const DayShiftModal: React.FC<DayShiftModalProps> = ({
  isOpen,
  mode,
  currentShift,
  currentUser,
  settings,
  onClose,
  onShiftUpdated,
  onPrintZReport,
}) => {
  const [startingCash, setStartingCash] = useState<number>(200000);
  const [countedCash, setCountedCash] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [justClosedShift, setJustClosedShift] = useState<Shift | null>(null);

  if (!isOpen) return null;

  // Real-time recalculation of current shift sales
  const currentShiftSales = StorageService.getCurrentShiftSales();
  const actualCashSales = currentShiftSales
    .filter((s) => s.paymentMethod === 'NAQD')
    .reduce((sum, s) => sum + s.itog, 0);
  const actualCardSales = currentShiftSales
    .filter((s) => s.paymentMethod === 'KARTA')
    .reduce((sum, s) => sum + s.itog, 0);
  const actualTotalSales = actualCashSales + actualCardSales;

  const expectedCash = (currentShift?.startingCash || 0) + actualCashSales;

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cashierName = currentUser?.name || 'Kassir';
    const newShift = StorageService.openShift(cashierName, startingCash);
    onShiftUpdated(newShift);
    onClose();
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShift) return;

    const closed = StorageService.closeShift(countedCash, notes);
    setJustClosedShift(closed);
    onShiftUpdated(null); // Now shift is closed!
    if (onPrintZReport) {
      onPrintZReport(closed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden my-auto transition-all">
        {/* Header */}
        <div
          className={`p-4 text-white flex items-center justify-between ${
            mode === 'open' ? 'bg-slate-900' : 'bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {mode === 'open' ? (
              <>
                <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <h3 className="text-sm font-bold">Kunni ochish (Yangi smena boshlash)</h3>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold">Kunni yopish (Z-Otchet hisoboti)</h3>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {mode === 'open' ? (
          <form onSubmit={handleOpenShiftSubmit} className="p-6 space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              <p className="font-semibold">
                Yangi kun ochilganda kassadagi barcha hisoblagichlar 0 dan boshlanadi va faqat shu
                kundagi savdolar hisoblanadi.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kassir (Mas'ul xodim):
              </label>
              <input
                type="text"
                disabled
                value={currentUser?.name || 'Kassir'}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium"
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
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg font-mono-num focus:ring-2 focus:ring-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Kun boshida qaytim (sdacha) berish uchun kassada mavjud naqd pul.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer font-medium"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Kunni ochish
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCloseShiftSubmit} className="p-6 space-y-4">
            {/* Shift financial summary box */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Ochilgan vaqt:</span>
                <span className="font-mono text-slate-900 font-medium">
                  {currentShift
                    ? new Date(currentShift.openedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Bugungi sotilgan cheklar:</span>
                <span className="font-mono-num font-bold text-slate-900">
                  {currentShiftSales.length} ta
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Naqd tushum:</span>
                <span className="font-mono-num font-bold text-emerald-700">
                  {actualCashSales.toLocaleString()} so'm
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Karta tushum:</span>
                <span className="font-mono-num font-bold text-indigo-700">
                  {actualCardSales.toLocaleString()} so'm
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 font-bold text-slate-900">
                <span>JAMI SAVDO (ITOG):</span>
                <span className="font-mono-num text-sm text-slate-900">
                  {actualTotalSales.toLocaleString()} so'm
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-100">
                <span>Kassada kutilgan naqd:</span>
                <span className="font-mono-num font-bold text-amber-700">
                  {expectedCash.toLocaleString()} so'm
                </span>
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
                placeholder={expectedCash.toString()}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg font-mono-num focus:ring-2 focus:ring-slate-900"
              />
              <div className="mt-1 flex justify-between text-[11px]">
                <span className="text-slate-500">Tafovut (Farq):</span>
                <span
                  className={`font-bold font-mono-num ${
                    countedCash - expectedCash === 0
                      ? 'text-emerald-700'
                      : countedCash - expectedCash < 0
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }`}
                >
                  {countedCash - expectedCash > 0 ? '+' : ''}
                  {(countedCash - expectedCash).toLocaleString()} so'm
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kun yakuni bo'yicha izoh (ixtiyoriy):
              </label>
              <input
                type="text"
                placeholder="Kassa topshirildi, farq sababi..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer font-medium"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                Kunni yopish (Z-Otchet)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
