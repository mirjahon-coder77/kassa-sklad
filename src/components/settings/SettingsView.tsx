import React, { useState } from 'react';
import { StoreSettings, CustomFieldDefinition, User } from '../../types/pos';
import { StorageService } from '../../services/storage';
import {
  Settings,
  Store,
  Printer,
  ShieldCheck,
  Columns,
  Database,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';

interface SettingsViewProps {
  settings: StoreSettings;
  currentUser: User | null;
  onDataChanged: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  currentUser,
  onDataChanged,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(
    StorageService.getCustomFields()
  );
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date'>('text');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  // Status message
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateSettings(formData);
    setSaveStatus('Sozlamalar muvaffaqiyatli saqlandi!');
    setTimeout(() => setSaveStatus(null), 3000);
    onDataChanged();
  };

  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    StorageService.addCustomField(newFieldName.trim(), newFieldType);
    setNewFieldName('');
    setCustomFields(StorageService.getCustomFields());
    onDataChanged();
  };

  const handleDeleteCustomField = (id: string) => {
    StorageService.deleteCustomField(id);
    setCustomFields(StorageService.getCustomFields());
    onDataChanged();
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newPassword) return;

    StorageService.updateUser(currentUser.id, { password: newPassword });
    setPasswordNotice('Parolingiz muvaffaqiyatli yangilandi!');
    setNewPassword('');
    setTimeout(() => setPasswordNotice(null), 3000);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dunyo_Women_Shop_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = StorageService.importBackup(content);
        if (res.success) {
          alert('Zaxira nusxa muvaffaqiyatli tiklandi!');
          window.location.reload();
        } else {
          alert(`Xatolik: ${res.message}`);
        }
      }
    };
    reader.readAsText(file);
  };

  // Reset to demo defaults
  const handleResetData = () => {
    if (
      confirm(
        "Diqqat! Barcha kiritilgan ma'lumotlar o'chib, dastlabki namuna tovarlariga qaytariladi. Davom etasizmi?"
      )
    ) {
      StorageService.resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Tizim Sozlamalari</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Do'kon rekvizitlari, chek parametrlari, printer formati, maxsus ustunlar va zaxira nusxa
        </p>
      </div>

      {saveStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {saveStatus}
        </div>
      )}

      {/* SECTION 1: Store & Receipt Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Store className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Do'kon rekvizitlari va chek ma'lumotlari
          </h2>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Do'kon nomi (Chek sarlavhasi)
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Do'kon sohasi / Izoh
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manzil (Chekda ko'rinadi)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefon raqam
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instagram sahifa
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telegram kanali / guruhi
              </label>
              <input
                type="text"
                value={formData.telegram}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chek qog'oz eni
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="paperWidth"
                    checked={formData.paperWidth === '80mm'}
                    onChange={() => setFormData({ ...formData, paperWidth: '80mm' })}
                  />
                  <span>80 mm (Standart)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="paperWidth"
                    checked={formData.paperWidth === '58mm'}
                    onChange={() => setFormData({ ...formData, paperWidth: '58mm' })}
                  />
                  <span>58 mm (Ixcham)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chek pastidagi minnatdorchilik yozuvi
              </label>
              <input
                type="text"
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              Sozlamalarni saqlash
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Custom Columns Builder */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Columns className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Qo'shimcha ustunlar (Custom Columns)
            </h2>
            <p className="text-[11px] text-slate-500">
              O'lcham, rang, hajm, yaroqlilik muddati kabi o'zingiz xohlagan ustunlarni boshqaring
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* List of existing custom fields */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-700">Mavjud ustunlar ro'yxati:</h4>
            {customFields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-900">{field.name}</span>
                  <span className="ml-2 text-[10px] text-slate-400 font-mono">({field.type})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCustomField(field.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new field form */}
          <form
            onSubmit={handleAddCustomField}
            className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
          >
            <h4 className="text-xs font-semibold text-slate-700">Yangi ustun qo'shish:</h4>
            <div>
              <input
                type="text"
                required
                placeholder="Ustun nomi (masalan: Mato turi, Kolleksiya)"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="text">Matn turi (Text)</option>
                <option value="number">Son turi (Number)</option>
                <option value="date">Sana turi (Date)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Ustunni qo'shish
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 3: Password & Security */}
      {currentUser && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Xavfsizlik va Parolni o'zgartirish ({currentUser.name})
            </h2>
          </div>

          {passwordNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
              {passwordNotice}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="max-w-md space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Yangi parol:
              </label>
              <input
                type="password"
                required
                placeholder="Yangi parolni kiriting"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
            >
              Parolni yangilash
            </button>
          </form>
        </div>
      )}

      {/* SECTION 4: Database Backup & Restore */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-5 h-5 text-slate-700" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Ma'lumotlar bazasi va Zaxira nusxa (Backup & Restore)
            </h2>
            <p className="text-[11px] text-slate-500">
              Tovarlar, savdolar va barcha hisobotlarni bitta JSON faylga saqlab oling yoki boshqa kompyuterga ko'chiring
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Zaxira nusxani yuklab olish</h4>
            <p className="text-[11px] text-slate-500">
              Barcha tovarlar, cheklar, sklad harakatlari va sozlamalarni zaxiralash.
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              Zaxira faylini yuklab olish (.json)
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Fayldan qayta tiklash</h4>
            <p className="text-[11px] text-slate-500">
              Avval saqlab olingan JSON nusxasidan barcha ma'lumotlarni tiklash.
            </p>
            <label className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Zaxira faylini tanlash</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
            <h4 className="text-xs font-bold text-rose-900">Standart holatga qaytarish</h4>
            <p className="text-[11px] text-rose-700">
              Barcha ma'lumotlarni tozalab, Dunyo Women Shop namunaviy bazasiga qaytaradi.
            </p>
            <button
              type="button"
              onClick={handleResetData}
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              Baza tozalash (Reset)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
