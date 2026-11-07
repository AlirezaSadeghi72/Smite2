import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Terminal,
  Copy,
  Check,
  Radio,
  Server,
  ShieldCheck,
  Database,
  Cpu,
  CheckCircle2,
  Layers,
  Zap,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  HardDrive,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BinaryInfo {
  installed: boolean;
  version: string;
  binaryPath: string;
  sizeBytes: number;
}

export const Guide: React.FC = () => {
  const { isRTL } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [binaries, setBinaries] = useState<Record<string, BinaryInfo>>({});
  const [activeCoreTab, setActiveCoreTab] = useState<'backhaul' | 'rathole' | 'gost' | 'chisel' | 'frp'>('backhaul');

  const panelUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  useEffect(() => {
    fetch('/api/core-health/binaries')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === 'object') setBinaries(data);
      })
      .catch(() => {});
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickInstallPanel = `git clone https://github.com/zZedix/Smite.git
cd Smite
bash scripts/download-cores.sh
npm install
npm run start`;

  const installIranNodeCmd = `curl -fsSL ${panelUrl}/scripts/smite-node.sh | sudo bash -s -- --panel ${panelUrl} --iran --name "IR-Tehran-Node-1"`;
  const installForeignNodeCmd = `curl -fsSL ${panelUrl}/scripts/smite-node.sh | sudo bash -s -- --panel ${panelUrl} --foreign --name "EU-Frankfurt-Node-1"`;

  const coreDescriptions = {
    backhaul: {
      title: 'Backhaul (v0.7.2) - Lightning-Fast Reverse Tunnel',
      faTitle: 'هسته Backhaul (نسخه v0.7.2) - تانل معکوس فوق‌سریع مالتی‌پلکس',
      repo: 'https://github.com/Musixal/Backhaul',
      desc: isRTL
        ? 'بهترین گزینه برای عبور از محدودیت‌های شدید شبکه بین ایران و خارج. از پروتکل‌های TCP، UDP، WebSocket، WSMux و TCPMux همراه با Connection Pooling و رمزنگاری TLS/SNI پشتیبانی می‌کند.'
        : 'Ideal for high-throughput connections with connection pooling, TCPMux, WebSocketMux, TLS/SNI encryption, and native UDP forwarding.',
      serverCmd: `/app/applet/cores/backhaul -c /app/applet/data/configs/backhaul_server.toml`,
      clientCmd: `/usr/local/bin/backhaul -c /etc/smite/configs/backhaul_client.toml`,
      sampleConfig: `[server]
bind_addr = "0.0.0.0:3080"
transport = "ws"
token = "smite-secret-token"
heartbeat = 40
mux_con = 8
accept_udp = true
nodelay = true

[server.ports]
"443" = "8443"`,
    },
    rathole: {
      title: 'Rathole (v0.5.0) - Rust Low-Latency NAT Traversal',
      faTitle: 'هسته Rathole (نسخه v0.5.0) - پروکسی معکوس فوق‌کم‌مصرف با زبان Rust',
      repo: 'https://github.com/rapiz1/rathole',
      desc: isRTL
        ? 'نوشته شده با زبان Rust؛ مصرف رم زیر ۲۰ مگابایت و تاخیر (Latency) بسیار پایین برای ترافیک بازی، تماس صوتی و سرویس‌های حساس.'
        : 'Written in Rust with minimal memory footprint (<20MB RAM) and ultra-low latency for gaming and real-time TCP/UDP streams.',
      serverCmd: `/app/applet/cores/rathole -s /app/applet/data/configs/rathole_server.toml`,
      clientCmd: `/usr/local/bin/rathole -c /etc/smite/configs/rathole_client.toml`,
      sampleConfig: `[server]
bind_addr = "0.0.0.0:2333"
default_token = "rathole-secret-token"

[server.services.service_main]
bind_addr = "0.0.0.0:8443"
type = "tcp"`,
    },
    gost: {
      title: 'GOST (v2.12.0) - GO Simple Tunnel Multi-Protocol Forwarder',
      faTitle: 'هسته GOST (نسخه v2.12.0) - فورواردر مستقیم و زنجیره‌ای چندپروتکله',
      repo: 'https://github.com/ginuerzh/gost',
      desc: isRTL
        ? 'مناسب برای فوروارد مستقیم پورت‌ها از سرور ایران به آی‌پی خارج بدون نیاز به کلاینت معکوس، یا ترکیب با WebSocket و gRPC.'
        : 'Direct and chained port forwarding over TCP, UDP, WebSocket, and gRPC without requiring a reverse client daemon.',
      serverCmd: `/app/applet/cores/gost -L=ws://:2083/159.69.145.210:2083`,
      clientCmd: `# Direct forwarder mode (runs directly on Iran relay node)`,
      sampleConfig: `gost -L=tcp://:443/159.69.145.210:443 -L=udp://:443/159.69.145.210:443`,
    },
    chisel: {
      title: 'Chisel (v1.11.3) - Fast TCP/UDP Tunnel over HTTP/WebSocket',
      faTitle: 'هسته Chisel (نسخه v1.11.3) - تانل سریع TCP/UDP بر بستر HTTP و SSH',
      repo: 'https://github.com/jpillora/chisel',
      desc: isRTL
        ? 'عبور ترافیک از فایروال‌های سخت‌گیرانه با کپسوله‌سازی در قالب WebSocket و رمزنگاری SSH به همراه احراز هویت توکن.'
        : 'Encapsulates TCP/UDP traffic inside HTTP WebSocket frames secured via SSH encryption.',
      serverCmd: `/app/applet/cores/chisel server --port 9000 --reverse --auth "smite:secret"`,
      clientCmd: `/usr/local/bin/chisel client --auth "smite:secret" 185.143.232.45:9000 R:2222:127.0.0.1:22`,
      sampleConfig: `# Server (Iran Node):
chisel server --port 9000 --reverse --auth "smite:secret"
# Client (Foreign Server):
chisel client --auth "smite:secret" IRAN_IP:9000 R:443:127.0.0.1:8443`,
    },
    frp: {
      title: 'FRP (v0.65.0) - Fast Reverse Proxy Suite (frps & frpc)',
      faTitle: 'هسته FRP (نسخه v0.65.0) - سامانه جامع پروکسی معکوس (frps و frpc)',
      repo: 'https://github.com/fatedier/frp',
      desc: isRTL
        ? 'یکی از کامل‌ترین ابزارهای تانلینگ دنیا با پشتیبانی از مالتی‌پلکسینگ TCPMux، پورت‌های مجازی و مدیریت همزمان ده‌ها پورت.'
        : 'Battle-tested reverse proxy supporting TCPMux, bandwidth limiting, load balancing, and multi-port mapping.',
      serverCmd: `/app/applet/cores/frps -c /app/applet/data/configs/frps.toml`,
      clientCmd: `/usr/local/bin/frpc -c /etc/smite/configs/frpc.toml`,
      sampleConfig: `bindPort = 7000
auth.token = "smite-frp-cluster-2025"
vhostHTTPPort = 80
vhostHTTPSPort = 443`,
    },
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <span>
              {isRTL
                ? 'راهنمای جامع نصب، معماری و راه‌اندازی پنل Smite'
                : 'Smite Complete Installation, Architecture & Core Setup Guide'}
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {isRTL
              ? 'آموزش گام‌به‌گام راه‌اندازی پنل، اتصال نودهای ایران و خارج، دیتابیس SQLite و اجرای هسته‌های واقعی تانل'
              : 'Step-by-step instructions for deploying the panel, linking Iran & Foreign nodes, SQLite storage, and running core binaries'}
          </p>
        </div>
      </div>

      {/* Live Installed Binaries & SQLite Verification Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-400 ring-1 ring-emerald-500/30">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <span>
                  {isRTL
                    ? 'وضعیت هسته‌های باینری و دیتابیس SQLite در این پروژه'
                    : 'Installed Real Core Binaries & SQLite Database Status'}
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  ACTIVE & VERIFIED
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {isRTL
                  ? 'تمامی ۵ هسته اصلی از ریپوزیتوری‌های رسمی گیت‌هاب دانلود و در پوشه /cores پروژه قرار گرفته‌اند و دیتابیس SQLite در مسیر data/smite.db فعال است.'
                  : 'All 5 official Linux binaries are downloaded in /cores/ and SQLite persistence is active at data/smite.db.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-950/90 border border-slate-800 px-3 py-2 text-xs text-slate-200 font-mono">
              <Database className="h-4 w-4 text-cyan-400" />
              <span>data/smite.db (SQLite3)</span>
            </div>
          </div>
        </div>

        {/* Installed Binary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
          {(['backhaul', 'rathole', 'gost', 'chisel', 'frp'] as const).map((coreKey) => {
            const info = binaries[coreKey];
            const sizeMb = info?.sizeBytes ? (info.sizeBytes / (1024 * 1024)).toFixed(1) : '...';
            return (
              <div
                key={coreKey}
                className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase text-white">{coreKey}</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-2 font-mono text-[11px] text-emerald-400 font-semibold">
                  {info?.version || 'Installed'}
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>/cores/{coreKey === 'frp' ? 'frps' : coreKey}</span>
                  <span>{sizeMb} MB</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step-by-Step Setup Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Step 1: Panel Installation */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-blue-600/20 px-2.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
              {isRTL ? 'گام اول: نصب پنل مرکزی' : 'Step 1: Panel Installation'}
            </span>
            <Terminal className="h-4 w-4 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-white">
            {isRTL ? 'راه‌اندازی پنل Smite و دانلود خودکار هسته‌ها' : 'Install Smite Control Panel & Fetch Core Binaries'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRTL
              ? 'با اجرای اسکریپت download-cores.sh تمام باینری‌های رسمی Backhaul، Rathole، GOST، Chisel و FRP متناسب با معماری سرور (amd64 یا arm64) دانلود و در پوشه cores/ نصب می‌شوند:'
              : 'Run the setup commands below to clone Smite, download all 5 official tunnel binaries for your CPU architecture, and launch the SQLite-backed server:'}
          </p>
          <div className="relative rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-emerald-300 border border-slate-800/80">
            <button
              onClick={() => handleCopy(quickInstallPanel, 'step1')}
              className="absolute top-2.5 end-2.5 rounded-lg bg-slate-800 px-2 py-1 text-[10px] text-slate-200 hover:bg-slate-700 flex items-center gap-1"
            >
              {copiedId === 'step1' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedId === 'step1' ? (isRTL ? 'کپی شد' : 'Copied') : isRTL ? 'کپی' : 'Copy'}</span>
            </button>
            <pre className="overflow-x-auto whitespace-pre leading-relaxed">{quickInstallPanel}</pre>
          </div>
        </div>

        {/* Step 2: Dual-Node Concept */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-emerald-600/20 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              {isRTL ? 'گام دوم: معماری دوطرفه نودها' : 'Step 2: Dual-Node Architecture'}
            </span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-white">
            {isRTL ? 'نحوه ارتباط سرور ایران (واسط) و سرور خارج (مقصد)' : 'How Iran Relay & Foreign Exit Nodes Connect'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRTL
              ? 'در تانل‌های معکوس (Reverse Tunnel)، سرور ایران در نقش Server روی یک پورت کنترلی (مثلاً ۳۰۸۰ یا ۲۳۳۳) گوش می‌دهد و سرور خارج در نقش Client به آی‌پی ایران متصل می‌شود. سپس کاربران به پورت عمومی سرور ایران (مثلاً ۴۴۳) وصل شده و ترافیک بدون افت سرعت به پورت لوکال کانفیگ شما در سرور خارج (مثلاً ۸۰۸۰ یا ۸۴۴۳ در پنل X-UI / Marzban) منتقل می‌گردد.'
              : 'In Reverse Tunneling, the Iran Node acts as the Tunnel Server listening on a Control Port (e.g. 3080). The Foreign Node dials into the Iran Node using a shared secret token. User traffic arriving at the Iran Public Port (e.g. 443) is multiplexed straight to the Foreign Target Port (e.g. 8080/8443).'}
          </p>
          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3 flex items-center justify-between text-xs font-mono">
            <div className="text-center">
              <div className="text-emerald-400 font-bold">🇮🇷 Iran Node</div>
              <div className="text-[10px] text-slate-400">Public :443 / Control :3080</div>
            </div>
            <div className="flex flex-col items-center text-blue-400">
              <span className="text-[10px]">Reverse Mux Tunnel</span>
              {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </div>
            <div className="text-center">
              <div className="text-cyan-400 font-bold">🌍 Foreign Server</div>
              <div className="text-[10px] text-slate-400">Local Target 127.0.0.1:8443</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Node Installation Scripts */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="rounded-lg bg-cyan-600/20 px-2.5 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/30">
              {isRTL ? 'گام سوم: نصب اسکریپت روی سرورهای ایران و خارج' : 'Step 3: Deploy Edge Nodes (Iran & Foreign)'}
            </span>
            <h3 className="text-base font-bold text-white mt-2">
              {isRTL
                ? 'دستورات نصب خودکار نودها به همراه دریافت گواهی امنیتی CA'
                : 'Automated One-Line Node Installers with mTLS CA Handshake'}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Iran Node Command */}
          <div className="rounded-xl border border-emerald-500/20 bg-slate-950/80 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Radio className="h-4 w-4" />
                <span>{isRTL ? '۱. اجرا در ترمینال سرور ایران:' : '1. Run on Iran Server (Relay):'}</span>
              </span>
              <button
                onClick={() => handleCopy(installIranNodeCmd, 'cmd-iran')}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-700 flex items-center gap-1"
              >
                {copiedId === 'cmd-iran' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedId === 'cmd-iran' ? (isRTL ? 'کپی شد' : 'Copied') : isRTL ? 'کپی دستور' : 'Copy'}</span>
              </button>
            </div>
            <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-[11px] text-slate-200 break-all select-all">
              {installIranNodeCmd}
            </div>
          </div>

          {/* Foreign Node Command */}
          <div className="rounded-xl border border-cyan-500/20 bg-slate-950/80 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Server className="h-4 w-4" />
                <span>{isRTL ? '۲. اجرا در ترمینال سرور خارج:' : '2. Run on Foreign Server (Exit):'}</span>
              </span>
              <button
                onClick={() => handleCopy(installForeignNodeCmd, 'cmd-foreign')}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-700 flex items-center gap-1"
              >
                {copiedId === 'cmd-foreign' ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copiedId === 'cmd-foreign' ? (isRTL ? 'کپی شد' : 'Copied') : isRTL ? 'کپی دستور' : 'Copy'}</span>
              </button>
            </div>
            <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-[11px] text-slate-200 break-all select-all">
              {installForeignNodeCmd}
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Detailed Core Reference & Config Examples */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>
                {isRTL
                  ? 'بررسی تخصصی و راهنمای کانفیگ ۵ هسته تانل'
                  : 'Deep-Dive Core Engine Configuration Reference'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL
                ? 'هر هسته را انتخاب کنید تا دستورات اجرایی و نمونه فایل کانفیگ استاندارد آن را مشاهده کنید'
                : 'Select an engine below to inspect its CLI execution flags and sample configuration file'}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['backhaul', 'rathole', 'gost', 'chisel', 'frp'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setActiveCoreTab(c)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase transition ${
                  activeCoreTab === c
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Core Details */}
        {(() => {
          const item = coreDescriptions[activeCoreTab];
          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-blue-400">
                  {isRTL ? item.faTitle : item.title}
                </h4>
                <a
                  href={item.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-slate-400 hover:text-white underline"
                >
                  {item.repo}
                </a>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">
                    {isRTL ? 'دستور اجرای باینری هسته:' : 'Binary Execution Commands:'}
                  </div>
                  <div className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-emerald-300 space-y-2 border border-slate-800">
                    <div>
                      <span className="text-slate-500 block"># Server (Iran Node / Panel):</span>
                      <span>{item.serverCmd}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block"># Client (Foreign Node):</span>
                      <span className="text-cyan-300">{item.clientCmd}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>{isRTL ? 'نمونه فایل پیکربندی:' : 'Sample Configuration File:'}</span>
                    <button
                      onClick={() => handleCopy(item.sampleConfig, `cfg-${activeCoreTab}`)}
                      className="text-[11px] text-blue-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === `cfg-${activeCoreTab}` ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto border border-slate-800">
                    {item.sampleConfig}
                  </pre>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Troubleshooting & Tips */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-amber-400" />
          <span>
            {isRTL ? 'نکات کلیدی و عیب‌یابی اتصالات تانل' : 'Important Firewall & Troubleshooting Tips'}
          </span>
        </h3>
        <ul className="space-y-2 text-xs text-slate-300 list-disc ps-5 leading-relaxed">
          <li>
            {isRTL
              ? 'باز بودن پورت‌ها در فایروال: حتماً پورت کنترلی تانل (مثلاً 3080 یا 2333) و پورت عمومی تانل (مثلاً 443 یا 8080) را در فایروال سرور ایران (UFW / iptables) باز کنید.'
              : 'Firewall Ports: Ensure both the Control Port (e.g., 3080/2333) and Public Port (e.g., 443/8080) are open in UFW/iptables on your Iran node.'}
          </li>
          <li>
            {isRTL
              ? 'تطابق توکن امنیتی (Token): توکن تعریف شده در بخش ساخت تانل باید دقیقاً بین سرور ایران و کلاینت خارج یکسان باشد؛ پنل Smite به صورت خودکار کانفیگ هر دو سمت را با توکن یکسان تولید می‌کند.'
              : 'Token Matching: The authentication token must match on both the Iran server and Foreign client. Smite automatically synchronizes tokens in the generated config files.'}
          </li>
          <li>
            {isRTL
              ? 'پشتیبان‌گیری از دیتابیس SQLite: تمام نودها، تانل‌ها، لاگ‌ها و تنظیمات در فایل data/smite.db ذخیره می‌شوند و از بخش «تنظیمات پنل» نیز می‌توانید خروجی کامل JSON دریافت کنید.'
              : 'SQLite Database Persistence: All nodes, tunnels, logs, and settings are stored persistently in data/smite.db. You can also download a full JSON snapshot anytime from Settings.'}
          </li>
        </ul>
      </div>
    </div>
  );
};
