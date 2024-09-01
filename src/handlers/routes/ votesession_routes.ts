import express, { Request, Response } from "express";
import { VoteSessionUsecase } from "../../domain/voteSession-usecase";
import { AppDataSource } from "../../database/database";
import { createVoteSessionValidation } from "../validators/votesession-validator";
 
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

    // Lancer un nouveau tour
    app.patch('/vote-sessions/:id/nouveau-tour', async (req: Request, res: Response) => {
        try {
            const result = await voteSessionUsecase.lancerNouveauTour(Number(req.params.id));
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(200).json(result);
            }
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
    
    
};
