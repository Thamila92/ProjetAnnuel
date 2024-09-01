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
const paiement_1 = require("../database/entities/paiement");
const user_1 = require("../database/entities/user");
class DonationUsecase {
    constructor(db) {
        this.db = db;
    }
    // Créer une donation
    createDonation(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const donationRepo = this.db.getRepository(donation_1.Donation);
            const paiementRepo = this.db.getRepository(paiement_1.Paiement);
            const userRepo = this.db.getRepository(user_1.User);
            // Rechercher un utilisateur avec l'email fourni
            const existingUser = yield userRepo.findOne({ where: { email: params.email } });
            // Créer un paiement
            const paiement = paiementRepo.create({
                stripePaymentId: 'pending',
                amount: params.amount,
                currency: params.currency,
                status: 'pending',
            });
            yield paiementRepo.save(paiement);
            // Créer la donation
            const donation = donationRepo.create({
                nom: params.nom,
                prenom: params.prenom,
                email: params.email,
                paiement: paiement,
                user: existingUser !== null && existingUser !== void 0 ? existingUser : undefined // Utiliser undefined si aucun utilisateur n'est trouvé
            });
            return yield donationRepo.save(donation);
        });
    }
    // Récupérer toutes les donations
    getDonations() {
        return __awaiter(this, void 0, void 0, function* () {
            const donationRepo = this.db.getRepository(donation_1.Donation);
            return yield donationRepo.find({ relations: ["paiement", "user"] });
        });
    }
    // Récupérer une donation par ID
    getDonationById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const donationRepo = this.db.getRepository(donation_1.Donation);
            return yield donationRepo.findOne({ where: { id }, relations: ["paiement", "user"] });
        });
    }
    getDonationsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const donationRepo = this.db.getRepository(donation_1.Donation);
            return yield donationRepo.find({
                where: { user: { id: userId } },
                relations: ["paiement", "user"],
            });
        });
    }
    getTotalDonations() {
        return __awaiter(this, void 0, void 0, function* () {
            const donations = yield this.db.getRepository(donation_1.Donation).find({ relations: ["paiement"] });
            // Calculez le total sans filtrer par statut
            return donations.reduce((total, donation) => total + donation.paiement.amount, 0);
        });
    }
    // Détails des donations
    getDonationDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.getRepository(donation_1.Donation).find({ relations: ["paiement"] });
        });
    }
}
exports.DonationUsecase = DonationUsecase;
