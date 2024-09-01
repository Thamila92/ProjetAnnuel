import { DataSource } from "typeorm";
import { Donation } from "../database/entities/donation";
import { Paiement } from "../database/entities/paiement";
import { User } from "../database/entities/user";

interface CreateDonationParams {
  nom: string;
  prenom: string;
  email: string;
  amount: number;
  currency: string;
}

export class DonationUsecase {
  constructor(private readonly db: DataSource) {}

  // Créer une donation
  async createDonation(params: CreateDonationParams): Promise<Donation> {
    const donationRepo = this.db.getRepository(Donation);
    const paiementRepo = this.db.getRepository(Paiement);
    const userRepo = this.db.getRepository(User);

    // Rechercher un utilisateur avec l'email fourni
    const existingUser = await userRepo.findOne({ where: { email: params.email } });

    // Créer un paiement
    const paiement = paiementRepo.create({
      stripePaymentId: 'pending',
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
    });
    await paiementRepo.save(paiement);

    // Créer la donation
    const donation = donationRepo.create({
      nom: params.nom,
      prenom: params.prenom,
      email: params.email,
      paiement: paiement,
      user: existingUser ?? undefined  // Utiliser undefined si aucun utilisateur n'est trouvé
    });

    return await donationRepo.save(donation);
}


  // Récupérer toutes les donations
  async getDonations(): Promise<Donation[]> {
    const donationRepo = this.db.getRepository(Donation);
    return await donationRepo.find({ relations: ["paiement", "user"] });
  }

  // Récupérer une donation par ID
  async getDonationById(id: number): Promise<Donation | null> {
    const donationRepo = this.db.getRepository(Donation);
    return await donationRepo.findOne({ where: { id }, relations: ["paiement", "user"] });
  }

  async getDonationsByUserId(userId: number): Promise<Donation[]> {
    const donationRepo = this.db.getRepository(Donation);
    return await donationRepo.find({
      where: { user: { id: userId } },
      relations: ["paiement", "user"],
    });
  }
  async getTotalDonations(): Promise<number> {
    const donations = await this.db.getRepository(Donation).find({ relations: ["paiement"] });

    // Calculez le total sans filtrer par statut
    return donations.reduce((total, donation) => total + donation.paiement.amount, 0);
}

// Détails des donations
async getDonationDetails(): Promise<Donation[]> {
    return await this.db.getRepository(Donation).find({ relations: ["paiement"] });
}

}
