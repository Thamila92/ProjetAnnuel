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
exports.initEmailRoutes = void 0;
const EmailService_1 = require("../../services/EmailService");
const initEmailRoutes = (app) => {
    const emailService = new EmailService_1.EmailService();
    // Route pour envoyer un e-mail
    app.post('/send-email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { to, subject, text, html } = req.body;
        try {
            yield emailService.sendEmail({ to, subject, text, html });
            res.status(200).json({ message: 'E-mail envoyé avec succès.' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'e-mail.' });
        }
    }));
};
exports.initEmailRoutes = initEmailRoutes;
