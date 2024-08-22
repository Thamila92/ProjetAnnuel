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
exports.DonationUsecase = void 0;
const donation_1 = require("../database/entities/donation");
const user_1 = require("../database/entities/user");
class DonationUsecase {
    constructor(db, paymentUsecase // Injecter le PaymentUsecase
    ) {
        this.db = db;
        this.paymentUsecase = paymentUsecase;
    }
    // Créer un don
    createDonation(params, captureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const donationRepo = this.db.getRepository(donation_1.Donation);
            // Vérifier si un utilisateur avec le même email existe déjà
            const existingUser = yield userRepo.findOne({ where: { email: params.email } });
            // Créer un nouveau don après la capture réussie
            const newDonation = donationRepo.create({
                email: params.email,
                nom: params.nom,
                prenom: params.prenom,
                montant: params.montant,
                date: new Date(),
                user: existingUser !== null && existingUser !== void 0 ? existingUser : undefined,
                captureId: captureId // Ajouter l'ID de capture pour les remboursements futurs
            });
            // Sauvegarder le nouveau don dans la base de données
            return yield donationRepo.save(newDonation);
        });
    }
    // Créer et capturer un don via PayPal
    createAndCaptureDonation(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const donationRepo = this.db.getRepository(donation_1.Donation);
            // Créer une commande PayPal pour ce don
            const order = yield this.paymentUsecase.createPayPalOrder(params.montant.toString());
            // Rediriger l'utilisateur vers l'URL d'approbation PayPal (dans un vrai scénario)
            // Ici, on suppose que l'approbation automatique a lieu (pour les tests)
            // Capture du paiement après approbation
            const captureResult = yield this.paymentUsecase.capturePayPalOrder(order.id);
            if (captureResult.status === 'COMPLETED') {
                // Vérifier si un utilisateur avec le même email existe déjà
                const existingUser = yield userRepo.findOne({ where: { email: params.email } });
                // Créer un nouveau don après la capture réussie
                const newDonation = donationRepo.create({
                    email: params.email,
                    nom: params.nom,
                    prenom: params.prenom,
                    montant: params.montant,
                    date: new Date(),
                    user: existingUser !== null && existingUser !== void 0 ? existingUser : undefined,
                });
                // Sauvegarder le nouveau don dans la base de données
                return yield donationRepo.save(newDonation);
            }
            else {
                throw new Error('Payment capture failed');
            }
        });
    }
    // Liste tous les dons
    listDonations() {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(donation_1.Donation);
            return yield repo.find({ relations: ["user"] });
        });
    }
    // Obtenir un don par ID
    getDonation(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(donation_1.Donation);
            return yield repo.findOne({ where: { id }, relations: ["user"] });
        });
    }
    // Supprimer un don et rembourser via PayPal
    deleteDonationAndRefund(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(donation_1.Donation);
            // Trouver le don correspondant
            const donation = yield repo.findOne({ where: { id } });
            if (!donation) {
                throw new Error('Donation not found');
            }
            // Récupérer l'ID de capture de la transaction PayPal
            const captureId = donation.captureId; // Assurez-vous d'avoir cet ID stocké quelque part
            // Effectuer le remboursement via PayPal
            const refundResult = yield this.paymentUsecase.refundPayPalPayment(captureId);
            if (refundResult.status !== 'COMPLETED') {
                throw new Error('Refund failed');
            }
            // Supprimer le don après remboursement réussi
            yield repo.remove(donation);
        });
    }
}
exports.DonationUsecase = DonationUsecase;
