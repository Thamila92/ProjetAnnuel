import express, { Request, Response } from "express";
import { AppDataSource } from "../../database/database";
import { AdminDashboardUsecase } from "../../domain/admindashboard -usecase";
 
export const initAdminDashboardRoutes = (app: express.Express) => {
    const adminDashboardUsecase = new AdminDashboardUsecase(AppDataSource);

    app.get('/admin/dashboard', async (req: Request, res: Response) => {
        try {
            const totalRevenue = await adminDashboardUsecase.getTotalRevenue();
            const paymentDetails = await adminDashboardUsecase.getPaymentDetails();
            const totalDonations = await adminDashboardUsecase.getTotalDonations();
            const totalCotisations = await adminDashboardUsecase.getTotalCotisations();

            return res.status(200).json({
                totalRevenue,
                totalDonations,
                totalCotisations,
                ...paymentDetails,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erreur interne, veuillez réessayer plus tard." });
        }
    });
}
