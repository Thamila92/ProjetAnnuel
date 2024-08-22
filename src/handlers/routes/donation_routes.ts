import express, { Request, Response } from "express";
import { DonationUsecase } from "../../domain/donation-usecase";
import { AppDataSource } from "../../database/database";
import { donationValidation } from "../validators/donation-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { PaymentUsecase } from "../../domain/payment-usecase";
import {PayPalLink} from"../../types/paypal";

export const initDonationRoutes = (app: express.Express) => {
    const paymentUsecase = new PaymentUsecase();
     const donationUsecase = new DonationUsecase(AppDataSource, paymentUsecase);  // Passer les deux arguments

    // CREATE un nouveau don
    app.post('/create-donation', async (req: Request, res: Response) => {
        const { email, nom, prenom, montant } = req.body;
    
        try {
            // Créer la commande PayPal
            const order = await paymentUsecase.createPayPalOrder(montant.toString());
    
            // Typage explicite des liens dans la réponse de PayPal
            const links: PayPalLink[] = order.links;
    
            // Trouver l'URL d'approbation dans la réponse de PayPal
            const approvalUrl = links.find((link: PayPalLink) => link.rel === 'approve')?.href;
    
            if (!approvalUrl) {
                return res.status(500).json({ error: "Approval URL not found" });
            }
    
            // Envoyer l'URL d'approbation au client
            res.status(200).json({ approvalUrl });
        } catch (error) {
            console.error('Error during PayPal order creation:', error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });
    
    
    
    
    app.post('/capture-donation', async (req: Request, res: Response) => {
        const { orderId } = req.body;
    
        try {
            // Capturer le paiement via l'API PayPal
            const captureResult = await paymentUsecase.capturePayPalOrder(orderId);
    
            if (captureResult.status === 'COMPLETED') {
                // Logique pour créer le don dans ta base de données
                res.status(201).json({ message: 'Payment captured successfully' });
            } else {
                res.status(400).json({ error: 'Payment not completed' });
            }
        } catch (error) {
            console.error('Error during payment capture:', error);
            res.status(500).json({ error: 'Failed to capture PayPal payment' });
        }
    });
    

    // LIST tous les dons
// LIST tous les dons
app.get('/donations', async (req: Request, res: Response) => {
    try {
        const result = await donationUsecase.listDonations();
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal error, please try again later" });
    }
});

// DELETE un don par ID (et rembourser via PayPal)
 // DELETE un don et rembourser via PayPal
app.delete('/donations/:id', async (req: Request, res: Response) => {
    try {
        await donationUsecase.deleteDonationAndRefund(Number(req.params.id));
        return res.status(200).json({ message: "Donation refunded and deleted successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal error, please try again later" });
    }
});


   
};
