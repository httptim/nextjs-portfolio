// lib/services/paypal-service.ts
import { prisma } from '../prisma';

/**
 * Service for handling PayPal payment integration
 */
export class PayPalService {
  private static readonly BASE_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
  private static readonly CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  private static readonly SECRET = process.env.PAYPAL_SECRET;

  /**
   * Generates an access token for PayPal API
   */
  private static async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.CLIENT_ID}:${this.SECRET}`).toString('base64');
    
    const response = await fetch(`${this.BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get PayPal access token: ${errorData.error_description}`);
    }
    
    const data = await response.json();
    return data.access_token;
  }

  /**
   * Creates a PayPal order for an invoice
   * @param invoiceId The database ID of the invoice
   * @returns The PayPal order details including approval URL
   */
  static async createOrder(invoiceId: string): Promise<{ id: string; approvalUrl: string }> {
    try {
      // Get invoice details from database
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          project: true,
          client: true,
          items: true
        }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Get PayPal access token
      const accessToken = await this.getAccessToken();

      // Create PayPal order
      const response = await fetch(`${this.BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: invoice.id,
              description: `Payment for invoice #${invoice.number} - ${invoice.project.name}`,
              amount: {
                currency_code: 'USD',
                value: invoice.amount.toString()
              }
            }
          ],
          application_context: {
            brand_name: 'DevPortfolio',
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/customer/billing/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/customer/billing/cancel`
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create PayPal order: ${errorData.message}`);
      }

      const orderData = await response.json();
      
      // Extract approval URL from PayPal response
      const approvalUrl = orderData.links.find((link: any) => link.rel === 'approve').href;

      // Store the PayPal order ID in the database
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paypalOrderId: orderData.id
        }
      });

      return {
        id: orderData.id,
        approvalUrl
      };
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  /**
   * Captures a previously created PayPal order (completes the payment)
   * @param orderId The PayPal order ID
   */
  static async captureOrder(orderId: string): Promise<any> {
    try {
      // Get PayPal access token
      const accessToken = await this.getAccessToken();

      // Capture order
      const response = await fetch(`${this.BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to capture PayPal order: ${errorData.message}`);
      }

      const captureData = await response.json();

      // Find the invoice associated with this order
      const invoice = await prisma.invoice.findFirst({
        where: { paypalOrderId: orderId }
      });

      if (!invoice) {
        throw new Error('Invoice not found for this PayPal order');
      }

      // Update invoice status and create payment record
      await prisma.$transaction([
        // Update invoice status to PAID
        prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'PAID',
            paypalTransactionId: captureData.purchase_units[0].payments.captures[0].id
          }
        }),
        
        // Create payment record
        prisma.payment.create({
          data: {
            amount: parseFloat(captureData.purchase_units[0].payments.captures[0].amount.value),
            date: new Date(),
            method: 'PayPal',
            invoiceId: invoice.id,
            userId: invoice.clientId,
            transactionReference: captureData.purchase_units[0].payments.captures[0].id
          }
        })
      ]);

      return captureData;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      throw error;
    }
  }

  /**
   * Retrieves the details of a PayPal order
   * @param orderId The PayPal order ID
   */
  static async getOrderDetails(orderId: string): Promise<any> {
    try {
      // Get PayPal access token
      const accessToken = await this.getAccessToken();

      // Get order details
      const response = await fetch(`${this.BASE_URL}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get PayPal order details: ${errorData.message}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error getting PayPal order details:', error);
      throw error;
    }
  }
}