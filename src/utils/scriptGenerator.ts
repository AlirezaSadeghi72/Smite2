import { NodeType } from '../types';

export interface NodeInstallOptions {
  panelUrl: string;
  nodeType: NodeType;
  token?: string;
  fingerprint?: string;
  nodeName?: string;
}

/**
 * Generates the one-line bash install command for Iranian or Foreign nodes
 */
export function generateNodeInstallCommand(options: NodeInstallOptions): string {
  const panel = options.panelUrl.replace(/\/+$/, '');
  const typeFlag = options.nodeType === 'iran' ? '--iran' : '--foreign';
  const nameFlag = options.nodeName ? ` --name "${options.nodeName}"` : '';
  const tokenFlag = options.token ? ` --token "${options.token}"` : '';

  return `curl -fsSL ${panel}/scripts/smite-node.sh | sudo bash -s -- --panel ${panel} ${typeFlag}${nameFlag}${tokenFlag}`;
}

/**
 * Generates Docker Compose content for running an edge node
 */
export function generateDockerComposeForNode(options: NodeInstallOptions): string {
  const role = options.nodeType === 'iran' ? 'iran-node' : 'foreign-node';
  return `version: '3.8'

services:
  smite-node:
    image: zzedix/smite-node:latest
    container_name: smite-${role}
    restart: unless-stopped
    network_mode: host
    environment:
      - PANEL_URL=${options.panelUrl}
      - NODE_TYPE=${options.nodeType}
      - NODE_NAME=${options.nodeName || 'smite-edge-1'}
      - NODE_SECRET_TOKEN=${options.token || 'smite-node-secret'}
    volumes:
      - ./certs:/app/certs:ro
      - ./data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock:ro
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
`;
}

/**
 * Generates mock or real CA Certificate bundle representation
 */
export function generateMockCaCertificate(type: 'iran' | 'foreign' | 'root'): string {
  const cn = type === 'iran' ? 'Smite Iran Node CA' : type === 'foreign' ? 'Smite Foreign Node CA' : 'Smite Root Authority';
  return `-----BEGIN CERTIFICATE-----
MIIDRjCCAi6gAwIBAgIUW9z9P8z7L3rSmiteNodeCAwDQYJKoZIhvcNAQELBQAw
GDEWMBQGA1UEAwwN${Buffer.from(cn).toString('base64').substring(0, 16)}MB4XDTI1MDEwMTAwMDAwMFoX
DTI2MDEwMTAwMDAwMFowGDEWMBQGA1UEAwwN${Buffer.from(cn).toString('base64').substring(0, 16)}MIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA10qN+7sBvYkSmiteCert981a
-----END CERTIFICATE-----`;
}
