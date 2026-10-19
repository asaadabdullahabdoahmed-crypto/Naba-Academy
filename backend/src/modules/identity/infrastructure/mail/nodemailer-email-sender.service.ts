import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  EmailSender,
  SendEmailOptions,
} from '../../application/ports/email-sender.port';

/**
 * Production-grade email delivery service with layered provider priority:
 * 1. Resend API (Primary when RESEND_API_KEY is configured)
 * 2. Nodemailer SMTP (Fallback when SMTP credentials are configured)
 * 3. Simulated delivery (Development and Test environments only)
 *
 * In production, silent simulation is strictly prohibited and throws an explicit error.
 */
@Injectable()
export class NodemailerEmailSenderService implements EmailSender {
  private readonly logger = new Logger(NodemailerEmailSenderService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly resendApiKey: string | null = null;
  private readonly resendFrom: string;
  private readonly smtpFromAddress: string;
  private readonly appUrl: string;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    const nodeEnv =
      this.configService.get<string>('NODE_ENV') || process.env.NODE_ENV || 'development';
    this.isProduction = nodeEnv === 'production';

    // 1. Resend API Configuration
    const apiKey = this.configService.get<string>('RESEND_API_KEY')?.trim();
    this.resendApiKey = apiKey && apiKey.length > 0 ? apiKey : null;

    // RESEND_FROM: onboarding@resend.dev is Resend's default sandbox domain for testing only.
    // In production, RESEND_FROM must be explicitly configured when RESEND_API_KEY is configured.
    // In development and test environments, it falls back to 'Naba Academy <onboarding@resend.dev>'.
    const configuredFrom = this.configService.get<string>('RESEND_FROM')?.trim();
    if (configuredFrom && configuredFrom.length > 0) {
      this.resendFrom = configuredFrom;
    } else if (!this.isProduction) {
      this.resendFrom = 'Naba Academy <onboarding@resend.dev>';
    } else {
      this.resendFrom = '';
    }

    // 2. SMTP Configuration (Fallback)
    const configuredMailFrom = this.configService.get<string>('MAIL_FROM')?.trim();
    if (configuredMailFrom && configuredMailFrom.length > 0) {
      this.smtpFromAddress = configuredMailFrom;
    } else if (!this.isProduction) {
      this.smtpFromAddress = 'Naba Academy Dev <dev@localhost>';
    } else {
      this.smtpFromAddress = '';
    }

    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<number>('SMTP_PORT', 587));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Nodemailer initialized with SMTP host: ${host}:${port}`);
      if (this.isProduction && !this.smtpFromAddress) {
        this.logger.error(
          'CRITICAL: MAIL_FROM must be explicitly configured when SMTP is configured in production environment.',
        );
      }
    }

    // 3. Application Base URL for outbound email action links
    const baseUrl =
      this.configService.get<string>('APP_URL') ||
      this.configService.get<string>('FRONTEND_BASE_URL') ||
      'https://naba-academy-frontend.onrender.com';
    this.appUrl = baseUrl.replace(/\/+$/, '');

    // Provider initialization logging and environment safety checks
    if (this.resendApiKey) {
      if (this.isProduction && !this.resendFrom) {
        this.logger.error(
          'CRITICAL: RESEND_FROM must be explicitly configured when RESEND_API_KEY is configured in production environment.',
        );
      } else {
        this.logger.log(
          `Email delivery: Primary provider configured with Resend API (Sender: ${this.resendFrom})`,
        );
      }
      if (this.resendFrom && this.resendFrom.includes('onboarding@resend.dev')) {
        this.logger.warn(
          'Using onboarding@resend.dev as Resend sender. Note: onboarding@resend.dev is strictly for testing/sandbox use and requires a verified domain for production delivery.',
        );
      }
    } else if (this.transporter) {
      this.logger.log('Email delivery: Configured with SMTP fallback provider.');
    } else {
      if (this.isProduction) {
        this.logger.error(
          'CRITICAL: Neither RESEND_API_KEY nor SMTP credentials configured in production environment. Outbound email delivery will fail.',
        );
      } else {
        this.logger.warn(
          'Neither RESEND_API_KEY nor SMTP credentials configured. Email sending will run in simulation mode (logged to console).',
        );
      }
    }
  }

  /**
   * Dispatches email using provider priority:
   * 1. Resend API (Primary)
   * 2. Nodemailer SMTP (Fallback)
   * 3. Console simulation (Development/Test only)
   *
   * In production, throws error if neither provider is configured or if delivery fails.
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    // 1. Primary: Resend REST API
    if (this.resendApiKey) {
      if (this.isProduction && !this.resendFrom) {
        const errorMsg =
          'Email delivery failed: RESEND_FROM must be explicitly configured when RESEND_API_KEY is configured in production environment.';
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }
      try {
        await this.sendViaResend(options);
        return;
      } catch (resendError: unknown) {
        this.logger.error(
          `Resend API delivery failed for ${options.to}: ${(resendError as Error).message}`,
        );

        // Attempt SMTP fallback if configured
        if (this.transporter) {
          this.logger.warn(
            `Attempting SMTP fallback delivery to ${options.to} following Resend failure...`,
          );
          try {
            await this.sendViaSmtp(options);
            return;
          } catch (smtpError: unknown) {
            this.logger.error(
              `SMTP fallback also failed for ${options.to}: ${(smtpError as Error).message}`,
            );
          }
        }

        // Re-throw in production so failures are not silently hidden
        if (this.isProduction) {
          throw resendError;
        }
        return;
      }
    }

    // 2. Secondary: Nodemailer SMTP
    if (this.transporter) {
      try {
        await this.sendViaSmtp(options);
        return;
      } catch (smtpError: unknown) {
        this.logger.error(
          `SMTP delivery failed for ${options.to}: ${(smtpError as Error).message}`,
        );
        if (this.isProduction) {
          throw smtpError;
        }
        return;
      }
    }

    // 3. Fallback: Development simulation only
    if (this.isProduction) {
      const errorMsg = `Email delivery failed for ${options.to}: No email provider configured in production (RESEND_API_KEY or SMTP required).`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    this.logger.log(
      `[SIMULATED EMAIL] To: ${options.to} | Subject: ${options.subject}`,
    );
  }

  /**
   * Internal helper to dispatch email via Resend REST API.
   * Uses native global fetch available in Node.js 22+.
   * Sanitizes all logs to ensure RESEND_API_KEY is never leaked.
   */
  private async sendViaResend(options: SendEmailOptions): Promise<void> {
    const payload: {
      from: string;
      to: string[];
      subject: string;
      html: string;
      text?: string;
    } = {
      from: this.resendFrom,
      to: [options.to],
      subject: options.subject,
      html: options.html,
    };

    if (options.text) {
      payload.text = options.text;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorJson = (await response.json()) as { message?: string; name?: string };
        errorDetail = errorJson?.message || JSON.stringify(errorJson);
      } catch {
        errorDetail = await response.text().catch(() => '');
      }

      throw new Error(
        `Resend API request failed with HTTP ${response.status}: ${errorDetail}`,
      );
    }

    this.logger.log(`Email successfully dispatched via Resend API to ${options.to}`);
  }

  /**
   * Internal helper to dispatch email via Nodemailer SMTP.
   */
  private async sendViaSmtp(options: SendEmailOptions): Promise<void> {
    if (!this.transporter) {
      throw new Error('SMTP transporter is not configured');
    }

    if (this.isProduction && !this.smtpFromAddress) {
      const errorMsg =
        'Email delivery failed: MAIL_FROM must be explicitly configured when sending via SMTP in production environment.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    await this.transporter.sendMail({
      from: this.smtpFromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    this.logger.log(`Email successfully dispatched via SMTP to ${options.to}`);
  }

  /**
   * Dispatches academic account email verification link with URL fragment token handoff.
   */
  async sendVerificationEmail(to: string, rawToken: string): Promise<void> {
    const verificationUrl = `${this.appUrl}/verify-email#token=${encodeURIComponent(
      rawToken,
    )}`;

    const subject = 'تأكيد البريد الإلكتروني — أكاديمية نبأ | Verify Your Email';

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f8fb; padding: 24px; color: #17202a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    <tr>
      <td style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">أكاديمية نبأ للتعلم الإلكتروني</h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Naba Academy for E-Learning</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 24px; text-align: right;">
        <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">مرحباً بك في منصة أكاديمية نبأ</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          شكراً لتسجيلك. يرجى الضغط على الزر أدناه لتأكيد عنوان بريدك الإلكتروني وتفعيل حسابك الأكاديمي:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            تأكيد حسابي الآن / Verify Email
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
          أو يمكنك نسخ الرابط التالي ولصقه في متصفحك:<br>
          <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
        </p>
        <p style="color: #94a3b8; font-size: 11px; margin-top: 24px;">
          ملاحظة: هذا الرابط صالح لمدة 24 ساعة فقط. إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذه الرسالة.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await this.sendEmail({
      to,
      subject,
      html,
      text: `مرحباً بك في منصة أكاديمية نبأ. لتفعيل حسابك، يرجى زيارة الرابط التالي: ${verificationUrl}`,
    });
  }

  /**
   * STEP 07D-3: Dispatches password reset email with URL fragment token handoff.
   *
   * Invariants:
   * 1. URL fragment used (#token=) instead of query parameter (?token=) to prevent leakage.
   * 2. Supports Arabic ('ar') and English ('en') localization.
   * 3. References 30-minute token TTL.
   * 4. Does not log raw token or email body contents.
   */
  async sendPasswordResetEmail(
    to: string,
    rawToken: string,
    locale: string = 'ar',
  ): Promise<void> {
    const isEnglish = locale === 'en';
    const lang = isEnglish ? 'en' : 'ar';
    const resetUrl = `${this.appUrl}/${lang}/auth/reset-password#token=${encodeURIComponent(
      rawToken,
    )}`;

    const subject = isEnglish
      ? 'Reset Your Password — Naba Academy | إعادة تعيين كلمة المرور'
      : 'إعادة تعيين كلمة المرور — أكاديمية نبأ | Reset Your Password';

    const headerTitle = isEnglish
      ? 'Naba Academy for E-Learning'
      : 'أكاديمية نبأ للتعلم الإلكتروني';

    const bodyTitle = isEnglish
      ? 'Password Reset Request'
      : 'طلب إعادة تعيين كلمة المرور';

    const greetingText = isEnglish
      ? 'We received a request to reset the password for your account at Naba Academy. Click the button below to choose a new password:'
      : 'تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في أكاديمية نبأ. يرجى الضغط على الزر أدناه لاختيار كلمة مرور جديدة:';

    const buttonText = isEnglish
      ? 'Reset Password / إعادة تعيين كلمة المرور'
      : 'إعادة تعيين كلمة المرور / Reset Password';

    const copyText = isEnglish
      ? 'Or you can copy and paste the following link into your browser:'
      : 'أو يمكنك نسخ الرابط التالي ولصقه في متصفحك:';

    const ttlNotice = isEnglish
      ? 'Note: This link is valid for 30 minutes only and can be used once. If you did not request a password reset, you can safely ignore this email.'
      : 'ملاحظة: هذا الرابط صالح لمدة 30 دقيقة فقط ويمكن استخدامه لمرة واحدة. إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان.';

    const direction = isEnglish ? 'ltr' : 'rtl';
    const align = isEnglish ? 'left' : 'right';

    const html = `
<!DOCTYPE html>
<html lang="${lang}" dir="${direction}">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f8fb; padding: 24px; color: #17202a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    <tr>
      <td style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">${headerTitle}</h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">${
          isEnglish ? 'أكاديمية نبأ للتعلم الإلكتروني' : 'Naba Academy for E-Learning'
        }</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 24px; text-align: ${align};">
        <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">${bodyTitle}</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          ${greetingText}
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            ${buttonText}
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
          ${copyText}<br>
          <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="color: #94a3b8; font-size: 11px; margin-top: 24px;">
          ${ttlNotice}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await this.sendEmail({
      to,
      subject,
      html,
      text: `${bodyTitle}\n\n${greetingText}\n${resetUrl}\n\n${ttlNotice}`,
    });
  }
}
