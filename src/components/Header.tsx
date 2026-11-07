import React from 'react';
import { 
  Activity, 
  Languages, 
  Moon, 
  Sun, 
  LogOut, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  Globe
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { SystemStatus } from '../types';

interface HeaderProps {
  status: SystemStatus | null;
  onReapplyAll: () => void;
  reapplying: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onReapplyAll,
  reapplying,
  theme,
  onToggleTheme,
}) => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 md:px-6 backdrop-blur-md">
      {/* Brand & Status Pill */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-md shadow-blue-500/20 ring-1 ring-white/20">
            <Zap className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">SMITE</span>
              <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 ring-1 ring-blue-500/30">
                v0.1.2
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              {language === 'fa' ? 'سامانه هوشمند تانل دوطرفه' : 'Next-Gen Tunnel Control Panel'}
            </p>
          </div>
        </div>

        {/* Live status indicators */}
        {status && (
          <div className="hidden lg:flex items-center gap-2 border-slate-800 ps-4">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{status.online_nodes}/{status.total_nodes} {t.dashboard.activeNodes}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 ring-1 ring-blue-500/20">
              <Activity className="h-3 w-3" />
              <span>{status.active_tunnels} {t.dashboard.activeTunnels}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Bulk Reapply Button */}
        <button
          onClick={onReapplyAll}
          disabled={reapplying}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30 transition hover:bg-blue-600/30 hover:text-white disabled:opacity-50"
          title={t.dashboard.reapplyAll}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${reapplying ? 'animate-spin' : ''}`} />
          <span>{reapplying ? '...' : t.dashboard.reapplyAll}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
          title="Switch Language / تغییر زبان"
        >
          <Languages className="h-4 w-4 text-cyan-400" />
          <span className="font-semibold">{language === 'fa' ? 'English' : 'فارسی'}</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={onToggleTheme}
          className="rounded-lg border border-slate-700 bg-slate-800/80 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-400" />}
        </button>

        {/* User / Logout */}
        <div className="flex items-center gap-2 border-s border-slate-800 ps-2 md:ps-3">
          <div className="hidden text-right text-xs md:block">
            <div className="font-semibold text-slate-200">{user?.username || 'admin'}</div>
            <div className="text-[10px] text-slate-400">Super Admin</div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
            title={t.nav.logout}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
