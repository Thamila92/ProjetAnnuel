import { DataSource } from "typeorm";
import { Donation } from "../database/entities/donation";
import { User } from "../database/entities/user";
import { PaymentUsecase } from './payment-usecase';  // Réutilisation du PaymentUsecase
 

interface CreateDonationParams {
    email: string;
    nom: string;
    prenom: string;
    montant: number;
}

export class DonationUsecase {
    constructor(
        private readonly db: DataSource,
        private readonly paymentUsecase: PaymentUsecase  // Injecter le PaymentUsecase
    ) { }

    
// Créer un don
async createDonation(params: CreateDonationParams, captureId: string): Promise<Donation> {
    const userRepo = this.db.getRepository(User);
    const donationRepo = this.db.getRepository(Donation);

    // Vérifier si un utilisateur avec le même email existe déjà
    const existingUser = await userRepo.findOne({ where: { email: params.email } });

    // Créer un nouveau don après la capture réussie
    const newDonation = donationRepo.create({
        email: params.email,
        nom: params.nom,
        prenom: params.prenom,
        montant: params.montant,
        date: new Date(),
        user: existingUser ?? undefined,
        captureId: captureId  // Ajouter l'ID de capture pour les remboursements futurs
    });

    // Sauvegarder le nouveau don dans la base de données
    return await donationRepo.save(newDonation);
}

    // Créer et capturer un don via PayPal
    async createAndCaptureDonation(params: CreateDonationParams): Promise<Donation> {
        const userRepo = this.db.getRepository(User);
        const donationRepo = this.db.getRepository(Donation);

        // Créer une commande PayPal pour ce don
        const order = await this.paymentUsecase.createPayPalOrder(params.montant.toString());

        // Rediriger l'utilisateur vers l'URL d'approbation PayPal (dans un vrai scénario)
        // Ici, on suppose que l'approbation automatique a lieu (pour les tests)
        
        // Capture du paiement après approbation
        const captureResult = await this.paymentUsecase.capturePayPalOrder(order.id);

        if (captureResult.status === 'COMPLETED') {
            // Vérifier si un utilisateur avec le même email existe déjà
            const existingUser = await userRepo.findOne({ where: { email: params.email } });

            // Créer un nouveau don après la capture réussie
            const newDonation = donationRepo.create({
                email: params.email,
                nom: params.nom,
                prenom: params.prenom,
                montant: params.montant,
                date: new Date(),
                user: existingUser ?? undefined,
            });

            // Sauvegarder le nouveau don dans la base de données
            return await donationRepo.save(newDonation);
        } else {
            throw new Error('Payment capture failed');
        }
    }
    // Liste tous les dons
async listDonations(): Promise<Donation[]> {
    const repo = this.db.getRepository(Donation);
    return await repo.find({ relations: ["user"] });
}
// Obtenir un don par ID
async getDonation(id: number): Promise<Donation | null> {
    const repo = this.db.getRepository(Donation);
    return await repo.findOne({ where: { id }, relations: ["user"] });
}
// Supprimer un don et rembourser via PayPal
async deleteDonationAndRefund(id: number): Promise<void> {
    const repo = this.db.getRepository(Donation);
    
    // Trouver le don correspondant
    const donation = await repo.findOne({ where: { id } });
    if (!donation) {
        throw new Error('Donation not found');
    }

    // Récupérer l'ID de capture de la transaction PayPal
    const captureId = donation.captureId;  // Assurez-vous d'avoir cet ID stocké quelque part

    // Effectuer le remboursement via PayPal
    const refundResult = await this.paymentUsecase.refundPayPalPayment(captureId);
    if (refundResult.status !== 'COMPLETED') {
        throw new Error('Refund failed');
    }

    // Supprimer le don après remboursement réussi
    await repo.remove(donation);
}

    
}
