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
            let validationResult;
            const session = await voteSessionUsecase.getVoteSession(req.body.sessionId);

            if (!session) {
                return res.status(400).json({ error: "Session non trouvée" });
            }

            if (session.type === 'sondage') {
                // Valider pour un sondage
                validationResult = pollVoteValidation.validate(req.body);
            } else {
                // Valider pour un vote classique
                validationResult = classicVoteValidation.validate(req.body);
            }

            if (validationResult.error) {
                return res.status(400).json(validationResult.error.details);
            }

            const result = await voteUsecase.createVote(
                validationResult.value.userId,
                validationResult.value.sessionId,
                session.type === 'sondage' ? validationResult.value.optionId : validationResult.value.choix
            );

            res.status(201).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne" });
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
