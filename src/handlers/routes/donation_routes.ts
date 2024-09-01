import express, { Request, Response } from "express";
import { DonationUsecase } from "../../domain/donation-usecase";
import { AppDataSource } from "../../database/database";
import { donationValidation } from "../validators/donation-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
 import {PayPalLink} from"../../types/paypal";

export const initDonationRoutes = (app: express.Express) => {
      const donationUsecase = new DonationUsecase(AppDataSource);  // Passer les deux arguments

     app.post('/donations', async (req: Request, res: Response) => {
        try {
          const { nom, prenom, email, amount, currency } = req.body;
          const donation = await donationUsecase.createDonation({ nom, prenom, email, amount, currency });
          res.status(201).json(donation);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Erreur interne, veuillez réessayer plus tard." });
        }
      });
      
    
    
    
   app.get('/users/:userId/donations', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const donations = await donationUsecase.getDonationsByUserId(Number(userId));
      res.status(200).json(donations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur interne, veuillez réessayer plus tard." });
    }
  });
    

    // LIST tous les dons
// LIST tous les dons
app.get('/donations', async (req: Request, res: Response) => {
    try {
        const result = await donationUsecase.getDonations();
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal error, please try again later" });
    }
});

 

   
};
