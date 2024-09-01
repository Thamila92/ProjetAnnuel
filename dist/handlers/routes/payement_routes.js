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
exports.initPaymentRoutes = void 0;
const payment_usecase_1 = require("../../domain/payment-usecase");
const database_1 = require("../../database/database");
const initPaymentRoutes = (app) => {
    const paymentUsecase = new payment_usecase_1.PaiementUsecase(database_1.AppDataSource);
    // Route pour créer un paiement PayPal
    app.post('/paiements/donation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { amount, currency, nom, prenom, email } = req.body;
            const result = yield paymentUsecase.createPaiement('donation', amount, currency, { nom, prenom, email });
            res.status(201).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne, veuillez réessayer plus tard." });
        }
    }));
    app.post('/paiements/cotisation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { amount, currency, category, description, email } = req.body; // Ajoutez email ici
            const result = yield paymentUsecase.createPaiement('cotisation', amount, currency, undefined, { category, email, description });
            res.status(201).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne, veuillez réessayer plus tard." });
        }
    }));
};
exports.initPaymentRoutes = initPaymentRoutes;
