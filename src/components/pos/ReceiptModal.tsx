import React, { useRef, useEffect } from 'react';
import { Sale, StoreSettings } from '../../types/pos';
import { BarcodeRenderer } from '../common/BarcodeRenderer';
import { Printer, Check, X, AlertTriangle } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale | null;
  settings: StoreSettings;
  onClose: () => void;
  onCancelReceipt?: (sale: Sale) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  settings,
  onClose,
  onCancelReceipt,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [sale]);

  if (!sale) return null;

  const handlePrint = () => {
    document.body.classList.add('printing-receipt');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-receipt');
    }, 1000);
  };

  const isCancelled = sale.status === 'cancelled';
  const paperWidthClass = settings.paperWidth === '58mm' ? 'max-w-[340px]' : 'max-w-[380px]';

  // Format date and time
  const dateObj = new Date(sale.timestamp);
  const formattedDate = dateObj.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Action Bar Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold tracking-tight">
              Chek #{sale.receiptNumber}
            </span>
            {isCancelled && (
              <span className="text-[11px] font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded">
                Bekor qilingan
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Chop etish
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body (items-start ensures top DUNYO WOMEN SHOP is never clipped) */}
        <div 
          ref={scrollContainerRef}
          className="p-6 bg-slate-100 flex justify-center items-start overflow-y-auto flex-1 min-h-0"
        >
          {/* Printable Receipt Paper */}
          <div
            ref={receiptRef}
            className={`printable-receipt w-full ${paperWidthClass} bg-white p-6 shadow-md border border-slate-200 font-mono text-[12px] text-black leading-relaxed relative select-none print:shadow-none print:border-none print:p-0 print:m-0`}
          >
            {/* Cancelled Stamp overlay */}
            {isCancelled && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="border-4 border-rose-600 text-rose-600 font-bold text-2xl uppercase tracking-widest px-4 py-2 rotate-[-24deg] opacity-85">
                  BEKOR QILINGAN
                </div>
              </div>
            )}

            {/* Header info matching image_8236fb0a.png */}
            <div className="text-center space-y-1 mb-2">
              <div className="font-extrabold text-base tracking-wider uppercase font-mono">
                {settings.storeName}
              </div>
              <div className="text-[11px] text-neutral-800 leading-tight">
                Manzil: {settings.address}
              </div>
              <div className="text-[11px] text-neutral-800">Tel: {settings.phone}</div>
            </div>

            <div className="text-center tracking-widest text-[11px] my-1 text-neutral-800">
              ****************************************
            </div>

            {/* Receipt Meta */}
            <div className="flex justify-between text-[11px] my-0.5">
              <span>Chek: #{sale.receiptNumber}</span>
              <span>Kassa: #1</span>
            </div>
            <div className="flex justify-between text-[11px] my-0.5">
              <span>Sana: {formattedDate}</span>
              <span>Vaqt: {formattedTime}</span>
            </div>
            <div className="text-[11px] my-0.5">Kassir: {sale.cashierName}</div>

            <div className="text-center tracking-widest text-[11px] my-1 text-neutral-800">
              ----------------------------------------
            </div>

            {/* Sale Items matching image_8236fb0a.png */}
            <div className="space-y-2 my-2">
              {sale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-xs text-black">
                    {idx + 1}. {item.productName}
                    {item.customInfo &&
                    !item.productName.toLowerCase().includes(item.customInfo.toLowerCase())
                      ? ` (${item.customInfo})`
                      : ''}
                  </div>
                  <div className="flex justify-between items-center text-[11px] pl-2">
                    <span className="font-mono-num">
                      {item.quantity} x {item.soldPrice.toLocaleString()}
                    </span>
                    <span className="font-bold font-mono-num text-black">
                      {item.total.toLocaleString()} so'm
                    </span>
                  </div>
                  {item.hasDiscount && (
                    <div className="text-[10px] text-neutral-500 pl-2 italic">
                      (Chegirma: -
                      {((item.originalPrice - item.soldPrice) * item.quantity).toLocaleString()}{' '}
                      so'm)
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center tracking-widest text-[11px] my-1 text-neutral-800">
              ----------------------------------------
            </div>

            {/* JAMI (asl narxlarda) */}
            <div className="flex justify-between text-[11px] my-1">
              <span>JAMI (asl narxlarda)</span>
              <span className="font-mono-num font-semibold">
                {sale.totalOriginal.toLocaleString()}
              </span>
            </div>

            {sale.totalDiscount > 0 && (
              <div className="flex justify-between text-[11px] text-neutral-800 my-0.5">
                <span>CHEGIRMA</span>
                <span className="font-mono-num font-semibold">
                  -{sale.totalDiscount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="text-center tracking-widest text-[11px] my-1 text-neutral-800">
              ----------------------------------------
            </div>

            {/* TO'LOV JAMI (Large bold matching image_8236fb0a.png) */}
            <div className="flex justify-between items-baseline py-1 text-sm font-extrabold text-black">
              <span className="tracking-wide">TO'LOV JAMI</span>
              <span className="text-base font-black font-mono-num">
                {sale.itog.toLocaleString()} so'm
              </span>
            </div>

            <div className="text-center tracking-widest text-[11px] my-1 text-neutral-800">
              ----------------------------------------
            </div>

            {/* Payment method */}
            <div className="flex justify-between text-[11px] my-1">
              <span>To'lov turi:</span>
              <span className="font-bold tracking-wider uppercase">{sale.paymentMethod}</span>
            </div>

            {sale.cashReceived && sale.cashReceived > 0 ? (
              <div className="flex justify-between text-[10px] text-neutral-600">
                <span>Berilgan naqd:</span>
                <span className="font-mono-num">{sale.cashReceived.toLocaleString()}</span>
              </div>
            ) : null}

            {sale.cashChange && sale.cashChange > 0 ? (
              <div className="flex justify-between text-[10px] text-neutral-600">
                <span>Qaytim:</span>
                <span className="font-mono-num">{sale.cashChange.toLocaleString()}</span>
              </div>
            ) : null}

            <div className="text-center tracking-widest text-[11px] my-2 text-neutral-800">
              ----------------------------------------
            </div>

            {/* Centered Barcode & Receipt Number matching image_8236fb0a.png */}
            <div className="flex flex-col items-center justify-center my-3 space-y-1">
              <BarcodeRenderer
                value={sale.receiptNumber}
                width={1.8}
                height={38}
                fontSize={11}
                displayValue={true}
              />
            </div>

            <div className="text-center tracking-widest text-[11px] my-1 text-neutral-800">
              ----------------------------------------
            </div>

            {/* Footer Text */}
            <div className="text-center space-y-1 my-2">
              {settings.instagram && (
                <div className="text-[11px] text-neutral-800 font-medium">
                  Instagram: {settings.instagram}
                </div>
              )}
              <div className="text-[11px] font-bold text-neutral-900">
                {settings.receiptFooter}
              </div>
            </div>

            {isCancelled && sale.cancellationReason && (
              <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded text-[10px] text-rose-800">
                <strong>Bekor qilish sababi:</strong> {sale.cancellationReason}
                <br />
                <strong>Bekor qilindi:</strong>{' '}
                {sale.cancelledAt ? new Date(sale.cancelledAt).toLocaleString('ru-RU') : ''}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between no-print">
          <div>
            {!isCancelled && onCancelReceipt && (
              <button
                onClick={() => onCancelReceipt(sale)}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Chekni bekor qilish
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
