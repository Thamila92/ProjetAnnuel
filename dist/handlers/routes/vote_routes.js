"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initVoteRoutes = void 0;
const vote_usecase_1 = require("../../domain/vote-usecase");
const database_1 = require("../../database/database");
const voteSession_usecase_1 = require("../../domain/voteSession-usecase");
const initVoteRoutes = (app) => {
    const voteUsecase = new vote_usecase_1.VoteUsecase(database_1.AppDataSource);
    const voteSessionUsecase = new voteSession_usecase_1.VoteSessionUsecase(database_1.AppDataSource);
    // Créer un vote
    app.post('/votes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId, sessionId, choixOuOption } = req.body;
            // Appel à la méthode createVote du usecase
            const result = yield voteUsecase.createVote(userId, sessionId, choixOuOption);
            // Vérifie si le résultat est un message d'erreur ou un vote réussi
            if (typeof result === 'string') {
                return res.status(400).json({ error: result });
            }
            // Si le vote est créé avec succès, renvoie une réponse 201 avec les détails du vote
            return res.status(201).json(result);
        }
        catch (error) {
            console.error('Error creating vote', error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }));
    app.get('/votes/hasVoted', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = parseInt(req.query.userId);
            const sessionId = parseInt(req.query.sessionId);
            const hasVoted = yield voteUsecase.hasUserVoted(userId, sessionId);
            res.json({ hasVoted });
        }
        catch (error) {
            console.error('Error checking vote status', error);
            res.status(500).json({ error: "Erreur interne du serveur" });
        }
    }));
    app.get('/votes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const votes = yield voteUsecase.getAllVotes();
            res.status(200).json(votes);
        }
        catch (error) {
            console.error("Error fetching votes:", error);
            res.status(500).json({ error: "Erreur interne" });
        }
    }));
};
exports.initVoteRoutes = initVoteRoutes;
