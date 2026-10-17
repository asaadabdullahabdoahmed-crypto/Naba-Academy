import { ConfigService } from '@nestjs/config';
import { NodemailerEmailSenderService } from './nodemailer-email-sender.service';

describe('NodemailerEmailSenderService (Hybrid Resend & SMTP)', () => {
  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('Simulation Mode (Development)', () => {
    let service: NodemailerEmailSenderService;
    let configService: ConfigService;

    beforeEach(() => {
      configService = {
        get: jest.fn((key: string, defaultValue?: unknown) => {
          if (key === 'NODE_ENV') return 'development';
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

    it('should simulate sendEmail when neither Resend nor SMTP is configured', async () => {
      await expect(
        service.sendEmail({
          to: 'student@example.com',
          subject: 'Test Subject',
          html: '<p>Test</p>',
        }),
      ).resolves.not.toThrow();
    });

    it('should simulate sendVerificationEmail when neither provider is configured', async () => {
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

  describe('Production Safety Guard', () => {
    it('should throw an error in production when neither Resend nor SMTP is configured', async () => {
      const configService = {
        get: jest.fn((key: string, defaultValue?: unknown) => {
          if (key === 'NODE_ENV') return 'production';
          if (key === 'APP_URL') return 'https://naba-academy-frontend.onrender.com';
          return defaultValue;
        }),
      } as unknown as ConfigService;

      const service = new NodemailerEmailSenderService(configService);

      await expect(
        service.sendEmail({
          to: 'student@example.com',
          subject: 'Test Subject',
          html: '<p>Test</p>',
        }),
      ).rejects.toThrow(/No email provider configured in production/);
    });
  });

  describe('Resend API (Primary Provider)', () => {
    let mockFetch: jest.Mock;

    beforeEach(() => {
      mockFetch = jest.fn();
      global.fetch = mockFetch;
    });

    it('should dispatch email via Resend API when RESEND_API_KEY is configured', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 'email-resend-id-123' }),
      });

      const configService = {
        get: jest.fn((key: string, defaultValue?: unknown) => {
          if (key === 'NODE_ENV') return 'production';
          if (key === 'RESEND_API_KEY') return 're_test_secret_key_123';
          if (key === 'RESEND_FROM') return 'Naba Academy <onboarding@resend.dev>';
          if (key === 'APP_URL') return 'https://naba-academy-frontend.onrender.com';
          return defaultValue;
        }),
      } as unknown as ConfigService;

      const service = new NodemailerEmailSenderService(configService);

      await service.sendEmail({
        to: 'student@example.com',
        subject: 'Welcome to Naba',
        html: '<p>Welcome</p>',
        text: 'Welcome',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer re_test_secret_key_123',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Naba Academy <onboarding@resend.dev>',
            to: ['student@example.com'],
            subject: 'Welcome to Naba',
            html: '<p>Welcome</p>',
            text: 'Welcome',
          }),
        }),
      );
    });

    it('should throw an error in production when Resend API returns HTTP error and no SMTP fallback', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Domain not verified' }),
      });

      const configService = {
        get: jest.fn((key: string, defaultValue?: unknown) => {
          if (key === 'NODE_ENV') return 'production';
          if (key === 'RESEND_API_KEY') return 're_test_secret_key_123';
          if (key === 'APP_URL') return 'https://naba-academy-frontend.onrender.com';
          return defaultValue;
        }),
      } as unknown as ConfigService;

      const service = new NodemailerEmailSenderService(configService);

      await expect(
        service.sendEmail({
          to: 'student@example.com',
          subject: 'Welcome to Naba',
          html: '<p>Welcome</p>',
        }),
      ).rejects.toThrow(/Resend API request failed with HTTP 403/);
    });

    it('should fallback to SMTP if Resend API fails and SMTP is configured', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal Server Error at Resend' }),
      });

      const configService = {
        get: jest.fn((key: string, defaultValue?: unknown) => {
          if (key === 'NODE_ENV') return 'production';
          if (key === 'RESEND_API_KEY') return 're_test_secret_key_123';
          if (key === 'SMTP_HOST') return 'smtp.example.com';
          if (key === 'SMTP_PORT') return 587;
          if (key === 'SMTP_USER') return 'smtp_user';
          if (key === 'SMTP_PASS') return 'smtp_pass';
          if (key === 'APP_URL') return 'https://naba-academy-frontend.onrender.com';
          return defaultValue;
        }),
      } as unknown as ConfigService;

      const service = new NodemailerEmailSenderService(configService);

      // Spy on internal sendViaSmtp
      const sendViaSmtpSpy = jest
        .spyOn(service as unknown as { sendViaSmtp: () => Promise<void> }, 'sendViaSmtp')
        .mockResolvedValueOnce();

      await service.sendEmail({
        to: 'student@example.com',
        subject: 'Fallback Test',
        html: '<p>Fallback</p>',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(sendViaSmtpSpy).toHaveBeenCalledTimes(1);
    });
  });
});
