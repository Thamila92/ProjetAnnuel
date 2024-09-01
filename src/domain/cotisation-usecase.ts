import { DataSource } from "typeorm";
import { Cotisation } from "../database/entities/cotisation";
import { Paiement } from "../database/entities/paiement";
import { User } from "../database/entities/user";

export interface CreateCotisationParams {
    category: string;
    description: string;
    amount: number;
    currency: string;
    email: string;
    startDate?: Date;
    expirationDate: Date;
}
  

export class CotisationUsecase {
  constructor(private readonly db: DataSource) {}

  // Créer une cotisation

  async createCotisation(params: CreateCotisationParams): Promise<Cotisation> {
    const cotisationRepo = this.db.getRepository(Cotisation);
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

    // Calculer la date de début (aujourd'hui par défaut)
    const startDate = params.startDate ?? new Date();
    console.log('Start Date:', startDate);  // Trace la date de début

    // Calculer la date d'expiration (un mois après la date de début)
    const expirationDate = new Date(startDate);
    expirationDate.setMonth(expirationDate.getMonth() + 1);
    console.log('Expiration Date:', expirationDate);  // Trace la date d'expiration

    // Créer la cotisation avec la date d'expiration calculée
    const cotisation = cotisationRepo.create({
      category: params.category,
      description: params.description,
      email: params.email,
      date: startDate,
      expirationDate: expirationDate, // Assurez-vous que cette valeur est définie
      paiement: paiement,
      user: existingUser ?? null,
    });

    console.log('Cotisation to be saved:', cotisation);  // Trace les données de la cotisation

    return await cotisationRepo.save(cotisation);
}

// Récupérer le total des cotisations
 

async getTotalCotisations(): Promise<number> {
  const cotisations = await this.db.getRepository(Cotisation).find({ relations: ["paiement"] });

  // Calculez le total sans filtrer par statut
  return cotisations.reduce((total, cotisation) => total + cotisation.paiement.amount, 0);
}

// Détails des cotisations
async getCotisationDetails(): Promise<Cotisation[]> {
  return await this.db.getRepository(Cotisation).find({ relations: ["paiement"] });
}


  // Récupérer toutes les cotisations
  async getCotisations(): Promise<Cotisation[]> {
    const cotisationRepo = this.db.getRepository(Cotisation);
    return await cotisationRepo.find({ relations: ["paiement", "user"] });
  }

  // Récupérer une cotisation par ID
  async getCotisationById(id: number): Promise<Cotisation | null> {
    const cotisationRepo = this.db.getRepository(Cotisation);
    return await cotisationRepo.findOne({ where: { id }, relations: ["paiement", "user"] });
  }



  async getCotisationsByUserId(userId: number): Promise<Cotisation[]> {
    const cotisationRepo = this.db.getRepository(Cotisation);
    return await cotisationRepo.find({
      where: { user: { id: userId } },
      relations: ["paiement", "user"],
    });
  }
}
