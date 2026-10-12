import { ConfigService } from '@nestjs/config';
import { NodemailerEmailSenderService } from './nodemailer-email-sender.service';

describe('NodemailerEmailSenderService', () => {
  let service: NodemailerEmailSenderService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === 'MAIL_FROM') return 'test@naba.edu.sa';
        if (key === 'APP_URL') return 'https://test.naba.edu.sa';
        return defaultValue;
      }),
    } as unknown as ConfigService;

    service = new NodemailerEmailSenderService(configService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should simulate sendEmail when SMTP credentials are not configured', async () => {
    await expect(
      service.sendEmail({
        to: 'student@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      }),
    ).resolves.not.toThrow();
  });

  it('should simulate sendVerificationEmail when SMTP credentials are not configured', async () => {
    await expect(
      service.sendVerificationEmail('student@example.com', 'raw-token-12345'),
    ).resolves.not.toThrow();
  });

  it('should simulate sendPasswordResetEmail in Arabic using URL fragment without throwing', async () => {
    await expect(
      service.sendPasswordResetEmail('student@example.com', 'raw-reset-token-abc', 'ar'),
    ).resolves.not.toThrow();
  });

  it('should simulate sendPasswordResetEmail in English using URL fragment without throwing', async () => {
    await expect(
      service.sendPasswordResetEmail('student@example.com', 'raw-reset-token-xyz', 'en'),
    ).resolves.not.toThrow();
  });
});
