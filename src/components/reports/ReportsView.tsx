import React, { useState } from 'react';
import { Sale, Product, StoreSettings } from '../../types/pos';
import { StorageService } from '../../services/storage';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Banknote,
  Printer,
  PieChart,
  Award,
  AlertTriangle,
} from 'lucide-react';

interface ReportsViewProps {
  settings: StoreSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ settings }) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const sales = StorageService.getSales();
  const products = StorageService.getProducts();

  // Filter sales by date
  const now = new Date();
  const filteredSales = sales.filter((s) => {
    if (s.status !== 'active') return false;
    const saleDate = new Date(s.timestamp);

    if (period === 'today') {
      return saleDate.toDateString() === now.toDateString();
    } else if (period === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return saleDate >= oneWeekAgo;
    } else if (period === 'month') {
      return (
        saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  // Financial aggregates
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.itog, 0);
  const totalDiscount = filteredSales.reduce((acc, s) => acc + s.totalDiscount, 0);
  const cashTotal = filteredSales
    .filter((s) => s.paymentMethod === 'NAQD')
    .reduce((acc, s) => acc + s.itog, 0);
  const cardTotal = filteredSales
    .filter((s) => s.paymentMethod === 'KARTA')
    .reduce((acc, s) => acc + s.itog, 0);

  // Profit calculation (Revenue - Cost of goods sold)
  let totalCostOfGoodsSold = 0;
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      const cost = p?.costPrice || 0;
      totalCostOfGoodsSold += cost * item.quantity;
    });
  });
  const grossProfit = totalRevenue - totalCostOfGoodsSold;
  const marginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  // Top products sold
  const productStatsMap: Record<
    string,
    { name: string; code: string; count: number; revenue: number }
  > = {};
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productStatsMap[item.productId]) {
        productStatsMap[item.productId] = {
          name: item.productName,
          code: item.productCode,
          count: 0,
          revenue: 0,
        };
      }
      productStatsMap[item.productId].count += item.quantity;
      productStatsMap[item.productId].revenue += item.total;
    });
  });

  const sortedTopProducts = Object.values(productStatsMap).sort((a, b) => b.count - a.count);

  // Low stock products alert
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  // Export full report to CSV
  const handleExportReportCSV = () => {
    const headers = ['Chek №', 'Sana-Vaqt', 'Kassir', 'To\'lov turi', 'Summa', 'Chegirma', 'Holat'];
    const rows = sales.map((s) => [
      s.receiptNumber,
      new Date(s.timestamp).toLocaleString('ru-RU'),
      `"${s.cashierName}"`,
      s.paymentMethod,
      s.itog,
      s.totalDiscount,
      s.status === 'active' ? 'Faol' : 'Bekor qilingan',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dunyo_Women_Shop_Savdo_Hisoboti_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Hisobotlar va Moliyaviy Analitika
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Savdo tushumi, tannarx bo'yicha sof marja va eng ko'p sotilgan tovarlar reytingi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                period === 'today' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Bugun
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                period === 'week' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              7 kun
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                period === 'month' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Shu oy
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                period === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Barcha davr
            </button>
          </div>

          <button
            onClick={handleExportReportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            Excel (CSV)
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Jami tushum (Savdo)</span>
          <div className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
            {totalRevenue.toLocaleString()}{' '}
            <span className="text-xs font-medium text-slate-500">{settings.currency}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {filteredSales.length} ta chek orqali amalga oshirildi
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Taxminiy sof foyda (Marja)</span>
          <div className="text-2xl font-bold font-mono-num text-emerald-700 mt-1">
            +{grossProfit.toLocaleString()}{' '}
            <span className="text-xs font-medium text-emerald-600">{settings.currency}</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">
            Savdodagi sof ulush: ~{marginPercent}%
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Naqd vs Karta ulushi</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold font-mono-num text-emerald-700">
              {cashTotal.toLocaleString()}
            </span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-lg font-bold font-mono-num text-indigo-700">
              {cardTotal.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
            <span className="text-emerald-700 font-semibold">
              Naqd: {totalRevenue > 0 ? Math.round((cashTotal / totalRevenue) * 100) : 0}%
            </span>
            <span>·</span>
            <span className="text-indigo-700 font-semibold">
              Karta: {totalRevenue > 0 ? Math.round((cardTotal / totalRevenue) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Berilgan chegirmalar</span>
          <div className="text-2xl font-bold font-mono-num text-rose-600 mt-1">
            -{totalDiscount.toLocaleString()}{' '}
            <span className="text-xs font-medium text-rose-500">{settings.currency}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Xaridorlar iqtisod qilgan summa</div>
        </div>
      </div>

      {/* Grid: Top Sold Products & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Eng ko'p sotilgan tovarlar (TOP reyting)
            </h3>
            <span className="text-xs text-slate-400">{sortedTopProducts.length} xil tovar</span>
          </div>

          <div className="space-y-3">
            {sortedTopProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Bu davrda hali savdo qilinmagan.
              </div>
            ) : (
              sortedTopProducts.slice(0, 7).map((prod, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-bold font-mono text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-900'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-900'
                          : idx === 2
                          ? 'bg-amber-700/20 text-amber-900'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">{prod.name}</span>
                      <span className="text-slate-400 font-mono text-[11px] ml-2">[{prod.code}]</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono-num">{prod.count} dona</span>
                    <div className="text-[11px] text-slate-500 font-mono-num">
                      {prod.revenue.toLocaleString()} so'm
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Skladda kam qolgan tovarlar ({lowStockProducts.length})
            </h3>
            <span className="text-[11px] text-rose-600 font-semibold">Qayta buyurtma bering!</span>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-emerald-600 text-xs font-medium">
                ✓ Barcha tovarlar yetarli miqdorda mavjud.
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {p.code} · Min: {p.minStock} dona
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono-num font-bold text-rose-700 text-sm">
                      {p.stock} dona qoldi
                    </span>
                    <div className="text-[10px] text-rose-600 font-medium">
                      Yetishmaydi: {Math.max(1, p.minStock * 2 - p.stock)} dona
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
