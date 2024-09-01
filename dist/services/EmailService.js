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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        // Initialiser le transporteur avec Nodemailer et les paramètres SMTP
        this.transporter = nodemailer_1.default.createTransport({
            service: 'gmail', // Utilisation de Gmail pour l'envoi d'e-mails
            auth: {
                user: 'pacompanion8@gmail.com', // Remplace par ton adresse email Gmail
                pass: 'doxna1-zisriv-Mowjiw', // Remplace par ton mot de passe Gmail ou un mot de passe d'application
            },
        });
    }
    // Fonction d'envoi d'e-mail
    sendEmail(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { to, subject, text, html } = params;
            const mailOptions = {
                from: 'pacomapnion@gmail.com', // Adresse e-mail de l'expéditeur
                to,
                subject,
                text,
                html, // Optionnel : Pour un contenu HTML dans l'email
            };
            try {
                yield this.transporter.sendMail(mailOptions);
                console.log(`E-mail envoyé à ${to}`);
            }
            catch (error) {
                console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
                throw new Error('Erreur lors de l\'envoi de l\'e-mail');
            }
        });
    }
}
exports.EmailService = EmailService;
