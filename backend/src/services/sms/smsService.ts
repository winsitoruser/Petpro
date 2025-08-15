/**
 * SMS Service
 * 
 * Handles sending SMS messages using configurable providers.
 * Supports multiple SMS providers with failover capabilities.
 */
import logger from '../../utils/logger';
import { metricsService } from '../monitoring/metricsService';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// SMS Provider interfaces
interface SMSProvider {
  name: string;
  send(to: string, message: string): Promise<SMSResult>;
  checkStatus(messageId: string): Promise<SMSStatus>;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  errorMessage?: string;
  provider?: string;
  cost?: number;
}

type SMSStatus = 'delivered' | 'failed' | 'pending' | 'unknown';

interface SMSOptions {
  to: string;
  message: string;
  priority?: 'high' | 'normal' | 'low';
  callbackUrl?: string;
}

// Twilio SMS Provider implementation
class TwilioProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
  }
  
  get name(): string {
    return 'twilio';
  }
  
  async send(to: string, message: string): Promise<SMSResult> {
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      logger.error('Twilio credentials not configured');
      return {
        success: false,
        provider: this.name,
        errorMessage: 'Twilio not configured'
      };
    }
    
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const response = await axios.post(
        url,
        new URLSearchParams({
          From: this.fromNumber,
          To: to,
          Body: message
        }),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      if (response.status === 201 && response.data.sid) {
        return {
          success: true,
          messageId: response.data.sid,
          provider: this.name
        };
      } else {
        throw new Error('Unexpected response from Twilio');
      }
    } catch (error: any) {
      logger.error('Twilio SMS sending failed', { 
        error: error.message,
        response: error.response?.data
      });
      
      return {
        success: false,
        provider: this.name,
        errorMessage: error.response?.data?.message || error.message
      };
    }
  }
  
  async checkStatus(messageId: string): Promise<SMSStatus> {
    if (!this.accountSid || !this.authToken) {
      return 'unknown';
    }
    
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages/${messageId}.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });
      
      if (response.data.status === 'delivered') {
        return 'delivered';
      } else if (response.data.status === 'failed') {
        return 'failed';
      } else {
        return 'pending';
      }
    } catch (error) {
      return 'unknown';
    }
  }
}

// Vonage (Nexmo) SMS Provider implementation
class VonageProvider implements SMSProvider {
  private apiKey: string;
  private apiSecret: string;
  private brandName: string;
  
  constructor() {
    this.apiKey = process.env.VONAGE_API_KEY || '';
    this.apiSecret = process.env.VONAGE_API_SECRET || '';
    this.brandName = process.env.VONAGE_BRAND_NAME || 'PetPro';
  }
  
  get name(): string {
    return 'vonage';
  }
  
  async send(to: string, message: string): Promise<SMSResult> {
    if (!this.apiKey || !this.apiSecret) {
      logger.error('Vonage credentials not configured');
      return {
        success: false,
        provider: this.name,
        errorMessage: 'Vonage not configured'
      };
    }
    
    try {
      const response = await axios.post(
        'https://rest.nexmo.com/sms/json',
        {
          from: this.brandName,
          to: to.replace(/[^0-9]/g, ''), // Remove non-numeric characters
          text: message,
          api_key: this.apiKey,
          api_secret: this.apiSecret
        }
      );
      
      const responseData = response.data;
      if (
        responseData.messages && 
        responseData.messages.length > 0 &&
        responseData.messages[0].status === '0'
      ) {
        return {
          success: true,
          messageId: responseData.messages[0].message_id,
          provider: this.name
        };
      } else {
        const errorMessage = responseData.messages?.[0]?.['error-text'] || 'SMS sending failed';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      logger.error('Vonage SMS sending failed', { 
        error: error.message,
        response: error.response?.data
      });
      
      return {
        success: false,
        provider: this.name,
        errorMessage: error.message
      };
    }
  }
  
  async checkStatus(messageId: string): Promise<SMSStatus> {
    if (!this.apiKey || !this.apiSecret) {
      return 'unknown';
    }
    
    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        id: messageId
      });
      
      const response = await axios.get(
        `https://rest.nexmo.com/search/message?${params.toString()}`
      );
      
      const status = response.data.status;
      if (status === 'delivered') {
        return 'delivered';
      } else if (status === 'failed' || status === 'rejected') {
        return 'failed';
      } else {
        return 'pending';
      }
    } catch (error) {
      return 'unknown';
    }
  }
}

// Mock SMS Provider for development and testing
class MockSMSProvider implements SMSProvider {
  private messageStore: Map<string, { to: string; message: string; status: SMSStatus }>;
  
  constructor() {
    this.messageStore = new Map();
    logger.info('Using MockSMSProvider for development');
  }
  
  get name(): string {
    return 'mock';
  }
  
  async send(to: string, message: string): Promise<SMSResult> {
    const messageId = uuidv4();
    
    // Store message
    this.messageStore.set(messageId, {
      to,
      message,
      status: 'delivered'
    });
    
    logger.info('Mock SMS sent', {
      to,
      message,
      messageId
    });
    
    return {
      success: true,
      messageId,
      provider: this.name
    };
  }
  
  async checkStatus(messageId: string): Promise<SMSStatus> {
    const message = this.messageStore.get(messageId);
    return message?.status || 'unknown';
  }
}

// Main SMS Service class
class SMSService {
  private providers: SMSProvider[];
  private primaryProvider: string;
  private enabled: boolean;
  
  constructor() {
    // Register metrics
    metricsService.registerCounter('sms_sent_total', 'Total SMS messages sent', ['provider', 'success']);
    metricsService.registerCounter('sms_failed_total', 'Total failed SMS messages', ['provider', 'reason']);
    
    // Initialize from environment
    this.enabled = process.env.SMS_ENABLED === 'true';
    this.primaryProvider = process.env.SMS_PRIMARY_PROVIDER || 'mock';
    
    // Set up providers
    this.providers = [
      new TwilioProvider(),
      new VonageProvider(),
      new MockSMSProvider()
    ];
    
    logger.info('SMS Service initialized', {
      enabled: this.enabled,
      primaryProvider: this.primaryProvider
    });
  }
  
  /**
   * Send an SMS message
   */
  async sendSMS(options: SMSOptions): Promise<SMSResult> {
    if (!this.enabled) {
      logger.warn('SMS service is disabled');
      return {
        success: false,
        errorMessage: 'SMS service is disabled'
      };
    }
    
    // Validate phone number
    if (!this.isValidPhoneNumber(options.to)) {
      logger.warn('Invalid phone number format', { number: options.to });
      return {
        success: false,
        errorMessage: 'Invalid phone number format'
      };
    }
    
    // Normalize message
    const normalizedMessage = this.normalizeMessage(options.message);
    if (!normalizedMessage) {
      return {
        success: false,
        errorMessage: 'Message is empty or invalid'
      };
    }
    
    // Get providers in priority order
    const orderedProviders = this.getOrderedProviders(options.priority);
    
    // Try providers in order
    for (const provider of orderedProviders) {
      try {
        const result = await provider.send(options.to, normalizedMessage);
        
        // Track metrics
        metricsService.incrementCounter('sms_sent_total', {
          provider: provider.name,
          success: result.success.toString()
        });
        
        if (result.success) {
          logger.info('SMS sent successfully', {
            provider: provider.name,
            messageId: result.messageId
          });
          return result;
        } else {
          metricsService.incrementCounter('sms_failed_total', {
            provider: provider.name,
            reason: 'provider_error'
          });
          
          logger.warn('SMS provider failed, trying next', {
            provider: provider.name,
            error: result.errorMessage
          });
        }
      } catch (error: any) {
        metricsService.incrementCounter('sms_failed_total', {
          provider: provider.name,
          reason: 'exception'
        });
        
        logger.error('Error sending SMS with provider', {
          provider: provider.name,
          error: error.message
        });
      }
    }
    
    // All providers failed
    logger.error('All SMS providers failed', { to: options.to });
    return {
      success: false,
      errorMessage: 'All SMS providers failed'
    };
  }
  
  /**
   * Check the delivery status of an SMS message
   */
  async checkDeliveryStatus(messageId: string, provider: string): Promise<SMSStatus> {
    const smsProvider = this.providers.find(p => p.name === provider);
    
    if (!smsProvider) {
      logger.warn('Unknown SMS provider for status check', { provider });
      return 'unknown';
    }
    
    return await smsProvider.checkStatus(messageId);
  }
  
  /**
   * Validate a phone number format
   * Performs basic validation - for production, consider using a phone number library
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic validation - should be replaced with proper phone number library
    return /^\+?[1-9]\d{7,14}$/.test(phoneNumber.replace(/[\s()-]/g, ''));
  }
  
  /**
   * Normalize SMS message content
   */
  private normalizeMessage(message: string): string {
    if (!message || typeof message !== 'string') {
      return '';
    }
    
    // Trim and remove multiple spaces
    return message.trim().replace(/\s+/g, ' ');
  }
  
  /**
   * Get providers ordered by priority for failover
   */
  private getOrderedProviders(priority?: string): SMSProvider[] {
    // Start with primary provider
    const primaryProvider = this.providers.find(p => p.name === this.primaryProvider);
    let orderedProviders = [];
    
    if (primaryProvider) {
      orderedProviders.push(primaryProvider);
    }
    
    // Add remaining providers
    orderedProviders = [
      ...orderedProviders,
      ...this.providers.filter(p => p.name !== this.primaryProvider)
    ];
    
    return orderedProviders;
  }
}

// Create singleton instance
const smsService = new SMSService();

/**
 * Public method to send SMS
 */
export const sendSMS = async (options: SMSOptions): Promise<SMSResult> => {
  return smsService.sendSMS(options);
};

/**
 * Public method to check SMS status
 */
export const checkSMSStatus = async (messageId: string, provider: string): Promise<SMSStatus> => {
  return smsService.checkDeliveryStatus(messageId, provider);
};

export default smsService;
