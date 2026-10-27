import React, { useState, useEffect } from 'react';
import { User, Shift, StoreSettings } from '../../types/pos';
import { NavTab } from './Header';
import {
  Calendar,
  Printer,
  ChevronDown,
} from 'lucide-react';

interface TopNavbarProps {
  activeTab: NavTab;
  currentUser: User | null;
  currentShift: Shift | null;
  settings: StoreSettings;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenShiftModal: () => void;
  onCloseShiftModal: () => void;
  onOpenHardwareGuide?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  currentUser,
  currentShift,
  settings,
  onOpenAuth,
  onOpenShiftModal,
  onCloseShiftModal,
  onOpenHardwareGuide,
}) => {
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDateStr(
        now.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      );
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabTitles: Record<NavTab, string> = {
    pos: 'Kassa',
    catalog: 'Tovarlar',
    warehouse: 'Ombor',
    receipts: 'Cheklar',
    labels: 'Etiketka',
    shift: 'Smena hisoboti',
    reports: 'Hisobotlar',
    settings: 'Sozlamalar',
  };

  const isShiftOpen = currentShift && currentShift.status === 'open';

  // Get user initials
  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'MK';

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-8 flex items-center justify-between shrink-0 select-none no-print">
      {/* Left: Title + Smena pill matching image_f5bf5453.png */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {tabTitles[activeTab] || 'Kassa'}
        </h1>

        {isShiftOpen ? (
          <button
            type="button"
            onClick={onCloseShiftModal}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
            title="Smenani yopish uchun bosing"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Smena ochiq</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenShiftModal}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
            title="Kunni ochish uchun bosing"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Smena yopiq (Ochish)</span>
          </button>
        )}
      </div>

      {/* Right: Date/Time + Printer&Scanner + User Profile matching image_f5bf5453.png */}
      <div className="flex items-center gap-3">
        {/* Date & Time pill */}
        <div className="hidden sm:flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white shadow-2xs">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="font-mono-num">{dateStr} · {timeStr}</span>
        </div>

        {/* Printer & Skaner button */}
        {onOpenHardwareGuide && (
          <button
            type="button"
            onClick={onOpenHardwareGuide}
            className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Printer & Skaner</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}

        {/* User Profile */}
        <div
          onClick={onOpenAuth}
          className="flex items-center gap-2.5 pl-2 cursor-pointer hover:opacity-90 transition-opacity"
          title="Foydalanuvchi ma'lumotlari"
        >
          <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser?.name || 'Madina Karimova'}
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">
              {currentUser?.role === 'owner' ? "Do'kon egasi" : 'Kassir'}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
};
