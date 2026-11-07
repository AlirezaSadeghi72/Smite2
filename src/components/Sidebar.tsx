import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Server,
  Network,
  Activity,
  FileText,
  BookOpen,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type NavTab = 'dashboard' | 'nodes' | 'servers' | 'tunnels' | 'coreHealth' | 'logs' | 'guide' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  counts: {
    iranNodes: number;
    foreignNodes: number;
    activeTunnels: number;
    healthyCores: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, counts }) => {
  const { t, isRTL } = useLanguage();

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: t.nav.dashboard,
      icon: LayoutDashboard,
      badge: null,
      color: 'text-blue-400',
    },
    {
      id: 'nodes' as NavTab,
      label: t.nav.nodes,
      icon: Radio,
      badge: counts.iranNodes > 0 ? String(counts.iranNodes) : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      color: 'text-emerald-400',
    },
    {
      id: 'servers' as NavTab,
      label: t.nav.servers,
      icon: Server,
      badge: counts.foreignNodes > 0 ? String(counts.foreignNodes) : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      color: 'text-cyan-400',
    },
    {
      id: 'tunnels' as NavTab,
      label: t.nav.tunnels,
      icon: Network,
      badge: counts.activeTunnels > 0 ? String(counts.activeTunnels) : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      color: 'text-indigo-400',
    },
    {
      id: 'coreHealth' as NavTab,
      label: t.nav.coreHealth,
      icon: Activity,
      badge: `${counts.healthyCores}/5`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      color: 'text-teal-400',
    },
    {
      id: 'logs' as NavTab,
      label: t.nav.logs,
      icon: FileText,
      badge: null,
      color: 'text-amber-400',
    },
    {
      id: 'guide' as NavTab,
      label: t.nav.guide,
      icon: BookOpen,
      badge: null,
      color: 'text-sky-400',
    },
    {
      id: 'settings' as NavTab,
      label: t.nav.settings,
      icon: Sliders,
      badge: null,
      color: 'text-purple-400',
    },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-e border-slate-800 bg-slate-900/60 p-3 md:p-4">
      <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`group flex items-center justify-between whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-1 ring-blue-400/40'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`h-4 w-4 md:h-5 md:w-5 transition-colors ${
                    isActive ? 'text-white' : item.color
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`hidden md:inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                    isActive ? 'border-white/30 bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini Node Connectivity Card on sidebar footer */}
      <div className="hidden md:block mt-8 rounded-xl border border-slate-800/90 bg-gradient-to-br from-slate-900/90 to-slate-950/80 p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-300">
            {isRTL ? 'معماری دوطرفه' : 'Dual-Node Mesh'}
          </span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {isRTL
            ? 'نودهای ایران (سرور تانل) به سرورهای خارج (کلاینت تانل) متصل و ترافیک از طریق معکوس هدایت می‌شود.'
            : 'Iran nodes host reverse tunnels while Foreign clients dial in securely.'}
        </p>
      </div>
    </aside>
  );
};
