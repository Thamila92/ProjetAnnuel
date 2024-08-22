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
const initPaymentRoutes = (app) => {
    const paymentUsecase = new payment_usecase_1.PaymentUsecase();
    // Route pour créer un paiement PayPal
    app.post('/create-paypal-order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { amount } = req.body;
        try {
            const order = yield paymentUsecase.createPayPalOrder(amount);
            res.json(order);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Unknown error occurred' });
            }
        }
    }));
    // Route pour capturer un paiement PayPal
    app.post('/capture-paypal-order/:orderId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { orderId } = req.params;
        try {
            // Appeler la méthode pour capturer le paiement
            const result = yield paymentUsecase.capturePayPalOrder(orderId);
            res.json(result); // Retourner le résultat de la capture
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Unknown error occurred' });
            }
        }
    }));
};
exports.initPaymentRoutes = initPaymentRoutes;
