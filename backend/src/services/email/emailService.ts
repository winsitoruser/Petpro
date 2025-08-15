/**
 * Email Service
 * 
 * Provides email sending functionality using templates
 */
import nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../../utils/logger';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: any;
    contentType?: string;
  }>;
}

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.mailtrap.io';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '2525', 10);
const EMAIL_USER = process.env.EMAIL_USER || 'username';
const EMAIL_PASS = process.env.EMAIL_PASS || 'password';
const EMAIL_FROM = process.env.EMAIL_FROM || 'petpro@example.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'PetPro';
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates/email');

// Initialize transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Load and compile email template
 */
const getTemplate = async (templateName: string): Promise<handlebars.TemplateDelegate> => {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
  
  try {
    const templateContent = await fs.promises.readFile(templatePath, 'utf-8');
    return handlebars.compile(templateContent);
  } catch (error: any) {
    logger.error('Failed to load email template', { templateName, error: error.message });
    throw new Error(`Failed to load email template: ${templateName}`);
  }
};

/**
 * Send email using template
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // Load and compile template
    const template = await getTemplate(options.template);
    
    // Render the template with context data
    const html = template(options.context);
    
    // Configure email
    const mailOptions = {
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(',') : options.cc) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(',') : options.bcc) : undefined,
      subject: options.subject,
      html,
      attachments: options.attachments || [],
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully', { 
      messageId: info.messageId, 
      to: options.to, 
      subject: options.subject
    });
    
    return true;
  } catch (error: any) {
    logger.error('Failed to send email', { 
      to: options.to, 
      subject: options.subject,
      error: error.message
    });
    
    return false;
  }
};

/**
 * Verify email connection
 */
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    logger.info('Email service is ready');
    return true;
  } catch (error: any) {
    logger.error('Email service verification failed', { error: error.message });
    return false;
  }
};
