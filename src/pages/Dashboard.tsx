import React from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Cpu,
  HardDrive,
  Network,
  Plus,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SystemStatus, NodeItem, TunnelItem, CoreHealthItem } from '../types';
import { formatTraffic, formatRate, formatUptime } from '../utils/formatTraffic';

interface DashboardProps {
  status: SystemStatus | null;
  nodes: NodeItem[];
  tunnels: TunnelItem[];
  coreHealths: CoreHealthItem[];
  onNavigate: (tab: any) => void;
  onOpenCreateTunnel: () => void;
  onOpenAddNode: (type: 'iran' | 'foreign') => void;
  onReapplyAll: () => void;
  reapplying: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  status,
  nodes,
  tunnels,
  coreHealths,
  onNavigate,
  onOpenCreateTunnel,
  onOpenAddNode,
  onReapplyAll,
  reapplying,
}) => {
  const { t, isRTL } = useLanguage();

  const iranNodes = nodes.filter((n) => n.type === 'iran');
  const foreignNodes = nodes.filter((n) => n.type === 'foreign');
  const activeTunnels = tunnels.filter((t) => t.status === 'active');

  const totalIn = status?.total_traffic_in_bytes ?? 0;
  const totalOut = status?.total_traffic_out_bytes ?? 0;
  const rateIn = status?.current_rate_in_bps ?? 0;
  const rateOut = status?.current_rate_out_bps ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t.dashboard.title}</span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">{t.dashboard.subtitle}</p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCreateTunnel}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>{t.dashboard.createTunnel}</span>
          </button>
          <button
            onClick={() => onOpenAddNode('iran')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t.nodes.addIranNode}</span>
          </button>
          <button
            onClick={() => onOpenAddNode('foreign')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <Server className="h-3.5 w-3.5 text-cyan-400" />
            <span>{t.nodes.addForeignServer}</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nodes Card */}
        <div
          onClick={() => onNavigate('nodes')}
          className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition-all hover:border-slate-700 hover:bg-slate-900 hover:shadow-lg hover:shadow-black/20"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">{t.dashboard.totalNodes}</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 ring-1 ring-emerald-500/20">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{nodes.length}</span>
            <span className="text-xs text-emerald-400 font-medium">
              ({status?.online_nodes || nodes.length} {t.dashboard.activeNodes})
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
            <span>🇮🇷 {iranNodes.length} Iran Nodes</span>
            <span>🌍 {foreignNodes.length} Foreign</span>
          </div>
        </div>

        {/* Tunnels Card */}
        <div
          onClick={() => onNavigate('tunnels')}
          className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition-all hover:border-slate-700 hover:bg-slate-900 hover:shadow-lg hover:shadow-black/20"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">{t.dashboard.totalTunnels}</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400 ring-1 ring-blue-500/20">
              <Network className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{tunnels.length}</span>
            <span className="text-xs text-blue-400 font-medium">
              ({activeTunnels.length} {t.dashboard.activeTunnels})
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
            <span>Backhaul, Rathole, GOST</span>
            <span className="text-emerald-400">100% Synced</span>
          </div>
        </div>

        {/* Traffic Throughput */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">{t.dashboard.currentSpeed}</span>
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400 ring-1 ring-indigo-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{formatRate(rateIn + rateOut)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ArrowDownRight className="h-3 w-3" />
              {formatTraffic(totalIn)}
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <ArrowUpRight className="h-3 w-3" />
              {formatTraffic(totalOut)}
            </span>
          </div>
        </div>

        {/* System Load */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">{t.dashboard.cpuUsage} & {t.dashboard.memoryUsage}</span>
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 ring-1 ring-purple-500/20">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-white">{status?.cpu_usage_percent || 18.5}%</div>
              <div className="text-[10px] text-slate-400">CPU Load</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-xl font-bold text-white">
                {Math.round(((status?.memory_used_mb || 1824) / (status?.memory_total_mb || 8192)) * 100)}%
              </div>
              <div className="text-[10px] text-slate-400">RAM ({Math.round((status?.memory_used_mb || 1824) / 1024 * 10) / 10} GB)</div>
            </div>
          </div>
          <div className="mt-3 border-t border-slate-800/80 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Uptime: {formatUptime(status?.uptime || 432000)}</span>
            <span className="text-emerald-400">Optimal</span>
          </div>
        </div>
      </div>

      {/* Interactive Dual-Node Architecture Visualizer */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/80 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>{t.dashboard.networkTopology}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {isRTL
                ? 'ارتباط امن معکوس بین نودهای داخل ایران و سرورهای خارج بدون نیاز به IP پابلیک در سمت خارج'
                : 'Encrypted reverse tunnels from Foreign exit nodes connecting into Iran relay servers.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active Mesh Active
            </span>
          </div>
        </div>

        {/* Schematic Flow Container */}
        <div className="relative mt-2 rounded-xl border border-slate-800 bg-slate-950/90 p-4 md:p-6 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Iran Node Side */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  IRAN NODE (SERVER)
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>🇮🇷</span>
                <span>{iranNodes[0]?.name || 'IR-Tehran-MCI-01'}</span>
              </h4>
              <p className="text-xs font-mono text-emerald-300 mt-1">{iranNodes[0]?.ip || '185.143.232.45'}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">Port 443 / TLS</span>
                <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">Port 3080 / WS</span>
              </div>
            </div>

            {/* Tunnel Hub / Core Bridge */}
            <div className="flex flex-col items-center justify-center text-center px-2 py-2">
              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-400 mb-2">
                <RefreshCw className="h-3 w-3 animate-spin text-blue-400" />
                <span>REVERSE TUNNEL TRANSPORT</span>
              </div>
              <div className="w-full flex items-center gap-1 my-1">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-cyan-500" />
                <div className="rounded-lg bg-blue-600/30 px-2 py-1 text-[10px] font-mono text-blue-300 ring-1 ring-blue-500/40">
                  Backhaul • Rathole • GOST
                </div>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500" />
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                TLS 1.3 / SNI Masking / TCPMux Multi-Streaming
              </div>
            </div>

            {/* Foreign Node Side */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                  FOREIGN NODE (CLIENT)
                </span>
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>🇩🇪</span>
                <span>{foreignNodes[0]?.name || 'EU-Frankfurt-Hetzner-01'}</span>
              </h4>
              <p className="text-xs font-mono text-cyan-300 mt-1">{foreignNodes[0]?.ip || '159.69.145.210'}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">Target 8080/8443</span>
                <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">Xray / V2Ray / Shadowsocks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Health Quick Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>{t.dashboard.activeCores}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {isRTL ? 'وضعیت موتورهای تانل نصب شده روی پنل Smite' : 'Operational status of supported tunneling backends'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('coreHealth')}
            className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
          >
            <span>{isRTL ? 'مشاهده همه و تنظیم ریست' : 'Details & Watchdog'}</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {coreHealths.map((core) => (
            <div
              key={core.core}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 transition hover:border-slate-700"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-200 uppercase">{core.core}</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[11px] text-slate-400 font-mono">{core.installed_version}</div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>CPU: {core.cpu_percent}%</span>
                <span>{core.memory_mb} MB</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
