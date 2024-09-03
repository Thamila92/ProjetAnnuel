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
const voteValidator_1 = require("../validators/voteValidator");
const voteSession_usecase_1 = require("../../domain/voteSession-usecase");
const initVoteRoutes = (app) => {
    const voteUsecase = new vote_usecase_1.VoteUsecase(database_1.AppDataSource);
    const voteSessionUsecase = new voteSession_usecase_1.VoteSessionUsecase(database_1.AppDataSource);
    // Créer un vote
    app.post('/votes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let validationResult;
            const session = yield voteSessionUsecase.getVoteSession(req.body.sessionId);
            if (!session) {
                return res.status(400).json({ error: "Session non trouvée" });
            }
            if (session.type === 'sondage') {
                // Valider pour un sondage
                validationResult = voteValidator_1.pollVoteValidation.validate(req.body);
            }
            else {
                // Valider pour un vote classique
                validationResult = voteValidator_1.classicVoteValidation.validate(req.body);
            }
            if (validationResult.error) {
                return res.status(400).json(validationResult.error.details);
            }
            const result = yield voteUsecase.createVote(validationResult.value.userId, validationResult.value.sessionId, session.type === 'sondage' ? validationResult.value.optionId : validationResult.value.choix);
            res.status(201).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne" });
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
