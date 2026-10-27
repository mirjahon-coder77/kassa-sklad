import React, { useState } from 'react';
import { Product, StoreSettings } from '../../types/pos';
import { StorageService } from '../../services/storage';
import { BarcodeRenderer } from '../common/BarcodeRenderer';
import { QrCodeRenderer } from '../common/QrCodeRenderer';
import { Printer, Tag, Sliders, LayoutGrid, Check, FileDown, Search } from 'lucide-react';

interface LabelGeneratorProps {
  settings: StoreSettings;
}

export const LabelGenerator: React.FC<LabelGeneratorProps> = ({ settings }) => {
  const products = StorageService.getProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products.length > 0 ? products[0].id : ''
  );
  const [labelSize, setLabelSize] = useState<'40x30' | '58x40' | '30x20'>('40x30');
  const [printMode, setPrintMode] = useState<'thermo' | 'a4'>('thermo');
  const [copies, setCopies] = useState<number>(10);
  const [search, setSearch] = useState('');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handlePrint = () => {
    document.body.classList.add('printing-labels');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-labels');
    }, 1000);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Tovar etiketkasi (yorlig'i) va shtrix-kod chop etish
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            40×30 mm termo etiketka, Code 128 shtrix-kod, QR kod va narx yorliqlari
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs self-start"
        >
          <Printer className="w-4 h-4" />
          Etiketkalarni chop etish ({copies} nusxa)
        </button>
      </div>

      {/* Control Panel and Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Selector & Settings */}
        <div className="space-y-4 no-print">
          {/* Product selector card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-slate-500" />
              1. Tovarni tanlang
            </h3>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tovarni qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedProductId === p.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div
                      className={`text-[11px] font-mono mt-0.5 ${
                        selectedProductId === p.id ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {p.code} · {p.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono-num">
                      {(p.hasDiscount && p.discountPrice ? p.discountPrice : p.salePrice).toLocaleString()}{' '}
                      so'm
                    </div>
                    {p.hasDiscount && (
                      <span
                        className={`text-[10px] uppercase font-bold px-1 py-0.5 rounded ${
                          selectedProductId === p.id
                            ? 'bg-rose-500 text-white'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        Chegirma
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Size & Copies Settings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-slate-500" />
              2. Yorliq o'lchami va parametrlari
            </h3>

            {/* Label size selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Etiketka o'lchami
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLabelSize('40x30')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                    labelSize === '40x30'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>40 × 30 mm</div>
                  <div className="text-[10px] opacity-75 font-normal">(Asosiy)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize('58x40')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                    labelSize === '58x40'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>58 × 40 mm</div>
                  <div className="text-[10px] opacity-75 font-normal">(Katta)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize('30x20')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                    labelSize === '30x20'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>30 × 20 mm</div>
                  <div className="text-[10px] opacity-75 font-normal">(Kichik)</div>
                </button>
              </div>
            </div>

            {/* Print Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chop etish tartibi
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrintMode('thermo')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                    printMode === 'thermo'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Termo printer (rulon)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintMode('a4')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                    printMode === 'a4'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  A4 varaq (kesish uchun)
                </button>
              </div>
            </div>

            {/* Copies */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Nusxalar soni:</label>
                <div className="flex gap-1">
                  {[1, 5, 10, 20, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCopies(num)}
                      className={`px-2 py-0.5 text-[11px] rounded border cursor-pointer ${
                        copies === num
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min="1"
                max="200"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Exact Label Preview Matching the PDF */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 no-print">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Etiketka ko'rinishi (Namunaviy o'lcham)
                </h3>
                <p className="text-xs text-slate-500">
                  {settings.storeName} termo-yorliq standarti ({labelSize} mm)
                </p>
              </div>
              <div className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {copies} dona tayyorlanmoqda
              </div>
            </div>

            {/* Single Large Interactive Preview (x2 kattalashtirilgan) */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 mb-6 no-print">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Kattalashtirilgan namuna (×2 ko'rinish)
              </span>

              {/* Exact Label Card */}
              <SingleLabelCard
                product={selectedProduct}
                storeName={settings.storeName}
                labelSize={labelSize}
                scale={1.3}
              />
            </div>

            {/* Print Grid Area (What actually gets printed) */}
            <div>
              <div className="flex justify-between items-center mb-3 no-print">
                <h4 className="text-xs font-bold text-slate-700">
                  {printMode === 'a4'
                    ? "A4 varaqqa to'r (kesib olish uchun)"
                    : 'Chop etiladigan nusxalar ro\'yxati'}
                </h4>
                <span className="text-xs text-slate-500">{copies} ta etiketka</span>
              </div>

              {/* Container for Print */}
              <div
                className={`printable-labels p-4 bg-white border border-slate-200 rounded-xl overflow-x-auto ${
                  printMode === 'a4'
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2 print:border-none'
                    : 'flex flex-wrap gap-4 print:flex-col print:items-center print:gap-0'
                }`}
              >
                {Array.from({ length: copies }).map((_, index) => (
                  <div key={index} className="print:break-inside-avoid print:page-break-after-avoid mb-2">
                    <SingleLabelCard
                      product={selectedProduct}
                      storeName={settings.storeName}
                      labelSize={labelSize}
                      scale={1.0}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Single 40x30 / 58x40 / 30x20 label matching image_cc8cdea0.png
interface SingleLabelProps {
  product: Product;
  storeName: string;
  labelSize: '40x30' | '58x40' | '30x20';
  scale?: number;
}

const HangerIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3a2.5 2.5 0 0 0-2.5 2.5c0 1.1.7 2 1.7 2.3L3 14a1.5 1.5 0 0 0 1 2.5h16a1.5 1.5 0 0 0 1-2.5L12.8 7.8c1-.3 1.7-1.2 1.7-2.3A2.5 2.5 0 0 0 12 3z" />
  </svg>
);

const SingleLabelCard: React.FC<SingleLabelProps> = ({
  product,
  storeName,
  labelSize,
  scale = 1.0,
}) => {
  let baseWidth = 330;
  let baseHeight = 235;

  if (labelSize === '58x40') {
    baseWidth = 380;
    baseHeight = 260;
  } else if (labelSize === '30x20') {
    baseWidth = 260;
    baseHeight = 185;
  }

  const width = baseWidth * scale;
  const height = baseHeight * scale;

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className="bg-white rounded-2xl border-2 border-black flex flex-col justify-between text-black font-sans box-border relative overflow-hidden select-none shadow-md print:shadow-none print:border-black"
    >
      {/* 1. Top Black Header Bar */}
      <div className="bg-black text-white px-3 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <HangerIcon className="w-5 h-5 text-white shrink-0" />
          <div className="h-5 w-[1px] bg-neutral-600" />
          <div className="leading-none text-left">
            <div className="font-extrabold text-xs tracking-wider uppercase font-sans">DUNYO</div>
            <div className="text-[7px] tracking-widest text-neutral-300 font-bold uppercase mt-0.5">
              WOMEN SHOP
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-right">
          <div className="text-[7px] leading-tight tracking-wider uppercase text-neutral-300 font-semibold">
            <div>STYLISH LOOK</div>
            <div>FOR EVERY DAY</div>
          </div>
          <svg className="w-3.5 h-3.5 text-white fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      </div>

      {/* 2. Middle Body */}
      <div className="px-3 py-1.5 flex-1 flex items-stretch justify-between gap-2 min-h-0 bg-white">
        {/* Left column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider mb-1">
              <span>{product.category || 'AYOLLAR KIYIMI'}</span>
              <span className="text-[8px] text-black">♥</span>
            </div>
            <div className="font-extrabold text-xs text-black leading-tight line-clamp-2">
              {product.name}
            </div>
          </div>

          <div className="space-y-0.5 text-[9px] text-neutral-900 font-semibold mt-1">
            {product.customFields?.size && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-neutral-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.5a2 2 0 0 0 2 1.67H6v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10.86h1.14a2 2 0 0 0 2-1.67l.58-3.5a2 2 0 0 0-1.34-2.23z" />
                </svg>
                <span>O'lcham: {product.customFields.size}</span>
              </div>
            )}
            {product.customFields?.color && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-neutral-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                  <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                  <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                  <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                </svg>
                <span>Rang: {product.customFields.color}</span>
              </div>
            )}
            {product.customFields?.volume && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-neutral-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m12 2.69 5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
                <span>Hajm: {product.customFields.volume}</span>
              </div>
            )}
            {product.customFields?.expiryDate && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-neutral-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span>Muddat: {product.customFields.expiryDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Center vertical hairline */}
        <div className="w-[1px] bg-neutral-300 self-stretch my-0.5" />

        {/* Right column: Prices */}
        <div className="w-32 shrink-0 flex flex-col justify-center items-center text-center py-0.5">
          {product.hasDiscount ? (
            <div className="line-through text-xs text-neutral-400 font-bold font-mono-num">
              {product.salePrice.toLocaleString()}
            </div>
          ) : null}
          <div className="text-2xl font-black text-black font-mono-num tracking-tight leading-none my-0.5">
            {(product.hasDiscount && product.discountPrice
              ? product.discountPrice
              : product.salePrice
            ).toLocaleString()}
          </div>
          <div className="flex items-center gap-1 w-full my-1">
            <div className="h-[1px] bg-neutral-400 flex-1" />
            <span className="bg-black text-white text-[7px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap">
              SIZ UCHUN ENG YAXSHI TANLOV
            </span>
            <div className="h-[1px] bg-neutral-400 flex-1" />
          </div>
        </div>
      </div>

      {/* 3. Bottom: Barcode + Trust Badges + QR Code */}
      <div className="border-t border-neutral-300 px-3 py-1 flex items-center justify-between gap-1.5 shrink-0 bg-white">
        {/* Barcode */}
        <div className="flex flex-col items-center shrink-0">
          <BarcodeRenderer
            value={product.code}
            width={1.0 * scale}
            height={22 * scale}
            displayValue={false}
          />
          <span className="font-mono font-bold text-[8px] tracking-widest mt-0.5">
            {product.code}
          </span>
        </div>

        {/* Vertical hairline */}
        <div className="h-8 w-[1px] bg-neutral-200 shrink-0" />

        {/* 3 Trust Badges */}
        <div className="flex items-center justify-around flex-1 text-center px-1">
          <div className="flex flex-col items-center">
            <svg className="w-3.5 h-3.5 text-neutral-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span className="text-[6px] font-bold text-neutral-700 uppercase mt-0.5 leading-tight">
              SIFAT<br />KAFOLATI
            </span>
          </div>

          <div className="flex flex-col items-center">
            <HangerIcon className="w-3.5 h-3.5 text-neutral-800" />
            <span className="text-[6px] font-bold text-neutral-700 uppercase mt-0.5 leading-tight">
              ZAMONAVIY<br />USLUB
            </span>
          </div>

          <div className="flex flex-col items-center">
            <svg className="w-3.5 h-3.5 text-neutral-800 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="text-[6px] font-bold text-neutral-700 uppercase mt-0.5 leading-tight">
              SIZ UCHUN<br />G'AMXO'RLIK
            </span>
          </div>
        </div>

        {/* Vertical hairline */}
        <div className="h-8 w-[1px] bg-neutral-200 shrink-0" />

        {/* QR Code */}
        <div className="p-0.5 border border-black rounded-md shrink-0">
          <QrCodeRenderer value={product.code} size={28 * scale} />
        </div>
      </div>

      {/* 4. Bottom Black Strip */}
      <div className="bg-black text-white text-center py-0.5 text-[7px] font-bold tracking-widest uppercase shrink-0">
        — DUNYO WOMEN SHOP —
      </div>
    </div>
  );
};
