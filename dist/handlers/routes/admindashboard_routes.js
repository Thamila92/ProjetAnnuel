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
exports.initAdminDashboardRoutes = void 0;
const database_1 = require("../../database/database");
const admindashboard__usecase_1 = require("../../domain/admindashboard -usecase");
const initAdminDashboardRoutes = (app) => {
    const adminDashboardUsecase = new admindashboard__usecase_1.AdminDashboardUsecase(database_1.AppDataSource);
    app.get('/admin/dashboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const totalRevenue = yield adminDashboardUsecase.getTotalRevenue();
            const paymentDetails = yield adminDashboardUsecase.getPaymentDetails();
            const totalDonations = yield adminDashboardUsecase.getTotalDonations();
            const totalCotisations = yield adminDashboardUsecase.getTotalCotisations();
            return res.status(200).json(Object.assign({ totalRevenue,
                totalDonations,
                totalCotisations }, paymentDetails));
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erreur interne, veuillez réessayer plus tard." });
        }
    }));
};
exports.initAdminDashboardRoutes = initAdminDashboardRoutes;
