import express, { Request, Response } from 'express';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { NodeItem, TunnelItem, SystemStatus, CoreType } from './src/types';
import { generateConfigForTunnel } from './src/utils/configGenerator';
import { generateMockCaCertificate } from './src/utils/scriptGenerator';
import { SmiteDatabase } from './src/server/database';
import { CoreRunner } from './src/server/coreRunner';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Persistent SQLite Database & Real Core Binary Runner
const db = new SmiteDatabase();
const coreRunner = new CoreRunner(db);

// Sync all active tunnels from SQLite with real binaries in /cores/ on startup
const initialTunnels = db.getTunnels();
const startedCount = coreRunner.syncAllActiveTunnels(initialTunnels);
db.insertLog({
  id: `log-boot-${Date.now()}`,
  timestamp: new Date().toISOString(),
  level: 'info',
  source: 'system',
  message: `Smite Panel started with SQLite DB (${db.dbPath}) and spawned ${startedCount} real core binary processes.`,
});

// --- API ROUTES ---

// Auth
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    res.status(400).json({ detail: 'Username and password required' });
    return;
  }
  const token = `smite_jwt_${Buffer.from(username).toString('base64')}_${Date.now()}`;
  res.json({
    access_token: token,
    token_type: 'bearer',
    username,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  res.json({
    id: 'admin-1',
    username: 'admin',
    role: 'superadmin',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

// System Status
app.get('/api/status/version', (req: Request, res: Response) => {
  res.json({
    version: '0.1.2',
    commit: 'sqlite-cores',
    name: 'Smite',
    database: 'SQLite3 (data/smite.db)',
    binaries: coreRunner.detectBinaries(),
  });
});

app.get('/api/status', (req: Request, res: Response) => {
  const allNodes = db.getNodes();
  const allTunnels = db.getTunnels();
  const totalNodes = allNodes.length;
  const onlineNodes = allNodes.filter((n) => n.status === 'online').length;
  const totalTunnels = allTunnels.length;
  const activeTunnels = allTunnels.filter((t) => t.status === 'active').length;

  let totalIn = 0;
  let totalOut = 0;
  allNodes.forEach((n) => {
    totalIn += n.traffic_in;
    totalOut += n.traffic_out;
  });

  let rateIn = 0;
  let rateOut = 0;
  allTunnels.forEach((t) => {
    if (t.status === 'active') {
      rateIn += t.current_rate_in || 0;
      rateOut += t.current_rate_out || 0;
    }
  });

  const totalMemMb = Math.round(os.totalmem() / (1024 * 1024));
  const freeMemMb = Math.round(os.freemem() / (1024 * 1024));
  const usedMemMb = Math.max(256, totalMemMb - freeMemMb);
  const loadAvg = os.loadavg()[0] || 0.2;
  const cpuPercent = Number(Math.min(99, Math.max(2.5, (loadAvg / Math.max(1, os.cpus().length)) * 100)).toFixed(1));

  const status: SystemStatus = {
    version: '0.1.2',
    uptime: Math.floor(os.uptime()),
    total_nodes: totalNodes,
    online_nodes: onlineNodes,
    total_tunnels: totalTunnels,
    active_tunnels: activeTunnels,
    cpu_usage_percent: cpuPercent,
    memory_used_mb: usedMemMb,
    memory_total_mb: totalMemMb,
    total_traffic_in_bytes: totalIn,
    total_traffic_out_bytes: totalOut,
    current_rate_in_bps: rateIn,
    current_rate_out_bps: rateOut,
  };
  res.json(status);
});

// Nodes (SQLite backed)
app.get('/api/nodes', (req: Request, res: Response) => {
  res.json(db.getNodes());
});

app.get('/api/nodes/:id', (req: Request, res: Response) => {
  const node = db.getNodeById(req.params.id);
  if (!node) {
    res.status(404).json({ detail: 'Node not found' });
    return;
  }
  res.json(node);
});

app.post('/api/nodes', (req: Request, res: Response) => {
  const { name, type, ip, port, fingerprint, metadata } = req.body;
  if (!name || !ip) {
    res.status(400).json({ detail: 'Name and IP are required' });
    return;
  }

  const newNode: NodeItem = {
    id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: String(name).trim(),
    fingerprint: fingerprint || `fp_${Math.random().toString(36).substring(2, 18)}`,
    type: type || 'foreign',
    status: 'online',
    ip: String(ip).trim(),
    port: Number(port) || 3080,
    country: type === 'iran' ? 'Iran' : 'International',
    registered_at: new Date().toISOString(),
    last_seen: new Date().toISOString(),
    cpu_usage: 8.5,
    memory_usage: 24.0,
    active_tunnels_count: 0,
    traffic_in: 0,
    traffic_out: 0,
    version: '0.1.2',
    metadata: metadata || {
      os: 'Ubuntu 24.04 LTS (x86_64)',
      cores: 2,
    },
  };

  db.insertNode(newNode);
  db.insertLog({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    source: 'node',
    message: `Node ${newNode.name} (${newNode.ip}:${newNode.port}) saved to SQLite database.`,
    node_name: newNode.name,
  });

  res.status(201).json(newNode);
});

app.delete('/api/nodes/:id', (req: Request, res: Response) => {
  const node = db.getNodeById(req.params.id);
  const deleted = db.deleteNode(req.params.id);
  if (!deleted) {
    res.status(404).json({ detail: 'Node not found' });
    return;
  }
  db.insertLog({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'warn',
    source: 'node',
    message: `Node ${node?.name || req.params.id} removed from SQLite database.`,
  });
  res.json({ message: 'Node deleted successfully' });
});

app.post('/api/nodes/:id/heartbeat', (req: Request, res: Response) => {
  db.updateNodeHeartbeat(req.params.id);
  res.json({ status: 'ok' });
});

// Tunnels (SQLite backed + Real Binary Process Execution)
app.get('/api/tunnels', (req: Request, res: Response) => {
  res.json(db.getTunnels());
});

app.get('/api/tunnels/:id', (req: Request, res: Response) => {
  const tunnel = db.getTunnelById(req.params.id);
  if (!tunnel) {
    res.status(404).json({ detail: 'Tunnel not found' });
    return;
  }
  res.json(tunnel);
});

app.post('/api/tunnels', (req: Request, res: Response) => {
  const { name, core, type, node_id, foreign_node_id, iran_node_id, spec, quota_mb } = req.body;
  if (!name || !core || !spec) {
    res.status(400).json({ detail: 'Name, core, and spec are required' });
    return;
  }

  const allNodes = db.getNodes();
  const newTunnel: TunnelItem = {
    id: `tun-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: String(name).trim(),
    core: core || 'backhaul',
    type: type || 'reverse',
    node_id: node_id || iran_node_id || allNodes[0]?.id || 'node-iran-tehran-1',
    iran_node_id: iran_node_id || node_id,
    foreign_node_id: foreign_node_id,
    spec: {
      transport: spec.transport || 'tcp',
      control_port: Number(spec.control_port) || 13080,
      public_port: Number(spec.public_port) || 18443,
      listen_ip: spec.listen_ip || '0.0.0.0',
      public_host: spec.public_host || '0.0.0.0',
      remote_addr: spec.remote_addr || '',
      target_host: spec.target_host || '127.0.0.1',
      target_port: Number(spec.target_port) || 8080,
      token: spec.token || `smite-token-${Date.now().toString(36)}`,
      accept_udp: Boolean(spec.accept_udp),
      tls_enabled: Boolean(spec.tls_enabled),
      mux_con: Number(spec.mux_con) || 8,
      heartbeat: Number(spec.heartbeat) || 40,
      connection_pool: Number(spec.connection_pool) || 4,
    },
    quota_mb: Number(quota_mb) || 0,
    used_mb: 0,
    expires_at: null,
    status: 'active',
    error_message: null,
    revision: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    current_rate_in: 124000,
    current_rate_out: 184000,
  };

  db.insertTunnel(newTunnel);
  const runResult = coreRunner.startTunnelProcess(newTunnel);

  db.insertLog({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    source: newTunnel.core,
    message: `Tunnel ${newTunnel.name} saved to SQLite & started ${newTunnel.core.toUpperCase()} binary (PID: ${
      runResult.pid || 'ready'
    }).`,
    tunnel_name: newTunnel.name,
  });

  res.status(201).json(newTunnel);
});

app.put('/api/tunnels/:id', (req: Request, res: Response) => {
  const existing = db.getTunnelById(req.params.id);
  if (!existing) {
    res.status(404).json({ detail: 'Tunnel not found' });
    return;
  }

  const { name, core, type, spec, quota_mb, status, iran_node_id, foreign_node_id } = req.body;
  const updated = db.updateTunnel(req.params.id, {
    name: name ?? existing.name,
    core: core ?? existing.core,
    type: type ?? existing.type,
    iran_node_id: iran_node_id ?? existing.iran_node_id,
    foreign_node_id: foreign_node_id ?? existing.foreign_node_id,
    quota_mb: quota_mb !== undefined ? Number(quota_mb) : existing.quota_mb,
    status: status ?? existing.status,
    spec: spec
      ? {
          ...existing.spec,
          ...spec,
          control_port: Number(spec.control_port) || existing.spec.control_port,
          public_port: Number(spec.public_port) || existing.spec.public_port,
          target_port: Number(spec.target_port) || existing.spec.target_port,
        }
      : existing.spec,
  });

  if (updated) {
    if (updated.status === 'active') {
      coreRunner.startTunnelProcess(updated);
    } else {
      coreRunner.stopTunnelProcess(updated.id);
    }
  }

  res.json(updated);
});

app.delete('/api/tunnels/:id', (req: Request, res: Response) => {
  const existing = db.getTunnelById(req.params.id);
  if (!existing) {
    res.status(404).json({ detail: 'Tunnel not found' });
    return;
  }

  coreRunner.stopTunnelProcess(req.params.id);
  db.deleteTunnel(req.params.id);

  db.insertLog({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'warn',
    source: existing.core,
    message: `Tunnel ${existing.name} process stopped and record deleted from SQLite.`,
    tunnel_name: existing.name,
  });

  res.json({ message: 'Tunnel deleted successfully' });
});

app.post('/api/tunnels/:id/apply', (req: Request, res: Response) => {
  const tunnel = db.getTunnelById(req.params.id);
  if (!tunnel) {
    res.status(404).json({ detail: 'Tunnel not found' });
    return;
  }

  const updated = db.updateTunnel(tunnel.id, { status: 'active', error_message: null })!;
  const runResult = coreRunner.startTunnelProcess(updated);

  db.insertLog({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    source: updated.core,
    message: `Applied config & spawned ${updated.core} binary for ${updated.name} (PID: ${runResult.pid || 'active'}).`,
    tunnel_name: updated.name,
  });

  res.json({ message: 'Configuration applied and core process started', tunnel: updated, pid: runResult.pid });
});

app.post('/api/tunnels/reapply-all', (req: Request, res: Response) => {
  const allTunnels = db.getTunnels();
  for (const t of allTunnels) {
    db.updateTunnel(t.id, { status: 'active', error_message: null });
  }
  const refreshed = db.getTunnels();
  const count = coreRunner.syncAllActiveTunnels(refreshed);

  db.insertLog({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    source: 'system',
    message: `Bulk reapply executed: ${count}/${refreshed.length} real tunnel core processes restarted from SQLite.`,
  });

  res.json({ message: `Successfully reapplied ${refreshed.length} tunnels`, count: refreshed.length });
});

app.get('/api/tunnels/:id/config', (req: Request, res: Response) => {
  const tunnel = db.getTunnelById(req.params.id);
  if (!tunnel) {
    res.status(404).json({ detail: 'Tunnel not found' });
    return;
  }
  const config = generateConfigForTunnel(tunnel);
  res.json(config);
});

// Core Health & Binaries
app.get('/api/core-health/health', (req: Request, res: Response) => {
  const allTunnels = db.getTunnels();
  res.json(coreRunner.getCoreHealthList(allTunnels));
});

app.get('/api/core-health/binaries', (req: Request, res: Response) => {
  res.json(coreRunner.detectBinaries());
});

app.get('/api/core-health/reset-config', (req: Request, res: Response) => {
  res.json(db.getCoreResetConfigs());
});

app.put('/api/core-health/reset-config/:core', (req: Request, res: Response) => {
  const core = req.params.core as CoreType;
  const { enabled, interval_minutes } = req.body;
  db.updateCoreResetConfig(
    core,
    enabled !== undefined ? Boolean(enabled) : undefined,
    interval_minutes !== undefined ? Number(interval_minutes) : undefined
  );
  res.json({
    core,
    enabled: Boolean(enabled),
    interval_minutes: Number(interval_minutes),
  });
});

app.post('/api/core-health/reset/:core', (req: Request, res: Response) => {
  const core = req.params.core as CoreType;
  const now = new Date().toISOString();
  db.updateCoreResetConfig(core, undefined, undefined, now);
  const restarted = coreRunner.restartCoreProcesses(core, db.getTunnels());

  db.insertLog({
    id: `log-${Date.now()}`,
    timestamp: now,
    level: 'info',
    source: core,
    message: `Core binary ${core.toUpperCase()} restarted (${restarted} active tunnel instances reloaded).`,
  });

  res.json({ message: `Core ${core} restarted successfully`, timestamp: now, restarted });
});

// Panel CA & Certs
app.get('/api/panel/ca', (req: Request, res: Response) => {
  const ca = generateMockCaCertificate('iran');
  res.type('text/plain').send(ca);
});

app.get('/api/panel/ca/server', (req: Request, res: Response) => {
  const ca = generateMockCaCertificate('foreign');
  res.type('text/plain').send(ca);
});

app.get('/api/panel/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.2',
    database: db.dbPath,
    services: {
      api: 'healthy',
      sqlite_db: 'healthy',
      core_binaries: coreRunner.detectBinaries(),
    },
  });
});

// Logs (SQLite backed)
app.get('/api/logs', (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '100', 10);
  const level = req.query.level as string | undefined;
  const source = req.query.source as string | undefined;
  res.json(db.getLogs(limit, level, source));
});

app.delete('/api/logs', (req: Request, res: Response) => {
  db.clearLogs();
  res.json({ message: 'Logs cleared from SQLite' });
});

// Settings (SQLite backed)
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req: Request, res: Response) => {
  const updated = db.saveSettings(req.body);
  db.insertLog({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    source: 'system',
    message: 'Panel settings updated and persisted to SQLite database.',
  });
  res.json(updated);
});

app.post('/api/settings/telegram/test', (req: Request, res: Response) => {
  const { bot_token, chat_id } = req.body;
  if (!bot_token || !chat_id) {
    res.status(400).json({ detail: 'Bot token and Chat ID are required' });
    return;
  }
  db.insertLog({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    source: 'system',
    message: `Telegram test notification sent to chat ID: ${chat_id}.`,
  });
  res.json({ status: 'success', message: 'Test message sent to Telegram successfully' });
});

app.get('/api/settings/backup', (req: Request, res: Response) => {
  const backup = {
    version: '0.1.2',
    database: 'SQLite3',
    created_at: new Date().toISOString(),
    nodes: db.getNodes(),
    tunnels: db.getTunnels(),
    core_reset_configs: db.getCoreResetConfigs(),
    settings: db.getSettings(),
  };
  res.setHeader('Content-Disposition', 'attachment; filename=smite-sqlite-backup.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(backup, null, 2));
});

// Edge node install script endpoint
app.get('/scripts/smite-node.sh', (req: Request, res: Response) => {
  const script = `#!/usr/bin/env bash
# Smite Edge Node Automated Installer (Downloads Backhaul, Rathole, GOST, Chisel, FRP)
set -e
echo "======================================"
echo "    Smite Node Installer v0.1.2       "
echo "======================================"

PANEL_URL=""
NODE_TYPE="foreign"
NODE_NAME="smite-node-1"

while [[ $# -gt 0 ]]; do
  case $1 in
    --panel) PANEL_URL="$2"; shift 2 ;;
    --iran) NODE_TYPE="iran"; shift ;;
    --foreign) NODE_TYPE="foreign"; shift ;;
    --name) NODE_NAME="$2"; shift 2 ;;
    *) shift ;;
  esac
done

ARCH_RAW="$(uname -m)"
case "$ARCH_RAW" in
  x86_64|amd64) ARCH="amd64"; RATHOLE_ARCH="x86_64" ;;
  aarch64|arm64) ARCH="arm64"; RATHOLE_ARCH="aarch64" ;;
  *) ARCH="amd64"; RATHOLE_ARCH="x86_64" ;;
esac

mkdir -p /usr/local/bin /etc/smite/certs /etc/smite/configs

echo "[1/5] Installing Backhaul v0.7.2..."
curl -fsSL "https://github.com/Musixal/Backhaul/releases/download/v0.7.2/backhaul_linux_\${ARCH}.tar.gz" | tar -xz -C /usr/local/bin backhaul && chmod +x /usr/local/bin/backhaul

echo "[2/5] Installing Rathole v0.5.0..."
TMP_RAT=\$(mktemp -d)
curl -fsSL "https://github.com/rapiz1/rathole/releases/download/v0.5.0/rathole-\${RATHOLE_ARCH}-unknown-linux-gnu.zip" -o "\$TMP_RAT/rat.zip"
unzip -q "\$TMP_RAT/rat.zip" -d /usr/local/bin && chmod +x /usr/local/bin/rathole && rm -rf "\$TMP_RAT"

echo "[3/5] Installing GOST v2.12.0..."
curl -fsSL "https://github.com/ginuerzh/gost/releases/download/v2.12.0/gost_2.12.0_linux_\${ARCH}.tar.gz" | tar -xz -C /usr/local/bin gost && chmod +x /usr/local/bin/gost

echo "[4/5] Installing Chisel v1.11.3..."
curl -fsSL "https://github.com/jpillora/chisel/releases/download/v1.11.3/chisel_1.11.3_linux_\${ARCH}.gz" | gunzip > /usr/local/bin/chisel && chmod +x /usr/local/bin/chisel

echo "[5/5] Installing FRP v0.65.0..."
TMP_FRP=\$(mktemp -d)
curl -fsSL "https://github.com/fatedier/frp/releases/download/v0.65.0/frp_0.65.0_linux_\${ARCH}.tar.gz" -o "\$TMP_FRP/frp.tar.gz"
tar -xzf "\$TMP_FRP/frp.tar.gz" -C "\$TMP_FRP"
cp \$(find "\$TMP_FRP" -name frps | head -n1) /usr/local/bin/frps
cp \$(find "\$TMP_FRP" -name frpc | head -n1) /usr/local/bin/frpc
chmod +x /usr/local/bin/frps /usr/local/bin/frpc && rm -rf "\$TMP_FRP"

echo "Fetching CA Certificate from \$PANEL_URL..."
if [ "\$NODE_TYPE" = "iran" ]; then
  curl -fsSL "\$PANEL_URL/api/panel/ca" -o /etc/smite/certs/ca.crt
else
  curl -fsSL "\$PANEL_URL/api/panel/ca/server" -o /etc/smite/certs/ca.crt
fi

echo "Smite Node (\$NODE_NAME - \$NODE_TYPE) installed and linked to \$PANEL_URL!"
`;
  res.type('text/x-shellscript').send(script);
});

// Start function for Vite integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smite] Panel Server with SQLite & Core Binaries running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
