export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailSender {
  sendEmail(options: SendEmailOptions): Promise<void>;
  sendVerificationEmail(to: string, rawToken: string): Promise<void>;
  sendPasswordResetEmail(to: string, rawToken: string, locale?: string): Promise<void>;
}

export const EMAIL_SENDER = Symbol('EMAIL_SENDER');
