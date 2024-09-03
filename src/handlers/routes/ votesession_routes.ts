import express, { Request, Response } from "express";
import { VoteSessionUsecase } from "../../domain/voteSession-usecase";
import { AppDataSource } from "../../database/database";
import { createVoteSessionValidation, updateVoteSessionValidation } from "../validators/votesession-validator";
 
export const initVoteSessionRoutes = (app: express.Express) => {
    const voteSessionUsecase = new VoteSessionUsecase(AppDataSource);

    // Créer une nouvelle session de vote
    app.post('/vote-sessions', async (req: Request, res: Response) => {
        try {
            const validationResult = createVoteSessionValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json(validationResult.error.details);
                return;
            }

            const result = await voteSessionUsecase.createVoteSession(validationResult.value);
            res.status(201).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne" });
        }
    });

 
    
    app.get('/vote-sessions/:id', async (req: Request, res: Response) => {
        try {
            const sessionId = Number(req.params.id);
            const result = await voteSessionUsecase.getVoteSession(sessionId);
            
            if (!result) {
                res.status(404).json({ error: "Session de vote non trouvée" });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne" });
        }
    });
    app.get('/vote-results/:sessionId', async (req, res) => {
        try {
            const sessionId = parseInt(req.params.sessionId);
            
            const result = await voteSessionUsecase.calculerResultats(sessionId);
    
            res.status(200).json(result);
        } catch (error) {
            console.error("Erreur lors du calcul des résultats :", error);
            res.status(500).json({ error: "Erreur lors du calcul des résultats" });
        }
    });
    
    app.get('/vote-sessions', async (req: Request, res: Response) => {
        try {
            const result = await voteSessionUsecase.getAllVoteSessions();
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne" });
        }
    });
    
    app.get('/session/:sessionId/votes', async (req, res) => {
        const sessionId = parseInt(req.params.sessionId);
        if (isNaN(sessionId)) {
            return res.status(400).json({ message: "Invalid session ID" });
        }
    
        try {
            const votes = await voteSessionUsecase.getVotesBySession(sessionId);
            res.json(votes);
        } catch (error) {
            res.status(500).json({ error: "Erreur interne" });
        }
    });
 
    app.patch('/vote-sessions/:id', async (req: Request, res: Response) => {
        // Valider les données de la requête
        const { error } = updateVoteSessionValidation.validate(req.body);
        
        if (error) {
          return res.status(400).json({
            message: 'Validation error',
            details: error.details.map(detail => detail.message),
          });
        }
    
        try {
          // Convertir `id` en nombre
          const sessionId = parseInt(req.params.id, 10);
          if (isNaN(sessionId)) {
            return res.status(400).json({ message: "L'ID de la session doit être un nombre valide." });
          }
    
          // Appeler la méthode `updateVoteSession` avec les paramètres corrects
          const updatedSession = await voteSessionUsecase.updateVoteSession({
            id: sessionId,
            ...req.body,  // Transmettre les autres champs reçus dans la requête
          });
    
          // Si la mise à jour est réussie, renvoyer la session mise à jour avec un statut 200
          return res.status(200).json(updatedSession);
          
        } catch (err) {
          console.error('Error updating vote session:', err);
          res.status(500).json({ message: 'Erreur interne' });
        }
    });
    
    app.delete('/vote-sessions/:id', async (req: Request, res: Response) => {
        try {
            // Convertir `id` en nombre
            const sessionId = parseInt(req.params.id, 10);
            if (isNaN(sessionId)) {
                return res.status(400).json({ message: "L'ID de la session doit être un nombre valide." });
            }
    
            // Vérifier si la session existe
            const session = await voteSessionUsecase.getVoteSession(sessionId);
            if (!session) {
                return res.status(404).json({ message: "Session de vote non trouvée." });
            }
    
            // Supprimer la session
            await voteSessionUsecase.deleteVoteSession(sessionId);
    
            // Retourner une réponse avec un statut 204 (No Content)
            return res.status(204).send();
        } catch (err) {
            console.error('Error deleting vote session:', err);
            res.status(500).json({ message: 'Erreur interne' });
        }
    });
    
};
