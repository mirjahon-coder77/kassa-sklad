import React, { useState } from 'react';
import { Product, ProductCategory, CustomFieldDefinition, StoreSettings } from '../../types/pos';
import { StorageService } from '../../services/storage';
import { BarcodeRenderer } from '../common/BarcodeRenderer';
import { QrCodeRenderer } from '../common/QrCodeRenderer';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  Printer,
  AlertTriangle,
  Tag,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface ProductCatalogProps {
  settings: StoreSettings;
  onOpenLabelPrinter: (product: Product) => void;
  onDataChanged: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  settings,
  onOpenLabelPrinter,
  onDataChanged,
}) => {
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(
    StorageService.getCustomFields()
  );
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [filterDiscountOnly, setFilterDiscountOnly] = useState(false);

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    code: string;
    barcode: string;
    name: string;
    category: ProductCategory;
    costPrice: number;
    salePrice: number;
    hasDiscount: boolean;
    discountPrice: number;
    stock: number;
    minStock: number;
    customFields: Record<string, string>;
  }>({
    code: '',
    barcode: '',
    name: '',
    category: 'Kiyim',
    costPrice: 0,
    salePrice: 0,
    hasDiscount: false,
    discountPrice: 0,
    stock: 10,
    minStock: 3,
    customFields: {},
  });

  const categories: ProductCategory[] = [
    'Kiyim',
    'Parfumeriya',
    'Bijuteriya',
    'Aksessuar',
    'Poyabzal',
    'Boshqa',
  ];

  const refreshList = () => {
    setProducts(StorageService.getProducts());
    setCustomFields(StorageService.getCustomFields());
    onDataChanged();
  };

  const handleOpenAdd = () => {
    const nextCode = StorageService.getNextProductCode('Kiyim');
    const randomBarcode = `20000000${Math.floor(1000 + Math.random() * 9000)}`;

    setFormData({
      code: nextCode,
      barcode: randomBarcode,
      name: '',
      category: 'Kiyim',
      costPrice: 0,
      salePrice: 0,
      hasDiscount: false,
      discountPrice: 0,
      stock: 10,
      minStock: 3,
      customFields: {},
    });
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      code: p.code,
      barcode: p.barcode,
      name: p.name,
      category: p.category,
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      hasDiscount: p.hasDiscount,
      discountPrice: p.discountPrice,
      stock: p.stock,
      minStock: p.minStock,
      customFields: p.customFields || {},
    });
    setIsFormOpen(true);
  };

  const handleCategoryChangeInForm = (newCat: ProductCategory) => {
    if (!editingProduct) {
      const nextCode = StorageService.getNextProductCode(newCat);
      setFormData((prev) => ({
        ...prev,
        category: newCat,
        code: nextCode,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        category: newCat,
      }));
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    StorageService.saveProduct({
      id: editingProduct?.id,
      code: formData.code.trim().toUpperCase(),
      barcode: formData.barcode.trim(),
      name: formData.name.trim(),
      category: formData.category,
      costPrice: Number(formData.costPrice) || 0,
      salePrice: Number(formData.salePrice) || 0,
      hasDiscount: formData.hasDiscount,
      discountPrice: formData.hasDiscount ? Number(formData.discountPrice) || 0 : Number(formData.salePrice),
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 3,
      customFields: formData.customFields,
    });

    setIsFormOpen(false);
    refreshList();
  };

  const handleDeleteProduct = (p: Product) => {
    if (confirm(`Haqiqatan ham "${p.name}" tovarini o'chirmoqchimisiz?`)) {
      StorageService.deleteProduct(p.id);
      refreshList();
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Kod',
      'Shtrix-kod',
      'Nomi',
      'Kategoriya',
      'Kelish narxi',
      'Sotuv narxi',
      'Chegirma',
      'Chegirma narxi',
      'Qoldiq',
      'Min qoldiq',
    ];
    const rows = products.map((p) => [
      p.code,
      p.barcode,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.costPrice,
      p.salePrice,
      p.hasDiscount ? 'HA' : "YO'Q",
      p.discountPrice,
      p.stock,
      p.minStock,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dunyo_Women_Shop_Katalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'Barchasi' || p.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      (p.customFields?.brand && p.customFields.brand.toLowerCase().includes(q));

    const matchesLowStock = !filterLowStockOnly || p.stock <= p.minStock;
    const matchesDiscount = !filterDiscountOnly || p.hasDiscount;

    return matchesCat && matchesSearch && matchesLowStock && matchesDiscount;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Tovarlar katalogi (Sklad bazasi)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Jami {products.length} ta tovar ro'yxatda · Excel kabi to'liq tahrirlash va hisob
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Excel (CSV) eksport
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Yangi tovar qo'shish
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Nomi, kodi (K-0012) yoki shtrix-kod bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          {/* Quick toggle chips */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`px-3 py-2 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                filterLowStockOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Kam qolganlar (Qoldiq ≤ Min)
            </button>
            <button
              type="button"
              onClick={() => setFilterDiscountOnly(!filterDiscountOnly)}
              className={`px-3 py-2 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                filterDiscountOnly
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              Chegirmadagilar
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Kategoriya:
          </span>
          {['Barchasi', ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table (Excel-like view) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-28">Kod / Shtrix</th>
                <th className="py-3 px-4">Tovar nomi</th>
                <th className="py-3 px-3">Kategoriya</th>
                <th className="py-3 px-3">Qo'shimcha</th>
                <th className="py-3 px-3 text-right">Kelish (tan)</th>
                <th className="py-3 px-4 text-right">Sotuv narxi</th>
                <th className="py-3 px-3 text-center">Chegirma</th>
                <th className="py-3 px-4 text-center">Qoldiq</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                    Hech qanday tovar topilmadi.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  const isOut = p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded inline-block border border-slate-200">
                          {p.code}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.barcode}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {p.name}
                        {p.customFields?.brand && (
                          <div className="text-[10px] font-normal text-slate-500">
                            Brend: {p.customFields.brand}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{p.category}</td>
                      <td className="py-3 px-3 text-[11px] text-slate-500">
                        <div className="space-y-0.5">
                          {p.customFields?.size && <div>O'lcham: {p.customFields.size}</div>}
                          {p.customFields?.color && <div>Rang: {p.customFields.color}</div>}
                          {p.customFields?.volume && <div>Hajm: {p.customFields.volume}</div>}
                          {p.customFields?.expiryDate && (
                            <div>Muddat: {p.customFields.expiryDate}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num text-slate-500">
                        {p.costPrice > 0 ? `${p.costPrice.toLocaleString()} so'm` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-num font-bold text-slate-900">
                        {p.hasDiscount ? (
                          <div>
                            <span className="line-through text-slate-400 font-normal text-[11px] mr-1">
                              {p.salePrice.toLocaleString()}
                            </span>
                            <span className="text-emerald-700 font-bold">
                              {p.discountPrice.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          `${p.salePrice.toLocaleString()} so'm`
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {p.hasDiscount ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            -{Math.round(((p.salePrice - p.discountPrice) / p.salePrice) * 100)}%
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono-num">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]">
                            0 dona (tugagan)
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px]">
                            {p.stock} dona (kam)
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-800">{p.stock} dona</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenLabelPrinter(p)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Etiketka chop etish"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-auto">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingProduct ? "Tovarni tahrirlash" : "Yangi tovar qo'shish"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChangeInForm(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Avtomatik Tovar Kodi
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tovar nomi (masalan: Ko'ylak, Atir 'Rose', Ipak sharf)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tovar nomini to'liq kiriting"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shtrix-kod (Code 128 / EAN)
                </label>
                <input
                  type="text"
                  required
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelish narxi (tannarx, ixtiyoriy)
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono-num"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Asl sotuv narxi (so'm)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.salePrice || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Masalan: 189000"
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg font-mono-num"
                  />
                </div>
              </div>

              {/* Discount Section */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasDiscount}
                    onChange={(e) => setFormData({ ...formData, hasDiscount: e.target.checked })}
                    className="w-4 h-4 rounded text-slate-900"
                  />
                  <span className="text-xs font-bold text-amber-950">
                    Chegirma bor (Skidka narx belgilash)
                  </span>
                </label>

                {formData.hasDiscount && (
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 mb-1">
                      Chegirmali yangi narx (so'm)
                    </label>
                    <input
                      type="number"
                      required={formData.hasDiscount}
                      value={formData.discountPrice || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Masalan: 159000"
                      className="w-full px-3 py-2 text-xs font-bold bg-white border border-amber-300 rounded-lg font-mono-num"
                    />
                    <p className="text-[11px] text-amber-800 mt-1">
                      Chekda va etiketkada asl narx chizib ko'rsatiladi ({formData.salePrice.toLocaleString()} →{' '}
                      {formData.discountPrice.toLocaleString()}).
                    </p>
                  </div>
                )}
              </div>

              {/* Stock and Min Stock */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hozirgi qoldiq (dona)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg font-mono-num"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimal xavfsiz qoldiq (ogohlantirish)
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 3 })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono-num"
                  />
                </div>
              </div>

              {/* Dynamic Custom Fields (O'lcham, Rang, Hajm, Muddat, Brend) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Qo'shimcha ustunlar (Etiketka va chekda chiqishi uchun)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500">O'lcham (Size):</span>
                    <input
                      type="text"
                      placeholder="M, L, XL..."
                      value={formData.customFields.size || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customFields: { ...formData.customFields, size: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Rang:</span>
                    <input
                      type="text"
                      placeholder="Qora, qizil..."
                      value={formData.customFields.color || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customFields: { ...formData.customFields, color: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Hajm (Parfum):</span>
                    <input
                      type="text"
                      placeholder="50 ml, 100 ml..."
                      value={formData.customFields.volume || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customFields: { ...formData.customFields, volume: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Yaroqlilik muddati:</span>
                    <input
                      type="text"
                      placeholder="12.2028..."
                      value={formData.customFields.expiryDate || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customFields: { ...formData.customFields, expiryDate: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
