import { DataSource } from "typeorm";
import { DonationUsecase } from "./donation-usecase";
import { CotisationUsecase } from "./cotisation-usecase";

export class AdminDashboardUsecase {
    private donationUsecase: DonationUsecase;
    private cotisationUsecase: CotisationUsecase;

    constructor(private readonly db: DataSource) {
        this.donationUsecase = new DonationUsecase(db);
        this.cotisationUsecase = new CotisationUsecase(db);
    }

    // Récupérer le total des paiements (cotisations + donations)
    async getTotalRevenue(): Promise<number> {
        const totalDonations = await this.donationUsecase.getTotalDonations();
        const totalCotisations = await this.cotisationUsecase.getTotalCotisations();
        return totalDonations + totalCotisations;
    }

    // Récupérer les détails des donations et cotisations
    async getPaymentDetails() {
        const donationDetails = await this.donationUsecase.getDonationDetails();
        const cotisationDetails = await this.cotisationUsecase.getCotisationDetails();
        return {
            donations: donationDetails,
            cotisations: cotisationDetails,
        };
    }

    // Récupérer le total des donations
    async getTotalDonations(): Promise<number> {
        return await this.donationUsecase.getTotalDonations();
    }

    // Récupérer le total des cotisations
    async getTotalCotisations(): Promise<number> {
        return await this.cotisationUsecase.getTotalCotisations();
    }
}
