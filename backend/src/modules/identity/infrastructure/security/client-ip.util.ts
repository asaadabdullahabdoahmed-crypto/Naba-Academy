import { Request } from 'express';

/**
 * Safely extracts client IP address respecting the application's proxy trust policy.
 * X-Forwarded-For is strictly ignored unless trustProxy is explicitly enabled.
 */
export function getClientIp(req: Request, trustProxy = false): string {
  let ip: string | undefined;

  if (trustProxy) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
      ip = forwarded.split(',')[0].trim();
    } else if (Array.isArray(forwarded) && forwarded.length > 0) {
      ip = forwarded[0].trim();
    } else {
      ip = req.ip || req.socket.remoteAddress;
    }
  } else {
    // Untrusted proxy mode: strictly rely on direct socket remote address
    ip = req.socket?.remoteAddress || req.ip;
  }

  if (!ip) {
    return '127.0.0.1';
  }

  // Normalize IPv6-mapped IPv4 addresses (e.g., ::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }

  // Normalize IPv6 loopback
  if (ip === '::1') {
    return '127.0.0.1';
  }

  return ip;
}
