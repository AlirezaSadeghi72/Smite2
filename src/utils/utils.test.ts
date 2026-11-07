import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAddressPort, formatAddressPort, isValidPort } from './addressUtils';
import { formatTraffic, formatRate, formatUptime } from './formatTraffic';
import {
  generateBackhaulConfig,
  generateRatholeConfig,
  generateGostConfig,
  generateChiselConfig,
  generateFrpConfig,
  generateConfigForTunnel,
} from './configGenerator';
import { generateNodeInstallCommand, generateDockerComposeForNode } from './scriptGenerator';

test('addressUtils: isValidPort detects valid port range', () => {
  assert.equal(isValidPort(80), true);
  assert.equal(isValidPort(443), true);
  assert.equal(isValidPort(65535), true);
  assert.equal(isValidPort(0), false);
  assert.equal(isValidPort(70000), false);
  assert.equal(isValidPort(-5), false);
  assert.equal(isValidPort('8080'), true);
  assert.equal(isValidPort('invalid'), false);
});

test('addressUtils: parseAddressPort parses host and port variations', () => {
  const r1 = parseAddressPort('1.2.3.4:8080');
  assert.equal(r1.host, '1.2.3.4');
  assert.equal(r1.port, 8080);
  assert.equal(r1.isValid, true);
  assert.equal(r1.isIpv6, false);

  const r2 = parseAddressPort('[2001:db8::1]:443');
  assert.equal(r2.host, '2001:db8::1');
  assert.equal(r2.port, 443);
  assert.equal(r2.isValid, true);
  assert.equal(r2.isIpv6, true);

  const r3 = parseAddressPort('example.com');
  assert.equal(r3.host, 'example.com');
  assert.equal(r3.port, 8080); // default
  assert.equal(r3.isValid, true);

  const rEmpty = parseAddressPort('');
  assert.equal(rEmpty.isValid, false);
});

test('addressUtils: formatAddressPort properly brackets IPv6', () => {
  assert.equal(formatAddressPort('127.0.0.1', 3080), '127.0.0.1:3080');
  assert.equal(formatAddressPort('2001:db8::1', 80), '[2001:db8::1]:80');
});

test('formatTraffic: correctly converts bytes to human-readable units', () => {
  assert.equal(formatTraffic(0), '0 B');
  assert.equal(formatTraffic(1024), '1 KB');
  assert.equal(formatTraffic(1048576), '1 MB');
  assert.equal(formatTraffic(1073741824), '1 GB');
  assert.equal(formatRate(5242880), '5 MB/s');
  assert.equal(formatUptime(3665), '1h 1m');
  assert.equal(formatUptime(90000), '1d 1h');
});

test('configGenerator: Backhaul TOML generation', () => {
  const config = generateBackhaulConfig({
    id: 'tun-1',
    spec: {
      transport: 'ws',
      control_port: 3080,
      public_port: 443,
      listen_ip: '0.0.0.0',
      public_host: 'iran.node.com',
      remote_addr: 'iran.node.com:3080',
      target_host: '127.0.0.1',
      target_port: 8080,
      token: 'secret123',
    },
  });

  assert.match(config.serverConfig, /transport = "ws"/);
  assert.match(config.serverConfig, /token = "secret123"/);
  assert.match(config.clientConfig, /remote_addr = "iran.node.com:3080"/);
  assert.match(config.clientConfig, /"443" = "127.0.0.1:8080"/);
});

test('configGenerator: Rathole TOML generation', () => {
  const config = generateRatholeConfig({
    id: 'rat-12345678',
    spec: {
      transport: 'tcp',
      control_port: 2333,
      public_port: 9000,
      listen_ip: '0.0.0.0',
      public_host: '0.0.0.0',
      remote_addr: 'iran.domain:2333',
      target_host: '127.0.0.1',
      target_port: 8080,
      token: 'token999',
    },
  });

  assert.match(config.serverConfig, /bind_addr = "0.0.0.0:2333"/);
  assert.match(config.serverConfig, /\[server\.services\.service_rat-1234\]/);
  assert.match(config.clientConfig, /local_addr = "127.0.0.1:8080"/);
});

test('configGenerator: GOST CLI generation', () => {
  const config = generateGostConfig({
    id: 'gost-1',
    spec: {
      transport: 'tcp',
      control_port: 8080,
      public_port: 8443,
      listen_ip: '0.0.0.0',
      public_host: '0.0.0.0',
      remote_addr: '',
      target_host: '192.168.1.50',
      target_port: 443,
    },
  });

  assert.match(config.serverRunCommand, /gost -C gost_gost-1\.json/);
  assert.match(config.clientRunCommand, /gost -L=tcp:\/\/:\d+\/192\.168\.1\.50:443/);
});

test('configGenerator: Chisel and FRP generators dispatching', () => {
  const chisel = generateChiselConfig({
    spec: {
      transport: 'tcp',
      control_port: 8080,
      public_port: 443,
      listen_ip: '0.0.0.0',
      public_host: '0.0.0.0',
      remote_addr: 'iran:8080',
      target_host: '127.0.0.1',
      target_port: 443,
      token: 'mytoken',
    },
  });
  assert.match(chisel.serverRunCommand, /chisel server --port 8080 --reverse --auth "mytoken"/);

  const frp = generateFrpConfig({
    spec: {
      transport: 'tcp',
      control_port: 7000,
      public_port: 6000,
      listen_ip: '0.0.0.0',
      public_host: '0.0.0.0',
      remote_addr: 'iran:7000',
      target_host: '127.0.0.1',
      target_port: 8080,
      token: 'frp-token',
    },
  });
  assert.match(frp.serverConfig, /bindPort = 7000/);

  const dispatched = generateConfigForTunnel({ core: 'frp', spec: { transport: 'tcp', control_port: 7000, public_port: 6000, listen_ip: '0.0.0.0', public_host: '', remote_addr: '', target_host: '127.0.0.1', target_port: 8080 } });
  assert.equal(dispatched.serverFilename, 'frps.toml');
});

test('scriptGenerator: generateNodeInstallCommand generates correct flag', () => {
  const cmdIran = generateNodeInstallCommand({
    panelUrl: 'https://panel.example.com/',
    nodeType: 'iran',
    nodeName: 'iran-edge-tehran',
    token: 'auth-token-123',
  });
  assert.match(cmdIran, /curl -fsSL https:\/\/panel\.example\.com\/scripts\/smite-node\.sh/);
  assert.match(cmdIran, /--iran/);
  assert.match(cmdIran, /--name "iran-edge-tehran"/);
  assert.match(cmdIran, /--token "auth-token-123"/);

  const cmdForeign = generateNodeInstallCommand({
    panelUrl: 'https://panel.example.com',
    nodeType: 'foreign',
    nodeName: 'foreign-frankfurt',
  });
  assert.match(cmdForeign, /--foreign/);
  assert.match(cmdForeign, /--name "foreign-frankfurt"/);

  const compose = generateDockerComposeForNode({
    panelUrl: 'https://panel.example.com',
    nodeType: 'iran',
    nodeName: 'node-compose',
  });
  assert.match(compose, /image: zzedix\/smite-node:latest/);
  assert.match(compose, /PANEL_URL=https:\/\/panel\.example\.com/);
});
