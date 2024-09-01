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
exports.initDonationRoutes = void 0;
const donation_usecase_1 = require("../../domain/donation-usecase");
const database_1 = require("../../database/database");
const initDonationRoutes = (app) => {
    const donationUsecase = new donation_usecase_1.DonationUsecase(database_1.AppDataSource); // Passer les deux arguments
    app.post('/donations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { nom, prenom, email, amount, currency } = req.body;
            const donation = yield donationUsecase.createDonation({ nom, prenom, email, amount, currency });
            res.status(201).json(donation);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne, veuillez réessayer plus tard." });
        }
    }));
    app.get('/users/:userId/donations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const donations = yield donationUsecase.getDonationsByUserId(Number(userId));
            res.status(200).json(donations);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur interne, veuillez réessayer plus tard." });
        }
    }));
    // LIST tous les dons
    // LIST tous les dons
    app.get('/donations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield donationUsecase.getDonations();
            return res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
};
exports.initDonationRoutes = initDonationRoutes;
