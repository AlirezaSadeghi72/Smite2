import React, { useState } from 'react';
import {
  Network,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit2,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Download,
  RefreshCw,
  Shield,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TunnelItem, NodeItem, CoreType, TunnelTransport, TunnelSpec } from '../types';
import { formatTraffic, formatRate } from '../utils/formatTraffic';
import { generateConfigForTunnel } from '../utils/configGenerator';

interface TunnelsProps {
  tunnels: TunnelItem[];
  nodes: NodeItem[];
  onCreateTunnel: (tunnel: Partial<TunnelItem>) => Promise<void>;
  onUpdateTunnel: (id: string, tunnel: Partial<TunnelItem>) => Promise<void>;
  onDeleteTunnel: (id: string) => Promise<void>;
  onApplyTunnel: (id: string) => Promise<void>;
  onReapplyAll: () => Promise<void>;
  reapplying: boolean;
}

export const Tunnels: React.FC<TunnelsProps> = ({
  tunnels,
  nodes,
  onCreateTunnel,
  onUpdateTunnel,
  onDeleteTunnel,
  onApplyTunnel,
  onReapplyAll,
  reapplying,
}) => {
  const { t, isRTL } = useLanguage();
  const [filterCore, setFilterCore] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTunnel, setEditingTunnel] = useState<TunnelItem | null>(null);
  const [inspectConfigTunnel, setInspectConfigTunnel] = useState<TunnelItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [core, setCore] = useState<CoreType>('backhaul');
  const [transport, setTransport] = useState<TunnelTransport>('ws');
  const [iranNodeId, setIranNodeId] = useState(nodes.find((n) => n.type === 'iran')?.id || '');
  const [foreignNodeId, setForeignNodeId] = useState(nodes.find((n) => n.type === 'foreign')?.id || '');
  const [publicPort, setPublicPort] = useState('443');
  const [controlPort, setControlPort] = useState('3080');
  const [targetHost, setTargetHost] = useState('127.0.0.1');
  const [targetPort, setTargetPort] = useState('8080');
  const [token, setToken] = useState('smite-token-sec-2025');
  const [acceptUdp, setAcceptUdp] = useState(true);
  const [tlsEnabled, setTlsEnabled] = useState(true);
  const [quotaMb, setQuotaMb] = useState('0');
  const [activeTabModal, setActiveTabModal] = useState<'settings' | 'preview'>('settings');

  const iranNodes = nodes.filter((n) => n.type === 'iran');
  const foreignNodes = nodes.filter((n) => n.type === 'foreign');

  const filteredTunnels = tunnels.filter((tun) => {
    if (filterCore !== 'all' && tun.core !== filterCore) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tun.name.toLowerCase().includes(q) ||
        String(tun.spec.public_port).includes(q) ||
        String(tun.spec.target_port).includes(q)
      );
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingTunnel(null);
    setName('');
    setCore('backhaul');
    setTransport('ws');
    setIranNodeId(iranNodes[0]?.id || '');
    setForeignNodeId(foreignNodes[0]?.id || '');
    setPublicPort('443');
    setControlPort('3080');
    setTargetHost('127.0.0.1');
    setTargetPort('8080');
    setToken(`smite-${Math.random().toString(36).substring(2, 10)}`);
    setAcceptUdp(true);
    setTlsEnabled(true);
    setQuotaMb('0');
    setActiveTabModal('settings');
    setShowModal(true);
  };

  const handleOpenEdit = (tun: TunnelItem) => {
    setEditingTunnel(tun);
    setName(tun.name);
    setCore(tun.core);
    setTransport(tun.spec.transport);
    setIranNodeId(tun.iran_node_id || tun.node_id);
    setForeignNodeId(tun.foreign_node_id || '');
    setPublicPort(String(tun.spec.public_port));
    setControlPort(String(tun.spec.control_port || 3080));
    setTargetHost(tun.spec.target_host);
    setTargetPort(String(tun.spec.target_port));
    setToken(tun.spec.token || '');
    setAcceptUdp(Boolean(tun.spec.accept_udp));
    setTlsEnabled(Boolean(tun.spec.tls_enabled));
    setQuotaMb(String(tun.quota_mb || 0));
    setActiveTabModal('settings');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const spec: TunnelSpec = {
      transport,
      control_port: parseInt(controlPort, 10) || 3080,
      public_port: parseInt(publicPort, 10) || 443,
      listen_ip: '0.0.0.0',
      public_host: '0.0.0.0',
      remote_addr: `${iranNodes.find((n) => n.id === iranNodeId)?.ip || '185.143.232.45'}:${controlPort || 3080}`,
      target_host: targetHost.trim() || '127.0.0.1',
      target_port: parseInt(targetPort, 10) || 8080,
      token,
      accept_udp: acceptUdp,
      tls_enabled: tlsEnabled,
      mux_con: 8,
      heartbeat: 40,
    };

    if (editingTunnel) {
      await onUpdateTunnel(editingTunnel.id, {
        name,
        core,
        type: core === 'gost' ? 'forward' : 'reverse',
        node_id: iranNodeId || nodes[0]?.id,
        iran_node_id: iranNodeId,
        foreign_node_id: foreignNodeId,
        spec,
        quota_mb: parseFloat(quotaMb) || 0,
      });
    } else {
      await onCreateTunnel({
        name,
        core,
        type: core === 'gost' ? 'forward' : 'reverse',
        node_id: iranNodeId || nodes[0]?.id,
        iran_node_id: iranNodeId,
        foreign_node_id: foreignNodeId,
        spec,
        quota_mb: parseFloat(quotaMb) || 0,
      });
    }
    setShowModal(false);
  };

  const handleApply = async (id: string) => {
    setApplyingId(id);
    try {
      await onApplyTunnel(id);
    } finally {
      setApplyingId(null);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const previewConfig = generateConfigForTunnel({
    core,
    spec: {
      transport,
      control_port: parseInt(controlPort, 10) || 3080,
      public_port: parseInt(publicPort, 10) || 443,
      listen_ip: '0.0.0.0',
      public_host: '0.0.0.0',
      remote_addr: `${iranNodes.find((n) => n.id === iranNodeId)?.ip || '185.143.232.45'}:${controlPort || 3080}`,
      target_host: targetHost.trim() || '127.0.0.1',
      target_port: parseInt(targetPort, 10) || 8080,
      token,
      accept_udp: acceptUdp,
      tls_enabled: tlsEnabled,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t.tunnels.title}</span>
            <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              {tunnels.length} Tunnels
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">{t.tunnels.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onReapplyAll}
            disabled={reapplying}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${reapplying ? 'animate-spin' : ''}`} />
            <span>{t.dashboard.reapplyAll}</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>{t.tunnels.createTunnel}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* Core Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'backhaul', 'rathole', 'gost', 'chisel', 'frp'].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCore(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase transition ${
                filterCore === c
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {c === 'all' ? (isRTL ? 'همه هسته‌ها' : 'All Cores') : c}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder={isRTL ? 'جستجوی تانل یا پورت...' : 'Search tunnel or port...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tunnel Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTunnels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-400">
            <Network className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <p className="text-sm font-medium">
              {isRTL ? 'هیچ تانلی یافت نشد. تانل جدیدی اضافه کنید.' : 'No tunnels found matching current filter.'}
            </p>
          </div>
        ) : (
          filteredTunnels.map((tun) => {
            const isIranNode = nodes.find((n) => n.id === tun.iran_node_id);
            const isForeignNode = nodes.find((n) => n.id === tun.foreign_node_id);

            // Core styling
            const coreBadgeStyle = {
              backhaul: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
              rathole: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
              gost: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
              chisel: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
              frp: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            }[tun.core] || 'bg-blue-500/10 text-blue-400 border-blue-500/30';

            return (
              <div
                key={tun.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-all hover:border-slate-700 hover:shadow-xl"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info & Badges */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-100 text-base">{tun.name}</h3>
                      <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase ${coreBadgeStyle}`}>
                        {tun.core}
                      </span>
                      <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-mono uppercase text-slate-300">
                        {tun.spec.transport}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {t.tunnels.statusActive}
                      </span>
                      <span className="text-[10px] text-slate-500">rev.{tun.revision}</span>
                    </div>

                    {/* Routing Path */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
                      <div className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-2.5 py-1">
                        <span className="text-emerald-400 font-bold">Public :{tun.spec.public_port}</span>
                        <span className="text-slate-500">({isIranNode?.name || 'Iran Node'})</span>
                      </div>

                      <div className="flex items-center text-slate-500">
                        {isRTL ? <ArrowLeft className="h-4 w-4 text-blue-400" /> : <ArrowRight className="h-4 w-4 text-blue-400" />}
                      </div>

                      <div className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-2.5 py-1">
                        <span className="text-cyan-400 font-bold">Target {tun.spec.target_host}:{tun.spec.target_port}</span>
                        <span className="text-slate-500">({isForeignNode?.name || 'Foreign Exit'})</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleApply(tun.id)}
                      disabled={applyingId === tun.id}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 hover:text-white transition disabled:opacity-50"
                      title={t.tunnels.applyConfig}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${applyingId === tun.id ? 'animate-spin' : ''}`} />
                      <span>{t.tunnels.applyConfig}</span>
                    </button>

                    <button
                      onClick={() => setInspectConfigTunnel(tun)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                      title={t.tunnels.viewConfig}
                    >
                      <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{t.tunnels.viewConfig}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(tun)}
                      className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                      title={t.tunnels.editTunnel}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteTunnel(tun.id)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition"
                      title={t.tunnels.deleteConfirm}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer quota & flags */}
                <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>
                      {tun.quota_mb > 0
                        ? `${formatTraffic(tun.used_mb * 1024 * 1024)} / ${formatTraffic(tun.quota_mb * 1024 * 1024)}`
                        : `${formatTraffic(tun.used_mb * 1024 * 1024)} (Unlimited)`}
                    </span>
                    {tun.spec.tls_enabled && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Shield className="h-3 w-3" />
                        TLS Active
                      </span>
                    )}
                    {tun.spec.accept_udp && <span className="text-blue-400">UDP Forwarded</span>}
                  </div>

                  <div className="font-mono text-slate-300">
                    Live Rate: {formatRate((tun.current_rate_in || 0) + (tun.current_rate_out || 0))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Tunnel Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Network className="h-5 w-5 text-blue-400" />
                <span>{editingTunnel ? t.tunnels.modalTitleEdit : t.tunnels.modalTitleCreate}</span>
              </h3>

              {/* Tab Switcher inside Modal */}
              <div className="flex items-center gap-1 rounded-lg bg-slate-950 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTabModal('settings')}
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${
                    activeTabModal === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Parameters
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabModal('preview')}
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${
                    activeTabModal === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Config Preview
                </button>
              </div>
            </div>

            {activeTabModal === 'settings' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tunnel Name & Core */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tunnel Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Backhaul-Tehran-FRA-443"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tunnel Core Engine</label>
                    <select
                      value={core}
                      onChange={(e) => setCore(e.target.value as CoreType)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="backhaul">Backhaul (Recommended - High Performance Mux)</option>
                      <option value="rathole">Rathole (Rust Low-Latency NAT Traversal)</option>
                      <option value="gost">GOST (Direct Multi-Protocol Forwarder)</option>
                      <option value="chisel">Chisel (Pure TCP/UDP via WebSocket)</option>
                      <option value="frp">FRP (Fast Reverse Proxy Multi-Service)</option>
                    </select>
                  </div>
                </div>

                {/* Node Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">🇮🇷 Iran Relay Node</label>
                    <select
                      value={iranNodeId}
                      onChange={(e) => setIranNodeId(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                      {iranNodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.ip})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">🌍 Foreign Target Node</label>
                    <select
                      value={foreignNodeId}
                      onChange={(e) => setForeignNodeId(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                      {foreignNodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.ip})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Transport and Ports */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Transport</label>
                    <select
                      value={transport}
                      onChange={(e) => setTransport(e.target.value as TunnelTransport)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none uppercase"
                    >
                      <option value="ws">WebSocket (ws)</option>
                      <option value="tcp">TCP</option>
                      <option value="tcpmux">TCPMux</option>
                      <option value="wsmux">WSMux</option>
                      <option value="grpc">gRPC</option>
                      <option value="udp">UDP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Control Port</label>
                    <input
                      type="number"
                      value={controlPort}
                      onChange={(e) => setControlPort(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Public Port</label>
                    <input
                      type="number"
                      required
                      value={publicPort}
                      onChange={(e) => setPublicPort(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Target Port</label>
                    <input
                      type="number"
                      required
                      value={targetPort}
                      onChange={(e) => setTargetPort(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Target Host and Token */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Target Host / Internal IP</label>
                    <input
                      type="text"
                      value={targetHost}
                      onChange={(e) => setTargetHost(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tunnel Auth Token</label>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tlsEnabled}
                      onChange={(e) => setTlsEnabled(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs font-medium text-slate-200">{t.tunnels.tlsEnable}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptUdp}
                      onChange={(e) => setAcceptUdp(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs font-medium text-slate-200">{t.tunnels.udpEnable}</span>
                  </label>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    {t.tunnels.cancel}
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500"
                  >
                    {t.tunnels.save}
                  </button>
                </div>
              </form>
            ) : (
              /* Config Preview Tab */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                    <span>Server Config ({previewConfig.serverFilename})</span>
                    <button
                      onClick={() => handleCopy(previewConfig.serverConfig, 'prev-srv')}
                      className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-white"
                    >
                      {copiedKey === 'prev-srv' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre">
                    {previewConfig.serverConfig}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                    <span>Client Config ({previewConfig.clientFilename})</span>
                    <button
                      onClick={() => handleCopy(previewConfig.clientConfig, 'prev-cli')}
                      className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-white"
                    >
                      {copiedKey === 'prev-cli' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre">
                    {previewConfig.clientConfig}
                  </pre>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTabModal('settings')}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    Back to Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inspect Config Modal for existing tunnel */}
      {inspectConfigTunnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode className="h-5 w-5 text-cyan-400" />
                <span>Config: {inspectConfigTunnel.name}</span>
              </h3>
              <span className="rounded bg-blue-600/20 px-2 py-0.5 text-xs font-bold uppercase text-blue-400">
                {inspectConfigTunnel.core}
              </span>
            </div>

            {(() => {
              const cfg = generateConfigForTunnel(inspectConfigTunnel);
              return (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span>Server Config ({cfg.serverFilename})</span>
                      <button
                        onClick={() => handleCopy(cfg.serverConfig, 'insp-srv')}
                        className="text-xs text-blue-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'insp-srv' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        Copy
                      </button>
                    </div>
                    <pre className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre">
                      {cfg.serverConfig}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span>Client Config ({cfg.clientFilename})</span>
                      <button
                        onClick={() => handleCopy(cfg.clientConfig, 'insp-cli')}
                        className="text-xs text-blue-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'insp-cli' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        Copy
                      </button>
                    </div>
                    <pre className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre">
                      {cfg.clientConfig}
                    </pre>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setInspectConfigTunnel(null)}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
