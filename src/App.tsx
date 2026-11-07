import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Nodes } from './pages/Nodes';
import { Tunnels } from './pages/Tunnels';
import { CoreHealth } from './pages/CoreHealth';
import { Logs } from './pages/Logs';
import { Guide } from './pages/Guide';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import {
  NodeItem,
  TunnelItem,
  CoreHealthItem,
  LogEntry,
  SystemStatus,
  AppSettings,
  CoreType,
} from './types';

function MainLayout() {
  const { isAuthenticated, loading } = useAuth();
  const { t, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as NavTab;
    return ['dashboard', 'nodes', 'servers', 'tunnels', 'coreHealth', 'logs', 'guide', 'settings'].includes(tabParam)
      ? tabParam
      : 'dashboard';
  });

  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [tunnels, setTunnels] = useState<TunnelItem[]>([]);
  const [coreHealths, setCoreHealths] = useState<CoreHealthItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    panel_port: 3000,
    server_name: 'Smite-Tehran-Control-1',
    secret_key: 'smite-jwt-key',
    telegram_bot_token: '',
    telegram_chat_id: '',
    telegram_notifications_enabled: false,
    auto_backup_enabled: true,
    auto_backup_cron: '0 3 * * *',
    metrics_retention_days: 30,
    log_level: 'info',
    theme: 'dark',
    language: 'fa',
  });

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [reapplying, setReapplying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync tab with URL
  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  // Fetch initial data
  const loadData = async () => {
    try {
      const [resStatus, resNodes, resTunnels, resCores, resLogs, resSettings] = await Promise.all([
        fetch('/api/status').then((r) => r.json()).catch(() => null),
        fetch('/api/nodes').then((r) => r.json()).catch(() => []),
        fetch('/api/tunnels').then((r) => r.json()).catch(() => []),
        fetch('/api/core-health/health').then((r) => r.json()).catch(() => []),
        fetch('/api/logs').then((r) => r.json()).catch(() => []),
        fetch('/api/settings').then((r) => r.json()).catch(() => null),
      ]);

      if (resStatus) setStatus(resStatus);
      if (Array.isArray(resNodes)) setNodes(resNodes);
      if (Array.isArray(resTunnels)) setTunnels(resTunnels);
      if (Array.isArray(resCores)) setCoreHealths(resCores);
      if (Array.isArray(resLogs)) setLogs(resLogs);
      if (resSettings) setSettings(resSettings);
    } catch (err) {
      console.error('Error loading initial data', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(loadData, 8000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Bulk Reapply All Tunnels
  const handleReapplyAll = async () => {
    setReapplying(true);
    try {
      const res = await fetch('/api/tunnels/reapply-all', { method: 'POST' });
      if (res.ok) {
        showToast(t.dashboard.reapplySuccess);
        loadData();
      }
    } finally {
      setTimeout(() => setReapplying(false), 600);
    }
  };

  // Node actions
  const handleAddNode = async (nodeData: Partial<NodeItem>) => {
    const res = await fetch('/api/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nodeData),
    });
    if (res.ok) {
      showToast(isRTL ? 'نود جدید با موفقیت ثبت شد' : 'New node deployed successfully');
      loadData();
    }
  };

  const handleDeleteNode = async (id: string) => {
    const res = await fetch(`/api/nodes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast(isRTL ? 'نود حذف شد' : 'Node removed');
      loadData();
    }
  };

  // Tunnel actions
  const handleCreateTunnel = async (tunnelData: Partial<TunnelItem>) => {
    const res = await fetch('/api/tunnels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tunnelData),
    });
    if (res.ok) {
      showToast(isRTL ? 'تانل جدید ایجاد و فعال شد' : 'New tunnel created and activated');
      loadData();
    }
  };

  const handleUpdateTunnel = async (id: string, tunnelData: Partial<TunnelItem>) => {
    const res = await fetch(`/api/tunnels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tunnelData),
    });
    if (res.ok) {
      showToast(isRTL ? 'تنظیمات تانل به‌روزرسانی شد' : 'Tunnel updated successfully');
      loadData();
    }
  };

  const handleDeleteTunnel = async (id: string) => {
    const res = await fetch(`/api/tunnels/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast(isRTL ? 'تانل با موفقیت حذف شد' : 'Tunnel removed');
      loadData();
    }
  };

  const handleApplyTunnel = async (id: string) => {
    const res = await fetch(`/api/tunnels/${id}/apply`, { method: 'POST' });
    if (res.ok) {
      showToast(isRTL ? 'کانفیگ روی نودها اعمال شد' : 'Configuration synchronized with nodes');
      loadData();
    }
  };

  // Core actions
  const handleRestartCore = async (core: CoreType) => {
    const res = await fetch(`/api/core-health/reset/${core}`, { method: 'POST' });
    if (res.ok) {
      showToast(`${core.toUpperCase()} core restarted`);
      loadData();
    }
  };

  const handleUpdateResetConfig = async (core: CoreType, enabled: boolean, interval: number) => {
    await fetch(`/api/core-health/reset-config/${core}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, interval_minutes: interval }),
    });
    loadData();
  };

  // Settings
  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    if (res.ok) {
      showToast(t.settings.saveSuccess);
      loadData();
    }
  };

  const handleTestTelegram = async (botToken: string, chatId: string) => {
    const res = await fetch('/api/settings/telegram/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot_token: botToken, chat_id: chatId }),
    });
    return res.ok;
  };

  const handleClearLogs = async () => {
    await fetch('/api/logs', { method: 'DELETE' }).catch(() => {});
    setLogs([]);
    showToast(isRTL ? 'لاگ‌ها از دیتابیس SQLite پاک شدند' : 'Logs cleared from SQLite');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-semibold">Starting Smite Control Panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const iranNodesCount = nodes.filter((n) => n.type === 'iran').length;
  const foreignNodesCount = nodes.filter((n) => n.type === 'foreign').length;
  const activeTunnelsCount = tunnels.filter((t) => t.status === 'active').length;
  const healthyCoresCount = coreHealths.filter((c) => c.status === 'healthy').length;

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 end-5 z-50 flex items-center gap-2 rounded-2xl border border-blue-500/40 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-fade-in">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        status={status}
        onReapplyAll={handleReapplyAll}
        reapplying={reapplying}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          counts={{
            iranNodes: iranNodesCount,
            foreignNodes: foreignNodesCount,
            activeTunnels: activeTunnelsCount,
            healthyCores: healthyCoresCount,
          }}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              status={status}
              nodes={nodes}
              tunnels={tunnels}
              coreHealths={coreHealths}
              onNavigate={handleSelectTab}
              onOpenCreateTunnel={() => handleSelectTab('tunnels')}
              onOpenAddNode={(type) => handleSelectTab(type === 'iran' ? 'nodes' : 'servers')}
              onReapplyAll={handleReapplyAll}
              reapplying={reapplying}
            />
          )}

          {activeTab === 'nodes' && (
            <Nodes
              nodes={nodes}
              initialFilter="iran"
              onAddNode={handleAddNode}
              onDeleteNode={handleDeleteNode}
            />
          )}

          {activeTab === 'servers' && (
            <Nodes
              nodes={nodes}
              initialFilter="foreign"
              onAddNode={handleAddNode}
              onDeleteNode={handleDeleteNode}
            />
          )}

          {activeTab === 'tunnels' && (
            <Tunnels
              tunnels={tunnels}
              nodes={nodes}
              onCreateTunnel={handleCreateTunnel}
              onUpdateTunnel={handleUpdateTunnel}
              onDeleteTunnel={handleDeleteTunnel}
              onApplyTunnel={handleApplyTunnel}
              onReapplyAll={handleReapplyAll}
              reapplying={reapplying}
            />
          )}

          {activeTab === 'coreHealth' && (
            <CoreHealth
              coreHealths={coreHealths}
              onRestartCore={handleRestartCore}
              onUpdateResetConfig={handleUpdateResetConfig}
            />
          )}

          {activeTab === 'logs' && (
            <Logs logs={logs} onRefresh={loadData} onClear={handleClearLogs} />
          )}

          {activeTab === 'guide' && <Guide />}

          {activeTab === 'settings' && (
            <Settings
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onTestTelegram={handleTestTelegram}
              theme={theme}
              onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}
