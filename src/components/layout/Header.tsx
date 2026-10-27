import React, { useState, useEffect } from 'react';
import { User, Shift, StoreSettings } from '../../types/pos';
import {
  ShoppingBag,
  Package,
  Boxes,
  Receipt,
  Tag,
  BarChart3,
  Clock,
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut,
  Sparkles,
} from 'lucide-react';

export type NavTab =
  | 'pos'
  | 'catalog'
  | 'warehouse'
  | 'receipts'
  | 'labels'
  | 'reports'
  | 'shift'
  | 'settings';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: User | null;
  currentShift: Shift | null;
  settings: StoreSettings;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenShiftModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  currentShift,
  settings,
  onOpenAuth,
  onLogout,
  onOpenShiftModal,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('ru-RU') +
          ' ' +
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'pos' as NavTab, label: 'Kassa (Savdo)', icon: ShoppingBag },
    { id: 'catalog' as NavTab, label: 'Tovarlar', icon: Package },
    { id: 'warehouse' as NavTab, label: 'Sklad (Kirim)', icon: Boxes },
    { id: 'receipts' as NavTab, label: 'Chek tarixi', icon: Receipt },
    { id: 'labels' as NavTab, label: 'Etiketka', icon: Tag },
    { id: 'shift' as NavTab, label: 'Smena', icon: Clock },
    { id: 'reports' as NavTab, label: 'Hisobotlar', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Sozlamalar', icon: SettingsIcon },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 select-none no-print">
      <div className="flex items-center justify-between px-4 h-16 gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center font-bold text-white shadow-xs">
              D
            </div>
            <div className="leading-tight">
              <span className="text-sm font-extrabold tracking-tight text-white whitespace-nowrap">
                {settings.storeName}
              </span>
              <div className="text-[10px] text-slate-400 font-medium">POS & Sklad Tizimi</div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Info: Shift Status, Clock & User Auth Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Shift status badge */}
          {currentShift && currentShift.status === 'open' ? (
            <button
              onClick={() => setActiveTab('shift')}
              className="text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-emerald-900/60 transition-colors whitespace-nowrap"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>
                Smena OCHIQ (
                {new Date(currentShift.openedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                )
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenShiftModal}
              className="text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/30 transition-colors whitespace-nowrap"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Smena YOPIQ</span>
            </button>
          )}

          {/* Clock */}
          <div className="hidden sm:block text-[11px] font-mono-num text-slate-400 whitespace-nowrap">
            {currentTime}
          </div>

          {/* User Profile / Auth Switcher */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-left"
                title="Xodimni almashtirish yoki profil"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 ${
                    currentUser.role === 'owner' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden md:block leading-none text-left">
                  <div className="text-xs font-semibold text-white whitespace-nowrap">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {currentUser.role === 'owner' ? "Do'kon egasi" : 'Kassir'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Tizimdan chiqish"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <UserIcon className="w-3.5 h-3.5" />
              Kirish / Ro'yxatdan o'tish
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav bar under header */}
      <div className="flex lg:hidden overflow-x-auto py-2 px-3 bg-slate-950 border-t border-slate-800 gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap ${
                isActive ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
