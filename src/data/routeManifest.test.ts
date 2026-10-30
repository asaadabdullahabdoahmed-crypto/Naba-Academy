import { describe, expect, it } from 'vitest';
import { PORTAL_CONFIGS } from '../config/portalNavigation';
import { CANONICAL_ROUTES } from './routeManifest';

describe('academic structure route integration', () => {
  it('exposes the admin academic structure route in the portal and canonical manifest', () => {
    const adminNavigation = PORTAL_CONFIGS.admin.items.find((item) => item.path === '/admin/departments');
    const canonicalRoute = CANONICAL_ROUTES.find((route) => route.path === '/admin/departments');

    expect(adminNavigation).toMatchObject({
      id: 'adm-dept',
      titleAr: 'الهيكل الأكاديمي',
      titleEn: 'Academic Structure',
    });
    expect(canonicalRoute).toMatchObject({
      area: 'ADMIN',
      titleAr: 'الهيكل الأكاديمي',
      titleEn: 'Academic Structure',
    });
  });
});
