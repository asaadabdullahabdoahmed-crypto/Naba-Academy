import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  EmailSender,
  SendEmailOptions,
} from '../../application/ports/email-sender.port';

@Injectable()
export class NodemailerEmailSenderService implements EmailSender {
  private readonly logger = new Logger(NodemailerEmailSenderService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromAddress: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.fromAddress =
      this.configService.get<string>('MAIL_FROM') ||
      'Naba Academy <no-reply@naba.edu.sa>';
    this.appUrl =
      this.configService.get<string>('APP_URL') ||
      'https://naba.edu.sa';

    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
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
    } else {
      this.logger.warn(
        'SMTP credentials not fully configured. Email sending will run in simulation mode (logged to console).',
      );
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        `[SIMULATED EMAIL] To: ${options.to} | Subject: ${options.subject}`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (err: unknown) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${(err as Error).message}`,
      );
      // In production, mail queue retry handles transient SMTP errors
    }
  }

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
    const baseUrl = (
      this.configService.get<string>('FRONTEND_BASE_URL') ||
      this.configService.get<string>('APP_URL') ||
      'https://naba.edu.sa'
    ).replace(/\/+$/, '');

    const isEnglish = locale === 'en';
    const lang = isEnglish ? 'en' : 'ar';
    const resetUrl = `${baseUrl}/${lang}/auth/reset-password#token=${encodeURIComponent(rawToken)}`;

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
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">${isEnglish ? 'أكاديمية نبأ للتعلم الإلكتروني' : 'Naba Academy for E-Learning'}</p>
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
