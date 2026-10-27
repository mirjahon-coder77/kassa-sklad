import React from 'react';
import { User, Shift, StoreSettings } from '../../types/pos';
import {
  Monitor,
  Package,
  Store,
  Receipt,
  Tag,
  Clock,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';
import { NavTab } from './Header';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: User | null;
  currentShift: Shift | null;
  settings: StoreSettings;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenShiftModal: () => void;
  onCloseShiftModal: () => void;
  onOpenHardwareGuide?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const navItems = [
    {
      id: 'pos' as NavTab,
      label: 'Kassa',
      icon: Monitor,
    },
    {
      id: 'catalog' as NavTab,
      label: 'Tovarlar',
      icon: Package,
    },
    {
      id: 'warehouse' as NavTab,
      label: 'Ombor',
      icon: Store,
    },
    {
      id: 'receipts' as NavTab,
      label: 'Cheklar',
      icon: Receipt,
    },
    {
      id: 'labels' as NavTab,
      label: 'Etiketka',
      icon: Tag,
    },
    {
      id: 'shift' as NavTab,
      label: 'Smena hisoboti',
      icon: Clock,
    },
    {
      id: 'reports' as NavTab,
      label: 'Hisobotlar',
      icon: BarChart3,
    },
    {
      id: 'settings' as NavTab,
      label: 'Sozlamalar',
      icon: SettingsIcon,
    },
  ];

  return (
    <aside className="w-60 bg-[#0B132B] text-slate-100 flex flex-col justify-between shrink-0 select-none no-print h-screen z-20">
      <div className="flex flex-col">
        {/* Brand Header matching image_f5bf5453.png */}
        <div className="p-5 pb-6">
          <div
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm shrink-0">
              D
            </div>
            <div className="min-w-0">
              <h1 className="text-[13px] font-black tracking-wide text-white uppercase leading-tight truncate">
                DUNYO WOMEN SHOP
              </h1>
              <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5 truncate">
                POS & Ombor Boshqaruvi
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center gap-3.5 text-xs cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer in Sidebar */}
      <div className="p-5 text-left">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          DUNYO WOMEN SHOP
        </div>
        <div className="text-[11px] text-slate-500 font-mono mt-0.5">v1.0.0</div>
      </div>
    </aside>
  );
};
