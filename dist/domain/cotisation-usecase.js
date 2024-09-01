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
exports.CotisationUsecase = void 0;
const cotisation_1 = require("../database/entities/cotisation");
const paiement_1 = require("../database/entities/paiement");
const user_1 = require("../database/entities/user");
class CotisationUsecase {
    constructor(db) {
        this.db = db;
    }
    // Créer une cotisation
    createCotisation(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cotisationRepo = this.db.getRepository(cotisation_1.Cotisation);
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
            // Calculer la date de début (aujourd'hui par défaut)
            const startDate = (_a = params.startDate) !== null && _a !== void 0 ? _a : new Date();
            console.log('Start Date:', startDate); // Trace la date de début
            // Calculer la date d'expiration (un mois après la date de début)
            const expirationDate = new Date(startDate);
            expirationDate.setMonth(expirationDate.getMonth() + 1);
            console.log('Expiration Date:', expirationDate); // Trace la date d'expiration
            // Créer la cotisation avec la date d'expiration calculée
            const cotisation = cotisationRepo.create({
                category: params.category,
                description: params.description,
                email: params.email,
                date: startDate,
                expirationDate: expirationDate, // Assurez-vous que cette valeur est définie
                paiement: paiement,
                user: existingUser !== null && existingUser !== void 0 ? existingUser : null,
            });
            console.log('Cotisation to be saved:', cotisation); // Trace les données de la cotisation
            return yield cotisationRepo.save(cotisation);
        });
    }
    // Récupérer le total des cotisations
    getTotalCotisations() {
        return __awaiter(this, void 0, void 0, function* () {
            const cotisations = yield this.db.getRepository(cotisation_1.Cotisation).find({ relations: ["paiement"] });
            // Calculez le total sans filtrer par statut
            return cotisations.reduce((total, cotisation) => total + cotisation.paiement.amount, 0);
        });
    }
    // Détails des cotisations
    getCotisationDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.getRepository(cotisation_1.Cotisation).find({ relations: ["paiement"] });
        });
    }
    // Récupérer toutes les cotisations
    getCotisations() {
        return __awaiter(this, void 0, void 0, function* () {
            const cotisationRepo = this.db.getRepository(cotisation_1.Cotisation);
            return yield cotisationRepo.find({ relations: ["paiement", "user"] });
        });
    }
    // Récupérer une cotisation par ID
    getCotisationById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const cotisationRepo = this.db.getRepository(cotisation_1.Cotisation);
            return yield cotisationRepo.findOne({ where: { id }, relations: ["paiement", "user"] });
        });
    }
    getCotisationsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cotisationRepo = this.db.getRepository(cotisation_1.Cotisation);
            return yield cotisationRepo.find({
                where: { user: { id: userId } },
                relations: ["paiement", "user"],
            });
        });
    }
}
exports.CotisationUsecase = CotisationUsecase;
