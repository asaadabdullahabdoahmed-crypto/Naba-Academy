/**
 * API Transport Contracts — Root Barrel Export
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Target API Version: /api/v1
 *
 * This contract layer defines standard transport envelopes and request/response
 * wire shapes crossing the future HTTP boundary between React frontend and Backend.
 *
 * Dependency direction: contracts -> types (NEVER types -> contracts).
 */

export * from './common';
export * from './identity';
export * from './auth';
export * from './academic';
export * from './student';
export * from './assessment';
export * from './finance';
export * from './documents';
export * from './communication';
