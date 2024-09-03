
import express, { Request, Response } from "express";
 
import { AppDataSource } from "../../database/database";
 import { CotisationUsecase } from "../../domain/cotisation-usecase";

export const initCotisationRoutes = (app: express.Express) => {
    const cotisationUsecase = new CotisationUsecase(AppDataSource);
    app.post('/cotisations', async (req: Request, res: Response) => {
        try {
            const { category, description, amount, currency, email, startDate } = req.body;
    
            // Calculer la date de début et d'expiration
            const start = startDate ? new Date(startDate) : new Date();  // Utiliser la date fournie ou la date actuelle
            const expirationDate = new Date(start);
            expirationDate.setMonth(start.getMonth() + 1);  // Ajouter un mois à la date de début
    
            // Appel de la méthode createCotisation avec les dates calculées
            const cotisation = await cotisationUsecase.createCotisation({ 
                category, 
                description, 
                amount, 
                currency, 
                email, 
                startDate: start,  // Passer la date de début calculée
                expirationDate     // Passer la date d'expiration calculée
            });
    
            res.status(201).json(cotisation);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne, veuillez réessayer plus tard." });
        }
    });
    

  app.get('/cotisations', async (req: Request, res: Response) => {
    try {
        const result = await cotisationUsecase.getCotisations();
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal error, please try again later" });
    }
});


app.get('/cotisations/:userId', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId, 10);  // Convertir l'ID en nombre
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const result = await cotisationUsecase.getCotisationsByUserId(userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal error, please try again later" });
    }
});
  
}