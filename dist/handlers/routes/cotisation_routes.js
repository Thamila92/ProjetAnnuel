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
exports.initCotisationRoutes = void 0;
const database_1 = require("../../database/database");
const cotisation_usecase_1 = require("../../domain/cotisation-usecase");
const initCotisationRoutes = (app) => {
    const cotisationUsecase = new cotisation_usecase_1.CotisationUsecase(database_1.AppDataSource);
    app.post('/cotisations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { category, description, amount, currency, email, startDate } = req.body;
            // Calculer la date de début et d'expiration
            const start = startDate ? new Date(startDate) : new Date(); // Utiliser la date fournie ou la date actuelle
            const expirationDate = new Date(start);
            expirationDate.setMonth(start.getMonth() + 1); // Ajouter un mois à la date de début
            // Appel de la méthode createCotisation avec les dates calculées
            const cotisation = yield cotisationUsecase.createCotisation({
                category,
                description,
                amount,
                currency,
                email,
                startDate: start, // Passer la date de début calculée
                expirationDate // Passer la date d'expiration calculée
            });
            res.status(201).json(cotisation);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne, veuillez réessayer plus tard." });
        }
    }));
    app.get('/cotisations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield cotisationUsecase.getCotisations();
            return res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
};
exports.initCotisationRoutes = initCotisationRoutes;
