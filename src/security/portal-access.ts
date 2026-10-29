export type PortalKey = 'student' | 'instructor' | 'department' | 'admin' | 'alumni';

const requiredRoles: Record<PortalKey, string | null> = {
  student: 'student',
  instructor: 'instructor',
  department: 'department_head',
  admin: 'system_admin',
  alumni: null,
};

export function canAccessPortal(
  roles: readonly { code: string }[],
  portalKey: PortalKey,
): boolean {
  const requiredRole = requiredRoles[portalKey];
  return requiredRole !== null && roles.some((role) => role.code === requiredRole);
}
