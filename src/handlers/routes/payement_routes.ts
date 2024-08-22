import express, { Request, Response } from 'express';
import { PaymentUsecase } from '../../domain/payment-usecase';

export const initPaymentRoutes = (app: express.Express) => {
    const paymentUsecase = new PaymentUsecase();

    // Route pour créer un paiement PayPal
    app.post('/create-paypal-order', async (req: Request, res: Response) => {
        const { amount } = req.body;

        try {
            const order = await paymentUsecase.createPayPalOrder(amount);
            res.json(order);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unknown error occurred' });
            }
        }
    });

    // Route pour capturer un paiement PayPal
    app.post('/capture-paypal-order/:orderId', async (req: Request, res: Response) => {
        const { orderId } = req.params;
    
        try {
            // Appeler la méthode pour capturer le paiement
            const result = await paymentUsecase.capturePayPalOrder(orderId);
            res.json(result);  // Retourner le résultat de la capture
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Unknown error occurred' });
            }
        }
    });
    
};
