import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly fromEmail: string;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not defined in environment variables');
    }
    sgMail.setApiKey(apiKey);
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@lovedate.app';
  }

  async sendVerificationEmail(to: string, code: string): Promise<boolean> {
    const subject = 'Your Verification Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, you can safely ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This email was sent by LoveDate. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject,
      html,
    });
  }

  async sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<boolean> {
    try {
      await sgMail.send({
        to,
        from: from || this.fromEmail,
        subject,
        html,
      });
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      if (error instanceof Error && 'response' in error) {
        console.error('SendGrid error response:', (error as any).response.body);
      }
      throw new Error('Failed to send email');
    }
  }
}
