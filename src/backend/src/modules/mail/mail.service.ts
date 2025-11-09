import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('mail.host');
    const port = this.config.get<number>('mail.port');
    const secure = this.config.get<boolean>('mail.secure');
    const user = this.config.get<string>('mail.user');
    const pass = this.config.get<string>('mail.pass');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async send(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    attachments?: MailAttachment[];
  }): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.get<string>('mail.from') || this.config.get<string>('mail.user'),
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: (options.attachments || []).map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
  }
}


