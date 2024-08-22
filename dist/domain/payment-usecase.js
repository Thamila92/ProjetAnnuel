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
exports.PaymentUsecase = void 0;
const paypalClient = require('../services/paypalClient');
const paypal = require('@paypal/checkout-server-sdk');
class PaymentUsecase {
    // Créer un paiement PayPal avec approbation automatique
    createPayPalOrder(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new paypal.orders.OrdersCreateRequest();
            request.prefer("return=representation");
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                        amount: {
                            currency_code: 'USD',
                            value: amount
                        },
                        payee: {
                            email_address: process.env.PAYPAL_INTERN_EMAIL
                        }
                    }]
            });
            try {
                const order = yield paypalClient.execute(request);
                console.log('PayPal Order Links:', order.result.links); // Ajouté pour le debug
                return order.result;
            }
            catch (error) {
                console.error('PayPal Order Creation Error:', error);
                throw new Error('Failed to create PayPal order');
            }
        });
    }
    // Capturer un paiement PayPal
    capturePayPalOrder(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = new paypal.orders.OrdersCaptureRequest(orderId);
                request.requestBody({}); // Body vide nécessaire pour la capture
                const capture = yield paypalClient.execute(request);
                return capture.result;
            }
            catch (error) {
                console.error('PayPal Capture Error:', error);
                throw new Error('Failed to capture PayPal payment');
            }
        });
    }
    refundPayPalPayment(captureId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = new paypal.payments.CapturesRefundRequest(captureId);
                request.requestBody({}); // Le corps peut être vide pour un remboursement complet
                const refund = yield paypalClient.execute(request);
                return refund.result;
            }
            catch (error) {
                console.error('PayPal Refund Error:', error);
                throw new Error('Failed to refund PayPal payment');
            }
        });
    }
}
exports.PaymentUsecase = PaymentUsecase;
