import React, { useState } from 'react';
import {
  Printer,
  Barcode,
  HelpCircle,
  X,
  CheckCircle2,
  Sliders,
  Settings,
  FileText,
  Usb,
  Sparkles,
  Monitor,
} from 'lucide-react';

interface HardwareGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestPrintReceipt?: () => void;
  onTestPrintLabel?: () => void;
}

export const HardwareGuideModal: React.FC<HardwareGuideModalProps> = ({
  isOpen,
  onClose,
  onTestPrintReceipt,
  onTestPrintLabel,
}) => {
  const [tab, setTab] = useState<'scanner' | 'printer' | 'label' | 'hybrid'>('hybrid');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Usb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Chek printer, Skaner va Etiketka apparati qo'llanmasi</h3>
              <p className="text-[11px] text-slate-400">
                2-in-1 gibrid apparat, USB skaner va chop etish bo'yicha to'liq qo'llanma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab('hybrid')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              tab === 'hybrid'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-white" />
            ⭐ 2-in-1 Bitta apparat
          </button>
          <button
            type="button"
            onClick={() => setTab('scanner')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              tab === 'scanner'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Barcode className="w-4 h-4 text-indigo-600" />
            Shtrix-kod skaneri
          </button>
          <button
            type="button"
            onClick={() => setTab('printer')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              tab === 'printer'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            Chek printeri
          </button>
          <button
            type="button"
            onClick={() => setTab('label')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              tab === 'label'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-600" />
            Etiketka printeri
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {tab === 'hybrid' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-amber-950 space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-500 text-white rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-xs text-amber-950 tracking-wide uppercase">
                      Bitta apparat: 2-in-1 Gibrid Termo Printer
                    </h4>
                    <span className="text-[11px] text-amber-800 font-medium">
                      Tavsiya etiladigan model: <strong>Xprinter XP-365B</strong> yoki <strong>Xprinter XP-420B / XP-235B</strong>
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed pt-1">
                  Sizga ikkita alohida apparat olish shart emas! <strong>Xprinter XP-365B</strong> bitta qurilmada ham kassa cheklarini, ham tovarlarga yopishtiriladigan 40×30 mm termo-stikerlarni (yorliqlarni) 100% yuqori sifatda chiqarib beradi.
                </p>
              </div>

              {/* Working principle */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Bitta apparatda ikkalasi qanday ishlaydi?
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                        1
                      </span>
                      <strong className="text-slate-900 text-xs">
                        Etiketka chiqarishda (Sklad / Kirim)
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Printer ichiga <strong>40×30 mm o'ziyopishqoq termo-stiker</strong> ruloni solinadi. Dasturning «Etiketkalar» bo'limida tovar tanlanadi va 10 yoki 50 dona bosiladi. Apparat har bir stikerni bittadan uzib beradi, uni to'g'ridan-to'g'ri kiyimga yopishtirasiz.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                        2
                      </span>
                      <strong className="text-slate-900 text-xs">
                        Chek chiqarishda (Kassa savdosi)
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Ichiga oddiy arzon <strong>termo-chek lentasi</strong> (58 mm yoki 80 mm) solinadi. Kassada mijozga tovar sotilib, «Chop etish» bosilganda chiroyli rasmiy chek («DUNYO WOMEN SHOP», tovarlar, ITOG va shtrix-kod) chiqarib beriladi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hardware specifications */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Nega aynan Xprinter XP-365B eng ma'qul tanlov?
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4">
                  <li>
                    <strong>Hamyonbop narx:</strong> O'zbekistonda (Toshkent Malika, Abu Saxiy yoki Uzum Marketda) yangisi taxminan <strong>450 000 – 650 000 so'm</strong> turadi.
                  </li>
                  <li>
                    <strong>Siyoh (kraska) kerak emas:</strong> To'liq termo-boshcha texnologiyasi asosida ishlaydi, hech qachon kartrij yoki siyoh xarid qilmaysiz.
                  </li>
                  <li>
                    <strong>Bitta USB kabel:</strong> Noutbuk yoki kompyuterga 1 ta USB orqali ulanadi, kassa stoli ixcham va tartibli turadi.
                  </li>
                  <li>
                    <strong>Arzon sarf materiallari:</strong> 40×30 mm o'ziyopishqoq stiker ruloni (700 dona yorliq) bor-yo'g'i ~15 000–20 000 so'm, chek lentasi esa ~5 000 so'm.
                  </li>
                </ul>
              </div>

              {/* Quick actions */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap justify-end gap-2">
                {onTestPrintReceipt && (
                  <button
                    type="button"
                    onClick={onTestPrintReceipt}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Chek namunasi
                  </button>
                )}
                {onTestPrintLabel && (
                  <button
                    type="button"
                    onClick={onTestPrintLabel}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Etiketkalar bo'limi
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === 'scanner' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 space-y-1">
                <span className="font-bold text-xs flex items-center gap-1.5 text-indigo-900">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Skaner uchun hech qanday qo'shimcha drayver kerak emas!
                </span>
                <p className="text-[11px] leading-normal text-indigo-800">
                  Barcha shtrix-kod skanerlari (Xprinter, Netum, Eyoyo, Honeywell va boshqalar) kompyuterga
                  oddiy USB klaviatura (HID keyboard) kabi ulanadi.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Qanday ulanadi va ishlatiladi:
                </h4>
                <ol className="list-decimal pl-4 space-y-2 text-xs">
                  <li>
                    <strong>Skanerni USB portga ulang:</strong> Kompyuter uni darhol taniydi va «bip»
                    ovozini chiqaradi.
                  </li>
                  <li>
                    <strong>Kassa (POS) oynasini oching:</strong> Dasturimizdagi katta qidiruv maydoni
                    («Shtrix-kodni skanerlang yoki KOD yozing») doimo skanerlashga tayyor turadi.
                  </li>
                  <li>
                    <strong>Qizil lazerni tovarga qarating:</strong> Yorliqdagi shtrix-kodga qaratib
                    tugmani bosing.
                  </li>
                  <li>
                    <strong>Avtomatik savatga tushadi:</strong> Skaner kodni bir zumda yozib, avtomatik{' '}
                    <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">
                      Enter
                    </kbd>{' '}
                    bosadi. Tovar savatga tushadi, qoldiq tekshiriladi va ovozli/matnli xabarnoma chiqadi.
                  </li>
                  <li>
                    <strong>Agar skaner bo'lmasa:</strong> Tovar kodini (masalan{' '}
                    <span className="font-mono font-bold">K-0012</span> yoki{' '}
                    <span className="font-mono font-bold">P-0034</span>) qo'lda yozib{' '}
                    <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">
                      Enter
                    </kbd>{' '}
                    bosing yoki <span className="font-bold">F2</span> tugmasi orqali tovarlar ro'yxatidan
                    tanlang.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {tab === 'printer' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
                <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-900">
                  <Printer className="w-4 h-4 text-emerald-600" />
                  Termo chek printeri (58 mm yoki 80 mm)
                </span>
                <p className="text-[11px] leading-normal text-emerald-800">
                  Xprinter (XP-58, XP-80), Epson, Rongta, POS-58/80 kabi istalgan termo-chek printeri
                  bilan to'g'ridan-to'g'ri ishlaydi.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  O'rnatish va birinchi sozlash bosqichlari:
                </h4>
                <ol className="list-decimal pl-4 space-y-2 text-xs">
                  <li>
                    <strong>Printerni ulang va drayverini o'rnating:</strong> Printerning USB kabelini
                    kompyuterga ulang, qog'oz lentasini joylashtiring. Printer bilan birga kelgan CD yoki
                    ishlab chiqaruvchi saytidan Windows drayverini o'rnating.
                  </li>
                  <li>
                    <strong>Dasturda «Chekni chiqarish» tugmasini bosing:</strong> Har bir savdo
                    yakunlanganda yoki Cheklar tarixidan «Chekni ko'rish» bosilganda ochilgan oynada{' '}
                    <strong className="text-emerald-700">«Chop etish»</strong> tugmasini bosing.
                  </li>
                  <li>
                    <strong>Brauzer chop etish oynasida (Ctrl + P) printer sozlamasi:</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-1 text-[11px] text-slate-600">
                      <li>
                        <strong>Printer (Destination):</strong> O'zingizning chek printeringizni tanlang
                        (masalan: <em>POS-80</em> yoki <em>XP-80</em>).
                      </li>
                      <li>
                        <strong>Qog'oz o'lchami (Paper size):</strong> <em>80mm Roll</em> yoki{' '}
                        <em>58mm Roll</em> tanlang.
                      </li>
                      <li>
                        <strong>Chegaralar (Margins):</strong> <em>None</em> (Chegarasiz) yoki{' '}
                        <em>Minimum</em> qilib belgilang.
                      </li>
                      <li>
                        <strong>Sarlavha va sanalar (Headers and footers):</strong> Belgini olib tashlang
                        (o'chiring).
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Tayyor!</strong> Keyingi safar «Chop etish» bosilganda brauzer ushbu
                    sozlamalarni eslab qoladi va chek bir zumda printerdan chiqadi.
                  </li>
                </ol>
              </div>

              {onTestPrintReceipt && (
                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={onTestPrintReceipt}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Sinov namunaviy chekni ochish va chop etish
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'label' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 space-y-1">
                <span className="font-bold text-xs flex items-center gap-1.5 text-rose-900">
                  <FileText className="w-4 h-4 text-rose-600" />
                  Yorliq (Etiketka) chop etish usullari
                </span>
                <p className="text-[11px] leading-normal text-rose-800">
                  Dasturimiz siz yuborgan namunaviy 40×30 mm etiketka dizaynida tovar kodi, Code 128
                  shtrix-kodi, narx va QR-kodni avtomatik chizib beradi.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  2 xil qulay usulda chop etishingiz mumkin:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <strong className="text-slate-900 text-xs block">
                      A. Termo etiketka printeri (40×30 mm)
                    </strong>
                    <p className="text-[11px] text-slate-600">
                      Xprinter XP-365B, XP-420B kabi termo stiker printerlarida rulonli stiker
                      qog'oziga to'g'ridan-to'g'ri kerakli sonda (masalan 10 ta, 50 ta) yopishqoq yorliq
                      chiqariladi.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <strong className="text-slate-900 text-xs block">
                      B. Oddiy A4 printerda chiqarish
                    </strong>
                    <p className="text-[11px] text-slate-600">
                      Agar maxsus etiketka printeri bo'lmasa, dasturda «A4 varaq» rejimini tanlaysiz. Bir
                      varaqqa 16-24 dona etiketka chiroyli to'r bo'lib chiqadi, qaychi bilan kesib
                      tovarga yopishtiriladi.
                    </p>
                  </div>
                </div>
              </div>

              {onTestPrintLabel && (
                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={onTestPrintLabel}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Etiketkalar bo'limiga o'tish
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Savol yoki qiyinchilik bo'lsa sozlamalarni tekshiring
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Tushundim (Yopish)
          </button>
        </div>
      </div>
    </div>
  );
};
