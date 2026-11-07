import React, { useState } from 'react';
import {
  Activity,
  RotateCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  HardDrive,
  Clock,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CoreHealthItem, CoreType } from '../types';
import { formatUptime } from '../utils/formatTraffic';

interface CoreHealthProps {
  coreHealths: CoreHealthItem[];
  onRestartCore: (core: CoreType) => Promise<void>;
  onUpdateResetConfig: (core: CoreType, enabled: boolean, interval: number) => Promise<void>;
}

export const CoreHealth: React.FC<CoreHealthProps> = ({
  coreHealths,
  onRestartCore,
  onUpdateResetConfig,
}) => {
  const { t, isRTL } = useLanguage();
  const [restartingCore, setRestartingCore] = useState<string | null>(null);

  const handleRestart = async (core: CoreType) => {
    setRestartingCore(core);
    try {
      await onRestartCore(core);
    } finally {
      setTimeout(() => setRestartingCore(null), 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t.coreHealth.title}</span>
            <span className="rounded-lg bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-400 border border-teal-500/20">
              5 Core Engines
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">{t.coreHealth.subtitle}</p>
        </div>
      </div>

      {/* Overview Notice */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/30 to-indigo-950/20 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">
              {isRTL ? 'دیده‌بان سلامت هسته‌ها (Core Watchdog)' : 'Automated Tunnel Core Watchdog'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {isRTL
                ? 'پنل Smite به صورت مداوم پروسه‌های Backhaul, Rathole, GOST, Chisel و FRP را مانیتور کرده و در صورت افت کارایی یا رسیدن به زمان‌بندی انتخابی، آنها را بدون قطعی ریستارت می‌کند.'
                : 'Smite monitors memory, CPU, and connection responsiveness across all 5 engines with scheduled warm resets to prevent connection freezes.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Core Engines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {coreHealths.map((core) => {
          const isRestarting = restartingCore === core.core;

          return (
            <div
              key={core.core}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-all hover:border-slate-700 hover:shadow-xl space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-100 uppercase">{core.core}</h3>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {t.coreHealth.healthy}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{core.name}</p>
                </div>

                <button
                  onClick={() => handleRestart(core.core)}
                  disabled={isRestarting}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
                  title={t.coreHealth.restartNow}
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isRestarting ? 'animate-spin text-blue-400' : ''}`} />
                  <span>{isRestarting ? t.coreHealth.restarting : t.coreHealth.restartNow}</span>
                </button>
              </div>

              {/* Resource Bars */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Cpu className="h-3 w-3 text-purple-400" />
                      CPU
                    </span>
                    <span className="font-semibold text-slate-200">{core.cpu_percent}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${Math.min(core.cpu_percent * 10, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3 text-cyan-400" />
                      RAM
                    </span>
                    <span className="font-semibold text-slate-200">{core.memory_mb} MB</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-500"
                      style={{ width: `${Math.min((core.memory_mb / 256) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Meta stats */}
              <div className="space-y-1.5 rounded-xl bg-slate-950/60 p-3 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.coreHealth.version}:</span>
                  <span className="font-mono text-emerald-400">{core.installed_version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.coreHealth.uptime}:</span>
                  <span className="font-mono text-slate-200">{formatUptime(core.uptime_seconds)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.coreHealth.instances}:</span>
                  <span className="font-semibold text-slate-200">{core.active_instances} active</span>
                </div>
              </div>

              {/* Watchdog / Auto-Reset Controls */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={core.auto_reset_enabled}
                      onChange={(e) =>
                        onUpdateResetConfig(core.core, e.target.checked, core.auto_reset_interval_min)
                      }
                      className="rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs font-semibold text-slate-200">{t.coreHealth.autoReset}</span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {core.auto_reset_enabled ? 'Active' : 'Off'}
                  </span>
                </div>

                {core.auto_reset_enabled && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">{t.coreHealth.resetInterval}:</span>
                    <select
                      value={core.auto_reset_interval_min}
                      onChange={(e) =>
                        onUpdateResetConfig(core.core, core.auto_reset_enabled, parseInt(e.target.value, 10))
                      }
                      className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="15">15 mins</option>
                      <option value="30">30 mins</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="360">6 hours</option>
                      <option value="720">12 hours</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
