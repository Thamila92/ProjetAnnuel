import express, { Request, Response } from 'express';
import { PaiementUsecase } from '../../domain/payment-usecase';
import { AppDataSource } from '../../database/database';
 
export const initPaymentRoutes = (app: express.Express) => {
    const paymentUsecase = new PaiementUsecase(AppDataSource);

    // Route pour créer un paiement PayPal
    app.post('/paiements/donation', async (req: Request, res: Response) => {
        try {
          const { amount, currency, nom, prenom, email } = req.body;
          const result = await paymentUsecase.createPaiement('donation', amount, currency, { nom, prenom, email });
          res.status(201).json(result);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Erreur interne, veuillez réessayer plus tard." });
        }
      });
      
      app.post('/paiements/cotisation', async (req: Request, res: Response) => {
        try {
            const { amount, currency, category, description, email } = req.body; // Ajoutez email ici
            const result = await paymentUsecase.createPaiement('cotisation', amount, currency, undefined, { category, email, description });
            res.status(201).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne, veuillez réessayer plus tard." });
        }
    });
    
      
    
};
