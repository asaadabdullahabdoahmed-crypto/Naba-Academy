import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n/I18nProvider';
import { useAuth } from '../../context/AuthContext';
import { RegisterPage } from './RegisterPage';
import { ResetPasswordPage } from './ResetPasswordPage';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

function renderAuthPage(page: React.ReactNode, path = '/en/auth/register') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <I18nProvider locale="en">{page}</I18nProvider>
    </MemoryRouter>,
  );
}

describe('authentication page controls', () => {
  afterEach(() => {
    cleanup();
  });

  it('reveals and hides the registration password accessibly', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn(),
    });

    renderAuthPage(<RegisterPage locale="en" />);

    const password = screen.getByLabelText('Password');
    expect(password.getAttribute('type')).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password.getAttribute('type')).toBe('text');
    expect(screen.getByRole('button', { name: 'Hide password' }).getAttribute('aria-pressed'))
      .toBe('true');
  });

  it('reveals only the password confirmation when its visibility control is activated', () => {
    renderAuthPage(
      <ResetPasswordPage locale="en" />,
      '/en/auth/reset-password?token=reset-token',
    );

    const password = screen.getByLabelText('New Password (min 12 characters)');
    const confirmation = screen.getByLabelText('Confirm Password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password confirmation' }));

    expect(password.getAttribute('type')).toBe('password');
    expect(confirmation.getAttribute('type')).toBe('text');
  });

  it('preserves reset-link query and fragment values when switching languages', () => {
    renderAuthPage(
      <ResetPasswordPage locale="en" />,
      '/en/auth/reset-password?source=email#token=fragment-token',
    );

    expect(screen.getByRole('link', { name: 'العربية' }).getAttribute('href'))
      .toBe('/ar/auth/reset-password?source=email#token=fragment-token');
  });
});
