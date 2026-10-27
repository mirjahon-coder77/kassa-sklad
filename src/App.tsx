/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { User, Shift, StoreSettings, Product } from './types/pos';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { NavTab } from './components/layout/Header';
import { PosWindow } from './components/pos/PosWindow';
import { ProductCatalog } from './components/catalog/ProductCatalog';
import { WarehouseView } from './components/warehouse/WarehouseView';
import { ReceiptHistory } from './components/receipts/ReceiptHistory';
import { LabelGenerator } from './components/labels/LabelGenerator';
import { ShiftManagement } from './components/shift/ShiftManagement';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { DayShiftModal } from './components/shift/DayShiftModal';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { HardwareGuideModal } from './components/common/HardwareGuideModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('pos');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [settings, setSettings] = useState<StoreSettings>(StorageService.getSettings());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHardwareGuideOpen, setIsHardwareGuideOpen] = useState(false);
  const [testReceiptOpen, setTestReceiptOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  // Shift Day Modal ('open' | 'close' | null)
  const [shiftModalMode, setShiftModalMode] = useState<'open' | 'close' | null>(null);

  // Initialize data on mount and on version update
  useEffect(() => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);

    const shift = StorageService.getCurrentShift();
    setCurrentShift(shift);

    setSettings(StorageService.getSettings());
  }, [dataVersion]);

  const handleDataChanged = () => {
    setDataVersion((v) => v + 1);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    handleDataChanged();
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setIsAuthOpen(true);
  };

  const handleOpenLabelPrinterForProduct = (product: Product) => {
    setActiveTab('labels');
  };

  const handleShiftUpdated = (updatedShift: Shift | null) => {
    setCurrentShift(updatedShift);
    handleDataChanged();
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex overflow-hidden text-slate-900 selection:bg-slate-900 selection:text-white font-sans">
      {/* 1. Left Modern Enterprise Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        currentShift={currentShift}
        settings={settings}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenShiftModal={() => setShiftModalMode('open')}
        onCloseShiftModal={() => setShiftModalMode('close')}
        onOpenHardwareGuide={() => setIsHardwareGuideOpen(true)}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          activeTab={activeTab}
          currentUser={currentUser}
          currentShift={currentShift}
          settings={settings}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          onOpenShiftModal={() => setShiftModalMode('open')}
          onCloseShiftModal={() => setShiftModalMode('close')}
          onOpenHardwareGuide={() => setIsHardwareGuideOpen(true)}
        />

        {/* Dynamic View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          {activeTab === 'pos' && (
            <PosWindow
              shift={currentShift}
              settings={settings}
              onOpenShiftModal={() => setShiftModalMode('open')}
              onDataChanged={handleDataChanged}
            />
          )}

          {activeTab === 'catalog' && (
            <ProductCatalog
              settings={settings}
              onOpenLabelPrinter={handleOpenLabelPrinterForProduct}
              onDataChanged={handleDataChanged}
            />
          )}

          {activeTab === 'warehouse' && (
            <WarehouseView settings={settings} onDataChanged={handleDataChanged} />
          )}

          {activeTab === 'receipts' && (
            <ReceiptHistory settings={settings} onDataChanged={handleDataChanged} />
          )}

          {activeTab === 'labels' && <LabelGenerator settings={settings} />}

          {activeTab === 'shift' && (
            <ShiftManagement
              currentShift={currentShift}
              settings={settings}
              onDataChanged={handleDataChanged}
            />
          )}

          {activeTab === 'reports' && <ReportsView settings={settings} />}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              currentUser={currentUser}
              onDataChanged={handleDataChanged}
            />
          )}
        </main>
      </div>

      {/* Day Shift Modal (Kunni ochish / Kunni yopish) */}
      <DayShiftModal
        isOpen={shiftModalMode !== null}
        mode={shiftModalMode || 'open'}
        currentShift={currentShift}
        currentUser={currentUser}
        settings={settings}
        onClose={() => setShiftModalMode(null)}
        onShiftUpdated={handleShiftUpdated}
      />

      {/* Hardware Guide Modal (Printer va Skaner qo'llanmasi) */}
      <HardwareGuideModal
        isOpen={isHardwareGuideOpen}
        onClose={() => setIsHardwareGuideOpen(false)}
        onTestPrintReceipt={() => {
          setIsHardwareGuideOpen(false);
          setTestReceiptOpen(true);
        }}
        onTestPrintLabel={() => {
          setIsHardwareGuideOpen(false);
          setActiveTab('labels');
        }}
      />

      {/* Sample/Test Receipt Preview for instant printer testing */}
      {testReceiptOpen && (
        <ReceiptModal
          sale={StorageService.getSales()[0] || null}
          settings={settings}
          onClose={() => setTestReceiptOpen(false)}
        />
      )}

      {/* Auth Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={isAuthOpen || (!currentUser && activeTab === 'pos')}
        onSuccess={handleAuthSuccess}
        onClose={() => setIsAuthOpen(false)}
        canClose={!!currentUser}
      />
    </div>
  );
}
