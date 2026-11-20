import { ExecutionContext } from '@nestjs/common';
import { SessionRevokedException } from '../../domain/identity.errors';
import { SessionService } from '../../application/services/session.service';
import { SessionAuthGuard } from './session-auth.guard';

describe('SessionAuthGuard', () => {
  const request = { cookies: {} };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  const sessionService = {
    validateSession: jest.fn(),
  } as unknown as jest.Mocked<Pick<SessionService, 'validateSession'>>;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(request, { cookies: {} });
  });

  it('rejects anonymous requests without asking for an identity', async () => {
    const guard = new SessionAuthGuard(sessionService as never);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      SessionRevokedException,
    );
    expect(sessionService.validateSession).not.toHaveBeenCalled();
  });

  it('attaches only the server-validated session and user', async () => {
    Object.assign(request, {
      cookies: { naba_session: 'opaque-session-token' },
    });
    const validated = {
      session: { id: 'session-id' },
      user: { id: 'user-id', accountStatus: 'active' },
    };
    sessionService.validateSession.mockResolvedValue(validated as never);
    const guard = new SessionAuthGuard(sessionService as never);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(sessionService.validateSession).toHaveBeenCalledWith(
      'opaque-session-token',
    );
    expect(request).toMatchObject({
      session: validated.session,
      user: validated.user,
    });
  });
});
