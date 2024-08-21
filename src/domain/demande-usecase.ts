import { DataSource } from "typeorm";
import { Demande } from "../database/entities/demande";
import { User } from "../database/entities/user";

export interface UpdateDemandeParams {
    nom?: string;
    prenom?: string;
    email?: string;
    phone?: string;
    titre?: string;
    description?: string;
    budget?: number;
    deadline?: Date;
    statut?: string;
  }
  
export class DemandeUsecase {
    constructor(private readonly db: DataSource) { }

    // Créer une demande
    async createDemande(params: Partial<Demande>): Promise<Demande> {
        const userRepo = this.db.getRepository(User);
        const demandeRepo = this.db.getRepository(Demande);

        // Vérifier si un utilisateur avec le même email et nom existe déjà
        const existingUser = await userRepo.findOne({ where: { email: params.email } });

        // Créer une nouvelle demande
        const newDemande = demandeRepo.create({
            email: params.email!,
            nom: params.nom!,
            prenom: params.prenom!,
            age: params.age!,
            phone: params.phone!,
            profession: params.profession || '',
            titre: params.titre!,
            description: params.description!,
            budget: params.budget!,
            deadline: params.deadline!,
            statut: params.statut || 'en_attente',
            user: existingUser || undefined // Associer à l'utilisateur existant ou laisser vide
        });

        // Sauvegarder la nouvelle demande dans la base de données
        return await demandeRepo.save(newDemande);
    }

    // Liste des demandes
    async listDemandes(): Promise<Demande[]> {
        const repo = this.db.getRepository(Demande);
        return await repo.find();
    }

    // Obtenir une demande par ID
    async getDemande(id: number): Promise<Demande | null> {
        const repo = this.db.getRepository(Demande);
        return await repo.findOneBy({ id });
    }

    // Mettre à jour une demande
    async updateDemande(id: number, params: UpdateDemandeParams): Promise<Demande | null | string> {
        const repo = this.db.getRepository(Demande);
      
        // Trouver la demande existante
        let demandeFound = await repo.findOne({ where: { id } });
        if (!demandeFound) return null;
      
        // Valider et mettre à jour les champs
        if (params.nom) demandeFound.nom = params.nom;
        if (params.prenom) demandeFound.prenom = params.prenom;
        if (params.email) demandeFound.email = params.email;
        if (params.phone) demandeFound.phone = params.phone;
        if (params.titre) demandeFound.titre = params.titre;
        if (params.description) demandeFound.description = params.description;
        if (params.budget !== undefined) demandeFound.budget = params.budget;
        if (params.deadline) {
            demandeFound.deadline = params.deadline instanceof Date ? params.deadline.toISOString() : params.deadline;
        }
                if (params.statut) demandeFound.statut = params.statut;
      
         const updatedDemande = await repo.save(demandeFound);
        return updatedDemande;
      }
      
    

    // Supprimer une demande
    async deleteDemande(id: number): Promise<Demande | string> {
        const repo = this.db.getRepository(Demande);
        const demandeFound = await repo.findOneBy({ id });
        if (!demandeFound) return "Demande not found";

        await repo.remove(demandeFound);
        return demandeFound;
    }
}
