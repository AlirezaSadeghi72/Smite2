import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Filter,
  RefreshCw,
  Trash2,
  Download,
  Search,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LogEntry } from '../types';

interface LogsProps {
  logs: LogEntry[];
  onRefresh: () => Promise<void>;
  onClear: () => void;
}

export const Logs: React.FC<LogsProps> = ({ logs, onRefresh, onClear }) => {
  const { t, isRTL } = useLanguage();
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleExport = () => {
    const content = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source.toUpperCase()}] ${l.message}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smite-logs-${new Date().toISOString().substring(0, 10)}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter((log) => {
    if (levelFilter !== 'all' && log.level !== levelFilter) return false;
    if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.source.toLowerCase().includes(q) ||
        (log.tunnel_name && log.tunnel_name.toLowerCase().includes(q)) ||
        (log.node_name && log.node_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t.logs.title}</span>
            <span className="rounded-lg bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
              {logs.length} Records
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">{t.logs.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>{t.logs.exportLogs}</span>
          </button>

          <button
            onClick={onClear}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{t.logs.clear}</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">{t.logs.allLevels}</option>
            <option value="info">INFO</option>
            <option value="warn">WARN</option>
            <option value="error">ERROR</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none uppercase"
          >
            <option value="all">{t.logs.allSources}</option>
            <option value="system">System</option>
            <option value="backhaul">Backhaul</option>
            <option value="rathole">Rathole</option>
            <option value="gost">GOST</option>
            <option value="chisel">Chisel</option>
            <option value="frp">FRP</option>
            <option value="node">Node</option>
            <option value="api">API</option>
          </select>

          {/* Auto-scroll toggle */}
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer ps-2">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-slate-700 text-blue-600 focus:ring-0"
            />
            <span>{t.logs.autoScroll}</span>
          </label>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder={isRTL ? 'جستجو در لاگ‌ها...' : 'Search logs...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Terminal Output Viewer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ms-2 font-mono text-xs text-slate-400">smite-daemon.log</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Live Stream</span>
        </div>

        {/* Terminal Log Items */}
        <div className="p-4 font-mono text-xs max-h-[550px] overflow-y-auto space-y-2 select-text">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 text-center py-12">{t.logs.noLogs}</div>
          ) : (
            filteredLogs.map((log) => {
              const levelColor = {
                info: 'text-emerald-400',
                warn: 'text-amber-400',
                error: 'text-red-400',
                debug: 'text-purple-400',
              }[log.level] || 'text-slate-400';

              const sourceColor = {
                system: 'text-blue-400',
                backhaul: 'text-indigo-400',
                rathole: 'text-teal-400',
                gost: 'text-purple-400',
                chisel: 'text-cyan-400',
                frp: 'text-amber-400',
                node: 'text-emerald-400',
                api: 'text-rose-400',
              }[log.source] || 'text-slate-400';

              return (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-slate-900/50 p-1 rounded">
                  <span className="text-slate-500 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`font-bold shrink-0 ${levelColor}`}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className={`font-semibold shrink-0 uppercase ${sourceColor}`}>
                    [{log.source}]
                  </span>
                  <span className="text-slate-200 break-all">{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};
