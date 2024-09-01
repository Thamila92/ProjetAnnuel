import 'dotenv/config';
import Stripe from 'stripe';
import { DataSource } from 'typeorm';
import { Paiement } from '../database/entities/paiement';
import { Donation } from '../database/entities/donation';
import { Cotisation } from '../database/entities/cotisation';
import { User } from '../database/entities/user'; 

export class PaiementUsecase {
  private stripe: Stripe;

  constructor(private readonly db: DataSource) {
    // Utilisez les clés de votre fichier .env
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });
  }

  async createPaiement(
    type: 'donation' | 'cotisation',
    amount: number,
    currency: string,
    donationDetails?: Partial<Donation>,
    cotisationDetails?: { category: string; email: string; description?: string } // Ajoutez l'email ici
): Promise<{ clientSecret: string }> {
    const paiementRepo = this.db.getRepository(Paiement);

    // Créer un PaymentIntent avec Stripe
    const paymentIntent = await this.stripe.paymentIntents.create({
        amount, // Le montant en cents
        currency,
        metadata: { type }, // Inclure des métadonnées pour identifier le type de paiement
    });

    // Créer l'objet Paiement sans relation utilisateur directe
    const paiement = paiementRepo.create({
        stripePaymentId: paymentIntent.id,
        amount,
        currency,
        status: 'pending',
    });
    await paiementRepo.save(paiement);

    // Gestion des types spécifiques de paiements
    if (type === 'donation' && donationDetails) {
        const donationRepo = this.db.getRepository(Donation);
        const donation = donationRepo.create({
            ...donationDetails,
            paiement,
            user: donationDetails.email
                ? await this.findOrCreateUser(donationDetails.email)
                : undefined,
        });
        await donationRepo.save(donation);

    } else if (type === 'cotisation' && cotisationDetails) {
        const cotisationRepo = this.db.getRepository(Cotisation);
    
        const user = await this.findOrCreateUser(cotisationDetails.email);  // Rechercher ou créer un utilisateur avec cet email
    
        const cotisation = cotisationRepo.create({
            category: cotisationDetails.category,
            description: cotisationDetails.description || '',
            email: cotisationDetails.email,  // Assurez-vous d'inclure l'email ici
            paiement,
            user,
        });
        await cotisationRepo.save(cotisation);
    }
    

    return { clientSecret: paymentIntent.client_secret! };
}


  // Gérer le succès des paiements après retour de Stripe
  async handlePaiementSucceeded(paymentIntentId: string): Promise<void> {
    const paiementRepo = this.db.getRepository(Paiement);

    const paiement = await paiementRepo.findOne({ where: { stripePaymentId: paymentIntentId } });
    if (paiement) {
      paiement.status = 'succeeded';
      await paiementRepo.save(paiement);
    }
  }

  // Rechercher ou créer un utilisateur en fonction de son email
  async findOrCreateUser(email: string): Promise<User | undefined> {
    const userRepository = this.db.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    // Si user est null, on retourne undefined pour correspondre au type attendu
    return user || undefined; 
}
}
