import { Request } from 'express';
import { getClientIp } from './client-ip.util';

describe('getClientIp', () => {
  it('strictly returns socket remote address when trustProxy is false, ignoring x-forwarded-for', () => {
    const req = {
      socket: { remoteAddress: '203.0.113.195' },
      headers: {
        'x-forwarded-for': '198.51.100.44, 192.0.2.1',
      },
    } as unknown as Request;

    const ip = getClientIp(req, false);
    expect(ip).toBe('203.0.113.195');
  });

  it('respects x-forwarded-for when trustProxy is explicitly true', () => {
    const req = {
      socket: { remoteAddress: '10.0.0.1' },
      headers: {
        'x-forwarded-for': '198.51.100.44, 10.0.0.1',
      },
    } as unknown as Request;

    const ip = getClientIp(req, true);
    expect(ip).toBe('198.51.100.44');
  });

  it('strips ::ffff: prefix from IPv4-mapped IPv6 address', () => {
    const req = {
      socket: { remoteAddress: '::ffff:192.168.1.50' },
      headers: {},
    } as unknown as Request;

    const ip = getClientIp(req, false);
    expect(ip).toBe('192.168.1.50');
  });

  it('normalizes ::1 loopback to 127.0.0.1', () => {
    const req = {
      socket: { remoteAddress: '::1' },
      headers: {},
    } as unknown as Request;

    const ip = getClientIp(req, false);
    expect(ip).toBe('127.0.0.1');
  });

  it('falls back to 127.0.0.1 when socket remoteAddress and ip are undefined', () => {
    const req = {
      headers: {},
    } as unknown as Request;

    const ip = getClientIp(req, false);
    expect(ip).toBe('127.0.0.1');
  });
});
