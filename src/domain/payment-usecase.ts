const paypalClient = require('../services/paypalClient');
const paypal = require('@paypal/checkout-server-sdk');


interface PayPalLink {
    href: string;
    rel: string;
    method: string;
} 
export class PaymentUsecase {
    // Créer un paiement PayPal avec approbation automatique
    async createPayPalOrder(amount: string): Promise<any> {
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");

        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amount
                },
                payee: {
                    email_address: process.env.PAYPAL_INTERN_EMAIL
                }
            }]
        });

        try {
            const order = await paypalClient.execute(request);
            console.log('PayPal Order Links:', order.result.links);  // Ajouté pour le debug
            return order.result;
        } catch (error) {
            console.error('PayPal Order Creation Error:', error);
            throw new Error('Failed to create PayPal order');
        }
    }
    // Capturer un paiement PayPal
    async capturePayPalOrder(orderId: string): Promise<any> {
        try {
            const request = new paypal.orders.OrdersCaptureRequest(orderId);
            request.requestBody({}); // Body vide nécessaire pour la capture
    
            const capture = await paypalClient.execute(request);
            return capture.result;
        } catch (error) {
            console.error('PayPal Capture Error:', error);
            throw new Error('Failed to capture PayPal payment');
        }
    }
    async refundPayPalPayment(captureId: string): Promise<any> {
        try {
            const request = new paypal.payments.CapturesRefundRequest(captureId);
            request.requestBody({});  // Le corps peut être vide pour un remboursement complet

            const refund = await paypalClient.execute(request);
            return refund.result;
        } catch (error) {
            console.error('PayPal Refund Error:', error);
            throw new Error('Failed to refund PayPal payment');
        }
    }
    
}
