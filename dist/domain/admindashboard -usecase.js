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
exports.AdminDashboardUsecase = void 0;
const donation_usecase_1 = require("./donation-usecase");
const cotisation_usecase_1 = require("./cotisation-usecase");
class AdminDashboardUsecase {
    constructor(db) {
        this.db = db;
        this.donationUsecase = new donation_usecase_1.DonationUsecase(db);
        this.cotisationUsecase = new cotisation_usecase_1.CotisationUsecase(db);
    }
    // Récupérer le total des paiements (cotisations + donations)
    getTotalRevenue() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalDonations = yield this.donationUsecase.getTotalDonations();
            const totalCotisations = yield this.cotisationUsecase.getTotalCotisations();
            return totalDonations + totalCotisations;
        });
    }
    // Récupérer les détails des donations et cotisations
    getPaymentDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            const donationDetails = yield this.donationUsecase.getDonationDetails();
            const cotisationDetails = yield this.cotisationUsecase.getCotisationDetails();
            return {
                donations: donationDetails,
                cotisations: cotisationDetails,
            };
        });
    }
    // Récupérer le total des donations
    getTotalDonations() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.donationUsecase.getTotalDonations();
        });
    }
    // Récupérer le total des cotisations
    getTotalCotisations() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cotisationUsecase.getTotalCotisations();
        });
    }
}
exports.AdminDashboardUsecase = AdminDashboardUsecase;
