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
exports.initVoteSessionRoutes = void 0;
const voteSession_usecase_1 = require("../../domain/voteSession-usecase");
const database_1 = require("../../database/database");
const votesession_validator_1 = require("../validators/votesession-validator");
const initVoteSessionRoutes = (app) => {
    const voteSessionUsecase = new voteSession_usecase_1.VoteSessionUsecase(database_1.AppDataSource);
    // Créer une nouvelle session de vote
    app.post('/vote-sessions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = votesession_validator_1.createVoteSessionValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json(validationResult.error.details);
                return;
            }
            const result = yield voteSessionUsecase.createVoteSession(validationResult.value);
            res.status(201).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne" });
        }
    }));
    // Lancer un nouveau tour
    app.patch('/vote-sessions/:id/nouveau-tour', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield voteSessionUsecase.lancerNouveauTour(Number(req.params.id));
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne" });
        }
    }));
    app.get('/vote-sessions/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sessionId = Number(req.params.id);
            const result = yield voteSessionUsecase.getVoteSession(sessionId);
            if (!result) {
                res.status(404).json({ error: "Session de vote non trouvée" });
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne" });
        }
    }));
    app.get('/vote-results/:sessionId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sessionId = parseInt(req.params.sessionId);
            const result = yield voteSessionUsecase.calculerResultats(sessionId);
            res.status(200).json(result);
        }
        catch (error) {
            console.error("Erreur lors du calcul des résultats :", error);
            res.status(500).json({ error: "Erreur lors du calcul des résultats" });
        }
    }));
    app.get('/vote-sessions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield voteSessionUsecase.getAllVoteSessions();
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne" });
        }
    }));
};
exports.initVoteSessionRoutes = initVoteSessionRoutes;
