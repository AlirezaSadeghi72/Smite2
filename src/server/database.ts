import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import {
  NodeItem,
  TunnelItem,
  CoreHealthItem,
  LogEntry,
  AppSettings,
  CoreType,
} from '../types';

export class SmiteDatabase {
  private db: DatabaseSync;
  public readonly dbPath: string;

  constructor(customPath?: string) {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = customPath || path.join(dataDir, 'smite.db');
    this.db = new DatabaseSync(this.dbPath);
    this.initSchema();
    this.seedDefaultsIfEmpty();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        fingerprint TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'online',
        ip TEXT NOT NULL,
        port INTEGER DEFAULT 3080,
        country TEXT NOT NULL DEFAULT 'Iran',
        registered_at TEXT NOT NULL,
        last_seen TEXT NOT NULL,
        cpu_usage REAL DEFAULT 0,
        memory_usage REAL DEFAULT 0,
        active_tunnels_count INTEGER DEFAULT 0,
        traffic_in INTEGER DEFAULT 0,
        traffic_out INTEGER DEFAULT 0,
        version TEXT DEFAULT '0.1.2',
        metadata TEXT DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS tunnels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        core TEXT NOT NULL,
        type TEXT NOT NULL,
        node_id TEXT NOT NULL,
        foreign_node_id TEXT,
        iran_node_id TEXT,
        spec TEXT NOT NULL,
        quota_mb REAL DEFAULT 0,
        used_mb REAL DEFAULT 0,
        expires_at TEXT,
        status TEXT DEFAULT 'active',
        error_message TEXT,
        revision INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        current_rate_in INTEGER DEFAULT 0,
        current_rate_out INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS core_reset_config (
        core TEXT PRIMARY KEY,
        enabled INTEGER DEFAULT 1,
        interval_minutes INTEGER DEFAULT 60,
        last_reset TEXT
      );

      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        level TEXT NOT NULL,
        source TEXT NOT NULL,
        message TEXT NOT NULL,
        details TEXT,
        node_name TEXT,
        tunnel_name TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  private seedDefaultsIfEmpty() {
    const nodeCountRow = this.db.prepare('SELECT COUNT(*) as cnt FROM nodes').get() as { cnt: number };
    if (nodeCountRow.cnt === 0) {
      const now = new Date().toISOString();
      const initialNodes: NodeItem[] = [
        {
          id: 'node-iran-tehran-1',
          name: 'IR-Tehran-MCI-01',
          fingerprint: 'fp_a9b8c7d6e5f4a1b2c3d4e5f6a7b8c9d0',
          type: 'iran',
          status: 'online',
          ip: '185.143.232.45',
          port: 3080,
          country: 'Iran',
          registered_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          last_seen: now,
          cpu_usage: 14.2,
          memory_usage: 38.4,
          active_tunnels_count: 3,
          traffic_in: 8945209384,
          traffic_out: 7483920194,
          version: '0.1.2',
          metadata: {
            os: 'Ubuntu 24.04 LTS (x86_64)',
            kernel: '6.8.0-31-generic',
            docker_version: '26.1.3',
            cores: 4,
          },
        },
        {
          id: 'node-iran-shiraz-2',
          name: 'IR-Shiraz-Irancell-02',
          fingerprint: 'fp_112233445566778899aabbccddeeff00',
          type: 'iran',
          status: 'online',
          ip: '91.98.112.78',
          port: 3080,
          country: 'Iran',
          registered_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          last_seen: now,
          cpu_usage: 11.5,
          memory_usage: 32.1,
          active_tunnels_count: 2,
          traffic_in: 4582910384,
          traffic_out: 3910294820,
          version: '0.1.2',
          metadata: {
            os: 'Ubuntu 22.04.4 LTS (x86_64)',
            kernel: '5.15.0-107-generic',
            docker_version: '25.0.3',
            cores: 2,
          },
        },
        {
          id: 'node-foreign-frankfurt-1',
          name: 'EU-Frankfurt-Hetzner-01',
          fingerprint: 'fp_f1e2d3c4b5a697887766554433221100',
          type: 'foreign',
          status: 'online',
          ip: '159.69.145.210',
          port: 443,
          country: 'Germany',
          registered_at: new Date(Date.now() - 86400000 * 12).toISOString(),
          last_seen: now,
          cpu_usage: 21.8,
          memory_usage: 51.0,
          active_tunnels_count: 3,
          traffic_in: 12948203940,
          traffic_out: 14930294820,
          version: '0.1.2',
          metadata: {
            os: 'Debian GNU/Linux 12 (bookworm)',
            kernel: '6.1.0-21-amd64',
            docker_version: '26.1.0',
            cores: 4,
          },
        },
        {
          id: 'node-foreign-helsinki-2',
          name: 'EU-Helsinki-OVH-02',
          fingerprint: 'fp_a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
          type: 'foreign',
          status: 'online',
          ip: '65.21.89.144',
          port: 8443,
          country: 'Finland',
          registered_at: new Date(Date.now() - 86400000 * 7).toISOString(),
          last_seen: now,
          cpu_usage: 8.9,
          memory_usage: 27.5,
          active_tunnels_count: 2,
          traffic_in: 3492049102,
          traffic_out: 4102948201,
          version: '0.1.2',
          metadata: {
            os: 'Ubuntu 24.04 LTS (x86_64)',
            kernel: '6.8.0-31-generic',
            docker_version: '26.1.3',
            cores: 2,
          },
        },
      ];

      for (const n of initialNodes) {
        this.insertNode(n);
      }
    }

    const tunnelCountRow = this.db.prepare('SELECT COUNT(*) as cnt FROM tunnels').get() as { cnt: number };
    if (tunnelCountRow.cnt === 0) {
      const now = new Date().toISOString();
      const initialTunnels: TunnelItem[] = [
        {
          id: 'tun-backhaul-tls-443',
          name: 'Backhaul-Tehran-FRA-443',
          core: 'backhaul',
          type: 'reverse',
          node_id: 'node-iran-tehran-1',
          iran_node_id: 'node-iran-tehran-1',
          foreign_node_id: 'node-foreign-frankfurt-1',
          spec: {
            transport: 'ws',
            control_port: 13080,
            public_port: 18443,
            listen_ip: '0.0.0.0',
            public_host: 'ir-tehran.node.smite',
            remote_addr: '127.0.0.1:13080',
            target_host: '127.0.0.1',
            target_port: 8080,
            token: 'smite-backhaul-token-x99',
            accept_udp: true,
            tls_enabled: false,
            mux_con: 8,
            heartbeat: 30,
            connection_pool: 4,
            proxy_protocol: false,
          },
          quota_mb: 500000,
          used_mb: 18420,
          expires_at: null,
          status: 'active',
          error_message: null,
          revision: 3,
          created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
          updated_at: now,
          current_rate_in: 3482910,
          current_rate_out: 2948102,
        },
        {
          id: 'tun-rathole-fast-8080',
          name: 'Rathole-HighPerf-Shiraz',
          core: 'rathole',
          type: 'reverse',
          node_id: 'node-iran-shiraz-2',
          iran_node_id: 'node-iran-shiraz-2',
          foreign_node_id: 'node-foreign-helsinki-2',
          spec: {
            transport: 'tcp',
            control_port: 12333,
            public_port: 18080,
            listen_ip: '0.0.0.0',
            public_host: 'ir-shiraz.node.smite',
            remote_addr: '127.0.0.1:12333',
            target_host: '127.0.0.1',
            target_port: 8080,
            token: 'rathole-secure-salt-2025',
            accept_udp: false,
            heartbeat: 40,
          },
          quota_mb: 200000,
          used_mb: 7490,
          expires_at: null,
          status: 'active',
          error_message: null,
          revision: 1,
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          updated_at: now,
          current_rate_in: 1294820,
          current_rate_out: 1849201,
        },
        {
          id: 'tun-gost-relay-ws',
          name: 'GOST-WebSocket-Tehran-FRA',
          core: 'gost',
          type: 'forward',
          node_id: 'node-iran-tehran-1',
          iran_node_id: 'node-iran-tehran-1',
          foreign_node_id: 'node-foreign-frankfurt-1',
          spec: {
            transport: 'tcp',
            control_port: 18085,
            public_port: 12083,
            listen_ip: '0.0.0.0',
            public_host: '0.0.0.0',
            remote_addr: '',
            target_host: '127.0.0.1',
            target_port: 3000,
            accept_udp: false,
          },
          quota_mb: 0,
          used_mb: 12480,
          expires_at: null,
          status: 'active',
          error_message: null,
          revision: 2,
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          updated_at: now,
          current_rate_in: 2194820,
          current_rate_out: 1948201,
        },
        {
          id: 'tun-chisel-ssh-backup',
          name: 'Chisel-Tunnel-Control',
          core: 'chisel',
          type: 'reverse',
          node_id: 'node-iran-tehran-1',
          iran_node_id: 'node-iran-tehran-1',
          foreign_node_id: 'node-foreign-frankfurt-1',
          spec: {
            transport: 'tcp',
            control_port: 19000,
            public_port: 12222,
            listen_ip: '0.0.0.0',
            public_host: '0.0.0.0',
            remote_addr: '127.0.0.1:19000',
            target_host: '127.0.0.1',
            target_port: 22,
            token: 'smite:chisel-key-8899',
          },
          quota_mb: 50000,
          used_mb: 320,
          expires_at: null,
          status: 'active',
          error_message: null,
          revision: 1,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: now,
          current_rate_in: 4820,
          current_rate_out: 6920,
        },
        {
          id: 'tun-frp-tcp-mux',
          name: 'FRP-Backup-Service',
          core: 'frp',
          type: 'reverse',
          node_id: 'node-iran-shiraz-2',
          iran_node_id: 'node-iran-shiraz-2',
          foreign_node_id: 'node-foreign-helsinki-2',
          spec: {
            transport: 'tcpmux',
            control_port: 17000,
            public_port: 16000,
            listen_ip: '0.0.0.0',
            public_host: '0.0.0.0',
            remote_addr: '127.0.0.1:17000',
            target_host: '127.0.0.1',
            target_port: 8080,
            token: 'smite-frp-cluster-2025',
          },
          quota_mb: 100000,
          used_mb: 2100,
          expires_at: null,
          status: 'active',
          error_message: null,
          revision: 1,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: now,
          current_rate_in: 34920,
          current_rate_out: 48920,
        },
      ];

      for (const t of initialTunnels) {
        this.insertTunnel(t);
      }
    }

    const coreConfigCount = this.db.prepare('SELECT COUNT(*) as cnt FROM core_reset_config').get() as { cnt: number };
    if (coreConfigCount.cnt === 0) {
      const now = new Date().toISOString();
      const cores: Array<{ core: CoreType; enabled: number; interval: number }> = [
        { core: 'backhaul', enabled: 1, interval: 60 },
        { core: 'rathole', enabled: 1, interval: 120 },
        { core: 'gost', enabled: 0, interval: 30 },
        { core: 'chisel', enabled: 0, interval: 180 },
        { core: 'frp', enabled: 1, interval: 60 },
      ];
      const stmt = this.db.prepare(
        'INSERT INTO core_reset_config (core, enabled, interval_minutes, last_reset) VALUES (?, ?, ?, ?)'
      );
      for (const c of cores) {
        stmt.run(c.core, c.enabled, c.interval, now);
      }
    }

    const logCount = this.db.prepare('SELECT COUNT(*) as cnt FROM logs').get() as { cnt: number };
    if (logCount.cnt === 0) {
      this.insertLog({
        id: `log-init-1`,
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: 'info',
        source: 'system',
        message: 'SQLite database initialized at data/smite.db and real core binaries loaded from /cores.',
      });
    }

    const settingsRow = this.db.prepare('SELECT value FROM settings WHERE key = ?').get('app_settings') as
      | { value: string }
      | undefined;
    if (!settingsRow) {
      const defaultSettings: AppSettings = {
        panel_port: 3000,
        server_name: 'Smite-Tehran-Control-1',
        secret_key: 'smite-jwt-super-secret-key-prod',
        telegram_bot_token: '',
        telegram_chat_id: '',
        telegram_notifications_enabled: false,
        auto_backup_enabled: true,
        auto_backup_cron: '0 3 * * *',
        metrics_retention_days: 30,
        log_level: 'info',
        theme: 'dark',
        language: 'fa',
      };
      this.saveSettings(defaultSettings);
    }
  }

  // --- NODES ---
  public getNodes(): NodeItem[] {
    const rows = this.db.prepare('SELECT * FROM nodes ORDER BY registered_at DESC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      fingerprint: r.fingerprint,
      type: r.type,
      status: r.status,
      ip: r.ip,
      port: r.port,
      country: r.country,
      registered_at: r.registered_at,
      last_seen: r.last_seen,
      cpu_usage: r.cpu_usage,
      memory_usage: r.memory_usage,
      active_tunnels_count: r.active_tunnels_count,
      traffic_in: r.traffic_in,
      traffic_out: r.traffic_out,
      version: r.version,
      metadata: JSON.parse(r.metadata || '{}'),
    }));
  }

  public getNodeById(id: string): NodeItem | undefined {
    const r = this.db.prepare('SELECT * FROM nodes WHERE id = ?').get(id) as any;
    if (!r) return undefined;
    return {
      id: r.id,
      name: r.name,
      fingerprint: r.fingerprint,
      type: r.type,
      status: r.status,
      ip: r.ip,
      port: r.port,
      country: r.country,
      registered_at: r.registered_at,
      last_seen: r.last_seen,
      cpu_usage: r.cpu_usage,
      memory_usage: r.memory_usage,
      active_tunnels_count: r.active_tunnels_count,
      traffic_in: r.traffic_in,
      traffic_out: r.traffic_out,
      version: r.version,
      metadata: JSON.parse(r.metadata || '{}'),
    };
  }

  public insertNode(node: NodeItem): NodeItem {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO nodes (
        id, name, fingerprint, type, status, ip, port, country,
        registered_at, last_seen, cpu_usage, memory_usage,
        active_tunnels_count, traffic_in, traffic_out, version, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      node.id,
      node.name,
      node.fingerprint,
      node.type,
      node.status,
      node.ip,
      node.port || 3080,
      node.country,
      node.registered_at,
      node.last_seen,
      node.cpu_usage,
      node.memory_usage,
      node.active_tunnels_count,
      node.traffic_in,
      node.traffic_out,
      node.version,
      JSON.stringify(node.metadata || {})
    );
    return node;
  }

  public deleteNode(id: string): boolean {
    const res = this.db.prepare('DELETE FROM nodes WHERE id = ?').run(id);
    return Number(res.changes) > 0;
  }

  public updateNodeHeartbeat(id: string): boolean {
    const res = this.db
      .prepare('UPDATE nodes SET last_seen = ?, status = ? WHERE id = ?')
      .run(new Date().toISOString(), 'online', id);
    return Number(res.changes) > 0;
  }

  // --- TUNNELS ---
  public getTunnels(): TunnelItem[] {
    const rows = this.db.prepare('SELECT * FROM tunnels ORDER BY created_at DESC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      core: r.core,
      type: r.type,
      node_id: r.node_id,
      foreign_node_id: r.foreign_node_id || undefined,
      iran_node_id: r.iran_node_id || undefined,
      spec: JSON.parse(r.spec || '{}'),
      quota_mb: r.quota_mb,
      used_mb: r.used_mb,
      expires_at: r.expires_at,
      status: r.status,
      error_message: r.error_message,
      revision: r.revision,
      created_at: r.created_at,
      updated_at: r.updated_at,
      current_rate_in: r.current_rate_in,
      current_rate_out: r.current_rate_out,
    }));
  }

  public getTunnelById(id: string): TunnelItem | undefined {
    const r = this.db.prepare('SELECT * FROM tunnels WHERE id = ?').get(id) as any;
    if (!r) return undefined;
    return {
      id: r.id,
      name: r.name,
      core: r.core,
      type: r.type,
      node_id: r.node_id,
      foreign_node_id: r.foreign_node_id || undefined,
      iran_node_id: r.iran_node_id || undefined,
      spec: JSON.parse(r.spec || '{}'),
      quota_mb: r.quota_mb,
      used_mb: r.used_mb,
      expires_at: r.expires_at,
      status: r.status,
      error_message: r.error_message,
      revision: r.revision,
      created_at: r.created_at,
      updated_at: r.updated_at,
      current_rate_in: r.current_rate_in,
      current_rate_out: r.current_rate_out,
    };
  }

  public insertTunnel(tunnel: TunnelItem): TunnelItem {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO tunnels (
        id, name, core, type, node_id, foreign_node_id, iran_node_id,
        spec, quota_mb, used_mb, expires_at, status, error_message,
        revision, created_at, updated_at, current_rate_in, current_rate_out
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      tunnel.id,
      tunnel.name,
      tunnel.core,
      tunnel.type,
      tunnel.node_id,
      tunnel.foreign_node_id || null,
      tunnel.iran_node_id || null,
      JSON.stringify(tunnel.spec || {}),
      tunnel.quota_mb || 0,
      tunnel.used_mb || 0,
      tunnel.expires_at || null,
      tunnel.status || 'active',
      tunnel.error_message || null,
      tunnel.revision || 1,
      tunnel.created_at,
      tunnel.updated_at,
      tunnel.current_rate_in || 0,
      tunnel.current_rate_out || 0
    );
    return tunnel;
  }

  public updateTunnel(id: string, patch: Partial<TunnelItem>): TunnelItem | undefined {
    const existing = this.getTunnelById(id);
    if (!existing) return undefined;

    const updated: TunnelItem = {
      ...existing,
      ...patch,
      spec: patch.spec ? { ...existing.spec, ...patch.spec } : existing.spec,
      revision: (existing.revision || 1) + 1,
      updated_at: new Date().toISOString(),
    };

    return this.insertTunnel(updated);
  }

  public deleteTunnel(id: string): boolean {
    const res = this.db.prepare('DELETE FROM tunnels WHERE id = ?').run(id);
    return Number(res.changes) > 0;
  }

  // --- CORE RESET CONFIG ---
  public getCoreResetConfigs(): Array<{
    core: CoreType;
    enabled: boolean;
    interval_minutes: number;
    last_reset: string;
  }> {
    const rows = this.db.prepare('SELECT * FROM core_reset_config').all() as any[];
    return rows.map((r) => ({
      core: r.core as CoreType,
      enabled: Boolean(r.enabled),
      interval_minutes: Number(r.interval_minutes),
      last_reset: r.last_reset || new Date().toISOString(),
    }));
  }

  public updateCoreResetConfig(core: CoreType, enabled?: boolean, intervalMinutes?: number, lastReset?: string) {
    const existing = this.db.prepare('SELECT * FROM core_reset_config WHERE core = ?').get(core) as any;
    const newEnabled = enabled !== undefined ? (enabled ? 1 : 0) : existing?.enabled ?? 1;
    const newInterval = intervalMinutes !== undefined ? intervalMinutes : existing?.interval_minutes ?? 60;
    const newReset = lastReset || existing?.last_reset || new Date().toISOString();

    this.db
      .prepare(
        'INSERT OR REPLACE INTO core_reset_config (core, enabled, interval_minutes, last_reset) VALUES (?, ?, ?, ?)'
      )
      .run(core, newEnabled, newInterval, newReset);
  }

  // --- LOGS ---
  public getLogs(limit = 100, level?: string, source?: string): LogEntry[] {
    let query = 'SELECT * FROM logs';
    const params: any[] = [];
    const clauses: string[] = [];

    if (level && level !== 'all') {
      clauses.push('level = ?');
      params.push(level);
    }
    if (source && source !== 'all') {
      clauses.push('source = ?');
      params.push(source);
    }
    if (clauses.length > 0) {
      query += ' WHERE ' + clauses.join(' AND ');
    }
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      level: r.level,
      source: r.source,
      message: r.message,
      details: r.details || undefined,
      node_name: r.node_name || undefined,
      tunnel_name: r.tunnel_name || undefined,
    }));
  }

  public insertLog(entry: LogEntry) {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO logs (id, timestamp, level, source, message, details, node_name, tunnel_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        entry.id,
        entry.timestamp,
        entry.level,
        entry.source,
        entry.message,
        entry.details || null,
        entry.node_name || null,
        entry.tunnel_name || null
      );
  }

  public clearLogs() {
    this.db.prepare('DELETE FROM logs').run();
  }

  // --- SETTINGS ---
  public getSettings(): AppSettings {
    const row = this.db.prepare('SELECT value FROM settings WHERE key = ?').get('app_settings') as
      | { value: string }
      | undefined;
    if (!row) {
      return {
        panel_port: 3000,
        server_name: 'Smite-Tehran-Control-1',
        secret_key: 'smite-jwt-super-secret-key-prod',
        telegram_bot_token: '',
        telegram_chat_id: '',
        telegram_notifications_enabled: false,
        auto_backup_enabled: true,
        auto_backup_cron: '0 3 * * *',
        metrics_retention_days: 30,
        log_level: 'info',
        theme: 'dark',
        language: 'fa',
      };
    }
    return JSON.parse(row.value);
  }

  public saveSettings(patch: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...patch };
    this.db
      .prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      .run('app_settings', JSON.stringify(updated));
    return updated;
  }

  public close() {
    this.db.close();
  }
}
