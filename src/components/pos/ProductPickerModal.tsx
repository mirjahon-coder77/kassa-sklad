import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../types/pos';
import { Search, Tag, X, Check } from 'lucide-react';

interface ProductPickerModalProps {
  isOpen: boolean;
  products: Product[];
  onSelect: (product: Product) => void;
  onClose: () => void;
}

export const ProductPickerModal: React.FC<ProductPickerModalProps> = ({
  isOpen,
  products,
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['Barchasi', 'Kiyim', 'Parfumeriya', 'Aksessuar', 'Bijuteriya'];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'Barchasi' || p.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      (p.customFields?.brand && p.customFields.brand.toLowerCase().includes(q)) ||
      (p.customFields?.size && p.customFields.size.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold">Tovarlar katalogi (F2 qidiruv)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar & Category filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Tovar nomi, kodi (K-0012) yoki shtrix-kod..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Tovar topilmadi. Qidiruv so'zini tekshiring.
            </div>
          ) : (
            filtered.map((product) => {
              const isLowStock = product.stock <= product.minStock;
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelect(product);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isOutOfStock
                      ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
                      : isLowStock
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                      : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-mono text-xs font-bold border border-slate-200">
                      {product.code.split('-')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{product.name}</span>
                        <span className="text-[11px] font-mono text-slate-500">[{product.code}]</span>
                        {product.hasDiscount && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Chegirma
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{product.category}</span>
                        {product.customFields?.size && (
                          <>
                            <span>·</span>
                            <span>O'lcham: {product.customFields.size}</span>
                          </>
                        )}
                        {product.customFields?.color && (
                          <>
                            <span>·</span>
                            <span>Rang: {product.customFields.color}</span>
                          </>
                        )}
                        {product.customFields?.volume && (
                          <>
                            <span>·</span>
                            <span>{product.customFields.volume}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1.5">
                      {product.hasDiscount ? (
                        <>
                          <span className="text-xs text-slate-400 line-through font-mono-num">
                            {product.salePrice.toLocaleString()}
                          </span>
                          <span className="text-sm font-bold text-slate-900 font-mono-num">
                            {product.discountPrice.toLocaleString()} so'm
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-slate-900 font-mono-num">
                          {product.salePrice.toLocaleString()} so'm
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] mt-0.5">
                      {isOutOfStock ? (
                        <span className="text-rose-600 font-bold">Qoldiq yo'q (0 dona)</span>
                      ) : isLowStock ? (
                        <span className="text-amber-600 font-semibold">
                          Qoldiq kam: {product.stock} dona
                        </span>
                      ) : (
                        <span className="text-slate-500">Qoldiq: {product.stock} dona</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Tovarni savatga qo'shish uchun ustiga bosing</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
          >
            Bekor qilish (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
