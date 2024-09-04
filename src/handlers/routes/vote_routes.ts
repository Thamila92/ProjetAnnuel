import express, { Request, Response } from "express";
import { VoteUsecase } from "../../domain/vote-usecase";
import { AppDataSource } from "../../database/database";
import { pollVoteValidation, classicVoteValidation } from "../validators/voteValidator";
import { VoteSessionUsecase } from "../../domain/voteSession-usecase";

export const initVoteRoutes = (app: express.Express) => {
    const voteUsecase = new VoteUsecase(AppDataSource);
    const voteSessionUsecase = new VoteSessionUsecase(AppDataSource);


    // Créer un vote
    app.post('/votes', async (req: Request, res: Response) => {
        try {
            const { userId, sessionId, choixOuOption } = req.body;
    
            // Appel à la méthode createVote du usecase
            const result = await voteUsecase.createVote(userId, sessionId, choixOuOption);
    
            // Vérifie si le résultat est un message d'erreur ou un vote réussi
            if (typeof result === 'string') {
                return res.status(400).json({ error: result });
            }
    
            // Si le vote est créé avec succès, renvoie une réponse 201 avec les détails du vote
            return res.status(201).json(result);
        } catch (error) {
            console.error('Error creating vote', error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    });
    

    app.get('/votes/hasVoted', async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.query.userId as string);
            const sessionId = parseInt(req.query.sessionId as string);
            const hasVoted = await voteUsecase.hasUserVoted(userId, sessionId);
            res.json({ hasVoted });
        } catch (error) {
            console.error('Error checking vote status', error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    });

    app.get('/votes', async (req: Request, res: Response) => {
        try {
            const votes = await voteUsecase.getAllVotes();
            res.status(200).json(votes);
        } catch (error) {
            console.error("Error fetching votes:", error);
            res.status(500).json({ error: "Erreur interne" });
        }
    });
    
};
