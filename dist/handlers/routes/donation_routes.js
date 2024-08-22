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
const payment_usecase_1 = require("../../domain/payment-usecase");
const initDonationRoutes = (app) => {
    const paymentUsecase = new payment_usecase_1.PaymentUsecase();
    const donationUsecase = new donation_usecase_1.DonationUsecase(database_1.AppDataSource, paymentUsecase); // Passer les deux arguments
    // CREATE un nouveau don
    app.post('/create-donation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { email, nom, prenom, montant } = req.body;
        try {
            // Créer la commande PayPal
            const order = yield paymentUsecase.createPayPalOrder(montant.toString());
            // Typage explicite des liens dans la réponse de PayPal
            const links = order.links;
            // Trouver l'URL d'approbation dans la réponse de PayPal
            const approvalUrl = (_a = links.find((link) => link.rel === 'approve')) === null || _a === void 0 ? void 0 : _a.href;
            if (!approvalUrl) {
                return res.status(500).json({ error: "Approval URL not found" });
            }
            // Envoyer l'URL d'approbation au client
            res.status(200).json({ approvalUrl });
        }
        catch (error) {
            console.error('Error during PayPal order creation:', error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    app.post('/capture-donation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { orderId } = req.body;
        try {
            // Capturer le paiement via l'API PayPal
            const captureResult = yield paymentUsecase.capturePayPalOrder(orderId);
            if (captureResult.status === 'COMPLETED') {
                // Logique pour créer le don dans ta base de données
                res.status(201).json({ message: 'Payment captured successfully' });
            }
            else {
                res.status(400).json({ error: 'Payment not completed' });
            }
        }
        catch (error) {
            console.error('Error during payment capture:', error);
            res.status(500).json({ error: 'Failed to capture PayPal payment' });
        }
    }));
    // LIST tous les dons
    // LIST tous les dons
    app.get('/donations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield donationUsecase.listDonations();
            return res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // DELETE un don par ID (et rembourser via PayPal)
    // DELETE un don et rembourser via PayPal
    app.delete('/donations/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield donationUsecase.deleteDonationAndRefund(Number(req.params.id));
            return res.status(200).json({ message: "Donation refunded and deleted successfully." });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
};
exports.initDonationRoutes = initDonationRoutes;
