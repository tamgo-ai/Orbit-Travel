// This file simulates enterprise-grade integrations
import { EmailLog } from '../types';

export const MailgunService = {
  sendEmail: async (to: string, subject: string, templateData: any): Promise<{ id: string, status: 'sent' }> => {
    console.log(`[Mailgun] Dispatching to ${to} via API...`);
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id: `mg_${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent'
    };
  }
};

export const TwilioService = {
    sendSMS: async (to: string, body: string): Promise<{ id: string, status: 'sent' }> => {
        console.log(`[Twilio] Sending SMS to ${to}: "${body}"`);
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 600));
        return {
            id: `sm_${Math.random().toString(36).substr(2, 9)}`,
            status: 'sent'
        };
    }
}

export const StripeService = {
  createPaymentIntent: async (amount: number, currency: string = 'usd'): Promise<{ clientSecret: string, id: string }> => {
    console.log(`[Stripe] Creating PaymentIntent for $${amount}...`);
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      id: `pi_${Math.random().toString(36).substr(2, 14)}`,
      clientSecret: 'secret_mock_key'
    };
  },
  
  processCard: async (cardDetails: any): Promise<{ status: 'succeeded' | 'failed' }> => {
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { status: 'succeeded' };
  }
};