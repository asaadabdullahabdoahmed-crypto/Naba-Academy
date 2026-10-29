import assert from 'node:assert/strict';
import test from 'node:test';
import { canAccessPortal } from './portal-access';

test('grants access only to the portal matching an assigned canonical role', () => {
  assert.equal(canAccessPortal([{ code: 'student' }], 'student'), true);
  assert.equal(canAccessPortal([{ code: 'instructor' }], 'instructor'), true);
  assert.equal(canAccessPortal([{ code: 'department_head' }], 'department'), true);
  assert.equal(canAccessPortal([{ code: 'system_admin' }], 'admin'), true);

  assert.equal(canAccessPortal([{ code: 'student' }], 'admin'), false);
  assert.equal(canAccessPortal([], 'student'), false);
});

test('does not grant Teacher or Administrator access from unrelated roles', () => {
  assert.equal(canAccessPortal([{ code: 'system_admin' }], 'instructor'), false);
  assert.equal(canAccessPortal([{ code: 'instructor' }], 'admin'), false);
  assert.equal(canAccessPortal([{ code: 'department_head' }], 'admin'), false);
});

test('does not infer alumni eligibility from an authentication role', () => {
  assert.equal(canAccessPortal([{ code: 'student' }], 'alumni'), false);
});
