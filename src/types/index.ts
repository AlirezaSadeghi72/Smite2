export type CoreType = 'backhaul' | 'rathole' | 'gost' | 'chisel' | 'frp';
export type NodeType = 'iran' | 'foreign';
export type TunnelTransport = 'tcp' | 'udp' | 'ws' | 'wsmux' | 'tcpmux' | 'grpc';

export interface NodeItem {
  id: string;
  name: string;
  fingerprint: string;
  type: NodeType;
  status: 'online' | 'offline' | 'pending' | 'warning';
  ip: string;
  port?: number;
  country: string;
  registered_at: string;
  last_seen: string;
  cpu_usage: number;
  memory_usage: number;
  active_tunnels_count: number;
  traffic_in: number;
  traffic_out: number;
  version: string;
  metadata?: {
    os?: string;
    kernel?: string;
    docker_version?: string;
    cores?: number;
  };
}

export interface TunnelSpec {
  transport: TunnelTransport;
  control_port: number;
  public_port: number;
  listen_ip: string;
  public_host: string;
  remote_addr: string;
  target_host: string;
  target_port: number;
  token?: string;
  accept_udp?: boolean;
  tls_enabled?: boolean;
  sni?: string;
  proxy_protocol?: boolean;
  mux_con?: number;
  heartbeat?: number;
  connection_pool?: number;
  rate_limit_mbps?: number;
  custom_ports?: string;
  extra_args?: string;
}

export interface TunnelItem {
  id: string;
  name: string;
  core: CoreType;
  type: 'reverse' | 'forward' | 'direct';
  node_id: string;
  foreign_node_id?: string;
  iran_node_id?: string;
  spec: TunnelSpec;
  quota_mb: number;
  used_mb: number;
  expires_at?: string | null;
  status: 'active' | 'pending' | 'error' | 'stopped';
  error_message?: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
  current_rate_in?: number;
  current_rate_out?: number;
}

export interface CoreHealthItem {
  core: CoreType;
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'disabled';
  installed_version: string;
  latest_version: string;
  active_instances: number;
  total_tunnels: number;
  cpu_percent: number;
  memory_mb: number;
  uptime_seconds: number;
  last_restart: string;
  auto_reset_enabled: boolean;
  auto_reset_interval_min: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: 'system' | 'backhaul' | 'rathole' | 'gost' | 'chisel' | 'frp' | 'api' | 'node';
  message: string;
  details?: string;
  node_name?: string;
  tunnel_name?: string;
}

export interface SystemStatus {
  version: string;
  uptime: number;
  total_nodes: number;
  online_nodes: number;
  total_tunnels: number;
  active_tunnels: number;
  cpu_usage_percent: number;
  memory_used_mb: number;
  memory_total_mb: number;
  total_traffic_in_bytes: number;
  total_traffic_out_bytes: number;
  current_rate_in_bps: number;
  current_rate_out_bps: number;
}

export interface AppSettings {
  panel_port: number;
  server_name: string;
  secret_key: string;
  telegram_bot_token: string;
  telegram_chat_id: string;
  telegram_notifications_enabled: boolean;
  auto_backup_enabled: boolean;
  auto_backup_cron: string;
  metrics_retention_days: number;
  log_level: 'debug' | 'info' | 'warn' | 'error';
  theme: 'dark' | 'light' | 'system';
  language: 'en' | 'fa';
}
