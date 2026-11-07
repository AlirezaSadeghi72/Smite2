import React, { useState } from 'react';
import {
  Radio,
  Server,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  FileCode,
  Shield,
  Activity,
  Cpu,
  HardDrive,
  Clock,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { NodeItem, NodeType } from '../types';
import { formatTraffic } from '../utils/formatTraffic';
import { generateNodeInstallCommand, generateDockerComposeForNode, generateMockCaCertificate } from '../utils/scriptGenerator';

interface NodesProps {
  nodes: NodeItem[];
  initialFilter?: 'all' | 'iran' | 'foreign';
  onAddNode: (node: Partial<NodeItem>) => Promise<void>;
  onDeleteNode: (id: string) => Promise<void>;
}

export const Nodes: React.FC<NodesProps> = ({
  nodes,
  initialFilter = 'all',
  onAddNode,
  onDeleteNode,
}) => {
  const { t, isRTL } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'iran' | 'foreign'>(initialFilter);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCaModal, setShowCaModal] = useState(false);
  const [caType, setCaType] = useState<'iran' | 'foreign'>('iran');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for new node
  const [name, setName] = useState('');
  const [nodeType, setNodeType] = useState<NodeType>('iran');
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('3080');
  const [saving, setSaving] = useState(false);

  const panelOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const filteredNodes = nodes.filter((n) => {
    if (filter === 'iran') return n.type === 'iran';
    if (filter === 'foreign') return n.type === 'foreign';
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ip.trim()) return;
    setSaving(true);
    try {
      await onAddNode({
        name: name.trim(),
        type: nodeType,
        ip: ip.trim(),
        port: parseInt(port, 10) || 3080,
      });
      setName('');
      setIp('');
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadCa = (type: 'iran' | 'foreign') => {
    const certText = generateMockCaCertificate(type);
    const blob = new Blob([certText], { type: 'application/x-x509-ca-cert' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'iran' ? 'ca.crt' : 'ca-server.crt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t.nodes.title}</span>
            <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              {nodes.length} Nodes
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">{t.nodes.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setCaType('iran');
              setShowCaModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>{t.nodes.viewCa}</span>
          </button>

          <button
            onClick={() => {
              setNodeType('iran');
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>{isRTL ? 'افزودن نود جدید' : 'Deploy New Node'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            filter === 'all'
              ? 'bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/40'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          {t.nodes.filterAll} ({nodes.length})
        </button>
        <button
          onClick={() => setFilter('iran')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            filter === 'iran'
              ? 'bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500/40'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          🇮🇷 {t.nodes.filterIran} ({nodes.filter((n) => n.type === 'iran').length})
        </button>
        <button
          onClick={() => setFilter('foreign')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            filter === 'foreign'
              ? 'bg-cyan-600/20 text-cyan-300 ring-1 ring-cyan-500/40'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          🌍 {t.nodes.filterForeign} ({nodes.filter((n) => n.type === 'foreign').length})
        </button>
      </div>

      {/* Nodes Cards Grid */}
      {filteredNodes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-400">
          <Radio className="mx-auto h-10 w-10 text-slate-600 mb-3" />
          <p className="text-sm font-medium">{t.nodes.emptyNodes}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNodes.map((node) => {
            const isIran = node.type === 'iran';
            const cmd = generateNodeInstallCommand({
              panelUrl: panelOrigin,
              nodeType: node.type,
              nodeName: node.name,
              fingerprint: node.fingerprint,
            });

            return (
              <div
                key={node.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-all hover:border-slate-700 hover:shadow-xl"
              >
                {/* Node Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isIran
                          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30'
                      }`}
                    >
                      {isIran ? <Radio className="h-5 w-5" /> : <Server className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-sm md:text-base">{node.name}</h3>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            isIran
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {isIran ? '🇮🇷 Iran Relay' : '🌍 Foreign Server'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-xs text-slate-400">
                        <span>{node.ip}</span>
                        <span>•</span>
                        <span>Port {node.port || 3080}</span>
                      </div>
                    </div>
                  </div>

                  {/* Node Status & Delete */}
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                    <button
                      onClick={() => onDeleteNode(node.id)}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                      title={t.nodes.deleteConfirm}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Fingerprint row */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-950/80 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono truncate">
                    <span className="text-[10px] text-slate-500 uppercase">{t.nodes.fingerprint}:</span>
                    <span className="truncate">{node.fingerprint}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(node.fingerprint, `fp-${node.id}`)}
                    className="shrink-0 p-1 text-slate-400 hover:text-white"
                    title="Copy Fingerprint"
                  >
                    {copiedId === `fp-${node.id}` ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Hardware & Resource Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-2.5">
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Cpu className="h-3 w-3 text-purple-400" />
                        CPU Load
                      </span>
                      <span className="font-semibold text-slate-200">{node.cpu_usage}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${Math.min(node.cpu_usage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-2.5">
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3 text-cyan-400" />
                        Memory
                      </span>
                      <span className="font-semibold text-slate-200">{node.memory_usage}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                        style={{ width: `${Math.min(node.memory_usage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer specs & traffic */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>{node.metadata?.os || 'Linux x86_64'}</span>
                    <span>•</span>
                    <span className="text-slate-300 font-semibold">{node.active_tunnels_count} Tunnels</span>
                  </div>
                  <div className="font-mono text-emerald-400 font-semibold">
                    {formatTraffic(node.traffic_in + node.traffic_out)}
                  </div>
                </div>

                {/* Quick install command preview */}
                <div className="mt-3 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => handleCopy(cmd, `cmd-${node.id}`)}
                    className="w-full flex items-center justify-between rounded-lg bg-slate-950/60 hover:bg-slate-950 px-2.5 py-1.5 text-[11px] font-mono text-slate-300 transition"
                  >
                    <span className="truncate">{cmd}</span>
                    <span className="shrink-0 ms-2 text-[10px] text-blue-400 flex items-center gap-1">
                      {copiedId === `cmd-${node.id}` ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>{t.nodes.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>{t.nodes.copyCommand}</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              {isRTL ? 'تعریف و راه‌اندازی نود جدید' : 'Deploy New Node'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {isRTL
                ? 'مشخصات سرور را وارد کنید تا دستور نصب خودکار برای شما تولید شود.'
                : 'Enter server details to generate the one-line deployment script.'}
            </p>

            <form onSubmit={handleCreateNode} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isRTL ? 'نقش نود در شبکه' : 'Node Role'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNodeType('iran')}
                    className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold transition border ${
                      nodeType === 'iran'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400'
                    }`}
                  >
                    <Radio className="h-4 w-4" />
                    <span>🇮🇷 Iran Node (Relay)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNodeType('foreign')}
                    className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold transition border ${
                      nodeType === 'foreign'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400'
                    }`}
                  >
                    <Server className="h-4 w-4" />
                    <span>🌍 Foreign Server (Exit)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRTL ? 'نام نود' : 'Node Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={nodeType === 'iran' ? 'IR-Tehran-MCI-01' : 'EU-Frankfurt-01'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isRTL ? 'آدرس IP نود' : 'Node Public IP'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="185.143.232.45"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white font-mono placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isRTL ? 'پورت' : 'Port'}
                  </label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Install script preview */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>{t.nodes.installScript}</span>
                  <span className="text-[10px] text-emerald-400">One-Line Bash Command</span>
                </div>
                <div className="rounded-lg bg-slate-900 p-2 font-mono text-[11px] text-slate-300 break-all select-all">
                  {generateNodeInstallCommand({
                    panelUrl: panelOrigin,
                    nodeType,
                    nodeName: name || 'smite-node-1',
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  {t.tunnels.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? '...' : isRTL ? 'ثبت نود' : 'Register Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CA Certificate Modal */}
      {showCaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                <span>{t.settings.certificates}</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCaType('iran')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    caType === 'iran' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Iran CA (ca.crt)
                </button>
                <button
                  onClick={() => setCaType('foreign')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    caType === 'foreign' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Foreign CA (ca-server.crt)
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {isRTL
                ? 'این گواهی امنیتی برای احراز هویت TLS میان نودها و پنل Smite استفاده می‌شود.'
                : 'Mutual TLS certificate used for cryptographic authentication between edge nodes and Smite panel.'}
            </p>

            <div className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto whitespace-pre">
              {generateMockCaCertificate(caType)}
            </div>

            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleDownloadCa(caType)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                <Download className="h-4 w-4" />
                <span>{t.nodes.downloadCa}</span>
              </button>

              <button
                onClick={() => setShowCaModal(false)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
