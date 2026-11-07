import React, { useState } from 'react';
import {
  Sliders,
  Send,
  Download,
  Key,
  Shield,
  Languages,
  Moon,
  Sun,
  CheckCircle2,
  AlertCircle,
  Save,
  Server,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  onSaveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  onTestTelegram: (botToken: string, chatId: string) => Promise<boolean>;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onSaveSettings,
  onTestTelegram,
  theme,
  onToggleTheme,
}) => {
  const { language, setLanguage, t, isRTL } = useLanguage();

  const [serverName, setServerName] = useState(settings.server_name);
  const [panelPort, setPanelPort] = useState(String(settings.panel_port || 3000));
  const [botToken, setBotToken] = useState(settings.telegram_bot_token || '');
  const [chatId, setChatId] = useState(settings.telegram_chat_id || '');
  const [telegramEnabled, setTelegramEnabled] = useState(settings.telegram_notifications_enabled);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(settings.auto_backup_enabled);
  const [testingTg, setTestingTg] = useState(false);
  const [tgFeedback, setTgFeedback] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTestTg = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTgFeedback('Please provide both Bot Token and Chat ID.');
      return;
    }
    setTestingTg(true);
    setTgFeedback(null);
    try {
      const ok = await onTestTelegram(botToken, chatId);
      if (ok) {
        setTgFeedback(t.settings.telegramSuccess);
      } else {
        setTgFeedback('Failed to reach Telegram bot. Check token and chat ID.');
      }
    } catch {
      setTgFeedback('Error sending message to Telegram.');
    } finally {
      setTestingTg(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/settings/backup';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings({
        server_name: serverName,
        panel_port: parseInt(panelPort, 10) || 3000,
        telegram_bot_token: botToken,
        telegram_chat_id: chatId,
        telegram_notifications_enabled: telegramEnabled,
        auto_backup_enabled: autoBackupEnabled,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>{t.settings.title}</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-0.5">{t.settings.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Telegram Bot Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">{t.settings.telegramBot}</h3>
                <p className="text-xs text-slate-400">{t.settings.telegramDesc}</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className="text-xs font-semibold text-slate-300">Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.settings.botToken}</label>
              <input
                type="text"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.settings.chatId}</label>
              <input
                type="text"
                placeholder="123456789 or @mychannel"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestTg}
              disabled={testingTg}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            >
              <Send className={`h-3.5 w-3.5 text-blue-400 ${testingTg ? 'animate-bounce' : ''}`} />
              <span>{testingTg ? t.settings.testSending : t.settings.testTelegram}</span>
            </button>

            {tgFeedback && (
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {tgFeedback}
              </span>
            )}
          </div>
        </div>

        {/* Database Backup Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">{t.settings.autoBackup}</h3>
                <p className="text-xs text-slate-400">{t.settings.autoBackupDesc}</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoBackupEnabled}
                onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className="text-xs font-semibold text-slate-300">Daily Backup</span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Export full database (Nodes, Tunnels, Cores) to JSON:</span>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600/20 px-3.5 py-2 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 hover:text-white transition"
            >
              <Download className="h-4 w-4" />
              <span>{t.settings.downloadBackup}</span>
            </button>
          </div>
        </div>

        {/* System & Identity Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Panel Configuration</h3>
              <p className="text-xs text-slate-400">Core server identity and web port</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Server Name</label>
              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Panel Web Port</label>
              <input
                type="number"
                value={panelPort}
                onChange={(e) => setPanelPort(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">{t.settings.language} & {t.settings.theme}</h3>
              <p className="text-xs text-slate-400">Display language and visual style</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.settings.language}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('fa')}
                  className={`rounded-xl border p-2 text-xs font-bold transition ${
                    language === 'fa'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  فارسی (Persian)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`rounded-xl border p-2 text-xs font-bold transition ${
                    language === 'en'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.settings.theme}</label>
              <button
                type="button"
                onClick={onToggleTheme}
                className="w-full flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-200"
              >
                <span>{theme === 'dark' ? 'Dark Mode (Active)' : 'Light Mode (Active)'}</span>
                {theme === 'dark' ? <Moon className="h-4 w-4 text-blue-400" /> : <Sun className="h-4 w-4 text-amber-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              {t.settings.saveSuccess}
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? '...' : t.settings.saveSettings}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
