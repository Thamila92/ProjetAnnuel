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
exports.PaiementUsecase = void 0;
require("dotenv/config");
const stripe_1 = __importDefault(require("stripe"));
const paiement_1 = require("../database/entities/paiement");
const donation_1 = require("../database/entities/donation");
const cotisation_1 = require("../database/entities/cotisation");
const user_1 = require("../database/entities/user");
class PaiementUsecase {
    constructor(db) {
        this.db = db;
        // Utilisez les clés de votre fichier .env
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
    }
    createPaiement(type, amount, currency, donationDetails, cotisationDetails // Ajoutez l'email ici
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            const paiementRepo = this.db.getRepository(paiement_1.Paiement);
            // Créer un PaymentIntent avec Stripe
            const paymentIntent = yield this.stripe.paymentIntents.create({
                amount, // Le montant en cents
                currency,
                metadata: { type }, // Inclure des métadonnées pour identifier le type de paiement
            });
            // Créer l'objet Paiement sans relation utilisateur directe
            const paiement = paiementRepo.create({
                stripePaymentId: paymentIntent.id,
                amount,
                currency,
                status: 'pending',
            });
            yield paiementRepo.save(paiement);
            // Gestion des types spécifiques de paiements
            if (type === 'donation' && donationDetails) {
                const donationRepo = this.db.getRepository(donation_1.Donation);
                const donation = donationRepo.create(Object.assign(Object.assign({}, donationDetails), { paiement, user: donationDetails.email
                        ? yield this.findOrCreateUser(donationDetails.email)
                        : undefined }));
                yield donationRepo.save(donation);
            }
            else if (type === 'cotisation' && cotisationDetails) {
                const cotisationRepo = this.db.getRepository(cotisation_1.Cotisation);
                const user = yield this.findOrCreateUser(cotisationDetails.email); // Rechercher ou créer un utilisateur avec cet email
                const cotisation = cotisationRepo.create({
                    category: cotisationDetails.category,
                    description: cotisationDetails.description || '',
                    email: cotisationDetails.email, // Assurez-vous d'inclure l'email ici
                    paiement,
                    user,
                });
                yield cotisationRepo.save(cotisation);
            }
            return { clientSecret: paymentIntent.client_secret };
        });
    }
    // Gérer le succès des paiements après retour de Stripe
    handlePaiementSucceeded(paymentIntentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const paiementRepo = this.db.getRepository(paiement_1.Paiement);
            const paiement = yield paiementRepo.findOne({ where: { stripePaymentId: paymentIntentId } });
            if (paiement) {
                paiement.status = 'succeeded';
                yield paiementRepo.save(paiement);
            }
        });
    }
    // Rechercher ou créer un utilisateur en fonction de son email
    findOrCreateUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = this.db.getRepository(user_1.User);
            const user = yield userRepository.findOne({ where: { email } });
            // Si user est null, on retourne undefined pour correspondre au type attendu
            return user || undefined;
        });
    }
}
exports.PaiementUsecase = PaiementUsecase;
