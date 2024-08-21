import express, { Request, Response } from "express";
import { DemandeUsecase } from "../../domain/demande-usecase";
import { AppDataSource } from "../../database/database";
import { demandeValidation } from "../validators/demande-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";

export const initDemandeRoutes = (app: express.Express) => {
    const demandeUsecase = new DemandeUsecase(AppDataSource);

    // CREATE une nouvelle demande
    app.post('/demandes', async (req: Request, res: Response) => {
        try {
            const validationResult = demandeValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const result = await demandeUsecase.createDemande(validationResult.value);
            res.status(201).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // LIST toutes les demandes
    app.get('/demandes', async (req: Request, res: Response) => {
        try {
            const result = await demandeUsecase.listDemandes();
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // READ une demande par ID
    app.get('/demandes/:id', async (req: Request, res: Response) => {
        try {
            const result = await demandeUsecase.getDemande(Number(req.params.id));
            if (!result) {
                res.status(404).json({ error: "Demande not found" });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // UPDATE une demande par ID
 // UPDATE une demande par ID
app.patch('/demandes/:id', async (req: Request, res: Response) => {
    try {
      // Valider les données d'entrée
      const validationResult = demandeValidation.validate(req.body);
      if (validationResult.error) {
        res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
        return;
      }
  
      // Appeler le cas d'utilisation pour mettre à jour la demande
      const result = await demandeUsecase.updateDemande(Number(req.params.id), validationResult.value);
  
      if (typeof result === 'string') {
        res.status(400).json({ error: result });
      } else if (!result) {
        res.status(404).json({ error: "Demande not found" });
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal error, please try again later" });
    }
  });
  
    
    
    // DELETE une demande par ID
    app.delete('/demandes/:id', async (req: Request, res: Response) => {
        try {
            const result = await demandeUsecase.deleteDemande(Number(req.params.id));
            if (typeof result === 'string') {
                res.status(404).json({ error: result });
            } else {
                res.status(200).json({ message: "Demande deleted successfully", demande: result });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });
};
