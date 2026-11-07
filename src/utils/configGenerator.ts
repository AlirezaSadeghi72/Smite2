import { TunnelItem, TunnelSpec } from '../types';
import { formatAddressPort } from './addressUtils';

export interface GeneratedConfig {
  serverConfig: string;
  clientConfig: string;
  serverFilename: string;
  clientFilename: string;
  serverRunCommand: string;
  clientRunCommand: string;
}

/**
 * Generates Backhaul Server & Client TOML configuration
 */
export function generateBackhaulConfig(tunnel: Partial<TunnelItem>): GeneratedConfig {
  const spec: TunnelSpec = {
    transport: 'tcp',
    control_port: 3080,
    public_port: 443,
    listen_ip: '0.0.0.0',
    public_host: '0.0.0.0',
    remote_addr: '127.0.0.1:3080',
    target_host: '127.0.0.1',
    target_port: 8080,
    token: 'smite-secret-token',
    accept_udp: false,
    tls_enabled: false,
    heartbeat: 40,
    mux_con: 8,
    connection_pool: 4,
    ...tunnel.spec,
  };

  const bindAddr = formatAddressPort(spec.listen_ip || '0.0.0.0', spec.control_port || 3080);
  const token = spec.token || 'smite-secret-token';
  const transport = spec.transport || 'tcp';

  // Server TOML
  const serverToml = [
    `[server]`,
    `bind_addr = "${bindAddr}"`,
    `transport = "${transport}"`,
    `token = "${token}"`,
    `heartbeat = ${spec.heartbeat || 40}`,
    `mux_con = ${spec.mux_con || 8}`,
    `accept_udp = ${spec.accept_udp ? 'true' : 'false'}`,
    `log_level = "info"`,
    `nodelay = true`,
    spec.tls_enabled ? `tls_cert = "/etc/smite/cert.pem"\ntls_key = "/etc/smite/key.pem"` : '',
    spec.proxy_protocol ? `proxy_protocol = true` : '',
    ``,
    `[server.ports]`,
    `# Public incoming port mapping to client target`,
    `"${spec.public_port}" = "${spec.target_port}"`,
  ].filter(Boolean).join('\n');

  // Client TOML (Foreign server or local forwarder)
  const remoteAddr = spec.remote_addr || `iran-node.example.com:${spec.control_port || 3080}`;
  const clientToml = [
    `[client]`,
    `remote_addr = "${remoteAddr}"`,
    `transport = "${transport}"`,
    `token = "${token}"`,
    `connection_pool = ${spec.connection_pool || 4}`,
    `retry_interval = 3`,
    `dial_timeout = 10`,
    `log_level = "info"`,
    `nodelay = true`,
    spec.tls_enabled ? `skip_cert_verify = true` : '',
    ``,
    `[client.ports]`,
    `"${spec.public_port}" = "${spec.target_host}:${spec.target_port}"`,
  ].filter(Boolean).join('\n');

  return {
    serverConfig: serverToml,
    clientConfig: clientToml,
    serverFilename: `backhaul_server_${tunnel.id || 'new'}.toml`,
    clientFilename: `backhaul_client_${tunnel.id || 'new'}.toml`,
    serverRunCommand: `backhaul -c backhaul_server_${tunnel.id || 'new'}.toml`,
    clientRunCommand: `backhaul -c backhaul_client_${tunnel.id || 'new'}.toml`,
  };
}

/**
 * Generates Rathole Server & Client TOML configuration
 */
export function generateRatholeConfig(tunnel: Partial<TunnelItem>): GeneratedConfig {
  const spec: TunnelSpec = {
    transport: 'tcp',
    control_port: 2333,
    public_port: 8443,
    listen_ip: '0.0.0.0',
    public_host: '0.0.0.0',
    remote_addr: 'iran-node.example.com:2333',
    target_host: '127.0.0.1',
    target_port: 8080,
    token: 'rathole-secret-token',
    ...tunnel.spec,
  };

  const serviceId = tunnel.id ? `service_${tunnel.id.substring(0, 8)}` : 'tunnel_service';
  const serverBind = `0.0.0.0:${spec.control_port || 2333}`;
  const serviceBind = `0.0.0.0:${spec.public_port || 8443}`;
  const token = spec.token || 'smite-rathole-token';

  const serverToml = [
    `[server]`,
    `bind_addr = "${serverBind}"`,
    `default_token = "${token}"`,
    ``,
    `[server.services.${serviceId}]`,
    `bind_addr = "${serviceBind}"`,
    spec.accept_udp ? `type = "udp"` : `type = "tcp"`,
    `token = "${token}"`,
  ].join('\n');

  const clientToml = [
    `[client]`,
    `remote_addr = "${spec.remote_addr || 'iran-node.example.com:2333'}"`,
    `default_token = "${token}"`,
    ``,
    `[client.services.${serviceId}]`,
    spec.accept_udp ? `type = "udp"` : `type = "tcp"`,
    `token = "${token}"`,
    `local_addr = "${spec.target_host}:${spec.target_port}"`,
  ].join('\n');

  return {
    serverConfig: serverToml,
    clientConfig: clientToml,
    serverFilename: `rathole_server_${tunnel.id || 'new'}.toml`,
    clientFilename: `rathole_client_${tunnel.id || 'new'}.toml`,
    serverRunCommand: `rathole -s rathole_server_${tunnel.id || 'new'}.toml`,
    clientRunCommand: `rathole -c rathole_client_${tunnel.id || 'new'}.toml`,
  };
}

/**
 * Generates GOST Forwarder arguments and JSON config
 */
export function generateGostConfig(tunnel: Partial<TunnelItem>): GeneratedConfig {
  const spec: TunnelSpec = {
    transport: 'tcp',
    control_port: 8080,
    public_port: 443,
    listen_ip: '0.0.0.0',
    public_host: '0.0.0.0',
    remote_addr: '',
    target_host: '127.0.0.1',
    target_port: 443,
    ...tunnel.spec,
  };

  const proto = spec.transport === 'ws' ? 'ws' : spec.transport === 'grpc' ? 'grpc' : 'tcp';
  const forwardTarget = `${spec.target_host}:${spec.target_port}`;
  const localListen = `${proto}://:${spec.public_port}`;

  const gostCommand = `gost -L=${localListen}/${forwardTarget}`;

  const serverJson = JSON.stringify(
    {
      services: [
        {
          name: `gost_${tunnel.id || 'service'}`,
          addr: `:${spec.public_port}`,
          handler: {
            type: proto,
          },
          listener: {
            type: proto,
          },
          forwarder: {
            nodes: [
              {
                name: 'target_node',
                addr: forwardTarget,
              },
            ],
          },
        },
      ],
    },
    null,
    2
  );

  return {
    serverConfig: serverJson,
    clientConfig: `# GOST Direct Forwarder CLI:\n${gostCommand}`,
    serverFilename: `gost_${tunnel.id || 'config'}.json`,
    clientFilename: `run_gost.sh`,
    serverRunCommand: `gost -C gost_${tunnel.id || 'config'}.json`,
    clientRunCommand: gostCommand,
  };
}

/**
 * Generates Chisel Server & Client commands
 */
export function generateChiselConfig(tunnel: Partial<TunnelItem>): GeneratedConfig {
  const spec: TunnelSpec = {
    transport: 'tcp',
    control_port: 8080,
    public_port: 443,
    listen_ip: '0.0.0.0',
    public_host: '0.0.0.0',
    remote_addr: 'iran-node.example.com:8080',
    target_host: '127.0.0.1',
    target_port: 443,
    token: 'chisel-auth-token',
    ...tunnel.spec,
  };

  const authFlag = spec.token ? `--auth "${spec.token}"` : '';
  const serverCmd = `chisel server --port ${spec.control_port || 8080} --reverse ${authFlag}`.trim();
  const clientCmd = `chisel client ${authFlag} ${spec.remote_addr || 'iran-node.example.com:8080'} R:${spec.public_port}:${spec.target_host}:${spec.target_port}`.trim();

  return {
    serverConfig: `# Chisel Server (Run on Iran Node):\n${serverCmd}`,
    clientConfig: `# Chisel Client (Run on Foreign Server):\n${clientCmd}`,
    serverFilename: `start_chisel_server.sh`,
    clientFilename: `start_chisel_client.sh`,
    serverRunCommand: serverCmd,
    clientRunCommand: clientCmd,
  };
}

/**
 * Generates FRP (frps / frpc) TOML config
 */
export function generateFrpConfig(tunnel: Partial<TunnelItem>): GeneratedConfig {
  const spec: TunnelSpec = {
    transport: 'tcp',
    control_port: 7000,
    public_port: 6000,
    listen_ip: '0.0.0.0',
    public_host: '0.0.0.0',
    remote_addr: 'iran-node.example.com:7000',
    target_host: '127.0.0.1',
    target_port: 8080,
    token: 'frp-secret-token',
    ...tunnel.spec,
  };

  const frpsToml = [
    `bindPort = ${spec.control_port || 7000}`,
    `auth.token = "${spec.token || 'frp-secret-token'}"`,
    `vhostHTTPPort = 80`,
    `vhostHTTPSPort = 443`,
    `log.level = "info"`,
  ].join('\n');

  const frpcToml = [
    `serverAddr = "${(spec.remote_addr || 'iran-node.example.com').split(':')[0]}"`,
    `serverPort = ${spec.control_port || 7000}`,
    `auth.token = "${spec.token || 'frp-secret-token'}"`,
    ``,
    `[[proxies]]`,
    `name = "tunnel_${tunnel.id || 'service'}"`,
    `type = "${spec.transport === 'udp' ? 'udp' : 'tcp'}"`,
    `localIP = "${spec.target_host || '127.0.0.1'}"`,
    `localPort = ${spec.target_port || 8080}`,
    `remotePort = ${spec.public_port || 6000}`,
  ].join('\n');

  return {
    serverConfig: frpsToml,
    clientConfig: frpcToml,
    serverFilename: `frps.toml`,
    clientFilename: `frpc.toml`,
    serverRunCommand: `frps -c frps.toml`,
    clientRunCommand: `frpc -c frpc.toml`,
  };
}

/**
 * Master dispatcher for generating config based on tunnel core
 */
export function generateConfigForTunnel(tunnel: Partial<TunnelItem>): GeneratedConfig {
  switch (tunnel.core) {
    case 'rathole':
      return generateRatholeConfig(tunnel);
    case 'gost':
      return generateGostConfig(tunnel);
    case 'chisel':
      return generateChiselConfig(tunnel);
    case 'frp':
      return generateFrpConfig(tunnel);
    case 'backhaul':
    default:
      return generateBackhaulConfig(tunnel);
  }
}
