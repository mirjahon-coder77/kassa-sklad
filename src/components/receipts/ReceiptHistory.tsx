import React, { useState } from 'react';
import { Sale, StoreSettings } from '../../types/pos';
import { StorageService } from '../../services/storage';
import { ReceiptModal } from '../pos/ReceiptModal';
import {
  Receipt,
  Search,
  Filter,
  AlertTriangle,
  Printer,
  Calendar,
  XCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface ReceiptHistoryProps {
  settings: StoreSettings;
  onDataChanged: () => void;
}

export const ReceiptHistory: React.FC<ReceiptHistoryProps> = ({ settings, onDataChanged }) => {
  const [sales, setSales] = useState<Sale[]>(StorageService.getSales());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'cancelled'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'NAQD' | 'KARTA'>('all');

  // Active viewing receipt for modal
  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);

  // Cancel receipt modal
  const [cancellingSale, setCancellingSale] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Kassir adashib xato tovar kiritdi');
  const [customReason, setCustomReason] = useState<string>('');

  const refreshList = () => {
    setSales(StorageService.getSales());
    onDataChanged();
  };

  const handleOpenCancel = (sale: Sale) => {
    setCancellingSale(sale);
    setCancelReason('Kassir adashib xato tovar kiritdi');
    setCustomReason('');
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingSale) return;

    const finalReason =
      cancelReason === 'Boshqa sabab' ? customReason.trim() || 'Izohsiz' : cancelReason;

    StorageService.cancelSale(cancellingSale.id, finalReason);
    setCancellingSale(null);
    setSelectedReceipt(null);
    refreshList();
  };

  const filteredSales = sales.filter((s) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.receiptNumber.includes(q) ||
      s.cashierName.toLowerCase().includes(q) ||
      s.items.some((i) => i.productName.toLowerCase().includes(q) || i.productCode.toLowerCase().includes(q));

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && s.status === 'active') ||
      (filterStatus === 'cancelled' && s.status === 'cancelled');

    const matchesPayment = filterPayment === 'all' || s.paymentMethod === filterPayment;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalActiveSalesSum = sales
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.itog, 0);

  const totalCancelledSum = sales
    .filter((s) => s.status === 'cancelled')
    .reduce((sum, s) => sum + s.itog, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Cheklar tarixi va bekor qilish
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Barcha berilgan cheklar arxivi, nusxa olish, qayta chop etish va xatolarni bekor qilish
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-num">
          <div className="bg-white p-2.5 px-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 mr-2">Faol savdolar:</span>
            <strong className="text-slate-900 font-bold">{totalActiveSalesSum.toLocaleString()} so'm</strong>
          </div>
          <div className="bg-rose-50 p-2.5 px-4 rounded-xl border border-rose-200 text-rose-800">
            <span className="mr-2">Bekor qilingan:</span>
            <strong className="font-bold">-{totalCancelledSum.toLocaleString()} so'm</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Chek raqami (#000124), kassir yoki tovar nomi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'active'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faol cheklar
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'cancelled'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bekor qilinganlar
            </button>
          </div>

          {/* Payment filter */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value as any)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">Barcha to'lovlar</option>
            <option value="NAQD">Faqat Naqd</option>
            <option value="KARTA">Faqat Karta</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Chek №</th>
              <th className="py-3 px-4">Sana va vaqt</th>
              <th className="py-3 px-4">Kassir</th>
              <th className="py-3 px-4">Tovarlar ro'yxati</th>
              <th className="py-3 px-3 text-center">To'lov</th>
              <th className="py-3 px-4 text-right">Summa (ITOG)</th>
              <th className="py-3 px-4 text-center">Holat</th>
              <th className="py-3 px-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  Mos cheklar topilmadi.
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => {
                const isCancelled = sale.status === 'cancelled';
                const itemsCount = sale.items.reduce((acc, i) => acc + i.quantity, 0);

                return (
                  <tr
                    key={sale.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isCancelled ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{sale.receiptNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(sale.timestamp).toLocaleString('ru-RU')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{sale.cashierName}</td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-slate-900 font-medium">
                        {sale.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {itemsCount} dona tovar
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sale.paymentMethod === 'NAQD'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num font-bold text-slate-900 text-sm">
                      <span className={isCancelled ? 'line-through text-slate-400' : ''}>
                        {sale.itog.toLocaleString()} {settings.currency}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isCancelled ? (
                        <div className="inline-block">
                          <span className="bg-rose-100 text-rose-800 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md flex items-center gap-1 justify-center">
                            <XCircle className="w-3 h-3" /> Bekor qilingan
                          </span>
                          {sale.cancellationReason && (
                            <div className="text-[10px] text-rose-600 mt-0.5 max-w-[130px] truncate" title={sale.cancellationReason}>
                              {sale.cancellationReason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md flex items-center gap-1 justify-center">
                          <CheckCircle2 className="w-3 h-3" /> Faol
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(sale)}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Chekni ko'rish
                        </button>
                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => handleOpenCancel(sale)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Chekni bekor qilish"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Receipt Preview & Print Modal */}
      <ReceiptModal
        sale={selectedReceipt}
        settings={settings}
        onClose={() => setSelectedReceipt(null)}
        onCancelReceipt={(s) => handleOpenCancel(s)}
      />

      {/* Cancel Confirmation Modal with Reason */}
      {cancellingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-rose-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-300" />
                Chek #{cancellingSale.receiptNumber} ni bekor qilish
              </h3>
              <button onClick={() => setCancellingSale(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="p-6 space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                <p className="font-bold">Diqqat! Ushbu amal bajarilgach:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>Chekdagi barcha tovarlar sklad qoldig'iga avtomatik qaytariladi</li>
                  <li>Savdo summasi ({cancellingSale.itog.toLocaleString()} so'm) kassa tushumidan ayirib tashlanadi</li>
                  <li>Chekda «BEKOR QILINGAN» muhri paydo bo'ladi</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bekor qilish sababi (Tanlang):
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Kassir adashib xato tovar kiritdi">Kassir adashib xato tovar kiritdi</option>
                  <option value="Xaridor to'lov qilishdan bosh tortdi">Xaridor to'lov qilishdan bosh tortdi</option>
                  <option value="Karta / Terminal to'lovi o'tmadi">Karta / Terminal to'lovi o'tmadi</option>
                  <option value="Narx yoki o'lcham to'g'ri kelmadi">Narx yoki o'lcham to'g'ri kelmadi</option>
                  <option value="Test chek chiqarilgan edi">Test chek chiqarilgan edi</option>
                  <option value="Boshqa sabab">Boshqa sabab (qo'lda yozish)</option>
                </select>
              </div>

              {cancelReason === 'Boshqa sabab' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sababni batafsil yozing:
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Bekor qilish sababini kiriting..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancellingSale(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Orqaga
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                >
                  Chekni bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
