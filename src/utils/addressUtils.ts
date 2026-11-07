/**
 * Utility functions for parsing and formatting IP/Host and Port pairs.
 */

export interface HostPort {
  host: string;
  port: number;
  isValid: boolean;
  isIpv6: boolean;
}

/**
 * Validates a TCP/UDP port number
 */
export function isValidPort(port: number | string): boolean {
  const n = typeof port === 'string' ? parseInt(port.trim(), 10) : port;
  return Number.isInteger(n) && n >= 1 && n <= 65535;
}

/**
 * Parses an address string like "1.2.3.4:8080", "[2001:db8::1]:443", or "example.com:3000"
 */
export function parseAddressPort(address: string, defaultPort = 8080): HostPort {
  const trimmed = (address || '').trim();
  if (!trimmed) {
    return { host: '', port: defaultPort, isValid: false, isIpv6: false };
  }

  // IPv6 bracketed: [::1]:8080
  if (trimmed.startsWith('[')) {
    const closeBracketIdx = trimmed.indexOf(']');
    if (closeBracketIdx === -1) {
      return { host: trimmed, port: defaultPort, isValid: false, isIpv6: true };
    }
    const host = trimmed.substring(1, closeBracketIdx);
    const rest = trimmed.substring(closeBracketIdx + 1);
    let port = defaultPort;
    if (rest.startsWith(':')) {
      const p = parseInt(rest.substring(1), 10);
      if (isValidPort(p)) {
        port = p;
      }
    }
    return { host, port, isValid: host.length > 0 && isValidPort(port), isIpv6: true };
  }

  // Check if multiple colons without brackets (plain IPv6)
  const colonCount = (trimmed.match(/:/g) || []).length;
  if (colonCount > 1) {
    // raw IPv6 without port
    return { host: trimmed, port: defaultPort, isValid: true, isIpv6: true };
  }

  if (colonCount === 1) {
    const [h, pStr] = trimmed.split(':');
    const p = parseInt(pStr, 10);
    const validPort = isValidPort(p);
    return {
      host: h,
      port: validPort ? p : defaultPort,
      isValid: h.length > 0 && validPort,
      isIpv6: false,
    };
  }

  // Only host, no port provided
  return {
    host: trimmed,
    port: defaultPort,
    isValid: trimmed.length > 0,
    isIpv6: false,
  };
}

/**
 * Formats a host and port into a clean standard representation
 */
export function formatAddressPort(host: string, port: number | string): string {
  const cleanHost = (host || '').trim();
  const cleanPort = String(port).trim();
  if (!cleanHost) return '';
  if (cleanHost.includes(':') && !cleanHost.startsWith('[')) {
    return `[${cleanHost}]:${cleanPort}`;
  }
  return `${cleanHost}:${cleanPort}`;
}
